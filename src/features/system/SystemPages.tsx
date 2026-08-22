"use client";

import { useRef, useState } from "react";
import { addDays, eachMonthOfInterval, endOfMonth, format, getDay, parseISO, startOfMonth } from "date-fns";
import { Download, Plus, Printer, RotateCw, Settings2, Upload } from "lucide-react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useApp } from "@/components/AppProvider";
import { EmptyState, Eyebrow, Metric, Panel, ProgressBar } from "@/components/ui";
import { formatMoney } from "@/lib/money";
import { calculateScore, currentStreak, totals } from "@/lib/metrics";
import { generateCycle, generateDailyLogs } from "@/lib/seed";

const uid = () => crypto.randomUUID();

function Header({ eyebrow, title, sub, actions }: { eyebrow: string; title: string; sub: string; actions?: React.ReactNode }) {
  return <header className="page-title"><div><Eyebrow>{eyebrow}</Eyebrow><h1>{title}</h1><p>{sub}</p></div>{actions}</header>;
}

export function PlanPage() {
  const { data } = useApp();
  const cycle = data.cycles[0];
  return (
    <div className="page module-page">
      <Header eyebrow="112 DAYS / 16 WEEKS" title="THE PLAN" sub="Use this page to see each week’s focus, dates, and average adherence across the current cycle." />
      <div className="week-plan">{Array.from({ length: 16 }, (_, index) => {
        const logs = data.dailyLogs.filter((log) => log.weekNumber === index + 1);
        const activity = logs.filter((log) => calculateScore(log, data.habits) > 0);
        const score = activity.length ? Math.round(activity.reduce((sum, log) => sum + calculateScore(log, data.habits), 0) / activity.length) : 0;
        return (
          <Panel key={index}>
            <div className="panel-heading"><div><Eyebrow>WEEK {String(index + 1).padStart(2, "0")}</Eyebrow><h3>{cycle.themes[index]}</h3></div><strong>{score}%</strong></div>
            <ProgressBar value={score} />
            <small>{format(addDays(parseISO(cycle.startDate), index * 7), "dd MMM")} — {format(addDays(parseISO(cycle.startDate), index * 7 + 6), "dd MMM")}</small>
          </Panel>
        );
      })}</div>
    </div>
  );
}

export function CalendarPage() {
  const { data, update } = useApp();
  const [selected, setSelected] = useState(data.dailyLogs[0].date);
  const add = (formData: FormData) => update((current) => ({
    ...current,
    appointments: [...current.appointments, { id: uid(), title: String(formData.get("title")), date: selected, time: String(formData.get("time")), category: "Personal", completed: false, notes: "" }],
  }));
  const months = eachMonthOfInterval({ start: parseISO("2026-01-01"), end: parseISO("2026-12-31") });
  return (
    <div className="page module-page">
      <Header eyebrow="YEAR VIEW / APPOINTMENTS" title="CALENDAR" sub="Select a date, write an appointment or deadline, and mark it complete when it is finished." />
      <div className="calendar-layout">
        <Panel className="year-calendar">{months.map((month) => {
          const days = endOfMonth(month).getDate();
          return (
            <div className="month" key={month.toISOString()}>
              <b>{format(month, "MMM")}</b>
              <div className="month-grid">
                {Array.from({ length: getDay(startOfMonth(month)) }, (_, index) => <i key={`blank-${index}`} />)}
                {Array.from({ length: days }, (_, index) => {
                  const date = format(addDays(startOfMonth(month), index), "yyyy-MM-dd");
                  const log = data.dailyLogs.find((item) => item.date === date);
                  const score = log ? calculateScore(log, data.habits) : 0;
                  return <button key={date} onClick={() => setSelected(date)} className={`${date === selected ? "selected" : ""} ${log ? "in-cycle" : ""}`} style={{ "--heat": `${score}%` } as React.CSSProperties} aria-label={`${date}${score ? `, score ${score}%` : ""}`}>{index + 1}</button>;
                })}
              </div>
            </div>
          );
        })}</Panel>
        <Panel className="agenda">
          <Eyebrow>{format(parseISO(selected), "EEEE, dd MMMM")}</Eyebrow><h3>Agenda</h3>
          {data.appointments.filter((appointment) => appointment.date === selected).map((appointment) => <button className={`appointment ${appointment.completed ? "done" : ""}`} key={appointment.id} onClick={() => update((current) => ({ ...current, appointments: current.appointments.map((item) => item.id === appointment.id ? { ...item, completed: !item.completed } : item) }))}><span>{appointment.time || "ALL DAY"}</span><b>{appointment.title}</b></button>)}
          <form action={add}><label>Appointment<input name="title" required placeholder="Add a commitment" /></label><label>Time<input name="time" type="time" /></label><button className="button"><Plus />Add</button></form>
        </Panel>
      </div>
    </div>
  );
}

