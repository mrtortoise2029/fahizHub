import { Bot, RotateCcw, Send } from 'lucide-react';
import { useState } from 'react';
import { api } from '../services/api';

export default function PublicAiPage() {
  const [messages, setMessages] = useState([]);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');

  async function send(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const message = new FormData(form).get('message')?.trim();
    if (!message) return;
    const history = messages.slice(-12);
    setMessages((items) => [...items, { role: 'user', content: message }]);
    form.reset();
    setSending(true);
    setError('');
    try {
      const { data } = await api.post('/public-ai/chat', { message, history });
      setMessages((items) => [...items, data.data]);
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Fahiz AI is temporarily unavailable.');
    } finally {
      setSending(false);
    }
  }

  return <div className="container-page py-8 sm:py-12">
    <div className="mx-auto max-w-5xl overflow-hidden rounded-xl border border-slate-200 bg-white shadow-soft dark:border-slate-800 dark:bg-ink-900">
      <header className="flex items-center justify-between border-b border-slate-200 p-4 sm:p-5 dark:border-slate-800">
        <div className="flex items-center gap-3"><span className="grid size-10 place-items-center rounded-lg bg-brand-50 text-brand-600 dark:bg-ink-800"><Bot size={21}/></span><div><h1 className="font-bold text-slate-950 dark:text-white">Fahiz AI</h1><p className="text-xs text-slate-500">Public AI assistant</p></div></div>
        <button className="button-secondary px-3" onClick={() => { setMessages([]); setError(''); }}><RotateCcw size={16}/>New chat</button>
      </header>
      <div className="min-h-[52vh] space-y-4 overflow-y-auto p-4 sm:p-6">
        {!messages.length && <div className="grid min-h-[45vh] place-items-center text-center"><div><Bot className="mx-auto text-brand-600" size={36}/><h2 className="mt-4 text-xl font-bold">How can I help?</h2><p className="mt-2 max-w-md text-sm leading-6 text-slate-500">Ask about Fahiz’s public projects, software development, technology, study topics, or general professional questions.</p></div></div>}
        {messages.map((item, index) => <div className={`max-w-3xl whitespace-pre-wrap rounded-xl p-4 text-sm leading-7 ${item.role === 'user' ? 'ml-auto bg-brand-600 text-white' : 'bg-slate-100 dark:bg-ink-800'}`} key={index}>{item.content}</div>)}
        {sending && <div className="max-w-3xl rounded-xl bg-slate-100 p-4 text-sm text-slate-500 dark:bg-ink-800">Thinking…</div>}
        {error && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950/30 dark:text-red-300" role="alert">{error}</p>}
      </div>
      <form className="flex gap-2 border-t border-slate-200 p-4 dark:border-slate-800" onSubmit={send}>
        <textarea name="message" required rows="2" maxLength="6000" placeholder="Ask Fahiz AI…" className="min-h-12 flex-1 resize-none rounded-lg border border-slate-300 bg-transparent p-3 dark:border-slate-700"/>
        <button className="button-primary self-end px-4" disabled={sending} aria-label="Send message"><Send size={18}/><span className="hidden sm:inline">Send</span></button>
      </form>
      <p className="border-t border-slate-100 px-4 py-3 text-xs text-slate-500 dark:border-slate-800">Public chats do not access Fahiz’s private tasks, messages, meetings, or admin conversation history.</p>
    </div>
  </div>;
}
