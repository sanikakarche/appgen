'use client';
import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter, useParams } from 'next/navigation';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { ArrowLeft, Layers, Trash2, RefreshCw } from 'lucide-react';

const ComponentRegistry: Record<string, React.FC<any>> = {
  heading: ({ component }) => (
    <h2 style={{ fontSize: component.size === 'xl' ? '2rem' : '1.3rem', fontWeight: '800', marginBottom: '1rem', color: 'white' }}>
      {component.text || 'Heading'}
    </h2>
  ),
  paragraph: ({ component }) => (
    <p style={{ color: '#9ca3af', marginBottom: '1.5rem', lineHeight: '1.7' }}>{component.text}</p>
  ),
  divider: () => <hr style={{ border: 'none', borderTop: '1px solid #2a2a3a', margin: '1.5rem 0' }} />,
  form: ({ component, appId, onRefresh }) => <DynamicForm component={component} appId={appId} onRefresh={onRefresh} />,
  table: ({ component, appId, refreshKey }) => <DynamicTable component={component} appId={appId} refreshKey={refreshKey} />,
  unknown: ({ component }) => (
    <div style={{ border: '1px solid #f59e0b', background: 'rgba(245,158,11,0.08)', borderRadius: '12px', padding: '1rem 1.25rem', marginBottom: '1rem' }}>
      <p style={{ color: '#fbbf24', fontWeight: '600' }}>⚠️ Unknown component: "{component.type}"</p>
      <p style={{ color: '#9ca3af', fontSize: '0.8rem' }}>Add it to ComponentRegistry to render.</p>
    </div>
  ),
};

