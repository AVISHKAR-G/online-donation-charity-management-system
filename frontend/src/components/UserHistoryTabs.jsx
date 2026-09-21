import React, { useState, useEffect } from 'react';
import {
  Heart, User, Gift, MessageCircle, Calendar, CheckCircle2,
  Landmark, GraduationCap, Users2, HeartHandshake, Cross, ShieldCheck,
  Flag, IndianRupee, CreditCard, Target, HandHeart, FileText, Award,
} from 'lucide-react';

function useIsMobile(breakpoint = 768) {
  const [isMobile, setIsMobile] = useState(
    typeof window !== 'undefined' ? window.innerWidth < breakpoint : false
  );
  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < breakpoint);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [breakpoint]);
  return isMobile;
}

const rowIconsList = [Landmark, GraduationCap, Users2, HeartHandshake, Cross, ShieldCheck];
const rowColorsLight = [
  { bg: '#dbeafe', fg: '#2563eb' },
  { bg: '#e0f2fe', fg: '#0284c7' },
  { bg: '#f3e8ff', fg: '#9333ea' },
  { bg: '#fce7f3', fg: '#db2777' },
  { bg: '#fef3c7', fg: '#d97706' },
  { bg: '#dcfce7', fg: '#16a34a' },
];
const rowColorsDark = [
  { bg: '#1e3a5f', fg: '#60a5fa' },
  { bg: '#0c4a6e', fg: '#38bdf8' },
  { bg: '#3b1e5e', fg: '#c084fc' },
  { bg: '#4a1942', fg: '#f472b6' },
  { bg: '#4a3208', fg: '#fbbf24' },
  { bg: '#14532d', fg: '#4ade80' },
];

function RowIcon({ index, isDark, size = 38, iconSize = 18 }) {
  const Icon = rowIconsList[index % rowIconsList.length];
  const palette = isDark ? rowColorsDark : rowColorsLight;
  const { bg, fg } = palette[index % palette.length];
  return (
    <div style={{
      width: size, height: size, borderRadius: 10, background: bg,
      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
    }}>
      <Icon size={iconSize} color={fg} />
    </div>
  );
}

function UpiBadge() {
  const colors = ['#f97316', '#22c55e', '#6366f1'];
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 1, marginTop: 2 }}>
      {['U', 'P', 'I'].map((ch, i) => (
        <span key={ch} style={{ fontSize: 10, fontWeight: 800, color: colors[i], letterSpacing: 0.5 }}>
          {ch}
        </span>
      ))}
    </div>
  );
}

function ThLabel({ icon: Icon, children }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
      <Icon size={13} /> {children}
    </span>
  );
}

/* ---------- Mobile card row helpers ---------- */

function MobileFieldRow({ label, children, isDark }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0' }}>
      <span style={{ fontSize: 12.5, color: isDark ? '#94a3b8' : '#9ca3af', fontWeight: 600 }}>{label}</span>
      <span style={{ fontSize: 13.5, color: isDark ? '#f1f5f9' : '#111827', fontWeight: 600 }}>{children}</span>
    </div>
  );
}

function MobileCard({ children, isDark }) {
  return (
    <div style={{
      background: isDark ? '#1e293b' : '#fff', borderRadius: 14, padding: '16px 18px',
      boxShadow: isDark ? '0 2px 8px rgba(0,0,0,0.25)' : '0 2px 8px rgba(0,0,0,0.06)',
      border: `1px solid ${isDark ? '#334155' : '#f3f4f6'}`,
    }}>
      {children}
    </div>
  );
}

