# MySQL API Backend Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a Node/Express backend that persists TaskFlow board, list, and card data to MySQL through TypeORM, then switch the Vue stores to HTTP APIs.

**Architecture:** Create a same-repository `server/` TypeScript backend with Express routes under `/api`. Keep database access out of the browser; frontend Pinia stores call `src/services/api.ts`. Vite proxies `/api` to the backend during development.

**Tech Stack:** Vue 3, Pinia, Vite, Electron, Express, TypeORM, MySQL, Jest, TypeScript.

---

### Task 1: Backend Dependencies And Scripts

**Files:**
- Modify: `package.json`
- Modify: `package-lock.json`
- Create: `tsconfig.server.json`

- [ ] **Step 1: Add backend dependencies**

Run:

```bash
npm install express cors dotenv
npm install -D @types/express @types/cors ts-node nodemon supertest @types/supertest
```

Expected: `package.json` and `package-lock.json` include the new packages.

- [ ] **Step 2: Add backend scripts**

Update `package.json` scripts:

```json
{
  "server:dev": "nodemon --watch server --watch src/database --ext ts --exec ts-node -P tsconfig.server.json server/index.ts",
  "server:build": "tsc -p tsconfig.server.json",
  "dev:full": "concurrently -k \"npm:server:dev\" \"npm:dev\"",
  "build:full": "npm run server:build && npm run build"
}
```

Keep existing scripts intact.

- [ ] **Step 3: Create server TypeScript config**

Create `tsconfig.server.json`:

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "outDir": "dist-server",
    "rootDir": ".",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true,
    "types": ["node", "jest"]
  },
  "include": ["server/**/*.ts", "src/database/**/*.ts"]
}
```

- [ ] **Step 4: Verify scripts parse**

Run:

```bash
npm run server:build
```

Expected before server files exist: fails because `server/index.ts` is missing or no inputs exist. This confirms the script is wired and Task 2 must add files.

### Task 2: Backend App Skeleton

**Files:**
- Create: `server/config.ts`
- Create: `server/data-source.ts`
- Create: `server/app.ts`
- Create: `server/index.ts`
- Create: `server/http.ts`
- Test: `tests/server/health.test.ts`

- [ ] **Step 1: Write health test**

Create `tests/server/health.test.ts`:

```ts
import request from 'supertest'
import { createApp } from '../../server/app'

describe('server health', () => {
  it('returns ok status', async () => {
    const app = createApp()

    const response = await request(app).get('/api/health')

    expect(response.status).toBe(200)
    expect(response.body).toEqual({ status: 'ok' })
  })
})
```

- [ ] **Step 2: Run health test red**

Run:

```bash
npx jest tests/server/health.test.ts --runInBand --no-cache
```

Expected: FAIL because `server/app` does not exist.

- [ ] **Step 3: Implement server config**

Create `server/config.ts`:

```ts
import dotenv from 'dotenv'

dotenv.config()

export const config = {
  apiPort: Number(process.env.API_PORT) || 3001,
  db: {
    host: process.env.DB_HOST ?? 'localhost',
    port: Number(process.env.DB_PORT) || 3306,
    username: process.env.DB_USERNAME ?? 'root',
    password: process.env.DB_PASSWORD ?? '',
    database: process.env.DB_DATABASE ?? 'task_orchestrator',
  },
}
```

- [ ] **Step 4: Implement Express app**

Create `server/app.ts`:

```ts
import express, { type ErrorRequestHandler } from 'express'
import cors from 'cors'

export function createApp() {
  const app = express()

  app.use(cors())
  app.use(express.json())

  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok' })
  })

  const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
    const message = err instanceof Error ? err.message : 'Internal server error'
    res.status(500).json({ error: message })
  }

  app.use(errorHandler)

  return app
}
```

- [ ] **Step 5: Implement data source wrapper**

Create `server/data-source.ts`:

```ts
import 'reflect-metadata'
import { DataSource } from 'typeorm'
import { Board } from '../src/database/entities/Board'
import { List } from '../src/database/entities/List'
import { Card } from '../src/database/entities/Card'
import { Label } from '../src/database/entities/Label'
import { CardLabel } from '../src/database/entities/CardLabel'
import { TimeBlock } from '../src/database/entities/TimeBlock'
import { CalendarEvent } from '../src/database/entities/CalendarEvent'
import { ActivityLog } from '../src/database/entities/ActivityLog'
import { InitialSchema1710000000000 } from '../src/database/migrations/InitialSchema'
import { config } from './config'

