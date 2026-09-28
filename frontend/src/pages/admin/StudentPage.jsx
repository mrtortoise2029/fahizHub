import { Pencil, Plus, Trash2, X } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import GpaPanel from '../../components/GpaPanel';
import { api } from '../../services/api';

const emptyCourse = { name:'', code:'', credit:'', semester:'', instructor:'', notes:'' };
const emptyAssignment = { title:'', course_id:'', deadline:'', status:'todo', priority:'medium', notes:'' };
const localDateTime = (value) => value ? new Date(value).toISOString().slice(0, 16) : '';

export default function StudentPage() {
  const [courses,setCourses] = useState([]);
  const [assignments,setAssignments] = useState([]);
  const [courseDraft,setCourseDraft] = useState(emptyCourse);
  const [assignmentDraft,setAssignmentDraft] = useState(emptyAssignment);
  const [error,setError] = useState('');
  const load = useCallback(async () => {
    try {
      const [c,a] = await Promise.all([api.get('/student/courses'),api.get('/student/assignments')]);
      setCourses(c.data.data); setAssignments(a.data.data); setError('');
    } catch (err) { setError(err.response?.data?.message || 'Unable to load student data.'); }
  }, []);
  useEffect(() => { load(); }, [load]);

  async function saveCourse(e) {
    e.preventDefault(); const v=Object.fromEntries(new FormData(e.currentTarget));
    try { const payload={...v,credit:Number(v.credit)}; if(courseDraft.id) await api.put(`/student/courses/${courseDraft.id}`,payload); else await api.post('/student/courses',payload); setCourseDraft(emptyCourse); await load(); } catch(err){setError(err.response?.data?.message||'Unable to save course.');}
  }
  async function saveAssignment(e) {
    e.preventDefault(); const v=Object.fromEntries(new FormData(e.currentTarget));
    try { const payload={...v,course_id:v.course_id?Number(v.course_id):null,deadline:v.deadline?new Date(v.deadline).toISOString():''}; if(assignmentDraft.id) await api.put(`/student/assignments/${assignmentDraft.id}`,payload); else await api.post('/student/assignments',payload); setAssignmentDraft(emptyAssignment); await load(); } catch(err){setError(err.response?.data?.message||'Unable to save assignment.');}
  }
  async function remove(path){if(confirm('Delete this item?')){try{await api.delete(path);await load();}catch(err){setError(err.response?.data?.message||'Unable to delete item.');}}}

  return <><h1 className="text-2xl font-bold">Student Center</h1><p className="mt-1 text-sm text-slate-500">Courses, assignments, grading rules, and academic deadlines.</p>{error&&<p className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700" role="alert">{error}</p>}<div className="mt-6 grid gap-6 xl:grid-cols-2"><section className="surface p-5"><h2 className="font-bold">{courseDraft.id?'Edit course':'Courses'}</h2><form className="mt-4 grid gap-3 sm:grid-cols-2" onSubmit={saveCourse}><Field name="name" placeholder="Course name" value={courseDraft.name} required/><Field name="code" placeholder="Code" value={courseDraft.code}/><Field name="credit" placeholder="Credits" type="number" step="0.5" value={courseDraft.credit} required/><Field name="semester" placeholder="Semester" value={courseDraft.semester}/><Field name="instructor" placeholder="Instructor" value={courseDraft.instructor}/><Field name="notes" placeholder="Notes" value={courseDraft.notes}/><button className="button-primary">{courseDraft.id?'Save course':<><Plus size={17}/>Add course</>}</button>{courseDraft.id&&<button className="button-secondary" type="button" onClick={()=>setCourseDraft(emptyCourse)}><X size={17}/>Cancel</button>}</form><div className="mt-5 divide-y dark:divide-slate-800">{courses.map(c=><div className="flex items-center justify-between py-3" key={c.id}><div><p className="font-medium">{c.name}</p><p className="text-xs text-slate-500">{c.code} · {Number(c.credit)} credits · {c.semester}</p></div><div className="flex gap-3"><button aria-label={`Edit ${c.name}`} onClick={()=>setCourseDraft(c)}><Pencil size={17}/></button><button className="text-red-600" aria-label={`Delete ${c.name}`} onClick={()=>remove(`/student/courses/${c.id}`)}><Trash2 size={17}/></button></div></div>)}</div></section><section className="surface p-5"><h2 className="font-bold">{assignmentDraft.id?'Edit assignment':'Assignments'}</h2><form className="mt-4 grid gap-3" onSubmit={saveAssignment}><Field name="title" placeholder="Assignment title" value={assignmentDraft.title} required/><select name="course_id" defaultValue={assignmentDraft.course_id||''} key={`course-${assignmentDraft.id||'new'}`} className="min-h-11 rounded-lg border bg-transparent px-3"><option value="">Choose course</option>{courses.map(c=><option value={c.id} key={c.id}>{c.name}</option>)}</select><Field name="deadline" type="datetime-local" value={localDateTime(assignmentDraft.deadline)} required/><select name="status" defaultValue={assignmentDraft.status||'todo'} key={`status-${assignmentDraft.id||'new'}`} className="min-h-11 rounded-lg border bg-transparent px-3"><option value="todo">To do</option><option value="in_progress">In progress</option><option value="submitted">Submitted</option><option value="completed">Completed</option></select><select name="priority" defaultValue={assignmentDraft.priority||'medium'} key={`priority-${assignmentDraft.id||'new'}`} className="min-h-11 rounded-lg border bg-transparent px-3"><option>medium</option><option>high</option><option>urgent</option><option>low</option></select><Field name="notes" placeholder="Notes" value={assignmentDraft.notes}/><button className="button-primary">{assignmentDraft.id?'Save assignment':<><Plus size={17}/>Add assignment</>}</button>{assignmentDraft.id&&<button className="button-secondary" type="button" onClick={()=>setAssignmentDraft(emptyAssignment)}><X size={17}/>Cancel</button>}</form><div className="mt-5 divide-y dark:divide-slate-800">{assignments.map(a=><div className="flex items-center justify-between py-3" key={a.id}><div><p className="font-medium">{a.title}</p><p className="text-xs text-slate-500">{a.course||'No course'} · {a.deadline?new Date(a.deadline).toLocaleString():'No deadline'}</p></div><div className="flex gap-3"><button aria-label={`Edit ${a.title}`} onClick={()=>setAssignmentDraft(a)}><Pencil size={17}/></button><button className="text-red-600" aria-label={`Delete ${a.title}`} onClick={()=>remove(`/student/assignments/${a.id}`)}><Trash2 size={17}/></button></div></div>)}</div></section></div><GpaPanel/></>;
}
function Field({value='',...props}){return <input className="min-h-11 rounded-lg border bg-transparent px-3 text-sm" defaultValue={value??''} key={`${props.name}-${value}`} {...props}/>;}
