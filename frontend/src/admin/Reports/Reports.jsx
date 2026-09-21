import { useEffect, useMemo, useRef, useState } from 'react';
import Topbar from '../../components/Topbar';
import Loader from '../../components/Loader';
import { reportService } from '../../services/reportService';
import { toast } from 'react-toastify';
import {
  BarChart3, BookOpen, Building2, Monitor, HeartPulse, Heart,
  Target, IndianRupee, PieChart, Shield, MessageCircle, Ribbon,
  Syringe, Truck, Utensils, Package, Snowflake, Waves, Award,
  ChevronDown, Calendar, Filter, MoreVertical, FileText, X,
} from 'lucide-react';

function typeIcon(title = '') {
  const t = title.toLowerCase();
  if (t.includes('librar')) return BookOpen;
  if (t.includes('school meal')) return Package;
  if (t.includes('school')) return Building2;
  if (t.includes('digital') || t.includes('classroom')) return Monitor;
  if (t.includes('healthcare') || t.includes('medical van')) return Truck;
  if (t.includes('health')) return HeartPulse;
  if (t.includes('girl')) return BookOpen;
  if (t.includes('cancer')) return Ribbon;
  if (t.includes('vaccin')) return Syringe;
  if (t.includes('feed') || t.includes('kitchen')) return Utensils;
  if (t.includes('winter')) return Snowflake;
  if (t.includes('flood')) return Waves;
  if (t.includes('earthquake')) return Building2;
  if (t.includes('cancer') || t.includes('support fund')) return Award;
  return Target;
}

const iconPalette = [
  { bg: '#dbeafe', fg: '#2563eb' },
  { bg: '#dcfce7', fg: '#16a34a' },
  { bg: '#ede9fe', fg: '#7c3aed' },
  { bg: '#cffafe', fg: '#0891b2' },
  { bg: '#fce7f3', fg: '#db2777' },
  { bg: '#fef3c7', fg: '#d97706' },
];
function iconColors(title = '') {
  let hash = 0;
  for (let i = 0; i < title.length; i++) hash = title.charCodeAt(i) + ((hash << 5) - hash);
  return iconPalette[Math.abs(hash) % iconPalette.length];
}

function isCompleted(status = '') {
  return status.toLowerCase() === 'completed';
}

function statusStyle(status) {
  if (isCompleted(status)) return { bg: '#dcfce7', fg: '#16a34a', dot: '#16a34a' };
  return { bg: '#dcfce7', fg: '#16a34a', dot: '#16a34a' };
}

function progressColor(pct, completed) {
  if (completed || pct >= 100) return '#16a34a';
  if (pct >= 50) return '#2563eb';
  if (pct >= 10) return '#f59e0b';
  if (pct > 0) return '#dc2626';
  return '#cbd5e1';
}

function progressBg(color) {
  return color + '22';
}

function ComputerIllustration() {
  return (
    <svg width="150" height="100" viewBox="0 0 150 100" fill="none">
      <circle cx="20" cy="15" r="3" fill="#a5b4fc" opacity="0.6" />
      <circle cx="10" cy="35" r="2" fill="#a5b4fc" opacity="0.5" />
      <rect x="45" y="10" width="95" height="65" rx="8" fill="#eff6ff" stroke="#93c5fd" strokeWidth="1.5" />
      <rect x="55" y="20" width="75" height="40" rx="4" fill="#fff" />
      <polyline points="60,52 72,36 82,44 94,26 106,34 122,24" fill="none" stroke="#2563eb" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="115" cy="30" r="10" fill="none" stroke="#93c5fd" strokeWidth="2.5" />
      <circle cx="115" cy="30" r="4" fill="#2563eb" />
      <circle cx="118" cy="17" r="2" fill="#c7d2fe" />
      <circle cx="126" cy="14" r="1.5" fill="#c7d2fe" />
    </svg>
  );
}

function DetailRow({ label, value }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, borderBottom: '1px solid var(--border)', paddingBottom: 10 }}>
      <span style={{ color: 'var(--gray)' }}>{label}</span>
      <span style={{ fontWeight: 600, color: 'var(--dark)', textAlign: 'right' }}>{value}</span>
    </div>
  );
}

