import React, { useEffect, useState } from 'react'
import { useKonamiCode } from '../hooks/useKonamiCode'
import './RainbowCursor.css'

export default function RainbowCursor() {
  const isActivated = useKonamiCode()
  const [trail, setTrail] = useState([])
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })

  useEffect(() => {
    if (isActivated) {
      document.body.classList.add('rainbow-cursor-active')
    } else {
      document.body.classList.remove('rainbow-cursor-active')
      setTrail([])
      return
    }

    const handleMouseMove = (e) => {
      setMousePos({ x: e.clientX, y: e.clientY })
      
      setTrail((prev) => {
        const newTrail = [
          { x: e.clientX, y: e.clientY, id: Date.now() },
          ...prev
        ].slice(0, 20) // Keep last 20 points
        return newTrail
      })
    }

    window.addEventListener('mousemove', handleMouseMove)
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      document.body.classList.remove('rainbow-cursor-active')
    }
  }, [isActivated])

  if (!isActivated) return null

  return (
    <>
      <div 
        className="rainbow-cursor"
        style={{
          left: mousePos.x,
          top: mousePos.y,
        }}
      />
      {trail.map((point, index) => (
        <div
          key={point.id}
          className="rainbow-trail-dot"
          style={{
            left: point.x,
            top: point.y,
            opacity: (trail.length - index) / trail.length * 0.8,
            transform: `scale(${(trail.length - index) / trail.length})`,
            animationDelay: `${index * 0.05}s`,
          }}
        />
      ))}
    </>
  )
}

