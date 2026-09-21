export default function Logo({ size = 32, showText = true, showTagline = false, light = false, taglineClassName = '' }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <div
        style={{
          width: size,
          height: size,
          borderRadius: size * 0.3,
          background: 'linear-gradient(155deg, #1c9a4e, #0a5c34)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          boxShadow: '0 4px 10px rgba(10,92,52,0.25)',
        }}
      >
        <svg width={size * 0.56} height={size * 0.56} viewBox="0 0 48 48" fill="none">
          <path
            d="M24 40C24 40 6 29 6 17.5C6 11.7 10.7 7 16.5 7C19.9 7 23 8.7 24 11.5C25 8.7 28.1 7 31.5 7C37.3 7 42 11.7 42 17.5C42 29 24 40 24 40Z"
            fill="#ffffff"
          />
          <path
            d="M15 22L20 27L33 14"
            stroke="#12793f"
            strokeWidth="3.4"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        </svg>
      </div>

      {showText && (
        <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.05 }}>
          <span
            style={{
              fontSize: size * 0.6,
              fontWeight: 800,
              color: light ? '#fff' : '#14532d',
              letterSpacing: -0.5,
            }}
          >
            HopeCare
          </span>
          {showTagline && (
            <span
              className={taglineClassName}
              style={{
                fontSize: Math.max(size * 0.32, 10),
                fontWeight: 500,
                color: light ? 'rgba(255,255,255,0.85)' : '#5f8a72',
                marginTop: 2,
                whiteSpace: 'nowrap',
              }}
            >
              Together for a better tomorrow
            </span>
          )}
        </div>
      )}
    </div>
  );
}