import React from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import './BabyJourney.css'

function BabyJourney() {
  const sectionRef = React.useRef(null)
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"]
  })

  const backgroundY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"])
  const imageY = useTransform(scrollYProgress, [0, 1], ["0%", "-20%"])

  return (
    <section ref={sectionRef} className="baby-journey">
      <motion.div 
        className="journey-background"
        style={{ y: backgroundY }}
      />
      <div className="journey-content">
        <motion.div 
          className="journey-image-wrapper"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1, ease: [0.25, 0.1, 0.25, 1] }}
        >
          <motion.div 
            className="journey-image"
            style={{ y: imageY }}
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.3 }}
          >
            <img 
              src="/images/photo2.jpg" 
              alt="Baby journey photo"
              className="journey-photo"
            />
          </motion.div>
        </motion.div>
        <motion.div 
          className="journey-quote"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1, delay: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
        >
          <motion.blockquote 
            className="quote-text"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.5 }}
          >
            this baby won't stop kicking me
          </motion.blockquote>
          <motion.p 
            className="quote-attribution"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.7 }}
          >
            brisa
          </motion.p>
        </motion.div>
      </div>
    </section>
  )
}

export default BabyJourney

