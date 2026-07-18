import { useState, useEffect, useRef } from 'react';
import { toast } from 'react-toastify';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { MapPin, Phone, Mail, User, Building2, Tag, MessageSquare, Send, Heart, MoreHorizontal } from 'lucide-react';
import { contactService } from '../../services/contactService';

const requestOptions = ['General Inquiry', 'Donation Support', 'Partnership', 'Volunteer', 'Other'];

/* ---------- decorative bits ---------- */

function DotGrid({ style }) {
  return (
    <svg width="150" height="130" viewBox="0 0 150 130" style={style}>
      {Array.from({ length: 4 }).map((_, row) =>
        Array.from({ length: 5 }).map((_, col) => (
          <circle key={`${row}-${col}`} cx={12 + col * 22} cy={12 + row * 22} r="4" fill="#93c5fd" />
        ))
      )}
    </svg>
  );
}

function PaperPlaneDoodle({ style }) {
  return (
    <svg width="180" height="130" viewBox="0 0 180 130" style={style} fill="none">
      <path d="M4 30 C 30 10, 60 90, 150 60" stroke="#93c5fd" strokeWidth="2" strokeDasharray="4 7" strokeLinecap="round" />
      <g transform="translate(4,60) rotate(-30)">
        <path d="M0 20 L34 0 L10 34 L8 22 Z" fill="#3b82f6" />
        <path d="M0 20 L10 22 L8 22 Z" fill="#1d4ed8" />
      </g>
    </svg>
  );
}

function Sparkle({ x, y, size = 14, color = '#a5b4fc', style }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" style={{ position: 'absolute', left: x, top: y, ...style }}>
      <path d="M10 0 C10 6, 14 10, 20 10 C14 10, 10 14, 10 20 C10 14, 6 10, 0 10 C6 10, 10 6, 10 0 Z" fill={color} />
    </svg>
  );
}

function LeafDoodle({ style }) {
  return (
    <svg width="160" height="140" viewBox="0 0 160 140" style={style} fill="none">
      <path d="M60 140 C58 100, 55 60, 30 20" stroke="#60a5fa" strokeWidth="4" strokeLinecap="round" />
      <ellipse cx="34" cy="30" rx="16" ry="26" transform="rotate(-30 34 30)" fill="#93c5fd" opacity="0.85" />
      <ellipse cx="55" cy="55" rx="14" ry="24" transform="rotate(-10 55 55)" fill="#60a5fa" opacity="0.85" />
      <path d="M100 140 C100 105, 104 70, 122 40" stroke="#6ee7b7" strokeWidth="4" strokeLinecap="round" />
      <ellipse cx="126" cy="48" rx="14" ry="24" transform="rotate(25 126 48)" fill="#a7f3d0" opacity="0.9" />
      <ellipse cx="106" cy="70" rx="12" ry="20" transform="rotate(5 106 70)" fill="#6ee7b7" opacity="0.9" />
    </svg>
  );
}

function BottomWave({ style }) {
  return (
    <svg viewBox="0 0 1000 220" preserveAspectRatio="none" style={style}>
      <path d="M0 120 C 150 60, 300 160, 500 100 C 700 40, 850 140, 1000 90 L1000 220 L0 220 Z"
        fill="#dbeafe" opacity="0.9" />
      <path d="M0 160 C 180 120, 340 200, 520 150 C 700 100, 860 190, 1000 140 L1000 220 L0 220 Z"
        fill="#bfdbfe" opacity="0.7" />
    </svg>
  );
}

function TopRightBlob({ style }) {
  return (
    <svg viewBox="0 0 260 180" style={style} fill="none">
      <path d="M260 0 L260 140 C 200 170, 120 150, 90 100 C 60 50, 100 0, 160 0 Z" fill="#93c5fd" opacity="0.55" />
    </svg>
  );
}

/* ---------- input with leading icon ---------- */

