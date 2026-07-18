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

const rowIcons = [Landmark, GraduationCap, Users2, HeartHandshake, Cross, ShieldCheck];
const rowColors = [
  { bg: '#dbeafe', fg: '#2563eb' },
  { bg: '#e0f2fe', fg: '#0284c7' },
  { bg: '#f3e8ff', fg: '#9333ea' },
  { bg: '#fce7f3', fg: '#db2777' },
  { bg: '#fef3c7', fg: '#d97706' },
  { bg: '#dcfce7', fg: '#16a34a' },
];

function RowIcon({ index, size = 38, iconSize = 18 }) {
  const Icon = rowIcons[index % rowIcons.length];
  const { bg, fg } = rowColors[index % rowColors.length];
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

const thStyle = {
  color: '#fff', padding: '14px 20px', textAlign: 'left', fontSize: 13,
  letterSpacing: 0.4, textTransform: 'uppercase', fontWeight: 700,
};
const tdStyle = { padding: '16px 20px', verticalAlign: 'middle' };
const gradientHeader = { background: 'linear-gradient(90deg, #2563eb 0%, #9333ea 45%, #db2777 75%, #f97316 100%)' };

function ThLabel({ icon: Icon, children }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
      <Icon size={13} /> {children}
    </span>
  );
}

/* ---------- Mobile card row helpers ---------- */

function MobileFieldRow({ label, children }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0' }}>
      <span style={{ fontSize: 12.5, color: '#9ca3af', fontWeight: 600 }}>{label}</span>
      <span style={{ fontSize: 13.5, color: '#111827', fontWeight: 600 }}>{children}</span>
    </div>
  );
}

function MobileCard({ children }) {
  return (
    <div style={{
      background: '#fff', borderRadius: 14, padding: '16px 18px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.06)', border: '1px solid #f3f4f6',
    }}>
      {children}
    </div>
  );
}

function DonationMobileCard({ d, index, openMessages, toggleMessage, statusLabel }) {
  return (
    <MobileCard>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
        <RowIcon index={index} />
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 700, color: '#111827', fontSize: 14.5 }}>{d.campaignTitle}</div>
          {d.adminMessage && (
            <button
              onClick={() => toggleMessage(d.donationId)}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 5,
                background: 'none', border: 'none', padding: 0,
                fontSize: 12.5, cursor: 'pointer', color: '#7c3aed', fontWeight: 500, marginTop: 2,
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
          fontSize: 13, color: '#4b5563', fontStyle: 'italic', background: '#f9fafb',
          border: '1px solid #f0f0f0', borderRadius: 6, padding: '8px 12px', marginBottom: 10,
        }}>
          {d.adminMessage}
        </div>
      )}

      <div style={{ borderTop: '1px solid #f3f4f6', paddingTop: 6 }}>
        <MobileFieldRow label="Amount">
          <span style={{ color: '#16a34a', fontWeight: 700 }}>₹{d.amount.toLocaleString()}</span>
        </MobileFieldRow>
        <MobileFieldRow label="Method">
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            {d.paymentMethod}
            {d.paymentMethod === 'UPI' && <UpiBadge />}
          </span>
        </MobileFieldRow>
        <MobileFieldRow label="Status">
          <span
            className={`badge ${d.status === 'Approved' ? 'badge-success' : d.status === 'Rejected' ? 'badge-danger' : 'badge-info'}`}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}
          >
            {d.status === 'Approved' && <CheckCircle2 size={13} />}
            {d.status === 'Pending' ? 'Payment Received – Pending Approval' : statusLabel(d.status)}
          </span>
        </MobileFieldRow>
        <MobileFieldRow label="Date">
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, color: '#6b7280', fontWeight: 500 }}>
            <Calendar size={13} color="#9ca3af" />
            {new Date(d.date).toLocaleDateString()}
          </span>
        </MobileFieldRow>
      </div>
    </MobileCard>
  );
}

function ApplicationMobileCard({ a, index }) {
  return (
    <MobileCard>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
        <RowIcon index={index} />
        <span style={{ fontWeight: 700, color: '#111827', fontSize: 14.5 }}>{a.type}</span>
      </div>
      <div style={{ borderTop: '1px solid #f3f4f6', paddingTop: 6 }}>
        <MobileFieldRow label="Amount Requested">
          <span style={{ color: '#2563eb', fontWeight: 700 }}>₹{a.amountRequired.toLocaleString()}</span>
        </MobileFieldRow>
        <MobileFieldRow label="Status">
          <span className="badge badge-info">{a.status}</span>
        </MobileFieldRow>
        <MobileFieldRow label="Document">
          {a.documentPath ? <a href={a.documentPath} target="_blank" rel="noreferrer">View</a> : '-'}
        </MobileFieldRow>
        <MobileFieldRow label="Date">
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, color: '#6b7280', fontWeight: 500 }}>
            <Calendar size={13} color="#9ca3af" />
            {new Date(a.createdAt).toLocaleDateString()}
          </span>
        </MobileFieldRow>
      </div>
    </MobileCard>
  );
}

