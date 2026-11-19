import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'

const DOTS = ['#98141f', '#c23028', '#ee763b', '#f7941d', '#f9ac17', '#f9c910', '#d6e01f', '#afb91b', '#9faf1e', '#9faf1e']

export default function Loader({ onDone }) {
  const root = useRef(null)
  const doneRef = useRef(onDone)
  const [n, setN] = useState(0)

  useEffect(() => {
    const ctx = gsap.context(() => {
      const state = { v: 0 }
      const tl = gsap.timeline()
      tl.from('.ld-dot', { scale: 0, opacity: 0, duration: .6, stagger: .07, ease: 'back.out(2)' })
        .to(state, { v: 100, duration: 1.4, ease: 'power2.inOut', onUpdate: () => setN(Math.round(state.v)) }, 0)
        .to('.ld-ring', { rotate: 360, duration: 1.6, ease: 'power2.inOut' }, 0)
        .to('.ld-inner', { opacity: 0, y: -20, duration: .4 }, '+=.15')
        .call(() => doneRef.current && doneRef.current())
        .to(root.current, { yPercent: -100, duration: .9, ease: 'power4.inOut' }, '<')
        .set(root.current, { display: 'none' })
    }, root)
    return () => ctx.revert()
  }, [])

  return (
    <div ref={root} className="fixed inset-0 z-[100] grid place-items-center bg-ink" role="status" aria-label="Loading">
      <div className="ld-inner flex flex-col items-center gap-8">
        <div className="ld-ring relative h-28 w-28">
          {DOTS.map((c, i) => {
            const a = (i / DOTS.length) * Math.PI * 2
            return <span key={i} className="ld-dot absolute h-4 w-4 rounded-full" style={{ background: c, left: `calc(50% + ${Math.cos(a) * 46}px - 8px)`, top: `calc(50% + ${Math.sin(a) * 46}px - 8px)` }} />
          })}
        </div>
        <img src="/img/logo-wide.png" alt="Generations" className="h-7 w-auto" />
        <span className="mono text-mute tabular-nums">{String(n).padStart(3, '0')}</span>
      </div>
    </div>
  )
}