export function ProgressPage() {
  const { data } = useApp();
  const active = data.dailyLogs.filter((log) => calculateScore(log, data.habits) > 0);
  const score = active.length ? Math.round(active.reduce((sum, log) => sum + calculateScore(log, data.habits), 0) / active.length) : 0;
  const money = totals(data, data.settings.currency);
  const chart = data.dailyLogs.filter((log) => calculateScore(log, data.habits) > 0).map((log) => ({ date: format(parseISO(log.date), "dd MMM"), score: calculateScore(log, data.habits), sleep: log.sleepHours }));
  return (
    <div className="page module-page print-report">
      <Header eyebrow="PROGRESS / CYCLE REVIEW" title="THE PROOF" sub="Review adherence, streaks, focused work, and the patterns emerging from your records." actions={<button className="button secondary no-print" onClick={() => window.print()}><Printer />Print report</button>} />
      <div className="metric-grid wide">
        <Metric label="Cycle adherence" value={`${score}%`} accent />
        <Metric label="Current streak" value={`${currentStreak(data.dailyLogs, data.habits)}d`} />
        <Metric label="Deep work" value={`${Math.round(data.dailyLogs.reduce((sum, log) => sum + log.businessMinutes, 0) / 60)}h`} />
        <Metric label={`Net cash · ${data.settings.currency}`} value={formatMoney(money.net, data.settings.currency)} />
      </div>
      <Panel className="chart-panel">
        <Eyebrow>DAILY SCORE HISTORY</Eyebrow><h3>Consistency over time</h3>
        {chart.length ? <ResponsiveContainer width="100%" height={320}><AreaChart data={chart}><defs><linearGradient id="score" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="var(--accent)" stopOpacity=".5" /><stop offset="1" stopColor="var(--accent)" stopOpacity="0" /></linearGradient></defs><CartesianGrid vertical={false} stroke="var(--border)" /><XAxis dataKey="date" /><YAxis domain={[0, 100]} /><Tooltip /><Area dataKey="score" stroke="var(--accent)" fill="url(#score)" /></AreaChart></ResponsiveContainer> : <EmptyState title="Your proof begins with one action." body="Complete something on Daily Tasks and the score history will appear here." />}
      </Panel>
      <Panel>
        <Eyebrow>RULE-BASED INSIGHTS</Eyebrow><h3>What the data can honestly say</h3>
        <div className="insights">{active.length < 7 ? <p>Seven active days are needed before LOCKED IN will surface behavioural observations. No invented correlations.</p> : <><p>Your strongest recorded day is {[...active].sort((a, b) => calculateScore(b, data.habits) - calculateScore(a, data.habits))[0].date}.</p><p>{active.filter((log) => log.sleepHours >= 7).length} recorded days include at least seven hours of sleep.</p></>}</div>
      </Panel>
    </div>
  );
}

export function WeeklyReviewPage() {
  const { data, update } = useApp();
  const cycle = data.cycles[0];
  const [week, setWeek] = useState(1);
  const review = data.weeklyReviews.find((item) => item.weekNumber === week);
  const save = (formData: FormData) => {
    const next = { id: review?.id ?? uid(), cycleId: cycle.id, weekNumber: week, wins: String(formData.get("wins")), friction: String(formData.get("friction")), lesson: String(formData.get("lesson")), nextObjective: String(formData.get("objective")), ratings: { execution: Number(formData.get("rating")) } };
    update((current) => ({ ...current, weeklyReviews: [...current.weeklyReviews.filter((item) => item.weekNumber !== week), next] }));
  };
  return (
    <div className="page module-page">
      <Header eyebrow="WEEKLY RESET" title="REVIEW THE SYSTEM" sub="Write the week’s wins, friction, main lesson, execution rating, and next objective." />
      <Panel>
        <div className="week-selector">{Array.from({ length: 16 }, (_, index) => <button className={week === index + 1 ? "active" : ""} onClick={() => setWeek(index + 1)} key={index}>W{index + 1}</button>)}</div>
        <form action={save} className="review-form">
          <label>Wins<textarea name="wins" defaultValue={review?.wins} /></label>
          <label>What created friction?<textarea name="friction" defaultValue={review?.friction} /></label>
          <label>Main lesson<textarea name="lesson" defaultValue={review?.lesson} /></label>
          <label>Next week’s business objective<input name="objective" defaultValue={review?.nextObjective} /></label>
          <label>Execution rating<input type="range" name="rating" min="1" max="10" defaultValue={review?.ratings.execution ?? 5} /></label>
          <button className="button">Reset for next week</button>
        </form>
      </Panel>
    </div>
  );
}

