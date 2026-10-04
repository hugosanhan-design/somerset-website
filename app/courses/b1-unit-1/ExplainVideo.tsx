'use client'

import { useEffect, useRef, useState } from 'react'
import type { ExplainerVideo } from '@/lib/courses/b1u1'

// "▶ Hugo explains": opens a pop-up with Hugo's short video. Before a video has been
// recorded, the pop-up shows the key points from the script instead.
export default function ExplainVideo({ video, label = 'Hugo explains' }: { video: ExplainerVideo; label?: string }) {
  const [open, setOpen] = useState(false)
  const closeBtn = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!open) return
    closeBtn.current?.focus()
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false) }
    window.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { window.removeEventListener('keydown', onKey); document.body.style.overflow = prev }
  }, [open])

  return (
    <>
      <button type="button" className="explain-btn" onClick={() => setOpen(true)}>
        <span className="explain-play" aria-hidden>▶</span>{label}
      </button>
      {open && (
        <div className="explain-backdrop" onClick={() => setOpen(false)}>
          <div className="explain-modal" role="dialog" aria-modal="true" aria-label={video.title} onClick={e => e.stopPropagation()}>
            <div className="explain-top">
              <h3>{video.title}</h3>
              <button ref={closeBtn} type="button" className="explain-close" onClick={() => setOpen(false)} aria-label="Close">✕</button>
            </div>
            {video.youtube ? (
              <div className="explain-frame">
                <iframe
                  src={`https://www.youtube-nocookie.com/embed/${video.youtube}?rel=0&modestbranding=1`}
                  title={video.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; picture-in-picture"
                  allowFullScreen
                />
              </div>
            ) : (
              <div className="explain-soon">
                <p className="explain-soon-tag">🎬 Hugo is recording this video. Here are the key points:</p>
                <ol>{video.points.map(p => <li key={p}>{p}</li>)}</ol>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}
