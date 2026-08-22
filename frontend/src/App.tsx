import React, { useEffect, useMemo, useRef, useState } from 'react';
import { LandingHeader } from './components/LandingHeader';
import { LandingHero } from './components/LandingHero';
import { LandingFeatures } from './components/LandingFeatures';
import { LandingStories } from './components/LandingStories';
import { LandingCTA } from './components/LandingCTA';
import { LandingFooter } from './components/LandingFooter';
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
  Filter,
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
  UserPlus,
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
  gender: string;
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

type Page = 'Home' | 'Overview' | 'My tasks' | 'Attendance' | 'Leave' | 'Payroll' | 'People' | 'Profile' | 'Notifications';

type NavItem = { label: Page; icon: typeof LayoutDashboard; adminOnly?: boolean };

const allNavItems: NavItem[] = [
  { label: 'Home', icon: HomeIcon },
  { label: 'Overview', icon: LayoutDashboard },
  { label: 'My tasks', icon: ListChecks },
  { label: 'Attendance', icon: Clock3 },
  { label: 'Leave', icon: CalendarDays },
  { label: 'Payroll', icon: WalletCards, adminOnly: true },
  { label: 'People', icon: UsersRound, adminOnly: true },
  { label: 'Notifications', icon: Bell },
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

  // Dark mode state persisted in localStorage
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('dayflow_theme');
    return saved ? saved === 'dark' : false;
  });

  const [checkedIn, setCheckedIn] = useState(true);
  const [showNotifications, setShowNotifications] = useState(false);
  const [date, setDate] = useState(new Date());
  const [currentTime, setCurrentTime] = useState(new Date());
  const [toast, setToast] = useState('');

  // Ref for notification click-outside auto-close
  const notificationWrapRef = useRef<HTMLDivElement>(null);

  // Modals
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showOnboardingModal, setShowOnboardingModal] = useState(false);
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);

  // Save dark mode setting
  useEffect(() => {
    localStorage.setItem('dayflow_theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  // Click-outside listener for notifications dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notificationWrapRef.current && !notificationWrapRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    }
    if (showNotifications) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showNotifications]);

  // Sync user token
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
    setShowNotifications(false);
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

            {/* Static Non-Switchable Role Badge */}
            {currentUser ? (
              <div className="role-wrap">
                <div className="role-badge-static">
                  <ShieldCheck size={16} />
                  <span>{currentUser.role === 'ADMIN' ? 'Admin Access' : 'Employee View'}</span>
                </div>
              </div>
            ) : (
              <button className="primary-button" onClick={() => setShowAuthModal(true)}>Sign In</button>
            )}

            {/* Notification Popover with Auto-Close */}
            <div ref={notificationWrapRef} style={{ position: 'relative' }}>
              <button
                className="icon-button notification-button"
                onClick={() => setShowNotifications(!showNotifications)}
                aria-label="Notifications"
              >
                <Bell size={18} />
                <span className="notification-dot" />
              </button>
              {showNotifications && (
                <div className="notification-popover">
                  <div className="popover-heading">
                    <strong>Notifications</strong>
                    <span style={{ fontSize: '11px', color: 'var(--muted)' }}>3 new</span>
                  </div>
                  <div className="notification-item-row" onClick={() => changePage('Notifications')}>
                    <span className="tiny-dot mint-dot" style={{ marginTop: '4px' }} />
                    <div>
                      <p>Leave request approved</p>
                      <span>Yesterday at 04:36 PM</span>
                    </div>
                  </div>
                  <div className="notification-item-row" onClick={() => changePage('Notifications')}>
                    <span className="tiny-dot blue-dot" style={{ marginTop: '4px' }} />
                    <div>
                      <p>New payslip available for August</p>
                      <span>Today at 10:15 AM</span>
                    </div>
                  </div>
                  <div className="notification-item-row" onClick={() => changePage('Notifications')}>
                    <span className="tiny-dot peach-dot" style={{ marginTop: '4px' }} />
                    <div>
                      <p>Team meeting scheduled</p>
                      <span>Today at 11:30 AM</span>
                    </div>
                  </div>
                  <button className="view-all-notifications-btn" onClick={() => changePage('Notifications')}>
                    View all notifications
                  </button>
                </div>
              )}
            </div>

            {/* Dark Mode Toggle working globally */}
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
          <Home
            onOpenWorkspace={handleOpenWorkspace}
            theme={darkMode ? 'dark' : 'light'}
            setTheme={(t) => setDarkMode(t === 'dark')}
          />
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
            setToast={setToast}
          />
        ) : activePage === 'Profile' ? (
          <Profile user={currentUser} onOpenEdit={() => setShowOnboardingModal(true)} setToast={setToast} />
        ) : activePage === 'My tasks' ? (
          <TaskPage
            tasks={tasks}
            pendingTasksCount={pendingTasksCount}
            onToggleTask={handleToggleTask}
            onDeleteTask={handleDeleteTask}
            onOpenAddTask={() => setShowAddTaskModal(true)}
            setToast={setToast}
          />
        ) : activePage === 'Attendance' ? (
          <AttendancePage checkedIn={checkedIn} handleCheckIn={handleCheckIn} currentTime={currentTime} setToast={setToast} />
        ) : activePage === 'Leave' ? (
          <LeavePage user={currentUser} setToast={setToast} />
        ) : activePage === 'Payroll' ? (
          <PayrollPage user={currentUser} setToast={setToast} />
        ) : activePage === 'People' ? (
          <PeoplePage user={currentUser} setToast={setToast} />
        ) : activePage === 'Notifications' ? (
          <NotificationsPage setToast={setToast} />
        ) : (
          <div className="page-content"><h2>Page not found</h2></div>
        )}
      </main>

      {/* Auth Modal */}
      {showAuthModal && (
        <AuthModal
          onClose={() => setShowAuthModal(false)}
          onLoginSuccess={handleLoginSuccess}
        />
      )}

      {/* Profile Modal */}
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

