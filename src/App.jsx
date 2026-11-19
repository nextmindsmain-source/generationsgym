import { useCallback, useEffect, useState } from 'react'
import Lenis from 'lenis'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Loader from './components/Loader'
import Nav from './components/Nav'
import Hero from './components/Hero'
import { Marquee, Manifesto, Services, Hours, Inside, Join, Contact, Footer } from './components/Sections'

gsap.registerPlugin(ScrollTrigger)

export default function App() {
  const [ready, setReady] = useState(false)
  const done = useCallback(() => setReady(true), [])

  useEffect(() => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const lenis = new Lenis({ lerp: 0.1, wheelMultiplier: 1 })
    lenis.on('scroll', ScrollTrigger.update)
    const raf = (t) => lenis.raf(t * 1000)
    gsap.ticker.add(raf)
    gsap.ticker.lagSmoothing(0)
    return () => { gsap.ticker.remove(raf); lenis.destroy() }
  }, [])

  useEffect(() => {
    // fonts and images shift layout; keep pin distances honest
    const r = () => ScrollTrigger.refresh()
    document.fonts?.ready.then(r)
    addEventListener('load', r)
    return () => removeEventListener('load', r)
  }, [])

  return (
    <div className="grain">
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[200] focus:rounded-full focus:bg-lime focus:px-5 focus:py-3 focus:text-bone">Skip to content</a>
      <Loader onDone={done} />
      <Nav />
      <main id="main" tabIndex={-1}>
        <Hero ready={ready} />
        <Marquee />
        <Manifesto />
        <Services />
        <Hours />
        <Inside />
        <Join />
        <Contact />
      </main>
      <Footer />
    </div>
  )
}
