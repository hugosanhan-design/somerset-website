'use client'
// Somerset homepage — v6 "Premium" design, ported from the canonical prototype
// (Somerset Website/Somerset Homepage v6 — Premium.html, approved 2026-07-08).
// Fraunces + Instrument Sans + Poppins wordmark · cream/racing-green palette ·
// curtain opening · live Somerset weather + seasons · countryside scene with
// night mode, mist, fireflies and Exmoor ponies.
import { useEffect, useLayoutEffect, useState } from 'react'
import Image from 'next/image'
import { classifyWeather, meadowGround, rainDropCount, solarLighting, somersetSeason, windMotion } from '@/lib/scene-weather'

const ffStyle = (l: string, b: string, d: string, dl: string) =>
  ({ left: l, bottom: b, '--d': d, '--dl': dl } as React.CSSProperties)

const INTRO_SEEN_KEY = 'somersetIntroSeen'

/* Real ratings + review excerpts, captured from public profiles 2026-07-18.
   Quotes are verbatim complete sentences from Google reviews (all 5★). */
const GOOGLE_REVIEWS_URL = 'https://www.google.com/maps/place/Somerset+Language+Centre/@39.4866863,-0.3716102,17z/data=!4m8!3m7!1s0xd604601c1453a5f:0xe2ac12582f38d91a!8m2!3d39.4866863!4d-0.3716102!9m1!1b1!16s%2Fg%2F1pv2f2446'
const FACEBOOK_URL = 'https://www.facebook.com/SomersetLanguageCentre/'
const MEJOR_URL = 'https://mejor.es/@somerset-language-centre/'

const REVIEWS = [
  { name: 'Lorena', text: 'Súper contenta con esta academia. Todo el personal es muy agradable y los profesores, muy dedicados. ¡Es el sitio donde mejor me han preparado para los exámenes!' },
  { name: 'Raquel Roldán', text: 'Es una academia familiar con un trato personal y muy bueno. Las clases son reducidas y los profesores muy atentos. Lo recomiendo a todo el mundo 100%.' },
  { name: 'Ana Benavent', text: 'He realizado varios cursos en esta academia, tanto para el B2, como para el C1 (superados ambos) y ha sido una gran experiencia. Los profesores están realmente volcados en el alumnado y se ajustan perfectamente a nuestras necesidades.' },
  { name: 'Victor Hernández', text: 'Con mi hija han conseguido lo que para nosotros era impensable.' },
  { name: 'Claudia Ucles', text: 'Me ayudaron mucho las clases, me saqué el C1 con ellos y la experiencia con las profes con las que estuve genial!!' },
  { name: 'Isabel Quilis', text: 'Llevo más de 5 años yendo a Somerset, y mi experiencia es más de 5 estrellas.' },
]

/* Every written review each platform shows publicly (the rest are score-only
   or login-walled). Shown in the in-page modal when a rating badge is clicked. */
const REVIEW_SOURCES: Record<string, {
  label: string; score: string; scoreNote: string; url: string; urlLabel: string;
  footnote: string; reviews: Array<{ name: string; text: string }>;
}> = {
  google: {
    label: 'Google', score: '5.0', scoreNote: '49 reviews · 47 five-star',
    url: GOOGLE_REVIEWS_URL, urlLabel: 'See all on Google',
    footnote: 'These are the 8 written reviews — the other 41 ratings are stars only.',
    reviews: [
      REVIEWS[3], REVIEWS[0], REVIEWS[4], REVIEWS[2],
      { name: 'Óscar Ojeda Ferrer', text: 'Estudié en la academia cuando era pequeño y mi experiencia fue muy buena. Este último año decidí presentarme al C1 y elegir a Somerset como mi escuela para prepararlo.' },
      REVIEWS[5],
      { name: 'Sara Doménech', text: 'Mi experiencia en Somerset ha sido excelente. Todos los profesores son nativos y enormemente cualificados. He obtenido allí tanto mi certificado B2 como C1.' },
      REVIEWS[1],
    ],
  },
  facebook: {
    label: 'Facebook', score: '100%', scoreNote: 'recommend · 12 reviews',
    url: FACEBOOK_URL, urlLabel: 'See all on Facebook',
    footnote: 'Facebook only shows the rest of its reviews to logged-in users.',
    reviews: [
      { name: 'Adita Vidal Tortosa', text: 'Academia de idiomas especialmente inglés y estoy encantada desde el primer día!!!! Preciosa y muy agradable y los profesores encantadores y aparte tenemos un salón biblioteca que es fenomenal y servicios enormes y limpísimos!!!! Chapo por la gente que trabaja así y se preocupa por nosotros sus alumnos así!!!!!' },
    ],
  },
  mejor: {
    label: 'Mejor.es', score: '10/10', scoreNote: 'Excelente · #3 en Educación en La Saïdia',
    url: MEJOR_URL, urlLabel: 'See the profile on Mejor.es',
    footnote: 'Mejor.es publishes scores rather than written reviews.',
    reviews: [],
  },
}

/* Course detail content — carried over from the level descriptions on the original
   somersetlc.com/cursos pages, adapted into the site voice. Factual content unchanged. */
const COURSES = [
  {
    name: 'Children',
    tagline: 'Learning that feels like play — solid foundations from the very start.',
    pills: ['Infantil', 'Primaria'],
    levels: [
      { level: 'Starters & Movers', text: 'First steps in English — listening, speaking and reading built through games, songs and activities, so the language grows naturally.' },
      { level: 'Flyers (9–11) · A2', text: 'Equivalent to A2 level, with content designed for children of this age: a solid grammar base, a growing command of English, and first steps in organising written ideas — everything practised through games and activities so learning feels natural and fun.' },
    ],
  },
  {
    name: 'Teenagers',
    tagline: 'Confidence for school, exams and everything after.',
    pills: ['ESO', 'Bachillerato'],
    levels: [
      { level: 'KET · A2 Key', text: 'The goal is real communication: speaking English with good pronunciation and the confidence to use it effectively, enriching everything already learnt at school.' },
      { level: 'PET · B1 Preliminary', text: 'Built around all four skills of the official Cambridge exams — Listening, Reading, Speaking and Writing — so nothing on exam day comes as a surprise.' },
      { level: 'FCE · B2 First', text: 'Students learn to converse, read and write correctly in English, deepening and consolidating the language — working individually, in pairs and in small groups through conversations, role-plays, debates and presentations.' },
      { level: 'C1 Advanced', text: 'For students aiming at an advanced command of English: understanding and expressing complex ideas, spoken and written, with the reading and listening skills to handle specialised texts with confidence.' },
    ],
  },
  {
    name: 'Adults',
    tagline: 'Practical English for work, travel and real life.',
    pills: ['All levels', 'Conversation'],
    levels: [
      { level: 'A1 · Beginner', text: 'Really communicate in English — good pronunciation and the confidence to use the language effectively from day one.' },
      { level: 'B1 · Intermediate', text: 'Designed for handling the everyday situations where English matters — travel, work, meeting people — at your own pace and in an enjoyable way.' },
      { level: 'B2 · Upper Intermediate', text: 'Builds the confidence to operate fully in English in any circumstance, in a comfortable and relaxed atmosphere — with real attention to pronunciation, grammar and specific vocabulary.' },
      { level: 'C1 · Advanced (CAE)', text: 'Every skill taken to its highest level for the Cambridge Advanced exam — the deeper, more precise English demanded in academic and professional life.' },
    ],
  },
  {
    name: 'Exam preparation',
    tagline: 'Cambridge results without the panic — proven, structured prep.',
    pills: ['B1', 'B2 First', 'C1 Advanced', 'EVAU'],
    levels: [
      { level: 'Cambridge exams', text: 'Structured preparation for every paper of the official exams — B1 Preliminary, B2 First and C1 Advanced — with mock exams and personal feedback so you walk in knowing exactly what to expect.' },
      { level: 'Summer intensives', text: 'Focused on preparing every part of the Cambridge exam in record time, with a specialised approach and experienced teachers.' },
      { level: 'EVAU English', text: 'Exam technique and calm, focused practice for the English paper in selectividad.' },
    ],
  },
]

