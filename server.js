import express from 'express'
import cors from 'cors'
import dbPool, { initDatabase } from './db.js'

const pool = dbPool

const app = express()
const PORT = process.env.PORT || 3001

// Initialize database on startup
let dbInitialized = false
initDatabase().then(() => {
  dbInitialized = true
  console.log('[SERVER] Database initialized successfully')
}).catch((error) => {
  console.error('[SERVER] Database initialization failed:', error)
  console.log('[SERVER] Falling back to file-based storage if DATABASE_URL not set')
})

// Middleware
// CORS configuration - allows all origins in production
// For better security, set FRONTEND_URL env var in Railway to restrict to your Vercel domain
const corsOptions = {
  origin: process.env.FRONTEND_URL || '*',
  credentials: true,
  methods: ['GET', 'POST', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}
app.use(cors(corsOptions))
app.use(express.json())
app.set('trust proxy', true)

// Helper function to check if database is available
const useDatabase = () => {
  return !!process.env.DATABASE_URL && dbInitialized
}

// Get vote counts
app.get('/api/votes', async (req, res) => {
  try {
    if (useDatabase()) {
      const result = await pool.query(`
        SELECT 
          COUNT(*) FILTER (WHERE vote_type = 'boy') as boy,
          COUNT(*) FILTER (WHERE vote_type = 'girl') as girl,
          COUNT(*) as total
        FROM votes
      `)
      const { boy, girl, total } = result.rows[0]
      res.json({
        boy: parseInt(boy) || 0,
        girl: parseInt(girl) || 0,
        total: parseInt(total) || 0
      })
    } else {
      res.json({ boy: 0, girl: 0, total: 0 })
    }
  } catch (error) {
    console.error('Error fetching votes:', error)
    res.status(500).json({ error: 'Failed to fetch votes' })
  }
})

// Get all votes (for displaying individual votes)
app.get('/api/votes/all', async (req, res) => {
  try {
    if (useDatabase()) {
      const result = await pool.query(`
        SELECT vote_type as "voteType", created_at as "createdAt"
        FROM votes
        ORDER BY created_at DESC
      `)
      res.json({ votes: result.rows })
    } else {
      res.json({ votes: [] })
    }
  } catch (error) {
    console.error('Error fetching all votes:', error)
    res.status(500).json({ error: 'Failed to fetch votes' })
  }
})

// Submit a vote
app.post('/api/votes', async (req, res) => {
  try {
    const { voteType, browserId } = req.body
    
    if (!voteType || !['boy', 'girl'].includes(voteType)) {
      return res.status(400).json({ error: 'Invalid vote type' })
    }

    if (!browserId) {
      return res.status(400).json({ error: 'Browser ID is required' })
    }

    if (!useDatabase()) {
      return res.status(503).json({ error: 'Database not available. Please set up Postgres database.' })
    }

    console.log(`[VOTE] Received vote: ${voteType} from browserId: ${browserId}`)

    // Check if this browser has already voted
    const existingVote = await pool.query(
      'SELECT vote_type FROM votes WHERE browser_id = $1',
      [browserId]
    )

    if (existingVote.rows.length > 0) {
      const existing = existingVote.rows[0]
      console.log(`[VOTE] Browser ${browserId} already voted: ${existing.vote_type}`)
      
      // Get current counts
      const counts = await pool.query(`
        SELECT 
          COUNT(*) FILTER (WHERE vote_type = 'boy') as boy,
          COUNT(*) FILTER (WHERE vote_type = 'girl') as girl,
          COUNT(*) as total
        FROM votes
      `)
      const { boy, girl, total } = counts.rows[0]
      
      return res.status(400).json({ 
        error: 'You have already voted',
        boy: parseInt(boy) || 0,
        girl: parseInt(girl) || 0,
        total: parseInt(total) || 0,
        voteType: existing.vote_type
      })
    }

    // Insert new vote
    await pool.query(
      'INSERT INTO votes (browser_id, vote_type) VALUES ($1, $2)',
      [browserId, voteType]
    )

    console.log(`[VOTE] Added new vote`)

    // Get updated counts
    const counts = await pool.query(`
      SELECT 
        COUNT(*) FILTER (WHERE vote_type = 'boy') as boy,
        COUNT(*) FILTER (WHERE vote_type = 'girl') as girl,
        COUNT(*) as total
      FROM votes
    `)
    const { boy, girl, total } = counts.rows[0]

    res.json({
      success: true,
      boy: parseInt(boy) || 0,
      girl: parseInt(girl) || 0,
      total: parseInt(total) || 0
    })
  } catch (error) {
    console.error('Error submitting vote:', error)
    res.status(500).json({ error: 'Failed to submit vote' })
  }
})

// Check if user has voted
app.get('/api/votes/check', async (req, res) => {
  try {
    const browserId = req.query.browserId
    
    if (!browserId) {
      return res.status(400).json({ error: 'Browser ID is required' })
    }

    if (!useDatabase()) {
      return res.json({ hasVoted: false, voteType: null })
    }

    const result = await pool.query(
      'SELECT vote_type FROM votes WHERE browser_id = $1',
      [browserId]
    )
    
    const vote = result.rows[0]
    res.json({
      hasVoted: !!vote,
      voteType: vote?.vote_type || null
    })
  } catch (error) {
    console.error('Error checking vote:', error)
    res.status(500).json({ error: 'Failed to check vote' })
  }
})

// Helper function to get consistent IP address
const getUserIp = (req) => {
  // Check X-Forwarded-For header (for proxies)
  const forwarded = req.headers['x-forwarded-for']
  if (forwarded) {
    // X-Forwarded-For can contain multiple IPs, take the first one
    const ips = forwarded.split(',')
    return ips[0].trim()
  }
  // Fallback to req.ip or connection remoteAddress
  return req.ip || req.connection?.remoteAddress || req.socket?.remoteAddress || 'unknown'
}

// Delete user's own vote
app.delete('/api/votes', async (req, res) => {
  try {
    const browserId = req.query.browserId
    
    if (!browserId) {
      return res.status(400).json({ error: 'Browser ID is required' })
    }

    if (!useDatabase()) {
      return res.status(503).json({ error: 'Database not available' })
    }

    const result = await pool.query(
      'DELETE FROM votes WHERE browser_id = $1 RETURNING *',
      [browserId]
    )
    
    if (result.rows.length === 0) {
      return res.status(404).json({ 
        error: 'No vote found to delete'
      })
    }
    
    // Get updated counts
    const counts = await pool.query(`
      SELECT 
        COUNT(*) FILTER (WHERE vote_type = 'boy') as boy,
        COUNT(*) FILTER (WHERE vote_type = 'girl') as girl,
        COUNT(*) as total
      FROM votes
    `)
    const { boy, girl, total } = counts.rows[0]
    
    res.json({
      success: true,
      message: 'Your vote has been cleared',
      boy: parseInt(boy) || 0,
      girl: parseInt(girl) || 0,
      total: parseInt(total) || 0
    })
  } catch (error) {
    console.error('Error clearing vote:', error)
    res.status(500).json({ error: 'Failed to clear vote' })
  }
})

// Get all messages
app.get('/api/messages', async (req, res) => {
  try {
    if (useDatabase()) {
      const result = await pool.query(`
        SELECT 
          id,
          browser_id as "browserId",
          name,
          message,
          submission_id as "submissionId",
          created_at as "timestamp"
        FROM messages
        ORDER BY created_at DESC
      `)
      res.json({ messages: result.rows })
    } else {
      res.json({ messages: [] })
    }
  } catch (error) {
    console.error('Error fetching messages:', error)
    res.status(500).json({ error: 'Failed to fetch messages' })
  }
})

// Submit a message
app.post('/api/messages', async (req, res) => {
  try {
    const { name, message, browserId, submissionId } = req.body
    
    if (!name || !message) {
      return res.status(400).json({ error: 'Name and message are required' })
    }

    if (!browserId) {
      return res.status(400).json({ error: 'Browser ID is required' })
    }

    if (name.trim().length === 0 || message.trim().length === 0) {
      return res.status(400).json({ error: 'Name and message cannot be empty' })
    }

    if (!useDatabase()) {
      return res.status(503).json({ error: 'Database not available. Please set up Postgres database.' })
    }

    const nameTrimmed = name.trim()
    const messageTrimmed = message.trim()

    // Check if this browser has already submitted a message
    const existingMessage = await pool.query(
      'SELECT * FROM messages WHERE browser_id = $1',
      [browserId]
    )

    if (existingMessage.rows.length > 0) {
      // User already has a message, update it instead of creating duplicate
      const existing = existingMessage.rows[0]
      console.log(`[MESSAGES] Browser ${browserId} already has a message, updating it`)
      
      const updated = await pool.query(`
        UPDATE messages 
        SET name = $1, message = $2, submission_id = COALESCE($3, submission_id), created_at = CURRENT_TIMESTAMP
        WHERE browser_id = $4
        RETURNING id, browser_id as "browserId", name, message, submission_id as "submissionId", created_at as "timestamp"
      `, [nameTrimmed, messageTrimmed, submissionId || null, browserId])
      
      return res.json({
        success: true,
        message: updated.rows[0]
      })
    }

    // Check for duplicate messages within the last 10 seconds (same name and message)
    const recentDuplicate = await pool.query(`
      SELECT * FROM messages 
      WHERE name = $1 AND message = $2 
      AND created_at > NOW() - INTERVAL '10 seconds'
      LIMIT 1
    `, [nameTrimmed, messageTrimmed])

    if (recentDuplicate.rows.length > 0) {
      console.log(`[MESSAGES] Duplicate message detected from ${nameTrimmed} within 10 seconds`)
      return res.status(400).json({ 
        error: 'Duplicate message detected. Please wait a moment before submitting again.',
        message: {
          id: recentDuplicate.rows[0].id,
          name: recentDuplicate.rows[0].name,
          message: recentDuplicate.rows[0].message,
          timestamp: recentDuplicate.rows[0].created_at
        }
      })
    }

    // Also check if we just processed this exact submission ID (in case of network retries)
    if (submissionId) {
      const existingBySubmissionId = await pool.query(
        'SELECT * FROM messages WHERE submission_id = $1',
        [submissionId]
      )
      if (existingBySubmissionId.rows.length > 0) {
        console.log(`[MESSAGES] Message with submission ID ${submissionId} already exists`)
        return res.json({
          success: true,
          message: {
            id: existingBySubmissionId.rows[0].id,
            browserId: existingBySubmissionId.rows[0].browser_id,
            name: existingBySubmissionId.rows[0].name,
            message: existingBySubmissionId.rows[0].message,
            timestamp: existingBySubmissionId.rows[0].created_at,
            submissionId: existingBySubmissionId.rows[0].submission_id
          }
        })
      }
    }

    // Insert new message
    const result = await pool.query(`
      INSERT INTO messages (browser_id, name, message, submission_id)
      VALUES ($1, $2, $3, $4)
      RETURNING id, browser_id as "browserId", name, message, submission_id as "submissionId", created_at as "timestamp"
    `, [browserId, nameTrimmed, messageTrimmed, submissionId || null])

    const newMessage = result.rows[0]
    console.log(`[MESSAGES] Added new message from ${nameTrimmed} [Browser ID: ${browserId}]`)

    res.json({
      success: true,
      message: newMessage
    })
  } catch (error) {
    console.error('Error submitting message:', error)
    res.status(500).json({ error: 'Failed to submit message' })
  }
})

// Check if user has a message
app.get('/api/messages/check', async (req, res) => {
  try {
    const browserId = req.query.browserId
    
    if (!browserId) {
      return res.status(400).json({ error: 'Browser ID is required' })
    }

    if (!useDatabase()) {
      return res.json({ hasMessage: false, message: null })
    }

    const result = await pool.query(`
      SELECT id, browser_id as "browserId", name, message, submission_id as "submissionId", created_at as "timestamp"
      FROM messages 
      WHERE browser_id = $1
    `, [browserId])
    
    const message = result.rows[0] || null
    res.json({
      hasMessage: !!message,
      message: message
    })
  } catch (error) {
    console.error('Error checking message:', error)
    res.status(500).json({ error: 'Failed to check message' })
  }
})

// Delete user's own message
app.delete('/api/messages', async (req, res) => {
  try {
    const browserId = req.query.browserId
    const clearAll = req.query.clearAll === 'true'
    
    if (!useDatabase()) {
      return res.status(503).json({ error: 'Database not available' })
    }
    
    // Admin endpoint to clear all messages
    if (clearAll) {
      await pool.query('DELETE FROM messages')
      console.log('[MESSAGES] All messages cleared')
      return res.json({
        success: true,
        message: 'All messages cleared'
      })
    }
    
    if (!browserId) {
      return res.status(400).json({ error: 'Browser ID is required' })
    }

    const result = await pool.query(
      'DELETE FROM messages WHERE browser_id = $1 RETURNING *',
      [browserId]
    )
    
    if (result.rows.length === 0) {
      return res.status(404).json({ 
        error: 'No message found to delete'
      })
    }
    
    res.json({
      success: true,
      message: 'Your message has been cleared'
    })
  } catch (error) {
    console.error('Error clearing message:', error)
    res.status(500).json({ error: 'Failed to clear message' })
  }
})

// Admin endpoint to delete any message by ID
app.delete('/api/messages/:id', async (req, res) => {
  try {
    const messageId = req.params.id
    const adminKey = req.headers['x-admin-key'] || req.query.adminKey
    
    // Check admin key
    const expectedAdminKey = process.env.ADMIN_KEY || 'buba-admin-2024'
    if (adminKey !== expectedAdminKey) {
      return res.status(403).json({ 
        error: 'Unauthorized: Admin access required'
      })
    }
    
    if (!messageId) {
      return res.status(400).json({ error: 'Message ID is required' })
    }

    if (!useDatabase()) {
      return res.status(503).json({ error: 'Database not available' })
    }

    const result = await pool.query(
      'DELETE FROM messages WHERE id = $1 RETURNING *',
      [messageId]
    )
    
    if (result.rows.length === 0) {
      return res.status(404).json({ 
        error: 'Message not found'
      })
    }
    
    console.log(`[MESSAGES] Message ${messageId} deleted by admin`)
    
    res.json({
      success: true,
      message: 'Message deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting message:', error)
    res.status(500).json({ error: 'Failed to delete message' })
  }
})

// Admin login endpoint
app.post('/api/admin/login', (req, res) => {
  try {
    const { email, password } = req.body
    
    // Admin credentials - can be overridden by env vars
    const adminCredentials = [
      {
        email: process.env.ADMIN_EMAIL_1 || 'stephenvcb@gmail.com',
        password: process.env.ADMIN_PASSWORD_1 || 'PonzuDrop614!'
      },
      {
        email: process.env.ADMIN_EMAIL_2 || 'brisa',
        password: process.env.ADMIN_PASSWORD_2 || 'buba2026'
      }
    ]
    
    console.log('[ADMIN LOGIN] Attempt:', { 
      receivedEmail: email, 
      receivedPassword: password ? '***' : 'missing'
    })
    
    // Check if credentials match any admin account
    const isValid = adminCredentials.some(cred => 
      email === cred.email && password === cred.password
    )
    
    if (isValid) {
      const adminKey = process.env.ADMIN_KEY || 'buba-admin-2024'
      console.log('[ADMIN LOGIN] Success')
      res.json({
        success: true,
        adminKey: adminKey
      })
    } else {
      console.log('[ADMIN LOGIN] Failed - invalid credentials')
      res.status(401).json({
        success: false,
        error: 'Invalid email or password'
      })
    }
  } catch (error) {
    console.error('[ADMIN LOGIN] Error:', error)
    res.status(500).json({ error: 'Failed to authenticate' })
  }
})

// Admin endpoint to clear all votes
app.delete('/api/votes/all', async (req, res) => {
  try {
    if (!useDatabase()) {
      return res.status(503).json({ error: 'Database not available' })
    }
    
    await pool.query('DELETE FROM votes')
    console.log('[VOTES] All votes cleared')
    res.json({
      success: true,
      message: 'All votes cleared',
      boy: 0,
      girl: 0,
      total: 0
    })
  } catch (error) {
    console.error('Error clearing all votes:', error)
    res.status(500).json({ error: 'Failed to clear votes' })
  }
})

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// Root endpoint
app.get('/', (req, res) => {
  res.json({ message: 'Baby Registry API Server', status: 'running' })
})

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`)
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`)
})

