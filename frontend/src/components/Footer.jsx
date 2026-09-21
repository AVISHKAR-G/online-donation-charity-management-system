import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import {
  Heart,
  ChevronRight,
  MapPin,
  Phone,
  Mail,
  Clock,
  ShieldCheck,
  FileCheck2,
  HeartHandshake,
  Users,
} from 'lucide-react';

// lucide-react dropped brand/logo icons (Facebook, Twitter, Instagram, LinkedIn,
// YouTube) in newer versions for trademark reasons, so these are small inline
// SVGs instead of a lucide import.
const FacebookIcon = (props) => (
  <svg viewBox="0 0 24 24" width={15} height={15} fill="currentColor" {...props}>
    <path d="M22 12.06C22 6.5 17.52 2 12 2S2 6.5 2 12.06c0 5 3.66 9.15 8.44 9.94v-7.03H7.9v-2.91h2.54V9.85c0-2.51 1.49-3.9 3.77-3.9 1.09 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56v1.89h2.78l-.44 2.91h-2.34V22c4.78-.79 8.44-4.94 8.44-9.94Z" />
  </svg>
);
const TwitterIcon = (props) => (
  <svg viewBox="0 0 24 24" width={15} height={15} fill="currentColor" {...props}>
    <path d="M22 5.9c-.7.3-1.5.6-2.3.7.8-.5 1.5-1.3 1.8-2.3-.8.5-1.7.8-2.6 1-.8-.8-1.9-1.3-3.1-1.3-2.3 0-4.2 1.9-4.2 4.2 0 .3 0 .7.1 1C8.3 9 5 7.2 2.8 4.5c-.4.6-.6 1.3-.6 2.1 0 1.4.7 2.7 1.9 3.4-.7 0-1.3-.2-1.9-.5v.1c0 2 1.4 3.7 3.3 4.1-.3.1-.7.1-1.1.1-.3 0-.5 0-.8-.1.5 1.7 2.1 2.9 3.9 2.9-1.4 1.1-3.2 1.8-5.2 1.8-.3 0-.7 0-1-.1C3.1 19.3 5.3 20 7.7 20c7.5 0 11.7-6.3 11.7-11.7v-.5c.8-.6 1.5-1.3 2-2.1Z" />
  </svg>
);
const InstagramIcon = (props) => (
  <svg viewBox="0 0 24 24" width={15} height={15} fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
    <rect x="3" y="3" width="18" height="18" rx="5" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
  </svg>
);
const LinkedinIcon = (props) => (
  <svg viewBox="0 0 24 24" width={15} height={15} fill="currentColor" {...props}>
    <path d="M4.98 3.5C4.98 4.88 3.87 6 2.5 6S0 4.88 0 3.5 1.12 1 2.5 1s2.48 1.12 2.48 2.5ZM.24 8.25h4.5V23h-4.5V8.25Zm7.62 0h4.31v2.02h.06c.6-1.14 2.07-2.34 4.26-2.34 4.56 0 5.4 3 5.4 6.9V23h-4.5v-6.4c0-1.53-.03-3.5-2.13-3.5-2.14 0-2.47 1.67-2.47 3.39V23h-4.5V8.25Z" transform="translate(1.5)" />
  </svg>
);
const YoutubeIcon = (props) => (
  <svg viewBox="0 0 24 24" width={15} height={15} fill="currentColor" {...props}>
    <path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.4.6A3 3 0 0 0 .5 6.2 31 31 0 0 0 0 12a31 31 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.9.6 9.4.6 9.4.6s7.5 0 9.4-.6a3 3 0 0 0 2.1-2.1A31 31 0 0 0 24 12a31 31 0 0 0-.5-5.8ZM9.6 15.6V8.4l6.3 3.6-6.3 3.6Z" />
  </svg>
);

const socialLinks = [
  { icon: FacebookIcon, href: 'https://facebook.com' },
  { icon: TwitterIcon, href: 'https://twitter.com' },
  { icon: InstagramIcon, href: 'https://instagram.com' },
  { icon: LinkedinIcon, href: 'https://linkedin.com' },
  { icon: YoutubeIcon, href: 'https://youtube.com' },
];

