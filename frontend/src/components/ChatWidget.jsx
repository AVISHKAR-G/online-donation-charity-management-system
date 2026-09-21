import { useState, useRef, useEffect, useCallback } from 'react';
import { chatbotService } from '../services/chatbotService';

const SpeechRecognitionAPI =
  typeof window !== 'undefined' &&
  (window.SpeechRecognition || window.webkitSpeechRecognition);

const LANGUAGES = [
  { code: 'en-US', label: 'English' },
  { code: 'hi-IN', label: 'हिंदी' },
  { code: 'ta-IN', label: 'தமிழ்' },
  { code: 'te-IN', label: 'తెలుగు' },
  { code: 'ml-IN', label: 'മലയാളം' },
  { code: 'kn-IN', label: 'ಕನ್ನಡ' },
];

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'bot', text: "Hi! I'm HopeCare's assistant. Ask me about donating or our current campaigns." },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);
  const [voiceOn, setVoiceOn] = useState(false);
  const [lang, setLang] = useState('en-US');
  const bottomRef = useRef(null);
  const recognitionRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, open]);

  const speak = useCallback((text) => {
    if (!voiceOn || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    utterance.rate = 1;
    window.speechSynthesis.speak(utterance);
  }, [voiceOn, lang]);

  const send = async (overrideText) => {
    const text = (overrideText ?? input).trim();
    if (!text || loading) return;
    setMessages((prev) => [...prev, { role: 'user', text }]);
    setInput('');
    setLoading(true);
    try {
      const reply = await chatbotService.ask(text, [], lang);
      setMessages((prev) => [...prev, { role: 'bot', text: reply }]);
      speak(reply);
    } catch {
      const fallback = "Sorry, something went wrong. Please try again.";
      setMessages((prev) => [...prev, { role: 'bot', text: fallback }]);
      speak(fallback);
    } finally {
      setLoading(false);
    }
  };

  const toggleListening = () => {
    if (!SpeechRecognitionAPI) {
      setMessages((prev) => [...prev, {
        role: 'bot',
        text: "Voice input isn't supported in this browser. Try Chrome or Edge.",
      }]);
      return;
    }

    if (listening) {
      recognitionRef.current?.stop();
      return;
    }

    const recognition = new SpeechRecognitionAPI();
    recognition.lang = lang;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => setListening(true);
    recognition.onend = () => setListening(false);
    recognition.onerror = () => setListening(false);
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      send(transcript);
    };

    recognitionRef.current = recognition;
    recognition.start();
  };

  useEffect(() => {
    if (!open) {
      recognitionRef.current?.stop();
      window.speechSynthesis?.cancel();
    }
  }, [open]);

  return (
    <div style={{ position: 'fixed', bottom: 20, right: 20, zIndex: 200 }}>
      {open && (
        <div style={{
          width: 320, height: 460, background: '#fff', borderRadius: 12,
          boxShadow: '0 10px 30px rgba(0,0,0,0.2)', display: 'flex', flexDirection: 'column',
          marginBottom: 10, overflow: 'hidden'
        }}>
          <div style={{
            background: '#111827', color: '#fff', padding: '12px 16px',
            fontWeight: 700, display: 'flex', justifyContent: 'space-between', alignItems: 'center'
          }}>
            <span>HopeCare Assistant</span>
            <button
              onClick={() => setVoiceOn((p) => !p)}
              title={voiceOn ? 'Voice replies on' : 'Voice replies off'}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                fontSize: 16, opacity: voiceOn ? 1 : 0.4
              }}
            >
              🔊
            </button>
          </div>

          <div style={{
            display: 'flex', gap: 4, padding: '8px 12px', borderBottom: '1px solid #e5e7eb',
            overflowX: 'auto'
          }}>
            {LANGUAGES.map((l) => (
              <button
                key={l.code}
                onClick={() => setLang(l.code)}
                style={{
                  border: 'none', borderRadius: 999, padding: '4px 10px', fontSize: 12,
                  cursor: 'pointer', whiteSpace: 'nowrap',
                  background: lang === l.code ? '#2563eb' : '#f3f4f6',
                  color: lang === l.code ? '#fff' : '#374151',
                }}
              >
                {l.label}
              </button>
            ))}
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
            {listening && <div style={{ fontSize: 12, color: '#2563eb' }}>Listening...</div>}
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
            <button
              onClick={toggleListening}
              title={listening ? 'Stop listening' : 'Speak your question'}
              style={{
                border: 'none', background: listening ? '#dc2626' : '#f3f4f6',
                color: listening ? '#fff' : '#374151',
                padding: '0 14px', cursor: 'pointer', fontSize: 15
              }}
            >
              🎤
            </button>
            <button onClick={() => send()} style={{ border: 'none', background: '#2563eb', color: '#fff', padding: '0 16px', cursor: 'pointer' }}>
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