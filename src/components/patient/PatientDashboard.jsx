import React, { useState, useEffect } from "react";
import { User, FlaskConical, BarChart3, TrendingUp, ListChecks, Activity } from "lucide-react";
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import AppShell from "../common/AppShell";

import ProfileForm from './ProfileForm';
import LabUploadForm from './LabUploadForm';
import RiskPrediction from './RiskPrediction';
import ProgressTracking from './ProgressTracking';
import Recommendations from './Recommendations';
import Monitoring from './Monitoring';

const tabs = [
  {
    id: "Profile & Medical Info",
    label: "Profile & Medical Info",
    description: "Demographics, clinical history, and lifestyle baselines",
    icon: User
  },
  {
    id: "Lab Test Entry",
    label: "Lab Test Entry",
    description: "Enter quantitative RF, Anti-CCP, CRP, and ESR serology values",
    icon: FlaskConical
  },
  {
    id: "Risk Prediction",
    label: "Risk Prediction",
    description: "Age- and sex-adjusted machine-learning RA risk scoring",
    icon: BarChart3
  },
  {
    id: "Progress Tracking",
    label: "Progress Tracking",
    description: "Compare current and baseline laboratory measurements",
    icon: TrendingUp
  },
  {
    id: "Recommendations",
    label: "Recommendations",
    description: "Targeted lifestyle, joint preservation, and dietary guidance",
    icon: ListChecks
  },
  {
    id: "Monitoring",
    label: "Monitoring",
    description: "Longitudinal health metrics and serial biomarker visualization",
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
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-slate-300 border-t-teal-600" />
          <p className="mt-3 text-sm font-medium text-slate-500">Loading patient workspace…</p>
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
      roleLabel="Patient workspace"
      onSignOut={handleSignOut}
    >
      <div>
        <header className="mb-6">
          <p className="eyebrow mb-2">Patient workspace</p>
          <h1 className="text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl">{activeTab.label}</h1>
          <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-slate-500">{activeTab.description}</p>
        </header>
        {renderContent()}
      </div>
    </AppShell>
  );
};

export default PatientDashboard;