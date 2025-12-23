import React, { useEffect, useRef } from 'react'
import { useKonamiCode } from '../hooks/useKonamiCode'
import './FluidCursor.css'

export default function FluidCursor() {
  const isActivated = useKonamiCode()
  const fluidInstanceRef = useRef(null)
  const containerRef = useRef(null)
  const timerRef = useRef(null)

  useEffect(() => {
    if (!isActivated) {
      if (fluidInstanceRef.current) {
        try {
          if (typeof fluidInstanceRef.current.destroy === 'function') {
            fluidInstanceRef.current.destroy()
          }
        } catch (e) {
          console.error('Error destroying fluid cursor:', e)
        }
        fluidInstanceRef.current = null
      }
      if (timerRef.current) {
        clearTimeout(timerRef.current)
        timerRef.current = null
      }
      document.body.classList.remove('fluid-cursor-active')
      return
    }

    let cancelled = false

    // Dynamically import the library
    import('smokey-fluid-cursor').then((module) => {
      if (cancelled) return
      
      // Try different export patterns
      const initFluid = module.initFluid || module.default?.initFluid || module.default
      
      if (!initFluid || typeof initFluid !== 'function') {
        console.error('initFluid not found in module', Object.keys(module))
        return
      }

      document.body.classList.add('fluid-cursor-active')

      // Wait for canvas to be rendered and ensure it's in the DOM
      timerRef.current = setTimeout(() => {
        if (cancelled) return
        
        const canvas = document.getElementById('fluid-cursor-canvas')
        if (!canvas) {
          console.error('Canvas not found')
          return
        }

        try {
          // Initialize fluid cursor with WebGL simulation
          const fluidInstance = initFluid({
            id: 'fluid-cursor-canvas',
            densityDissipation: 0.95,
            velocityDissipation: 0.97,
            curl: 40,
            splatRadius: 0.3,
            shading: true,
            colorUpdateSpeed: 10,
            transparent: true,
          })

          fluidInstanceRef.current = fluidInstance
          
          // Override the z-index that the library sets (it sets -9999 by default)
          setTimeout(() => {
            const canvasEl = document.getElementById('fluid-cursor-canvas')
            if (canvasEl) {
              canvasEl.style.zIndex = '9999'
              canvasEl.style.position = 'fixed'
              canvasEl.style.top = '0'
              canvasEl.style.left = '0'
              canvasEl.style.width = '100%'
              canvasEl.style.height = '100%'
            }
          }, 100)
          
          console.log('Fluid cursor initialized successfully')
        } catch (error) {
          console.error('Error initializing fluid cursor:', error)
        }
      }, 200)
    }).catch((error) => {
      console.error('Error loading fluid cursor library:', error)
    })

    return () => {
      cancelled = true
      if (timerRef.current) {
        clearTimeout(timerRef.current)
        timerRef.current = null
      }
      if (fluidInstanceRef.current) {
        try {
          if (typeof fluidInstanceRef.current.destroy === 'function') {
            fluidInstanceRef.current.destroy()
          }
        } catch (e) {
          console.error('Error destroying fluid cursor:', e)
        }
        fluidInstanceRef.current = null
      }
      document.body.classList.remove('fluid-cursor-active')
    }
  }, [isActivated])

  if (!isActivated) return null

  return (
    <div ref={containerRef} className="fluid-cursor-container">
      <canvas id="fluid-cursor-canvas" className="fluid-cursor-canvas" />
    </div>
  )
}

