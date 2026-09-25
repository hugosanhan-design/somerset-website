'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'

interface Post {
  id: string
  title: string
  published: string
  author: string
  summary: string
  link: string
  image: string | null
}

function formatDate(iso: string): string {
  const d = new Date(iso)
  const day = d.getDate()
  const month = d.toLocaleString('en-GB', { month: 'long' }).toUpperCase()
  const year = d.getFullYear()
  return `${day} ${month}\n${year}`
}

export default function BlogPage() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/blog')
      .then((r) => r.json())
      .then((data) => { setPosts(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  return (
    <>
      {/* Google Fonts — Poppins */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'Poppins', sans-serif; background: #f0f4ec; }
      `}</style>

      <div style={{ minHeight: '100vh', fontFamily: "'Poppins', sans-serif", background: '#f0f4ec' }}>

        {/* ── Nav ── */}
        <nav style={{
          background: '#fff',
          borderBottom: '1px solid #e8ede3',
          padding: '0 48px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: 64,
          position: 'sticky',
          top: 0,
          zIndex: 100,
        }}>
          <a href="/teacher" style={{ textDecoration: 'none' }}>
            <span style={{ color: '#6BAE2E', fontWeight: 700, fontSize: 20, fontFamily: "'Poppins', sans-serif" }}>Somerset</span>
            <span style={{ color: '#1a2e1a', fontWeight: 600, fontSize: 20, fontFamily: "'Poppins', sans-serif" }}> Language Centre</span>
          </a>
          <div style={{ display: 'flex', alignItems: 'center', gap: 36 }}>
            {[
              { label: 'Home', href: '/' },
              { label: 'Blog', href: '/blog' },
              { label: 'Courses', href: '#' },
              { label: 'Exercises', href: '#' },
            ].map(({ label, href }) => (
              <a
                key={label}
                href={href}
                style={{
                  textDecoration: 'none',
                  color: href === '/blog' ? '#6BAE2E' : '#374151',
                  fontWeight: href === '/blog' ? 600 : 500,
                  fontSize: 15,
                }}
              >
                {label}
              </a>
            ))}
            <Link
              href="/intake"
              style={{
                backgroundColor: '#6BAE2E',
                color: '#fff',
                padding: '9px 20px',
                borderRadius: 8,
                fontWeight: 600,
                fontSize: 14,
                textDecoration: 'none',
              }}
            >
              Placement Test
            </Link>
          </div>
        </nav>

        {/* ── Hero ── */}
        <div style={{
          background: 'linear-gradient(135deg, #dce9d0 0%, #e8f0e0 60%, #f0f4ec 100%)',
          padding: '80px 48px 72px',
          textAlign: 'center',
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            marginBottom: 20,
          }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#6BAE2E', display: 'inline-block' }} />
            <span style={{ fontSize: 12, fontWeight: 600, letterSpacing: '0.12em', color: '#4a7a1e', textTransform: 'uppercase' }}>
              From the Centre
            </span>
          </div>
          <h1 style={{ fontSize: 56, fontWeight: 700, color: '#1a2e1a', lineHeight: 1.1, marginBottom: 20 }}>
            The Somerset{' '}
            <span style={{ color: '#6BAE2E' }}>Blog</span>
          </h1>
          <p style={{ fontSize: 18, color: '#4b6040', maxWidth: 520, margin: '0 auto', lineHeight: 1.6 }}>
            News, seasonal notes and exam tips from Sara and the team —{' '}
            straight from our notebook to yours.
          </p>
        </div>

        {/* ── Cards ── */}
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '56px 48px 80px' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '60px 0', color: '#6b9e3a', fontSize: 16 }}>
              Loading posts…
            </div>
          ) : posts.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 0', color: '#9ca3af', fontSize: 16 }}>
              No posts found.
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: 32,
            }}>
              {posts.map((post) => (
                <a
                  key={post.id}
                  href={post.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ textDecoration: 'none', display: 'block' }}
                >
                  <article style={{
                    background: '#fff',
                    borderRadius: 14,
                    overflow: 'hidden',
                    boxShadow: '0 2px 12px rgba(0,0,0,0.07)',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'transform 0.15s, box-shadow 0.15s',
                  }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLElement).style.transform = 'translateY(-4px)'
                      ;(e.currentTarget as HTMLElement).style.boxShadow = '0 8px 28px rgba(0,0,0,0.13)'
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'
                      ;(e.currentTarget as HTMLElement).style.boxShadow = '0 2px 12px rgba(0,0,0,0.07)'
                    }}
                  >
                    {/* Image */}
                    <div style={{
                      width: '100%',
                      height: 220,
                      backgroundColor: '#dce9d0',
                      overflow: 'hidden',
                      flexShrink: 0,
                    }}>
                      {post.image ? (
                        <img
                          src={post.image}
                          alt={post.title}
                          referrerPolicy="no-referrer"
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      ) : (
                        <div style={{
                          width: '100%',
                          height: '100%',
                          background: 'linear-gradient(135deg, #c8ddb8, #e0edd4)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}>
                          <span style={{ fontSize: 40 }}>📖</span>
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div style={{ padding: '20px 24px 24px', display: 'flex', flexDirection: 'column', gap: 10, flex: 1 }}>
                      {/* Meta */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 12, color: '#6b7280' }}>
                        <span style={{ fontWeight: 600, color: '#4a7a1e', whiteSpace: 'pre-line', lineHeight: 1.3 }}>
                          {formatDate(post.published)}
                        </span>
                        <span style={{ width: 4, height: 4, borderRadius: '50%', backgroundColor: '#d1d5db', flexShrink: 0 }} />
                        <span>{post.author}</span>
                      </div>

                      {/* Title */}
                      <h2 style={{ fontSize: 18, fontWeight: 700, color: '#1a2e1a', lineHeight: 1.3 }}>
                        {post.title}
                      </h2>

                      {/* Excerpt */}
                      {post.summary && (
                        <p style={{ fontSize: 14, color: '#4b5563', lineHeight: 1.6, flex: 1 }}>
                          {post.summary}
                          {post.summary.length >= 200 ? '…' : ''}
                        </p>
                      )}

                      {/* Read more */}
                      <span style={{ fontSize: 13, color: '#6BAE2E', fontWeight: 600, marginTop: 4 }}>
                        Read more →
                      </span>
                    </div>
                  </article>
                </a>
              ))}
            </div>
          )}
        </div>

        {/* ── Footer ── */}
        <footer style={{
          background: '#1a2e1a',
          color: 'rgba(255,255,255,0.7)',
          padding: '32px 48px',
          textAlign: 'center',
          fontSize: 14,
        }}>
          <span style={{ color: '#6BAE2E', fontWeight: 700 }}>Somerset</span>
          {' '}Language Centre · Valencia · © {new Date().getFullYear()}
        </footer>

      </div>
    </>
  )
}