export function createDataSource() {
  return new DataSource({
    type: 'mysql',
    host: config.db.host,
    port: config.db.port,
    username: config.db.username,
    password: config.db.password,
    database: config.db.database,
    synchronize: false,
    logging: false,
    entities: [Board, List, Card, Label, CardLabel, TimeBlock, CalendarEvent, ActivityLog],
    migrations: [InitialSchema1710000000000],
  })
}
```

- [ ] **Step 6: Implement server entry**

Create `server/index.ts`:

```ts
import { createApp } from './app'
import { createDataSource } from './data-source'
import { config } from './config'

async function main() {
  const dataSource = createDataSource()
  await dataSource.initialize()
  await dataSource.runMigrations()

  const app = createApp(dataSource)
  app.listen(config.apiPort, () => {
    console.log(`API listening on http://localhost:${config.apiPort}`)
  })
}

main().catch((error) => {
  console.error('Failed to start API server:', error)
  process.exit(1)
})
```

Update `server/app.ts` signature to accept an optional data source:

```ts
import type { DataSource } from 'typeorm'

export function createApp(dataSource?: DataSource) {
  const app = express()
  app.locals.dataSource = dataSource
  // rest unchanged
}
```

- [ ] **Step 7: Run health test green**

Run:

```bash
npx jest tests/server/health.test.ts --runInBand --no-cache
```

Expected: PASS.

### Task 3: Board/List/Card API Routes

**Files:**
- Create: `server/routes/boards.ts`
- Create: `server/routes/lists.ts`
- Create: `server/routes/cards.ts`
- Modify: `server/app.ts`
- Test: `tests/server/task-workflow.test.ts`

- [ ] **Step 1: Write API workflow test with mocked repositories**

Create `tests/server/task-workflow.test.ts` with lightweight fake repositories:

```ts
import request from 'supertest'
import { createApp } from '../../server/app'
import { Board } from '../../src/database/entities/Board'
import { List } from '../../src/database/entities/List'
import { Card } from '../../src/database/entities/Card'

function createRepo<T extends { id: number }>() {
  let nextId = 1
  const rows: T[] = []
  return {
    rows,
    find: jest.fn(async (options?: any) => {
      let result = [...rows]
      const where = options?.where
      if (where) {
        result = result.filter((row: any) => {
          return Object.entries(where).every(([key, value]) => row[key] === value)
        })
      }
      return result
    }),
    create: jest.fn((data: Partial<T>) => data as T),
    save: jest.fn(async (entity: T) => {
      const saved = { ...entity, id: entity.id ?? nextId++ } as T
      rows.push(saved)
      return saved
    }),
    update: jest.fn(async (id: number, data: Partial<T>) => {
      const index = rows.findIndex((row) => row.id === id)
      if (index !== -1) rows[index] = { ...rows[index], ...data }
    }),
    delete: jest.fn(async (id: number) => {
      const index = rows.findIndex((row) => row.id === id)
      if (index !== -1) rows.splice(index, 1)
    }),
  }
}

describe('task workflow API', () => {
  it('creates a board, list, and card', async () => {
    const boardRepo = createRepo<any>()
    const listRepo = createRepo<any>()
    const cardRepo = createRepo<any>()
    const dataSource = {
      getRepository(entity: unknown) {
        if (entity === Board) return boardRepo
        if (entity === List) return listRepo
        if (entity === Card) return cardRepo
        throw new Error('Unexpected repository')
      },
    } as any
    const app = createApp(dataSource)

    const board = await request(app).post('/api/boards').send({ name: '产品计划' }).expect(201)
    const list = await request(app)
      .post(`/api/boards/${board.body.id}/lists`)
      .send({ name: '待办' })
      .expect(201)
    const card = await request(app)
      .post(`/api/lists/${list.body.id}/cards`)
      .send({ title: '第一条任务' })
      .expect(201)

    expect(card.body).toMatchObject({
      list_id: list.body.id,
      title: '第一条任务',
      priority: 'medium',
      position: 1,
    })
  })
})
```

- [ ] **Step 2: Run API workflow red**

Run:

```bash
npx jest tests/server/task-workflow.test.ts --runInBand --no-cache
```

Expected: FAIL with 404 for `/api/boards`.

- [ ] **Step 3: Implement board routes**

Create `server/routes/boards.ts`:

```ts
import { Router } from 'express'
import type { DataSource } from 'typeorm'
import { Board } from '../../src/database/entities/Board'

