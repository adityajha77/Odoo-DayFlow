import React, { useEffect, useMemo, useState } from 'react';
import { LandingHeader } from './components/LandingHeader';
import { LandingHero } from './components/LandingHero';
import { LandingFeatures } from './components/LandingFeatures';
import { LandingStories } from './components/LandingStories';
import { LandingCTA } from './components/LandingCTA';
import { LandingFooter } from './components/LandingFooter';
import {
  ArrowLeft,
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
  Trash2,
  UserRound,
  UsersRound,
  WalletCards,
  X,
} from 'lucide-react';
import './App.css';

const API_BASE_URL = 'http://localhost:5000/api';

export type UserRole = 'ADMIN' | 'EMPLOYEE' | 'HR_OFFICER';

export interface UserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  gender: string; // 'Male' | 'Female' | 'Other' | 'Prefer not to say'
  roleTitle: string;
  department: string;
  role: UserRole;
  avatarTone: string;
  profileCompleted: boolean;
}

export interface TaskItem {
  id: string;
  title: string;
  time: string;
  priority: 'High' | 'Medium' | 'Low';
  completed: boolean;
}

type Page = 'Home' | 'Overview' | 'My tasks' | 'Attendance' | 'Leave' | 'Payroll' | 'People' | 'Profile';

type NavItem = { label: Page; icon: typeof LayoutDashboard; adminOnly?: boolean };

const allNavItems: NavItem[] = [
  { label: 'Home', icon: HomeIcon },
  { label: 'Overview', icon: LayoutDashboard },
  { label: 'My tasks', icon: ListChecks },
  { label: 'Attendance', icon: Clock3 },
  { label: 'Leave', icon: CalendarDays },
  { label: 'Payroll', icon: WalletCards, adminOnly: true },
  { label: 'People', icon: UsersRound, adminOnly: true },
];

const initialTasks: TaskItem[] = [
  { id: '1', title: 'Review Q4 product brief', time: '09:00 – 10:00 AM', priority: 'High', completed: false },
  { id: '2', title: 'Design team sync', time: '10:30 – 11:00 AM', priority: 'Medium', completed: true },
  { id: '3', title: 'Prepare research summary', time: '01:30 – 02:30 PM', priority: 'Low', completed: false },
  { id: '4', title: 'Share homepage concepts', time: '03:00 – 04:00 PM', priority: 'Medium', completed: false },
];

const activities = [
  { title: 'Checked in for the day', detail: 'Today at 09:12 AM', color: 'mint', icon: Check },
  { title: 'Leave request approved', detail: 'Yesterday at 04:36 PM', color: 'lilac', icon: CalendarDays },
  { title: 'Payslip is ready to view', detail: 'Monday at 11:20 AM', color: 'peach', icon: FileText },
];

