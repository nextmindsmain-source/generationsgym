import { useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import SplitText from './SplitText'
import ScrollVelocity from './ScrollVelocity'
import Magnet from './Magnet'
import Aurora from './Aurora'
import Orbit from './Orbit'

gsap.registerPlugin(ScrollTrigger, useGSAP)

/* ───────────────────────── Marquee ───────────────────────── */
export function Marquee() {
  return (
    <div className="relative overflow-hidden bg-lime py-5" aria-hidden="true">
      <ScrollVelocity
        texts={['24 Hour Gym  ✦  Aquatic Fitness  ✦  Group Fitness  ✦  Personal Training  ✦  Swimming Lessons  ✦  ']}
        velocity={60}
        className="display px-6 text-[clamp(2.2rem,5vw,4.5rem)] text-bone/90"
        numCopies={4}
      />
    </div>
  )
}

/* ───────────────────────── Manifesto ───────────────────────── */
const HEAD = [['Your', 0], ['partner', 0], ['in', 0], ['fitness', 1], ['and', 0], ['wellness.', 1]]

function HourRing() {
  return (
    <svg viewBox="0 0 100 100" className="h-24 w-24 sm:h-28 sm:w-28" aria-hidden="true">
      {Array.from({ length: 24 }, (_, i) => {
        const a = (i / 24) * Math.PI * 2 - Math.PI / 2
        return <circle key={i} cx={50 + Math.cos(a) * 42} cy={50 + Math.sin(a) * 42} r="3.2" fill="currentColor" className="hr-dot" style={{ animationDelay: `${(i / 24) * -6}s` }} />
      })}
      <circle cx="50" cy="50" r="7" fill="#eeff42" />
    </svg>
  )
}

export function Manifesto() {
  const root = useRef(null)
  const count = useRef(null)

  useGSAP(() => {
    const mm = gsap.matchMedia()
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      gsap.fromTo('.mw', { opacity: 0.12, y: 14 }, { opacity: 1, y: 0, stagger: 0.12, ease: 'none', scrollTrigger: { trigger: '.mtext', start: 'top 82%', end: 'bottom 55%', scrub: true } })
      gsap.from('.mcopy > *', { y: 30, opacity: 0, duration: 1, stagger: 0.12, ease: 'power3.out', scrollTrigger: { trigger: '.mcopy', start: 'top 85%' } })
      gsap.from('.mphoto', { clipPath: 'inset(18% 18% 18% 18% round 36px)', duration: 1.4, ease: 'power4.out', scrollTrigger: { trigger: '.mphotos', start: 'top 80%' } })
      gsap.fromTo('.mphoto-img', { yPercent: -7 }, { yPercent: 7, ease: 'none', scrollTrigger: { trigger: '.mphotos', start: 'top bottom', end: 'bottom top', scrub: true } })
      gsap.fromTo('.mphoto2', { yPercent: 14 }, { yPercent: -10, ease: 'none', scrollTrigger: { trigger: '.mphotos', start: 'top bottom', end: 'bottom top', scrub: true } })
      gsap.from('.bento > *', { y: 70, opacity: 0, duration: 1, stagger: 0.12, ease: 'power3.out', scrollTrigger: { trigger: '.bento', start: 'top 88%' } })
      const n = { v: 0 }
      gsap.to(n, { v: 6, duration: 1.6, ease: 'power2.out', scrollTrigger: { trigger: '.bento', start: 'top 80%' }, onUpdate: () => { if (count.current) count.current.textContent = Math.round(n.v) } })
    })
  }, { scope: root })

  return (
    <section ref={root} className="relative overflow-hidden py-[clamp(90px,13vw,190px)]">
      <div className="wrap">
        <div className="grid items-center gap-16 lg:grid-cols-12 lg:gap-10">
          {/* copy */}
          <div className="lg:col-span-7">
            <p className="mono mb-8 flex items-center gap-3 text-blue"><span className="h-px w-10 bg-blue" />Who we are</p>
            <h2 className="mtext display text-[clamp(3rem,7.4vw,7.4rem)] !leading-[.92]">
              {HEAD.map(([w, hi], i) => (
                <span key={i} className={`mw inline-block pr-[.2em] ${hi ? 'sunrise-text' : ''}`}>{w}</span>
              ))}
            </h2>
            <div className="mcopy mt-10 grid max-w-[60ch] gap-6">
              <p className="text-[clamp(1.15rem,1.6vw,1.45rem)] leading-snug text-bone">
                A customized experience in a 24 hour facility, built around the member you are today and the one you are becoming.
              </p>
              <p className="text-mute">Strength floor, pool, studio and coaches share one roof in Welland.</p>
              <a href="https://www.generationsgym.com/about-us-our-team" className="mono group inline-flex w-fit items-center gap-4 text-blue">
                Meet the team
                <span className="grid h-11 w-11 place-items-center rounded-full border border-blue/40 transition-all duration-500 group-hover:translate-x-1 group-hover:bg-blue group-hover:text-white" aria-hidden="true">→</span>
              </a>
            </div>
          </div>

          {/* photos */}
          <div className="mphotos relative mx-auto w-full max-w-[560px] sm:pb-16 lg:col-span-5 lg:max-w-none">
            <div className="mphoto relative aspect-[4/5] overflow-hidden rounded-[36px] bg-ink-3">
              <img src="/img/real-gym-weights.jpg" alt="Dumbbell rack and benches on the Generations gym floor" loading="lazy" className="mphoto-img absolute inset-0 h-[114%] w-full -translate-y-[7%] object-cover" />
              <div className="absolute inset-x-0 bottom-0 h-1/3" style={{ background: 'linear-gradient(to top, rgba(6,45,67,.55), rgba(6,45,67,0))' }} />
              <span className="mono absolute bottom-5 left-6 text-white">618 South Pelham Rd</span>
            </div>
            <div className="mphoto2 absolute -bottom-2 -left-4 hidden w-[46%] overflow-hidden rounded-[28px] border-[6px] border-ink shadow-[0_30px_60px_-20px_rgba(6,45,67,.45)] sm:block lg:-left-10">
              <img src="/img/pool.jpg" alt="" loading="lazy" className="aspect-[4/3] w-full object-cover" />
            </div>
            <div className="absolute -right-3 top-8 grid h-36 w-36 place-items-center rounded-full bg-lime shadow-[0_20px_50px_-15px_rgba(6,45,67,.5)] sm:h-40 sm:w-40 lg:-right-8" aria-hidden="true">
              <svg viewBox="0 0 200 200" className="absolute inset-0 h-full w-full spin-slow">
                <defs><path id="badge" d="M100,100 m-78,0 a78,78 0 1,1 156,0 a78,78 0 1,1 -156,0" /></defs>
                <text className="mono" fill="#062d43" style={{ fontSize: 15, letterSpacing: '.22em' }}><textPath href="#badge">Open 24 hours • Welland Ontario • </textPath></text>
              </svg>
              <img src="/img/logo-square.png" alt="" className="relative h-14 w-auto sm:h-16" />
            </div>
          </div>
        </div>

        {/* bento stats */}
        <div className="bento mt-[clamp(70px,9vw,130px)] grid gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-5">
          <article className="on-navy group relative flex min-h-[300px] flex-col justify-between overflow-hidden rounded-[32px] p-7 transition-transform duration-500 hover:-translate-y-2 lg:col-span-1">
            <div className="text-lime"><HourRing /></div>
            <div>
              <p className="display text-[clamp(3.6rem,6vw,6rem)] text-white">24/7</p>
              <p className="mono mt-3 text-lime">Member access</p>
              <p className="mt-3 max-w-[26ch] text-sm text-mute">Weights, cardio and machines, any hour you choose.</p>
            </div>
          </article>

          <a href="tel:+19057321278" className="group relative flex min-h-[300px] flex-col justify-between overflow-hidden rounded-[32px] bg-lime p-7 transition-transform duration-500 hover:-translate-y-2">
            <span className="mono flex items-center justify-between text-navy">Try us <span className="grid h-11 w-11 place-items-center rounded-full bg-navy text-white transition-transform duration-500 group-hover:rotate-45" aria-hidden="true">↗</span></span>
            <div>
              <p className="display text-[clamp(3.6rem,6vw,6rem)] text-navy">1 week</p>
              <p className="mono mt-3 text-navy">Free trial</p>
              <p className="mt-3 max-w-[26ch] text-sm text-navy/80">Call 905.732.1278 to book yours.</p>
            </div>
          </a>

          <article className="group relative flex min-h-[300px] flex-col justify-between gap-8 overflow-hidden rounded-[32px] bg-ink-3 p-7 transition-transform duration-500 hover:-translate-y-2">
            <ul className="flex flex-wrap gap-2" aria-label="What is included">
              {['Gym', 'Aquatic', 'Group', 'Personal', 'Performance', 'Lessons'].map((t) => (
                <li key={t} className="mono rounded-full border border-navy/25 px-3 py-1.5 text-[11px] text-navy transition-colors duration-300 hover:bg-navy hover:text-white">{t}</li>
              ))}
            </ul>
            <div>
              <p className="display text-[clamp(3.6rem,6vw,6rem)] text-navy"><span ref={count}>6</span></p>
              <p className="mono mt-3 text-blue">Ways to move</p>
              <p className="mt-3 max-w-[26ch] text-sm text-mute">One roof, land and water, all in one membership.</p>
            </div>
          </article>

          <article className="group relative flex min-h-[300px] flex-col justify-between overflow-hidden rounded-[32px] border border-navy/15 bg-white p-7 transition-transform duration-500 hover:-translate-y-2">
            <div className="flex items-center gap-3">
              <span className="relative grid h-11 w-11 place-items-center rounded-full bg-navy" aria-hidden="true">
                <span className="absolute inset-0 animate-ping rounded-full bg-navy/40" />
                <span className="relative h-3 w-3 rounded-full bg-lime" />
              </span>
              <span className="mono text-blue">You are here</span>
            </div>
            <div>
              <p className="display sunrise-text text-[clamp(3.2rem,5.4vw,5.4rem)]">Welland</p>
              <p className="mono mt-3 text-blue">Ontario</p>
              <p className="mt-3 max-w-[26ch] text-sm text-mute">618 South Pelham Road, L3C 3C8.</p>
            </div>
            <div className="sunrise absolute inset-x-0 bottom-0 h-1.5" />
          </article>
        </div>
      </div>
    </section>
  )
}

