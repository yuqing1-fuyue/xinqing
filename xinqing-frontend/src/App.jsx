import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import SidebarIconBar from './components/SidebarIconBar';
import HomePage from './pages/HomePage';
import MoodPage from './pages/MoodPage';
import TreeholePage from './pages/TreeholePage';
import HealthPage from './pages/HealthPage';
import AIAssistantPage from './pages/AIAssistantPage';
import EmergencyPage from './pages/EmergencyPage';
import GroupsPage from './pages/GroupsPage';
import MessagesPage from './pages/MessagesPage';
import ProfilePage from './pages/ProfilePage';
import AdminPage from './pages/AdminPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import EmergencyButton from './components/EmergencyButton';
import BgBlobs from './components/BgBlobs';
import './App.css';

function App() {
  return (
    <Router>
      <BgBlobs />
      <Navbar />
      <EmergencyButton />
      <SidebarIconBar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/mood" element={<MoodPage />} />
        <Route path="/treehole" element={<TreeholePage />} />
        <Route path="/health" element={<HealthPage />} />
        <Route path="/ai-assistant" element={<AIAssistantPage />} />
        <Route path="/emergency" element={<EmergencyPage />} />
        <Route path="/groups" element={<GroupsPage />} />
        <Route path="/messages" element={<MessagesPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
      <Footer />
    </Router>
  );
}

export default App;