/* === Home Landing Page === */
function Home({
  onOpenWorkspace,
  theme,
  setTheme,
}: {
  onOpenWorkspace: () => void;
  theme: 'light' | 'dark';
  setTheme: (t: 'light' | 'dark') => void;
}) {
  return (
    <div className="landing-page" role="main">
      <LandingHeader onOpenDashboard={onOpenWorkspace} theme={theme} setTheme={(t) => setTheme(t === 'dark' ? 'dark' : 'light')} />
      <LandingHero onOpenDashboard={onOpenWorkspace} />
      <LandingFeatures />
      <LandingStories />
      <LandingCTA onOpenDashboard={onOpenWorkspace} />
      <LandingFooter onOpenDashboard={onOpenWorkspace} />
    </div>
  );
}

/* === Dashboard Overview Component (Without redundant My Tasks section) === */
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
            <div><span className="soft-label">YOUR SCHEDULE</span><h2>August 2026</h2></div>
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
        <StatCard icon={<WalletCards size={18} />} label="Next payday" value="Sep 01" detail="10 days from now" tone="peach" graph="calendar" />
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
        </div>
      </section>
    </div>
  );
}

/* === Task Page (Dedicated My Tasks view) === */
function TaskPage({
  tasks,
  pendingTasksCount,
  onToggleTask,
  onDeleteTask,
  onOpenAddTask,
  setToast,
}: {
  tasks: TaskItem[];
  pendingTasksCount: number;
  onToggleTask: (id: string) => void;
  onDeleteTask: (id: string) => void;
  onOpenAddTask: () => void;
  setToast: (message: string) => void;
}) {
  return (
    <div className="page-content task-page">
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
          <h2>Tasks List</h2>
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

/* === ATTENDANCE MODULE === */
function AttendancePage({
  checkedIn,
  handleCheckIn,
  currentTime,
  setToast,
}: {
  checkedIn: boolean;
  handleCheckIn: () => void;
  currentTime: Date;
  setToast: (msg: string) => void;
}) {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_BASE_URL}/attendance`)
      .then(res => res.json())
      .then(data => {
        if (data.success) setLogs(data.data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [checkedIn]);

  return (
    <div className="page-content">
      <section className="profile-heading">
        <div>
          <div className="eyebrow"><Clock3 size={15} /> Time & Attendance</div>
          <h1>Attendance Management</h1>
          <p>Track daily check-ins, working hours, and view historical attendance logs.</p>
        </div>
        <button className={`primary-button ${checkedIn ? 'checkout-button' : ''}`} onClick={() => { handleCheckIn(); setToast(checkedIn ? 'Checked out!' : 'Checked in!'); }}>
          {checkedIn ? 'Check Out Now' : 'Check In Now'}
        </button>
      </section>

      <div className="cards-summary-grid">
        <div className="summary-card">
          <span>Current Status</span>
          <strong style={{ color: checkedIn ? '#059669' : '#dc2626' }}>{checkedIn ? 'Present (On Clock)' : 'Checked Out'}</strong>
          <small>Time: {formatTime(currentTime)}</small>
        </div>
        <div className="summary-card">
          <span>Days Present (This Month)</span>
          <strong>18 Days</strong>
          <small>94.7% Attendance rate</small>
        </div>
        <div className="summary-card">
          <span>Avg. Daily Hours</span>
          <strong>8.2 Hours</strong>
          <small>Standard: 8.0 Hours</small>
        </div>
        <div className="summary-card">
          <span>Late Arrivals</span>
          <strong>1 Day</strong>
          <small>Within acceptable buffer</small>
        </div>
      </div>

      <div className="data-table-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Check In</th>
              <th>Check Out</th>
              <th>Total Hours</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} style={{ textAlign: 'center', padding: '24px' }}>Loading attendance records...</td></tr>
            ) : logs.length === 0 ? (
              <tr><td colSpan={5} style={{ textAlign: 'center', padding: '24px' }}>No records found.</td></tr>
            ) : (
              logs.map(log => (
                <tr key={log.id}>
                  <td><strong>{log.date}</strong></td>
                  <td>{log.checkIn}</td>
                  <td>{log.checkOut}</td>
                  <td>{log.totalHours}</td>
                  <td>
                    <span className={`badge badge-${(log.status || 'PRESENT').toLowerCase()}`}>
                      {log.status}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* === LEAVE MODULE === */
function LeavePage({ user, setToast }: { user: UserProfile | null; setToast: (msg: string) => void }) {
  const [leaves, setLeaves] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showApplyModal, setShowApplyModal] = useState(false);

  // Leave Form
  const [leaveType, setLeaveType] = useState('Annual Leave');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');

  const fetchLeaves = () => {
    fetch(`${API_BASE_URL}/leaves`)
      .then(res => res.json())
      .then(data => {
        if (data.success) setLeaves(data.data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchLeaves();
  }, []);

  const handleApplyLeave = (e: React.FormEvent) => {
    e.preventDefault();
    fetch(`${API_BASE_URL}/leaves`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: leaveType,
        startDate,
        endDate,
        reason,
        employeeName: user ? `${user.firstName} ${user.lastName}` : 'Current Employee',
      }),
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setToast('Leave request submitted successfully!');
          setShowApplyModal(false);
          setReason('');
          fetchLeaves();
        }
      });
  };

  const handleUpdateStatus = (id: string, status: string) => {
    fetch(`${API_BASE_URL}/leaves/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setToast(`Leave request ${status.toLowerCase()}`);
          fetchLeaves();
        }
      });
  };

  return (
    <div className="page-content">
      <section className="profile-heading">
        <div>
          <div className="eyebrow"><CalendarDays size={15} /> Time Off Workspace</div>
          <h1>Leave & Vacation Balances</h1>
          <p>Request leaves, monitor available balance allowances, and view request statuses.</p>
        </div>
        <button className="primary-button" onClick={() => setShowApplyModal(true)}>
          <Plus size={17} /> Apply for Leave
        </button>
      </section>

      <div className="cards-summary-grid">
        <div className="summary-card">
          <span>Annual Leave</span>
          <strong style={{ color: '#2563eb' }}>14 / 20 Days</strong>
          <small>6 days taken this year</small>
        </div>
        <div className="summary-card">
          <span>Sick Leave</span>
          <strong style={{ color: '#059669' }}>8 / 10 Days</strong>
          <small>2 days used</small>
        </div>
        <div className="summary-card">
          <span>Casual Leave</span>
          <strong style={{ color: '#d97706' }}>5 / 7 Days</strong>
          <small>2 days remaining</small>
        </div>
      </div>

      <div className="data-table-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              <th>Applicant</th>
              <th>Leave Type</th>
              <th>Duration</th>
              <th>Days</th>
              <th>Reason</th>
              <th>Status</th>
              {user?.role === 'ADMIN' && <th>Action</th>}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} style={{ textAlign: 'center', padding: '24px' }}>Loading leave requests...</td></tr>
            ) : leaves.length === 0 ? (
              <tr><td colSpan={7} style={{ textAlign: 'center', padding: '24px' }}>No leave requests found.</td></tr>
            ) : (
              leaves.map(req => (
                <tr key={req.id}>
                  <td><strong>{req.employeeName || req.employee?.firstName + ' ' + req.employee?.lastName || 'Employee'}</strong></td>
                  <td>{req.type || req.leaveType}</td>
                  <td>{req.startDate} to {req.endDate}</td>
                  <td>{req.days || 1} day(s)</td>
                  <td>{req.reason || 'N/A'}</td>
                  <td>
                    <span className={`badge badge-${(req.status || 'PENDING').toLowerCase()}`}>
                      {req.status}
                    </span>
                  </td>
                  {user?.role === 'ADMIN' && (
                    <td>
                      {req.status === 'PENDING' ? (
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <button
                            style={{ padding: '4px 8px', borderRadius: '6px', border: 0, background: '#10b981', color: '#fff', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer' }}
                            onClick={() => handleUpdateStatus(req.id, 'APPROVED')}
                          >
                            Approve
                          </button>
                          <button
                            style={{ padding: '4px 8px', borderRadius: '6px', border: 0, background: '#ef4444', color: '#fff', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer' }}
                            onClick={() => handleUpdateStatus(req.id, 'REJECTED')}
                          >
                            Reject
                          </button>
                        </div>
                      ) : (
                        <span style={{ fontSize: '12px', color: 'var(--muted)' }}>—</span>
                      )}
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showApplyModal && (
        <div className="modal-overlay">
          <div className="modal-box">
            <div className="modal-header">
              <h2>Request Time Off / Leave</h2>
              <button className="modal-close" onClick={() => setShowApplyModal(false)}><X size={18} /></button>
            </div>
            <form onSubmit={handleApplyLeave}>
              <div className="modal-body">
                <div className="form-group">
                  <label>Leave Type *</label>
                  <select value={leaveType} onChange={e => setLeaveType(e.target.value)}>
                    <option value="Annual Leave">Annual Leave</option>
                    <option value="Sick Leave">Sick Leave</option>
                    <option value="Casual Leave">Casual Leave</option>
                    <option value="Maternity / Paternity Leave">Maternity / Paternity Leave</option>
                  </select>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Start Date *</label>
                    <input type="date" required value={startDate} onChange={e => setStartDate(e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label>End Date *</label>
                    <input type="date" required value={endDate} onChange={e => setEndDate(e.target.value)} />
                  </div>
                </div>
                <div className="form-group">
                  <label>Reason *</label>
                  <textarea
                    required
                    rows={3}
                    placeholder="Briefly state your reason for time off"
                    value={reason}
                    onChange={e => setReason(e.target.value)}
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--line)', background: 'var(--canvas)', color: 'var(--ink)' }}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="outline-button" onClick={() => setShowApplyModal(false)}>Cancel</button>
                <button type="submit" className="primary-button">Submit Request</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

/* === PAYROLL MODULE === */
function PayrollPage({ user, setToast }: { user: UserProfile | null; setToast: (msg: string) => void }) {
  const [payrolls, setPayrolls] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showGenModal, setShowGenModal] = useState(false);

  const [month, setMonth] = useState('September');
  const [basicSalary, setBasicSalary] = useState('8500');
  const [allowances, setAllowances] = useState('1200');
  const [deductions, setDeductions] = useState('450');

  const fetchPayroll = () => {
    fetch(`${API_BASE_URL}/payroll`)
      .then(res => res.json())
      .then(data => {
        if (data.success) setPayrolls(data.data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchPayroll();
  }, []);

  const handleGeneratePayroll = (e: React.FormEvent) => {
    e.preventDefault();
    fetch(`${API_BASE_URL}/payroll`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        month,
        year: 2026,
        basicSalary,
        allowances,
        deductions,
        employeeName: user ? `${user.firstName} ${user.lastName}` : 'Workspace Employee',
      }),
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setToast('Payroll processed & payslip generated!');
          setShowGenModal(false);
          fetchPayroll();
        }
      });
  };

  return (
    <div className="page-content">
      <section className="profile-heading">
        <div>
          <div className="eyebrow"><WalletCards size={15} /> Compensation & Slips</div>
          <h1>Payroll Management</h1>
          <p>Review monthly salaries, allowances, deductions, and download payslip summaries.</p>
        </div>
        {user?.role === 'ADMIN' && (
          <button className="primary-button" onClick={() => setShowGenModal(true)}>
            <Plus size={17} /> Process New Payroll
          </button>
        )}
      </section>

      <div className="cards-summary-grid">
        <div className="summary-card">
          <span>Net Disbursed (August 2026)</span>
          <strong style={{ color: '#059669' }}>$36,750.00</strong>
          <small>All employees paid</small>
        </div>
        <div className="summary-card">
          <span>Average Monthly Salary</span>
          <strong>$8,750.00</strong>
          <small>Base compensation</small>
        </div>
        <div className="summary-card">
          <span>Total Deductions</span>
          <strong>$1,750.00</strong>
          <small>Taxes & health insurance</small>
        </div>
      </div>

      <div className="data-table-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              <th>Employee</th>
              <th>Period</th>
              <th>Basic Salary</th>
              <th>Allowances</th>
              <th>Deductions</th>
              <th>Net Salary</th>
              <th>Status</th>
              <th>Payslip</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={8} style={{ textAlign: 'center', padding: '24px' }}>Loading payroll records...</td></tr>
            ) : payrolls.length === 0 ? (
              <tr><td colSpan={8} style={{ textAlign: 'center', padding: '24px' }}>No payroll records found.</td></tr>
            ) : (
              payrolls.map(item => (
                <tr key={item.id}>
                  <td><strong>{item.employeeName || item.employee?.firstName + ' ' + item.employee?.lastName || 'Employee'}</strong></td>
                  <td>{item.month} {item.year}</td>
                  <td>${item.basicSalary}</td>
                  <td>+${item.allowances}</td>
                  <td>-${item.deductions}</td>
                  <td><strong style={{ color: '#059669' }}>${item.netPay}</strong></td>
                  <td>
                    <span className={`badge badge-${(item.status || 'PAID').toLowerCase()}`}>
                      {item.status}
                    </span>
                  </td>
                  <td>
                    <button
                      style={{ padding: '4px 10px', borderRadius: '6px', border: '1px solid var(--line)', background: 'var(--surface-soft)', cursor: 'pointer', fontSize: '12px' }}
                      onClick={() => setToast(`Opened payslip PDF for ${item.month} ${item.year}`)}
                    >
                      View Slip
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showGenModal && (
        <div className="modal-overlay">
          <div className="modal-box">
            <div className="modal-header">
              <h2>Process Monthly Payroll</h2>
              <button className="modal-close" onClick={() => setShowGenModal(false)}><X size={18} /></button>
            </div>
            <form onSubmit={handleGeneratePayroll}>
              <div className="modal-body">
                <div className="form-group">
                  <label>Pay Month</label>
                  <select value={month} onChange={e => setMonth(e.target.value)}>
                    <option value="September">September 2026</option>
                    <option value="October">October 2026</option>
                    <option value="November">November 2026</option>
                  </select>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Basic Salary ($)</label>
                    <input type="number" value={basicSalary} onChange={e => setBasicSalary(e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label>Allowances ($)</label>
                    <input type="number" value={allowances} onChange={e => setAllowances(e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label>Deductions ($)</label>
                    <input type="number" value={deductions} onChange={e => setDeductions(e.target.value)} />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="outline-button" onClick={() => setShowGenModal(false)}>Cancel</button>
                <button type="submit" className="primary-button">Process Payroll</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

/* === PEOPLE (EMPLOYEE DIRECTORY) MODULE === */
function PeoplePage({ user, setToast }: { user: UserProfile | null; setToast: (msg: string) => void }) {
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState('ALL');
  const [showAddModal, setShowAddModal] = useState(false);

  // New Employee Form
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [roleTitle, setRoleTitle] = useState('');
  const [department, setDepartment] = useState('Engineering');
  const [gender, setGender] = useState('Female');

  const fetchEmployees = () => {
    fetch(`${API_BASE_URL}/employees`)
      .then(res => res.json())
      .then(data => {
        if (data.success) setEmployees(data.data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const handleAddEmployee = (e: React.FormEvent) => {
    e.preventDefault();
    fetch(`${API_BASE_URL}/employees`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ firstName, lastName, email, roleTitle, department, gender, role: 'EMPLOYEE' }),
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setToast(`Added employee ${firstName} ${lastName}!`);
          setShowAddModal(false);
          setFirstName('');
          setLastName('');
          setEmail('');
          setRoleTitle('');
          fetchEmployees();
        }
      });
  };

  const filteredEmployees = employees.filter(emp => {
    const fullName = `${emp.firstName || ''} ${emp.lastName || ''} ${emp.name || ''}`.toLowerCase();
    const matchesSearch = fullName.includes(searchQuery.toLowerCase()) || (emp.email && emp.email.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesDept = selectedDept === 'ALL' || emp.department === selectedDept;
    return matchesSearch && matchesDept;
  });

  return (
    <div className="page-content">
      <section className="profile-heading">
        <div>
          <div className="eyebrow"><UsersRound size={15} /> People & Organization</div>
          <h1>Employee Directory</h1>
          <p>View all team members across departments, roles, and genders.</p>
        </div>
        {user?.role === 'ADMIN' && (
          <button className="primary-button" onClick={() => setShowAddModal(true)}>
            <UserPlus size={17} /> Add New Employee
          </button>
        )}
      </section>

      <div className="module-header-row">
        <label className="search-box" style={{ maxWidth: '340px' }}>
          <Search size={17} />
          <input placeholder="Search by name or email..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
        </label>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <Filter size={15} style={{ color: 'var(--muted)' }} />
          <select
            value={selectedDept}
            onChange={e => setSelectedDept(e.target.value)}
            style={{ padding: '8px 14px', borderRadius: '8px', border: '1px solid var(--line)', background: 'var(--surface)', color: 'var(--ink)' }}
          >
            <option value="ALL">All Departments</option>
            <option value="Engineering">Engineering</option>
            <option value="Product & Design">Product & Design</option>
            <option value="Operations">Operations</option>
            <option value="Marketing & Sales">Marketing & Sales</option>
          </select>
        </div>
      </div>

      <div className="data-table-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              <th>Employee Name</th>
              <th>Role / Position</th>
              <th>Department</th>
              <th>Gender</th>
              <th>Email</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} style={{ textAlign: 'center', padding: '24px' }}>Loading employee directory...</td></tr>
            ) : filteredEmployees.length === 0 ? (
              <tr><td colSpan={6} style={{ textAlign: 'center', padding: '24px' }}>No employees matched your filter.</td></tr>
            ) : (
              filteredEmployees.map(emp => (
                <tr key={emp.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <Avatar initials={emp.initials || getInitials(emp.firstName, emp.lastName)} tone={emp.tone || 'coral'} small />
                      <strong>{emp.firstName ? `${emp.firstName} ${emp.lastName}` : emp.name}</strong>
                    </div>
                  </td>
                  <td>{emp.roleTitle || emp.role}</td>
                  <td>{emp.department || 'Engineering'}</td>
                  <td>{emp.gender || 'Prefer not to say'}</td>
                  <td>{emp.email || 'employee@dayflow.co'}</td>
                  <td>
                    <span className={`badge badge-${(emp.status || 'ACTIVE').toLowerCase()}`}>
                      {emp.status || 'ACTIVE'}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal-box">
            <div className="modal-header">
              <h2>Add New Employee Profile</h2>
              <button className="modal-close" onClick={() => setShowAddModal(false)}><X size={18} /></button>
            </div>
            <form onSubmit={handleAddEmployee}>
              <div className="modal-body">
                <div className="form-row">
                  <div className="form-group">
                    <label>First Name *</label>
                    <input required value={firstName} onChange={e => setFirstName(e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label>Last Name *</label>
                    <input required value={lastName} onChange={e => setLastName(e.target.value)} />
                  </div>
                </div>
                <div className="form-group">
                  <label>Email Address *</label>
                  <input type="email" required value={email} onChange={e => setEmail(e.target.value)} />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Role Title *</label>
                    <input required placeholder="e.g. Senior Frontend Developer" value={roleTitle} onChange={e => setRoleTitle(e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label>Department</label>
                    <select value={department} onChange={e => setDepartment(e.target.value)}>
                      <option value="Engineering">Engineering</option>
                      <option value="Product & Design">Product & Design</option>
                      <option value="Operations">Operations</option>
                      <option value="Marketing & Sales">Marketing & Sales</option>
                    </select>
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
              </div>
              <div className="modal-footer">
                <button type="button" className="outline-button" onClick={() => setShowAddModal(false)}>Cancel</button>
                <button type="submit" className="primary-button">Add Employee</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

/* === NOTIFICATIONS MODULE (DEDICATED ROUTE) === */
function NotificationsPage({ setToast }: { setToast: (msg: string) => void }) {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');

  const fetchNotifs = () => {
    fetch(`${API_BASE_URL}/notifications`)
      .then(res => res.json())
      .then(data => {
        if (data.success) setNotifications(data.data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchNotifs();
  }, []);

  const handleMarkAllRead = () => {
    fetch(`${API_BASE_URL}/notifications/mark-read`, { method: 'POST' })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setNotifications(data.data);
          setToast('All notifications marked as read!');
        }
      });
  };

  const filteredNotifs = notifications.filter(n => filter === 'ALL' || n.category === filter);

  return (
    <div className="page-content">
      <section className="profile-heading">
        <div>
          <div className="eyebrow"><Bell size={15} /> Notifications Center</div>
          <h1>System & Team Notifications</h1>
          <p>Stay updated on leave approvals, payroll releases, and workspace events.</p>
        </div>
        <button className="outline-button" onClick={handleMarkAllRead}>
          Mark All as Read
        </button>
      </section>

      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        {['ALL', 'Leave', 'Payroll', 'Attendance', 'Schedule', 'System'].map(cat => (
          <button
            key={cat}
            className={`outline-button ${filter === cat ? 'primary-button' : ''}`}
            onClick={() => setFilter(cat)}
            style={{ padding: '6px 14px', fontSize: '13px' }}
          >
            {cat}
          </button>
        ))}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {loading ? (
          <div className="card-surface" style={{ padding: '24px', textAlign: 'center' }}>Loading notifications...</div>
        ) : filteredNotifs.length === 0 ? (
          <div className="card-surface" style={{ padding: '24px', textAlign: 'center' }}>No notifications found in this category.</div>
        ) : (
          filteredNotifs.map(n => (
            <div key={n.id} className={`card-surface notification-card-item ${n.unread ? 'unread' : ''}`}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div className="activity-icon mint"><Bell size={18} /></div>
                <div>
                  <strong style={{ fontSize: '14px', display: 'block', color: 'var(--ink)' }}>{n.title}</strong>
                  <span style={{ fontSize: '12px', color: 'var(--muted)' }}>{n.time} | Category: {n.category}</span>
                </div>
              </div>
              {n.unread && <span className="badge badge-pending">NEW</span>}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

/* === Profile Component === */
function Profile({
  user,
  onOpenEdit,
  setToast,
}: {
  user: UserProfile | null;
  onOpenEdit: () => void;
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
      <section className="profile-heading">
        <div>
          <div className="eyebrow"><UserRound size={15} /> Personal workspace</div>
          <h1>My Profile</h1>
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

function StatCard({ icon, label, value, detail, tone, graph }: { icon: React.ReactNode; label: string; value: string; detail: string; tone: string; graph: string }) {
  return (
    <div className={`stat-card stat-${tone}`}>
      <div className="stat-header"><span className="stat-icon">{icon}</span><MoreHorizontal size={17} className="stat-more" /></div>
      <span className="stat-label">{label}</span>
      <strong className="stat-value">{value}</strong>
      <span className="stat-detail">{detail}</span>
      {graph === 'line' && <div className="mini-line"><span /><span /><span /><span /><span /></div>}
      {graph === 'ring' && <div className="mini-ring"><span>{value}</span></div>}
      {graph === 'calendar' && <div className="mini-calendar-icon"><span>SEP</span><strong>01</strong></div>}
      {graph === 'people' && <div className="mini-bars"><span /><span /><span /><span /><span /><span /></div>}
    </div>
  );
}

/* === Auth Modal with Login & Register === */
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