function DonationMobileCard({ d, index, openMessages, toggleMessage, statusLabel, isDark }) {
  return (
    <MobileCard isDark={isDark}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
        <RowIcon index={index} isDark={isDark} />
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 700, color: isDark ? '#f1f5f9' : '#111827', fontSize: 14.5 }}>{d.campaignTitle}</div>
          {d.adminMessage && (
            <button
              onClick={() => toggleMessage(d.donationId)}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 5,
                background: 'none', border: 'none', padding: 0,
                fontSize: 12.5, cursor: 'pointer', color: isDark ? '#4ade80' : '#16a34a', fontWeight: 500, marginTop: 2,
              }}
            >
              <MessageCircle size={12} />
              {openMessages[d.donationId] ? 'Hide message' : 'View message'}
            </button>
          )}
        </div>
      </div>

      {d.adminMessage && openMessages[d.donationId] && (
        <div style={{
          fontSize: 13, color: isDark ? '#cbd5e1' : '#4b5563', fontStyle: 'italic',
          background: isDark ? '#0f172a' : '#f9fafb',
          border: `1px solid ${isDark ? '#334155' : '#f0f0f0'}`, borderRadius: 6, padding: '8px 12px', marginBottom: 10,
        }}>
          {d.adminMessage}
        </div>
      )}

      <div style={{ borderTop: `1px solid ${isDark ? '#334155' : '#f3f4f6'}`, paddingTop: 6 }}>
        <MobileFieldRow label="Amount" isDark={isDark}>
          <span style={{ color: isDark ? '#4ade80' : '#16a34a', fontWeight: 700 }}>₹{d.amount.toLocaleString()}</span>
        </MobileFieldRow>
        <MobileFieldRow label="Method" isDark={isDark}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            {d.paymentMethod}
            {d.paymentMethod === 'UPI' && <UpiBadge />}
          </span>
        </MobileFieldRow>
        <MobileFieldRow label="Status" isDark={isDark}>
          <span
            className={`badge ${d.status === 'Approved' ? 'badge-success' : d.status === 'Rejected' ? 'badge-danger' : 'badge-info'}`}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}
          >
            {d.status === 'Approved' && <CheckCircle2 size={13} />}
            {d.status === 'Pending' ? 'Payment Received – Pending Approval' : statusLabel(d.status)}
          </span>
        </MobileFieldRow>
        <MobileFieldRow label="Date" isDark={isDark}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, color: isDark ? '#94a3b8' : '#6b7280', fontWeight: 500 }}>
            <Calendar size={13} color={isDark ? '#64748b' : '#9ca3af'} />
            {new Date(d.date).toLocaleDateString()}
          </span>
        </MobileFieldRow>
      </div>
    </MobileCard>
  );
}

function ApplicationMobileCard({ a, index, isDark }) {
  return (
    <MobileCard isDark={isDark}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
        <RowIcon index={index} isDark={isDark} />
        <span style={{ fontWeight: 700, color: isDark ? '#f1f5f9' : '#111827', fontSize: 14.5 }}>{a.type}</span>
      </div>
      <div style={{ borderTop: `1px solid ${isDark ? '#334155' : '#f3f4f6'}`, paddingTop: 6 }}>
        <MobileFieldRow label="Amount Requested" isDark={isDark}>
          <span style={{ color: isDark ? '#4ade80' : '#16a34a', fontWeight: 700 }}>₹{a.amountRequired.toLocaleString()}</span>
        </MobileFieldRow>
        <MobileFieldRow label="Status" isDark={isDark}>
          <span className="badge badge-info">{a.status}</span>
        </MobileFieldRow>
        <MobileFieldRow label="Document" isDark={isDark}>
          {a.documentPath ? <a href={a.documentPath} target="_blank" rel="noreferrer" style={{ color: isDark ? '#4ade80' : undefined }}>View</a> : '-'}
        </MobileFieldRow>
        <MobileFieldRow label="Date" isDark={isDark}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, color: isDark ? '#94a3b8' : '#6b7280', fontWeight: 500 }}>
            <Calendar size={13} color={isDark ? '#64748b' : '#9ca3af'} />
            {new Date(a.createdAt).toLocaleDateString()}
          </span>
        </MobileFieldRow>
      </div>
    </MobileCard>
  );
}

function AidMobileCard({ d, index, isDark }) {
  return (
    <MobileCard isDark={isDark}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
        <RowIcon index={index} isDark={isDark} />
        <span style={{ fontWeight: 700, color: isDark ? '#f1f5f9' : '#111827', fontSize: 14.5 }}>#{d.applicationId}</span>
      </div>
      <div style={{ borderTop: `1px solid ${isDark ? '#334155' : '#f3f4f6'}`, paddingTop: 6 }}>
        <MobileFieldRow label="Amount" isDark={isDark}>
          <span style={{ color: isDark ? '#4ade80' : '#16a34a', fontWeight: 700 }}>₹{d.amountDelivered.toLocaleString()}</span>
        </MobileFieldRow>
        <MobileFieldRow label="Method" isDark={isDark}>{d.method}</MobileFieldRow>
        <MobileFieldRow label="Status" isDark={isDark}>
          <span className="badge badge-success">{d.status}</span>
        </MobileFieldRow>
        <MobileFieldRow label="Notes" isDark={isDark}>{d.notes || '-'}</MobileFieldRow>
        <MobileFieldRow label="Delivered" isDark={isDark}>
          {d.deliveredAt ? (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, color: isDark ? '#94a3b8' : '#6b7280', fontWeight: 500 }}>
              <Calendar size={13} color={isDark ? '#64748b' : '#9ca3af'} />
              {new Date(d.deliveredAt).toLocaleDateString()}
            </span>
          ) : '-'}
        </MobileFieldRow>
      </div>
    </MobileCard>
  );
}

