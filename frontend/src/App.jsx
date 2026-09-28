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
import AboutPage from './pages/AboutPage';
import SkillsPage from './pages/SkillsPage';
import EducationPage from './pages/EducationPage';
import ExperiencePage from './pages/ExperiencePage';
import AdminProjectsPage from './pages/admin/AdminProjectsPage';
import MessagesPage from './pages/admin/MessagesPage';
import TasksPage from './pages/admin/TasksPage';
import MeetingsPage from './pages/admin/MeetingsPage';
import StudentPage from './pages/admin/StudentPage';
import LearningPage from './pages/admin/LearningPage';
import AiPage from './pages/admin/AiPage';
import SettingsPage from './pages/admin/SettingsPage';
import CatalogPage from './pages/CatalogPage';
import CatalogAdminPage from './pages/admin/CatalogAdminPage';
import ResumePage from './pages/ResumePage';
import AdminContentPage from './pages/admin/AdminContentPage';

function NotFound(){return <ContentPage eyebrow="404" title="Page not found"><p>The page you requested does not exist.</p></ContentPage>}

export default function App(){const {theme,toggleTheme}=useTheme();return <AuthProvider><Routes><Route element={<PublicLayout theme={theme} toggleTheme={toggleTheme}/>}><Route index element={<HomePage/>}/><Route path="about" element={<AboutPage/>}/><Route path="projects" element={<ProjectsPage/>}/><Route path="projects/:slug" element={<ProjectDetailPage/>}/><Route path="skills" element={<SkillsPage/>}/><Route path="education" element={<EducationPage/>}/><Route path="experience" element={<ExperiencePage/>}/><Route path="services" element={<CatalogPage type="services"/>}/><Route path="achievements" element={<CatalogPage type="achievements"/>}/><Route path="resume" element={<ResumePage/>}/><Route path="contact" element={<ContactPage/>}/><Route path="meetings" element={<MeetingPage/>}/><Route path="*" element={<NotFound/>}/></Route><Route path="admin/login" element={<LoginPage/>}/><Route path="admin" element={<ProtectedRoute><AdminLayout/></ProtectedRoute>}><Route index element={<DashboardPage/>}/><Route path="projects" element={<AdminProjectsPage/>}/><Route path="messages" element={<MessagesPage/>}/><Route path="meetings" element={<MeetingsPage/>}/><Route path="tasks" element={<TasksPage/>}/><Route path="student" element={<StudentPage/>}/><Route path="learning" element={<LearningPage/>}/><Route path="ai" element={<AiPage/>}/><Route path="settings" element={<SettingsPage/>}/><Route path="achievements" element={<CatalogAdminPage type="achievements"/>}/><Route path="services" element={<CatalogAdminPage type="services"/>}/><Route path="education" element={<AdminContentPage type="education"/>}/><Route path="experience" element={<AdminContentPage type="experience"/>}/><Route path="skills" element={<AdminContentPage type="skills"/>}/></Route><Route path="/dashboard" element={<Navigate to="/admin" replace/>}/></Routes></AuthProvider>}
