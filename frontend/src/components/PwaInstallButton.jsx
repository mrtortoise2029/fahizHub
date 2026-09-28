import { Download } from 'lucide-react';
import { useEffect, useState } from 'react';
export default function PwaInstallButton(){const[prompt,setPrompt]=useState(null);useEffect(()=>{const ready=(event)=>{event.preventDefault();setPrompt(event)};window.addEventListener('beforeinstallprompt',ready);return()=>window.removeEventListener('beforeinstallprompt',ready)},[]);if(!prompt)return null;return <button className="button-secondary px-3" onClick={async()=>{await prompt.prompt();setPrompt(null)}}><Download size={17}/><span className="hidden sm:inline">Install</span></button>}
