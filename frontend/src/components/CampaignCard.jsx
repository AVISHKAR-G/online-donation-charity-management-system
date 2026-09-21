import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { GraduationCap, HeartPulse, Utensils, LifeBuoy, Leaf, Sparkles } from 'lucide-react';

const categoryStyles = {
  'Education':        { color: '#16a34a', bg: '#16a34a', icon: GraduationCap, key: 'categoryEducation' },
  'Healthcare':        { color: '#dc2626', bg: '#dc2626', icon: HeartPulse, key: 'categoryHealthcare' },
  'Food & Hunger':      { color: '#16a34a', bg: '#16a34a', icon: Utensils, key: 'categoryFoodHunger' },
  'Disaster Relief':    { color: '#ea580c', bg: '#ea580c', icon: LifeBuoy, key: 'categoryDisasterRelief' },
  'Environment':        { color: '#0d9488', bg: '#0d9488', icon: Leaf, key: 'categoryEnvironment' },
  'Others':             { color: '#7c3aed', bg: '#7c3aed', icon: Sparkles, key: 'categoryOthers' },
};
const fallback = { color: '#6b7280', bg: '#6b7280', icon: Sparkles, key: null };

export default function CampaignCard({ campaign }) {
  const { t } = useTranslation();
  const style = categoryStyles[campaign.category] || fallback;
  const Icon = style.icon;
  const categoryLabel = style.key ? t(`campaigns.${style.key}`) : campaign.category;

  return (
    <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
      <div style={{ position: 'relative' }}>
        <img
          src={campaign.imageUrl || 'https://placehold.co/400x220?text=Campaign'}
          alt={campaign.title}
          style={{ width: '100%', height: 180, objectFit: 'cover' }}
        />
        {campaign.category && (
          <span
            style={{
              position: 'absolute',
              bottom: 10,
              left: 10,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              background: style.bg,
              color: '#fff',
              fontSize: 12,
              fontWeight: 600,
              padding: '5px 12px',
              borderRadius: 999,
              boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
            }}
          >
            <Icon size={13} />
            {categoryLabel}
          </span>
        )}
      </div>

      <div style={{ padding: 16 }}>
        <h3 style={{ fontSize: 16, marginBottom: 6, color: 'var(--dark)' }}>{campaign.title}</h3>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 12 }}>
          {campaign.description?.slice(0, 90)}{campaign.description?.length > 90 ? '...' : ''}
        </p>
        <p style={{ fontSize: 13, marginBottom: 6, color: 'var(--dark)' }}>
          <strong style={{ color: style.color }}>₹{campaign.collectedAmount?.toLocaleString()}</strong> {t('campaigns.raisedOf')} ₹{campaign.targetAmount?.toLocaleString()}
        </p>
        <div className="progress-bar" style={{ background: 'var(--border)', borderRadius: 4, height: 6, overflow: 'hidden' }}>
          <div
            className="progress-fill"
            style={{
              width: `${Math.min(campaign.percentageCompleted, 100)}%`,
              background: style.color,
              height: '100%',
            }}
          />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 }}>
          <span style={{ fontSize: 13, color: style.color, fontWeight: 500 }}>
            📊 {campaign.percentageCompleted}% {t('campaigns.completedLabel')}
          </span>
          <Link
            to={`/donate/${campaign.campaignId}`}
            className="btn btn-primary"
            style={{ background: style.bg, borderColor: style.bg, display: 'inline-flex', alignItems: 'center', gap: 6 }}
          >
            ♡ {t('campaigns.donateNow')}
          </Link>
        </div>
      </div>
    </div>
  );
}