export function createBoardRouter(dataSource: DataSource) {
  const router = Router()
  const repo = dataSource.getRepository(Board)

  router.get('/', async (_req, res, next) => {
    try {
      res.json(await repo.find({ order: { created_at: 'DESC' } }))
    } catch (error) {
      next(error)
    }
  })

  router.post('/', async (req, res, next) => {
    try {
      const name = String(req.body.name ?? '').trim()
      if (!name) return res.status(400).json({ error: 'Board name is required' })
      const board = repo.create({ name, description: req.body.description })
      res.status(201).json(await repo.save(board))
    } catch (error) {
      next(error)
    }
  })

  router.patch('/:id', async (req, res, next) => {
    try {
      await repo.update(Number(req.params.id), req.body)
      res.json({ ok: true })
    } catch (error) {
      next(error)
    }
  })

  router.delete('/:id', async (req, res, next) => {
    try {
      await repo.delete(Number(req.params.id))
      res.json({ ok: true })
    } catch (error) {
      next(error)
    }
  })

  return router
}
```

- [ ] **Step 4: Implement list routes**

Create `server/routes/lists.ts`:

```ts
import { Router } from 'express'
import type { DataSource } from 'typeorm'
import { List } from '../../src/database/entities/List'

export function createListRouter(dataSource: DataSource) {
  const router = Router()
  const repo = dataSource.getRepository(List)

  router.get('/boards/:boardId/lists', async (req, res, next) => {
    try {
      res.json(
        await repo.find({
          where: { board_id: Number(req.params.boardId) },
          order: { position: 'ASC' },
        })
      )
    } catch (error) {
      next(error)
    }
  })

  router.post('/boards/:boardId/lists', async (req, res, next) => {
    try {
      const name = String(req.body.name ?? '').trim()
      if (!name) return res.status(400).json({ error: 'List name is required' })
      const existing = await repo.find({ where: { board_id: Number(req.params.boardId) } })
      const maxPosition = existing.length ? Math.max(...existing.map((list) => list.position)) : 0
      const list = repo.create({
        board_id: Number(req.params.boardId),
        name,
        position: maxPosition + 1,
      })
      res.status(201).json(await repo.save(list))
    } catch (error) {
      next(error)
    }
  })

  router.patch('/lists/:id', async (req, res, next) => {
    try {
      await repo.update(Number(req.params.id), req.body)
      res.json({ ok: true })
    } catch (error) {
      next(error)
    }
  })

  router.delete('/lists/:id', async (req, res, next) => {
    try {
      await repo.delete(Number(req.params.id))
      res.json({ ok: true })
    } catch (error) {
      next(error)
    }
  })

  return router
}
```

- [ ] **Step 5: Implement card routes**

Create `server/routes/cards.ts`:

```ts
import { Router } from 'express'
import type { DataSource } from 'typeorm'
import { Card } from '../../src/database/entities/Card'

