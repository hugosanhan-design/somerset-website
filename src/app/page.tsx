'use client'
// Somerset homepage — v6 "Premium" design, ported from the canonical prototype
// (Somerset Website/Somerset Homepage v6 — Premium.html, approved 2026-07-08).
// Fraunces + Instrument Sans + Poppins wordmark · cream/racing-green palette ·
// curtain opening · live Somerset weather + seasons · countryside scene with
// night mode, mist, fireflies and Exmoor ponies.
import { useEffect } from 'react'

const ffStyle = (l: string, b: string, d: string, dl: string) =>
  ({ left: l, bottom: b, '--d': d, '--dl': dl } as React.CSSProperties)

export default function Home() {
  useEffect(() => {
    const $ = (id: string) => document.getElementById(id)
    const cleanups: Array<() => void> = []

    /* ── Curtain ── */
    const curtain = $('curtain')
    const onCurtainEnd = (e: AnimationEvent) => {
      if (e.animationName === 'curtain-lift') document.body.classList.add('curtain-done')
    }
    curtain?.addEventListener('animationend', onCurtainEnd)
    const curtainSafety = setTimeout(() => document.body.classList.add('curtain-done'), 3400)
    cleanups.push(() => { curtain?.removeEventListener('animationend', onCurtainEnd); clearTimeout(curtainSafety) })

    /* ── Nav on scroll ── */
    const nav = $('nav')
    const onNavScroll = () => nav?.classList.toggle('scrolled', window.scrollY > 20)
    window.addEventListener('scroll', onNavScroll, { passive: true })
    cleanups.push(() => window.removeEventListener('scroll', onNavScroll))

    /* ── Mobile burger menu ── */
    const burger = $('navBurger')
    const mobileMenu = $('mobileMenu')
    const setMenu = (open: boolean) => {
      document.body.classList.toggle('menu-open', open)
      burger?.setAttribute('aria-expanded', String(open))
      mobileMenu?.setAttribute('aria-hidden', String(!open))
    }
    const onBurger = () => setMenu(!document.body.classList.contains('menu-open'))
    burger?.addEventListener('click', onBurger)
    /* close when a menu link is tapped (same-page anchors need it) */
    mobileMenu?.querySelectorAll('a').forEach(a => a.addEventListener('click', () => setMenu(false)))
    const onMenuKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setMenu(false) }
    document.addEventListener('keydown', onMenuKey)
    cleanups.push(() => {
      burger?.removeEventListener('click', onBurger)
      document.removeEventListener('keydown', onMenuKey)
      document.body.classList.remove('menu-open')
    })

    /* ── Sheep walk, cloud drift, hill parallax, night-at-footer ── */
    const sheep = $('sheepWalk')
    const clouds = document.querySelectorAll<HTMLElement>('.cloud')
    const hFar = $('h1hill'), hMid = $('h2')
    const footerEl = document.querySelector<HTMLElement>('.v6footer')
    const update = () => {
      const y = window.scrollY
      const max = document.documentElement.scrollHeight - window.innerHeight
      const p = max > 0 ? Math.min(Math.max(y / max, 0), 1) : 0
      if (sheep) sheep.style.left = (2 + 86 * p) + '%'
      clouds.forEach(c => { const s = parseFloat(c.dataset.speed || '0.2'); c.style.transform = `translateX(${y * s}px)` })
      if (hFar) hFar.style.transform = `translateX(${Math.min(y * 0.012, 28)}px)`
      if (hMid) hMid.style.transform = `translateX(${-Math.min(y * 0.008, 20)}px)`
      document.body.classList.toggle('night',
        document.body.dataset.wxNight === '1' ||
        (!!footerEl && footerEl.getBoundingClientRect().top < window.innerHeight * 0.85))
    }
    window.addEventListener('scroll', update, { passive: true })
    window.addEventListener('resize', update)
    update()
    cleanups.push(() => { window.removeEventListener('scroll', update); window.removeEventListener('resize', update) })

    /* ── Reveal on scroll ── */
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target) } })
    }, { threshold: 0.1, rootMargin: '0px 0px -30px 0px' })
    document.querySelectorAll('.reveal').forEach(el => io.observe(el))
    cleanups.push(() => io.disconnect())

    /* ── Animated counters ── */
    const cio = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return
        cio.unobserve(entry.target)
        const el = entry.target as HTMLElement
        const to = parseInt(el.dataset.to || '0', 10)
        let start: number | null = null
        const tick = (ts: number) => {
          if (start === null) start = ts
          const pr = Math.min((ts - start) / 1400, 1)
          el.textContent = String(Math.round(to * (1 - Math.pow(1 - pr, 3))))
          if (pr < 1) requestAnimationFrame(tick)
        }
        requestAnimationFrame(tick)
      })
    }, { threshold: 0.4 })
    document.querySelectorAll('.count').forEach(el => cio.observe(el))
    cleanups.push(() => cio.disconnect())

    /* ── Scene popovers ── */
    const infoData: Record<string, { t: string; b: string }> = {
      castle:  { t: 'Dunster Castle', b: 'Dunster Castle sits on a steep wooded hill — the Tor — above Dunster village. Fortified since Norman times, made a Jacobean mansion in 1617 and given its romantic towers by the Victorians, it has been home to just two families in 1,000 years. Today it is cared for by the National Trust.' },
      cottage: { t: 'Thatched cottages', b: 'Somerset villages like Dunster and Selworthy are famous for their cottages — built from local cob (earth, straw and water) and topped with thick wheat-straw or water-reed thatch that can last 25–40 years.' },
      sheep:   { t: 'Sheep country', b: "England's flock is around 14 million sheep, and the South West — Somerset included — is one of the country's densest sheep-farming regions. Come spring, the new lambs nearly double the count." },
      crow:    { t: 'The crafty crow', b: "Carrion crows are among Britain's cleverest birds — they use tools, remember faces and gather in noisy 'parliaments'. A familiar sight over Somerset farmland and the open moors of Exmoor." },
      apple:   { t: 'Somerset cider apples', b: 'Somerset is the home of English cider. Its orchards grow heritage cider-apple varieties like Kingston Black and Dabinett, and the county still presses more cider than anywhere else in the UK.' },
      pony:    { t: 'Exmoor ponies', b: "One of Britain's oldest native breeds, Exmoor ponies still roam semi-feral across the moor — hardy, compact, and instantly recognisable by their pale 'mealy' muzzles. Only a few hundred live free on Exmoor today, so spotting one is a treat." },
    }
    const pop = $('infoPop'), titleEl = $('infoTitle'), bodyEl = $('infoBody')
    const openPop = (key: string) => {
      const d = infoData[key]; if (!d || !pop || !titleEl || !bodyEl) return
      titleEl.textContent = d.t; bodyEl.textContent = d.b
      pop.hidden = false; requestAnimationFrame(() => pop.classList.add('show'))
    }
    const closePop = () => { if (!pop) return; pop.classList.remove('show'); setTimeout(() => { pop.hidden = true }, 220) }
    document.querySelectorAll<HTMLElement>('.scene .clickable').forEach(el => {
      el.addEventListener('click', e => { e.stopPropagation(); openPop(el.dataset.info || '') })
    })
    $('infoClose')?.addEventListener('click', closePop)
    const onDocClick = (e: MouseEvent) => {
      if (pop && !pop.hidden && !pop.contains(e.target as Node) && !(e.target as HTMLElement).closest?.('.scene .clickable')) closePop()
    }
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') closePop() }
    document.addEventListener('click', onDocClick)
    document.addEventListener('keydown', onKey)
    cleanups.push(() => { document.removeEventListener('click', onDocClick); document.removeEventListener('keydown', onKey) })

    /* ── Apple hangs, crow knocks it loose, sheep eats it ── */
    let rafId = 0
    const scene = document.querySelector<HTMLElement>('.scene')
    const tree = document.querySelector<HTMLElement>('.apple-tree')
    const crow = $('crow')
    const apple = document.querySelector<HTMLElement>('.falling-apple')
    if (scene && tree && crow && apple && sheep) {
      const onEatEnd = (e: AnimationEvent) => { if (e.animationName === 'sheep-eat') sheep.classList.remove('eating') }
      sheep.addEventListener('animationend', onEatEnd)
      cleanups.push(() => sheep.removeEventListener('animationend', onEatEnd))
      const FALL_MS = 950
      let state = 'hanging', fallStart = 0, hangX = 0, hangY = 0, floorY = 0, prevPhase = 0, started = false
      const geom = () => {
        const s = scene.getBoundingClientRect(), t = tree.getBoundingClientRect(), w = sheep.getBoundingClientRect()
        hangX = (t.left - s.left) + t.width * 0.52
        hangY = (t.top - s.top) + t.height * 0.40
        floorY = (w.top - s.top) + w.height * 0.46
      }
      const place = (x: number, y: number, rot?: number) => {
        apple.style.left = x + 'px'; apple.style.top = y + 'px'
        apple.style.transform = `rotate(${rot || 0}deg)`
      }
      geom(); place(hangX, hangY, 0); apple.style.opacity = '1'
      const onResize = () => { geom(); if (state === 'hanging') place(hangX, hangY, 0); if (state === 'floor') place(hangX, floorY, 52) }
      window.addEventListener('resize', onResize)
      cleanups.push(() => window.removeEventListener('resize', onResize))
      const crowPhase = () => {
        const a = crow.getAnimations && crow.getAnimations()[0]
        if (!a) return 0
        const dur = Number((a.effect?.getTiming?.().duration as number) || 9000)
        return (Number(a.currentTime || 0) % dur) / dur
      }
      const loop = (ts: number) => {
        const phase = crowPhase()
        if (!started) { prevPhase = phase; started = true }
        if (phase < prevPhase) { state = 'hanging'; geom(); place(hangX, hangY, 0); apple.style.opacity = '1' }
        prevPhase = phase
        if (state === 'hanging') {
          place(hangX, hangY, 0)
          if (phase > 0.585 && phase < 0.68) { state = 'falling'; fallStart = ts }
        } else if (state === 'falling') {
          const t = Math.min((ts - fallStart) / FALL_MS, 1)
          place(hangX, hangY + (floorY - hangY) * t * t, 52 * t * t)
          if (t >= 1) { state = 'floor'; place(hangX, floorY, 52) }
        } else if (state === 'floor') {
          const w = sheep.getBoundingClientRect(), s = scene.getBoundingClientRect()
          const sxL = w.left - s.left, sxR = w.right - s.left
          if (hangX > sxL + w.width * 0.15 && hangX < sxR - w.width * 0.10) {
            state = 'eaten'; apple.style.opacity = '0'
            sheep.classList.remove('eating'); void (sheep as HTMLElement).offsetWidth; sheep.classList.add('eating')
          }
        }
        rafId = requestAnimationFrame(loop)
      }
      rafId = requestAnimationFrame(loop)
      cleanups.push(() => cancelAnimationFrame(rafId))
    }

    /* ── Live Somerset weather + season (Open-Meteo, Dunster; free, no key) ── */
    const m = new Date().getMonth() + 1
    const season = (m >= 3 && m <= 5) ? 'spring' : (m >= 6 && m <= 8) ? 'summer' : (m >= 9 && m <= 11) ? 'autumn' : 'winter'
    document.body.classList.add('season-' + season)
    const badge = $('wxBadge')
    fetch('https://api.open-meteo.com/v1/forecast?latitude=51.18&longitude=-3.44&current=temperature_2m,weather_code,is_day&timezone=Europe%2FLondon')
      .then(r => { if (!r.ok) throw new Error(String(r.status)); return r.json() })
      .then(d => {
        const c = d.current, code = c.weather_code
        let wx = 'clear', label = 'clear skies'
        if (code === 45 || code === 48) { wx = 'fog'; label = 'fog on the moor' }
        else if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82)) { wx = 'rain'; label = 'rain' }
        else if ((code >= 71 && code <= 77) || code === 85 || code === 86) { wx = 'snow'; label = 'snow' }
        else if (code >= 95) { wx = 'rain'; label = 'a thunderstorm' }
        else if (code === 2 || code === 3) { wx = 'cloudy'; label = 'cloudy skies' }
        else if (code === 1) { label = 'mostly clear' }
        document.body.classList.add('wx-' + wx)
        if (c.is_day === 0) { document.body.dataset.wxNight = '1'; label += ' · night-time'; update() }
        if ((wx === 'rain' || wx === 'snow') && scene) {
          const wrap = document.createElement('div')
          wrap.className = 'precip'
          const n = wx === 'rain' ? 26 : 18
          for (let i = 0; i < n; i++) {
            const pcl = document.createElement('span')
            pcl.className = wx === 'rain' ? 'drop' : 'flake'
            pcl.style.left = (Math.random() * 100) + '%'
            pcl.style.animationDuration = (wx === 'rain' ? 0.9 + Math.random() * 0.7 : 4 + Math.random() * 4) + 's'
            pcl.style.animationDelay = (Math.random() * 4) + 's'
            wrap.appendChild(pcl)
          }
          scene.appendChild(wrap)
        }
        if (badge) badge.textContent = `Right now in Somerset: ${Math.round(c.temperature_2m)}° · ${label}`
      })
      .catch(() => { badge?.remove() })

    /* body classes must not leak to other pages on client-side navigation */
    cleanups.push(() => {
      document.body.classList.remove('night', 'curtain-done')
      Array.from(document.body.classList).forEach(cl => { if (cl.startsWith('wx-') || cl.startsWith('season-')) document.body.classList.remove(cl) })
      delete document.body.dataset.wxNight
    })

    return () => cleanups.forEach(fn => fn())
  }, [])

  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link rel="stylesheet" precedence="default" href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300..700;1,9..144,300..700&family=Instrument+Sans:ital,wght@0,400..700;1,400..700&family=Poppins:wght@600;700&display=swap" />

      <style>{`
        :root {
          --paper: #F5F1E6; --paper-2: #EDE7D6;
          --ink: #17281B; --racing: #1E4227; --racing-2: #2A5636;
          --green: #57B82C; --green-dk: #3D8B1F; --leaf: #A8D77E;
          --brass: #C9A24B; --heather: #8C5E9C; --cheddar: #E3A33A; --cider: #B23A2C;
          --muted: #5C6657; --line: #D9D2BC; --ink-soft: #3A3024;
          --serif: 'Fraunces', Georgia, serif;
          --sans: 'Instrument Sans', system-ui, sans-serif;
          --brand: 'Poppins', system-ui, sans-serif;
          --max-w: 1240px; --py: clamp(5rem, 10vw, 8.5rem);
        }
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
        body { font-family: var(--sans); background: var(--paper); color: var(--ink); line-height: 1.6; -webkit-font-smoothing: antialiased; overflow-x: hidden; }
        a { color: inherit; text-decoration: none; }
        img { display: block; max-width: 100%; }
        ::selection { background: var(--green); color: #fff; }
        .wrap { width: min(var(--max-w), 100%); margin: 0 auto; padding: 0 2rem; }
        .grain { position: fixed; inset: -50%; width: 200%; height: 200%; pointer-events: none; z-index: 200; opacity: 0.05; background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='240' height='240'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2'/%3E%3C/filter%3E%3Crect width='240' height='240' filter='url(%23n)'/%3E%3C/svg%3E"); animation: grain-shift 0.9s steps(4) infinite; }
        @keyframes grain-shift { 0%{transform:translate(0,0)} 25%{transform:translate(-2%,1%)} 50%{transform:translate(1%,-1.5%)} 75%{transform:translate(-1%,2%)} 100%{transform:translate(0,0)} }
        .curtain { position: fixed; inset: 0; z-index: 300; background: var(--racing); display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 0.9rem; animation: curtain-lift 1.05s cubic-bezier(0.77,0,0.18,1) 1.55s forwards; }
        .curtain-name { font-family: var(--brand); font-weight: 700; font-size: clamp(2rem, 4.6vw, 3.2rem); color: var(--paper); letter-spacing: -0.01em; opacity: 0; animation: curtain-word 0.9s cubic-bezier(0.22,1,0.36,1) 0.15s forwards; }
        .curtain-name b { font-weight: 700; color: var(--leaf); }
        .curtain-sub { font-size: 0.68rem; font-weight: 600; letter-spacing: 0.34em; text-transform: uppercase; color: rgba(245,241,230,0.55); opacity: 0; animation: curtain-word 0.9s cubic-bezier(0.22,1,0.36,1) 0.4s forwards; }
        .curtain-rule { width: 0; height: 1px; background: rgba(245,241,230,0.3); animation: curtain-rule 0.8s cubic-bezier(0.22,1,0.36,1) 0.45s forwards; }
        @keyframes curtain-word { from { opacity: 0; transform: translateY(18px); } to { opacity: 1; transform: none; } }
        @keyframes curtain-rule { to { width: 130px; } }
        @keyframes curtain-lift { to { transform: translateY(-100%); } }
        body.curtain-done .curtain { display: none; }
        .btn { display: inline-flex; align-items: center; gap: 0.55rem; font-family: var(--sans); font-size: 0.92rem; font-weight: 600; letter-spacing: 0.01em; padding: 0.9rem 1.9rem; border-radius: 50px; border: 1.5px solid transparent; cursor: pointer; transition: all 0.22s cubic-bezier(0.22,1,0.36,1); white-space: nowrap; }
        .btn-arr { display: inline-block; transition: transform 0.22s; }
        .btn:hover .btn-arr { transform: translateX(5px); }
        .btn-primary { background: var(--green); color: #fff; border-color: var(--green); box-shadow: 0 8px 24px rgba(87,184,44,0.32); }
        .btn-primary:hover { background: var(--green-dk); border-color: var(--green-dk); transform: translateY(-2px); box-shadow: 0 12px 28px rgba(87,184,44,0.38); }
        .btn-outline-white { background: rgba(255,255,255,0.07); color: #fff; border-color: rgba(255,255,255,0.45); backdrop-filter: blur(6px); -webkit-backdrop-filter: blur(6px); }
        .btn-outline-white:hover { background: rgba(255,255,255,0.16); border-color: #fff; transform: translateY(-2px); }
        .btn-light { background: var(--paper); color: var(--racing); border-color: var(--paper); }
        .btn-light:hover { background: #fff; transform: translateY(-2px); box-shadow: 0 10px 26px rgba(0,0,0,0.18); }
        .btn-ghost { background: transparent; color: var(--ink); border-color: var(--line); }
        .btn-ghost:hover { border-color: var(--green-dk); color: var(--green-dk); transform: translateY(-2px); }
        .nav { position: fixed; top: 0; left: 0; right: 0; z-index: 100; padding: 1.3rem 0; transition: background 0.35s, box-shadow 0.35s, padding 0.35s; }
        .nav.scrolled { background: rgba(245,241,230,0.9); backdrop-filter: blur(14px); -webkit-backdrop-filter: blur(14px); box-shadow: 0 1px 0 var(--line); padding: 0.85rem 0; }
        .nav-inner { display: flex; align-items: center; justify-content: space-between; gap: 2rem; }
        .nav-logo { display: flex; flex-direction: column; line-height: 1.05; gap: 2px; }
        .nav-logo-name { font-family: var(--brand); font-size: 1.35rem; font-weight: 700; color: var(--ink); letter-spacing: -0.01em; }
        .nav-logo-name b { font-weight: 700; color: var(--green); }
        .nav-logo-sub { font-size: 0.55rem; font-weight: 600; letter-spacing: 0.26em; text-transform: uppercase; color: var(--muted); }
        .nav-links { display: flex; align-items: center; list-style: none; gap: 0.3rem; }
        .nav-links a { font-size: 0.9rem; font-weight: 500; color: var(--ink); padding: 0.42rem 0.95rem; border-radius: 50px; transition: color 0.15s, background 0.15s; white-space: nowrap; }
        .nav-links a:hover { color: var(--green-dk); }
        .nav-links .nav-cta a { background: var(--ink); color: var(--paper); padding: 0.6rem 1.35rem; margin-left: 0.6rem; font-weight: 600; transition: background 0.2s, transform 0.2s; }
        .nav-links .nav-cta a:hover { background: var(--green-dk); color: #fff; }
        .nav:not(.scrolled) { background: linear-gradient(to bottom, rgba(8,16,10,0.5), rgba(8,16,10,0)); }
        .nav:not(.scrolled) .nav-logo-name { color: #fff; }
        .nav:not(.scrolled) .nav-logo-name b { color: var(--leaf); }
        .nav:not(.scrolled) .nav-logo-sub { color: rgba(255,255,255,0.55); }
        .nav:not(.scrolled) .nav-links a { color: rgba(255,255,255,0.92); }
        .nav:not(.scrolled) .nav-links a:hover { color: #fff; }
        .nav:not(.scrolled) .nav-links .nav-cta a { background: rgba(255,255,255,0.14); border: 1.5px solid rgba(255,255,255,0.4); color: #fff; }
        .nav:not(.scrolled) .nav-links .nav-cta a:hover { background: rgba(255,255,255,0.26); }
        /* ── Mobile burger + full-screen menu ── */
        .nav-burger { display: none; width: 44px; height: 44px; border-radius: 50%; border: 1.5px solid var(--line); background: rgba(245,241,230,0.85); cursor: pointer; align-items: center; justify-content: center; flex-direction: column; gap: 5px; padding: 0; z-index: 260; }
        .nav-burger span { display: block; width: 18px; height: 2px; background: var(--ink); border-radius: 2px; transition: transform 0.25s cubic-bezier(0.22,1,0.36,1), opacity 0.2s; }
        .nav:not(.scrolled) .nav-burger { background: rgba(255,255,255,0.14); border-color: rgba(255,255,255,0.4); }
        .nav:not(.scrolled) .nav-burger span { background: #fff; }
        body.menu-open .nav-burger { background: transparent; border-color: rgba(245,241,230,0.4); }
        body.menu-open .nav-burger span { background: var(--paper); }
        body.menu-open .nav-burger span:nth-child(1) { transform: translateY(7px) rotate(45deg); }
        body.menu-open .nav-burger span:nth-child(2) { opacity: 0; }
        body.menu-open .nav-burger span:nth-child(3) { transform: translateY(-7px) rotate(-45deg); }
        .mobile-menu {
          position: fixed; inset: 0; z-index: 250; background: var(--racing);
          display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 0.4rem;
          opacity: 0; pointer-events: none; transition: opacity 0.3s ease;
        }
        body.menu-open .mobile-menu { opacity: 1; pointer-events: auto; }
        body.menu-open { overflow: hidden; }
        /* keep the burger (inside .nav's stacking context) above the overlay */
        body.menu-open .nav { z-index: 260; background: none !important; box-shadow: none !important; backdrop-filter: none !important; -webkit-backdrop-filter: none !important; }
        .mobile-menu a {
          font-family: var(--serif); font-size: clamp(1.7rem, 7vw, 2.2rem); font-weight: 400;
          color: var(--paper); padding: 0.45rem 1.5rem; letter-spacing: -0.01em;
          opacity: 0; transform: translateY(14px); transition: opacity 0.4s cubic-bezier(0.22,1,0.36,1), transform 0.4s cubic-bezier(0.22,1,0.36,1);
        }
        .mobile-menu a em { font-style: italic; color: var(--leaf); }
        body.menu-open .mobile-menu a { opacity: 1; transform: none; }
        body.menu-open .mobile-menu a:nth-child(1) { transition-delay: 0.05s; }
        body.menu-open .mobile-menu a:nth-child(2) { transition-delay: 0.1s; }
        body.menu-open .mobile-menu a:nth-child(3) { transition-delay: 0.15s; }
        body.menu-open .mobile-menu a:nth-child(4) { transition-delay: 0.2s; }
        body.menu-open .mobile-menu a:nth-child(5) { transition-delay: 0.25s; }
        body.menu-open .mobile-menu a:nth-child(6) { transition-delay: 0.3s; }
        body.menu-open .mobile-menu a:nth-child(7) { transition-delay: 0.35s; }
        .mobile-menu .mm-sub { font-family: var(--sans); font-size: 0.68rem; font-weight: 600; letter-spacing: 0.26em; text-transform: uppercase; color: rgba(245,241,230,0.45); margin-top: 1.6rem; opacity: 0; transition: opacity 0.4s ease 0.4s; }
        body.menu-open .mobile-menu .mm-sub { opacity: 1; }
        .hero { position: relative; min-height: 100dvh; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; overflow: hidden; padding-bottom: 26vh; }
        .hero::before { content: ''; position: absolute; inset: 0; z-index: 1; background: linear-gradient(to bottom, rgba(8,20,12,0.52) 0%, rgba(8,20,12,0.18) 34%, rgba(8,20,12,0.3) 64%, rgba(30,66,39,0.28) 100%); }
        .hero::after { content: ''; position: absolute; inset: 0; z-index: 1; pointer-events: none; background: radial-gradient(ellipse at center, transparent 55%, rgba(8,20,12,0.35) 100%); }
        .hero-bg { position: absolute; inset: 0; z-index: 0; background-image: url("/hero-original.webp"); background-size: cover; background-position: center 34%; transform-origin: center; animation: hero-enter 2.4s cubic-bezier(0.22,1,0.36,1) both, hero-kenburns 38s ease-in-out 2.4s infinite alternate; will-change: transform; }
        @keyframes hero-enter { from { transform: scale(1.14); } to { transform: scale(1.05); } }
        @keyframes hero-kenburns { 0% { transform: scale(1.05) translate(0,0); } 100% { transform: scale(1.13) translate(-1.4%,-1.2%); } }
        .hero-content { position: relative; z-index: 3; padding: 2rem 2rem 0; max-width: 880px; }
        .eyebrow { display: inline-flex; align-items: center; gap: 0.6rem; font-size: 0.7rem; font-weight: 600; letter-spacing: 0.22em; text-transform: uppercase; color: #fff; background: rgba(255,255,255,0.12); border: 1px solid rgba(255,255,255,0.26); padding: 0.45rem 1.1rem; border-radius: 50px; margin-bottom: 2rem; backdrop-filter: blur(6px); -webkit-backdrop-filter: blur(6px); opacity: 0; animation: rise-in 1s cubic-bezier(0.22,1,0.36,1) 2.05s forwards; }
        .eyebrow .dot { width: 6px; height: 6px; border-radius: 50%; background: var(--green); box-shadow: 0 0 0 3px rgba(87,184,44,0.35); }
        .hero h1 { font-family: var(--serif); font-size: clamp(3rem, 7.6vw, 6.2rem); font-weight: 380; line-height: 1.04; letter-spacing: -0.015em; color: #fff; margin-bottom: 1.7rem; text-wrap: balance; text-shadow: 0 2px 40px rgba(0,0,0,0.3); }
        .hero h1 em { font-style: italic; font-weight: 420; color: var(--leaf); }
        .hl { display: block; overflow: hidden; }
        .hl > span { display: block; transform: translateY(110%); animation: line-up 1.15s cubic-bezier(0.22,1,0.36,1) forwards; }
        .hl:nth-child(1) > span { animation-delay: 1.75s; }
        .hl:nth-child(2) > span { animation-delay: 1.9s; }
        @keyframes line-up { to { transform: translateY(0); } }
        .hero-lead { font-size: clamp(1rem, 1.4vw, 1.14rem); font-weight: 400; color: rgba(255,255,255,0.92); line-height: 1.75; max-width: 52ch; margin: 0 auto 2.6rem; text-wrap: pretty; text-shadow: 0 1px 12px rgba(0,0,0,0.35); opacity: 0; animation: rise-in 1.1s cubic-bezier(0.22,1,0.36,1) 2.25s forwards; }
        .hero-actions { display: flex; align-items: center; justify-content: center; gap: 1rem; flex-wrap: wrap; opacity: 0; animation: rise-in 1.1s cubic-bezier(0.22,1,0.36,1) 2.45s forwards; }
        @keyframes rise-in { from { opacity: 0; transform: translateY(22px); } to { opacity: 1; transform: none; } }
        :root { --scene-h: 22.5vh; }
        .scene { position: fixed; bottom: 0; left: 0; width: 100%; height: var(--scene-h); pointer-events: none; z-index: 90; -webkit-mask-image: linear-gradient(to top, #000 82%, rgba(0,0,0,0.2) 100%); mask-image: linear-gradient(to top, #000 82%, rgba(0,0,0,0.2) 100%); filter: saturate(var(--sc-sat, 0.88)) brightness(var(--sc-bri, 0.98)); transition: filter 1.8s ease; }
        body.wx-cloudy { --sc-sat: 0.8; --sc-bri: 0.93; }
        body.wx-fog { --sc-sat: 0.8; --sc-bri: 0.97; }
        body.wx-rain { --sc-sat: 0.74; --sc-bri: 0.88; }
        body.wx-snow { --sc-sat: 0.8; --sc-bri: 1.03; }
        body.season-winter { --sc-sat: 0.8; }
        body.night { --sc-sat: 0.72; --sc-bri: 0.8; }
        .scene::after { content: ''; position: absolute; inset: 0; z-index: 10; background: linear-gradient(to bottom, rgba(232,178,106,0.22) 0%, rgba(232,178,106,0.07) 42%, rgba(140,94,156,0.06) 100%); }
        .marquee-strip, .statement, .stats-strip, .why, .courses, .placement, .about, .v6footer { position: relative; z-index: 2; }
        .hill { position: absolute; bottom: 0; left: -3%; width: 106%; height: 100%; will-change: transform; }
        .hill svg { width: 100%; height: 100%; display: block; }
        .hill.far { opacity: 0.85; }
        .mist { position: absolute; left: -12%; width: 124%; height: 30%; pointer-events: none; background: linear-gradient(to bottom, rgba(242,246,240,0) 0%, rgba(242,246,240,0.5) 50%, rgba(242,246,240,0) 100%); filter: blur(7px); }
        .mist.m1 { bottom: 34%; animation: mist-drift 34s ease-in-out infinite alternate; }
        .mist.m2 { bottom: 10%; opacity: 0.6; animation: mist-drift 46s ease-in-out infinite alternate-reverse; }
        @keyframes mist-drift { from { transform: translateX(-2.5%); } to { transform: translateX(2.5%); } }
        .night-veil { position: absolute; inset: 0; z-index: 11; pointer-events: none; background: linear-gradient(to bottom, rgba(26,34,62,0.38) 0%, rgba(20,26,48,0.2) 100%); opacity: 0; transition: opacity 1.8s ease; }
        body.night .night-veil { opacity: 1; }
        body.night .mist { opacity: 0.35; }
        body.night .win-glow { animation: none !important; opacity: 0.95; }
        .fireflies { position: absolute; inset: 0; z-index: 12; pointer-events: none; }
        .ff { position: absolute; width: 5px; height: 5px; border-radius: 50%; background: #FFE9A0; box-shadow: 0 0 9px 3px rgba(255,222,120,0.6); opacity: 0; }
        body.night .ff { animation: ff-drift var(--d, 7s) ease-in-out var(--dl, 0s) infinite; }
        @keyframes ff-drift { 0%,100% { opacity: 0; transform: translate(0,0); } 18% { opacity: 0.9; } 50% { opacity: 0.45; transform: translate(16px,-18px); } 72% { opacity: 0.85; } 88% { opacity: 0.2; transform: translate(-9px,-7px); } }
        body.wx-cloudy .cloud g, body.wx-rain .cloud g, body.wx-snow .cloud g { fill: #D9DCD6; }
        body.wx-fog .mist { opacity: 1; filter: blur(10px); }
        body.wx-fog .mist.m2 { opacity: 0.85; }
        .precip { position: absolute; inset: 0; overflow: hidden; z-index: 9; pointer-events: none; }
        .drop { position: absolute; top: -12%; width: 1.5px; height: 13px; border-radius: 1px; background: linear-gradient(to bottom, rgba(190,214,240,0), rgba(190,214,240,0.7)); animation: rain-fall linear infinite; }
        @keyframes rain-fall { to { transform: translateY(30vh); } }
        .flake { position: absolute; top: -8%; width: 5px; height: 5px; border-radius: 50%; background: rgba(255,255,255,0.92); box-shadow: 0 0 4px rgba(255,255,255,0.5); animation: snow-fall linear infinite; }
        @keyframes snow-fall { to { transform: translate(22px, 30vh); } }
        body.wx-snow .hill path[stroke], body.season-winter .hill path[stroke] { stroke: #F4F6F2; opacity: 0.75; }
        body.season-spring .apple-tree .canopy1 { fill: #6C9A58; }
        body.season-spring .apple-tree .apples { fill: #EBB7CE; }
        body.season-autumn .apple-tree .canopy1 { fill: #B0793C; }
        body.season-autumn .apple-tree .canopy2 { fill: #C89150; }
        body.season-winter .apple-tree .canopy1 { fill: #77855F; }
        body.season-winter .apple-tree .canopy2 { fill: #8A9A70; }
        body.season-winter .apple-tree .apples { display: none; }
        .wx-badge { position: absolute; right: 16px; bottom: 58%; z-index: 13; font-size: 0.66rem; font-weight: 600; letter-spacing: 0.06em; color: rgba(255,255,255,0.88); background: rgba(23,40,27,0.45); padding: 0.35rem 0.85rem; border-radius: 50px; backdrop-filter: blur(4px); -webkit-backdrop-filter: blur(4px); pointer-events: none; white-space: nowrap; }
        .scene .prop, .scene .apple-tree, .scene .sheep-walk, .scene .crow, .scene .castle, .scene .falling-apple { position: absolute; pointer-events: none; }
        .prop { transform-origin: bottom center; }
        .prop.hay { width: 52px; bottom: 18%; }
        .prop.graze { width: 46px; bottom: 19%; }
        .prop.small { transform: scale(0.72); }
        .prop.heather { width: 42px; bottom: 13%; }
        .prop.cottage { width: 64px; bottom: 14%; }
        .prop.pony { width: 66px; bottom: 18%; }
        .apple-tree { width: 94px; bottom: 16%; left: 75%; transform-origin: bottom center; animation: tree-shake 9s ease-in-out infinite; }
        .castle { width: 162px; bottom: 0; left: 1%; }
        .falling-apple { width: 14px; left: 0; top: 0; z-index: 3; opacity: 0; will-change: transform, top; }
        .cloud { position: absolute; z-index: 1; pointer-events: none; will-change: transform; }
        .scene .clickable { pointer-events: auto; cursor: pointer; transition: filter 0.15s; }
        .scene .clickable:hover { filter: drop-shadow(0 3px 7px rgba(19,34,53,0.3)) brightness(1.06); }
        .info-pop { position: fixed; left: 50%; bottom: calc(var(--scene-h) + 22px); transform: translateX(-50%) translateY(10px); width: min(360px, calc(100vw - 32px)); background: var(--paper); border: 1px solid var(--line); border-radius: 16px; padding: 20px 22px; box-shadow: 0 18px 48px rgba(23,40,27,0.24); z-index: 120; opacity: 0; pointer-events: none; transition: opacity 0.22s ease, transform 0.22s ease; }
        .info-pop.show { opacity: 1; transform: translateX(-50%) translateY(0); pointer-events: auto; }
        .info-pop .info-close { position: absolute; top: 9px; right: 13px; border: none; background: none; font-size: 24px; line-height: 1; color: var(--muted); cursor: pointer; padding: 0; }
        .info-pop .info-close:hover { color: var(--ink); }
        .info-pop .info-eyebrow { display: inline-flex; align-items: center; gap: 6px; font-size: 0.62rem; font-weight: 600; letter-spacing: 0.14em; text-transform: uppercase; color: var(--green-dk); margin-bottom: 8px; }
        .info-pop .info-title { font-family: var(--serif); font-size: 1.25rem; font-weight: 500; color: var(--ink); margin-bottom: 7px; padding-right: 18px; letter-spacing: -0.01em; }
        .info-pop .info-body { font-size: 0.9rem; line-height: 1.62; color: var(--muted); }
        .sheep-walk { width: 56px; bottom: 18%; left: 4%; transition: left 0.08s linear; animation: sheep-bob 0.62s ease-in-out infinite; }
        @keyframes sheep-bob { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-4px); } }
        .crow { width: 46px; bottom: 50%; left: 0; animation: crow-fly 9s ease-in-out infinite; }
        .crow-wings { transform-origin: 21px 13px; animation: crow-flap 0.34s ease-in-out infinite; }
        @keyframes crow-flap { 0%,100% { transform: scaleY(1); } 50% { transform: scaleY(0.34) translateY(-2px); } }
        @keyframes crow-fly {
          0% { transform: translate(-6vw,0) rotate(0deg); opacity: 0; } 8% { opacity: 1; }
          30% { transform: translate(26vw,-16px) rotate(0deg); } 48% { transform: translate(50vw,-4px) rotate(0deg); }
          56% { transform: translate(66vw,16px) rotate(8deg); } 61% { transform: translate(72vw,30px) rotate(12deg); }
          64% { transform: translate(70vw,24px) rotate(-10deg); } 74% { transform: translate(71vw,26px) rotate(5deg); }
          80% { transform: translate(73vw,18px) rotate(-8deg); } 90% { transform: translate(86vw,0px) rotate(-4deg); }
          100% { transform: translate(102vw,-16px) rotate(0deg); opacity: 1; }
        }
        @keyframes tree-shake { 0%,58% { transform: rotate(0deg); } 61% { transform: rotate(1.6deg); } 64% { transform: rotate(-1.4deg); } 67% { transform: rotate(0.7deg); } 70%,100% { transform: rotate(0deg); } }
        .falling-apple.eaten { opacity: 0 !important; }
        .sheep-walk.eating { animation: sheep-eat 1.1s ease-in-out; }
        @keyframes sheep-eat { 0%{transform:translateY(0) rotate(0deg)} 20%{transform:translateY(6px) rotate(3deg)} 45%{transform:translateY(3px) rotate(1deg)} 62%{transform:translateY(5px) rotate(2deg)} 80%{transform:translateY(2px) rotate(0.5deg)} 100%{transform:translateY(0) rotate(0deg)} }
        .smoke { transform-box: fill-box; transform-origin: center; }
        .smoke.s1 { animation: smoke 3.2s ease-out infinite; }
        .smoke.s2 { animation: smoke 3.2s ease-out 1.1s infinite; }
        .smoke.s3 { animation: smoke 3.2s ease-out 2.2s infinite; }
        @keyframes smoke { 0%{opacity:0;transform:translate(0,0) scale(0.5)} 25%{opacity:0.5} 100%{opacity:0;transform:translate(-3px,-15px) scale(1.5)} }
        .win-glow { opacity: 0; }
        @keyframes light-toggle { 0%,48%{opacity:0} 50%,90%{opacity:0.95} 92%,100%{opacity:0} }
        .win-glow.l1 { animation: light-toggle 6s ease-in-out infinite; }
        .win-glow.l2 { animation: light-toggle 7.5s ease-in-out 1.2s infinite; }
        .win-glow.l3 { animation: light-toggle 5.4s ease-in-out 2.6s infinite; }
        .win-glow.l4 { animation: light-toggle 8s ease-in-out 0.6s infinite; }
        .win-glow.l5 { animation: light-toggle 6.8s ease-in-out 3.4s infinite; }
        .castle-person .fig { opacity: 0; transform-box: fill-box; transform-origin: bottom center; animation: peek 11s ease-in-out infinite; }
        @keyframes peek { 0%,60%{opacity:0;transform:translateY(2px)} 67%,88%{opacity:1;transform:translateY(0)} 95%,100%{opacity:0;transform:translateY(2px)} }
        .marquee-strip { background: var(--racing); color: var(--paper); overflow: hidden; padding: 1.1rem 0; border-top: 1px solid rgba(245,241,230,0.12); }
        .marquee { display: flex; width: max-content; animation: marquee 36s linear infinite; }
        .marquee-strip:hover .marquee { animation-play-state: paused; }
        .marquee-inner { display: flex; align-items: center; gap: 2.8rem; padding-right: 2.8rem; }
        .marquee-item { font-family: var(--serif); font-size: 1rem; font-weight: 400; font-style: italic; letter-spacing: 0.02em; color: rgba(245,241,230,0.85); white-space: nowrap; }
        .marquee-dot { width: 5px; height: 5px; border-radius: 50%; background: var(--brass); flex-shrink: 0; }
        @keyframes marquee { to { transform: translateX(-50%); } }
        .statement { background: var(--paper); padding: var(--py) 0; }
        .statement-eyebrow { display: flex; align-items: center; gap: 1rem; font-size: 0.7rem; font-weight: 600; letter-spacing: 0.22em; text-transform: uppercase; color: var(--muted); margin-bottom: 2.4rem; }
        .statement-eyebrow::before { content: ''; width: 44px; height: 1px; background: var(--brass); }
        .statement-text { font-family: var(--serif); font-size: clamp(1.8rem, 3.6vw, 3.1rem); font-weight: 340; line-height: 1.3; letter-spacing: -0.01em; max-width: 21em; text-wrap: pretty; }
        .statement-text em { font-style: italic; color: var(--green-dk); }
        .statement-text .accent { font-style: italic; color: var(--heather); }
        .stats-strip { background: var(--paper); border-top: 1px solid var(--line); border-bottom: 1px solid var(--line); }
        .stats-grid { display: grid; grid-template-columns: repeat(3,1fr); text-align: center; }
        .stat-item { padding: 3.2rem 2rem; border-right: 1px solid var(--line); }
        .stat-item:last-child { border-right: none; }
        .stat-n { display: block; font-family: var(--serif); font-size: 3.6rem; font-weight: 400; line-height: 1; color: var(--racing); margin-bottom: 0.55rem; letter-spacing: -0.02em; font-variant-numeric: tabular-nums; }
        .stat-n small { font-size: 2.2rem; color: var(--brass); }
        .stat-l { font-size: 0.75rem; font-weight: 600; letter-spacing: 0.12em; text-transform: uppercase; color: var(--muted); }
        .why { padding: var(--py) 0; background: var(--paper); }
        .section-header { display: flex; align-items: baseline; justify-content: space-between; gap: 2rem; margin-bottom: 3.5rem; }
        .section-title { font-family: var(--serif); font-size: clamp(2.1rem, 3.4vw, 3rem); font-weight: 380; letter-spacing: -0.015em; line-height: 1.12; }
        .section-title em { font-style: italic; color: var(--green-dk); }
        .section-tag { font-size: 0.7rem; font-weight: 600; letter-spacing: 0.2em; text-transform: uppercase; color: var(--muted); flex-shrink: 0; }
        .why-cards { display: grid; grid-template-columns: repeat(3,1fr); gap: 1.6rem; }
        .why-card { position: relative; background: #FBF9F2; border: 1px solid var(--line); border-radius: 20px; padding: 2.7rem 2.2rem 2.4rem; overflow: hidden; transition: transform 0.28s cubic-bezier(0.22,1,0.36,1), box-shadow 0.28s; }
        .why-card::before { content: ''; position: absolute; top: 0; left: 0; width: 100%; height: 4px; }
        .why-card.h::before { background: var(--heather); }
        .why-card.c::before { background: var(--cheddar); }
        .why-card.a::before { background: var(--cider); }
        .why-card:hover { transform: translateY(-6px); box-shadow: 0 20px 44px rgba(23,40,27,0.1); }
        .card-badge { width: 84px; height: 84px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-bottom: 1.6rem; }
        .why-card.h .card-badge { background: rgba(140,94,156,0.12); }
        .why-card.c .card-badge { background: rgba(227,163,58,0.14); }
        .why-card.a .card-badge { background: rgba(178,58,44,0.11); }
        .card-badge svg { width: 50px; height: 50px; }
        .card-heading { font-family: var(--serif); font-size: 1.45rem; font-weight: 500; line-height: 1.22; margin-bottom: 0.65rem; letter-spacing: -0.01em; }
        .card-body { font-size: 0.95rem; font-weight: 400; color: var(--muted); line-height: 1.7; text-wrap: pretty; }
        .courses { padding: var(--py) 0; background: var(--racing); color: var(--paper); }
        .courses .section-title { color: var(--paper); }
        .courses .section-title em { color: var(--leaf); }
        .courses .section-tag { color: rgba(245,241,230,0.5); }
        .course-list { border-top: 1px solid rgba(245,241,230,0.16); }
        .course-row { display: grid; grid-template-columns: 4rem 1fr auto auto; align-items: center; gap: 2.5rem; padding: 2.1rem 0.5rem; border-bottom: 1px solid rgba(245,241,230,0.16); transition: background 0.22s, padding 0.28s cubic-bezier(0.22,1,0.36,1); }
        .course-row:hover { background: rgba(245,241,230,0.045); padding-left: 1.4rem; }
        .course-num { font-family: var(--serif); font-style: italic; font-size: 1.05rem; color: var(--brass); }
        .course-name { font-family: var(--serif); font-size: clamp(1.5rem, 2.6vw, 2.2rem); font-weight: 400; letter-spacing: -0.01em; line-height: 1.15; }
        .course-name small { display: block; font-family: var(--sans); font-size: 0.86rem; font-style: normal; color: rgba(245,241,230,0.6); margin-top: 0.4rem; font-weight: 400; letter-spacing: 0; }
        .course-levels { display: flex; gap: 0.45rem; flex-wrap: wrap; justify-content: flex-end; }
        .level-pill { font-size: 0.7rem; font-weight: 600; letter-spacing: 0.08em; padding: 0.32rem 0.8rem; border-radius: 50px; border: 1px solid rgba(245,241,230,0.3); color: rgba(245,241,230,0.85); white-space: nowrap; }
        .course-arr { font-size: 1.5rem; color: var(--brass); transition: transform 0.25s; }
        .course-row:hover .course-arr { transform: translateX(6px); }
        .courses-cta { margin-top: 2.6rem; display: flex; justify-content: center; }
        .placement { background: var(--paper-2); padding: var(--py) 0; position: relative; overflow: hidden; }
        .placement::before { content: '?'; position: absolute; right: -2%; top: 50%; transform: translateY(-52%); font-family: var(--serif); font-style: italic; font-size: clamp(18rem, 34vw, 30rem); font-weight: 340; color: rgba(30,66,39,0.06); line-height: 1; pointer-events: none; }
        .placement-inner { position: relative; z-index: 1; display: flex; align-items: center; justify-content: space-between; gap: 4rem; }
        .placement-tag { display: inline-flex; align-items: center; gap: 0.5rem; font-size: 0.7rem; font-weight: 600; letter-spacing: 0.14em; text-transform: uppercase; color: var(--racing); background: rgba(30,66,39,0.08); padding: 0.4rem 1rem; border-radius: 50px; margin-bottom: 1.3rem; }
        .placement-title { font-family: var(--serif); font-size: clamp(2rem, 3.6vw, 3rem); font-weight: 380; line-height: 1.14; letter-spacing: -0.015em; max-width: 18ch; }
        .placement-title em { font-style: italic; color: var(--green-dk); }
        .placement-sub { font-size: 1rem; font-weight: 400; color: var(--muted); margin-top: 1rem; max-width: 42ch; line-height: 1.7; text-wrap: pretty; }
        .about { padding: var(--py) 0; background: var(--paper); }
        .about-grid { display: grid; grid-template-columns: 1fr 1.1fr; gap: 5.5rem; align-items: center; }
        .about-img { aspect-ratio: 4/5; background: var(--paper-2); border-radius: 20px; display: flex; align-items: center; justify-content: center; position: relative; overflow: hidden; border: 1px solid var(--line); }
        .about-img::after { content: ''; position: absolute; inset: 0; background: repeating-linear-gradient(-45deg, transparent, transparent 18px, rgba(87,184,44,0.05) 18px, rgba(87,184,44,0.05) 19px); }
        .img-ph { position: relative; z-index: 1; display: flex; flex-direction: column; align-items: center; gap: 0.75rem; color: var(--muted); text-align: center; }
        .img-ph-icon { width: 2.75rem; height: 2.75rem; border: 1.5px solid var(--line); border-radius: 50%; display: flex; align-items: center; justify-content: center; }
        .img-ph-text { font-size: 0.68rem; font-weight: 600; letter-spacing: 0.12em; text-transform: uppercase; }
        .about-eyebrow { display: flex; align-items: center; gap: 1rem; font-size: 0.7rem; font-weight: 600; letter-spacing: 0.22em; text-transform: uppercase; color: var(--green-dk); margin-bottom: 1.3rem; }
        .about-eyebrow::before { content: ''; width: 36px; height: 1px; background: var(--brass); }
        .about h2 { font-family: var(--serif); font-size: clamp(2.1rem, 3.4vw, 3rem); font-weight: 380; line-height: 1.14; margin-bottom: 1.5rem; text-wrap: pretty; letter-spacing: -0.015em; }
        .about h2 em { font-style: italic; color: var(--green-dk); }
        .about-body { font-size: 1.03rem; font-weight: 400; color: var(--muted); line-height: 1.85; text-wrap: pretty; margin-bottom: 2rem; }
        .about-founders { display: flex; align-items: center; gap: 1.1rem; padding-top: 1.7rem; border-top: 1px solid var(--line); margin-bottom: 2rem; }
        .founders-av { width: 3.2rem; height: 3.2rem; border-radius: 50%; background: var(--racing); color: var(--paper); display: flex; align-items: center; justify-content: center; font-family: var(--serif); font-style: italic; font-size: 0.95rem; font-weight: 500; flex-shrink: 0; }
        .founders-av + div strong { font-size: 1rem; font-weight: 700; display: block; margin-bottom: 0.1rem; }
        .founders-av + div small { font-size: 0.8rem; color: var(--muted); }
        .v6footer { background: linear-gradient(to bottom, var(--racing) 0%, var(--racing) 45%, var(--racing-2) 100%); color: rgba(245,241,230,0.6); padding: 5.5rem 0 calc(2.5rem + var(--scene-h)); }
        .footer-grid { display: grid; grid-template-columns: 2fr 1fr 1.75fr 1fr; gap: 3rem; margin-bottom: 4rem; }
        .footer-brand-name { font-family: var(--brand); font-size: 1.3rem; font-weight: 700; color: var(--paper); margin-bottom: 0.15rem; }
        .footer-brand-name b { font-weight: 700; color: var(--leaf); }
        .footer-brand-sub { font-size: 0.56rem; font-weight: 600; letter-spacing: 0.24em; text-transform: uppercase; color: rgba(245,241,230,0.35); margin-bottom: 1.3rem; }
        .footer-brand-desc { font-size: 0.88rem; line-height: 1.7; color: rgba(245,241,230,0.45); text-wrap: pretty; max-width: 26ch; }
        .footer-col-title { font-size: 0.62rem; font-weight: 600; letter-spacing: 0.18em; text-transform: uppercase; color: rgba(245,241,230,0.35); margin-bottom: 1.2rem; }
        .footer-links { list-style: none; display: flex; flex-direction: column; gap: 0.6rem; }
        .footer-links a { font-size: 0.9rem; color: rgba(245,241,230,0.55); transition: color 0.15s; }
        .footer-links a:hover { color: #fff; }
        .footer-contact { display: flex; flex-direction: column; gap: 0.5rem; }
        .footer-contact p, .footer-contact a { font-size: 0.88rem; color: rgba(245,241,230,0.5); line-height: 1.6; }
        .footer-contact a:hover { color: #fff; }
        .footer-bottom { border-top: 1px solid rgba(245,241,230,0.1); padding-top: 1.75rem; display: flex; align-items: center; justify-content: space-between; gap: 1rem; flex-wrap: wrap; }
        .footer-copy { font-size: 0.72rem; color: rgba(245,241,230,0.3); }
        .footer-made { font-size: 0.72rem; color: rgba(245,241,230,0.3); display: inline-flex; align-items: center; gap: 0.5rem; }
        .footer-made svg { width: 16px; height: 16px; }
        .wa-fab { position: fixed; right: 18px; bottom: 18px; z-index: 150; width: 54px; height: 54px; border-radius: 50%; background: #25D366; display: flex; align-items: center; justify-content: center; box-shadow: 0 8px 24px rgba(0,0,0,0.3); transition: transform 0.2s cubic-bezier(0.22,1,0.36,1), box-shadow 0.2s; }
        .wa-fab:hover { transform: scale(1.09); box-shadow: 0 12px 30px rgba(0,0,0,0.35); }
        .wa-fab svg { width: 29px; height: 29px; fill: #fff; }
        .reveal { opacity: 0; transform: translateY(26px); transition: opacity 0.85s cubic-bezier(0.22,1,0.36,1), transform 0.85s cubic-bezier(0.22,1,0.36,1); }
        .reveal.in { opacity: 1; transform: none; }
        .reveal[data-d="1"] { transition-delay: 0.12s; }
        .reveal[data-d="2"] { transition-delay: 0.24s; }
        .reveal[data-d="3"] { transition-delay: 0.36s; }
        @media (max-width: 900px) {
          .why-cards { grid-template-columns: 1fr; }
          .about-grid { grid-template-columns: 1fr; gap: 3rem; }
          .about-img { aspect-ratio: 3/2; }
          .placement-inner { flex-direction: column; align-items: flex-start; gap: 2rem; }
          .footer-grid { grid-template-columns: 1fr 1fr; gap: 2.25rem; }
          .stats-grid { grid-template-columns: 1fr; }
          .stat-item { border-right: none; border-bottom: 1px solid var(--line); }
          .stat-item:last-child { border-bottom: none; }
          .section-header { flex-direction: column; gap: 0.6rem; }
          .course-row { grid-template-columns: 1fr auto; gap: 1rem; }
          .course-num { display: none; }
          .course-levels { grid-column: 1 / -1; justify-content: flex-start; }
        }
        @media (max-width: 720px) {
          .nav-links { display: none; }
          .nav-burger { display: flex; }
        }
        @media (max-width: 600px) {
          :root { --scene-h: 14vh; }
          .nav-logo-sub { display: none; }
          .nav-logo-name { font-size: 1rem; white-space: nowrap; }
          .nav .wrap { padding: 0 1.2rem; }
          .hero h1 { font-size: clamp(2.55rem, 12vw, 3.4rem); }
          .hero { padding-bottom: 20vh; }
          .hero-actions { flex-direction: column; align-items: stretch; }
          .footer-grid { grid-template-columns: 1fr; }
          .statement-text { font-size: 1.55rem; }
          .wx-badge { right: 10px; font-size: 0.6rem; }
          .castle { width: 110px; }
          .apple-tree { width: 70px; }
          .prop.pony { width: 52px; }
          .prop.cottage { width: 50px; }
          .sheep-walk { width: 44px; }
        }
        @media (prefers-reduced-motion: reduce) {
          .apple-tree, .falling-apple, .cloud, .sheep-walk, .sheep-walk.eating, .win-glow, .castle-person .fig, .smoke, .hero-bg, .mist, .ff, .drop, .flake, .marquee { animation: none !important; }
          .drop, .flake { display: none; }
          .win-glow { opacity: 0.75; }
          .curtain { display: none; }
          .eyebrow, .hero-lead, .hero-actions { opacity: 1; animation: none; }
          .hl > span { transform: none; animation: none; }
          .reveal { opacity: 1; transform: none; transition: none; }
          .crow { display: none; }
        }
      `}</style>

      <div className="grain" aria-hidden="true" />

      <div className="curtain" id="curtain" aria-hidden="true">
        <div className="curtain-name"><b>Somerset</b> Language Centre</div>
        <div className="curtain-rule" />
        <div className="curtain-sub">Valencia · Est. 2013</div>
      </div>

      <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden="true">
        <defs>
          <filter id="ink" x="-25%" y="-25%" width="150%" height="150%">
            <feTurbulence type="fractalNoise" baseFrequency="0.018" numOctaves={2} seed={7} result="n" />
            <feDisplacementMap in="SourceGraphic" in2="n" scale={2.4} />
          </filter>
          <filter id="wash" x="-40%" y="-40%" width="180%" height="180%">
            <feTurbulence type="fractalNoise" baseFrequency="0.026" numOctaves={3} seed={3} result="n" />
            <feDisplacementMap in="SourceGraphic" in2="n" scale={6} result="d" />
            <feGaussianBlur in="d" stdDeviation={1.1} />
          </filter>
        </defs>
      </svg>

      <nav className="nav" id="nav">
        <div className="wrap">
          <div className="nav-inner">
            <a href="/" className="nav-logo">
              <span className="nav-logo-name"><b>Somerset</b> Language Centre</span>
              <span className="nav-logo-sub">Valencia · Est. 2013</span>
            </a>
            <ul className="nav-links" role="list">
              <li><a href="/">Home</a></li>
              <li><a href="/blog">Blog</a></li>
              <li><a href="/#courses">Courses</a></li>
              <li><a href="/games">Games</a></li>
              <li><a href="/exercises">Exercises</a></li>
              <li className="nav-cta"><a href="/placement">Placement Test</a></li>
            </ul>
            <button className="nav-burger" id="navBurger" aria-label="Menu" aria-expanded="false">
              <span /><span /><span />
            </button>
          </div>
        </div>
      </nav>

      <div className="mobile-menu" id="mobileMenu" aria-hidden="true">
        <a href="/">Home</a>
        <a href="/#courses">Courses</a>
        <a href="/games">Somerset <em>Games</em></a>
        <a href="/placement">Placement <em>Test</em></a>
        <a href="/exercises">Exercises</a>
        <a href="/blog">Blog</a>
        <a href="/contact">Contact</a>
        <span className="mm-sub">Valencia · Est. 2013</span>
      </div>

      <section className="hero" id="hero">
        <div className="hero-bg" aria-hidden="true" />
        <div className="hero-content">
          <div className="eyebrow"><span className="dot" /> Valencia · Est. 2013</div>
          <h1>
            <span className="hl"><span>Where Valencia</span></span>
            <span className="hl"><span>learns <em>English</em></span></span>
          </h1>
          <p className="hero-lead">Small groups, native teachers and forty years of craft — for children, teens and adults. A little corner of the English countryside, in the heart of Valencia.</p>
          <div className="hero-actions">
            <a href="/placement" className="btn btn-primary">Find my level <span className="btn-arr">→</span></a>
            <a href="/#courses" className="btn btn-outline-white">View courses</a>
          </div>
        </div>

        <div className="scene" aria-hidden="true">
          <svg className="cloud" data-speed="0.26" style={{ top: '5%', left: '7%', width: 88, opacity: 0.9 }} viewBox="0 0 120 50" xmlns="http://www.w3.org/2000/svg"><g fill="#fff"><ellipse cx="38" cy="30" rx="24" ry="15" /><ellipse cx="66" cy="24" rx="28" ry="19" /><ellipse cx="92" cy="31" rx="22" ry="14" /><ellipse cx="64" cy="39" rx="42" ry="11" /></g></svg>
          <svg className="cloud" data-speed="0.13" style={{ top: '17%', left: '45%', width: 66, opacity: 0.72 }} viewBox="0 0 120 50" xmlns="http://www.w3.org/2000/svg"><g fill="#fff"><ellipse cx="38" cy="30" rx="24" ry="15" /><ellipse cx="66" cy="24" rx="28" ry="19" /><ellipse cx="92" cy="31" rx="22" ry="14" /><ellipse cx="64" cy="39" rx="42" ry="11" /></g></svg>
          <svg className="cloud" data-speed="0.34" style={{ top: '2%', left: '73%', width: 80, opacity: 0.84 }} viewBox="0 0 120 50" xmlns="http://www.w3.org/2000/svg"><g fill="#fff"><ellipse cx="38" cy="30" rx="24" ry="15" /><ellipse cx="66" cy="24" rx="28" ry="19" /><ellipse cx="92" cy="31" rx="22" ry="14" /><ellipse cx="64" cy="39" rx="42" ry="11" /></g></svg>

          <div className="hill far" id="h1hill">
            <svg viewBox="0 0 1600 300" preserveAspectRatio="xMidYMax slice" xmlns="http://www.w3.org/2000/svg">
              <path d="M-100,215 C120,148 340,196 560,170 C780,144 940,205 1160,162 C1340,128 1520,188 1700,160 L1700,300 L-100,300 Z" fill="#9DB292" opacity="0.8" />
              <path d="M-100,215 C120,148 340,196 560,170 C780,144 940,205 1160,162 C1340,128 1520,188 1700,160" fill="none" stroke="#EFCB8F" strokeWidth="3" opacity="0.5" />
            </svg>
          </div>
          <div className="mist m1" aria-hidden="true" />
          <div className="hill" id="h2">
            <svg viewBox="0 0 1600 300" preserveAspectRatio="xMidYMax slice" xmlns="http://www.w3.org/2000/svg">
              <path d="M-100,255 C80,195 220,240 400,215 C580,190 700,258 900,205 C1100,152 1280,235 1470,198 Q1590,175 1700,215 L1700,300 L-100,300 Z" fill="#7AA45F" />
              <path d="M-100,255 C80,195 220,240 400,215 C580,190 700,258 900,205 C1100,152 1280,235 1470,198 Q1590,175 1700,215" fill="none" stroke="#EFCB8F" strokeWidth="4" opacity="0.55" />
              <g fill="#9A7AA8" fillOpacity="0.5">
                <ellipse cx="200" cy="236" rx="9" ry="5" /><ellipse cx="240" cy="242" rx="7" ry="4" />
                <ellipse cx="320" cy="232" rx="8" ry="5" /><ellipse cx="360" cy="240" rx="7" ry="4" />
                <ellipse cx="700" cy="244" rx="8" ry="5" /><ellipse cx="740" cy="250" rx="6" ry="4" />
                <ellipse cx="980" cy="226" rx="8" ry="5" /><ellipse cx="1020" cy="234" rx="7" ry="4" />
                <ellipse cx="1300" cy="232" rx="8" ry="5" /><ellipse cx="1340" cy="240" rx="6" ry="4" />
              </g>
            </svg>
          </div>
          <div className="mist m2" aria-hidden="true" />
          <div className="hill" id="h3">
            <svg viewBox="0 0 1600 300" preserveAspectRatio="xMidYMax slice" xmlns="http://www.w3.org/2000/svg">
              <path d="M-100,278 C60,255 170,272 320,260 C470,248 565,268 710,256 C855,244 960,264 1095,252 C1230,240 1355,260 1480,250 C1570,243 1640,252 1700,250 L1700,300 L-100,300 Z" fill="#557E45" />
              <path d="M-100,278 C60,255 170,272 320,260 C470,248 565,268 710,256 C855,244 960,264 1095,252 C1230,240 1355,260 1480,250 C1570,243 1640,252 1700,250" fill="none" stroke="#E8BE85" strokeWidth="3" opacity="0.35" />
            </svg>
          </div>

          <svg className="castle clickable" data-info="castle" viewBox="0 0 172 185" xmlns="http://www.w3.org/2000/svg" aria-label="Dunster Castle">
            <path d="M-6,185 Q86,104 178,185 Z" fill="#7AA45F" />
            <path d="M-6,185 Q86,150 178,185 Z" fill="#557E45" />
            <g fill="#4F7A42"><circle cx="30" cy="102" r="16" /><circle cx="46" cy="90" r="13" /><circle cx="128" cy="88" r="17" /><circle cx="146" cy="102" r="14" /><circle cx="112" cy="78" r="13" /></g>
            <polygon points="42,118 42,68 47,68 47,62 52,62 52,68 57,68 57,62 62,62 62,68 66,68 66,118" fill="#C5AA9F" />
            <rect x="60" y="70" width="6" height="48" fill="#AE8F85" />
            <polygon points="64,118 64,76 110,76 110,118" fill="#C5AA9F" />
            <rect x="104" y="78" width="6" height="40" fill="#AE8F85" />
            <polygon points="78,76 78,50 96,50 96,76" fill="#CBB1A7" />
            <polygon points="75,50 87,37 99,50" fill="#695D54" />
            <line x1="87" y1="37" x2="87" y2="31" stroke="#695D54" strokeWidth="1.5" />
            <rect x="78" y="44" width="3" height="7" fill="#CBB1A7" /><rect x="93" y="44" width="3" height="7" fill="#CBB1A7" />
            <polygon points="106,118 106,66 111,66 111,60 116,60 116,66 121,66 121,60 126,60 126,66 130,66 130,118" fill="#C2A79D" />
            <rect x="124" y="68" width="6" height="50" fill="#A98A80" />
            <g fill="#54453E">
              <rect x="48" y="76" width="4" height="7" /><rect x="48" y="90" width="4" height="7" /><rect x="48" y="104" width="4" height="7" />
              <rect x="71" y="84" width="4" height="7" /><rect x="81" y="84" width="4" height="7" /><rect x="91" y="84" width="4" height="7" /><rect x="100" y="84" width="4" height="7" />
              <rect x="71" y="98" width="4" height="7" /><rect x="81" y="98" width="4" height="7" /><rect x="91" y="98" width="4" height="7" /><rect x="100" y="98" width="4" height="7" />
              <rect x="84" y="60" width="5" height="8" />
              <rect x="115" y="74" width="4" height="7" /><rect x="115" y="88" width="4" height="7" /><rect x="115" y="102" width="4" height="7" />
            </g>
            <rect className="win-glow l1" x="48" y="90" width="4" height="7" fill="#F6D98C" />
            <rect className="win-glow l2" x="100" y="98" width="4" height="7" fill="#F6D98C" />
            <rect className="win-glow l3" x="115" y="88" width="4" height="7" fill="#F6D98C" />
            <g className="castle-person">
              <rect x="84" y="60" width="5" height="8" fill="#F4D58A" />
              <g className="fig" fill="#3a2f28"><circle cx="86.5" cy="63.2" r="1.5" /><rect x="84.7" y="64.6" width="3.6" height="3.4" /></g>
            </g>
            <g fill="#5E8A4E"><circle cx="30" cy="132" r="16" /><circle cx="48" cy="138" r="13" /><circle cx="124" cy="134" r="16" /><circle cx="140" cy="140" r="12" /></g>
            <g fill="#4F7A42"><circle cx="18" cy="140" r="12" /><circle cx="150" cy="142" r="11" /><circle cx="64" cy="142" r="11" /><circle cx="98" cy="143" r="11" /></g>
          </svg>

          <svg className="prop cottage clickable" data-info="cottage" style={{ left: '30%' }} viewBox="0 0 72 60" xmlns="http://www.w3.org/2000/svg">
            <rect x="46" y="12" width="7" height="16" fill="#CFC2A6" /><rect x="16" y="32" width="40" height="26" rx="2" fill="#EFE7D4" />
            <path d="M9,36 Q11,16 36,12 Q61,16 63,36 Q63,39 58,37 Q36,28 14,37 Q9,39 9,36 Z" fill="#C7A452" />
            <path d="M16,23 Q36,16 56,23" stroke="#A4823A" strokeWidth="1.4" fill="none" />
            <rect x="31" y="42" width="10" height="16" rx="1" fill="#785636" />
            <rect x="20" y="40" width="8" height="8" rx="1" fill="#A7B6B8" /><rect x="44" y="40" width="8" height="8" rx="1" fill="#A7B6B8" />
            <rect className="win-glow l4" x="44" y="40" width="8" height="8" rx={1} fill="#F6D98C" />
            <g fill="#E4E0D6"><circle className="smoke s1" cx="49.5" cy="10" r="2.4" /><circle className="smoke s2" cx="49.5" cy="10" r="2.4" /><circle className="smoke s3" cx="49.5" cy="10" r="2.4" /></g>
          </svg>
          <svg className="prop cottage small clickable" data-info="cottage" style={{ left: '39%' }} viewBox="0 0 72 60" xmlns="http://www.w3.org/2000/svg">
            <rect x="19" y="14" width="6" height="14" fill="#CFC2A6" /><rect x="16" y="32" width="40" height="26" rx="2" fill="#E8DFC9" />
            <path d="M9,36 Q11,16 36,12 Q61,16 63,36 Q63,39 58,37 Q36,28 14,37 Q9,39 9,36 Z" fill="#BE9A48" />
            <path d="M16,23 Q36,16 56,23" stroke="#9C7A34" strokeWidth="1.4" fill="none" />
            <rect x="31" y="43" width="9" height="15" rx="1" fill="#785636" />
            <rect x="21" y="41" width="7" height="7" rx="1" fill="#A7B6B8" /><rect x="45" y="41" width="7" height="7" rx="1" fill="#A7B6B8" />
            <rect className="win-glow l5" x="45" y="41" width="7" height="7" rx={1} fill="#F6D98C" />
            <g fill="#E4E0D6"><circle className="smoke s1" cx="22" cy="12" r="2" /><circle className="smoke s2" cx="22" cy="12" r="2" /><circle className="smoke s3" cx="22" cy="12" r="2" /></g>
          </svg>

          <svg className="prop heather" style={{ left: '9%' }} viewBox="0 0 40 30" xmlns="http://www.w3.org/2000/svg">
            <ellipse cx="20" cy="26" rx="13" ry="4" fill="#557E45" />
            <g fill="#9A7AA8"><circle cx="9" cy="18" r="3" /><circle cx="15" cy="14" r="3.5" /><circle cx="21" cy="16" r="3" /><circle cx="27" cy="19" r="3" /><circle cx="20" cy="21" r="3" /><circle cx="13" cy="22" r="2.4" /><circle cx="26" cy="14" r="2.4" /></g>
          </svg>
          <svg className="prop heather" style={{ left: '62%' }} viewBox="0 0 40 30" xmlns="http://www.w3.org/2000/svg">
            <ellipse cx="20" cy="26" rx="13" ry="4" fill="#557E45" />
            <g fill="#9A7AA8"><circle cx="9" cy="18" r="3" /><circle cx="15" cy="14" r="3.5" /><circle cx="21" cy="16" r="3" /><circle cx="27" cy="19" r="3" /><circle cx="20" cy="21" r="3" /><circle cx="13" cy="22" r="2.4" /><circle cx="26" cy="14" r="2.4" /></g>
          </svg>
          <svg className="prop heather small" style={{ left: '70%' }} viewBox="0 0 40 30" xmlns="http://www.w3.org/2000/svg">
            <ellipse cx="20" cy="26" rx="13" ry="4" fill="#557E45" />
            <g fill="#9A7AA8"><circle cx="9" cy="18" r="3" /><circle cx="15" cy="14" r="3.5" /><circle cx="21" cy="16" r="3" /><circle cx="27" cy="19" r="3" /><circle cx="20" cy="21" r="3" /><circle cx="13" cy="22" r="2.4" /><circle cx="26" cy="14" r="2.4" /></g>
          </svg>

          <svg className="prop hay" style={{ left: '13%' }} viewBox="0 0 60 50" xmlns="http://www.w3.org/2000/svg">
            <ellipse cx="30" cy="30" rx="22" ry="18" fill="#CDA552" stroke="#9C7C36" strokeWidth="2" />
            <ellipse cx="30" cy="30" rx="14" ry="11.5" fill="none" stroke="#9C7C36" strokeWidth="1.4" opacity="0.8" />
            <ellipse cx="30" cy="30" rx="6" ry="5" fill="none" stroke="#9C7C36" strokeWidth="1.2" opacity="0.7" />
          </svg>
          <svg className="prop hay small" style={{ left: '23%' }} viewBox="0 0 60 50" xmlns="http://www.w3.org/2000/svg">
            <ellipse cx="30" cy="30" rx="22" ry="18" fill="#CDA552" stroke="#9C7C36" strokeWidth="2" />
            <ellipse cx="30" cy="30" rx="14" ry="11.5" fill="none" stroke="#9C7C36" strokeWidth="1.4" opacity="0.8" />
            <ellipse cx="30" cy="30" rx="6" ry="5" fill="none" stroke="#9C7C36" strokeWidth="1.2" opacity="0.7" />
          </svg>

          <svg className="prop graze clickable" data-info="sheep" style={{ left: '48%' }} viewBox="0 0 54 44" xmlns="http://www.w3.org/2000/svg">
            <rect x="18" y="28" width="2.4" height="11" fill="#33302a" /><rect x="32" y="28" width="2.4" height="11" fill="#33302a" />
            <ellipse cx="28" cy="22" rx="16" ry="12" fill="#EFE9DA" />
            <circle cx="16" cy="16" r="6" fill="#EFE9DA" /><circle cx="27" cy="12" r="7" fill="#EFE9DA" /><circle cx="39" cy="16" r="6" fill="#EFE9DA" />
            <ellipse cx="12" cy="28" rx="4.5" ry="6.5" fill="#3a342b" transform="rotate(-15 12 28)" />
            <ellipse cx="15" cy="23" rx="2.4" ry="1.4" fill="#3a342b" />
          </svg>
          <svg className="prop graze small clickable" data-info="sheep" style={{ left: '57%' }} viewBox="0 0 54 44" xmlns="http://www.w3.org/2000/svg">
            <rect x="18" y="28" width="2.4" height="11" fill="#33302a" /><rect x="32" y="28" width="2.4" height="11" fill="#33302a" />
            <ellipse cx="28" cy="22" rx="16" ry="12" fill="#EFE9DA" />
            <circle cx="16" cy="16" r="6" fill="#EFE9DA" /><circle cx="27" cy="12" r="7" fill="#EFE9DA" /><circle cx="39" cy="16" r="6" fill="#EFE9DA" />
            <ellipse cx="12" cy="28" rx="4.5" ry="6.5" fill="#3a342b" transform="rotate(-15 12 28)" />
            <ellipse cx="15" cy="23" rx="2.4" ry="1.4" fill="#3a342b" />
          </svg>

          <svg className="prop pony clickable" data-info="pony" style={{ left: '43%' }} viewBox="0 0 70 54" xmlns="http://www.w3.org/2000/svg">
            <path d="M55,20 Q61,24 59,34 Q57,42 52,44 Q56,35 51,28 Z" fill="#33241A" />
            <rect x="25" y="32" width="2.8" height="15" rx="1.3" fill="#3E2B1D" />
            <rect x="32" y="33" width="2.8" height="14" rx="1.3" fill="#4A3524" />
            <rect x="45" y="32" width="2.8" height="15" rx="1.3" fill="#3E2B1D" />
            <rect x="51" y="33" width="2.8" height="14" rx="1.3" fill="#4A3524" />
            <ellipse cx="39" cy="25" rx="17" ry="10" fill="#8A5A33" />
            <ellipse cx="39" cy="31" rx="12" ry="4.5" fill="#A97A4C" opacity="0.75" />
            <path d="M28,17 Q18,21 13,33 L21,39 Q26,28 33,23 Z" fill="#8A5A33" />
            <ellipse cx="14" cy="38" rx="6.4" ry="4.6" transform="rotate(-38 14 38)" fill="#7C4F2C" />
            <ellipse cx="10" cy="43" rx="3.4" ry="2.5" transform="rotate(-30 10 43)" fill="#D9C29A" />
            <circle cx="14.5" cy="35.5" r="1" fill="#241812" />
            <path d="M17,30 l2.5,-4 l1.5,4.5 Z" fill="#5C3B24" />
            <path d="M29,15 Q20,19 15,30" stroke="#33241A" strokeWidth="4" fill="none" strokeLinecap="round" />
          </svg>
          <svg className="prop pony small clickable" data-info="pony" style={{ left: '66%' }} viewBox="0 0 70 54" xmlns="http://www.w3.org/2000/svg">
            <path d="M55,20 Q61,24 59,34 Q57,42 52,44 Q56,35 51,28 Z" fill="#33241A" />
            <rect x="25" y="32" width="2.8" height="15" rx="1.3" fill="#3E2B1D" />
            <rect x="32" y="33" width="2.8" height="14" rx="1.3" fill="#4A3524" />
            <rect x="45" y="32" width="2.8" height="15" rx="1.3" fill="#3E2B1D" />
            <rect x="51" y="33" width="2.8" height="14" rx="1.3" fill="#4A3524" />
            <ellipse cx="39" cy="25" rx="17" ry="10" fill="#96633A" />
            <ellipse cx="39" cy="31" rx="12" ry="4.5" fill="#B08151" opacity="0.75" />
            <path d="M28,17 Q18,21 13,33 L21,39 Q26,28 33,23 Z" fill="#96633A" />
            <ellipse cx="14" cy="38" rx="6.4" ry="4.6" transform="rotate(-38 14 38)" fill="#875732" />
            <ellipse cx="10" cy="43" rx="3.4" ry="2.5" transform="rotate(-30 10 43)" fill="#DFC9A2" />
            <circle cx="14.5" cy="35.5" r="1" fill="#241812" />
            <path d="M17,30 l2.5,-4 l1.5,4.5 Z" fill="#6B4429" />
            <path d="M29,15 Q20,19 15,30" stroke="#33241A" strokeWidth="4" fill="none" strokeLinecap="round" />
          </svg>

          <svg className="apple-tree clickable" data-info="apple" viewBox="0 0 96 120" xmlns="http://www.w3.org/2000/svg">
            <path d="M44,118 C44,98 41,84 41,70 L55,70 C55,84 52,98 52,118 Z" fill="#6E5238" />
            <path d="M48,86 C44,80 40,78 36,80 M48,92 C52,86 57,85 60,88" stroke="#6E5238" strokeWidth="3.5" fill="none" strokeLinecap="round" />
            <g className="canopy1" fill="#5E8A4E">
              <circle cx="48" cy="44" r="28" /><circle cx="28" cy="54" r="19" /><circle cx="68" cy="54" r="19" /><circle cx="48" cy="62" r="22" />
            </g>
            <g className="canopy2" fill="#6E9A5A" opacity="0.7"><circle cx="40" cy="38" r="9" /><circle cx="58" cy="48" r="8" /></g>
            <g className="apples" fill="#AF4A3C">
              <circle cx="34" cy="50" r="3.2" /><circle cx="54" cy="40" r="3.2" /><circle cx="62" cy="58" r="3.2" />
              <circle cx="44" cy="62" r="3.2" /><circle cx="26" cy="54" r="2.8" />
            </g>
          </svg>

          <svg className="falling-apple" viewBox="0 0 16 18" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <path d="M8,6 C6,3 2,4 2,9 C2,14 5,17 8,17 C11,17 14,14 14,9 C14,4 10,3 8,6 Z" fill="#AF4A3C" />
            <path d="M8,6 C8,3 9,2 8,1" stroke="#6E5238" strokeWidth="1.4" fill="none" strokeLinecap="round" />
            <path d="M8.5,3 C11,1 13,3.5 10.5,5 C9.2,5.8 8.4,4.2 8.5,3 Z" fill="#5E8A4E" />
          </svg>

          <svg className="sheep-walk clickable" id="sheepWalk" data-info="sheep" viewBox="0 0 60 46" xmlns="http://www.w3.org/2000/svg">
            <rect x="17" y="30" width="2.6" height="12" rx="1.2" fill="#33302a" />
            <rect x="25" y="30" width="2.6" height="12" rx="1.2" fill="#33302a" />
            <rect x="37" y="30" width="2.6" height="12" rx="1.2" fill="#33302a" />
            <circle cx="12" cy="21" r="4" fill="#F2ECDD" />
            <ellipse cx="29" cy="22" rx="17" ry="12.5" fill="#F2ECDD" />
            <circle cx="17" cy="16" r="6.5" fill="#F2ECDD" /><circle cx="28" cy="12" r="7.5" fill="#F2ECDD" /><circle cx="40" cy="15" r="6.5" fill="#F2ECDD" />
            <ellipse cx="48" cy="20" rx="6" ry="7" fill="#3a342b" />
            <ellipse cx="44.5" cy="14" rx="3" ry="1.9" fill="#3a342b" transform="rotate(-28 44.5 14)" />
            <ellipse cx="53.2" cy="22.5" rx="2.7" ry="2" fill="#2c2823" />
            <circle cx="49" cy="18.5" r="1.3" fill="#F2ECDD" />
          </svg>

          <svg className="crow clickable" id="crow" data-info="crow" viewBox="0 0 48 24" xmlns="http://www.w3.org/2000/svg">
            <g fill="#1d2614">
              <ellipse cx="22" cy="15" rx="9" ry="3.4" />
              <circle cx="32" cy="13" r="3.1" />
              <polygon points="35,12 42,13.5 35,15" />
              <polygon points="13,15 3,11 7,17" />
            </g>
            <g className="crow-wings">
              <path d="M23,13 Q20,1 30,4 Q25,10 23,13 Z" fill="#1d2614" />
              <path d="M21,13 Q12,3 8,9 Q17,12 21,13 Z" fill="#26331a" />
            </g>
          </svg>

          <div className="wx-badge" id="wxBadge">Checking the weather in Somerset…</div>

          <div className="night-veil" aria-hidden="true" />
          <div className="fireflies" aria-hidden="true">
            <span className="ff" style={ffStyle('14%', '32%', '6.5s', '0s')} />
            <span className="ff" style={ffStyle('26%', '24%', '8.2s', '1.4s')} />
            <span className="ff" style={ffStyle('37%', '40%', '7.1s', '2.8s')} />
            <span className="ff" style={ffStyle('52%', '28%', '9s', '0.7s')} />
            <span className="ff" style={ffStyle('63%', '44%', '6.8s', '3.5s')} />
            <span className="ff" style={ffStyle('71%', '22%', '8.6s', '1.9s')} />
            <span className="ff" style={ffStyle('83%', '36%', '7.6s', '0.4s')} />
            <span className="ff" style={ffStyle('92%', '27%', '8.9s', '2.2s')} />
          </div>
        </div>
      </section>

      <div className="marquee-strip" aria-hidden="true">
        <div className="marquee">
          {[0, 1].map(i => (
            <div className="marquee-inner" key={i}>
              <span className="marquee-item">Children</span><span className="marquee-dot" />
              <span className="marquee-item">Teenagers</span><span className="marquee-dot" />
              <span className="marquee-item">Adults</span><span className="marquee-dot" />
              <span className="marquee-item">Cambridge B1 · B2 · C1</span><span className="marquee-dot" />
              <span className="marquee-item">EVAU</span><span className="marquee-dot" />
              <span className="marquee-item">Small groups</span><span className="marquee-dot" />
              <span className="marquee-item">Native teachers</span><span className="marquee-dot" />
              <span className="marquee-item">Since 2013</span><span className="marquee-dot" />
            </div>
          ))}
        </div>
      </div>

      <section className="statement">
        <div className="wrap">
          <div className="statement-eyebrow reveal">The Somerset way</div>
          <p className="statement-text reveal" data-d="1">
            We put students in <em>real situations</em> so they think and communicate in English from day one. Practical, oral, human — and taught with the patience of the <span className="accent">English countryside</span>.
          </p>
        </div>
      </section>

      <div className="stats-strip">
        <div className="wrap">
          <div className="stats-grid">
            <div className="stat-item reveal"><span className="stat-n">2013</span><span className="stat-l">Year established</span></div>
            <div className="stat-item reveal" data-d="1"><span className="stat-n"><span className="count" data-to="8">0</span><small>–</small><span className="count" data-to="10">0</span></span><span className="stat-l">Students per class</span></div>
            <div className="stat-item reveal" data-d="2"><span className="stat-n"><span className="count" data-to="40">0</span><small>+</small></span><span className="stat-l">Years of Sara&apos;s teaching experience</span></div>
          </div>
        </div>
      </div>

      <section className="why">
        <div className="wrap">
          <div className="section-header reveal">
            <h2 className="section-title">Why choose <em>Somerset?</em></h2>
            <span className="section-tag">Our pillars</span>
          </div>
          <div className="why-cards">
            <div className="why-card h reveal">
              <div className="card-badge">
                <svg viewBox="0 0 96 96" aria-hidden="true">
                  <g filter="url(#wash)" fill="#8C5E9C" opacity="0.42">
                    <ellipse cx="48" cy="30" rx="9" ry="11" /><ellipse cx="34" cy="36" rx="7" ry="9" /><ellipse cx="61" cy="34" rx="7" ry="9" />
                  </g>
                  <g filter="url(#ink)" fill="none" stroke="#3A3024" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M48,84 C45,66 44,52 49,38" /><path d="M48,60 C40,55 36,48 37,40" /><path d="M49,54 C57,49 61,43 59,36" />
                    <path d="M48,72 l-7,4 M48,66 l7,4 M44,58 l-6,2" />
                    <circle cx="48" cy="30" r="2" /><circle cx="43" cy="34" r="1.6" /><circle cx="53" cy="33" r="1.6" />
                    <circle cx="34" cy="36" r="1.8" /><circle cx="30" cy="40" r="1.4" /><circle cx="38" cy="40" r="1.4" />
                    <circle cx="61" cy="34" r="1.8" /><circle cx="57" cy="39" r="1.4" /><circle cx="64" cy="39" r="1.4" />
                  </g>
                </svg>
              </div>
              <h3 className="card-heading">Small groups</h3>
              <p className="card-body">Between 8 and 10 students per class. Every student gets real attention — not just a seat in the room.</p>
            </div>
            <div className="why-card c reveal" data-d="1">
              <div className="card-badge">
                <svg viewBox="0 0 96 96" aria-hidden="true">
                  <defs>
                    <clipPath id="ukclip"><rect x="14" y="30" width="44" height="30" rx="2.5" /></clipPath>
                    <clipPath id="esclip"><rect x="44" y="40" width="42" height="28" rx="2.5" /></clipPath>
                  </defs>
                  <g transform="rotate(-7 36 45)">
                    <g clipPath="url(#ukclip)">
                      <rect x="14" y="30" width="44" height="30" fill="#012169" />
                      <path d="M14,30 L58,60 M58,30 L14,60" stroke="#fff" strokeWidth="7" />
                      <path d="M14,30 L58,60 M58,30 L14,60" stroke="#C8102E" strokeWidth="3" />
                      <rect x="32" y="30" width="8" height="30" fill="#fff" />
                      <rect x="14" y="41" width="44" height="8" fill="#fff" />
                      <rect x="34" y="30" width="4" height="30" fill="#C8102E" />
                      <rect x="14" y="43" width="44" height="4" fill="#C8102E" />
                    </g>
                    <rect x="14" y="30" width="44" height="30" rx="2.5" fill="none" stroke="#fff" strokeWidth="1.6" />
                  </g>
                  <g transform="rotate(6 64 54)">
                    <g clipPath="url(#esclip)">
                      <rect x="44" y="40" width="42" height="28" fill="#C60B1E" />
                      <rect x="44" y="47" width="42" height="14" fill="#FFC400" />
                    </g>
                    <rect x="44" y="40" width="42" height="28" rx="2.5" fill="none" stroke="#fff" strokeWidth="1.6" />
                  </g>
                </svg>
              </div>
              <h3 className="card-heading">Native &amp; bilingual teachers</h3>
              <p className="card-body">All our teachers are native or bilingual, qualified and experienced. You&apos;ll learn from people who live the language.</p>
            </div>
            <div className="why-card a reveal" data-d="2">
              <div className="card-badge">
                <svg viewBox="0 0 96 96" aria-hidden="true">
                  <g filter="url(#wash)">
                    <path d="M48,36 C36,26 20,34 20,52 C20,72 33,84 48,84 C63,84 76,72 76,52 C76,34 60,26 48,36 Z" fill="#B23A2C" opacity="0.46" />
                    <path d="M51,22 C63,12 79,18 69,32 C63,39 53,32 51,22 Z" fill="#57B82C" opacity="0.42" />
                  </g>
                  <g filter="url(#ink)" fill="none" stroke="#3A3024" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M48,36 C36,26 20,34 20,52 C20,72 33,84 48,84 C63,84 76,72 76,52 C76,34 60,26 48,36 Z" />
                    <path d="M48,36 C48,26 50,19 46,13" />
                    <path d="M51,22 C63,12 79,18 69,32 C63,39 53,32 51,22 Z" />
                  </g>
                </svg>
              </div>
              <h3 className="card-heading">Expert teaching</h3>
              <p className="card-body">Co-founder Sara has 40+ years of teaching experience. Deep expertise that shapes every lesson, every level, every student.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="courses" id="courses">
        <div className="wrap">
          <div className="section-header reveal">
            <h2 className="section-title">Courses for <em>every age</em></h2>
            <span className="section-tag">What we teach</span>
          </div>
          <div className="course-list">
            <a href="/contact" className="course-row reveal">
              <span className="course-num">01</span>
              <span className="course-name">Children<small>Learning that feels like play — solid foundations from the very start.</small></span>
              <span className="course-levels"><span className="level-pill">Infantil</span><span className="level-pill">Primaria</span></span>
              <span className="course-arr">→</span>
            </a>
            <a href="/contact" className="course-row reveal" data-d="1">
              <span className="course-num">02</span>
              <span className="course-name">Teenagers<small>Confidence for school, exams and everything after.</small></span>
              <span className="course-levels"><span className="level-pill">ESO</span><span className="level-pill">Bachillerato</span></span>
              <span className="course-arr">→</span>
            </a>
            <a href="/contact" className="course-row reveal" data-d="2">
              <span className="course-num">03</span>
              <span className="course-name">Adults<small>Practical English for work, travel and real life.</small></span>
              <span className="course-levels"><span className="level-pill">All levels</span><span className="level-pill">Conversation</span></span>
              <span className="course-arr">→</span>
            </a>
            <a href="/contact" className="course-row reveal" data-d="3">
              <span className="course-num">04</span>
              <span className="course-name">Exam preparation<small>Cambridge results without the panic — proven, structured prep.</small></span>
              <span className="course-levels"><span className="level-pill">B1</span><span className="level-pill">B2 First</span><span className="level-pill">C1 Advanced</span><span className="level-pill">EVAU</span></span>
              <span className="course-arr">→</span>
            </a>
          </div>
          <div className="courses-cta reveal">
            <a href="/contact" className="btn btn-light">Ask about a course <span className="btn-arr">→</span></a>
          </div>
        </div>
      </section>

      <section className="placement" id="placement-cta">
        <div className="wrap">
          <div className="placement-inner">
            <div className="reveal">
              <div className="placement-tag">Free · 12–15 minutes · No sign-up</div>
              <h2 className="placement-title">Not sure <em>which level</em> you are?</h2>
              <p className="placement-sub">Take our free placement test and find out exactly where to start.</p>
            </div>
            <a href="/placement" className="btn btn-primary reveal" data-d="1">Start the test <span className="btn-arr">→</span></a>
          </div>
        </div>
      </section>

      <section className="about">
        <div className="wrap">
          <div className="about-grid">
            <div className="about-img reveal">
              <div className="img-ph">
                <div className="img-ph-icon">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.25">
                    <rect x="0.625" y="0.625" width="14.75" height="14.75" rx="1.375" />
                    <circle cx="5.5" cy="5.5" r="1.75" />
                    <path d="M0.625 11.5l3.875-3.875 2.875 2.875 3-3.625 5.25 5.25" />
                  </svg>
                </div>
                <span className="img-ph-text">Classroom photo</span>
              </div>
            </div>
            <div className="reveal" data-d="1">
              <div className="about-eyebrow">Our story</div>
              <h2>English for everyone<br />who <em>needs it</em></h2>
              <p className="about-body">Somerset Language Centre was founded in Valencia in 2013 with a single purpose: bring quality English teaching to everyone. Our method is fundamentally practical, based on oral communication — we put students in real, useful situations so they think and communicate in English from day one.</p>
              <div className="about-founders">
                <div className="founders-av">H&amp;S</div>
                <div>
                  <strong>Hugo &amp; Sara Hancock</strong>
                  <small>Founders · Sara has 40+ years of teaching experience</small>
                </div>
              </div>
              <a href="/#courses" className="btn btn-ghost">Discover our courses <span className="btn-arr">→</span></a>
            </div>
          </div>
        </div>
      </section>

      <footer className="v6footer">
        <div className="wrap">
          <div className="footer-grid">
            <div>
              <div className="footer-brand-name"><b>Somerset</b> Language Centre</div>
              <div className="footer-brand-sub">Valencia · Est. 2013</div>
              <p className="footer-brand-desc">English classes for all levels in Valencia, Spain. Children, teens and adults since 2013.</p>
            </div>
            <div>
              <div className="footer-col-title">Pages</div>
              <ul className="footer-links">
                <li><a href="/">Home</a></li><li><a href="/#courses">Courses</a></li>
                <li><a href="/games">Games</a></li><li><a href="/blog">Blog</a></li>
                <li><a href="/exercises">Exercises</a></li><li><a href="/placement">Placement Test</a></li>
                <li><a href="/contact">Contact</a></li>
              </ul>
            </div>
            <div>
              <div className="footer-col-title">Contact</div>
              <div className="footer-contact">
                <p>Calle Ministro Luis Mayans, 31, Bajo<br />Valencia, Spain</p>
                <a href="tel:+34601129552">601 12 95 52</a>
                <a href="tel:+34963388933">963 38 89 33</a>
                <a href="mailto:info@somersetlc.com">info@somersetlc.com</a>
              </div>
            </div>
            <div>
              <div className="footer-col-title">Follow</div>
              <ul className="footer-links">
                <li><a href="https://www.instagram.com/somersetlanguagecentre/" target="_blank" rel="noopener">Instagram</a></li>
                <li><a href="https://somersetlanguagecentre.blogspot.com" target="_blank" rel="noopener">Sara&apos;s Blog</a></li>
              </ul>
            </div>
          </div>
          <div className="footer-bottom">
            <span className="footer-copy">© 2026 Somerset Language Centre. All rights reserved.</span>
            <span className="footer-made">
              <svg viewBox="0 0 96 96" aria-hidden="true"><g fill="none" stroke="rgba(245,241,230,0.5)" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><path d="M48,84 C45,66 44,52 49,38" /><circle cx="48" cy="30" r="3" /><circle cx="40" cy="36" r="2.6" /><circle cx="56" cy="35" r="2.6" /></g></svg>
              Rooted in the Somerset countryside
            </span>
          </div>
        </div>
      </footer>

      <div className="info-pop" id="infoPop" hidden>
        <button className="info-close" id="infoClose" aria-label="Close">×</button>
        <div className="info-eyebrow">Somerset countryside</div>
        <div className="info-title" id="infoTitle" />
        <div className="info-body" id="infoBody" />
      </div>

      <a className="wa-fab" href="https://wa.me/34601129552?text=Hola%2C%20quiero%20informaci%C3%B3n%20sobre%20los%20cursos%20de%20ingl%C3%A9s" target="_blank" rel="noopener" aria-label="Chat on WhatsApp">
        <svg viewBox="0 0 448 512" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157zm-157 341.6c-33.2 0-65.7-8.9-94-25.7l-6.7-4-69.8 18.3L72 359.2l-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-84.9 184.6-186.6 184.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-32.6-16.3-54-29.1-75.5-66-5.7-9.8 5.7-9.1 16.3-30.3 1.8-3.7.9-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 35.2 15.2 49 16.5 66.6 13.9 10.7-1.6 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z" /></svg>
      </a>
    </>
  )
}
