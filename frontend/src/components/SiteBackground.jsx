import NetworkCanvas from './NetworkCanvas';

// Persistent, viewport-fixed background for the whole app — the animated
// node network sits behind every page and stays put while content
// scrolls over it, so it reads as one continuous "live" backdrop rather
// than a hero-only decoration. Mounted once in App.jsx so it never
// unmounts/restarts on route changes.
export default function SiteBackground() {
  return (
    <div className="fixed inset-0 -z-10 bg-ink-950 overflow-hidden">
      <div className="absolute inset-0 grid-overlay pointer-events-none" />
      <NetworkCanvas className="absolute inset-0 h-full w-full opacity-50" density={0.00006} />
      <div className="absolute inset-0 bg-gradient-to-b from-ink-950/10 via-transparent to-ink-950 pointer-events-none" />
    </div>
  );
}
