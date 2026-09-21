import { useEffect, useMemo, useState, useRef } from 'react';
import Topbar from '../../components/Topbar';
import Loader from '../../components/Loader';
import { donationService } from '../../services/donationService';
import { toast } from 'react-toastify';
import {
  User, Gift, IndianRupee, CreditCard, ShieldCheck, Calendar, Settings,
  CheckCircle2, Trash2, GraduationCap, Building2, BookOpen, Monitor,
  Heart, MessageCircle, Search, ChevronDown, Filter, Download, MoreVertical,
  ChevronRight,
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

function campaignIcon(title = '') {
  const t = title.toLowerCase();
  if (t.includes('girl') || t.includes('education')) return GraduationCap;
  if (t.includes('school')) return Building2;
  if (t.includes('library')) return BookOpen;
  if (t.includes('digital') || t.includes('classroom')) return Monitor;
  return Gift;
}

function UpiIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14">
      <path d="M2 1 L2 13 L12 7 Z" fill="#f97316" />
      <path d="M2 7 L2 13 L12 7 Z" fill="#16a34a" />
    </svg>
  );
}

function DonationsIllustration() {
  return (
    <svg width="220" height="130" viewBox="0 0 220 130" fill="none">
      <circle cx="180" cy="30" r="8" fill="#c7d2fe" opacity="0.7" />
      <circle cx="155" cy="15" r="5" fill="#c7d2fe" opacity="0.6" />
      <path d="M120 130 C120 95, 122 70, 108 40" stroke="#a5b4fc" strokeWidth="4" strokeLinecap="round" fill="none" />
      <ellipse cx="104" cy="46" rx="16" ry="28" transform="rotate(-25 104 46)" fill="#c7d2fe" opacity="0.8" />
      <ellipse cx="122" cy="70" rx="14" ry="24" transform="rotate(-5 122 70)" fill="#a5b4fc" opacity="0.8" />
      <path d="M160 125 C40 125, 60 90, 60 90 C 60 65, 90 55, 105 65 C 115 45, 145 45, 155 65 C 175 55, 195 70, 190 90 C 190 90, 220 125, 160 125 Z" fill="#dbeafe" opacity="0.5" />
      <path d="M60 100 C55 65, 90 55, 110 70 C 115 40, 155 40, 165 70 C 185 60, 205 80, 195 100"
        stroke="#93c5fd" strokeWidth="3" fill="none" opacity="0.6" />
      <path d="M110 15 C100 -2, 70 3, 66 28 C 62 53, 110 78, 110 78 C 110 78, 158 53, 154 28 C 150 3, 120 -2, 110 15 Z" fill="#3b82f6" />
    </svg>
  );
}

