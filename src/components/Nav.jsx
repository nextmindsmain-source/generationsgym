import { useEffect, useState } from 'react'
import Magnet from './Magnet'

const LINKS = [['Services', '#services'], ['Inside', '#inside'], ['Open 24/7', '#hours'], ['Contact', '#contact']]
const JOIN = 'https://www.generationsgym.com/join-now'

export default function Nav() {
  const [solid, setSolid] = useState(false)
  const [open, setOpen] = useState(false)
  useEffect(() => {
    const on = () => setSolid(scrollY > 80)
    on()
    addEventListener('scroll', on, { passive: true })
    return () => removeEventListener('scroll', on)
  }, [])
  return (
    <header className={`fixed inset-x-0 top-0 z-50 transition-colors duration-500 ${solid || open ? 'bg-ink/85 backdrop-blur-md' : 'over-film'}`}>
      <nav className="wrap flex h-[76px] items-center justify-between" aria-label="Main">
        <a href="#top" className="flex items-center gap-3" aria-label="Generations, home">
          <img src="/img/logo-square.png" alt="" className="h-10 w-auto" />
          <img src="/img/logo-wide.png" alt="Generations" className="hidden h-5 w-auto sm:block" />
        </a>
        <ul className="hidden items-center gap-10 lg:flex">
          {LINKS.map(([l, h]) => (
            <li key={l}><a href={h} className="mono text-bone/80 transition-colors hover:text-blue">{l}</a></li>
          ))}
        </ul>
        <div className="flex items-center gap-3">
          <Magnet padding={60} magnetStrength={4} wrapperClassName="hidden sm:block">
            <a href={JOIN} className="btn btn-lime !min-h-11 !px-6">Join now</a>
          </Magnet>
          <button className="relative grid h-11 w-11 place-items-center rounded-full border border-bone/30 lg:hidden" aria-expanded={open} aria-label="Menu" onClick={() => setOpen(o => !o)}>
            <span className="block h-px w-5 bg-bone before:absolute before:block before:h-px before:w-5 before:-translate-y-1.5 before:bg-bone after:absolute after:block after:h-px after:w-5 after:translate-y-1.5 after:bg-bone" />
          </button>
        </div>
      </nav>
      {open && (
        <ul className="wrap flex flex-col gap-1 pb-6 lg:hidden">
          {LINKS.concat([['Join now', JOIN]]).map(([l, h]) => (
            <li key={l}><a onClick={() => setOpen(false)} href={h} className="display block py-2 text-4xl">{l}</a></li>
          ))}
        </ul>
      )}
    </header>
  )
}
