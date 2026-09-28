import { Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { useTheme } from './hooks/useTheme';
import PublicLayout from './layouts/PublicLayout';
import AdminLayout from './layouts/AdminLayout';
import ProtectedRoute from './components/ProtectedRoute';
import HomePage from './pages/HomePage';
import ProjectsPage from './pages/ProjectsPage';
import ProjectDetailPage from './pages/ProjectDetailPage';
import ContentPage from './pages/ContentPage';
import ContactPage from './pages/ContactPage';
import MeetingPage from './pages/MeetingPage';
import LoginPage from './pages/admin/LoginPage';
import DashboardPage from './pages/admin/DashboardPage';
import EmptyAdminPage from './pages/admin/EmptyAdminPage';
import AboutPage from './pages/AboutPage';
import SkillsPage from './pages/SkillsPage';
import EducationPage from './pages/EducationPage';
import ExperiencePage from './pages/ExperiencePage';

function Simple({type}){const copy={services:'Available for conversations about web development, frontend, backend, database design, and technical projects.',resume:'A database-driven professional resume and downloadable CV will be available here.',achievements:'Published achievements, certifications, workshops, and leadership milestones will appear here.'};return <ContentPage eyebrow="Professional profile" title={type[0].toUpperCase()+type.slice(1)}><p>{copy[type]}</p></ContentPage>}
function NotFound(){return <ContentPage eyebrow="404" title="Page not found"><p>The page you requested does not exist.</p></ContentPage>}

export default function App(){const {theme,toggleTheme}=useTheme();return <AuthProvider><Routes><Route element={<PublicLayout theme={theme} toggleTheme={toggleTheme}/>}><Route index element={<HomePage/>}/><Route path="about" element={<AboutPage/>}/><Route path="projects" element={<ProjectsPage/>}/><Route path="projects/:slug" element={<ProjectDetailPage/>}/><Route path="skills" element={<SkillsPage/>}/><Route path="education" element={<EducationPage/>}/><Route path="experience" element={<ExperiencePage/>}/>{['services','resume','achievements'].map((type)=><Route path={type} element={<Simple type={type}/>} key={type}/>)}<Route path="contact" element={<ContactPage/>}/><Route path="meetings" element={<MeetingPage/>}/><Route path="*" element={<NotFound/>}/></Route><Route path="admin/login" element={<LoginPage/>}/><Route path="admin" element={<ProtectedRoute><AdminLayout/></ProtectedRoute>}><Route index element={<DashboardPage/>}/>{['projects','messages','meetings','tasks','ai','education','experience','skills','learning','settings'].map((path)=><Route path={path} element={<EmptyAdminPage/>} key={path}/>)}</Route><Route path="/dashboard" element={<Navigate to="/admin" replace/>}/></Routes></AuthProvider>}
