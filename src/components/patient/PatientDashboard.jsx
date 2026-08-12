import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  User, 
  FlaskConical, 
  BarChart3, 
  ListChecks, 
  Activity,
  LogOut,
  TrendingUp,
  Shield,
  Search,
  Bell,
  Stethoscope,
  ChevronRight
} from "lucide-react";
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import { getFirestore, doc, getDoc } from "firebase/firestore";

import ProfileForm from './ProfileForm';
import LabUploadForm from './LabUploadForm';
import RiskPrediction from './RiskPrediction';
import ProgressTracking from './ProgressTracking';
import Recommendations from './Recommendations';
import Monitoring from './Monitoring';

const PatientDashboard = () => {
  const [selectedTab, setSelectedTab] = useState("Profile & Medical Info");
  const [user, setUser] = useState({
    name: "",
    email: "",
    patientId: "",
    uid: ""
  });
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
              patientId: userData.patientId || userData.uid || currentUser.uid,
              uid: currentUser.uid
            });
          } else {
            setUser({
              name: currentUser.displayName || "User",
              email: currentUser.email,
              patientId: currentUser.uid,
              uid: currentUser.uid
            });
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
          setUser({
            name: currentUser.displayName || "User",
            email: currentUser.email,
            patientId: currentUser.uid,
            uid: currentUser.uid
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
      window.location.href = '/login';
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

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

  const tabs = [
    { name: "Profile & Medical Info", label: "Patient Demographics", icon: User },
    { name: "Lab Test Entry", label: "Biomarker Entry", icon: FlaskConical },
    { name: "Risk Prediction", label: "AI Risk Prediction", icon: BarChart3 },
    { name: "Progress Tracking", label: "Comparative Analysis", icon: TrendingUp },
    { name: "Recommendations", label: "Clinical Protocol", icon: ListChecks },
    { name: "Monitoring", label: "Longitudinal Trends", icon: Activity },
  ];

  const getUserFirstName = () => {
    if (!user.name) return 'Patient';
    return user.name.split(' ')[0];
  };

  const getUserInitial = () => {
    if (!user.name) return 'P';
    return user.name.charAt(0).toUpperCase();
  };

  const getTabDescription = () => {
    switch (selectedTab) {
      case "Profile & Medical Info":
        return "Demographic baselines, clinical history, and lifestyle factors";
      case "Lab Test Entry":
        return "Input quantitative RF, Anti-CCP, CRP, and ESR serology values";
      case "Risk Prediction":
        return "Age & gender-adjusted machine learning RA risk scoring";
      case "Progress Tracking":
        return "Compare current and baseline laboratory measurements";
      case "Recommendations":
        return "Targeted lifestyle, joint preservation, and dietary guidance";
      case "Monitoring":
        return "Longitudinal health metrics and serial biomarker visualization";
      default:
        return "Patient Clinical Dashboard";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-3 border-teal-700 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Loading Patient Portal...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      
      {/* Top Clinical Navigation Bar */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 px-6 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 bg-teal-700 rounded-xl flex items-center justify-center text-white shadow-sm">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <span className="text-lg font-bold text-slate-900 tracking-tight">
                ArthroCare <span className="text-teal-700">AI</span>
              </span>
              <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Patient Workspace
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="hidden sm:flex items-center space-x-2 text-xs bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
              <Shield className="w-3.5 h-3.5 text-teal-600" />
              <span className="text-slate-600 font-medium">Patient ID:</span>
              <span className="font-bold text-slate-800 font-mono">{user.patientId ? user.patientId.substring(0, 10) : 'P-8012'}</span>
            </div>

            <div className="flex items-center space-x-3 pl-2 border-l border-slate-200">
              <div className="w-9 h-9 bg-teal-700 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-sm">
                {getUserInitial()}
              </div>
              <div className="hidden md:block text-left">
                <div className="text-xs font-bold text-slate-900 leading-tight">{user.name}</div>
                <div className="text-[10px] text-slate-500">{user.email}</div>
              </div>
            </div>
          </div>

        </div>
      </header>

      {/* Main Workspace Layout */}
      <div className="max-w-7xl w-full mx-auto flex-1 flex flex-col md:flex-row gap-6 p-6">
        
        {/* Sidebar */}
        <aside className="w-full md:w-64 shrink-0 flex flex-col justify-between space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-4 space-y-4">
            
            <div className="px-2 py-1">
              <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Navigation</div>
              <div className="text-sm font-bold text-slate-900 mt-0.5">Clinical Modules</div>
            </div>

            <nav className="space-y-1">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = selectedTab === tab.name;
                return (
                  <button
                    key={tab.name}
                    onClick={() => setSelectedTab(tab.name)}
                    className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 text-left ${
                      isActive
                        ? "bg-teal-700 text-white shadow-sm"
                        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-slate-400"}`} />
                    <span className="truncate">{tab.name}</span>
                  </button>
                );
              })}
            </nav>

          </div>

          {/* Bottom Action */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-4">
            <button
              onClick={handleSignOut}
              className="w-full flex items-center justify-center space-x-2 px-4 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200/80 rounded-xl text-xs font-bold transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out Portal</span>
            </button>
          </div>
        </aside>

        {/* Content Area */}
        <main className="flex-1 space-y-6">
          
          {/* Module Header Card */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 flex items-center justify-between">
            <div>
              <div className="inline-flex items-center space-x-2 text-xs font-semibold text-teal-700 bg-teal-50 px-2.5 py-1 rounded-md border border-teal-200/60 mb-2">
                <Stethoscope className="w-3.5 h-3.5" />
                <span>ArthroCare Assessment Module</span>
              </div>
              <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">{selectedTab}</h1>
              <p className="text-xs text-slate-500 mt-1">{getTabDescription()}</p>
            </div>
          </div>

          {/* Render Active Component */}
          <div>
            {renderContent()}
          </div>

        </main>

      </div>

    </div>
  );
};

export default PatientDashboard;