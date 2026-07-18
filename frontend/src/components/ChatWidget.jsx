import { useState, useRef, useEffect } from 'react';
import { chatbotService } from '../services/chatbotService';

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'bot', text: "Hi! I'm HopeCare's assistant. Ask me about donating or our current campaigns." },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, open]);

  const send = async () => {
    const text = input.trim();
    if (!text || loading) return;
    setMessages((prev) => [...prev, { role: 'user', text }]);
    setInput('');
    setLoading(true);
    try {
      const reply = await chatbotService.ask(text);
      setMessages((prev) => [...prev, { role: 'bot', text: reply }]);
    } catch {
      setMessages((prev) => [...prev, { role: 'bot', text: "Sorry, something went wrong. Please try again." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ position: 'fixed', bottom: 20, right: 20, zIndex: 200 }}>
      {open && (
        <div style={{
          width: 320, height: 420, background: '#fff', borderRadius: 12,
          boxShadow: '0 10px 30px rgba(0,0,0,0.2)', display: 'flex', flexDirection: 'column',
          marginBottom: 10, overflow: 'hidden'
        }}>
          <div style={{ background: '#111827', color: '#fff', padding: '12px 16px', fontWeight: 700 }}>
            HopeCare Assistant
          </div>
          <div style={{ flex: 1, overflowY: 'auto', padding: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
            {messages.map((m, i) => (
              <div key={i} style={{
                alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
                background: m.role === 'user' ? '#2563eb' : '#f3f4f6',
                color: m.role === 'user' ? '#fff' : '#111827',
                padding: '8px 12px', borderRadius: 10, maxWidth: '80%', fontSize: 13.5
              }}>
                {m.text}
              </div>
            ))}
            {loading && <div style={{ fontSize: 12, color: '#9ca3af' }}>Typing...</div>}
            <div ref={bottomRef} />
          </div>
          <div style={{ display: 'flex', borderTop: '1px solid #e5e7eb' }}>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && send()}
              placeholder="Type a message..."
              style={{ flex: 1, border: 'none', padding: 12, fontSize: 13.5, outline: 'none' }}
            />
            <button onClick={send} style={{ border: 'none', background: '#2563eb', color: '#fff', padding: '0 16px', cursor: 'pointer' }}>
              Send
            </button>
          </div>
        </div>
      )}
      <button
        onClick={() => setOpen((p) => !p)}
        style={{
          width: 56, height: 56, borderRadius: '50%', background: '#2563eb', color: '#fff',
          border: 'none', fontSize: 24, cursor: 'pointer', boxShadow: '0 6px 16px rgba(0,0,0,0.25)'
        }}
      >
        {open ? '✕' : '💬'}
      </button>
    </div>
  );
}