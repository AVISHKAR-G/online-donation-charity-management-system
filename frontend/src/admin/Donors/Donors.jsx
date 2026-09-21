import { useEffect, useMemo, useRef, useState } from 'react';
import Topbar from '../../components/Topbar';
import Loader from '../../components/Loader';
import { donorService } from '../../services/donorService';
import { toast } from 'react-toastify';
import {
  Search, User, Mail, IndianRupee, ArrowLeftRight, Shield, Settings, Power,
  MessageCircle, ChevronDown, Filter, UserPlus, Eye, Pencil, Trash2,
  X, BadgeCheck, Users, ArrowUpRight, AlertTriangle, Loader2,
} from 'lucide-react';

function getInitials(name) {
  if (!name) return '';
  return name.trim().split(/\s+/).slice(0, 2).map((w) => w[0]).join('').toUpperCase();
}

const avatarColors = ['#2563eb', '#7c3aed', '#0891b2', '#16a34a', '#db2777', '#ea580c'];
function avatarColor(name) {
  let hash = 0;
  for (let i = 0; i < (name || '').length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return avatarColors[Math.abs(hash) % avatarColors.length];
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function HeartIllustration() {
  return (
    <svg width="180" height="110" viewBox="0 0 180 110" fill="none">
      <circle cx="150" cy="20" r="3" fill="#a5b4fc" opacity="0.7" />
      <circle cx="165" cy="40" r="2" fill="#a5b4fc" opacity="0.6" />
      <path d="M20 100 C10 60, 40 50, 55 60 C 65 35, 100 35, 108 60 C 125 50, 150 65, 138 100 Z" fill="#dbeafe" opacity="0.5" />
      <path d="M100 20 C90 5, 65 8, 62 28 C 60 48, 100 68, 100 68 C 100 68, 140 48, 138 28 C 135 8, 110 5, 100 20 Z" fill="#3b82f6" />
      <circle cx="100" cy="42" r="10" fill="#fff" />
      <circle cx="100" cy="38" r="4" fill="#3b82f6" />
      <path d="M93 48 C93 44, 107 44, 107 48" stroke="#3b82f6" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      <circle cx="145" cy="30" r="12" fill="#93c5fd" />
      <circle cx="145" cy="26" r="4.5" fill="#fff" />
      <path d="M138 36 C138 32, 152 32, 152 36" stroke="#fff" strokeWidth="2.5" fill="none" strokeLinecap="round" />
    </svg>
  );
}

function FilterDropdown({ icon: Icon, label, value, options, onChange, minWidth = 150 }) {
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
          background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: 10,
          padding: '10px 12px', fontSize: 13.5, color: 'var(--gray)', cursor: 'pointer',
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
          background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: 10,
          boxShadow: '0 8px 24px rgba(0,0,0,0.08)', overflow: 'hidden', maxHeight: 240, overflowY: 'auto',
        }}>
          <div
            onClick={() => { onChange(''); setOpen(false); }}
            style={{ padding: '9px 14px', fontSize: 13.5, cursor: 'pointer', color: 'var(--gray)' }}
            onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--hover-bg)')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'var(--card-bg)')}
          >
            {label}
          </div>
          {options.map((opt) => (
            <div
              key={opt}
              onClick={() => { onChange(opt); setOpen(false); }}
              style={{ padding: '9px 14px', fontSize: 13.5, cursor: 'pointer', color: 'var(--dark)' }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--hover-bg)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'var(--card-bg)')}
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
      background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: 14,
      padding: 18, display: 'flex', alignItems: 'center', gap: 14,
    }}>
      <div style={{
        width: 44, height: 44, borderRadius: 12, background: iconBg,
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
      }}>
        <Icon size={20} color={iconColor} />
      </div>
      <div>
        <div style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 500 }}>{label}</div>
        <div style={{ fontSize: 20, fontWeight: 800, margin: '2px 0 4px', color: 'var(--dark)' }}>{value}</div>
        {changeLabel && (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, fontSize: 12, color: '#16a34a', fontWeight: 600 }}>
            <ArrowUpRight size={12} /> {changeLabel}
          </span>
        )}
      </div>
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, borderBottom: '1px solid var(--border)', paddingBottom: 10 }}>
      <span style={{ color: 'var(--gray)' }}>{label}</span>
      <span style={{ fontWeight: 600, color: 'var(--dark)', textAlign: 'right' }}>{value}</span>
    </div>
  );
}

