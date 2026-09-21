import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Eye, EyeOff, KeyRound, Mail, ShieldCheck, CheckCircle2, ArrowLeft } from 'lucide-react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import PageBackground from '../../components/PageBackground';
import { donorService } from '../../services/donorService';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import leavesFrame from '../../assets/images/backgrounds/leaves-frame.jpg';

const RESEND_SECONDS = 60;

// "avishkar@gmail.com" -> "av***@gmail.com"
function maskEmail(email) {
  if (!email || !email.includes('@')) return 'your email';
  const [local, domain] = email.split('@');
  return `${local.slice(0, 2)}***@${domain}`;
}

/* One password input with a lock icon and a show / hide button.
   `labelRight` is an optional element shown on the right of the label (e.g. "Forgot password?"). */
function PasswordInput({ label, labelRight, value, onChange, placeholder, error, hint, autoComplete, c }) {
  const [show, setShow] = useState(false);
  return (
    <div style={{ minWidth: 0 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginBottom: 6 }}>
        <label style={{ fontSize: 13.5, fontWeight: 700, color: c.text }}>{label}</label>
        {labelRight}
      </div>
      <div
        className="hc-field"
        style={{
          display: 'flex', alignItems: 'center', gap: 10, height: 46, padding: '0 14px', borderRadius: 10,
          border: error ? '1px solid #dc2626' : c.inputBorder, background: c.inputBg,
        }}
      >
        <Lock size={16} color={c.textMuted} style={{ flexShrink: 0 }} />
        <input
          type={show ? 'text' : 'password'}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          autoComplete={autoComplete}
          style={{ flex: 1, minWidth: 0, height: '100%', border: 'none', outline: 'none', background: 'transparent', color: c.text, fontSize: 14, fontFamily: 'inherit' }}
        />
        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          aria-label={show ? 'Hide password' : 'Show password'}
          style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', display: 'flex', flexShrink: 0 }}
        >
          {show ? <EyeOff size={17} color={c.textMuted} /> : <Eye size={17} color={c.textMuted} />}
        </button>
      </div>
      {error && <div style={{ color: '#dc2626', fontSize: 12, marginTop: 4 }}>{error}</div>}
      {hint && !error && <div style={{ color: c.textSubtle, fontSize: 12, marginTop: 4 }}>{hint}</div>}
    </div>
  );
}

