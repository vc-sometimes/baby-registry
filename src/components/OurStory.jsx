import React from 'react'
import { motion } from 'framer-motion'
import './OurStory.css'

function OurStory() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  }

  const textVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.8,
        ease: [0.25, 0.1, 0.25, 1]
      }
    }
  }

  return (
    <motion.section 
      id="about" 
      className="our-story"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      variants={containerVariants}
    >
      <motion.div 
        className="parallax-background"
        animate={{
          y: [0, -20, 0],
          scale: [1, 1.02, 1]
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      <div className="story-content">
        <div className="story-text">
          <motion.h2 
            className="section-title"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1, ease: [0.25, 0.1, 0.25, 1] }}
          >
            our story
          </motion.h2>
          <motion.div 
            className="story-body"
            variants={containerVariants}
          >
            <motion.p className="story-intro" variants={textVariants}>
              it sounds cliche but we fell in love at first sight (shoutout hinge). we knew from day one that we wanted to be in each others lives, and on our second date we were already talking about how many kids we'd have and what we would name them.
            </motion.p>
            <motion.p className="story-details" variants={textVariants}>
              little did we know that a little surprise was awaiting us only four months later!! while we were both shocked, we couldn't have been happier about our little buba.
            </motion.p>
            <motion.p className="story-closing" variants={textVariants}>
              buba comes from baba, russian for baby, but brisa didn't want to call our baby that because it's also spanish for saliva. so she changed a letter and now baby is not drool baby is cool.
            </motion.p>
          </motion.div>
        </div>
      </div>
    </motion.section>
  )
}

export default OurStory

