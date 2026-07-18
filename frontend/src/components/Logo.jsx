export default function Logo({ size = 32, showText = true, light = false }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
        <path
          d="M24 40C24 40 6 29 6 17.5C6 11.7 10.7 7 16.5 7C19.9 7 23 8.7 24 11.5C25 8.7 28.1 7 31.5 7C37.3 7 42 11.7 42 17.5C42 29 24 40 24 40Z"
          fill="#2563eb"
        />
        <path
          d="M15 22L20 27L33 14"
          stroke="white"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      </svg>
      {showText && (
        <span style={{ fontSize: size * 0.6, fontWeight: 800, color: light ? '#fff' : '#1d4ed8', letterSpacing: -0.5 }}>
          HopeCare
        </span>
      )}
    </div>
  );
}