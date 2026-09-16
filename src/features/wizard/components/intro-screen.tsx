import { type ReactNode, useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useWizard } from '../hooks/use-wizard'
import { ThemeToggle } from '@/components/theme-toggle'
import {
  tenant,
  getWebsiteUrl,
  getCatalogUrl,
  getInstagramUrl,
  getMapsUrl,
} from '@/config/tenant'




// Typewriter effect component
function Typewriter({ text, delay = 0, speed = 30 }: { text: string; delay?: number; speed?: number }) {
  const [displayed, setDisplayed] = useState('')
  const [started, setStarted] = useState(false)

  useEffect(() => {
    const timeout = setTimeout(() => setStarted(true), delay)
    return () => clearTimeout(timeout)
  }, [delay])

  useEffect(() => {
    if (!started) return
    if (displayed.length >= text.length) return
    const timeout = setTimeout(() => {
      setDisplayed(text.slice(0, displayed.length + 1))
    }, speed)
    return () => clearTimeout(timeout)
  }, [started, displayed, text, speed])

  return (
    <span className="relative block">
      <span className="invisible">{text}</span>
      <span className="absolute inset-0">
        {displayed}
        {started && displayed.length < text.length && <span className="inline-block w-[2px] h-[1em] bg-fg/60 align-middle ml-0.5 animate-pulse" />}
      </span>
    </span>
  )
}

const reviewsData = tenant.content.reviews

// Google Logo Icon
const GoogleIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
  </svg>
)

// Star Icon
const StarIcon = ({ filled = false, small = false }: { filled?: boolean; small?: boolean }) => (
  <svg
    className={`${small ? 'w-3.5 h-3.5' : 'w-5 h-5'} ${filled ? 'text-amber-400 drop-shadow-[0_0_3px_rgba(251,191,36,0.4)]' : 'text-fg/20 dark:text-white/20'}`}
    fill="currentColor"
    viewBox="0 0 20 20"
  >
    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
  </svg>
)

// Professional SVG Icons - White
const ClockIcon = () => (
  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
)

const CurrencyIcon = () => (
  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
)

const ShieldCheckIcon = () => (
  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
  </svg>
)

const HandshakeIcon = () => (
  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />
  </svg>
)

