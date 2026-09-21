import { useState } from 'react';
import Topbar from '../../components/Topbar';
import { urgentCampaignService } from '../../services/urgentCampaignService';
import { toast } from 'react-toastify';
import { AlertTriangle, Send, Mail, MessageSquare, Info, ShieldCheck } from 'lucide-react';

const SUBJECT_LIMIT = 150;
const MESSAGE_LIMIT = 2000;

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

function TopRightBlob({ style }) {
  return (
    <svg viewBox="0 0 260 160" style={style} fill="none">
      <path d="M260 0 L260 120 C 200 150, 120 130, 90 85 C 60 40, 100 0, 160 0 Z" fill="#c7d2fe" opacity="0.5" />
    </svg>
  );
}

function EnvelopeIllustration() {
  return (
    <svg width="260" height="280" viewBox="0 0 260 280" fill="none">
      <circle cx="230" cy="40" r="4" fill="#93c5fd" opacity="0.6" />
      <circle cx="215" cy="60" r="2.5" fill="#93c5fd" opacity="0.5" />
      <circle cx="245" cy="65" r="2.5" fill="#93c5fd" opacity="0.5" />
      <ellipse cx="130" cy="220" rx="90" ry="20" fill="#dbeafe" opacity="0.5" />

      {/* leaves */}
      <path d="M40 200 C 20 180, 20 150, 40 130" stroke="#bfdbfe" strokeWidth="6" fill="none" strokeLinecap="round" />
      <path d="M220 200 C 240 180, 240 150, 220 130" stroke="#bfdbfe" strokeWidth="6" fill="none" strokeLinecap="round" />

      {/* paper plane trail */}
      <path d="M190 70 C 205 55, 215 45, 225 35" stroke="#93c5fd" strokeWidth="2" strokeDasharray="4 5" fill="none" />
      <path d="M215 25 L235 30 L222 45 L218 35 Z" fill="#3b82f6" />

      {/* envelope body */}
      <rect x="55" y="110" width="150" height="105" rx="10" fill="#93c5fd" />
      <path d="M55 118 L130 175 L205 118" stroke="#fff" strokeWidth="4" fill="none" strokeLinejoin="round" strokeLinecap="round" />

      {/* letter peeking out */}
      <rect x="80" y="80" width="100" height="75" rx="8" fill="#fff" stroke="#dbeafe" strokeWidth="2" />
      <rect x="94" y="115" width="72" height="6" rx="3" fill="#e5e7eb" />
      <rect x="94" y="128" width="50" height="6" rx="3" fill="#e5e7eb" />

      {/* alert badge */}
      <circle cx="130" cy="100" r="16" fill="#ef4444" />
      <rect x="127" y="91" width="6" height="12" rx="3" fill="#fff" />
      <circle cx="130" cy="108" r="2.5" fill="#fff" />
    </svg>
  );
}

