import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ChevronLeft, ChevronRight, GraduationCap, HeartPulse, Utensils, LifeBuoy, Leaf, Sparkles } from 'lucide-react';

const categoryStyles = {
  'Education':        { color: '#16a34a', icon: GraduationCap, key: 'categoryEducation' },
  'Healthcare':        { color: '#dc2626', icon: HeartPulse, key: 'categoryHealthcare' },
  'Food & Hunger':      { color: '#ea580c', icon: Utensils, key: 'categoryFoodHunger' },
  'Disaster Relief':    { color: '#dc2626', icon: LifeBuoy, key: 'categoryDisasterRelief' },
  'Environment':        { color: '#16a34a', icon: Leaf, key: 'categoryEnvironment' },
  'Others':             { color: '#7c3aed', icon: Sparkles, key: 'categoryOthers' },
};
const fallback = { color: 'var(--gray)', icon: Sparkles, key: null };

function CarouselCard({ campaign }) {
  const { t } = useTranslation();
  const style = categoryStyles[campaign.category] || fallback;
  const Icon = style.icon;
  const categoryLabel = style.key ? t(`campaigns.${style.key}`) : campaign.category;
  const pct = Math.min(Math.max(campaign.percentageCompleted || 0, 0), 100);

  return (
    <div
      style={{
        flex: '0 0 260px',
        scrollSnapAlign: 'start',
        background: 'var(--card-bg)',
        border: '1px solid var(--border)',
        borderRadius: 14,
        overflow: 'hidden',
        boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
      }}
    >
      <img
        src={campaign.imageUrl || 'https://placehold.co/400x220?text=Campaign'}
        alt={campaign.title}
        style={{ width: '100%', height: 130, objectFit: 'cover', display: 'block' }}
      />

      <div style={{ padding: '14px 16px 16px' }}>
        {campaign.category && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 6 }}>
            <Icon size={13} color={style.color} />
            <span style={{ fontSize: 12, fontWeight: 700, color: style.color }}>{categoryLabel}</span>
          </div>
        )}

        <h3 style={{ fontSize: 15.5, fontWeight: 700, color: 'var(--dark)', marginBottom: 4 }}>
          {campaign.title}
        </h3>
        <p style={{ fontSize: 12.5, color: 'var(--text-muted)', marginBottom: 12, lineHeight: 1.4 }}>
          {campaign.description?.slice(0, 70)}{campaign.description?.length > 70 ? '...' : ''}
        </p>

        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5, fontWeight: 700, color: style.color, marginBottom: 4 }}>
          <span>{pct}%</span>
          <span>{pct}%</span>
        </div>
        <div style={{ background: 'var(--border)', borderRadius: 4, height: 6, overflow: 'hidden', marginBottom: 8 }}>
          <div style={{ width: `${pct}%`, height: '100%', background: style.color, borderRadius: 4 }} />
        </div>

        <p style={{ fontSize: 12.5, color: 'var(--text-muted)', marginBottom: 14 }}>
          <strong style={{ color: 'var(--dark)' }}>₹{campaign.collectedAmount?.toLocaleString()}</strong> {t('campaigns.raisedOf')} ₹{campaign.targetAmount?.toLocaleString()}
        </p>

        <Link
          to={`/donate/${campaign.campaignId}`}
          className="btn btn-primary"
          style={{ width: '100%', justifyContent: 'center', background: style.color, borderColor: style.color }}
        >
          ♡ {t('campaigns.donateNow')}
        </Link>
      </div>
    </div>
  );
}

export default function CampaignCarousel({ campaigns, title, subtitle }) {
  const { t } = useTranslation();
  const scrollerRef = useRef(null);

  const scroll = (dir) => {
    if (!scrollerRef.current) return;
    scrollerRef.current.scrollBy({ left: dir * 280, behavior: 'smooth' });
  };

  if (!campaigns || campaigns.length === 0) return null;

  return (
    <section style={{ padding: '40px 0', position: 'relative' }}>
      <div className="container" style={{ textAlign: 'center', marginBottom: 24 }}>
        <h2 style={{ color: 'var(--dark)', marginBottom: 6 }}>{title}</h2>
        {subtitle && <p style={{ color: 'var(--text-muted)', fontSize: 14.5 }}>{subtitle}</p>}
      </div>

      <div style={{ position: 'relative' }}>
        <button
          type="button"
          onClick={() => scroll(-1)}
          aria-label="Scroll left"
          style={{
            position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)',
            width: 38, height: 38, borderRadius: '50%', border: 'none',
            background: 'var(--primary)', color: '#fff', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 2, boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          }}
        >
          <ChevronLeft size={18} />
        </button>

        <div
          ref={scrollerRef}
          style={{
            display: 'flex',
            gap: 20,
            overflowX: 'auto',
            scrollSnapType: 'x mandatory',
            scrollbarWidth: 'none',
            padding: '4px 56px',
          }}
        >
          {campaigns.map((c) => <CarouselCard key={c.campaignId} campaign={c} />)}
        </div>

        <button
          type="button"
          onClick={() => scroll(1)}
          aria-label="Scroll right"
          style={{
            position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
            width: 38, height: 38, borderRadius: '50%', border: 'none',
            background: 'var(--primary)', color: '#fff', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 2, boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          }}
        >
          <ChevronRight size={18} />
        </button>
      </div>

      <div className="container" style={{ textAlign: 'center', marginTop: 28 }}>
        <Link to="/campaigns" className="btn btn-primary">
          {t('home.viewAllCampaigns')} →
        </Link>
      </div>
    </section>
  );
}