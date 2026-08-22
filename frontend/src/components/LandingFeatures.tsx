interface LandingFeaturesProps {}

export function LandingFeatures({}: LandingFeaturesProps) {
  return (
    <section className="landing-section" id="features" aria-labelledby="features-title">
      <div className="section-intro">
        <span className="hero-pill">Everything in sync</span>
        <h2 id="features-title">A calmer way to run<br /><em>your workday.</em></h2>
        <p>Less switching. More doing. Dayflow gives your team a clear view of what matters now and what comes next.</p>
      </div>
      
      <div className="feature-bento">
        {/* Bento Card 1: Scheduling */}
        <div className="feature-panel feature-yellow">
          <span className="feature-tag">Smart scheduling</span>
          <h3>Make every hour<br />count.</h3>
          <p>Manage meetings, interviews, and focus time from one intelligent calendar.</p>
          <div className="schedule-list">
            <span><b>09:00</b> Team standup <i /></span>
            <span><b>11:30</b> Design review <i /></span>
            <span><b>14:00</b> Focus time <i /></span>
          </div>
        </div>
        
        {/* Bento Card 2: Attendance */}
        <div className="feature-panel feature-lilac">
          <span className="feature-tag">Attendance insights</span>
          <h3>Know how your<br />team is doing.</h3>
          <p>Real-time analytics for present, absent, and remote statuses.</p>
          <div className="feature-chart" aria-hidden="true">
            <span style={{ height: '40%' }} />
            <span style={{ height: '65%' }} />
            <span style={{ height: '50%' }} />
            <span style={{ height: '80%' }} />
            <span style={{ height: '60%' }} />
            <span style={{ height: '95%' }} />
            <span style={{ height: '75%' }} />
          </div>
          <div className="feature-numbers">
            <strong>95% <small>Present</small></strong>
            <strong>3% <small>On leave</small></strong>
            <strong>2% <small>Remote</small></strong>
          </div>
        </div>
        
        {/* Bento Card 3: Payroll */}
        <div className="feature-panel feature-mint">
          <span className="feature-tag">Payroll visibility</span>
          <h3>Compensation,<br />made simple.</h3>
          <p>Track earnings, salary history, and upcoming payouts at a glance.</p>
          <div className="payroll-chip">
            <span>Sarah Johnson</span>
            <strong>$4,800 <small>Processed</small></strong>
          </div>
          <div className="payroll-chip second">
            <span>Mika Davis</span>
            <strong>$5,500 <small>Pending</small></strong>
          </div>
        </div>
      </div>
    </section>
  );
}
