import { useEffect, useState } from 'react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import Loader from '../../components/Loader';
import { donationService } from '../../services/donationService';
import { donorService } from '../../services/donorService';
import { useAuth } from '../../context/AuthContext';
import {
  Pencil, Heart, FileText, Calendar, CheckCircle2, ChevronRight,
  GraduationCap, Building2, BookOpen, Landmark, HeartHandshake,
} from 'lucide-react';

const rowThemes = [
  { border: '#2563eb', iconBg: '#dbeafe', iconFg: '#2563eb', icon: GraduationCap },
  { border: '#7c3aed', iconBg: '#ede9fe', iconFg: '#7c3aed', icon: Building2 },
  { border: '#db2777', iconBg: '#fce7f3', iconFg: '#db2777', icon: Building2 },
  { border: '#ea580c', iconBg: '#ffedd5', iconFg: '#ea580c', icon: Building2 },
  { border: '#16a34a', iconBg: '#dcfce7', iconFg: '#16a34a', icon: Building2 },
];

function DonationBoxIllustration() {
  return (
    <svg width="220" height="180" viewBox="0 0 220 180" fill="none">
      <circle cx="150" cy="70" r="65" fill="#fff" opacity="0.08" />
      {/* leaves */}
      <path d="M40 170 C35 130, 55 105, 85 100" stroke="#a78bfa" strokeWidth="10" strokeLinecap="round" fill="none" opacity="0.6" />
      <path d="M55 172 C52 140, 68 118, 95 112" stroke="#c4b5fd" strokeWidth="8" strokeLinecap="round" fill="none" opacity="0.5" />
      {/* box */}
      <rect x="90" y="110" width="90" height="60" rx="8" fill="#4338ca" />
      <rect x="90" y="110" width="90" height="16" rx="8" fill="#3730a3" />
      <circle cx="135" cy="150" r="14" fill="#fff" opacity="0.9" />
      <path d="M135 144 c-3-4-9-2-9 2 c0 4 9 9 9 9 s9-5 9-9 c0-4-6-6-9-2z" fill="#4338ca" />
      {/* coins */}
      <circle cx="115" cy="105" r="9" fill="#fbbf24" stroke="#f59e0b" strokeWidth="1.5" />
      <circle cx="140" cy="98" r="9" fill="#fbbf24" stroke="#f59e0b" strokeWidth="1.5" />
      <circle cx="160" cy="108" r="8" fill="#fbbf24" stroke="#f59e0b" strokeWidth="1.5" />
      {/* hearts */}
      <path d="M155 60 c-6-10-24-6-24 8 c0 12 24 26 24 26 s24-14 24-26 c0-14-18-18-24-8z" fill="#f87171" />
      <path d="M110 55 c-3-5-13-3-13 4 c0 6 13 13 13 13 s13-7 13-13 c0-7-10-9-13-4z" fill="#f472b6" opacity="0.9" />
      <path d="M185 90 c-2-4-10-2-10 3 c0 5 10 10 10 10 s10-5 10-10 c0-5-8-7-10-3z" fill="#fb923c" opacity="0.8" />
      {/* sparkles */}
      <g fill="#c4b5fd">
        <circle cx="60" cy="60" r="2.5" />
        <circle cx="195" cy="140" r="2.5" />
        <circle cx="200" cy="50" r="2" />
      </g>
    </svg>
  );
}

function getInitials(name) {
  if (!name) return '';
  return name.trim().split(/\s+/).slice(0, 2).map((w) => w[0]).join('').toUpperCase();
}

