import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Phone, MapPin, HeartHandshake, IndianRupee, MessageSquare, UploadCloud, Send } from 'lucide-react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { assistanceApplicationService } from '../../services/assistanceApplicationService';

const TYPE_OPTIONS = [
  { label: 'Medical', value: 0 },
  { label: 'Education', value: 1 },
  { label: 'Food', value: 2 },
  { label: 'Disaster Relief', value: 3 },
];

const fieldWrap = { marginBottom: 18 };
const labelStyle = { display: 'block', fontSize: 14, fontWeight: 600, color: '#111827', marginBottom: 6 };
const inputRowStyle = { display: 'flex', alignItems: 'center', gap: 10 };
const iconBoxStyle = {
  width: 40, height: 40, borderRadius: 10, background: '#dbeafe',
  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
};
const inputStyle = {
  flex: 1, padding: '10px 12px', borderRadius: 8, border: '1px solid #e5e7eb',
  fontSize: 14, outline: 'none',
};

function SupportIllustration() {
  return (
    <div style={{ position: 'relative', width: 240, height: 260, margin: '0 auto 24px' }}>
      <svg viewBox="0 0 240 260" width="240" height="260">
        <defs>
          <linearGradient id="clipboardGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#60a5fa" />
            <stop offset="100%" stopColor="#7c3aed" />
          </linearGradient>
          <linearGradient id="shieldGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#818cf8" />
            <stop offset="100%" stopColor="#6366f1" />
          </linearGradient>
        </defs>

        {/* leaves - left */}
        <g opacity="0.55" stroke="#a5b4fc" strokeWidth="2" fill="none">
          <path d="M20 210 C 10 190, 15 160, 35 140" />
          <ellipse cx="24" cy="165" rx="7" ry="14" transform="rotate(-30 24 165)" fill="#c7d2fe" stroke="none" />
          <ellipse cx="32" cy="145" rx="6" ry="12" transform="rotate(-20 32 145)" fill="#c7d2fe" stroke="none" />
        </g>
        {/* leaves - right */}
        <g opacity="0.55" stroke="#a5b4fc" strokeWidth="2" fill="none">
          <path d="M220 210 C 230 190, 225 160, 205 140" />
          <ellipse cx="216" cy="165" rx="7" ry="14" transform="rotate(30 216 165)" fill="#c7d2fe" stroke="none" />
          <ellipse cx="208" cy="145" rx="6" ry="12" transform="rotate(20 208 145)" fill="#c7d2fe" stroke="none" />
        </g>

        {/* clipboard */}
        <rect x="65" y="35" width="110" height="150" rx="14" fill="#ffffff" stroke="#e0e7ff" strokeWidth="2" />
        <rect x="95" y="26" width="50" height="18" rx="6" fill="url(#clipboardGrad)" />
        <circle cx="120" cy="35" r="4" fill="#fff" />

        {/* heart + heartbeat */}
        <path d="M120 78 c-9-11-27-6-27 8 c0 14 27 30 27 30 s27-16 27-30 c0-14-18-19-27-8z" fill="url(#clipboardGrad)" />
        <polyline points="75,120 92,120 100,105 108,132 116,112 124,120 165,120" fill="none" stroke="url(#clipboardGrad)" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />

        {/* text lines */}
        <rect x="80" y="150" width="80" height="6" rx="3" fill="#e5e7eb" />
        <rect x="80" y="163" width="55" height="6" rx="3" fill="#e5e7eb" />

        {/* shield with cross */}
        <path d="M45 175 C45 165 55 162 63 158 C71 162 81 165 81 175 C81 195 63 208 63 208 C63 208 45 195 45 175 Z"
          fill="url(#shieldGrad)" stroke="#fff" strokeWidth="2" />
        <rect x="59" y="171" width="8" height="20" rx="2" fill="#fff" />
        <rect x="53" y="177" width="20" height="8" rx="2" fill="#fff" />

        {/* small heart badge top-left */}
        <circle cx="35" cy="45" r="18" fill="#ede9fe" />
        <path d="M35 51 c-4.5-5-13-3-13 4 c0 7 13 14 13 14 s13-7 13-14 c0-7-8.5-9-13-4z" fill="#a78bfa" transform="translate(0,-8) scale(0.75)" />

        {/* small badge top-right */}
        <circle cx="205" cy="70" r="17" fill="#3b82f6" />
        <path d="M205 76 c-3.5-4-10-2.5-10 3 c0 5.5 10 11 10 11 s10-5.5 10-11 c0-5.5-6.5-7-10-3z" fill="#fff" transform="translate(0,-9) scale(0.7)" />
      </svg>
    </div>
  );
}

