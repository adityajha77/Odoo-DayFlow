import { ChevronRight } from 'lucide-react';

interface LandingCTAProps {
  onOpenDashboard: () => void;
}

export function LandingCTA({ onOpenDashboard }: LandingCTAProps) {
  return (
    <section className="landing-cta" id="cta" aria-labelledby="cta-title">
      <div className="cta-content">
        <span className="hero-pill">Get Started</span>
        <h2 id="cta-title">Start flowing today.</h2>
        <p>Join the teams that run their daily HR operations with clarity, calm, and zero friction.</p>
        <div className="cta-actions">
          <button className="hero-cta" onClick={onOpenDashboard} aria-label="Explore Workspace Now">
            Explore Workspace Now <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </section>
  );
}
