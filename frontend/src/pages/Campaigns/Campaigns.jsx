import { useEffect, useState } from 'react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import CampaignCard from '../../components/CampaignCard';
import DonationTicker from '../../components/DonationTicker';
import Loader from '../../components/Loader';
import { campaignService } from '../../services/campaignService';
import { Search } from 'lucide-react';

const categories = ['Education', 'Healthcare', 'Food & Hunger', 'Disaster Relief', 'Environment', 'Others'];

export default function Campaigns() {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');

  const load = () => {
    setLoading(true);
    campaignService.getAll({ status: 'Active', search, category: category || undefined })
      .then(setCampaigns)
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [category]);

  return (
    <>
      <Navbar />
      <DonationTicker />

      <div style={{ position: 'relative', overflow: 'hidden', background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)' }}>
        {/* decorative dot grid */}
        <div style={{
          position: 'absolute', top: 20, right: 40, width: 120, height: 120,
          backgroundImage: 'radial-gradient(#93c5fd 1.5px, transparent 1.5px)',
          backgroundSize: '14px 14px', opacity: 0.5, pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', bottom: 0, left: -40, width: 160, height: 160,
          borderRadius: '50%', background: 'rgba(37,99,235,0.08)', pointerEvents: 'none',
        }} />

        <div className="container" style={{ padding: '40px 20px', position: 'relative', zIndex: 1 }}>
          <h1 style={{ marginBottom: 6, color: '#111827' }}>Browse Campaigns</h1>
          <p style={{ color: '#6b7280', marginBottom: 24 }}>
            Discover meaningful campaigns and support causes that matter.
          </p>

          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: 220, position: 'relative' }}>
              <Search size={16} color="#9ca3af" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
              <input
                placeholder="Search campaigns..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && load()}
                style={{ width: '100%', padding: '10px 12px 10px 36px', borderRadius: 8, border: '1px solid #e5e7eb', background: '#fff' }}
              />
            </div>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              style={{ padding: 10, borderRadius: 8, border: '1px solid #e5e7eb', background: '#fff' }}
            >
              <option value="">All Categories</option>
              {categories.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            <button className="btn btn-primary" onClick={load} style={{ background: '#2563eb', borderColor: '#2563eb' }}>
              Search
            </button>
          </div>
        </div>
      </div>

      <div className="container" style={{ padding: '32px 20px' }}>
        {loading ? (
          <Loader label="Loading campaigns..." />
        ) : campaigns.length === 0 ? (
          <p>No campaigns found.</p>
        ) : (
          <div className="grid grid-3">
            {campaigns.map((c) => <CampaignCard key={c.campaignId} campaign={c} />)}
          </div>
        )}
      </div>
      <Footer />
    </>
  );
}