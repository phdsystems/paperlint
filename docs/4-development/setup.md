# Development Setup

## Prerequisites

- [Bun](https://bun.sh/) v1.0+ (runtime, package manager, test runner)
- Node.js 18+ (optional, for compatibility)
- Docker (optional, for containerized development)

## Quick Start

```bash
# Install dependencies
bun install

# Start development server
bun run dev

# Run tests
bun run test

# Type check
bun run typecheck

# Production build
bun run build
```

## Available Scripts

| Command | Description |
|---------|-------------|
| `bun run dev` | Start Vite dev server (hot reload) |
| `bun run build` | Production build to `dist/` |
| `bun run preview` | Preview production build locally |
| `bun run test` | Run tests with Bun test runner |
| `bun run test:watch` | Run tests in watch mode |
| `bun run typecheck` | TypeScript type checking |
| `bun run lint` | Run typecheck + tests |
| `bun run clean` | Remove `dist/` and Vite cache |

## Docker Development

### Option 1: Host Network Mode (Recommended)

Shares the host's network stack - no port mapping needed:

```bash
docker run -it --network host \
  -v $(pwd):/home/adentic/paperlint \
  -w /home/adentic/paperlint \
  your-image bash
```

Then inside container:
```bash
bun run dev
# Access at http://localhost:5173/
```

### Option 2: Port Mapping

Map container port to host:

```bash
docker run -it \
  -p 5173:5173 \
  -v $(pwd):/home/adentic/paperlint \
  -w /home/adentic/paperlint \
  your-image bash
```

Inside container, bind to all interfaces:
```bash
bun run dev -- --host 0.0.0.0
# Access at http://localhost:5173/
```

### Option 3: Existing Container (No Port Mapping)

If container was started without `-p`, access via container IP:

```bash
# Find container IP
docker inspect -f '{{range.NetworkSettings.Networks}}{{.IPAddress}}{{end}}' CONTAINER_ID

# Access directly (Linux only)
# http://172.17.0.2:5173/
```

To add port mapping to existing container:
```bash
# Commit container to image
docker commit CONTAINER_ID paperlint-dev

# Run new container with ports
docker run -it -p 5173:5173 \
  -v $(pwd):/home/adentic/paperlint \
  paperlint-dev bash
```

### Docker Compose

```yaml
version: '3.8'
services:
  dev:
    image: oven/bun:latest
    working_dir: /app
    volumes:
      - .:/app
    ports:
      - "5173:5173"
    command: bun run dev -- --host 0.0.0.0
    tty: true
```

```bash
docker-compose up
```

## Project Structure

```
paperlint/
├── src/
│   ├── components/      # React components
│   ├── config/          # Configuration (YAML + types)
│   ├── lib/             # Core logic (linters, calculators)
│   ├── __tests__/       # Bun tests
│   └── types.ts         # Shared TypeScript types
├── docs/                # Documentation
├── dist/                # Production build output
├── package.json         # Scripts and dependencies
├── vite.config.ts       # Vite configuration
├── tailwind.config.ts   # Tailwind CSS config
└── tsconfig.json        # TypeScript config
```

## Environment Variables

Create `.env` file for API keys:

```env
VITE_OPENAI_API_KEY=sk-...
VITE_ANTHROPIC_API_KEY=sk-ant-...
```

These enable AI-powered features:
- AI content detection
- Statistical methodology analysis

## Testing

Tests use Bun's built-in test runner:

```bash
# Run all tests
bun test

# Run specific test file
bun test src/__tests__/statistics-calculator.test.ts

# Watch mode
bun run test:watch

# With coverage (when configured)
bun test --coverage
```

## Building for Production

```bash
# Build
bun run build

# Output in dist/
ls -la dist/

# Preview locally
bun run preview
```

## Troubleshooting

### Port already in use
```bash
# Find process using port
lsof -i :5173
# Kill it
kill -9 PID
```

### Docker can't access localhost
- Use `--host 0.0.0.0` flag with dev server
- Ensure port mapping (`-p 5173:5173`) when starting container
- On Mac/Windows, use `host.docker.internal` instead of `localhost`

### Type errors after config changes
```bash
# Clear TypeScript cache
bun run clean
bun run typecheck
```
