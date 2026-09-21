import { useEffect, useRef, useState } from 'react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import Loader from '../../components/Loader';
import PageBackground from '../../components/PageBackground';
import { donationService } from '../../services/donationService';
import { donorService } from '../../services/donorService';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useLocation, useNavigate } from 'react-router-dom';
import { useProfileData, storePhoto, storeDetails } from '../../utils/profilePhoto';
import {
  Pencil, Heart, FileText, Calendar, CheckCircle2,
  GraduationCap, Building2, Landmark,
  ShieldCheck, Mail, Phone, Award, CreditCard, Smartphone, MoreVertical, Eye,
  User, Clock, Settings, LogOut, Camera, Upload, Save, MapPin, Cake, Users,
  Map as MapIcon, ChevronDown, KeyRound,
} from 'lucide-react';
import leavesFrame from '../../assets/images/backgrounds/leaves-frame.jpg';
import impactHero from '../../assets/images/backgrounds/impact-hero.jpg';

const rowThemes = [
  { border: '#2563eb', iconBg: '#dbeafe', iconFg: '#2563eb', icon: GraduationCap },
  { border: '#7c3aed', iconBg: '#ede9fe', iconFg: '#7c3aed', icon: Building2 },
  { border: '#db2777', iconBg: '#fce7f3', iconFg: '#db2777', icon: Building2 },
  { border: '#ea580c', iconBg: '#ffedd5', iconFg: '#ea580c', icon: Building2 },
  { border: '#16a34a', iconBg: '#dcfce7', iconFg: '#16a34a', icon: Building2 },
];

const MAX_PHOTO_BYTES = 5 * 1024 * 1024;
const ALLOWED_PHOTO_TYPES = ['image/jpeg', 'image/png', 'image/gif'];

function HandsHeartIllustration() {
  return (
    <svg width="220" height="180" viewBox="0 0 220 180" fill="none">
      <circle cx="140" cy="80" r="80" fill="#16a34a" opacity="0.06" />
      {/* floating hearts */}
      <path d="M170 40 c-6-10-24-6-24 8 c0 12 24 26 24 26 s24-14 24-26 c0-14-18-18-24-8z" fill="#f87171" />
      <path d="M120 30 c-3-5-13-3-13 4 c0 6 13 13 13 13 s13-7 13-13 c0-7-10-9-13-4z" fill="#fb7185" opacity="0.9" />
      {/* leaves */}
      <path d="M40 170 C35 130, 55 105, 85 100" stroke="#86efac" strokeWidth="8" strokeLinecap="round" fill="none" opacity="0.7" />
      <path d="M55 172 C52 140, 68 118, 95 112" stroke="#bbf7d0" strokeWidth="6" strokeLinecap="round" fill="none" opacity="0.6" />
      {/* hands */}
      <path d="M95 165 C90 140, 100 120, 130 118 C160 120, 170 140, 165 165 C165 172, 155 176, 130 176 C105 176, 95 172, 95 165 Z" fill="#065f46" />
      {/* heart in hands */}
      <path d="M130 100 c-10-16-38-10-38 12 c0 20 38 42 38 42 s38-22 38-42 c0-22-28-28-38-12z" fill="#16a34a" />
      <path d="M130 108 c-6-9-22-6-22 7 c0 11 22 24 22 24 s22-13 22-24 c0-13-16-16-22-7z" fill="#fff" />
      {/* sparkles */}
      <g fill="#4ade80">
        <circle cx="60" cy="50" r="2.5" />
        <circle cx="195" cy="130" r="2.5" />
        <circle cx="200" cy="45" r="2" />
      </g>
    </svg>
  );
}

function getInitials(name) {
  if (!name) return '';
  return name.trim().split(/\s+/).slice(0, 2).map((w) => w[0]).join('').toUpperCase();
}

function formatMemberSince(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  if (isNaN(d)) return '—';
  return d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

function calcAge(dob) {
  if (!dob) return '';
  const d = new Date(dob);
  if (isNaN(d)) return '';
  const t = new Date();
  let age = t.getFullYear() - d.getFullYear();
  const m = t.getMonth() - d.getMonth();
  if (m < 0 || (m === 0 && t.getDate() < d.getDate())) age--;
  return age >= 0 ? String(age) : '';
}

// Strip a leading +91 / 91 and any non-digits so the field only holds the 10-digit number
function cleanPhone(p) {
  if (!p) return '';
  const digits = String(p).replace(/\D/g, '');
  return digits.length > 10 ? digits.slice(-10) : digits;
}

// Crop to a centred square and shrink to 400×400 JPEG (keeps the photo small enough
// to store and send). Note: animated GIFs become a still image.
function resizeImage(file, size = 400) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const side = Math.min(img.width, img.height);
      const sx = (img.width - side) / 2;
      const sy = (img.height - side) / 2;
      const canvas = document.createElement('canvas');
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#fff';
      ctx.fillRect(0, 0, size, size);
      ctx.drawImage(img, sx, sy, side, side, 0, 0, size, size);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL('image/jpeg', 0.85));
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Could not read image'));
    };
    img.src = url;
  });
}