export default function Profile() {
  const { user } = useAuth();
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);

  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: '', email: '' });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    donationService.myDonations().then(setDonations).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (user) setForm({ name: user.name, email: user.email });
  }, [user]);

  const totalDonated = donations.reduce((sum, d) => sum + d.amount, 0);
  const totalTransactions = donations.length;

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    try {
      await donorService.updateMyProfile(form);
      setMessage('Profile updated successfully.');
      setEditing(false);
    } catch {
      setMessage('Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <Navbar />
      <div style={{ background: '#f5f3ff', padding: '32px 20px' }}>
        <div className="container" style={{ padding: 0 }}>
          {/* Profile header banner — solid gradient */}
          <div
            style={{
              position: 'relative',
              overflow: 'hidden',
              borderRadius: 22,
              background: 'linear-gradient(115deg, #2563eb 0%, #4f46e5 45%, #7c3aed 100%)',
              padding: '32px 36px',
              marginBottom: 32,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 24,
              flexWrap: 'wrap',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 20, flex: 1, minWidth: 280, position: 'relative', zIndex: 1 }}>
              <div
                style={{
                  width: 68,
                  height: 68,
                  borderRadius: '50%',
                  background: 'rgba(255,255,255,0.12)',
                  border: '2px solid rgba(255,255,255,0.5)',
                  boxShadow: '0 0 0 6px rgba(255,255,255,0.06)',
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: 20,
                  flexShrink: 0,
                }}
              >
                {getInitials(user?.name)}
              </div>

              <div style={{ flex: 1 }}>
                {!editing ? (
                  <>
                    <h2 style={{ margin: 0, fontWeight: 800, color: '#fff', fontSize: 26 }}>{user?.name}</h2>
                    <p style={{ color: 'rgba(255,255,255,0.85)', margin: '4px 0 20px' }}>{user?.email}</p>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap', marginBottom: 20 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{
                          width: 40, height: 40, borderRadius: '50%', background: 'rgba(255,255,255,0.15)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                        }}>
                          <Heart size={18} color="#fff" fill="#fff" />
                        </div>
                        <div>
                          <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.8)' }}>Total Donated</div>
                          <div style={{ fontWeight: 700, color: '#fff', fontSize: 18 }}>₹{totalDonated.toLocaleString()}</div>
                        </div>
                      </div>

                      <div style={{ width: 1, height: 34, background: 'rgba(255,255,255,0.25)' }} />

                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{
                          width: 40, height: 40, borderRadius: '50%', background: 'rgba(255,255,255,0.15)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                        }}>
                          <FileText size={17} color="#fff" />
                        </div>
                        <div>
                          <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.8)' }}>Total Transactions</div>
                          <div style={{ fontWeight: 700, color: '#fff', fontSize: 18 }}>{totalTransactions}</div>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => setEditing(true)}
                      style={{
                        display: 'inline-flex', alignItems: 'center', gap: 8,
                        background: '#fff',
                        color: '#4338ca', border: 'none', borderRadius: 10,
                        padding: '10px 20px', fontWeight: 700, fontSize: 14, cursor: 'pointer',
                      }}
                    >
                      <Pencil size={14} /> Edit Profile
                    </button>
                  </>
                ) : (
                  <form onSubmit={handleSave} style={{ maxWidth: 360 }}>
                    <label style={{ color: '#fff' }}>Name</label>
                    <input
                      type="text"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      style={{ width: '100%', padding: 8, marginTop: 4, marginBottom: 12, borderRadius: 8, border: 'none' }}
                    />
                    <label style={{ color: '#fff' }}>Email</label>
                    <input
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      style={{ width: '100%', padding: 8, marginTop: 4, marginBottom: 12, borderRadius: 8, border: 'none' }}
                    />
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button
                        type="submit"
                        disabled={saving}
                        style={{
                          background: '#fff', color: '#4338ca', border: 'none', borderRadius: 8,
                          padding: '9px 18px', fontWeight: 700, fontSize: 14, cursor: 'pointer',
                        }}
                      >
                        {saving ? 'Saving...' : 'Save Changes'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditing(false)}
                        style={{
                          background: 'rgba(255,255,255,0.15)', color: '#fff', border: '1px solid rgba(255,255,255,0.4)',
                          borderRadius: 8, padding: '9px 18px', fontWeight: 600, fontSize: 14, cursor: 'pointer',
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                    {message && <p style={{ marginTop: 10, color: '#fff' }}>{message}</p>}
                  </form>
                )}
              </div>
            </div>

            <div style={{ position: 'relative', zIndex: 1 }}>
              <DonationBoxIllustration />
            </div>
          </div>

          {/* Donation History header + filter */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
            <div>
              <h3 style={{ margin: 0, fontWeight: 800, color: '#111827' }}>Donation History</h3>
              <div style={{
                width: 48, height: 3, borderRadius: 2, marginTop: 6,
                background: 'linear-gradient(90deg, #7c3aed, #ec4899)',
              }} />
            </div>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10,
              padding: '8px 14px', fontSize: 14, fontWeight: 600, color: '#374151',
            }}>
              <Calendar size={15} color="#6b7280" /> All Time
            </div>
          </div>

          {loading ? (
            <Loader label="Loading your donations..." />
          ) : donations.length === 0 ? (
            <p>You haven't made any donations yet.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {donations.map((d, i) => {
                const theme = rowThemes[i % rowThemes.length];
                const Icon = i === 0 ? GraduationCap : Building2;
                return (
                  <div
                    key={d.donationId}
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      background: '#fff', borderRadius: 12,
                      borderLeft: `4px solid ${theme.border}`,
                      padding: '14px 20px',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                      <div style={{
                        width: 42, height: 42, borderRadius: '50%', background: theme.iconBg,
                        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                      }}>
                        <Icon size={19} color={theme.iconFg} />
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, color: '#1e1b4b' }}>{d.campaignTitle}</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: '#9ca3af', fontSize: 13 }}>
                          <Calendar size={12} />
                          {new Date(d.date).toLocaleString()}
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontWeight: 800, fontSize: 17, color: '#16a34a' }}>
                          ₹{d.amount.toLocaleString()}
                        </div>
                        <span style={{
                          display: 'inline-flex', alignItems: 'center', gap: 4,
                          background: '#dcfce7', color: '#16a34a', fontSize: 12, fontWeight: 600,
                          borderRadius: 20, padding: '2px 10px', marginTop: 4,
                        }}>
                          <CheckCircle2 size={12} /> Success
                        </span>
                      </div>
                      <div style={{
                        width: 32, height: 32, borderRadius: '50%', background: '#f3f4f6',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                      }}>
                        <ChevronRight size={16} color="#9ca3af" />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}