/* ───────────────────────── Services (horizontal) ───────────────────────── */
const SERVICES = [
  ['24 Hour Gym', '/img/dawn.jpg', 'Weights, cardio and machines, available to members 24/7. Train before work, after work, or in the middle of the night.', 'https://www.generationsgym.com/memberships-pricing'],
  ['Aquatic Fitness', '/img/pool.jpg', 'Low-impact workouts that use the buoyancy and resistance of water. Gentle on joints, serious about results.', 'https://www.generationsgym.com/aquatic-fitness'],
  ['Group Fitness', '/img/cycling.jpg', 'Aqua fitness, cycling, Pilates, boxing and yoga with instructors who keep the room moving. Strength, endurance, mobility, flexibility.', 'https://www.generationsgym.com/group-fitness-classes'],
  ['Personal Training', '/img/kettlebells.jpg', 'A coach built around your goals: fitness, toning, rehab from sports injuries, and relief from chronic pain.', 'https://www.generationsgym.com/personal-training'],
  ['Performance Training', '/img/sled.jpg', 'Sleds, ropes and racks for people who want to get faster, stronger and harder to tire out.', 'https://www.generationsgym.com/services-1'],
  ['Swimming Lessons', '/img/underwater.jpg', 'Learn, improve or just feel at home in the water, with coaches who meet you where you are.', 'https://www.generationsgym.com/swimming-lessons'],
]