const teamPeople = [
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

function getInitials(firstName?: string, lastName?: string) {
  if (!firstName && !lastName) return 'DF';
  const f = firstName ? firstName[0] : '';
  const l = lastName ? lastName[0] : '';
  return (f + l).toUpperCase() || 'DF';
}

function Avatar({ initials, tone = 'coral', small = false }: { initials: string; tone?: string; small?: boolean }) {
  return <span className={`avatar avatar-${tone} ${small ? 'avatar-small' : ''}`}>{initials}</span>;
}

function App() {
  const [authToken, setAuthToken] = useState<string | null>(() => localStorage.getItem('dayflow_token'));
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem('dayflow_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [tasks, setTasks] = useState<TaskItem[]>(() => {
    const saved = localStorage.getItem('dayflow_tasks');
    return saved ? JSON.parse(saved) : initialTasks;
  });

  const [activePage, setActivePage] = useState<Page>('Home');
  const [collapsed, setCollapsed] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [checkedIn, setCheckedIn] = useState(true);
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [date, setDate] = useState(new Date());
  const [currentTime, setCurrentTime] = useState(new Date());
  const [toast, setToast] = useState('');

  // Modals
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showOnboardingModal, setShowOnboardingModal] = useState(false);
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);

  // Sync token & user from backend database if token exists
  useEffect(() => {
    if (authToken) {
      localStorage.setItem('dayflow_token', authToken);
      fetch(`${API_BASE_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${authToken}` },
      })
        .then(res => res.json())
        .then(data => {
          if (data.success && data.user) {
            setCurrentUser(data.user);
            localStorage.setItem('dayflow_user', JSON.stringify(data.user));
          }
        })
        .catch(() => { });
    } else {
      localStorage.removeItem('dayflow_token');
      localStorage.removeItem('dayflow_user');
    }
  }, [authToken]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('dayflow_user', JSON.stringify(currentUser));
    }
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('dayflow_tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    const timer = window.setInterval(() => setCurrentTime(new Date()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!toast) return undefined;
    const timer = window.setTimeout(() => setToast(''), 2800);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const pendingTasksCount = useMemo(() => tasks.filter(t => !t.completed).length, [tasks]);
  const greeting = useMemo(() => getGreeting(currentTime.getHours()), [currentTime]);
  const formattedDate = useMemo(() => formatDate(date), [date]);

  const navItems = useMemo(() => {
    if (!currentUser) return allNavItems.filter(i => i.label === 'Home');
    if (currentUser.role === 'ADMIN' || currentUser.role === 'HR_OFFICER') return allNavItems;
    return allNavItems.filter(i => !i.adminOnly);
  }, [currentUser]);

  const handleCheckIn = () => {
    const nextValue = !checkedIn;
    setCheckedIn(nextValue);
    setToast(nextValue ? 'Check-in recorded at ' + formatTime(currentTime) : 'You are checked out for today');
  };

  const changePage = (page: Page) => {
    if (!currentUser && page !== 'Home') {
      setShowAuthModal(true);
      return;
    }
    setActivePage(page);
    setShowRoleMenu(false);
  };

  const handleOpenWorkspace = () => {
    if (currentUser && authToken) {
      setActivePage('Overview');
    } else {
      setShowAuthModal(true);
    }
  };

  const handleLoginSuccess = (token: string, user: UserProfile) => {
    setAuthToken(token);
    setCurrentUser(user);
    setShowAuthModal(false);
    setActivePage('Overview');
    setToast(`Welcome back, ${user.firstName}! Signed in as ${user.role}`);
  };

  const handleLogout = () => {
    setAuthToken(null);
    setCurrentUser(null);
    setActivePage('Home');
    setToast('Logged out successfully');
  };

  const handleToggleTask = (id: string) => {
    setTasks(prev =>
      prev.map(t => {
        if (t.id === id) {
          const nextState = !t.completed;
          setToast(nextState ? 'Task marked as completed' : 'Task marked as open');
          return { ...t, completed: nextState };
        }
        return t;
      })
    );
  };

  const handleDeleteTask = (id: string) => {
    const taskToDelete = tasks.find(t => t.id === id);
    setTasks(prev => prev.filter(t => t.id !== id));
    setToast(`Deleted task "${taskToDelete?.title || ''}"`);
  };

  const handleAddTask = (newTask: { title: string; time: string; priority: 'High' | 'Medium' | 'Low' }) => {
    const created: TaskItem = {
      id: Date.now().toString(),
      title: newTask.title,
      time: newTask.time || 'Today',
      priority: newTask.priority,
      completed: false,
    };
    setTasks(prev => [created, ...prev]);
    setShowAddTaskModal(false);
    setToast('New task added successfully');
  };

  const handleSaveProfile = (updatedProfile: Partial<UserProfile>) => {
    if (!currentUser) return;
    const updated = {
      ...currentUser,
      ...updatedProfile,
      profileCompleted: true,
    };
    setCurrentUser(updated);
    setShowOnboardingModal(false);
    setToast(`Profile updated! Welcome ${updated.firstName}.`);
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

        {!collapsed && (
          <div className="workspace-switch">
            <div className="workspace-dot">D</div>
            <div>
              <strong>Dayflow HQ</strong>
              <span>{currentUser?.role === 'ADMIN' ? 'Admin Workspace' : 'Employee Workspace'}</span>
            </div>
            <ChevronDown size={15} />
          </div>
        )}

        <div className="nav-section-label">Workspace</div>
        <nav className="main-nav">
          {navItems.map(({ label, icon: Icon }) => (
            <button key={label} className={`nav-item ${activePage === label ? 'nav-item-active' : ''}`} onClick={() => changePage(label)} title={collapsed ? label : undefined}>
              <Icon size={18} strokeWidth={activePage === label ? 2.4 : 1.9} />
              {!collapsed && <span>{label}</span>}
              {!collapsed && label === 'Leave' && <span className="nav-count">2</span>}
              {!collapsed && label === 'My tasks' && <span className="nav-count task-count">{pendingTasksCount}</span>}
            </button>
          ))}
        </nav>

        <div className="nav-section-label nav-section-spaced">Manage</div>
        <nav className="main-nav">
          <button className={`nav-item ${activePage === 'Profile' ? 'nav-item-active' : ''}`} onClick={() => changePage('Profile')} title={collapsed ? 'Profile' : undefined}>
            <UserRound size={18} />
            <span className={collapsed ? 'sr-only' : ''}>My profile</span>
          </button>
          <button className="nav-item" onClick={() => setToast('Settings are ready for your workspace')} title={collapsed ? 'Settings' : undefined}>
            <Settings size={18} />
            <span className={collapsed ? 'sr-only' : ''}>Settings</span>
          </button>
        </nav>

        <div className="sidebar-bottom">
          {!collapsed && (
            <div className="help-card">
              <div className="help-icon"><CircleHelp size={17} /></div>
              <div><strong>Need a hand?</strong><span>Visit help center</span></div>
              <ChevronRight size={15} />
            </div>
          )}

          {currentUser ? (
            <div className="account-menu-wrap" style={{ position: 'relative' }}>
              <button className={`account-card ${collapsed ? 'account-card-collapsed' : ''}`} onClick={() => changePage('Profile')}>
                <Avatar initials={getInitials(currentUser.firstName, currentUser.lastName)} tone={currentUser.avatarTone} small />
                {!collapsed && (
                  <span>
                    <strong>{currentUser.firstName} {currentUser.lastName}</strong>
                    <small className={`user-role-badge ${currentUser.role === 'ADMIN' ? 'role-badge-admin' : 'role-badge-employee'}`}>
                      {currentUser.role}
                    </small>
                  </span>
                )}
                {!collapsed && <MoreHorizontal size={17} />}
              </button>
              {!collapsed && (
                <button className="logout-item" onClick={handleLogout} style={{ marginTop: '6px' }}>
                  <LogOut size={15} /> Sign out
                </button>
              )}
            </div>
          ) : (
            <button className="primary-button" style={{ width: '100%' }} onClick={() => setShowAuthModal(true)}>
              Sign In
            </button>
          )}
        </div>
      </aside>

      <main className="main-area">
        <header className="topbar">
          <div className="mobile-brand">
            <div className="brand-mark"><Grid2X2 size={16} /></div>
            <span>dayflow<span>.</span></span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {activePage !== 'Home' && (
              <button className="back-button" onClick={() => setActivePage('Home')}>
                <ArrowLeft size={14} /> Back to Home
              </button>
            )}
            <div className="breadcrumbs">
              <span>Workspace</span>
              <ChevronRight size={14} />
              <strong>{activePage}</strong>
            </div>
          </div>

          <div className="topbar-actions">
            {currentUser && (
              <span className="pending-badge" title="Pending tasks">
                <ListChecks size={14} /> {pendingTasksCount} Pending Tasks
              </span>
            )}
            <label className="search-box">
              <Search size={17} />
              <input placeholder="Search anything" />
              <kbd>⌘ K</kbd>
            </label>
            <div className="topbar-divider" />

            {currentUser ? (
              <div className="role-wrap">
                <button className="role-button" onClick={() => setShowRoleMenu(!showRoleMenu)}>
                  <ShieldCheck size={16} />
                  <span>{currentUser.role === 'ADMIN' ? 'Admin Access' : 'Employee View'}</span>
                  <ChevronDown size={14} />
                </button>
                {showRoleMenu && (
                  <div className="role-menu">
                    <span className="menu-label">Switch Role Profile</span>
                    <button onClick={() => { setCurrentUser({ ...currentUser, role: 'EMPLOYEE' }); setShowRoleMenu(false); }}>
                      Employee View {currentUser.role === 'EMPLOYEE' && <Check size={15} />}
                    </button>
                    <button onClick={() => { setCurrentUser({ ...currentUser, role: 'ADMIN' }); setShowRoleMenu(false); }}>
                      Admin Access {currentUser.role === 'ADMIN' && <Check size={15} />}
                    </button>
                    <div style={{ height: '1px', background: 'var(--line)', margin: '6px 0' }} />
                    <button onClick={() => { setShowOnboardingModal(true); setShowRoleMenu(false); }}>
                      Edit Profile / Gender
                    </button>
                    <button onClick={handleLogout} style={{ color: '#ef4444' }}>
                      <LogOut size={14} /> Sign out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button className="primary-button" onClick={() => setShowAuthModal(true)}>Sign In</button>
            )}

            <button className="icon-button notification-button" onClick={() => setShowNotifications(!showNotifications)} aria-label="Notifications">
              <Bell size={18} />
              <span className="notification-dot" />
            </button>
            {showNotifications && (
              <div className="notification-popover">
                <div className="popover-heading"><strong>Notifications</strong><span>3 new</span></div>
                <p><span className="tiny-dot mint-dot" /> Leave request approved</p>
                <p><span className="tiny-dot blue-dot" /> New payslip available</p>
                <p><span className="tiny-dot peach-dot" /> Team meeting in 30m</p>
              </div>
            )}

            <button className="theme-button" onClick={() => setDarkMode(!darkMode)} aria-label="Toggle theme">
              {darkMode ? <Sun size={17} /> : <Moon size={17} />}
            </button>

            {currentUser && (
              <button className="top-avatar" onClick={() => changePage('Profile')}>
                <Avatar initials={getInitials(currentUser.firstName, currentUser.lastName)} tone={currentUser.avatarTone} />
              </button>
            )}
          </div>
        </header>

        {activePage === 'Home' ? (
          <Home onOpenWorkspace={handleOpenWorkspace} onSignIn={() => setShowAuthModal(true)} />
        ) : activePage === 'Overview' ? (
          <Dashboard
            user={currentUser}
            greeting={greeting}
            formattedDate={formattedDate}
            currentTime={currentTime}
            checkedIn={checkedIn}
            handleCheckIn={handleCheckIn}
            date={date}
            setDate={setDate}
            tasks={tasks}
            pendingTasksCount={pendingTasksCount}
            onToggleTask={handleToggleTask}
            onDeleteTask={handleDeleteTask}
            onOpenAddTask={() => setShowAddTaskModal(true)}
            onBackToHome={() => setActivePage('Home')}
            setToast={setToast}
          />
        ) : activePage === 'Profile' ? (
          <Profile user={currentUser} onOpenEdit={() => setShowOnboardingModal(true)} onBackToHome={() => setActivePage('Home')} setToast={setToast} />
        ) : activePage === 'My tasks' ? (
          <TaskPage
            tasks={tasks}
            pendingTasksCount={pendingTasksCount}
            onToggleTask={handleToggleTask}
            onDeleteTask={handleDeleteTask}
            onOpenAddTask={() => setShowAddTaskModal(true)}
            onBackToHome={() => setActivePage('Home')}
            setToast={setToast}
          />
        ) : (
          <PlaceholderPage page={activePage} role={currentUser?.role || 'EMPLOYEE'} onBackToHome={() => setActivePage('Home')} setToast={setToast} />
        )}
      </main>

      {/* Auth Modal */}
      {showAuthModal && (
        <AuthModal
          onClose={() => setShowAuthModal(false)}
          onLoginSuccess={handleLoginSuccess}
        />
      )}

      {/* Onboarding / Edit Profile Modal */}
      {showOnboardingModal && currentUser && (
        <OnboardingModal
          user={currentUser}
          onClose={() => setShowOnboardingModal(false)}
          onSave={handleSaveProfile}
        />
      )}

      {/* Add Task Modal */}
      {showAddTaskModal && (
        <AddTaskModal
          onClose={() => setShowAddTaskModal(false)}
          onAdd={handleAddTask}
        />
      )}

      {toast && (
        <div className="toast">
          <div className="toast-check"><Check size={15} /></div>
          {toast}
          <button onClick={() => setToast('')}><X size={14} /></button>
        </div>
      )}
    </div>
  );
}

/* === Landing Component === */
function Home({ onOpenWorkspace, onSignIn }: { onOpenWorkspace: () => void; onSignIn: () => void }) {
  return (
    <div className="landing-page" role="main">
      <LandingHeader onOpenDashboard={onOpenWorkspace} theme="light" setTheme={() => {}} />
      <LandingHero onOpenDashboard={onOpenWorkspace} />
      <LandingFeatures />
      <LandingStories />
      <LandingCTA onOpenDashboard={onOpenWorkspace} />
      <LandingFooter />
    </div>
  );
}

/* === Dashboard Component === */
function Dashboard({
  user,
  greeting,
  formattedDate,
  currentTime,
  checkedIn,
  handleCheckIn,
  date,
  setDate,
  tasks,
  pendingTasksCount,
  onToggleTask,
  onDeleteTask,
  onOpenAddTask,
  onBackToHome,
  setToast,
}: {
  user: UserProfile | null;
  greeting: string;
  formattedDate: string;
  currentTime: Date;
  checkedIn: boolean;
  handleCheckIn: () => void;
  date: Date;
  setDate: (date: Date) => void;
  tasks: TaskItem[];
  pendingTasksCount: number;
  onToggleTask: (id: string) => void;
  onDeleteTask: (id: string) => void;
  onOpenAddTask: () => void;
  onBackToHome: () => void;
  setToast: (message: string) => void;
}) {
  const moveDate = (days: number) => {
    const next = new Date(date);
    next.setDate(next.getDate() + days);
    setDate(next);
  };

  const displayName = user ? user.firstName : 'User';

  return (
    <div className="page-content">
      <div style={{ marginBottom: '16px' }}>
        <button className="back-button" onClick={onBackToHome}>
          <ArrowLeft size={14} /> Back to Home Page
        </button>
      </div>

      <section className="welcome-row">
        <div>
          <div className="eyebrow">
            <span className="status-pulse" /> {formattedDate}
            {user && (
              <span className={`user-role-badge ${user.role === 'ADMIN' ? 'role-badge-admin' : 'role-badge-employee'}`}>
                {user.role} ACCESS
              </span>
            )}
          </div>
          <h1>{greeting}, {displayName} <span className="wave-mark">✦</span></h1>
          <p>Here is what is happening with your workday today.</p>
        </div>
        <div className="welcome-actions">
          <button className="outline-button"><CalendarDays size={16} /> This week <ChevronDown size={14} /></button>
          <button className="primary-button" onClick={() => setToast('New leave request started')}><Plus size={17} /> Request time off</button>
        </div>
      </section>

      <section className="hero-grid">
        <div className="checkin-card card-surface">
          <div className="card-topline">
            <div>
              <span className="soft-label">TODAY'S ATTENDANCE</span>
              <h2>{checkedIn ? 'You are on the clock' : 'Your day is complete'}</h2>
            </div>
            <div className={`live-status ${checkedIn ? 'live' : 'offline'}`}>
              <span /> {checkedIn ? 'Present' : 'Checked out'}
            </div>
          </div>
          <div className="clock-row">
            <div className="big-clock">{formatTime(currentTime)}</div>
            <div className="clock-meta">
              <span>{formattedDate}</span>
              <strong>{checkedIn ? 'Working since 09:12 AM' : 'See you tomorrow'}</strong>
            </div>
          </div>
          <div className="checkin-footer">
            <div className="hours-progress">
              <div className="hours-header"><span>Today's progress</span><strong>{checkedIn ? '06h 18m' : '08h 00m'}</strong></div>
              <div className="progress-track"><span style={{ width: checkedIn ? '74%' : '100%' }} /></div>
              <div className="hours-caption"><span>09:00 AM</span><span>06:00 PM</span></div>
            </div>
            <button className={`checkin-button ${checkedIn ? 'checkout-button' : ''}`} onClick={handleCheckIn}>
              {checkedIn ? 'Check out' : 'Check in'} <ChevronRight size={16} />
            </button>
          </div>
        </div>

        <div className="calendar-card card-surface">
          <div className="card-topline">
            <div><span className="soft-label">YOUR SCHEDULE</span><h2>October 2024</h2></div>
            <div className="calendar-arrows">
              <button onClick={() => moveDate(-30)}><ChevronLeft size={16} /></button>
              <button onClick={() => moveDate(30)}><ChevronRight size={16} /></button>
            </div>
          </div>
          <div className="mini-calendar">
            <div className="weekdays">{['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'].map(day => <span key={day}>{day}</span>)}</div>
            <div className="calendar-days">
              {Array.from({ length: 31 }, (_, index) => (
                <button className={index + 1 === date.getDate() ? 'selected-day' : ''} key={index} onClick={() => { const next = new Date(date); next.setDate(index + 1); setDate(next); }}>
                  {index + 1}
                </button>
              ))}
            </div>
          </div>
          <div className="calendar-note">
            <span className="event-mark" />
            <div><strong>Design team sync</strong><span>Today · 11:30 AM – 12:00 PM</span></div>
            <MoreHorizontal size={16} />
          </div>
        </div>
      </section>

      <section className="stats-grid">
        <StatCard icon={<Clock3 size={18} />} label="Attendance rate" value="96.4%" detail="+2.4% this month" tone="mint" graph="line" />
        <StatCard icon={<CalendarDays size={18} />} label="Pending Tasks" value={`${pendingTasksCount}`} detail={`${tasks.length - pendingTasksCount} completed`} tone="lilac" graph="ring" />
        <StatCard icon={<WalletCards size={18} />} label="Next payday" value="Nov 01" detail="7 days from now" tone="peach" graph="calendar" />
        <StatCard icon={<UsersRound size={18} />} label="Team availability" value="18 / 24" detail="people online today" tone="blue" graph="people" />
      </section>

      <section className="bottom-grid">
        <div className="activity-card card-surface">
          <div className="section-header">
            <div><span className="soft-label">YOUR WORKDAY</span><h2>Recent activity</h2></div>
            <button className="text-button" onClick={() => setToast('Showing all recent activity')}>View all <ChevronRight size={15} /></button>
          </div>
          <div className="activity-list">
            {activities.map(({ title, detail, color, icon: Icon }) => (
              <div className="activity-item" key={title}>
                <div className={`activity-icon ${color}`}><Icon size={16} /></div>
                <div className="activity-copy"><strong>{title}</strong><span>{detail}</span></div>
                <span className="activity-arrow"><ChevronRight size={16} /></span>
              </div>
            ))}
          </div>
        </div>

        <div className="team-card card-surface">
          <div className="section-header">
            <div><span className="soft-label">PEOPLE AT DAYFLOW</span><h2>Team today</h2></div>
            <button className="more-button"><MoreHorizontal size={18} /></button>
          </div>
          <div className="team-summary">
            <div className="avatar-stack">
              {teamPeople.map(person => <Avatar key={person.initials} initials={person.initials} tone={person.tone} small />)}
              <span className="more-avatars">+14</span>
            </div>
            <div><strong>18 teammates</strong><span>are active today</span></div>
          </div>
          <div className="people-list">
            {user && (
              <div className="person-row" key="user-row">
                <Avatar initials={getInitials(user.firstName, user.lastName)} tone={user.avatarTone} small />
                <div><strong>{user.firstName} {user.lastName} (You)</strong><span>{user.roleTitle}</span></div>
                <span className="online-dot" />
              </div>
            )}
            {teamPeople.slice(0, 2).map(person => (
              <div className="person-row" key={person.name}>
                <Avatar initials={person.initials} tone={person.tone} small />
                <div><strong>{person.name}</strong><span>{person.role}</span></div>
                <span className="online-dot" />
              </div>
            ))}
          </div>
          <button className="full-link" onClick={() => setToast('Opening your team')}>See everyone <ChevronRight size={15} /></button>
        </div>
      </section>

      <TaskBoard
        tasks={tasks}
        pendingTasksCount={pendingTasksCount}
        onToggleTask={onToggleTask}
        onDeleteTask={onDeleteTask}
        onOpenAddTask={onOpenAddTask}
      />
    </div>
  );
}

/* === Task Board Component === */
function TaskBoard({
  tasks,
  pendingTasksCount,
  onToggleTask,
  onDeleteTask,
  onOpenAddTask,
}: {
  tasks: TaskItem[];
  pendingTasksCount: number;
  onToggleTask: (id: string) => void;
  onDeleteTask: (id: string) => void;
  onOpenAddTask: () => void;
}) {
  return (
    <section className="task-board card-surface">
      <div className="task-board-heading">
        <div>
          <span className="soft-label">YOUR DAY AT A GLANCE</span>
          <h2>My Tasks</h2>
          <p>Keep your priorities moving forward cleanly.</p>
        </div>
        <div className="task-heading-actions">
          <span className="task-progress">{tasks.length - pendingTasksCount} of {tasks.length} complete • <b style={{ color: '#d97706' }}>{pendingTasksCount} pending</b></span>
          <button className="primary-button" onClick={onOpenAddTask}><Plus size={15} /> Add task</button>
        </div>
      </div>
      <div className="task-layout">
        <div className="task-list">
          {tasks.length === 0 ? (
            <div style={{ padding: '30px', textAlign: 'center', color: 'var(--muted)', fontSize: '13px' }}>
              No tasks found. Click "Add task" above to create one!
            </div>
          ) : (
            tasks.map(task => (
              <div className={`task-row ${task.completed ? 'task-complete' : ''}`} key={task.id}>
                <button
                  className="task-check"
                  onClick={() => onToggleTask(task.id)}
                  aria-label={task.completed ? 'Mark incomplete' : 'Mark complete'}
                >
                  {task.completed && <Check size={13} />}
                </button>
                <span className="task-time">{task.time}</span>
                <strong>{task.title}</strong>
                <span className={`priority priority-${task.priority.toLowerCase()}`}>{task.priority}</span>
                <button
                  className="task-delete-btn"
                  onClick={() => onDeleteTask(task.id)}
                  title="Remove task"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))
          )}
        </div>
        <div className="task-image">
          <img src="https://images.pexels.com/photos/7428211/pexels-photo-7428211.jpeg?auto=compress&cs=tinysrgb&h=650&w=940" alt="Task planning preview" />
        </div>
      </div>
    </section>
  );
}

function TaskPage({
  tasks,
  pendingTasksCount,
  onToggleTask,
  onDeleteTask,
  onOpenAddTask,
  onBackToHome,
  setToast,
}: {
  tasks: TaskItem[];
  pendingTasksCount: number;
  onToggleTask: (id: string) => void;
  onDeleteTask: (id: string) => void;
  onOpenAddTask: () => void;
  onBackToHome: () => void;
  setToast: (message: string) => void;
}) {
  return (
    <div className="page-content task-page">
      <div style={{ marginBottom: '16px' }}>
        <button className="back-button" onClick={onBackToHome}>
          <ArrowLeft size={14} /> Back to Home Page
        </button>
      </div>

      <section className="profile-heading">
        <div>
          <div className="eyebrow"><ListChecks size={15} /> Workspace Tasks</div>
          <h1>My Tasks & Workflow</h1>
          <p>Manage your daily deliverables, add tasks, and remove completed work.</p>
        </div>
        <button className="primary-button" onClick={onOpenAddTask}><Plus size={17} /> Add new task</button>
      </section>
      <TaskBoard
        tasks={tasks}
        pendingTasksCount={pendingTasksCount}
        onToggleTask={onToggleTask}
        onDeleteTask={onDeleteTask}
        onOpenAddTask={onOpenAddTask}
      />
    </div>
  );
}

function StatCard({ icon, label, value, detail, tone, graph }: { icon: React.ReactNode; label: string; value: string; detail: string; tone: string; graph: string }) {
  return (
    <div className={`stat-card stat-${tone}`}>
      <div className="stat-header"><span className="stat-icon">{icon}</span><MoreHorizontal size={17} className="stat-more" /></div>
      <span className="stat-label">{label}</span>
      <strong className="stat-value">{value}</strong>
      <span className="stat-detail">{detail}</span>
      {graph === 'line' && <div className="mini-line"><span /><span /><span /><span /><span /></div>}
      {graph === 'ring' && <div className="mini-ring"><span>{value}</span></div>}
      {graph === 'calendar' && <div className="mini-calendar-icon"><span>NOV</span><strong>01</strong></div>}
      {graph === 'people' && <div className="mini-bars"><span /><span /><span /><span /><span /><span /></div>}
    </div>
  );
}

/* === Profile Component === */
function Profile({
  user,
  onOpenEdit,
  onBackToHome,
  setToast,
}: {
  user: UserProfile | null;
  onOpenEdit: () => void;
  onBackToHome: () => void;
  setToast: (message: string) => void;
}) {
  if (!user) {
    return (
      <div className="page-content">
        <h2>Please Sign In to view your profile.</h2>
      </div>
    );
  }

  return (
    <div className="page-content profile-page">
      <div style={{ marginBottom: '16px' }}>
        <button className="back-button" onClick={onBackToHome}>
          <ArrowLeft size={14} /> Back to Home Page
        </button>
      </div>

      <section className="profile-heading">
        <div>
          <div className="eyebrow"><UserRound size={15} /> Personal workspace</div>
          <h1>My profile</h1>
          <p>Keep your personal and work information up to date.</p>
        </div>
        <button className="primary-button" onClick={onOpenEdit}>
          Edit profile / Gender <Settings size={16} />
        </button>
      </section>

      <section className="profile-hero card-surface">
        <div className="cover-art"><div className="cover-orb orb-one" /><div className="cover-orb orb-two" /><div className="cover-grid" /></div>
        <div className="profile-identity">
          <Avatar initials={getInitials(user.firstName, user.lastName)} tone={user.avatarTone} />
          <div>
            <h2>{user.firstName} {user.lastName}</h2>
            <p>{user.roleTitle} <span>•</span> {user.department}</p>
            <div className="identity-tags">
              <span className={`user-role-badge ${user.role === 'ADMIN' ? 'role-badge-admin' : 'role-badge-employee'}`}>
                {user.role}
              </span>
              <span>Gender: {user.gender}</span>
              <span>Full-time</span>
            </div>
          </div>
          <button className="circle-edit" onClick={onOpenEdit} title="Edit Profile Details">
            <Settings size={16} />
          </button>
        </div>
      </section>

      <section className="profile-grid">
        <div className="info-card card-surface">
          <div className="section-header">
            <div><span className="soft-label">ABOUT YOU</span><h2>Personal details</h2></div>
            <button className="small-edit" onClick={onOpenEdit}>Edit</button>
          </div>
          <div className="details-grid">
            <Detail label="First name" value={user.firstName} />
            <Detail label="Last name" value={user.lastName} />
            <Detail label="Gender" value={user.gender} />
            <Detail label="Work email" value={user.email} />
          </div>
        </div>

        <div className="info-card card-surface">
          <div className="section-header">
            <div><span className="soft-label">YOUR ROLE</span><h2>Job & organization</h2></div>
            <button className="small-edit" onClick={onOpenEdit}>Update</button>
          </div>
          <div className="details-grid">
            <Detail label="Role title" value={user.roleTitle} />
            <Detail label="Department" value={user.department} />
            <Detail label="System Access" value={user.role === 'ADMIN' ? 'Full Admin Access' : 'Limited Employee Access'} />
            <Detail label="Work location" value="Hybrid · San Francisco HQ" />
          </div>
        </div>

        <div className="documents-card card-surface">
          <div className="section-header">
            <div><span className="soft-label">SECURE FILES</span><h2>Documents</h2></div>
            <button className="circle-add" onClick={() => setToast('Document upload started')}><Plus size={17} /></button>
          </div>
          <div className="document-row">
            <div className="document-icon mint"><FileText size={18} /></div>
            <div><strong>Employment contract</strong><span>PDF · Updated Mar 18, 2022</span></div>
            <button className="download-button" onClick={() => setToast('Opening employment contract')}>Open</button>
          </div>
        </div>
      </section>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="detail">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function PlaceholderPage({ page, role, onBackToHome, setToast }: { page: Page; role: UserRole; onBackToHome: () => void; setToast: (message: string) => void }) {
  const descriptions: Record<string, string> = {
    Attendance: 'Track your hours and keep an eye on team pulse.',
    Leave: 'Plan time away without losing sight of balance.',
    Payroll: 'Admin & Employee compensation overview.',
    People: 'Directory of all employees and company departments.',
  };
  return (
    <div className="page-content placeholder-page">
      <div style={{ marginBottom: '16px' }}>
        <button className="back-button" onClick={onBackToHome}>
          <ArrowLeft size={14} /> Back to Home Page
        </button>
      </div>

      <section className="profile-heading">
        <div>
          <div className="eyebrow"><span className="status-pulse" /> {role} workspace</div>
          <h1>{page}</h1>
          <p>{descriptions[page]}</p>
        </div>
        <button className="primary-button" onClick={() => setToast(`New ${page.toLowerCase()} action started`)}><Plus size={17} /> Add new</button>
      </section>
      <div className="placeholder-hero card-surface">
        <div className="placeholder-icon"><ListChecks size={28} /></div>
        <h2>Your {page.toLowerCase()} workspace is ready.</h2>
        <p>This view is configured for {role} access level.</p>
        <button className="outline-button" onClick={onBackToHome}>Return to Home Page <ChevronRight size={16} /></button>
      </div>
    </div>
  );
}

/* === Auth Modal with Login & Register (HR / Admin vs Employee) === */
function AuthModal({
  onClose,
  onLoginSuccess,
}: {
  onClose: () => void;
  onLoginSuccess: (token: string, user: UserProfile) => void;
}) {
  const [tab, setTab] = useState<'LOGIN' | 'SIGNUP'>('LOGIN');
  const [role, setRole] = useState<UserRole>('EMPLOYEE');

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [gender, setGender] = useState('Male');
  const [roleTitle, setRoleTitle] = useState('');
  const [department, setDepartment] = useState('Engineering');

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Invalid login credentials.');
      }
      onLoginSuccess(data.token, data.user);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to connect to authentication backend.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE_URL}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password,
          firstName,
          lastName,
          gender,
          role,
          roleTitle: roleTitle || (role === 'ADMIN' ? 'HR Director & Admin' : 'Employee Specialist'),
          department,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to create account.');
      }
      onLoginSuccess(data.token, data.user);
    } catch (err: any) {
      setErrorMsg(err.message || 'Server signup error.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = (demoRole: UserRole) => {
    const demoUser: UserProfile = {
      id: demoRole === 'ADMIN' ? 'admin_demo' : 'emp_demo',
      email: demoRole === 'ADMIN' ? 'admin@dayflow.co' : 'alex.smith@dayflow.co',
      firstName: demoRole === 'ADMIN' ? 'Sarah' : 'Alex',
      lastName: demoRole === 'ADMIN' ? 'Connor' : 'Smith',
      gender: demoRole === 'ADMIN' ? 'Female' : 'Male',
      roleTitle: demoRole === 'ADMIN' ? 'HR Admin & Manager' : 'Product Designer',
      department: demoRole === 'ADMIN' ? 'People Operations' : 'Product & Design',
      role: demoRole,
      avatarTone: demoRole === 'ADMIN' ? 'ink' : 'coral',
      profileCompleted: true,
    };
    onLoginSuccess('demo_jwt_token_2026', demoUser);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-box" style={{ maxWidth: '520px' }}>
        <div className="modal-header">
          <h2>{tab === 'LOGIN' ? 'Sign In to Dayflow' : 'Create Workspace Account'}</h2>
          <button className="modal-close" onClick={onClose}><X size={18} /></button>
        </div>

        <div style={{ display: 'flex', borderBottom: '1px solid var(--line)', padding: '0 24px' }}>
          <button
            style={{
              padding: '12px 16px',
              border: 0,
              borderBottom: tab === 'LOGIN' ? '2px solid #2c9a75' : '2px solid transparent',
              background: 'transparent',
              color: tab === 'LOGIN' ? 'var(--ink)' : 'var(--muted)',
              fontWeight: 700,
              fontSize: '13px',
              cursor: 'pointer',
            }}
            onClick={() => { setTab('LOGIN'); setErrorMsg(''); }}
          >
            Sign In (Login)
          </button>
          <button
            style={{
              padding: '12px 16px',
              border: 0,
              borderBottom: tab === 'SIGNUP' ? '2px solid #2c9a75' : '2px solid transparent',
              background: 'transparent',
              color: tab === 'SIGNUP' ? 'var(--ink)' : 'var(--muted)',
              fontWeight: 700,
              fontSize: '13px',
              cursor: 'pointer',
            }}
            onClick={() => { setTab('SIGNUP'); setErrorMsg(''); }}
          >
            Register (Sign Up)
          </button>
        </div>

        <div className="modal-body">
          {errorMsg && (
            <div style={{ padding: '10px 14px', borderRadius: '8px', background: '#fee2e2', color: '#991b1b', fontSize: '12px' }}>
              {errorMsg}
            </div>
          )}

          {tab === 'LOGIN' ? (
            <form onSubmit={handleLogin} style={{ display: 'grid', gap: '14px' }}>
              <div className="form-group">
                <label>Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="name@dayflow.co"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Password</label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                />
              </div>

              <button type="submit" disabled={loading} className="primary-button" style={{ marginTop: '6px', padding: '12px' }}>
                {loading ? 'Authenticating...' : 'Sign In with Password'}
              </button>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', margin: '8px 0' }}>
                <div style={{ flex: 1, height: '1px', background: 'var(--line)' }} />
                <span style={{ fontSize: '10px', color: 'var(--faint)', fontWeight: 600 }}>OR QUICK ACCESS DEMO</span>
                <div style={{ flex: 1, height: '1px', background: 'var(--line)' }} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <button
                  type="button"
                  className="outline-button"
                  onClick={() => handleQuickDemo('ADMIN')}
                >
                  <ShieldCheck size={15} /> Demo Admin
                </button>
                <button
                  type="button"
                  className="outline-button"
                  onClick={() => handleQuickDemo('EMPLOYEE')}
                >
                  <UserRound size={15} /> Demo Employee
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleSignup} style={{ display: 'grid', gap: '14px' }}>
              <div className="form-group">
                <label>Register As (Role Selection) *</label>
                <div className="role-tabs">
                  <button
                    type="button"
                    className={`role-tab ${role === 'ADMIN' ? 'active' : ''}`}
                    onClick={() => setRole('ADMIN')}
                  >
                    HR / Admin
                    <span>Full workspace access</span>
                  </button>
                  <button
                    type="button"
                    className={`role-tab ${role === 'EMPLOYEE' ? 'active' : ''}`}
                    onClick={() => setRole('EMPLOYEE')}
                  >
                    Employee
                    <span>Specific daily work</span>
                  </button>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>First Name *</label>
                  <input
                    required
                    placeholder="e.g. Maya"
                    value={firstName}
                    onChange={e => setFirstName(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>Last Name</label>
                  <input
                    placeholder="e.g. Chen"
                    value={lastName}
                    onChange={e => setLastName(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Gender *</label>
                <div className="gender-options">
                  {['Male', 'Female', 'Other', 'Prefer not to say'].map(g => (
                    <button
                      key={g}
                      type="button"
                      className={`gender-option ${gender === g ? 'selected' : ''}`}
                      onClick={() => setGender(g)}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label>Email Address *</label>
                <input
                  type="email"
                  required
                  placeholder="e.g. maya@dayflow.co"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Password *</label>
                <input
                  type="password"
                  required
                  placeholder="At least 6 characters"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Job Title</label>
                  <input
                    placeholder={role === 'ADMIN' ? 'HR Manager' : 'Software Engineer'}
                    value={roleTitle}
                    onChange={e => setRoleTitle(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>Department</label>
                  <select value={department} onChange={e => setDepartment(e.target.value)}>
                    <option value="Engineering">Engineering</option>
                    <option value="Product & Design">Product & Design</option>
                    <option value="People Operations / HR">People Operations / HR</option>
                    <option value="Operations">Operations</option>
                    <option value="Marketing & Sales">Marketing & Sales</option>
                  </select>
                </div>
              </div>

              <button type="submit" disabled={loading} className="primary-button" style={{ marginTop: '6px', padding: '12px' }}>
                {loading ? 'Creating Account...' : 'Register & Save to Database'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

function OnboardingModal({
  user,
  onClose,
  onSave,
}: {
  user: UserProfile;
  onClose: () => void;
  onSave: (data: Partial<UserProfile>) => void;
}) {
  const [firstName, setFirstName] = useState(user.firstName || '');
  const [lastName, setLastName] = useState(user.lastName || '');
  const [gender, setGender] = useState(user.gender || 'Prefer not to say');
  const [roleTitle, setRoleTitle] = useState(user.roleTitle || 'Product Specialist');
  const [department, setDepartment] = useState(user.department || 'Product & Design');
  const [avatarTone, setAvatarTone] = useState(user.avatarTone || 'coral');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName.trim()) return;
    onSave({
      firstName,
      lastName,
      gender,
      roleTitle,
      department,
      avatarTone,
    });
  };

  return (
    <div className="modal-overlay">
      <div className="modal-box">
        <div className="modal-header">
          <h2>Update Profile & Gender</h2>
          <button className="modal-close" onClick={onClose}><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-row">
              <div className="form-group">
                <label>First Name *</label>
                <input
                  required
                  value={firstName}
                  onChange={e => setFirstName(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>Last Name</label>
                <input
                  value={lastName}
                  onChange={e => setLastName(e.target.value)}
                />
              </div>
            </div>

            <div className="form-group">
              <label>Gender *</label>
              <div className="gender-options">
                {['Male', 'Female', 'Other', 'Prefer not to say'].map(g => (
                  <button
                    key={g}
                    type="button"
                    className={`gender-option ${gender === g ? 'selected' : ''}`}
                    onClick={() => setGender(g)}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Job Title</label>
                <input
                  value={roleTitle}
                  onChange={e => setRoleTitle(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>Department</label>
                <select value={department} onChange={e => setDepartment(e.target.value)}>
                  <option value="Product & Design">Product & Design</option>
                  <option value="Engineering">Engineering</option>
                  <option value="Operations">Operations</option>
                  <option value="People Operations / HR">People Operations / HR</option>
                  <option value="Marketing & Sales">Marketing & Sales</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label>Avatar Color Style</label>
              <div className="tone-picker">
                {['coral', 'ink', 'blue', 'yellow', 'green'].map(tone => (
                  <button
                    key={tone}
                    type="button"
                    className={`tone-btn avatar-${tone} ${avatarTone === tone ? 'selected' : ''}`}
                    onClick={() => setAvatarTone(tone)}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="outline-button" onClick={onClose}>Cancel</button>
            <button type="submit" className="primary-button">Save Changes</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function AddTaskModal({
  onClose,
  onAdd,
}: {
  onClose: () => void;
  onAdd: (task: { title: string; time: string; priority: 'High' | 'Medium' | 'Low' }) => void;
}) {
  const [title, setTitle] = useState('');
  const [time, setTime] = useState('02:00 – 03:00 PM');
  const [priority, setPriority] = useState<'High' | 'Medium' | 'Low'>('Medium');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onAdd({ title, time, priority });
  };

  return (
    <div className="modal-overlay">
      <div className="modal-box">
        <div className="modal-header">
          <h2>Add New Task</h2>
          <button className="modal-close" onClick={onClose}><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label>Task Title *</label>
              <input
                required
                placeholder="e.g. Review backend API endpoints"
                value={title}
                onChange={e => setTitle(e.target.value)}
                autoFocus
              />
            </div>

            <div className="form-group">
              <label>Time / Schedule</label>
              <input
                placeholder="e.g. 10:30 – 11:30 AM"
                value={time}
                onChange={e => setTime(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>Priority</label>
              <select value={priority} onChange={e => setPriority(e.target.value as any)}>
                <option value="High">High Priority</option>
                <option value="Medium">Medium Priority</option>
                <option value="Low">Low Priority</option>
              </select>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="outline-button" onClick={onClose}>Cancel</button>
            <button type="submit" className="primary-button">Add Task</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default App;
