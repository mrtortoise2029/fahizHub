import { test, expect } from '@playwright/test';

const apiBase=process.env.SERVER_URL||'http://localhost:3000';
const stamp=()=>`${Date.now()}-${Math.random().toString(16).slice(2)}`;

test('admin can create, edit, and clean up core productivity workflows',async({page},testInfo)=>{
  test.skip(testInfo.project.name!=='desktop-chrome','Run the mutating workflow once.');
  test.skip(!process.env.ADMIN_EMAIL||!process.env.ADMIN_PASSWORD,'Admin test credentials are not configured.');
  await page.goto('/admin/login');
  await page.getByLabel('Email').fill(process.env.ADMIN_EMAIL);
  await page.getByLabel('Password').fill(process.env.ADMIN_PASSWORD);
  await page.getByRole('button',{name:'Sign in'}).click();
  await expect(page).toHaveURL(/\/admin$/);
  for(const label of ['Overdue tasks','Pending meetings','Unread messages','Published projects']){
    const card=page.locator('section').filter({has:page.getByRole('heading',{name:label})});
    await expect(card.locator('p')).toHaveText(/^\d+$/);
  }

  const api=page.context().request;const ids={projects:[],goals:[],resources:[],tasks:[],courses:[],grades:[],rules:[],blocks:[]};
  const json=async(response,label)=>{const text=await response.text();expect(response.ok(),`${label}: ${response.status()} ${text}`).toBeTruthy();return response.status()===204?null:JSON.parse(text);};
  try{
    const key=stamp();
    const project={title:'E2E project',slug:`e2e-project-${key}`,subtitle:'Temporary',short_description:'Temporary automated workflow verification project.',overview:'Overview',problem:'Problem',solution:'Solution',features:'Create\nEdit',challenges:'',lessons_learned:'',contribution:'Test',category:'Test',status:'Active',github_url:'',live_url:'',is_published:false};
    let body=await json(await api.post(`${apiBase}/api/projects`,{data:project}),'create project');ids.projects.push(body.data.id);
    await json(await api.put(`${apiBase}/api/projects/${body.data.id}`,{data:{...project,title:'E2E project edited'}}),'edit project');

    body=await json(await api.post(`${apiBase}/api/learning`,{data:{title:'E2E learning goal',description:'Temporary',status:'active',progress:10,target_date:''}}),'create goal');const goalId=body.data.id;ids.goals.push(goalId);
    await json(await api.put(`${apiBase}/api/learning/${goalId}`,{data:{title:'E2E learning goal edited',description:'Temporary',status:'active',progress:50,target_date:''}}),'edit goal');
    body=await json(await api.post(`${apiBase}/api/learning/resources`,{data:{goal_id:goalId,title:'E2E resource',url:'https://example.com',notes:'Temporary',is_completed:false}}),'create resource');ids.resources.push(body.data.id);
    await json(await api.put(`${apiBase}/api/learning/resources/${body.data.id}`,{data:{goal_id:goalId,title:'E2E resource edited',url:'https://example.com',notes:'Temporary',is_completed:true}}),'edit resource');

    const due=new Date(Date.now()+86400000).toISOString();const task={title:`E2E recurring task ${key}`,notes:'Temporary',priority:'low',due_at:due,status:'todo',category_id:null,recurrence_rule:'daily'};
    body=await json(await api.post(`${apiBase}/api/tasks`,{data:task}),'create recurring task');ids.tasks.push(body.data.id);
    await json(await api.put(`${apiBase}/api/tasks/${body.data.id}`,{data:{...task,status:'completed'}}),'complete recurring task');
    body=await json(await api.get(`${apiBase}/api/tasks`),'list tasks');const next=body.data.find((item)=>item.title===task.title&&item.status==='todo');expect(next).toBeTruthy();ids.tasks.push(next.id);

    body=await json(await api.post(`${apiBase}/api/student/courses`,{data:{name:'E2E course',code:'E2E',credit:3,semester:'Test',instructor:'Test',notes:''}}),'create course');ids.courses.push(body.data.id);
    await json(await api.put(`${apiBase}/api/student/courses/${body.data.id}`,{data:{name:'E2E course edited',code:'E2E',credit:3,semester:'Test',instructor:'Test',notes:''}}),'edit course');

    body=await json(await api.get(`${apiBase}/api/student/grading-rules`),'list grading rules');let selected=body.data.find((rule)=>Number.isFinite(Number(rule.min_mark))&&Number.isFinite(Number(rule.max_mark)));
    if(!selected){body=await json(await api.post(`${apiBase}/api/student/grading-rules`,{data:{label:`E2E-${Date.now()%100000000}`,min_mark:0,max_mark:100,grade_point:4,display_order:999}}),'create grading rule');selected=body.data;ids.rules.push(selected.id);}
    const mark=(Number(selected.min_mark)+Number(selected.max_mark))/2;
    body=await json(await api.post(`${apiBase}/api/student/grades`,{data:{course_name:'E2E GPA course',credit:3,mark,grade_label:'',grade_point:null}}),'calculate configured grade');ids.grades.push(body.data.id);expect(body.data.grade_label).toBe(selected.label);

    const start=new Date(Date.now()+172800000);const end=new Date(start.getTime()+3600000);
    body=await json(await api.post(`${apiBase}/api/meetings/blocked-slots`,{data:{start_time:start.toISOString(),end_time:end.toISOString(),reason:'E2E verification'}}),'create meeting block');ids.blocks.push(body.data.id);

    await page.goto('/admin/learning');await expect(page.getByRole('heading',{name:'E2E learning goal edited'})).toBeVisible();await expect(page.getByText('E2E resource edited',{exact:true})).toBeVisible();
    await page.goto('/admin/tasks');await expect(page.getByText(task.title,{exact:true}).first()).toBeVisible({timeout:10000});
  }finally{
    for(const id of ids.resources.reverse())await api.delete(`${apiBase}/api/learning/resources/${id}`);
    for(const id of ids.goals.reverse())await api.delete(`${apiBase}/api/learning/${id}`);
    for(const id of ids.tasks.reverse())await api.delete(`${apiBase}/api/tasks/${id}`);
    for(const id of ids.courses.reverse())await api.delete(`${apiBase}/api/student/courses/${id}`);
    for(const id of ids.grades.reverse())await api.delete(`${apiBase}/api/student/grades/${id}`);
    for(const id of ids.rules.reverse())await api.delete(`${apiBase}/api/student/grading-rules/${id}`);
    for(const id of ids.blocks.reverse())await api.delete(`${apiBase}/api/meetings/blocked-slots/${id}`);
    for(const id of ids.projects.reverse())await api.delete(`${apiBase}/api/projects/${id}`);
  }
});
