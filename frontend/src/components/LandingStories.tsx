interface AvatarProps {
  initials: string;
  tone?: string;
  small?: boolean;
}

function LocalAvatar({ initials, tone = 'coral', small = false }: AvatarProps) {
  return (
    <span className={`avatar avatar-${tone} ${small ? 'avatar-small' : ''}`}>
      {initials}
    </span>
  );
}

interface LandingStoriesProps {}

export function LandingStories({}: LandingStoriesProps) {
  return (
    <>
      {/* Benefits Section */}
      <section className="landing-proof" id="benefits" aria-labelledby="benefits-title">
        <div>
          <span className="hero-pill">Built for people teams</span>
          <h2 id="benefits-title">Good work happens<br /><em>when things flow.</em></h2>
        </div>
        <div className="proof-stats">
          <div>
            <strong>2.4k+</strong>
            <span>teams organized</span>
          </div>
          <div>
            <strong>34%</strong>
            <span>less admin time</span>
          </div>
          <div>
            <strong>4.9/5</strong>
            <span>team satisfaction</span>
          </div>
        </div>
      </section>

      {/* Stories Section */}
      <section className="landing-stories" id="stories" aria-labelledby="stories-title">
        <div className="section-intro">
          <span className="hero-pill">People success stories</span>
          <h2 id="stories-title">Made to feel<br /><em>effortless.</em></h2>
        </div>
        <div className="story-grid">
          <div className="story-card">
            <span className="quote-mark" aria-hidden="true">“</span>
            <p>Dayflow gives us the clarity to care about our people, not chase spreadsheets.</p>
            <div className="story-author">
              <LocalAvatar initials="JS" tone="blue" small />
              <span>
                <strong>Jamie Smith</strong>
                <small>Head of People, Triply</small>
              </span>
            </div>
          </div>
          <div className="story-card story-card-peach">
            <span className="quote-mark" aria-hidden="true">“</span>
            <p>The instant performance insights help us make better decisions without adding more process.</p>
            <div className="story-author">
              <LocalAvatar initials="JA" tone="yellow" small />
              <span>
                <strong>Jordan Adams</strong>
                <small>People Ops, Affine</small>
              </span>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
