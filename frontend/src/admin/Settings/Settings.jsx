import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import Topbar from '../../components/Topbar';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { authService } from '../../services/authService';
import { settingsService } from '../../services/settingsService';
import { securityService } from '../../services/securityService';
import { emailPreferencesService } from '../../services/emailPreferencesService';
import { activityLogService } from '../../services/activityLogService';
import {
  Settings as SettingsIcon, User, Lock, Bell, Shield, Palette, Mail,
  History, SlidersHorizontal, Pencil, Calendar, Check, X, ShieldCheck,
  Headphones, ChevronRight, Eye, EyeOff, Sun, Moon, Monitor as MonitorIcon,
  Smartphone, AlertTriangle, Trash2,
} from 'lucide-react';

function Toggle({ checked, onChange }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      style={{
        width: 42, height: 24, borderRadius: 999, border: 'none', cursor: 'pointer',
        background: checked ? '#2563eb' : '#d1d5db', position: 'relative', flexShrink: 0,
        transition: 'background 0.15s ease',
      }}
    >
      <span style={{
        position: 'absolute', top: 3, left: checked ? 21 : 3,
        width: 18, height: 18, borderRadius: '50%', background: '#fff',
        transition: 'left 0.15s ease', boxShadow: '0 1px 2px rgba(0,0,0,0.2)',
      }} />
    </button>
  );
}

function ToggleRow({ label, description, checked, onChange }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, padding: '14px 0', borderBottom: '1px solid #f1f5f9' }}>
      <div>
        <div style={{ fontWeight: 600, color: '#111827', fontSize: 14.5 }}>{label}</div>
        {description && <div style={{ color: '#6b7280', fontSize: 13, marginTop: 2 }}>{description}</div>}
      </div>
      <Toggle checked={checked} onChange={onChange} />
    </div>
  );
}

function TabHeader({ icon: Icon, title, subtitle }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18 }}>
      <div style={{ width: 40, height: 40, borderRadius: 10, background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Icon size={19} color="#2563eb" />
      </div>
      <div>
        <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: '#111827' }}>{title}</h2>
        <p style={{ margin: '2px 0 0', color: '#6b7280', fontSize: 13.5 }}>{subtitle}</p>
      </div>
    </div>
  );
}

function SaveBar({ onClick, saving }) {
  return (
    <button
      onClick={onClick}
      disabled={saving}
      style={{
        display: 'flex', alignItems: 'center', gap: 8, marginTop: 20,
        background: '#2563eb', color: '#fff', border: 'none',
        borderRadius: 10, padding: '11px 20px', fontWeight: 700, fontSize: 14,
        cursor: saving ? 'default' : 'pointer', opacity: saving ? 0.75 : 1,
      }}
    >
      <Check size={16} /> {saving ? 'Saving...' : 'Save Changes'}
    </button>
  );
}

const NAV_ITEMS = [
  { key: 'profile', label: 'Profile', icon: User },
  { key: 'password', label: 'Change Password', icon: Lock },
  { key: 'notifications', label: 'Notifications', icon: Bell },
  { key: 'security', label: 'Security', icon: Shield },
  { key: 'appearance', label: 'Appearance', icon: Palette },
  { key: 'emailPrefs', label: 'Email Preferences', icon: Mail },
  { key: 'activityLog', label: 'Activity Log', icon: History },
  { key: 'accountSettings', label: 'Account Settings', icon: SlidersHorizontal },
];

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

function GearShieldIllustration() {
  return (
    <svg width="180" height="110" viewBox="0 0 180 110" fill="none">
      <circle cx="20" cy="20" r="3" fill="#a5b4fc" opacity="0.6" />
      <circle cx="10" cy="40" r="2" fill="#a5b4fc" opacity="0.5" />
      <path d="M10 100 C 20 80, 30 75, 40 80" stroke="#bfdbfe" strokeWidth="5" fill="none" strokeLinecap="round" />
      <path d="M160 100 C 150 80, 140 75, 130 80" stroke="#bfdbfe" strokeWidth="5" fill="none" strokeLinecap="round" />

      <g transform="translate(55,20)">
        <circle cx="30" cy="30" r="26" fill="#2563eb" />
        <circle cx="30" cy="30" r="10" fill="#fff" />
        {Array.from({ length: 8 }).map((_, i) => {
          const angle = (i * Math.PI) / 4;
          const x1 = 30 + Math.cos(angle) * 26;
          const y1 = 30 + Math.sin(angle) * 26;
          const x2 = 30 + Math.cos(angle) * 34;
          const y2 = 30 + Math.sin(angle) * 34;
          return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#2563eb" strokeWidth="7" strokeLinecap="round" />;
        })}
      </g>

      <g transform="translate(115,15)">
        <path d="M25 0 L48 8 L48 30 C 48 48, 36 58, 25 63 C 14 58, 2 48, 2 30 L2 8 Z" fill="#fff" stroke="#2563eb" strokeWidth="3" />
        <rect x="16" y="30" width="18" height="16" rx="3" fill="#2563eb" />
        <path d="M19 30 v-6 a6 6 0 0 1 12 0 v6" stroke="#2563eb" strokeWidth="3" fill="none" />
      </g>
    </svg>
  );
}

