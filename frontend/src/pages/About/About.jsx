import { Link } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import aboutHeroImg from '../../assets/images/image.png';
import Footer from '../../components/Footer';
import {
  Users, Heart, Handshake, Sprout, Target, ShieldCheck, Users2,
  Leaf, Globe, Play, ArrowRight, HandHeart,
} from 'lucide-react';

/* ---------- decorative bits ---------- */

function DotGrid({ style }) {
  return (
    <svg width="90" height="70" viewBox="0 0 90 70" style={style}>
      {Array.from({ length: 4 }).map((_, row) =>
        Array.from({ length: 5 }).map((_, col) => (
          <circle key={`${row}-${col}`} cx={10 + col * 18} cy={10 + row * 18} r="3" fill="#93c5fd" />
        ))
      )}
    </svg>
  );
}

function LeafDoodle({ style, flip }) {
  return (
    <svg width="70" height="140" viewBox="0 0 70 140" style={{ ...style, transform: flip ? 'scaleX(-1)' : 'none' }}>
      <path
        d="M35 5 C 60 30, 60 90, 35 135 C 10 90, 10 30, 35 5 Z"
        fill="#bfdbfe" opacity="0.6"
      />
      <path d="M35 5 L35 135" stroke="#93c5fd" strokeWidth="2" opacity="0.5" />
    </svg>
  );
}

function TwoPeopleHeart({ style }) {
  return (
    <svg width="140" height="150" viewBox="0 0 140 150" style={style} fill="none">
      <circle cx="45" cy="20" r="16" fill="#dbeafe" />
      <circle cx="95" cy="20" r="16" fill="#dbeafe" />
      <path d="M30 150 C30 95, 50 75, 70 75 C90 75, 110 95, 110 150" stroke="#dbeafe" strokeWidth="14" fill="none" strokeLinecap="round" />
      <path
        d="M70 100 C 60 88, 40 92, 40 106 C 40 120, 70 138, 70 138 C 70 138, 100 120, 100 106 C 100 92, 80 88, 70 100 Z"
        fill="#eff6ff" stroke="#bfdbfe" strokeWidth="2"
      />
    </svg>
  );
}

/* ---------- floating icon badge ---------- */

function IconBadge({ icon: Icon, style }) {
  return (
    <div
      style={{
        position: 'absolute', width: 64, height: 64, borderRadius: 16,
        background: '#fff', boxShadow: '0 10px 25px rgba(37,99,235,0.18)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        ...style,
      }}
    >
      <Icon size={26} color="#2563eb" fill="#2563eb" fillOpacity={Icon === Users || Icon === Handshake ? 0 : 0.15} />
    </div>
  );
}

/* ---------- data ---------- */

const values = [
  { icon: Heart, title: 'Compassion', text: 'We care with all our hearts', iconBg: '#dbeafe', iconFg: '#2563eb' },
  { icon: ShieldCheck, title: 'Integrity', text: 'We are honest, transparent & accountable', iconBg: '#dbeafe', iconFg: '#2563eb' },
  { icon: Users2, title: 'Community', text: 'We believe in the power of togetherness', iconBg: '#dbeafe', iconFg: '#2563eb' },
  { icon: Leaf, title: 'Sustainability', text: 'We build a better tomorrow for future generations', iconBg: '#dbeafe', iconFg: '#2563eb' },
];

const stats = [
  { icon: Users, value: '10K+', label: 'Lives Impacted' },
  { icon: HandHeart, value: '250+', label: 'Projects Completed' },
  { icon: Users2, value: '500+', label: 'Volunteers' },
  { icon: Globe, value: '15+', label: 'Countries Reached' },
];

