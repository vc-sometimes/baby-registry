import pg from 'pg'
const { Pool } = pg

// Create connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL?.includes('railway') ? { rejectUnauthorized: false } : false
})

// Initialize database tables
export async function initDatabase() {
  try {
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
  } catch (error) {
    console.error('[DATABASE] Error initializing database:', error)
    throw error
  }
}

export default pool