// Custom video player — facade pattern: thumbnail + YouTube IFrame API (no YT UI visible)
function VideoPlayer() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'playing' | 'paused' | 'ended'>('idle')
  const containerRef = useRef<HTMLDivElement>(null)
  const playerRef = useRef<any>(null)

  useEffect(() => {
    return () => { playerRef.current?.destroy() }
  }, [])

  const play = useCallback(() => {
    setStatus('loading')
    const create = () => {
      if (!containerRef.current) return
      const div = document.createElement('div')
      containerRef.current.prepend(div)
      playerRef.current = new (window as any).YT.Player(div, {
        videoId: tenant.social.youtube,
        playerVars: {
          autoplay: 1, controls: 0, rel: 0, showinfo: 0,
          modestbranding: 1, iv_load_policy: 3, playsinline: 1, fs: 0, disablekb: 1,
        },
        events: {
          onReady: (e: any) => { e.target.seekTo(0.5, true); setStatus('playing') },
          onStateChange: (e: any) => {
            const s = e.data
            if (s === 1) setStatus('playing')
            else if (s === 2) setStatus('paused')
            else if (s === 0) setStatus('ended')
          },
        },
      })
    }
    if ((window as any).YT?.Player) create()
    else {
      const tag = document.createElement('script')
      tag.src = 'https://www.youtube.com/iframe_api'
      document.head.appendChild(tag)
      ;(window as any).onYouTubeIframeAPIReady = create
    }
  }, [])

  const toggle = () => {
    if (!playerRef.current) return
    status === 'playing' ? playerRef.current.pauseVideo() : playerRef.current.playVideo()
  }

  const VIDEO_START = 0.5

  const restart = () => {
    if (!playerRef.current) return
    playerRef.current.seekTo(VIDEO_START, true)
    playerRef.current.playVideo()
  }

  const rewind = () => {
    if (!playerRef.current) return
    const current = playerRef.current.getCurrentTime() || VIDEO_START
    playerRef.current.seekTo(Math.max(VIDEO_START, current - 10), true)
  }

  const hasControls = status === 'playing' || status === 'paused' || status === 'ended'

  return (
    <div
      ref={containerRef}
      className="relative w-[280px] sm:w-[340px] md:w-[400px] aspect-[9/16] rounded-2xl overflow-hidden border border-white/15 shadow-2xl shadow-black/50 bg-black [&>iframe]:absolute [&>iframe]:-top-[8%] [&>iframe]:left-0 [&>iframe]:w-full [&>iframe]:h-[116%] [&>iframe]:pointer-events-none"
    >
      {/* Thumbnail + play (idle) */}
      {status === 'idle' && (
        <button onClick={play} className="absolute inset-0 z-10 flex items-center justify-center group/play cursor-pointer">
          <img
            src={tenant.social.youtube ? `https://img.youtube.com/vi/${tenant.social.youtube}/maxresdefault.jpg` : tenant.brand.hero}
            alt=""
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/20 group-hover/play:bg-black/10 transition-colors" />
          <div className="relative w-16 h-16 rounded-full bg-white/90 flex items-center justify-center shadow-2xl group-hover/play:scale-110 transition-transform">
            <svg className="w-7 h-7 text-black ml-1" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </button>
      )}

      {/* Loading spinner */}
      {status === 'loading' && (
        <div className="absolute inset-0 z-10 flex items-center justify-center">
          <div className="w-10 h-10 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        </div>
      )}

      {/* Tap area for pause (playing) */}
      {status === 'playing' && (
        <button onClick={toggle} className="absolute inset-0 z-10 cursor-pointer" aria-label="Pausar" />
      )}

      {/* Center icon when paused */}
      {status === 'paused' && (
        <button onClick={toggle} className="absolute inset-0 z-10 flex items-center justify-center bg-black/40 cursor-pointer">
          <div className="w-14 h-14 rounded-full bg-white/90 flex items-center justify-center shadow-2xl">
            <svg className="w-6 h-6 text-black ml-0.5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </button>
      )}

      {/* Center icon when ended */}
      {status === 'ended' && (
        <button onClick={restart} className="absolute inset-0 z-10 flex items-center justify-center bg-black/50 cursor-pointer">
          <div className="w-14 h-14 rounded-full bg-white/90 flex items-center justify-center shadow-2xl">
            <svg className="w-6 h-6 text-black" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z" />
            </svg>
          </div>
        </button>
      )}

      {/* Top/bottom gradients to mask any YouTube UI residue */}
      {hasControls && (
        <div className="absolute top-0 left-0 right-0 z-20 h-14 bg-gradient-to-b from-black/80 to-transparent pointer-events-none" />
      )}

      {/* Control bar */}
      {hasControls && (
        <div className="absolute bottom-0 left-0 right-0 z-20 flex items-center justify-center gap-6 py-3 bg-gradient-to-t from-black/70 to-transparent">
          {/* Restart */}
          <button onClick={restart} className="text-white/80 hover:text-white transition-colors cursor-pointer" aria-label="Reiniciar">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z" />
            </svg>
          </button>
          {/* Rewind 10s */}
          <button onClick={rewind} className="text-white/80 hover:text-white transition-colors cursor-pointer" aria-label="Retroceder 10s">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M11.99 5V1l-5 5 5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6h-2c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z" />
              <text x="7.5" y="16.5" fontSize="7.5" fontWeight="bold" fill="currentColor">10</text>
            </svg>
          </button>
          {/* Play / Pause */}
          <button onClick={toggle} className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors cursor-pointer" aria-label={status === 'playing' ? 'Pausar' : 'Reproducir'}>
            {status === 'playing' ? (
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
              </svg>
            ) : (
              <svg className="w-5 h-5 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            )}
          </button>
        </div>
      )}
    </div>
  )
}

function FAQItem({ question, children }: { question: string; children: ReactNode }) {
  const [open, setOpen] = useState(false)
  return (
    <button
      onClick={() => setOpen(!open)}
      className={`w-full text-left rounded-xl transition-all duration-300 px-4 sm:px-5 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#6B8AED]/50 group ${
        open
          ? 'bg-fg/[0.04] border border-fg/[0.08] py-4 sm:py-5'
          : 'bg-fg/[0.02] border border-fg/[0.04] hover:bg-fg/[0.05] hover:border-fg/[0.08] py-4 sm:py-5'
      }`}
    >
      {/* Question row */}
      <div className="flex items-center justify-between gap-3">
        <span className={`text-sm sm:text-[15px] font-medium transition-colors duration-200 ${
          open ? 'text-[#4A6BDB] dark:text-[#6B8AED]' : 'text-fg-muted group-hover:text-fg'
        }`}>{question}</span>
        <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 transition-all duration-300 ${
          open ? 'bg-[#4A6BDB]/15 dark:bg-[#6B8AED]/15 rotate-180' : 'bg-fg/[0.06] group-hover:bg-fg/[0.10]'
        }`}>
          <svg
            className={`w-3.5 h-3.5 transition-colors duration-200 ${open ? 'text-[#4A6BDB] dark:text-[#6B8AED]' : 'text-fg-subtle'}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2.5}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
          </svg>
        </div>
      </div>

      {/* Answer content */}
      <div className={`overflow-hidden transition-all duration-300 ease-in-out ${
        open ? 'max-h-[500px] opacity-100 mt-3' : 'max-h-0 opacity-0 mt-0'
      }`}>
        {children}
      </div>
    </button>
  )
}