function AidMobileCard({ d, index }) {
  return (
    <MobileCard>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
        <RowIcon index={index} />
        <span style={{ fontWeight: 700, color: '#111827', fontSize: 14.5 }}>#{d.applicationId}</span>
      </div>
      <div style={{ borderTop: '1px solid #f3f4f6', paddingTop: 6 }}>
        <MobileFieldRow label="Amount">
          <span style={{ color: '#9333ea', fontWeight: 700 }}>₹{d.amountDelivered.toLocaleString()}</span>
        </MobileFieldRow>
        <MobileFieldRow label="Method">{d.method}</MobileFieldRow>
        <MobileFieldRow label="Status">
          <span className="badge badge-success">{d.status}</span>
        </MobileFieldRow>
        <MobileFieldRow label="Notes">{d.notes || '-'}</MobileFieldRow>
        <MobileFieldRow label="Delivered">
          {d.deliveredAt ? (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, color: '#6b7280', fontWeight: 500 }}>
              <Calendar size={13} color="#9ca3af" />
              {new Date(d.deliveredAt).toLocaleDateString()}
            </span>
          ) : '-'}
        </MobileFieldRow>
      </div>
    </MobileCard>
  );
}

/* ---------- Stats footer ---------- */

function StatsFooter({ donations }) {
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
      icon: HandHeart, iconBg: '#9333ea', bg: '#f5f3ff',
      label: 'Total Donated', value: `₹${totalDonated.toLocaleString()}`,
      sub: `Across ${totalTransactions} donations`, valueColor: '#7c3aed',
    },
    {
      icon: FileText, iconBg: '#16a34a', bg: '#f0fdf4',
      label: 'Total Transactions', value: totalTransactions,
      sub: 'Successful donations', valueColor: '#16a34a',
    },
    {
      icon: Award, iconBg: '#2563eb', bg: '#eff6ff',
      label: 'Success Rate', value: `${successRate}%`,
      sub: 'All donations successful', valueColor: '#2563eb',
    },
    {
      icon: Calendar, iconBg: '#ea580c', bg: '#fff7ed',
      label: 'Member Since', value: memberSince,
      sub: 'Thank you for your support! ❤️', valueColor: '#ea580c',
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
              <div style={{ fontSize: 13.5, color: '#374151', fontWeight: 600 }}>{c.label}</div>
              <div style={{ fontSize: 22, fontWeight: 800, color: c.valueColor, marginTop: 2 }}>{c.value}</div>
              <div style={{ fontSize: 12.5, color: '#6b7280', marginTop: 2 }}>{c.sub}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ---------- Main component ---------- */

export default function UserHistoryTabs({ history }) {
  const [tab, setTab] = useState('donations');
  const [openMessages, setOpenMessages] = useState({});
  const { donations = [], applications = [], aidReceived = [] } = history || {};
  const isMobile = useIsMobile();

  const tabs = [
    { key: 'donations', label: `Donations (${donations.length})`, icon: Heart, color: '#9333ea' },
    { key: 'applications', label: `Applications (${applications.length})`, icon: User, color: '#16a34a' },
    { key: 'aid', label: `Aid Received (${aidReceived.length})`, icon: Gift, color: '#2563eb' },
  ];

  const statusLabel = (status) => (status === 'Approved' ? 'Donated Successfully' : status);
  const toggleMessage = (id) => setOpenMessages((prev) => ({ ...prev, [id]: !prev[id] }));

  return (
    <div>
      <div style={{ display: 'flex', gap: 4, borderBottom: '1px solid #e5e7eb', marginBottom: 20, padding: '0 4px', overflowX: 'auto' }}>
        {tabs.map((t) => {
          const Icon = t.icon;
          const active = tab === t.key;
          return (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '14px 18px',
                border: 'none',
                background: 'none',
                borderBottom: active ? `2.5px solid ${t.color}` : '2.5px solid transparent',
                fontWeight: active ? 700 : 500,
                fontSize: 14.5,
                color: active ? t.color : '#6b7280',
                cursor: 'pointer',
                transition: 'color 0.15s ease',
                whiteSpace: 'nowrap',
              }}
            >
              <Icon size={16} fill={active ? t.color : 'none'} color={active ? t.color : '#9ca3af'} />
              {t.label}
            </button>
          );
        })}
      </div>

      {tab === 'donations' && (
        donations.length === 0 ? <p style={{ padding: '0 20px' }}>No donations yet.</p> : (
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
                  />
                ))}
              </div>
            ) : (
              <div style={{ borderRadius: 12, overflowX: 'auto', WebkitOverflowScrolling: 'touch', border: '1px solid #f1f5f9' }}>
                <table style={{ width: '100%', minWidth: 700, borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={gradientHeader}>
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
                        <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                          <td style={tdStyle}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                              <RowIcon index={i} />
                              <div>
                                <div style={{ fontWeight: 600, color: '#111827' }}>{d.campaignTitle}</div>
                                {d.adminMessage && (
                                  <button
                                    onClick={() => toggleMessage(d.donationId)}
                                    style={{
                                      display: 'inline-flex', alignItems: 'center', gap: 5,
                                      background: 'none', border: 'none',
                                      padding: 0, fontSize: 12.5, cursor: 'pointer', color: '#7c3aed',
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
                          <td style={{ ...tdStyle, color: '#16a34a', fontWeight: 700 }}>₹{d.amount.toLocaleString()}</td>
                          <td style={tdStyle}>
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
                          <td style={{ ...tdStyle, color: '#6b7280' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                              <Calendar size={13} color="#9ca3af" />
                              {new Date(d.date).toLocaleDateString()}
                            </div>
                          </td>
                        </tr>
                        {d.adminMessage && openMessages[d.donationId] && (
                          <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                            <td colSpan={5} style={{ padding: '0 20px 14px 70px' }}>
                              <div
                                style={{
                                  fontSize: 13,
                                  color: '#4b5563',
                                  fontStyle: 'italic',
                                  background: '#f9fafb',
                                  border: '1px solid #f0f0f0',
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

            <StatsFooter donations={donations} />
          </>
        )
      )}

      {tab === 'applications' && (
        applications.length === 0 ? <p style={{ padding: '0 20px' }}>No applications yet.</p> : (
          isMobile ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {applications.map((a, i) => (
                <ApplicationMobileCard key={a.applicationId} a={a} index={i} />
              ))}
            </div>
          ) : (
            <div style={{ borderRadius: 12, overflowX: 'auto', WebkitOverflowScrolling: 'touch', border: '1px solid #f1f5f9' }}>
              <table style={{ width: '100%', minWidth: 700, borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={gradientHeader}>
                    <th style={thStyle}>Type</th>
                    <th style={thStyle}>Amount Requested</th>
                    <th style={thStyle}>Status</th>
                    <th style={thStyle}>Document</th>
                    <th style={thStyle}>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {applications.map((a, i) => (
                    <tr key={a.applicationId} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={tdStyle}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <RowIcon index={i} />
                          <span style={{ fontWeight: 600, color: '#111827' }}>{a.type}</span>
                        </div>
                      </td>
                      <td style={{ ...tdStyle, color: '#2563eb', fontWeight: 700 }}>₹{a.amountRequired.toLocaleString()}</td>
                      <td style={tdStyle}><span className="badge badge-info">{a.status}</span></td>
                      <td style={tdStyle}>{a.documentPath ? <a href={a.documentPath} target="_blank" rel="noreferrer">View</a> : '-'}</td>
                      <td style={{ ...tdStyle, color: '#6b7280' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <Calendar size={13} color="#9ca3af" />
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
        aidReceived.length === 0 ? <p style={{ padding: '0 20px' }}>No aid delivered yet.</p> : (
          isMobile ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {aidReceived.map((d, i) => (
                <AidMobileCard key={d.aidDeliveryId} d={d} index={i} />
              ))}
            </div>
          ) : (
            <div style={{ borderRadius: 12, overflowX: 'auto', WebkitOverflowScrolling: 'touch', border: '1px solid #f1f5f9' }}>
              <table style={{ width: '100%', minWidth: 700, borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={gradientHeader}>
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
                    <tr key={d.aidDeliveryId} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={tdStyle}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <RowIcon index={i} />
                          <span style={{ fontWeight: 600, color: '#111827' }}>#{d.applicationId}</span>
                        </div>
                      </td>
                      <td style={{ ...tdStyle, color: '#9333ea', fontWeight: 700 }}>₹{d.amountDelivered.toLocaleString()}</td>
                      <td style={tdStyle}>{d.method}</td>
                      <td style={tdStyle}><span className="badge badge-success">{d.status}</span></td>
                      <td style={tdStyle}>{d.notes || '-'}</td>
                      <td style={{ ...tdStyle, color: '#6b7280' }}>
                        {d.deliveredAt ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <Calendar size={13} color="#9ca3af" />
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