import 'reflect-metadata'
import { createDataSource } from './data-source'

async function main() {
  const dataSource = createDataSource()
  try {
    await dataSource.initialize()
    console.log('DataSource connected.')
    const pending = await dataSource.showMigrations()
    console.log(`Pending migrations: ${pending ? 'yes' : 'no'}`)
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
