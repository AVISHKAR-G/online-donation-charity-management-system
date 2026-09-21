/**
 * Wraps a page's content in a full-bleed background image.
 *
 * Usage:
 *   import PageBackground from '../../components/PageBackground';
 *   import myBg from '../../assets/images/backgrounds/my-page-bg.jpg';
 *
 *   <PageBackground image={myBg}>
 *     <Navbar />
 *     ...page content...
 *     <Footer />
 *   </PageBackground>
 *
 * By default the image is fixed to the viewport (doesn't scroll with the
 * page) and covers the full width/height of the content behind it. Pass
 * `scroll` if you want it to scroll normally instead (e.g. for a page
 * that's much taller than one screen, where "fixed" can look odd).
 */
export default function PageBackground({
  image,
  children,
  scroll = false,
  overlay = null, // e.g. 'rgba(255,255,255,0.6)' to lighten the image behind content
  minHeight = '100vh',
}) {
  return (
    <div
      style={{
        position: 'relative',
        minHeight,
        backgroundImage: `url(${image})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: scroll ? 'scroll' : 'fixed',
      }}
    >
      {overlay && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: overlay,
            pointerEvents: 'none',
          }}
        />
      )}
      <div style={{ position: 'relative' }}>{children}</div>
    </div>
  );
}