export default function Footer() {
  return (
    <footer style={{ background: '#111827', color: '#d1d5db', padding: '40px 0', marginTop: 60 }}>
      <div className="container" style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 20 }}>
        <div>
          <div style={{ fontWeight: 700, fontSize: 18, color: '#fff' }}>HopeCare</div>
          <p style={{ fontSize: 13, marginTop: 8, maxWidth: 300 }}>
            A transparent donation and charity management platform connecting donors with causes that matter.
          </p>
        </div>
        <div>
          <div style={{ fontWeight: 600, color: '#fff', marginBottom: 10 }}>Quick Links</div>
          <p style={{ fontSize: 13, lineHeight: 2 }}>Campaigns<br />Donate<br />About Us<br />Contact</p>
        </div>
        <div>
          <div style={{ fontWeight: 600, color: '#fff', marginBottom: 10 }}>Contact</div>
          <p style={{ fontSize: 13, lineHeight: 2 }}>support@hopecare.org<br />+91 98765 43210</p>
        </div>
      </div>
      <div style={{ textAlign: 'center', fontSize: 12, marginTop: 30, color: '#6b7280' }}>
        © {new Date().getFullYear()} HopeCare. All rights reserved.
      </div>
    </footer>
  );
}