export function IntroScreen() {
  const navigate = useNavigate()
  const { reset } = useWizard()
  const [menuOpen, setMenuOpen] = useState(false)

  const startCotizar = () => {
    reset()
    navigate('/cotizar')
  }

  const heroStats: { value: ReactNode; label: string }[] = [
    { value: `+${tenant.stats.devicesEvaluated}`, label: 'Clientes' },
    { value: <>{tenant.stats.rating}<span className="text-amber-400 animate-star-twinkle">★</span></>, label: 'Google Reviews' },
    { value: '24hs', label: 'Pago inmediato' },
    { value: `+${tenant.stats.yearsExperience}`, label: 'Años de experiencia' },
  ]

  const mapsUrl = getMapsUrl()
  const websiteUrl = getWebsiteUrl()
  const catalogUrl = getCatalogUrl()
  const instagramUrl = getInstagramUrl()

  return (
    <div className="min-h-screen bg-bg">
      {/* Navbar */}
      <nav className="relative z-10 sticky top-0 bg-bg/95 backdrop-blur-xl border-b border-line">
        <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-20 py-4 flex items-center justify-between">
          {/* Logo - Brand Identity. invert: negro sobre claro / blanco sobre oscuro */}
          <a href={websiteUrl} target={websiteUrl.startsWith('http') ? '_blank' : undefined} rel={websiteUrl.startsWith('http') ? 'noopener noreferrer' : undefined} className="block overflow-visible">
            <img
              src={tenant.brand.logo}
              alt={tenant.brand.name}
              className="h-12 md:h-14 lg:h-16 w-auto object-contain"
            />
          </a>

          {/* Nav Links - Desktop */}
          <div className="hidden md:flex items-center gap-8">
            <button
               onClick={() => document.getElementById('como-funciona')?.scrollIntoView({ behavior: 'smooth' })}
               className="text-fg-muted hover:text-fg transition-colors text-sm">
              ¿Cómo funciona?
            </button>
            {catalogUrl && (
            <a href={catalogUrl} target="_blank" rel="noopener noreferrer"
               className="text-sm font-medium text-accent border border-accent/40 hover:border-accent hover:bg-accent/10 px-4 py-2 rounded-full transition-all">
              Precios y modelos
            </a>
            )}
            {instagramUrl && (
            <a href={instagramUrl} target="_blank" rel="noopener noreferrer"
               className="text-fg-muted hover:text-fg transition-colors text-sm">
              Instagram
            </a>
            )}
            {mapsUrl && (
            <a href={mapsUrl} target="_blank" rel="noopener noreferrer"
               className="text-fg-muted hover:text-fg transition-colors text-sm">
              ¿Cómo llegar?
            </a>
            )}
            <button
               onClick={() => document.getElementById('preguntas-frecuentes')?.scrollIntoView({ behavior: 'smooth' })}
               className="text-fg-muted hover:text-fg transition-colors text-sm">
              Preguntas frecuentes
            </button>
            <ThemeToggle />
          </div>

          {/* Right cluster - Mobile (toggle + hamburger) */}
          <div className="flex items-center gap-2 md:hidden">
            <ThemeToggle />
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="w-10 h-10 rounded-xl bg-bg-subtle border border-line flex flex-col items-center justify-center gap-[5px] hover:bg-fg/5 transition-all cursor-pointer group"
              aria-label="Menú"
            >
              <span className={`block h-[2px] rounded-full bg-fg transition-all duration-300 ${menuOpen ? 'w-5 rotate-45 translate-y-[7px]' : 'w-5 group-hover:w-4'}`} />
              <span className={`block h-[2px] rounded-full bg-fg transition-all duration-300 ${menuOpen ? 'w-0 opacity-0' : 'w-3.5'}`} />
              <span className={`block h-[2px] rounded-full bg-fg transition-all duration-300 ${menuOpen ? 'w-5 -rotate-45 -translate-y-[7px]' : 'w-5 group-hover:w-4'}`} />
            </button>
          </div>

          {/* CTA button - Desktop */}
          {tenant.brand.website ? (
          <a
            href={websiteUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden md:block px-5 py-2.5 rounded-full text-sm font-semibold text-accent-contrast bg-accent hover:bg-accent-hover transition-all"
          >
            Tienda online
          </a>
          ) : (
          <button
            onClick={startCotizar}
            className="hidden md:block px-5 py-2.5 rounded-full text-sm font-semibold text-accent-contrast bg-accent hover:bg-accent-hover transition-all"
          >
            Cotizar ahora
          </button>
          )}
        </div>

        {/* Mobile menu dropdown — market style */}
        {menuOpen && (
          <div className="md:hidden border-t border-line bg-bg backdrop-blur-xl">
            <div className="px-5 py-5 flex flex-col gap-1">
              <button
                onClick={() => { document.getElementById('como-funciona')?.scrollIntoView({ behavior: 'smooth' }); setMenuOpen(false) }}
                className="flex items-center gap-3 text-fg-muted hover:text-fg hover:bg-fg/5 text-sm text-left py-3 px-3 rounded-xl transition-all cursor-pointer"
              >
                <span className="w-8 h-8 rounded-lg bg-[#4A6BDB]/10 flex items-center justify-center shrink-0">
                  <svg className="w-4 h-4 text-[#4A6BDB] dark:text-[#6B8AED]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
                  </svg>
                </span>
                ¿Cómo funciona?
              </button>
              <button
                onClick={() => { document.getElementById('preguntas-frecuentes')?.scrollIntoView({ behavior: 'smooth' }); setMenuOpen(false) }}
                className="flex items-center gap-3 text-fg-muted hover:text-fg hover:bg-fg/5 text-sm text-left py-3 px-3 rounded-xl transition-all cursor-pointer"
              >
                <span className="w-8 h-8 rounded-lg bg-[#4A6BDB]/10 flex items-center justify-center shrink-0">
                  <svg className="w-4 h-4 text-[#4A6BDB] dark:text-[#6B8AED]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
                  </svg>
                </span>
                Preguntas frecuentes
              </button>

              <div className="h-px bg-line my-2 mx-3" />

              {catalogUrl && (
              <a href={catalogUrl} target="_blank" rel="noopener noreferrer"
                 className="flex items-center gap-3 text-fg-muted hover:text-fg hover:bg-fg/5 text-sm py-3 px-3 rounded-xl transition-all">
                <span className="w-8 h-8 rounded-lg bg-[#4A6BDB]/10 flex items-center justify-center shrink-0">
                  <svg className="w-4 h-4 text-[#4A6BDB] dark:text-[#6B8AED]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4zM3 6h18M16 10a4 4 0 0 1-8 0" />
                  </svg>
                </span>
                Ver modelos y precios
              </a>
              )}
              {tenant.brand.website && (
              <a href={websiteUrl} target="_blank" rel="noopener noreferrer"
                 className="flex items-center gap-3 text-fg-muted hover:text-fg hover:bg-fg/5 text-sm py-3 px-3 rounded-xl transition-all">
                <span className="w-8 h-8 rounded-lg bg-[#4A6BDB]/10 flex items-center justify-center shrink-0">
                  <svg className="w-4 h-4 text-[#4A6BDB] dark:text-[#6B8AED]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-7.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349m-16.5 11.65V9.35m0 0a3.001 3.001 0 003.75-.615A2.993 2.993 0 009.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 002.25 1.016c.896 0 1.7-.393 2.25-1.016A3.001 3.001 0 0021 9.349m-18 0a2.998 2.998 0 00.615-1.524L4.26 4.265A1.5 1.5 0 015.745 3h12.51a1.5 1.5 0 011.485 1.265l.645 3.56a2.998 2.998 0 00.615 1.524" />
                  </svg>
                </span>
                Tienda online
              </a>
              )}
              {instagramUrl && (
              <a href={instagramUrl} target="_blank" rel="noopener noreferrer"
                 className="flex items-center gap-3 text-fg-muted hover:text-fg hover:bg-fg/5 text-sm py-3 px-3 rounded-xl transition-all">
                <span className="w-8 h-8 rounded-lg bg-pink-500/10 flex items-center justify-center shrink-0">
                  <svg className="w-4 h-4 text-pink-500 dark:text-pink-400" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
                  </svg>
                </span>
                Instagram
              </a>
              )}
              {mapsUrl && (
              <a href={mapsUrl} target="_blank" rel="noopener noreferrer"
                 className="flex items-center gap-3 text-fg-muted hover:text-fg hover:bg-fg/5 text-sm py-3 px-3 rounded-xl transition-all">
                <span className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0">
                  <svg className="w-4 h-4 text-emerald-600 dark:text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                  </svg>
                </span>
                ¿Cómo llegar?
              </a>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="relative bg-bg overflow-hidden">
        {/* Hero — Mobile (banner style: full-bleed photo, content anchored bottom) */}
        <div className="md:hidden">
          <div className="relative">
            <img
              src={tenant.brand.hero}
              alt={tenant.brand.name}
              className="w-full aspect-[3/4] object-cover object-center"
            />
            {/* Velo oscuro abajo: el texto va ENCIMA de la foto → blanco sobre scrim
               oscuro en ambos temas (es lo que mejor se lee sobre una imagen). */}
            <div className="absolute inset-0 bg-[linear-gradient(to_top,#000_0%,rgba(0,0,0,0.82)_16%,rgba(0,0,0,0.30)_40%,transparent_62%)]" />
            {/* Content anchored bottom */}
            <div className="absolute inset-x-0 bottom-0 px-6 pb-9">
              <span className="inline-flex items-center gap-2 text-[11px] text-blue-400 dark:text-green-400 font-semibold tracking-[0.2em] uppercase mb-3 animate-fadeSlideIn">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400 dark:bg-green-400 shadow-[0_0_8px_rgba(96,165,250,0.7)] dark:shadow-[0_0_8px_rgba(74,222,128,0.6)]" />
                Plan Canje
              </span>
              <h1 className="text-[2rem] leading-[1.1] font-bold text-white mb-3 animate-fadeSlideIn" style={{ animationDelay: '0.1s' }}>
                Cambiá tu iPhone<br />
                al mejor precio
              </h1>
              <p className="text-white/75 text-[15px] leading-relaxed mb-6 max-w-sm animate-fadeSlideIn" style={{ animationDelay: '0.2s' }}>
                Cotizá en 1 minuto, elegí tu nuevo iPhone y pagás solo la diferencia.
              </p>
              <button
                onClick={startCotizar}
                className="btn-shimmer inline-flex items-center gap-2 px-6 py-3.5 rounded-full text-[15px] font-semibold text-accent-contrast bg-accent hover:bg-accent-hover active:scale-95 transition-all duration-300 shadow-xl shadow-accent/30 animate-fadeSlideIn"
                style={{ animationDelay: '0.3s' }}
              >
                Cotizar ahora
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </button>
            </div>
          </div>
          {/* Stats + location */}
          <div className="px-6 pt-9 pb-10">
            <div className="grid grid-cols-2 gap-6">
              {heroStats.map((stat, i) => (
                <div key={i}>
                  <div className="text-2xl font-bold text-fg">{stat.value}</div>
                  <div className="text-fg-subtle text-sm">{stat.label}</div>
                </div>
              ))}
            </div>
            {mapsUrl ? (
            <a
              href={mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-7 flex items-center gap-2 text-fg-muted hover:text-fg text-sm transition-colors"
            >
              <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
              </svg>
              <span>{tenant.contact.address || 'Visitá nuestro local'}</span>
            </a>
            ) : (
            <p className="mt-7 flex items-center gap-2 text-fg-muted text-sm">
              <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
              </svg>
              <span>{tenant.contact.address || 'Visitá nuestro local'}</span>
            </p>
            )}
          </div>
        </div>

        {/* Hero — Desktop (sin cambios respecto al aprobado) */}
        <div className="hidden md:block max-w-7xl mx-auto">
          <div className="flex flex-row items-center min-h-[75vh]">
            {/* Left - Text */}
            <div className="relative z-10 px-12 lg:px-20 py-20 w-1/2">
              <span className="inline-flex items-center gap-1.5 text-xs text-accent font-semibold tracking-widest uppercase mb-5 px-3 py-1.5 rounded-full border border-accent/30 bg-accent/10 animate-fadeSlideIn">
                Plan Canje
              </span>
              <h1 className="text-5xl lg:text-7xl font-bold text-fg mb-6 leading-tight animate-fadeSlideIn">
                Cambiá tu
                <span className="block">iPhone</span>
                <span className="block">al mejor</span>
                <span className="block">precio</span>
              </h1>

              <p
                className="text-xl text-fg-muted mb-8 leading-relaxed animate-fadeSlideIn"
                style={{ animationDelay: '0.1s' }}
              >
                <Typewriter text="Cotizá en 1 minuto, elegí tu nuevo iPhone y pagás solo la diferencia." delay={800} speed={30} />
              </p>

              <div className="mb-10 animate-fadeSlideIn" style={{ animationDelay: '0.2s' }}>
                <button
                  onClick={startCotizar}
                  className="btn-shimmer px-10 py-5 rounded-full text-lg font-bold text-accent-contrast bg-accent
                             hover:bg-accent-hover hover:scale-105 transition-all duration-300 shadow-2xl shadow-accent/30 hover:shadow-accent/50"
                >
                  Cotizar ahora
                </button>
              </div>

              <div className="grid grid-cols-2 gap-6 animate-fadeSlideIn" style={{ animationDelay: '0.3s' }}>
                {heroStats.map((stat, i) => (
                  <div key={i}>
                    <div className="text-2xl md:text-3xl font-bold text-fg">{stat.value}</div>
                    <div className="text-fg-subtle text-sm">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right - Image. El gradiente funde la foto hacia el fondo (claro/oscuro) */}
            <div className="relative w-1/2 min-h-[75vh]">
              <img
                src={tenant.brand.hero}
                alt={tenant.brand.name}
                className="w-full h-full object-cover object-center absolute inset-0"
              />
              <div className="absolute inset-0 bg-[linear-gradient(to_right,var(--bg)_0%,transparent_32%)] dark:bg-[linear-gradient(to_right,#000_0%,rgba(0,0,0,0.2)_50%,transparent_100%)]" />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section
        className="relative z-10 border-t border-line bg-bg-subtle"
      >
        <div className="max-w-6xl mx-auto px-4 py-20">
          <h2 className="text-3xl md:text-4xl font-bold text-fg text-center mb-12">
            ¿Por qué elegirnos?
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { icon: <ClockIcon />, title: 'Cotización express', desc: 'En menos de 1 minuto' },
              { icon: <CurrencyIcon />, title: 'Mejor precio', desc: 'Garantizado del mercado' },
              { icon: <ShieldCheckIcon />, title: '100% seguro', desc: 'Transacción protegida' },
              { icon: <HandshakeIcon />, title: 'Pago inmediato', desc: 'Efectivo o transferencia' },
            ].map((item, i) => (
              <div
                key={i}
                className="text-center group"
                style={{ transitionDelay: `${i * 100}ms` }}
              >
                <div className="w-14 h-14 rounded-full bg-surface dark:bg-white/5 border-2 border-[#263A99]/60 flex items-center justify-center mx-auto mb-4 group-hover:border-[#263A99] group-hover:scale-110 transition-all duration-300">
                  <div className="text-[#4A6BDB]">{item.icon}</div>
                </div>
                <h3 className="text-fg font-semibold mb-1">{item.title}</h3>
                <p className="text-fg-subtle text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section - How it works */}
      <section id="como-funciona" className="relative z-10 border-t border-line bg-bg py-16 scroll-mt-20">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-fg text-center mb-12">
            ¿Cómo funciona?
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: '1', title: 'Revisamos el equipo', desc: 'En el local verificamos el estado de tu iPhone' },
              { step: '2', title: 'Confirmamos el precio', desc: 'Te damos el precio final sin sorpresas' },
              { step: '3', title: 'Te pagamos en el momento', desc: 'Efectivo o transferencia, como prefieras' },
            ].map((item, i) => (
              <div key={i} className="text-center group">
                <div className="w-14 h-14 rounded-full bg-surface dark:bg-white/5 border-2 border-[#263A99]/60 flex items-center justify-center mx-auto mb-4 group-hover:border-[#263A99] group-hover:scale-110 transition-all duration-300">
                  <span className="text-2xl font-bold text-[#4A6BDB]">{item.step}</span>
                </div>
                <h3 className="text-fg font-semibold text-lg mb-2">{item.title}</h3>
                <p className="text-fg-muted text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
          <p className="text-center text-fg-subtle text-sm mt-10">
            Simple, directo, sin letra chica.
          </p>
          {/* Separator */}
          <div className="flex items-center justify-center gap-3 mt-12 mb-2">
            <div className="h-px w-12 bg-gradient-to-r from-transparent to-fg/20" />
            <div className="w-1.5 h-1.5 rounded-full bg-fg-subtle" />
            <div className="h-px w-12 bg-gradient-to-l from-transparent to-fg/20" />
          </div>
          {/* Video */}
          {tenant.social.youtube && (
          <div className="mt-8 flex flex-col items-center">
            <p className="text-sm uppercase tracking-widest text-[#4A6BDB] font-semibold mb-2">Miralo en acción</p>
            <h3 className="text-xl md:text-2xl font-bold text-fg mb-8">Así de fácil es vender tu iPhone</h3>
            <div className="relative group">
              <div className="absolute -inset-3 bg-[#4A6BDB]/15 rounded-3xl blur-2xl group-hover:bg-[#4A6BDB]/25 transition-all duration-500" />
              <VideoPlayer />
            </div>
          </div>
          )}
        </div>
      </section>

      {/* Reviews Section */}
      <section
        className="relative z-10 border-t border-line bg-bg py-12 overflow-hidden"
      >
        <div className="max-w-6xl mx-auto px-4 mb-6">
          <div className="flex items-center justify-center gap-3">
            <GoogleIcon />
            <div className="flex items-center gap-1">
              {[1,2,3,4,5].map((star) => (
                <StarIcon key={star} filled />
              ))}
            </div>
            <span className="text-fg-muted text-sm">{tenant.stats.rating} en Google Reviews</span>
          </div>
        </div>

        {/* Scrolling reviews */}
        <div className="relative">
          <div className="flex animate-scroll gap-6">
            {[...reviewsData, ...reviewsData].map((review, i) => (
              <div
                key={i}
                className="flex-shrink-0 w-80 bg-surface-2 dark:bg-neutral-900 border border-line rounded-2xl p-5"
              >
                <div className="flex items-center gap-1 mb-3">
                  {[1,2,3,4,5].map((star) => (
                    <StarIcon key={star} filled={star <= review.stars} small />
                  ))}
                </div>
                <p className="text-fg-muted text-sm mb-3 line-clamp-3">"{review.text}"</p>
                <p className="text-fg-subtle text-xs">— {review.name}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Market Section — Ver precios y modelos (calco del market trade-in) */}
      <section className="relative py-16 sm:py-20 px-4 sm:px-6 overflow-hidden bg-bg-subtle">
        <div className="absolute inset-0 dark:bg-gradient-to-b dark:from-[#05070B] dark:via-[#070A10] dark:to-[#05070B]" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-[radial-gradient(ellipse_at_center,rgba(74,107,219,0.07)_0%,transparent_65%)] blur-3xl pointer-events-none" />

        <div className="max-w-3xl mx-auto relative z-10">
          {/* Header */}
          <div className="text-center mb-12 sm:mb-14">
            <span className="inline-flex items-center gap-1.5 text-[11px] sm:text-xs text-[#4A6BDB]/90 dark:text-[#6B8AED]/80 font-semibold tracking-widest uppercase mb-5 animate-fadeSlideIn">
              <span className="w-5 h-px bg-[#4A6BDB]/40 dark:bg-[#6B8AED]/40" />
              iPhone Market
              <span className="w-5 h-px bg-[#4A6BDB]/40 dark:bg-[#6B8AED]/40" />
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-[2.75rem] font-bold text-fg leading-[1.15] tracking-tight mb-4 animate-fadeSlideIn" style={{ animationDelay: '0.1s' }}>
              Encontrá tu próximo<br /> iPhone
            </h2>
            <p className="text-fg-muted text-[15px] sm:text-base max-w-lg mx-auto leading-relaxed animate-fadeSlideIn" style={{ animationDelay: '0.2s' }}>
              Todos los modelos disponibles con precios actualizados en tiempo real.
            </p>
          </div>

          {/* Steps */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-0 mb-12 sm:mb-14">
            {/* Step 1 */}
            <div className="relative group sm:pr-4 animate-fadeSlideIn" style={{ animationDelay: '0.3s' }}>
              <div className="rounded-2xl sm:rounded-r-none border border-line dark:border-[#1A2230] dark:sm:border-r-[#1A2230]/40 bg-surface dark:bg-gradient-to-b dark:from-[#0A0E16] dark:to-[#080B10] p-6 h-full">
                <div className="flex items-start gap-4 sm:flex-col sm:items-center sm:text-center">
                  <div className="relative shrink-0">
                    <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-2xl bg-bg-subtle dark:bg-[#0D1220] border border-line dark:border-[#1A2230] flex items-center justify-center sm:mb-1">
                      <img src="/iphones/iphone-15-blue.png" alt="" className="w-22 h-22 sm:w-24 sm:h-24 object-contain" />
                    </div>
                    <span className="absolute -top-1.5 -left-1.5 sm:-top-2 sm:-left-2 w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-[#4A6BDB] text-white text-[10px] sm:text-xs font-bold flex items-center justify-center shadow-[0_0_12px_rgba(74,107,219,0.5)]">
                      1
                    </span>
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-[15px] font-semibold text-fg mb-1">Nuestros modelos</h3>
                    <p className="text-xs sm:text-[13px] text-fg-subtle leading-relaxed">Precios en dólares actualizados en tiempo real</p>
                  </div>
                </div>
              </div>
              <div className="hidden sm:flex absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 z-10 w-8 h-8 rounded-full bg-surface dark:bg-[#0A0E16] border border-line dark:border-[#1A2230] items-center justify-center">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-[#4A6BDB]/60 dark:text-[#6B8AED]/60">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>

            {/* Step 2 */}
            <div className="relative group sm:px-4 animate-fadeSlideIn" style={{ animationDelay: '0.4s' }}>
              <div className="rounded-2xl sm:rounded-none border border-line dark:border-[#1A2230] dark:sm:border-x-[#1A2230]/40 bg-surface dark:bg-gradient-to-b dark:from-[#0A0E16] dark:to-[#080B10] p-6 h-full">
                <div className="flex items-start gap-4 sm:flex-col sm:items-center sm:text-center">
                  <div className="relative shrink-0">
                    <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-2xl bg-bg-subtle dark:bg-[#0D1220] border border-line dark:border-[#1A2230] flex items-center justify-center sm:mb-1">
                      <img src="/iphones/iphone-17-pro-orange.png" alt="" className="w-22 h-22 sm:w-24 sm:h-24 object-contain" />
                    </div>
                    <span className="absolute -top-1.5 -left-1.5 sm:-top-2 sm:-left-2 w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-[#4A6BDB] text-white text-[10px] sm:text-xs font-bold flex items-center justify-center shadow-[0_0_12px_rgba(74,107,219,0.5)]">
                      2
                    </span>
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-[15px] font-semibold text-fg mb-1">Compará precios</h3>
                    <p className="text-xs sm:text-[13px] text-fg-subtle leading-relaxed">Filtrá por modelo, color y almacenamiento</p>
                  </div>
                </div>
              </div>
              <div className="hidden sm:flex absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 z-10 w-8 h-8 rounded-full bg-surface dark:bg-[#0A0E16] border border-line dark:border-[#1A2230] items-center justify-center">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-[#4A6BDB]/60 dark:text-[#6B8AED]/60">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>

            {/* Step 3 */}
            <div className="relative group sm:pl-4 animate-fadeSlideIn" style={{ animationDelay: '0.5s' }}>
              <div className="rounded-2xl sm:rounded-l-none border border-[#4A6BDB]/25 bg-[#4A6BDB]/[0.06] dark:bg-gradient-to-b dark:from-[#0C1024] dark:to-[#0A0E18] p-6 h-full ring-1 ring-[#4A6BDB]/[0.08] shadow-[inset_0_1px_0_rgba(107,138,237,0.06)]">
                <div className="flex items-start gap-4 sm:flex-col sm:items-center sm:text-center">
                  <div className="relative shrink-0">
                    <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-2xl bg-[#4A6BDB]/10 border border-[#4A6BDB]/20 flex items-center justify-center sm:mb-1">
                      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-[#4A6BDB] dark:text-[#6B8AED] sm:w-12 sm:h-12">
                        <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                      </svg>
                    </div>
                    <span className="absolute -top-1.5 -left-1.5 sm:-top-2 sm:-left-2 w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-[#4A6BDB] text-white text-[10px] sm:text-xs font-bold flex items-center justify-center shadow-[0_0_12px_rgba(74,107,219,0.5)]">
                      3
                    </span>
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-[15px] font-semibold text-fg mb-1">Canjeá o comprá</h3>
                    <p className="text-xs sm:text-[13px] text-fg-subtle leading-relaxed">Usá tu iPhone como parte de pago o comprá directo</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="text-center">
            <div className="flex items-center justify-center gap-4 sm:gap-6 mb-6 text-fg-subtle">
              <span className="flex items-center gap-1.5 text-xs">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[#4A6BDB]/60 dark:text-[#6B8AED]/60">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                En tiempo real
              </span>
              <span className="w-1 h-1 rounded-full bg-fg/15" />
              <span className="flex items-center gap-1.5 text-xs">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[#4A6BDB]/60 dark:text-[#6B8AED]/60">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                </svg>
                Mejor precio
              </span>
              <span className="w-1 h-1 rounded-full bg-fg/15" />
              <span className="flex items-center gap-1.5 text-xs">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[#4A6BDB]/60 dark:text-[#6B8AED]/60">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                +{tenant.stats.devicesEvaluated} Clientes
              </span>
            </div>

            {catalogUrl ? (
            <a
              href={catalogUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center gap-2 border border-accent/40 hover:border-accent text-accent hover:bg-accent/10 font-semibold rounded-full pl-6 pr-5 py-3 text-sm sm:text-base transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
            >
              Ver precios y modelos
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
            ) : (
            <button
              onClick={startCotizar}
              className="group inline-flex items-center gap-2 border border-accent/40 hover:border-accent text-accent hover:bg-accent/10 font-semibold rounded-full pl-6 pr-5 py-3 text-sm sm:text-base transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
            >
              Cotizar ahora
            </button>
            )}
          </div>
        </div>
      </section>

      {/* Preguntas frecuentes */}
      <section id="preguntas-frecuentes" className="relative z-10 border-t border-line bg-bg py-16 sm:py-20 scroll-mt-20">
        <div className="max-w-2xl mx-auto px-4 sm:px-6">
          {/* Section header */}
          <div className="text-center mb-10 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-fg">
              Preguntas frecuentes
            </h2>
            <p className="text-fg-subtle text-sm mt-2">Todo lo que necesitás saber antes de vender tu iPhone</p>
          </div>

          {/* FAQ items */}
          <div className="space-y-2.5">
            <FAQItem question="¿Cómo desactivo mi cuenta de iCloud?">
              <p className="text-fg-muted text-[13px] sm:text-sm leading-relaxed mb-4">
                Si vas a vender tu iPhone, te recomendamos desactivar <strong className="text-fg">"Buscar mi iPhone"</strong> y cerrar sesión de iCloud para que el comprador pueda usarlo con su propia cuenta.
              </p>
              <div className="space-y-3.5 bg-fg/[0.03] border border-fg/[0.06] rounded-lg p-4">
                {[
                  { action: 'Abrí', target: 'Ajustes', detail: 'en tu iPhone' },
                  { action: 'Tocá', target: 'tu nombre', detail: '(arriba de todo)' },
                  { action: 'Tocá', target: '"Buscar"', detail: '' },
                  { action: 'Desactivá', target: '"Buscar mi iPhone"', detail: 'e ingresá tu contraseña' },
                ].map((step, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-[#4A6BDB]/15 dark:bg-[#6B8AED]/15 text-[#4A6BDB] dark:text-[#6B8AED] text-[11px] font-bold flex items-center justify-center flex-shrink-0 mt-px">{i + 1}</span>
                    <p className="text-[13px] sm:text-sm text-fg-muted leading-snug pt-0.5">
                      {step.action} <strong className="text-fg">{step.target}</strong>{step.detail ? ` ${step.detail}` : ''}
                    </p>
                  </div>
                ))}
              </div>
            </FAQItem>

            <FAQItem question="¿Cómo me pagan?">
              <p className="text-fg-muted text-[13px] sm:text-sm leading-relaxed">
                El pago es <strong className="text-fg">inmediato</strong>, en efectivo o transferencia bancaria. Podés elegir la forma que prefieras al momento de la venta en el local.
              </p>
            </FAQItem>

            <FAQItem question="¿Dónde están ubicados?">
              <p className="text-fg-muted text-[13px] sm:text-sm leading-relaxed">
                Visitá nuestro local{tenant.contact.address ? <>: <strong className="text-fg">{tenant.contact.address}</strong></> : '.'} Podés coordinar tu visita al momento de la cotización.
              </p>
            </FAQItem>

            <FAQItem question="¿Cuánto tarda cotizar mi iPhone?">
              <p className="text-fg-muted text-[13px] sm:text-sm leading-relaxed">
                <strong className="text-fg">Menos de 1 minuto.</strong> Respondé 4 preguntas sobre tu iPhone y te damos un precio estimado al instante. El valor final está sujeto a revisión del equipo en el local.
              </p>
            </FAQItem>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-line py-8 bg-bg">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            {/* Logo in footer. invert: negro sobre claro / blanco sobre oscuro */}
            <a href={websiteUrl} target={websiteUrl.startsWith('http') ? '_blank' : undefined} rel={websiteUrl.startsWith('http') ? 'noopener noreferrer' : undefined}>
              <img
                src={tenant.brand.logo}
                alt={tenant.brand.name}
                className="h-12 md:h-14 w-auto object-contain"
              />
            </a>

            <p className="text-fg-subtle text-sm">© {new Date().getFullYear()} {tenant.brand.name}. Todos los derechos reservados.</p>

            <div className="flex items-center gap-6">
              {instagramUrl && (
              <a href={instagramUrl} target="_blank" rel="noopener noreferrer"
                 className="text-fg-subtle hover:text-fg transition-colors text-sm">
                Instagram
              </a>
              )}
              {tenant.brand.website && (
              <a href={websiteUrl} target="_blank" rel="noopener noreferrer"
                 className="text-fg-subtle hover:text-fg transition-colors text-sm">
                Sitio web
              </a>
              )}
            </div>
          </div>
        </div>
      </footer>

    </div>
  )
}
