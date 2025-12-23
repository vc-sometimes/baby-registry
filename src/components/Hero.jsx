import React, { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { useLanguage } from '../contexts/LanguageContext'
import translations from '../translations'
import './Hero.css'

function Hero() {
  const { language } = useLanguage()
  const t = translations[language]
  const heroRef = useRef(null)
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"]
  })

  const backgroundY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"])
  const titleY = useTransform(scrollYProgress, [0, 1], ["0%", "15%"])
  const imageY = useTransform(scrollYProgress, [0, 1], ["0%", "-10%"])
  const textY = useTransform(scrollYProgress, [0, 1], ["0%", "-10%"])

  const handleRegistriesClick = (e) => {
    e.preventDefault()
    const registriesSection = document.querySelector('.registries')
    if (registriesSection) {
      registriesSection.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <section ref={heroRef} className="hero">
      <motion.div 
        className="hero-parallax-bg hero-bg-layer-1"
        style={{ y: backgroundY }}
      />

      <div className="hero-container">
        <motion.div 
          className="hero-title"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.2, ease: [0.25, 0.1, 0.25, 1] }}
        >
          <motion.h1 
            style={{ y: titleY }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.2 }}
            className={language === 'es' ? 'hero-title-spanish' : ''}
          >
            {t.heroTitle}
          </motion.h1>
        </motion.div>
        
        <motion.div 
          className="hero-content"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
        >
          <div className="hero-left">
            <motion.div 
              className="image-placeholder"
              style={{ y: imageY }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 0.5 }}
            >
              <img 
                src="/images/photo4.jpg" 
                alt="Hero photo"
                className="hero-photo"
              />
            </motion.div>
          </div>
          <motion.div 
            className="hero-right"
            style={{ y: textY }}
          >
            <motion.h2 
              className="content-header"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.5 }}
            >
              {t.heroSubtitle}
            </motion.h2>
            <motion.p 
              className="announcement"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.7 }}
            >
              {t.heroAnnouncement}
            </motion.p>
            <motion.button 
              className="registries-button" 
              onClick={handleRegistriesClick}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.9 }}
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
            >
              {t.heroButton}
            </motion.button>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}

export default Hero

