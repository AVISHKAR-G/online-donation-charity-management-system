import Sidebar from '../../components/Sidebar';
import UrgentCampaignAlert from '../../components/UrgentCampaignAlert';
import { Megaphone } from 'lucide-react';

export default function UrgentCampaign() {
  return (
    <div style={{ display: 'flex', background: '#f8fafc', minHeight: '100vh' }}>
      <Sidebar />

      <div style={{ flex: 1, padding: '28px 32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 28 }}>
          <div
            style={{
              width: 46, height: 46, borderRadius: 12, background: '#dbeafe',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}
          >
            <Megaphone size={22} color="#2563eb" />
          </div>
          <div>
            <h1 style={{ fontSize: 26, fontWeight: 800, margin: 0, color: '#111827' }}>Urgent Campaign</h1>
            <p style={{ color: '#6b7280', marginTop: 4, fontSize: 14, margin: '4px 0 0' }}>
              Send an emergency appeal directly to everyone who has donated before.
            </p>
          </div>
        </div>

        <UrgentCampaignAlert />
      </div>
    </div>
  );
}