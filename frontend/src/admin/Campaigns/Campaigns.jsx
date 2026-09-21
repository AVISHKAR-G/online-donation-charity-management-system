import { useEffect, useMemo, useRef, useState } from 'react';
import Topbar from '../../components/Topbar';
import Loader from '../../components/Loader';
import { campaignService } from '../../services/campaignService';
import { toast } from 'react-toastify';
import {
  Pencil, Trash2, GraduationCap, Building2, BookOpen, Monitor, HeartPulse,
  ShieldPlus, Ribbon, Ambulance, Soup, Utensils, ChefHat, Gift, MessageCircle,
  Megaphone, Flag, Heart, Target, Search, ChevronDown, Download, Eye,
  MoreVertical, ChevronRight, ArrowUpRight,
} from 'lucide-react';

const emptyForm = { title: '', description: '', category: '', imageUrl: '', targetAmount: '', status: 0 };

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

function statusToInt(s) {
  return { PendingApproval: 0, Active: 1, Completed: 2, Rejected: 3 }[s] ?? 0;
}

function TargetIllustration() {
  return (
    <svg width="120" height="110" viewBox="0 0 120 110" fill="none">
      <circle cx="30" cy="20" r="3" fill="#a5b4fc" opacity="0.7" />
      <circle cx="15" cy="45" r="2" fill="#a5b4fc" opacity="0.6" />
      <circle cx="90" cy="20" r="2.5" fill="#a5b4fc" opacity="0.6" />
      <circle cx="75" cy="55" r="60" fill="none" stroke="#c7d2fe" strokeWidth="1.5" opacity="0.6" />
      <circle cx="75" cy="55" r="42" fill="none" stroke="#a5b4fc" strokeWidth="2" opacity="0.6" />
      <circle cx="75" cy="55" r="26" fill="none" stroke="#818cf8" strokeWidth="2.5" opacity="0.7" />
      <circle cx="75" cy="55" r="10" fill="#6366f1" opacity="0.85" />
      {[18, 30, 42, 54].map((h, i) => (
        <rect key={i} x={10 + i * 10} y={95 - h} width="6" height={h} rx="2" fill="#c7d2fe" opacity="0.5" />
      ))}
    </svg>
  );
}

