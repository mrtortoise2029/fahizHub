import { Github } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { ErrorState } from '../components/ContentState';
import { useApiResource } from '../hooks/useApiResource';

export default function ProjectDetailPage() {
  const { slug } = useParams();
  const {data:project,loading,error}=useApiResource(`/projects/${slug}`);
  if(loading)return <div className="container-page py-24 text-center text-slate-500">Loading project…</div>;
  if(error)return <div className="container-page py-16"><ErrorState message={error}/></div>;
  if(!project)return <div className="container-page py-16"><ErrorState message="Project not found."/></div>;
  const technologies=project.technologies||[];
  const features=Array.isArray(project.features)?project.features:[];
  const server=import.meta.env.VITE_SERVER_URL||(import.meta.env.DEV?'http://localhost:3000':'');
  const sections=[['Overview',project.overview],['Problem',project.problem],['Solution',project.solution],['Challenges',project.challenges],['Lessons learned',project.lessons_learned],['My contribution',project.contribution]].filter(([,value])=>value);
  return <div className="container-page py-12 sm:py-16"><Link className="text-sm font-semibold text-brand-600" to="/projects">← All projects</Link><p className="eyebrow mt-8">{project.category}</p><h1 className="mt-2 text-4xl font-extrabold text-slate-950 sm:text-5xl dark:text-white">{project.title}</h1><p className="mt-3 text-xl text-slate-500">{project.subtitle}</p><p className="mt-6 max-w-3xl text-lg leading-8 text-slate-600 dark:text-slate-300">{project.short_description}</p><div className="mt-8 flex flex-wrap gap-2">{technologies.map((t)=><span className="rounded-md bg-slate-200 px-3 py-1.5 text-sm dark:bg-ink-800" key={t}>{t}</span>)}</div>{project.images?.length>0&&<section className="mt-12"><h2 className="text-2xl font-bold">Screenshots</h2><div className="mt-5 grid gap-4 sm:grid-cols-2">{project.images.map(image=><img className="surface aspect-video w-full object-cover" src={`${server}${image.url}`} alt={image.alt_text||`Screenshot of ${project.title}`} key={image.id}/>)}</div></section>}<section className="mt-12 grid gap-5 md:grid-cols-2">{sections.map(([title,value])=><article className="surface p-6" key={title}><h2 className="text-xl font-bold">{title}</h2><p className="mt-3 whitespace-pre-line leading-7 text-slate-600 dark:text-slate-300">{value}</p></article>)}{features.length>0&&<article className="surface p-6"><h2 className="text-xl font-bold">Key features</h2><ul className="mt-3 list-disc space-y-2 pl-5 text-slate-600 dark:text-slate-300">{features.map((feature)=><li key={feature}>{feature}</li>)}</ul></article>}<article className="surface p-6"><h2 className="text-xl font-bold">Links</h2>{project.github_url?<a className="button-secondary mt-4" href={project.github_url} target="_blank" rel="noreferrer"><Github size={18}/>View on GitHub</a>:<p className="mt-3 text-slate-500">No source link published.</p>}{project.live_url&&<a className="button-primary mt-4 ml-3" href={project.live_url} target="_blank" rel="noreferrer">Open live project</a>}</article></section></div>;
}
