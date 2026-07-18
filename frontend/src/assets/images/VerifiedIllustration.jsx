export default function VerifiedIllustration() {
  return (
    <svg viewBox="0 0 300 160" style={{ width: '100%', height: 160 }}>
      <rect width="300" height="160" fill="#f0fdf4" rx="10" />
      <circle cx="150" cy="65" r="30" fill="#16a34a" opacity="0.15" />
      <path
        d="M150 40c-13 0-24 11-24 24 0 18 24 46 24 46s24-28 24-46c0-13-11-24-24-24z"
        fill="#16a34a"
      />
      <circle cx="150" cy="64" r="10" fill="#fff" />
      <path
        d="M145 64l4 4 8-8"
        stroke="#16a34a"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}