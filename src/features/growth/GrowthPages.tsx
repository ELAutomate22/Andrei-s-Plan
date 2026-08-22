"use client";

import { useEffect, useState } from "react";
import { addMonths, format } from "date-fns";
import {
  BookMarked,
  BookOpen,
  BrainCircuit,
  ExternalLink,
  GraduationCap,
  Lightbulb,
  Pause,
  Play,
  Plus,
  RotateCcw,
  Target,
} from "lucide-react";
import { useApp } from "@/components/AppProvider";
import { EmptyState, Eyebrow, Metric, Panel, ProgressBar } from "@/components/ui";
import { goalSaved } from "@/lib/metrics";
import type { LearningTrack, ReadingSession } from "@/lib/types";

const uid = () => crypto.randomUUID();

function Header({ eyebrow, title, sub }: { eyebrow: string; title: string; sub: string }) {
  return (
    <header className="page-title">
      <div><Eyebrow>{eyebrow}</Eyebrow><h1>{title}</h1><p>{sub}</p></div>
    </header>
  );
}

export function LearningPage() {
  const { data, update } = useApp();
  const ibm = data.learningTracks.find((track) => track.id === "ibm") ??
    ({ id: "ibm", name: "IBM Cybersecurity", category: "Cybersecurity", progress: 0, hours: 0 } satisfies LearningTrack);
  const learningMinutes = data.dailyLogs.reduce((sum, log) => sum + log.learningMinutes, 0);
  const studyDays = data.dailyLogs.filter((log) => log.learningMinutes > 0).length;
  const updateTrack = (patch: Partial<LearningTrack>) => update((current) => {
    const exists = current.learningTracks.some((track) => track.id === ibm.id);
    return {
      ...current,
      learningTracks: exists
        ? current.learningTracks.map((track) => track.id === ibm.id ? { ...track, ...patch } : track)
        : [...current.learningTracks, { ...ibm, ...patch }],
    };
  });

  return (
    <div className="page module-page ibm-course-page">
      <Header
        eyebrow="IBM COURSE / STUDY WORKSPACE"
        title="IBM CYBERSECURITY"
        sub="Use this page to track where you are in the course, record what each lesson teaches you, and decide the next practical step."
      />
      <div className="metric-grid wide">
        <Metric label="Course progress" value={`${ibm.progress}%`} accent />
        <Metric label="Hours studied" value={`${ibm.hours.toFixed(1)}h`} />
        <Metric label="Study days" value={studyDays} />
        <Metric label="Daily log minutes" value={learningMinutes} />
      </div>
      <div className="ibm-course-grid">
        <Panel accent className="ibm-progress-panel">
          <div className="panel-heading">
            <div><Eyebrow>COURSE EXECUTION</Eyebrow><h3>Progress & study time</h3></div>
            <GraduationCap />
          </div>
          <p className="section-explainer">Update these after a study session so the dashboard reflects your real position.</p>
          <ProgressBar value={ibm.progress} />
          <label>
            Overall course progress
            <input type="range" min="0" max="100" value={ibm.progress} onChange={(event) => updateTrack({ progress: Number(event.target.value) })} />
            <span className="field-value">{ibm.progress}% complete</span>
          </label>
          <label>
            Total hours studied
            <input type="number" min="0" step=".25" value={ibm.hours} onChange={(event) => updateTrack({ hours: Number(event.target.value) })} />
          </label>
          <label>
            Course link
            <input type="url" value={ibm.courseUrl ?? ""} placeholder="Paste the IBM course link" onChange={(event) => updateTrack({ courseUrl: event.target.value })} />
          </label>
          {ibm.courseUrl && <a className="button secondary course-link" href={ibm.courseUrl} target="_blank" rel="noreferrer">Open IBM course <ExternalLink /></a>}
        </Panel>
        <Panel className="ibm-position-panel">
          <Eyebrow>CURRENT POSITION</Eyebrow>
          <h3>Where to resume</h3>
          <p className="section-explainer">Write the exact module and lesson you are on, then leave one clear action for your next session.</p>
          <div className="course-fields">
            <label>Current module<input value={ibm.currentModule ?? ""} placeholder="Example: Module 1 — Cybersecurity foundations" onChange={(event) => updateTrack({ currentModule: event.target.value })} /></label>
            <label>Current lesson<input value={ibm.currentLesson ?? ""} placeholder="The lesson, lab, or assessment to continue" onChange={(event) => updateTrack({ currentLesson: event.target.value })} /></label>
            <label>Next action<textarea value={ibm.nextAction ?? ""} placeholder="A small, specific next step — for example: finish the lab and write three notes" onChange={(event) => updateTrack({ nextAction: event.target.value })} /></label>
          </div>
        </Panel>
        <Panel className="ibm-learning-notes">
          <Eyebrow>TURN LEARNING INTO SKILL</Eyebrow>
          <h3>Lesson notes</h3>
          <p className="section-explainer">Summarise the idea in your own words, then decide how you will practise it instead of only watching it.</p>
          <div className="course-notes-grid">
            <label>What did this lesson teach me?<textarea value={ibm.keyTakeaway ?? ""} placeholder="Explain the main concept as if you were teaching it to someone else" onChange={(event) => updateTrack({ keyTakeaway: event.target.value })} /></label>
            <label>How will I practise or apply it?<textarea value={ibm.practicePlan ?? ""} placeholder="Write the lab, exercise, command, or mini-project you will complete" onChange={(event) => updateTrack({ practicePlan: event.target.value })} /></label>
            <label className="span-2">Important terms, tools, or questions<textarea value={ibm.studyNotes ?? ""} placeholder="Capture definitions, tools to revisit, mistakes, and unanswered questions" onChange={(event) => updateTrack({ studyNotes: event.target.value })} /></label>
          </div>
        </Panel>
      </div>
    </div>
  );
}

