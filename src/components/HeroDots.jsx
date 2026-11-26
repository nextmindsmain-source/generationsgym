import { useEffect, useRef } from 'react'
import * as THREE from 'three'

// A tunnel of the logo's dots that the camera flies through as the film scrubs.
const COLORS = ['#98141f', '#c23028', '#ee763b', '#f7941d', '#f9c910', '#d6e01f', '#98a321']

function rng(seed) {
  let s = seed >>> 0
  return () => (s = (s * 1664525 + 1013904223) >>> 0) / 4294967296
}

export default function HeroDots({ progress, className = '' }) {
  const mount = useRef(null)

  useEffect(() => {
    const el = mount.current
    let renderer
    try {
      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'low-power' })
    } catch {
      return // no WebGL: the film carries the hero
    }
    const small = matchMedia('(max-width: 767px)').matches
    renderer.setPixelRatio(Math.min(devicePixelRatio, small ? 1.5 : 2))
    renderer.domElement.style.cssText = 'width:100%;height:100%;display:block'
    el.appendChild(renderer.domElement)

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 80)
    scene.add(new THREE.AmbientLight(0xffffff, 1.6))
    const sun = new THREE.DirectionalLight(0xffffff, 1.8); sun.position.set(3, 5, 6); scene.add(sun)

    const geo = new THREE.SphereGeometry(1, 32, 24)
    const mats = COLORS.map((c) => new THREE.MeshStandardMaterial({ color: c, emissive: c, emissiveIntensity: .18, roughness: .25, metalness: .1 }))
    const rand = rng(24)
    const dots = []
    const count = small ? 22 : 44
    for (let i = 0; i < count; i++) {
      const m = new THREE.Mesh(geo, mats[i % mats.length])
      const a = rand() * Math.PI * 2
      const r = 2.6 + rand() * 3.2 // keep the middle of the frame clear
      m.userData = { x: Math.cos(a) * r, y: Math.sin(a) * r * .8, phase: rand() * 6 }
      m.position.set(m.userData.x, m.userData.y, 3 - rand() * 38)
      m.scale.setScalar(.05 + rand() * .13)
      scene.add(m)
      dots.push(m)
    }

    let spread = 1
    const size = () => {
      const { clientWidth: w, clientHeight: h } = el
      if (!w || !h) return
      renderer.setSize(w, h, false)
      camera.aspect = w / h
      camera.updateProjectionMatrix()
      spread = Math.min(1.25, Math.max(.45, camera.aspect * .75))
    }
    size()
    const ro = new ResizeObserver(size); ro.observe(el)

    const pointer = { x: 0, y: 0, sx: 0, sy: 0 }
    const move = (e) => { pointer.x = e.clientX / innerWidth - .5; pointer.y = e.clientY / innerHeight - .5 }
    addEventListener('pointermove', move, { passive: true })

    let raf = 0, visible = true, shown = 0
    const clock = new THREE.Clock()
    const tick = () => {
      raf = 0
      if (!visible) return
      const t = clock.getElapsedTime()
      shown += ((progress.current || 0) - shown) * .09
      pointer.sx += (pointer.x - pointer.sx) * .06
      pointer.sy += (pointer.y - pointer.sy) * .06
      camera.position.set(pointer.sx * 1.4, -pointer.sy * 1, 8 - shown * 32)
      camera.rotation.z = shown * .5
      for (const d of dots) {
        d.position.x = d.userData.x * spread + Math.sin(t * .5 + d.userData.phase) * .18
        d.position.y = d.userData.y + Math.cos(t * .6 + d.userData.phase) * .18
      }
      renderer.render(scene, camera)
      raf = requestAnimationFrame(tick)
    }
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (visible && !raf) raf = requestAnimationFrame(tick) })
    io.observe(el)
    raf = requestAnimationFrame(tick)

    return () => {
      cancelAnimationFrame(raf); ro.disconnect(); io.disconnect(); removeEventListener('pointermove', move)
      geo.dispose(); mats.forEach((m) => m.dispose()); renderer.dispose(); renderer.domElement.remove()
    }
  }, [progress])

  return <div ref={mount} className={className} aria-hidden="true" />
}
