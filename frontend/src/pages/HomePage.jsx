import { ArrowRight, Calendar, Code2, GraduationCap, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import ProjectCard from '../components/ProjectCard';
import { seedProjects } from '../data/fallback';

const highlights = [[GraduationCap, 'CSE Student'], [Code2, 'Full-Stack Development'], [Users, 'UIU Computer Club — Head of HR']];

export default function HomePage() {
  return <>
    <section className="relative overflow-hidden border-b border-slate-200 dark:border-slate-800">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_80%_10%,rgba(37,99,235,.11),transparent_38%)]" />
      <div className="container-page grid gap-12 py-16 sm:py-24 lg:grid-cols-[1.2fr_.8fr] lg:items-center lg:py-28">
        <div>
          <p className="eyebrow">Hello, I’m Fahiz Ahmed</p>
          <h1 className="mt-5 max-w-3xl text-4xl font-extrabold leading-[1.12] tracking-[-0.035em] text-slate-950 sm:text-5xl lg:text-6xl dark:text-white">Computer Science Student Building Practical Software Solutions.</h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600 dark:text-slate-300">Exploring software engineering, full-stack development, intelligent systems, and practical technology through projects and continuous learning.</p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link className="button-primary" to="/projects">View my work <ArrowRight size={18}/></Link>
            <Link className="button-secondary" to="/meetings"><Calendar size={18}/> Book a meeting</Link>
            <Link className="button-secondary" to="/resume">Download CV</Link>
          </div>
        </div>
        <aside className="surface p-5 sm:p-7" aria-label="Current focus">
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">Currently</p>
          <p className="mt-3 text-lg font-semibold leading-7 text-slate-950 dark:text-white">Learning and building with React, Node.js, databases, AI APIs, and modern software engineering practices.</p>
          <div className="mt-6 grid gap-3">
            {highlights.map(([Icon, text]) => <div className="flex min-h-12 items-center gap-3 rounded-lg bg-slate-50 px-4 dark:bg-ink-800" key={text}><Icon className="text-brand-600" size={19}/><span className="text-sm font-medium">{text}</span></div>)}
          </div>
        </aside>
      </div>
    </section>
    <section className="container-page py-16 sm:py-20">
      <div className="flex items-end justify-between gap-4"><div><p className="eyebrow">Selected work</p><h2 className="section-title mt-2">Projects built through curiosity and practice</h2></div><Link to="/projects" className="hidden text-sm font-semibold text-brand-600 sm:block">All projects →</Link></div>
      <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">{seedProjects.map((project) => <ProjectCard project={project} key={project.id}/>)}</div>
    </section>
  </>;
}