export default function UrgentCampaign() {
  const [subject, setSubject] = useState('URGENT: Flood Relief Donation Needed Now!');
  const [message, setMessage] = useState(
    "A sudden flood has left many families without shelter, food, and clean water. Because you've generously supported us before, we're reaching out directly to ask for your help.\n\n" +
    "Every donation right now goes straight to emergency relief — shelter kits, food supplies, and medical aid for those affected. We need to move fast, and your support can mean the difference between hours and days of waiting for families in crisis.\n\n" +
    "Thank you for considering an urgent gift today."
  );
  const [sending, setSending] = useState(false);

  const handleSend = async () => {
    if (!subject.trim() || !message.trim()) {
      toast.error('Subject and message are required.');
      return;
    }
    if (!confirm('Send this urgent appeal to every past donor right now?')) return;

    setSending(true);
    try {
      const result = await urgentCampaignService.send(subject, message);
      toast.success(`Sent to ${result.recipientCount} past donor(s). New signups will get it automatically too.`);
    } catch {
      toast.error('Failed to send the urgent campaign. Please try again.');
    } finally {
      setSending(false);
    }
  };

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
          }}
        >
          <TopRightBlob style={{ position: 'absolute', top: 0, right: 0, width: 260, height: 160 }} />
          <DotGrid style={{ position: 'absolute', right: 190, top: 14, opacity: 0.6 }} />

          <div style={{ display: 'flex', alignItems: 'center', gap: 14, zIndex: 1, position: 'relative' }}>
            <div style={{
              width: 48, height: 48, borderRadius: 12, background: '#2563eb',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              <AlertTriangle size={24} color="#fff" />
            </div>
            <div>
              <h1 style={{ margin: 0, fontWeight: 800, color: '#111827', fontSize: 28 }}>Urgent Campaign</h1>
              <p style={{ margin: '4px 0 0', color: '#6b7280', fontSize: 14 }}>
                Send an emergency appeal directly to everyone who has donated before.
              </p>
            </div>
          </div>
        </div>

        {/* Main content: form + illustration */}
        <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start', flexWrap: 'wrap' }}>

          <div style={{ flex: '1 1 480px', minWidth: 320 }}>
            <div
              style={{
                background: '#fff', borderRadius: 16, padding: 24,
                borderLeft: '4px solid #ef4444',
                boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20 }}>
                <div style={{
                  width: 40, height: 40, borderRadius: '50%', background: '#dc2626',
                  color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  <Send size={18} />
                </div>
                <div>
                  <div style={{ fontWeight: 700, color: '#dc2626', fontSize: 17 }}>Send Urgent Campaign</div>
                  <div style={{ color: '#6b7280', fontSize: 14 }}>Emails all past donors with an urgent call to action.</div>
                </div>
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 14, fontWeight: 600, marginBottom: 6, color: '#111827' }}>
                  <Mail size={14} color="#2563eb" /> Subject
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    value={subject}
                    onChange={(e) => setSubject(e.target.value.slice(0, SUBJECT_LIMIT))}
                    maxLength={SUBJECT_LIMIT}
                    style={{
                      width: '100%', padding: '10px 70px 10px 12px', borderRadius: 10,
                      border: '1px solid #dc2626', fontSize: 14, outline: 'none', boxSizing: 'border-box',
                    }}
                  />
                  <span style={{
                    position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                    fontSize: 12, color: '#9ca3af',
                  }}>
                    {subject.length}/{SUBJECT_LIMIT}
                  </span>
                </div>
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 14, fontWeight: 600, marginBottom: 6, color: '#111827' }}>
                  <MessageSquare size={14} color="#2563eb" /> Message
                </label>
                <div style={{ position: 'relative' }}>
                  <textarea
                    rows={8}
                    value={message}
                    onChange={(e) => setMessage(e.target.value.slice(0, MESSAGE_LIMIT))}
                    maxLength={MESSAGE_LIMIT}
                    style={{
                      width: '100%', padding: '10px 12px 26px', borderRadius: 10,
                      border: '1px solid #e5e7eb', fontSize: 14, outline: 'none',
                      fontFamily: 'inherit', resize: 'vertical', boxSizing: 'border-box',
                    }}
                  />
                  <span style={{
                    position: 'absolute', right: 12, bottom: 8,
                    fontSize: 12, color: '#9ca3af', background: '#fff', padding: '0 2px',
                  }}>
                    {message.length}/{MESSAGE_LIMIT}
                  </span>
                </div>
              </div>

              <div style={{
                display: 'flex', alignItems: 'center', gap: 10,
                background: '#eff6ff', color: '#1e40af', borderRadius: 10,
                padding: '10px 14px', fontSize: 13.5, marginBottom: 20,
              }}>
                <Info size={16} color="#2563eb" style={{ flexShrink: 0 }} />
                This will be sent to all past donors' registered email addresses.
              </div>

              <button
                onClick={handleSend}
                disabled={sending}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 8,
                  padding: '12px 20px', borderRadius: 10, border: 'none',
                  background: 'linear-gradient(135deg, #ef4444, #b91c1c)',
                  color: '#fff', fontWeight: 700, fontSize: 14,
                  opacity: sending ? 0.7 : 1,
                  cursor: sending ? 'not-allowed' : 'pointer',
                }}
              >
                <Send size={16} />
                {sending ? 'Sending…' : 'Send Urgent Mail to All Past Donors'}
              </button>
            </div>

            <div style={{
              display: 'flex', alignItems: 'flex-start', gap: 12,
              background: '#eef2ff', border: '1px solid #e0e7ff', borderRadius: 14,
              padding: '16px 18px', marginTop: 16,
            }}>
              <div style={{
                width: 34, height: 34, borderRadius: 10, background: '#2563eb',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}>
                <ShieldCheck size={17} color="#fff" />
              </div>
              <div>
                <div style={{ fontWeight: 700, color: '#1e3a8a', fontSize: 14 }}>Automatic Activation</div>
                <div style={{ color: '#4b5563', fontSize: 13.5, marginTop: 2, lineHeight: 1.5 }}>
                  This also becomes the active appeal — anyone who registers a new account after you
                  send it will automatically receive this same email.
                </div>
              </div>
            </div>
          </div>

          <div style={{ flex: '0 0 260px', display: 'flex', justifyContent: 'center', paddingTop: 30 }}>
            <EnvelopeIllustration />
          </div>
        </div>
      </div>
    </div>
  );
}