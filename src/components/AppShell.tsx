"use client";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  BarChart3,
  BookOpen,
  BriefcaseBusiness,
  CalendarDays,
  ChevronLeft,
  CircleDollarSign,
  CircleCheck,
  Cloud,
  CloudOff,
  Command,
  Crosshair,
  Dumbbell,
  Focus,
  Home,
  Lightbulb,
  LogOut,
  LayoutDashboard,
  Menu,
  Moon,
  Plus,
  Search,
  Settings,
  Sun,
  Target,
  Users,
  X,
} from "lucide-react";
import { Eyebrow } from "./ui";
import { VoxelTopographyGrid } from "./ui/voxel-topography-grid";
import { useApp } from "./AppProvider";
import { CommandCentre } from "@/features/dashboard/CommandCentre";
import { TodayPage } from "@/features/today/TodayPage";
import {
  BusinessHQ,
  ClientsPage,
  MoneyPage,
  ProjectsPage,
} from "@/features/business/BusinessPages";
import {
  FocusPage,
  GoalsPage,
  IdeasPage,
  LearningPage,
  ReadingPage,
} from "@/features/growth/GrowthPages";
import {
  CalendarPage,
  PlanPage,
  ProgressPage,
  SettingsPage,
  WeeklyReviewPage,
} from "@/features/system/SystemPages";
import { calculateScore, currentStreak, totals } from "@/lib/metrics";
type NavItem = {
  id: string;
  label: string;
  icon: React.ComponentType<{ size?: number }>;
};
const nav: NavItem[] = [
  { id: "home", label: "Command Centre", icon: LayoutDashboard },
  { id: "today", label: "Today", icon: Crosshair },
  { id: "plan", label: "16 Week Plan", icon: Target },
  { id: "calendar", label: "Calendar", icon: CalendarDays },
  { id: "progress", label: "Progress", icon: BarChart3 },
  { id: "business", label: "Business HQ", icon: BriefcaseBusiness },
  { id: "clients", label: "Clients", icon: Users },
  { id: "projects", label: "Projects", icon: Dumbbell },
  { id: "money", label: "Money", icon: CircleDollarSign },
  { id: "learning", label: "Learning", icon: Command },
  { id: "reading", label: "Reading", icon: BookOpen },
  { id: "goals", label: "Goals", icon: Target },
  { id: "review", label: "Weekly Review", icon: BarChart3 },
  { id: "focus", label: "Focus", icon: Focus },
  { id: "ideas", label: "Ideas", icon: Lightbulb },
  { id: "settings", label: "Settings", icon: Settings },
];
export function AppShell() {
  const { data, ready, update, syncStatus, lastSyncedAt, syncNow, signOut } = useApp();
  const [page, setPage] = useState("home"),
    [collapsed, setCollapsed] = useState(false),
    [palette, setPalette] = useState(false),
    [mobileMenu, setMobileMenu] = useState(false);
  const cycle = data.cycles[0];
  const log =
    data.dailyLogs.find(
      (l) => l.date === new Date().toISOString().slice(0, 10),
    ) ?? data.dailyLogs[0];
  const score = calculateScore(
    log,
    data.habits,
    data.settings.waterTargetMl,
    data.settings.sleepTargetHours,
  );
  const t = totals(data);
  const syncLabel = syncStatus === "saving-local" ? "Saving locally" : syncStatus === "syncing" ? "Syncing" : syncStatus === "synced" ? "Synced" : syncStatus === "offline" ? "Offline — saved on device" : "Save failed";
  const SyncIcon = syncStatus === "synced" ? CircleCheck : syncStatus === "offline" ? CloudOff : Cloud;
  useEffect(() => {
    document.documentElement.dataset.theme = data.settings.theme;
  }, [data.settings.theme]);
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPalette(true);
      }
      if (e.key === "Escape") {
        setPalette(false);
        setMobileMenu(false);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);
  useEffect(() => {
    document.body.classList.toggle("menu-open", mobileMenu);
    return () => document.body.classList.remove("menu-open");
  }, [mobileMenu]);
  const content = {
    home: <CommandCentre onNavigate={setPage} />,
    today: <TodayPage />,
    plan: <PlanPage />,
    calendar: <CalendarPage />,
    progress: <ProgressPage />,
    business: <BusinessHQ />,
    clients: <ClientsPage />,
    projects: <ProjectsPage />,
    money: <MoneyPage />,
    learning: <LearningPage />,
    reading: <ReadingPage />,
    goals: <GoalsPage />,
    review: <WeeklyReviewPage />,
    focus: <FocusPage />,
    ideas: <IdeasPage />,
    settings: <SettingsPage />,
  };
  if (!ready)
    return (
      <div className="boot">
        <span>LI</span>
        <b>LOCKED IN</b>
        <i />
      </div>
    );
  const navigate = (id: string) => {
    setPage(id);
    setMobileMenu(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  return (
    <div className={`app-shell ${collapsed ? "collapsed" : ""}`}>
      <VoxelTopographyGrid className="global-topography" />
      <div className="ambient-wash" aria-hidden="true" />
      <a className="skip" href="#main">
        Skip to content
      </a>
      <aside className={mobileMenu ? "mobile-open" : ""}>
        <div className="brand">
          <span>LI</span>
          <div>
            <b>LOCKED IN</b>
            <small>CYCLE 01 / ACTIVE</small>
          </div>
          <button
            onClick={() => setMobileMenu(false)}
            className="mobile-only"
            aria-label="Close menu"
          >
            <X />
          </button>
        </div>
        <nav aria-label="Main navigation">
          {nav.map((item) => (
            <button
              key={item.id}
              className={page === item.id ? "active" : ""}
              onClick={() => navigate(item.id)}
              title={item.label}
            >
              <item.icon size={18} />
              <span>{item.label}</span>
              {page === item.id && <motion.i layoutId="nav-active" />}
            </button>
          ))}
        </nav>
        <button className="collapse" onClick={() => setCollapsed(!collapsed)}>
          <ChevronLeft />
          <span>Collapse cockpit</span>
        </button>
      </aside>
      <div className="shell-main">
        <header className="statusbar">
          <button
            className="mobile-only"
            onClick={() => setMobileMenu(true)}
            aria-label="Open menu"
          >
            <Menu />
          </button>
          <div className="status-stats">
            <span>
              <b>DAY {log.dayNumber}</b> / 112
            </span>
            <span>
              <b>STREAK</b> {currentStreak(data.dailyLogs, data.habits)}D
            </span>
            <span>
              <b>SCORE</b> {score}%
            </span>
            <span className="desktop-status">
              <b>REVENUE</b> £{t.income.toLocaleString()}
            </span>
          </div>
          <div className="status-actions">
            <button className={`sync-state ${syncStatus}`} onClick={() => void syncNow()} aria-label={`${syncLabel}. Sync now.`} title={lastSyncedAt ? `${syncLabel} · ${new Date(lastSyncedAt).toLocaleString()}` : syncLabel}>
              <SyncIcon/><span>{syncLabel}</span>
            </button>
            <button
              onClick={() => setPalette(true)}
              aria-label="Open command palette"
            >
              <Search />
              <kbd>⌘ K</kbd>
            </button>
            <button
              onClick={() =>
                update((d) => ({
                  ...d,
                  settings: {
                    ...d.settings,
                    theme: d.settings.theme === "dark" ? "light" : "dark",
                  },
                }))
              }
              aria-label="Toggle color theme"
            >
              {data.settings.theme === "dark" ? <Sun /> : <Moon />}
            </button>
            <button onClick={() => void signOut()} aria-label="Sign out" title="Sign out"><LogOut/></button>
          </div>
        </header>
        <main id="main">
          <AnimatePresence mode="wait">
            <motion.div
              key={page}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.2 }}
            >
              {content[page as keyof typeof content] ?? content.home}
            </motion.div>
          </AnimatePresence>
        </main>
        <footer className="app-footer">LOCKED IN · {cycle.name}</footer>
      </div>
      <button
        className="quick-add"
        onClick={() => setPalette(true)}
        aria-label="Quick add"
      >
        <Plus />
      </button>
      <div className="bottom-nav">
        {[
          { id: "home", icon: Home, label: "Home" },
          { id: "today", icon: Crosshair, label: "Today" },
          { id: "focus", icon: Focus, label: "Focus" },
          { id: "progress", icon: BarChart3, label: "Progress" },
        ].map((item) => (
          <button
            className={page === item.id ? "active" : ""}
            onClick={() => navigate(item.id)}
            key={item.id}
          >
            <item.icon />
            <span>{item.label}</span>
          </button>
        ))}
        <button onClick={() => setMobileMenu(true)}>
          <Menu />
          <span>More</span>
        </button>
      </div>
      <AnimatePresence>
        {palette && (
          <CommandPalette
            onClose={() => setPalette(false)}
            onNavigate={navigate}
          />
        )}
      </AnimatePresence>
      {!data.settings.onboardingComplete && (
        <Onboarding
          onBegin={() =>
            update((d) => ({
              ...d,
              settings: { ...d.settings, onboardingComplete: true },
            }))
          }
        />
      )}
    </div>
  );
}
function CommandPalette({
  onClose,
  onNavigate,
}: {
  onClose: () => void;
  onNavigate: (id: string) => void;
}) {
  const [query, setQuery] = useState("");
  const filtered = nav.filter((n) =>
    n.label.toLowerCase().includes(query.toLowerCase()),
  );
  return (
    <motion.div
      className="modal-backdrop"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onMouseDown={onClose}
    >
      <motion.div
        className="palette"
        initial={{ scale: 0.97, y: -8 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.98, opacity: 0 }}
        onMouseDown={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Command palette"
      >
        <div className="palette-search">
          <Search />
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search or jump to…"
          />
          <kbd>ESC</kbd>
        </div>
        <Eyebrow>NAVIGATE</Eyebrow>
        {filtered.map((item) => (
          <button
            key={item.id}
            onClick={() => {
              onNavigate(item.id);
              onClose();
            }}
          >
            <item.icon />
            <span>{item.label}</span>
            <small>Open</small>
          </button>
        ))}
        <Eyebrow>QUICK ACTIONS</Eyebrow>
        {[
          { label: "Log water", page: "today", icon: Plus },
          { label: "Add prospect", page: "clients", icon: Users },
          { label: "Record expense", page: "money", icon: CircleDollarSign },
          { label: "Start focus session", page: "focus", icon: Focus },
          { label: "Capture idea", page: "ideas", icon: Lightbulb },
        ].map((x) => (
          <button
            key={x.label}
            onClick={() => {
              onNavigate(x.page);
              onClose();
            }}
          >
            <x.icon />
            <span>{x.label}</span>
            <small>Action</small>
          </button>
        ))}
      </motion.div>
    </motion.div>
  );
}
function Onboarding({ onBegin }: { onBegin: () => void }) {
  return (
    <div className="onboarding">
      <div className="onboarding-grid" />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <span className="onboard-mark">LI</span>
        <Eyebrow>CYCLE 01 / PERSONAL OPERATING SYSTEM</Eyebrow>
        <h1>
          YOUR NEXT 16 WEEKS
          <br />
          <i>START NOW.</i>
        </h1>
        <p>
          15 August 2026 <b>→</b> 4 December 2026
        </p>
        <div className="onboard-stats">
          <span>
            <strong>112</strong> DAYS
          </span>
          <span>
            <strong>16</strong> WEEKS
          </span>
          <span>
            <strong>02</strong> MISSIONS
          </span>
        </div>
        <div className="onboard-goals">
          <span>BMW M4 F82</span>
          <span>MOVE PERMANENTLY TO ROMANIA</span>
        </div>
        <button className="button" onClick={onBegin}>
          Begin lock-in <ChevronLeft />
        </button>
        <small>
          Default targets are ready. Adjust them anytime in Settings.
        </small>
      </motion.div>
    </div>
  );
}
