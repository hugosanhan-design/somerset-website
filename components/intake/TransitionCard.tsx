export default function TransitionCard({ message }: { message: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '48px 0', gap: 16 }}>
      <div
        style={{
          width: 32,
          height: 32,
          borderRadius: '50%',
          border: '4px solid #6BAE2E',
          borderTopColor: 'transparent',
          animation: 'spin 0.8s linear infinite',
        }}
      />
      <p style={{ color: '#6b7280', fontSize: 15, fontFamily: 'Arial, Liberation Sans, sans-serif' }}>
        {message}
      </p>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
