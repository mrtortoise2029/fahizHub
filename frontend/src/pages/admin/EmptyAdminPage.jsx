import { Plus } from 'lucide-react';
import { useLocation } from 'react-router-dom';
export default function EmptyAdminPage(){const title=useLocation().pathname.split('/').pop().replace(/(^.|-.)/g,(s)=>s.replace('-',' ').toUpperCase());return <><div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"><div><h1 className="text-2xl font-bold">{title}</h1><p className="mt-1 text-sm text-slate-500">Manage your {title.toLowerCase()} from one place.</p></div><button className="button-primary"><Plus size={18}/>Add {title.replace(/s$/,'')}</button></div><div className="surface mt-6 p-10 text-center text-sm text-slate-500">No {title.toLowerCase()} yet. Your real data will appear here.</div></>}