function ReadingLogForm({ type, onSave, onCancel }: { type: ReadingSession["type"]; onSave: (formData: FormData) => void; onCancel: () => void }) {
  const isBible = type === "bible";
  return (
    <Panel accent className="reading-form-panel">
      <div className="panel-heading">
        <div><Eyebrow>{isBible ? "NEW BIBLE STUDY" : "NEW READING SESSION"}</Eyebrow><h3>{isBible ? "Record today’s passage" : "Record what you read"}</h3></div>
        {isBible ? <BookMarked /> : <BookOpen />}
      </div>
      <p className="section-explainer">{isBible ? "Write the book and passage, then capture the lesson, conviction, or action you want to remember." : "Write the book, pages, and one useful idea so the reading becomes something you can apply."}</p>
      <form action={onSave} className="form-grid">
        <input type="hidden" name="type" value={type} />
        <label>{isBible ? "Bible book" : "Book title"}<input name="resource" required placeholder={isBible ? "Example: Romans" : "Title and author"} /></label>
        <label>{isBible ? "Chapter / verses" : "Chapter"}<input name="chapter" placeholder={isBible ? "Example: 8:1–17" : "Example: Chapter 4"} /></label>
        {!isBible && <label>Pages read<input name="pages" type="number" min="0" placeholder="0" /></label>}
        <label>Minutes<input name="minutes" type="number" min="1" required placeholder="20" /></label>
        <label>Date<input name="date" type="date" defaultValue={new Date().toISOString().slice(0, 10)} required /></label>
        <label className="span-2">{isBible ? "Main lesson or application" : "One idea worth remembering"}<input name="lesson" placeholder={isBible ? "What should change because I read this?" : "The idea in one clear sentence"} /></label>
        <label className="span-2">Notes<textarea name="notes" placeholder={isBible ? "Prayer, questions, context, or cross-references" : "Ideas, questions, and how you can use what you read"} /></label>
        <div className="form-actions span-2"><button className="button" type="submit">Save session</button><button className="button secondary" type="button" onClick={onCancel}>Cancel</button></div>
      </form>
    </Panel>
  );
}

function ReadingEntry({ session }: { session: ReadingSession }) {
  return (
    <article className="reading-entry">
      <div><Eyebrow>{session.date}{session.chapter ? ` · ${session.chapter}` : ""}</Eyebrow><h4>{session.resource}</h4></div>
      <p>{session.lesson || "Session recorded. Add the main lesson when it becomes clear."}</p>
      <small>{session.minutes} min {session.pages ? `· ${session.pages} pages` : ""}</small>
    </article>
  );
}