function DynamicForm({ component, appId, onRefresh }: any) {
  const [values, setValues] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const fields = component.fields || [];

  const validate = () => {
    const newErrors: Record<string, string> = {};
    for (const f of fields) {
      const val = values[f.name]?.trim();
      if (f.required && !val) newErrors[f.name] = `${f.label || f.name} is required`;
      if (f.type === 'email' && val && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) newErrors[f.name] = 'Invalid email';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      await api.post(`/data/${appId}/${component.collection || 'records'}`, values);
      const msg = component.onSubmit?.successMessage || 'Saved successfully!';
      toast.success(msg);
      setValues({});
      setErrors({});
      onRefresh?.();
    } catch { toast.error('Failed to save'); }
    finally { setLoading(false); }
  };

  const renderField = (f: any) => {
    const style = { width: '100%', background: '#0a0a0f', border: `1px solid ${errors[f.name] ? '#ef4444' : '#2a2a3a'}`, borderRadius: '10px', padding: '0.7rem', color: 'white', outline: 'none', fontSize: '0.9rem' };
    if (f.type === 'textarea') return <textarea value={values[f.name] || ''} onChange={e => setValues(v => ({ ...v, [f.name]: e.target.value }))} rows={3} style={{ ...style, resize: 'vertical' }} />;
    if (f.type === 'select') return (
      <select value={values[f.name] || ''} onChange={e => setValues(v => ({ ...v, [f.name]: e.target.value }))} style={{ ...style, cursor: 'pointer' }}>
        <option value="">Select {f.label}</option>
        {(f.options || []).map((opt: string) => <option key={opt} value={opt}>{opt}</option>)}
      </select>
    );
    if (f.type === 'radio') return (
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        {(f.options || []).map((opt: string) => (
          <label key={opt} style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#d1d5db', cursor: 'pointer' }}>
            <input type="radio" name={f.name} value={opt} checked={values[f.name] === opt} onChange={e => setValues(v => ({ ...v, [f.name]: e.target.value }))} />
            {opt}
          </label>
        ))}
      </div>
    );
    if (f.type === 'checkbox') return (
      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', color: '#d1d5db' }}>
        <input type="checkbox" checked={values[f.name] === 'true'} onChange={e => setValues(v => ({ ...v, [f.name]: String(e.target.checked) }))} />
        {f.checkboxLabel || f.label}
      </label>
    );
    return <input type={f.type || 'text'} value={values[f.name] || ''} onChange={e => setValues(v => ({ ...v, [f.name]: e.target.value }))} placeholder={f.placeholder || ''} min={f.min} max={f.max} style={style} />;
  };

  if (fields.length === 0) return <div style={{ background: '#111118', border: '1px solid #2a2a3a', borderRadius: '14px', padding: '1.5rem', marginBottom: '1.5rem', color: '#f59e0b' }}>⚠️ Form has no fields defined</div>;

  return (
    <div style={{ background: '#111118', border: '1px solid #2a2a3a', borderRadius: '16px', padding: '1.5rem', marginBottom: '1.5rem' }}>
      {component.title && <h3 style={{ fontWeight: '700', marginBottom: '1.2rem', color: 'white' }}>{component.title}</h3>}
      <div style={{ display: 'grid', gridTemplateColumns: component.columns || 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
        {fields.map((f: any) => (
          <div key={f.name} style={{ gridColumn: f.fullWidth ? '1 / -1' : undefined }}>
            <label style={{ color: errors[f.name] ? '#ef4444' : '#9ca3af', fontSize: '0.8rem', fontWeight: '600', display: 'block', marginBottom: '6px', textTransform: 'uppercase' }}>
              {f.label || f.name}{f.required && <span style={{ color: '#ef4444', marginLeft: '4px' }}>*</span>}
            </label>
            {renderField(f)}
            {errors[f.name] && <p style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '4px' }}>⚠ {errors[f.name]}</p>}
            {f.hint && !errors[f.name] && <p style={{ color: '#6b7280', fontSize: '0.75rem', marginTop: '4px' }}>{f.hint}</p>}
          </div>
        ))}
      </div>
      <div style={{ marginTop: '1.2rem', display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
        <button onClick={handleSubmit} disabled={loading}
          style={{ background: loading ? '#1a1a24' : 'linear-gradient(135deg, #6366f1, #8b5cf6)', border: 'none', borderRadius: '10px', padding: '0.75rem 1.75rem', color: 'white', fontWeight: '700', cursor: loading ? 'not-allowed' : 'pointer' }}>
          {loading ? 'Saving...' : component.submitLabel || 'Submit'}
        </button>
        {Object.keys(errors).length > 0 && <span style={{ color: '#ef4444', fontSize: '0.8rem' }}>Fix {Object.keys(errors).length} error(s)</span>}
      </div>
    </div>
  );
}

function DynamicTable({ component, appId, refreshKey }: any) {
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [importing, setImporting] = useState(false);
  const columns: string[] = component.columns || [];

  useEffect(() => { fetchData(); }, [refreshKey]);

  const fetchData = async () => {
    setLoading(true);
    try { const { data } = await api.get(`/data/${appId}/${component.collection || 'records'}`); setRows(data); }
    catch { setRows([]); }
    finally { setLoading(false); }
  };

  const deleteRow = async (id: number) => {
    await api.delete(`/data/${appId}/${component.collection}/${id}`);
    toast.success('Deleted');
    fetchData();
  };

  const handleCSV = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImporting(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const { data } = await api.post(`/data/${appId}/${component.collection}/import-csv`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success(`Imported ${data.imported} records!`);
      fetchData();
    } catch { toast.error('CSV import failed'); }
    finally { setImporting(false); e.target.value = ''; }
  };

  const cols = columns.length > 0 ? columns : Object.keys(rows[0]?.data || {});

  return (
    <div style={{ background: '#111118', border: '1px solid #2a2a3a', borderRadius: '16px', padding: '1.5rem', marginBottom: '1.5rem', overflowX: 'auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
        {component.title && <h3 style={{ fontWeight: '700', color: 'white' }}>{component.title}</h3>}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>{rows.length} records</span>
          <button onClick={fetchData} style={{ background: 'none', border: 'none', color: '#6b7280', cursor: 'pointer' }}><RefreshCw size={14} /></button>
          <label style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(99,102,241,0.15)', color: '#818cf8', border: '1px solid rgba(99,102,241,0.3)', borderRadius: '8px', padding: '6px 12px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: '600' }}>
            {importing ? 'Importing...' : '📥 Import CSV'}
            <input type="file" accept=".csv" onChange={handleCSV} style={{ display: 'none' }} disabled={importing} />
          </label>
        </div>
      </div>
      {loading ? (
        <div style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}>Loading...</div>
      ) : rows.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}>
          No records yet in <strong>{component.collection}</strong>
          <p style={{ fontSize: '0.8rem', marginTop: '0.5rem' }}>Use the form above or import a CSV</p>
        </div>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #2a2a3a' }}>
              {cols.map((c: string) => <th key={c} style={{ textAlign: 'left', padding: '0.6rem 1rem', color: '#6b7280', fontWeight: '600', fontSize: '0.8rem', textTransform: 'uppercase' }}>{c}</th>)}
              <th style={{ textAlign: 'left', padding: '0.6rem 1rem', color: '#6b7280', fontWeight: '600', fontSize: '0.8rem' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row: any) => (
              <tr key={row.id} style={{ borderBottom: '1px solid rgba(42,42,58,0.5)' }}
                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(99,102,241,0.05)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                {cols.map((c: string) => <td key={c} style={{ padding: '0.8rem 1rem', color: 'white' }}>{row.data?.[c] ?? '—'}</td>)}
                <td style={{ padding: '0.8rem 1rem' }}>
                  <button onClick={() => deleteRow(row.id)} style={{ background: 'none', border: 'none', color: '#6b7280', cursor: 'pointer' }}
                    onMouseEnter={e => (e.currentTarget.style.color = '#ef4444')}
                    onMouseLeave={e => (e.currentTarget.style.color = '#6b7280')}>
                    <Trash2 size={13} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default function AppPage() {
  const { loading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const appId = params.id as string;
  const [app, setApp] = useState<any>(null);
  const [activePage, setActivePage] = useState(0);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => { if (!loading) fetchApp(); }, [loading]);

  const fetchApp = async () => {
    try { const { data } = await api.get(`/apps/${appId}`); setApp(data); }
    catch { toast.error('App not found'); router.push('/dashboard'); }
  };

  if (!app) return (
    <div style={{ minHeight: '100vh', background: '#0a0a0f', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: '36px', height: '36px', border: '3px solid #2a2a3a', borderTop: '3px solid #6366f1', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 1rem' }} />
        <p style={{ color: '#6b7280' }}>Loading...</p>
      </div>
    </div>
  );

  const pages = app.config?.pages || [];
  const currentPage = pages[activePage] || {};
  const components = currentPage.components || [];

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0f' }}>
      <nav style={{ background: '#111118', borderBottom: '1px solid #2a2a3a', padding: '0 1.5rem', height: '60px', display: 'flex', alignItems: 'center', gap: '1rem', position: 'sticky', top: 0, zIndex: 50 }}>
        <button onClick={() => router.push('/dashboard')} style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#6b7280', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.85rem' }}
          onMouseEnter={e => (e.currentTarget.style.color = 'white')} onMouseLeave={e => (e.currentTarget.style.color = '#6b7280')}>
          <ArrowLeft size={16} /> Back
        </button>
        <div style={{ width: '1px', height: '20px', background: '#2a2a3a' }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '28px', height: '28px', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', borderRadius: '7px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Layers size={14} color="white" />
          </div>
          <span style={{ fontWeight: '700', color: 'white' }}>{app.name}</span>
        </div>
      </nav>

      {pages.length > 1 && (
        <div style={{ borderBottom: '1px solid #2a2a3a', padding: '0 1.5rem', display: 'flex', gap: '0.25rem' }}>
          {pages.map((p: any, i: number) => (
            <button key={i} onClick={() => setActivePage(i)}
              style={{ padding: '0.75rem 1.25rem', background: 'none', border: 'none', borderBottom: `2px solid ${i === activePage ? '#6366f1' : 'transparent'}`, color: i === activePage ? '#6366f1' : '#6b7280', fontWeight: '600', cursor: 'pointer', fontSize: '0.9rem' }}>
              {p.title || `Page ${i + 1}`}
            </button>
          ))}
        </div>
      )}

      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '2rem 1.5rem' }}>
        {components.length === 0 ? (
          <div style={{ background: '#111118', border: '1px solid #2a2a3a', borderRadius: '20px', padding: '4rem', textAlign: 'center' }}>
            <p style={{ color: '#6b7280' }}>No components defined for this page.</p>
          </div>
        ) : (
          components.map((comp: any, i: number) => {
            const Comp = ComponentRegistry[comp?.type] || ComponentRegistry.unknown;
            return <Comp key={i} component={comp || {}} appId={appId} onRefresh={() => setRefreshKey(k => k + 1)} refreshKey={refreshKey} />;
          })
        )}
      </div>
    </div>
  );
}