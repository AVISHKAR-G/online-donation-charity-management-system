import { useState, useEffect, useRef } from 'react';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import {
  MapPin, Phone, Mail, User, Tag, MessageSquare, Send, Clock,
  ExternalLink, ShieldCheck, Headphones, HeartHandshake, Users2,
} from 'lucide-react';
import { contactService } from '../../services/contactService';
import { useTheme } from '../../context/ThemeContext';
import leavesFrame from '../../assets/images/backgrounds/leaves-frame.jpg';

/* ---------- envelope illustration ---------- */

function EnvelopeIllustration({ isDark }) {
  const envDark = isDark ? '#166534' : '#16a34a';
  const envMid = isDark ? '#14532d' : '#15803d';
  const envLight = isDark ? '#4ade80' : '#f0fdf4';
  const blobBg = isDark ? '#0f2f22' : '#dcfce7';
  const leafColor = isDark ? '#4ade80' : '#22c55e';

  return (
    <svg viewBox="0 0 420 300" width="100%" height="100%" style={{ maxWidth: 380 }}>
      <ellipse cx="220" cy="170" rx="190" ry="110" fill={blobBg} opacity="0.7" />

      {/* paper plane */}
      <g transform="translate(20,60) rotate(-18)">
        <path d="M0 22 L46 0 L14 46 L11 30 Z" fill={isDark ? '#4ade80' : '#22c55e'} />
        <path d="M0 22 L14 30 L11 30 Z" fill={isDark ? '#166534' : '#15803d'} />
      </g>
      <path d="M14 40 C 40 20, 70 100, 150 70" stroke={leafColor} strokeWidth="2" strokeDasharray="4 7" fill="none" opacity="0.7" />

      {/* chat bubble */}
      <g transform="translate(300,60)">
        <rect x="0" y="0" width="70" height="46" rx="14" fill={isDark ? '#1e293b' : '#ffffff'} />
        <path d="M14 46 L14 60 L30 46 Z" fill={isDark ? '#1e293b' : '#ffffff'} />
        <circle cx="20" cy="23" r="4" fill={envDark} />
        <circle cx="35" cy="23" r="4" fill={envDark} />
        <circle cx="50" cy="23" r="4" fill={envDark} />
      </g>

      {/* phone handset */}
      <g transform="translate(345,150)">
        <path
          d="M0 10 C 0 4, 5 0, 10 2 L22 7 C 27 9, 27 16, 22 19 C 20 20, 19 22, 20 25 C 26 40, 40 54, 55 60 C 58 61, 60 60, 61 58 C 64 53, 71 53, 73 58 L78 70 C 80 75, 76 80, 70 80 C 38 80, 0 42, 0 10 Z"
          fill={isDark ? '#166534' : '#15803d'}
        />
      </g>

      {/* leaves */}
      <g transform="translate(60,230)">
        <path d="M0 40 C -2 20, 5 5, 20 -10" stroke={leafColor} strokeWidth="3" fill="none" strokeLinecap="round" />
        <ellipse cx="18" cy="-8" rx="7" ry="14" transform="rotate(-25 18 -8)" fill={leafColor} />
        <ellipse cx="4" cy="14" rx="6" ry="12" transform="rotate(-10 4 14)" fill={leafColor} opacity="0.85" />
      </g>
      <g transform="translate(360,230)">
        <path d="M0 40 C 2 20, -5 5, -20 -10" stroke={leafColor} strokeWidth="3" fill="none" strokeLinecap="round" />
        <ellipse cx="-18" cy="-8" rx="7" ry="14" transform="rotate(25 -18 -8)" fill={leafColor} />
        <ellipse cx="-4" cy="14" rx="6" ry="12" transform="rotate(10 -4 14)" fill={leafColor} opacity="0.85" />
      </g>

      {/* envelope body */}
      <g transform="translate(120,90)">
        <rect x="0" y="40" width="180" height="130" rx="10" fill={envDark} />
        <path d="M0 40 L90 120 L180 40 Z" fill={envMid} />
        <path d="M0 170 L70 100 L0 40 Z" fill={envMid} opacity="0.55" />
        <path d="M180 170 L110 100 L180 40 Z" fill={envMid} opacity="0.55" />

        {/* letter */}
        <g transform="translate(25,-10)">
          <rect x="0" y="0" width="130" height="90" rx="6" fill={envLight} />
          <text x="65" y="45" textAnchor="middle" fontSize="17" fontStyle="italic" fontWeight="700" fill={envMid} fontFamily="Georgia, serif">
            Let's Connect!
          </text>
          <path d="M55 60 c-4-4.5-12-2-12 3.5 c0 6 12 13 12 13 s12-7 12-13 c0-5.5-8-8-12-3.5z" fill={envMid} />
        </g>
      </g>
    </svg>
  );
}