export function ReadingPage() {
  const { data, update } = useApp();
  const [form, setForm] = useState<ReadingSession["type"] | null>(null);
  const bible = data.readingSessions.filter((session) => session.type === "bible");
  const books = data.readingSessions.filter((session) => session.type === "book");
  const add = (formData: FormData) => {
    const pages = Number(formData.get("pages"));
    update((current) => ({
      ...current,
      readingSessions: [...current.readingSessions, {
        id: uid(),
        type: String(formData.get("type")) as ReadingSession["type"],
        resource: String(formData.get("resource")),
        chapter: String(formData.get("chapter")) || undefined,
        pages: pages || undefined,
        minutes: Number(formData.get("minutes")),
        date: String(formData.get("date")),
        notes: String(formData.get("notes")),
        lesson: String(formData.get("lesson")),
      }],
    }));
    setForm(null);
  };
  return (
    <div className="page module-page reading-page">
      <Header eyebrow="READING / KNOWLEDGE & FAITH" title="READING" sub="Use the two sections below to keep normal reading and Bible study separate, while saving the ideas and lessons you want to live by." />
      <div className="metric-grid wide">
        <Metric label="Book sessions" value={books.length} accent />
        <Metric label="Pages read" value={books.reduce((sum, session) => sum + (session.pages || 0), 0)} />
        <Metric label="Bible days" value={new Set(bible.map((session) => session.date)).size} />
        <Metric label="Bible minutes" value={bible.reduce((sum, session) => sum + session.minutes, 0)} />
      </div>
      {form && <ReadingLogForm type={form} onSave={add} onCancel={() => setForm(null)} />}
      <div className="reading-sections">
        <Panel className="reading-section reading-books">
          <div className="panel-heading reading-section-heading"><div><Eyebrow>NORMAL READING</Eyebrow><h2>Books & ideas</h2></div><span className="section-icon"><BookOpen /></span></div>
          <p className="section-explainer">Log books, chapters, pages, and the ideas you want to remember or apply.</p>
          <button className="button" onClick={() => setForm("book")}><Plus />Log book reading</button>
          <div className="reading-entry-list">{books.length ? [...books].reverse().map((session) => <ReadingEntry key={session.id} session={session} />) : <EmptyState title="No book sessions yet." body="Record the first book or useful chapter you read." />}</div>
        </Panel>
        <Panel className="reading-section reading-bible">
          <div className="panel-heading reading-section-heading"><div><Eyebrow>BIBLE STUDY</Eyebrow><h2>Scripture & application</h2></div><span className="section-icon"><BookMarked /></span></div>
          <p className="section-explainer">Log the passage, what it taught you, and the response or action you want to take.</p>
          <button className="button" onClick={() => setForm("bible")}><Plus />Log Bible study</button>
          <div className="reading-entry-list">{bible.length ? [...bible].reverse().map((session) => <ReadingEntry key={session.id} session={session} />) : <EmptyState title="No Bible study logged yet." body="Record today’s passage and the lesson you want to carry forward." />}</div>
        </Panel>
      </div>
    </div>
  );
}

export function GoalsPage() {
  const { data, update } = useApp();
  const [alloc, setAlloc] = useState<string | null>(null);
  const add = (formData: FormData) => {
    update((current) => ({ ...current, contributions: [...current.contributions, { id: uid(), goalId: String(formData.get("goalId")), amount: Number(formData.get("amount")), date: new Date().toISOString().slice(0, 10), note: String(formData.get("note")) }] }));
    setAlloc(null);
  };
  return (
    <div className="page module-page">
      <Header eyebrow="OUTCOMES / MISSION CONTROL" title="GOALS" sub="Use this page to record money allocated toward each major goal and see how far you are from the target." />
      <div className="goal-page-grid">
        {data.goals.map((goal) => {
          const saved = goalSaved(data, goal.id);
          const percent = Math.round(saved / goal.target * 100) || 0;
          const months = saved > 0 ? Math.max(1, Math.round(goal.target / Math.max(saved, 1))) : 0;
          return (
            <Panel key={goal.id} className={`large-goal ${goal.id}`}>
              <div className="panel-heading"><div><Eyebrow>{goal.label}</Eyebrow><h2>{goal.name}</h2></div><Target /></div>
              <div className="goal-money"><strong>£{saved.toLocaleString()}</strong><span>/ £{goal.target.toLocaleString()}</span></div>
              <ProgressBar value={saved} max={goal.target} />
              <div className="goal-facts"><span><b>{percent}%</b> funded</span><span><b>{goal.target - saved > 0 ? `£${(goal.target - saved).toLocaleString()}` : "DONE"}</b> remaining</span><span><b>{months ? format(addMonths(new Date(), months), "MMM yyyy") : "—"}</b> current projection</span></div>
              <button className="button" onClick={() => setAlloc(goal.id)}>Allocate funds</button>
              {alloc === goal.id && <form action={add} className="inline-form"><input type="hidden" name="goalId" value={goal.id} /><label>Amount (£)<input name="amount" type="number" min="1" required autoFocus /></label><label>Note<input name="note" placeholder="Invoice, salary, saving…" /></label><button className="button">Allocate</button></form>}
            </Panel>
          );
        })}
      </div>
      <Panel><Eyebrow>M4 SCENARIOS</Eyebrow><h3>If I save consistently…</h3><div className="scenario-grid">{[500, 1000, 1500, 2000].map((amount) => { const remaining = Math.max(0, data.goals[0].target - goalSaved(data, "m4")); return <div key={amount}><span>£{amount.toLocaleString()} / month</span><strong>{format(addMonths(new Date(), Math.ceil(remaining / amount)), "MMM yyyy")}</strong></div>; })}</div></Panel>
    </div>
  );
}

