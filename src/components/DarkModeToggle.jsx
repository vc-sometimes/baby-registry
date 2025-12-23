import React from 'react'
import { useTheme } from '../contexts/ThemeContext'
import { motion } from 'framer-motion'
import './DarkModeToggle.css'

function DarkModeToggle() {
  const { isDark, toggleTheme } = useTheme()

  return (
    <motion.button
      className="dark-mode-toggle"
      onClick={toggleTheme}
      aria-label="Toggle dark mode"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <motion.div
        className="toggle-track"
        animate={{
          backgroundColor: isDark ? '#8B6F47' : '#E8DFD0'
        }}
        transition={{ duration: 0.3 }}
      >
        <motion.div
          className="toggle-thumb"
          animate={{
            x: isDark ? 24 : 0,
            backgroundColor: isDark ? '#3E2723' : '#FFFFFF'
          }}
          transition={{
            type: "spring",
            stiffness: 500,
            damping: 30
          }}
        >
          {isDark ? '🌙' : '☀️'}
        </motion.div>
      </motion.div>
    </motion.button>
  )
}

export default DarkModeToggle