/* ---------- Stats footer ---------- */

function StatsFooter({ donations, isDark }) {
  const totalDonated = donations.reduce((sum, d) => sum + d.amount, 0);
  const totalTransactions = donations.length;
  const successCount = donations.filter((d) => d.status === 'Approved').length;
  const successRate = totalTransactions ? Math.round((successCount / totalTransactions) * 100) : 0;

  const earliest = donations.reduce((min, d) => {
    const t = new Date(d.date).getTime();
    return !min || t < min ? t : min;
  }, null);
  const memberSince = earliest
    ? new Date(earliest).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })
    : '—';

  const cards = [
    {
      icon: HandHeart, iconBg: '#16a34a', bg: isDark ? '#14532d' : '#f0fdf4',
      label: 'Total Donated', value: `₹${totalDonated.toLocaleString()}`,
      sub: `Across ${totalTransactions} donations`, valueColor: isDark ? '#4ade80' : '#16a34a',
    },
    {
      icon: FileText, iconBg: '#2563eb', bg: isDark ? '#1e3a8a' : '#eff6ff',
      label: 'Total Transactions', value: totalTransactions,
      sub: 'Successful donations', valueColor: isDark ? '#60a5fa' : '#2563eb',
    },
    {
      icon: Award, iconBg: '#16a34a', bg: isDark ? '#14532d' : '#f0fdf4',
      label: 'Success Rate', value: `${successRate}%`,
      sub: 'All donations successful', valueColor: isDark ? '#4ade80' : '#16a34a',
    },
    {
      icon: Calendar, iconBg: '#ea580c', bg: isDark ? '#7c2d12' : '#fff7ed',
      label: 'Member Since', value: memberSince,
      sub: 'Thank you for your support! ❤️', valueColor: isDark ? '#fb923c' : '#ea580c',
    },
  ];

  return (
    <div style={{
      display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: 14, marginTop: 20,
    }}>
      {cards.map((c) => {
        const Icon = c.icon;
        return (
          <div
            key={c.label}
            style={{
              background: c.bg, borderRadius: 14, padding: '18px 20px',
              display: 'flex', alignItems: 'flex-start', gap: 14,
            }}
          >
            <div style={{
              width: 42, height: 42, borderRadius: '50%', background: c.iconBg,
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              <Icon size={19} color="#fff" />
            </div>
            <div>
              <div style={{ fontSize: 13.5, color: isDark ? '#cbd5e1' : '#374151', fontWeight: 600 }}>{c.label}</div>
              <div style={{ fontSize: 22, fontWeight: 800, color: c.valueColor, marginTop: 2 }}>{c.value}</div>
              <div style={{ fontSize: 12.5, color: isDark ? '#94a3b8' : '#6b7280', marginTop: 2 }}>{c.sub}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ---------- Main component ---------- */

const ACTIVE_COLOR_LIGHT = '#16a34a';
const ACTIVE_COLOR_DARK = '#4ade80';

export default function UserHistoryTabs({ history, isDark = false }) {
  const [tab, setTab] = useState('donations');
  const [openMessages, setOpenMessages] = useState({});
  const { donations = [], applications = [], aidReceived = [] } = history || {};
  const isMobile = useIsMobile();

  const activeColor = isDark ? ACTIVE_COLOR_DARK : ACTIVE_COLOR_LIGHT;
  const inactiveColor = isDark ? '#64748b' : '#9ca3af';
  const inactiveTextColor = isDark ? '#94a3b8' : '#6b7280';
  const borderColor = isDark ? '#334155' : '#f1f5f9';
  const tabsBorderColor = isDark ? '#334155' : '#e5e7eb';
  const headerBg = isDark ? '#14532d' : '#e8f5ee';
  const headerText = isDark ? '#86efac' : '#166534';
  const rowText = isDark ? '#f1f5f9' : '#111827';
  const rowSubText = isDark ? '#94a3b8' : '#6b7280';
  const emptyText = isDark ? '#94a3b8' : '#374151';

  const thStyle = {
    color: headerText, padding: '10px 16px', textAlign: 'left', fontSize: 11.5,
    letterSpacing: 0.4, textTransform: 'uppercase', fontWeight: 700,
  };
  const tdStyle = { padding: '12px 16px', verticalAlign: 'middle' };
  const headerRowStyle = { background: headerBg };

  const tabs = [
    { key: 'donations', label: `Donations (${donations.length})`, icon: Heart },
    { key: 'applications', label: `Applications (${applications.length})`, icon: User },
    { key: 'aid', label: `Aid Received (${aidReceived.length})`, icon: Gift },
  ];

  const statusLabel = (status) => (status === 'Approved' ? 'Donated Successfully' : status);
  const toggleMessage = (id) => setOpenMessages((prev) => ({ ...prev, [id]: !prev[id] }));

  return (
    <div>
      <div style={{ display: 'flex', gap: 4, borderBottom: `1px solid ${tabsBorderColor}`, marginBottom: 20, padding: '0 4px', overflowX: 'auto' }}>
        {tabs.map((t) => {
          const Icon = t.icon;
          const active = tab === t.key;
          return (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '11px 14px',
                border: 'none',
                background: 'none',
                borderBottom: active ? `2px solid ${activeColor}` : '2px solid transparent',
                fontWeight: active ? 700 : 500,
                fontSize: 13,
                color: active ? activeColor : inactiveTextColor,
                cursor: 'pointer',
                transition: 'color 0.15s ease',
                whiteSpace: 'nowrap',
              }}
            >
              <Icon size={16} fill={active ? activeColor : 'none'} color={active ? activeColor : inactiveColor} />
              {t.label}
            </button>
          );
        })}
      </div>

      {tab === 'donations' && (
        donations.length === 0 ? <p style={{ padding: '0 20px', color: emptyText }}>No donations yet.</p> : (
          <>
            {isMobile ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {donations.map((d, i) => (
                  <DonationMobileCard
                    key={d.donationId}
                    d={d}
                    index={i}
                    openMessages={openMessages}
                    toggleMessage={toggleMessage}
                    statusLabel={statusLabel}
                    isDark={isDark}
                  />
                ))}
              </div>
            ) : (
              <div style={{ borderRadius: 12, overflowX: 'auto', WebkitOverflowScrolling: 'touch', border: `1px solid ${borderColor}` }}>
                <table style={{ width: '100%', minWidth: 700, borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={headerRowStyle}>
                      <th style={thStyle}><ThLabel icon={Flag}>Campaign</ThLabel></th>
                      <th style={thStyle}><ThLabel icon={IndianRupee}>Amount</ThLabel></th>
                      <th style={thStyle}><ThLabel icon={CreditCard}>Method</ThLabel></th>
                      <th style={thStyle}><ThLabel icon={Target}>Status</ThLabel></th>
                      <th style={thStyle}><ThLabel icon={Calendar}>Date</ThLabel></th>
                    </tr>
                  </thead>
                  <tbody>
                    {donations.map((d, i) => (
                      <React.Fragment key={d.donationId}>
                        <tr style={{ borderBottom: `1px solid ${borderColor}` }}>
                          <td style={tdStyle}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                              <RowIcon index={i} isDark={isDark} />
                              <div>
                                <div style={{ fontWeight: 600, color: rowText }}>{d.campaignTitle}</div>
                                {d.adminMessage && (
                                  <button
                                    onClick={() => toggleMessage(d.donationId)}
                                    style={{
                                      display: 'inline-flex', alignItems: 'center', gap: 5,
                                      background: 'none', border: 'none',
                                      padding: 0, fontSize: 12.5, cursor: 'pointer', color: activeColor,
                                      marginTop: 4, fontWeight: 500,
                                    }}
                                  >
                                    <MessageCircle size={12} />
                                    {openMessages[d.donationId] ? 'Hide message' : 'View message'}
                                  </button>
                                )}
                              </div>
                            </div>
                          </td>
                          <td style={{ ...tdStyle, color: activeColor, fontWeight: 700 }}>₹{d.amount.toLocaleString()}</td>
                          <td style={{ ...tdStyle, color: rowText }}>
                            <div>{d.paymentMethod}</div>
                            {d.paymentMethod === 'UPI' && <UpiBadge />}
                          </td>
                          <td style={tdStyle}>
                            <span
                              className={`badge ${d.status === 'Approved' ? 'badge-success' : d.status === 'Rejected' ? 'badge-danger' : 'badge-info'}`}
                              style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}
                            >
                              {d.status === 'Approved' && <CheckCircle2 size={13} />}
                              {d.status === 'Pending' ? 'Payment Received – Pending Approval' : statusLabel(d.status)}
                            </span>
                          </td>
                          <td style={{ ...tdStyle, color: rowSubText }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                              <Calendar size={13} color={inactiveColor} />
                              {new Date(d.date).toLocaleDateString()}
                            </div>
                          </td>
                        </tr>
                        {d.adminMessage && openMessages[d.donationId] && (
                          <tr style={{ borderBottom: `1px solid ${borderColor}` }}>
                            <td colSpan={5} style={{ padding: '0 20px 14px 70px' }}>
                              <div
                                style={{
                                  fontSize: 13,
                                  color: isDark ? '#cbd5e1' : '#4b5563',
                                  fontStyle: 'italic',
                                  background: isDark ? '#0f172a' : '#f9fafb',
                                  border: `1px solid ${isDark ? '#334155' : '#f0f0f0'}`,
                                  borderRadius: 6,
                                  padding: '8px 12px',
                                  maxWidth: 480,
                                }}
                              >
                                {d.adminMessage}
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <StatsFooter donations={donations} isDark={isDark} />
          </>
        )
      )}

      {tab === 'applications' && (
        applications.length === 0 ? <p style={{ padding: '0 20px', color: emptyText }}>No applications yet.</p> : (
          isMobile ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {applications.map((a, i) => (
                <ApplicationMobileCard key={a.applicationId} a={a} index={i} isDark={isDark} />
              ))}
            </div>
          ) : (
            <div style={{ borderRadius: 12, overflowX: 'auto', WebkitOverflowScrolling: 'touch', border: `1px solid ${borderColor}` }}>
              <table style={{ width: '100%', minWidth: 700, borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={headerRowStyle}>
                    <th style={thStyle}>Type</th>
                    <th style={thStyle}>Amount Requested</th>
                    <th style={thStyle}>Status</th>
                    <th style={thStyle}>Document</th>
                    <th style={thStyle}>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {applications.map((a, i) => (
                    <tr key={a.applicationId} style={{ borderBottom: `1px solid ${borderColor}` }}>
                      <td style={tdStyle}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <RowIcon index={i} isDark={isDark} />
                          <span style={{ fontWeight: 600, color: rowText }}>{a.type}</span>
                        </div>
                      </td>
                      <td style={{ ...tdStyle, color: activeColor, fontWeight: 700 }}>₹{a.amountRequired.toLocaleString()}</td>
                      <td style={tdStyle}><span className="badge badge-info">{a.status}</span></td>
                      <td style={{ ...tdStyle, color: rowText }}>{a.documentPath ? <a href={a.documentPath} target="_blank" rel="noreferrer" style={{ color: activeColor }}>View</a> : '-'}</td>
                      <td style={{ ...tdStyle, color: rowSubText }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <Calendar size={13} color={inactiveColor} />
                          {new Date(a.createdAt).toLocaleDateString()}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        )
      )}

      {tab === 'aid' && (
        aidReceived.length === 0 ? <p style={{ padding: '0 20px', color: emptyText }}>No aid delivered yet.</p> : (
          isMobile ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {aidReceived.map((d, i) => (
                <AidMobileCard key={d.aidDeliveryId} d={d} index={i} isDark={isDark} />
              ))}
            </div>
          ) : (
            <div style={{ borderRadius: 12, overflowX: 'auto', WebkitOverflowScrolling: 'touch', border: `1px solid ${borderColor}` }}>
              <table style={{ width: '100%', minWidth: 700, borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={headerRowStyle}>
                    <th style={thStyle}>Application ID</th>
                    <th style={thStyle}>Amount</th>
                    <th style={thStyle}>Method</th>
                    <th style={thStyle}>Status</th>
                    <th style={thStyle}>Notes</th>
                    <th style={thStyle}>Delivered</th>
                  </tr>
                </thead>
                <tbody>
                  {aidReceived.map((d, i) => (
                    <tr key={d.aidDeliveryId} style={{ borderBottom: `1px solid ${borderColor}` }}>
                      <td style={tdStyle}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <RowIcon index={i} isDark={isDark} />
                          <span style={{ fontWeight: 600, color: rowText }}>#{d.applicationId}</span>
                        </div>
                      </td>
                      <td style={{ ...tdStyle, color: activeColor, fontWeight: 700 }}>₹{d.amountDelivered.toLocaleString()}</td>
                      <td style={{ ...tdStyle, color: rowText }}>{d.method}</td>
                      <td style={tdStyle}><span className="badge badge-success">{d.status}</span></td>
                      <td style={{ ...tdStyle, color: rowText }}>{d.notes || '-'}</td>
                      <td style={{ ...tdStyle, color: rowSubText }}>
                        {d.deliveredAt ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <Calendar size={13} color={inactiveColor} />
                            {new Date(d.deliveredAt).toLocaleDateString()}
                          </div>
                        ) : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        )
      )}
    </div>
  );
}