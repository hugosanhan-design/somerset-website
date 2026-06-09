'use client'
import { useEffect } from 'react'

export default function Home() {
  useEffect(() => {
    const nav = document.getElementById('nav')
    const onScroll = () => { if (nav) nav.classList.toggle('scrolled', window.scrollY > 20) }
    window.addEventListener('scroll', onScroll, { passive: true })
    const sheep = document.getElementById('sheepWalk')
    const clouds = document.querySelectorAll<HTMLElement>('.cloud')
    const updateParallax = () => {
      const y = window.scrollY
      const max = document.documentElement.scrollHeight - window.innerHeight
      const p = max > 0 ? Math.min(Math.max(y / max, 0), 1) : 0
      if (sheep) sheep.style.left = (2 + 86 * p) + '%'
      clouds.forEach(c => { const s = parseFloat((c as HTMLElement).dataset.speed || '0.2'); c.style.transform = `translateX(${y * s}px)` })
    }
    window.addEventListener('scroll', updateParallax, { passive: true })
    window.addEventListener('resize', updateParallax)
    updateParallax()
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target) } })
    }, { threshold: 0.1, rootMargin: '0px 0px -30px 0px' })
    document.querySelectorAll('.reveal').forEach(el => io.observe(el))
    const infoData: Record<string, { t: string; b: string }> = {
      castle:  { t: 'Dunster Castle', b: 'Dunster Castle sits on a steep wooded hill — the Tor — above Dunster village. Fortified since Norman times, made a Jacobean mansion in 1617 and given its romantic towers by the Victorians, it has been home to just two families in 1,000 years. Today it is cared for by the National Trust.' },
      cottage: { t: 'Thatched cottages', b: 'Somerset villages like Dunster and Selworthy are famous for their cottages — built from local cob (earth, straw and water) and topped with thick wheat-straw or water-reed thatch that can last 25–40 years.' },
      sheep:   { t: 'Sheep country', b: "England's flock is around 14 million sheep, and the South West — Somerset included — is one of the country's densest sheep-farming regions. Come spring, the new lambs nearly double the count." },
      crow:    { t: 'The crafty crow', b: "Carrion crows are among Britain's cleverest birds — they use tools, remember faces and gather in noisy 'parliaments'. A familiar sight over Somerset farmland and the open moors of Exmoor." },
      apple:   { t: 'Somerset cider apples', b: 'Somerset is the home of English cider. Its orchards grow heritage cider-apple varieties like Kingston Black and Dabinett, and the county still presses more cider than anywhere else in the UK.' },
    }
    const pop = document.getElementById('infoPop')
    const titleEl = document.getElementById('infoTitle')
    const bodyEl = document.getElementById('infoBody')
    const openPop = (key: string) => {
      const d = infoData[key]; if (!d || !pop || !titleEl || !bodyEl) return
      titleEl.textContent = d.t; bodyEl.textContent = d.b
      pop.hidden = false; requestAnimationFrame(() => pop.classList.add('show'))
    }
    const closePop = () => { if (!pop) return; pop.classList.remove('show'); setTimeout(() => { pop.hidden = true }, 220) }
    document.querySelectorAll<HTMLElement>('.scene .clickable').forEach(el => {
      el.addEventListener('click', e => { e.stopPropagation(); openPop(el.dataset.info || '') })
    })
    document.getElementById('infoClose')?.addEventListener('click', closePop)
    document.addEventListener('click', e => {
      if (pop && !pop.hidden && !pop.contains(e.target as Node) && !(e.target as HTMLElement).closest?.('.scene .clickable')) closePop()
    })
    document.addEventListener('keydown', e => { if (e.key === 'Escape') closePop() })
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('scroll', updateParallax)
      window.removeEventListener('resize', updateParallax)
      io.disconnect()
    }
  }, [])

  return (
    <>
      <style>{`
        :root {
          --sage: #E7F0E2; --sage-2: #DCE8D2;
          --green: #57B82C; --green-dk: #3D8B1F;
          --navy: #132235; --muted: #586473;
          --white: #FFFFFF; --border: #D2DEC8; --ink: #3A3024;
          --heather: #8C5E9C; --cheddar: #E3A33A; --cider: #B23A2C;
          --hay: #D6B468; --wool: #EAE3D2;
          --ff: 'Poppins', system-ui, sans-serif;
          --max-w: 1200px; --py: clamp(4.5rem, 9vw, 7.5rem);
        }
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
        body { font-family: var(--ff); background: var(--sage); color: var(--navy); line-height: 1.6; -webkit-font-smoothing: antialiased; }
        a { color: inherit; text-decoration: none; }
        img { display: block; max-width: 100%; }
        .wrap { width: min(var(--max-w), 100%); margin: 0 auto; padding: 0 2rem; }
        .btn { display: inline-flex; align-items: center; gap: .5rem; font-family: var(--ff); font-size: .92rem; font-weight: 600; letter-spacing: .005em; padding: .85rem 1.8rem; border-radius: 50px; border: 2px solid transparent; cursor: pointer; transition: all .18s; white-space: nowrap; }
        .btn-arr { display: inline-block; transition: transform .18s; }
        .btn:hover .btn-arr { transform: translateX(4px); }
        .btn-primary { background: var(--green); color: #fff; border-color: var(--green); box-shadow: 0 6px 18px rgba(87,184,44,.28); }
        .btn-primary:hover { background: var(--green-dk); border-color: var(--green-dk); }
        .btn-outline-white { background: rgba(255,255,255,.08); color: #fff; border-color: rgba(255,255,255,.55); }
        .btn-outline-white:hover { background: rgba(255,255,255,.18); border-color: #fff; }
        .btn-light { background: #fff; color: var(--green-dk); border-color: #fff; }
        .btn-light:hover { background: var(--sage); border-color: var(--sage); }
        .btn-ghost { background: transparent; color: var(--navy); border-color: var(--border); }
        .btn-ghost:hover { border-color: var(--green); color: var(--green-dk); }
        .nav { position: sticky; top: 0; z-index: 100; padding: 1.15rem 0; transition: background .3s, box-shadow .3s; }
        .nav.scrolled { background: rgba(231,240,226,.92); backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px); box-shadow: 0 1px 0 var(--border); }
        .nav-inner { display: flex; align-items: center; justify-content: space-between; gap: 2rem; }
        .nav-logo { display: flex; flex-direction: column; line-height: 1.05; gap: 2px; }
        .nav-logo-name { font-size: 1.35rem; font-weight: 700; color: var(--navy); letter-spacing: -.01em; }
        .nav-logo-name b { color: var(--green); font-weight: 700; }
        .nav-links { display: flex; align-items: center; list-style: none; gap: .25rem; }
        .nav-links a { font-size: .9rem; font-weight: 500; color: var(--navy); padding: .4rem .9rem; border-radius: 50px; transition: color .15s, background .15s; white-space: nowrap; }
        .nav-links a:hover { color: var(--green-dk); }
        .nav-links .nav-cta a { background: var(--green); color: #fff; padding: .55rem 1.3rem; margin-left: .5rem; font-weight: 600; }
        .nav-links .nav-cta a:hover { background: var(--green-dk); color: #fff; }
        .nav:not(.scrolled) { background: linear-gradient(to bottom, rgba(8,16,10,.45), rgba(8,16,10,0)); }
        .nav:not(.scrolled) .nav-logo-name { color: #fff; }
        .nav:not(.scrolled) .nav-logo-name b { color: #BFE6A6; }
        .nav:not(.scrolled) .nav-links a { color: rgba(255,255,255,.9); }
        .nav:not(.scrolled) .nav-links a:hover { color: #fff; }
        .nav:not(.scrolled) .nav-links .nav-cta a { background: rgba(255,255,255,.16); border: 1.5px solid rgba(255,255,255,.4); color: #fff; }
        .nav:not(.scrolled) .nav-links .nav-cta a:hover { background: rgba(255,255,255,.28); }
        .hero { position: relative; min-height: calc(100dvh - 4.4rem); display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; overflow: hidden; padding-bottom: 24%; background-image: url("/hero-bg.jpg"); background-size: cover; background-position: center 34%; }
        .hero::before { content: ''; position: absolute; inset: 0; z-index: 0; background: linear-gradient(to bottom, rgba(10,24,16,.46) 0%, rgba(10,24,16,.16) 34%, rgba(10,24,16,.26) 64%, rgba(61,139,31,.18) 100%); }
        .scene { position: fixed; bottom: 0; left: 0; width: 100%; height: 22.5vh; pointer-events: none; z-index: 90; -webkit-mask-image: linear-gradient(to top,#000 82%,rgba(0,0,0,.2) 100%); mask-image: linear-gradient(to top,#000 82%,rgba(0,0,0,.2) 100%); }
        .stats-strip, .why, .placement, .about, footer { position: relative; z-index: 2; }
        .hill { position: absolute; bottom: 0; left: 0; width: 100%; height: 100%; }
        .hill svg { width: 100%; height: 100%; display: block; }
        .scene .prop, .scene .apple-tree, .scene .sheep-walk, .scene .crow, .scene .castle, .scene .falling-apple { position: absolute; pointer-events: none; }
        .prop { transform-origin: bottom center; }
        .prop.hay { width: 52px; bottom: 18%; }
        .prop.graze { width: 46px; bottom: 19%; }
        .prop.small { transform: scale(.72); }
        .apple-tree { width: 94px; bottom: 16%; left: 75%; transform-origin: bottom center; animation: tree-shake 9s ease-in-out infinite; }
        .castle { width: 162px; bottom: 0; left: 1%; }
        .falling-apple { width: 13px; bottom: 30%; left: 80%; z-index: 2; animation: apple-fall 9s ease-in-out infinite; }
        .cloud { position: absolute; z-index: 1; pointer-events: none; will-change: transform; }
        .scene .clickable { pointer-events: auto; cursor: pointer; transition: filter .15s; }
        .scene .clickable:hover { filter: drop-shadow(0 3px 7px rgba(19,34,53,.3)) brightness(1.06); }
        .info-pop { position: fixed; left: 50%; bottom: calc(22.5vh + 22px); transform: translateX(-50%) translateY(10px); width: min(360px,calc(100vw - 32px)); background: #fff; border: 1px solid var(--border); border-radius: 16px; padding: 20px 22px; box-shadow: 0 18px 48px rgba(19,34,53,.24); z-index: 120; opacity: 0; pointer-events: none; transition: opacity .22s ease, transform .22s ease; }
        .info-pop.show { opacity: 1; transform: translateX(-50%) translateY(0); pointer-events: auto; }
        .info-pop .info-close { position: absolute; top: 9px; right: 13px; border: none; background: none; font-size: 24px; line-height: 1; color: var(--muted); cursor: pointer; padding: 0; }
        .info-pop .info-close:hover { color: var(--navy); }
        .info-pop .info-eyebrow { display: inline-flex; align-items: center; gap: 6px; font-size: .62rem; font-weight: 600; letter-spacing: .14em; text-transform: uppercase; color: var(--green-dk); margin-bottom: 8px; }
        .info-pop .info-title { font-size: 1.15rem; font-weight: 700; color: var(--navy); margin-bottom: 7px; padding-right: 18px; letter-spacing: -.01em; }
        .info-pop .info-body { font-size: .9rem; line-height: 1.62; color: var(--muted); }
        .prop.heather { width: 42px; bottom: 13%; }
        .prop.cottage { width: 64px; bottom: 14%; }
        .sheep-walk { width: 54px; bottom: 18%; left: 4%; transition: left .08s linear; }
        .crow { width: 46px; bottom: 50%; left: 0; animation: crow-fly 9s ease-in-out infinite; }
        .crow-wings { transform-origin: 21px 13px; animation: crow-flap .34s ease-in-out infinite; }
        @keyframes crow-flap { 0%,100%{transform:scaleY(1)} 50%{transform:scaleY(.34) translateY(-2px)} }
        @keyframes crow-fly {
          0%{transform:translate(-6vw,0) rotate(0deg);opacity:0} 8%{opacity:1}
          30%{transform:translate(26vw,-16px) rotate(0deg)} 48%{transform:translate(50vw,-4px) rotate(0deg)}
          56%{transform:translate(66vw,16px) rotate(8deg)} 61%{transform:translate(72vw,30px) rotate(12deg)}
          64%{transform:translate(70vw,24px) rotate(-10deg)} 74%{transform:translate(71vw,26px) rotate(5deg)}
          80%{transform:translate(73vw,18px) rotate(-8deg)} 90%{transform:translate(86vw,0px) rotate(-4deg)}
          100%{transform:translate(102vw,-16px) rotate(0deg);opacity:1}
        }
        @keyframes apple-fall {
          0%,58%{transform:translate(0,0) rotate(0deg);opacity:1} 61%{transform:translate(0,2px) rotate(8deg)}
          68%{transform:translate(4px,24px) rotate(46deg)} 71%{transform:translate(4px,19px) rotate(50deg)}
          74%{transform:translate(5px,24px) rotate(52deg)} 96%{transform:translate(5px,24px) rotate(52deg);opacity:1}
          99%{opacity:0} 100%{transform:translate(0,0) rotate(0deg);opacity:0}
        }
        .smoke { transform-box: fill-box; transform-origin: center; }
        .smoke.s1 { animation: smoke 3.2s ease-out infinite; }
        .smoke.s2 { animation: smoke 3.2s ease-out 1.1s infinite; }
        .smoke.s3 { animation: smoke 3.2s ease-out 2.2s infinite; }
        @keyframes smoke { 0%{opacity:0;transform:translate(0,0) scale(.5)} 25%{opacity:.5} 100%{opacity:0;transform:translate(-3px,-15px) scale(1.5)} }
        @keyframes tree-shake {
          0%,58%{transform:rotate(0deg)} 61%{transform:rotate(1.6deg)} 64%{transform:rotate(-1.4deg)}
          67%{transform:rotate(.7deg)} 70%,100%{transform:rotate(0deg)}
        }
        @media (prefers-reduced-motion:reduce) { .apple-tree,.falling-apple,.cloud{animation:none!important} }
        .falling-apple.eaten { opacity: 0!important; }
        .win-glow { opacity: 0; }
        @keyframes light-toggle { 0%,48%{opacity:0} 50%,90%{opacity:.95} 92%,100%{opacity:0} }
        .win-glow.l1 { animation: light-toggle 6s ease-in-out infinite; }
        .win-glow.l2 { animation: light-toggle 7.5s ease-in-out 1.2s infinite; }
        .win-glow.l3 { animation: light-toggle 5.4s ease-in-out 2.6s infinite; }
        .win-glow.l4 { animation: light-toggle 8s ease-in-out .6s infinite; }
        .win-glow.l5 { animation: light-toggle 6.8s ease-in-out 3.4s infinite; }
        .castle-person .fig { opacity: 0; transform-box: fill-box; transform-origin: bottom center; animation: peek 11s ease-in-out infinite; }
        @keyframes peek { 0%,60%{opacity:0;transform:translateY(2px)} 67%,88%{opacity:1;transform:translateY(0)} 95%,100%{opacity:0;transform:translateY(2px)} }
        @media (prefers-reduced-motion:reduce) { .win-glow,.castle-person .fig,.smoke{animation:none!important} .win-glow{opacity:.75} }
        .hero-content { position: relative; z-index: 3; padding: 2rem 2rem 0; max-width: 720px; }
        .eyebrow { display: inline-flex; align-items: center; gap: .6rem; font-size: .72rem; font-weight: 600; letter-spacing: .16em; text-transform: uppercase; color: #fff; background: rgba(255,255,255,.14); border: 1px solid rgba(255,255,255,.28); padding: .4rem 1rem; border-radius: 50px; margin-bottom: 1.6rem; backdrop-filter: blur(4px); -webkit-backdrop-filter: blur(4px); }
        .eyebrow .dot { width: 6px; height: 6px; border-radius: 50%; background: var(--green); box-shadow: 0 0 0 3px rgba(87,184,44,.35); }
        .hero h1 { font-size: clamp(2.8rem,6vw,5rem); font-weight: 700; line-height: 1.05; letter-spacing: -.02em; color: #fff; margin-bottom: 1.4rem; text-shadow: 0 2px 30px rgba(0,0,0,.28); }
        .hero h1 em { font-style: normal; color: #BFE6A6; }
        .hero-lead { font-size: 1.08rem; font-weight: 400; color: rgba(255,255,255,.9); line-height: 1.7; max-width: 46ch; margin: 0 auto 2.3rem; text-shadow: 0 1px 10px rgba(0,0,0,.3); }
        .hero-actions { display: flex; align-items: center; justify-content: center; gap: .9rem; flex-wrap: wrap; }
        .stats-strip { background: var(--white); border-bottom: 1px solid var(--border); }
        .stats-grid { display: grid; grid-template-columns: repeat(3,1fr); text-align: center; }
        .stat-item { padding: 2.75rem 2rem; border-right: 1px solid var(--border); }
        .stat-item:last-child { border-right: none; }
        .stat-n { display: block; font-size: 3rem; font-weight: 700; line-height: 1; color: var(--green); margin-bottom: .45rem; letter-spacing: -.02em; }
        .stat-l { font-size: .78rem; font-weight: 500; letter-spacing: .06em; text-transform: uppercase; color: var(--muted); }
        .why { padding: var(--py) 0; background: var(--sage); }
        .section-header { display: flex; align-items: baseline; justify-content: space-between; gap: 2rem; margin-bottom: 3.25rem; }
        .section-title { font-size: clamp(1.9rem,3vw,2.6rem); font-weight: 700; letter-spacing: -.015em; }
        .section-title em { font-style: normal; color: var(--green); }
        .section-tag { font-size: .72rem; font-weight: 600; letter-spacing: .14em; text-transform: uppercase; color: var(--muted); flex-shrink: 0; }
        .why-cards { display: grid; grid-template-columns: repeat(3,1fr); gap: 1.5rem; }
        .why-card { position: relative; background: var(--white); border: 1px solid var(--border); border-radius: 18px; padding: 2.5rem 2rem 2.25rem; overflow: hidden; transition: transform .2s, box-shadow .2s; }
        .why-card::before { content: ''; position: absolute; top: 0; left: 0; width: 100%; height: 5px; }
        .why-card.h::before { background: var(--heather); }
        .why-card.c::before { background: var(--cheddar); }
        .why-card.a::before { background: var(--cider); }
        .why-card:hover { transform: translateY(-4px); box-shadow: 0 14px 32px rgba(19,34,53,.09); }
        .card-badge { width: 84px; height: 84px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-bottom: 1.5rem; }
        .why-card.h .card-badge { background: rgba(140,94,156,.12); }
        .why-card.c .card-badge { background: rgba(227,163,58,.14); }
        .why-card.a .card-badge { background: rgba(178,58,44,.11); }
        .card-badge svg { width: 50px; height: 50px; }
        .card-heading { font-size: 1.3rem; font-weight: 700; line-height: 1.25; margin-bottom: .6rem; letter-spacing: -.01em; }
        .card-body { font-size: .95rem; font-weight: 400; color: var(--muted); line-height: 1.7; }
        .placement { background-image: url("/placement-bg.jpg"); background-size: cover; background-position: center 68%; color: var(--navy); padding: var(--py) 0; position: relative; overflow: hidden; }
        .placement::after { content: ''; position: absolute; inset: 0; pointer-events: none; background: linear-gradient(to right, var(--green) 0%, var(--green) 24%, rgba(87,184,44,.86) 48%, rgba(87,184,44,.42) 72%, rgba(87,184,44,.12) 100%); }
        .placement-inner { position: relative; z-index: 1; display: flex; align-items: center; justify-content: space-between; gap: 4rem; }
        .placement-tag { display: inline-flex; align-items: center; gap: .5rem; font-size: .72rem; font-weight: 600; letter-spacing: .12em; text-transform: uppercase; color: var(--navy); background: rgba(255,255,255,.5); padding: .35rem .9rem; border-radius: 50px; margin-bottom: 1.1rem; }
        .placement-title { font-size: clamp(1.9rem,3.4vw,2.7rem); font-weight: 700; line-height: 1.14; letter-spacing: -.015em; max-width: 18ch; }
        .placement-sub { font-size: 1rem; font-weight: 400; color: rgba(19,34,53,.78); margin-top: .9rem; max-width: 40ch; line-height: 1.65; }
        .about { padding: var(--py) 0; background: var(--white); }
        .about-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 5.5rem; align-items: center; }
        .about-img { aspect-ratio: 4/5; background: var(--sage); border-radius: 18px; display: flex; align-items: center; justify-content: center; position: relative; overflow: hidden; }
        .about-img::after { content: ''; position: absolute; inset: 0; background: repeating-linear-gradient(-45deg,transparent,transparent 18px,rgba(87,184,44,.05) 18px,rgba(87,184,44,.05) 19px); }
        .img-ph { position: relative; z-index: 1; display: flex; flex-direction: column; align-items: center; gap: .75rem; color: var(--muted); text-align: center; }
        .img-ph-icon { width: 2.75rem; height: 2.75rem; border: 1.5px solid var(--border); border-radius: 50%; display: flex; align-items: center; justify-content: center; }
        .img-ph-text { font-size: .68rem; font-weight: 600; letter-spacing: .12em; text-transform: uppercase; }
        .about-eyebrow { font-size: .72rem; font-weight: 600; letter-spacing: .16em; text-transform: uppercase; color: var(--green-dk); margin-bottom: 1.1rem; }
        .about h2 { font-size: clamp(1.9rem,3vw,2.6rem); font-weight: 700; line-height: 1.16; margin-bottom: 1.4rem; letter-spacing: -.015em; }
        .about-body { font-size: 1.02rem; font-weight: 400; color: var(--muted); line-height: 1.8; margin-bottom: 2rem; }
        .about-founders { display: flex; align-items: center; gap: 1.1rem; padding-top: 1.6rem; border-top: 1px solid var(--border); margin-bottom: 2rem; }
        .founders-av { width: 3.1rem; height: 3.1rem; border-radius: 50%; background: var(--green); color: #fff; display: flex; align-items: center; justify-content: center; font-size: .82rem; font-weight: 700; flex-shrink: 0; }
        .founders-av + div strong { font-size: 1rem; font-weight: 700; display: block; margin-bottom: .1rem; }
        .founders-av + div small { font-size: .8rem; color: var(--muted); }
        footer { background: linear-gradient(to bottom,#2F5A22 0%,#2F5A22 45%,#3E6B2A 100%); color: rgba(255,255,255,.6); padding: 5rem 0 calc(2.5rem + 22.5vh); }
        .footer-grid { display: grid; grid-template-columns: 2fr 1fr 1.75fr 1fr; gap: 3rem; margin-bottom: 4rem; }
        .footer-brand-name { font-size: 1.3rem; font-weight: 700; color: #fff; margin-bottom: .15rem; }
        .footer-brand-name b { color: #BFE6A6; }
        .footer-brand-sub { font-size: .58rem; font-weight: 600; letter-spacing: .18em; text-transform: uppercase; color: rgba(255,255,255,.35); margin-bottom: 1.25rem; }
        .footer-brand-desc { font-size: .88rem; line-height: 1.7; color: rgba(255,255,255,.45); max-width: 26ch; }
        .footer-col-title { font-size: .62rem; font-weight: 600; letter-spacing: .14em; text-transform: uppercase; color: rgba(255,255,255,.35); margin-bottom: 1.2rem; }
        .footer-links { list-style: none; display: flex; flex-direction: column; gap: .6rem; }
        .footer-links a { font-size: .9rem; color: rgba(255,255,255,.55); transition: color .15s; }
        .footer-links a:hover { color: #fff; }
        .footer-contact { display: flex; flex-direction: column; gap: .5rem; }
        .footer-contact p, .footer-contact a { font-size: .88rem; color: rgba(255,255,255,.5); line-height: 1.6; }
        .footer-contact a:hover { color: #fff; }
        .footer-bottom { border-top: 1px solid rgba(255,255,255,.09); padding-top: 1.75rem; display: flex; align-items: center; justify-content: space-between; gap: 1rem; flex-wrap: wrap; }
        .footer-copy { font-size: .72rem; color: rgba(255,255,255,.3); }
        .footer-made { font-size: .72rem; color: rgba(255,255,255,.3); display: inline-flex; align-items: center; gap: .5rem; }
        .footer-made svg { width: 16px; height: 16px; }
        .reveal { opacity: 0; transform: translateY(20px); transition: opacity .6s ease, transform .6s ease; }
        .reveal.in { opacity: 1; transform: none; }
        .reveal[data-d="1"] { transition-delay: .1s; }
        .reveal[data-d="2"] { transition-delay: .2s; }
        @media (max-width:900px) {
          .why-cards { grid-template-columns: 1fr; }
          .about-grid { grid-template-columns: 1fr; gap: 3rem; }
          .about-img { aspect-ratio: 3/2; }
          .placement-inner { flex-direction: column; align-items: flex-start; gap: 2rem; }
          .footer-grid { grid-template-columns: 1fr 1fr; gap: 2.25rem; }
          .stats-grid { grid-template-columns: 1fr; }
          .stat-item { border-right: none; border-bottom: 1px solid var(--border); }
          .stat-item:last-child { border-bottom: none; }
          .section-header { flex-direction: column; gap: .5rem; }
          .hero { padding-bottom: 38%; }
        }
        @media (max-width:600px) {
          .nav-links { display: none; }
          .hero-actions { flex-direction: column; align-items: stretch; }
          .footer-grid { grid-template-columns: 1fr; }
        }
        @media (prefers-reduced-motion:reduce) {
          .reveal { opacity: 1; transform: none; transition: none; }
          .crow { display: none; }
        }
      `}</style>

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
            </a>
            <ul className="nav-links" role="list">
              <li><a href="/">Home</a></li>
              <li><a href="/blog">Blog</a></li>
              <li><a href="/courses">Courses</a></li>
              <li><a href="/exercises">Exercises</a></li>
              <li className="nav-cta"><a href="/placement">Placement Test</a></li>
            </ul>
          </div>
        </div>
      </nav>

      <main>
        <section className="hero" id="hero">
          <div className="hero-content">
            <div className="eyebrow"><span className="dot" /> Valencia · Est. 2013</div>
            <h1>Learn <em>English</em><br />with Somerset</h1>
            <p className="hero-lead">English classes for all levels in Valencia, Spain. Small groups, native teachers, proven results — for children, teens and adults.</p>
            <div className="hero-actions">
              <a href="/placement" className="btn btn-primary">Find my level <span className="btn-arr">→</span></a>
              <a href="/courses" className="btn btn-outline-white">View courses</a>
            </div>
          </div>

          <div className="scene" aria-hidden="true">
            <svg className="cloud" data-speed="0.26" style={{ top: '5%', left: '7%', width: 88, opacity: 0.9 }} viewBox="0 0 120 50" xmlns="http://www.w3.org/2000/svg"><g fill="#fff"><ellipse cx="38" cy="30" rx="24" ry="15" /><ellipse cx="66" cy="24" rx="28" ry="19" /><ellipse cx="92" cy="31" rx="22" ry="14" /><ellipse cx="64" cy="39" rx="42" ry="11" /></g></svg>
            <svg className="cloud" data-speed="0.13" style={{ top: '17%', left: '45%', width: 66, opacity: 0.72 }} viewBox="0 0 120 50" xmlns="http://www.w3.org/2000/svg"><g fill="#fff"><ellipse cx="38" cy="30" rx="24" ry="15" /><ellipse cx="66" cy="24" rx="28" ry="19" /><ellipse cx="92" cy="31" rx="22" ry="14" /><ellipse cx="64" cy="39" rx="42" ry="11" /></g></svg>
            <svg className="cloud" data-speed="0.34" style={{ top: '2%', left: '73%', width: 80, opacity: 0.84 }} viewBox="0 0 120 50" xmlns="http://www.w3.org/2000/svg"><g fill="#fff"><ellipse cx="38" cy="30" rx="24" ry="15" /><ellipse cx="66" cy="24" rx="28" ry="19" /><ellipse cx="92" cy="31" rx="22" ry="14" /><ellipse cx="64" cy="39" rx="42" ry="11" /></g></svg>

            <div className="hill" id="h2">
              <svg viewBox="0 0 1600 300" preserveAspectRatio="xMidYMax slice" xmlns="http://www.w3.org/2000/svg">
                <path d="M-100,255 C80,195 220,240 400,215 C580,190 700,258 900,205 C1100,152 1280,235 1470,198 Q1590,175 1700,215 L1700,300 L-100,300 Z" fill="#7AA45F" />
                <g fill="#9A7AA8" fillOpacity="0.5">
                  <ellipse cx="200" cy="236" rx="9" ry="5" /><ellipse cx="240" cy="242" rx="7" ry="4" />
                  <ellipse cx="320" cy="232" rx="8" ry="5" /><ellipse cx="360" cy="240" rx="7" ry="4" />
                  <ellipse cx="700" cy="244" rx="8" ry="5" /><ellipse cx="740" cy="250" rx="6" ry="4" />
                  <ellipse cx="980" cy="226" rx="8" ry="5" /><ellipse cx="1020" cy="234" rx="7" ry="4" />
                  <ellipse cx="1300" cy="232" rx="8" ry="5" /><ellipse cx="1340" cy="240" rx="6" ry="4" />
                </g>
              </svg>
            </div>
            <div className="hill" id="h3">
              <svg viewBox="0 0 1600 300" preserveAspectRatio="xMidYMax slice" xmlns="http://www.w3.org/2000/svg">
                <path d="M-100,278 C60,255 170,272 320,260 C470,248 565,268 710,256 C855,244 960,264 1095,252 C1230,240 1355,260 1480,250 C1570,243 1640,252 1700,250 L1700,300 L-100,300 Z" fill="#557E45" />
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

            <svg className="sheep-walk clickable" id="sheepWalk" data-info="sheep" viewBox="0 0 64 46" xmlns="http://www.w3.org/2000/svg">
              <rect x="20" y="30" width="2.4" height="12" fill="#33302a" /><rect x="28" y="32" width="2.4" height="10" fill="#33302a" />
              <rect x="34" y="32" width="2.4" height="10" fill="#33302a" /><rect x="42" y="30" width="2.4" height="12" fill="#33302a" />
              <ellipse cx="32" cy="23" rx="18" ry="13" fill="#EFE9DA" />
              <circle cx="18" cy="17" r="7" fill="#EFE9DA" /><circle cx="31" cy="12" r="8" fill="#EFE9DA" /><circle cx="44" cy="17" r="7" fill="#EFE9DA" />
              <ellipse cx="14" cy="28" rx="5" ry="7" fill="#3a342b" transform="rotate(-12 14 28)" />
              <ellipse cx="17" cy="22" rx="2.6" ry="1.6" fill="#3a342b" />
            </svg>

            <svg className="crow" data-info="crow" viewBox="0 0 42 26" xmlns="http://www.w3.org/2000/svg">
              <g className="crow-wings" fill="#1a1a1a">
                <path d="M21,13 Q8,4 2,8 Q10,14 21,13 Z" /><path d="M21,13 Q34,4 40,8 Q32,14 21,13 Z" />
              </g>
              <ellipse cx="21" cy="15" rx="6" ry="4" fill="#1a1a1a" />
              <path d="M27,14 Q33,13 35,15 Q32,16 27,15" fill="#1a1a1a" />
              <circle cx="24" cy="13" r="1.2" fill="#fff" opacity="0.8" />
            </svg>

            <svg className="apple-tree clickable" data-info="apple" viewBox="0 0 100 140" xmlns="http://www.w3.org/2000/svg">
              <rect x="46" y="80" width="8" height="60" fill="#6B4226" />
              <rect x="40" y="90" width="6" height="4" fill="#6B4226" transform="rotate(-20 40 90)" />
              <rect x="54" y="85" width="6" height="4" fill="#6B4226" transform="rotate(20 54 85)" />
              <circle cx="50" cy="52" r="36" fill="#4F7A42" />
              <circle cx="36" cy="44" r="22" fill="#5E8A4E" /><circle cx="64" cy="40" r="24" fill="#557E45" />
              <circle cx="50" cy="36" r="20" fill="#6A9A54" />
              <g fill="#C8102E">
                <circle cx="42" cy="58" r="5" /><circle cx="56" cy="52" r="4.5" /><circle cx="48" cy="68" r="4" />
                <circle cx="62" cy="62" r="4" /><circle cx="36" cy="64" r="3.5" />
              </g>
            </svg>
            <svg className="prop falling-apple" viewBox="0 0 14 16" xmlns="http://www.w3.org/2000/svg">
              <circle cx="7" cy="10" r="5.5" fill="#C8102E" />
              <path d="M7,5 Q9,1 12,2" stroke="#4F7A42" strokeWidth="1.5" fill="none" strokeLinecap="round" />
            </svg>
          </div>
        </section>

        <div className="stats-strip">
          <div className="wrap">
            <div className="stats-grid">
              <div className="stat-item reveal"><span className="stat-n">2013</span><span className="stat-l">Year established</span></div>
              <div className="stat-item reveal" data-d="1"><span className="stat-n">8–10</span><span className="stat-l">Students per class</span></div>
              <div className="stat-item reveal" data-d="2"><span className="stat-n">40+</span><span className="stat-l">Years of Sara&apos;s teaching experience</span></div>
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

        <section className="placement">
          <div className="wrap">
            <div className="placement-inner">
              <div className="reveal">
                <div className="placement-tag">Free · 2 minutes · No sign-up</div>
                <h2 className="placement-title">Not sure which level you are?</h2>
                <p className="placement-sub">Take our free placement test and find out exactly where to start.</p>
              </div>
              <a href="/placement" className="btn btn-light reveal" data-d="1">Start the test <span className="btn-arr">→</span></a>
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
                <h2>English for everyone<br />who needs it</h2>
                <p className="about-body">Somerset Language Centre was founded in Valencia in 2013 with a single purpose: bring quality English teaching to everyone. Our method is fundamentally practical, based on oral communication — we put students in real, useful situations so they think and communicate in English from day one.</p>
                <div className="about-founders">
                  <div className="founders-av">H&amp;S</div>
                  <div>
                    <strong>Hugo &amp; Sara Hancock</strong>
                    <small>Founders · Sara has 40+ years of teaching experience</small>
                  </div>
                </div>
                <a href="/courses" className="btn btn-ghost">Discover our courses <span className="btn-arr">→</span></a>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer>
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
                <li><a href="/">Home</a></li><li><a href="/courses">Courses</a></li>
                <li><a href="/blog">Blog</a></li><li><a href="/exercises">Exercises</a></li>
                <li><a href="/placement">Placement Test</a></li><li><a href="/contact">Contact</a></li>
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
              <svg viewBox="0 0 96 96" aria-hidden="true"><g fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><path d="M48,84 C45,66 44,52 49,38" /><circle cx="48" cy="30" r="3" /><circle cx="40" cy="36" r="2.6" /><circle cx="56" cy="35" r="2.6" /></g></svg>
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
    </>
  )
}