function DetailModal({ donor, onClose }) {
  if (!donor) return null;
  return (
    <div
      onClick={onClose}
      style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.4)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
    >
      <div onClick={(e) => e.stopPropagation()} style={{ background: 'var(--card-bg)', borderRadius: 16, padding: 26, width: 420, maxWidth: '100%' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
          <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: 'var(--dark)' }}>Donor Details</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
            <X size={18} color="#6b7280" />
          </button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, fontSize: 14 }}>
          <Row label="Name" value={donor.name} />
          <Row label="Email" value={donor.email} />
          <Row label="Total Donated" value={`₹${(donor.totalDonated ?? 0).toLocaleString()}`} />
          <Row label="Transactions" value={donor.totalTransactions ?? 0} />
          <Row label="Status" value={
            <span style={{ background: donor.isActive ? '#dcfce7' : '#fee2e2', color: donor.isActive ? '#16a34a' : '#dc2626', padding: '3px 10px', borderRadius: 20, fontSize: 12.5, fontWeight: 700 }}>
              {donor.isActive ? 'Active' : 'Inactive'}
            </span>
          } />
        </div>
      </div>
    </div>
  );
}

function EditModal({ donor, onClose, onSaved }) {
  const [name, setName] = useState(donor?.name || '');
  const [email, setEmail] = useState(donor?.email || '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setName(donor?.name || '');
    setEmail(donor?.email || '');
    setError('');
  }, [donor]);

  if (!donor) return null;

  const handleSave = async (e) => {
    e.preventDefault();
    const trimmedName = name.trim();
    const trimmedEmail = email.trim();

    if (!trimmedName) { setError('Name is required.'); return; }
    if (!isValidEmail(trimmedEmail)) { setError('Enter a valid email address.'); return; }

    setSaving(true);
    setError('');
    try {
      const updated = await donorService.update(donor.userId, { name: trimmedName, email: trimmedEmail });
      toast.success('Donor updated successfully.');
      onSaved(donor.userId, updated);
    } catch (err) {
      if (err?.response?.status === 409) {
        setError('That email is already in use by another donor.');
      } else {
        setError(err?.response?.data?.message || 'Failed to update donor. Please try again.');
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      onClick={saving ? undefined : onClose}
      style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.4)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
    >
      <form
        onClick={(e) => e.stopPropagation()}
        onSubmit={handleSave}
        style={{ background: 'var(--card-bg)', borderRadius: 16, padding: 26, width: 420, maxWidth: '100%' }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
          <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: 'var(--dark)' }}>Edit Donor</h3>
          <button type="button" onClick={onClose} disabled={saving} style={{ background: 'none', border: 'none', cursor: saving ? 'default' : 'pointer' }}>
            <X size={18} color="#6b7280" />
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--gray)' }}>
            Name
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={saving}
              style={{ width: '100%', marginTop: 6, padding: '10px 12px', borderRadius: 10, border: '1px solid var(--border)', fontSize: 14, boxSizing: 'border-box', background: 'var(--card-bg)', color: 'var(--dark)' }}
            />
          </label>
          <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--gray)' }}>
            Email
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={saving}
              style={{ width: '100%', marginTop: 6, padding: '10px 12px', borderRadius: 10, border: '1px solid var(--border)', fontSize: 14, boxSizing: 'border-box', background: 'var(--card-bg)', color: 'var(--dark)' }}
            />
          </label>

          {error && (
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, background: '#fef2f2', color: '#dc2626', padding: '10px 12px', borderRadius: 10, fontSize: 13 }}>
              <AlertTriangle size={15} style={{ flexShrink: 0, marginTop: 1 }} />
              <span>{error}</span>
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 6 }}>
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              style={{ padding: '10px 18px', borderRadius: 10, border: '1px solid var(--border)', background: 'var(--card-bg)', color: 'var(--gray)', fontWeight: 600, fontSize: 13.5, cursor: saving ? 'default' : 'pointer' }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '10px 18px', borderRadius: 10, border: 'none',
                background: '#2563eb', color: '#fff', fontWeight: 700, fontSize: 13.5,
                cursor: saving ? 'default' : 'pointer', opacity: saving ? 0.75 : 1,
              }}
            >
              {saving && <Loader2 size={14} className="spin" style={{ animation: 'spin 0.8s linear infinite' }} />}
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </form>
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