const navigateLinks = [
  { key: 'footer.home', fallback: 'Home', to: '/' },
  { key: 'nav.about', fallback: 'About Us', to: '/about' },
  { key: 'nav.campaigns', fallback: 'Campaigns', to: '/campaigns' },
  { key: 'footer.donate', fallback: 'Donate', to: '/donate' },
  { key: 'footer.events', fallback: 'Events', to: '/events' },
  { key: 'nav.contact', fallback: 'Contact Us', to: '/contact' },
];

const informationLinks = [
  { key: 'footer.howItWorks', fallback: 'How It Works', to: '/how-it-works' },
  { key: 'footer.faqs', fallback: 'FAQs', to: '/faqs' },
  { key: 'footer.privacyPolicy', fallback: 'Privacy Policy', to: '/privacy-policy' },
  { key: 'footer.terms', fallback: 'Terms & Conditions', to: '/terms' },
  { key: 'footer.refundPolicy', fallback: 'Refund Policy', to: '/refund-policy' },
];

const trustBadges = [
  {
    icon: ShieldCheck,
    titleKey: 'footer.secureTitle',
    titleFallback: '100% Secure',
    descKey: 'footer.secureDesc',
    descFallback: 'Your donation is safe with us.',
  },
  {
    icon: FileCheck2,
    titleKey: 'footer.taxTitle',
    titleFallback: 'Tax Exemption',
    descKey: 'footer.taxDesc',
    descFallback: '80G certified donations.',
  },
  {
    icon: HeartHandshake,
    titleKey: 'footer.transparentTitle',
    titleFallback: 'Transparent',
    descKey: 'footer.transparentDesc',
    descFallback: 'Complete transparency.',
  },
  {
    icon: Users,
    titleKey: 'footer.trustedTitle',
    titleFallback: 'Trusted by Thousands',
    descKey: 'footer.trustedDesc',
    descFallback: 'Join our growing community.',
  },
];

