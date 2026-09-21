import { useEffect, useMemo, useRef, useState } from 'react';
import Topbar from '../../components/Topbar';
import Loader from '../../components/Loader';
import { assistanceApplicationService } from '../../services/assistanceApplicationService';
import { campaignService } from '../../services/campaignService';
import { API_ORIGIN } from '../../services/api';
import {
  User, Tag, IndianRupee, FileText, Flag, Settings,
  HeartPulse, GraduationCap, Utensils, HelpCircle,
  XCircle, CheckCircle2, MessageCircle, ClipboardCheck, Clock, ShieldCheck,
  Wallet, Search, ChevronDown, Download, Eye, MoreVertical, ChevronRight,
  ArrowUpRight, X, Phone,
} from 'lucide-react';

const STATUS = { Pending: 0, UnderVerification: 1, Approved: 2, Rejected: 3, FundAllocated: 4 };
const REGIONS = [
  { value: 0, label: 'North' },
  { value: 1, label: 'South' },
  { value: 2, label: 'East' },
  { value: 3, label: 'West' },
  { value: 4, label: 'Central' },
];

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

function typeIcon(type = '') {
  const t = type.toLowerCase();
  if (t.includes('medical')) return HeartPulse;
  if (t.includes('education')) return GraduationCap;
  if (t.includes('food')) return Utensils;
  return HelpCircle;
}

function typeStyle(type = '') {
  const t = type.toLowerCase();
  if (t.includes('medical')) return { bg: '#dbeafe', fg: '#1d4ed8' };
  if (t.includes('food')) return { bg: '#dcfce7', fg: '#16a34a' };
  if (t.includes('education')) return { bg: '#ede9fe', fg: '#7c3aed' };
  return { bg: '#f1f5f9', fg: '#475569' };
}

function statusStyle(status) {
  const map = {
    Pending: { bg: '#fef9c3', fg: '#ca8a04' },
    UnderVerification: { bg: '#dbeafe', fg: '#2563eb' },
    Approved: { bg: '#dcfce7', fg: '#16a34a' },
    Rejected: { bg: '#fee2e2', fg: '#dc2626' },
    FundAllocated: { bg: '#ede9fe', fg: '#7c3aed' },
  };
  return map[status] || { bg: '#f1f5f9', fg: '#475569' };
}

function ClipboardIllustration() {
  return (
    <svg width="100" height="120" viewBox="0 0 100 120" fill="none">
      <circle cx="15" cy="15" r="3" fill="#c7d2fe" opacity="0.7" />
      <circle cx="30" cy="8" r="2" fill="#c7d2fe" opacity="0.6" />
      <circle cx="8" cy="35" r="2" fill="#c7d2fe" opacity="0.6" />
      <rect x="20" y="10" width="55" height="95" rx="8" fill="#eff6ff" stroke="#93c5fd" strokeWidth="2" />
      <rect x="35" y="4" width="25" height="14" rx="4" fill="#3b82f6" />
      <rect x="30" y="30" width="45" height="6" rx="3" fill="#bfdbfe" />
      <rect x="30" y="44" width="35" height="6" rx="3" fill="#bfdbfe" />
      <rect x="30" y="58" width="40" height="6" rx="3" fill="#bfdbfe" />
      <circle cx="78" cy="90" r="16" fill="#2563eb" />
      <path d="M70 90 L76 96 L88 82" stroke="#fff" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  );
}

// Reusable filter dropdown
function FilterDropdown({ icon: Icon, label, value, options, onChange, minWidth = 160 }) {
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

function StatCard({ icon: Icon, iconBg, iconColor, label, value, changeLabel, changeUp = true }) {
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
        <div style={{ fontSize: 20, fontWeight: 800, margin: '2px 0 4px' }}>{value}</div>
        {changeLabel && (
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 3, fontSize: 12, fontWeight: 600,
            color: changeUp ? '#16a34a' : '#dc2626',
          }}>
            <ArrowUpRight size={12} style={{ transform: changeUp ? 'none' : 'rotate(90deg)' }} /> {changeLabel}
          </span>
        )}
      </div>
    </div>
  );
}

