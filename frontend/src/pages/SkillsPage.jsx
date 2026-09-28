import { ErrorState } from '../components/ContentState';
import { useApiResource } from '../hooks/useApiResource';

export default function SkillsPage() {
  const { data, loading, error } = useApiResource('/content/skills', []);
  return <div className="container-page py-12 sm:py-16"><p className="eyebrow">Capabilities</p><h1 className="mt-2 text-3xl font-bold sm:text-4xl">Skills and technologies</h1><p className="mt-4 max-w-2xl text-slate-600 dark:text-slate-300">Tools used through study and practical projects, grouped without artificial proficiency percentages.</p>
    <div className="mt-8">{loading ? <p className="text-slate-500">Loading skills…</p> : error ? <ErrorState message={error}/> : data.length ? <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">{data.map((category)=><section className="surface p-5" key={category.id}><h2 className="font-bold text-slate-950 dark:text-white">{category.name}</h2><div className="mt-4 flex flex-wrap gap-2">{category.skills.map((skill)=><span className="rounded-md bg-slate-100 px-3 py-1.5 text-sm font-medium dark:bg-ink-800" key={skill.id}>{skill.name}</span>)}</div></section>)}</div> : <div className="surface p-8 text-center text-slate-500">No skills published yet.</div>}</div>
  </div>;
}

