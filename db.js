import pg from 'pg'
const { Pool } = pg

let pool = null

// Create connection pool only if DATABASE_URL is set
if (process.env.DATABASE_URL) {
  try {
    console.log('[DATABASE] DATABASE_URL found:', process.env.DATABASE_URL.substring(0, 20) + '...')
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.DATABASE_URL?.includes('railway') || process.env.DATABASE_URL?.includes('postgres') ? { rejectUnauthorized: false } : false,
      connectionTimeoutMillis: 5000,
      idleTimeoutMillis: 30000
    })
    console.log('[DATABASE] Connection pool created successfully')
  } catch (error) {
    console.error('[DATABASE] Error creating connection pool:', error.message)
  }
} else {
  console.log('[DATABASE] DATABASE_URL not set')
  console.log('[DATABASE] Available env vars:', Object.keys(process.env).filter(k => k.includes('DATABASE') || k.includes('PG')).join(', '))
}

// Initialize database tables
export async function initDatabase() {
  if (!pool) {
    console.log('[DATABASE] No database connection available, skipping initialization')
    console.log('[DATABASE] To enable database: Add Postgres database in Railway dashboard')
    return false
  }

  try {
    // Test connection with timeout
    const testQuery = pool.query('SELECT NOW()')
    const timeout = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Connection timeout')), 5000)
    )
    await Promise.race([testQuery, timeout])
    console.log('[DATABASE] Connection test successful')

    // Create votes table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS votes (
        id SERIAL PRIMARY KEY,
        browser_id VARCHAR(255) UNIQUE NOT NULL,
        vote_type VARCHAR(10) NOT NULL CHECK (vote_type IN ('boy', 'girl')),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // Create messages table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS messages (
        id SERIAL PRIMARY KEY,
        browser_id VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        submission_id VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // Create index on browser_id for faster lookups
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_votes_browser_id ON votes(browser_id)
    `)
    
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_messages_browser_id ON messages(browser_id)
    `)

    console.log('[DATABASE] Tables initialized successfully')
    return true
  } catch (error) {
    console.error('[DATABASE] Error initializing database:')
    console.error('[DATABASE] Error message:', error.message)
    console.error('[DATABASE] Error code:', error.code)
    console.error('[DATABASE] Full error:', JSON.stringify(error, Object.getOwnPropertyNames(error)))
    console.error('[DATABASE] Make sure DATABASE_URL is set correctly in Railway')
    console.error('[DATABASE] Check Railway Variables tab for DATABASE_URL')
    return false
  }
}

export default pool

