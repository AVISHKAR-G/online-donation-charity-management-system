export default function TeamIllustration() {
  return (
    <svg viewBox="0 0 300 160" style={{ width: '100%', height: 160 }}>
      <rect width="300" height="160" fill="#f0fdf4" rx="10" />
      <circle cx="110" cy="70" r="28" fill="#16a34a" opacity="0.15" />
      <circle cx="110" cy="55" r="16" fill="#16a34a" />
      <path d="M80 110c0-18 14-30 30-30s30 12 30 30" fill="#16a34a" />
      <circle cx="190" cy="70" r="28" fill="#22c55e" opacity="0.15" />
      <circle cx="190" cy="55" r="16" fill="#22c55e" />
      <path d="M160 110c0-18 14-30 30-30s30 12 30 30" fill="#22c55e" />
      <path
        d="M130 75l15 12 15-12"
        stroke="#fff"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}