// Simple dropdown select used for filter row (Date/Campaign/Method/Status)
function FilterDropdown({ icon: Icon, label, value, options, onChange, minWidth = 170 }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function onClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
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
        <Icon size={15} color="#9ca3af" />
        <span style={{ flex: 1, textAlign: 'left', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {value || label}
        </span>
        <ChevronDown size={14} color="#9ca3af" />
      </button>
      {open && (
        <div
          style={{
            position: 'absolute', top: '110%', left: 0, right: 0, zIndex: 20,
            background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10,
            boxShadow: '0 8px 24px rgba(0,0,0,0.08)', overflow: 'hidden', maxHeight: 240, overflowY: 'auto',
          }}
        >
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

// Kebab (⋮) actions menu per row
function ActionsMenu({ donation, onApprove, onReject, onDelete, busy }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function onClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  return (
    <div ref={ref} style={{ position: 'relative', display: 'inline-block' }}>
      <button
        onClick={() => setOpen((o) => !o)}
        style={{
          width: 32, height: 32, borderRadius: 8, border: '1px solid #e5e7eb',
          background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer',
        }}
      >
        <MoreVertical size={16} color="#6b7280" />
      </button>
      {open && (
        <div
          style={{
            position: 'absolute', top: '110%', right: 0, zIndex: 20, minWidth: 170,
            background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10,
            boxShadow: '0 8px 24px rgba(0,0,0,0.1)', overflow: 'hidden',
          }}
        >
          {donation.status === 'Pending' && (
            <>
              <button
                onClick={() => { setOpen(false); onApprove(); }}
                style={menuItemStyle('#16a34a')}
              >
                <CheckCircle2 size={14} /> Approve
              </button>
              <button
                onClick={() => { setOpen(false); onReject(); }}
                style={menuItemStyle('#d97706')}
              >
                <ShieldCheck size={14} /> Reject
              </button>
            </>
          )}
          <button
            disabled={busy}
            onClick={() => { setOpen(false); onDelete(); }}
            style={menuItemStyle('#dc2626')}
          >
            <Trash2 size={14} /> {busy ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      )}
    </div>
  );
}

function menuItemStyle(color) {
  return {
    width: '100%', display: 'flex', alignItems: 'center', gap: 8,
    padding: '10px 14px', fontSize: 13.5, fontWeight: 600, color,
    background: '#fff', border: 'none', borderBottom: '1px solid #f1f5f9',
    cursor: 'pointer', textAlign: 'left',
  };
}

const PAGE_SIZE_OPTIONS = [10, 20, 50];

export default function AdminDonations() {
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);

  const [search, setSearch] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [campaignFilter, setCampaignFilter] = useState('');
  const [methodFilter, setMethodFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const load = () => donationService.getAll().then(setDonations).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const handleStatusChange = async (id, status) => {
    try {
      await donationService.updateStatus(id, status);
      toast.success(`Donation ${status.toLowerCase()}`);
      load();
    } catch {
      toast.error('Failed to update donation status');
    }
  };

  const handleDelete = async (id, donorName) => {
    if (!window.confirm(`Delete this donation from "${donorName}"? This cannot be undone.`)) return;
    setDeletingId(id);
    try {
      await donationService.remove(id);
      toast.success('Donation deleted');
      load();
    } catch {
      toast.error('Failed to delete donation');
    } finally {
      setDeletingId(null);
    }
  };

  const statusPill = (status) => {
    if (status === 'Approved' || status === 'Success')
      return { bg: '#dcfce7', fg: '#16a34a', label: 'Donated Successfully' };
    if (status === 'Rejected') return { bg: '#fee2e2', fg: '#dc2626', label: 'Rejected' };
    return { bg: '#fef9c3', fg: '#ca8a04', label: 'Pending' };
  };

  // Distinct filter option lists derived from the loaded data
  const campaignOptions = useMemo(
    () => [...new Set(donations.map((d) => d.campaignTitle).filter(Boolean))],
    [donations]
  );
  const methodOptions = useMemo(
    () => [...new Set(donations.map((d) => d.paymentMethod).filter(Boolean))],
    [donations]
  );
  const statusOptions = ['Pending', 'Approved', 'Rejected'];

  const filtered = useMemo(() => {
    return donations.filter((d) => {
      if (search) {
        const q = search.toLowerCase();
        const hit =
          d.donorName?.toLowerCase().includes(q) ||
          d.campaignTitle?.toLowerCase().includes(q);
        if (!hit) return false;
      }
      if (dateFilter) {
        const dDate = new Date(d.date).toISOString().slice(0, 10);
        if (dDate !== dateFilter) return false;
      }
      if (campaignFilter && d.campaignTitle !== campaignFilter) return false;
      if (methodFilter && d.paymentMethod !== methodFilter) return false;
      if (statusFilter && d.status !== statusFilter) return false;
      return true;
    });
  }, [donations, search, dateFilter, campaignFilter, methodFilter, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pageSafe = Math.min(page, totalPages);
  const pageItems = filtered.slice((pageSafe - 1) * pageSize, pageSafe * pageSize);

  // Reset to page 1 whenever filters change
  useEffect(() => { setPage(1); }, [search, dateFilter, campaignFilter, methodFilter, statusFilter, pageSize]);

  const handleExport = () => {
    const rows = filtered.map((d) => ({
      Donor: d.donorName,
      Campaign: d.campaignTitle,
      Amount: d.amount,
      Method: d.paymentMethod,
      Status: d.status,
      Date: new Date(d.date).toLocaleDateString(),
    }));
    const header = Object.keys(rows[0] || { Donor: '', Campaign: '', Amount: '', Method: '', Status: '', Date: '' });
    const csv = [header.join(','), ...rows.map((r) => header.map((h) => `"${r[h] ?? ''}"`).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'donations.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div style={{ background: '#f8fafc', minHeight: '100vh' }}>
      <Topbar />
      <div style={{ padding: 30, position: 'relative' }}>

        {/* Banner */}
        <div
          style={{
            position: 'relative',
            overflow: 'hidden',
            borderRadius: 16,
            background: 'linear-gradient(90deg, #eef2ff 0%, #eff6ff 60%, #f5f3ff 100%)',
            padding: '24px 28px',
            marginBottom: 24,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, zIndex: 1 }}>
            <div
              style={{
                width: 56, height: 56, borderRadius: 14, background: '#fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(37,99,235,0.15)',
              }}
            >
              <Heart size={26} color="#2563eb" fill="#2563eb" />
            </div>
            <div>
              <h1 style={{ margin: 0, fontWeight: 800, color: '#111827', fontSize: 28 }}>Donations</h1>
              <p style={{ margin: '4px 0 0', color: '#6b7280', fontSize: 14 }}>
                View and manage all donations made by donors.
              </p>
            </div>
          </div>
          <div style={{ zIndex: 0 }}>
            <DonationsIllustration />
          </div>
        </div>

        {/* Filter bar */}
        <div
          style={{
            display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap',
            marginBottom: 20,
          }}
        >
          <div style={{ position: 'relative', flex: '1 1 220px', minWidth: 220 }}>
            <Search size={15} color="#9ca3af" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search donations..."
              style={{
                width: '100%', padding: '10px 12px 10px 36px', borderRadius: 10,
                border: '1px solid #e5e7eb', fontSize: 13.5, background: '#fff', boxSizing: 'border-box',
              }}
            />
          </div>

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

          <FilterDropdown icon={Gift} label="All Campaigns" value={campaignFilter} options={campaignOptions} onChange={setCampaignFilter} />
          <FilterDropdown icon={CreditCard} label="All Methods" value={methodFilter} options={methodOptions} onChange={setMethodFilter} minWidth={150} />
          <FilterDropdown icon={ShieldCheck} label="All Status" value={statusFilter} options={statusOptions} onChange={setStatusFilter} minWidth={150} />

          <button
            style={{
              display: 'flex', alignItems: 'center', gap: 8, background: '#2563eb', color: '#fff',
              border: 'none', borderRadius: 10, padding: '10px 18px', fontWeight: 600, fontSize: 13.5, cursor: 'pointer',
            }}
          >
            <Filter size={15} /> Filter
          </button>

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
                      { icon: User, label: 'DONOR' },
                      { icon: Gift, label: 'CAMPAIGN' },
                      { icon: IndianRupee, label: 'AMOUNT' },
                      { icon: CreditCard, label: 'METHOD' },
                      { icon: ShieldCheck, label: 'STATUS' },
                      { icon: Calendar, label: 'DATE' },
                      { icon: Settings, label: 'ACTIONS' },
                    ].map(({ icon: Icon, label }) => (
                      <th
                        key={label}
                        style={{
                          color: '#6b7280', textAlign: 'left', padding: '14px 18px',
                          fontSize: 12, fontWeight: 700, letterSpacing: 0.4, whiteSpace: 'nowrap',
                        }}
                      >
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
                      <td colSpan={7} style={{ padding: 40, textAlign: 'center', color: '#9ca3af', fontSize: 14 }}>
                        No donations match your filters.
                      </td>
                    </tr>
                  )}
                  {pageItems.map((d, i) => {
                    const CampaignIcon = campaignIcon(d.campaignTitle);
                    const pill = statusPill(d.status);
                    return (
                      <tr
                        key={d.donationId}
                        style={{
                          borderBottom: '1px solid #f1f5f9',
                          background: i % 2 === 1 ? '#fafbff' : '#fff',
                        }}
                      >
                        <td style={{ padding: '14px 18px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <div
                              style={{
                                width: 32, height: 32, borderRadius: '50%',
                                background: avatarColor(d.donorName), color: '#fff',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: 12, fontWeight: 700, flexShrink: 0,
                              }}
                            >
                              {getInitials(d.donorName)}
                            </div>
                            <span style={{ color: '#2563eb', fontWeight: 500 }}>{d.donorName}</span>
                          </div>
                        </td>
                        <td style={{ padding: '14px 18px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <div style={{
                              width: 28, height: 28, borderRadius: 8, background: '#eff6ff',
                              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                            }}>
                              <CampaignIcon size={15} color="#2563eb" />
                            </div>
                            {d.campaignTitle}
                          </div>
                        </td>
                        <td style={{ padding: '14px 18px', fontWeight: 700, color: '#2563eb' }}>
                          ₹{d.amount.toLocaleString()}
                        </td>
                        <td style={{ padding: '14px 18px' }}>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: '#374151' }}>
                            <UpiIcon /> {d.paymentMethod}
                          </span>
                        </td>
                        <td style={{ padding: '14px 18px' }}>
                          <span
                            style={{
                              display: 'inline-flex', alignItems: 'center', gap: 6,
                              background: pill.bg, color: pill.fg,
                              padding: '5px 12px', borderRadius: 20, fontSize: 13, fontWeight: 600,
                            }}
                          >
                            <CheckCircle2 size={13} /> {pill.label}
                          </span>
                        </td>
                        <td style={{ padding: '14px 18px', color: '#6b7280', whiteSpace: 'nowrap' }}>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                            <Calendar size={13} color="#93c5fd" />
                            {new Date(d.date).toLocaleDateString()}
                          </span>
                        </td>
                        <td style={{ padding: '14px 18px' }}>
                          <ActionsMenu
                            donation={d}
                            busy={deletingId === d.donationId}
                            onApprove={() => handleStatusChange(d.donationId, 'Approved')}
                            onReject={() => handleStatusChange(d.donationId, 'Rejected')}
                            onDelete={() => handleDelete(d.donationId, d.donorName)}
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
            <div
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '14px 18px', borderTop: '1px solid #f1f5f9', flexWrap: 'wrap', gap: 12,
              }}
            >
              <span style={{ fontSize: 13.5, color: '#6b7280' }}>
                Showing {(pageSafe - 1) * pageSize + 1} to {Math.min(pageSafe * pageSize, filtered.length)} of {filtered.length} donations
              </span>

              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                {Array.from({ length: totalPages }, (_, idx) => idx + 1)
                  .slice(0, 5)
                  .map((p) => (
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
                icon={Settings}
                label="Per page"
                value={`${pageSize} per page`}
                options={PAGE_SIZE_OPTIONS.map((n) => `${n} per page`)}
                onChange={(v) => setPageSize(Number(v.split(' ')[0]))}
                minWidth={130}
              />
            </div>
          )}
        </div>

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