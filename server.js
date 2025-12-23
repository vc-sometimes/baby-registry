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
    if (!existsSync(VOTES_FILE)) {
      return { votes: [] }
    }
    const data = readFileSync(VOTES_FILE, 'utf8')
    const parsed = JSON.parse(data)
    // Ensure votes is always an array
    if (!parsed || typeof parsed !== 'object') {
      return { votes: [] }
    }
    if (!Array.isArray(parsed.votes)) {
      return { votes: [] }
    }
    return parsed
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

// Get all votes (for displaying individual votes)
app.get('/api/votes/all', (req, res) => {
  try {
    const data = readVotes()
    const votes = (data.votes || []).map(vote => ({
      voteType: vote.voteType,
      createdAt: vote.createdAt,
      // Don't expose IP addresses for privacy
    })).sort((a, b) => {
      return new Date(b.createdAt) - new Date(a.createdAt)
    })
    
    res.json({ votes })
  } catch (error) {
    console.error('Error fetching all votes:', error)
    res.status(500).json({ error: 'Failed to fetch votes' })
  }
})

// Submit a vote
app.post('/api/votes', (req, res) => {
  try {
    const { voteType, browserId } = req.body
    
    if (!voteType || !['boy', 'girl'].includes(voteType)) {
      return res.status(400).json({ error: 'Invalid vote type' })
    }

    if (!browserId) {
      return res.status(400).json({ error: 'Browser ID is required' })
    }

    // Get user IP (for reference, but browserId is primary identifier)
    const userIp = getUserIp(req)

    // Read current votes
    const data = readVotes()
    const votes = Array.isArray(data.votes) ? [...data.votes] : [] // Create a copy to ensure we're working with an array

    console.log(`[VOTE] Received vote: ${voteType} from browserId: ${browserId}`)
    console.log(`[VOTE] Current total votes before: ${votes.length}`)

    // Check if this browser has already voted (using browserId as primary identifier)
    const existingVoteIndex = votes.findIndex(v => v.browserId === browserId)
    if (existingVoteIndex !== -1) {
      const existingVote = votes[existingVoteIndex]
      console.log(`[VOTE] Browser ${browserId} already voted: ${existingVote.voteType}`)
      return res.status(400).json({ 
        error: 'You have already voted',
        boy: votes.filter(v => v.voteType === 'boy').length,
        girl: votes.filter(v => v.voteType === 'girl').length,
        total: votes.length,
        voteType: existingVote.voteType
      })
    }

    // Create new vote object with unique ID
    const newVote = {
      id: `vote_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`, // Unique vote ID
      voteType,
      browserId,
      userIp, // Store IP for reference
      createdAt: new Date().toISOString()
    }

    // Add new vote to the array
    votes.push(newVote)
    console.log(`[VOTE] Added new vote. Total votes after: ${votes.length}`)

    // Write votes back to file
    writeVotes({ votes })

    // Verify the write by reading back
    const verifyData = readVotes()
    const verifyVotes = verifyData.votes || []
    console.log(`[VOTE] Verified write. Votes in file: ${verifyVotes.length}`)

    // Get updated counts
    const boyVotes = verifyVotes.filter(v => v.voteType === 'boy').length
    const girlVotes = verifyVotes.filter(v => v.voteType === 'girl').length

    res.json({
      success: true,
      boy: boyVotes,
      girl: girlVotes,
      total: verifyVotes.length
    })
  } catch (error) {
    console.error('Error submitting vote:', error)
    res.status(500).json({ error: 'Failed to submit vote' })
  }
})

// Check if user has voted
app.get('/api/votes/check', (req, res) => {
  try {
    const browserId = req.query.browserId
    
    if (!browserId) {
      return res.status(400).json({ error: 'Browser ID is required' })
    }

    const data = readVotes()
    const votes = data.votes || []
    const vote = votes.find(v => v.browserId === browserId)
    
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
    const browserId = req.query.browserId
    
    if (!browserId) {
      return res.status(400).json({ error: 'Browser ID is required' })
    }

    const data = readVotes()
    const votes = data.votes || []
    
    // Find the user's vote by browserId
    const userVoteIndex = votes.findIndex(v => v.browserId === browserId)
    
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
    const { name, message, submissionId } = req.body
    
    if (!name || !message) {
      return res.status(400).json({ error: 'Name and message are required' })
    }

    if (name.trim().length === 0 || message.trim().length === 0) {
      return res.status(400).json({ error: 'Name and message cannot be empty' })
    }

    const data = readMessages()
    const messages = Array.isArray(data.messages) ? [...data.messages] : []

    const nameTrimmed = name.trim()
    const messageTrimmed = message.trim()
    const now = Date.now()
    const timestamp = new Date().toISOString()

    // Check for duplicate messages within the last 10 seconds (same name and message)
    const recentDuplicate = messages.find(msg => {
      const msgTime = new Date(msg.timestamp).getTime()
      const timeDiff = now - msgTime
      return (
        msg.name === nameTrimmed &&
        msg.message === messageTrimmed &&
        timeDiff < 10000 // 10 seconds
      )
    })

    if (recentDuplicate) {
      console.log(`[MESSAGES] Duplicate message detected from ${nameTrimmed} within 10 seconds [Submission ID: ${submissionId || 'none'}]`)
      return res.status(400).json({ 
        error: 'Duplicate message detected. Please wait a moment before submitting again.',
        message: recentDuplicate
      })
    }

    // Also check if we just processed this exact submission ID (in case of network retries)
    if (submissionId) {
      const existingBySubmissionId = messages.find(msg => msg.submissionId === submissionId)
      if (existingBySubmissionId) {
        console.log(`[MESSAGES] Message with submission ID ${submissionId} already exists`)
        return res.json({
          success: true,
          message: existingBySubmissionId
        })
      }
    }

    const newMessage = {
      id: `${now}_${Math.random().toString(36).substring(2, 15)}`, // More unique ID
      name: nameTrimmed,
      message: messageTrimmed,
      timestamp: timestamp,
      submissionId: submissionId || null // Store submission ID if provided
    }

    console.log(`[MESSAGES] Adding new message from ${nameTrimmed} [Submission ID: ${submissionId || 'none'}], total messages: ${messages.length + 1}`)
    messages.push(newMessage)
    writeMessages({ messages })

    // Verify the write
    const verifyData = readMessages()
    console.log(`[MESSAGES] Verified write. Messages in file: ${verifyData.messages?.length || 0}`)

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

