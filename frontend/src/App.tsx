import { useEffect, useMemo, useState } from 'react';
import {
  Bell,
  CalendarDays,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CircleHelp,
  Clock3,
  FileText,
  Grid2X2,
  Home as HomeIcon,
  LayoutDashboard,
  ListChecks,
  LogOut,
  Menu,
  Moon,
  MoreHorizontal,
  PanelLeftClose,
  Plus,
  Search,
  Settings,
  ShieldCheck,
  Sun,
  UserRound,
  UsersRound,
  WalletCards,
  X,
} from 'lucide-react';
import './App.css';

type Page = 'Home' | 'Overview' | 'My tasks' | 'Attendance' | 'Leave' | 'Payroll' | 'People' | 'Profile';

type NavItem = { label: Page; icon: typeof LayoutDashboard };

const navItems: NavItem[] = [
  { label: 'Home', icon: HomeIcon },
  { label: 'Overview', icon: LayoutDashboard },
  { label: 'My tasks', icon: ListChecks },
  { label: 'Attendance', icon: Clock3 },
  { label: 'Leave', icon: CalendarDays },
  { label: 'Payroll', icon: WalletCards },
  { label: 'People', icon: UsersRound },
];

const activities = [
  { title: 'Checked in for the day', detail: 'Today at 09:12 AM', color: 'mint', icon: Check },
  { title: 'Leave request approved', detail: 'Yesterday at 04:36 PM', color: 'lilac', icon: CalendarDays },
  { title: 'Payslip is ready to view', detail: 'Monday at 11:20 AM', color: 'peach', icon: FileText },
];

const people = [
  { name: 'Maya Chen', role: 'Product Designer', initials: 'MC', tone: 'coral' },
  { name: 'Jordan Lee', role: 'Engineering', initials: 'JL', tone: 'blue' },
  { name: 'Priya Shah', role: 'Operations', initials: 'PS', tone: 'yellow' },
  { name: 'Noah Williams', role: 'Marketing', initials: 'NW', tone: 'green' },
];

function getGreeting(hour: number) {
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }).format(date);
}

function formatTime(date: Date) {
  return new Intl.DateTimeFormat('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' }).format(date);
}

function Avatar({ initials, tone = 'coral', small = false }: { initials: string; tone?: string; small?: boolean }) {
  return <span className={`avatar avatar-${tone} ${small ? 'avatar-small' : ''}`}>{initials}</span>;
}

