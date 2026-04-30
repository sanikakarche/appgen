'use client';
import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { Plus, LogOut, Layers, Trash2, Clock, Code2, Zap, X, ChevronRight } from 'lucide-react';

const DEFAULT_CONFIG = {
  pages: [{
    id: "home", title: "Dashboard",
    components: [
      { type: "heading", text: "Welcome to My App", size: "xl" },
      { type: "paragraph", text: "This app was generated from a JSON config." },
      { type: "form", title: "Add Contact", collection: "contacts", submitLabel: "Save Contact",
        fields: [
          { name: "name", label: "Full Name", type: "text", required: true },
          { name: "email", label: "Email Address", type: "email", required: true },
          { name: "phone", label: "Phone", type: "text" },
          { name: "message", label: "Message", type: "textarea" }
        ]},
      { type: "table", title: "Contacts List", collection: "contacts", columns: ["name", "email", "phone"] }
    ]
  }]
};

export default function Dashboard() {
  const { user, logout, loading } = useAuth();
  const router = useRouter();
  const [apps, setApps] = useState<any[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState('');
  const [configJson, setConfigJson] = useState(JSON.stringify(DEFAULT_CONFIG, null, 2));
  const [jsonError, setJsonError] = useState('');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (!loading && !user) router.push('/login');
    else if (user) fetchApps();
  }, [user, loading]);

  const fetchApps = async () => {
    try { const { data } = await api.get('/apps'); setApps(data); } catch {}
  };

  const validateJson = (val: string) => {
    try { JSON.parse(val); setJsonError(''); return true; }
    catch (e: any) { setJsonError(e.message); return false; }
  };

  const createApp = async () => {
    if (!validateJson(configJson)) return toast.error('Fix JSON errors first');
    setCreating(true);
    try {
      const config = JSON.parse(configJson);
      await api.post('/apps', { name: newName || 'Untitled App', config });
      toast.success('App created!');
      setShowCreate(false);
      setNewName('');
      fetchApps();
    } catch (e: any) {
      toast.error(e.response?.data?.error || 'Failed to create');
    } finally { setCreating(false); }
  };

  const deleteApp = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Delete this app?')) return;
    await api.delete(`/apps/${id}`);
    fetchApps();
    toast.success('Deleted');
  };

  if (loading) return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: '40px', height: '40px', border: '3px solid var(--border)', borderTop: '3px solid #6366f1', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 1rem' }} />
        <p style={{ color: 'var(--muted)' }}>Loading...</p>
      </div>
    </div>
  );

  if (!user) return null;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <nav className="glass" style={{ position: 'sticky', top: 0, zIndex: 50, padding: '0 1.5rem', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '32px', height: '32px', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Layers size={16} color="white" />
          </div>
          <span style={{ fontWeight: '800', fontSize: '1.1rem' }} className="gradient-text">AppGen</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <span style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>{user.email}</span>
          <button onClick={logout} style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--muted)', background: 'none', border: '1px solid var(--border)', borderRadius: '8px', padding: '6px 12px', cursor: 'pointer', fontSize: '0.85rem' }}>
            <LogOut size={14} /> Logout
          </button>
        </div>
      </nav>

      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '2rem 1.5rem' }}>
        <div className="fade-up" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ fontSize: '2rem', fontWeight: '800', marginBottom: '0.3rem' }}>My Apps</h1>
            <p style={{ color: 'var(--muted)' }}>{apps.length} app{apps.length !== 1 ? 's' : ''} created</p>
          </div>
          <button onClick={() => setShowCreate(true)}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', border: 'none', borderRadius: '12px', padding: '0.75rem 1.25rem', color: 'white', fontWeight: '700', cursor: 'pointer', fontSize: '0.9rem' }}>
            <Plus size={18} /> New App
          </button>
        </div>

        <div className="fade-up stagger-1" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
          {[
            { icon: <Layers size={20} />, label: 'Total Apps', value: apps.length },
            { icon: <Zap size={20} />, label: 'Components', value: apps.reduce((a, app) => a + (app.config?.pages?.[0]?.components?.length || 0), 0) },
            { icon: <Code2 size={20} />, label: 'Pages', value: apps.reduce((a, app) => a + (app.config?.pages?.length || 0), 0) },
          ].map((stat, i) => (
            <div key={i} className="glass" style={{ borderRadius: '14px', padding: '1.2rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ width: '40px', height: '40px', background: 'rgba(99,102,241,0.15)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6366f1' }}>{stat.icon}</div>
              <div>
                <div style={{ fontSize: '1.5rem', fontWeight: '800' }}>{stat.value}</div>
                <div style={{ color: 'var(--muted)', fontSize: '0.8rem' }}>{stat.label}</div>
              </div>
            </div>
          ))}
        </div>

        {apps.length === 0 ? (
          <div className="glass fade-up stagger-2" style={{ borderRadius: '20px', padding: '4rem', textAlign: 'center' }}>
            <div style={{ width: '64px', height: '64px', background: 'rgba(99,102,241,0.1)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem', color: '#6366f1' }}><Layers size={28} /></div>
            <h3 style={{ fontWeight: '700', marginBottom: '0.5rem' }}>No apps yet</h3>
            <p style={{ color: 'var(--muted)', marginBottom: '1.5rem' }}>Create your first config-driven app</p>
            <button onClick={() => setShowCreate(true)} style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', border: 'none', borderRadius: '10px', padding: '0.7rem 1.5rem', color: 'white', fontWeight: '600', cursor: 'pointer' }}>Create App</button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
            {apps.map((app, i) => (
              <div key={app.id} className="glass fade-up" onClick={() => router.push(`/app/${app.id}`)}
                style={{ borderRadius: '16px', padding: '1.5rem', cursor: 'pointer', transition: 'all 0.2s', animationDelay: `${i * 0.05}s`, opacity: 0, position: 'relative', overflow: 'hidden' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = '#6366f1'; e.currentTarget.style.transform = 'translateY(-3px)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'none'; }}>
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: 'linear-gradient(90deg, #6366f1, #8b5cf6, #ec4899)' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                  <div style={{ width: '40px', height: '40px', background: 'rgba(99,102,241,0.15)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6366f1' }}><Layers size={18} /></div>
                  <button onClick={(e) => deleteApp(app.id, e)} style={{ background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer', padding: '4px', borderRadius: '6px' }}
                    onMouseEnter={e => (e.currentTarget.style.color = '#ef4444')}
                    onMouseLeave={e => (e.currentTarget.style.color = 'var(--muted)')}>
                    <Trash2 size={15} />
                  </button>
                </div>
                <h3 style={{ fontWeight: '700', fontSize: '1rem', marginBottom: '0.5rem' }}>{app.name}</h3>
                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                  <span style={{ fontSize: '0.75rem', background: 'rgba(99,102,241,0.1)', color: '#818cf8', padding: '2px 8px', borderRadius: '20px' }}>{app.config?.pages?.length || 0} pages</span>
                  <span style={{ fontSize: '0.75rem', background: 'rgba(16,185,129,0.1)', color: '#34d399', padding: '2px 8px', borderRadius: '20px' }}>{app.config?.pages?.[0]?.components?.length || 0} components</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: 'var(--muted)', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px' }}><Clock size={12} />{new Date(app.created_at).toLocaleDateString()}</span>
                  <span style={{ color: '#6366f1', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: '600' }}>Open <ChevronRight size={14} /></span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showCreate && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', zIndex: 100, backdropFilter: 'blur(4px)' }}>
          <div className="glass" style={{ borderRadius: '20px', padding: '2rem', width: '100%', maxWidth: '680px', maxHeight: '90vh', overflow: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontWeight: '800', fontSize: '1.3rem' }}>Create New App</h2>
              <button onClick={() => setShowCreate(false)} style={{ background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer' }}><X size={20} /></button>
            </div>
            <label style={{ color: 'var(--muted)', fontSize: '0.8rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '6px' }}>App Name</label>
            <input value={newName} onChange={e => setNewName(e.target.value)} placeholder="My Awesome App"
              style={{ width: '100%', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '10px', padding: '0.75rem', color: 'var(--text)', outline: 'none', fontSize: '0.9rem', marginBottom: '1rem' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <label style={{ color: 'var(--muted)', fontSize: '0.8rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>JSON Config</label>
              {jsonError ? <span style={{ color: '#ef4444', fontSize: '0.75rem' }}>⚠ Invalid JSON</span> : <span style={{ color: '#10b981', fontSize: '0.75rem' }}>✓ Valid JSON</span>}
            </div>
            <textarea value={configJson} onChange={e => { setConfigJson(e.target.value); validateJson(e.target.value); }} rows={18}
              style={{ width: '100%', background: 'var(--bg)', border: `1px solid ${jsonError ? '#ef4444' : 'var(--border)'}`, borderRadius: '10px', padding: '0.75rem', color: '#a5f3fc', fontFamily: 'monospace', fontSize: '0.8rem', outline: 'none', resize: 'vertical', marginBottom: '1rem', lineHeight: '1.6' }} />
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button onClick={createApp} disabled={creating || !!jsonError}
                style={{ flex: 1, background: creating || jsonError ? 'var(--surface2)' : 'linear-gradient(135deg, #6366f1, #8b5cf6)', border: 'none', borderRadius: '12px', padding: '0.85rem', color: 'white', fontWeight: '700', cursor: creating || jsonError ? 'not-allowed' : 'pointer' }}>
                {creating ? 'Creating...' : '🚀 Create App'}
              </button>
              <button onClick={() => setShowCreate(false)}
                style={{ flex: 1, background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: '12px', padding: '0.85rem', color: 'var(--text)', fontWeight: '600', cursor: 'pointer' }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}