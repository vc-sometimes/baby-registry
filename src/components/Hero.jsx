import React, { useRef, useState, useEffect } from 'react'
import { motion, useScroll, useTransform, useMotionValue, useSpring, useMotionTemplate } from 'framer-motion'
import { useLanguage } from '../contexts/LanguageContext'
import translations from '../translations'
import './Hero.css'

function Hero() {
  const { language } = useLanguage()
  const t = translations[language]
  const heroRef = useRef(null)
  const imageRef = useRef(null)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [isHovered, setIsHovered] = useState(false)
  
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"]
  })

  const backgroundY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"])
  const titleY = useTransform(scrollYProgress, [0, 1], ["0%", "15%"])
  const imageY = useTransform(scrollYProgress, [0, 1], ["0%", "-10%"])
  const textY = useTransform(scrollYProgress, [0, 1], ["0%", "-10%"])

  // Magnetic mouse effect with spring physics
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)
  const springConfig = { damping: 20, stiffness: 150 }
  const x = useSpring(mouseX, springConfig)
  const y = useSpring(mouseY, springConfig)
  
  // 3D tilt transforms
  const rotateX = useTransform(y, [-50, 50], [8, -8], { clamp: true })
  const rotateY = useTransform(x, [-50, 50], [-8, 8], { clamp: true })
  
  // Dynamic lighting based on rotation - light comes from opposite side of tilt
  const lightX = useTransform(rotateY, [-8, 8], [80, 20])
  const lightY = useTransform(rotateX, [-8, 8], [20, 80])
  
  // Shadow positions (opposite of light)
  const shadowX = useTransform(lightX, (x) => 100 - x)
  const shadowY = useTransform(lightY, (y) => 100 - y)
  
  // Create dynamic gradient strings using useMotionTemplate
  const lightingGradient = useMotionTemplate`radial-gradient(circle at ${lightX}% ${lightY}%, rgba(255, 255, 255, 0.4) 0%, rgba(255, 255, 255, 0.1) 30%, transparent 60%)`
  const shadowGradient = useMotionTemplate`radial-gradient(circle at ${shadowX}% ${shadowY}%, rgba(0, 0, 0, 0.3) 0%, rgba(0, 0, 0, 0.1) 30%, transparent 60%)`

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!imageRef.current) return
      const rect = imageRef.current.getBoundingClientRect()
      const centerX = rect.left + rect.width / 2
      const centerY = rect.top + rect.height / 2
      
      const moveX = (e.clientX - centerX) * 0.15
      const moveY = (e.clientY - centerY) * 0.15
      
      mouseX.set(moveX)
      mouseY.set(moveY)
      setMousePosition({ x: moveX, y: moveY })
    }

    if (isHovered) {
      window.addEventListener('mousemove', handleMouseMove)
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
    }
  }, [isHovered, mouseX, mouseY])

  const handleMouseLeave = () => {
    setIsHovered(false)
    mouseX.set(0)
    mouseY.set(0)
  }

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
              ref={imageRef}
              className="image-placeholder"
              style={{ 
                y: imageY,
                x: x,
                rotateX: rotateX,
                rotateY: rotateY,
              }}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, delay: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={handleMouseLeave}
              whileHover={{ scale: 1.02 }}
            >
              <img 
                src="/images/photo4.jpg" 
                alt="Hero photo"
                className="hero-photo"
              />
              <motion.div 
                className="dynamic-lighting"
                style={{
                  background: lightingGradient
                }}
              />
              <motion.div 
                className="dynamic-shadow"
                style={{
                  background: shadowGradient
                }}
              />
              <div className="particle-container">
                {[...Array(20)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="particle"
                    initial={{ 
                      x: Math.random() * 100 + '%',
                      y: Math.random() * 100 + '%',
                      opacity: 0
                    }}
                    animate={{
                      y: [null, (Math.random() - 0.5) * 100 + '%'],
                      x: [null, (Math.random() - 0.5) * 50 + '%'],
                      opacity: [0, 0.6, 0],
                    }}
                    transition={{
                      duration: 3 + Math.random() * 2,
                      repeat: Infinity,
                      delay: Math.random() * 2,
                      ease: "easeInOut"
                    }}
                  />
                ))}
              </div>
              <div className="lens-flare"></div>
              <div className="glow-effect"></div>
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