function CampaignDetailModal({ campaign, onClose }) {
  if (!campaign) return null;
  const TypeIcon = typeIcon(campaign.title);
  const colors = iconColors(campaign.title);
  const pct = Math.min(campaign.percentageCompleted, 100);
  const barColor = progressColor(pct, isCompleted(campaign.status));

  return (
    <div
      onClick={onClose}
      style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.4)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
    >
      <div onClick={(e) => e.stopPropagation()} style={{ background: 'var(--card-bg)', borderRadius: 16, padding: 26, width: 440, maxWidth: '100%' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 42, height: 42, borderRadius: 10, background: colors.bg,
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              <TypeIcon size={20} color={colors.fg} />
            </div>
            <h3 style={{ margin: 0, fontSize: 17, fontWeight: 800, color: 'var(--dark)' }}>{campaign.title}</h3>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', flexShrink: 0 }}>
            <X size={18} color="#6b7280" />
          </button>
        </div>

        {campaign.description && (
          <p style={{ margin: '0 0 18px', color: 'var(--gray)', fontSize: 13.5, lineHeight: 1.5 }}>{campaign.description}</p>
        )}

        <div style={{ marginBottom: 18 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 13 }}>
            <span style={{ color: 'var(--gray)' }}>Progress</span>
            <span style={{ fontWeight: 700, color: barColor }}>{campaign.percentageCompleted}%</span>
          </div>
          <div style={{ width: '100%', height: 9, borderRadius: 6, background: progressBg(barColor), overflow: 'hidden' }}>
            <div style={{ width: `${pct}%`, height: '100%', borderRadius: 6, background: barColor }} />
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, fontSize: 14 }}>
          <DetailRow label="Target Amount" value={`₹${(campaign.targetAmount ?? 0).toLocaleString()}`} />
          <DetailRow label="Collected Amount" value={`₹${(campaign.collectedAmount ?? 0).toLocaleString()}`} />
          <DetailRow label="Remaining" value={`₹${Math.max((campaign.targetAmount ?? 0) - (campaign.collectedAmount ?? 0), 0).toLocaleString()}`} />
          <DetailRow label="Status" value={
            <span style={{ background: '#dcfce7', color: '#16a34a', padding: '3px 10px', borderRadius: 20, fontSize: 12.5, fontWeight: 700 }}>
              {campaign.status}
            </span>
          } />
        </div>
      </div>
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
          <span style={{ fontSize: 12, color: '#16a34a', fontWeight: 600 }}>
            ↑ {changeLabel}
          </span>
        )}
      </div>
    </div>
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
          padding: '9px 12px', fontSize: 13.5, color: 'var(--gray)', cursor: 'pointer',
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

const iconBtnStyle = (borderColor) => ({
  width: 32, height: 32, borderRadius: 8, border: `1px solid ${borderColor}`,
  background: 'var(--card-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
});

const PAGE_SIZE_OPTIONS = [10, 20, 50];

