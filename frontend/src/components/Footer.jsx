import { Github, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';
export default function Footer() {
  return <footer className="border-t border-slate-200 bg-white dark:border-slate-800 dark:bg-ink-900">
    <div className="container-page grid gap-8 py-10 sm:grid-cols-2 sm:items-end">
      <div><p className="font-bold text-slate-950 dark:text-white">Fahiz Ahmed</p><p className="mt-2 max-w-md text-sm text-slate-600 dark:text-slate-400">Building, learning, and turning ideas into practical software.</p></div>
      <div className="flex flex-wrap items-center gap-4 text-sm sm:justify-end">
        <a className="inline-flex items-center gap-1.5 hover:text-brand-600" href="https://github.com/mrtortoise2029" target="_blank" rel="noreferrer"><Github size={17}/>GitHub</a>
        <a className="inline-flex items-center gap-1.5 hover:text-brand-600" href="mailto:"><Mail size={17}/>Email</a>
        <Link to="/projects">Projects</Link><Link to="/resume">Resume</Link>
      </div>
      <p className="text-xs text-slate-500 sm:col-span-2">© {new Date().getFullYear()} Fahiz Ahmed. All rights reserved.</p>
    </div>
  </footer>;
}

