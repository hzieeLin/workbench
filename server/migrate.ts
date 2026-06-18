import 'reflect-metadata'
import mysql from 'mysql2/promise'
import { createDataSource } from './data-source'
import { config } from './config'

async function main() {
  const conn = await mysql.createConnection({
    host: config.db.host,
    port: config.db.port,
    user: config.db.username,
    password: config.db.password,
  })
  await conn.execute(
    `CREATE DATABASE IF NOT EXISTS \`${config.db.database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`
  )
  console.log(`Database '${config.db.database}' ensured.`)
  await conn.end()

  const dataSource = createDataSource()
  try {
    await dataSource.initialize()
    console.log('DataSource connected.')
    const pending = await dataSource.showMigrations()
    console.log(`Pending migrations: ${pending.length}`)
    await dataSource.runMigrations()
    console.log('All migrations executed successfully.')
  } catch (error) {
    console.error('Migration failed:', error)
    process.exit(1)
  } finally {
    if (dataSource.isInitialized) {
      await dataSource.destroy()
    }
  }
}

main()
