import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Wallet, HandHeart, Users, Gift } from 'lucide-react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import CampaignCarousel from '../../components/CampaignCarousel';
import CategoryScroller from '../../components/CategoryScroller';
import Loader from '../../components/Loader';
import DonationTicker from '../../components/DonationTicker';
import { campaignService } from '../../services/campaignService';
import { userService } from '../../services/userService';
import { useAuth } from '../../context/AuthContext';

import heroImg1 from '../../assets/images/hero/hero-1.jpg';
import heroImg2 from '../../assets/images/hero/hero-2.jpg';
import heroImg3 from '../../assets/images/hero/hero-3.jpg';
import heroImg4 from '../../assets/images/hero/hero-4.jpg';
import heroImg5 from '../../assets/images/hero/hero-5.jpg';
import heroImg6 from '../../assets/images/hero/hero-6.jpg';
import leavesFrame from '../../assets/images/backgrounds/leaves-frame.jpg';

const heroImages = [heroImg1, heroImg2, heroImg3, heroImg4, heroImg5, heroImg6];
const HERO_SLIDE_INTERVAL = 4000;

function HeroSlideshow() {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % heroImages.length);
    }, HERO_SLIDE_INTERVAL);
    return () => clearInterval(timer);
  }, []);

  return (
    <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0, overflow: 'hidden' }}>
      {heroImages.map((src, i) => (
        <img
          key={src}
          src={src}
          alt=""
          style={{
            position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
            objectFit: 'cover', opacity: i === activeIndex ? 1 : 0, transition: 'opacity 1.2s ease-in-out',
          }}
        />
      ))}
      <div style={{ position: 'absolute', bottom: 16, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 8, zIndex: 2 }}>
        {heroImages.map((_, i) => (
          <span
            key={i}
            style={{
              width: 7, height: 7, borderRadius: '50%',
              background: i === activeIndex ? '#fff' : 'rgba(255,255,255,0.4)',
              transition: 'background 0.3s ease',
            }}
          />
        ))}
      </div>
    </div>
  );
}

// Ring/donut chart used in the "My Activity" cards. Pass segments as
// [{ label, count, color }, ...] — the ring is drawn as SVG stroke arcs so
// it stays crisp at any size, with a legend rendered separately beside it.
function DonutChart({ segments, size = 84, strokeWidth = 11 }) {
  const total = segments.reduce((s, seg) => s + seg.count, 0);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  let cumulative = 0;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ flexShrink: 0 }}>
      <g transform={`rotate(-90 ${size / 2} ${size / 2})`}>
        {total === 0 ? (
          <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="var(--border)" strokeWidth={strokeWidth} />
        ) : (
          segments
            .filter((seg) => seg.count > 0)
            .map((seg) => {
              const fraction = seg.count / total;
              const dash = fraction * circumference;
              const gap = circumference - dash;
              const offset = -(cumulative / total) * circumference;
              cumulative += seg.count;
              return (
                <circle
                  key={seg.label}
                  cx={size / 2}
                  cy={size / 2}
                  r={radius}
                  fill="none"
                  stroke={seg.color}
                  strokeWidth={strokeWidth}
                  strokeDasharray={`${dash} ${gap}`}
                  strokeDashoffset={offset}
                />
              );
            })
        )}
      </g>
    </svg>
  );
}

