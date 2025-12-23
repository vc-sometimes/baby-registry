import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import './GenderVote.css'

// Normalize API base URL - remove trailing slash to prevent double slashes
const getApiBase = () => {
  const base = import.meta.env.VITE_API_URL || ''
  return base.replace(/\/+$/, '') // Remove trailing slashes
}
const API_BASE = getApiBase()

function GenderVote() {
  const [boyVotes, setBoyVotes] = useState(0)
  const [girlVotes, setGirlVotes] = useState(0)
  const [userVote, setUserVote] = useState(null)
  const [hasVoted, setHasVoted] = useState(false)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [clearing, setClearing] = useState(false)

  useEffect(() => {
    // Load votes and check if user has voted
    const fetchVotes = async () => {
      try {
        const [votesResponse, checkResponse] = await Promise.all([
          fetch(`${API_BASE}/api/votes`),
          fetch(`${API_BASE}/api/votes/check`)
        ])

        if (votesResponse.ok) {
          const votesData = await votesResponse.json()
          setBoyVotes(votesData.boy)
          setGirlVotes(votesData.girl)
        }

        if (checkResponse.ok) {
          const checkData = await checkResponse.json()
          if (checkData.hasVoted) {
            setHasVoted(true)
            setUserVote(checkData.voteType)
          }
        }
      } catch (error) {
        console.error('Error fetching votes:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchVotes()
  }, [])

  const handleVote = async (vote) => {
    if (hasVoted || submitting) return

    setSubmitting(true)

    try {
      const response = await fetch(`${API_BASE}/api/votes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ voteType: vote }),
      })

      if (response.ok) {
        const data = await response.json()
        setBoyVotes(data.boy)
        setGirlVotes(data.girl)
        setUserVote(vote)
        setHasVoted(true)
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
        // If user already voted, update the counts but don't show error
        if (response.status === 400 && errorData.boy !== undefined) {
          setBoyVotes(errorData.boy)
          setGirlVotes(errorData.girl)
          setHasVoted(true)
          setUserVote(errorData.voteType || vote)
        } else {
          console.error('Vote error:', errorData)
          alert(errorData.error || 'Failed to submit vote. Please try again.')
        }
      }
    } catch (error) {
      console.error('Error submitting vote:', error)
      // More helpful error message
      if (error.message && (error.message.includes('Failed to fetch') || error.message.includes('NetworkError'))) {
        alert('Cannot connect to server. Please make sure you\'re running "npm run dev" (not just "vite") to start both the frontend and backend servers.')
      } else {
        alert('Failed to submit vote. Please check your connection and try again.')
      }
    } finally {
      setSubmitting(false)
    }
  }

  const handleClearVote = async () => {
    if (!window.confirm('Are you sure you want to clear your vote? You can vote again after clearing.')) {
      return
    }

    setClearing(true)

    try {
      const response = await fetch(`${API_BASE}/api/votes`, {
        method: 'DELETE',
      })

      if (response.ok) {
        const data = await response.json()
        setBoyVotes(data.boy)
        setGirlVotes(data.girl)
        setUserVote(null)
        setHasVoted(false)
        // Clear localStorage as well
        localStorage.removeItem('genderVote')
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
        if (response.status === 404) {
          alert('You haven\'t voted yet.')
        } else {
          alert(errorData.error || 'Failed to clear your vote. Please try again.')
        }
      }
    } catch (error) {
      console.error('Error clearing vote:', error)
      if (error.message && (error.message.includes('Failed to fetch') || error.message.includes('NetworkError'))) {
        alert('Cannot connect to server. Please make sure you\'re running "npm run dev" to start both servers.')
      } else {
        alert('Failed to clear your vote. Please check your connection and try again.')
      }
    } finally {
      setClearing(false)
    }
  }

  const totalVotes = boyVotes + girlVotes
  const boyPercentage = totalVotes > 0 ? Math.round((boyVotes / totalVotes) * 100) : 0
  const girlPercentage = totalVotes > 0 ? Math.round((girlVotes / totalVotes) * 100) : 0

  return (
    <section className="gender-vote">
      <div className="gender-vote-content">
        <h2 className="section-title">
          what do you think?
        </h2>
        <p className="vote-subtitle">
          cast your vote for baby's gender
        </p>

        {hasVoted && (
          <motion.div
            className="clear-votes-container"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.25 }}
          >
            <motion.button
              className="clear-button"
              onClick={handleClearVote}
              disabled={clearing}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {clearing ? 'clearing...' : 'clear my vote'}
            </motion.button>
          </motion.div>
        )}

        {loading ? (
          <div className="vote-loading">loading votes...</div>
        ) : (
          <VoteButtons 
            userVote={userVote}
            hasVoted={hasVoted}
            submitting={submitting}
            handleVote={handleVote}
          />
        )}

        {totalVotes > 0 && (
          <div className="vote-results">
            <div className="results-header">
              <span className="total-votes">{totalVotes} {totalVotes === 1 ? 'vote' : 'votes'}</span>
            </div>
            
            <div className="results-bars">
              <div className="result-bar">
                <div className="bar-label">
                  <span>boy</span>
                  <span className="bar-percentage">{boyPercentage}%</span>
                </div>
                <div className="bar-container">
                  <motion.div 
                    className="bar-fill bar-boy"
                    initial={{ width: 0 }}
                    whileInView={{ width: `${boyPercentage}%` }}
                    viewport={{ once: true }}
                    transition={{ duration: 1, delay: 0.7, ease: [0.25, 0.1, 0.25, 1] }}
                  />
                </div>
                <span className="bar-count">{boyVotes}</span>
              </div>

              <div className="result-bar">
                <div className="bar-label">
                  <span>girl</span>
                  <span className="bar-percentage">{girlPercentage}%</span>
                </div>
                <div className="bar-container">
                  <motion.div 
                    className="bar-fill bar-girl"
                    initial={{ width: 0 }}
                    whileInView={{ width: `${girlPercentage}%` }}
                    viewport={{ once: true }}
                    transition={{ duration: 1, delay: 0.7, ease: [0.25, 0.1, 0.25, 1] }}
                  />
                </div>
                <span className="bar-count">{girlVotes}</span>
              </div>
            </div>
          </div>
        )}

        {hasVoted && (
          <p className="vote-thanks">
            thanks for voting! 🎉
          </p>
        )}
      </div>
    </section>
  )
}

function VoteButtons({ userVote, hasVoted, submitting, handleVote }) {
  const [boyMousePosition, setBoyMousePosition] = useState({ x: 0, y: 0 })
  const [girlMousePosition, setGirlMousePosition] = useState({ x: 0, y: 0 })
  const [boyHovered, setBoyHovered] = useState(false)
  const [girlHovered, setGirlHovered] = useState(false)

  const handleBoyMouseMove = (e) => {
    if (hasVoted || submitting) return
    const button = e.currentTarget
    const rect = button.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    
    const centerX = rect.width / 2
    const centerY = rect.height / 2
    
    const rotateX = ((y - centerY) / centerY) * -10
    const rotateY = ((x - centerX) / centerX) * 10
    
    setBoyMousePosition({ x: rotateY, y: rotateX })
  }

  const handleGirlMouseMove = (e) => {
    if (hasVoted || submitting) return
    const button = e.currentTarget
    const rect = button.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    
    const centerX = rect.width / 2
    const centerY = rect.height / 2
    
    const rotateX = ((y - centerY) / centerY) * -10
    const rotateY = ((x - centerX) / centerX) * 10
    
    setGirlMousePosition({ x: rotateY, y: rotateX })
  }

  const handleBoyMouseLeave = () => {
    setBoyMousePosition({ x: 0, y: 0 })
    setBoyHovered(false)
  }

  const handleGirlMouseLeave = () => {
    setGirlMousePosition({ x: 0, y: 0 })
    setGirlHovered(false)
  }

  const handleBoyMouseEnter = () => {
    if (!hasVoted && !submitting) {
      setBoyHovered(true)
    }
  }

  const handleGirlMouseEnter = () => {
    if (!hasVoted && !submitting) {
      setGirlHovered(true)
    }
  }

  const handleClearVotes = async () => {
    if (!window.confirm('Are you sure you want to clear all votes? This cannot be undone.')) {
      return
    }

    setClearing(true)

    try {
      const response = await fetch(`${API_BASE}/api/votes`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setVotes({ boy: 0, girl: 0, total: 0 })
        setUserVote(null)
        // Clear localStorage as well
        localStorage.removeItem('genderVote')
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
        alert(errorData.error || 'Failed to clear votes. Please try again.')
      }
    } catch (error) {
      console.error('Error clearing votes:', error)
      if (error.message && (error.message.includes('Failed to fetch') || error.message.includes('NetworkError'))) {
        alert('Cannot connect to server. Please make sure you\'re running "npm run dev" to start both servers.')
      } else {
        alert('Failed to clear votes. Please check your connection and try again.')
      }
    } finally {
      setClearing(false)
    }
  }

  return (
    <div className="vote-buttons">
      <motion.button
        className={`vote-button vote-boy ${userVote === 'boy' ? 'selected' : ''} ${hasVoted && userVote !== 'boy' ? 'disabled' : ''} ${submitting ? 'submitting' : ''}`}
        onClick={() => handleVote('boy')}
        disabled={hasVoted || submitting}
        onMouseMove={handleBoyMouseMove}
        onMouseLeave={handleBoyMouseLeave}
        onMouseEnter={handleBoyMouseEnter}
        animate={{
          rotateX: boyMousePosition.y,
          rotateY: boyMousePosition.x,
          y: boyHovered && !hasVoted && !submitting ? -8 : 0,
          transition: { type: "spring", stiffness: 300, damping: 20 }
        }}
        whileTap={!hasVoted && !submitting ? { scale: 0.98 } : {}}
      >
        <span className="vote-emoji">👦🏽</span>
        <span className="vote-label">boy</span>
      </motion.button>

      <motion.button
        className={`vote-button vote-girl ${userVote === 'girl' ? 'selected' : ''} ${hasVoted && userVote !== 'girl' ? 'disabled' : ''} ${submitting ? 'submitting' : ''}`}
        onClick={() => handleVote('girl')}
        disabled={hasVoted || submitting}
        onMouseMove={handleGirlMouseMove}
        onMouseLeave={handleGirlMouseLeave}
        onMouseEnter={handleGirlMouseEnter}
        animate={{
          rotateX: girlMousePosition.y,
          rotateY: girlMousePosition.x,
          y: girlHovered && !hasVoted && !submitting ? -8 : 0,
          transition: { type: "spring", stiffness: 300, damping: 20 }
        }}
        whileTap={!hasVoted && !submitting ? { scale: 0.98 } : {}}
      >
        <span className="vote-emoji">👧🏽</span>
        <span className="vote-label">girl</span>
      </motion.button>
    </div>
  )
}

export default GenderVote

