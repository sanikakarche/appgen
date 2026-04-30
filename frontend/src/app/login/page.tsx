'use client';
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

// Auth config — treated as DATA not hardcoded logic
const authConfig = {
  appName: 'AppGen',
  tagline: 'Build apps from JSON — instantly',
  allowRegister: true,
  fields: [
    { name: 'email', label: 'Email', type: 'email', placeholder: 'you@example.com', required: true },
    { name: 'password', label: 'Password', type: 'password', placeholder: '••••••••', required: true },
  ],
  submitLabel: 'Sign In',
  registerLabel: 'Create Account',
  theme: { accent: '#6366f1', bg: '#0a0a0f', surface: '#111118' }
};

export default function LoginPage() {
  const { login, register } = useAuth();
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [values, setValues] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    for (const f of authConfig.fields) {
      if (f.required && !values[f.name]?.trim()) newErrors[f.name] = `${f.label} is required`;
      if (f.type === 'email' && values[f.name] && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values[f.name]))
        newErrors[f.name] = 'Invalid email';
      if (f.name === 'password' && values[f.name] && values[f.name].length < 6)
        newErrors[f.name] = 'Password must be 6+ characters';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      if (isLogin) await login(values.email, values.password);
      else await register(values.email, values.password);
      toast.success(isLogin ? 'Welcome back!' : 'Account created!');
      router.push('/dashboard');
    } catch (e: any) {
      toast.error(e.response?.data?.error || 'Something went wrong');
    } finally { setLoading(false); }
  };

  const { theme } = authConfig;

  return (
    <div style={{ minHeight: '100vh', background: theme.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', position: 'relative', overflow: 'hidden' }}>
      {/* Background effects */}
      <div style={{ position: 'absolute', top: '15%', left: '10%', width: '350px', height: '350px', background: `radial-gradient(circle, ${theme.accent}22 0%, transparent 70%)`, pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: '15%', right: '10%', width: '250px', height: '250px', background: 'radial-gradient(circle, #8b5cf622 0%, transparent 70%)', pointerEvents: 'none' }} />

      <div style={{ width: '100%', maxWidth: '420px', position: 'relative', zIndex: 1 }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '52px', height: '52px', background: `linear-gradient(135deg, ${theme.accent}, #8b5cf6)`, borderRadius: '14px', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '1.5rem' }}>⚡</span>
          </div>
          <h1 style={{ color: 'white', fontSize: '1.8rem', fontWeight: '800', marginBottom: '0.3rem' }}>{authConfig.appName}</h1>
          <p style={{ color: '#9ca3af', fontSize: '0.9rem' }}>{authConfig.tagline}</p>
        </div>

        {/* Card */}
        <div style={{ background: theme.surface, border: '1px solid #2a2a3a', borderRadius: '20px', padding: '2rem' }}>
          {/* Tabs */}
          {authConfig.allowRegister && (
            <div style={{ display: 'flex', background: theme.bg, borderRadius: '12px', padding: '4px', marginBottom: '1.5rem' }}>
              {[
                { label: authConfig.submitLabel, value: true },
                { label: authConfig.registerLabel, value: false }
              ].map(tab => (
                <button key={String(tab.value)} onClick={() => { setIsLogin(tab.value); setErrors({}); }}
                  style={{ flex: 1, padding: '0.6rem', borderRadius: '9px', border: 'none', cursor: 'pointer', fontWeight: '600', fontSize: '0.9rem', transition: 'all 0.2s',
                    background: isLogin === tab.value ? theme.accent : 'transparent',
                    color: isLogin === tab.value ? 'white' : '#6b7280' }}>
                  {tab.label}
                </button>
              ))}
            </div>
          )}

          {/* Dynamic fields from config */}
          {authConfig.fields.map(f => (
            <div key={f.name} style={{ marginBottom: '1rem' }}>
              <label style={{ color: errors[f.name] ? '#ef4444' : '#9ca3af', fontSize: '0.8rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '6px' }}>
                {f.label}{f.required && <span style={{ color: '#ef4444', marginLeft: '4px' }}>*</span>}
              </label>
              <input type={f.type} value={values[f.name] || ''} onChange={e => setValues(v => ({ ...v, [f.name]: e.target.value }))}
                placeholder={f.placeholder}
                onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                style={{ width: '100%', background: theme.bg, border: `1px solid ${errors[f.name] ? '#ef4444' : '#2a2a3a'}`, borderRadius: '10px', padding: '0.75rem', color: 'white', outline: 'none', fontSize: '0.9rem' }}
                onFocus={e => e.target.style.borderColor = errors[f.name] ? '#ef4444' : theme.accent}
                onBlur={e => e.target.style.borderColor = errors[f.name] ? '#ef4444' : '#2a2a3a'} />
              {errors[f.name] && <p style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '4px' }}>⚠ {errors[f.name]}</p>}
            </div>
          ))}

          <button onClick={handleSubmit} disabled={loading}
            style={{ width: '100%', marginTop: '0.5rem', background: loading ? '#1a1a24' : `linear-gradient(135deg, ${theme.accent}, #8b5cf6)`, border: 'none', borderRadius: '12px', padding: '0.85rem', color: 'white', fontWeight: '700', fontSize: '0.95rem', cursor: loading ? 'not-allowed' : 'pointer' }}>
            {loading ? 'Please wait...' : isLogin ? authConfig.submitLabel : authConfig.registerLabel}
          </button>
        </div>

        <p style={{ textAlign: 'center', color: '#4b5563', fontSize: '0.8rem', marginTop: '1rem' }}>
          Config-driven • Full-stack • Production-ready
        </p>
      </div>
    </div>
  );
}