import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { User, Mail, Phone, MapPin, HeartHandshake, IndianRupee, MessageSquare, UploadCloud, Send, ShieldCheck, Paperclip } from 'lucide-react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { assistanceApplicationService } from '../../services/assistanceApplicationService';
import { useTheme } from '../../context/ThemeContext';
import leavesFrame from '../../assets/images/backgrounds/leaves-frame.jpg';

// NOTE: labels are now looked up via t(`applyHelp.types.${key}`) at render time
// instead of being hardcoded here, so this array only carries keys + values.
// The numeric `value` sent to the backend is unchanged.
const TYPE_OPTIONS = [
  { key: 'medical', value: 0 },
  { key: 'education', value: 1 },
  { key: 'food', value: 2 },
  { key: 'disaster', value: 3 },
];

function SupportIllustration({ isDark }) {
  const heartFill = isDark ? '#22c55e' : '#16a34a';
  const heartFillLight = isDark ? '#166534' : '#86efac';
  const badgeBg = isDark ? '#1e293b' : '#fff';
  const badgeBorder = isDark ? '#334155' : '#eef2f2';
  const iconColor = isDark ? '#4ade80' : '#16a34a';
  const skin = '#f3b98c';
  const cuff = isDark ? '#166534' : '#16a34a';

  return (
    <div style={{ position: 'relative', width: 260, height: 280, margin: '0 auto 24px' }}>
      <svg viewBox="0 0 260 280" width="260" height="280">
        <defs>
          <linearGradient id="heartGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={heartFillLight} />
            <stop offset="100%" stopColor={heartFill} />
          </linearGradient>
        </defs>

        {/* dot grids */}
        <g fill={isDark ? '#334155' : '#86efac'} opacity="0.6">
          {Array.from({ length: 3 }).map((_, r) =>
            Array.from({ length: 4 }).map((_, cIdx) => (
              <circle key={`${r}-${cIdx}`} cx={195 + cIdx * 12} cy={30 + r * 12} r="2" />
            ))
          )}
          {Array.from({ length: 3 }).map((_, r) =>
            Array.from({ length: 4 }).map((_, cIdx) => (
              <circle key={`b-${r}-${cIdx}`} cx={25 + cIdx * 12} cy={230 + r * 12} r="2" />
            ))
          )}
        </g>

        {/* soft background blob */}
        <path d="M20 40 C -20 60, -10 140, 40 160 L 40 280 L 0 280 Z" fill={isDark ? '#14532d' : '#dcfce7'} opacity="0.7" />

        {/* dashed orbit */}
        <circle cx="130" cy="150" r="95" fill="none" stroke={isDark ? '#334155' : '#bbf7d0'} strokeWidth="2" strokeDasharray="4 6" opacity="0.7" />

        {/* leaf sprig bottom right */}
        <g stroke={isDark ? '#4ade80' : '#86efac'} strokeWidth="2.5" fill="none" opacity="0.8">
          <path d="M170 240 C 172 210, 185 195, 200 190" />
          <ellipse cx="182" cy="215" rx="9" ry="16" transform="rotate(-25 182 215)" fill={isDark ? '#166534' : '#bbf7d0'} stroke="none" />
          <ellipse cx="192" cy="200" rx="8" ry="14" transform="rotate(-15 192 200)" fill={isDark ? '#166534' : '#bbf7d0'} stroke="none" />
        </g>

        {/* hand */}
        <path
          d="M55 195 C 55 185, 65 178, 78 180 L 175 180 C 195 180, 205 195, 190 210 C 175 225, 120 230, 90 225 C 70 222, 55 210, 55 195 Z"
          fill={skin}
        />
        <rect x="52" y="185" width="26" height="34" rx="10" fill={cuff} />

        {/* central heart with cross */}
        <path
          d="M130 100 C 108 70, 60 82, 60 122 C 60 165, 130 200, 130 200 C 130 200, 200 165, 200 122 C 200 82, 152 70, 130 100 Z"
          fill="url(#heartGrad)"
        />
        <rect x="120" y="118" width="20" height="52" rx="4" fill="#fff" />
        <rect x="104" y="134" width="52" height="20" rx="4" fill="#fff" />

        {/* small floating hearts */}
        <path d="M50 155 c-3-4-10-2-10 3 c0 5 10 10 10 10 s10-5 10-10 c0-5-7-7-10-3z" fill={iconColor} opacity="0.7" />
        <path d="M205 175 c-2.5-3-8-1.5-8 2.5 c0 4 8 8 8 8 s8-4 8-8 c0-4-5.5-5.5-8-2.5z" fill={iconColor} opacity="0.6" />

        {/* badge: medical kit (top) */}
        <circle cx="130" cy="45" r="27" fill={badgeBg} stroke={badgeBorder} strokeWidth="2" />
        <rect x="118" y="38" width="24" height="18" rx="3" fill={iconColor} />
        <rect x="126" y="32" width="8" height="8" rx="2" fill={iconColor} />
        <rect x="127" y="42" width="6" height="2.5" fill="#fff" />
        <rect x="128.7" y="40.5" width="2.5" height="6" fill="#fff" />

        {/* badge: stethoscope (left) */}
        <circle cx="45" cy="120" r="26" fill={badgeBg} stroke={badgeBorder} strokeWidth="2" />
        <path d="M35 108 v10 a8 8 0 0 0 16 0 v-10" stroke={iconColor} strokeWidth="2.5" fill="none" strokeLinecap="round" />
        <circle cx="35" cy="106" r="2.5" fill={iconColor} />
        <circle cx="51" cy="106" r="2.5" fill={iconColor} />
        <circle cx="43" cy="130" r="4" fill="none" stroke={iconColor} strokeWidth="2.5" />

        {/* badge: medicine bottle (right) */}
        <circle cx="215" cy="118" r="26" fill={badgeBg} stroke={badgeBorder} strokeWidth="2" />
        <rect x="208" y="112" width="14" height="20" rx="3" fill={iconColor} />
        <rect x="211" y="105" width="8" height="8" rx="2" fill={iconColor} />
        <rect x="211" y="119" width="8" height="2" fill="#fff" />
        <rect x="214" y="116" width="2" height="8" fill="#fff" />
      </svg>
    </div>
  );
}