function DeleteConfirmModal({ donor, onClose, onDeleted }) {
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');

  if (!donor) return null;

  const handleDelete = async () => {
    setDeleting(true);
    setError('');
    try {
      await donorService.remove(donor.userId);
      toast.success(`${donor.name} has been removed.`);
      onDeleted(donor.userId);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to delete donor. Please try again.');
      setDeleting(false);
    }
  };

  return (
    <div
      onClick={deleting ? undefined : onClose}
      style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.4)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
    >
      <div onClick={(e) => e.stopPropagation()} style={{ background: 'var(--card-bg)', borderRadius: 16, padding: 26, width: 400, maxWidth: '100%' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <AlertTriangle size={20} color="#dc2626" />
          </div>
          <h3 style={{ margin: 0, fontSize: 17, fontWeight: 800, color: 'var(--dark)' }}>Delete Donor?</h3>
        </div>

        <p style={{ fontSize: 14, color: 'var(--gray)', lineHeight: 1.5, margin: '0 0 18px' }}>
          This will remove <strong>{donor.name}</strong> ({donor.email}) from the donor list.
          Their donation history will be preserved, but they'll no longer appear here or be able to sign in.
          This action can't be undone from this screen.
        </p>

        {error && (
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, background: '#fef2f2', color: '#dc2626', padding: '10px 12px', borderRadius: 10, fontSize: 13, marginBottom: 14 }}>
            <AlertTriangle size={15} style={{ flexShrink: 0, marginTop: 1 }} />
            <span>{error}</span>
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
          <button
            onClick={onClose}
            disabled={deleting}
            style={{ padding: '10px 18px', borderRadius: 10, border: '1px solid var(--border)', background: 'var(--card-bg)', color: 'var(--gray)', fontWeight: 600, fontSize: 13.5, cursor: deleting ? 'default' : 'pointer' }}
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            disabled={deleting}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '10px 18px', borderRadius: 10, border: 'none',
              background: '#dc2626', color: '#fff', fontWeight: 700, fontSize: 13.5,
              cursor: deleting ? 'default' : 'pointer', opacity: deleting ? 0.75 : 1,
            }}
          >
            {deleting && <Loader2 size={14} style={{ animation: 'spin 0.8s linear infinite' }} />}
            {deleting ? 'Deleting...' : 'Delete Donor'}
          </button>
        </div>
      </div>
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

const iconBtnStyle = (borderColor) => ({
  width: 32, height: 32, borderRadius: 8, border: `1px solid ${borderColor}`,
  background: 'var(--card-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
});

const PAGE_SIZE_OPTIONS = [10, 20, 50];

export default function Donors() {
  const [donors, setDonors] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const [viewing, setViewing] = useState(null);
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);

  const [statusFilter, setStatusFilter] = useState('');
  const [timeFilter, setTimeFilter] = useState('');
  const [minAmount, setMinAmount] = useState('');
  const [maxAmount, setMaxAmount] = useState('');

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const load = (q = '') => {
    setLoading(true);
    donorService.getAll(q).then(setDonors).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    load(search);
  };

  const handleToggle = async (id) => {
    await donorService.toggleActive(id);
    load(search);
  };

  const notImplemented = (action) => toast.info(`${action} isn't connected to the backend yet.`);

  const handleDonorUpdated = (id, updated) => {
    setDonors((prev) => prev.map((d) => (
      d.userId === id
        ? { ...d, name: updated?.name ?? d.name, email: updated?.email ?? d.email }
        : d
    )));
    setEditing(null);
  };

  const handleDonorDeleted = (id) => {
    setDonors((prev) => prev.filter((d) => d.userId !== id));
    setDeleting(null);
  };

  const timeFilterMs = { 'Last 7 days': 7, 'Last 30 days': 30, 'Last 90 days': 90 };

  const stats = useMemo(() => {
    const total = donors.length;
    const totalDonated = donors.reduce((sum, d) => sum + (d.totalDonated || 0), 0);
    const totalTransactions = donors.reduce((sum, d) => sum + (d.totalTransactions || 0), 0);
    const active = donors.filter((d) => d.isActive).length;
    const THIRTY_DAYS = 30 * 24 * 60 * 60 * 1000;
    const now = Date.now();
    const newDonors = donors.filter((d) => d.createdAt && now - new Date(d.createdAt).getTime() < THIRTY_DAYS).length;
    return { total, totalDonated, totalTransactions, active, newDonors };
  }, [donors]);

  const filtered = useMemo(() => {
    return donors.filter((d) => {
      if (statusFilter === 'Active' && !d.isActive) return false;
      if (statusFilter === 'Inactive' && d.isActive) return false;
      if (minAmount && (d.totalDonated || 0) < Number(minAmount)) return false;
      if (maxAmount && (d.totalDonated || 0) > Number(maxAmount)) return false;
      if (timeFilter && timeFilterMs[timeFilter]) {
        if (!d.createdAt) return false;
        const days = (Date.now() - new Date(d.createdAt).getTime()) / (24 * 60 * 60 * 1000);
        if (days > timeFilterMs[timeFilter]) return false;
      }
      return true;
    });
  }, [donors, statusFilter, minAmount, maxAmount, timeFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pageSafe = Math.min(page, totalPages);
  const pageItems = filtered.slice((pageSafe - 1) * pageSize, pageSafe * pageSize);

  useEffect(() => { setPage(1); }, [statusFilter, timeFilter, minAmount, maxAmount, pageSize, donors]);

  return (
    <div style={{ background: 'var(--body-bg)', minHeight: '100vh' }}>
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
              width: 56, height: 56, borderRadius: 14, background: '#2563eb',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              <Users size={26} color="#fff" />
            </div>
            <div>
              <h1 style={{ margin: 0, fontWeight: 800, color: '#111827', fontSize: 28 }}>Donors</h1>
              <p style={{ margin: '4px 0 0', color: '#6b7280', fontSize: 14 }}>
                Manage and view all your donors in one place.
              </p>
            </div>
          </div>
          <div style={{ zIndex: 0 }}>
            <HeartIllustration />
          </div>
        </div>

        {/* Stat cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 16, marginBottom: 24 }}>
          <StatCard icon={Users} iconBg="#dbeafe" iconColor="#2563eb" label="Total Donors" value={stats.total} changeLabel="18% from last month" />
          <StatCard icon={IndianRupee} iconBg="#dcfce7" iconColor="#16a34a" label="Total Donated" value={`₹${stats.totalDonated.toLocaleString()}`} changeLabel="22% from last month" />
          <StatCard icon={ArrowLeftRight} iconBg="#ede9fe" iconColor="#7c3aed" label="Total Transactions" value={stats.totalTransactions} changeLabel="15% from last month" />
          <StatCard icon={Shield} iconBg="#fef3c7" iconColor="#d97706" label="Active Donors" value={stats.active} changeLabel="12% from last month" />
          <StatCard icon={UserPlus} iconBg="#fee2e2" iconColor="#dc2626" label="New Donors" value={stats.newDonors} changeLabel="8% from last month" />
        </div>

        {/* Filter bar */}
        <form onSubmit={handleSearch} style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', marginBottom: 20 }}>
          <div style={{ position: 'relative', flex: '1 1 220px', minWidth: 220 }}>
            <Search size={15} color="#9ca3af" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or email..."
              style={{
                width: '100%', padding: '10px 12px 10px 36px', borderRadius: 10,
                border: '1px solid var(--border)', fontSize: 13.5, background: 'var(--card-bg)', color: 'var(--dark)', boxSizing: 'border-box',
              }}
            />
          </div>
          <FilterDropdown icon={Shield} label="All Status" value={statusFilter} options={['Active', 'Inactive']} onChange={setStatusFilter} />
          <FilterDropdown label="All Time" value={timeFilter} options={['Last 7 days', 'Last 30 days', 'Last 90 days']} onChange={setTimeFilter} />
          <div style={{ position: 'relative', width: 130 }}>
            <IndianRupee size={14} color="#9ca3af" style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="number" placeholder="Min Amount" value={minAmount}
              onChange={(e) => setMinAmount(e.target.value)}
              style={{ width: '100%', padding: '10px 10px 10px 28px', borderRadius: 10, border: '1px solid var(--border)', fontSize: 13.5, background: 'var(--card-bg)', color: 'var(--dark)', boxSizing: 'border-box' }}
            />
          </div>
          <div style={{ position: 'relative', width: 130 }}>
            <IndianRupee size={14} color="#9ca3af" style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="number" placeholder="Max Amount" value={maxAmount}
              onChange={(e) => setMaxAmount(e.target.value)}
              style={{ width: '100%', padding: '10px 10px 10px 28px', borderRadius: 10, border: '1px solid var(--border)', fontSize: 13.5, background: 'var(--card-bg)', color: 'var(--dark)', boxSizing: 'border-box' }}
            />
          </div>
          <button
            type="submit"
            style={{
              display: 'flex', alignItems: 'center', gap: 8, background: 'var(--card-bg)', color: '#2563eb',
              border: '1px solid #93c5fd', borderRadius: 10, padding: '10px 18px', fontWeight: 700, fontSize: 13.5, cursor: 'pointer',
            }}
          >
            <Filter size={15} /> Filter
          </button>
          <button
            type="button"
            onClick={() => notImplemented('Add Donor')}
            style={{
              display: 'flex', alignItems: 'center', gap: 8, background: '#2563eb', color: '#fff',
              border: 'none', borderRadius: 10, padding: '10px 18px', fontWeight: 700, fontSize: 13.5, cursor: 'pointer',
            }}
          >
            <UserPlus size={15} /> Add Donor
          </button>
        </form>

        {/* Table */}
        <div className="card" style={{ padding: 0, overflow: 'hidden', borderRadius: 14 }}>
          {loading ? (
            <div style={{ padding: 30 }}><Loader /></div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: 'var(--table-header-bg)', borderBottom: '1px solid var(--border)' }}>
                    {[
                      { icon: User, label: 'DONOR' },
                      { icon: Mail, label: 'EMAIL' },
                      { icon: IndianRupee, label: 'TOTAL DONATED' },
                      { icon: ArrowLeftRight, label: 'TRANSACTIONS' },
                      { icon: Shield, label: 'STATUS' },
                      { icon: Settings, label: 'ACTIONS' },
                    ].map(({ icon: Icon, label }) => (
                      <th key={label} style={{ textAlign: 'left', padding: '14px 18px', color: 'var(--gray)', fontSize: 12, fontWeight: 700, letterSpacing: 0.4, whiteSpace: 'nowrap' }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                          <Icon size={14} color="#9ca3af" /> {label}
                        </span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {pageItems.length === 0 && (
                    <tr>
                      <td colSpan={6} style={{ padding: 40, textAlign: 'center', color: '#9ca3af', fontSize: 14 }}>
                        No donors match your filters.
                      </td>
                    </tr>
                  )}
                  {pageItems.map((d, i) => (
                    <tr
                      key={d.userId}
                      style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 1 ? 'var(--row-alt-bg)' : 'var(--card-bg)' }}
                    >
                      <td style={{ padding: '14px 18px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <div
                            style={{
                              width: 34, height: 34, borderRadius: '50%',
                              background: avatarColor(d.name), color: '#fff',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              fontSize: 12.5, fontWeight: 700, flexShrink: 0,
                            }}
                          >
                            {getInitials(d.name)}
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span style={{ fontWeight: 700, color: 'var(--dark)' }}>{d.name}</span>
                            {d.isVerified && (
                              <span style={{
                                display: 'inline-flex', alignItems: 'center', gap: 3,
                                background: '#dcfce7', color: '#16a34a', padding: '2px 8px',
                                borderRadius: 20, fontSize: 11.5, fontWeight: 700,
                              }}>
                                <BadgeCheck size={11} /> Verified
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '14px 18px', color: 'var(--gray)' }}>{d.email}</td>
                      <td style={{ padding: '14px 18px', fontWeight: 700, color: '#2563eb' }}>
                        ₹{(d.totalDonated ?? 0).toLocaleString()}
                      </td>
                      <td style={{ padding: '14px 18px' }}>
                        <span style={{
                          display: 'inline-flex', alignItems: 'center', gap: 5,
                          background: '#eff6ff', color: '#2563eb', padding: '3px 10px',
                          borderRadius: 8, fontSize: 12.5, fontWeight: 700,
                        }}>
                          <User size={11} /> {d.totalTransactions ?? 0}
                        </span>
                      </td>
                      <td style={{ padding: '14px 18px' }}>
                        <span style={{
                          display: 'inline-flex', alignItems: 'center', gap: 6,
                          background: d.isActive ? '#dcfce7' : '#fee2e2',
                          color: d.isActive ? '#16a34a' : '#dc2626',
                          padding: '5px 12px', borderRadius: 20, fontSize: 13, fontWeight: 600,
                        }}>
                          <span style={{ width: 7, height: 7, borderRadius: '50%', background: d.isActive ? '#22c55e' : '#ef4444' }} />
                          {d.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td style={{ padding: '14px 18px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <button onClick={() => setViewing(d)} style={iconBtnStyle('var(--border)')} title="View">
                            <Eye size={15} color="#6b7280" />
                          </button>
                          <button onClick={() => handleToggle(d.userId)} style={iconBtnStyle(d.isActive ? '#fca5a5' : '#86efac')} title={d.isActive ? 'Deactivate' : 'Activate'}>
                            <Power size={15} color={d.isActive ? '#dc2626' : '#16a34a'} />
                          </button>
                          <button onClick={() => setEditing(d)} style={iconBtnStyle('#93c5fd')} title="Edit">
                            <Pencil size={15} color="#2563eb" />
                          </button>
                          <button onClick={() => setDeleting(d)} style={iconBtnStyle('#fca5a5')} title="Delete">
                            <Trash2 size={15} color="#dc2626" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination footer */}
          {!loading && filtered.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px', borderTop: '1px solid var(--border)', flexWrap: 'wrap', gap: 12 }}>
              <span style={{ fontSize: 13.5, color: 'var(--gray)' }}>
                Showing {(pageSafe - 1) * pageSize + 1} to {Math.min(pageSafe * pageSize, filtered.length)} of {filtered.length} donors
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                {pageSafe > 1 && (
                  <button onClick={() => setPage(1)} style={iconBtnStyle('var(--border)')}>«</button>
                )}
                {Array.from({ length: totalPages }, (_, idx) => idx + 1)
                  .filter((p) => p === 1 || p === totalPages || Math.abs(p - pageSafe) <= 1)
                  .reduce((acc, p, idx, arr) => {
                    if (idx > 0 && p - arr[idx - 1] > 1) acc.push('...');
                    acc.push(p);
                    return acc;
                  }, [])
                  .map((p, idx) =>
                    p === '...' ? (
                      <span key={`ellipsis-${idx}`} style={{ color: '#9ca3af', padding: '0 4px' }}>...</span>
                    ) : (
                      <button
                        key={p}
                        onClick={() => setPage(p)}
                        style={{
                          width: 32, height: 32, borderRadius: 8, border: '1px solid var(--border)',
                          background: p === pageSafe ? '#2563eb' : 'var(--card-bg)',
                          color: p === pageSafe ? '#fff' : 'var(--gray)',
                          fontWeight: 600, fontSize: 13, cursor: 'pointer',
                        }}
                      >
                        {p}
                      </button>
                    )
                  )}
                {pageSafe < totalPages && (
                  <button onClick={() => setPage(totalPages)} style={iconBtnStyle('var(--border)')}>»</button>
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

        <div style={{ position: 'fixed', bottom: 24, right: 24, width: 52, height: 52, borderRadius: '50%', background: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 6px 18px rgba(37,99,235,0.4)', cursor: 'pointer' }}>
          <MessageCircle size={22} color="#fff" />
        </div>

        <DetailModal donor={viewing} onClose={() => setViewing(null)} />
        <EditModal donor={editing} onClose={() => setEditing(null)} onSaved={handleDonorUpdated} />
        <DeleteConfirmModal donor={deleting} onClose={() => setDeleting(null)} onDeleted={handleDonorDeleted} />
      </div>
    </div>
  );
}