export default function Home() {
  const [openCourse, setOpenCourse] = useState<number | null>(null)
  // Which rating source's reviews are open in the in-page modal (null = closed)
  const [reviewSrc, setReviewSrc] = useState<string | null>(null)

  useEffect(() => {
    if (!reviewSrc) return
    const onEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') setReviewSrc(null) }
    document.addEventListener('keydown', onEsc)
    document.body.classList.add('reviews-modal-open')
    return () => {
      document.removeEventListener('keydown', onEsc)
      document.body.classList.remove('reviews-modal-open')
    }
  }, [reviewSrc])
  // Runs before paint: if the curtain intro already played this session (e.g.
  // navigating back to "/" from another page), skip it instantly instead of
  // replaying the ~2.5s curtain + hero reveal every time.
  useLayoutEffect(() => {
    if (sessionStorage.getItem(INTRO_SEEN_KEY)) {
      document.body.classList.add('curtain-done', 'intro-skip')
    } else {
      sessionStorage.setItem(INTRO_SEEN_KEY, '1')
    }
  }, [])

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

    /* The fixed landscape stays in view while the sheep follows its meadow edge. */
    const sheep = $('sheepWalk')
    const scene = document.querySelector<HTMLElement>('.scene')
    let sheepRestTimer = 0
    let lastSheepX = -1
    const update = () => {
      const travel = Math.max(document.documentElement.scrollHeight - window.innerHeight, 1)
      const progress = Math.min(Math.max(window.scrollY / travel, 0), 1)
      const x = 0.29 + 0.33 * progress
      if (sheep && scene) {
        sheep.style.left = `${x * 100}%`
        sheep.style.bottom = `${meadowGround(x) * scene.clientHeight}px`
        if (lastSheepX >= 0 && Math.abs(x - lastSheepX) > 0.0001 && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
          const phase = progress * 68
          sheep.querySelectorAll<SVGElement>('.sheep-leg').forEach((leg, i) => {
            const swing = Math.sin(phase + (i % 2 ? Math.PI : 0)) * 22
            leg.style.transform = `rotate(${swing}deg)`
          })
          sheep.classList.add('walking')
          window.clearTimeout(sheepRestTimer)
          sheepRestTimer = window.setTimeout(() => {
            sheep.classList.remove('walking')
            sheep.querySelectorAll<SVGElement>('.sheep-leg').forEach(leg => { leg.style.transform = 'rotate(0deg)' })
          }, 220)
        }
        lastSheepX = x
      }
      document.body.classList.toggle('night', (document.body.dataset.solarNight ?? document.body.dataset.wxNight) === '1')
    }
    window.addEventListener('scroll', update, { passive: true })
    window.addEventListener('resize', update)
    update()
    cleanups.push(() => { window.removeEventListener('scroll', update); window.removeEventListener('resize', update); window.clearTimeout(sheepRestTimer) })

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
      const onClick = (e: MouseEvent) => { e.stopPropagation(); openPop(el.dataset.info || '') }
      const onActivate = (e: KeyboardEvent) => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openPop(el.dataset.info || '') }
      }
      el.addEventListener('click', onClick)
      el.addEventListener('keydown', onActivate)
      cleanups.push(() => { el.removeEventListener('click', onClick); el.removeEventListener('keydown', onActivate) })
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
          if (phase > 0.605 && phase < 0.68) { state = 'falling'; fallStart = ts }
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

    /* Live conditions at Dunster, refreshed while the page stays open. */
    const badge = $('wxBadge')
    const setSeason = () => {
      Array.from(document.body.classList).forEach(cl => { if (cl.startsWith('season-')) document.body.classList.remove(cl) })
      document.body.classList.add('season-' + somersetSeason(new Date()))
    }
    setSeason()
    let active = true
    let solarTimes: { sunrise: number; sunset: number } | null = null
    let weatherSummary = 'Checking the weather in Dunster…'
    let weatherKind = 'clear'
    let solarTransitionTimer = 0
    const enableSolarTransitions = () => {
      if (!scene || solarTransitionTimer) return
      solarTransitionTimer = window.setTimeout(() => scene.style.setProperty('--solar-transition', '60s'), 100)
    }
    const applySolar = () => {
      if (!solarTimes || !scene) return
      const light = solarLighting(Date.now() / 1000, solarTimes.sunrise, solarTimes.sunset)
      if (!light) return
      scene.style.setProperty('--night-opacity', String(light.night))
      scene.style.setProperty('--landscape-brightness', String(light.brightness))
      const skyVisibility = weatherKind === 'clear' ? 1 : weatherKind === 'cloudy' ? 0.55 : 0.2
      scene.style.setProperty('--dawn-opacity', String(light.dawn * 0.67 * skyVisibility))
      scene.style.setProperty('--afternoon-opacity', String(light.afternoon * 0.21 * skyVisibility))
      scene.style.setProperty('--dusk-opacity', String(light.dusk * 0.72 * skyVisibility))
      scene.style.setProperty('--sun-x', `${light.sunX}%`)
      scene.style.setProperty('--sun-y', `${light.sunY}%`)
      scene.style.setProperty('--sun-opacity', String(light.sunOpacity * (weatherKind === 'clear' ? 1 : weatherKind === 'cloudy' ? 0.28 : 0.06)))
      document.body.dataset.solarNight = light.lightsOn ? '1' : '0'
      update()
      if (badge) badge.textContent = `${weatherSummary} · ${light.phase}`
      enableSolarTransitions()
    }
    const refreshWeather = async () => {
      setSeason()
      try {
        const response = await fetch('https://api.open-meteo.com/v1/forecast?latitude=51.18&longitude=-3.44&current=temperature_2m,weather_code,is_day,precipitation,wind_speed_10m,wind_direction_10m,wind_gusts_10m&daily=sunrise,sunset&forecast_days=1&timeformat=unixtime&timezone=Europe%2FLondon')
        if (!response.ok) throw new Error(String(response.status))
        const data = await response.json()
        if (!active) return
        const current = data.current
        if (!current || !Number.isFinite(current.weather_code) || !Number.isFinite(current.temperature_2m)) throw new Error('Invalid weather response')
        const { weather, label } = classifyWeather(current.weather_code)
        weatherKind = weather
        const sunrise = data.daily?.sunrise?.[0]
        const sunset = data.daily?.sunset?.[0]
        if (Number.isFinite(sunrise) && Number.isFinite(sunset) && sunset > sunrise) solarTimes = { sunrise, sunset }
        const windSpeed = Number.isFinite(current.wind_speed_10m) ? current.wind_speed_10m : 0
        const gustSpeed = Number.isFinite(current.wind_gusts_10m) ? current.wind_gusts_10m : windSpeed
        const wind = windMotion(windSpeed, current.wind_direction_10m, gustSpeed)
        if (scene) {
          scene.classList.toggle('windy', wind.active)
          scene.style.setProperty('--wind-opacity', String(Math.min(0.72, wind.strength * Math.min(1, Math.abs(wind.eastward) * 1.4))))
          scene.style.setProperty('--wind-sign', wind.eastward < 0 ? '-1' : '1')
          scene.style.setProperty('--wind-drift', `${wind.drift}px`)
          scene.style.setProperty('--snow-drift', `${wind.drift * 0.45}px`)
          scene.style.setProperty('--wind-lean', `${wind.eastward * wind.strength * 15}deg`)
          scene.style.setProperty('--wind-lean-back', `${wind.eastward * wind.strength * -5}deg`)
          scene.style.setProperty('--smoke-drift', `${-9 + wind.drift * 0.32}px`)
          scene.style.setProperty('--crow-wind-offset', `${wind.drift * 0.18}px`)
          scene.style.setProperty('--wind-speed', `${Math.max(2.3, 6 - wind.strength * 3)}s`)
          scene.style.setProperty('--leaf-speed', `${Math.max(5, 11 - wind.strength * 5)}s`)
          scene.style.setProperty('--wing-duration', `${Math.max(0.22, 0.34 - wind.strength * 0.08)}s`)
        }
        Array.from(document.body.classList).forEach(cl => { if (cl.startsWith('wx-')) document.body.classList.remove(cl) })
        document.body.classList.add('wx-' + weather)
        document.body.dataset.wxNight = current.is_day === 0 ? '1' : '0'
        document.body.classList.toggle('cool-weather', current.temperature_2m < 14)
        if (!solarTimes && scene) {
          scene.style.setProperty('--night-opacity', current.is_day === 0 ? '1' : '0')
          scene.style.setProperty('--landscape-brightness', current.is_day === 0 ? '.77' : '1')
          enableSolarTransitions()
        }
        update()
        scene?.querySelector('.precip')?.remove()
        if ((weather === 'rain' || weather === 'snow' || weather === 'thunder') && scene) {
          const wrap = document.createElement('div')
          wrap.className = 'precip'
          const isSnow = weather === 'snow'
          const count = isSnow ? 22 : rainDropCount(current.weather_code, current.precipitation)
          for (let i = 0; i < count; i++) {
            const particle = document.createElement('span')
            particle.className = isSnow ? 'flake' : 'drop'
            particle.style.left = `${Math.random() * 100}%`
            particle.style.animationDuration = `${isSnow ? 4 + Math.random() * 4 : 0.75 + Math.random() * 0.7 - wind.strength * 0.14}s`
            particle.style.animationDelay = `${Math.random() * 4}s`
            if (!isSnow) particle.style.height = `${8 + Math.random() * 10}px`
            wrap.appendChild(particle)
          }
          scene.appendChild(wrap)
        }
        weatherSummary = `Dunster, Somerset · ${Math.round(current.temperature_2m)}° · ${label}${wind.active ? ` · wind ${Math.round(windSpeed)} km/h${gustSpeed >= windSpeed + 8 ? ` (gusts ${Math.round(gustSpeed)})` : ''}` : ''}`
        if (badge) badge.textContent = `${weatherSummary}${current.is_day === 0 ? ' · night' : ''}`
        applySolar()
      } catch {
        if (active) { weatherSummary = 'Dunster weather temporarily unavailable'; if (badge) badge.textContent = weatherSummary; applySolar() }
      }
    }
    void refreshWeather()
    const weatherInterval = window.setInterval(() => { void refreshWeather() }, 15 * 60 * 1000)
    const solarInterval = window.setInterval(() => { setSeason(); applySolar() }, 60 * 1000)
    cleanups.push(() => { active = false; window.clearInterval(weatherInterval); window.clearInterval(solarInterval); window.clearTimeout(solarTransitionTimer); scene?.querySelector('.precip')?.remove() })

    /* body classes must not leak to other pages on client-side navigation */
    cleanups.push(() => {
      document.body.classList.remove('night', 'curtain-done', 'cool-weather')
      Array.from(document.body.classList).forEach(cl => { if (cl.startsWith('wx-') || cl.startsWith('season-')) document.body.classList.remove(cl) })
      delete document.body.dataset.wxNight
      delete document.body.dataset.solarNight
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
        /* secondary group — Games / Exercises / Daily Quizzical / Blog: smaller,
           quieter, separated from the primary trio by a hairline */
        .nav-links .nav-sep { width: 1px; height: 18px; background: var(--line); margin: 0 0.55rem; }
        .nav-links .nav-sec a { font-size: 0.78rem; font-weight: 500; color: var(--muted); padding: 0.38rem 0.7rem; }
        .nav-links .nav-sec a:hover { color: var(--green-dk); }
        .nav:not(.scrolled) { background: linear-gradient(to bottom, rgba(8,16,10,0.5), rgba(8,16,10,0)); }
        .nav:not(.scrolled) .nav-logo-name { color: #fff; }
        .nav:not(.scrolled) .nav-logo-name b { color: var(--leaf); }
        .nav:not(.scrolled) .nav-logo-sub { color: rgba(255,255,255,0.55); }
        .nav:not(.scrolled) .nav-links a { color: rgba(255,255,255,0.92); }
        .nav:not(.scrolled) .nav-links a:hover { color: #fff; }
        .nav:not(.scrolled) .nav-links .nav-cta a { background: rgba(255,255,255,0.14); border: 1.5px solid rgba(255,255,255,0.4); color: #fff; }
        .nav:not(.scrolled) .nav-links .nav-cta a:hover { background: rgba(255,255,255,0.26); }
        .nav:not(.scrolled) .nav-links .nav-sep { background: rgba(255,255,255,0.3); }
        .nav:not(.scrolled) .nav-links .nav-sec a { color: rgba(255,255,255,0.68); }
        .nav:not(.scrolled) .nav-links .nav-sec a:hover { color: #fff; }
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
        body.menu-open .mobile-menu a:nth-of-type(1) { transition-delay: 0.05s; }
        body.menu-open .mobile-menu a:nth-of-type(2) { transition-delay: 0.1s; }
        body.menu-open .mobile-menu a:nth-of-type(3) { transition-delay: 0.15s; }
        body.menu-open .mobile-menu a:nth-of-type(4) { transition-delay: 0.2s; }
        body.menu-open .mobile-menu a:nth-of-type(5) { transition-delay: 0.25s; }
        body.menu-open .mobile-menu a:nth-of-type(6) { transition-delay: 0.28s; }
        body.menu-open .mobile-menu a:nth-of-type(7) { transition-delay: 0.31s; }
        body.menu-open .mobile-menu a:nth-of-type(8) { transition-delay: 0.34s; }
        .mobile-menu .mm-divider { width: 42px; height: 1px; background: rgba(245,241,230,0.25); margin: 1.1rem 0 0.9rem; opacity: 0; transition: opacity 0.4s ease 0.25s; }
        body.menu-open .mobile-menu .mm-divider { opacity: 1; }
        .mobile-menu a.mm-small { font-family: var(--sans); font-size: 1.02rem; font-weight: 500; color: rgba(245,241,230,0.8); padding: 0.32rem 1.5rem; letter-spacing: 0; }
        .mobile-menu .mm-sub { font-family: var(--sans); font-size: 0.68rem; font-weight: 600; letter-spacing: 0.26em; text-transform: uppercase; color: rgba(245,241,230,0.45); margin-top: 1.6rem; opacity: 0; transition: opacity 0.4s ease 0.4s; }
        body.menu-open .mobile-menu .mm-sub { opacity: 1; }
        .hero { position: relative; min-height: 100dvh; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; overflow: hidden; padding-bottom: 26vh; }
        .hero::before { content: ''; position: absolute; inset: 0; z-index: 1; background: linear-gradient(to bottom, rgba(8,20,12,0.52) 0%, rgba(8,20,12,0.18) 34%, rgba(8,20,12,0.3) 64%, rgba(30,66,39,0.28) 100%); }
        .hero::after { content: ''; position: absolute; inset: 0; z-index: 1; pointer-events: none; background: radial-gradient(ellipse at center, transparent 55%, rgba(8,20,12,0.35) 100%); }
        /* Once the curtain lifts (starts at 1.55s) the image drifts slowly toward
           the viewer — a very subtle "pulled into the landscape" zoom-in, then the
           ken-burns drift takes over from the same scale. */
        .hero-bg { position: absolute; inset: 0; z-index: 0; background-image: url("/hero-original.webp"); background-size: cover; background-position: center 34%; transform-origin: center; animation: hero-enter 7s cubic-bezier(0.22,1,0.36,1) 1.55s both, hero-kenburns 38s ease-in-out 8.55s infinite alternate; will-change: transform; }
        @keyframes hero-enter { from { transform: scale(1); } to { transform: scale(1.07); } }
        @keyframes hero-kenburns { 0% { transform: scale(1.07) translate(0,0); } 100% { transform: scale(1.14) translate(-1.4%,-1.2%); } }
        .hero-content { position: relative; z-index: 3; padding: 2rem 2rem 0; max-width: 880px; }
        .eyebrow { display: inline-flex; align-items: center; gap: 0.6rem; font-size: 0.7rem; font-weight: 600; letter-spacing: 0.22em; text-transform: uppercase; color: #fff; background: rgba(255,255,255,0.12); border: 1px solid rgba(255,255,255,0.26); padding: 0.45rem 1.1rem; border-radius: 50px; margin-bottom: 2rem; backdrop-filter: blur(6px); -webkit-backdrop-filter: blur(6px); opacity: 0; animation: rise-in 1s cubic-bezier(0.22,1,0.36,1) 2.05s forwards; }
        .eyebrow .dot { width: 6px; height: 6px; border-radius: 50%; background: var(--green); box-shadow: 0 0 0 3px rgba(87,184,44,0.35); }
        .hero h1 { font-family: var(--serif); font-size: clamp(3rem, 7.6vw, 6.2rem); font-weight: 380; line-height: 1.04; letter-spacing: -0.015em; color: #fff; margin-bottom: 1.7rem; text-wrap: balance; text-shadow: 0 2px 40px rgba(0,0,0,0.3); }
        .hero h1 em { font-style: italic; font-weight: 420; color: var(--leaf); }
        .hl { display: block; overflow: hidden; padding-bottom: 0.18em; margin-bottom: -0.18em; }
        .hl > span { display: block; transform: translateY(125%); animation: line-up 1.15s cubic-bezier(0.22,1,0.36,1) forwards; }
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
        .marquee-strip, .statement, .stats-strip, .why, .courses, .reviews, .placement, .about, .v6footer { position: relative; z-index: 2; }
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
          56% { transform: translate(82vw,7px) rotate(7deg); } 61% { transform: translate(94vw,19px) rotate(17deg); }
          64% { transform: translate(91vw,10px) rotate(-24deg); } 74% { transform: translate(82vw,-16px) rotate(-8deg); }
          80% { transform: translate(86vw,-22px) rotate(-5deg); } 90% { transform: translate(98vw,-28px) rotate(-4deg); }
          100% { transform: translate(108vw,-35px) rotate(0deg); opacity: 1; }
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
        .stats-grid { display: grid; grid-template-columns: repeat(4,1fr); text-align: center; }
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
        .course-item { border-bottom: 1px solid rgba(245,241,230,0.16); }
        .course-row { display: grid; grid-template-columns: 4rem 1fr auto auto; align-items: center; gap: 2.5rem; padding: 2.1rem 0.5rem; width: 100%; text-align: left; background: none; border: none; color: inherit; font: inherit; cursor: pointer; transition: background 0.22s, padding 0.28s cubic-bezier(0.22,1,0.36,1); }
        .course-row:hover { background: rgba(245,241,230,0.045); padding-left: 1.4rem; }
        .course-item.open .course-arr { transform: rotate(90deg); }
        .course-detail { padding: 0.3rem 0.5rem 2.3rem; display: grid; gap: 1.15rem; animation: detail-in 0.5s cubic-bezier(0.22,1,0.36,1); }
        @keyframes detail-in { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: none; } }
        .course-level { display: grid; grid-template-columns: 12rem 1fr; gap: 1.5rem; align-items: baseline; }
        .course-level-name { font-family: var(--serif); font-style: italic; font-size: 1.05rem; color: var(--leaf); }
        .course-level p { font-size: 0.95rem; line-height: 1.7; color: rgba(245,241,230,0.78); max-width: 64ch; margin: 0; }
        .course-detail-cta { justify-self: start; margin-top: 0.55rem; display: flex; gap: 0.8rem; flex-wrap: wrap; }
        .course-num { font-family: var(--serif); font-style: italic; font-size: 1.05rem; color: var(--brass); }
        .course-name { font-family: var(--serif); font-size: clamp(1.5rem, 2.6vw, 2.2rem); font-weight: 400; letter-spacing: -0.01em; line-height: 1.15; }
        .course-name small { display: block; font-family: var(--sans); font-size: 0.86rem; font-style: normal; color: rgba(245,241,230,0.6); margin-top: 0.4rem; font-weight: 400; letter-spacing: 0; }
        .course-levels { display: flex; gap: 0.45rem; flex-wrap: wrap; justify-content: flex-end; }
        .level-pill { font-size: 0.7rem; font-weight: 600; letter-spacing: 0.08em; padding: 0.32rem 0.8rem; border-radius: 50px; border: 1px solid rgba(245,241,230,0.3); color: rgba(245,241,230,0.85); white-space: nowrap; }
        .course-arr { font-size: 1.5rem; color: var(--brass); transition: transform 0.25s; }
        .course-row:hover .course-arr { transform: translateX(6px); }
        .courses-cta { margin-top: 2.6rem; display: flex; justify-content: center; gap: 0.9rem; flex-wrap: wrap; }
        .reviews { padding: var(--py) 0; background: var(--paper); }
        .rating-badges { display: grid; grid-template-columns: repeat(3,1fr); gap: 1.4rem; margin-bottom: 3rem; }
        .rating-badge { display: flex; flex-direction: column; align-items: center; text-align: center; gap: 0.3rem; background: #FBF9F2; border: 1px solid var(--line); border-radius: 20px; padding: 1.9rem 1.5rem 1.7rem; transition: transform 0.28s cubic-bezier(0.22,1,0.36,1), box-shadow 0.28s; font-family: inherit; color: inherit; cursor: pointer; width: 100%; }
        .rating-badge:hover { transform: translateY(-5px); box-shadow: 0 16px 36px rgba(23,40,27,0.1); }
        .rb-source { font-size: 0.66rem; font-weight: 600; letter-spacing: 0.18em; text-transform: uppercase; color: var(--muted); }
        .rb-score { font-family: var(--serif); font-size: 2.5rem; font-weight: 400; color: var(--racing); line-height: 1.15; letter-spacing: -0.02em; }
        .rb-stars { color: var(--brass); font-size: 1rem; letter-spacing: 0.2em; }
        .rb-sub { font-size: 0.84rem; color: var(--muted); }
        .review-cards { display: grid; grid-template-columns: repeat(3,1fr); gap: 1.6rem; }
        .review-card { display: flex; flex-direction: column; background: #FBF9F2; border: 1px solid var(--line); border-radius: 20px; padding: 2.1rem 2rem 1.9rem; transition: transform 0.28s cubic-bezier(0.22,1,0.36,1), box-shadow 0.28s; }
        .review-card:hover { transform: translateY(-6px); box-shadow: 0 20px 44px rgba(23,40,27,0.1); }
        .review-stars { color: var(--brass); font-size: 0.92rem; letter-spacing: 0.2em; margin-bottom: 0.9rem; }
        .review-text { font-family: var(--serif); font-style: italic; font-size: 1.02rem; font-weight: 340; color: var(--ink-soft); line-height: 1.7; flex: 1; text-wrap: pretty; }
        .review-meta { margin-top: 1.4rem; padding-top: 1.05rem; border-top: 1px solid var(--line); }
        .review-name { display: block; font-size: 0.9rem; font-weight: 700; font-style: normal; }
        .review-src { display: block; font-size: 0.73rem; color: var(--muted); margin-top: 0.1rem; }
        .reviews-cta { margin-top: 2.6rem; display: flex; justify-content: center; }
        .rv-overlay { position: fixed; inset: 0; z-index: 280; background: rgba(23,40,27,0.5); backdrop-filter: blur(6px); -webkit-backdrop-filter: blur(6px); display: flex; align-items: center; justify-content: center; padding: 1.2rem; animation: rv-fade 0.25s ease; }
        @keyframes rv-fade { from { opacity: 0; } }
        .rv-panel { position: relative; background: var(--paper); border: 1px solid var(--line); border-radius: 24px; width: min(660px, 100%); max-height: min(82vh, 800px); display: flex; flex-direction: column; overflow: hidden; box-shadow: 0 30px 80px rgba(8,20,12,0.4); animation: rv-rise 0.32s cubic-bezier(0.22,1,0.36,1); }
        @keyframes rv-rise { from { opacity: 0; transform: translateY(22px); } }
        .rv-close { position: absolute; top: 13px; right: 17px; background: none; border: none; font-size: 27px; line-height: 1; color: var(--muted); cursor: pointer; padding: 4px; z-index: 2; }
        .rv-close:hover { color: var(--ink); }
        .rv-head { padding: 1.9rem 2.2rem 1.3rem; border-bottom: 1px solid var(--line); display: flex; flex-direction: column; gap: 0.3rem; }
        .rv-score { font-family: var(--serif); font-size: 2.1rem; font-weight: 400; color: var(--racing); line-height: 1.1; letter-spacing: -0.02em; display: flex; align-items: baseline; gap: 0.7rem; }
        .rv-stars { color: var(--brass); font-size: 1rem; letter-spacing: 0.18em; }
        .rv-note { font-size: 0.85rem; color: var(--muted); }
        .rv-list { overflow-y: auto; padding: 0.3rem 2.2rem; flex: 1; }
        .rv-item { padding: 1.4rem 0; border-bottom: 1px solid var(--line); }
        .rv-item:last-child { border-bottom: none; }
        .rv-item .review-stars { margin-bottom: 0.55rem; }
        .rv-text { font-family: var(--serif); font-style: italic; font-weight: 340; font-size: 1rem; line-height: 1.7; color: var(--ink-soft); margin-bottom: 0.6rem; text-wrap: pretty; }
        .rv-name { display: block; font-style: normal; font-size: 0.85rem; font-weight: 700; }
        .rv-foot { padding: 1.1rem 2.2rem 1.35rem; border-top: 1px solid var(--line); display: flex; align-items: center; justify-content: space-between; gap: 0.8rem; flex-wrap: wrap; }
        .rv-footnote { font-size: 0.78rem; color: var(--muted); }
        .rv-foot a { font-size: 0.85rem; font-weight: 600; color: var(--green-dk); white-space: nowrap; }
        .rv-foot a:hover { text-decoration: underline; }
        body.reviews-modal-open { overflow: hidden; }
        .placement { background: var(--paper-2); padding: var(--py) 0; position: relative; overflow: hidden; }
        .placement::before { content: '?'; position: absolute; right: -2%; top: 50%; transform: translateY(-52%); font-family: var(--serif); font-style: italic; font-size: clamp(18rem, 34vw, 30rem); font-weight: 340; color: rgba(30,66,39,0.06); line-height: 1; pointer-events: none; }
        .placement-inner { position: relative; z-index: 1; display: flex; align-items: center; justify-content: space-between; gap: 4rem; }
        .placement-tag { display: inline-flex; align-items: center; gap: 0.5rem; font-size: 0.7rem; font-weight: 600; letter-spacing: 0.14em; text-transform: uppercase; color: var(--racing); background: rgba(30,66,39,0.08); padding: 0.4rem 1rem; border-radius: 50px; margin-bottom: 1.3rem; }
        .placement-title { font-family: var(--serif); font-size: clamp(2rem, 3.6vw, 3rem); font-weight: 380; line-height: 1.14; letter-spacing: -0.015em; max-width: 18ch; }
        .placement-title em { font-style: italic; color: var(--green-dk); }
        .placement-sub { font-size: 1rem; font-weight: 400; color: var(--muted); margin-top: 1rem; max-width: 42ch; line-height: 1.7; text-wrap: pretty; }
        .quizzical { background: var(--paper); padding: var(--py) 0; position: relative; overflow: hidden; }
        .quizzical::before { content: '“'; position: absolute; left: -3%; top: 50%; transform: translateY(-58%); font-family: var(--serif); font-style: italic; font-size: clamp(18rem, 34vw, 30rem); font-weight: 340; color: rgba(30,66,39,0.05); line-height: 1; pointer-events: none; }
        .quizzical-inner { position: relative; z-index: 1; display: flex; align-items: center; justify-content: space-between; gap: 4rem; }
        .quizzical-tag { display: inline-flex; align-items: center; gap: 0.5rem; font-size: 0.7rem; font-weight: 600; letter-spacing: 0.14em; text-transform: uppercase; color: var(--racing); background: rgba(30,66,39,0.08); padding: 0.4rem 1rem; border-radius: 50px; margin-bottom: 1.3rem; }
        .quizzical-title { font-family: var(--serif); font-size: clamp(2rem, 3.6vw, 3rem); font-weight: 380; line-height: 1.14; letter-spacing: -0.015em; max-width: 20ch; }
        .quizzical-title em { font-style: italic; color: var(--green-dk); }
        .quizzical-sub { font-size: 1rem; font-weight: 400; color: var(--muted); margin-top: 1rem; max-width: 44ch; line-height: 1.7; text-wrap: pretty; }
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
          .rating-badges { grid-template-columns: 1fr; }
          .review-cards { grid-template-columns: 1fr; }
          .about-grid { grid-template-columns: 1fr; gap: 3rem; }
          .about-img { aspect-ratio: 3/2; }
          .placement-inner { flex-direction: column; align-items: flex-start; gap: 2rem; }
          .quizzical-inner { flex-direction: column; align-items: flex-start; gap: 2rem; }
          .footer-grid { grid-template-columns: 1fr 1fr; gap: 2.25rem; }
          .stats-grid { grid-template-columns: 1fr 1fr; }
          .stat-item { padding: 2.2rem 1rem; border-bottom: 1px solid var(--line); }
          .stat-item:nth-child(2n) { border-right: none; }
          .stat-item:nth-child(n+3) { border-bottom: none; }
          .section-header { flex-direction: column; gap: 0.6rem; }
          .course-row { grid-template-columns: 1fr auto; gap: 1rem; }
          .course-num { display: none; }
          .course-levels { grid-column: 1 / -1; justify-content: flex-start; }
          .course-level { grid-template-columns: 1fr; gap: 0.3rem; }
        }
        @media (max-width: 720px) {
          .nav-links { display: none; }
          .nav-burger { display: flex; }
        }
        @media (max-width: 600px) {
          /* tighter vertical rhythm so sections don't feel endless on a phone */
          :root { --py: clamp(3.25rem, 11vw, 4.5rem); }
          .rv-head, .rv-foot { padding-left: 1.3rem; padding-right: 1.3rem; }
          .rv-list { padding-left: 1.3rem; padding-right: 1.3rem; }
          :root { --scene-h: 10vh; }
          .wrap { padding: 0 1.35rem; }
          .nav-logo-sub { display: none; }
          .nav-logo-name { font-size: 1rem; white-space: nowrap; }
          .nav .wrap { padding: 0 1.2rem; }
          .hero h1 { font-size: clamp(2.55rem, 12vw, 3.4rem); }
          /* top-align the hero on a phone with a clear gap below the nav, so the
             eyebrow isn't cramped right under the wordmark */
          .hero { justify-content: flex-start; padding-top: 6rem; padding-bottom: 10vh; }
          .eyebrow { margin-top: 1.2rem; }
          .hero-actions { flex-direction: column; align-items: stretch; }
          .footer-grid { grid-template-columns: 1fr; }
          .statement-text { font-size: 1.55rem; }
          .statement-eyebrow { margin-bottom: 1.6rem; }
          .section-header { margin-bottom: 2.2rem; }
          /* compact stats — no more one-number-per-screen scrolling */
          .stat-item { padding: 1.5rem 0.6rem; }
          .stat-n { font-size: 2.5rem; margin-bottom: 0.3rem; }
          .stat-n small { font-size: 1.5rem; }
          .stat-l { font-size: 0.66rem; letter-spacing: 0.08em; }
          /* leaner cards */
          .why-cards { gap: 1.1rem; }
          .why-card { padding: 1.9rem 1.6rem 1.7rem; }
          .card-badge { width: 62px; height: 62px; margin-bottom: 1.1rem; }
          .card-badge svg { width: 38px; height: 38px; }
          .review-card { padding: 1.7rem 1.6rem; }
          /* the floating weather pill lands in the middle of content on a
             narrow screen — drop it on mobile, it's decorative */
          .wx-badge { display: none; }
          .castle { width: 96px; }
          .apple-tree { width: 62px; }
          .prop.pony { width: 46px; }
          .prop.cottage { width: 44px; }
          .prop.hay { width: 40px; }
          .prop.graze { width: 36px; }
          .sheep-walk { width: 40px; }
          /* declutter the countryside on a phone — a calm, sparse ground rather
             than a busy diorama: one cloud, no duplicate props, no hay/heather,
             no crow. Keeps castle, one cottage, one sheep, one pony, the tree. */
          .scene .cloud ~ .cloud { display: none; }
          .scene .prop.small { display: none; }
          .scene .prop.hay,
          .scene .prop.heather { display: none; }
          .crow { display: none; }
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
        /* Curtain already played this session (e.g. navigated back to "/") —
           skip straight to the settled state, no replay of the ~2.5s intro. */
        body.intro-skip .curtain { display: none; }
        body.intro-skip .eyebrow,
        body.intro-skip .hero-lead,
        body.intro-skip .hero-actions { opacity: 1; animation: none; }
        body.intro-skip .hl > span { transform: none; animation: none; }
        body.intro-skip .hero-bg { animation: hero-kenburns 38s ease-in-out infinite alternate; }

        /* Coloured-pencil panorama: registered seasonal plates and live weather. */
        :root { --scene-h: clamp(170px, 24vh, 230px); }
        .hero { background: radial-gradient(ellipse at 50% 52%, #fff9ea 0%, #f4e5bf 57%, #d7ae6d 100%); padding-bottom: var(--scene-h); }
        .hero::before, .hero::after, .hero-bg { display: none; }
        .hero h1 { color: #273e32; text-shadow: none; }
        .hero h1 em { color: #8b653c; }
        .hero-lead { color: #405048; text-shadow: none; }
        .hero .eyebrow { color: #4a5947; background: rgba(255,250,230,.55); border-color: rgba(78,76,46,.25); backdrop-filter: none; }
        .hero .btn-outline-white { color: #294335; background: rgba(255,250,231,.45); border-color: rgba(37,65,48,.5); backdrop-filter: none; }
        .hero .btn-outline-white:hover { background: rgba(255,250,231,.8); border-color: #294335; }
        .nav:not(.scrolled) { background: linear-gradient(to bottom, rgba(255,248,223,.65), transparent); }
        .nav:not(.scrolled) .nav-logo-name, .nav:not(.scrolled) .nav-links a { color: #263d31; }
        .nav:not(.scrolled) .nav-logo-name b { color: #416b3c; }
        .nav:not(.scrolled) .nav-logo-sub, .nav:not(.scrolled) .nav-links .nav-sec a { color: #62705c; }
        .nav:not(.scrolled) .nav-links a:hover, .nav:not(.scrolled) .nav-links .nav-sec a:hover { color: #12291e; }
        .nav:not(.scrolled) .nav-links .nav-cta a { background: rgba(255,250,231,.5); border-color: rgba(37,65,48,.42); color: #263d31; }
        .nav:not(.scrolled) .nav-links .nav-cta a:hover { background: rgba(255,250,231,.85); }
        .nav:not(.scrolled) .nav-links .nav-sep { background: rgba(38,61,49,.25); }
        .nav:not(.scrolled) .nav-burger { background: rgba(255,250,231,.55); border-color: rgba(37,65,48,.4); }
        .nav:not(.scrolled) .nav-burger span { background: #263d31; }
        body.night .hero { background: radial-gradient(ellipse at 50% 50%, #3d4a4a 0%, #555b57 53%, #aa8256 100%); }
        body.night .hero h1, body.night .hero-lead { color: #fff9e9; }
        body.night .hero h1 em { color: #f0ce91; }
        body.night .hero .eyebrow { color: #fff3d7; background: rgba(32,47,44,.2); border-color: rgba(255,243,215,.35); }
        body.night .hero .btn-outline-white { color: #fff9e9; background: rgba(32,47,44,.12); border-color: rgba(255,249,233,.65); }
        body.night .nav:not(.scrolled) { background: linear-gradient(to bottom, rgba(25,39,39,.45), transparent); }
        body.night .nav:not(.scrolled) .nav-logo-name, body.night .nav:not(.scrolled) .nav-links a { color: #fff9e9; }
        body.night .nav:not(.scrolled) .nav-logo-name b { color: #d8e8bd; }
        body.night .nav:not(.scrolled) .nav-logo-sub, body.night .nav:not(.scrolled) .nav-links .nav-sec a { color: rgba(255,249,233,.75); }
        body.night .nav:not(.scrolled) .nav-links .nav-cta a { color: #fff9e9; background: rgba(255,255,255,.12); border-color: rgba(255,255,255,.5); }
        body.night .nav:not(.scrolled) .nav-burger span { background: #fff9e9; }
        .scene { position: fixed; overflow: hidden; isolation: isolate; -webkit-mask-image: none; mask-image: none; filter: none; background: transparent; box-shadow: none; }
        .scene::after { display: none; }
        .landscape { position: absolute; inset: 0; z-index: 1; background-image: url('/scene/pencil/summer-proportioned.webp'); background-size: 100% 100%; background-repeat: no-repeat; filter: brightness(var(--landscape-brightness, 1)); transition: filter var(--solar-transition, 0s) linear, background-image 0.5s ease; }
        body.season-spring .landscape { background-image: url('/scene/pencil/spring-proportioned.webp'); }
        body.season-autumn .landscape { background-image: url('/scene/pencil/autumn-proportioned.webp'); }
        body.season-winter .landscape { background-image: url('/scene/pencil/winter-proportioned.webp'); }
        body.wx-snow .landscape { background-image: url('/scene/pencil/winter-snow-proportioned.webp'); }
        .scene { --landscape-mask: url('/scene/pencil/summer-proportioned.webp'); }
        body.season-spring .scene { --landscape-mask: url('/scene/pencil/spring-proportioned.webp'); }
        body.season-autumn .scene { --landscape-mask: url('/scene/pencil/autumn-proportioned.webp'); }
        body.season-winter .scene { --landscape-mask: url('/scene/pencil/winter-proportioned.webp'); }
        body.wx-snow .scene { --landscape-mask: url('/scene/pencil/winter-snow-proportioned.webp'); }
        .scene .weather-shade, .scene .solar-glow, .scene .night-veil { -webkit-mask-image: var(--landscape-mask); mask-image: var(--landscape-mask); -webkit-mask-size: 100% 100%; mask-size: 100% 100%; -webkit-mask-repeat: no-repeat; mask-repeat: no-repeat; }
        .solar-glow { position: absolute; inset: 0; z-index: 3; pointer-events: none; transition: opacity var(--solar-transition, 0s) linear; }
        .solar-glow.dawn { opacity: var(--dawn-opacity, 0); background: radial-gradient(ellipse at 28% 52%, rgba(246,179,100,.8), transparent 42%), linear-gradient(to top, rgba(241,159,117,.42), transparent 72%); mix-blend-mode: multiply; }
        .solar-glow.afternoon { opacity: var(--afternoon-opacity, 0); background: linear-gradient(145deg, rgba(248,206,125,.15), rgba(229,163,82,.7) 78%, transparent); mix-blend-mode: multiply; }
        .solar-glow.dusk { opacity: var(--dusk-opacity, 0); background: radial-gradient(ellipse at 74% 52%, rgba(247,174,80,.85), transparent 39%), linear-gradient(to top, rgba(152,105,149,.5), transparent 75%); mix-blend-mode: multiply; }
        .pencil-sun { position: absolute; z-index: 3; left: var(--sun-x, 50%); top: var(--sun-y, 18%); width: clamp(22px, 2.9vw, 40px); height: clamp(22px, 2.9vw, 40px); transform: translate(-50%, -50%); opacity: var(--sun-opacity, 0); pointer-events: none; transition: left var(--solar-transition, 0s) linear, top var(--solar-transition, 0s) linear, opacity var(--solar-transition, 0s) linear; filter: drop-shadow(0 0 10px rgba(245,194,103,.52)); }
        .weather-shade { position: absolute; inset: 0; z-index: 2; pointer-events: none; opacity: 0; transition: opacity 1.5s ease; }
        body.wx-cloudy .weather-shade { opacity: 0.52; background: linear-gradient(#aabac4 0%, transparent 68%); }
        body.wx-rain .weather-shade, body.wx-thunder .weather-shade { opacity: 0.63; background: linear-gradient(#667f91 0%, #7c8a82 53%, transparent 100%); mix-blend-mode: multiply; }
        body.wx-thunder .weather-shade { opacity: .78; background: linear-gradient(#344d66, #60717b 65%, transparent); animation: storm-light 11s linear infinite; }
        @keyframes storm-light { 0%,67%,70%,100%{opacity:.78} 68%,69%{opacity:.24} }
        body.wx-snow .weather-shade { opacity: 0.45; background: linear-gradient(#d2e0eb, transparent 75%); }
        body.wx-fog .weather-shade { opacity: 0.58; background: linear-gradient(#ecebe4, #e1e5df 75%, transparent); }
        body.wx-fog .mist { z-index: 3; opacity: 0.9; }
        .scene .mist { z-index: 3; opacity: 0; }
        .night-veil { z-index: 4; background: linear-gradient(160deg, rgba(17,31,60,.64), rgba(37,49,71,.48) 55%, rgba(22,34,51,.54)); }
        body .scene .night-veil { opacity: var(--night-opacity, 0); transition: opacity var(--solar-transition, 0s) linear; }
        .scene-hotspot { position: absolute; z-index: 7; display: block; border: 0; background: transparent; padding: 0; color: transparent; pointer-events: auto; cursor: pointer; }
        .castle-hotspot { left: 3%; top: 14%; width: 13%; height: 56%; }
        .cottage-hotspot { left: 79%; top: 53%; width: 14%; height: 31%; }
        .pony-hotspot { left: 72%; top: 67%; width: 7%; height: 27%; z-index: 16; }
        .pony { position: absolute; z-index: 11; left: 72%; bottom: 6%; width: clamp(45px, 6.4vw, 90px); height: auto; pointer-events: none; filter: brightness(var(--landscape-brightness, 1)) saturate(.82); }
        .scene-hotspot.apple-tree { left: 91%; top: 18%; width: 9%; height: 70%; transform: none; animation: none; }
        .scene-hotspot:focus-visible, .sheep-walk:focus-visible, .crow:focus-visible { outline: 2px dashed #265646; outline-offset: 3px; }
        .castle-lights, .cottage-lights { position: absolute; z-index: 12; pointer-events: none; }
        .castle-lights { left: 4%; top: 28%; width: 11%; height: 37%; }
        .cottage-lights { left: 80%; top: 66%; width: 12%; height: 16%; }
        .window-light { position: absolute; display: block; width: clamp(2px, .3vw, 5px); height: clamp(3px, .5vw, 7px); background: #f9d981; border-radius: 40% 40% 15% 15%; box-shadow: 0 0 5px 2px rgba(251,203,99,.7), 0 0 14px 4px rgba(246,175,69,.36); opacity: 0; }
        .castle-lights .l1 { left: 10%; top: 18%; } .castle-lights .l2 { left: 14%; top: 40%; } .castle-lights .l3 { left: 37%; top: 55%; } .castle-lights .l4 { left: 61%; top: 46%; } .castle-lights .l5 { left: 82%; top: 62%; }
        .cottage-lights .l1 { left: 12%; top: 47%; } .cottage-lights .l2 { left: 40%; top: 33%; } .cottage-lights .l3 { left: 69%; top: 54%; } .cottage-lights .l4 { left: 86%; top: 38%; }
        body.night .window-light { animation: pencil-window 7s ease-in-out infinite; }
        body.night .window-light:nth-child(2) { animation-delay: -3.1s; animation-duration: 9s; }
        body.night .window-light:nth-child(3) { animation-delay: -5s; animation-duration: 11s; }
        body.night .window-light:nth-child(4) { animation-delay: -1.5s; animation-duration: 8s; }
        body.night .window-light:nth-child(5) { animation-delay: -4s; animation-duration: 12s; }
        @keyframes pencil-window { 0%,12%,90%,100%{opacity:0} 16%,82%{opacity:.94} 84%,87%{opacity:.55} }
        .chimney-smoke { position: absolute; z-index: 13; width: 28px; height: 45px; opacity: 0; pointer-events: none; transition: opacity 1s ease; }
        .smoke-a { left: 82%; top: 48%; } .smoke-b { left: 89%; top: 49%; }
        body.cool-weather .chimney-smoke, body.night .chimney-smoke { opacity: .75; }
        .chimney-smoke span { position: absolute; bottom: 0; left: 10px; width: 12px; height: 8px; border: 2px solid rgba(108,105,98,.66); border-left-color: transparent; border-bottom-color: transparent; border-radius: 50%; filter: blur(.5px); animation: pencil-smoke 4s ease-out infinite; opacity: 0; }
        .chimney-smoke span:nth-child(2) { animation-delay: 1.3s; } .chimney-smoke span:nth-child(3) { animation-delay: 2.6s; }
        @keyframes pencil-smoke { 0%{transform:translate(0,1px) scale(.6);opacity:0} 20%{opacity:.7} 100%{transform:translate(var(--smoke-drift, -9px),-34px) scale(1.7);opacity:0} }
        .sheep-walk { z-index: 15; width: clamp(56px, 5.1vw, 76px); height: clamp(50px, 4.7vw, 68px); transform: translateX(-50%); animation: none; transition: left .12s linear, bottom .12s linear; filter: brightness(var(--landscape-brightness, 1)) saturate(.72) contrast(.92); }
        .sheep-walk.walking { animation: pencil-sheep-bob .36s ease-in-out infinite; }
        @keyframes pencil-sheep-bob { 0%,100%{transform:translateX(-50%) translateY(0)} 50%{transform:translateX(-50%) translateY(-2px)} }
        .sheep-legs { position: absolute; inset: 0; width: 100%; height: 100%; overflow: visible; }
        .sheep-leg { transition: transform .13s ease-out; }
        .sheep-leg path { fill: none; stroke: #302d29; stroke-width: 3.2; stroke-linecap: round; stroke-linejoin: round; }
        .sheep-leg.rear path { stroke: #51473d; stroke-width: 3; }
        .sheep-body { position: absolute; z-index: 1; left: 0; top: 0; width: 100%; height: 74%; object-fit: contain; pointer-events: none; }
        .crow { z-index: 16; width: clamp(37px, 3.6vw, 52px); display: block; margin-left: var(--crow-wind-offset, 0px); filter: drop-shadow(0 1px 1px rgba(23,20,16,.25)); }
        .tree-impact { position: absolute; z-index: 17; left: 96%; top: 33%; width: 24px; height: 24px; opacity: 0; pointer-events: none; animation: tree-impact 9s linear infinite; }
        .tree-impact::before, .tree-impact::after { content: ''; position: absolute; inset: 6px; border-top: 2px solid #493c2d; border-left: 1px solid #493c2d; transform: rotate(25deg); }
        .tree-impact::after { transform: rotate(120deg); }
        @keyframes tree-impact { 0%,60%,65%,100% { opacity: 0; transform: scale(.3) rotate(0deg); } 61%,63% { opacity: .85; transform: scale(1) rotate(30deg); } }
        .crow-wings { animation-duration: var(--wing-duration, .34s); }
        .falling-apple { z-index: 15; }
        .precip { z-index: 14; }
        .drop { width: 1px; background: linear-gradient(to bottom, transparent, rgba(76,100,120,.68)); box-shadow: 1px 0 rgba(244,242,230,.3); rotate: var(--wind-lean, 0deg); }
        @keyframes rain-fall { to { transform: translate(var(--wind-drift, 0px), calc(var(--scene-h) + 60px)); } }
        @keyframes snow-fall { to { transform: translate(var(--snow-drift, 0px), calc(var(--scene-h) + 50px)); } }
        .flake { background: #fbfaf2; border: 1px solid #a6b6bf; }
        .wind-strokes { position: absolute; inset: 0; z-index: 13; pointer-events: none; transform: scaleX(var(--wind-sign, 1)); opacity: 0; transition: opacity 1.3s ease; }
        .scene.windy .wind-strokes { opacity: var(--wind-opacity, .35); }
        .wind-strokes span { position: absolute; left: -14%; display: block; width: clamp(38px, 8vw, 110px); height: 14px; border-top: 1px solid rgba(73,83,72,.67); border-radius: 50%; box-shadow: 0 -2px 0 -1px rgba(75,84,73,.28); animation: pencil-wind var(--wind-speed, 4s) linear infinite; }
        .wind-strokes span:nth-child(1) { top: 30%; animation-delay: -2.8s; }
        .wind-strokes span:nth-child(2) { top: 45%; animation-delay: -1.1s; width: 60px; }
        .wind-strokes span:nth-child(3) { top: 60%; animation-delay: -3.9s; width: 76px; }
        .wind-strokes span:nth-child(4) { top: 73%; animation-delay: -.4s; width: 48px; }
        .wind-strokes span:nth-child(5) { top: 24%; animation-delay: -4.8s; width: 58px; }
        body.night .wind-strokes span { border-color: rgba(222,224,216,.65); box-shadow: 0 -2px 0 -1px rgba(222,224,216,.26); }
        @keyframes pencil-wind { to { translate: 125vw 0; } }
        .wind-grass { position: absolute; inset: auto 0 0; height: 19%; z-index: 13; pointer-events: none; opacity: 0; transition: opacity 1.3s ease; }
        .scene.windy .wind-grass { opacity: .8; }
        .wind-grass span { position: absolute; bottom: 1%; width: 9px; height: 26px; border-left: 1px solid rgba(88,104,59,.72); border-radius: 62% 0 0 0; transform-origin: bottom; animation: pencil-grass 2.1s ease-in-out infinite alternate; }
        .wind-grass span:nth-child(2n) { height: 19px; animation-delay: -.7s; }
        .wind-grass span:nth-child(3n) { height: 31px; animation-delay: -1.5s; }
        body.season-autumn .wind-grass span, body.season-winter .wind-grass span { border-color: rgba(118,93,61,.7); }
        @keyframes pencil-grass { from { transform: rotate(var(--wind-lean-back, 0deg)) scaleY(.92); } to { transform: rotate(var(--wind-lean, 0deg)) scaleY(1.06); } }
        .wind-leaves { position: absolute; inset: 0; z-index: 13; pointer-events: none; display: none; opacity: var(--wind-opacity, .4); transform: scaleX(var(--wind-sign, 1)); }
        body.season-autumn .scene.windy .wind-leaves { display: block; }
        .wind-leaves span { position: absolute; left: -5%; width: 7px; height: 4px; border: 1px solid #9b6b3a; border-radius: 70% 10% 70% 10%; background: #bb8345; opacity: .7; animation: pencil-leaf var(--leaf-speed, 8s) linear infinite; }
        .wind-leaves span:nth-child(1) { top: 68%; animation-delay: -1s; }
        .wind-leaves span:nth-child(2) { top: 81%; animation-delay: -4s; }
        .wind-leaves span:nth-child(3) { top: 59%; animation-delay: -6s; }
        .wind-leaves span:nth-child(4) { top: 74%; animation-delay: -8s; }
        @keyframes pencil-leaf { to { translate: 110vw 18px; rotate: 540deg; } }
        .wx-badge { z-index: 20; right: 14px; bottom: 9px; color: #26392f; background: rgba(255,251,239,.88); box-shadow: 0 1px 8px rgba(31,38,31,.14); font-size: .67rem; letter-spacing: .01em; }
        .fireflies { z-index: 13; }
        @media (max-width: 600px) {
          :root { --scene-h: clamp(115px, 19vh, 150px); }
          .scene { overflow: hidden; }
          .hero { padding-bottom: var(--scene-h); }
          .landscape { background-size: 100% 100%; background-position: center bottom; }
          .landscape { background-image: url('/scene/pencil/summer-integrated.webp'); }
          body.season-spring .landscape { background-image: url('/scene/pencil/spring-integrated.webp'); }
          body.season-autumn .landscape { background-image: url('/scene/pencil/autumn-integrated.webp'); }
          body.season-winter .landscape { background-image: url('/scene/pencil/winter-integrated.webp'); }
          body.wx-snow .landscape { background-image: url('/scene/pencil/winter-snow-integrated.webp'); }
          .scene { --landscape-mask: url('/scene/pencil/summer-integrated.webp'); }
          body.season-spring .scene { --landscape-mask: url('/scene/pencil/spring-integrated.webp'); }
          body.season-autumn .scene { --landscape-mask: url('/scene/pencil/autumn-integrated.webp'); }
          body.season-winter .scene { --landscape-mask: url('/scene/pencil/winter-integrated.webp'); }
          body.wx-snow .scene { --landscape-mask: url('/scene/pencil/winter-snow-integrated.webp'); }
          .castle-hotspot, .cottage-hotspot, .pony-hotspot, .apple-tree, .castle-lights, .cottage-lights, .chimney-smoke { display: none; }
          .falling-apple { display: none; }
          .sheep-walk { width: 45px; height: 45px; }
          .pony { width: 32px; }
          .crow { display: block; }
          .wx-badge { display: block; font-size: .55rem; max-width: calc(100% - 20px); overflow: hidden; text-overflow: ellipsis; right: 10px; bottom: 5px; }
        }
        @media (prefers-reduced-motion: reduce) {
          .sheep-walk, .sheep-walk.walking, .crow, .crow-wings, .chimney-smoke span, .window-light, .weather-shade, .landscape, .solar-glow, .pencil-sun, .night-veil, .mist, .ff, .drop, .flake, .wind-strokes span, .wind-grass span, .wind-leaves span { animation: none !important; transition: none !important; }
          .wind-strokes, .wind-grass, .wind-leaves { display: none !important; }
          body.night .window-light { opacity: .82; }
          .drop, .flake { display: none; }
          .crow { left: 50%; opacity: 1; transform: none; }
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
              <li><a href="/#about">Who we are</a></li>
              <li><a href="/#courses">Courses</a></li>
              <li><a href="/contact">Contact</a></li>
              <li className="nav-sep" aria-hidden="true" />
              <li className="nav-sec"><a href="/games">Games</a></li>
              <li className="nav-sec"><a href="/exercises">Exercises</a></li>
              <li className="nav-sec"><a href="/daily-quizzical">Daily Quizzical</a></li>
              <li className="nav-sec"><a href="/blog">Blog</a></li>
              <li className="nav-cta"><a href="/placement">Placement Test</a></li>
            </ul>
            <button className="nav-burger" id="navBurger" aria-label="Menu" aria-expanded="false">
              <span /><span /><span />
            </button>
          </div>
        </div>
      </nav>

      <div className="mobile-menu" id="mobileMenu" aria-hidden="true">
        <a href="/#about">Who <em>we are</em></a>
        <a href="/#courses">Courses</a>
        <a href="/contact">Contact</a>
        <a href="/placement">Placement <em>Test</em></a>
        <span className="mm-divider" aria-hidden="true" />
        <a href="/games" className="mm-small">Somerset Games</a>
        <a href="/exercises" className="mm-small">Exercises</a>
        <a href="/daily-quizzical" className="mm-small">Daily Quizzical</a>
        <a href="/blog" className="mm-small">Blog</a>
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

        <div className="scene" aria-label="A hand-drawn Somerset landscape that changes with the local season and weather">
          <div className="landscape" aria-hidden="true" />
          <div className="weather-shade" aria-hidden="true" />
          <div className="solar-glow dawn" aria-hidden="true" />
          <div className="solar-glow afternoon" aria-hidden="true" />
          <div className="solar-glow dusk" aria-hidden="true" />
          <svg className="pencil-sun" viewBox="0 0 48 48" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">
            <circle cx="24" cy="24" r="15" fill="#f4d083" fillOpacity=".75" stroke="#a77b45" strokeWidth="1.1" />
            <circle cx="24" cy="24" r="12.5" fill="none" stroke="#fff0bf" strokeWidth="1" strokeDasharray="3 2" opacity=".7" />
            <path d="M11 19l8-5m-7 11l7-4m7-8l7 3m-5 13l8 3m-22 0l6-4" fill="none" stroke="#bd945b" strokeWidth=".7" opacity=".5" />
          </svg>
          <div className="mist m1" aria-hidden="true" />
          <div className="mist m2" aria-hidden="true" />
          <div className="wind-strokes" aria-hidden="true"><span /><span /><span /><span /><span /></div>
          <div className="wind-grass" aria-hidden="true">
            {[4, 9, 17, 22, 31, 39, 47, 55, 63, 72, 81, 89, 96].map(x => <span key={x} style={{ left: `${x}%` }} />)}
          </div>
          <div className="wind-leaves" aria-hidden="true"><span /><span /><span /><span /></div>

          <button type="button" className="scene-hotspot castle-hotspot clickable" data-info="castle" aria-label="Discover Dunster Castle" />
          <button type="button" className="scene-hotspot cottage-hotspot clickable" data-info="cottage" aria-label="Discover Somerset cottages" />
          <button type="button" className="scene-hotspot pony-hotspot clickable" data-info="pony" aria-label="Discover the Exmoor pony" />
          <button type="button" className="scene-hotspot apple-tree clickable" data-info="apple" aria-label="Discover the apple tree" />
          <Image className="pony" src="/scene/pencil/pony-distant.webp" alt="" width={1457} height={1005} unoptimized />
          <span className="tree-impact" aria-hidden="true" />

          <div className="castle-lights" aria-hidden="true">
            <span className="window-light l1" /><span className="window-light l2" /><span className="window-light l3" /><span className="window-light l4" /><span className="window-light l5" />
          </div>
          <div className="cottage-lights" aria-hidden="true">
            <span className="window-light l1" /><span className="window-light l2" /><span className="window-light l3" /><span className="window-light l4" />
          </div>
          <div className="chimney-smoke smoke-a" aria-hidden="true"><span /><span /><span /></div>
          <div className="chimney-smoke smoke-b" aria-hidden="true"><span /><span /><span /></div>

          <svg className="falling-apple" viewBox="0 0 16 18" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <path d="M8,6 C6,3 2,4 2,9 C2,14 5,17 8,17 C11,17 14,14 14,9 C14,4 10,3 8,6 Z" fill="#AF4A3C" />
            <path d="M8,6 C8,3 9,2 8,1" stroke="#6E5238" strokeWidth="1.4" fill="none" strokeLinecap="round" />
          </svg>

          <div className="sheep-walk clickable" id="sheepWalk" data-info="sheep" role="button" tabIndex={0} aria-label="Discover Somerset sheep">
            <svg className="sheep-legs" viewBox="0 0 100 88" aria-hidden="true">
              <g className="sheep-leg rear" style={{ transformOrigin: '24px 47px' }}><path d="M24 47 Q21 62 19 81" /></g>
              <g className="sheep-leg rear" style={{ transformOrigin: '42px 48px' }}><path d="M42 48 Q42 64 41 82" /></g>
              <g className="sheep-leg" style={{ transformOrigin: '59px 48px' }}><path d="M59 48 Q57 65 58 82" /></g>
              <g className="sheep-leg" style={{ transformOrigin: '77px 45px' }}><path d="M77 45 Q78 61 76 81" /></g>
            </svg>
            <Image className="sheep-body" src="/scene/pencil/sheep-body.webp" alt="" width={1536} height={1024} unoptimized />
          </div>

          <svg className="crow clickable" id="crow" data-info="crow" viewBox="0 0 58 40" xmlns="http://www.w3.org/2000/svg" role="button" tabIndex={0} aria-label="Discover the crow">
            <path d="M18 23 3 16 9 26 1 27 19 29Z" fill="#252525" stroke="#716b60" strokeWidth=".8" strokeLinejoin="round" />
            <path d="M14 19q8-7 20-2l7 6-6 5-17 2q-7-3-4-11Z" fill="#282c2b" stroke="#131918" strokeWidth="1" />
            <path d="M33 18q1-8 7-8 6 0 7 7l-3 7-8-2Z" fill="#2b302e" stroke="#131918" strokeWidth="1" />
            <path d="m46 16 11 3-11 3Z" fill="#584b39" stroke="#292a26" strokeWidth=".8" />
            <circle cx="42" cy="15" r="1" fill="#e8d8ae" />
            <g className="crow-wings"><path d="M25 22Q19 11 23 1l5 10 2-9 5 11 2-7q5 9-1 19Z" fill="#303735" stroke="#161b1a" strokeWidth="1.1" strokeLinejoin="round" /><path d="M27 23Q20 24 16 34l9-5 3 8 5-9 4 6 1-11Z" fill="#222a29" stroke="#121817" strokeWidth="1" /></g>
            <path d="m18 25 11 1m-8-4 8 1m-4-5 7 2m-6-7 5 6m4 3 7 1" fill="none" stroke="#a9a393" strokeWidth=".7" opacity=".65" />
            <path d="m28 28 1 6 4 2m5-9 2 6 5 2" fill="none" stroke="#403a34" strokeWidth="1.1" strokeLinecap="round" />
          </svg>

          <div className="wx-badge" id="wxBadge">Checking the weather in Dunster…</div>
          <div className="night-veil" aria-hidden="true" />
          <div className="fireflies" aria-hidden="true">
            <span className="ff" style={ffStyle('14%', '32%', '6.5s', '0s')} />
            <span className="ff" style={ffStyle('26%', '24%', '8.2s', '1.4s')} />
            <span className="ff" style={ffStyle('52%', '28%', '9s', '0.7s')} />
            <span className="ff" style={ffStyle('71%', '22%', '8.6s', '1.9s')} />
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
              <span className="marquee-item">5.0 ★ on Google</span><span className="marquee-dot" />
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
            <div className="stat-item reveal" data-d="3"><span className="stat-n">5.0<small>★</small></span><span className="stat-l">Google rating · 49 reviews</span></div>
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
            {/* No `reveal` here: these re-render on click, and React rewriting className
                would strip the observer-added `in` class — the row would vanish. */}
            {COURSES.map((c, i) => (
              <div key={c.name} className={`course-item${openCourse === i ? ' open' : ''}`}>
                <button type="button" className="course-row" aria-expanded={openCourse === i}
                  onClick={() => setOpenCourse(openCourse === i ? null : i)}>
                  <span className="course-num">0{i + 1}</span>
                  <span className="course-name">{c.name}<small>{c.tagline}</small></span>
                  <span className="course-levels">{c.pills.map(p => <span key={p} className="level-pill">{p}</span>)}</span>
                  <span className="course-arr">→</span>
                </button>
                {openCourse === i && (
                  <div className="course-detail">
                    {c.levels.map(l => (
                      <div key={l.level} className="course-level">
                        <span className="course-level-name">{l.level}</span>
                        <p>{l.text}</p>
                      </div>
                    ))}
                    <div className="course-detail-cta">
                      <a href="/courses" className="btn btn-light">See timetables <span className="btn-arr">→</span></a>
                      <a href="/contact" className="btn btn-outline-white">Ask about this course <span className="btn-arr">→</span></a>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
          <div className="courses-cta reveal">
            <a href="/courses" className="btn btn-light">Timetables &amp; groups <span className="btn-arr">→</span></a>
            <a href="/contact" className="btn btn-outline-white">Ask about a course <span className="btn-arr">→</span></a>
          </div>
        </div>
      </section>

      <section className="reviews" id="reviews">
        <div className="wrap">
          <div className="section-header reveal">
            <h2 className="section-title">What our students <em>say</em></h2>
            <span className="section-tag">Reviews</span>
          </div>
          <div className="rating-badges reveal">
            <button type="button" className="rating-badge" onClick={() => setReviewSrc('google')}>
              <span className="rb-source">Google</span>
              <span className="rb-score">5.0</span>
              <span className="rb-stars" aria-hidden="true">★★★★★</span>
              <span className="rb-sub">49 reviews →</span>
            </button>
            <button type="button" className="rating-badge" onClick={() => setReviewSrc('facebook')}>
              <span className="rb-source">Facebook</span>
              <span className="rb-score">100%</span>
              <span className="rb-stars" aria-hidden="true">★★★★★</span>
              <span className="rb-sub">recommend · 12 reviews →</span>
            </button>
            <button type="button" className="rating-badge" onClick={() => setReviewSrc('mejor')}>
              <span className="rb-source">Mejor.es</span>
              <span className="rb-score">10/10</span>
              <span className="rb-stars" aria-hidden="true">★★★★★</span>
              <span className="rb-sub">rated by students →</span>
            </button>
          </div>
          <div className="review-cards">
            {REVIEWS.map((r, i) => (
              <blockquote className="review-card reveal" data-d={String(i % 3)} key={r.name}>
                <div className="review-stars" aria-label="5 out of 5 stars">★★★★★</div>
                <p className="review-text">“{r.text}”</p>
                <footer className="review-meta">
                  <cite className="review-name">{r.name}</cite>
                  <span className="review-src">Google review</span>
                </footer>
              </blockquote>
            ))}
          </div>
          <div className="reviews-cta reveal">
            <button type="button" onClick={() => setReviewSrc('google')} className="btn btn-ghost">Read all the reviews <span className="btn-arr">→</span></button>
          </div>
        </div>
      </section>

      <section className="quizzical" id="daily-quizzical-cta">
        <div className="wrap">
          <div className="quizzical-inner">
            <div className="reveal">
              <div className="quizzical-tag">Free · 3–5 minutes · New piece every morning</div>
              <h2 className="quizzical-title">A daily habit of <em>questioning what you know</em></h2>
              <p className="quizzical-sub">Daily Quizzical is a short reading piece published every morning — the true, more complicated history behind things everyone assumes they already know. 59 pieces so far, sorted by topic.</p>
            </div>
            <a href="/daily-quizzical" className="btn btn-primary reveal" data-d="1">Read Daily Quizzical <span className="btn-arr">→</span></a>
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

      <section className="about" id="about">
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
                <li><a href="/#about">Who we are</a></li><li><a href="/#courses">Courses</a></li>
                <li><a href="/contact">Contact</a></li><li><a href="/placement">Placement Test</a></li>
                <li><a href="/games">Games</a></li><li><a href="/exercises">Exercises</a></li>
                <li><a href="/daily-quizzical">Daily Quizzical</a></li><li><a href="/blog">Blog</a></li>
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
                <li><a href="https://www.facebook.com/SomersetLanguageCentre/" target="_blank" rel="noopener">Facebook</a></li>
                <li><a href="https://www.google.com/maps/place/Somerset+Language+Centre/@39.4866863,-0.3716102,17z/data=!4m8!3m7!1s0xd604601c1453a5f:0xe2ac12582f38d91a!8m2!3d39.4866863!4d-0.3716102!9m1!1b1!16s%2Fg%2F1pv2f2446" target="_blank" rel="noopener">Google Reviews · 5.0 ★</a></li>
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

      {reviewSrc && (
        <div className="rv-overlay" role="dialog" aria-modal="true" aria-label={`${REVIEW_SOURCES[reviewSrc].label} reviews`} onClick={() => setReviewSrc(null)}>
          <div className="rv-panel" onClick={e => e.stopPropagation()}>
            <button type="button" className="rv-close" onClick={() => setReviewSrc(null)} aria-label="Close">×</button>
            <div className="rv-head">
              <span className="rb-source">{REVIEW_SOURCES[reviewSrc].label}</span>
              <span className="rv-score">{REVIEW_SOURCES[reviewSrc].score} <span className="rv-stars" aria-hidden="true">★★★★★</span></span>
              <span className="rv-note">{REVIEW_SOURCES[reviewSrc].scoreNote}</span>
            </div>
            <div className="rv-list">
              {REVIEW_SOURCES[reviewSrc].reviews.map(r => (
                <blockquote className="rv-item" key={r.name}>
                  <div className="review-stars" aria-label="5 out of 5 stars">★★★★★</div>
                  <p className="rv-text">“{r.text}”</p>
                  <cite className="rv-name">{r.name}</cite>
                </blockquote>
              ))}
            </div>
            <div className="rv-foot">
              <span className="rv-footnote">{REVIEW_SOURCES[reviewSrc].footnote}</span>
              <a href={REVIEW_SOURCES[reviewSrc].url} target="_blank" rel="noopener">{REVIEW_SOURCES[reviewSrc].urlLabel} →</a>
            </div>
          </div>
        </div>
      )}

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
