'use client';
export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0f', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '1rem' }}>
      <h2 style={{ color: 'white', fontSize: '1.5rem', fontWeight: '700' }}>Something went wrong</h2>
      <p style={{ color: '#6b7280', fontSize: '0.9rem' }}>{error.message}</p>
      <button onClick={reset} style={{ background: '#6366f1', border: 'none', borderRadius: '10px', padding: '0.7rem 1.5rem', color: 'white', fontWeight: '600', cursor: 'pointer' }}>
        Try Again
      </button>
      <a href="/dashboard" style={{ color: '#6b7280', fontSize: '0.85rem' }}>Go to Dashboard</a>
    </div>
  );
}