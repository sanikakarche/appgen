'use client';
import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter, useParams } from 'next/navigation';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { ArrowLeft, Save, Eye, Code, RefreshCw, Layers, Trash2 } from 'lucide-react';

// ── Inline Mini Renderer (same logic as main app) ──
const MiniRegistry: Record<string, React.FC<any>> = {
  heading: ({ component }) => (
    <h2 style={{ fontSize: component.size === 'xl' ? '1.8rem' : '1.2rem', fontWeight: '800', marginBottom: '0.75rem', color: 'white' }}>
      {component.text || 'Heading'}
    </h2>
  ),
  paragraph: ({ component }) => (
    <p style={{ color: '#9ca3af', marginBottom: '1rem', lineHeight: '1.6', fontSize: '0.9rem' }}>{component.text}</p>
  ),
  divider: () => <hr style={{ border: 'none', borderTop: '1px solid #2a2a3a', margin: '1rem 0' }} />,
  form: ({ component }) => (
    <div style={{ background: '#0a0a0f', border: '1px solid #2a2a3a', borderRadius: '12px', padding: '1.2rem', marginBottom: '1rem' }}>
      {component.title && <h3 style={{ fontWeight: '700', marginBottom: '1rem', color: 'white', fontSize: '0.95rem' }}>{component.title}</h3>}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem' }}>
        {(component.fields || []).map((f: any) => (
          <div key={f.name}>
            <label style={{ color: '#6b7280', fontSize: '0.7rem', fontWeight: '600', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>
              {f.label || f.name}{f.required && <span style={{ color: '#ef4444' }}>*</span>}
            </label>
            {f.type === 'textarea' ? (
              <textarea rows={2} placeholder={f.placeholder || ''} disabled style={{ width: '100%', background: '#111118', border: '1px solid #2a2a3a', borderRadius: '8px', padding: '0.5rem', color: '#6b7280', fontSize: '0.8rem', resize: 'none' }} />
            ) : f.type === 'select' ? (
              <select disabled style={{ width: '100%', background: '#111118', border: '1px solid #2a2a3a', borderRadius: '8px', padding: '0.5rem', color: '#6b7280', fontSize: '0.8rem' }}>
                <option>Select {f.label}</option>
              </select>
            ) : (
              <input type={f.type || 'text'} placeholder={f.placeholder || f.label || ''} disabled
                style={{ width: '100%', background: '#111118', border: '1px solid #2a2a3a', borderRadius: '8px', padding: '0.5rem', color: '#6b7280', fontSize: '0.8rem' }} />
            )}
          </div>
        ))}
      </div>
      <button disabled style={{ marginTop: '0.75rem', background: '#6366f1', border: 'none', borderRadius: '8px', padding: '0.5rem 1rem', color: 'white', fontWeight: '600', fontSize: '0.8rem', cursor: 'not-allowed', opacity: 0.7 }}>
        {component.submitLabel || 'Submit'}
      </button>
    </div>
  ),
  table: ({ component }) => (
    <div style={{ background: '#0a0a0f', border: '1px solid #2a2a3a', borderRadius: '12px', padding: '1.2rem', marginBottom: '1rem' }}>
      {component.title && <h3 style={{ fontWeight: '700', marginBottom: '0.75rem', color: 'white', fontSize: '0.95rem' }}>{component.title}</h3>}
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
        <thead>
          <tr style={{ borderBottom: '1px solid #2a2a3a' }}>
            {(component.columns || ['column1', 'column2']).map((c: string) => (
              <th key={c} style={{ textAlign: 'left', padding: '0.4rem 0.6rem', color: '#6b7280', fontWeight: '600', textTransform: 'uppercase', fontSize: '0.7rem' }}>{c}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          <tr><td colSpan={(component.columns || []).length} style={{ padding: '1rem', textAlign: 'center', color: '#4b5563', fontSize: '0.8rem' }}>Preview mode — no data</td></tr>
        </tbody>
      </table>
    </div>
  ),
  unknown: ({ component }) => (
    <div style={{ border: '1px solid #f59e0b', background: 'rgba(245,158,11,0.08)', borderRadius: '10px', padding: '0.75rem 1rem', marginBottom: '0.75rem' }}>
      <p style={{ color: '#fbbf24', fontWeight: '600', fontSize: '0.85rem' }}>⚠️ Unknown: "{component.type}"</p>
      <p style={{ color: '#9ca3af', fontSize: '0.75rem' }}>Add to ComponentRegistry to render</p>
    </div>
  ),
};

export default function EditorPage() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const appId = params.id as string;

  const [app, setApp] = useState<any>(null);
  const [configText, setConfigText] = useState('');
  const [parsedConfig, setParsedConfig] = useState<any>(null);
  const [jsonError, setJsonError] = useState('');
  const [saving, setSaving] = useState(false);
  const [activePage, setActivePage] = useState(0);
  const [activeTab, setActiveTab] = useState<'split' | 'code' | 'preview'>('split');

  useEffect(() => { if (!user) router.push('/login'); else fetchApp(); }, [user]);

  const fetchApp = async () => {
    try {
      const { data } = await api.get(`/apps/${appId}`);
      setApp(data);
      const configStr = JSON.stringify(data.config, null, 2);
      setConfigText(configStr);
      setParsedConfig(data.config);
    } catch { toast.error('App not found'); router.push('/dashboard'); }
  };

  const handleConfigChange = useCallback((val: string) => {
    setConfigText(val);
    try {
      const parsed = JSON.parse(val);
      setParsedConfig(parsed);
      setJsonError('');
    } catch (e: any) {
      setJsonError(e.message);
    }
  }, []);

  const saveConfig = async () => {
    if (jsonError) return toast.error('Fix JSON errors first');
    setSaving(true);
    try {
      await api.put(`/apps/${appId}`, { config: parsedConfig });
      toast.success('Config saved!');
      setApp((a: any) => ({ ...a, config: parsedConfig }));
    } catch { toast.error('Failed to save'); }
    finally { setSaving(false); }
  };

  if (!app) return (
    <div style={{ minHeight: '100vh', background: '#0a0a0f', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ color: '#6b7280' }}>Loading editor...</p>
    </div>
  );

  const pages = parsedConfig?.pages || [];
  const currentPage = pages[activePage] || {};
  const components = currentPage.components || [];

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0f', display: 'flex', flexDirection: 'column' }}>
      {/* Top Bar */}
      <nav style={{ background: '#111118', borderBottom: '1px solid #2a2a3a', padding: '0 1.5rem', height: '56px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button onClick={() => router.push(`/app/${appId}`)}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#6b7280', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.85rem' }}>
            <ArrowLeft size={16} /> Back
          </button>
          <div style={{ width: '1px', height: '20px', background: '#2a2a3a' }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Layers size={16} color="#6366f1" />
            <span style={{ fontWeight: '700', color: 'white', fontSize: '0.95rem' }}>{app.name}</span>
            <span style={{ background: 'rgba(99,102,241,0.15)', color: '#818cf8', fontSize: '0.7rem', padding: '2px 8px', borderRadius: '20px', fontWeight: '600' }}>EDITOR</span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {/* View toggle */}
          <div style={{ display: 'flex', background: '#0a0a0f', borderRadius: '8px', padding: '3px', border: '1px solid #2a2a3a' }}>
            {([['split', '⬜ Split'], ['code', '💻 Code'], ['preview', '👁 Preview']] as const).map(([val, label]) => (
              <button key={val} onClick={() => setActiveTab(val)}
                style={{ padding: '4px 10px', borderRadius: '6px', border: 'none', cursor: 'pointer', fontSize: '0.75rem', fontWeight: '600',
                  background: activeTab === val ? '#6366f1' : 'transparent',
                  color: activeTab === val ? 'white' : '#6b7280' }}>
                {label}
              </button>
            ))}
          </div>

          {jsonError && <span style={{ color: '#ef4444', fontSize: '0.75rem' }}>⚠ JSON Error</span>}
          {!jsonError && <span style={{ color: '#10b981', fontSize: '0.75rem' }}>✓ Valid</span>}

          <button onClick={saveConfig} disabled={saving || !!jsonError}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', background: saving || jsonError ? '#1a1a24' : '#6366f1', border: 'none', borderRadius: '8px', padding: '8px 16px', color: 'white', fontWeight: '600', cursor: saving || jsonError ? 'not-allowed' : 'pointer', fontSize: '0.85rem' }}>
            <Save size={14} /> {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </nav>

      {/* Page tabs */}
      {pages.length > 1 && (
        <div style={{ background: '#111118', borderBottom: '1px solid #2a2a3a', padding: '0 1.5rem', display: 'flex', gap: '0.25rem' }}>
          {pages.map((p: any, i: number) => (
            <button key={i} onClick={() => setActivePage(i)}
              style={{ padding: '0.5rem 1rem', background: 'none', border: 'none', borderBottom: `2px solid ${i === activePage ? '#6366f1' : 'transparent'}`, color: i === activePage ? '#6366f1' : '#6b7280', fontWeight: '600', cursor: 'pointer', fontSize: '0.85rem' }}>
              {p.title || `Page ${i + 1}`}
            </button>
          ))}
        </div>
      )}

      {/* Main editor area */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden', height: 'calc(100vh - 56px)' }}>

        {/* Code panel */}
        {(activeTab === 'split' || activeTab === 'code') && (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', borderRight: '1px solid #2a2a3a' }}>
            <div style={{ padding: '0.6rem 1rem', background: '#111118', borderBottom: '1px solid #2a2a3a', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Code size={14} color="#6b7280" />
              <span style={{ color: '#6b7280', fontSize: '0.8rem', fontWeight: '600' }}>JSON CONFIG</span>
              {jsonError && <span style={{ color: '#ef4444', fontSize: '0.7rem', marginLeft: 'auto' }}>⚠ {jsonError.slice(0, 50)}</span>}
            </div>
            <textarea value={configText} onChange={e => handleConfigChange(e.target.value)}
              style={{ flex: 1, background: '#0a0a0f', border: 'none', padding: '1rem', color: '#a5f3fc', fontFamily: '"Fira Code", "Courier New", monospace', fontSize: '0.82rem', lineHeight: '1.7', outline: 'none', resize: 'none', borderLeft: jsonError ? '3px solid #ef4444' : '3px solid transparent' }}
              spellCheck={false} />
          </div>
        )}

        {/* Preview panel */}
        {(activeTab === 'split' || activeTab === 'preview') && (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <div style={{ padding: '0.6rem 1rem', background: '#111118', borderBottom: '1px solid #2a2a3a', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Eye size={14} color="#6b7280" />
              <span style={{ color: '#6b7280', fontSize: '0.8rem', fontWeight: '600' }}>LIVE PREVIEW</span>
              <span style={{ color: '#4b5563', fontSize: '0.7rem', marginLeft: 'auto' }}>Updates as you type</span>
            </div>
            <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem' }}>
              {jsonError ? (
                <div style={{ border: '1px solid #ef4444', background: 'rgba(239,68,68,0.08)', borderRadius: '12px', padding: '1.5rem', textAlign: 'center' }}>
                  <p style={{ color: '#ef4444', fontWeight: '700', marginBottom: '0.5rem' }}>⚠ Invalid JSON</p>
                  <p style={{ color: '#9ca3af', fontSize: '0.8rem', fontFamily: 'monospace' }}>{jsonError}</p>
                  <p style={{ color: '#6b7280', fontSize: '0.75rem', marginTop: '0.5rem' }}>Fix the error to see preview</p>
                </div>
              ) : components.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '3rem', color: '#4b5563' }}>
                  <p style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📄</p>
                  <p>No components on this page</p>
                </div>
              ) : (
                components.map((comp: any, i: number) => {
                  const Comp = MiniRegistry[comp?.type] || MiniRegistry.unknown;
                  return <Comp key={i} component={comp || {}} />;
                })
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}