export function createCardRouter(dataSource: DataSource) {
  const router = Router()
  const repo = dataSource.getRepository(Card)

  router.get('/lists/:listId/cards', async (req, res, next) => {
    try {
      res.json(
        await repo.find({
          where: { list_id: Number(req.params.listId) },
          order: { position: 'ASC' },
        })
      )
    } catch (error) {
      next(error)
    }
  })

  router.post('/lists/:listId/cards', async (req, res, next) => {
    try {
      const title = String(req.body.title ?? '').trim()
      if (!title) return res.status(400).json({ error: 'Card title is required' })
      const existing = await repo.find({ where: { list_id: Number(req.params.listId) } })
      const maxPosition = existing.length ? Math.max(...existing.map((card) => card.position)) : 0
      const card = repo.create({
        list_id: Number(req.params.listId),
        title,
        description: req.body.description,
        priority: req.body.priority ?? 'medium',
        due_date: req.body.due_date ? new Date(req.body.due_date) : undefined,
        position: maxPosition + 1,
      })
      res.status(201).json(await repo.save(card))
    } catch (error) {
      next(error)
    }
  })

  router.patch('/cards/:id', async (req, res, next) => {
    try {
      await repo.update(Number(req.params.id), req.body)
      res.json({ ok: true })
    } catch (error) {
      next(error)
    }
  })

  router.delete('/cards/:id', async (req, res, next) => {
    try {
      await repo.delete(Number(req.params.id))
      res.json({ ok: true })
    } catch (error) {
      next(error)
    }
  })

  router.post('/cards/:id/move', async (req, res, next) => {
    try {
      await repo.update(Number(req.params.id), {
        list_id: Number(req.body.list_id),
        position: Number(req.body.position),
      })
      res.json({ ok: true })
    } catch (error) {
      next(error)
    }
  })

  return router
}
```

- [ ] **Step 6: Mount routes in app**

Update `server/app.ts`:

```ts
import type { DataSource } from 'typeorm'
import { createBoardRouter } from './routes/boards'
import { createListRouter } from './routes/lists'
import { createCardRouter } from './routes/cards'

export function createApp(dataSource?: DataSource) {
  const app = express()
  // middleware and health route
  if (dataSource) {
    app.use('/api/boards', createBoardRouter(dataSource))
    app.use('/api', createListRouter(dataSource))
    app.use('/api', createCardRouter(dataSource))
  }
  // error handler
}
```

- [ ] **Step 7: Run API workflow green**

Run:

```bash
npx jest tests/server/task-workflow.test.ts --runInBand --no-cache
```

Expected: PASS.

### Task 4: Frontend API Client

**Files:**
- Create: `src/services/api.ts`
- Test: `tests/unit/services/api.test.ts`

- [ ] **Step 1: Write API client test**

Create `tests/unit/services/api.test.ts`:

```ts
import { apiClient } from '@/services/api'

describe('apiClient', () => {
  beforeEach(() => {
    global.fetch = jest.fn()
  })

  it('posts JSON and returns parsed response', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ id: 1, name: '产品计划' }),
    })

    const result = await apiClient.post('/boards', { name: '产品计划' })

    expect(global.fetch).toHaveBeenCalledWith('/api/boards', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: '产品计划' }),
    })
    expect(result).toEqual({ id: 1, name: '产品计划' })
  })

  it('throws JSON error messages', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      json: async () => ({ error: 'Board name is required' }),
    })

    await expect(apiClient.post('/boards', {})).rejects.toThrow('Board name is required')
  })
})
```

- [ ] **Step 2: Run API client test red**

Run:

```bash
npx jest tests/unit/services/api.test.ts --runInBand --no-cache
```

Expected: FAIL because `src/services/api.ts` does not exist.

- [ ] **Step 3: Implement API client**

Create `src/services/api.ts`:

```ts
type JsonBody = Record<string, unknown>

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`/api${path}`, options)
  const payload = await response.json().catch(() => ({}))
  if (!response.ok) {
    const message = typeof payload.error === 'string' ? payload.error : 'Request failed'
    throw new Error(message)
  }
  return payload as T
}