export default function ApplyForHelp() {
  const navigate = useNavigate();
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
      setError(err?.response?.data?.message || 'Failed to submit application. Please check your details and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Navbar />

      <div style={{ position: 'relative', overflow: 'hidden', background: 'linear-gradient(135deg, #eff6ff 0%, #ede9fe 100%)' }}>
        {/* decorative dot grids */}
        <div style={{
          position: 'absolute', top: 24, left: 24, width: 110, height: 110,
          backgroundImage: 'radial-gradient(#93c5fd 1.5px, transparent 1.5px)',
          backgroundSize: '14px 14px', opacity: 0.6, pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', bottom: 24, right: 24, width: 110, height: 110,
          backgroundImage: 'radial-gradient(#c4b5fd 1.5px, transparent 1.5px)',
          backgroundSize: '14px 14px', opacity: 0.6, pointerEvents: 'none',
        }} />
        {/* decorative wave blobs */}
        <div style={{
          position: 'absolute', bottom: -120, left: -80, width: 400, height: 400,
          borderRadius: '50%', background: 'rgba(59,130,246,0.12)', pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', top: -100, right: -100, width: 320, height: 320,
          borderRadius: '50%', background: 'rgba(124,58,237,0.10)', pointerEvents: 'none',
        }} />

        <div className="container" style={{ padding: '48px 20px', position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.4fr', gap: 40, alignItems: 'start' }}>

            {/* Left: illustration + message */}
            <div style={{ paddingTop: 40, textAlign: 'center' }}>
              <SupportIllustration />

              <h2 style={{ fontSize: 28, fontWeight: 800, color: '#111827', lineHeight: 1.25, marginBottom: 14 }}>
                We are here<br />to <span style={{ color: '#2563eb' }}>support you</span>
              </h2>
              <div style={{ width: 50, height: 3, background: '#3b82f6', margin: '0 auto 16px' }} />
              <p style={{ color: '#6b7280', fontSize: 14, maxWidth: 260, margin: '0 auto' }}>
                Your request will be reviewed by our team and we will get back to you soon.
              </p>
            </div>

            {/* Right: form */}
            <div>
              <h1 style={{ marginBottom: 6, color: '#111827' }}>Apply for Help</h1>
              <p style={{ color: '#6b7280', marginBottom: 20 }}>
                Fill out this form to request financial or medical assistance.
              </p>

              <form onSubmit={handleSubmit} className="card" style={{ padding: 28, background: '#fff', borderRadius: 16 }}>

                <div style={fieldWrap}>
                  <label style={labelStyle}>Full Name</label>
                  <div style={inputRowStyle}>
                    <div style={iconBoxStyle}><User size={18} color="#2563eb" /></div>
                    <input name="fullName" required placeholder="Enter your full name"
                      value={form.fullName} onChange={handleChange} style={inputStyle} />
                  </div>
                </div>

                <div style={fieldWrap}>
                  <label style={labelStyle}>Email</label>
                  <div style={inputRowStyle}>
                    <div style={iconBoxStyle}><Mail size={18} color="#2563eb" /></div>
                    <input type="email" name="email" required placeholder="Enter your email address"
                      value={form.email} onChange={handleChange} style={inputStyle} />
                  </div>
                </div>

                <div style={fieldWrap}>
                  <label style={labelStyle}>Phone Number</label>
                  <div style={inputRowStyle}>
                    <div style={iconBoxStyle}><Phone size={18} color="#2563eb" /></div>
                    <input name="phone" required placeholder="Enter your phone number"
                      value={form.phone} onChange={handleChange} style={inputStyle} />
                  </div>
                </div>

                <div style={fieldWrap}>
                  <label style={labelStyle}>Address</label>
                  <div style={inputRowStyle}>
                    <div style={iconBoxStyle}><MapPin size={18} color="#2563eb" /></div>
                    <input name="address" required placeholder="Enter your complete address"
                      value={form.address} onChange={handleChange} style={inputStyle} />
                  </div>
                </div>

                <div style={fieldWrap}>
                  <label style={labelStyle}>Type of Assistance</label>
                  <div style={inputRowStyle}>
                    <div style={iconBoxStyle}><HeartHandshake size={18} color="#2563eb" /></div>
                    <select name="type" value={form.type} onChange={handleChange} style={{ ...inputStyle, background: '#fff' }}>
                      {TYPE_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div style={fieldWrap}>
                  <label style={labelStyle}>Amount Required (₹)</label>
                  <div style={inputRowStyle}>
                    <div style={iconBoxStyle}><IndianRupee size={18} color="#2563eb" /></div>
                    <input type="number" min="1" step="0.01" name="amountRequired" required
                      placeholder="Enter amount required"
                      value={form.amountRequired} onChange={handleChange} style={inputStyle} />
                  </div>
                </div>

                <div style={fieldWrap}>
                  <label style={labelStyle}>Reason</label>
                  <div style={inputRowStyle}>
                    <div style={iconBoxStyle}><MessageSquare size={18} color="#2563eb" /></div>
                    <input name="reason" required placeholder="Explain the reason for your request"
                      value={form.reason} onChange={handleChange} style={inputStyle} />
                  </div>
                </div>

                <div style={fieldWrap}>
                  <label style={labelStyle}>Supporting Documents</label>
                  <label
                    htmlFor="document-upload"
                    style={{
                      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                      gap: 4, border: '2px dashed #c7d2fe', borderRadius: 10, padding: '22px 12px',
                      cursor: 'pointer', background: '#f8fafc', textAlign: 'center',
                    }}
                  >
                    <UploadCloud size={22} color="#2563eb" />
                    <span style={{ color: '#2563eb', fontWeight: 600, fontSize: 14 }}>
                      {document ? document.name : 'Upload documents (Optional)'}
                    </span>
                    <span style={{ color: '#9ca3af', fontSize: 12 }}>PDF, JPG or PNG (Max. 5MB)</span>
                    <input
                      id="document-upload"
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) => setDocument(e.target.files[0])}
                      style={{ display: 'none' }}
                    />
                  </label>
                </div>

                {error && <p style={{ color: '#dc2626', marginBottom: 14 }}>{error}</p>}

                <button
                  type="submit"
                  disabled={submitting}
                  style={{
                    width: '100%', padding: '14px', borderRadius: 10, border: 'none',
                    background: 'linear-gradient(90deg, #2563eb 0%, #7c3aed 100%)',
                    color: '#fff', fontWeight: 700, fontSize: 15, cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  }}
                >
                  <Send size={17} />
                  {submitting ? 'Submitting...' : 'Submit Application'}
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