export default function Footer() {
  const { t } = useTranslation();

  return (
    <footer style={{ position: 'relative', marginTop: 60, color: '#e5e7eb' }}>
      {/* Wave divider */}
      <div style={{ lineHeight: 0, transform: 'translateY(1px)' }}>
        <svg
          viewBox="0 0 1440 110"
          preserveAspectRatio="none"
          style={{ width: '100%', height: 90, display: 'block' }}
        >
          <path
            d="M0,50 C240,110 480,0 720,40 C960,80 1200,20 1440,60 L1440,110 L0,110 Z"
            fill="#0f766e"
            opacity="0.55"
          />
          <path
            d="M0,70 C240,20 480,110 720,60 C960,10 1200,90 1440,40 L1440,110 L0,110 Z"
            fill="url(#footerWaveGradient)"
          />
          <defs>
            <linearGradient id="footerWaveGradient" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#0f766e" />
              <stop offset="100%" stopColor="#0c2d5e" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Main footer body */}
      <div
        style={{
          background: 'linear-gradient(115deg, #0f766e 0%, #123a63 45%, #0c2d5e 100%)',
          padding: '10px 0 0',
        }}
      >
        <div
          className="container"
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(220px, 1.4fr) 1fr 1fr 1.2fr',
            gap: 32,
            padding: '30px 20px 40px',
          }}
        >
          {/* Brand */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: '50%',
                  background: 'rgba(255,255,255,0.12)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Heart color="#fff" size={18} fill="#4ade80" strokeWidth={1.5} />
              </div>
              <span style={{ fontWeight: 800, fontSize: 20, color: '#fff' }}>
                Hope<span style={{ color: '#4ade80' }}>Care</span>
              </span>
            </div>
            <p style={{ fontSize: 13.5, lineHeight: 1.7, marginTop: 14, maxWidth: 300, color: '#cbd5e1' }}>
              {t('footer.tagline', 'Empowering change, one donation at a time. HopeCare connects generous hearts with meaningful causes to build a better tomorrow.')}
            </p>
            <div style={{ width: 32, height: 2, background: '#4ade80', margin: '18px 0' }} />
            <div style={{ display: 'flex', gap: 10 }}>
              {socialLinks.map(({ icon: Icon, href }, i) => (
                <a
                  key={i}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: '50%',
                    border: '1px solid rgba(255,255,255,0.35)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff',
                  }}
                >
                  <Icon size={15} />
                </a>
              ))}
            </div>
          </div>

          {/* Navigate */}
          <div>
            <div style={{ fontWeight: 700, fontSize: 16, color: '#fff', marginBottom: 6 }}>
              {t('footer.navigate', 'Navigate')}
            </div>
            <div style={{ width: 28, height: 2, background: '#4ade80', marginBottom: 16 }} />
            <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
              {navigateLinks.map(({ key, fallback, to }) => (
                <li key={key}>
                  <Link
                    to={to}
                    style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#cbd5e1', fontSize: 13.5, textDecoration: 'none' }}
                  >
                    <ChevronRight size={14} color="#4ade80" />
                    {t(key, fallback)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Information */}
          <div>
            <div style={{ fontWeight: 700, fontSize: 16, color: '#fff', marginBottom: 6 }}>
              {t('footer.information', 'Information')}
            </div>
            <div style={{ width: 28, height: 2, background: '#4ade80', marginBottom: 16 }} />
            <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
              {informationLinks.map(({ key, fallback, to }) => (
                <li key={key}>
                  <Link
                    to={to}
                    style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#cbd5e1', fontSize: 13.5, textDecoration: 'none' }}
                  >
                    <ChevronRight size={14} color="#4ade80" />
                    {t(key, fallback)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <div style={{ fontWeight: 700, fontSize: 16, color: '#fff', marginBottom: 6 }}>
              {t('nav.contact', 'Contact Us')}
            </div>
            <div style={{ width: 28, height: 2, background: '#4ade80', marginBottom: 16 }} />
            <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 14, fontSize: 13.5, color: '#cbd5e1' }}>
              <li style={{ display: 'flex', gap: 10 }}>
                <MapPin size={16} color="#4ade80" style={{ flexShrink: 0, marginTop: 2 }} />
                <span>{t('footer.address', '123 Hope Street, Chennai, Tamil Nadu 600001')}</span>
              </li>
              <li style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                <Phone size={16} color="#4ade80" style={{ flexShrink: 0 }} />
                <span>+91 98765 43210</span>
              </li>
              <li style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                <Mail size={16} color="#4ade80" style={{ flexShrink: 0 }} />
                <span>support@hopecare.org</span>
              </li>
              <li style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                <Clock size={16} color="#4ade80" style={{ flexShrink: 0 }} />
                <span>{t('footer.hours', 'Mon - Sat: 9:00 AM - 6:00 PM')}</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Trust badges strip */}
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.15)' }}>
          <div
            className="container"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: 20,
              padding: '24px 20px',
            }}
          >
            {trustBadges.map(({ icon: Icon, titleKey, titleFallback, descKey, descFallback }, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div
                  style={{
                    width: 42,
                    height: 42,
                    borderRadius: '50%',
                    border: '1.5px solid #4ade80',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <Icon size={19} color="#4ade80" />
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 13.5, color: '#fff' }}>
                    {t(titleKey, titleFallback)}
                  </div>
                  <div style={{ fontSize: 12.5, color: '#cbd5e1' }}>
                    {t(descKey, descFallback)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Copyright */}
        <div style={{ textAlign: 'center', fontSize: 12.5, padding: '18px 20px', color: '#94a3b8' }}>
          © {new Date().getFullYear()} <span style={{ color: '#4ade80', fontWeight: 600 }}>HopeCare</span>.{' '}
          {t('footer.rights', 'All rights reserved.')}
        </div>
      </div>
    </footer>
  );
}