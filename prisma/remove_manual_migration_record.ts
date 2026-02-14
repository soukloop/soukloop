import { Client } from 'pg'
import dotenv from 'dotenv'

dotenv.config()

const databaseUrl = process.env.DATABASE_URL

if (!databaseUrl) {
  console.error('DATABASE_URL not set')
  process.exit(1)
}

async function main() {
  const client = new Client({ connectionString: databaseUrl })
  await client.connect()

  try {
    console.log('Listing migrations in _prisma_migrations (if table exists)...')
    const res = await client.query(`SELECT migration_name FROM _prisma_migrations`) 
    console.log('Migrations found:', res.rows.map(r => r.migration_name))

    const target = 'manual_add_order_status_history'
    console.log(`Deleting migration record: ${target} (if exists)`)
    await client.query('DELETE FROM _prisma_migrations WHERE migration_name = $1', [target])
    console.log('Delete completed.')
  } catch (err: any) {
    console.error('Error while manipulating _prisma_migrations:', err.message || err)
  } finally {
    await client.end()
  }
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
