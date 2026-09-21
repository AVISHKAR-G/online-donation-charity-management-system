import { useTranslation } from 'react-i18next';
import { Globe, ChevronDown } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

const languages = [
  { code: 'en', label: 'English' },
  { code: 'ta', label: 'தமிழ்' },
  { code: 'hi', label: 'हिन्दी' },
  { code: 'ml', label: 'മലയാളം' },
  { code: 'kn', label: 'ಕನ್ನಡ' },
  { code: 'te', label: 'తెలుగు' },
  { code: 'de', label: 'Deutsch' },
  { code: 'fr', label: 'Français' },
  { code: 'ja', label: '日本語' },
];

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const current = languages.find((l) => l.code === i18n.language) || languages[0];

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen((v) => !v)}
        style={{
          display: 'flex', alignItems: 'center', gap: 6, background: 'none',
          border: 'none', borderRadius: 999, padding: '8px 10px',
          cursor: 'pointer', fontSize: 13.5, fontWeight: 600, color: '#fff',
          whiteSpace: 'nowrap', transition: 'background 0.2s ease',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.14)')}
        onMouseLeave={(e) => (e.currentTarget.style.background = 'none')}
      >
        <Globe size={15} /> {current.label} <ChevronDown size={14} />
      </button>
      {open && (
        <div style={{
          position: 'absolute', top: 40, right: 0, background: '#fff',
          border: '1px solid #e5e7eb', borderRadius: 10, boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
          minWidth: 140, zIndex: 200, overflow: 'hidden',
        }}>
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => { i18n.changeLanguage(lang.code); setOpen(false); }}
              style={{
                display: 'block', width: '100%', textAlign: 'left', padding: '9px 14px',
                border: 'none', background: lang.code === i18n.language ? '#eff6ff' : '#fff',
                fontSize: 13, cursor: 'pointer', color: '#111827',
              }}
            >
              {lang.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}