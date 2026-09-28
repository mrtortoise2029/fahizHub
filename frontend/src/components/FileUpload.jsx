import { Upload } from 'lucide-react';
import { useRef, useState } from 'react';
import { api } from '../services/api';

export default function FileUpload({ kind, entityId, accept, label = 'Upload', onUploaded }) {
  const input = useRef(null);
  const [status, setStatus] = useState('');
  async function upload(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    setStatus('Uploading…');
    const body = new FormData();
    body.append('file', file);
    try {
      const { data } = await api.post(`/uploads/${kind}${entityId ? `/${entityId}` : ''}`, body, { headers: { 'Content-Type': 'multipart/form-data' } });
      setStatus('Uploaded');
      onUploaded?.(data.data);
    } catch (error) {
      setStatus(error.response?.data?.message || 'Upload failed');
    } finally {
      event.target.value = '';
    }
  }
  return <div className="inline-flex items-center gap-2"><input ref={input} className="sr-only" type="file" accept={accept} onChange={upload}/><button type="button" className="button-secondary px-3" onClick={() => input.current?.click()}><Upload size={16}/>{label}</button>{status && <span className="text-xs text-slate-500" role="status">{status}</span>}</div>;
}
