import React from 'react'
import { motion } from 'framer-motion'
import LanguageToggle from './LanguageToggle'
import './Header.css'

function Header() {
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
        <motion.div 
          className="logo" 
          onClick={handleLogoClick} 
          style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <img 
            src="/images/cr-i-panda.svg" 
            alt="Buba" 
            style={{ width: '24px', height: '24px' }}
          />
          <span>buba</span>
        </motion.div>
        
        <LanguageToggle />
      </div>
    </motion.header>
  )
}

export default Header

