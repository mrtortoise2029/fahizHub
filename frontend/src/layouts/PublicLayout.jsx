import { Outlet } from 'react-router-dom';
import PublicHeader from '../components/PublicHeader';
import Footer from '../components/Footer';
export default function PublicLayout({ theme, toggleTheme }) { return <div className="flex min-h-screen flex-col"><PublicHeader theme={theme} toggleTheme={toggleTheme}/><main className="flex-1"><Outlet/></main><Footer/></div>; }

