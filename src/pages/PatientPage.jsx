import React from 'react';
import { Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { User, FlaskConical, BarChart3, ListChecks, Activity, TrendingUp } from 'lucide-react';
import AppShell from '../components/common/AppShell';
import PageHeader from '../components/ui/PageHeader';
import ProfileForm from '../components/patient/ProfileForm';
import LabUploadForm from '../components/patient/LabUploadForm';
import RiskPrediction from '../components/patient/RiskPrediction';
import Recommendations from '../components/patient/Recommendations';
import Monitoring from '../components/patient/Monitoring';
import ProgressTracking from '../components/patient/ProgressTracking';

const navItems = [
  { id: 'profile', path: '/patient/profile', label: 'Profile & Medical History', icon: User },
  { id: 'lab-tests', path: '/patient/lab-tests', label: 'Serology Panel Entry', icon: FlaskConical },
  { id: 'risk-prediction', path: '/patient/risk-prediction', label: 'Risk Report', icon: BarChart3 },
  { id: 'progress-tracking', path: '/patient/progress-tracking', label: 'Serial Comparison', icon: TrendingUp },
  { id: 'recommendations', path: '/patient/recommendations', label: 'Guidance Protocol', icon: ListChecks },
  { id: 'monitoring', path: '/patient/monitoring', label: 'Longitudinal Metrics', icon: Activity }
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
    'profile': { title: 'Demographic Profile & Medical Info', description: 'Patient age, biological sex, clinical history, and baseline lifestyle parameters.' },
    'lab-tests': { title: 'Biomarker Serology Requisition', description: 'Enter quantitative laboratory values for RF, Anti-CCP, CRP, and ESR serology.' },
    'risk-prediction': { title: 'Multivariable Risk Report', description: 'Age- and sex-adjusted machine-learning RA probability and biomarker factor weights.' },
    'progress-tracking': { title: 'Serial Lab Comparison', description: 'Compare baseline and follow-up laboratory panels to compute risk score delta.' },
    'recommendations': { title: 'Evidence-Based Guidance', description: 'Targeted lifestyle, joint preservation, dietary protocols, and follow-up scheduling.' },
    'monitoring': { title: 'Longitudinal Biomarker Metrics', description: 'Longitudinal trend visualizations and serial laboratory submission audit log.' }
  };

  const meta = (activeItem && pageMeta[activeItem.id]) || pageMeta['profile'];

  return (
    <AppShell
      sections={navItems}
      activeId={activeItem?.id || 'profile'}
      onSelect={(id) => {
        const item = navItems.find(n => n.id === id);
        if (item) navigate(item.path);
      }}
      user={getCurrentUser()}
      roleLabel="Patient Workspace"
      onSignOut={handleLogout}
    >
      <div>
        <PageHeader
          eyebrow="Patient Workspace"
          title={meta.title}
          description={meta.description}
        />

        <Routes>
          <Route path="profile" element={<ProfileForm />} />
          <Route path="lab-tests" element={<LabUploadForm setSelectedTab={() => navigate('/patient/risk-prediction')} />} />
          <Route path="risk-prediction" element={<RiskPrediction />} />
          <Route path="progress-tracking" element={<ProgressTracking />} />
          <Route path="recommendations" element={<Recommendations />} />
          <Route path="monitoring" element={<Monitoring />} />
          <Route path="*" element={<Navigate to="profile" replace />} />
        </Routes>
      </div>
    </AppShell>
  );
};

export default PatientPage;