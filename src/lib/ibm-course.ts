export interface IbmCertificateCourse {
  id: string;
  title: string;
  hours: number;
  phase: string;
  focus: string;
  skills: string[];
}

export const IBM_FULL_STACK_URL = "https://www.coursera.org/professional-certificates/ibm-full-stack-cloud-developer";

export const IBM_FULL_STACK_COURSES: IbmCertificateCourse[] = [
  {
    id: "software-engineering",
    title: "Introduction to Software Engineering",
    hours: 15,
    phase: "FOUNDATIONS",
    focus: "Understand the SDLC, software architecture, programming concepts, and developer roles.",
    skills: ["SDLC", "Architecture", "Python basics"],
  },
  {
    id: "cloud-computing",
    title: "Introduction to Cloud Computing",
    hours: 12,
    phase: "FOUNDATIONS",
    focus: "Learn cloud service models, deployment models, cloud-native development, and DevOps concepts.",
    skills: ["IaaS / PaaS / SaaS", "Cloud native", "DevOps"],
  },
  {
    id: "html-css-javascript",
    title: "Introduction to HTML, CSS, & JavaScript",
    hours: 15,
    phase: "FRONT END",
    focus: "Build responsive pages and add interaction with JavaScript, the DOM, and form validation.",
    skills: ["HTML", "CSS", "JavaScript"],
  },
  {
    id: "git-github",
    title: "Getting Started with Git and GitHub",
    hours: 11,
    phase: "DEVELOPER WORKFLOW",
    focus: "Use repositories, branches, pull requests, and collaboration workflows to publish your work.",
    skills: ["Git", "GitHub", "Pull requests"],
  },
  {
    id: "react",
    title: "Developing Front-End Apps with React",
    hours: 16,
    phase: "FRONT END",
    focus: "Create reusable interfaces with React, JSX, components, state, hooks, forms, and Redux.",
    skills: ["React", "Hooks", "Redux"],
  },
  {
    id: "node-express",
    title: "Developing Back-End Apps with Node.js and Express",
    hours: 14,
    phase: "BACK END",
    focus: "Create server-side applications and APIs with Node.js, Express, npm, and asynchronous JavaScript.",
    skills: ["Node.js", "Express", "REST APIs"],
  },
  {
    id: "python",
    title: "Python for Data Science, AI & Development",
    hours: 24,
    phase: "BACK END",
    focus: "Build a solid Python foundation and work with data, REST APIs, notebooks, and common libraries.",
    skills: ["Python", "Pandas / NumPy", "REST APIs"],
  },
  {
    id: "python-flask-ai",
    title: "Developing AI Applications with Python and Flask",
    hours: 12,
    phase: "BACK END + AI",
    focus: "Package and test Python code, build Flask CRUD applications, and deploy an AI-powered app.",
    skills: ["Flask", "Unit testing", "AI integration"],
  },
  {
    id: "django-sql",
    title: "Django Application Development with SQL and Databases",
    hours: 15,
    phase: "FULL STACK",
    focus: "Design relational data, write SQL, use Django ORM, and connect templates to a database.",
    skills: ["Django", "SQL", "ORM"],
  },
  {
    id: "containers",
    title: "Introduction to Containers w/ Docker, Kubernetes & OpenShift",
    hours: 18,
    phase: "CLOUD NATIVE",
    focus: "Package, deploy, and manage applications using containers and declarative Kubernetes resources.",
    skills: ["Docker", "Kubernetes", "OpenShift"],
  },
  {
    id: "microservices-serverless",
    title: "Application Development using Microservices and Serverless",
    hours: 16,
    phase: "CLOUD NATIVE",
    focus: "Design, document, test, containerise, and deploy microservices and serverless APIs.",
    skills: ["Microservices", "Serverless", "Swagger / Postman"],
  },
  {
    id: "capstone",
    title: "Full Stack Application Development Capstone Project",
    hours: 17,
    phase: "PROVE THE SKILL",
    focus: "Combine the full stack, deploy it to the cloud, and use containers, serverless, and CI/CD.",
    skills: ["Full stack", "CI/CD", "Cloud deployment"],
  },
  {
    id: "assessment",
    title: "Full Stack Software Developer Assessment",
    hours: 7,
    phase: "PROVE THE SKILL",
    focus: "Test your command of the certificate's front-end, back-end, cloud, deployment, and troubleshooting skills.",
    skills: ["Assessment", "Troubleshooting", "Cloud development"],
  },
  {
    id: "generative-ai",
    title: "Generative AI: Elevate your Software Development Career",
    hours: 25,
    phase: "AI-ASSISTED DEVELOPMENT",
    focus: "Use generative and agentic AI for coding, architecture, debugging, refactoring, and automation responsibly.",
    skills: ["Generative AI", "Agentic workflows", "Code review"],
  },
  {
    id: "career-preparation",
    title: "Software Developer Career Guide and Interview Preparation",
    hours: 11,
    phase: "GET HIRED",
    focus: "Prepare your portfolio, job search, networking, technical interviews, and behavioural interviews.",
    skills: ["Portfolio", "Interviews", "Job search"],
  },
];

export const IBM_CERTIFICATE_HOURS = IBM_FULL_STACK_COURSES.reduce((total, course) => total + course.hours, 0);

export function certificateProgress(courseProgress: Record<string, number> = {}): number {
  if (IBM_FULL_STACK_COURSES.length === 0) return 0;
  const total = IBM_FULL_STACK_COURSES.reduce((sum, course) => {
    const value = courseProgress[course.id] ?? 0;
    return sum + Math.min(100, Math.max(0, value));
  }, 0);
  return Math.round(total / IBM_FULL_STACK_COURSES.length);
}

export function completedCourseCount(courseProgress: Record<string, number> = {}): number {
  return IBM_FULL_STACK_COURSES.filter((course) => (courseProgress[course.id] ?? 0) >= 100).length;
}