/* ---------- input with leading icon ---------- */

function IconField({ icon: Icon, isDark, ...props }) {
  return (
    <div style={{ position: 'relative' }}>
      <Icon size={16} color={isDark ? '#4ade80' : '#16a34a'} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', zIndex: 1 }} />
      <input
        {...props}
        className="contact-input"
        style={{
          paddingLeft: 36, width: '100%',
          background: isDark ? '#0f172a' : '#fff',
          border: `1px solid ${isDark ? '#334155' : '#e5e7eb'}`,
          color: isDark ? '#f1f5f9' : '#111827',
          borderRadius: 10, padding: '11px 14px 11px 36px', fontSize: 14,
        }}
      />
    </div>
  );
}

export default function Contact() {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

  const requestOptions = [
    { value: 'General Inquiry', label: t('contact.requestOptions.general') },
    { value: 'Donation Support', label: t('contact.requestOptions.donation') },
    { value: 'Partnership', label: t('contact.requestOptions.partnership') },
    { value: 'Volunteer', label: t('contact.requestOptions.volunteer') },
    { value: 'Other', label: t('contact.requestOptions.other') },
  ];

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    organization: '',
    requestFor: 'General Inquiry',
    message: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [visible, setVisible] = useState(false);
  const cardRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    if (cardRef.current) observer.observe(cardRef.current);
    return () => observer.disconnect();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await contactService.submit(form);
      toast.success(t('contact.successToast'));
      setForm({ name: '', email: '', phone: '', organization: '', requestFor: 'General Inquiry', message: '' });
    } catch (err) {
      toast.error(t('contact.errorToast'));
    } finally {
      setSubmitting(false);
    }
  };

  const updateField = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

  // Tint applied to the WHOLE photo (see the overlay div below), including
  // the strip behind/above the sticky navbar — previously this tint only
  // started below the navbar, so that strip stayed on the raw bright photo
  // no matter what theme was active.
  const pageBg = isDark ? '#000000' : 'rgba(255,255,255,0.2)';
  const headingColor = isDark ? '#f1f5f9' : '#111827';
  const bodyColor = isDark ? '#94a3b8' : '#4b5563';
  const accentGreen = isDark ? '#4ade80' : '#16a34a';
  const cardBg = isDark ? '#1e293b' : '#fff';
  const cardBorder = isDark ? '#334155' : '#f1f5f9';
  const infoPanelBg = isDark ? 'rgba(20,83,45,0.92)' : 'rgba(240,253,244,0.92)';

  const infoItems = [
    {
      icon: MapPin, iconBg: isDark ? '#052e16' : '#ffffff',
      label: t('contact.address'),
      value: 'HopeCare Foundation,\n123 Community Lane, Coimbatore, Tamil Nadu 641001',
    },
    {
      icon: Phone, iconBg: isDark ? '#052e16' : '#ffffff',
      label: t('contact.phone'),
      value: '+91 98765 43210',
    },
    {
      icon: Mail, iconBg: isDark ? '#052e16' : '#ffffff',
      label: t('contact.email'),
      value: 'support@hopecare.org',
    },
    {
      icon: Clock, iconBg: isDark ? '#052e16' : '#ffffff',
      label: t('contact.workingHours', { defaultValue: 'Working Hours' }),
      value: 'Monday – Saturday\n9:00 AM – 6:00 PM',
    },
  ];

  const features = [
    { icon: ShieldCheck, title: t('contact.featurePrivacyTitle', { defaultValue: 'We Respect Your Privacy' }), sub: t('contact.featurePrivacySub', { defaultValue: 'Your information is safe with us.' }) },
    { icon: Headphones, title: t('contact.featureSupportTitle', { defaultValue: 'Quick Support' }), sub: t('contact.featureSupportSub', { defaultValue: 'We reply as soon as possible.' }) },
    { icon: HeartHandshake, title: t('contact.featureImpactTitle', { defaultValue: 'Make an Impact' }), sub: t('contact.featureImpactSub', { defaultValue: 'Together we can make a difference.' }) },
    { icon: Users2, title: t('contact.featureCommunityTitle', { defaultValue: 'Join Our Community' }), sub: t('contact.featureCommunitySub', { defaultValue: 'Be a part of something meaningful.' }) },
  ];

  return (
    <div
      style={{
        position: 'relative',
        backgroundImage: `url(${leavesFrame})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center top',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed',
      }}
    >
      <style>{`
        @keyframes contactFadeUp {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .contact-card { opacity: 0; transition: box-shadow 0.3s ease, transform 0.3s ease; }
        .contact-card.visible { animation: contactFadeUp 0.6s ease forwards; }
        .contact-input:focus { transform: scale(1.01); box-shadow: 0 0 0 3px rgba(22,163,74,0.15); }
        .contact-submit { transition: transform 0.15s ease, box-shadow 0.2s ease; }
        .contact-submit:hover { transform: translateY(-2px); box-shadow: 0 6px 16px rgba(22,163,74,0.35); }
        .contact-submit:active { transform: translateY(0); }
        .info-item { transition: transform 0.15s ease; }
        .info-item:hover { transform: translateX(4px); }
      `}</style>

      {/* Tints the ENTIRE photo — including the strip behind/above the
          sticky navbar — so that area also goes dark in dark mode instead
          of staying on the raw bright image. */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: pageBg,
          pointerEvents: 'none',
          transition: 'background 0.25s ease',
        }}
      />

      <div style={{ position: 'relative' }}>
        <Navbar />

        {/* This wrapper no longer needs its own `background` — the overlay
            above already tints the whole page, navbar included. */}
        <div style={{ minHeight: '100vh' }}>
          {/* Hero — sits directly on the tinted photo now */}
          <section
            style={{
              position: 'relative',
              overflow: 'hidden',
              padding: '56px 20px',
            }}
          >
            <div className="container" style={{ display: 'flex', alignItems: 'center', gap: 40, flexWrap: 'wrap' }}>
              <div style={{ flex: 1, minWidth: 320 }}>
                <div style={{ color: accentGreen, fontWeight: 800, fontSize: 13, letterSpacing: 1, marginBottom: 10 }}>
                  {t('contact.eyebrow', { defaultValue: 'GET IN TOUCH' })}
                </div>
                <h1 style={{ fontSize: 38, fontWeight: 800, color: headingColor, lineHeight: 1.2, margin: 0 }}>
                  {t('contact.title')}
                </h1>
                <div style={{ width: 46, height: 3, background: accentGreen, borderRadius: 2, margin: '16px 0' }} />
                <p style={{ color: bodyColor, fontSize: 15, lineHeight: 1.6, maxWidth: 420 }}>
                  {t('contact.subtitle')}
                </p>
              </div>

              <div style={{ flex: 1, minWidth: 320, display: 'flex', justifyContent: 'center' }}>
                <EnvelopeIllustration isDark={isDark} />
              </div>
            </div>
          </section>

          {/* Info + Form */}
          <div className="container" style={{ padding: '50px 20px 20px' }}>
            <div className="grid grid-2" style={{ gap: 30, alignItems: 'start' }}>

              {/* Contact info card */}
              <div style={{
                background: infoPanelBg, borderRadius: 18, padding: 28,
                border: `1px solid ${isDark ? '#166534' : '#dcfce7'}`,
              }}>
                <h2 style={{ marginBottom: 20, fontWeight: 800, color: headingColor, fontSize: 21 }}>
                  {t('contact.infoTitle', { defaultValue: 'Contact Information' })}
                </h2>

                {infoItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <div key={item.label} className="info-item" style={{ display: 'flex', gap: 14, marginBottom: 20, alignItems: 'flex-start' }}>
                      <div style={{
                        width: 42, height: 42, borderRadius: '50%', background: item.iconBg,
                        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                        border: `1px solid ${isDark ? '#166534' : '#bbf7d0'}`,
                      }}>
                        <Icon color={accentGreen} size={18} />
                      </div>
                      <div>
                        <strong style={{ color: headingColor, fontSize: 14.5 }}>{item.label}</strong>
                        <p style={{ color: bodyColor, marginTop: 4, fontSize: 13.5, whiteSpace: 'pre-line', lineHeight: 1.5 }}>
                          {item.value}
                        </p>
                      </div>
                    </div>
                  );
                })}

                <div style={{ borderRadius: 14, overflow: 'hidden', boxShadow: isDark ? 'none' : '0 4px 16px rgba(0,0,0,0.08)', marginBottom: 14 }}>
                  <iframe
                    title="HopeCare Foundation location"
                    src="https://maps.google.com/maps?q=123%20Community%20Lane%2C%20Coimbatore%2C%20Tamil%20Nadu%20641001&t=&z=15&ie=UTF8&iwloc=&output=embed"
                    width="100%"
                    height="220"
                    style={{ border: 0, display: 'block' }}
                    allowFullScreen=""
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                </div>

                <a
                  href="https://www.google.com/maps/search/?api=1&query=123+Community+Lane+Coimbatore+Tamil+Nadu+641001"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                    padding: '12px 20px', borderRadius: 10, fontWeight: 700, fontSize: 14,
                    color: accentGreen, background: isDark ? '#0f172a' : '#fff',
                    border: `1px solid ${isDark ? '#166534' : '#bbf7d0'}`, textDecoration: 'none',
                  }}
                >
                  {t('contact.openInMaps', { defaultValue: 'Open in Google Maps' })} <ExternalLink size={14} />
                </a>
              </div>

              {/* Form card */}
              <div
                ref={cardRef}
                className={`contact-card ${visible ? 'visible' : ''}`}
                style={{
                  position: 'relative', background: cardBg, border: `1px solid ${cardBorder}`,
                  borderRadius: 18, padding: 28,
                  boxShadow: isDark ? 'none' : '0 4px 20px rgba(0,0,0,0.05)',
                }}
              >
                <h2 style={{ marginBottom: 4, fontWeight: 800, color: headingColor, fontSize: 21 }}>
                  {t('contact.connectTitle')}
                </h2>
                <p style={{ color: bodyColor, marginBottom: 22, fontSize: 14 }}>
                  {t('contact.connectSubtitle')}
                </p>
                <form onSubmit={handleSubmit}>
                  <div className="grid grid-2" style={{ gap: 16 }}>
                    <div className="form-group">
                      <label style={{ color: headingColor, fontSize: 13.5, fontWeight: 600 }}>{t('contact.name')}</label>
                      <IconField
                        icon={User}
                        isDark={isDark}
                        required
                        placeholder={t('contact.namePlaceholder')}
                        value={form.name}
                        onChange={(e) => updateField('name', e.target.value)}
                      />
                    </div>
                    <div className="form-group">
                      <label style={{ color: headingColor, fontSize: 13.5, fontWeight: 600 }}>{t('contact.phone')}</label>
                      <IconField
                        icon={Phone}
                        isDark={isDark}
                        required
                        placeholder={t('contact.phonePlaceholder')}
                        value={form.phone}
                        onChange={(e) => updateField('phone', e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="form-group" style={{ marginTop: 14 }}>
                    <label style={{ color: headingColor, fontSize: 13.5, fontWeight: 600 }}>{t('contact.email')}</label>
                    <IconField
                      icon={Mail}
                      isDark={isDark}
                      type="email"
                      required
                      placeholder={t('contact.emailPlaceholder')}
                      value={form.email}
                      onChange={(e) => updateField('email', e.target.value)}
                    />
                  </div>

                  <div className="form-group" style={{ marginTop: 14 }}>
                    <label style={{ color: headingColor, fontSize: 13.5, fontWeight: 600 }}>
                      {t('contact.requestFor', { defaultValue: 'Subject' })}
                    </label>
                    <div style={{ position: 'relative' }}>
                      <Tag size={16} color={accentGreen} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', zIndex: 1 }} />
                      <select
                        className="contact-input"
                        style={{
                          paddingLeft: 36, width: '100%', borderRadius: 10, padding: '11px 14px 11px 36px', fontSize: 14,
                          background: isDark ? '#0f172a' : '#fff',
                          border: `1px solid ${isDark ? '#334155' : '#e5e7eb'}`,
                          color: isDark ? '#f1f5f9' : '#111827',
                        }}
                        value={form.requestFor}
                        onChange={(e) => updateField('requestFor', e.target.value)}
                      >
                        {requestOptions.map((opt) => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="form-group" style={{ marginTop: 14 }}>
                    <label style={{ color: headingColor, fontSize: 13.5, fontWeight: 600 }}>{t('contact.message')}</label>
                    <div style={{ position: 'relative' }}>
                      <MessageSquare size={16} color={accentGreen} style={{ position: 'absolute', left: 12, top: 14 }} />
                      <textarea
                        className="contact-input"
                        required
                        rows={4}
                        placeholder={t('contact.messagePlaceholder')}
                        style={{
                          paddingLeft: 36, width: '100%', borderRadius: 10, padding: '11px 14px 11px 36px', fontSize: 14,
                          background: isDark ? '#0f172a' : '#fff',
                          border: `1px solid ${isDark ? '#334155' : '#e5e7eb'}`,
                          color: isDark ? '#f1f5f9' : '#111827', resize: 'vertical',
                        }}
                        value={form.message}
                        onChange={(e) => updateField('message', e.target.value)}
                      />
                    </div>
                  </div>

                  <button
                    className="contact-submit"
                    style={{
                      width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                      marginTop: 20, padding: '14px 20px', borderRadius: 10, border: 'none', cursor: 'pointer',
                      background: `linear-gradient(90deg, ${isDark ? '#166534' : '#15803d'}, ${isDark ? '#14532d' : '#166534'})`,
                      color: '#fff', fontWeight: 700, fontSize: 15,
                    }}
                    disabled={submitting}
                  >
                    <Send size={16} />
                    {submitting ? t('contact.sending') : t('contact.sendMessage')}
                  </button>
                </form>
              </div>
            </div>
          </div>

          {/* Feature strip */}
          <div className="container" style={{ padding: '30px 20px 60px' }}>
            <div style={{
              background: isDark ? 'rgba(20,83,45,0.92)' : 'rgba(240,253,244,0.92)',
              border: `1px solid ${isDark ? '#166534' : '#dcfce7'}`,
              borderRadius: 16, padding: '26px 30px',
              display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 24,
            }}>
              {features.map((f) => {
                const Icon = f.icon;
                return (
                  <div key={f.title} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{
                      width: 44, height: 44, borderRadius: '50%', background: isDark ? '#052e16' : '#fff',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                      border: `1px solid ${isDark ? '#166534' : '#bbf7d0'}`,
                    }}>
                      <Icon size={19} color={accentGreen} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, color: headingColor, fontSize: 14 }}>{f.title}</div>
                      <div style={{ color: bodyColor, fontSize: 12.5, marginTop: 2 }}>{f.sub}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <Footer />
      </div>
    </div>
  );
}