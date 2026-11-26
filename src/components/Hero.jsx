import { useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import Magnet from './Magnet'
import HeroDots from './HeroDots'
import useMedia from '../hooks/useMedia'

gsap.registerPlugin(ScrollTrigger, useGSAP)
// phone address bars resize the viewport while scrolling; don't re-measure for that
ScrollTrigger.config({ ignoreMobileResize: true })

// The film scrubs on every screen. Only reduced-motion visitors get the still hero.
const MOTION = '(prefers-reduced-motion: no-preference)'
const PORTRAIT = '(max-aspect-ratio: 4/5)'

// The films are animated from the centre's cycle studio photo, with an AI rider added.
const BANDS = [
  { range: [0, 0.22], k: '618 South Pelham Road, Welland', h: ['Your day', 'starts here.'], p: 'A 24 hour gym with a pool, classes and coaches under one roof.' },
  { range: [0.31, 0.53], k: 'Open 24 hours', h: ['Open', 'when you are.'], p: 'Weights, cardio and machines wait for members at 4 am or 9 pm.' },
  { range: [0.62, 0.81], k: 'Cycle, strength and pool', h: ['Ride. Lift.', 'Swim.'], p: 'Group classes, aquatic fitness, personal training and swimming lessons.' },
  { range: [0.85, 1], k: 'Generations Aquatic & Fitness Centre', h: ['We can change your world,', 'one workout at a time.'], last: true },
]

export default function Hero({ ready }) {
  const root = useRef(null)
  const stage = useRef(null)
  const video = useRef(null)
  const ring = useRef(null)
  const progress = useRef(0)
  const scrub = useMedia(MOTION)
  const portrait = useMedia(PORTRAIT)
  const src = portrait ? '/video/hero-mobile.mp4' : '/video/hero-scrub.mp4'

  // Intro once the loader lifts
  useGSAP(() => {
    if (!ready) return
    gsap.from('.b0 [data-in]', { y: 60, opacity: 0, rotateX: -60, transformPerspective: 900, duration: 1.2, stagger: .12, ease: 'power4.out', delay: .1 })
  }, { scope: root, dependencies: [ready] })

  // Scroll-scrubbed film, 3D captions, 3D exit
  useGSAP(() => {
    if (!scrub) return
    const v = video.current
    const bands = gsap.utils.toArray('.band', root.current)
    const state = { target: 0, shown: 0, raf: 0, busy: false, pending: null, last: 0 }

    const tl = gsap.timeline({ scrollTrigger: { trigger: root.current, start: 'top top', end: 'bottom bottom', scrub: 0.5 } })
    bands.forEach((b, i) => {
      const [a, z] = BANDS[i].range
      const f = Math.min(0.03, (z - a) / 3)
      if (i > 0) tl.fromTo(b, { autoAlpha: 0, y: 70, rotateX: -55, transformPerspective: 900 }, { autoAlpha: 1, y: 0, rotateX: 0, duration: f, ease: 'power2.out' }, a)
      if (!BANDS[i].last) tl.to(b, { autoAlpha: 0, y: -70, rotateX: 45, transformPerspective: 900, duration: f, ease: 'power2.in' }, z - f)
    })
    tl.set({}, {}, 1)
    gsap.to('.hero-cue', { opacity: 0, scrollTrigger: { trigger: root.current, start: 'top top', end: '+=240', scrub: true } })

    // as the hero leaves, the whole stage tips back into a 3D card
    gsap.to(stage.current, {
      rotateX: 18, scale: 0.88, borderRadius: 40, transformPerspective: 1200, transformOrigin: '50% 100%', ease: 'none',
      scrollTrigger: { trigger: root.current, start: 'bottom bottom', end: 'bottom 25%', scrub: true },
    })

    // video drive: lerp + gated seeks, rests when converged
    const seek = (t) => {
      if (!v.duration) return
      if (state.busy) { state.pending = t; return }
      const next = Math.max(0, Math.min(t, v.duration - 0.05))
      if (Math.abs(v.currentTime - next) < 0.001) return
      state.busy = true
      v.currentTime = next
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
      onUpdate: (self) => {
        state.target = progress.current = self.progress
        if (!state.raf) state.raf = requestAnimationFrame(tick)
      },
    })

    // iOS only paints seeked frames after the video has been played once
    const prime = () => { v.play()?.then(() => { v.pause(); seek(st.progress * v.duration) }).catch(() => {}) }
    addEventListener('touchstart', prime, { once: true, passive: true })

    const reveal = () => { v.style.opacity = 1; if (ring.current) ring.current.style.opacity = 0 }
    const onMeta = () => { prime(); seek(st.progress * v.duration) }
    v.addEventListener('loadedmetadata', onMeta)
    v.addEventListener('loadeddata', reveal)

    // stream the film as a blob (works on hosts without range support), ring fills while it loads
    let cancelled = false, url = ''
    const ctrl = new AbortController()
    ;(async () => {
      let dog
      try {
        dog = setTimeout(() => ctrl.abort(), 20000)
        const res = await fetch(src, { priority: 'low', signal: ctrl.signal })
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
        if (cancelled) return
        url = URL.createObjectURL(new Blob(chunks, { type: 'video/mp4' }))
        v.src = url
        v.load()
      } catch {
        if (ring.current) ring.current.style.opacity = 0 // the poster carries the hero on its own
      } finally {
        clearTimeout(dog)
      }
    })()

    return () => {
      cancelled = true
      ctrl.abort()
      cancelAnimationFrame(state.raf)
      removeEventListener('touchstart', prime)
      v.removeEventListener('seeked', onSeeked); v.removeEventListener('error', onErr)
      v.removeEventListener('loadedmetadata', onMeta); v.removeEventListener('loadeddata', reveal)
      st.kill()
      v.removeAttribute('src'); v.load(); v.style.opacity = 0
      if (url) URL.revokeObjectURL(url)
    }
  }, { scope: root, dependencies: [scrub, src], revertOnUpdate: true })

  return (
    <section ref={root} id="top" className={scrub ? 'relative h-[520vh]' : 'relative'}>
      <div className={scrub ? 'sticky top-0 h-svh' : 'relative min-h-svh'}>
        <div ref={stage} className={`on-navy relative overflow-hidden will-change-transform ${scrub ? 'h-full' : 'min-h-svh'}`}>
          <picture>
            <source media={PORTRAIT} srcSet="/img/hero-poster-mobile.jpg" />
            <img src="/img/hero-poster.jpg" alt="A rider training on a spin bike in the Generations cycle studio" className="absolute inset-0 h-full w-full object-cover" fetchPriority="high" />
          </picture>
          {scrub && <video ref={video} muted playsInline preload="auto" aria-hidden="true" tabIndex={-1} className="absolute inset-0 h-full w-full object-cover opacity-0 transition-opacity duration-700" />}
          {scrub && <HeroDots progress={progress} className="pointer-events-none absolute inset-0" />}

          {/* legibility: navy floor behind the type, plus a side wash on wide screens where the copy sits */}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[70%] lg:h-[55%]" style={{ background: 'linear-gradient(to top, rgba(6,45,67,.96) 0%, rgba(6,45,67,.82) 38%, rgba(6,45,67,0) 100%)' }} />
          <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-[62%] lg:block" style={{ background: 'linear-gradient(to left, rgba(6,45,67,.82) 0%, rgba(6,45,67,.5) 55%, rgba(6,45,67,0) 100%)' }} />
          <div className="pointer-events-none absolute inset-x-0 top-0 h-36" style={{ background: 'linear-gradient(to bottom, rgba(6,45,67,.85), rgba(6,45,67,0))' }} />

          <div className={`wrap relative flex flex-col justify-end pb-8 pt-24 lg:pb-16 ${scrub ? 'h-full' : 'min-h-svh'}`}>
            <div className={scrub ? 'relative h-[min(46svh,420px)]' : ''}>
              {BANDS.map((b, i) => {
                if (!scrub && !b.last) return null
                const Tag = i === 0 || !scrub ? 'h1' : 'h2'
                return (
                  <div key={i} className={`band b${i} tshadow ${scrub ? 'absolute inset-x-0 bottom-0 lg:left-auto lg:w-[54%]' : 'lg:ml-auto lg:w-[54%]'} ${scrub && i > 0 ? 'invisible' : ''}`}>
                    <p data-in className="mono mb-3 flex items-center gap-3 text-blue lg:mb-5"><span className="h-px w-10 shrink-0 bg-blue" />{b.k}</p>
                    <Tag className={`display ${b.last ? 'text-[clamp(2.5rem,4.4vw,4.9rem)]' : 'text-[clamp(3.2rem,7.2vw,7.6rem)]'}`}>
                      {b.h.map((l, j) => <span key={j} data-in className={`block ${j === 1 ? 'sunrise-text' : ''}`}>{l}</span>)}
                    </Tag>
                    {b.p && <p data-in className="mt-4 max-w-[46ch] text-base text-bone md:text-xl lg:mt-6">{b.p}</p>}
                    {b.last && (
                      <div data-in className="mt-5 flex flex-wrap items-center gap-3 lg:mt-9 lg:gap-4">
                        <Magnet padding={80} magnetStrength={4}><a href="https://www.generationsgym.com/join-now" className="btn btn-lime">Join now</a></Magnet>
                        <Magnet padding={80} magnetStrength={4}><a href="https://www.generationsgym.com/memberships-pricing" className="btn btn-ghost">Memberships</a></Magnet>
                        <p className="mono basis-full text-bone md:basis-auto md:pl-4">One week free trial. Call <a className="inline-block py-2 text-blue underline underline-offset-4" href="tel:+19057321278">905.732.1278</a></p>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {scrub && (
            <>
              <svg ref={ring} className="absolute right-4 top-24 h-9 w-9 text-lime transition-opacity duration-500 lg:right-8" style={{ '--ld': 126 }} viewBox="0 0 48 48" aria-hidden="true">
                <circle cx="24" cy="24" r="20" fill="none" stroke="currentColor" strokeWidth="4" strokeDasharray="126" style={{ strokeDashoffset: 'var(--ld,126)' }} transform="rotate(-90 24 24)" />
              </svg>
              <div className="hero-cue mono absolute left-1/2 top-24 flex -translate-x-1/2 flex-col items-center gap-3 text-bone">
                Scroll
                <span className="relative block h-12 w-px overflow-hidden bg-bone/20"><span className="absolute inset-0 bg-blue" style={{ animation: 'cue 1.8s cubic-bezier(.6,0,.2,1) infinite' }} /></span>
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  )
}