// Kebab menu with the real status-changing actions, contextual to current status
function ActionsMenu({ app, onStartVerification, onApprove, onReject, onOpenAllocate }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    function onClickOutside(e) { if (ref.current && !ref.current.contains(e.target)) setOpen(false); }
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  const items = [];
  if (app.status === 'Pending') {
    items.push({ label: 'Start Verification', color: '#2563eb', icon: ClipboardCheck, onClick: onStartVerification });
  }
  if (app.status === 'Pending' || app.status === 'UnderVerification') {
    items.push({ label: 'Approve', color: '#16a34a', icon: CheckCircle2, onClick: onApprove });
    items.push({ label: 'Reject', color: '#dc2626', icon: XCircle, onClick: onReject });
  }
  if (app.status === 'Approved') {
    items.push({ label: 'Allocate Funds', color: '#2563eb', icon: Wallet, onClick: onOpenAllocate });
  }

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen((o) => !o)}
        disabled={items.length === 0}
        style={{
          width: 32, height: 32, borderRadius: 8, border: '1px solid #e5e7eb',
          background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: items.length ? 'pointer' : 'not-allowed', opacity: items.length ? 1 : 0.4,
        }}
      >
        <MoreVertical size={16} color="#6b7280" />
      </button>
      {open && items.length > 0 && (
        <div style={{
          position: 'absolute', top: '110%', right: 0, zIndex: 20, minWidth: 190,
          background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10,
          boxShadow: '0 8px 24px rgba(0,0,0,0.1)', overflow: 'hidden',
        }}>
          {items.map((it) => {
            const Icon = it.icon;
            return (
              <button
                key={it.label}
                onClick={() => { setOpen(false); it.onClick(); }}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', gap: 8,
                  padding: '10px 14px', fontSize: 13.5, fontWeight: 600, color: it.color,
                  background: '#fff', border: 'none', borderBottom: '1px solid #f1f5f9',
                  cursor: 'pointer', textAlign: 'left',
                }}
              >
                <Icon size={14} /> {it.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// Read-only detail modal for the eye icon
function ViewModal({ app, onClose }) {
  if (!app) return null;
  const st = statusStyle(app.status);
  const docUrl = app.documentPath ? API_ORIGIN + app.documentPath : null;
  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.4)', zIndex: 50,
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{ background: '#fff', borderRadius: 16, padding: 26, width: 440, maxWidth: '100%' }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
          <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800 }}>Application Details</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
            <X size={18} color="#6b7280" />
          </button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, fontSize: 14 }}>
          <Row label="Applicant" value={app.fullName} />
          <Row label="Email" value={app.email} />
          <Row label="Phone" value={app.phone} />
          <Row label="Type" value={app.type} />
          <Row label="Amount Requested" value={`₹${app.amountRequired.toLocaleString()}`} />
          <Row label="Status" value={
            <span style={{ background: st.bg, color: st.fg, padding: '3px 10px', borderRadius: 20, fontSize: 12.5, fontWeight: 700 }}>
              {app.status}
            </span>
          } />
          {app.appliedOn && <Row label="Applied On" value={new Date(app.appliedOn).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })} />}
          <Row label="Document" value={
            docUrl
              ? <a href={docUrl} target="_blank" rel="noreferrer" style={{ color: '#2563eb', fontWeight: 600 }}>View Document</a>
              : <span style={{ color: '#9ca3af' }}>None</span>
          } />
        </div>
      </div>
    </div>
  );
}
function Row({ label, value }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, borderBottom: '1px solid #f1f5f9', paddingBottom: 10 }}>
      <span style={{ color: '#6b7280' }}>{label}</span>
      <span style={{ fontWeight: 600, color: '#111827', textAlign: 'right' }}>{value}</span>
    </div>
  );
}

const PAGE_SIZE_OPTIONS = [10, 20, 50];

