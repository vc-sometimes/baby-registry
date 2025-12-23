import React, { useState } from 'react'
import { motion } from 'framer-motion'
import './Registries.css'

function Registries() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.6,
        ease: [0.25, 0.1, 0.25, 1]
      }
    }
  }


  const registries = [
    {
      name: 'target',
      description: 'essentials and everyday items',
      url: '#',
      color: '#CC0000',
      logo: 'https://cdn.simpleicons.org/target/CC0000',
    },
    {
      name: 'amazon',
      description: 'wide selection of baby gear',
      url: '#',
      color: '#FF9900',
      logo: 'https://cdn.simpleicons.org/amazon/FF9900',
    },
    {
      name: 'babylist',
      description: 'universal baby registry',
      url: '#',
      color: '#0066CC',
      logo: 'https://www.babylist.com/favicon-32x32.png',
    },
  ]

  return (
    <motion.section 
      id="registries" 
      className="registries"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      variants={containerVariants}
    >
      <div className="registries-content">
        <motion.h2 
          className="section-title"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1, ease: [0.25, 0.1, 0.25, 1] }}
        >
          registries
        </motion.h2>
        <motion.p 
          className="section-subtitle"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          we're so grateful for your love and support. here are our registries 
          if you'd like to help us prepare for our little one's arrival.
        </motion.p>
        <motion.div 
          className="registry-cards"
          variants={containerVariants}
        >
          {registries.map((registry, index) => {
            const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
            const [isHovered, setIsHovered] = useState(false)

            const handleMouseMove = (e) => {
              const card = e.currentTarget
              const rect = card.getBoundingClientRect()
              const x = e.clientX - rect.left
              const y = e.clientY - rect.top
              
              const centerX = rect.width / 2
              const centerY = rect.height / 2
              
              const rotateX = ((y - centerY) / centerY) * -10
              const rotateY = ((x - centerX) / centerX) * 10
              
              setMousePosition({ x: rotateY, y: rotateX })
            }

            const handleMouseLeave = () => {
              setMousePosition({ x: 0, y: 0 })
              setIsHovered(false)
            }

            const handleMouseEnter = () => {
              setIsHovered(true)
            }

            return (
              <motion.a
                key={index}
                href={registry.url}
                className="registry-card"
                style={{ '--card-color': registry.color }}
                variants={itemVariants}
                target="_blank"
                rel="noopener noreferrer"
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
                onMouseEnter={handleMouseEnter}
                animate={{
                  rotateX: mousePosition.y,
                  rotateY: mousePosition.x,
                  y: isHovered ? -8 : 0,
                  transition: { type: "spring", stiffness: 300, damping: 20 }
                }}
                whileTap={{ scale: 0.98 }}
              >
              <div className="card-content">
                <h3 className="registry-name">{registry.name}</h3>
              </div>
              <div className="card-background-shine"></div>
            </motion.a>
            )
          })}
        </motion.div>
      </div>
    </motion.section>
  )
}

export default Registries