export const apiClient = {
  get<T>(path: string) {
    return request<T>(path)
  },
  post<T>(path: string, body: JsonBody) {
    return request<T>(path, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
  },
  patch<T>(path: string, body: JsonBody) {
    return request<T>(path, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
  },
  delete<T>(path: string) {
    return request<T>(path, { method: 'DELETE' })
  },
}
```

- [ ] **Step 4: Run API client test green**

Run:

```bash
npx jest tests/unit/services/api.test.ts --runInBand --no-cache
```

Expected: PASS.

### Task 5: Switch Board/List/Card Stores To API

**Files:**
- Modify: `src/stores/board.ts`
- Modify: `src/stores/list.ts`
- Modify: `src/stores/card.ts`
- Modify: `tests/unit/stores/board.test.ts`
- Modify: `tests/unit/stores/card.test.ts`
- Create: `tests/unit/stores/list.test.ts`

- [ ] **Step 1: Update store tests to mock `apiClient`**

For each store test, mock `@/services/api` instead of `@/database/db` or `@/database/connection`.

Example board mock:

```ts
jest.mock('@/services/api', () => ({
  apiClient: {
    get: jest.fn(),
    post: jest.fn(),
    patch: jest.fn(),
    delete: jest.fn(),
  },
}))
```

Board create expectation:

```ts
;(apiClient.post as jest.Mock).mockResolvedValue(newBoard)
const result = await store.createBoard('New Board', 'Description')
expect(apiClient.post).toHaveBeenCalledWith('/boards', {
  name: 'New Board',
  description: 'Description',
})
expect(result).toEqual(newBoard)
```

- [ ] **Step 2: Run store tests red**

Run:

```bash
npm test -- tests/unit/stores
```

Expected: FAIL because stores still use local data helpers.

- [ ] **Step 3: Implement board store API calls**

In `src/stores/board.ts`, replace local `db` usage:

```ts
import { apiClient } from '@/services/api'
import type { Board } from '@/database/entities/Board'

// fetchBoards
boards.value = await apiClient.get<Board[]>('/boards')

// createBoard
const board = await apiClient.post<Board>('/boards', { name, description })
boards.value.unshift(board)

// updateBoard
await apiClient.patch(`/boards/${id}`, data as Record<string, unknown>)

// deleteBoard
await apiClient.delete(`/boards/${id}`)
```

- [ ] **Step 4: Implement list store API calls**

In `src/stores/list.ts`, replace local `db` usage:

```ts
import { apiClient } from '@/services/api'

lists.value = await apiClient.get<List[]>(`/boards/${boardId}/lists`)
const list = await apiClient.post<List>(`/boards/${boardId}/lists`, { name })
await apiClient.patch(`/lists/${id}`, data as Record<string, unknown>)
await apiClient.delete(`/lists/${id}`)
```

- [ ] **Step 5: Implement card store API calls**

In `src/stores/card.ts`, replace local `db` usage:

```ts
cards.value = await apiClient.get<Card[]>(`/lists/${listId}/cards`)
const card = await apiClient.post<Card>(`/lists/${listId}/cards`, { title, description })
await apiClient.patch(`/cards/${id}`, data as Record<string, unknown>)
await apiClient.delete(`/cards/${id}`)
await apiClient.post(`/cards/${cardId}/move`, { list_id: targetListId, position })
```

After moving, call `fetchCards(targetListId)` and update local order as needed.

- [ ] **Step 6: Run store tests green**

Run:

```bash
npm test -- tests/unit/stores
```

Expected: PASS.

### Task 6: Vite Proxy And Full Dev Scripts

**Files:**
- Modify: `vite.config.ts`
- Modify: `package.json`
- Modify: `package-lock.json`

- [ ] **Step 1: Add Vite API proxy**

Update `vite.config.ts`:

```ts
server: {
  proxy: {
    '/api': {
      target: `http://localhost:${process.env.API_PORT || 3001}`,
      changeOrigin: true,
    },
  },
},
```

- [ ] **Step 2: Update Electron dev URL if needed**

If Vite still runs on `5173`, keep `electron/main.ts` unchanged. If scripts move Vite to a different port, update `electron/main.ts` and `electron:dev` consistently.

- [ ] **Step 3: Run full compile checks**

Run:

```bash
npm run server:build
npm run build
```

Expected: both PASS.

### Task 7: End-To-End Local Verification

**Files:**
- No code changes unless verification reveals a bug.

- [ ] **Step 1: Prepare MySQL**

Ensure MySQL is running and create the database:

```sql
CREATE DATABASE IF NOT EXISTS task_orchestrator;
```

Set environment variables or `.env`:

```env
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=
DB_DATABASE=task_orchestrator
API_PORT=3001
```

- [ ] **Step 2: Start backend and frontend**

Run:

```bash
npm run dev:full
```

Expected:

```text
API listening on http://localhost:3001
VITE ready
```

- [ ] **Step 3: Verify API health**

Run:

```bash
curl http://localhost:3001/api/health
```

Expected:

```json
{"status":"ok"}
```

- [ ] **Step 4: Browser workflow**

Open Vite app, then create:

1. Board named `产品计划`
2. List named `待办`
3. Card named `第一条任务`

Refresh the page. Expected: the board/list/card still appear because they are loaded from MySQL through the backend.

- [ ] **Step 5: Final verification**

Run:

```bash
npm test
npm run build
npm run server:build
```

Expected: all PASS.
