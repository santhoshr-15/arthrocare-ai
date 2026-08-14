import React from 'react';
import { Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { User, FlaskConical, BarChart3, ListChecks, Activity } from 'lucide-react';
import AppShell from '../components/common/AppShell';
import ProfileForm from '../components/patient/ProfileForm';
import LabUploadForm from '../components/patient/LabUploadForm';
import RiskPrediction from '../components/patient/RiskPrediction';
import Recommendations from '../components/patient/Recommendations';
import Monitoring from '../components/patient/Monitoring';

const navItems = [
  { id: 'profile', path: '/patient/profile', label: 'Profile & Medical Info', icon: User },
  { id: 'lab-tests', path: '/patient/lab-tests', label: 'Lab Test Entry', icon: FlaskConical },
  { id: 'risk-prediction', path: '/patient/risk-prediction', label: 'Risk Prediction', icon: BarChart3 },
  { id: 'recommendations', path: '/patient/recommendations', label: 'Recommendations', icon: ListChecks },
  { id: 'monitoring', path: '/patient/monitoring', label: 'Monitoring', icon: Activity }
];

const getCurrentUser = () => {
  const sessionUser = sessionStorage.getItem("currentUser");
  const localUser = localStorage.getItem("currentUser");
  if (sessionUser) {
    try {
      return JSON.parse(sessionUser);
    } catch {
      return null;
    }
  }
  if (localUser) {
    try {
      return JSON.parse(localUser);
    } catch {
      return null;
    }
  }
  return null;
};

const PatientPage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    sessionStorage.removeItem("currentUser");
    localStorage.removeItem("currentUser");
    navigate('/login');
  };

  const activeItem = navItems.find(item => location.pathname.startsWith(item.path));

  const pageMeta = {
    'profile': { title: 'Profile & Medical Info', description: 'Demographics, clinical history, and lifestyle baselines.' },
    'lab-tests': { title: 'Lab Test Entry', description: 'Enter quantitative RF, Anti-CCP, CRP, and ESR serology values.' },
    'risk-prediction': { title: 'Risk Prediction', description: 'Age- and sex-adjusted machine-learning RA risk scoring.' },
    'recommendations': { title: 'Recommendations', description: 'Targeted lifestyle, joint preservation, and dietary guidance.' },
    'monitoring': { title: 'Monitoring', description: 'Longitudinal health metrics and serial biomarker visualization.' }
  };

  const meta = (activeItem && pageMeta[activeItem.id]) || pageMeta['profile'];

  return (
    <AppShell
      sections={navItems}
      activeId={activeItem?.id || ''}
      onSelect={(id) => {
        const item = navItems.find(n => n.id === id);
        if (item) navigate(item.path);
      }}
      user={getCurrentUser()}
      roleLabel="Patient workspace"
      onSignOut={handleLogout}
    >
      <div>
        <header className="mb-6">
          <p className="eyebrow mb-2">Patient workspace</p>
          <h1 className="text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl">{meta.title}</h1>
          <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-slate-500">{meta.description}</p>
        </header>

        <Routes>
          <Route path="profile" element={<ProfileForm />} />
          <Route path="lab-tests" element={<LabUploadForm setSelectedTab={() => navigate('/patient/risk-prediction')} />} />
          <Route path="risk-prediction" element={<RiskPrediction />} />
          <Route path="recommendations" element={<Recommendations />} />
          <Route path="monitoring" element={<Monitoring />} />
          <Route path="*" element={<Navigate to="profile" replace />} />
        </Routes>
      </div>
    </AppShell>
  );
};

export default PatientPage;