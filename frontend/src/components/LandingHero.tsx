import { Grid2X2, Home as HomeIcon, Clock3, CalendarDays, WalletCards, ChevronRight, Check } from 'lucide-react';

interface LandingHeroProps {
  onOpenDashboard: () => void;
}

export function LandingHero({ onOpenDashboard }: LandingHeroProps) {
  return (
    <section className="landing-hero" aria-label="Introduction">
      <div className="hero-container">
        <div className="hero-copy">
          <span className="hero-pill" role="text">One workspace for every workday</span>
          <h1>HR operations with <em>real-time</em> clarity.</h1>
          <p>Dayflow brings people, attendance, payroll, and everyday work into one calm, beautifully organized workspace.</p>
          <div className="hero-actions">
            <button className="hero-cta" onClick={onOpenDashboard}>
              Explore the workspace <ChevronRight size={16} />
            </button>
          </div>
        </div>
        
        <div className="hero-visual" aria-hidden="true">
          {/* Interactive/high-fidelity pure CSS Dashboard Mockup */}
          <div className="dashboard-mockup">
            <div className="mockup-chrome">
              <div className="chrome-dots">
                <span className="dot red" />
                <span className="dot yellow" />
                <span className="dot green" />
              </div>
              <div className="chrome-search">dayflow.co/workspace/alex</div>
            </div>
            <div className="mockup-frame">
              <div className="mockup-side">
                <div className="mockup-brand">
                  <div className="mockup-logo-mark"><Grid2X2 size={11} /></div>
                  <span>dayflow</span>
                </div>
                <div className="mockup-nav-group">
                  <span className="mockup-nav-item active"><HomeIcon size={12} /> Overview</span>
                  <span className="mockup-nav-item"><Clock3 size={12} /> Attendance</span>
                  <span className="mockup-nav-item"><CalendarDays size={12} /> Leave</span>
                  <span className="mockup-nav-item"><WalletCards size={12} /> Payroll</span>
                </div>
              </div>
              <div className="mockup-main">
                <div className="mockup-top-row">
                  <div>
                    <h6>Good morning, Alex</h6>
                    <span>October 24, 2024</span>
                  </div>
                  <div className="mockup-status-indicator">Present</div>
                </div>
                
                <div className="mockup-grid">
                  <div className="mockup-card card-attendance">
                    <span className="card-label">ON THE CLOCK</span>
                    <strong className="card-val">09:12 AM</strong>
                    <span className="card-sub">Working since 9:12</span>
                  </div>
                  <div className="mockup-card card-timeoff">
                    <span className="card-label">AVAILABLE LEAVE</span>
                    <strong className="card-val">14 Days</strong>
                    <span className="card-sub">Paid time off</span>
                  </div>
                </div>

                <div className="mockup-list-card">
                  <span className="card-label">TODAY'S EVENTS</span>
                  <div className="mockup-list-item">
                    <div className="item-left">
                      <span className="event-color peach" />
                      <strong>Design team sync</strong>
                    </div>
                    <span>11:30 AM</span>
                  </div>
                  <div className="mockup-list-item">
                    <div className="item-left">
                      <span className="event-color lilac" />
                      <strong>Q4 planning session</strong>
                    </div>
                    <span>03:00 PM</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Elegant floating status cards */}
          <div className="hero-float float-left">
            <strong>18</strong>
            <span>people online</span>
            <div className="float-dots">
              <span className="dot-live" />
              <span className="dot-live" />
              <span className="dot-live" />
              <span className="dot-live" />
            </div>
          </div>
          <div className="hero-float float-right">
            <div className="float-check"><Check size={13} /></div>
            <strong>96.4%</strong>
            <span>attendance rate</span>
          </div>
        </div>
      </div>
      
      <div className="hero-rule" />
    </section>
  );
}
