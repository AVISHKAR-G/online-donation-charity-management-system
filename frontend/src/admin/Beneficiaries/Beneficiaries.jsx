import { useEffect, useState } from 'react';
import Sidebar from '../../components/Sidebar';
import Loader from '../../components/Loader';
import { assistanceApplicationService } from '../../services/assistanceApplicationService';
import { campaignService } from '../../services/campaignService';
import { API_ORIGIN } from '../../services/api';
import {
  User, Tag, IndianRupee, FileText, Flag, Settings,
  HeartPulse, GraduationCap, Utensils, HelpCircle,
  XCircle, CheckCircle2, MessageCircle,
} from 'lucide-react';

const STATUS = { Pending: 0, UnderVerification: 1, Approved: 2, Rejected: 3, FundAllocated: 4 };

/* ---------- visual helpers ---------- */

function typeIcon(type = '') {
  const t = type.toLowerCase();
  if (t.includes('medical')) return HeartPulse;
  if (t.includes('education')) return GraduationCap;
  if (t.includes('food')) return Utensils;
  return HelpCircle;
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

export default function Beneficiaries() {
  const [applications, setApplications] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [allocating, setAllocating] = useState(null);
  const [allocateForm, setAllocateForm] = useState({ campaignId: '', allocatedAmount: '' });

  const load = () => {
    setLoading(true);
    Promise.all([
      assistanceApplicationService.getAll(),
      campaignService.getAll(),
    ]).then(([apps, camps]) => {
      setApplications(apps);
      setCampaigns(camps);
    }).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleStatusChange = async (id, status) => {
    await assistanceApplicationService.updateStatus(id, status);
    load();
  };

  const openAllocate = (id, requestedAmount) => {
    setAllocating(id);
    setAllocateForm({ campaignId: '', allocatedAmount: requestedAmount });
  };

  const submitAllocate = async (id) => {
    if (!allocateForm.campaignId || !allocateForm.allocatedAmount) return;
    await assistanceApplicationService.allocateFunds(id, allocateForm.campaignId, allocateForm.allocatedAmount);
    setAllocating(null);
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
          }}
        >
          <h1 style={{ margin: 0, fontWeight: 800, color: '#111827', fontSize: 30 }}>Beneficiary Applications</h1>
          <div style={{ width: 40, height: 3, borderRadius: 2, background: '#2563eb', marginTop: 8 }} />
          <DotGrid style={{ position: 'absolute', right: 20, top: 14, opacity: 0.6 }} />
        </div>

        {/* Table card */}
        <div className="card" style={{ padding: 0, overflow: 'hidden', borderRadius: 14 }}>
          {loading ? (
            <div style={{ padding: 30 }}><Loader /></div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e5e7eb' }}>
                    {[
                      { icon: User, label: 'APPLICANT' },
                      { icon: Tag, label: 'TYPE' },
                      { icon: IndianRupee, label: 'AMOUNT REQUESTED' },
                      { icon: FileText, label: 'DOCUMENT' },
                      { icon: Flag, label: 'STATUS' },
                      { icon: Settings, label: 'ACTIONS' },
                    ].map(({ icon: Icon, label }) => (
                      <th
                        key={label}
                        style={{
                          textAlign: 'left', padding: '14px 18px', color: '#374151',
                          fontSize: 13, fontWeight: 700, letterSpacing: 0.4, whiteSpace: 'nowrap',
                        }}
                      >
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                          <Icon size={14} color="#2563eb" /> {label}
                        </span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {applications.map((a, i) => {
                    const TypeIcon = typeIcon(a.type);
                    const st = statusStyle(a.status);
                    const docUrl = a.documentPath ? API_ORIGIN + a.documentPath : null;
                    return (
                      <tr
                        key={a.applicationId}
                        style={{
                          borderBottom: '1px solid #f1f5f9',
                          background: i % 2 === 1 ? '#fafbff' : '#fff',
                        }}
                      >
                        <td style={{ padding: '14px 18px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <div
                              style={{
                                width: 36, height: 36, borderRadius: '50%', background: '#eff6ff',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                              }}
                            >
                              <User size={16} color="#2563eb" />
                            </div>
                            <div>
                              <div style={{ fontWeight: 700, color: '#111827' }}>{a.fullName}</div>
                              <div style={{ fontSize: 12, color: '#6b7280' }}>{a.email} · {a.phone}</div>
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: '14px 18px' }}>
                          <span style={{
                            display: 'inline-flex', alignItems: 'center', gap: 6,
                            background: '#dbeafe', color: '#1d4ed8',
                            padding: '4px 12px', borderRadius: 20, fontSize: 13, fontWeight: 600,
                          }}>
                            <TypeIcon size={13} /> {a.type}
                          </span>
                        </td>
                        <td style={{ padding: '14px 18px', fontWeight: 600, color: '#111827' }}>
                          ₹{a.amountRequired.toLocaleString()}
                        </td>
                        <td style={{ padding: '14px 18px' }}>
                          {docUrl ? (
                            <a
                              href={docUrl}
                              target="_blank"
                              rel="noreferrer"
                              style={{
                                display: 'inline-flex', alignItems: 'center', gap: 6,
                                background: '#eff6ff', color: '#2563eb', border: '1px solid #bfdbfe',
                                borderRadius: 8, padding: '6px 12px', fontSize: 13, fontWeight: 600,
                                textDecoration: 'none',
                              }}
                            >
                              <FileText size={13} /> View Document
                            </a>
                          ) : (
                            <span style={{ color: '#9ca3af', fontSize: 13 }}>None</span>
                          )}
                        </td>
                        <td style={{ padding: '14px 18px' }}>
                          <span
                            style={{
                              display: 'inline-flex', alignItems: 'center', gap: 6,
                              background: st.bg, color: st.fg,
                              padding: '5px 12px', borderRadius: 20, fontSize: 13, fontWeight: 600,
                            }}
                          >
                            {a.status === 'Rejected' && <XCircle size={13} />}
                            {a.status === 'FundAllocated' && <CheckCircle2 size={13} />}
                            {a.status}
                          </span>
                        </td>
                        <td style={{ padding: '14px 18px', minWidth: 170 }}>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                            {a.status === 'Pending' && (
                              <button className="btn btn-sm btn-primary"
                                onClick={() => handleStatusChange(a.applicationId, STATUS.UnderVerification)}>
                                Start Verification
                              </button>
                            )}
                            {(a.status === 'Pending' || a.status === 'UnderVerification') && (
                              <>
                                <button className="btn btn-sm btn-success"
                                  onClick={() => handleStatusChange(a.applicationId, STATUS.Approved)}>
                                  Approve
                                </button>
                                <button className="btn btn-sm btn-danger"
                                  onClick={() => handleStatusChange(a.applicationId, STATUS.Rejected)}>
                                  Reject
                                </button>
                              </>
                            )}
                            {a.status === 'Approved' && allocating !== a.applicationId && (
                              <button className="btn btn-sm btn-primary"
                                onClick={() => openAllocate(a.applicationId, a.amountRequired)}>
                                Allocate Funds
                              </button>
                            )}
                            {allocating === a.applicationId && (
                              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                                <select
                                  value={allocateForm.campaignId}
                                  onChange={(e) => setAllocateForm({ ...allocateForm, campaignId: e.target.value })}
                                >
                                  <option value="">Select campaign</option>
                                  {campaigns.map((c) => (
                                    <option key={c.campaignId} value={c.campaignId}>{c.title}</option>
                                  ))}
                                </select>
                                <input
                                  type="number" min="1" placeholder="Amount"
                                  value={allocateForm.allocatedAmount}
                                  onChange={(e) => setAllocateForm({ ...allocateForm, allocatedAmount: e.target.value })}
                                />
                                <button className="btn btn-sm btn-success" onClick={() => submitAllocate(a.applicationId)}>
                                  Confirm
                                </button>
                                <button className="btn btn-sm" onClick={() => setAllocating(null)}>Cancel</button>
                              </div>
                            )}
                            {a.status === 'FundAllocated' && (
                              <span style={{
                                display: 'inline-flex', alignItems: 'center', gap: 5,
                                color: '#16a34a', fontSize: 13, fontWeight: 600,
                              }}>
                                <CheckCircle2 size={14} /> Funded
                              </span>
                            )}
                            {a.status === 'Rejected' && (
                              <span style={{ color: '#9ca3af', fontSize: 13 }}>—</span>
                            )}
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