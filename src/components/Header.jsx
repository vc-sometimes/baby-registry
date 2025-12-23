import React from 'react'
import { motion } from 'framer-motion'
import './Header.css'

function Header() {
  const handleNavClick = (e, target) => {
    e.preventDefault()
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
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

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
        <nav className="nav">
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
      </div>
    </motion.header>
  )
}

export default Header