function initials(name = '') {
  return name.trim().slice(0, 1).toUpperCase() || 'A';
}

function formatDate(value) {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
}

export default function Settings() {
  const { user } = useAuth();
  const { theme, setTheme } = useTheme();
  const initialForm = { name: user?.name || '', email: user?.email || '' };
  const [form, setForm] = useState(initialForm);
  const [activeTab, setActiveTab] = useState('profile');
  const [saving, setSaving] = useState(false);

  // Change Password
  const [pwForm, setPwForm] = useState({ current: '', next: '', confirm: '' });
  const [showPw, setShowPw] = useState({ current: false, next: false, confirm: false });
  const [pwSaving, setPwSaving] = useState(false);

  // Notifications — wired to the backend via settingsService
  const [notifications, setNotifications] = useState({
    emailAlerts: true,
    donorSignups: true,
    campaignMilestones: true,
    weeklyDigest: false,
  });
  const [notifLoading, setNotifLoading] = useState(true);
  const [notifSaving, setNotifSaving] = useState(false);

  useEffect(() => {
    settingsService.getNotificationPreferences()
      .then((data) => setNotifications(data))
      .catch(() => toast.error('Could not load notification preferences.'))
      .finally(() => setNotifLoading(false));
  }, []);

  const saveNotificationPrefs = async () => {
    setNotifSaving(true);
    try {
      const updated = await settingsService.updateNotificationPreferences(notifications);
      setNotifications(updated);
      toast.success('Notification preferences saved.');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to save notification preferences.');
    } finally {
      setNotifSaving(false);
    }
  };

  // Security — wired to the backend via securityService
  const [twoFactor, setTwoFactor] = useState(false);
  const [loginAlerts, setLoginAlerts] = useState(true);
  const [securityLoading, setSecurityLoading] = useState(true);
  const [securitySaving, setSecuritySaving] = useState(false);

  useEffect(() => {
    securityService.getSecuritySettings()
      .then((data) => {
        setTwoFactor(data.twoFactorEnabled);
        setLoginAlerts(data.loginAlertsEnabled);
      })
      .catch(() => toast.error('Could not load security settings.'))
      .finally(() => setSecurityLoading(false));
  }, []);

  const saveSecuritySettings = async () => {
    setSecuritySaving(true);
    try {
      const updated = await securityService.updateSecuritySettings({
        twoFactorEnabled: twoFactor,
        loginAlertsEnabled: loginAlerts,
      });
      setTwoFactor(updated.twoFactorEnabled);
      setLoginAlerts(updated.loginAlertsEnabled);
      toast.success('Security settings saved.');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to save security settings.');
    } finally {
      setSecuritySaving(false);
    }
  };

  // Email Preferences — now wired to the backend via emailPreferencesService
  const [emailPrefs, setEmailPrefs] = useState({
    donorReceipts: true,
    monthlyReports: true,
    productUpdates: false,
  });
  const [emailPrefsLoading, setEmailPrefsLoading] = useState(true);
  const [emailPrefsSaving, setEmailPrefsSaving] = useState(false);

  useEffect(() => {
    emailPreferencesService.getEmailPreferences()
      .then((data) => setEmailPrefs(data))
      .catch(() => toast.error('Could not load email preferences.'))
      .finally(() => setEmailPrefsLoading(false));
  }, []);

  const saveEmailPrefs = async () => {
    setEmailPrefsSaving(true);
    try {
      const updated = await emailPreferencesService.updateEmailPreferences(emailPrefs);
      setEmailPrefs(updated);
      toast.success('Email preferences saved.');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to save email preferences.');
    } finally {
      setEmailPrefsSaving(false);
    }
  };

  const role = user?.role || 'Administrator';
  const memberSince = formatDate(user?.createdAt);

  // Activity Log — wired to the backend via activityLogService
  const [activityLog, setActivityLog] = useState([]);
  const [activityLoading, setActivityLoading] = useState(true);
  const [activityError, setActivityError] = useState(false);

  useEffect(() => {
    if (activeTab !== 'activityLog') return;
    setActivityLoading(true);
    setActivityError(false);
    activityLogService.getRecent()
      .then((data) => setActivityLog(data))
      .catch(() => setActivityError(true))
      .finally(() => setActivityLoading(false));
  }, [activeTab]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim()) {
      toast.error('Name and email are required.');
      return;
    }
    setSaving(true);
    try {
      // NOTE: no update-profile service call exists yet for admin settings —
      // this currently just confirms the form is valid, same as before.
      await new Promise((r) => setTimeout(r, 400));
      toast.success('Settings saved');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => setForm(initialForm);

  const notBuilt = (label) => toast.info(`${label} isn't available yet.`);

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (!pwForm.current || !pwForm.next || !pwForm.confirm) {
      toast.error('Fill in all three password fields.');
      return;
    }
    if (pwForm.next.length < 8) {
      toast.error('New password must be at least 8 characters.');
      return;
    }
    if (pwForm.next !== pwForm.confirm) {
      toast.error('New password and confirmation do not match.');
      return;
    }
    setPwSaving(true);
    try {
      // Assumes authService.changePassword(currentPassword, newPassword) exists.
      // If your actual endpoint/method name differs, update this call.
      await authService.changePassword(pwForm.current, pwForm.next);
      toast.success('Password updated successfully.');
      setPwForm({ current: '', next: '', confirm: '' });
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to update password. Please try again.');
    } finally {
      setPwSaving(false);
    }
  };

  const activeNav = NAV_ITEMS.find((n) => n.key === activeTab);

  return (
    <div style={{ background: '#f8fafc', minHeight: '100vh' }}>
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
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, zIndex: 1 }}>
            <div style={{
              width: 48, height: 48, borderRadius: '50%', background: '#2563eb',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              <SettingsIcon size={22} color="#fff" />
            </div>
            <div>
              <h1 style={{ margin: 0, fontWeight: 800, color: '#111827', fontSize: 28 }}>Settings</h1>
              <p style={{ margin: '4px 0 0', color: '#6b7280', fontSize: 14 }}>
                Manage your account preferences and information
              </p>
            </div>
          </div>
          <div style={{ position: 'relative', zIndex: 1 }}>
            <DotGrid style={{ position: 'absolute', right: 200, top: -10, opacity: 0.6 }} />
            <GearShieldIllustration />
          </div>
        </div>

        {/* Sidebar + content */}
        <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start', flexWrap: 'wrap' }}>

          {/* Sidebar */}
          <div style={{ flex: '0 0 280px', display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ background: '#fff', border: '1px solid #eef1f6', borderRadius: 16, padding: 8 }}>
              {NAV_ITEMS.map(({ key, label, icon: Icon }) => {
                const active = key === activeTab;
                return (
                  <button
                    key={key}
                    onClick={() => setActiveTab(key)}
                    style={{
                      width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                      padding: '10px 14px', borderRadius: 10, marginBottom: 2,
                      border: 'none', cursor: 'pointer', textAlign: 'left',
                      background: active ? 'linear-gradient(135deg, #3b82f6, #2563eb)' : 'transparent',
                      color: active ? '#fff' : '#374151',
                      fontWeight: active ? 700 : 500, fontSize: 14,
                      boxShadow: active ? '0 2px 8px rgba(37,99,235,0.3)' : 'none',
                    }}
                  >
                    <Icon size={17} color={active ? '#fff' : '#6b7280'} />
                    {label}
                  </button>
                );
              })}
            </div>

            <div style={{
              background: '#eff6ff', border: '1px solid #dbeafe', borderRadius: 16,
              padding: 20, textAlign: 'left',
            }}>
              <div style={{
                width: 42, height: 42, borderRadius: '50%', background: '#2563eb',
                display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12,
              }}>
                <Headphones size={19} color="#fff" />
              </div>
              <div style={{ fontWeight: 700, color: '#111827', fontSize: 15, marginBottom: 4 }}>Need Help?</div>
              <div style={{ color: '#6b7280', fontSize: 13.5, marginBottom: 14 }}>
                Contact our support team for assistance.
              </div>
              <button
                onClick={() => notBuilt('Contact Support')}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                  background: '#fff', color: '#2563eb', border: '1px solid #bfdbfe',
                  borderRadius: 10, padding: '10px 14px', fontWeight: 700, fontSize: 13.5, cursor: 'pointer',
                }}
              >
                Contact Support <ChevronRight size={14} />
              </button>
            </div>
          </div>

          {/* Main content */}
          <div style={{ flex: '1 1 500px', minWidth: 320 }}>
            <div className="card" style={{ borderRadius: 16, padding: 28 }}>

              {activeTab === 'profile' ? (
                <>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 18, marginBottom: 22 }}>
                    <div style={{ position: 'relative' }}>
                      <div style={{
                        width: 64, height: 64, borderRadius: '50%', background: '#2563eb',
                        color: '#fff', fontSize: 26, fontWeight: 700,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        {initials(form.name)}
                      </div>
                      <button
                        onClick={() => notBuilt('Photo upload')}
                        style={{
                          position: 'absolute', bottom: -2, right: -2, width: 26, height: 26,
                          borderRadius: '50%', background: '#fff', border: '1px solid #e5e7eb',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                        }}
                        title="Change photo"
                      >
                        <Pencil size={12} color="#374151" />
                      </button>
                    </div>
                    <div>
                      <h2 style={{ margin: 0, fontSize: 19, fontWeight: 800, color: '#111827' }}>Admin Profile</h2>
                      <p style={{ margin: '4px 0 0', color: '#6b7280', fontSize: 13.5 }}>
                        Update your personal information and profile details.
                      </p>
                    </div>
                  </div>

                  <div style={{ borderTop: '1px solid #f1f5f9', marginBottom: 22 }} />

                  <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start', flexWrap: 'wrap' }}>
                    <form onSubmit={handleSubmit} style={{ flex: '1 1 320px', minWidth: 260 }}>
                      <div style={{ marginBottom: 18 }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 14, fontWeight: 600, marginBottom: 6, color: '#111827' }}>
                          <User size={14} color="#2563eb" /> Full Name
                        </label>
                        <input
                          value={form.name}
                          onChange={(e) => setForm({ ...form, name: e.target.value })}
                          style={{
                            width: '100%', padding: '11px 14px', borderRadius: 10,
                            border: '1px solid #e5e7eb', fontSize: 14, boxSizing: 'border-box',
                          }}
                        />
                      </div>

                      <div style={{ marginBottom: 18 }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 14, fontWeight: 600, marginBottom: 6, color: '#111827' }}>
                          <Mail size={14} color="#2563eb" /> Email Address
                        </label>
                        <input
                          type="email"
                          value={form.email}
                          onChange={(e) => setForm({ ...form, email: e.target.value })}
                          style={{
                            width: '100%', padding: '11px 14px', borderRadius: 10,
                            border: '1px solid #e5e7eb', fontSize: 14, boxSizing: 'border-box',
                          }}
                        />
                      </div>

                      <div style={{ marginBottom: 18 }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 14, fontWeight: 600, marginBottom: 6, color: '#111827' }}>
                          <Shield size={14} color="#2563eb" /> Role
                        </label>
                        <input
                          value={role}
                          disabled
                          style={{
                            width: '100%', padding: '11px 14px', borderRadius: 10,
                            border: '1px solid #e5e7eb', fontSize: 14, boxSizing: 'border-box',
                            background: '#f3f4f6', color: '#6b7280',
                          }}
                        />
                      </div>

                      <div style={{ marginBottom: 22 }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 14, fontWeight: 600, marginBottom: 6, color: '#111827' }}>
                          <Calendar size={14} color="#2563eb" /> Member Since
                        </label>
                        <div style={{
                          display: 'flex', alignItems: 'center', gap: 8,
                          padding: '11px 14px', borderRadius: 10, background: '#eff6ff',
                          border: '1px solid #dbeafe', color: '#1e3a8a', fontSize: 14,
                        }}>
                          <Calendar size={14} color="#2563eb" /> {memberSince}
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: 10 }}>
                        <button
                          type="submit"
                          disabled={saving}
                          style={{
                            display: 'flex', alignItems: 'center', gap: 8,
                            background: '#2563eb', color: '#fff', border: 'none',
                            borderRadius: 10, padding: '11px 20px', fontWeight: 700, fontSize: 14,
                            cursor: saving ? 'default' : 'pointer', opacity: saving ? 0.75 : 1,
                          }}
                        >
                          <Check size={16} /> {saving ? 'Saving...' : 'Save Changes'}
                        </button>
                        <button
                          type="button"
                          onClick={handleCancel}
                          disabled={saving}
                          style={{
                            display: 'flex', alignItems: 'center', gap: 8,
                            background: '#fff', color: '#374151', border: '1px solid #e5e7eb',
                            borderRadius: 10, padding: '11px 20px', fontWeight: 700, fontSize: 14, cursor: 'pointer',
                          }}
                        >
                          <X size={16} /> Cancel
                        </button>
                      </div>
                    </form>

                    <div style={{
                      flex: '0 0 260px', background: '#eff6ff', border: '1px solid #dbeafe',
                      borderRadius: 14, padding: 18,
                    }}>
                      <div style={{
                        width: 34, height: 34, borderRadius: '50%', background: '#2563eb',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 10,
                      }}>
                        <ShieldCheck size={17} color="#fff" />
                      </div>
                      <div style={{ fontWeight: 700, color: '#1e3a8a', fontSize: 14.5, marginBottom: 4 }}>
                        Keep Your Account Secure
                      </div>
                      <div style={{ color: '#4b5563', fontSize: 13.5, lineHeight: 1.5 }}>
                        Update your information regularly to keep your account secure and up to date.
                      </div>
                    </div>
                  </div>
                </>
              ) : activeTab === 'password' ? (
                <>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18 }}>
                    <div style={{ width: 40, height: 40, borderRadius: 10, background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Lock size={19} color="#2563eb" />
                    </div>
                    <div>
                      <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: '#111827' }}>Change Password</h2>
                      <p style={{ margin: '2px 0 0', color: '#6b7280', fontSize: 13.5 }}>
                        Use a strong password you don't use anywhere else.
                      </p>
                    </div>
                  </div>

                  <form onSubmit={handlePasswordSubmit} style={{ maxWidth: 400 }}>
                    {['current', 'next', 'confirm'].map((field) => {
                      const labels = { current: 'Current Password', next: 'New Password', confirm: 'Confirm New Password' };
                      return (
                        <div key={field} style={{ marginBottom: 16 }}>
                          <label style={{ display: 'block', fontSize: 14, fontWeight: 600, marginBottom: 6, color: '#111827' }}>
                            {labels[field]}
                          </label>
                          <div style={{ position: 'relative' }}>
                            <input
                              type={showPw[field] ? 'text' : 'password'}
                              value={pwForm[field]}
                              onChange={(e) => setPwForm({ ...pwForm, [field]: e.target.value })}
                              style={{
                                width: '100%', padding: '11px 40px 11px 14px', borderRadius: 10,
                                border: '1px solid #e5e7eb', fontSize: 14, boxSizing: 'border-box',
                              }}
                            />
                            <button
                              type="button"
                              onClick={() => setShowPw({ ...showPw, [field]: !showPw[field] })}
                              style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer' }}
                            >
                              {showPw[field] ? <EyeOff size={16} color="#9ca3af" /> : <Eye size={16} color="#9ca3af" />}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                    <button
                      type="submit"
                      disabled={pwSaving}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 8,
                        background: '#2563eb', color: '#fff', border: 'none',
                        borderRadius: 10, padding: '11px 20px', fontWeight: 700, fontSize: 14,
                        cursor: pwSaving ? 'default' : 'pointer', opacity: pwSaving ? 0.75 : 1,
                      }}
                    >
                      <Check size={16} /> {pwSaving ? 'Updating...' : 'Update Password'}
                    </button>
                  </form>
                </>
              ) : activeTab === 'notifications' ? (
                <>
                  <TabHeader icon={Bell} title="Notifications" subtitle="Choose what you get notified about." />
                  {notifLoading ? (
                    <p style={{ color: '#6b7280', fontSize: 14 }}>Loading preferences...</p>
                  ) : (
                    <>
                      <ToggleRow label="Email Alerts" description="General account and activity emails" checked={notifications.emailAlerts} onChange={(v) => setNotifications({ ...notifications, emailAlerts: v })} />
                      <ToggleRow label="New Donor Signups" description="Get notified when a new donor registers" checked={notifications.donorSignups} onChange={(v) => setNotifications({ ...notifications, donorSignups: v })} />
                      <ToggleRow label="Campaign Milestones" description="When a campaign hits 25/50/75/100% funded" checked={notifications.campaignMilestones} onChange={(v) => setNotifications({ ...notifications, campaignMilestones: v })} />
                      <ToggleRow label="Weekly Digest" description="A weekly summary email every Monday" checked={notifications.weeklyDigest} onChange={(v) => setNotifications({ ...notifications, weeklyDigest: v })} />
                      <SaveBar onClick={saveNotificationPrefs} saving={notifSaving} />
                    </>
                  )}
                </>
              ) : activeTab === 'security' ? (
                <>
                  <TabHeader icon={Shield} title="Security" subtitle="Extra protection for your admin account." />
                  {securityLoading ? (
                    <p style={{ color: '#6b7280', fontSize: 14 }}>Loading security settings...</p>
                  ) : (
                    <>
                      <ToggleRow label="Two-Factor Authentication" description="Require a code from your phone when signing in" checked={twoFactor} onChange={setTwoFactor} />
                      <ToggleRow label="Login Alerts" description="Email me when there's a new sign-in to my account" checked={loginAlerts} onChange={setLoginAlerts} />
                      <div style={{ marginTop: 18 }}>
                        <div style={{ fontWeight: 700, color: '#111827', fontSize: 14.5, marginBottom: 10 }}>Active Sessions</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', border: '1px solid #f1f5f9', borderRadius: 10 }}>
                          <Smartphone size={18} color="#2563eb" />
                          <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 600, fontSize: 13.5, color: '#111827' }}>This device</div>
                            <div style={{ fontSize: 12.5, color: '#9ca3af' }}>Current session</div>
                          </div>
                          <span style={{ background: '#dcfce7', color: '#16a34a', padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 700 }}>Active</span>
                        </div>
                      </div>
                      <SaveBar onClick={saveSecuritySettings} saving={securitySaving} />
                    </>
                  )}
                </>
              ) : activeTab === 'appearance' ? (
                <>
                  <TabHeader icon={Palette} title="Appearance" subtitle="Choose how the admin panel looks." />
                  <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                    {[
                      { key: 'light', label: 'Light', icon: Sun },
                      { key: 'dark', label: 'Dark', icon: Moon },
                      { key: 'system', label: 'System', icon: MonitorIcon },
                    ].map(({ key, label, icon: Icon }) => (
                      <button
                        key={key}
                        onClick={() => setTheme(key)}
                        style={{
                          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
                          width: 110, padding: '18px 10px', borderRadius: 12, cursor: 'pointer',
                          border: theme === key ? '2px solid #2563eb' : '1px solid #e5e7eb',
                          background: theme === key ? '#eff6ff' : '#fff',
                        }}
                      >
                        <Icon size={22} color={theme === key ? '#2563eb' : '#6b7280'} />
                        <span style={{ fontSize: 13, fontWeight: 600, color: theme === key ? '#2563eb' : '#374151' }}>{label}</span>
                      </button>
                    ))}
                  </div>
                  <p style={{ marginTop: 16, color: '#6b7280', fontSize: 13 }}>
                    Applies instantly and is remembered on this device. Other pages built with hardcoded colors may not fully match yet.
                  </p>
                </>
              ) : activeTab === 'emailPrefs' ? (
                <>
                  <TabHeader icon={Mail} title="Email Preferences" subtitle="Control which emails go out from your account." />
                  {emailPrefsLoading ? (
                    <p style={{ color: '#6b7280', fontSize: 14 }}>Loading preferences...</p>
                  ) : (
                    <>
                      <ToggleRow label="Donor Receipts" description="Auto-send a receipt email after each donation" checked={emailPrefs.donorReceipts} onChange={(v) => setEmailPrefs({ ...emailPrefs, donorReceipts: v })} />
                      <ToggleRow label="Monthly Reports" description="Email yourself a campaign performance summary monthly" checked={emailPrefs.monthlyReports} onChange={(v) => setEmailPrefs({ ...emailPrefs, monthlyReports: v })} />
                      <ToggleRow label="Product Updates" description="Occasional emails about new admin panel features" checked={emailPrefs.productUpdates} onChange={(v) => setEmailPrefs({ ...emailPrefs, productUpdates: v })} />
                      <SaveBar onClick={saveEmailPrefs} saving={emailPrefsSaving} />
                    </>
                  )}
                </>
              ) : activeTab === 'activityLog' ? (
                <>
                  <TabHeader icon={History} title="Activity Log" subtitle="Recent actions on your account." />
                  {activityLoading ? (
                    <p style={{ color: '#6b7280', fontSize: 14 }}>Loading activity...</p>
                  ) : activityError ? (
                    <div style={{ padding: '40px 10px', textAlign: 'center' }}>
                      <div style={{
                        width: 52, height: 52, borderRadius: '50%', background: '#fef2f2',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px',
                      }}>
                        <AlertTriangle size={24} color="#dc2626" />
                      </div>
                      <h3 style={{ margin: '0 0 6px', fontSize: 16, fontWeight: 700, color: '#111827' }}>Couldn't load activity</h3>
                      <p style={{ margin: 0, color: '#6b7280', fontSize: 13.5 }}>
                        Something went wrong fetching your activity log. Try refreshing.
                      </p>
                    </div>
                  ) : activityLog.length === 0 ? (
                    <div style={{ padding: '40px 10px', textAlign: 'center' }}>
                      <div style={{
                        width: 52, height: 52, borderRadius: '50%', background: '#eff6ff',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px',
                      }}>
                        <History size={24} color="#2563eb" />
                      </div>
                      <h3 style={{ margin: '0 0 6px', fontSize: 16, fontWeight: 700, color: '#111827' }}>No activity recorded yet</h3>
                      <p style={{ margin: 0, color: '#6b7280', fontSize: 13.5 }}>
                        Actions like password changes and settings updates will show up here.
                      </p>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      {activityLog.map((entry) => (
                        <div
                          key={entry.activityLogId}
                          style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '14px 0', borderBottom: '1px solid #f1f5f9' }}
                        >
                          <div style={{
                            width: 34, height: 34, borderRadius: '50%', background: '#eff6ff',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                          }}>
                            <History size={16} color="#2563eb" />
                          </div>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 600, color: '#111827', fontSize: 14 }}>{entry.description}</div>
                            <div style={{ color: '#9ca3af', fontSize: 12.5, marginTop: 2 }}>
                              {new Date(entry.createdAt).toLocaleString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              ) : activeTab === 'accountSettings' ? (
                <>
                  <TabHeader icon={SlidersHorizontal} title="Account Settings" subtitle="Manage the lifecycle of your admin account." />
                  <div style={{ border: '1px solid #fecaca', borderRadius: 12, padding: 18, background: '#fef2f2' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                      <AlertTriangle size={17} color="#dc2626" />
                      <span style={{ fontWeight: 700, color: '#dc2626', fontSize: 14.5 }}>Danger Zone</span>
                    </div>
                    <p style={{ margin: '0 0 14px', color: '#7f1d1d', fontSize: 13.5 }}>
                      Deactivating or deleting your admin account isn't connected to a backend endpoint yet.
                    </p>
                    <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                      <button
                        onClick={() => notBuilt('Deactivate account')}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 8, background: '#fff', color: '#dc2626',
                          border: '1px solid #fca5a5', borderRadius: 10, padding: '10px 16px', fontWeight: 700, fontSize: 13.5, cursor: 'pointer',
                        }}
                      >
                        Deactivate Account
                      </button>
                      <button
                        onClick={() => notBuilt('Delete account')}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 8, background: '#dc2626', color: '#fff',
                          border: 'none', borderRadius: 10, padding: '10px 16px', fontWeight: 700, fontSize: 13.5, cursor: 'pointer',
                        }}
                      >
                        <Trash2 size={15} /> Delete Account
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <div style={{ padding: '40px 10px', textAlign: 'center' }}>
                  <div style={{
                    width: 52, height: 52, borderRadius: '50%', background: '#eff6ff',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px',
                  }}>
                    {activeNav && <activeNav.icon size={24} color="#2563eb" />}
                  </div>
                  <h3 style={{ margin: '0 0 6px', fontSize: 17, fontWeight: 700, color: '#111827' }}>
                    {activeNav?.label}
                  </h3>
                  <p style={{ margin: 0, color: '#6b7280', fontSize: 14 }}>
                    This section isn't built yet.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}