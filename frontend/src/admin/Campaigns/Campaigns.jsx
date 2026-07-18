import { useEffect, useState } from 'react';
import Sidebar from '../../components/Sidebar';
import Loader from '../../components/Loader';
import { campaignService } from '../../services/campaignService';
import { toast } from 'react-toastify';
import {
  Pencil, Trash2, GraduationCap, Building2, BookOpen, Monitor, HeartPulse,
  ShieldPlus, Ribbon, Ambulance, Soup, Utensils, ChefHat, Gift, MessageCircle,
} from 'lucide-react';

const emptyForm = { title: '', description: '', category: '', imageUrl: '', targetAmount: '', status: 0 };

/* ---------- visual helpers ---------- */

function campaignIcon(title = '') {
  const t = title.toLowerCase();
  if (t.includes('girl') || t.includes('education') && t.includes('support')) return GraduationCap;
  if (t.includes('school') && t.includes('meal')) return Utensils;
  if (t.includes('school')) return Building2;
  if (t.includes('library')) return BookOpen;
  if (t.includes('digital') || t.includes('classroom')) return Monitor;
  if (t.includes('healthcare')) return HeartPulse;
  if (t.includes('vaccin')) return ShieldPlus;
  if (t.includes('cancer')) return Ribbon;
  if (t.includes('medical van') || t.includes('ambulance')) return Ambulance;
  if (t.includes('feed') || t.includes('hunger')) return Soup;
  if (t.includes('kitchen')) return ChefHat;
  return Gift;
}

const categoryStyles = {
  Education: { bg: '#dbeafe', fg: '#1d4ed8' },
  Healthcare: { bg: '#ccfbf1', fg: '#0f766e' },
  'Food & Hunger': { bg: '#ede9fe', fg: '#7c3aed' },
};
function categoryStyle(cat) {
  return categoryStyles[cat] || { bg: '#f1f5f9', fg: '#475569' };
}

function statusPill(status) {
  const map = {
    Active: { bg: '#dcfce7', fg: '#16a34a', dot: '#22c55e' },
    Completed: { bg: '#dbeafe', fg: '#2563eb', dot: '#3b82f6' },
    PendingApproval: { bg: '#fef9c3', fg: '#ca8a04', dot: '#eab308' },
    Rejected: { bg: '#fee2e2', fg: '#dc2626', dot: '#ef4444' },
  };
  return map[status] || map.PendingApproval;
}

function DotGrid({ style }) {
  return (
    <svg width="70" height="140" viewBox="0 0 70 140" style={style}>
      {Array.from({ length: 7 }).map((_, row) =>
        Array.from({ length: 3 }).map((_, col) => (
          <circle key={`${row}-${col}`} cx={12 + col * 22} cy={12 + row * 20} r="4" fill="#93c5fd" />
        ))
      )}
    </svg>
  );
}

/* ---------- main component ---------- */

