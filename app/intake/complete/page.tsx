'use client'
import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'

function CompleteContent() {
  const params = useSearchParams()
  const name = params.get('name') ?? 'you'

  return (
    <div
      style={{
        maxWidth: 480,
        margin: '0 auto',
        padding: '64px 24px',
        textAlign: 'center',
        fontFamily: 'Arial, Liberation Sans, sans-serif',
      }}
    >
      <div
        style={{
          width: 56,
          height: 56,
          borderRadius: '50%',
          backgroundColor: '#6BAE2E',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 24px',
        }}
      >
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </div>

      <h1 style={{ fontSize: 24, fontWeight: 700, color: '#111827', marginBottom: 12 }}>
        All done, {name}!
      </h1>
      <p style={{ color: '#6b7280', fontSize: 15, lineHeight: 1.7, marginBottom: 8 }}>
        Thanks for completing the Somerset quiz. Your teacher will be in touch before your first class.
      </p>
      <p style={{ color: '#6b7280', fontSize: 15 }}>
        See you at Somerset!
      </p>
    </div>
  )
}

export default function CompletePage() {
  return (
    <main style={{ minHeight: '100vh', backgroundColor: '#fff' }}>
      <header style={{ borderBottom: '3px solid #6BAE2E', padding: '14px 24px' }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/somerset-logo-wordmark-colour.png"
          alt="Somerset Language Centre"
          style={{ height: 36 }}
          onError={e => { (e.target as HTMLImageElement).style.display = 'none' }}
        />
      </header>
      <Suspense>
        <CompleteContent />
      </Suspense>
    </main>
  )
}