export function Services() {
  const root = useRef(null)
  const track = useRef(null)
  const bar = useRef(null)

  useGSAP(() => {
    const mm = gsap.matchMedia()
    mm.add('(min-width: 1025px) and (prefers-reduced-motion: no-preference)', () => {
      const dist = () => track.current.scrollWidth - innerWidth + 0
      const tween = gsap.to(track.current, {
        x: () => -dist(), ease: 'none',
        scrollTrigger: { trigger: '.svc-pin', start: 'top top', end: () => '+=' + dist(), pin: true, scrub: 0.6, invalidateOnRefresh: true, anticipatePin: 1,
          onUpdate: (s) => { bar.current && (bar.current.style.transform = `scaleX(${s.progress})`) } },
      })
      gsap.utils.toArray('.svc-img').forEach((img) => {
        gsap.fromTo(img, { xPercent: -8 }, { xPercent: 8, ease: 'none', scrollTrigger: { trigger: img.parentElement, containerAnimation: tween, start: 'left right', end: 'right left', scrub: true } })
      })
    })
    mm.add('(max-width: 1024px), (prefers-reduced-motion: reduce)', () => {
      gsap.utils.toArray('.svc').forEach((c) => gsap.from(c, { y: 60, opacity: 0, duration: 1, ease: 'power3.out', scrollTrigger: { trigger: c, start: 'top 88%' } }))
    })
  }, { scope: root })

  return (
    <section ref={root} id="services" className="relative bg-ink-2">
      <div className="svc-pin flex flex-col justify-center overflow-hidden py-24 lg:h-svh lg:py-0">
        <div className="wrap mb-10 flex items-end justify-between gap-8 lg:mb-8">
          <div>
            <p className="mono mb-5 flex items-center gap-3 text-blue"><span className="h-px w-10 bg-blue" />What we do</p>
            <SplitText text="Six ways to move" tag="h2" splitType="words" textAlign="left" className="display text-[clamp(2.8rem,6.5vw,6.2rem)]" delay={80} />
          </div>
          <div className="hidden w-48 lg:block" aria-hidden="true">
            <div className="mono mb-3 text-right text-mute">Scroll →</div>
            <div className="h-px w-full bg-bone/15"><div ref={bar} className="sunrise h-full origin-left" style={{ transform: 'scaleX(0)' }} /></div>
          </div>
        </div>
        <div ref={track} className="flex flex-col gap-6 px-[clamp(20px,4vw,64px)] lg:w-max lg:flex-row lg:gap-8 lg:pl-[max(64px,calc((100vw-1440px)/2+64px))] lg:pr-[20vw]">
          {SERVICES.map(([title, img, text, href], i) => (
            <article key={title} className="svc group relative isolate flex h-[min(520px,70svh)] shrink-0 flex-col justify-end overflow-hidden rounded-[28px] border border-bone/10 lg:h-[min(58svh,560px)] lg:w-[min(46vw,640px)]">
              <div className="absolute inset-0 -z-10 overflow-hidden">
                <img src={img} alt="" loading="lazy" className="svc-img h-full w-full scale-[1.18] object-cover transition-transform duration-[1400ms] ease-out group-hover:scale-[1.24] lg:w-[116%] lg:max-w-none" />
              </div>
              <div className="absolute inset-0 -z-10" style={{ background: 'linear-gradient(to top, rgba(246,252,253,.97) 8%, rgba(246,252,253,.8) 42%, rgba(246,252,253,0) 78%)' }} />
              <span className="mono absolute left-7 top-7 text-bone/80">0{i + 1} / 06</span>
              <div className="p-7 sm:p-9">
                <h3 className="display text-[clamp(2.4rem,4vw,4rem)]">{title}</h3>
                <p className="mt-4 max-w-[44ch] text-bone/85">{text}</p>
                <a href={href} className="mono mt-6 inline-flex items-center gap-3 text-blue transition-[gap] duration-500 hover:gap-5">Learn more <span aria-hidden="true">→</span></a>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ───────────────────────── 24 hour clock (Three.js) ───────────────────────── */
const HOURS = [
  'Night shift. The floor is yours.', 'Quiet hours. Quiet focus.', 'Nobody here but you and the weights.', 'The early crew is almost up.', 'First light on the machines.', 'Sunrise lap in the pool.',
  'Before-work lift.', 'Morning classes begin.', 'Coffee, then cardio.', 'Midmorning swim.', 'Personal training in full swing.', 'Pre-lunch push.',
  'Lunch break sweat.', 'Quiet midday floor.', 'Afternoon aqua fitness.', 'The after-school rush starts.', 'Golden hour on the treadmills.', 'After-work crowd.',
  'Evening class time.', 'Last cycle of the day.', 'Wind-down swim.', 'Late lifts.', 'The night owls arrive.', 'Almost tomorrow. Still open.',
]

export function Hours() {
  const root = useRef(null)
  const progress = useRef(0)
  const [hour, setHour] = useState(0)
  const fmt = (h) => `${String(h).padStart(2, '0')}:00`

  useGSAP(() => {
    const mm = gsap.matchMedia()
    mm.add('(min-width: 1025px) and (prefers-reduced-motion: no-preference)', () => {
      ScrollTrigger.create({ trigger: '.hrs-pin', start: 'top top', end: '+=240%', pin: true, scrub: true, anticipatePin: 1, onUpdate: (s) => { progress.current = s.progress } })
    })
    mm.add('(max-width: 1024px), (prefers-reduced-motion: reduce)', () => {
      ScrollTrigger.create({ trigger: root.current, start: 'top bottom', end: 'bottom top', onUpdate: (s) => { progress.current = s.progress } })
    })
  }, { scope: root })

  return (
    <section ref={root} id="hours" className="on-navy relative">
      <div className="hrs-pin relative flex min-h-svh items-center overflow-hidden py-24 lg:py-0">
        <img src="/img/real-cardio.jpg" alt="" loading="lazy" className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-10 grayscale" aria-hidden="true" />
        <div className="pointer-events-none absolute inset-0" style={{ background: 'radial-gradient(ellipse 70% 60% at 72% 50%, rgba(6,45,67,0) 0%, rgba(6,45,67,.55) 100%)' }} aria-hidden="true" />
        <div className="wrap grid w-full items-center gap-10 lg:grid-cols-[1fr_1.15fr]">
          <div className="relative z-10">
            <p className="mono mb-5 flex items-center gap-3 text-blue"><span className="h-px w-10 bg-blue" />24 hour gym</p>
            <SplitText text="The doors never close." tag="h2" splitType="words" textAlign="left" className="display text-[clamp(3rem,7vw,6.8rem)]" delay={80} />
            <p className="mt-7 max-w-[44ch] text-lg text-bone/85">Night shift, early bird or lunch break. Scroll to sweep through a day at Generations and see what the floor feels like at each hour.</p>
            <div className="mt-10 flex items-end gap-6 border-t border-bone/15 pt-8" aria-live="off">
              <span className="display sunrise-text min-w-[4.4ch] text-[clamp(3.4rem,6vw,5.6rem)] tabular-nums">{fmt(hour)}</span>
              <span className="mb-2 max-w-[28ch] text-lg text-bone/90">{HOURS[hour]}</span>
            </div>
          </div>
          <div className="relative mx-auto aspect-square w-full max-w-[640px]">
            <Orbit variant="clock" progress={progress} onHour={setHour} className="absolute inset-0" />
            <span className="mono pointer-events-none absolute inset-0 grid place-items-center text-center text-mute/80">24<br />hours</span>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ───────────────────────── Inside (real photos) ───────────────────────── */
const PHOTOS = [
  ['/img/real-gym-weights.jpg', 'Free weights and dumbbell rack', 'lg:col-span-5 lg:row-span-2 aspect-[3/4] lg:aspect-auto'],
  ['/img/real-pool.jpg', 'The therapy pool under its sky ceiling', 'lg:col-span-7 aspect-[16/10]'],
  ['/img/real-cardio.jpg', 'Cardio and stair machines', 'lg:col-span-4 aspect-[4/3]'],
  ['/img/real-cycle.jpg', 'Cycle studio', 'lg:col-span-3 aspect-[4/3]'],
]

export function Inside() {
  const root = useRef(null)
  useGSAP(() => {
    const mm = gsap.matchMedia()
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      gsap.utils.toArray('.ph').forEach((el) => {
        gsap.fromTo(el, { clipPath: 'inset(14% 14% 14% 14% round 28px)' }, { clipPath: 'inset(0% 0% 0% 0% round 28px)', ease: 'none', scrollTrigger: { trigger: el, start: 'top 95%', end: 'top 40%', scrub: true } })
        gsap.fromTo(el.querySelector('img'), { yPercent: -8, scale: 1.2 }, { yPercent: 8, scale: 1.2, ease: 'none', scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true } })
      })
    })
  }, { scope: root })

  return (
    <section ref={root} id="inside" className="py-[clamp(80px,12vw,180px)]">
      <div className="wrap">
        <div className="mb-14 flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="mono mb-5 flex items-center gap-3 text-blue"><span className="h-px w-10 bg-blue" />Inside the centre</p>
            <SplitText text="The real place." tag="h2" splitType="words" textAlign="left" className="display text-[clamp(2.8rem,6.5vw,6.2rem)]" delay={80} />
          </div>
          <p className="max-w-[40ch] text-bone/80">Photos from the floor at 618 South Pelham Road. Modern equipment, a bright pool and room to move.</p>
        </div>
        <div className="grid gap-4 sm:gap-6 lg:grid-cols-12">
          {PHOTOS.map(([src, alt, cls]) => (
            <figure key={src} className={`ph relative overflow-hidden rounded-[28px] ${cls}`}>
              <img src={src} alt={alt} loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
              <figcaption className="mono absolute bottom-4 left-4 rounded-full bg-ink/70 px-4 py-2 text-bone backdrop-blur">{alt}</figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ───────────────────────── Join CTA ───────────────────────── */
export function Join() {
  const prog = useRef(0)
  return (
    <section id="join" className="on-navy relative isolate overflow-hidden border-t border-bone/10">
      <img src="/img/hero-ending.jpg" alt="" loading="lazy" className="absolute inset-0 -z-30 h-full w-full object-cover opacity-45" />
      <div className="absolute inset-0 -z-20 opacity-70 mix-blend-screen"><Aurora colorStops={['#98141f', '#f7941d', '#d6e01f']} amplitude={0.9} blend={0.6} speed={0.6} /></div>
      <div className="absolute inset-0 -z-10" style={{ background: 'linear-gradient(to bottom, #062d43 0%, rgba(6,45,67,.55) 45%, rgba(6,45,67,.88) 100%)' }} />
      <div className="wrap relative grid min-h-[88svh] items-center gap-10 py-28 lg:grid-cols-[1.2fr_1fr]">
        <div>
          <p className="mono mb-6 flex items-center gap-3 text-blue"><span className="h-px w-10 bg-blue" />One week free trial</p>
          <SplitText text="Your first workout is on us." tag="h2" splitType="words" textAlign="left" className="display text-[clamp(3.2rem,8vw,8rem)]" delay={70} />
          <p className="mt-7 max-w-[46ch] text-lg text-bone/90">Take a look at our gym memberships and pick the one that suits you best. Not sure yet? Call us and we will walk you through the trial.</p>
          <div className="mt-10 flex flex-wrap gap-4">
            <Magnet padding={80} magnetStrength={4}><a href="https://www.generationsgym.com/memberships-pricing" className="btn btn-lime">Sign up now</a></Magnet>
            <Magnet padding={80} magnetStrength={4}><a href="tel:+19057321278" className="btn btn-ghost">Call 905.732.1278</a></Magnet>
          </div>
        </div>
        <div className="relative mx-auto aspect-[4/5] w-full max-w-[460px]">
          <Orbit variant="logo" progress={prog} className="absolute inset-0" />
        </div>
      </div>
    </section>
  )
}

/* ───────────────────────── Contact + footer ───────────────────────── */
export function Contact() {
  const [sent, setSent] = useState(false)
  const submit = (e) => {
    e.preventDefault()
    const f = new FormData(e.currentTarget)
    const body = `${f.get('message')}\n\nFrom: ${f.get('name')}\nPhone: ${f.get('phone') || 'n/a'}`
    location.href = `mailto:info@generationsgym.com?subject=${encodeURIComponent('Website enquiry from ' + f.get('name'))}&body=${encodeURIComponent(body)}`
    setSent(true)
  }
  const field = 'w-full rounded-2xl border border-bone/30 bg-ink-2 px-5 py-4 text-bone placeholder:text-mute focus:border-blue focus:outline-none'
  return (
    <section id="contact" className="py-[clamp(80px,12vw,180px)]">
      <div className="wrap grid gap-14 lg:grid-cols-2">
        <div>
          <p className="mono mb-5 flex items-center gap-3 text-blue"><span className="h-px w-10 bg-blue" />Get in touch</p>
          <SplitText text="Start your wellness journey here." tag="h2" splitType="words" textAlign="left" className="display text-[clamp(2.8rem,6vw,5.8rem)]" delay={70} />
          <dl className="mt-12 grid gap-8 sm:grid-cols-2">
            <div><dt className="mono text-mute">Visit</dt><dd className="mt-2 text-lg">618 South Pelham Road<br />Welland, ON L3C 3C8</dd></div>
            <div><dt className="mono text-mute">Open</dt><dd className="mt-2 text-lg">24 hours for members</dd></div>
            <div><dt className="mono text-mute">Call</dt><dd className="mt-2 text-lg"><a className="hover:text-blue" href="tel:+19057321278">905.732.1278</a></dd></div>
            <div><dt className="mono text-mute">Email</dt><dd className="mt-2 text-lg"><a className="hover:text-blue" href="mailto:info@generationsgym.com">info@generationsgym.com</a></dd></div>
          </dl>
        </div>
        <form onSubmit={submit} className="grid gap-4 self-start rounded-[28px] border border-bone/12 bg-ink-2/60 p-6 sm:p-9">
          <label className="grid gap-2"><span className="mono text-mute">Name</span><input name="name" required autoComplete="name" className={field} placeholder="Your name" /></label>
          <label className="grid gap-2"><span className="mono text-mute">Phone (optional)</span><input name="phone" type="tel" autoComplete="tel" className={field} placeholder="905 000 0000" /></label>
          <label className="grid gap-2"><span className="mono text-mute">Message</span><textarea name="message" required rows={4} className={field} placeholder="Tell us what you are looking for" /></label>
          <button className="btn btn-lime mt-2 w-full" type="submit">Send message</button>
          <p className="text-sm text-mute" aria-live="polite">{sent ? 'Your email app opened with your message ready to send to info@generationsgym.com.' : 'This opens your email app with your message ready to send.'}</p>
        </form>
      </div>
    </section>
  )
}

export function Footer() {
  return (
    <footer className="on-navy py-14">
      <div className="wrap flex flex-col gap-10 md:flex-row md:items-end md:justify-between">
        <div className="flex items-center gap-4">
          <img src="/img/logo-square.png" alt="" className="h-14 w-auto" />
          <div>
            <img src="/img/logo-wide.png" alt="Generations" className="h-6 w-auto" />
            <p className="mono mt-3 text-mute">Aquatic &amp; Fitness Centre</p>
          </div>
        </div>
        <ul className="mono flex flex-wrap gap-x-8 gap-y-3 text-bone/80">
          {[['Memberships', 'memberships-pricing'], ['Schedule', 'schedule'], ['About', 'about-us-our-team'], ['Join now', 'join-now']].map(([l, p]) => (
            <li key={l}><a className="hover:text-blue" href={`https://www.generationsgym.com/${p}`}>{l}</a></li>
          ))}
        </ul>
      </div>
      <div className="wrap mt-10 flex flex-col gap-2 border-t border-bone/10 pt-6 text-sm text-mute sm:flex-row sm:justify-between">
        <p>© 2026 Generations Aquatic &amp; Fitness Centre. 618 South Pelham Road, Welland, ON.</p>
        <p>Some imagery on this page is AI generated.</p>
      </div>
    </footer>
  )
}
