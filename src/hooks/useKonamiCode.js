import { useState, useEffect } from 'react'

const KONAMI_CODE = [
  'ArrowUp',
  'ArrowUp',
  'ArrowDown',
  'ArrowDown',
  'ArrowLeft',
  'ArrowRight',
  'ArrowLeft',
  'ArrowRight',
  'KeyB',
  'KeyA'
]

export function useKonamiCode() {
  const [isActivated, setIsActivated] = useState(false)
  const [sequence, setSequence] = useState([])

  useEffect(() => {
    const handleKeyDown = (e) => {
      const key = e.code

      if (isActivated) return // Already activated

      const newSequence = [...sequence, key]
      
      // Check if the new sequence matches the start of Konami code
      const matches = newSequence.every((key, index) => key === KONAMI_CODE[index])
      
      if (matches) {
        if (newSequence.length === KONAMI_CODE.length) {
          setIsActivated(true)
          setSequence([])
        } else {
          setSequence(newSequence)
        }
      } else {
        // Reset if sequence doesn't match
        setSequence(newSequence.length === 1 && newSequence[0] === KONAMI_CODE[0] ? newSequence : [])
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [sequence, isActivated])

  return isActivated
}

