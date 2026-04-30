'use client';
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const { login, register } = useAuth();
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!email || !password) return toast.error('Fill all fields');
    setLoading(true);
    try {
      if (isLogin) await login(email, password);
      else await register(email, password);
      router.push('/dashboard');
    } catch (e: any) {
      toast.error(e.response?.data?.error || 'Something went wrong');
    } finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0f', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: '100%', maxWidth: '400px', padding: '2rem', background: '#111118', border: '1px solid #2a2a3a', borderRadius: '20px', margin: '1rem' }}>
        <h1 style={{ color: 'white', fontSize: '1.8rem', fontWeight: '800', marginBottom: '0.5rem' }}>AppGen</h1>
        <p style={{ color: '#6b7280', marginBottom: '2rem' }}>Build apps from JSON</p>

        <div style={{ display: 'flex', background: '#0a0a0f', borderRadius: '10px', padding: '4px', marginBottom: '1.5rem' }}>
          {['Login', 'Register'].map((tab, i) => (
            <button key={tab} onClick={() => setIsLogin(i === 0)}
              style={{ flex: 1, padding: '0.6rem', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: '600', fontSize: '0.9rem',
                background: isLogin === (i === 0) ? '#6366f1' : 'transparent',
                color: isLogin === (i === 0) ? 'white' : '#6b7280' }}>
              {tab}
            </button>
          ))}
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label style={{ color: '#6b7280', fontSize: '0.8rem', display: 'block', marginBottom: '6px' }}>Email</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)}
            placeholder="you@example.com"
            style={{ width: '100%', background: '#0a0a0f', border: '1px solid #2a2a3a', borderRadius: '10px', padding: '0.75rem', color: 'white', outline: 'none', fontSize: '0.9rem' }} />
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ color: '#6b7280', fontSize: '0.8rem', display: 'block', marginBottom: '6px' }}>Password</label>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)}
            placeholder="••••••••"
            onKeyDown={e => e.key === 'Enter' && handleSubmit()}
            style={{ width: '100%', background: '#0a0a0f', border: '1px solid #2a2a3a', borderRadius: '10px', padding: '0.75rem', color: 'white', outline: 'none', fontSize: '0.9rem' }} />
        </div>

        <button onClick={handleSubmit} disabled={loading}
          style={{ width: '100%', background: '#6366f1', border: 'none', borderRadius: '12px', padding: '0.85rem', color: 'white', fontWeight: '700', fontSize: '0.95rem', cursor: 'pointer' }}>
          {loading ? 'Please wait...' : isLogin ? 'Sign In' : 'Create Account'}
        </button>
      </div>
    </div>
  );
}