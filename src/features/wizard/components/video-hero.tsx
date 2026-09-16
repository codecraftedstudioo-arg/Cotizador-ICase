import { useState, useEffect, useRef } from 'react'

// Free 4K videos from Pexels - iPhone/tech related
const heroVideos = [
  // Tech/iPhone related videos from Pexels (free, no attribution)
  'https://videos.pexels.com/video-files/5082587/5082587-uhd_2560_1440_25fps.mp4', // Person using phone
  'https://videos.pexels.com/video-files/6774203/6774203-uhd_2560_1440_25fps.mp4', // Modern tech lifestyle
  'https://videos.pexels.com/video-files/4065906/4065906-uhd_2560_1440_25fps.mp4', // Hands with smartphone
]

interface VideoHeroProps {
  children: React.ReactNode
}

export function VideoHero({ children }: VideoHeroProps) {
  const [currentVideo, setCurrentVideo] = useState(0)
  const [isLoaded, setIsLoaded] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)

  // Change video when current one ends
  const handleVideoEnd = () => {
    setCurrentVideo((prev) => (prev + 1) % heroVideos.length)
  }

  // Reset loaded state when video changes
  useEffect(() => {
    setIsLoaded(false)
  }, [currentVideo])

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Video Background */}
      <div className="absolute inset-0 -z-10">
        {/* Base black */}
        <div className="absolute inset-0 bg-black" />

        {/* Video */}
        <video
          ref={videoRef}
          key={currentVideo}
          autoPlay
          muted
          playsInline
          onEnded={handleVideoEnd}
          onLoadedData={() => setIsLoaded(true)}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${
            isLoaded ? 'opacity-40' : 'opacity-0'
          }`}
        >
          <source src={heroVideos[currentVideo]} type="video/mp4" />
        </video>

        {/* Overlay for readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/80" />
      </div>

      {/* Content */}
      {children}
    </div>
  )
}