export default function AdminCampaigns() {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const load = () => campaignService.getAll().then(setCampaigns).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const openCreate = () => { setForm(emptyForm); setEditingId(null); setShowForm(true); };
  const openEdit = (c) => {
    setForm({ title: c.title, description: c.description, category: c.category || '', imageUrl: c.imageUrl || '', targetAmount: c.targetAmount, status: statusToInt(c.status) });
    setEditingId(c.campaignId);
    setShowForm(true);
  };

  function statusToInt(s) {
    return { PendingApproval: 0, Active: 1, Completed: 2, Rejected: 3 }[s] ?? 0;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await campaignService.update(editingId, { ...form, targetAmount: Number(form.targetAmount) });
        toast.success('Campaign updated');
      } else {
        await campaignService.create({ ...form, targetAmount: Number(form.targetAmount) });
        toast.success('Campaign created');
      }
      setShowForm(false);
      load();
    } catch {
      toast.error('Failed to save campaign');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this campaign?')) return;
    await campaignService.remove(id);
    toast.success('Campaign deleted');
    load();
  };

  return (
    <div style={{ display: 'flex' }}>
      <Sidebar />
      <div style={{ flex: 1, padding: 30, background: '#f8fafc', minHeight: '100vh', position: 'relative' }}>

        {/* Header banner */}
        <div
          style={{
            position: 'relative',
            overflow: 'hidden',
            borderRadius: 16,
            background: 'linear-gradient(90deg, #eef2ff 0%, #eff6ff 60%, #f5f3ff 100%)',
            padding: '20px 28px',
            marginBottom: 24,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ zIndex: 1 }}>
            <h1 style={{ margin: 0, fontWeight: 800, color: '#111827', fontSize: 30 }}>Campaigns</h1>
            <div style={{ width: 40, height: 3, borderRadius: 2, background: '#2563eb', marginTop: 8 }} />
          </div>
          <button
            className="btn btn-primary"
            style={{ zIndex: 1, display: 'flex', alignItems: 'center', gap: 6 }}
            onClick={openCreate}
          >
            + Add Campaign
          </button>
          <DotGrid style={{ position: 'absolute', left: -6, bottom: -10, opacity: 0.5, zIndex: 0 }} />
        </div>

        {showForm && (
          <div className="card" style={{ marginBottom: 20 }}>
            <h3 style={{ marginBottom: 16 }}>{editingId ? 'Edit Campaign' : 'New Campaign'}</h3>
            <form onSubmit={handleSubmit}>
              <div className="grid grid-2">
                <div className="form-group"><label>Title</label>
                  <input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
                <div className="form-group"><label>Category</label>
                  <input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} /></div>
                <div className="form-group"><label>Target Amount (₹)</label>
                  <input type="number" required value={form.targetAmount} onChange={(e) => setForm({ ...form, targetAmount: e.target.value })} /></div>
                <div className="form-group"><label>Image URL</label>
                  <input value={form.imageUrl} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })} /></div>
                {editingId && (
                  <div className="form-group"><label>Status</label>
                    <select value={form.status} onChange={(e) => setForm({ ...form, status: Number(e.target.value) })}>
                      <option value={0}>Pending Approval</option>
                      <option value={1}>Active</option>
                      <option value={2}>Completed</option>
                      <option value={3}>Rejected</option>
                    </select>
                  </div>
                )}
              </div>
              <div className="form-group"><label>Description</label>
                <textarea required rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button className="btn btn-primary">Save</button>
                <button type="button" className="btn btn-outline" onClick={() => setShowForm(false)}>Cancel</button>
              </div>
            </form>
          </div>
        )}

        {/* Table card */}
        <div className="card" style={{ padding: 0, overflow: 'hidden', borderRadius: 14 }}>
          {loading ? (
            <div style={{ padding: 30 }}><Loader /></div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: 'linear-gradient(90deg, #3b82f6, #2563eb)' }}>
                    {['TITLE', 'CATEGORY', 'TARGET', 'COLLECTED', 'STATUS', 'ACTIONS'].map((label) => (
                      <th
                        key={label}
                        style={{
                          color: '#fff', textAlign: 'left', padding: '14px 18px',
                          fontSize: 13, fontWeight: 700, letterSpacing: 0.4, whiteSpace: 'nowrap',
                        }}
                      >
                        {label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {campaigns.map((c, i) => {
                    const Icon = campaignIcon(c.title);
                    const catStyle = categoryStyle(c.category);
                    const pill = statusPill(c.status);
                    return (
                      <tr
                        key={c.campaignId}
                        style={{
                          borderBottom: '1px solid #f1f5f9',
                          background: i % 2 === 1 ? '#fafbff' : '#fff',
                        }}
                      >
                        <td style={{ padding: '14px 18px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <div
                              style={{
                                width: 34, height: 34, borderRadius: '50%', background: '#eff6ff',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                              }}
                            >
                              <Icon size={17} color="#2563eb" />
                            </div>
                            <span style={{ fontWeight: 600, color: '#111827' }}>{c.title}</span>
                          </div>
                        </td>
                        <td style={{ padding: '14px 18px' }}>
                          {c.category ? (
                            <span
                              style={{
                                background: catStyle.bg, color: catStyle.fg,
                                padding: '4px 12px', borderRadius: 20, fontSize: 13, fontWeight: 600,
                              }}
                            >
                              {c.category}
                            </span>
                          ) : '-'}
                        </td>
                        <td style={{ padding: '14px 18px', color: '#2563eb', fontWeight: 600 }}>
                          ₹{c.targetAmount.toLocaleString()}
                        </td>
                        <td style={{ padding: '14px 18px', color: '#374151' }}>
                          ₹{c.collectedAmount.toLocaleString()} ({c.percentageCompleted}%)
                        </td>
                        <td style={{ padding: '14px 18px' }}>
                          <span
                            style={{
                              display: 'inline-flex', alignItems: 'center', gap: 6,
                              background: pill.bg, color: pill.fg,
                              padding: '5px 12px', borderRadius: 20, fontSize: 13, fontWeight: 600,
                            }}
                          >
                            <span style={{ width: 7, height: 7, borderRadius: '50%', background: pill.dot }} />
                            {c.status}
                          </span>
                        </td>
                        <td style={{ padding: '14px 18px' }}>
                          <div style={{ display: 'flex', gap: 8 }}>
                            <button
                              onClick={() => openEdit(c)}
                              style={{
                                display: 'inline-flex', alignItems: 'center', gap: 6,
                                background: '#fff', color: '#2563eb', border: '1px solid #93c5fd',
                                borderRadius: 8, padding: '7px 14px', fontWeight: 600,
                                fontSize: 13, cursor: 'pointer',
                              }}
                            >
                              <Pencil size={13} /> Edit
                            </button>
                            <button
                              onClick={() => handleDelete(c.campaignId)}
                              style={{
                                display: 'inline-flex', alignItems: 'center', gap: 6,
                                background: '#fff', color: '#dc2626', border: '1px solid #fca5a5',
                                borderRadius: 8, padding: '7px 14px', fontWeight: 600,
                                fontSize: 13, cursor: 'pointer',
                              }}
                            >
                              <Trash2 size={13} /> Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Floating chat bubble */}
        <div
          style={{
            position: 'fixed', bottom: 24, right: 24,
            width: 52, height: 52, borderRadius: '50%',
            background: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 6px 18px rgba(37,99,235,0.4)', cursor: 'pointer',
          }}
        >
          <MessageCircle size={22} color="#fff" />
        </div>
      </div>
    </div>
  );
}