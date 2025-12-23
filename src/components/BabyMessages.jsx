import React, { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import './BabyMessages.css'

// Normalize API base URL - remove trailing slash to prevent double slashes
const getApiBase = () => {
  const base = import.meta.env.VITE_API_URL || ''
  return base.replace(/\/+$/, '') // Remove trailing slashes
}
const API_BASE = getApiBase()

function BabyMessages() {
  const [messages, setMessages] = useState([])
  const [name, setName] = useState('')
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [loading, setLoading] = useState(true)
  const [clearing, setClearing] = useState(false)
  const submitRef = useRef(false)

  useEffect(() => {
    fetchMessages()
  }, [])

  const fetchMessages = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/messages`)
      if (response.ok) {
        const data = await response.json()
        setMessages(data.messages || [])
      }
    } catch (error) {
      console.error('Error fetching messages:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleClearMessages = async () => {
    if (!window.confirm('Are you sure you want to clear all messages? This cannot be undone.')) {
      return
    }

    setClearing(true)

    try {
      const response = await fetch(`${API_BASE}/api/messages`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setMessages([])
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
        alert(errorData.error || 'Failed to clear messages. Please try again.')
      }
    } catch (error) {
      console.error('Error clearing messages:', error)
      if (error.message && (error.message.includes('Failed to fetch') || error.message.includes('NetworkError'))) {
        alert('Cannot connect to server. Please make sure you\'re running "npm run dev" to start both servers.')
      } else {
        alert('Failed to clear messages. Please check your connection and try again.')
      }
    } finally {
      setClearing(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!name.trim() || !message.trim() || submitting || submitRef.current) return

    // Prevent double submission
    submitRef.current = true
    setSubmitting(true)

    try {
      const response = await fetch(`${API_BASE}/api/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: name.trim(), message: message.trim() }),
      })

      if (response.ok) {
        const data = await response.json()
        // Refresh messages from server to ensure consistency
        await fetchMessages()
        setName('')
        setMessage('')
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
        alert(errorData.error || 'Failed to submit message. Please try again.')
      }
    } catch (error) {
      console.error('Error submitting message:', error)
      if (error.message && (error.message.includes('Failed to fetch') || error.message.includes('NetworkError'))) {
        alert('Cannot connect to server. Please make sure you\'re running "npm run dev" to start both the frontend and backend servers.')
      } else {
        alert(`Failed to submit message: ${error.message || 'Unknown error'}. Please check your connection and try again.`)
      }
    } finally {
      setSubmitting(false)
      submitRef.current = false
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

        {messages.length > 0 && (
          <motion.div
            className="clear-messages-container"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.25 }}
          >
            <motion.button
              className="clear-button"
              onClick={handleClearMessages}
              disabled={clearing}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {clearing ? 'clearing...' : 'clear all messages'}
            </motion.button>
          </motion.div>
        )}

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
            disabled={submitting || submitRef.current || !name.trim() || !message.trim()}
            whileHover={!submitting && !submitRef.current ? { scale: 1.02, y: -2 } : {}}
            whileTap={!submitting && !submitRef.current ? { scale: 0.98 } : {}}
          >
            {submitting ? 'sending...' : 'send message'}
          </motion.button>
        </motion.form>

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

