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
