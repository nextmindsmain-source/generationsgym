import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import Magnet from './Magnet'
import useMedia from '../hooks/useMedia'

gsap.registerPlugin(ScrollTrigger, useGSAP)

// Scrub is on for landscape desktops with motion allowed. Everyone else gets the designed still hero.
const SCRUB_QUERY = '(min-width: 1025px) and (orientation: landscape) and (prefers-reduced-motion: no-preference) and (min-height: 561px)'
const VIDEO = '/video/hero-scrub.mp4'
const POSTER = '/img/hero-poster.jpg'

const BANDS = [
  { range: [0, 0.23], k: 'Welland, Ontario', h: ['Your day', 'starts here.'], p: 'A 24 hour gym with a pool, classes and coaches under one roof.' },
  { range: [0.27, 0.5], k: 'Open 24 hours', h: ['Open', 'when you are.'], p: 'Weights, cardio and machines wait for members at 4 am or 9 pm.' },
  { range: [0.54, 0.77], k: 'Land and water', h: ['Land. Water.', 'Together.'], p: 'Aquatic fitness, group classes, personal training and swimming lessons.' },
  { range: [0.81, 1], k: 'Generations Aquatic & Fitness Centre', h: ['We can change your world,', 'one workout at a time.'], last: true },
]

export default function Hero({ ready }) {
  const root = useRef(null)
  const video = useRef(null)
  const ring = useRef(null)
  const scrub = useMedia(SCRUB_QUERY)

  // Intro once the loader lifts
  useGSAP(() => {
    if (!ready) return
    gsap.from('.b0 [data-in]', { y: 50, opacity: 0, duration: 1.2, stagger: .12, ease: 'power4.out', delay: .1 })
    gsap.from('.hero-meta', { opacity: 0, y: 16, duration: 1, delay: .9, ease: 'power3.out' })
  }, { scope: root, dependencies: [ready] })

  // Scroll-scrubbed film + caption bands
  useGSAP(() => {
    if (!scrub) return
    const v = video.current
    const bands = gsap.utils.toArray('.band', root.current)
    const state = { target: 0, shown: 0, raf: 0, busy: false, pending: null, on: true, last: 0 }

    // captions: long plateaus, short eased ramps (paced in scroll distance)
    const tl = gsap.timeline({ scrollTrigger: { trigger: root.current, start: 'top top', end: 'bottom bottom', scrub: 0.5 } })
    bands.forEach((b, i) => {
      const [a, z] = BANDS[i].range
      const f = Math.min(0.025, (z - a) / 3)
      if (i > 0) tl.fromTo(b, { autoAlpha: 0, y: 46 }, { autoAlpha: 1, y: 0, duration: f, ease: 'power2.out' }, a)
      if (!BANDS[i].last) tl.to(b, { autoAlpha: 0, y: -46, duration: f, ease: 'power2.in' }, z - f)
    })
    tl.set({}, {}, 1)
    gsap.fromTo('.hero-scrim', { opacity: 0.55 }, { opacity: 0.95, ease: 'none', scrollTrigger: { trigger: root.current, start: 'top top', end: 'bottom bottom', scrub: true } })
    gsap.to('.hero-cue', { opacity: 0, scrollTrigger: { trigger: root.current, start: 'top top', end: '+=240', scrub: true } })

    // video drive: lerp + gated seeks, rests when converged
    const seek = (t) => {
      if (!v.duration) return
      if (state.busy) { state.pending = t; return }
      state.busy = true
      v.currentTime = Math.min(t, v.duration - 0.05)
    }
    const onSeeked = () => { state.busy = false; if (state.pending !== null) { const t = state.pending; state.pending = null; seek(t) } }
    const onErr = () => { state.busy = false; state.pending = null }
    v.addEventListener('seeked', onSeeked)
    v.addEventListener('error', onErr)

    const tick = (now) => {
      const dt = Math.min(100, now - (state.last || now)); state.last = now
      state.shown += (state.target - state.shown) * (1 - Math.pow(1 - 0.16, dt / 16.667))
      if (Math.abs(state.target - state.shown) < 0.0005) { state.shown = state.target; state.raf = 0; state.last = 0 }
      else state.raf = requestAnimationFrame(tick)
      seek(state.shown * v.duration)
    }
    const st = ScrollTrigger.create({
      trigger: root.current, start: 'top top', end: 'bottom bottom',
      onUpdate: (self) => { state.target = self.progress; if (!state.raf && state.on) state.raf = requestAnimationFrame(tick) },
      onToggle: (self) => { state.on = self.isActive },
    })

    // stream the film as a blob (works on hosts without range support), ring fills while it loads
    let cancelled = false
    ;(async () => {
      try {
        const ctrl = new AbortController()
        let dog = setTimeout(() => ctrl.abort(), 20000)
        const res = await fetch(VIDEO, { priority: 'low', signal: ctrl.signal })
        if (!res.ok || !res.body) throw new Error('no video')
        const total = Number(res.headers.get('Content-Length')) || 6e6
        const reader = res.body.getReader(); const chunks = []; let got = 0, lastRing = 0
        for (;;) {
          const { done, value } = await reader.read()
          if (done) break
          clearTimeout(dog); dog = setTimeout(() => ctrl.abort(), 20000)
          chunks.push(value); got += value.length
          const n = performance.now()
          if (n - lastRing > 100) { lastRing = n; ring.current?.style.setProperty('--ld', Math.round(126 * (1 - Math.min(1, got / total)))) }
        }
        clearTimeout(dog)
        if (cancelled) return
        v.src = URL.createObjectURL(new Blob(chunks, { type: 'video/mp4' }))
        v.load()
        v.addEventListener('canplay', () => {
          seek(st.progress * v.duration)
          v.style.opacity = 1
          ring.current && (ring.current.style.opacity = 0)
        }, { once: true })
      } catch {
        ring.current && (ring.current.style.opacity = 0)  // poster carries the hero on its own
      }
    })()

    return () => {
      cancelled = true
      cancelAnimationFrame(state.raf)
      v.removeEventListener('seeked', onSeeked); v.removeEventListener('error', onErr)
      st.kill()
      v.removeAttribute('src'); v.style.opacity = 0
    }
  }, { scope: root, dependencies: [scrub] })

  return (
    <section ref={root} id="top" className={scrub ? 'relative h-[560vh]' : 'relative'}>
      <div className={scrub ? 'sticky top-0 h-svh overflow-hidden' : 'relative min-h-svh overflow-hidden'}>
        <img src={POSTER} alt="" className="absolute inset-0 h-full w-full object-cover" fetchPriority="high" />
        {scrub && <video ref={video} muted playsInline preload="none" aria-hidden="true" tabIndex={-1} className="absolute inset-0 h-full w-full object-cover opacity-0 transition-opacity duration-700 will-change-transform" />}

        {/* legibility: global vignette, bottom floor scrim that deepens with scroll */}
        <div className="pointer-events-none absolute inset-0" style={{ background: 'radial-gradient(ellipse 120% 90% at 50% 40%, rgba(246,252,253,0) 55%, rgba(246,252,253,.35) 100%)' }} />
        <div className="hero-scrim pointer-events-none absolute inset-x-0 bottom-0 h-[78%]" style={{ background: 'linear-gradient(to top, rgba(246,252,253,.97) 0%, rgba(246,252,253,.82) 42%, rgba(246,252,253,0) 100%)' }} />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-40" style={{ background: 'linear-gradient(to bottom, rgba(246,252,253,.85), rgba(246,252,253,0))' }} />

        <div className="wrap relative flex h-full min-h-svh flex-col justify-end pb-16 pt-28 lg:pb-20">
          <div className={scrub ? 'relative h-[min(46svh,420px)]' : 'flex flex-col gap-20'}>
            {BANDS.map((b, i) => {
              const showStatic = !scrub && b.last
              if (!scrub && !showStatic) return null
              return (
                <div key={i} className={`band b${i} tshadow ${scrub ? 'absolute inset-x-0 bottom-0' : ''} ${scrub && i > 0 ? 'invisible' : ''}`}>
                  <p data-in className="mono mb-5 flex items-center gap-3 text-blue"><span className="h-px w-10 bg-blue" />{b.k}</p>
                  <h1 data-in={i === 0 ? '' : undefined} className={`display ${b.last ? 'text-[clamp(2.6rem,6.2vw,6.6rem)]' : 'text-[clamp(3rem,9.2vw,9.5rem)]'}`} {...(i > 0 ? { 'aria-level': 2, role: 'heading' } : {})}>
                    {b.h.map((l, j) => <span key={j} data-in className={`block ${j === 1 ? 'sunrise-text' : ''}`}>{l}</span>)}
                  </h1>
                  {b.p && <p data-in className="mt-6 max-w-[46ch] text-lg text-bone/90 md:text-xl">{b.p}</p>}
                  {b.last && (
                    <div data-in className="mt-9 flex flex-wrap items-center gap-4">
                      <Magnet padding={80} magnetStrength={4}><a href="https://www.generationsgym.com/join-now" className="btn btn-lime">Join now</a></Magnet>
                      <Magnet padding={80} magnetStrength={4}><a href="https://www.generationsgym.com/memberships-pricing" className="btn btn-ghost">Memberships &amp; pricing</a></Magnet>
                      <p className="mono basis-full text-bone/80 md:basis-auto md:pl-4">One week free trial. Call <a className="text-blue underline-offset-4 hover:underline" href="tel:+19057321278">905.732.1278</a></p>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {scrub && (
          <>
            <svg ref={ring} className="absolute bottom-8 right-8 h-9 w-9 text-blue transition-opacity duration-500 max-lg:hidden" style={{ '--ld': 126 }} viewBox="0 0 48 48" aria-hidden="true">
              <circle cx="24" cy="24" r="20" fill="none" stroke="currentColor" strokeWidth="3" strokeDasharray="126" style={{ strokeDashoffset: 'var(--ld,126)' }} transform="rotate(-90 24 24)" />
            </svg>
            <div className="hero-cue mono absolute left-1/2 top-24 hidden -translate-x-1/2 flex-col items-center gap-3 text-bone/70 xl:flex">
              Scroll
              <span className="relative block h-12 w-px overflow-hidden bg-bone/20"><span className="absolute inset-0 bg-blue" style={{ animation: 'cue 1.8s cubic-bezier(.6,0,.2,1) infinite' }} /></span>
            </div>
          </>
        )}
        <p className="hero-meta mono absolute right-[clamp(20px,4vw,64px)] top-24 hidden text-right text-bone/70 md:block">
          618 South Pelham Road<br />Welland, ON
        </p>
      </div>
    </section>
  )
}
