import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  User, Mail, Phone, Lock, UserPlus, ShieldCheck, HeartHandshake, Users,
  ArrowRight, Sprout, BookOpen, HeartPulse, Droplet, Quote, X,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import heroBackground from '../../assets/collage/HopeCare_hero_background.jpg';
import donationsBoxPhoto from '../../assets/collage/HopeCare_donations_box.jpg';
import volunteersGroupPhoto from '../../assets/collage/HopeCare_volunteers_group.jpg';
import foodDeliveryPhoto from '../../assets/collage/HopeCare_food_delivery.jpg';
import volunteersIndoorPhoto from '../../assets/collage/HopeCare_volunteers_indoor.jpg';

const GOOGLE_CLIENT_ID = '523971407329-leb5sti8dbv7nlcbl127a5hg9aucss75.apps.googleusercontent.com';
const FACEBOOK_APP_ID = '1343155740654333';

export default function Register() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [started, setStarted] = useState(false);
  const { register, loginWithGoogle, loginWithFacebook } = useAuth();
  const navigate = useNavigate();
  const googleButtonRef = useRef(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await register({ name: fullName, email, phone, password });
      toast.success('Account created successfully!');
      navigate(data.role === 'Admin' ? '/admin/dashboard' : '/');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleOAuthSuccess = (data) => {
    toast.success('Account created — welcome!');
    navigate(data.role === 'Admin' ? '/admin/dashboard' : '/');
  };

  const handleOAuthError = (provider, err) => {
    console.error(err);
    toast.error(err?.response?.data?.message || `${provider} sign up failed`);
  };

  useEffect(() => {
    if (!started) return;
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
        text: 'signup_with',
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [started]);

  useEffect(() => {
    if (window.FB) return;
    window.fbAsyncInit = function () {
      window.FB.init({ appId: FACEBOOK_APP_ID, cookie: true, xfbml: false, version: 'v20.0' });
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
          toast.info('Facebook sign up was cancelled');
        }
      },
      { scope: 'public_profile,email' }
    );
  };

  useEffect(() => {
    document.body.style.overflow = started ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [started]);

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
        position: 'relative',
        backgroundImage: `url(${heroBackground})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      <div style={{
        position: 'absolute', inset: 0,
        background: 'radial-gradient(ellipse 900px 700px at 22% 45%, rgba(255,255,255,0.88) 0%, rgba(255,255,255,0.55) 45%, rgba(255,255,255,0) 75%)',
        pointerEvents: 'none',
      }} />

      <style>{`
        @keyframes hc-marquee-scroll {
          0%   { transform: translateY(0); }
          100% { transform: translateY(-50%); }
        }
        .hc-marquee-track {
          animation: hc-marquee-scroll 26s linear infinite;
        }
        .hc-marquee-viewport:hover .hc-marquee-track {
          animation-play-state: paused;
        }
        @keyframes hc-modal-in {
          from { opacity: 0; transform: translateY(12px) scale(0.98); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes hc-backdrop-in {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        .hc-modal-backdrop {
          animation: hc-backdrop-in 0.25s ease both;
        }
        .hc-modal-card {
          animation: hc-modal-in 0.3s ease both;
        }
      `}</style>

      <div
        style={{
          display: 'flex',
          width: '100%',
          maxWidth: 1200,
          borderRadius: 24,
          overflow: 'hidden',
          alignItems: 'center',
          gap: 40,
          position: 'relative',
          zIndex: 1,
        }}
      >
        <div style={{
          flex: 1, padding: '20px 20px', display: 'flex', flexDirection: 'column', gap: 28,
          transition: 'opacity 0.25s ease',
          opacity: started ? 0.35 : 1,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 48, height: 48, borderRadius: 12,
              background: 'linear-gradient(135deg, #16a34a, #15803d)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <HeartHandshake size={26} color="#fff" />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 20, color: '#111827' }}>HopeCare</div>
              <div style={{ fontSize: 13, color: '#6b7280' }}>Together for a better tomorrow</div>
            </div>
          </div>

          <div>
            <h1 style={{ fontSize: 38, fontWeight: 800, lineHeight: 1.2, color: '#111827', margin: 0 }}>
              Join Us And<br />
              <span style={{ color: '#16a34a' }}>Start Giving Back</span>
            </h1>
            <p style={{ fontSize: 15, color: '#374151', marginTop: 16, maxWidth: 420 }}>
              Create an account to donate, track your impact, and be part of a community making real change.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <FeatureRow icon={Users} title="Trusted & Transparent" subtitle="100% transparency in every donation" />
            <FeatureRow icon={HeartHandshake} title="Impact Driven" subtitle="Real change in communities" />
            <FeatureRow icon={ShieldCheck} title="Secure & Safe" subtitle="Your data and donations are safe" />
          </div>

          {!started && (
            <button
              onClick={() => setStarted(true)}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 10,
                width: 'fit-content',
                background: 'linear-gradient(135deg, #16a34a, #15803d)',
                color: '#fff', border: 'none', borderRadius: 999,
                padding: '14px 22px 14px 14px', fontWeight: 700, fontSize: 15, cursor: 'pointer',
                boxShadow: '0 10px 30px rgba(22,163,74,0.35)',
              }}
            >
              <span style={{
                width: 30, height: 30, borderRadius: '50%', background: '#fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}>
                <ArrowRight size={16} color="#16a34a" />
              </span>
              Get Started
            </button>
          )}
        </div>

        <div style={{
          flex: 1, maxWidth: 480, position: 'relative',
          transition: 'opacity 0.25s ease',
          opacity: started ? 0.35 : 1,
        }}>
          <div
            className="hc-marquee-viewport"
            style={{
              height: 560,
              overflow: 'hidden',
              borderRadius: 24,
              position: 'relative',
              maskImage: 'linear-gradient(to bottom, transparent 0%, black 8%, black 92%, transparent 100%)',
              WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 8%, black 92%, transparent 100%)',
            }}
          >
            <div className="hc-marquee-track" style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              <CollageCards />
              <CollageCards aria-hidden />
            </div>
          </div>
        </div>
      </div>

      {started && (
        <div
          className="hc-modal-backdrop"
          onClick={() => setStarted(false)}
          style={{
            position: 'fixed', inset: 0, zIndex: 50,
            background: 'rgba(15, 23, 42, 0.55)',
            backdropFilter: 'blur(2px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: 24,
          }}
        >
          <div
            className="hc-modal-card"
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '100%', maxWidth: 460,
              maxHeight: '90vh', overflowY: 'auto',
              background: '#fff',
              borderRadius: 24,
              padding: '40px 40px',
              boxShadow: '0 25px 70px rgba(0,0,0,0.35)',
              position: 'relative',
            }}
          >
            <button
              onClick={() => setStarted(false)}
              aria-label="Close"
              style={{
                position: 'absolute', top: 18, right: 18,
                width: 32, height: 32, borderRadius: '50%', border: 'none',
                background: '#f3f4f6', color: '#374151',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer',
              }}
            >
              <X size={18} />
            </button>

            <h2 style={{ fontSize: 26, fontWeight: 800, textAlign: 'center', margin: 0, color: '#111827' }}>
              Create an Account
            </h2>
            <p style={{ textAlign: 'center', color: '#6b7280', fontSize: 14, marginTop: 8, marginBottom: 28 }}>
              Join HopeCare and start making a difference
            </p>

            <form onSubmit={handleSubmit}>
              <label style={{ fontSize: 14, fontWeight: 600, color: '#111827' }}>Full Name</label>
              <div style={{ position: 'relative', marginTop: 8, marginBottom: 18 }}>
                <User size={18} color="#9ca3af" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="text" required value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Enter your full name"
                  style={{ width: '100%', padding: '12px 14px 12px 42px', borderRadius: 10, border: '1px solid #e5e7eb', fontSize: 14, outline: 'none', boxSizing: 'border-box' }}
                />
              </div>

              <label style={{ fontSize: 14, fontWeight: 600, color: '#111827' }}>Email</label>
              <div style={{ position: 'relative', marginTop: 8, marginBottom: 18 }}>
                <Mail size={18} color="#9ca3af" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="email" required value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  style={{ width: '100%', padding: '12px 14px 12px 42px', borderRadius: 10, border: '1px solid #e5e7eb', fontSize: 14, outline: 'none', boxSizing: 'border-box' }}
                />
              </div>

              <label style={{ fontSize: 14, fontWeight: 600, color: '#111827' }}>Phone</label>
              <div style={{ position: 'relative', marginTop: 8, marginBottom: 18 }}>
                <Phone size={18} color="#9ca3af" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="tel" required value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Enter your phone number"
                  style={{ width: '100%', padding: '12px 14px 12px 42px', borderRadius: 10, border: '1px solid #e5e7eb', fontSize: 14, outline: 'none', boxSizing: 'border-box' }}
                />
              </div>

              <label style={{ fontSize: 14, fontWeight: 600, color: '#111827' }}>Password</label>
              <div style={{ position: 'relative', marginTop: 8, marginBottom: 24 }}>
                <Lock size={18} color="#9ca3af" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="password" required value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Create a password"
                  style={{ width: '100%', padding: '12px 14px 12px 42px', borderRadius: 10, border: '1px solid #e5e7eb', fontSize: 14, outline: 'none', boxSizing: 'border-box' }}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{
                  width: '100%', padding: '13px 0', borderRadius: 10, border: 'none',
                  background: 'linear-gradient(135deg, #16a34a, #15803d)', color: '#fff',
                  fontWeight: 600, fontSize: 15, cursor: loading ? 'not-allowed' : 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  opacity: loading ? 0.7 : 1,
                }}
              >
                <UserPlus size={18} />
                {loading ? 'Creating account...' : 'Register'}
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
              Already have an account?{' '}
              <Link to="/login" style={{ color: '#16a34a', fontWeight: 600 }}>Login</Link>
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

function FeatureRow({ icon: Icon, title, subtitle }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
      <div style={{
        width: 44, height: 44, borderRadius: 12, background: 'rgba(220,252,231,0.9)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
      }}>
        <Icon size={20} color="#16a34a" />
      </div>
      <div>
        <div style={{ fontWeight: 700, fontSize: 14, color: '#111827' }}>{title}</div>
        <div style={{ fontSize: 13, color: '#4b5563' }}>{subtitle}</div>
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

function CollageCards() {
  return (
    <>
      <div style={{ background: 'rgba(255,255,255,0.97)', borderRadius: 18, padding: 20, boxShadow: '0 8px 30px rgba(0,0,0,0.12)', display: 'flex', justifyContent: 'space-around', textAlign: 'center' }}>
        <div>
          <div style={{ fontWeight: 800, fontSize: 18, color: '#16a34a' }}>12,500+</div>
          <div style={{ fontSize: 11.5, color: '#9ca3af' }}>Lives Touched</div>
        </div>
        <div>
          <div style={{ fontWeight: 800, fontSize: 18, color: '#15803d' }}>850+</div>
          <div style={{ fontSize: 11.5, color: '#9ca3af' }}>Projects Funded</div>
        </div>
        <div>
          <div style={{ fontWeight: 800, fontSize: 18, color: '#ea580c' }}>₹2.5Cr+</div>
          <div style={{ fontSize: 11.5, color: '#9ca3af' }}>Donations Raised</div>
        </div>
      </div>

      <div style={{ background: 'rgba(255,255,255,0.97)', borderRadius: 18, overflow: 'hidden', boxShadow: '0 8px 30px rgba(0,0,0,0.12)' }}>
        <img
          src={volunteersGroupPhoto}
          alt="Volunteers handing out food and supplies"
          style={{ width: '100%', height: 160, objectFit: 'cover', display: 'block' }}
        />
        <div style={{ padding: 18 }}>
          <div style={{ fontWeight: 800, fontSize: 17, color: '#111827' }}>Empower Communities</div>
          <div style={{ fontSize: 13, color: '#6b7280', marginTop: 6 }}>
            We work closely with local communities to create sustainable impact.
          </div>
        </div>
      </div>

      <div style={{ background: 'rgba(245,243,255,0.97)', borderRadius: 18, padding: 22, boxShadow: '0 8px 30px rgba(0,0,0,0.12)' }}>
        <Quote size={20} color="#7c3aed" />
        <div style={{ fontSize: 14, color: '#374151', marginTop: 8, fontStyle: 'italic' }}>
          "Small acts, when multiplied by millions of people, can transform the world."
        </div>
        <div style={{ fontSize: 12.5, color: '#7c3aed', marginTop: 8, fontWeight: 600 }}>— Howard Zinn</div>
      </div>

      <div style={{ background: 'rgba(255,255,255,0.97)', borderRadius: 18, overflow: 'hidden', boxShadow: '0 8px 30px rgba(0,0,0,0.12)' }}>
        <img
          src={donationsBoxPhoto}
          alt="Volunteer sorting clothing donations"
          style={{ width: '100%', height: 160, objectFit: 'cover', display: 'block' }}
        />
        <div style={{ padding: 18 }}>
          <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
            <Sprout size={20} color="#fff" />
          </div>
          <div style={{ fontWeight: 800, fontSize: 17, color: '#111827' }}>Support Life-Changing Causes</div>
          <div style={{ fontSize: 13, color: '#6b7280', marginTop: 6 }}>
            Your contribution helps us bring hope and create a better tomorrow.
          </div>
        </div>
      </div>

      <div style={{ background: 'rgba(255,255,255,0.97)', borderRadius: 18, overflow: 'hidden', boxShadow: '0 8px 30px rgba(0,0,0,0.12)' }}>
        <img
          src={foodDeliveryPhoto}
          alt="Loading food boxes for delivery"
          style={{ width: '100%', height: 140, objectFit: 'cover', display: 'block' }}
        />
        <div style={{ padding: '16px 20px' }}>
          <div style={{ fontWeight: 700, fontSize: 15, color: '#111827' }}>On the Move</div>
          <div style={{ fontSize: 12.5, color: '#6b7280', marginTop: 4 }}>
            Getting supplies where they're needed most.
          </div>
        </div>
      </div>

      <div style={{ background: 'rgba(255,255,255,0.97)', borderRadius: 18, overflow: 'hidden', boxShadow: '0 8px 30px rgba(0,0,0,0.12)' }}>
        <img
          src={volunteersIndoorPhoto}
          alt="Volunteers packing relief supplies"
          style={{ width: '100%', height: 160, objectFit: 'cover', display: 'block' }}
        />
        <div style={{ padding: 18 }}>
          <div style={{ fontWeight: 800, fontSize: 17, color: '#111827' }}>Teams On The Ground</div>
          <div style={{ fontSize: 13, color: '#6b7280', marginTop: 6 }}>
            Volunteers delivering food, medicine, and aid directly to those in need.
          </div>
        </div>
      </div>
    </>
  );
}