export function IdeasPage() {
  const { data, update } = useApp();
  const [title, setTitle] = useState("");
  const add = () => {
    if (!title.trim()) return;
    update((current) => ({ ...current, ideas: [...current.ideas, { id: uid(), title, description: "", category: "Business", priority: "Medium", status: "INBOX", date: new Date().toISOString().slice(0, 10) }] }));
    setTitle("");
  };
  return (
    <div className="page module-page">
      <Header eyebrow="IDEA VAULT" title="CAPTURE THE SPARK." sub="Use this page to quickly write down business, website, AI, or automation ideas before sorting the promising ones into research and build stages." />
      <Panel accent><div className="idea-capture"><Lightbulb /><input value={title} onChange={(event) => setTitle(event.target.value)} onKeyDown={(event) => event.key === "Enter" && add()} placeholder="Website, business, AI, automation…" autoFocus /><button className="button" onClick={add}>Capture</button></div></Panel>
      {data.ideas.length === 0 ? <EmptyState title="Inbox clear." body="Capture anything worth exploring before it disappears." /> : <div className="idea-board">{["INBOX", "RESEARCH", "MAYBE", "BUILD"].map((status) => <Panel key={status}><Eyebrow>{status}</Eyebrow>{data.ideas.filter((idea) => idea.status === status).map((idea) => <div className="idea-item" key={idea.id}><b>{idea.title}</b><select value={idea.status} onChange={(event) => update((current) => ({ ...current, ideas: current.ideas.map((item) => item.id === idea.id ? { ...item, status: event.target.value } : item) }))}>{["INBOX", "RESEARCH", "MAYBE", "BUILD", "ARCHIVED"].map((option) => <option key={option}>{option}</option>)}</select></div>)}</Panel>)}</div>}
    </div>
  );
}

export function FocusPage() {
  const { update } = useApp();
  const [seconds, setSeconds] = useState(25 * 60);
  const [running, setRunning] = useState(false);
  const [task, setTask] = useState("");
  useEffect(() => {
    if (!running) return;
    const timer = setInterval(() => setSeconds((value) => {
      if (value <= 1) { setRunning(false); return 0; }
      return value - 1;
    }), 1000);
    return () => clearInterval(timer);
  }, [running]);
  const complete = () => {
    update((current) => ({ ...current, focusSessions: [...current.focusSessions, { id: uid(), category: "Business", task: task || "Focus block", minutes: Math.round(seconds / 60), date: new Date().toISOString().slice(0, 10), notes: "", completed: true }] }));
    setRunning(false);
  };
  return (
    <div className="page focus-page">
      <div className="focus-mark"><BrainCircuit /><Eyebrow>LOCK-IN MODE</Eyebrow></div>
      <p className="focus-description">Write the single task you will work on, choose a time block, and press Complete when the focused session is finished.</p>
      <input className="focus-task" value={task} onChange={(event) => setTask(event.target.value)} placeholder="What are you locking in on?" />
      <div className="focus-clock">{String(Math.floor(seconds / 60)).padStart(2, "0")}<i>:</i>{String(seconds % 60).padStart(2, "0")}</div>
      <div className="focus-controls"><button onClick={() => setRunning(!running)}>{running ? <Pause /> : <Play />}{running ? "Pause" : "Start"}</button><button onClick={() => { setRunning(false); setSeconds(25 * 60); }}><RotateCcw />Reset</button><button onClick={complete}>Complete</button></div>
      <div className="focus-presets">{[25, 45, 60, 90].map((minutes) => <button onClick={() => { setRunning(false); setSeconds(minutes * 60); }} key={minutes}>{minutes} min</button>)}</div>
      <p>Execution beats intention.</p>
    </div>
  );
}
