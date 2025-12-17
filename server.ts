import { readFileSync, existsSync, watch } from 'fs'
import { join } from 'path'
import { parse as parseYaml } from 'yaml'

// YAML plugin for Bun bundler
const yamlPlugin: import('bun').BunPlugin = {
  name: 'yaml-loader',
  setup(build) {
    build.onLoad({ filter: /\.ya?ml$/ }, async (args) => {
      const text = readFileSync(args.path, 'utf8')
      const data = parseYaml(text)
      return {
        contents: `export default ${JSON.stringify(data)}`,
        loader: 'js',
      }
    })
  },
}

const PORT = parseInt(process.env.PORT || '5173')

// Build the app
async function buildApp() {
  const result = await Bun.build({
    entrypoints: ['./src/main.tsx'],
    outdir: './dist',
    minify: false,
    sourcemap: 'inline',
    target: 'browser',
    plugins: [yamlPlugin],
    define: {
      'import.meta.env.VITE_OPENAI_API_KEY': JSON.stringify(process.env.VITE_OPENAI_API_KEY || ''),
      'import.meta.env.VITE_ANTHROPIC_API_KEY': JSON.stringify(process.env.VITE_ANTHROPIC_API_KEY || ''),
      'import.meta.env.DEV': 'true',
      'import.meta.env.PROD': 'false',
    },
  })

  if (!result.success) {
    console.error('Build failed:', result.logs)
    return false
  }
  return true
}

// HTML template with live reload
function getHtml() {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>PaperLint</title>
  <link rel="stylesheet" href="/index.css" />
  <script>
    // Live reload
    const es = new EventSource('/events');
    es.onmessage = () => location.reload();
  </script>
</head>
<body>
  <div id="root"></div>
  <script type="module" src="/main.js"></script>
</body>
</html>`
}

// SSE clients for live reload
const clients: Set<ReadableStreamDefaultController> = new Set()

function notifyClients() {
  for (const client of clients) {
    try {
      client.enqueue('data: reload\n\n')
    } catch {
      clients.delete(client)
    }
  }
}

// Initial build
console.log('Building...')
await buildApp()

// Watch for changes
let rebuildTimeout: Timer | null = null
watch('./src', { recursive: true }, () => {
  if (rebuildTimeout) clearTimeout(rebuildTimeout)
  rebuildTimeout = setTimeout(async () => {
    console.log('Rebuilding...')
    if (await buildApp()) {
      notifyClients()
    }
  }, 100)
})

// Start server
const server = Bun.serve({
  port: PORT,
  hostname: '0.0.0.0',
  async fetch(req) {
    const url = new URL(req.url)
    const path = url.pathname

    // SSE endpoint for live reload
    if (path === '/events') {
      const stream = new ReadableStream({
        start(controller) {
          clients.add(controller)
        },
        cancel(controller) {
          clients.delete(controller)
        },
      })
      return new Response(stream, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
        },
      })
    }

    // Serve index.html for root
    if (path === '/' || path === '/index.html') {
      return new Response(getHtml(), {
        headers: { 'Content-Type': 'text/html' },
      })
    }

    // Serve CSS from src
    if (path === '/index.css') {
      const cssPath = join(import.meta.dir, 'dist', 'index.css')
      if (existsSync(cssPath)) {
        return new Response(Bun.file(cssPath), {
          headers: { 'Content-Type': 'text/css' },
        })
      }
      // Fallback to src
      const srcCss = join(import.meta.dir, 'src', 'index.css')
      if (existsSync(srcCss)) {
        return new Response(Bun.file(srcCss), {
          headers: { 'Content-Type': 'text/css' },
        })
      }
    }

    // Serve JS from dist
    if (path === '/main.js') {
      const jsPath = join(import.meta.dir, 'dist', 'main.js')
      if (existsSync(jsPath)) {
        return new Response(Bun.file(jsPath), {
          headers: { 'Content-Type': 'application/javascript' },
        })
      }
    }

    // Serve static files from dist
    const distPath = join(import.meta.dir, 'dist', path)
    if (existsSync(distPath)) {
      return new Response(Bun.file(distPath))
    }

    // Serve static files from public
    const publicPath = join(import.meta.dir, 'public', path)
    if (existsSync(publicPath)) {
      return new Response(Bun.file(publicPath))
    }

    return new Response('Not Found', { status: 404 })
  },
})

console.log(`
  🚀 Dev server running at:

  ➜  Local:   http://localhost:${PORT}/
  ➜  Network: http://0.0.0.0:${PORT}/
`)
