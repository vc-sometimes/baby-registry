import React, { useEffect } from 'react'
import Lenis from 'lenis'
import Header from './components/Header'
import Hero from './components/Hero'
import OurStory from './components/OurStory'
import BabyJourney from './components/BabyJourney'
import Registries from './components/Registries'
import GenderVote from './components/GenderVote'
import BabyMessages from './components/BabyMessages'
import Footer from './components/Footer'
import './App.css'

function App() {
  useEffect(() => {
    // Initialize Lenis smooth scroll
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1,
      smoothTouch: false,
      touchMultiplier: 2,
      infinite: false,
    })

    // Animation frame loop
    function raf(time) {
      lenis.raf(time)
      requestAnimationFrame(raf)
    }

    requestAnimationFrame(raf)

    // Add pop effect when sections come into view
    const sections = document.querySelectorAll('section')
    let lastSnappedSection = null

    lenis.on('scroll', ({ scroll, limit, velocity }) => {
      const windowHeight = window.innerHeight
      const scrollThreshold = windowHeight * 0.3

      sections.forEach((section) => {
        const rect = section.getBoundingClientRect()
        const isInView = rect.top <= scrollThreshold && rect.bottom >= scrollThreshold

        if (isInView && section !== lastSnappedSection) {
          lastSnappedSection = section
          section.classList.add('section-snapped')
          setTimeout(() => {
            section.classList.remove('section-snapped')
          }, 600)
        }
      })
    })

    return () => {
      lenis.destroy()
    }
  }, [])

  return (
    <div className="app">
      <Header />
      <Hero />
      <OurStory />
      <BabyJourney />
      <Registries />
      <GenderVote />
      <BabyMessages />
      <Footer />
    </div>
  )
}

export default App

