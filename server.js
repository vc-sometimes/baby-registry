import express from 'express'
import cors from 'cors'
import { readFileSync, writeFileSync, existsSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const app = express()
const PORT = process.env.PORT || 3001
const VOTES_FILE = join(__dirname, 'votes.json')
const MESSAGES_FILE = join(__dirname, 'messages.json')

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

// Initialize votes file if it doesn't exist
const initVotesFile = () => {
  if (!existsSync(VOTES_FILE)) {
    writeFileSync(VOTES_FILE, JSON.stringify({ votes: [] }, null, 2))
  }
}

// Initialize messages file if it doesn't exist
const initMessagesFile = () => {
  if (!existsSync(MESSAGES_FILE)) {
    writeFileSync(MESSAGES_FILE, JSON.stringify({ messages: [] }, null, 2))
  }
}

initVotesFile()
initMessagesFile()

// Helper functions
const readVotes = () => {
  try {
    const data = readFileSync(VOTES_FILE, 'utf8')
    return JSON.parse(data)
  } catch (error) {
    console.error('Error reading votes:', error)
    return { votes: [] }
  }
}

const writeVotes = (data) => {
  try {
    writeFileSync(VOTES_FILE, JSON.stringify(data, null, 2))
  } catch (error) {
    console.error('Error writing votes:', error)
    throw error
  }
}

const readMessages = () => {
  try {
    const data = readFileSync(MESSAGES_FILE, 'utf8')
    return JSON.parse(data)
  } catch (error) {
    console.error('Error reading messages:', error)
    return { messages: [] }
  }
}

const writeMessages = (data) => {
  try {
    writeFileSync(MESSAGES_FILE, JSON.stringify(data, null, 2))
  } catch (error) {
    console.error('Error writing messages:', error)
    throw error
  }
}

// Get vote counts
app.get('/api/votes', (req, res) => {
  try {
    const data = readVotes()
    const votes = data.votes || []
    
    const boyVotes = votes.filter(v => v.voteType === 'boy').length
    const girlVotes = votes.filter(v => v.voteType === 'girl').length
    
    res.json({
      boy: boyVotes,
      girl: girlVotes,
      total: boyVotes + girlVotes
    })
  } catch (error) {
    console.error('Error fetching votes:', error)
    res.status(500).json({ error: 'Failed to fetch votes' })
  }
})

// Submit a vote
app.post('/api/votes', (req, res) => {
  try {
    const { voteType } = req.body
    
    if (!voteType || !['boy', 'girl'].includes(voteType)) {
      return res.status(400).json({ error: 'Invalid vote type' })
    }

    // Get user IP (for basic duplicate prevention)
    const userIp = getUserIp(req)

    const data = readVotes()
    const votes = data.votes || []

    // Check if this IP has already voted
    const existingVote = votes.find(v => v.userIp === userIp)
    if (existingVote) {
      return res.status(400).json({ 
        error: 'You have already voted',
        boy: votes.filter(v => v.voteType === 'boy').length,
        girl: votes.filter(v => v.voteType === 'girl').length,
        total: votes.length
      })
    }

    // Add new vote
    votes.push({
      voteType,
      userIp,
      createdAt: new Date().toISOString()
    })

    writeVotes({ votes })

    // Get updated counts
    const boyVotes = votes.filter(v => v.voteType === 'boy').length
    const girlVotes = votes.filter(v => v.voteType === 'girl').length

    res.json({
      success: true,
      boy: boyVotes,
      girl: girlVotes,
      total: votes.length
    })
  } catch (error) {
    console.error('Error submitting vote:', error)
    res.status(500).json({ error: 'Failed to submit vote' })
  }
})

// Check if user has voted
app.get('/api/votes/check', (req, res) => {
  try {
    const userIp = getUserIp(req)
    const data = readVotes()
    const votes = data.votes || []
    const vote = votes.find(v => {
      // Try exact match first
      if (v.userIp === userIp) return true
      // Also check if stored IP matches common localhost variations
      const storedIp = v.userIp || ''
      if ((userIp === '127.0.0.1' || userIp === '::1' || userIp === '::ffff:127.0.0.1') && 
          (storedIp === '127.0.0.1' || storedIp === '::1' || storedIp === '::ffff:127.0.0.1')) {
        return true
      }
      return false
    })
    
    res.json({
      hasVoted: !!vote,
      voteType: vote?.voteType || null
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
app.delete('/api/votes', (req, res) => {
  try {
    const userIp = getUserIp(req)
    const data = readVotes()
    const votes = data.votes || []
    
    // Find the user's vote
    const userVoteIndex = votes.findIndex(v => {
      // Try exact match first
      if (v.userIp === userIp) return true
      // Also check if stored IP matches common localhost variations
      const storedIp = v.userIp || ''
      if ((userIp === '127.0.0.1' || userIp === '::1' || userIp === '::ffff:127.0.0.1') && 
          (storedIp === '127.0.0.1' || storedIp === '::1' || storedIp === '::ffff:127.0.0.1')) {
        return true
      }
      return false
    })
    
    if (userVoteIndex === -1) {
      // User hasn't voted
      return res.status(404).json({ 
        error: 'No vote found to delete'
      })
    }
    
    // Remove the user's vote
    votes.splice(userVoteIndex, 1)
    writeVotes({ votes })
    
    // Get updated counts
    const boyVotes = votes.filter(v => v.voteType === 'boy').length
    const girlVotes = votes.filter(v => v.voteType === 'girl').length
    
    res.json({
      success: true,
      message: 'Your vote has been cleared',
      boy: boyVotes,
      girl: girlVotes,
      total: votes.length
    })
  } catch (error) {
    console.error('Error clearing vote:', error)
    res.status(500).json({ error: 'Failed to clear vote' })
  }
})

// Get all messages
app.get('/api/messages', (req, res) => {
  try {
    const data = readMessages()
    const messages = (data.messages || []).sort((a, b) => {
      return new Date(b.timestamp) - new Date(a.timestamp)
    })
    res.json({ messages })
  } catch (error) {
    console.error('Error fetching messages:', error)
    res.status(500).json({ error: 'Failed to fetch messages' })
  }
})

// Submit a message
app.post('/api/messages', (req, res) => {
  try {
    const { name, message } = req.body
    
    if (!name || !message) {
      return res.status(400).json({ error: 'Name and message are required' })
    }

    if (name.trim().length === 0 || message.trim().length === 0) {
      return res.status(400).json({ error: 'Name and message cannot be empty' })
    }

    const data = readMessages()
    const messages = data.messages || []

    const newMessage = {
      id: Date.now().toString(),
      name: name.trim(),
      message: message.trim(),
      timestamp: new Date().toISOString()
    }

    messages.push(newMessage)
    writeMessages({ messages })

    res.json({
      success: true,
      message: newMessage
    })
  } catch (error) {
    console.error('Error submitting message:', error)
    res.status(500).json({ error: 'Failed to submit message' })
  }
})

// Delete all messages
app.delete('/api/messages', (req, res) => {
  try {
    writeMessages({ messages: [] })
    res.json({
      success: true,
      message: 'All messages cleared'
    })
  } catch (error) {
    console.error('Error clearing messages:', error)
    res.status(500).json({ error: 'Failed to clear messages' })
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

