import React, { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import './BabyMessages.css'

// Normalize API base URL - remove trailing slash to prevent double slashes
const getApiBase = () => {
  const base = import.meta.env.VITE_API_URL || ''
  return base.replace(/\/+$/, '') // Remove trailing slashes
}
const API_BASE = getApiBase()

// Generate or retrieve a unique browser ID stored in localStorage
const getBrowserId = () => {
  const STORAGE_KEY = 'babyRegistryBrowserId'
  let browserId = localStorage.getItem(STORAGE_KEY)
  
  if (!browserId) {
    // Generate a unique ID using timestamp + random string
    browserId = `browser_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`
    localStorage.setItem(STORAGE_KEY, browserId)
  }
  
  return browserId
}

function BabyMessages() {
  const [messages, setMessages] = useState([])
  const [name, setName] = useState('')
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [loading, setLoading] = useState(true)
  const [clearing, setClearing] = useState(false)
  const [hasMessage, setHasMessage] = useState(false)
  const [userMessage, setUserMessage] = useState(null)
  const submitRef = useRef(false)
  const lastSubmitTimeRef = useRef(0)

  useEffect(() => {
    fetchMessages()
    checkUserMessage()
  }, [])

  const fetchMessages = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/messages`)
      if (response.ok) {
        const data = await response.json()
        setMessages(data.messages || [])
        // Also check if user has a message
        await checkUserMessage()
      }
    } catch (error) {
      console.error('Error fetching messages:', error)
    } finally {
      setLoading(false)
    }
  }

  const checkUserMessage = async () => {
    try {
      const browserId = getBrowserId()
      const response = await fetch(`${API_BASE}/api/messages/check?browserId=${encodeURIComponent(browserId)}`)
      if (response.ok) {
        const data = await response.json()
        if (data.hasMessage) {
          setHasMessage(true)
          setUserMessage(data.message)
        } else {
          setHasMessage(false)
          setUserMessage(null)
        }
      }
    } catch (error) {
      console.error('Error checking user message:', error)
    }
  }

  const handleClearMessage = async () => {
    if (!window.confirm('Are you sure you want to clear your message? You can submit a new one after clearing.')) {
      return
    }

    setClearing(true)

    try {
      const browserId = getBrowserId()
      const response = await fetch(`${API_BASE}/api/messages?browserId=${encodeURIComponent(browserId)}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setHasMessage(false)
        setUserMessage(null)
        await fetchMessages()
        await checkUserMessage()
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
        if (response.status === 404) {
          alert('You haven\'t submitted a message yet.')
        } else {
          alert(errorData.error || 'Failed to clear your message. Please try again.')
        }
      }
    } catch (error) {
      console.error('Error clearing message:', error)
      if (error.message && (error.message.includes('Failed to fetch') || error.message.includes('NetworkError'))) {
        alert('Cannot connect to server. Please make sure you\'re running "npm run dev" to start both servers.')
      } else {
        alert('Failed to clear your message. Please check your connection and try again.')
      }
    } finally {
      setClearing(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    e.stopPropagation() // Prevent event bubbling
    
    const now = Date.now()
    const timeSinceLastSubmit = now - lastSubmitTimeRef.current
    
    // Prevent submissions within 2 seconds of each other
    if (timeSinceLastSubmit < 2000) {
      console.log(`[MESSAGES] Submission blocked - too soon (${timeSinceLastSubmit}ms ago)`)
      return
    }
    
    if (!name.trim() || !message.trim() || submitting) {
      return
    }

    // Set lock immediately
    lastSubmitTimeRef.current = now
    setSubmitting(true)

    // Store the values before clearing to prevent race conditions
    const nameValue = name.trim()
    const messageValue = message.trim()
    const browserId = getBrowserId()
    
    // Create a unique submission ID for this request
    const submissionId = `${now}_${Math.random().toString(36).substring(2, 9)}`

    try {
      console.log(`[MESSAGES] Submitting message from: ${nameValue} [ID: ${submissionId}]`)
      const response = await fetch(`${API_BASE}/api/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          name: nameValue, 
          message: messageValue,
          browserId: browserId,
          submissionId: submissionId // Include submission ID for tracking
        }),
      })

      if (response.ok) {
        const data = await response.json()
        console.log(`[MESSAGES] Message submitted successfully: ${data.message?.id} [Submission ID: ${submissionId}]`)
        // Clear form immediately
        setName('')
        setMessage('')
        // Update user message state
        setHasMessage(true)
        setUserMessage(data.message)
        // Refresh messages from server to ensure consistency
        await fetchMessages()
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
        // If it's a duplicate error, don't show alert, just refresh
        if (errorData.error && errorData.error.includes('Duplicate')) {
          console.log(`[MESSAGES] Duplicate detected, refreshing messages`)
          await fetchMessages()
        } else {
          alert(errorData.error || 'Failed to submit message. Please try again.')
        }
      }
    } catch (error) {
      console.error('Error submitting message:', error)
      if (error.message && (error.message.includes('Failed to fetch') || error.message.includes('NetworkError'))) {
        alert('Cannot connect to server. Please make sure you\'re running "npm run dev" to start both the frontend and backend servers.')
      } else {
        alert(`Failed to submit message: ${error.message || 'Unknown error'}. Please check your connection and try again.`)
      }
    } finally {
      // Add a delay before allowing another submission
      setTimeout(() => {
        setSubmitting(false)
      }, 1000)
    }
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: [0.25, 0.1, 0.25, 1]
      }
    }
  }

  return (
    <section className="baby-messages">
      <div className="messages-content">
        <motion.h2 
          className="section-title"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1, ease: [0.25, 0.1, 0.25, 1] }}
        >
          leave a message for the baby
        </motion.h2>
        <motion.p 
          className="section-subtitle"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          share your love, wishes, and advice for our little one. we'll collect all your messages and put them in a book for baby to treasure forever.
        </motion.p>

        {!hasMessage ? (
          <motion.form 
            className="message-form"
            onSubmit={handleSubmit}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
          <div className="form-group">
            <label htmlFor="name">your name</label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="enter your name"
              required
              disabled={submitting}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="message">your message</label>
            <textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="write your message here..."
              rows="5"
              required
              disabled={submitting}
            />
          </div>

          <motion.button
            type="submit"
            className="submit-button"
            disabled={submitting || !name.trim() || !message.trim()}
            whileHover={!submitting && name.trim() && message.trim() ? { scale: 1.02, y: -2 } : {}}
            whileTap={!submitting && name.trim() && message.trim() ? { scale: 0.98 } : {}}
          >
            {submitting ? 'sending...' : 'send message'}
          </motion.button>
        </motion.form>
        ) : (
          <motion.div
            className="clear-messages-container"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.25 }}
          >
            <motion.button
              className="clear-button"
              onClick={handleClearMessage}
              disabled={clearing}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {clearing ? 'clearing...' : 'clear my message'}
            </motion.button>
            <p className="message-thanks">
              thanks for your message! 🎉
            </p>
          </motion.div>
        )}

        {loading ? (
          <div className="messages-loading">loading messages...</div>
        ) : messages.length === 0 ? (
          <p className="no-messages">no messages yet. be the first to leave one!</p>
        ) : (
          <motion.div 
            className="messages-carousel-container"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <div className={`messages-carousel ${messages.length === 1 ? 'single-message' : ''}`}>
              {messages.length === 1 
                ? [...messages, ...messages].map((msg, index) => (
                    <div
                      key={`${msg.id || index}-${index}`}
                      className="message-card-carousel"
                    >
                      <div className="message-header">
                        <span className="message-name">{msg.name}</span>
                        <span className="message-date">
                          {new Date(msg.timestamp).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </span>
                      </div>
                      <p className="message-text">{msg.message}</p>
                    </div>
                  ))
                : [...messages, ...messages, ...messages].map((msg, index) => (
                    <div
                      key={`${msg.id || index}-${Math.floor(index / messages.length)}`}
                      className="message-card-carousel"
                    >
                      <div className="message-header">
                        <span className="message-name">{msg.name}</span>
                        <span className="message-date">
                          {new Date(msg.timestamp).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </span>
                      </div>
                      <p className="message-text">{msg.message}</p>
                    </div>
                  ))
              }
            </div>
          </motion.div>
        )}
      </div>
    </section>
  )
}

export default BabyMessages

