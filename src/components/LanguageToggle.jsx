import React from 'react'
import { useLanguage } from '../contexts/LanguageContext'
import { motion } from 'framer-motion'
import './LanguageToggle.css'

function LanguageToggle() {
  const { language, toggleLanguage } = useLanguage()

  return (
    <motion.button
      className="language-toggle"
      onClick={toggleLanguage}
      aria-label="Toggle language"
      whileTap={{ scale: 0.95 }}
    >
      <span className={language === 'en' ? 'active' : ''}>english</span>
      <span className="separator">/</span>
      <span className={`es-text ${language === 'es' ? 'active' : ''}`}>español</span>
    </motion.button>
  )
}

export default LanguageToggle

