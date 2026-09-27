'use client'
import SomersetLogo from '@/components/SomersetLogo'
import BackToDashboard from '@/components/BackToDashboard'

const INTAKE_URL = 'https://app-seven-pi-qvwadlldx2.vercel.app/intake'
const QR_URL = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&margin=16&data=${encodeURIComponent(INTAKE_URL)}`

export default function QRPage() {
  return (
    <>
      <BackToDashboard />
    <div style={{
      minHeight: '100vh',
      background: '#fff',
      fontFamily: 'Arial, Liberation Sans, sans-serif',
      display: 'flex',
      flexDirection: 'column',
    }}>
      {/* Print button — hidden when printing */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '16px 24px' }} className="no-print">
        <button
          onClick={() => window.print()}
          style={{
            background: '#6BAE2E',
            color: '#fff',
            border: 'none',
            borderRadius: 7,
            padding: '10px 20px',
            fontSize: 14,
            fontWeight: 700,
            cursor: 'pointer',
            fontFamily: 'inherit',
          }}
        >
          🖨 Print poster
        </button>
      </div>

      {/* Poster content */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '32px 24px 48px',
        textAlign: 'center',
      }}>
        {/* Logo */}
        <div style={{ marginBottom: 32 }}>
          <SomersetLogo variant="colour" />
        </div>

        {/* Heading */}
        <h1 style={{
          fontSize: 32,
          fontWeight: 700,
          color: '#1a1a1a',
          marginBottom: 10,
          lineHeight: 1.2,
        }}>
          Starting at Somerset?
        </h1>
        <p style={{
          fontSize: 17,
          color: '#555',
          marginBottom: 36,
          maxWidth: 380,
          lineHeight: 1.6,
        }}>
          Scan the code below to complete your English level quiz before your first class.
          It only takes 5–10 minutes.
        </p>

        {/* QR code */}
        <div style={{
          border: '3px solid #6BAE2E',
          borderRadius: 16,
          padding: 16,
          display: 'inline-block',
          marginBottom: 28,
          boxShadow: '0 4px 20px rgba(107,174,46,0.15)',
        }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={QR_URL}
            alt="QR code for Somerset placement quiz"
            width={280}
            height={280}
            style={{ display: 'block' }}
          />
        </div>

        {/* URL fallback */}
        <p style={{ fontSize: 13, color: '#999', marginBottom: 4 }}>
          Or visit:
        </p>
        <p style={{
          fontSize: 14,
          color: '#6BAE2E',
          fontWeight: 700,
          letterSpacing: '0.3px',
          wordBreak: 'break-all',
        }}>
          {INTAKE_URL}
        </p>

        {/* Footer */}
        <p style={{
          marginTop: 48,
          fontSize: 12,
          color: '#bbb',
        }}>
          Somerset Language Centre, Valencia
        </p>
      </div>

      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { margin: 0; }
        }
      `}</style>
    </div>
    </>
  )
}
