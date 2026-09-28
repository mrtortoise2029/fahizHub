import { AlertCircle } from 'lucide-react';

export function LoadingCards({ count = 3 }) {
  return <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3" aria-label="Loading content">{Array.from({ length: count }, (_, index) => <div className="surface h-80 animate-pulse bg-slate-100 dark:bg-ink-900" key={index}/>)}</div>;
}

export function ErrorState({ message }) {
  return <div className="surface flex items-start gap-3 p-6 text-sm text-slate-600 dark:text-slate-300" role="alert"><AlertCircle className="mt-0.5 shrink-0 text-amber-600" size={19}/><div><p className="font-semibold text-slate-900 dark:text-white">Unable to load this content</p><p className="mt-1">{message}</p></div></div>;
}

