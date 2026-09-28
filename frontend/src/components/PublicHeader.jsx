import { Menu, Moon, Sun, X } from 'lucide-react';
import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import Logo from './Logo';

const links = [['About', '/about'], ['Projects', '/projects'], ['Skills', '/skills'], ['Experience', '/experience'], ['Services', '/services'], ['Resume', '/resume'], ['Contact', '/contact']];

export default function PublicHeader({ theme, toggleTheme }) {
  const [open, setOpen] = useState(false);
  const navClass = ({ isActive }) => `rounded-md px-2 py-2 text-sm font-medium transition ${isActive ? 'text-brand-600 dark:text-brand-500' : 'text-slate-600 hover:text-slate-950 dark:text-slate-300 dark:hover:text-white'}`;
  return <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/90 backdrop-blur dark:border-slate-800 dark:bg-ink-950/90">
    <div className="container-page flex h-16 items-center justify-between">
      <Logo />
      <nav className="hidden items-center gap-1 lg:flex" aria-label="Main navigation">
        {links.map(([label, to]) => <NavLink className={navClass} to={to} key={to}>{label}</NavLink>)}
      </nav>
      <div className="flex items-center gap-2">
        <button className="grid size-11 place-items-center rounded-lg hover:bg-slate-100 dark:hover:bg-ink-800" onClick={toggleTheme} aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}>
          {theme === 'dark' ? <Sun size={19} /> : <Moon size={19} />}
        </button>
        <Link to="/meetings" className="button-primary hidden sm:inline-flex">Book a meeting</Link>
        <button className="grid size-11 place-items-center rounded-lg lg:hidden" onClick={() => setOpen(!open)} aria-expanded={open} aria-controls="mobile-menu" aria-label="Toggle navigation">
          {open ? <X /> : <Menu />}
        </button>
      </div>
    </div>
    {open && <nav id="mobile-menu" className="container-page border-t border-slate-200 py-3 lg:hidden dark:border-slate-800" aria-label="Mobile navigation">
      <div className="grid grid-cols-2 gap-1 sm:grid-cols-3">
        {links.map(([label, to]) => <NavLink className={navClass} to={to} key={to} onClick={() => setOpen(false)}>{label}</NavLink>)}
        <NavLink className={navClass} to="/meetings" onClick={() => setOpen(false)}>Book meeting</NavLink>
      </div>
    </nav>}
  </header>;
}

