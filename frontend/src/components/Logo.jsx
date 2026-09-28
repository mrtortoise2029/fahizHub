import { Link } from 'react-router-dom';
export default function Logo({ compact = false }) {
  return <Link to="/" className="flex items-center gap-2.5 rounded-md font-bold text-slate-950 dark:text-white" aria-label="Fahiz Ahmed home">
    <span className="grid size-9 place-items-center rounded-lg bg-ink-900 text-sm text-white dark:bg-white dark:text-ink-900">FA</span>
    {!compact && <span>Fahiz Ahmed</span>}
  </Link>;
}