// Reusable filter dropdown
function FilterDropdown({ icon: Icon, label, value, options, onChange, minWidth = 170 }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    function onClickOutside(e) { if (ref.current && !ref.current.contains(e.target)) setOpen(false); }
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);
  return (
    <div ref={ref} style={{ position: 'relative', minWidth }}>
      <button
        onClick={() => setOpen((o) => !o)}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', gap: 8,
          background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10,
          padding: '10px 12px', fontSize: 13.5, color: '#374151', cursor: 'pointer',
        }}
      >
        {Icon && <Icon size={15} color="#9ca3af" />}
        <span style={{ flex: 1, textAlign: 'left', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {value || label}
        </span>
        <ChevronDown size={14} color="#9ca3af" />
      </button>
      {open && (
        <div style={{
          position: 'absolute', top: '110%', left: 0, right: 0, zIndex: 20,
          background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10,
          boxShadow: '0 8px 24px rgba(0,0,0,0.08)', overflow: 'hidden', maxHeight: 240, overflowY: 'auto',
        }}>
          <div
            onClick={() => { onChange(''); setOpen(false); }}
            style={{ padding: '9px 14px', fontSize: 13.5, cursor: 'pointer', color: '#6b7280' }}
            onMouseEnter={(e) => (e.currentTarget.style.background = '#f8fafc')}
            onMouseLeave={(e) => (e.currentTarget.style.background = '#fff')}
          >
            {label}
          </div>
          {options.map((opt) => (
            <div
              key={opt}
              onClick={() => { onChange(opt); setOpen(false); }}
              style={{ padding: '9px 14px', fontSize: 13.5, cursor: 'pointer', color: '#111827' }}
              onMouseEnter={(e) => (e.currentTarget.style.background = '#f8fafc')}
              onMouseLeave={(e) => (e.currentTarget.style.background = '#fff')}
            >
              {opt}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function StatCard({ icon: Icon, iconBg, iconColor, label, value, changeLabel }) {
  return (
    <div style={{
      background: '#fff', border: '1px solid #eef1f6', borderRadius: 14,
      padding: 18, display: 'flex', alignItems: 'center', gap: 14,
    }}>
      <div style={{
        width: 44, height: 44, borderRadius: 12, background: iconBg,
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
      }}>
        <Icon size={20} color={iconColor} />
      </div>
      <div>
        <div style={{ fontSize: 13, color: '#8a94a6', fontWeight: 500 }}>{label}</div>
        <div style={{ fontSize: 21, fontWeight: 800, margin: '2px 0 4px' }}>{value}</div>
        {changeLabel && (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, fontSize: 12, color: '#16a34a', fontWeight: 600 }}>
            <ArrowUpRight size={12} /> {changeLabel}
          </span>
        )}
      </div>
    </div>
  );
}

function ActionsMenu({ onView, onEdit, onDelete }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    function onClickOutside(e) { if (ref.current && !ref.current.contains(e.target)) setOpen(false); }
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <button onClick={onView} style={iconBtnStyle}><Eye size={15} color="#6b7280" /></button>
      <button onClick={onEdit} style={iconBtnStyle}><Pencil size={15} color="#6b7280" /></button>
      <div ref={ref} style={{ position: 'relative' }}>
        <button onClick={() => setOpen((o) => !o)} style={iconBtnStyle}>
          <MoreVertical size={15} color="#6b7280" />
        </button>
        {open && (
          <div style={{
            position: 'absolute', top: '110%', right: 0, zIndex: 20, minWidth: 140,
            background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10,
            boxShadow: '0 8px 24px rgba(0,0,0,0.1)', overflow: 'hidden',
          }}>
            <button
              onClick={() => { setOpen(false); onDelete(); }}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: 8,
                padding: '10px 14px', fontSize: 13.5, fontWeight: 600, color: '#dc2626',
                background: '#fff', border: 'none', cursor: 'pointer', textAlign: 'left',
              }}
            >
              <Trash2 size={14} /> Delete
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

const iconBtnStyle = {
  width: 30, height: 30, borderRadius: 8, border: '1px solid #e5e7eb',
  background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
};

const PAGE_SIZE_OPTIONS = [10, 20, 50];
const SORT_OPTIONS = ['Newest First', 'Oldest First', 'Highest Raised', 'Lowest Raised'];

export default function AdminCampaigns() {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sort, setSort] = useState('Newest First');

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const load = () => campaignService.getAll().then(setCampaigns).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const openCreate = () => { setForm(emptyForm); setEditingId(null); setShowForm(true); };
  const openEdit = (c) => {
    setForm({ title: c.title, description: c.description, category: c.category || '', imageUrl: c.imageUrl || '', targetAmount: c.targetAmount, status: statusToInt(c.status) });
    setEditingId(c.campaignId);
    setShowForm(true);
  };

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

  // Stat card values, computed from loaded data
  const stats = useMemo(() => {
    const total = campaigns.length;
    const active = campaigns.filter((c) => c.status === 'Active').length;
    const totalCollected = campaigns.reduce((sum, c) => sum + (c.collectedAmount || 0), 0);
    const avgCompletion = total
      ? Math.round(campaigns.reduce((sum, c) => sum + (c.percentageCompleted || 0), 0) / total)
      : 0;
    return { total, active, totalCollected, avgCompletion };
  }, [campaigns]);

  const categoryOptions = useMemo(
    () => [...new Set(campaigns.map((c) => c.category).filter(Boolean))],
    [campaigns]
  );
  const statusOptions = ['Active', 'Completed', 'PendingApproval', 'Rejected'];

  const filtered = useMemo(() => {
    let list = campaigns.filter((c) => {
      if (search && !c.title?.toLowerCase().includes(search.toLowerCase())) return false;
      if (categoryFilter && c.category !== categoryFilter) return false;
      if (statusFilter && c.status !== statusFilter) return false;
      return true;
    });
    const byDate = (c) => new Date(c.updatedAt || c.createdAt || 0).getTime();
    if (sort === 'Newest First') list = [...list].sort((a, b) => byDate(b) - byDate(a));
    if (sort === 'Oldest First') list = [...list].sort((a, b) => byDate(a) - byDate(b));
    if (sort === 'Highest Raised') list = [...list].sort((a, b) => (b.collectedAmount || 0) - (a.collectedAmount || 0));
    if (sort === 'Lowest Raised') list = [...list].sort((a, b) => (a.collectedAmount || 0) - (b.collectedAmount || 0));
    return list;
  }, [campaigns, search, categoryFilter, statusFilter, sort]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pageSafe = Math.min(page, totalPages);
  const pageItems = filtered.slice((pageSafe - 1) * pageSize, pageSafe * pageSize);

  useEffect(() => { setPage(1); }, [search, categoryFilter, statusFilter, sort, pageSize]);

  const handleExport = () => {
    const rows = filtered.map((c) => ({
      Title: c.title, Category: c.category, Target: c.targetAmount,
      Collected: c.collectedAmount, Percent: c.percentageCompleted, Status: c.status,
    }));
    const header = Object.keys(rows[0] || { Title: '', Category: '', Target: '', Collected: '', Percent: '', Status: '' });
    const csv = [header.join(','), ...rows.map((r) => header.map((h) => `"${r[h] ?? ''}"`).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'campaigns.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div style={{ background: '#f8fafc', minHeight: '100vh' }}>
      <Topbar />
      <div style={{ padding: 30, position: 'relative' }}>

        {/* Banner */}
        <div
          style={{
            position: 'relative', overflow: 'hidden', borderRadius: 16,
            background: 'linear-gradient(90deg, #eef2ff 0%, #eff6ff 60%, #f5f3ff 100%)',
            padding: '24px 28px', marginBottom: 24,
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, zIndex: 1 }}>
            <div style={{
              width: 56, height: 56, borderRadius: 14, background: '#fff',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(37,99,235,0.15)',
            }}>
              <Megaphone size={26} color="#2563eb" />
            </div>
            <div>
              <h1 style={{ margin: 0, fontWeight: 800, color: '#111827', fontSize: 28 }}>Campaigns</h1>
              <p style={{ margin: '4px 0 0', color: '#6b7280', fontSize: 14 }}>
                Create, manage and track all your fundraising campaigns.
              </p>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 24, zIndex: 1 }}>
            <div style={{ display: 'none' }} />
            <TargetIllustration />
            <button
              onClick={openCreate}
              style={{
                display: 'flex', alignItems: 'center', gap: 8, background: '#2563eb', color: '#fff',
                border: 'none', borderRadius: 10, padding: '12px 20px', fontWeight: 700, fontSize: 14,
                cursor: 'pointer', whiteSpace: 'nowrap',
              }}
            >
              + New Campaign
            </button>
          </div>
        </div>

        {/* Stat cards */}
        <div className="grid grid-4" style={{ marginBottom: 24, gap: 18 }}>
          <StatCard icon={Gift} iconBg="#dbeafe" iconColor="#2563eb" label="Total Campaigns" value={stats.total} changeLabel="20% from last month" />
          <StatCard icon={Flag} iconBg="#dcfce7" iconColor="#16a34a" label="Active Campaigns" value={stats.active} changeLabel="12% from last month" />
          <StatCard icon={Heart} iconBg="#ede9fe" iconColor="#7c3aed" label="Total Collected" value={`₹${stats.totalCollected.toLocaleString()}`} changeLabel="18.5% from last month" />
          <StatCard icon={Target} iconBg="#fef3c7" iconColor="#d97706" label="Avg. Completion" value={`${stats.avgCompletion}%`} changeLabel="8% from last month" />
        </div>

        {/* Inline create/edit form (unchanged behavior, just kept) */}
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

        {/* Filter bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', marginBottom: 20 }}>
          <div style={{ position: 'relative', flex: '1 1 220px', minWidth: 220 }}>
            <Search size={15} color="#9ca3af" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search campaigns..."
              style={{
                width: '100%', padding: '10px 12px 10px 36px', borderRadius: 10,
                border: '1px solid #e5e7eb', fontSize: 13.5, background: '#fff', boxSizing: 'border-box',
              }}
            />
          </div>
          <FilterDropdown icon={Gift} label="All Categories" value={categoryFilter} options={categoryOptions} onChange={setCategoryFilter} />
          <FilterDropdown icon={Flag} label="All Status" value={statusFilter} options={statusOptions} onChange={setStatusFilter} minWidth={150} />
          <FilterDropdown label="Sort" value={`Sort: ${sort}`} options={SORT_OPTIONS} onChange={setSort} minWidth={190} />
          <button
            onClick={handleExport}
            style={{
              display: 'flex', alignItems: 'center', gap: 8, background: '#fff', color: '#374151',
              border: '1px solid #e5e7eb', borderRadius: 10, padding: '10px 18px', fontWeight: 600, fontSize: 13.5, cursor: 'pointer',
            }}
          >
            <Download size={15} /> Export
          </button>
        </div>

        {/* Table */}
        <div className="card" style={{ padding: 0, overflow: 'hidden', borderRadius: 14 }}>
          {loading ? (
            <div style={{ padding: 30 }}><Loader /></div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e5e7eb' }}>
                    {['CAMPAIGN', 'CATEGORY', 'TARGET', 'RAISED', 'PROGRESS', 'STATUS', 'LAST UPDATED', 'ACTIONS'].map((label) => (
                      <th
                        key={label}
                        style={{
                          color: '#6b7280', textAlign: 'left', padding: '14px 18px',
                          fontSize: 12, fontWeight: 700, letterSpacing: 0.4, whiteSpace: 'nowrap',
                        }}
                      >
                        {label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {pageItems.length === 0 && (
                    <tr>
                      <td colSpan={8} style={{ padding: 40, textAlign: 'center', color: '#9ca3af', fontSize: 14 }}>
                        No campaigns match your filters.
                      </td>
                    </tr>
                  )}
                  {pageItems.map((c, i) => {
                    const Icon = campaignIcon(c.title);
                    const catStyle = categoryStyle(c.category);
                    const pill = statusPill(c.status);
                    const lastUpdated = c.updatedAt || c.createdAt;
                    return (
                      <tr
                        key={c.campaignId}
                        style={{ borderBottom: '1px solid #f1f5f9', background: i % 2 === 1 ? '#fafbff' : '#fff' }}
                      >
                        <td style={{ padding: '14px 18px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <div style={{
                              width: 40, height: 40, borderRadius: 10, background: '#eff6ff',
                              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, overflow: 'hidden',
                            }}>
                              {c.imageUrl
                                ? <img src={c.imageUrl} alt={c.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                : <Icon size={19} color="#2563eb" />}
                            </div>
                            <div>
                              <div style={{ fontWeight: 700, color: '#111827', fontSize: 14 }}>{c.title}</div>
                              {c.description && (
                                <div style={{ fontSize: 12.5, color: '#9ca3af', maxWidth: 240, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                  {c.description}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: '14px 18px' }}>
                          {c.category ? (
                            <span style={{ background: catStyle.bg, color: catStyle.fg, padding: '4px 12px', borderRadius: 20, fontSize: 13, fontWeight: 600 }}>
                              {c.category}
                            </span>
                          ) : '-'}
                        </td>
                        <td style={{ padding: '14px 18px', color: '#374151', fontWeight: 600 }}>
                          ₹{c.targetAmount.toLocaleString()}
                        </td>
                        <td style={{ padding: '14px 18px', color: '#374151', fontWeight: 600 }}>
                          ₹{c.collectedAmount.toLocaleString()}
                        </td>
                        <td style={{ padding: '14px 18px', minWidth: 140 }}>
                          <div style={{ fontSize: 13, fontWeight: 700, color: '#111827', marginBottom: 6 }}>
                            {c.percentageCompleted}%
                          </div>
                          <div style={{ height: 6, borderRadius: 4, background: '#f1f5f9', overflow: 'hidden' }}>
                            <div style={{
                              height: '100%', width: `${Math.min(100, c.percentageCompleted)}%`,
                              background: pill.dot, borderRadius: 4,
                            }} />
                          </div>
                        </td>
                        <td style={{ padding: '14px 18px' }}>
                          <span style={{
                            display: 'inline-flex', alignItems: 'center', gap: 6,
                            background: pill.bg, color: pill.fg,
                            padding: '5px 12px', borderRadius: 20, fontSize: 13, fontWeight: 600,
                          }}>
                            <span style={{ width: 7, height: 7, borderRadius: '50%', background: pill.dot }} />
                            {c.status}
                          </span>
                        </td>
                        <td style={{ padding: '14px 18px', color: '#6b7280', whiteSpace: 'nowrap' }}>
                          {lastUpdated ? new Date(lastUpdated).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '-'}
                        </td>
                        <td style={{ padding: '14px 18px' }}>
                          <ActionsMenu
                            onView={() => openEdit(c)}
                            onEdit={() => openEdit(c)}
                            onDelete={() => handleDelete(c.campaignId)}
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination footer */}
          {!loading && filtered.length > 0 && (
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '14px 18px', borderTop: '1px solid #f1f5f9', flexWrap: 'wrap', gap: 12,
            }}>
              <span style={{ fontSize: 13.5, color: '#6b7280' }}>
                Showing {(pageSafe - 1) * pageSize + 1} to {Math.min(pageSafe * pageSize, filtered.length)} of {filtered.length} campaigns
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                {Array.from({ length: totalPages }, (_, idx) => idx + 1).slice(0, 5).map((p) => (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    style={{
                      width: 32, height: 32, borderRadius: 8, border: '1px solid #e5e7eb',
                      background: p === pageSafe ? '#2563eb' : '#fff',
                      color: p === pageSafe ? '#fff' : '#374151',
                      fontWeight: 600, fontSize: 13, cursor: 'pointer',
                    }}
                  >
                    {p}
                  </button>
                ))}
                {totalPages > 5 && (
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    style={{
                      width: 32, height: 32, borderRadius: 8, border: '1px solid #e5e7eb',
                      background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                    }}
                  >
                    <ChevronRight size={15} color="#374151" />
                  </button>
                )}
              </div>
              <FilterDropdown
                label="Per page"
                value={`${pageSize} per page`}
                options={PAGE_SIZE_OPTIONS.map((n) => `${n} per page`)}
                onChange={(v) => setPageSize(Number(v.split(' ')[0]))}
                minWidth={130}
              />
            </div>
          )}
        </div>

        <div style={{
          position: 'fixed', bottom: 24, right: 24,
          width: 52, height: 52, borderRadius: '50%',
          background: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 6px 18px rgba(37,99,235,0.4)', cursor: 'pointer',
        }}>
          <MessageCircle size={22} color="#fff" />
        </div>
      </div>
    </div>
  );
}