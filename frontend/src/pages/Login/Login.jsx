import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, LogIn, ShieldCheck, HeartHandshake, Users } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';

const GOOGLE_CLIENT_ID = '523971407329-leb5sti8dbv7nlcbl127a5hg9aucss75.apps.googleusercontent.com';
const FACEBOOK_APP_ID = '1343155740654333';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, loginWithGoogle, loginWithFacebook } = useAuth();
  const navigate = useNavigate();
  const googleButtonRef = useRef(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await login({ email, password });
      toast.success('Welcome back!');
      navigate(data.role === 'Admin' ? '/admin/dashboard' : '/');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const handleOAuthSuccess = (data) => {
    toast.success('Welcome back!');
    navigate(data.role === 'Admin' ? '/admin/dashboard' : '/');
  };

  const handleOAuthError = (provider, err) => {
    console.error(err);
    toast.error(err?.response?.data?.message || `${provider} login failed`);
  };

  // --- Google Identity Services setup ---
  useEffect(() => {
    const scriptId = 'google-identity-script';
    if (document.getElementById(scriptId)) {
      initGoogle();
      return;
    }
    const script = document.createElement('script');
    script.id = scriptId;
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = initGoogle;
    document.body.appendChild(script);

    function initGoogle() {
      if (!window.google || !googleButtonRef.current) return;
      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        // Must stay a plain (non-async) function — GSI rejects AsyncFunction callbacks.
        callback: (response) => {
          (async () => {
            try {
              const data = await loginWithGoogle(response.credential);
              handleOAuthSuccess(data);
            } catch (err) {
              handleOAuthError('Google', err);
            }
          })();
        },
      });
      window.google.accounts.id.renderButton(googleButtonRef.current, {
        theme: 'outline',
        size: 'large',
        width: 210,
        text: 'continue_with',
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // --- Facebook SDK setup ---
  useEffect(() => {
    if (window.FB) return;
    window.fbAsyncInit = function () {
      window.FB.init({
        appId: FACEBOOK_APP_ID,
        cookie: true,
        xfbml: false,
        version: 'v20.0',
      });
    };
    const scriptId = 'facebook-jssdk';
    if (document.getElementById(scriptId)) return;
    const script = document.createElement('script');
    script.id = scriptId;
    script.src = 'https://connect.facebook.net/en_US/sdk.js';
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);
  }, []);

  const handleFacebookLogin = () => {
    if (!window.FB) {
      toast.error('Facebook SDK is still loading — try again in a moment');
      return;
    }
    // Same rule as Google: FB.login's callback must be plain, not async.
    window.FB.login(
      (response) => {
        if (response.authResponse) {
          (async () => {
            try {
              const data = await loginWithFacebook(response.authResponse.accessToken);
              handleOAuthSuccess(data);
            } catch (err) {
              handleOAuthError('Facebook', err);
            }
          })();
        } else {
          toast.info('Facebook login was cancelled');
        }
      },
      { scope: 'public_profile,email' }
    );
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #dbeafe 0%, #eef2ff 50%, #e0e7ff 100%)',
        padding: 24,
      }}
    >
      <div
        style={{
          display: 'flex',
          width: '100%',
          maxWidth: 1200,
          borderRadius: 24,
          overflow: 'hidden',
          alignItems: 'center',
          gap: 40,
        }}
      >
        {/* Left side */}
        <div style={{ flex: 1, padding: '20px 20px', display: 'flex', flexDirection: 'column', gap: 28, position: 'relative' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div
              style={{
                width: 48, height: 48, borderRadius: 12,
                background: 'linear-gradient(135deg, #2563eb, #1e40af)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              <HeartHandshake size={26} color="#fff" />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 20, color: '#111827' }}>HopeCare</div>
              <div style={{ fontSize: 13, color: '#6b7280' }}>Together for a better tomorrow</div>
            </div>
          </div>

          <div>
            <h1 style={{ fontSize: 38, fontWeight: 800, lineHeight: 1.2, color: '#111827', margin: 0 }}>
              Together We Can<br />
              <span style={{ color: '#2563eb' }}>Make A Difference</span>
            </h1>
            <p style={{ fontSize: 15, color: '#6b7280', marginTop: 16, maxWidth: 420 }}>
              Your small contribution can bring hope and change lives of many people.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <FeatureRow icon={Users} title="Trusted & Transparent" subtitle="100% transparency in every donation" />
            <FeatureRow icon={HeartHandshake} title="Impact Driven" subtitle="Real change in communities" />
            <FeatureRow icon={ShieldCheck} title="Secure & Safe" subtitle="Your data and donations are safe" />
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', marginTop: 8 }}>
            <HandsHeartIllustration />
          </div>
        </div>

        {/* Right side - form */}
        <div
          style={{
            flex: 1,
            maxWidth: 480,
            background: '#fff',
            borderRadius: 24,
            padding: '48px 44px',
            boxShadow: '0 20px 60px rgba(30, 58, 138, 0.12)',
          }}
        >
          <h2 style={{ fontSize: 28, fontWeight: 800, textAlign: 'center', margin: 0, color: '#111827' }}>
            Welcome Back!
          </h2>
          <p style={{ textAlign: 'center', color: '#6b7280', fontSize: 14, marginTop: 8, marginBottom: 32 }}>
            Login to continue your journey with HopeCare
          </p>

          <form onSubmit={handleSubmit}>
            <label style={{ fontSize: 14, fontWeight: 600, color: '#111827' }}>Email</label>
            <div style={{ position: 'relative', marginTop: 8, marginBottom: 20 }}>
              <Mail size={18} color="#9ca3af" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                style={{
                  width: '100%', padding: '12px 14px 12px 42px', borderRadius: 10,
                  border: '1px solid #e5e7eb', fontSize: 14, outline: 'none', boxSizing: 'border-box',
                }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label style={{ fontSize: 14, fontWeight: 600, color: '#111827' }}>Password</label>
              <Link to="/forgot-password" style={{ fontSize: 13, color: '#2563eb', fontWeight: 500 }}>
                Forgot Password?
              </Link>
            </div>
            <div style={{ position: 'relative', marginTop: 8, marginBottom: 24 }}>
              <Lock size={18} color="#9ca3af" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                style={{
                  width: '100%', padding: '12px 14px 12px 42px', borderRadius: 10,
                  border: '1px solid #e5e7eb', fontSize: 14, outline: 'none', boxSizing: 'border-box',
                }}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%', padding: '13px 0', borderRadius: 10, border: 'none',
                background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)', color: '#fff',
                fontWeight: 600, fontSize: 15, cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                opacity: loading ? 0.7 : 1,
              }}
            >
              <LogIn size={18} />
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '24px 0' }}>
            <div style={{ flex: 1, height: 1, background: '#e5e7eb' }} />
            <span style={{ fontSize: 13, color: '#9ca3af' }}>or continue with</span>
            <div style={{ flex: 1, height: 1, background: '#e5e7eb' }} />
          </div>

          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <div ref={googleButtonRef} style={{ flex: 1, display: 'flex', justifyContent: 'center' }} />
            <SocialButton label="Facebook" color="#1877f2" onClick={handleFacebookLogin} />
          </div>

          <p style={{ textAlign: 'center', fontSize: 14, color: '#6b7280', marginTop: 28 }}>
            Don't have an account?{' '}
            <Link to="/register" style={{ color: '#2563eb', fontWeight: 600 }}>Register</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

function FeatureRow({ icon: Icon, title, subtitle }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
      <div
        style={{
          width: 44, height: 44, borderRadius: 12, background: '#dbeafe',
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}
      >
        <Icon size={20} color="#2563eb" />
      </div>
      <div>
        <div style={{ fontWeight: 700, fontSize: 14, color: '#111827' }}>{title}</div>
        <div style={{ fontSize: 13, color: '#6b7280' }}>{subtitle}</div>
      </div>
    </div>
  );
}

function SocialButton({ label, color, onClick }) {
  return (
    <button
      onClick={onClick}
      type="button"
      style={{
        flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        padding: '11px 0', borderRadius: 10, border: '1px solid #e5e7eb', background: '#fff',
        fontSize: 14, fontWeight: 500, cursor: 'pointer', color: '#374151',
      }}
    >
      <span style={{ width: 18, height: 18, borderRadius: '50%', background: color, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 11, fontWeight: 700 }}>
        {label.charAt(0)}
      </span>
      {label}
    </button>
  );
}

function HandsHeartIllustration() {
  return (
    <svg width="320" height="300" viewBox="0 0 320 300" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="160" cy="230" rx="150" ry="30" fill="#c7d2fe" opacity="0.5" />
      <path d="M60 260 C 20 220, 30 140, 90 110 C 130 90, 160 60, 150 20 C 220 40, 260 100, 250 170 C 245 220, 210 260, 160 260 Z" fill="#dbeafe" opacity="0.6" />
      <circle cx="255" cy="55" r="14" fill="#93c5fd" opacity="0.6" />
      <circle cx="275" cy="110" r="8" fill="#a5b4fc" opacity="0.6" />
      <g stroke="#93c5fd" strokeWidth="3" fill="none" strokeLinecap="round">
        <path d="M75 260 C 70 220, 80 180, 70 140" />
        <path d="M70 190 C 55 180, 45 165, 50 150" />
        <path d="M72 220 C 58 212, 48 198, 52 185" />
        <path d="M73 160 C 62 150, 55 138, 60 125" />
      </g>
      <ellipse cx="52" cy="150" rx="9" ry="5" fill="#93c5fd" transform="rotate(-30 52 150)" />
      <ellipse cx="53" cy="185" rx="9" ry="5" fill="#93c5fd" transform="rotate(-25 53 185)" />
      <ellipse cx="61" cy="125" rx="8" ry="4" fill="#93c5fd" transform="rotate(-35 61 125)" />
      <g stroke="#93c5fd" strokeWidth="3" fill="none" strokeLinecap="round">
        <path d="M245 260 C 250 220, 240 180, 250 140" />
        <path d="M250 190 C 265 180, 275 165, 270 150" />
        <path d="M248 220 C 262 212, 272 198, 268 185" />
        <path d="M247 160 C 258 150, 265 138, 260 125" />
      </g>
      <ellipse cx="270" cy="150" rx="9" ry="5" fill="#93c5fd" transform="rotate(30 270 150)" />
      <ellipse cx="269" cy="185" rx="9" ry="5" fill="#93c5fd" transform="rotate(25 269 185)" />
      <ellipse cx="261" cy="125" rx="8" ry="4" fill="#93c5fd" transform="rotate(35 261 125)" />
      <path d="M108 105 c0-4-3-7-6.5-7 -2 0-3.8 1-4.8 2.6 -1-1.6-2.8-2.6-4.8-2.6 -3.6 0-6.5 3-6.5 7 0 5.5 6.5 9.5 11.3 13.8 4.8-4.3 11.3-8.3 11.3-13.8Z" fill="#60a5fa" opacity="0.85" />
      <path d="M230 90 c0-3.3-2.6-6-5.8-6 -1.7 0-3.2 0.8-4.2 2.1 -1-1.3-2.5-2.1-4.2-2.1 -3.2 0-5.8 2.7-5.8 6 0 4.9 5.8 8.5 10 12.3 4.2-3.8 10-7.4 10-12.3Z" fill="#3b82f6" opacity="0.9" />
      <path d="M100 260 C95 230 100 210 120 200 C130 195 145 195 155 205 L160 245 C160 255 150 265 135 265 L110 265 C104 265 101 263 100 260Z" fill="#f4a89f" />
      <path d="M220 260 C225 230 220 210 200 200 C190 195 175 195 165 205 L160 245 C160 255 170 265 185 265 L210 265 C216 265 219 263 220 260Z" fill="#f4a89f" />
      <path d="M160 175 c0-16 -13-28 -28-28 -9 0-17 4.3-22 11.2 -5-6.9-13-11.2-22-11.2 -15 0-28 12-28 28 0 24 27 40 50 58 23-18 50-34 50-58Z" fill="#2563eb" transform="translate(50 30) scale(0.62)" />
      <path d="M160 200 c0-11 -9-19.5 -19.5-19.5 -6.3 0-11.9 3-15.3 7.8 -3.5-4.8-9-7.8-15.3-7.8 -10.5 0-19.5 8.5-19.5 19.5 0 16.7 18.8 27.9 34.8 40.4 16-12.5 34.8-23.7 34.8-40.4Z" fill="#3b82f6" transform="translate(30 15)" />
      <path d="M160 160 l14 -20 h-8 l10 -14 h-30 l10 14 h-8 z" fill="#fff" opacity="0.9" transform="translate(20 30) scale(0.9)" />
    </svg>
  );
}