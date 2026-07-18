export default function Loader({ label = 'Loading...' }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: 60, color: '#6b7280' }}>
      <div
        style={{
          width: 36, height: 36, border: '4px solid #e5e7eb', borderTopColor: '#16a34a',
          borderRadius: '50%', animation: 'spin 0.8s linear infinite',
        }}
      />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <p style={{ marginTop: 12, fontSize: 14 }}>{label}</p>
    </div>
  );
}
