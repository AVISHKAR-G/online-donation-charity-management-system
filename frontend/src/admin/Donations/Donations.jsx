import { useEffect, useState } from 'react';
import Sidebar from '../../components/Sidebar';
import Loader from '../../components/Loader';
import { donationService } from '../../services/donationService';
import { toast } from 'react-toastify';
import {
  User, Gift, IndianRupee, CreditCard, ShieldCheck, Calendar, Settings,
  CheckCircle2, Trash2, GraduationCap, Building2, BookOpen, Monitor,
  Heart, MessageCircle,
} from 'lucide-react';

/* ---------- helpers ---------- */

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

/* small UPI-style icon (saffron/green flag mark) */
function UpiIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14">
      <path d="M2 1 L2 13 L12 7 Z" fill="#f97316" />
      <path d="M2 7 L2 13 L12 7 Z" fill="#16a34a" />
    </svg>
  );
}

/* decorative header illustration: hand holding heart + leaves */
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

/* ---------- main component ---------- */

export default function AdminDonations() {
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);

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

        {/* Table card */}
        <div className="card" style={{ padding: 0, overflow: 'hidden', borderRadius: 14 }}>
          {loading ? (
            <div style={{ padding: 30 }}><Loader /></div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: 'linear-gradient(90deg, #3b82f6, #2563eb)' }}>
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
                          color: '#fff', textAlign: 'left', padding: '14px 18px',
                          fontSize: 13, fontWeight: 700, letterSpacing: 0.4, whiteSpace: 'nowrap',
                        }}
                      >
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                          <Icon size={14} /> {label}
                        </span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {donations.map((d, i) => {
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
                          {d.status === 'Pending' && (
                            <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
                              <button className="btn btn-sm btn-success" onClick={() => handleStatusChange(d.donationId, 'Approved')}>
                                Approve
                              </button>
                              <button className="btn btn-sm btn-danger" onClick={() => handleStatusChange(d.donationId, 'Rejected')}>
                                Reject
                              </button>
                            </div>
                          )}
                        </td>
                        <td style={{ padding: '14px 18px', color: '#6b7280', whiteSpace: 'nowrap' }}>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                            <Calendar size={13} color="#93c5fd" />
                            {new Date(d.date).toLocaleDateString()}
                          </span>
                        </td>
                        <td style={{ padding: '14px 18px' }}>
                          <button
                            disabled={deletingId === d.donationId}
                            onClick={() => handleDelete(d.donationId, d.donorName)}
                            style={{
                              display: 'inline-flex', alignItems: 'center', gap: 6,
                              background: '#fee2e2', color: '#dc2626', border: 'none',
                              borderRadius: 8, padding: '8px 14px', fontWeight: 600,
                              fontSize: 13, cursor: 'pointer',
                            }}
                          >
                            <Trash2 size={14} />
                            {deletingId === d.donationId ? '...' : 'Delete'}
                          </button>
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