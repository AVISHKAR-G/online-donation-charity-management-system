import { useEffect, useState } from 'react';
import Sidebar from '../../components/Sidebar';
import Loader from '../../components/Loader';
import { reportService } from '../../services/reportService';
import {
  BarChart3, BookOpen, Building2, Monitor, HeartPulse, Heart,
  Target, IndianRupee, PieChart, Shield, MessageCircle, Ribbon,
  Syringe, Truck, Utensils, Package, Snowflake, Waves,
} from 'lucide-react';

/* ---------- visual helpers ---------- */

function typeIcon(title = '') {
  const t = title.toLowerCase();
  if (t.includes('librar')) return BookOpen;
  if (t.includes('school meal')) return Package;
  if (t.includes('school')) return Building2;
  if (t.includes('digital') || t.includes('classroom')) return Monitor;
  if (t.includes('healthcare') || t.includes('medical van')) return Truck;
  if (t.includes('health')) return HeartPulse;
  if (t.includes('girl')) return Heart;
  if (t.includes('cancer')) return Ribbon;
  if (t.includes('vaccin')) return Syringe;
  if (t.includes('feed') || t.includes('kitchen')) return Utensils;
  if (t.includes('winter')) return Snowflake;
  if (t.includes('flood')) return Waves;
  if (t.includes('earthquake')) return Building2;
  return Target;
}

function isCompleted(status = '') {
  return status.toLowerCase() === 'completed';
}

function statusStyle(status) {
  if (isCompleted(status)) return { bg: '#dcfce7', fg: '#16a34a', dot: '#16a34a' };
  return { bg: '#dbeafe', fg: '#2563eb', dot: '#2563eb' };
}

// Different color per progress tier, green once completed
function progressColor(pct, completed) {
  if (completed || pct >= 100) return '#16a34a'; // green
  if (pct >= 50) return '#2563eb';                // blue
  if (pct >= 15) return '#f59e0b';                // orange
  return '#dc2626';                                // red
}

function progressBg(color) {
  return color + '22'; // light tint of the same color
}

function DotGrid({ style }) {
  return (
    <svg width="120" height="70" viewBox="0 0 120 70" style={style}>
      {Array.from({ length: 3 }).map((_, row) =>
        Array.from({ length: 6 }).map((_, col) => (
          <circle key={`${row}-${col}`} cx={12 + col * 20} cy={12 + row * 24} r="3.5" fill="#93c5fd" />
        ))
      )}
    </svg>
  );
}

/* ---------- main component ---------- */

export default function Reports() {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    reportService.campaignPerformance().then(setCampaigns).finally(() => setLoading(false));
  }, []);

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

  const columns = [
    { label: 'CAMPAIGN', icon: Target },
    { label: 'TARGET', icon: IndianRupee },
    { label: 'COLLECTED', icon: IndianRupee },
    { label: '% COMPLETED', icon: PieChart },
    { label: 'STATUS', icon: Shield },
  ];

  return (
    <div style={{ display: 'flex' }}>
      <Sidebar />
      <div style={{ flex: 1, padding: 30, background: '#f8fafc', minHeight: '100vh', position: 'relative' }}>

        {/* Page header */}
        <div
          style={{
            position: 'relative', overflow: 'hidden', borderRadius: 16,
            background: 'linear-gradient(90deg, #eef2ff 0%, #eff6ff 60%, #f5f3ff 100%)',
            padding: '20px 28px', marginBottom: 24,
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}
        >
          <div>
            <h1 style={{ margin: 0, fontWeight: 800, color: '#111827', fontSize: 30 }}>Reports</h1>
            <div style={{ width: 40, height: 3, borderRadius: 2, background: '#2563eb', marginTop: 8 }} />
          </div>
          <button
            className="btn btn-primary"
            onClick={handleExportCsv}
            style={{ display: 'flex', alignItems: 'center', gap: 6, position: 'relative', zIndex: 1 }}
          >
            ⬇ Export CSV
          </button>
          <DotGrid style={{ position: 'absolute', right: 190, top: 14, opacity: 0.6 }} />
        </div>

        {/* Table card */}
        <div className="card" style={{ padding: 0, overflow: 'hidden', borderRadius: 14 }}>

          {/* Card title with icon badge */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '20px 24px 16px' }}>
            <div
              style={{
                width: 40, height: 40, borderRadius: 10, background: '#2563eb',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}
            >
              <BarChart3 size={20} color="#fff" />
            </div>
            <h3 style={{ margin: 0, fontWeight: 800, color: '#111827', fontSize: 19 }}>Campaign Performance</h3>
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
                  {campaigns.map((c, i) => {
                    const TypeIcon = typeIcon(c.title);
                    const st = statusStyle(c.status);
                    const completed = isCompleted(c.status);
                    const pct = Math.min(c.percentageCompleted, 100);
                    const barColor = progressColor(pct, completed);
                    const barBg = progressBg(barColor);

                    return (
                      <tr
                        key={c.campaignId}
                        style={{
                          borderBottom: '1px solid #f1f5f9',
                          background: i % 2 === 1 ? '#fafbff' : '#fff',
                        }}
                      >
                        <td style={{ padding: '14px 24px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <div
                              style={{
                                width: 36, height: 36, borderRadius: '50%', background: '#eff6ff',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                              }}
                            >
                              <TypeIcon size={16} color="#2563eb" />
                            </div>
                            <span style={{ fontWeight: 700, color: '#111827' }}>{c.title}</span>
                          </div>
                        </td>
                        <td style={{ padding: '14px 24px', fontWeight: 600, color: '#2563eb' }}>
                          ₹{c.targetAmount.toLocaleString()}
                        </td>
                        <td style={{ padding: '14px 24px', fontWeight: 600, color: '#2563eb' }}>
                          ₹{c.collectedAmount.toLocaleString()}
                        </td>
                        <td style={{ padding: '14px 24px', minWidth: 200 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <span style={{ fontWeight: 700, color: barColor, fontSize: 13, minWidth: 40 }}>
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