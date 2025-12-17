import { readFileSync } from 'fs'
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

const isDev = process.argv.includes('--dev')
const isWatch = process.argv.includes('--watch')

async function build() {
  const result = await Bun.build({
    entrypoints: ['./src/main.tsx'],
    outdir: './dist',
    minify: !isDev,
    sourcemap: isDev ? 'inline' : 'none',
    target: 'browser',
    plugins: [yamlPlugin],
    define: {
      'import.meta.env.VITE_OPENAI_API_KEY': JSON.stringify(process.env.VITE_OPENAI_API_KEY || ''),
      'import.meta.env.VITE_ANTHROPIC_API_KEY': JSON.stringify(process.env.VITE_ANTHROPIC_API_KEY || ''),
      'import.meta.env.DEV': JSON.stringify(isDev),
      'import.meta.env.PROD': JSON.stringify(!isDev),
    },
  })

  if (!result.success) {
    console.error('Build failed:')
    for (const log of result.logs) {
      console.error(log)
    }
    process.exit(1)
  }

  console.log(`✓ Built ${result.outputs.length} files to dist/`)
}

build()
