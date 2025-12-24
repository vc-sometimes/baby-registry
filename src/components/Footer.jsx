import React, { useState, useEffect } from 'react'
import './Footer.css'

// Normalize API base URL
const getApiBase = () => {
  const base = import.meta.env.VITE_API_URL || ''
  return base.replace(/\/+$/, '')
}
const API_BASE = getApiBase()

function Footer() {
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    checkAdminStatus()
    // Listen for admin status changes from other components
    const handleStorageChange = () => {
      checkAdminStatus()
    }
    window.addEventListener('storage', handleStorageChange)
    // Also check periodically in case localStorage was updated in same window
    const interval = setInterval(checkAdminStatus, 1000)
    return () => {
      window.removeEventListener('storage', handleStorageChange)
      clearInterval(interval)
    }
  }, [])

  const checkAdminStatus = () => {
    const adminKey = localStorage.getItem('babyRegistryAdminKey')
    setIsAdmin(!!adminKey)
  }

  const handleAdminLogin = async () => {
    const email = prompt('Enter admin email:')
    if (!email) return
    
    const password = prompt('Enter admin password:')
    if (!password) return

    try {
      const response = await fetch(`${API_BASE}/api/admin/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()
      if (data.success) {
        localStorage.setItem('babyRegistryAdminKey', data.adminKey)
        setIsAdmin(true)
        // Dispatch custom event to notify other components
        window.dispatchEvent(new Event('adminStatusChanged'))
        alert('Admin access granted')
      } else {
        alert(data.error || 'Invalid email or password')
      }
    } catch (error) {
      console.error('Error logging in:', error)
      alert('Failed to authenticate. Please try again.')
    }
  }

  const handleAdminLogout = () => {
    localStorage.removeItem('babyRegistryAdminKey')
    setIsAdmin(false)
    window.dispatchEvent(new Event('adminStatusChanged'))
    alert('Logged out')
  }

  return (
    <footer className="footer">
      <div className="footer-content">
        <p className="footer-text">
          with love and gratitude<br />
          <span className="footer-names">brisa & v.c.</span>
        </p>
        <div className="footer-divider"></div>
        <p className="footer-year">
          <span>2025</span>
          <span className="footer-birth-year">baby arriving 2026</span>
          <span className="footer-credit">front-end and back-end done by v.c.</span>
        </p>
        <p className="footer-konami">
          ↑ ↑ ↓ ↓ ← → ← → B A
        </p>
        <div className="footer-admin">
          {isAdmin ? (
            <button className="admin-logout-button" onClick={handleAdminLogout}>
              Admin Logout
            </button>
          ) : (
            <button className="admin-login-button" onClick={handleAdminLogin}>
              Admin Login
            </button>
          )}
        </div>
      </div>
    </footer>
  )
}

export default Footer