export default function Reports() {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeFilter, setTimeFilter] = useState('This Month');
  const [viewing, setViewing] = useState(null);

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    reportService.campaignPerformance().then(setCampaigns).finally(() => setLoading(false));
  }, []);

  useEffect(() => { setPage(1); }, [pageSize, campaigns]);

  const handleExportCsv = () => {
    const header = ['Title', 'Target Amount', 'Collected Amount', 'Percentage Completed', 'Status'];
    const rows = campaigns.map((c) => [c.title, c.targetAmount, c.collectedAmount, c.percentageCompleted, c.status]);
    const csv = [header, ...rows].map((r) => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'campaign-performance-report.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const notWired = (what) => toast.info(`${what} isn't wired up yet.`);

  const stats = useMemo(() => {
    const totalCampaigns = campaigns.length;
    const totalTarget = campaigns.reduce((sum, c) => sum + (c.targetAmount || 0), 0);
    const totalCollected = campaigns.reduce((sum, c) => sum + (c.collectedAmount || 0), 0);
    const avgCompletion = totalCampaigns
      ? campaigns.reduce((sum, c) => sum + (c.percentageCompleted || 0), 0) / totalCampaigns
      : 0;
    const activeCampaigns = campaigns.filter((c) => !isCompleted(c.status)).length;
    return { totalCampaigns, totalTarget, totalCollected, avgCompletion, activeCampaigns };
  }, [campaigns]);

  const totalPages = Math.max(1, Math.ceil(campaigns.length / pageSize));
  const pageSafe = Math.min(page, totalPages);
  const pageItems = campaigns.slice((pageSafe - 1) * pageSize, pageSafe * pageSize);

  const columns = [
    { label: 'CAMPAIGN', icon: Target },
    { label: 'TARGET', icon: IndianRupee },
    { label: 'COLLECTED', icon: IndianRupee },
    { label: '% COMPLETED', icon: PieChart },
    { label: 'STATUS', icon: Shield },
    { label: 'ACTIONS', icon: Shield },
  ];

  return (
    <div style={{ background: 'var(--body-bg)', minHeight: '100vh' }}>
      <Topbar />
      <div style={{ padding: 30, position: 'relative' }}>

        {/* Banner */}
        <div
          style={{
            position: 'relative', overflow: 'hidden', borderRadius: 16,
            background: 'linear-gradient(90deg, #eef2ff 0%, #eff6ff 60%, #f5f3ff 100%)',
            padding: '20px 28px', marginBottom: 24,
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, zIndex: 1 }}>
            <div style={{
              width: 48, height: 48, borderRadius: 12, background: '#2563eb',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              <FileText size={22} color="#fff" />
            </div>
            <div>
              <h1 style={{ margin: 0, fontWeight: 800, color: '#111827', fontSize: 28 }}>Reports</h1>
              <p style={{ margin: '4px 0 0', color: '#6b7280', fontSize: 14 }}>
                Track, analyze and export insights about your campaigns.
              </p>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 20, zIndex: 1 }}>
            <ComputerIllustration />
            <button
              onClick={handleExportCsv}
              style={{
                display: 'flex', alignItems: 'center', gap: 8, background: '#2563eb', color: '#fff',
                border: 'none', borderRadius: 10, padding: '11px 20px', fontWeight: 700, fontSize: 14, cursor: 'pointer',
                whiteSpace: 'nowrap',
              }}
            >
              ⬇ Export CSV
            </button>
          </div>
        </div>

        {/* Stat cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 16, marginBottom: 24 }}>
          <StatCard icon={Target} iconBg="#dbeafe" iconColor="#2563eb" label="Total Campaigns" value={stats.totalCampaigns} changeLabel="18% from last month" />
          <StatCard icon={IndianRupee} iconBg="#dcfce7" iconColor="#16a34a" label="Total Target" value={`₹${stats.totalTarget.toLocaleString()}`} changeLabel="14% from last month" />
          <StatCard icon={IndianRupee} iconBg="#ede9fe" iconColor="#7c3aed" label="Total Collected" value={`₹${stats.totalCollected.toLocaleString()}`} changeLabel="16% from last month" />
          <StatCard icon={PieChart} iconBg="#fef3c7" iconColor="#d97706" label="Average Completion" value={`${stats.avgCompletion.toFixed(1)}%`} changeLabel="9% from last month" />
          <StatCard icon={Award} iconBg="#dbeafe" iconColor="#2563eb" label="Active Campaigns" value={stats.activeCampaigns} changeLabel="12% from last month" />
        </div>

        <div className="card" style={{ padding: 0, overflow: 'hidden', borderRadius: 14 }}>

          {/* Header row: title + filters */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, padding: '20px 24px 16px', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{
                width: 40, height: 40, borderRadius: 10, background: '#2563eb',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}>
                <BarChart3 size={20} color="#fff" />
              </div>
              <h3 style={{ margin: 0, fontWeight: 800, color: 'var(--dark)', fontSize: 19 }}>Campaign Performance</h3>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <FilterDropdown
                icon={Calendar}
                label="This Month"
                value={timeFilter}
                options={['This Month', 'Last 30 Days', 'Last 90 Days', 'All Time']}
                onChange={setTimeFilter}
                minWidth={150}
              />
              <button
                type="button"
                onClick={() => notWired('Filter')}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8, background: 'var(--card-bg)', color: '#2563eb',
                  border: '1px solid #93c5fd', borderRadius: 10, padding: '9px 16px', fontWeight: 700, fontSize: 13.5, cursor: 'pointer',
                }}
              >
                <Filter size={15} /> Filter
              </button>
            </div>
          </div>

          {loading ? (
            <div style={{ padding: 30 }}><Loader /></div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#2563eb' }}>
                    {columns.map(({ label, icon: Icon }) => (
                      <th
                        key={label}
                        style={{
                          textAlign: 'left', padding: '14px 24px', color: '#fff',
                          fontSize: 13, fontWeight: 700, letterSpacing: 0.4, whiteSpace: 'nowrap',
                        }}
                      >
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                          <Icon size={14} color="#fff" /> {label}
                        </span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {pageItems.length === 0 && (
                    <tr>
                      <td colSpan={6} style={{ padding: 40, textAlign: 'center', color: '#9ca3af', fontSize: 14 }}>
                        No campaigns to show.
                      </td>
                    </tr>
                  )}
                  {pageItems.map((c, i) => {
                    const TypeIcon = typeIcon(c.title);
                    const colors = iconColors(c.title);
                    const st = statusStyle(c.status);
                    const completed = isCompleted(c.status);
                    const pct = Math.min(c.percentageCompleted, 100);
                    const barColor = progressColor(pct, completed);
                    const barBg = progressBg(barColor);

                    return (
                      <tr
                        key={c.campaignId}
                        style={{
                          borderBottom: '1px solid var(--border)',
                          background: i % 2 === 1 ? 'var(--row-alt-bg)' : 'var(--card-bg)',
                        }}
                      >
                        <td style={{ padding: '14px 24px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <div
                              style={{
                                width: 36, height: 36, borderRadius: 10, background: colors.bg,
                                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                              }}
                            >
                              <TypeIcon size={16} color={colors.fg} />
                            </div>
                            <div>
                              <div style={{ fontWeight: 700, color: 'var(--dark)' }}>{c.title}</div>
                              {c.description && (
                                <div style={{ fontSize: 12.5, color: 'var(--text-muted)', marginTop: 1 }}>{c.description}</div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: '14px 24px', fontWeight: 600, color: 'var(--dark)' }}>
                          ₹{(c.targetAmount ?? 0).toLocaleString()}
                        </td>
                        <td style={{ padding: '14px 24px', fontWeight: 600, color: 'var(--dark)' }}>
                          ₹{(c.collectedAmount ?? 0).toLocaleString()}
                        </td>
                        <td style={{ padding: '14px 24px', minWidth: 200 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <span style={{ fontWeight: 700, color: barColor, fontSize: 13, minWidth: 42 }}>
                              {c.percentageCompleted}%
                            </span>
                            <div
                              style={{
                                width: 110, height: 8, borderRadius: 6, background: barBg,
                                overflow: 'hidden', flexShrink: 0,
                              }}
                            >
                              <div
                                style={{
                                  width: `${pct}%`, height: '100%', borderRadius: 6,
                                  background: barColor, transition: 'width 0.3s ease',
                                }}
                              />
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: '14px 24px' }}>
                          <span
                            style={{
                              display: 'inline-flex', alignItems: 'center', gap: 6,
                              background: st.bg, color: st.fg,
                              padding: '5px 14px', borderRadius: 20, fontSize: 13, fontWeight: 600,
                            }}
                          >
                            <span style={{ width: 6, height: 6, borderRadius: '50%', background: st.dot, display: 'inline-block' }} />
                            {c.status}
                          </span>
                        </td>
                        <td style={{ padding: '14px 24px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <button onClick={() => setViewing(c)} style={iconBtnStyle('#93c5fd')} title="View details">
                              <BarChart3 size={15} color="#2563eb" />
                            </button>
                            <button onClick={() => notWired('More actions')} style={iconBtnStyle('var(--border)')} title="More">
                              <MoreVertical size={15} color="#6b7280" />
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

          {/* Pagination footer */}
          {!loading && campaigns.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 24px', borderTop: '1px solid var(--border)', flexWrap: 'wrap', gap: 12 }}>
              <span style={{ fontSize: 13.5, color: 'var(--gray)' }}>
                Showing {(pageSafe - 1) * pageSize + 1} to {Math.min(pageSafe * pageSize, campaigns.length)} of {campaigns.length} campaigns
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

        <CampaignDetailModal campaign={viewing} onClose={() => setViewing(null)} />
      </div>
    </div>
  );
}