export default function About() {
  return (
    <>
      <Navbar />

      {/* Hero */}
      <section style={{
        position: 'relative', overflow: 'hidden',
        background: 'linear-gradient(160deg, #eff6ff 0%, #dbeafe 45%, #eef2ff 100%)',
        padding: '64px 20px 90px',
      }}>
        <DotGrid style={{ position: 'absolute', top: 90, left: '5%', opacity: 0.7 }} />
        <DotGrid style={{ position: 'absolute', top: 90, left: '38%', opacity: 0.4 }} />

        <div
          className="container"
          style={{
            position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center',
            gap: 50, flexWrap: 'wrap',
          }}
        >
          {/* Left copy */}
          <div style={{ flex: 1, minWidth: 320 }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              background: '#dbeafe', color: '#2563eb', fontWeight: 700, fontSize: 13,
              padding: '8px 16px', borderRadius: 20, letterSpacing: 0.5, marginBottom: 22,
            }}>
              <Users size={15} /> ABOUT US
            </div>

            <h1 style={{ fontSize: 46, fontWeight: 800, color: '#0f172a', lineHeight: 1.15, margin: 0 }}>
              About Our<br />
              <span style={{ color: '#2563eb' }}>Organization</span>
            </h1>
            <div style={{ width: 56, height: 4, borderRadius: 2, background: '#2563eb', margin: '18px 0 22px' }} />

            <p style={{ color: '#4b5563', fontSize: 16, lineHeight: 1.7, maxWidth: 480, marginBottom: 32 }}>
              We are a non-profit organization dedicated to making a positive impact in the lives
              of people. Through the power of kindness, generosity, and community, we create
              brighter tomorrows.
            </p>

            <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
              <Link
                to="/campaigns"
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 8,
                  background: 'linear-gradient(90deg, #2563eb, #1d4ed8)',
                  color: '#fff', fontWeight: 700, fontSize: 15,
                  padding: '14px 26px', borderRadius: 30, textDecoration: 'none',
                  boxShadow: '0 8px 20px rgba(37,99,235,0.3)',
                }}
              >
                <Heart size={17} fill="#fff" /> Join Us
              </Link>
              <button
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 8,
                  background: '#fff', color: '#2563eb', fontWeight: 700, fontSize: 15,
                  padding: '14px 26px', borderRadius: 30, border: '2px solid #2563eb',
                  cursor: 'pointer',
                }}
              >
                <Play size={16} fill="#2563eb" /> Watch Video
              </button>
            </div>
          </div>

          {/* Right photo with floating badges */}
          <div style={{ flex: 1, minWidth: 320, position: 'relative', display: 'flex', justifyContent: 'center' }}>
            <LeafDoodle style={{ position: 'absolute', left: -20, top: 40 }} />
            <LeafDoodle style={{ position: 'absolute', right: -20, top: 40 }} flip />

            <div
              style={{
                width: 380, height: 380, borderRadius: '50%',
                border: '2px solid #93c5fd', position: 'relative',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              <div style={{ width: 340, height: 340, borderRadius: '50%', overflow: 'hidden' }}>
                <img
                  src={aboutHeroImg}
                  alt="Children we support"
                  style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 30%' }}
                />
              </div>

              <IconBadge icon={HandHeart} style={{ top: -10, left: -10 }} />
              <IconBadge icon={Users} style={{ top: -10, right: -10 }} />
              <IconBadge icon={Handshake} style={{ bottom: -10, left: -10 }} />
              <IconBadge icon={Sprout} style={{ bottom: -10, right: -10 }} />
            </div>
          </div>
        </div>
      </section>

      {/* Mission + Values */}
      <section className="container" style={{ padding: '70px 20px' }}>
        <div style={{ display: 'flex', gap: 40, flexWrap: 'wrap', alignItems: 'stretch' }}>

          {/* Mission card */}
          <div
            style={{
              flex: '1 1 340px',
              position: 'relative',
              background: '#eff6ff',
              borderLeft: '5px solid #2563eb',
              borderRadius: 16,
              padding: '32px 30px',
              overflow: 'hidden',
            }}
          >
            <div style={{
              width: 46, height: 46, borderRadius: '50%', background: '#dbeafe',
              display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 18,
            }}>
              <Target size={22} color="#2563eb" />
            </div>
            <h3 style={{ margin: '0 0 14px', fontWeight: 800, color: '#0f172a', fontSize: 22 }}>Our Mission</h3>
            <p style={{ color: '#4b5563', lineHeight: 1.7, fontSize: 15, maxWidth: 320, marginBottom: 26 }}>
              To empower communities, support those in need, and build a better world through
              sustainable initiatives and compassionate care.
            </p>
            <button
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                background: '#fff', color: '#2563eb', fontWeight: 700, fontSize: 14,
                padding: '11px 20px', borderRadius: 24, border: '1px solid #bfdbfe', cursor: 'pointer',
              }}
            >
              Learn More <ArrowRight size={15} />
            </button>

            <TwoPeopleHeart style={{ position: 'absolute', right: -10, bottom: -10, opacity: 0.9 }} />
          </div>

          {/* Values */}
          <div style={{ flex: '2 1 500px' }}>
            <h3 style={{ margin: '0 0 26px', fontWeight: 800, color: '#0f172a', fontSize: 22 }}>Our Values</h3>
            <div style={{
              display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 24, marginBottom: 30,
            }}>
              {values.map((v) => {
                const Icon = v.icon;
                return (
                  <div key={v.title}>
                    <div style={{
                      width: 46, height: 46, borderRadius: '50%', background: v.iconBg,
                      display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14,
                    }}>
                      <Icon size={20} color={v.iconFg} />
                    </div>
                    <div style={{ fontWeight: 700, color: '#0f172a', fontSize: 15.5, marginBottom: 6 }}>{v.title}</div>
                    <p style={{ color: '#6b7280', fontSize: 13.5, lineHeight: 1.55, margin: 0 }}>{v.text}</p>
                  </div>
                );
              })}
            </div>

            {/* Stats bar */}
            <div
              style={{
                background: 'linear-gradient(90deg, #dbeafe 0%, #eff6ff 100%)',
                borderRadius: 16, padding: '26px 30px',
                display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 20,
              }}
            >
              {stats.map((s) => {
                const Icon = s.icon;
                return (
                  <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{
                      width: 44, height: 44, borderRadius: '50%', background: '#2563eb',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                    }}>
                      <Icon size={20} color="#fff" />
                    </div>
                    <div>
                      <div style={{ fontWeight: 800, color: '#1d4ed8', fontSize: 22, lineHeight: 1.1 }}>{s.value}</div>
                      <div style={{ color: '#374151', fontSize: 13 }}>{s.label}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}