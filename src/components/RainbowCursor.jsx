import React, { useEffect, useState, useRef } from 'react'
import { useKonamiCode } from '../hooks/useKonamiCode'
import './RainbowCursor.css'

export default function RainbowCursor() {
  const isActivated = useKonamiCode()
  const [trail, setTrail] = useState([])
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
  const [time, setTime] = useState(0)
  const cursorRef = useRef(null)
  const animationFrameRef = useRef(null)

  useEffect(() => {
    if (isActivated) {
      document.body.classList.add('rainbow-cursor-active')
    } else {
      document.body.classList.remove('rainbow-cursor-active')
      setTrail([])
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
      return
    }

    // Animation loop for RGB cycling and wave effects
    const animate = () => {
      setTime((prev) => prev + 0.02)
      animationFrameRef.current = requestAnimationFrame(animate)
    }
    animationFrameRef.current = requestAnimationFrame(animate)

    const handleMouseMove = (e) => {
      setMousePos({ x: e.clientX, y: e.clientY })
      
      setTrail((prev) => {
        const newTrail = [
          { x: e.clientX, y: e.clientY, id: Date.now(), time: time },
          ...prev
        ].slice(0, 30) // Keep last 30 points
        return newTrail
      })
    }

    window.addEventListener('mousemove', handleMouseMove)
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      document.body.classList.remove('rainbow-cursor-active')
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [isActivated, time])

  if (!isActivated) return null

  return (
    <>
      <div 
        ref={cursorRef}
        className="rainbow-cursor"
        style={{
          left: mousePos.x,
          top: mousePos.y,
          '--time': `${time}s`,
        }}
      >
        <div className="cursor-core"></div>
        <div className="cursor-ring ring-1"></div>
        <div className="cursor-ring ring-2"></div>
        <div className="cursor-ring ring-3"></div>
        <div className="wave-effect wave-1"></div>
        <div className="wave-effect wave-2"></div>
        <div className="wave-effect wave-3"></div>
      </div>
      {trail.map((point, index) => {
        const trailTime = time - (trail.length - index) * 0.1
        return (
          <div
            key={point.id}
            className="rainbow-trail-dot"
            style={{
              left: point.x,
              top: point.y,
              opacity: (trail.length - index) / trail.length * 0.9,
              transform: `scale(${(trail.length - index) / trail.length})`,
              '--trail-time': `${trailTime}s`,
            }}
          />
        )
      })}
    </>
  )
}