function IconField({ icon: Icon, ...props }) {
  return (
    <div style={{ position: 'relative' }}>
      <Icon size={16} color="#60a5fa" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
      <input
        {...props}
        className="contact-input"
        style={{ paddingLeft: 36, width: '100%' }}
      />
    </div>
  );
}

export default function Contact() {
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
      toast.success('Message sent! We will get back to you soon.');
      setForm({ name: '', email: '', phone: '', organization: '', requestFor: 'General Inquiry', message: '' });
    } catch (err) {
      toast.error('Could not send your message. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const updateField = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

  return (
    <>
      <style>{`
        @keyframes contactFadeUp {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .contact-card {
          opacity: 0;
          transition: box-shadow 0.3s ease, transform 0.3s ease;
        }
        .contact-card.visible {
          animation: contactFadeUp 0.6s ease forwards;
        }
        .contact-card:hover {
          box-shadow: 0 12px 32px rgba(0, 0, 0, 0.1);
          transform: translateY(-4px);
        }
        .contact-input {
          transition: border-color 0.2s ease, box-shadow 0.2s ease, transform 0.15s ease;
        }
        .contact-input:focus {
          transform: scale(1.01);
          box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.15);
        }
        .contact-submit {
          transition: transform 0.15s ease, box-shadow 0.2s ease;
        }
        .contact-submit:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(37, 99, 235, 0.35);
        }
        .contact-submit:active {
          transform: translateY(0);
        }
        .info-item {
          transition: transform 0.15s ease;
        }
        .info-item:hover {
          transform: translateX(4px);
        }
        .info-icon-circle {
          width: 44px; height: 44px; border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
        }
      `}</style>

      <Navbar />

      <section style={{ position: 'relative', overflow: 'hidden', background: '#eff6ff', padding: '50px 20px 40px', textAlign: 'center' }}>
        <TopRightBlob style={{ position: 'absolute', top: -20, right: -20, width: 240, height: 160 }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <h1 style={{ fontSize: 32, marginBottom: 8, fontWeight: 800, color: '#111827' }}>Contact Us</h1>
          <p style={{ color: '#6b7280' }}>
            Connect with <strong style={{ color: '#2563eb' }}>HopeCare</strong>, your trusted partner in giving.
          </p>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginTop: 12 }}>
            <span style={{ width: 44, height: 2, background: '#3b82f6', borderRadius: 2 }} />
            <Heart size={16} color="#3b82f6" fill="#3b82f6" />
            <span style={{ width: 44, height: 2, background: '#3b82f6', borderRadius: 2 }} />
          </div>
        </div>
      </section>

      <div style={{ position: 'relative', overflow: 'hidden' }}>
        <DotGrid style={{ position: 'absolute', top: 30, left: 30, opacity: 0.9, zIndex: 0 }} />
        <Sparkle x="46%" y={60} size={14} color="#a5b4fc" />
        <Sparkle x="16%" y={140} size={12} color="#93c5fd" />
        <PaperPlaneDoodle style={{ position: 'absolute', left: 10, bottom: 130, opacity: 0.9, zIndex: 0 }} />
        <LeafDoodle style={{ position: 'absolute', left: '26%', bottom: 0, opacity: 0.9, zIndex: 0 }} />
        <DotGrid style={{ position: 'absolute', bottom: 30, right: 30, opacity: 0.7, zIndex: 0 }} />
        <BottomWave style={{ position: 'absolute', left: 0, right: 0, bottom: 0, width: '100%', height: 180, zIndex: 0 }} />

        <div className="container" style={{ position: 'relative', zIndex: 1, padding: '50px 20px 140px' }}>
          <div className="grid grid-2" style={{ gap: 40, alignItems: 'start' }}>
            <div>
              <h2 style={{ marginBottom: 24, fontWeight: 800, color: '#111827' }}>
                Let's team up to <span style={{ color: '#3b82f6' }}>achieve greatness.</span>
              </h2>

              <div className="info-item" style={{ display: 'flex', gap: 14, marginBottom: 22, alignItems: 'flex-start' }}>
                <div className="info-icon-circle" style={{ background: '#dbeafe' }}>
                  <MapPin color="#2563eb" size={20} />
                </div>
                <div>
                  <strong>Address</strong>
                  <p style={{ color: '#6b7280', marginTop: 4 }}>
                    HopeCare Foundation,<br />
                    123 Community Lane, Coimbatore, Tamil Nadu 641001
                  </p>
                </div>
              </div>

              <div className="info-item" style={{ display: 'flex', gap: 14, marginBottom: 22, alignItems: 'flex-start' }}>
                <div className="info-icon-circle" style={{ background: '#dcfce7' }}>
                  <Phone color="#16a34a" size={20} />
                </div>
                <div>
                  <strong>Phone</strong>
                  <p style={{ color: '#6b7280', marginTop: 4 }}>+91 98765 43210</p>
                </div>
              </div>

              <div className="info-item" style={{ display: 'flex', gap: 14, marginBottom: 22, alignItems: 'flex-start' }}>
                <div className="info-icon-circle" style={{ background: '#f3e8ff' }}>
                  <Mail color="#9333ea" size={20} />
                </div>
                <div>
                  <strong>E-mail</strong>
                  <p style={{ color: '#6b7280', marginTop: 4 }}>support@hopecare.org</p>
                </div>
              </div>
            </div>

            <div
              ref={cardRef}
              className={`card contact-card ${visible ? 'visible' : ''}`}
              style={{ position: 'relative' }}
            >
              <div style={{
                position: 'absolute', top: 20, right: 20, width: 40, height: 40, borderRadius: '50%',
                background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <MoreHorizontal size={18} color="#3b82f6" />
              </div>

              <h2 style={{ marginBottom: 4, fontWeight: 800, color: '#111827' }}>Connect With Us!</h2>
              <p style={{ color: '#6b7280', marginBottom: 20, fontSize: 14 }}>
                Your inquiry is important to us, and we're committed to providing exceptional assistance.
              </p>
              <form onSubmit={handleSubmit}>
                <div className="grid grid-2" style={{ gap: 16 }}>
                  <div className="form-group">
                    <label>Name</label>
                    <IconField
                      icon={User}
                      required
                      placeholder="Enter your name"
                      value={form.name}
                      onChange={(e) => updateField('name', e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label>Phone</label>
                    <IconField
                      icon={Phone}
                      required
                      placeholder="Enter your phone number"
                      value={form.phone}
                      onChange={(e) => updateField('phone', e.target.value)}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Email</label>
                  <IconField
                    icon={Mail}
                    type="email"
                    required
                    placeholder="Enter your email address"
                    value={form.email}
                    onChange={(e) => updateField('email', e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label>Organization Name (optional)</label>
                  <IconField
                    icon={Building2}
                    placeholder="Enter your organization name"
                    value={form.organization}
                    onChange={(e) => updateField('organization', e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label>Request For</label>
                  <div style={{ position: 'relative' }}>
                    <Tag size={16} color="#60a5fa" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', zIndex: 1 }} />
                    <select
                      className="contact-input"
                      style={{ paddingLeft: 36, width: '100%' }}
                      value={form.requestFor}
                      onChange={(e) => updateField('requestFor', e.target.value)}
                    >
                      {requestOptions.map((opt) => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label>Message</label>
                  <div style={{ position: 'relative' }}>
                    <MessageSquare size={16} color="#60a5fa" style={{ position: 'absolute', left: 12, top: 14 }} />
                    <textarea
                      className="contact-input"
                      required
                      rows={4}
                      placeholder="Type your message here..."
                      style={{ paddingLeft: 36, width: '100%' }}
                      value={form.message}
                      onChange={(e) => updateField('message', e.target.value)}
                    />
                  </div>
                </div>

                <button
                  className="btn btn-primary contact-submit"
                  style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
                  disabled={submitting}
                >
                  <Send size={16} />
                  {submitting ? 'Sending...' : 'Send Message'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
}