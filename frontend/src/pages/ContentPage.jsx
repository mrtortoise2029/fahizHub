export default function ContentPage({ eyebrow, title, children }) { return <div className="container-page py-12 sm:py-16"><p className="eyebrow">{eyebrow}</p><h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl dark:text-white">{title}</h1><div className="mt-6 max-w-3xl space-y-5 text-base leading-8 text-slate-600 dark:text-slate-300">{children}</div></div>; }