export default function ChangePassword() {
  const { user } = useAuth();
  const { theme } = useTheme();
  const navigate = useNavigate();
  const isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

  // 'current' = normal form (current + new + confirm)
  // 'send'    = "Forgot password?" -> send the email code
  // 'verify'  = enter the code + new password
  // 'done'    = success
  const [mode, setMode] = useState('current');
  const [current, setCurrent] = useState('');
  const [code, setCode] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [errors, setErrors] = useState({});
  const [sending, setSending] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null); // { type: 'success' | 'error', text }
  const [cooldown, setCooldown] = useState(0);

  // Count down the "Resend code" timer
  useEffect(() => {
    if (cooldown <= 0) return undefined;
    const id = setTimeout(() => setCooldown((s) => s - 1), 1000);
    return () => clearTimeout(id);
  }, [cooldown]);

  const c = {
    cardBg: isDark ? '#1e293b' : '#fff',
    cardBorder: isDark ? '1px solid #334155' : 'none',
    text: isDark ? '#f1f5f9' : '#111827',
    textMuted: isDark ? '#94a3b8' : '#6b7280',
    textSubtle: isDark ? '#64748b' : '#9ca3af',
    inputBorder: isDark ? '1px solid #475569' : '1px solid #d1d5db',
    inputBg: isDark ? '#0f172a' : '#fff',
    accent: isDark ? '#4ade80' : '#065f46',
    accentSoft: isDark ? 'rgba(22,163,74,0.15)' : '#dcfce7',
  };

  const backToProfile = () => navigate('/profile');

  const goTo = (m) => {
    setMode(m);
    setErrors({});
    setMessage(null);
  };

  const clearError = (key) => {
    if (errors[key]) setErrors((er) => ({ ...er, [key]: undefined }));
    if (message) setMessage(null);
  };

  const sendCode = async () => {
    setSending(true);
    setMessage(null);
    setErrors({});
    try {
      const res = await donorService.sendPasswordCode();
      setMode('verify');
      setCooldown(RESEND_SECONDS);
      setMessage({ type: 'success', text: res?.message || 'Verification code sent.' });
    } catch (err) {
      const text = err?.response?.data?.message || 'Could not send the code. Please try again.';
      // "please wait" answers mean a code was already sent a moment ago
      if (err?.response?.status === 429) setMode('verify');
      setMessage({ type: 'error', text });
    } finally {
      setSending(false);
    }
  };

  const validate = () => {
    const er = {};
    if (mode === 'current') {
      if (!current) er.current = 'Enter your current password.';
    } else if (!/^\d{6}$/.test(code)) {
      er.code = 'Enter the 6-digit code from the email.';
    }
    if (next.length < 8) er.next = 'Use at least 8 characters.';
    else if (!/[A-Za-z]/.test(next) || !/\d/.test(next)) er.next = 'Include at least one letter and one number.';
    else if (mode === 'current' && current && next === current) er.next = 'New password must be different from your current one.';
    if (!confirm) er.confirm = 'Re-enter your new password.';
    else if (confirm !== next) er.confirm = 'Passwords do not match.';
    setErrors(er);
    return Object.keys(er).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSaving(true);
    setMessage(null);
    try {
      const payload = mode === 'verify'
        ? { code, newPassword: next }
        : { currentPassword: current, newPassword: next };
      await donorService.changePassword(payload);
      setCurrent('');
      setCode('');
      setNext('');
      setConfirm('');
      setMode('done');
    } catch (err) {
      const text = err?.response?.data?.message || 'Could not change your password. Please try again.';
      setMessage({ type: 'error', text });
    } finally {
      setSaving(false);
    }
  };

  const primaryBtn = (disabled) => ({
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 10, width: '100%',
    background: '#065f46', color: '#fff', border: 'none', borderRadius: 10,
    padding: '13px 28px', fontWeight: 700, fontSize: 15,
    cursor: disabled ? 'default' : 'pointer', opacity: disabled ? 0.7 : 1,
  });

  const linkBtn = {
    background: 'none', border: 'none', padding: 0, cursor: 'pointer',
    color: c.accent, fontWeight: 600, fontSize: 13.5, fontFamily: 'inherit',
  };

  const heading = (Icon, text) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <Icon size={28} color={c.accent} />
      <h1 style={{ margin: 0, fontSize: 26, fontWeight: 800, color: c.accent }}>{text}</h1>
    </div>
  );

  const subtitle = (children) => (
    <p style={{ margin: '10px 0 22px', color: c.textMuted, fontSize: 14.5, lineHeight: 1.6 }}>{children}</p>
  );

  const statusLine = message && (
    <p
      role={message.type === 'error' ? 'alert' : 'status'}
      style={{ margin: '16px 0 0', fontSize: 14, fontWeight: 600, color: message.type === 'success' ? c.accent : '#dc2626' }}
    >
      {message.text}
    </p>
  );

  // New + confirm fields are the same in both forms
  const newPasswordFields = (
    <>
      <PasswordInput
        label="New Password"
        value={next}
        onChange={(e) => { setNext(e.target.value); clearError('next'); }}
        placeholder="At least 8 characters"
        hint="Use a mix of letters and numbers."
        autoComplete="new-password"
        error={errors.next}
        c={c}
      />
      <PasswordInput
        label="Confirm New Password"
        value={confirm}
        onChange={(e) => { setConfirm(e.target.value); clearError('confirm'); }}
        placeholder="Re-enter new password"
        autoComplete="new-password"
        error={errors.confirm}
        c={c}
      />
    </>
  );

  return (
    <PageBackground image={leavesFrame} overlay={isDark ? '#000000' : 'rgba(255,255,255,0.55)'}>
      <Navbar />

      <style>{`
        .hc-field:focus-within { border-color: #16a34a !important; box-shadow: 0 0 0 3px rgba(22,163,74,0.18); }
        .hc-btn:focus-visible { outline: 3px solid rgba(22,163,74,0.45); outline-offset: 2px; }
        .hc-field input::placeholder { color: ${c.textSubtle}; }
      `}</style>

      <div style={{ padding: '40px 20px', minHeight: '60vh' }}>
        <div
          style={{
            maxWidth: 520, margin: '0 auto', boxSizing: 'border-box',
            background: c.cardBg, border: c.cardBorder, borderRadius: 20, padding: '32px 32px 28px',
            boxShadow: isDark ? 'none' : '0 1px 3px rgba(0,0,0,0.06)',
          }}
        >
          <button type="button" className="hc-btn" onClick={backToProfile} style={{ ...linkBtn, display: 'inline-flex', alignItems: 'center', gap: 6, color: c.textMuted, marginBottom: 18 }}>
            <ArrowLeft size={15} /> Back to profile
          </button>

          {/* ───────── Normal form: current + new + confirm ───────── */}
          {mode === 'current' && (
            <form onSubmit={handleSubmit} noValidate>
              {heading(KeyRound, 'Change Password')}
              {subtitle('Enter your current password, then choose a new one.')}

              <div style={{ display: 'grid', gap: 18 }}>
                <PasswordInput
                  label="Current Password"
                  labelRight={
                    <button type="button" className="hc-btn" onClick={() => goTo('send')} style={linkBtn}>
                      Forgot password?
                    </button>
                  }
                  value={current}
                  onChange={(e) => { setCurrent(e.target.value); clearError('current'); }}
                  placeholder="Enter current password"
                  autoComplete="current-password"
                  error={errors.current}
                  c={c}
                />
                {newPasswordFields}
              </div>

              {statusLine}

              <button type="submit" className="hc-btn" disabled={saving} style={{ ...primaryBtn(saving), marginTop: 22 }}>
                <Lock size={17} /> {saving ? 'Changing...' : 'Change Password'}
              </button>
            </form>
          )}

          {/* ───────── Forgot password: send the code ───────── */}
          {mode === 'send' && (
            <>
              {heading(Mail, 'Forgot Password?')}
              {subtitle('No problem. We will send a 6-digit verification code to your email so you can set a new password.')}

              <div style={{ display: 'flex', alignItems: 'center', gap: 12, background: c.accentSoft, borderRadius: 12, padding: '14px 16px' }}>
                <Mail size={18} color={c.accent} />
                <div>
                  <div style={{ fontSize: 12.5, color: c.textMuted }}>Code will be sent to</div>
                  <div style={{ fontWeight: 700, color: c.text, fontSize: 15 }}>{maskEmail(user?.email)}</div>
                </div>
              </div>

              {statusLine}

              <button type="button" className="hc-btn" onClick={sendCode} disabled={sending} style={{ ...primaryBtn(sending), marginTop: 22 }}>
                <Mail size={17} /> {sending ? 'Sending...' : 'Send Verification Code'}
              </button>

              <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8, marginTop: 14 }}>
                <button type="button" className="hc-btn" onClick={() => goTo('current')} style={linkBtn}>
                  I remember my password
                </button>
                <button type="button" className="hc-btn" onClick={() => goTo('verify')} style={linkBtn}>
                  I already have a code
                </button>
              </div>
            </>
          )}

          {/* ───────── Forgot password: enter the code + new password ───────── */}
          {mode === 'verify' && (
            <form onSubmit={handleSubmit} noValidate>
              {heading(ShieldCheck, 'Verify & Set Password')}
              {subtitle(
                <>
                  Enter the code we sent to <strong style={{ color: c.text }}>{maskEmail(user?.email)}</strong> and choose your new password. The code is valid for 10 minutes.
                </>
              )}

              <div style={{ display: 'grid', gap: 18 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 13.5, fontWeight: 700, color: c.text, marginBottom: 6 }}>Verification Code</label>
                  <div
                    className="hc-field"
                    style={{ display: 'flex', alignItems: 'center', height: 52, padding: '0 14px', borderRadius: 10, border: errors.code ? '1px solid #dc2626' : c.inputBorder, background: c.inputBg }}
                  >
                    <input
                      type="text" inputMode="numeric" autoComplete="one-time-code" maxLength={6}
                      value={code}
                      onChange={(e) => { setCode(e.target.value.replace(/\D/g, '')); clearError('code'); }}
                      placeholder="6-digit code"
                      style={{ flex: 1, minWidth: 0, height: '100%', border: 'none', outline: 'none', background: 'transparent', color: c.text, fontSize: 22, fontWeight: 700, letterSpacing: 6, textAlign: 'center', fontFamily: 'inherit' }}
                    />
                  </div>
                  {errors.code && <div style={{ color: '#dc2626', fontSize: 12, marginTop: 4 }}>{errors.code}</div>}
                </div>

                {newPasswordFields}
              </div>

              {statusLine}

              <button type="submit" className="hc-btn" disabled={saving} style={{ ...primaryBtn(saving), marginTop: 22 }}>
                <Lock size={17} /> {saving ? 'Changing...' : 'Change Password'}
              </button>

              <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8, marginTop: 14, fontSize: 13.5, color: c.textMuted }}>
                <span>
                  Did not get the email?{' '}
                  {cooldown > 0 ? (
                    <span>Resend in {cooldown}s</span>
                  ) : (
                    <button type="button" className="hc-btn" onClick={sendCode} disabled={sending} style={linkBtn}>
                      {sending ? 'Sending...' : 'Resend code'}
                    </button>
                  )}
                </span>
                <button type="button" className="hc-btn" onClick={() => goTo('current')} style={linkBtn}>
                  I remember my password
                </button>
              </div>
            </form>
          )}

          {/* ───────── Done ───────── */}
          {mode === 'done' && (
            <div style={{ textAlign: 'center', padding: '10px 0 4px' }}>
              <div style={{ width: 72, height: 72, borderRadius: '50%', background: c.accentSoft, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                <CheckCircle2 size={38} color={c.accent} />
              </div>
              <h1 style={{ margin: 0, fontSize: 26, fontWeight: 800, color: c.accent }}>Password changed</h1>
              <p style={{ margin: '10px 0 24px', color: c.textMuted, fontSize: 14.5, lineHeight: 1.6 }}>
                Your password was updated successfully. Use the new password the next time you log in.
              </p>
              <button type="button" className="hc-btn" onClick={backToProfile} style={primaryBtn(false)}>
                Back to Profile
              </button>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </PageBackground>
  );
}