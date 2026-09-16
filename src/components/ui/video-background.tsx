import { useState, useEffect } from 'react'

/**
 * Background Component for Wizard
 * Subtle iPhone images with dark overlay
 */

const wizardImages = [
  'https://images.unsplash.com/photo-1591337676887-a217a6970a8a?w=1200&q=80',
  'https://images.unsplash.com/photo-1580910051074-3eb694886f8b?w=1200&q=80',
  'https://images.unsplash.com/photo-1512054502232-10a0a035d672?w=1200&q=80',
]

export function VideoBackground() {
  const [currentImage, setCurrentImage] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % wizardImages.length)
    }, 6000)
    return () => clearInterval(timer)
  }, [])

  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Base black */}
      <div className="absolute inset-0 bg-black" />

      {/* Images with fade */}
      {wizardImages.map((src, index) => (
        <div
          key={index}
          className={`absolute inset-0 transition-opacity duration-1000 ${
            index === currentImage ? 'opacity-30' : 'opacity-0'
          }`}
        >
          <img
            src={src}
            alt=""
            className="w-full h-full object-cover"
          />
        </div>
      ))}

      {/* Dark overlay for readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70" />
    </div>
  )
}
