"use client";

import {
  CheckCircle2,
  Circle,
  CircleDot,
  Clock3,
  Code2,
  ExternalLink,
  GraduationCap,
  Layers3,
  Rocket,
} from "lucide-react";
import { useApp } from "@/components/AppProvider";
import { Eyebrow, Metric, Panel, ProgressBar } from "@/components/ui";
import {
  certificateProgress,
  completedCourseCount,
  IBM_CERTIFICATE_HOURS,
  IBM_FULL_STACK_COURSES,
  IBM_FULL_STACK_URL,
} from "@/lib/ibm-course";
import type { IbmCertificateCourse } from "@/lib/ibm-course";
import type { LearningTrack } from "@/lib/types";

const fallbackTrack: LearningTrack = {
  id: "ibm",
  name: "IBM Full Stack Software Developer",
  category: "Full Stack Cloud Development",
  progress: 0,
  hours: 0,
  courseUrl: IBM_FULL_STACK_URL,
};

const progressOptions = [
  { value: 0, label: "Not started" },
  { value: 25, label: "Started · 25%" },
  { value: 50, label: "Halfway · 50%" },
  { value: 75, label: "Nearly done · 75%" },
  { value: 100, label: "Complete · 100%" },
];

function CourseStatusIcon({ progress }: { progress: number }) {
  if (progress >= 100) return <CheckCircle2 aria-hidden="true" />;
  if (progress > 0) return <CircleDot aria-hidden="true" />;
  return <Circle aria-hidden="true" />;
}

function CourseRoadmapItem({
  course,
  number,
  progress,
  onProgressChange,
}: {
  course: IbmCertificateCourse;
  number: number;
  progress: number;
  onProgressChange: (value: number) => void;
}) {
  const status = progress >= 100 ? "Complete" : progress > 0 ? "In progress" : "Not started";

  return (
    <article className={`course-roadmap-item ${progress >= 100 ? "complete" : progress > 0 ? "active" : ""}`}>
      <div className="course-step" aria-hidden="true">{String(number).padStart(2, "0")}</div>
      <div className="course-roadmap-copy">
        <div className="course-meta"><span>{course.phase}</span><span><Clock3 aria-hidden="true" />{course.hours} hours</span></div>
        <h3>{course.title}</h3>
        <p>{course.focus}</p>
        <div className="course-skill-tags" aria-label={`Skills covered in ${course.title}`}>
          {course.skills.map((skill) => <span key={skill}>{skill}</span>)}
        </div>
      </div>
      <label className="course-progress-control">
        <span><CourseStatusIcon progress={progress} />{status}</span>
        <select
          aria-label={`Progress for ${course.title}`}
          value={progress}
          onChange={(event) => onProgressChange(Number(event.target.value))}
        >
          {progressOptions.map((option) => <option value={option.value} key={option.value}>{option.label}</option>)}
        </select>
      </label>
    </article>
  );
}

