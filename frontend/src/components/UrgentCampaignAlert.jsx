import { useState } from 'react';
import { AlertTriangle, Send, Loader2, CheckCircle2, XCircle, Sparkles } from 'lucide-react';
import { donationService } from '../services/donationService';

const DEFAULT_SUBJECT = 'URGENT: Flood Relief Donation Needed Now!';
const DEFAULT_MESSAGE =
  `A sudden flood has left many families without shelter, food, and clean water. ` +
  `Because you've generously supported us before, we're reaching out directly to ask for your help again.\n\n` +
  `Every donation right now goes straight to emergency relief — shelter kits, food supplies, and medical aid for those affected. ` +
  `We need to move fast, and your support can make the difference between hours and days of waiting for families in crisis.\n\n` +
  `Thank you for considering an urgent gift today.`;

export default function UrgentCampaignAlert() {
  const [subject, setSubject] = useState(DEFAULT_SUBJECT);
  const [message, setMessage] = useState(DEFAULT_MESSAGE);
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState(null); // { type: 'success' | 'error', text }
  const [confirming, setConfirming] = useState(false);

  const handleSendClick = () => {
    if (!subject.trim() || !message.trim()) {
      setResult({ type: 'error', text: 'Subject and message are both required.' });
      return;
    }
    setConfirming(true);
  };

  const handleConfirmSend = async () => {
    setConfirming(false);
    setSending(true);
    setResult(null);
    try {
      const data = await donationService.sendUrgentCampaignEmail({ subject, message });
      setResult({ type: 'success', text: data.message || `Sent to ${data.count} donor(s).` });
    } catch (err) {
      setResult({
        type: 'error',
        text: err.response?.data?.message || 'Failed to send urgent campaign email.',
      });
    } finally {
      setSending(false);
    }
  };

  return (
    <div
      className="card"
      style={{
        position: 'relative',
        overflow: 'hidden',
        marginBottom: 20,
        borderRadius: 16,
        border: '1px solid #fecaca',
        background: 'linear-gradient(135deg, #fff7ed 0%, #fef2f2 100%)',
        padding: '28px 32px',
      }}
    >
      {/* Warning illustration, top-right */}
      <div style={{ position: 'absolute', top: 18, right: 28, opacity: 0.9 }}>
        <svg width="140" height="110" viewBox="0 0 140 110" fill="none">
          <Sparkles x="8" y="8" size={14} color="#fca5a5" />
          <g transform="translate(20,15)">
            <rect x="10" y="10" width="70" height="50" rx="6" fill="#ea580c" />
            <path d="M10 14 L45 42 L80 14" stroke="#fff7ed" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="82" cy="58" r="12" fill="#dc2626" />
            <text x="82" y="63" textAnchor="middle" fontSize="14" fontWeight="700" fill="#fff">!</text>
          </g>
          <g transform="translate(95,5) rotate(20)">
            <path d="M0 12 L20 0 L14 20 L10 14 Z" fill="#ea580c" />
          </g>
          <circle cx="8" cy="70" r="2" fill="#fca5a5" />
          <circle cx="118" cy="30" r="2" fill="#fca5a5" />
        </svg>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 24, position: 'relative', zIndex: 1 }}>
        <div
          style={{
            width: 48, height: 48, borderRadius: '50%', background: '#dc2626',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}
        >
          <AlertTriangle size={22} color="#fff" />
        </div>
        <div>
          <h3 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: '#dc2626' }}>Send Urgent Campaign</h3>
          <p style={{ margin: '2px 0 0', fontSize: 14, color: '#6b7280' }}>
            Emails all past donors with an urgent call to action.
          </p>
        </div>
      </div>

      <div style={{ position: 'relative', zIndex: 1 }}>
        <label style={{ display: 'block', fontSize: 14, fontWeight: 700, color: '#111827', marginBottom: 6 }}>
          Subject
        </label>
        <input
          type="text"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          style={{
            width: '100%', padding: '12px 14px', marginBottom: 18,
            borderRadius: 10, border: '2px solid #ea580c', fontSize: 14,
            outline: 'none', boxSizing: 'border-box', background: '#fff',
          }}
        />

        <label style={{ display: 'block', fontSize: 14, fontWeight: 700, color: '#111827', marginBottom: 6 }}>
          Message
        </label>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={7}
          style={{
            width: '100%', padding: '14px', marginBottom: 20,
            borderRadius: 10, border: '1px solid #d1d5db', fontSize: 14,
            resize: 'vertical', fontFamily: 'inherit', lineHeight: 1.6,
            outline: 'none', boxSizing: 'border-box', background: '#fff',
          }}
        />

        {!confirming ? (
          <button
            onClick={handleSendClick}
            disabled={sending}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 10,
              background: 'linear-gradient(90deg, #dc2626 0%, #ea580c 100%)',
              color: '#fff', border: 'none', borderRadius: 12,
              padding: '14px 28px', fontWeight: 700, fontSize: 15,
              cursor: sending ? 'not-allowed' : 'pointer', opacity: sending ? 0.7 : 1,
            }}
          >
            {sending ? <Loader2 size={18} className="spin" /> : <Send size={18} />}
            {sending ? 'Sending...' : 'Send Urgent Mail to All Past Donors'}
          </button>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 14, color: '#111827', fontWeight: 600 }}>
              Send to every past donor now?
            </span>
            <button
              onClick={handleConfirmSend}
              style={{
                background: 'linear-gradient(90deg, #dc2626 0%, #ea580c 100%)',
                color: '#fff', border: 'none', borderRadius: 10,
                padding: '10px 18px', fontWeight: 700, fontSize: 14, cursor: 'pointer',
              }}
            >
              Yes, Send
            </button>
            <button
              onClick={() => setConfirming(false)}
              style={{
                background: '#fff', color: '#374151', border: '1px solid #d1d5db',
                borderRadius: 10, padding: '10px 18px', fontWeight: 700, fontSize: 14, cursor: 'pointer',
              }}
            >
              Cancel
            </button>
          </div>
        )}

        {result && (
          <div
            style={{
              display: 'flex', alignItems: 'center', gap: 8, marginTop: 16,
              padding: '10px 14px', borderRadius: 10, fontSize: 13, fontWeight: 500,
              background: result.type === 'success' ? '#dcfce7' : '#fee2e2',
              color: result.type === 'success' ? '#16a34a' : '#dc2626',
            }}
          >
            {result.type === 'success' ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
            {result.text}
          </div>
        )}
      </div>
    </div>
  );
}