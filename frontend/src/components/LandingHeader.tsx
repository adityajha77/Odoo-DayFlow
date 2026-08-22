import { Grid2X2, Moon, Sun, Monitor, Menu, X } from 'lucide-react';
import { useState } from 'react';

interface LandingHeaderProps {
  onOpenDashboard: () => void;
  theme: 'light' | 'dark' | 'system';
  setTheme: (t: 'light' | 'dark' | 'system') => void;
}

export function LandingHeader({ onOpenDashboard, theme, setTheme }: LandingHeaderProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  // Cycle theme: light -> dark -> system -> light
  const handleCycleTheme = () => {
    if (theme === 'light') {
      setTheme('dark');
    } else if (theme === 'dark') {
      setTheme('system');
    } else {
      setTheme('light');
    }
  };

  const getThemeIcon = () => {
    switch (theme) {
      case 'light':
        return <Sun size={16} />;
      case 'dark':
        return <Moon size={16} />;
      case 'system':
        return <Monitor size={16} />;
    }
  };

  const getThemeLabel = () => {
    switch (theme) {
      case 'light':
        return 'Theme: Light. Click to switch to Dark.';
      case 'dark':
        return 'Theme: Dark. Click to switch to System preference.';
      case 'system':
        return 'Theme: System. Click to switch to Light.';
    }
  };

  return (
    <header className="landing-header" role="banner">
      <nav className="landing-header-inner" aria-label="Main navigation">
        {/* Logo */}
        <a href="#" className="landing-brand" aria-label="Dayflow home">
          <div className="brand-mark">
            <Grid2X2 size={17} strokeWidth={2.6} />
          </div>
          <span className="brand-name">
            dayflow<span>.</span>
          </span>
        </a>

        {/* Desktop nav links */}
        <ul className="landing-nav-links" role="list">
          <li><a href="#features">Features</a></li>
          <li><a href="#benefits">Benefits</a></li>
          <li><a href="#stories">Stories</a></li>
          <li><a href="#contact">Contact</a></li>
        </ul>

        {/* Actions */}
        <div className="landing-nav-actions">
          <button
            className="theme-toggle-btn"
            onClick={handleCycleTheme}
            aria-label={getThemeLabel()}
            title={getThemeLabel()}
          >
            {getThemeIcon()}
          </button>

          <button className="landing-sign-in" onClick={onOpenDashboard}>
            Sign In
          </button>

          <button className="landing-get-started" onClick={onOpenDashboard}>
            Get Started
          </button>

          {/* Mobile hamburger */}
          <button
            className="landing-hamburger"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </nav>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="landing-mobile-menu" role="navigation" aria-label="Mobile navigation">
          <a href="#features" onClick={() => setMobileOpen(false)}>Features</a>
          <a href="#benefits" onClick={() => setMobileOpen(false)}>Benefits</a>
          <a href="#stories" onClick={() => setMobileOpen(false)}>Stories</a>
          <a href="#contact" onClick={() => setMobileOpen(false)}>Contact</a>
          <hr />
          <div className="mobile-menu-theme-row">
            <span>Theme: {theme}</span>
            <button
              className="theme-toggle-btn"
              onClick={handleCycleTheme}
              aria-label={getThemeLabel()}
            >
              {getThemeIcon()}
            </button>
          </div>
          <hr />
          <button className="landing-sign-in" onClick={() => { setMobileOpen(false); onOpenDashboard(); }}>
            Sign In
          </button>
          <button className="landing-get-started" onClick={() => { setMobileOpen(false); onOpenDashboard(); }}>
            Get Started
          </button>
        </div>
      )}
    </header>
  );
}
