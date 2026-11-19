import { useEffect, useRef } from 'react'
import * as THREE from 'three'

// The logo's ten dots, in the logo's own layout (px in the 800x940 artwork) and colours.
const LOGO = [
  [378, 115, 80, '#c23028'], [618, 123, 86, '#98141f'], [193, 258, 73, '#ee763b'],
  [113, 479, 66, '#f7941d'], [186, 700, 61, '#f9ac17'], [393, 822, 55, '#f9c910'],
  [622, 771, 49, '#d6e01f'], [708, 597, 42, '#afb91b'], [637, 480, 37, '#9faf1e'], [521, 480, 37, '#9faf1e'],
]
const DAY = [[0, '#4a2540'], [5, '#98141f'], [7, '#ee763b'], [9, '#f7941d'], [12, '#f9c910'], [15, '#d6e01f'], [18, '#f7941d'], [20, '#c23028'], [22, '#5a2a4a'], [24, '#4a2540']]

function dayColor(h) {
  for (let i = 0; i < DAY.length - 1; i++) {
    const [a, ca] = DAY[i], [b, cb] = DAY[i + 1]
    if (h >= a && h <= b) return new THREE.Color(ca).lerp(new THREE.Color(cb), (h - a) / (b - a))
  }
  return new THREE.Color(DAY[0][1])
}

function glowTexture() {
  const c = document.createElement('canvas')
  c.width = c.height = 128
  const g = c.getContext('2d')
  const r = g.createRadialGradient(64, 64, 0, 64, 64, 64)
  r.addColorStop(0, 'rgba(255,255,255,.9)'); r.addColorStop(.25, 'rgba(255,255,255,.35)'); r.addColorStop(1, 'rgba(255,255,255,0)')
  g.fillStyle = r; g.fillRect(0, 0, 128, 128)
  return new THREE.CanvasTexture(c)
}

/** variant "logo": the ten-dot mark as a 3D constellation. variant "clock": 24 hour ring swept by `progress`. */
export default function Orbit({ variant = 'logo', progress, onHour, className = '' }) {
  const mount = useRef(null)
  const hourCb = useRef(onHour)
  hourCb.current = onHour

  useEffect(() => {
    const el = mount.current
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'low-power' })
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2))
    el.appendChild(renderer.domElement)
    renderer.domElement.style.cssText = 'width:100%;height:100%;display:block'

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100)
    camera.position.set(0, 0, variant === 'logo' ? 21 : 19)
    scene.add(new THREE.AmbientLight(0xffe7d6, 0.7))
    const key = new THREE.PointLight(0xffb070, 60, 40); key.position.set(4, 5, 8); scene.add(key)
    const rim = new THREE.PointLight(0xd6e01f, 30, 40); rim.position.set(-6, -4, 4); scene.add(rim)

    const group = new THREE.Group(); scene.add(group)
    const tex = glowTexture()
    const items = []
    const sphereGeo = new THREE.SphereGeometry(1, 48, 32)

    const add = (pos, r, color, i) => {
      const mat = new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: .35, roughness: .32, metalness: .15 })
      const m = new THREE.Mesh(sphereGeo, mat); m.position.copy(pos); m.scale.setScalar(r)
      const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, color, transparent: true, opacity: .45, blending: THREE.AdditiveBlending, depthWrite: false }))
      sp.scale.setScalar(r * 5); sp.position.copy(pos)
      group.add(m, sp)
      items.push({ m, sp, mat, base: r, i })
    }

    let ringMesh = null
    if (variant === 'logo') {
      LOGO.forEach(([x, y, r, c], i) => add(new THREE.Vector3((x - 400) / 100, -(y - 470) / 100, Math.sin(i * 1.9) * 1.1), r / 100, new THREE.Color(c), i))
    } else {
      for (let i = 0; i < 24; i++) {
        const a = (i / 24) * Math.PI * 2 - Math.PI / 2
        add(new THREE.Vector3(Math.cos(a) * 3.6, -Math.sin(a) * 3.6, 0), .2, dayColor(i), i)
      }
      ringMesh = new THREE.Mesh(new THREE.TorusGeometry(3.6, .012, 8, 160), new THREE.MeshBasicMaterial({ color: 0xf4ede4, transparent: true, opacity: .14 }))
      group.add(ringMesh)
    }

    const size = () => {
      const { clientWidth: w, clientHeight: h } = el
      if (!w || !h) return
      renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix()
    }
    size()
    const ro = new ResizeObserver(size); ro.observe(el)

    const mouse = { x: 0, y: 0, sx: 0, sy: 0 }
    const move = (e) => { const r = el.getBoundingClientRect(); mouse.x = ((e.clientX - r.left) / r.width - .5) * 2; mouse.y = ((e.clientY - r.top) / r.height - .5) * 2 }
    window.addEventListener('pointermove', move, { passive: true })

    let visible = true, raf = 0, lastHour = -1, lastEmit = 0, shownP = 0
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (visible && !raf) raf = requestAnimationFrame(tick) })
    io.observe(el)

    const clock = new THREE.Clock()
    function tick() {
      raf = 0
      if (!visible) return
      const t = clock.getElapsedTime()
      mouse.sx += (mouse.x - mouse.sx) * .05; mouse.sy += (mouse.y - mouse.sy) * .05
      const p = progress ? progress.current : 0
      shownP += (p - shownP) * .08
      if (variant === 'logo') {
        group.rotation.y = mouse.sx * .55 + Math.sin(t * .4) * .25 + shownP * Math.PI * 1.2
        group.rotation.x = mouse.sy * .3
        items.forEach(({ m, sp, base, i }) => {
          const s = base * (1 + Math.sin(t * 1.1 + i) * .05)
          m.scale.setScalar(s); sp.scale.setScalar(s * 5)
        })
      } else {
        group.rotation.y = mouse.sx * .25; group.rotation.x = mouse.sy * .2
        const hour = shownP * 24
        items.forEach(({ m, sp, mat, base, i }) => {
          let d = Math.abs(i + .5 - hour); d = Math.min(d, 24 - d)
          const near = Math.exp(-d * d / 3.2)
          m.scale.setScalar(base * (1 + near * 1.7)); sp.scale.setScalar(base * (5 + near * 9))
          mat.emissiveIntensity = .25 + near * 1.4; sp.material.opacity = .25 + near * .6
        })
        const h = Math.min(23, Math.floor(hour))
        const now = performance.now()
        if (hourCb.current && h !== lastHour && now - lastEmit > 100) { lastHour = h; lastEmit = now; hourCb.current(h) }
      }
      renderer.render(scene, camera)
      if (!reduce || variant === 'clock') raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)

    return () => {
      cancelAnimationFrame(raf); ro.disconnect(); io.disconnect(); window.removeEventListener('pointermove', move)
      items.forEach(({ mat, sp }) => { mat.dispose(); sp.material.dispose() })
      if (ringMesh) { ringMesh.geometry.dispose(); ringMesh.material.dispose() }
      sphereGeo.dispose(); tex.dispose(); renderer.dispose(); renderer.domElement.remove()
    }
  }, [variant, progress])

  return <div ref={mount} className={className} aria-hidden="true" />
}
