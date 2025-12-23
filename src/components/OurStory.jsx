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
              every great story begins with a moment. ours started with a simple hello, 
              a shared laugh, and the kind of connection that makes everything else fade away.
            </motion.p>
            <motion.p className="story-details" variants={textVariants}>
              through seasons of growth, adventures big and small, and countless moments 
              of choosing each other, we've built something beautiful together. now, 
              we're embarking on our greatest adventure yet—welcoming our little one 
              into this world.
            </motion.p>
            <motion.p className="story-closing" variants={textVariants}>
              this registry is more than a list of things; it's a collection of hopes, 
              dreams, and the love we can't wait to share.
            </motion.p>
          </motion.div>
        </div>
      </div>
    </motion.section>
  )
}

export default OurStory