function App() {
  const [activePage, setActivePage] = useState<Page>('Home');
  const [collapsed, setCollapsed] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [checkedIn, setCheckedIn] = useState(true);
  const [role, setRole] = useState<'Employee' | 'HR officer'>('Employee');
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [date, setDate] = useState(new Date());
  const [currentTime, setCurrentTime] = useState(new Date());
  const [toast, setToast] = useState('');

  useEffect(() => {
    const timer = window.setInterval(() => setCurrentTime(new Date()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!toast) return undefined;
    const timer = window.setTimeout(() => setToast(''), 2800);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const greeting = useMemo(() => getGreeting(currentTime.getHours()), [currentTime]);
  const formattedDate = useMemo(() => formatDate(date), [date]);

  const handleCheckIn = () => {
    const nextValue = !checkedIn;
    setCheckedIn(nextValue);
    setToast(nextValue ? 'Check-in recorded at ' + formatTime(currentTime) : 'You are checked out for today');
  };

  const changePage = (page: Page) => {
    setActivePage(page);
    setShowRoleMenu(false);
  };

  return (
    <div className={`app-shell ${darkMode ? 'theme-dark' : ''} ${activePage === 'Home' ? 'landing-shell' : ''}`}>
      <aside className={`sidebar ${collapsed ? 'sidebar-collapsed' : ''}`}>
        <div className="brand-row">
          <div className="brand-mark"><Grid2X2 size={17} strokeWidth={2.6} /></div>
          {!collapsed && <span className="brand-name">dayflow<span>.</span></span>}
          <button className="icon-button sidebar-toggle" onClick={() => setCollapsed(!collapsed)} aria-label="Toggle sidebar">
            {collapsed ? <Menu size={18} /> : <PanelLeftClose size={18} />}
          </button>
        </div>

        {!collapsed && <div className="workspace-switch"><div className="workspace-dot">D</div><div><strong>Dayflow HQ</strong><span>Workspace</span></div><ChevronDown size={15} /></div>}

        <div className="nav-section-label">Workspace</div>
        <nav className="main-nav">
          {navItems.map(({ label, icon: Icon }) => (
            <button key={label} className={`nav-item ${activePage === label ? 'nav-item-active' : ''}`} onClick={() => changePage(label)} title={collapsed ? label : undefined}>
              <Icon size={18} strokeWidth={activePage === label ? 2.4 : 1.9} />
              {!collapsed && <span>{label}</span>}
              {!collapsed && label === 'Leave' && <span className="nav-count">2</span>}
              {!collapsed && label === 'My tasks' && <span className="nav-count task-count">3</span>}
            </button>
          ))}
        </nav>

        <div className="nav-section-label nav-section-spaced">Manage</div>
        <nav className="main-nav">
          <button className={`nav-item ${activePage === 'Profile' ? 'nav-item-active' : ''}`} onClick={() => changePage('Profile')} title={collapsed ? 'Profile' : undefined}><UserRound size={18} /><span className={collapsed ? 'sr-only' : ''}>My profile</span></button>
          <button className="nav-item" onClick={() => setToast('Settings are ready for your workspace')} title={collapsed ? 'Settings' : undefined}><Settings size={18} /><span className={collapsed ? 'sr-only' : ''}>Settings</span></button>
        </nav>

        <div className="sidebar-bottom">
          {!collapsed && <div className="help-card"><div className="help-icon"><CircleHelp size={17} /></div><div><strong>Need a hand?</strong><span>Visit our help center</span></div><ChevronRight size={15} /></div>}
          <button className={`account-card ${collapsed ? 'account-card-collapsed' : ''}`} onClick={() => changePage('Profile')}><Avatar initials="AS" tone="ink" small />{!collapsed && <span><strong>Alex Smith</strong><small>Employee</small></span>} {!collapsed && <MoreHorizontal size={17} />}</button>
        </div>
      </aside>

      <main className="main-area">
        <header className="topbar">
          <div className="mobile-brand"><div className="brand-mark"><Grid2X2 size={16} /></div><span>dayflow<span>.</span></span></div>
          <div className="breadcrumbs"><span>Workspace</span><ChevronRight size={14} /><strong>{activePage}</strong></div>
          <div className="topbar-actions">
            <label className="search-box"><Search size={17} /><input placeholder="Search anything" /><kbd>⌘ K</kbd></label>
            <div className="topbar-divider" />
            <div className="role-wrap"><button className="role-button" onClick={() => setShowRoleMenu(!showRoleMenu)}><ShieldCheck size={16} /><span>{role}</span><ChevronDown size={14} /></button>{showRoleMenu && <div className="role-menu"><span className="menu-label">Preview as</span>{(['Employee', 'HR officer'] as const).map((item) => <button key={item} onClick={() => { setRole(item); setToast(`${item} view selected`); setShowRoleMenu(false); }}>{item}{role === item && <Check size={15} />}</button>)}</div>}</div>
            <button className="icon-button notification-button" onClick={() => setShowNotifications(!showNotifications)} aria-label="Notifications"><Bell size={18} /><span className="notification-dot" /></button>
            {showNotifications && <div className="notification-popover"><div className="popover-heading"><strong>Notifications</strong><span>3 new</span></div><p><span className="tiny-dot mint-dot" /> Your leave request was approved</p><p><span className="tiny-dot blue-dot" /> New payslip is available</p><p><span className="tiny-dot peach-dot" /> Team meeting starts in 30 min</p></div>}
            <button className="theme-button" onClick={() => setDarkMode(!darkMode)} aria-label="Toggle theme">{darkMode ? <Sun size={17} /> : <Moon size={17} />}</button>
            <button className="top-avatar" onClick={() => changePage('Profile')}><Avatar initials="AS" tone="ink" /></button>
          </div>
        </header>

        {activePage === 'Home' ? <Home onOpenDashboard={() => changePage('Overview')} /> : activePage === 'Overview' ? <Dashboard greeting={greeting} formattedDate={formattedDate} currentTime={currentTime} checkedIn={checkedIn} handleCheckIn={handleCheckIn} date={date} setDate={setDate} role={role} setToast={setToast} /> : activePage === 'Profile' ? <Profile setToast={setToast} /> : activePage === 'My tasks' ? <TaskPage setToast={setToast} /> : <PlaceholderPage page={activePage} role={role} setToast={setToast} />}
      </main>
      {toast && <div className="toast"><div className="toast-check"><Check size={15} /></div>{toast}<button onClick={() => setToast('')}><X size={14} /></button></div>}
    </div>
  );
}

function Home({ onOpenDashboard }: { onOpenDashboard: () => void }) {
  return <div className="landing-page">
    <section className="landing-hero">
      <div className="landing-nav"><div className="landing-brand"><div className="brand-mark"><Grid2X2 size={17} /></div><span>dayflow<span>.</span></span></div><div className="landing-links"><a href="#features">Features</a><a href="#benefits">Benefits</a><a href="#stories">Stories</a><a href="#contact">Contact</a></div><div className="landing-nav-actions"><button className="landing-ghost" onClick={onOpenDashboard}>Sign in</button><button className="landing-dark" onClick={onOpenDashboard}>Open workspace <ChevronRight size={15} /></button></div></div>
      <div className="hero-copy"><span className="hero-pill">One workspace for every workday</span><h1>HR operations with <em>real-time</em> clarity.</h1><p>Dayflow brings people, attendance, payroll, and everyday work into one calm, beautifully organized workspace.</p><button className="hero-cta" onClick={onOpenDashboard}>Explore the workspace <ChevronRight size={16} /></button></div>
      <div className="hero-visual"><div className="hero-float float-left"><strong>18</strong><span>people online</span><div className="float-dots"><i /><i /><i /><i /></div></div><div className="hero-image-frame"><img src="https://images.pexels.com/photos/8117466/pexels-photo-8117466.jpeg?auto=compress&cs=tinysrgb&h=650&w=940" alt="Dayflow workspace preview" /></div><div className="hero-float float-right"><div className="float-check"><Check size={13} /></div><strong>96.4%</strong><span>attendance rate</span></div></div>
      <div className="hero-rule" />
    </section>
    <section className="landing-section" id="features"><div className="section-intro"><span className="hero-pill">Everything in sync</span><h2>A calmer way to run<br /><em>your workday.</em></h2><p>Less switching. More doing. Dayflow gives your team a clear view of what matters now and what comes next.</p></div><div className="feature-bento"><div className="feature-panel feature-yellow"><span className="feature-tag">Smart scheduling</span><h3>Make every hour<br />count.</h3><p>Manage meetings, interviews, and focus time from one intelligent calendar.</p><div className="schedule-list"><span><b>09:00</b> Team standup <i /></span><span><b>11:30</b> Design review <i /></span><span><b>14:00</b> Focus time <i /></span></div></div><div className="feature-panel feature-lilac"><span className="feature-tag">Attendance insights</span><h3>Know how your<br />team is doing.</h3><div className="feature-chart"><span /><span /><span /><span /><span /><span /><span /></div><div className="feature-numbers"><strong>95% <small>Present</small></strong><strong>3% <small>On leave</small></strong><strong>2% <small>Remote</small></strong></div></div><div className="feature-panel feature-mint"><span className="feature-tag">Payroll visibility</span><h3>Compensation,<br />made simple.</h3><div className="payroll-chip"><span>Sarah Johnson</span><strong>$4,800 <small>Processed</small></strong></div><div className="payroll-chip second"><span>Mika Davis</span><strong>$5,500 <small>Pending</small></strong></div></div></div></section>
    <section className="landing-proof" id="benefits"><div><span className="hero-pill">Built for people teams</span><h2>Good work happens<br /><em>when things flow.</em></h2></div><div className="proof-stats"><div><strong>2.4k+</strong><span>teams organized</span></div><div><strong>34%</strong><span>less admin time</span></div><div><strong>4.9/5</strong><span>team satisfaction</span></div></div></section>
    <section className="landing-stories" id="stories"><div className="section-intro"><span className="hero-pill">People success stories</span><h2>Made to feel<br /><em>effortless.</em></h2></div><div className="story-grid"><div className="story-card"><span className="quote-mark">“</span><p>Dayflow gives us the clarity to care about our people, not chase spreadsheets.</p><div><Avatar initials="JS" tone="blue" small /><span><strong>Jamie Smith</strong><small>Head of People, Triply</small></span></div></div><div className="story-card story-card-peach"><span className="quote-mark">“</span><p>The instant performance insights help us make better decisions without adding more process.</p><div><Avatar initials="JA" tone="yellow" small /><span><strong>Jordan Adams</strong><small>People Ops, Affine</small></span></div></div></div></section>
    <footer className="landing-footer" id="contact"><div className="landing-brand"><div className="brand-mark"><Grid2X2 size={17} /></div><span>dayflow<span>.</span></span></div><p>Every workday, perfectly aligned.</p><div className="footer-links"><a href="#features">Features</a><a href="#benefits">Benefits</a><a href="#contact">Contact</a></div><span className="copyright">© 2026 Dayflow</span></footer>
  </div>;
}

function Dashboard({ greeting, formattedDate, currentTime, checkedIn, handleCheckIn, date, setDate, role, setToast }: { greeting: string; formattedDate: string; currentTime: Date; checkedIn: boolean; handleCheckIn: () => void; date: Date; setDate: (date: Date) => void; role: string; setToast: (message: string) => void }) {
  const moveDate = (days: number) => { const next = new Date(date); next.setDate(next.getDate() + days); setDate(next); };
  return <div className="page-content">
    <section className="welcome-row"><div><div className="eyebrow"><span className="status-pulse" /> Thursday, October 24, 2024</div><h1>{greeting}, Alex <span className="wave-mark">✦</span></h1><p>Here is what is happening with your workday today.</p></div><div className="welcome-actions"><button className="outline-button"><CalendarDays size={16} /> This week <ChevronDown size={14} /></button><button className="primary-button" onClick={() => setToast('New leave request started')}><Plus size={17} /> Request time off</button></div></section>

    <section className="hero-grid">
      <div className="checkin-card card-surface"><div className="card-topline"><div><span className="soft-label">TODAY'S ATTENDANCE</span><h2>{checkedIn ? 'You are on the clock' : 'Your day is complete'}</h2></div><div className={`live-status ${checkedIn ? 'live' : 'offline'}`}><span /> {checkedIn ? 'Present' : 'Checked out'}</div></div><div className="clock-row"><div className="big-clock">{formatTime(currentTime)}</div><div className="clock-meta"><span>Thursday, October 24</span><strong>{checkedIn ? 'Working since 09:12 AM' : 'See you tomorrow'}</strong></div></div><div className="checkin-footer"><div className="hours-progress"><div className="hours-header"><span>Today's progress</span><strong>{checkedIn ? '06h 18m' : '08h 00m'}</strong></div><div className="progress-track"><span style={{ width: checkedIn ? '74%' : '100%' }} /></div><div className="hours-caption"><span>09:00 AM</span><span>06:00 PM</span></div></div><button className={`checkin-button ${checkedIn ? 'checkout-button' : ''}`} onClick={handleCheckIn}>{checkedIn ? 'Check out' : 'Check in'} <ChevronRight size={16} /></button></div></div>
      <div className="calendar-card card-surface"><div className="card-topline"><div><span className="soft-label">YOUR SCHEDULE</span><h2>October 2024</h2></div><div className="calendar-arrows"><button onClick={() => moveDate(-30)}><ChevronLeft size={16} /></button><button onClick={() => moveDate(30)}><ChevronRight size={16} /></button></div></div><div className="mini-calendar"><div className="weekdays">{['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'].map(day => <span key={day}>{day}</span>)}</div><div className="calendar-days">{Array.from({ length: 31 }, (_, index) => <button className={index + 1 === date.getDate() ? 'selected-day' : ''} key={index} onClick={() => { const next = new Date(date); next.setDate(index + 1); setDate(next); }}>{index + 1}</button>)}</div></div><div className="calendar-note"><span className="event-mark" /><div><strong>Design team sync</strong><span>Today · 11:30 AM – 12:00 PM</span></div><MoreHorizontal size={16} /></div></div>
    </section>

    <section className="stats-grid"><StatCard icon={<Clock3 size={18} />} label="Attendance rate" value="96.4%" detail="+2.4% this month" tone="mint" graph="line" /><StatCard icon={<CalendarDays size={18} />} label="Paid time off" value="14 days" detail="of 20 days available" tone="lilac" graph="ring" /><StatCard icon={<WalletCards size={18} />} label="Next payday" value="Nov 01" detail="7 days from now" tone="peach" graph="calendar" /><StatCard icon={<UsersRound size={18} />} label="Team availability" value="18 / 24" detail="people online today" tone="blue" graph="people" /></section>

    <section className="bottom-grid"><div className="activity-card card-surface"><div className="section-header"><div><span className="soft-label">YOUR WORKDAY</span><h2>Recent activity</h2></div><button className="text-button" onClick={() => setToast('Showing all recent activity')}>View all <ChevronRight size={15} /></button></div><div className="activity-list">{activities.map(({ title, detail, color, icon: Icon }) => <div className="activity-item" key={title}><div className={`activity-icon ${color}`}><Icon size={16} /></div><div className="activity-copy"><strong>{title}</strong><span>{detail}</span></div><span className="activity-arrow"><ChevronRight size={16} /></span></div>)}</div></div><div className="team-card card-surface"><div className="section-header"><div><span className="soft-label">PEOPLE AT DAYFLOW</span><h2>Team today</h2></div><button className="more-button"><MoreHorizontal size={18} /></button></div><div className="team-summary"><div className="avatar-stack">{people.map(person => <Avatar key={person.initials} initials={person.initials} tone={person.tone} small />)}<span className="more-avatars">+14</span></div><div><strong>18 teammates</strong><span>are active today</span></div></div><div className="people-list">{people.slice(0, 3).map(person => <div className="person-row" key={person.name}><Avatar initials={person.initials} tone={person.tone} small /><div><strong>{person.name}</strong><span>{person.role}</span></div><span className="online-dot" /></div>)}</div><button className="full-link" onClick={() => setToast(`Opening ${role === 'HR officer' ? 'employee directory' : 'your team'}`)}>See everyone <ChevronRight size={15} /></button></div></section>
  </div>;
}

function TaskBoard({ setToast }: { setToast: (message: string) => void }) {
  const [completed, setCompleted] = useState<number[]>([1]);
  const tasks = [
    ['09:00 – 10:00 AM', 'Review Q4 product brief', 'High'],
    ['10:30 – 11:00 AM', 'Design team sync', 'Medium'],
    ['01:30 – 02:30 PM', 'Prepare research summary', 'Low'],
    ['03:00 – 04:00 PM', 'Share homepage concepts', 'Medium'],
  ];
  const toggleTask = (index: number) => { setCompleted(completed.includes(index) ? completed.filter(item => item !== index) : [...completed, index]); setToast(completed.includes(index) ? 'Task marked as open' : 'Task marked as complete'); };
  return <section className="task-board card-surface"><div className="task-board-heading"><div><span className="soft-label">YOUR DAY AT A GLANCE</span><h2>My tasks</h2><p>Keep your priorities moving forward.</p></div><div className="task-heading-actions"><span className="task-progress">{completed.length} of {tasks.length} complete</span><button className="primary-button" onClick={() => setToast('New task started')}><Plus size={15} /> Add task</button></div></div><div className="task-list">{tasks.map(([time, title, priority], index) => <button className={`task-row ${completed.includes(index) ? 'task-complete' : ''}`} key={title} onClick={() => toggleTask(index)}><span className="task-check">{completed.includes(index) && <Check size={13} />}</span><span className="task-time">{time}</span><strong>{title}</strong><span className={`priority priority-${priority.toLowerCase()}`}>{priority}</span><ChevronRight size={15} /></button>)}</div></section>;
}

function TaskPage({ setToast }: { setToast: (message: string) => void }) { return <div className="page-content task-page"><section className="profile-heading"><div><div className="eyebrow"><ListChecks size={15} /> Personal workspace</div><h1>My tasks</h1><p>Your workday, broken into clear next steps.</p></div><button className="primary-button" onClick={() => setToast('New task started')}><Plus size={17} /> Add task</button></section><TaskBoard setToast={setToast} /></div>; }

function StatCard({ icon, label, value, detail, tone, graph }: { icon: React.ReactNode; label: string; value: string; detail: string; tone: string; graph: string }) {
  return <div className={`stat-card stat-${tone}`}><div className="stat-header"><span className="stat-icon">{icon}</span><MoreHorizontal size={17} className="stat-more" /></div><span className="stat-label">{label}</span><strong className="stat-value">{value}</strong><span className="stat-detail">{detail}</span>{graph === 'line' && <div className="mini-line"><span /><span /><span /><span /><span /></div>}{graph === 'ring' && <div className="mini-ring"><span>70%</span></div>}{graph === 'calendar' && <div className="mini-calendar-icon"><span>OCT</span><strong>01</strong></div>}{graph === 'people' && <div className="mini-bars"><span /><span /><span /><span /><span /><span /></div>}</div>;
}

function Profile({ setToast }: { setToast: (message: string) => void }) {
  return <div className="page-content profile-page"><section className="profile-heading"><div><div className="eyebrow"><UserRound size={15} /> Personal workspace</div><h1>My profile</h1><p>Keep your personal and work information up to date.</p></div><button className="primary-button" onClick={() => setToast('Profile editing is ready')}>Edit profile <Settings size={16} /></button></section><section className="profile-hero card-surface"><div className="cover-art"><div className="cover-orb orb-one" /><div className="cover-orb orb-two" /><div className="cover-grid" /></div><div className="profile-identity"><Avatar initials="AS" tone="ink" /><div><h2>Alex Smith</h2><p>Product Designer <span>•</span> Design team</p><div className="identity-tags"><span>Full-time</span><span>Since Mar 2022</span></div></div><button className="circle-edit" onClick={() => setToast('Profile photo picker opened')}><Settings size={16} /></button></div></section><section className="profile-grid"><div className="info-card card-surface"><div className="section-header"><div><span className="soft-label">ABOUT YOU</span><h2>Personal details</h2></div><button className="small-edit" onClick={() => setToast('Personal details editing is ready')}>Edit</button></div><div className="details-grid"><Detail label="Full name" value="Alex Smith" /><Detail label="Work email" value="alex.smith@dayflow.co" /><Detail label="Phone number" value="+1 (415) 555-0182" /><Detail label="Location" value="San Francisco, CA" /></div></div><div className="info-card card-surface"><div className="section-header"><div><span className="soft-label">YOUR ROLE</span><h2>Job & organization</h2></div><button className="small-edit" onClick={() => setToast('Job details are managed by HR')}>View</button></div><div className="details-grid"><Detail label="Employee ID" value="DF-02481" /><Detail label="Reporting to" value="Olivia Parker" /><Detail label="Department" value="Design & Product" /><Detail label="Work location" value="Hybrid · San Francisco" /></div></div><div className="documents-card card-surface"><div className="section-header"><div><span className="soft-label">SECURE FILES</span><h2>Documents</h2></div><button className="circle-add" onClick={() => setToast('Document upload started')}><Plus size={17} /></button></div><div className="document-row"><div className="document-icon mint"><FileText size={18} /></div><div><strong>Employment contract</strong><span>PDF · Updated Mar 18, 2022</span></div><button className="download-button" onClick={() => setToast('Opening employment contract')}>Open</button></div><div className="document-row"><div className="document-icon lilac"><ShieldCheck size={18} /></div><div><strong>Tax certificate 2024</strong><span>PDF · Updated Jan 08, 2024</span></div><button className="download-button" onClick={() => setToast('Opening tax certificate')}>Open</button></div></div></section></div>;
}

function Detail({ label, value }: { label: string; value: string }) { return <div className="detail"><span>{label}</span><strong>{value}</strong></div>; }

function PlaceholderPage({ page, role, setToast }: { page: Page; role: string; setToast: (message: string) => void }) {
  const descriptions: Record<string, string> = { Attendance: 'Track your hours and keep an eye on the team pulse.', Leave: 'Plan time away without losing sight of your balance.', Payroll: 'Everything you need to understand your compensation.', People: 'A clear view of the people who make Dayflow work.' };
  return <div className="page-content placeholder-page"><section className="profile-heading"><div><div className="eyebrow"><span className="status-pulse" /> {role} workspace</div><h1>{page}</h1><p>{descriptions[page]}</p></div><button className="primary-button" onClick={() => setToast(`New ${page.toLowerCase()} action started`)}><Plus size={17} /> Add new</button></section><div className="placeholder-hero card-surface"><div className="placeholder-icon"><ListChecks size={28} /></div><h2>Your {page.toLowerCase()} workspace is ready.</h2><p>This view is designed to grow with your team. Use the action above to start a new workflow.</p><button className="outline-button" onClick={() => setToast('Dashboard view opened')}>Return to overview <ChevronRight size={16} /></button></div></div>;
}

export default App;
