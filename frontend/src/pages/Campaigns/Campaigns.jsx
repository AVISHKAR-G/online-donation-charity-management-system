import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import CampaignCard from '../../components/CampaignCard';
import DonationTicker from '../../components/DonationTicker';
import Loader from '../../components/Loader';
import { campaignService } from '../../services/campaignService';
import { Search } from 'lucide-react';
import impactHero from '../../assets/images/backgrounds/impact-hero.jpg';
import leavesFrame from '../../assets/images/backgrounds/leaves-frame.jpg';

export default function Campaigns() {
  const { t } = useTranslation();

  const categories = [
    { value: 'Education', label: t('campaigns.categoryEducation') },
    { value: 'Healthcare', label: t('campaigns.categoryHealthcare') },
    { value: 'Food & Hunger', label: t('campaigns.categoryFoodHunger') },
    { value: 'Disaster Relief', label: t('campaigns.categoryDisasterRelief') },
    { value: 'Environment', label: t('campaigns.categoryEnvironment') },
    { value: 'Others', label: t('campaigns.categoryOthers') },
  ];

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
      <style>{`
        /* page-level leaf frame background, matching PageBackground treatment */
        .campaigns-page-bg {
          position: relative;
          background-image: url(${leavesFrame});
          background-size: cover;
          background-position: center;
          background-attachment: fixed;
        }
        .campaigns-page-bg::before {
          content: '';
          position: absolute;
          inset: 0;
          background: rgba(255,255,255,0.72);
          pointer-events: none;
        }
        [data-theme="dark"] .campaigns-page-bg::before {
          background: rgba(6,17,11,0.82);
        }
        .campaigns-page-bg > * {
          position: relative;
          z-index: 1;
        }

        .campaigns-hero {
          position: relative;
          overflow: hidden;
          background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
        }
        [data-theme="dark"] .campaigns-hero {
          background: linear-gradient(135deg, #06170f 0%, #0b2818 100%);
        }
        .campaigns-hero-photo {
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(90deg, #f0fdf4 0%, rgba(240,253,244,0.6) 35%, rgba(240,253,244,0) 55%),
            url(${impactHero});
          background-size: cover, cover;
          background-position: center, right center;
        }
        [data-theme="dark"] .campaigns-hero-photo {
          background-image:
            linear-gradient(90deg, #06170f 0%, rgba(6,23,15,0.6) 35%, rgba(6,23,15,0) 55%),
            url(${impactHero});
        }
        .campaigns-hero h1 {
          color: #064e3b;
        }
        [data-theme="dark"] .campaigns-hero h1 {
          color: #ecfdf5;
        }
        .campaigns-hero p.subtitle {
          color: #4b5563;
        }
        [data-theme="dark"] .campaigns-hero p.subtitle {
          color: #a7f3d0;
        }
        .campaigns-search-input,
        .campaigns-category-select {
          background: #fff;
          border: 1px solid #e5e7eb;
          color: #111827;
          border-radius: 10px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.05);
          transition: background 0.2s ease, border-color 0.2s ease, color 0.2s ease;
        }
        [data-theme="dark"] .campaigns-search-input,
        [data-theme="dark"] .campaigns-category-select {
          background: rgba(17,24,39,0.9);
          border: 1px solid rgba(255,255,255,0.1);
          color: #ecfdf5;
        }
        .campaigns-search-input::placeholder {
          color: #9ca3af;
        }
        [data-theme="dark"] .campaigns-search-input::placeholder {
          color: #6ee7b7;
          opacity: 0.6;
        }
        .campaigns-search-btn {
          background: #16a34a;
          border-color: #16a34a;
          border-radius: 10px;
        }
        .campaigns-search-btn:hover {
          background: #15803d;
        }
      `}</style>

      <div className="campaigns-page-bg">
        <Navbar />
        <DonationTicker />

        <div className="campaigns-hero">
          <div className="campaigns-hero-photo" />

          <div className="container" style={{ padding: '48px 20px', position: 'relative', zIndex: 1 }}>
            <h1 style={{ marginBottom: 6 }}>{t('campaigns.title')}</h1>
            <p className="subtitle" style={{ marginBottom: 24 }}>
              {t('campaigns.subtitle')}
            </p>

            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', maxWidth: 760 }}>
              <div style={{ flex: 1, minWidth: 220, position: 'relative' }}>
                <Search size={16} color="#16a34a" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  className="campaigns-search-input"
                  placeholder={t('campaigns.searchPlaceholder')}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && load()}
                  style={{ width: '100%', padding: '10px 12px 10px 36px' }}
                />
              </div>
              <select
                className="campaigns-category-select"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                style={{ padding: 10 }}
              >
                <option value="">{t('campaigns.allCategories')}</option>
                {categories.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
              <button className="btn btn-primary campaigns-search-btn" onClick={load}>
                {t('campaigns.search')}
              </button>
            </div>
          </div>
        </div>

        <div className="container" style={{ padding: '32px 20px' }}>
          {loading ? (
            <Loader label={t('campaigns.loadingCampaigns')} />
          ) : campaigns.length === 0 ? (
            <p>{t('campaigns.noCampaignsFound')}</p>
          ) : (
            <div className="grid grid-3">
              {campaigns.map((c) => <CampaignCard key={c.campaignId} campaign={c} />)}
            </div>
          )}
        </div>
        <Footer />
      </div>
    </>
  );
}