export default function Home() {
  const { t } = useTranslation();
  const { isAuthenticated } = useAuth();

  const [allCampaigns, setAllCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [campaignsError, setCampaignsError] = useState(null);
  const [history, setHistory] = useState(null);
  const [historyLoading, setHistoryLoading] = useState(true);

  useEffect(() => {
    campaignService.getAll({ status: 'Active' })
      .then((data) => {
        const list = Array.isArray(data) ? data : data?.items || data?.data || [];
        setAllCampaigns(list);
      })
      .catch((err) => {
        console.error('Failed to load campaigns:', err);
        setCampaignsError(err);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      userService.getMyHistory()
        .then(setHistory)
        .finally(() => setHistoryLoading(false));
    } else {
      setHistoryLoading(false);
    }
  }, [isAuthenticated]);

  // NOTE: adjust the status strings below (`'Pending'`, `'UnderVerification'`,
  // etc.) to match whatever your API actually returns — I matched them to
  // what the previous statusText logic used, but didn't have your full
  // status enum, so double check these three cards against real data.
  const activityCards = history ? [
    {
      icon: Wallet, iconBg: '#dcfce7', iconColor: '#16a34a', borderColor: '#16a34a',
      label: t('home.donationsMade'), value: history.donations.length, valueColor: '#16a34a',
      sub: t('home.totalDonations', { defaultValue: 'Total Donations' }),
      segments: [
        { label: t('home.approved', { defaultValue: 'Approved' }), color: '#16a34a', count: history.donations.filter(d => d.status === 'Approved').length },
        { label: t('home.pending', { defaultValue: 'Pending' }), color: '#f59e0b', count: history.donations.filter(d => d.status === 'Pending').length },
        { label: t('home.cancelled', { defaultValue: 'Cancelled' }), color: '#ef4444', count: history.donations.filter(d => d.status === 'Cancelled').length },
      ],
    },
    {
      icon: HandHeart, iconBg: '#dbeafe', iconColor: '#2563eb', borderColor: '#2563eb',
      label: t('home.helpApplications'), value: history.applications.length, valueColor: '#2563eb',
      sub: t('home.totalApplications', { defaultValue: 'Total Applications' }),
      segments: [
        { label: t('home.pendingReview', { defaultValue: 'Pending Review' }), color: '#93c5fd', count: history.applications.filter(a => a.status === 'Pending').length },
        { label: t('home.inProgress', { defaultValue: 'In Progress' }), color: '#2563eb', count: history.applications.filter(a => a.status === 'UnderVerification').length },
        { label: t('home.completed', { defaultValue: 'Completed' }), color: '#1e3a8a', count: history.applications.filter(a => a.status === 'Approved' || a.status === 'Completed').length },
      ],
    },
    {
      icon: Users, iconBg: '#ede9fe', iconColor: '#7c3aed', borderColor: '#7c3aed',
      label: t('home.aidReceived'), value: history.aidReceived.length, valueColor: '#7c3aed',
      sub: t('home.totalReceived', { defaultValue: 'Total Received' }),
      segments: [
        { label: t('home.delivered', { defaultValue: 'Delivered' }), color: '#7c3aed', count: history.aidReceived.filter(a => a.status === 'Delivered').length },
        { label: t('home.inProgress', { defaultValue: 'In Progress' }), color: '#f59e0b', count: history.aidReceived.filter(a => a.status === 'InProgress').length },
        { label: t('home.cancelled', { defaultValue: 'Cancelled' }), color: '#ef4444', count: history.aidReceived.filter(a => a.status === 'Cancelled').length },
      ],
    },
  ] : [];

  return (
    <>
      <style>{`
        .home-page-bg {
          position: relative;
          background-image: url(${leavesFrame});
          background-size: cover;
          background-position: center;
          background-attachment: fixed;
        }
        .home-page-bg::before {
          content: '';
          position: absolute;
          inset: 0;
          background: rgba(255,255,255,0.72);
          pointer-events: none;
        }
        [data-theme="dark"] .home-page-bg::before {
          background: #000000;
        }
        .home-page-bg > * {
          position: relative;
          z-index: 1;
        }
      `}</style>

      <div className="home-page-bg">
        <Navbar />

        <section style={{ position: 'relative', color: '#fff', padding: '100px 0', overflow: 'hidden' }}>
          <HeroSlideshow />
          <div
            style={{
              position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
              background: 'linear-gradient(90deg, rgba(17,24,39,0.75) 0%, rgba(17,24,39,0.4) 45%, rgba(17,24,39,0.1) 75%, rgba(17,24,39,0) 100%)',
              zIndex: 1,
            }}
          />
          <div className="container" style={{ position: 'relative', zIndex: 2 }}>
            <h1 style={{ fontSize: 38, maxWidth: 500 }}>{t('home.heroTitle')}</h1>
            <p style={{ color: '#d1d5db', maxWidth: 480, margin: '16px 0 24px' }}>{t('home.heroSubtitle')}</p>
            <div style={{ display: 'flex', gap: 12 }}>
              <Link to="/campaigns" className="btn btn-primary">♡ {t('home.donateNow')}</Link>
              <Link to="/campaigns" className="btn btn-outline">{t('home.exploreCampaigns')}</Link>
            </div>
          </div>
        </section>

        {!loading && <CategoryScroller campaigns={allCampaigns} />}

        <DonationTicker />

        {isAuthenticated && !historyLoading && history && (
          <section className="container" style={{ padding: '32px 0 0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{
                  width: 48, height: 48, borderRadius: 12, background: 'var(--card-bg)',
                  boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }}>
                  <Users size={22} color="#16a34a" />
                </div>
                <div>
                  <h2 style={{ margin: 0, color: 'var(--dark)' }}>{t('home.myActivity')}</h2>
                  <p style={{ margin: 0, fontSize: 13.5, color: 'var(--text-muted)' }}>
                    {t('home.myActivitySubtitle', { defaultValue: 'Track your contributions and impact' })}
                  </p>
                </div>
              </div>
              <Link
                to="/my-activity"
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  color: '#16a34a', fontWeight: 600, fontSize: 13.5,
                  border: '1.5px solid #86efac', borderRadius: 999,
                  padding: '8px 16px', textDecoration: 'none',
                }}
              >
                {t('home.viewFullHistory')} →
              </Link>
            </div>

            <div className="grid grid-3" style={{ gap: 20 }}>
              {activityCards.map((card) => {
                const Icon = card.icon;
                return (
                  <div
                    key={card.label}
                    style={{
                      position: 'relative', overflow: 'hidden',
                      background: 'var(--card-bg)', borderRadius: 14,
                      borderLeft: `4px solid ${card.borderColor}`,
                      padding: '20px 22px',
                      boxShadow: '0 2px 12px rgba(0,0,0,0.05)',
                      display: 'flex', flexDirection: 'column', gap: 16,
                    }}
                  >
                    <Gift size={90} color={card.borderColor} style={{ position: 'absolute', right: -18, bottom: -18, opacity: 0.06 }} />

                    <div style={{ display: 'flex', alignItems: 'center', gap: 14, position: 'relative' }}>
                      <div style={{
                        width: 46, height: 46, borderRadius: '50%', background: card.iconBg,
                        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                      }}>
                        <Icon color={card.iconColor} size={21} />
                      </div>
                      <div style={{ fontWeight: 700, color: 'var(--dark)', fontSize: 15 }}>{card.label}</div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, position: 'relative' }}>
                      <div>
                        <div style={{ fontSize: 30, fontWeight: 800, color: card.valueColor, lineHeight: 1.1 }}>{card.value}</div>
                        <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>{card.sub}</div>
                      </div>
                      <DonutChart segments={card.segments} />
                    </div>

                    <div style={{ borderTop: '1px solid var(--border)', paddingTop: 12, display: 'flex', flexDirection: 'column', gap: 6, position: 'relative' }}>
                      {card.segments.map((seg) => (
                        <div key={seg.label} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12.5, color: 'var(--text-muted)' }}>
                          <span style={{ width: 8, height: 8, borderRadius: '50%', background: seg.color, flexShrink: 0 }} />
                          <span style={{ fontWeight: 700, color: 'var(--dark)' }}>{seg.count}</span> {seg.label}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {loading ? (
          <div className="container" style={{ padding: '40px 0' }}>
            <Loader label={t('home.loadingCampaigns')} />
          </div>
        ) : campaignsError ? (
          <div className="container" style={{ padding: '40px 0', textAlign: 'center', color: 'var(--text-muted)' }}>
            {t('home.campaignsLoadError', { defaultValue: "Couldn't load campaigns right now. Please try again shortly." })}
          </div>
        ) : allCampaigns.length === 0 ? (
          <div className="container" style={{ padding: '40px 0', textAlign: 'center', color: 'var(--text-muted)' }}>
            {t('home.noCampaigns', { defaultValue: 'No active campaigns at the moment — check back soon.' })}
          </div>
        ) : (
          <CampaignCarousel
            campaigns={allCampaigns}
            title={t('home.ongoingCampaigns', { defaultValue: 'Ongoing Campaigns' })}
            subtitle={t('home.ongoingCampaignsSubtitle', { defaultValue: 'Support causes that create a lasting impact' })}
          />
        )}

        <Footer />
      </div>
    </>
  );
}