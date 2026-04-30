export default function NotFound() {
  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0f', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '1rem' }}>
      <h1 style={{ color: 'white', fontSize: '4rem', fontWeight: '800' }}>404</h1>
      <p style={{ color: '#6b7280' }}>Page not found</p>
      <a href="/dashboard" style={{ color: '#6366f1', textDecoration: 'none' }}>Go to Dashboard</a>
    </div>
  );
}