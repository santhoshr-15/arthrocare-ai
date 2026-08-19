import React, { useState, useEffect } from "react";
import { User, FlaskConical, BarChart3, TrendingUp, ListChecks, Activity } from "lucide-react";
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import AppShell from "../common/AppShell";
import PageHeader from "../ui/PageHeader";

import ProfileForm from './ProfileForm';
import LabUploadForm from './LabUploadForm';
import RiskPrediction from './RiskPrediction';
import ProgressTracking from './ProgressTracking';
import Recommendations from './Recommendations';
import Monitoring from './Monitoring';

const tabs = [
  {
    id: "Profile & Medical Info",
    label: "Profile & Medical History",
    description: "Patient demographics, biological sex, clinical history, and lifestyle baselines",
    icon: User
  },
  {
    id: "Lab Test Entry",
    label: "Serology Panel Entry",
    description: "Enter quantitative laboratory values for RF, Anti-CCP, CRP, and ESR serology",
    icon: FlaskConical
  },
  {
    id: "Risk Prediction",
    label: "Risk Report",
    description: "Age- and sex-adjusted machine-learning RA probability with factor interpretation",
    icon: BarChart3
  },
  {
    id: "Progress Tracking",
    label: "Serial Comparison",
    description: "Compare baseline and follow-up laboratory panels to compute risk score delta",
    icon: TrendingUp
  },
  {
    id: "Recommendations",
    label: "Guidance Protocol",
    description: "Targeted lifestyle, joint preservation, dietary protocols, and follow-up scheduling",
    icon: ListChecks
  },
  {
    id: "Monitoring",
    label: "Longitudinal Metrics",
    description: "Trend visualizations and serial laboratory submission audit log",
    icon: Activity
  }
];

const PatientDashboard = () => {
  const [selectedTab, setSelectedTab] = useState("Profile & Medical Info");
  const [user, setUser] = useState({ name: "", email: "", patientId: "" });
  const [loading, setLoading] = useState(true);

  const auth = getAuth();
  const db = getFirestore();

  useEffect(() => {
    window.dashboardSetTab = setSelectedTab;
    return () => {
      window.dashboardSetTab = null;
    };
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        try {
          const userDocRef = doc(db, "users", currentUser.uid);
          const userDoc = await getDoc(userDocRef);

          if (userDoc.exists()) {
            const userData = userDoc.data();
            setUser({
              name: userData.name || userData.fullName || currentUser.displayName || "User",
              email: currentUser.email,
              patientId: userData.patientId || userData.uid || currentUser.uid
            });
          } else {
            setUser({
              name: currentUser.displayName || "User",
              email: currentUser.email,
              patientId: currentUser.uid
            });
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
          setUser({
            name: currentUser.displayName || "User",
            email: currentUser.email,
            patientId: currentUser.uid
          });
        }
      } else {
        window.location.href = '/login';
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [auth, db]);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      sessionStorage.removeItem("currentUser");
      localStorage.removeItem("currentUser");
      window.location.href = '/login';
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const activeTab = tabs.find(tab => tab.id === selectedTab) || tabs[0];

  const renderContent = () => {
    switch (selectedTab) {
      case "Profile & Medical Info":
        return <ProfileForm />;
      case "Lab Test Entry":
        return <LabUploadForm setSelectedTab={setSelectedTab} />;
      case "Risk Prediction":
        return <RiskPrediction />;
      case "Progress Tracking":
        return <ProgressTracking />;
      case "Recommendations":
        return <Recommendations />;
      case "Monitoring":
        return <Monitoring />;
      default:
        return <ProfileForm />;
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="mx-auto h-7 w-7 animate-spin rounded-full border-2 border-slate-300 border-t-teal-700" />
          <p className="mt-3 text-xs font-semibold uppercase tracking-wider text-slate-500">Loading Patient Workspace…</p>
        </div>
      </div>
    );
  }

  return (
    <AppShell
      sections={tabs}
      activeId={activeTab.id}
      onSelect={setSelectedTab}
      user={user}
      roleLabel="Patient Workspace"
      onSignOut={handleSignOut}
    >
      <div>
        <PageHeader
          eyebrow="Patient Workspace"
          title={activeTab.label}
          description={activeTab.description}
        />
        {renderContent()}
      </div>
    </AppShell>
  );
};

export default PatientDashboard;