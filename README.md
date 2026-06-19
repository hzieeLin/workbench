# TaskFlow

A personal task orchestrator desktop application built with Electron + Vue 3 + Express.

## Features

- **Board View** - Kanban-style task management with drag-and-drop
- **Calendar View** - Schedule and visualize tasks by date
- **Statistics View** - Track productivity with charts and analytics
- **Focus Mode** - Stay concentrated on current tasks
- **Comments** - Add notes and comments to tasks

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Vue 3, TypeScript, Ant Design Vue, Chart.js |
| Backend | Express, TypeORM, SQLite (sql.js) |
| Desktop | Electron |
| Build | Vite, electron-builder |
| Test | Jest, Playwright |

## Getting Started

### Prerequisites

- Node.js >= 18
- npm >= 9

### Installation

```bash
npm install
```

### Development

```bash
# Start frontend + backend + electron concurrently
npm run electron:dev

# Or start individually
npm run dev          # Frontend only (Vite dev server)
npm run server:dev   # Backend only (Express + SQLite)
```

### Build

```bash
# Build for production
npm run electron:build

# Build outputs
# - Frontend: dist/
# - Backend: dist-server/
# - Electron: dist-electron/
# - Installer: release/
```

### Testing

```bash
npm run test            # Run all tests
npm run test:unit       # Unit tests
npm run test:component  # Component tests
npm run test:e2e        # End-to-end tests (Playwright)
```

## Project Structure

```
├── electron/           # Electron main process
├── server/             # Express backend API
│   └── routes/         # API routes (boards, cards, lists, todos, comments, focus)
├── src/
│   ├── components/     # Vue components
│   ├── composables/    # Vue composables
│   ├── database/       # Database entities and migrations
│   ├── router/         # Vue Router config
│   ├── services/       # Frontend services
│   ├── stores/         # Pinia stores
│   └── views/          # Page views (Board, Calendar, Statistics)
├── tests/              # Test files
├── docs/               # Documentation
└── scripts/            # Build/utility scripts
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Vite dev server |
| `npm run server:dev` | Start Express backend with hot-reload |
| `npm run dev:full` | Start frontend + backend concurrently |
| `npm run electron:dev` | Start full Electron dev environment |
| `npm run electron:build` | Build production Electron app |
| `npm run lint` | Run ESLint |
| `npm run format` | Format code with Prettier |

## License

MIT