export function SettingsPage() {
  const { data, update, backup, importBackup } = useApp();
  const fileRef = useRef<HTMLInputElement>(null);
  const [saved, setSaved] = useState(false);
  const set = (key: string, value: string | number) => {
    update((current) => ({ ...current, settings: { ...current.settings, [key]: value } }));
    setSaved(true);
    setTimeout(() => setSaved(false), 1200);
  };
  const startCycle = (weeks: number) => {
    const latest = data.cycles[data.cycles.length - 1];
    const cycle = generateCycle(format(addDays(parseISO(latest.endDate), 1), "yyyy-MM-dd"), weeks, `LOCKED IN — CYCLE ${data.cycles.length + 1}`);
    update((current) => ({ ...current, cycles: [...current.cycles, cycle], dailyLogs: [...current.dailyLogs, ...generateDailyLogs(cycle)] }));
  };
  return (
    <div className="page module-page">
      <Header eyebrow="SYSTEM CONFIGURATION" title="SETTINGS" sub="Adjust your defaults and targets, manage backups, or begin a new cycle without losing history." actions={saved ? <span className="saved" role="status">Saved</span> : undefined} />
      <div className="settings-grid">
        <Panel>
          <div className="panel-heading"><div><Eyebrow>GENERAL</Eyebrow><h3>Profile & targets</h3></div><Settings2 /></div>
          <div className="form-grid">
            <label>Name<input value={data.settings.name} onChange={(event) => set("name", event.target.value)} /></label>
            <label>Default currency<select value={data.settings.currency} onChange={(event) => set("currency", event.target.value)}><option value="GBP">£ Pounds (GBP)</option><option value="EUR">€ Euros (EUR)</option></select><small>Used as the default for new projects and money entries.</small></label>
            <label>Water target (ml)<input type="number" value={data.settings.waterTargetMl} onChange={(event) => set("waterTargetMl", Number(event.target.value))} /></label>
            <label>Sleep target (hours)<input type="number" step=".25" value={data.settings.sleepTargetHours} onChange={(event) => set("sleepTargetHours", Number(event.target.value))} /></label>
            <label>Social limit (minutes)<input type="number" value={data.settings.socialLimitMinutes} onChange={(event) => set("socialLimitMinutes", Number(event.target.value))} /></label>
            <label>Fitness sessions / week<input type="number" value={data.settings.fitnessWeeklyTarget} onChange={(event) => set("fitnessWeeklyTarget", Number(event.target.value))} /></label>
            <label>Business hours / week<input type="number" value={data.settings.businessWeeklyHours} onChange={(event) => set("businessWeeklyHours", Number(event.target.value))} /></label>
          </div>
        </Panel>
        <Panel>
          <Eyebrow>BACKUP & RESTORE</Eyebrow><h3>Your data stays yours.</h3>
          <p>Export a complete JSON backup. Imported files are validated before replacing your local database.</p>
          <div className="stack-actions"><button className="button" onClick={backup}><Download />Backup my data</button><button className="button secondary" onClick={() => fileRef.current?.click()}><Upload />Restore backup</button><input hidden ref={fileRef} type="file" accept="application/json" onChange={(event) => event.target.files?.[0] && importBackup(event.target.files[0])} /></div>
          <small>Last backup: {data.settings.lastBackupAt ? format(parseISO(data.settings.lastBackupAt), "dd MMM yyyy, HH:mm") : "Not yet"}</small>
        </Panel>
        <Panel>
          <Eyebrow>START NEXT CYCLE</Eyebrow><h3>History is never overwritten.</h3>
          <div className="cycle-buttons">{[4, 8, 12, 16].map((weeks) => <button key={weeks} onClick={() => startCycle(weeks)}><RotateCw />{weeks} weeks</button>)}</div>
        </Panel>
      </div>
    </div>
  );
}
