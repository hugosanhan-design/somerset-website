'use client'

// Public page — no login required. The teacher shares this URL with students who
// missed a class. Shows what they missed and links to the tools they need.

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import SomersetLogo from '@/components/SomersetLogo'
import { COLORS, FONT, RADIUS, SHADOW, EASE } from '@/lib/theme'

interface CatchupPack {
  id: string
  group_name: string
  date: string
  unit_title: string
  writing_prompt: string
  cbt_paper: string
  reading_url: string
  reading_label: string
  note: string
}

function formatDate(iso: string) {
  const d = new Date(iso + 'T12:00:00')
  return d.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
}

export default function CatchupPage() {
  const { id } = useParams() as { id: string }
  const [pack, setPack] = useState<CatchupPack | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch(`/api/catchup/${id}`)
      .then(r => { if (!r.ok) throw new Error('Not found'); return r.json() })
      .then(setPack)
      .catch(() => setError('This catch-up link has expired or doesn\'t exist. Ask your teacher for a new one.'))
  }, [id])

  const cbtLabel: Record<string, string> = {
    reading: 'Reading & Use of English',
    listening: 'Listening',
    writing: 'Writing',
  }
  const cbtPaperId: Record<string, string> = {
    reading: 'reading-uoe',
    listening: 'listening',
    writing: 'writing',
  }

  return (
    <div style={{
      minHeight: '100vh',
      fontFamily: FONT.sans,
      backgroundImage: "url('/Somerset b-g.jpg')",
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundAttachment: 'fixed',
    }}>
      <div style={{ minHeight: '100vh', backgroundColor: 'rgba(23,40,27,0.55)' }}>

        <header style={{
          backgroundColor: 'rgba(30,66,39,0.9)',
          padding: '16px 28px',
          backdropFilter: 'blur(6px)',
          display: 'flex',
          alignItems: 'center',
          gap: 14,
        }}>
          <SomersetLogo variant="white" />
        </header>

        <div style={{ maxWidth: 600, margin: '0 auto', padding: '40px 24px 64px' }}>

          {error ? (
            <div style={panel}>
              <div style={{ fontSize: 15, color: COLORS.danger }}>{error}</div>
            </div>
          ) : !pack ? (
            <div style={{ ...panel, color: COLORS.muted, fontSize: 14 }}>Loading…</div>
          ) : (
            <>
              <div style={{ marginBottom: 28 }}>
                <div style={{ fontSize: 12, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.7)', fontWeight: 700, marginBottom: 6 }}>
                  Catch-up · {pack.group_name}
                </div>
                <h1 style={{ fontFamily: FONT.serif, fontWeight: 500, fontSize: 26, color: '#fff', margin: 0, lineHeight: 1.2 }}>
                  {pack.unit_title}
                </h1>
                <div style={{ fontSize: 13.5, color: 'rgba(255,255,255,0.75)', marginTop: 6 }}>
                  Class on {formatDate(pack.date)}
                </div>
              </div>

              {pack.note && (
                <div style={{ ...panel, marginBottom: 16, borderLeft: `4px solid ${COLORS.green}` }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: COLORS.green, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>
                    From your teacher
                  </div>
                  <div style={{ fontSize: 14.5, color: COLORS.ink, lineHeight: 1.55 }}>{pack.note}</div>
                </div>
              )}

              <div style={{ fontSize: 12, letterSpacing: '0.07em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.65)', fontWeight: 700, margin: '20px 4px 10px' }}>
                Your work for this week
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

                {pack.writing_prompt && (
                  <a
                    href={`/write/${pack.id}`}
                    style={taskCard}
                  >
                    <span style={{ fontSize: 26 }}>✍️</span>
                    <div style={{ flex: 1 }}>
                      <div style={taskTitle}>Writing task</div>
                      <div style={taskDesc}>{pack.writing_prompt}</div>
                    </div>
                    <span style={chev}>›</span>
                  </a>
                )}

                {pack.cbt_paper && (
                  <a href={`/cbt?paper=${cbtPaperId[pack.cbt_paper] || pack.cbt_paper}&pack_id=${pack.id}`} style={taskCard}>
                    <span style={{ fontSize: 26 }}>🖥️</span>
                    <div style={{ flex: 1 }}>
                      <div style={taskTitle}>Practice exam — {cbtLabel[pack.cbt_paper] || pack.cbt_paper}</div>
                      <div style={taskDesc}>Cambridge-format practice in exam conditions. Set a timer and work through it properly.</div>
                    </div>
                    <span style={chev}>›</span>
                  </a>
                )}

                {pack.reading_url && (
                  <a href={pack.reading_url} target="_blank" rel="noopener noreferrer" style={taskCard}>
                    <span style={{ fontSize: 26 }}>📖</span>
                    <div style={{ flex: 1 }}>
                      <div style={taskTitle}>{pack.reading_label || 'Reading'}</div>
                      <div style={taskDesc}>Read the article and note any vocabulary you don't know.</div>
                    </div>
                    <span style={{ ...chev, fontSize: 16 }}>↗</span>
                  </a>
                )}

              </div>

              {!pack.writing_prompt && !pack.cbt_paper && !pack.reading_url && (
                <div style={{ ...panel, color: COLORS.muted, fontSize: 14 }}>
                  Your teacher hasn't added any tasks yet — check back soon.
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

const panel: React.CSSProperties = {
  backgroundColor: 'rgba(245,241,230,0.94)',
  border: `1px solid ${COLORS.line}`,
  borderRadius: RADIUS.card,
  padding: '18px 20px',
  boxShadow: SHADOW.inkSoft,
  backdropFilter: 'blur(6px)',
  marginBottom: 12,
}

const taskCard: React.CSSProperties = {
  display: 'flex',
  alignItems: 'flex-start',
  gap: 16,
  backgroundColor: 'rgba(245,241,230,0.92)',
  border: `1px solid ${COLORS.line}`,
  borderRadius: RADIUS.card,
  padding: '18px 20px',
  cursor: 'pointer',
  textDecoration: 'none',
  color: 'inherit',
  backdropFilter: 'blur(6px)',
  boxShadow: SHADOW.inkSoft,
  transition: `transform 0.18s ${EASE}`,
}

const taskTitle: React.CSSProperties = {
  fontFamily: FONT.serif,
  fontWeight: 500,
  fontSize: 15.5,
  color: COLORS.ink,
  marginBottom: 3,
}

const taskDesc: React.CSSProperties = {
  fontSize: 13,
  color: COLORS.muted,
  lineHeight: 1.5,
}

const chev: React.CSSProperties = {
  fontSize: 22,
  color: '#c7cdbf',
  flexShrink: 0,
  marginTop: 2,
}
