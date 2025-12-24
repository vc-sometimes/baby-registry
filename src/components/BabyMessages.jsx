import React, { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { useLanguage } from '../contexts/LanguageContext'
import translations from '../translations'
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
  const { language } = useLanguage()
  const t = translations[language]
  const [messages, setMessages] = useState([])
  const [name, setName] = useState('')
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [loading, setLoading] = useState(true)
  const [clearing, setClearing] = useState(false)
  const [hasMessage, setHasMessage] = useState(false)
  const [userMessage, setUserMessage] = useState(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const submitRef = useRef(false)
  const lastSubmitTimeRef = useRef(0)

  useEffect(() => {
    fetchMessages()
    checkUserMessage()
    checkAdminStatus()
    
    // Listen for admin status changes from footer
    const handleAdminStatusChange = () => {
      checkAdminStatus()
    }
    window.addEventListener('adminStatusChanged', handleAdminStatusChange)
    // Also check periodically in case localStorage was updated
    const interval = setInterval(checkAdminStatus, 1000)
    
    return () => {
      window.removeEventListener('adminStatusChanged', handleAdminStatusChange)
      clearInterval(interval)
    }
  }, [])

  const checkAdminStatus = () => {
    const adminKey = localStorage.getItem('babyRegistryAdminKey')
    setIsAdmin(!!adminKey)
  }

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

  const handleDeleteMessage = async (messageId) => {
    if (!isAdmin) {
      alert('Admin access required to delete messages.')
      return
    }

    if (!window.confirm('Are you sure you want to delete this message?')) {
      return
    }

    try {
      const adminKey = localStorage.getItem('babyRegistryAdminKey')
      const response = await fetch(`${API_BASE}/api/messages/${messageId}?adminKey=${encodeURIComponent(adminKey)}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        await fetchMessages()
        // Also check if the deleted message was the user's own message
        await checkUserMessage()
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
        if (response.status === 403) {
          alert('Unauthorized: Admin access required')
          setIsAdmin(false)
          localStorage.removeItem('babyRegistryAdminKey')
        } else {
          alert(errorData.error || 'Failed to delete message. Please try again.')
        }
      }
    } catch (error) {
      console.error('Error deleting message:', error)
      alert('Failed to delete message. Please check your connection and try again.')
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
          {t.messagesTitle}
        </motion.h2>
        <motion.p 
          className="section-subtitle"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          {t.messagesSubtitle}
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
            <label htmlFor="name">{t.messageNameLabel}</label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t.messageNamePlaceholder}
              required
              disabled={submitting}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="message">{t.messageTextLabel}</label>
            <textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={t.messageTextPlaceholder}
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
            {submitting ? t.messageSending : t.messageSend}
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
              {clearing ? t.messageClearing : t.messageClear}
            </motion.button>
            <p className="message-thanks">
              {t.messageThanks}
            </p>
          </motion.div>
        )}

        {loading ? (
          <div className="messages-loading">{t.messageLoading}</div>
        ) : messages.length === 0 ? (
          <p className="no-messages">{t.messageNoMessages}</p>
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
                        <div className="message-header-right">
                          <span className="message-date">
                            {new Date(msg.timestamp).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </span>
                          {isAdmin && (
                            <button
                              className="delete-message-button"
                              onClick={() => handleDeleteMessage(msg.id)}
                              title="Delete message"
                              aria-label="Delete message"
                            >
                              ×
                            </button>
                          )}
                        </div>
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
                        <div className="message-header-right">
                          <span className="message-date">
                            {new Date(msg.timestamp).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </span>
                          {isAdmin && (
                            <button
                              className="delete-message-button"
                              onClick={() => handleDeleteMessage(msg.id)}
                              title="Delete message"
                              aria-label="Delete message"
                            >
                              ×
                            </button>
                          )}
                        </div>
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