const escapeHtml = (v) =>
  String(v ?? '').replace(/[&<>"']/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));

// Receipts are available for completed donations only
function canShowReceipt(d) {
  const s = (d.status || 'success').toLowerCase();
  return !['fail', 'pending', 'reject', 'cancel', 'refund'].some((x) => s.includes(x));
}

// Opens a printable receipt in a new tab (used when the API doesn't provide a receiptUrl)
function openReceipt(d, donor) {
  const receiptNo = d.receiptNumber || d.paymentRef || `HC-${d.donationId}`;
  const rows = [
    ['Receipt No.', receiptNo],
    ['Date & Time', new Date(d.date).toLocaleString('en-GB')],
    ['Donor', donor?.name],
    ['Email', donor?.email],
    ['Campaign', d.campaignTitle],
    ['Payment Method', d.paymentMethod || 'N/A'],
    ['Payment Reference', d.paymentRef || '—'],
    ['Status', d.status || 'Success'],
  ];

  const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8" />
<title>Donation Receipt ${escapeHtml(receiptNo)}</title>
<style>
  * { box-sizing: border-box; }
  body { margin: 0; padding: 32px 16px; background: #f3f4f6; font-family: 'Poppins', 'Inter', system-ui, sans-serif; color: #111827; }
  .card { max-width: 620px; margin: 0 auto; background: #fff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,.08); }
  .head { background: linear-gradient(90deg, #0a5c34, #16a34a); color: #fff; padding: 24px 28px; }
  .head h1 { margin: 0; font-size: 22px; }
  .head p { margin: 4px 0 0; opacity: .85; font-size: 13px; }
  .amount { text-align: center; padding: 28px 20px 8px; }
  .amount small { color: #6b7280; font-size: 13px; }
  .amount div { font-size: 38px; font-weight: 800; color: #065f46; margin-top: 4px; }
  table { width: calc(100% - 56px); margin: 12px 28px 8px; border-collapse: collapse; }
  td { padding: 11px 0; border-bottom: 1px solid #f3f4f6; font-size: 14px; vertical-align: top; }
  td:first-child { color: #6b7280; width: 40%; }
  td:last-child { font-weight: 600; text-align: right; word-break: break-word; }
  .thanks { text-align: center; padding: 18px 28px 26px; color: #4b5563; font-size: 13.5px; }
  .actions { text-align: center; padding-bottom: 28px; }
  button { background: #065f46; color: #fff; border: 0; border-radius: 10px; padding: 11px 26px; font-size: 14px; font-weight: 700; cursor: pointer; }
  @media print { body { background: #fff; padding: 0; } .card { box-shadow: none; } .actions { display: none; } }
</style></head>
<body>
  <div class="card">
    <div class="head"><h1>HopeCare</h1><p>Donation Receipt</p></div>
    <div class="amount"><small>Amount donated</small><div>₹${Number(d.amount).toLocaleString('en-IN')}</div></div>
    <table>${rows.map(([k, v]) => `<tr><td>${escapeHtml(k)}</td><td>${escapeHtml(v)}</td></tr>`).join('')}</table>
    <div class="thanks">Thank you for your generosity. Together for a better tomorrow.</div>
    <div class="actions"><button onclick="window.print()">Print / Save as PDF</button></div>
  </div>
</body></html>`;

  const w = window.open('', '_blank');
  if (!w) {
    alert('Please allow pop-ups for this site to view your receipt.');
    return;
  }
  w.document.open();
  w.document.write(html);
  w.document.close();
}

function buildForm(user, photo = '') {
  return {
    name: user?.name || '',
    email: user?.email || '',
    phone: cleanPhone(user?.phone),
    dob: user?.dob ? String(user.dob).slice(0, 10) : '',
    gender: user?.gender || '',
    address: user?.address || '',
    city: user?.city || '',
    state: user?.state || '',
    pincode: user?.pincode || '',
    profilePicture: photo || '',
  };
}

// NOTE: `ref` is a reserved prop name in React, so the payment reference is passed as `paymentRef`.
function PaymentMethodCell({ method, paymentRef, muted, text }) {
  const m = (method || '').toLowerCase();
  let Icon = CreditCard;
  const label = method || 'N/A';
  if (m.includes('upi')) Icon = Smartphone;
  else if (m.includes('net') || m.includes('bank')) Icon = Landmark;

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <Icon size={15} color={muted} />
      <div>
        <div style={{ fontWeight: 600, fontSize: 13.5, color: text }}>{label}</div>
        {paymentRef && <div style={{ fontSize: 12, color: muted }}>{paymentRef}</div>}
      </div>
    </div>
  );
}

/* A labelled input with a leading icon (and optional prefix like +91) */
function Field({ label, required, icon: Icon, prefix, error, readOnly, c, children }) {
  return (
    <div style={{ minWidth: 0 }}>
      <label style={{ display: 'block', fontSize: 13.5, fontWeight: 700, color: c.text, marginBottom: 6 }}>
        {label} {required && <span style={{ color: '#dc2626' }}>*</span>}
      </label>
      <div
        className="hc-field"
        style={{
          display: 'flex', alignItems: 'center', gap: 10,
          height: 46, padding: '0 14px', borderRadius: 10,
          border: error ? '1px solid #dc2626' : c.inputBorder,
          background: readOnly ? c.inputReadOnlyBg : c.inputBg,
        }}
      >
        {Icon && <Icon size={16} color={c.textMuted} style={{ flexShrink: 0 }} />}
        {prefix && <span style={{ color: c.text, fontSize: 14, flexShrink: 0 }}>{prefix}</span>}
        {children}
      </div>
      {error && <div style={{ color: '#dc2626', fontSize: 12, marginTop: 4 }}>{error}</div>}
    </div>
  );
}

export default function Profile() {
  const { user, logout } = useAuth();
  const { theme } = useTheme();
  const isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
  const profileData = useProfileData(user); // user + locally saved details — same data the Navbar uses
  const currentPhoto = profileData.profilePicture;
  const location = useLocation();
  const navigate = useNavigate();

  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);

  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState(buildForm(null));
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null); // { type: 'success' | 'error', text }
  const [saved, setSaved] = useState({}); // values saved this session, so the header updates immediately

  const fileInputRef = useRef(null);
  const historyRef = useRef(null);

  useEffect(() => {
    donationService.myDonations().then(setDonations).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!user || editing) return; // never overwrite what the user is typing
    setForm(buildForm(profileData, profileData.profilePicture));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, profileData]);

  // "Complete Profile" in the navbar links to /profile?edit=1 → open the editor
  const handledNavKey = useRef(null);
  useEffect(() => {
    if (!user || handledNavKey.current === location.key) return;
    if (new URLSearchParams(location.search).get('edit') === '1') {
      handledNavKey.current = location.key;
      setMessage(null);
      setEditing(true);
    }
  }, [user, location.key, location.search]);

  // "My Donations" in the navbar links to /profile#donation-history → scroll to it
  useEffect(() => {
    if (loading || editing || location.hash !== '#donation-history') return;
    const id = setTimeout(() => historyRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
    return () => clearTimeout(id);
  }, [loading, location.hash, location.key]); // eslint-disable-line react-hooks/exhaustive-deps

  const profile = { ...profileData, ...saved };
  const totalDonated = donations.reduce((sum, d) => sum + d.amount, 0);
  const totalTransactions = donations.length;

  const setField = (key) => (e) => {
    setForm((f) => ({ ...f, [key]: e.target.value }));
    if (errors[key]) setErrors((er) => ({ ...er, [key]: undefined }));
  };

  const handlePhoto = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = ''; // allow re-selecting the same file
    if (!file) return;

    if (!ALLOWED_PHOTO_TYPES.includes(file.type)) {
      setErrors((er) => ({ ...er, photo: 'Please choose a JPG, PNG or GIF image.' }));
      return;
    }
    if (file.size > MAX_PHOTO_BYTES) {
      setErrors((er) => ({ ...er, photo: 'Image is larger than 5MB. Please choose a smaller one.' }));
      return;
    }

    try {
      const dataUrl = await resizeImage(file, 400);
      setForm((f) => ({ ...f, profilePicture: dataUrl }));
      setErrors((er) => ({ ...er, photo: undefined }));
    } catch {
      setErrors((er) => ({ ...er, photo: 'Could not read that image. Please try another one.' }));
    }
  };

  const validate = () => {
    const er = {};
    if (!form.name.trim()) er.name = 'Enter your full name.';
    if (!/^\S+@\S+\.\S+$/.test(form.email)) er.email = 'Enter a valid email address.';
    if (!/^\d{10}$/.test(form.phone)) er.phone = 'Enter a 10-digit phone number.';
    if (!form.dob) er.dob = 'Select your date of birth.';
    else if (new Date(form.dob) > new Date()) er.dob = 'Date of birth cannot be in the future.';
    if (form.pincode && !/^\d{6}$/.test(form.pincode)) er.pincode = 'Enter a 6-digit pincode.';
    setErrors(er);
    return Object.keys(er).length === 0;
  };

  const openEditor = () => {
    setForm(buildForm(profile, currentPhoto));
    setErrors({});
    setMessage(null);
    setEditing(true);
  };

  const cancelEditor = () => {
    setForm(buildForm(profile, currentPhoto));
    setErrors({});
    setEditing(false);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSaving(true);
    setMessage(null);
    const payload = {
      ...form,
      name: form.name.trim(),
      phone: `+91 ${form.phone}`,
      age: Number(calcAge(form.dob)) || null,
    };
    try {
      await donorService.updateMyProfile(payload);
      storeDetails(user, payload); // updates the Navbar greeting + profile completion instantly
      storePhoto(user, form.profilePicture); // updates the Navbar avatar instantly
      setSaved(payload);
      setMessage({ type: 'success', text: 'Profile updated successfully.' });
      setEditing(false);
    } catch {
      setMessage({ type: 'error', text: 'Could not save your changes. Please try again.' });
    } finally {
      setSaving(false);
    }
  };

  const goToHistory = () => {
    setEditing(false);
    setTimeout(() => historyRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);
  };

  // Theme-aware palette
  const c = {
    // PageBackground's `overlay` prop already tints the whole page, so this stays transparent.
    pageBg: 'transparent',
    cardBg: isDark ? '#1e293b' : '#fff',
    cardBorder: isDark ? '1px solid #334155' : 'none',
    text: isDark ? '#f1f5f9' : '#111827',
    textMuted: isDark ? '#94a3b8' : '#6b7280',
    textSubtle: isDark ? '#64748b' : '#9ca3af',
    inputBorder: isDark ? '1px solid #475569' : '1px solid #d1d5db',
    inputBg: isDark ? '#0f172a' : '#fff',
    inputReadOnlyBg: isDark ? '#172033' : '#f3f4f6',
    divider: isDark ? '#334155' : '#e5e7eb',
    tableHeaderBg: isDark ? '#022c22' : '#ecfdf5',
    tableHeaderText: isDark ? '#4ade80' : '#065f46',
    rowBorder: isDark ? '#334155' : '#f3f4f6',
    filterBg: isDark ? '#1e293b' : '#fff',
    filterBorder: isDark ? '1px solid #334155' : '1px solid #e5e7eb',
    actionBtnBg: isDark ? '#334155' : '#f3f4f6',
    editBtnBg: isDark ? '#0f172a' : '#fff',
    navActiveBg: isDark ? 'rgba(22,163,74,0.18)' : '#dcfce7',
    navActiveText: isDark ? '#4ade80' : '#065f46',
    accent: isDark ? '#4ade80' : '#065f46',
  };

  const inputStyle = {
    flex: 1, minWidth: 0, height: '100%', border: 'none', outline: 'none',
    background: 'transparent', color: c.text, fontSize: 14, fontFamily: 'inherit',
  };

  const sidebarItems = [
    { key: 'profile', label: 'Profile', icon: User, onClick: openEditor },
    { key: 'history', label: 'Donation History', icon: Clock, onClick: goToHistory },
    { key: 'transactions', label: 'Transaction History', icon: FileText, onClick: goToHistory },
    // TODO: point this at your real route (e.g. navigate('/saved-campaigns'))
    { key: 'saved', label: 'Saved Campaigns', icon: Heart, onClick: () => {} },
    { key: 'password', label: 'Change Password', icon: KeyRound, onClick: () => navigate('/change-password') },
    // TODO: point this at your real route
    { key: 'settings', label: 'Settings', icon: Settings, onClick: () => {} },
  ];

  const age = calcAge(form.dob);

  return (
    <PageBackground image={leavesFrame} overlay={isDark ? '#000000' : 'rgba(255,255,255,0.55)'}>
      <Navbar />

      {/* Focus ring for the custom field wrappers */}
      <style>{`
        .hc-field:focus-within { border-color: #16a34a !important; box-shadow: 0 0 0 3px rgba(22,163,74,0.18); }
        .hc-nav-item:hover { background: ${isDark ? 'rgba(148,163,184,0.12)' : '#f3f4f6'}; }
        .hc-btn:focus-visible { outline: 3px solid rgba(22,163,74,0.45); outline-offset: 2px; }
        .hc-field input::placeholder { color: ${c.textSubtle}; }
        .hc-field select { appearance: none; -webkit-appearance: none; cursor: pointer; }
        .hc-field input[type="date"]::-webkit-calendar-picker-indicator { ${isDark ? 'filter: invert(0.8);' : ''} cursor: pointer; }
      `}</style>

      <div style={{ background: c.pageBg, padding: '32px 20px', minHeight: '60vh' }}>
        <div className="container" style={{ padding: 0 }}>
          {/* Profile header card — impact-hero photo blended in behind it */}
          <div
            style={{
              position: 'relative',
              overflow: 'hidden',
              borderRadius: 20,
              backgroundImage: isDark
                ? `linear-gradient(100deg, rgba(30,41,59,0.95) 0%, rgba(30,41,59,0.85) 60%, rgba(30,41,59,0.55) 100%), url(${impactHero})`
                : `linear-gradient(100deg, rgba(255,255,255,0.97) 0%, rgba(255,255,255,0.9) 60%, rgba(255,255,255,0.55) 100%), url(${impactHero})`,
              backgroundSize: 'cover, cover',
              backgroundPosition: 'center, right center',
              border: c.cardBorder,
              padding: '32px 36px',
              marginBottom: 24,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 24,
              flexWrap: 'wrap',
              boxShadow: isDark ? 'none' : '0 1px 3px rgba(0,0,0,0.06)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 20, flex: 1, minWidth: 280 }}>
              {/* Avatar: uploaded photo, or initials */}
              {(editing ? form.profilePicture : currentPhoto) ? (
                <img
                  src={editing ? form.profilePicture : currentPhoto}
                  alt={profile.name || 'Profile'}
                  style={{ width: 74, height: 74, borderRadius: '50%', objectFit: 'cover', flexShrink: 0, border: '3px solid #fff', boxShadow: '0 1px 4px rgba(0,0,0,0.15)' }}
                />
              ) : (
                <div
                  style={{
                    width: 74, height: 74, borderRadius: '50%', background: '#065f46', color: '#fff',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: 700, fontSize: 22, flexShrink: 0,
                  }}
                >
                  {getInitials(profile.name)}
                </div>
              )}

              <div style={{ flex: 1 }}>
                <h2 style={{ margin: 0, fontWeight: 800, color: c.text, fontSize: 24 }}>{profile.name}</h2>

                {profile.verified !== false && (
                  <div style={{
                    display: 'inline-flex', alignItems: 'center', gap: 5,
                    background: isDark ? 'rgba(22,163,74,0.15)' : '#dcfce7',
                    color: '#4ade80', fontSize: 12.5, fontWeight: 700,
                    borderRadius: 20, padding: '3px 10px', marginTop: 6,
                  }}>
                    <ShieldCheck size={13} /> Verified Donor
                  </div>
                )}

                <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginTop: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: c.textMuted, fontSize: 14 }}>
                    <Mail size={14} /> {profile.email}
                  </div>
                  {profile.phone && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: c.textMuted, fontSize: 14 }}>
                      <Phone size={14} /> {profile.phone}
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap', margin: '20px 0' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{
                      width: 40, height: 40, borderRadius: '50%',
                      background: isDark ? 'rgba(22,163,74,0.15)' : '#dcfce7',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                    }}>
                      <Heart size={18} color="#4ade80" fill="#4ade80" />
                    </div>
                    <div>
                      <div style={{ fontSize: 13, color: c.textMuted }}>Total Donated</div>
                      <div style={{ fontWeight: 700, color: c.text, fontSize: 18 }}>₹{totalDonated.toLocaleString()}</div>
                    </div>
                  </div>

                  <div style={{ width: 1, height: 34, background: c.divider }} />

                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{
                      width: 40, height: 40, borderRadius: '50%',
                      background: isDark ? 'rgba(37,99,235,0.15)' : '#dbeafe',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                    }}>
                      <FileText size={17} color={isDark ? '#60a5fa' : '#2563eb'} />
                    </div>
                    <div>
                      <div style={{ fontSize: 13, color: c.textMuted }}>Total Transactions</div>
                      <div style={{ fontWeight: 700, color: c.text, fontSize: 18 }}>{totalTransactions}</div>
                      <div style={{ fontSize: 11.5, color: c.textSubtle }}>Completed donations</div>
                    </div>
                  </div>

                  <div style={{ width: 1, height: 34, background: c.divider }} />

                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{
                      width: 40, height: 40, borderRadius: '50%',
                      background: isDark ? 'rgba(217,119,6,0.15)' : '#fef3c7',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                    }}>
                      <Award size={17} color={isDark ? '#fbbf24' : '#d97706'} />
                    </div>
                    <div>
                      <div style={{ fontSize: 13, color: c.textMuted }}>Member Since</div>
                      <div style={{ fontWeight: 700, color: isDark ? '#fbbf24' : '#d97706', fontSize: 16 }}>{formatMemberSince(profile.memberSince)}</div>
                      <div style={{ fontSize: 11.5, color: c.textSubtle }}>Proud HopeCare member</div>
                    </div>
                  </div>
                </div>

                {!editing && (
                  <button
                    className="hc-btn"
                    onClick={openEditor}
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: 8,
                      background: c.editBtnBg,
                      color: c.accent,
                      border: `1.5px solid ${c.accent}`,
                      borderRadius: 10,
                      padding: '9px 18px', fontWeight: 700, fontSize: 14, cursor: 'pointer',
                    }}
                  >
                    <Pencil size={14} /> Edit Profile
                  </button>
                )}
              </div>
            </div>

            <div>
              <HandsHeartIllustration />
            </div>
          </div>

          {/* Status banner after saving / failing */}
          {message && !editing && (
            <div
              role="status"
              style={{
                marginBottom: 20, padding: '12px 16px', borderRadius: 12, fontSize: 14, fontWeight: 600,
                background: message.type === 'success' ? (isDark ? 'rgba(22,163,74,0.15)' : '#dcfce7') : (isDark ? 'rgba(220,38,38,0.15)' : '#fee2e2'),
                color: message.type === 'success' ? (isDark ? '#4ade80' : '#065f46') : (isDark ? '#fca5a5' : '#991b1b'),
              }}
            >
              {message.text}
            </div>
          )}

          {/* ───────────── EDIT PROFILE VIEW ───────────── */}
          {editing ? (
            <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start', flexWrap: 'wrap' }}>
              {/* Sidebar */}
              <aside
                style={{
                  flex: '0 0 260px', maxWidth: '100%', boxSizing: 'border-box',
                  background: c.cardBg, border: c.cardBorder, borderRadius: 20, padding: 16,
                  boxShadow: isDark ? 'none' : '0 1px 3px rgba(0,0,0,0.06)',
                }}
              >
                <nav style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  {sidebarItems.map(({ key, label, icon: NavIcon, onClick }) => {
                    const active = key === 'profile';
                    return (
                      <button
                        key={key}
                        type="button"
                        className={`hc-btn ${active ? '' : 'hc-nav-item'}`}
                        onClick={onClick}
                        aria-current={active ? 'page' : undefined}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 14, width: '100%',
                          padding: '14px 16px', borderRadius: 12, border: 'none', textAlign: 'left',
                          background: active ? c.navActiveBg : 'transparent',
                          color: active ? c.navActiveText : c.text,
                          fontWeight: active ? 700 : 500, fontSize: 15, cursor: 'pointer',
                        }}
                      >
                        <NavIcon size={19} color={active ? c.navActiveText : c.textMuted} />
                        {label}
                      </button>
                    );
                  })}
                </nav>

                <div style={{ height: 1, background: c.divider, margin: '14px 8px' }} />

                <button
                  type="button"
                  className="hc-btn hc-nav-item"
                  onClick={() => typeof logout === 'function' && logout()}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 14, width: '100%',
                    padding: '14px 16px', borderRadius: 12, border: 'none', textAlign: 'left',
                    background: 'transparent', color: '#dc2626', fontWeight: 600, fontSize: 15, cursor: 'pointer',
                  }}
                >
                  <LogOut size={19} /> Logout
                </button>
              </aside>

              {/* Right column: edit form card */}
              <div style={{ flex: '1 1 520px', minWidth: 0 }}>
                <form
                  onSubmit={handleSave}
                  noValidate
                  style={{
                    boxSizing: 'border-box',
                    background: c.cardBg, border: c.cardBorder, borderRadius: 20, padding: '28px 30px',
                    boxShadow: isDark ? 'none' : '0 1px 3px rgba(0,0,0,0.06)',
                  }}
                >
                  <h3 style={{ margin: 0, fontSize: 28, fontWeight: 800, color: c.accent }}>Edit Profile</h3>
                  <p style={{ margin: '4px 0 24px', color: c.textMuted, fontSize: 14.5 }}>
                    Update your personal information and profile picture
                  </p>

                  <div style={{ display: 'flex', gap: 32, flexWrap: 'wrap', alignItems: 'flex-start' }}>
                    {/* Photo uploader */}
                    <div style={{ flex: '0 0 240px', maxWidth: '100%', textAlign: 'center', margin: '0 auto' }}>
                      <div style={{ position: 'relative', width: 200, height: 200, margin: '0 auto 16px' }}>
                        {form.profilePicture ? (
                          <img
                            src={form.profilePicture}
                            alt="Your profile"
                            style={{ width: 200, height: 200, borderRadius: '50%', objectFit: 'cover', border: `4px solid ${isDark ? '#334155' : '#ecfdf5'}` }}
                          />
                        ) : (
                          <div
                            style={{
                              width: 200, height: 200, borderRadius: '50%', background: '#065f46', color: '#fff',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              fontWeight: 700, fontSize: 56,
                            }}
                          >
                            {getInitials(form.name) || <User size={72} />}
                          </div>
                        )}
                        <button
                          type="button"
                          className="hc-btn"
                          onClick={() => fileInputRef.current?.click()}
                          aria-label="Change profile picture"
                          style={{
                            position: 'absolute', right: 8, bottom: 8, width: 46, height: 46, borderRadius: '50%',
                            background: '#065f46', color: '#fff', border: `3px solid ${c.cardBg}`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                          }}
                        >
                          <Camera size={19} />
                        </button>
                      </div>

                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/jpeg,image/png,image/gif"
                        onChange={handlePhoto}
                        style={{ display: 'none' }}
                      />

                      <div style={{ fontWeight: 700, color: c.text, fontSize: 15 }}>Upload Profile Picture</div>
                      <div style={{ color: c.textMuted, fontSize: 13, marginTop: 6, lineHeight: 1.5 }}>
                        JPG, PNG or GIF (Max 5MB)<br />Recommended size: 400 × 400
                      </div>

                      <button
                        type="button"
                        className="hc-btn"
                        onClick={() => fileInputRef.current?.click()}
                        style={{
                          display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                          width: '100%', maxWidth: 256, marginTop: 16, padding: '12px 18px', borderRadius: 999,
                          background: isDark ? 'rgba(22,163,74,0.12)' : '#ecfdf5',
                          color: c.accent, border: `1.5px solid ${isDark ? '#16a34a' : '#34d399'}`,
                          fontWeight: 700, fontSize: 15, cursor: 'pointer',
                        }}
                      >
                        <Upload size={17} /> Choose Image
                      </button>

                      {form.profilePicture && (
                        <button
                          type="button"
                          className="hc-btn"
                          onClick={() => setForm((f) => ({ ...f, profilePicture: '' }))}
                          style={{ display: 'block', margin: '10px auto 0', background: 'none', border: 'none', color: c.textMuted, fontSize: 13, cursor: 'pointer', textDecoration: 'underline' }}
                        >
                          Remove photo
                        </button>
                      )}
                      {errors.photo && <div style={{ color: '#dc2626', fontSize: 12.5, marginTop: 8 }}>{errors.photo}</div>}
                    </div>

                    {/* Fields */}
                    <div
                      style={{
                        flex: '1 1 380px', minWidth: 0,
                        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))',
                        gap: '18px 20px',
                      }}
                    >
                      <Field label="Full Name" required icon={User} error={errors.name} c={c}>
                        <input type="text" value={form.name} onChange={setField('name')} placeholder="Enter your full name" style={inputStyle} />
                      </Field>

                      <Field label="Email Address" required icon={Mail} readOnly error={errors.email} c={c}>
                        <input type="email" value={form.email} readOnly style={{ ...inputStyle, cursor: 'not-allowed' }} />
                      </Field>

                      <Field label="Phone Number" required icon={Phone} prefix="+91" error={errors.phone} c={c}>
                        <input
                          type="tel" inputMode="numeric" maxLength={10}
                          value={form.phone}
                          onChange={(e) => {
                            setForm((f) => ({ ...f, phone: e.target.value.replace(/\D/g, '') }));
                            if (errors.phone) setErrors((er) => ({ ...er, phone: undefined }));
                          }}
                          placeholder="10-digit number"
                          style={inputStyle}
                        />
                      </Field>

                      <Field label="Date of Birth" required icon={Calendar} error={errors.dob} c={c}>
                        <input
                          type="date" value={form.dob} onChange={setField('dob')}
                          max={new Date().toISOString().slice(0, 10)}
                          style={inputStyle}
                        />
                      </Field>

                      <Field label="Age" required icon={Cake} readOnly c={c}>
                        <input type="text" value={age} readOnly placeholder="Calculated from date of birth" style={{ ...inputStyle, cursor: 'not-allowed' }} />
                      </Field>

                      <Field label="Gender" icon={Users} c={c}>
                        <select value={form.gender} onChange={setField('gender')} style={inputStyle}>
                          <option value="">Select gender</option>
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                          <option value="Other">Other</option>
                          <option value="Prefer not to say">Prefer not to say</option>
                        </select>
                        <ChevronDown size={16} color={c.textMuted} style={{ flexShrink: 0, pointerEvents: 'none' }} />
                      </Field>

                      <Field label="Address" icon={MapPin} c={c}>
                        <input type="text" value={form.address} onChange={setField('address')} placeholder="Enter your address" style={inputStyle} />
                      </Field>

                      <Field label="City" icon={Building2} c={c}>
                        <input type="text" value={form.city} onChange={setField('city')} placeholder="Enter your city" style={inputStyle} />
                      </Field>

                      <Field label="State" icon={MapIcon} c={c}>
                        <input type="text" value={form.state} onChange={setField('state')} placeholder="Enter your state" style={inputStyle} />
                      </Field>

                      <Field label="Pincode" icon={MapPin} error={errors.pincode} c={c}>
                        <input
                          type="text" inputMode="numeric" maxLength={6}
                          value={form.pincode}
                          onChange={(e) => {
                            setForm((f) => ({ ...f, pincode: e.target.value.replace(/\D/g, '') }));
                            if (errors.pincode) setErrors((er) => ({ ...er, pincode: undefined }));
                          }}
                          placeholder="Enter pincode"
                          style={inputStyle}
                        />
                      </Field>
                    </div>
                  </div>

                  {message?.type === 'error' && (
                    <p role="alert" style={{ margin: '20px 0 0', color: isDark ? '#fca5a5' : '#991b1b', fontSize: 14, fontWeight: 600 }}>
                      {message.text}
                    </p>
                  )}

                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 28, flexWrap: 'wrap' }}>
                    <button
                      type="button"
                      className="hc-btn"
                      onClick={cancelEditor}
                      style={{
                        background: c.editBtnBg, color: c.text, border: c.inputBorder,
                        borderRadius: 10, padding: '12px 28px', fontWeight: 700, fontSize: 15, cursor: 'pointer',
                      }}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="hc-btn"
                      disabled={saving}
                      style={{
                        display: 'inline-flex', alignItems: 'center', gap: 10,
                        background: '#065f46', color: '#fff', border: 'none', borderRadius: 10,
                        padding: '12px 28px', fontWeight: 700, fontSize: 15,
                        cursor: saving ? 'default' : 'pointer', opacity: saving ? 0.7 : 1,
                      }}
                    >
                      <Save size={17} /> {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          ) : (
            /* ───────────── DONATION HISTORY VIEW ───────────── */
            <div ref={historyRef} style={{ scrollMarginTop: 90 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
                <div>
                  <h3 style={{ margin: 0, fontWeight: 800, color: c.text }}>Donation History</h3>
                  <div style={{
                    width: 48, height: 3, borderRadius: 2, marginTop: 6,
                    background: 'linear-gradient(90deg, #065f46, #16a34a)',
                  }} />
                </div>
                <div style={{
                  display: 'inline-flex', alignItems: 'center', gap: 8,
                  background: c.filterBg, border: c.filterBorder, borderRadius: 10,
                  padding: '8px 14px', fontSize: 14, fontWeight: 600, color: c.text,
                }}>
                  <Calendar size={15} color={c.textMuted} /> All Time
                </div>
              </div>

              {loading ? (
                <Loader label="Loading your donations..." />
              ) : donations.length === 0 ? (
                <p style={{ color: c.text }}>You haven't made any donations yet.</p>
              ) : (
                <div style={{ background: c.cardBg, border: c.cardBorder, borderRadius: 16, overflow: 'hidden', boxShadow: isDark ? 'none' : '0 1px 3px rgba(0,0,0,0.05)' }}>
                  <div style={{ overflowX: 'auto' }}>
                    <div style={{ minWidth: 900 }}>
                      {/* Table header */}
                      <div
                        style={{
                          display: 'grid',
                          gridTemplateColumns: '2.2fr 1.3fr 0.9fr 1.3fr 1fr 0.8fr 0.5fr',
                          background: c.tableHeaderBg,
                          padding: '12px 20px',
                          fontSize: 12.5,
                          fontWeight: 700,
                          color: c.tableHeaderText,
                          textTransform: 'uppercase',
                          letterSpacing: 0.3,
                        }}
                      >
                        <div>Campaign</div>
                        <div>Date &amp; Time</div>
                        <div>Amount</div>
                        <div>Payment Method</div>
                        <div>Status</div>
                        <div>Receipt</div>
                        <div>Action</div>
                      </div>

                      {donations.map((d, i) => {
                        const rTheme = rowThemes[i % rowThemes.length];
                        const Icon = i === 0 ? GraduationCap : Building2;
                        return (
                          <div
                            key={d.donationId}
                            style={{
                              display: 'grid',
                              gridTemplateColumns: '2.2fr 1.3fr 0.9fr 1.3fr 1fr 0.8fr 0.5fr',
                              alignItems: 'center',
                              padding: '14px 20px',
                              borderTop: `1px solid ${c.rowBorder}`,
                              borderLeft: `4px solid ${rTheme.border}`,
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                              <div style={{
                                width: 38, height: 38, borderRadius: '50%', background: rTheme.iconBg,
                                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                              }}>
                                <Icon size={17} color={rTheme.iconFg} />
                              </div>
                              <div>
                                <div style={{ fontWeight: 700, color: c.text, fontSize: 14 }}>{d.campaignTitle}</div>
                                {d.campaignDescription && (
                                  <div style={{ fontSize: 12, color: c.textSubtle }}>{d.campaignDescription}</div>
                                )}
                              </div>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: c.textMuted, fontSize: 13 }}>
                              <Calendar size={12} />
                              {new Date(d.date).toLocaleString()}
                            </div>

                            <div style={{ fontWeight: 800, fontSize: 15, color: '#4ade80' }}>
                              ₹{d.amount.toLocaleString()}
                            </div>

                            <PaymentMethodCell method={d.paymentMethod} paymentRef={d.paymentRef} muted={c.textMuted} text={c.text} />

                            <span style={{
                              display: 'inline-flex', alignItems: 'center', gap: 4,
                              background: isDark ? 'rgba(22,163,74,0.15)' : '#dcfce7',
                              color: '#4ade80', fontSize: 12, fontWeight: 600,
                              borderRadius: 20, padding: '3px 10px', width: 'fit-content',
                            }}>
                              <CheckCircle2 size={12} /> {d.status || 'Success'}
                            </span>

                            {!canShowReceipt(d) ? (
                              <span style={{ color: c.textSubtle, fontSize: 13 }}>—</span>
                            ) : d.receiptUrl ? (
                              <a
                                href={d.receiptUrl}
                                target="_blank"
                                rel="noreferrer"
                                style={{ display: 'inline-flex', alignItems: 'center', gap: 5, color: '#4ade80', fontWeight: 600, fontSize: 13, textDecoration: 'none' }}
                              >
                                <Eye size={14} /> View
                              </a>
                            ) : (
                              <button
                                type="button"
                                className="hc-btn"
                                onClick={() => openReceipt(d, profile)}
                                style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: 'none', border: 'none', padding: 0, color: '#4ade80', fontWeight: 600, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit' }}
                              >
                                <Eye size={14} /> View
                              </button>
                            )}

                            <button
                              aria-label="More actions"
                              style={{
                                width: 32, height: 32, borderRadius: '50%', background: c.actionBtnBg, border: 'none',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                              }}
                            >
                              <MoreVertical size={15} color={c.textMuted} />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </PageBackground>
  );
}