export default function ApplyForHelp() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { theme } = useTheme();
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    type: 0,
    amountRequired: '',
    reason: '',
  });
  const [document, setDocument] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

  const c = {
    // Tint applied to the WHOLE photo (see the overlay div in the JSX below),
    // including the strip behind/above the sticky navbar. Full black in dark
    // mode, matching the Contact page.
    pageBg: isDark ? '#000000' : 'rgba(255,255,255,0.2)',
    headingColor: isDark ? '#f1f5f9' : '#111827',
    subColor: isDark ? '#94a3b8' : '#6b7280',
    cardBg: isDark ? '#1e293b' : '#fff',
    labelColor: isDark ? '#e2e8f0' : '#111827',
    iconBoxBg: isDark ? '#166534' : '#dcfce7',
    iconColor: isDark ? '#4ade80' : '#16a34a',
    inputBg: isDark ? '#0f172a' : '#fff',
    inputBorder: isDark ? '#334155' : '#e5e7eb',
    inputText: isDark ? '#e2e8f0' : '#111827',
    uploadBg: isDark ? '#0f172a' : '#f8fafc',
    uploadBorder: isDark ? '#166534' : '#bbf7d0',
    noteBg: isDark ? '#1e293b' : '#fff',
    noteBorder: isDark ? '#334155' : '#e5e7eb',
  };

  const fieldWrap = { marginBottom: 18 };
  const labelStyle = { display: 'block', fontSize: 14, fontWeight: 600, color: c.labelColor, marginBottom: 6 };
  const inputRowStyle = { display: 'flex', alignItems: 'center', gap: 10 };
  const iconBoxStyle = {
    width: 40, height: 40, borderRadius: 10, background: c.iconBoxBg,
    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  };
  const inputStyle = {
    flex: 1, padding: '10px 12px', borderRadius: 8, border: `1px solid ${c.inputBorder}`,
    fontSize: 14, outline: 'none', background: c.inputBg, color: c.inputText,
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const payload = new FormData();
      payload.append('FullName', form.fullName);
      payload.append('Email', form.email);
      payload.append('Phone', form.phone);
      payload.append('Address', form.address);
      payload.append('Type', form.type);
      payload.append('AmountRequired', form.amountRequired);
      payload.append('Reason', form.reason);
      if (document) payload.append('Document', document);

      await assistanceApplicationService.submit(payload);
      navigate('/my-applications');
    } catch (err) {
      setError(err?.response?.data?.message || t('applyHelp.errorDefault'));
    } finally {
      setSubmitting(false);
    }
  };

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
      {/* Tints the ENTIRE photo — including the strip behind/above the
          sticky navbar — so that area also goes fully black in dark mode
          instead of staying on the raw bright image. */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: c.pageBg,
          pointerEvents: 'none',
          transition: 'background 0.25s ease',
        }}
      />

      <div style={{ position: 'relative' }}>
        <Navbar />

        {/* No `background` here anymore — the overlay above already tints
            the whole page, navbar included. */}
        <div style={{ position: 'relative', overflow: 'hidden' }}>
          <div style={{
            position: 'absolute', top: 24, left: 24, width: 110, height: 110,
            backgroundImage: `radial-gradient(${isDark ? '#334155' : '#86efac'} 1.5px, transparent 1.5px)`,
            backgroundSize: '14px 14px', opacity: 0.6, pointerEvents: 'none',
          }} />
          <div style={{
            position: 'absolute', bottom: 24, right: 24, width: 110, height: 110,
            backgroundImage: `radial-gradient(${isDark ? '#334155' : '#4ade80'} 1.5px, transparent 1.5px)`,
            backgroundSize: '14px 14px', opacity: 0.6, pointerEvents: 'none',
          }} />
          <div style={{
            position: 'absolute', bottom: -120, left: -80, width: 400, height: 400,
            borderRadius: '50%', background: isDark ? 'rgba(22,163,74,0.10)' : 'rgba(22,163,74,0.10)', pointerEvents: 'none',
          }} />
          <div style={{
            position: 'absolute', top: -100, right: -100, width: 320, height: 320,
            borderRadius: '50%', background: isDark ? 'rgba(74,222,128,0.08)' : 'rgba(74,222,128,0.12)', pointerEvents: 'none',
          }} />

          <div className="container" style={{ padding: '48px 20px', position: 'relative', zIndex: 1 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.4fr', gap: 40, alignItems: 'start' }}>

              {/* Left: illustration + message */}
              <div style={{ paddingTop: 20, textAlign: 'center' }}>
                <SupportIllustration isDark={isDark} />

                <h2 style={{ fontSize: 30, fontWeight: 800, color: c.headingColor, lineHeight: 1.25, marginBottom: 8 }}>
                  {t('applyHelp.heroLine1', 'We\'re here')}<br />
                  to <span style={{ color: isDark ? '#4ade80' : '#16a34a' }}>support</span> you
                </h2>
                <div style={{ width: 50, height: 3, background: isDark ? '#4ade80' : '#16a34a', margin: '0 auto 16px' }} />
                <p style={{ color: c.subColor, fontSize: 14, maxWidth: 280, margin: '0 auto 24px' }}>
                  {t('applyHelp.heroText')}
                </p>

                <div
                  style={{
                    background: c.noteBg, border: `1px solid ${c.noteBorder}`, borderRadius: 14,
                    padding: '14px 18px', display: 'flex', alignItems: 'flex-start', gap: 12, textAlign: 'left',
                  }}
                >
                  <div style={{
                    width: 36, height: 36, borderRadius: 10, background: isDark ? '#166534' : '#16a34a',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  }}>
                    <ShieldCheck size={18} color="#fff" />
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, color: c.headingColor, fontSize: 14 }}>
                      Your information is safe with us
                    </div>
                    <div style={{ color: c.subColor, fontSize: 12.5, marginTop: 2 }}>
                      We ensure the confidentiality of all requests and personal details.
                    </div>
                  </div>
                </div>
              </div>

              {/* Right: form */}
              <div>
                <h1 style={{ marginBottom: 6, color: c.headingColor }}>{t('applyHelp.pageTitle')}</h1>
                <div style={{ width: 44, height: 3, background: isDark ? '#4ade80' : '#16a34a', marginBottom: 14 }} />
                <p style={{ color: c.subColor, marginBottom: 20 }}>
                  {t('applyHelp.pageSubtitle')}
                </p>

                <form onSubmit={handleSubmit} style={{ padding: 28, background: c.cardBg, borderRadius: 16, boxShadow: isDark ? 'none' : '0 1px 3px rgba(0,0,0,0.06)' }}>

                  <div style={fieldWrap}>
                    <label style={labelStyle}>{t('applyHelp.fullNameLabel')}</label>
                    <div style={inputRowStyle}>
                      <div style={iconBoxStyle}><User size={18} color={c.iconColor} /></div>
                      <input name="fullName" required placeholder={t('applyHelp.fullNamePlaceholder')}
                        value={form.fullName} onChange={handleChange} style={inputStyle} />
                    </div>
                  </div>

                  <div style={fieldWrap}>
                    <label style={labelStyle}>{t('applyHelp.emailLabel')}</label>
                    <div style={inputRowStyle}>
                      <div style={iconBoxStyle}><Mail size={18} color={c.iconColor} /></div>
                      <input type="email" name="email" required placeholder={t('applyHelp.emailPlaceholder')}
                        value={form.email} onChange={handleChange} style={inputStyle} />
                    </div>
                  </div>

                  <div style={fieldWrap}>
                    <label style={labelStyle}>{t('applyHelp.phoneLabel')}</label>
                    <div style={inputRowStyle}>
                      <div style={iconBoxStyle}><Phone size={18} color={c.iconColor} /></div>
                      <input name="phone" required placeholder={t('applyHelp.phonePlaceholder')}
                        value={form.phone} onChange={handleChange} style={inputStyle} />
                    </div>
                  </div>

                  <div style={fieldWrap}>
                    <label style={labelStyle}>{t('applyHelp.addressLabel')}</label>
                    <div style={inputRowStyle}>
                      <div style={iconBoxStyle}><MapPin size={18} color={c.iconColor} /></div>
                      <input name="address" required placeholder={t('applyHelp.addressPlaceholder')}
                        value={form.address} onChange={handleChange} style={inputStyle} />
                    </div>
                  </div>

                  <div style={fieldWrap}>
                    <label style={labelStyle}>{t('applyHelp.typeLabel')}</label>
                    <div style={inputRowStyle}>
                      <div style={iconBoxStyle}><HeartHandshake size={18} color={c.iconColor} /></div>
                      <select name="type" value={form.type} onChange={handleChange} style={{ ...inputStyle, background: c.inputBg }}>
                        {TYPE_OPTIONS.map((opt) => (
                          <option key={opt.value} value={opt.value}>{t(`applyHelp.types.${opt.key}`)}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div style={fieldWrap}>
                    <label style={labelStyle}>{t('applyHelp.amountLabel')}</label>
                    <div style={inputRowStyle}>
                      <div style={iconBoxStyle}><IndianRupee size={18} color={c.iconColor} /></div>
                      <input type="number" min="1" step="0.01" name="amountRequired" required
                        placeholder={t('applyHelp.amountPlaceholder')}
                        value={form.amountRequired} onChange={handleChange} style={inputStyle} />
                    </div>
                  </div>

                  <div style={fieldWrap}>
                    <label style={labelStyle}>{t('applyHelp.reasonLabel')}</label>
                    <div style={inputRowStyle}>
                      <div style={iconBoxStyle}><MessageSquare size={18} color={c.iconColor} /></div>
                      <input name="reason" required placeholder={t('applyHelp.reasonPlaceholder')}
                        value={form.reason} onChange={handleChange} style={inputStyle} />
                    </div>
                  </div>

                  <div style={fieldWrap}>
                    <label style={labelStyle}>{t('applyHelp.documentsLabel')}</label>
                    <label
                      htmlFor="document-upload"
                      style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        gap: 10, border: `2px dashed ${c.uploadBorder}`, borderRadius: 10, padding: '22px 12px',
                        cursor: 'pointer', background: c.uploadBg, textAlign: 'center',
                      }}
                    >
                      <Paperclip size={18} color={c.iconColor} />
                      <div style={{ textAlign: 'left' }}>
                        <div>
                          <span style={{ color: c.iconColor, fontWeight: 600, fontSize: 14 }}>
                            {document ? document.name : t('applyHelp.uploadPlaceholder')}
                          </span>
                        </div>
                        <span style={{ color: c.subColor, fontSize: 12 }}>{t('applyHelp.uploadHint')}</span>
                      </div>
                      <input
                        id="document-upload"
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={(e) => setDocument(e.target.files[0])}
                        style={{ display: 'none' }}
                      />
                    </label>
                  </div>

                  {error && <p style={{ color: '#ef4444', marginBottom: 14 }}>{error}</p>}

                  <button
                    type="submit"
                    disabled={submitting}
                    style={{
                      width: '100%', padding: '14px', borderRadius: 10, border: 'none',
                      background: isDark ? 'linear-gradient(90deg, #166534 0%, #15803d 100%)' : 'linear-gradient(90deg, #16a34a 0%, #059669 100%)',
                      color: '#fff', fontWeight: 700, fontSize: 15, cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                    }}
                  >
                    <Send size={17} />
                    {submitting ? t('applyHelp.submitting') : t('applyHelp.submitButton')}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>

        <Footer />
      </div>
    </div>
  );
}