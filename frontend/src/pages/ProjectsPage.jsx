import { Search } from 'lucide-react';
import { useMemo, useState } from 'react';
import ProjectCard from '../components/ProjectCard';
import { ErrorState, LoadingCards } from '../components/ContentState';
import { useApiResource } from '../hooks/useApiResource';
const filters = ['All', 'Web', 'Full Stack', 'Java', 'AI', 'Academic', 'Personal'];
export default function ProjectsPage() {
  const [query, setQuery] = useState(''); const [filter, setFilter] = useState('All');
  const { data, loading, error } = useApiResource('/projects', []);
  const projects = useMemo(() => data.filter((p) => (filter === 'All' || p.category?.includes(filter)) && `${p.title} ${(p.technologies || []).join(' ')}`.toLowerCase().includes(query.toLowerCase())), [data, query, filter]);
  return <div className="container-page py-12 sm:py-16"><p className="eyebrow">Portfolio</p><h1 className="mt-2 text-3xl font-bold text-slate-950 sm:text-4xl dark:text-white">Projects</h1><p className="mt-4 max-w-2xl text-slate-600 dark:text-slate-300">Practical software work across web development, intelligent systems, and academic exploration.</p>
    <div className="mt-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between"><div className="flex gap-2 overflow-x-auto pb-1" role="group" aria-label="Filter projects">{filters.map((item) => <button className={`shrink-0 rounded-lg px-3.5 py-2 text-sm font-medium ${filter === item ? 'bg-ink-900 text-white dark:bg-white dark:text-ink-900' : 'bg-white dark:bg-ink-900'}`} onClick={() => setFilter(item)} key={item}>{item}</button>)}</div><label className="relative block lg:w-72"><span className="sr-only">Search projects</span><Search className="absolute left-3 top-3 text-slate-400" size={18}/><input className="min-h-11 w-full rounded-lg border border-slate-300 bg-white pl-10 pr-3 text-sm dark:border-slate-700 dark:bg-ink-900" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search name or technology"/></label></div>
    <div className="mt-8">{loading ? <LoadingCards/> : error ? <ErrorState message={error}/> : projects.length ? <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">{projects.map((p) => <ProjectCard project={p} key={p.id}/>)}</div> : <div className="surface p-10 text-center text-slate-500">No projects match your search.</div>}</div>
  </div>;
}
