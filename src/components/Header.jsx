import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import './Header.css'

function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const handleNavClick = (e, target) => {
    e.preventDefault()
    setIsMobileMenuOpen(false) // Close mobile menu when clicking a link
    
    if (target === 'about') {
      const storySection = document.querySelector('.our-story')
      if (storySection) {
        storySection.scrollIntoView({ behavior: 'smooth' })
      }
    } else if (target === 'registries') {
      const registriesSection = document.querySelector('.registries')
      if (registriesSection) {
        registriesSection.scrollIntoView({ behavior: 'smooth' })
      }
    } else if (target === 'vote') {
      const voteSection = document.querySelector('.gender-vote')
      if (voteSection) {
        voteSection.scrollIntoView({ behavior: 'smooth' })
      }
    } else if (target === 'message') {
      const messageSection = document.querySelector('.baby-messages')
      if (messageSection) {
        messageSection.scrollIntoView({ behavior: 'smooth' })
      }
    }
  }

  const handleLogoClick = (e) => {
    e.preventDefault()
    setIsMobileMenuOpen(false)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (isMobileMenuOpen && !e.target.closest('.header-container') && !e.target.closest('.mobile-menu')) {
        setIsMobileMenuOpen(false)
      }
    }

    if (isMobileMenuOpen) {
      document.addEventListener('click', handleClickOutside)
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }

    return () => {
      document.removeEventListener('click', handleClickOutside)
      document.body.style.overflow = ''
    }
  }, [isMobileMenuOpen])

  return (
    <motion.header 
      className="header"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
    >
      <div className="header-container">
        <motion.p 
          className="logo" 
          onClick={handleLogoClick} 
          style={{ cursor: 'pointer' }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          buba
        </motion.p>
        
        {/* Desktop Navigation */}
        <nav className="nav desktop-nav">
          <motion.a 
            href="#about" 
            className="nav-link" 
            onClick={(e) => handleNavClick(e, 'about')}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            about
          </motion.a>
          <motion.a 
            href="#registries" 
            className="nav-link" 
            onClick={(e) => handleNavClick(e, 'registries')}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            registries
          </motion.a>
          <motion.a 
            href="#vote" 
            className="nav-link" 
            onClick={(e) => handleNavClick(e, 'vote')}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            cast a vote
          </motion.a>
          <motion.a 
            href="#message" 
            className="nav-link" 
            onClick={(e) => handleNavClick(e, 'message')}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            leave a message for the baby
          </motion.a>
        </nav>

        {/* Hamburger Button */}
        <button 
          className={`hamburger ${isMobileMenuOpen ? 'active' : ''}`}
          onClick={toggleMobileMenu}
          aria-label="Toggle menu"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              className="mobile-menu-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              onClick={() => setIsMobileMenuOpen(false)}
            />
            <motion.nav
              className="mobile-menu"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            >
              <motion.a 
                href="#about" 
                className="mobile-nav-link" 
                onClick={(e) => handleNavClick(e, 'about')}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
              >
                about
              </motion.a>
              <motion.a 
                href="#registries" 
                className="mobile-nav-link" 
                onClick={(e) => handleNavClick(e, 'registries')}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.15 }}
              >
                registries
              </motion.a>
              <motion.a 
                href="#vote" 
                className="mobile-nav-link" 
                onClick={(e) => handleNavClick(e, 'vote')}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                cast a vote
              </motion.a>
              <motion.a 
                href="#message" 
                className="mobile-nav-link" 
                onClick={(e) => handleNavClick(e, 'message')}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.25 }}
              >
                leave a message for the baby
              </motion.a>
            </motion.nav>
          </>
        )}
      </AnimatePresence>
    </motion.header>
  )
}

export default Header

