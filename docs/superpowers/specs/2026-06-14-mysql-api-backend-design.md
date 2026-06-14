# MySQL API Backend Design

## Goal

Add a real Node API backend for TaskFlow so task data is stored in MySQL instead of browser `localStorage`. Keep the existing Vue/Electron UI, but move board/list/card persistence behind HTTP APIs.

## Architecture

Use a same-repository backend in `server/`:

- Express handles HTTP routing under `/api`.
- TypeORM connects to MySQL using the existing entity model as the starting point.
- Vite proxies `/api` to the backend during development.
- Vue stores call a small API client instead of importing database code or using `localStorage`.
- Electron continues to load the frontend; it does not own database access in this design.

## Database

Use MySQL with environment variables:

- `DB_HOST`
- `DB_PORT`
- `DB_USERNAME`
- `DB_PASSWORD`
- `DB_DATABASE`
- `API_PORT`

The first implementation should reuse the current tables and TypeORM entities for boards, lists, and cards. Migrations should remain explicit; do not use `synchronize: true` for production behavior.

## API Scope

Implement the first backend slice for the current task creation workflow:

- `GET /api/health`
- `GET /api/boards`
- `POST /api/boards`
- `PATCH /api/boards/:id`
- `DELETE /api/boards/:id`
- `GET /api/boards/:boardId/lists`
- `POST /api/boards/:boardId/lists`
- `PATCH /api/lists/:id`
- `DELETE /api/lists/:id`
- `GET /api/lists/:listId/cards`
- `POST /api/lists/:listId/cards`
- `PATCH /api/cards/:id`
- `DELETE /api/cards/:id`
- `POST /api/cards/:id/move`

Statistics, calendar events, labels, and time blocks can be migrated after the board/list/card workflow is stable.

## Frontend Changes

Add `src/services/api.ts` for HTTP calls. Update the Pinia board, list, and card stores to use that API client. Keep the visible UI and the current light theme. The create-board, create-list, and create-card flows should work the same from the user's perspective, but data must come from MySQL through the backend.

## Development Workflow

Add scripts to run frontend and backend together:

- Backend dev server on `API_PORT`, defaulting to `3001`.
- Vite dev server proxies `/api` to the backend.
- A combined script starts both services for local development.

## Error Handling

Backend routes should return JSON errors with a consistent shape:

```json
{ "error": "Message" }
```

Frontend stores should surface request failures through their existing `error` fields and keep loading state accurate.

## Non-Goals

- Do not migrate statistics, calendar, labels, or time blocks in the first backend slice.
- Do not add authentication.
- Do not split the backend into a separate repository.
- Do not replace MySQL with SQLite.
- Do not remove Electron packaging.

## Verification

- Unit or integration tests for the API/store paths that cover board/list/card creation.
- `npm test`
- `npm run build`
- Start the backend and frontend locally.
- Verify in the browser: create a board, create a list, create a card, refresh, and confirm the data is loaded from the backend.
