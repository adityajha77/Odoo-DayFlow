import { Grid2X2 } from 'lucide-react';

interface LandingFooterProps {
  onOpenDashboard: () => void;
}

export function LandingFooter({ onOpenDashboard }: LandingFooterProps) {
  return (
    <footer className="landing-footer" id="contact" role="contentinfo">
      <div className="footer-grid">
        <div className="footer-brand-col">
          <a href="#" className="landing-brand" aria-label="Dayflow Home">
            <div className="brand-mark"><Grid2X2 size={17} /></div>
            <span>dayflow<span>.</span></span>
          </a>
          <p>Dayflow brings calm and efficiency to workplace management, attendance, leave planning, and payroll operations.</p>
        </div>
        <div className="footer-links-col">
          <h4>Product</h4>
          <nav aria-label="Footer Product links">
            <a href="#features">Features</a>
            <a href="#benefits">Benefits</a>
            <a href="#stories">Customer Stories</a>
          </nav>
        </div>
        <div className="footer-links-col">
          <h4>Resources</h4>
          <nav aria-label="Footer Resource links">
            <a href="#" onClick={(e) => { e.preventDefault(); onOpenDashboard(); }}>Overview</a>
            <a href="#" onClick={(e) => { e.preventDefault(); onOpenDashboard(); }}>My Tasks</a>
            <a href="#" onClick={(e) => { e.preventDefault(); onOpenDashboard(); }}>Profile</a>
          </nav>
        </div>
        <div className="footer-links-col">
          <h4>Support</h4>
          <nav aria-label="Footer Support links">
            <a href="#" onClick={(e) => { e.preventDefault(); }}>Help Center</a>
            <a href="#" onClick={(e) => { e.preventDefault(); }}>API Reference</a>
            <a href="#" onClick={(e) => { e.preventDefault(); }}>Status Page</a>
          </nav>
        </div>
      </div>
      <div className="footer-bottom">
        <span className="copyright">© 2026 Dayflow. Every workday, perfectly aligned.</span>
        <div className="footer-legal">
          <a href="#" onClick={(e) => e.preventDefault()}>Privacy Policy</a>
          <a href="#" onClick={(e) => e.preventDefault()}>Terms of Service</a>
        </div>
      </div>
    </footer>
  );
}