export default function Beneficiaries() {
  const [applications, setApplications] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [allocating, setAllocating] = useState(null);
  const [allocateForm, setAllocateForm] = useState({ campaignId: '', allocatedAmount: '', region: 0 });
  const [viewing, setViewing] = useState(null);

  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  function load() {
    setLoading(true);
    Promise.all([
      assistanceApplicationService.getAll(),
      campaignService.getAll(),
    ]).then(function (results) {
      setApplications(results[0]);
      setCampaigns(results[1]);
    }).finally(function () {
      setLoading(false);
    });
  }

  useEffect(function () { load(); }, []);

  async function handleStatusChange(id, status) {
    await assistanceApplicationService.updateStatus(id, status);
    load();
  }

  function openAllocate(id, requestedAmount) {
    setAllocating(id);
    setAllocateForm({ campaignId: '', allocatedAmount: requestedAmount, region: 0 });
  }

  async function submitAllocate(id) {
    if (!allocateForm.campaignId || !allocateForm.allocatedAmount) return;
    await assistanceApplicationService.allocateFunds(
      id,
      allocateForm.campaignId,
      allocateForm.allocatedAmount,
      allocateForm.region
    );
    setAllocating(null);
    load();
  }

  // Stat cards, computed from loaded applications
  const stats = useMemo(() => {
    const total = applications.length;
    const pendingReview = applications.filter((a) => a.status === 'Pending' || a.status === 'UnderVerification').length;
    const approved = applications.filter((a) => a.status === 'Approved' || a.status === 'FundAllocated').length;
    const rejected = applications.filter((a) => a.status === 'Rejected').length;
    // Note: sums amountRequired for FundAllocated apps as a proxy — the actual
    // allocated amount isn't returned back on the application object here.
    const fundAllocated = applications
      .filter((a) => a.status === 'FundAllocated')
      .reduce((sum, a) => sum + (a.amountRequired || 0), 0);
    return { total, pendingReview, approved, rejected, fundAllocated };
  }, [applications]);

  const typeOptions = useMemo(() => [...new Set(applications.map((a) => a.type).filter(Boolean))], [applications]);
  const statusOptions = ['Pending', 'UnderVerification', 'Approved', 'Rejected', 'FundAllocated'];

  const filtered = useMemo(() => {
    return applications.filter((a) => {
      if (search) {
        const q = search.toLowerCase();
        const hit = a.fullName?.toLowerCase().includes(q) || a.email?.toLowerCase().includes(q);
        if (!hit) return false;
      }
      if (typeFilter && a.type !== typeFilter) return false;
      if (statusFilter && a.status !== statusFilter) return false;
      if (dateFilter && a.appliedOn) {
        const aDate = new Date(a.appliedOn).toISOString().slice(0, 10);
        if (aDate !== dateFilter) return false;
      }
      return true;
    });
  }, [applications, search, typeFilter, statusFilter, dateFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pageSafe = Math.min(page, totalPages);
  const pageItems = filtered.slice((pageSafe - 1) * pageSize, pageSafe * pageSize);

  useEffect(() => { setPage(1); }, [search, typeFilter, statusFilter, dateFilter, pageSize]);

  const handleExport = () => {
    const rows = filtered.map((a) => ({
      Applicant: a.fullName, Email: a.email, Type: a.type,
      AmountRequested: a.amountRequired, Status: a.status,
      AppliedOn: a.appliedOn ? new Date(a.appliedOn).toLocaleDateString() : '',
    }));
    const header = Object.keys(rows[0] || { Applicant: '', Email: '', Type: '', AmountRequested: '', Status: '', AppliedOn: '' });
    const csv = [header.join(','), ...rows.map((r) => header.map((h) => `"${r[h] ?? ''}"`).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'beneficiary-applications.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  function renderDocumentCell(a) {
    var docUrl = a.documentPath ? API_ORIGIN + a.documentPath : null;
    if (!docUrl) {
      return <span style={{ color: '#9ca3af', fontSize: 13 }}>None</span>;
    }
    var linkStyle = {
      display: 'inline-flex', alignItems: 'center', gap: 6,
      background: '#eff6ff', color: '#2563eb', border: '1px solid #bfdbfe',
      borderRadius: 8, padding: '6px 12px', fontSize: 13, fontWeight: 600, textDecoration: 'none',
    };
    return (
      <a href={docUrl} target="_blank" rel="noreferrer" style={linkStyle}>
        <FileText size={13} /> View Document
      </a>
    );
  }

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
              <ClipboardCheck size={26} color="#2563eb" />
            </div>
            <div>
              <h1 style={{ margin: 0, fontWeight: 800, color: '#111827', fontSize: 28 }}>Beneficiary Applications</h1>
              <p style={{ margin: '4px 0 0', color: '#6b7280', fontSize: 14 }}>
                Review and manage all beneficiary applications with ease.
              </p>
            </div>
          </div>
          <div style={{ zIndex: 0 }}>
            <ClipboardIllustration />
          </div>
        </div>

        {/* Stat cards */}
        <div className="grid grid-5" style={{ marginBottom: 24, gap: 16, display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)' }}>
          <StatCard icon={FileText} iconBg="#dbeafe" iconColor="#2563eb" label="Total Applications" value={stats.total} changeLabel="25% from last month" />
          <StatCard icon={Clock} iconBg="#fef3c7" iconColor="#d97706" label="Pending Review" value={stats.pendingReview} changeLabel="10% from last month" />
          <StatCard icon={ShieldCheck} iconBg="#ede9fe" iconColor="#7c3aed" label="Approved" value={stats.approved} changeLabel="18% from last month" />
          <StatCard icon={XCircle} iconBg="#fee2e2" iconColor="#dc2626" label="Rejected" value={stats.rejected} changeLabel="5% from last month" changeUp={false} />
          <StatCard icon={Wallet} iconBg="#dcfce7" iconColor="#16a34a" label="Fund Allocated" value={`₹${stats.fundAllocated.toLocaleString()}`} changeLabel="22% from last month" />
        </div>

        {/* Filter bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', marginBottom: 20 }}>
          <div style={{ position: 'relative', flex: '1 1 200px', minWidth: 200 }}>
            <Search size={15} color="#9ca3af" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search applications..."
              style={{
                width: '100%', padding: '10px 12px 10px 36px', borderRadius: 10,
                border: '1px solid #e5e7eb', fontSize: 13.5, background: '#fff', boxSizing: 'border-box',
              }}
            />
          </div>
          <FilterDropdown icon={Tag} label="All Types" value={typeFilter} options={typeOptions} onChange={setTypeFilter} />
          <FilterDropdown icon={Flag} label="All Status" value={statusFilter} options={statusOptions} onChange={setStatusFilter} />
          <div style={{ position: 'relative' }}>
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              style={{
                padding: '10px 12px', borderRadius: 10, border: '1px solid #e5e7eb',
                fontSize: 13.5, color: dateFilter ? '#111827' : '#9ca3af', background: '#fff',
              }}
            />
          </div>
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
                    {[
                      { icon: User, label: 'APPLICANT' },
                      { icon: Tag, label: 'TYPE' },
                      { icon: IndianRupee, label: 'AMOUNT REQUESTED' },
                      { icon: FileText, label: 'DOCUMENT' },
                      { icon: Flag, label: 'STATUS' },
                      { icon: null, label: 'APPLIED ON' },
                      { icon: Settings, label: 'ACTIONS' },
                    ].map(({ icon: Icon, label }) => (
                      <th key={label} style={{ textAlign: 'left', padding: '14px 18px', color: '#6b7280', fontSize: 12, fontWeight: 700, letterSpacing: 0.4, whiteSpace: 'nowrap' }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                          {Icon && <Icon size={14} color="#9ca3af" />} {label}
                        </span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {pageItems.length === 0 && (
                    <tr>
                      <td colSpan={7} style={{ padding: 40, textAlign: 'center', color: '#9ca3af', fontSize: 14 }}>
                        No applications match your filters.
                      </td>
                    </tr>
                  )}
                  {pageItems.map(function (a, i) {
                    var TypeIcon = typeIcon(a.type);
                    var st = statusStyle(a.status);
                    var rowStyle = { borderBottom: '1px solid #f1f5f9', background: i % 2 === 1 ? '#fafbff' : '#fff' };
                    return (
                      <tr key={a.applicationId} style={rowStyle}>
                        <td style={{ padding: '14px 18px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <div
                              style={{
                                width: 36, height: 36, borderRadius: '50%',
                                background: avatarColor(a.fullName), color: '#fff',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: 13, fontWeight: 700, flexShrink: 0,
                              }}
                            >
                              {getInitials(a.fullName)}
                            </div>
                            <div>
                              <div style={{ fontWeight: 700, color: '#111827' }}>{a.fullName}</div>
                              <div style={{ fontSize: 12, color: '#6b7280' }}>{a.email}</div>
                              {a.phone && (
                                <div style={{ fontSize: 12, color: '#9ca3af', display: 'flex', alignItems: 'center', gap: 4 }}>
                                  <Phone size={11} /> {a.phone}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: '14px 18px' }}>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: typeStyle(a.type).bg, color: typeStyle(a.type).fg, padding: '4px 12px', borderRadius: 20, fontSize: 13, fontWeight: 600 }}>
                            <TypeIcon size={13} /> {a.type}
                          </span>
                        </td>
                        <td style={{ padding: '14px 18px', fontWeight: 600, color: '#111827' }}>
                          ₹{a.amountRequired.toLocaleString()}
                        </td>
                        <td style={{ padding: '14px 18px' }}>
                          {renderDocumentCell(a)}
                        </td>
                        <td style={{ padding: '14px 18px' }}>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: st.bg, color: st.fg, padding: '5px 12px', borderRadius: 20, fontSize: 13, fontWeight: 600 }}>
                            {a.status === 'Rejected' ? <XCircle size={13} /> : null}
                            {a.status === 'FundAllocated' ? <CheckCircle2 size={13} /> : null}
                            {a.status === 'Pending' ? <Clock size={13} /> : null}
                            {a.status}
                          </span>
                        </td>
                        <td style={{ padding: '14px 18px', color: '#6b7280', whiteSpace: 'nowrap' }}>
                          {a.appliedOn ? new Date(a.appliedOn).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '-'}
                        </td>
                        <td style={{ padding: '14px 18px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <button
                              onClick={() => setViewing(a)}
                              style={{ width: 30, height: 30, borderRadius: 8, border: '1px solid #e5e7eb', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                            >
                              <Eye size={15} color="#6b7280" />
                            </button>
                            <ActionsMenu
                              app={a}
                              onStartVerification={() => handleStatusChange(a.applicationId, STATUS.UnderVerification)}
                              onApprove={() => handleStatusChange(a.applicationId, STATUS.Approved)}
                              onReject={() => handleStatusChange(a.applicationId, STATUS.Rejected)}
                              onOpenAllocate={() => openAllocate(a.applicationId, a.amountRequired)}
                            />
                          </div>
                          {allocating === a.applicationId && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 10, minWidth: 200 }}>
                              <select value={allocateForm.campaignId} onChange={(e) => setAllocateForm({ ...allocateForm, campaignId: e.target.value })}>
                                <option value="">Select campaign</option>
                                {campaigns.map((c) => <option key={c.campaignId} value={c.campaignId}>{c.title}</option>)}
                              </select>
                              <select value={allocateForm.region} onChange={(e) => setAllocateForm({ ...allocateForm, region: Number(e.target.value) })}>
                                {REGIONS.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
                              </select>
                              <input
                                type="number" min="1" placeholder="Amount"
                                value={allocateForm.allocatedAmount}
                                onChange={(e) => setAllocateForm({ ...allocateForm, allocatedAmount: e.target.value })}
                              />
                              <div style={{ display: 'flex', gap: 6 }}>
                                <button className="btn btn-sm btn-success" onClick={() => submitAllocate(a.applicationId)}>Confirm</button>
                                <button className="btn btn-sm" onClick={() => setAllocating(null)}>Cancel</button>
                              </div>
                            </div>
                          )}
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
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px', borderTop: '1px solid #f1f5f9', flexWrap: 'wrap', gap: 12 }}>
              <span style={{ fontSize: 13.5, color: '#6b7280' }}>
                Showing {(pageSafe - 1) * pageSize + 1} to {Math.min(pageSafe * pageSize, filtered.length)} of {filtered.length} applications
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
                    style={{ width: 32, height: 32, borderRadius: 8, border: '1px solid #e5e7eb', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
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

        <div style={{ position: 'fixed', bottom: 24, right: 24, width: 52, height: 52, borderRadius: '50%', background: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 6px 18px rgba(37,99,235,0.4)', cursor: 'pointer' }}>
          <MessageCircle size={22} color="#fff" />
        </div>

        <ViewModal app={viewing} onClose={() => setViewing(null)} />
      </div>
    </div>
  );
}