export function IbmCoursePage() {
  const { data, update } = useApp();
  const ibm = data.learningTracks.find((track) => track.id === "ibm") ?? fallbackTrack;
  const courseProgress = ibm.courseProgress ?? {};
  const roadmapProgress = certificateProgress(courseProgress);
  const completedCourses = completedCourseCount(courseProgress);
  const studyDays = data.dailyLogs.filter((log) => log.learningMinutes > 0).length;
  const courseUrl = ibm.courseUrl?.trim() || IBM_FULL_STACK_URL;

  const updateTrack = (patch: Partial<LearningTrack>) => update((current) => {
    const exists = current.learningTracks.some((track) => track.id === ibm.id);
    return {
      ...current,
      learningTracks: exists
        ? current.learningTracks.map((track) => track.id === ibm.id ? { ...track, ...patch } : track)
        : [...current.learningTracks, { ...fallbackTrack, ...patch }],
    };
  });

  const updateCourseProgress = (courseId: string, value: number) => update((current) => {
    const existing = current.learningTracks.find((track) => track.id === "ibm") ?? fallbackTrack;
    const nextCourseProgress = { ...existing.courseProgress, [courseId]: value };
    const nextTrack: LearningTrack = {
      ...existing,
      name: "IBM Full Stack Software Developer",
      category: "Full Stack Cloud Development",
      courseUrl: existing.courseUrl?.trim() || IBM_FULL_STACK_URL,
      courseProgress: nextCourseProgress,
      progress: Math.max(existing.progress, certificateProgress(nextCourseProgress)),
    };
    const exists = current.learningTracks.some((track) => track.id === "ibm");
    return {
      ...current,
      learningTracks: exists
        ? current.learningTracks.map((track) => track.id === "ibm" ? nextTrack : track)
        : [...current.learningTracks, nextTrack],
    };
  });

  return (
    <div className="page module-page ibm-course-page">
      <header className="page-title ibm-page-title">
        <div>
          <Eyebrow>IBM / SOFTWARE DEVELOPER PROFESSIONAL CERTIFICATE</Eyebrow>
          <h1>FULL STACK<br /><i>CLOUD DEVELOPER.</i></h1>
          <p>Use this workspace to move through the official course sequence, record each lab, and turn every lesson into portfolio evidence.</p>
        </div>
        <a className="button ibm-primary-link" href={courseUrl} target="_blank" rel="noreferrer">
          Open on Coursera <ExternalLink aria-hidden="true" />
        </a>
      </header>

      <div className="metric-grid wide">
        <Metric label="Certificate progress" value={`${ibm.progress}%`} accent />
        <Metric label="Courses complete" value={`${completedCourses} / ${IBM_FULL_STACK_COURSES.length}`} />
        <Metric label="Syllabus time" value={`${IBM_CERTIFICATE_HOURS}h`} />
        <Metric label="Hours studied" value={`${ibm.hours.toFixed(1)}h`} />
      </div>

      <div className="ibm-course-layout">
        <Panel accent className="ibm-certificate-overview">
          <div className="panel-heading">
            <div><Eyebrow>WHAT THIS CERTIFICATE BUILDS</Eyebrow><h2>Build. Ship. Prove.</h2></div>
            <span className="section-icon"><Layers3 aria-hidden="true" /></span>
          </div>
          <p className="section-explainer">The programme moves from software and cloud foundations into front end, back end, cloud-native deployment, a capstone, AI-assisted development, and interview preparation.</p>
          <div className="certificate-path">
            <div><Code2 aria-hidden="true" /><span><b>01 / BUILD</b>HTML, CSS, JavaScript and React interfaces.</span></div>
            <div><Layers3 aria-hidden="true" /><span><b>02 / CONNECT</b>Node, Express, Python, Flask, Django and SQL.</span></div>
            <div><Rocket aria-hidden="true" /><span><b>03 / SHIP</b>Docker, Kubernetes, OpenShift, microservices and serverless.</span></div>
            <div><GraduationCap aria-hidden="true" /><span><b>04 / PROVE</b>Capstone, assessment, GitHub portfolio and interviews.</span></div>
          </div>
          <div className="course-link-field">
            <label>Certificate link<input type="url" value={courseUrl} onChange={(event) => updateTrack({ courseUrl: event.target.value })} /></label>
          </div>
        </Panel>

        <Panel className="ibm-position-panel">
          <div className="panel-heading">
            <div><Eyebrow>NEXT STUDY SESSION</Eyebrow><h3>Know exactly where to resume</h3></div>
            <span className="study-day-count">{studyDays}<small>study days</small></span>
          </div>
          <p className="section-explainer">Select the course you are working through, then leave one precise next action. Everything here saves automatically.</p>
          <div className="course-fields">
            <label>Current course
              <select value={ibm.currentCourseId ?? ""} onChange={(event) => updateTrack({ currentCourseId: event.target.value })}>
                <option value="">Choose the course to continue</option>
                {IBM_FULL_STACK_COURSES.map((course, index) => <option key={course.id} value={course.id}>{index + 1}. {course.title}</option>)}
              </select>
            </label>
            <div className="current-study-row">
              <label>Module / week<input value={ibm.currentModule ?? ""} placeholder="Example: Week 2 — React components" onChange={(event) => updateTrack({ currentModule: event.target.value })} /></label>
              <label>Lesson / lab<input value={ibm.currentLesson ?? ""} placeholder="The exact lesson, lab, or quiz" onChange={(event) => updateTrack({ currentLesson: event.target.value })} /></label>
            </div>
            <label>Next action<textarea value={ibm.nextAction ?? ""} placeholder="Example: finish the shopping-cart lab, commit it to GitHub, then write three notes" onChange={(event) => updateTrack({ nextAction: event.target.value })} /></label>
            <div className="study-progress-fields">
              <label>Overall certificate progress
                <input type="range" min="0" max="100" value={ibm.progress} onChange={(event) => updateTrack({ progress: Number(event.target.value) })} />
                <span className="field-value">{ibm.progress}% complete</span>
              </label>
              <label>Total hours studied<input type="number" inputMode="decimal" min="0" step=".25" value={ibm.hours} onChange={(event) => updateTrack({ hours: Number(event.target.value) })} /></label>
            </div>
          </div>
        </Panel>

        <Panel className="ibm-roadmap-panel">
          <div className="roadmap-heading">
            <div><Eyebrow>OFFICIAL 15-COURSE SEQUENCE</Eyebrow><h2>Certificate roadmap</h2><p>Complete the courses in order where possible: later projects build on the earlier foundations.</p></div>
            <div className="roadmap-meter">
              <strong>{roadmapProgress}%</strong><span>roadmap average</span><ProgressBar value={roadmapProgress} />
            </div>
          </div>
          <div className="course-roadmap-list">
            {IBM_FULL_STACK_COURSES.map((course, index) => (
              <CourseRoadmapItem
                key={course.id}
                course={course}
                number={index + 1}
                progress={courseProgress[course.id] ?? 0}
                onProgressChange={(value) => updateCourseProgress(course.id, value)}
              />
            ))}
          </div>
        </Panel>

        <Panel className="ibm-portfolio-panel">
          <div className="panel-heading"><div><Eyebrow>PORTFOLIO CHECKPOINTS</Eyebrow><h3>Evidence you should finish with</h3></div><Rocket aria-hidden="true" /></div>
          <p className="section-explainer">Do not only finish videos. Keep the strongest labs polished, documented, and visible on GitHub.</p>
          <ul className="portfolio-checklist">
            <li><CheckCircle2 aria-hidden="true" /><span>Responsive HTML, CSS and JavaScript projects</span></li>
            <li><CheckCircle2 aria-hidden="true" /><span>React front end with a Node and Express back end</span></li>
            <li><CheckCircle2 aria-hidden="true" /><span>Python / Flask AI application with tests</span></li>
            <li><CheckCircle2 aria-hidden="true" /><span>Django and SQL database application</span></li>
            <li><CheckCircle2 aria-hidden="true" /><span>Containerised app deployed with Kubernetes / OpenShift</span></li>
            <li><CheckCircle2 aria-hidden="true" /><span>Cloud-native capstone with CI/CD and a clear README</span></li>
          </ul>
        </Panel>

        <Panel className="ibm-learning-notes">
          <Eyebrow>TURN THE LESSON INTO SKILL</Eyebrow>
          <h3>Study notes & practical application</h3>
          <p className="section-explainer">Explain the lesson in your own words, practise it in code, and keep the questions that need another pass.</p>
          <div className="course-notes-grid">
            <label>What did this lesson teach me?<textarea value={ibm.keyTakeaway ?? ""} placeholder="Explain the main concept as if you were teaching another developer" onChange={(event) => updateTrack({ keyTakeaway: event.target.value })} /></label>
            <label>How will I practise or apply it?<textarea value={ibm.practicePlan ?? ""} placeholder="Write the lab, command, feature, or mini-project you will complete" onChange={(event) => updateTrack({ practicePlan: event.target.value })} /></label>
            <label className="span-2">Important terms, code, mistakes, and questions<textarea value={ibm.studyNotes ?? ""} placeholder="Keep definitions, useful commands, bugs you solved, and anything to revisit" onChange={(event) => updateTrack({ studyNotes: event.target.value })} /></label>
          </div>
        </Panel>
      </div>
    </div>
  );
}

export default IbmCoursePage;
