import React, { useRef, useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import './DrawableImage.css'

function DrawableImage({ className = '' }) {
  const canvasRef = useRef(null)
  const containerRef = useRef(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [color, setColor] = useState('#8B6F47')
  const [brushSize, setBrushSize] = useState(5)
  const [showControls, setShowControls] = useState(false)

  const colors = [
    '#8B6F47', // Brown
    '#C97D60', // Cafe
    '#3E2723', // Dark brown
    '#5D4037', // Medium brown
    '#D7CCC8', // Light brown
    '#F0EBE0', // Cream
    '#000000', // Black
    '#FFFFFF', // White
  ]

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const updateCanvasSize = () => {
      const container = containerRef.current
      if (!container) return
      
      const rect = container.getBoundingClientRect()
      canvas.width = rect.width
      canvas.height = rect.height

      // Load saved drawing from localStorage
      const savedDrawing = localStorage.getItem('baby-drawing')
      if (savedDrawing) {
        const img = new Image()
        img.onload = () => {
          const ctx = canvas.getContext('2d')
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
        }
        img.src = savedDrawing
      }
    }

    updateCanvasSize()
    window.addEventListener('resize', updateCanvasSize)

    return () => {
      window.removeEventListener('resize', updateCanvasSize)
    }
  }, [])

  const getCoordinates = (e) => {
    const canvas = canvasRef.current
    const rect = canvas.getBoundingClientRect()
    
    if (e.touches) {
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top
      }
    }
    
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    }
  }

  const startDrawing = (e) => {
    e.preventDefault()
    setIsDrawing(true)
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    const { x, y } = getCoordinates(e)
    
    ctx.beginPath()
    ctx.moveTo(x, y)
  }

  const draw = (e) => {
    if (!isDrawing) return
    e.preventDefault()
    
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    const { x, y } = getCoordinates(e)
    
    ctx.lineWidth = brushSize
    ctx.lineCap = 'round'
    ctx.strokeStyle = color
    ctx.lineTo(x, y)
    ctx.stroke()
    ctx.beginPath()
    ctx.moveTo(x, y)
  }

  const stopDrawing = () => {
    if (isDrawing) {
      setIsDrawing(false)
      // Save drawing to localStorage
      const canvas = canvasRef.current
      const dataURL = canvas.toDataURL('image/png')
      localStorage.setItem('baby-drawing', dataURL)
    }
  }

  const clearCanvas = () => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    localStorage.removeItem('baby-drawing')
  }

  const downloadDrawing = () => {
    const canvas = canvasRef.current
    const dataURL = canvas.toDataURL('image/png')
    const link = document.createElement('a')
    link.download = 'baby-drawing.png'
    link.href = dataURL
    link.click()
  }

  return (
    <div 
      ref={containerRef}
      className={`drawable-image-container ${className}`}
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
    >
      <canvas
        ref={canvasRef}
        className="drawable-canvas"
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
        onTouchStart={startDrawing}
        onTouchMove={draw}
        onTouchEnd={stopDrawing}
      />
      
      {!showControls && (
        <div className="drawing-hint">
          <span>Draw on the photo!</span>
        </div>
      )}
      
      {showControls && (
        <motion.div 
          className="drawing-controls"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
        >
          <div className="color-picker">
            {colors.map((c) => (
              <button
                key={c}
                className={`color-button ${color === c ? 'active' : ''}`}
                style={{ backgroundColor: c }}
                onClick={() => setColor(c)}
                aria-label={`Select color ${c}`}
              />
            ))}
          </div>
          
          <div className="brush-controls">
            <label>
              <span>Brush Size</span>
              <input
                type="range"
                min="2"
                max="20"
                value={brushSize}
                onChange={(e) => setBrushSize(Number(e.target.value))}
              />
              <span className="brush-size-value">{brushSize}px</span>
            </label>
          </div>
          
          <div className="action-buttons">
            <button 
              className="clear-button"
              onClick={clearCanvas}
            >
              Clear
            </button>
            <button 
              className="download-button"
              onClick={downloadDrawing}
            >
              Download
            </button>
          </div>
        </motion.div>
      )}
    </div>
  )
}

export default DrawableImage

