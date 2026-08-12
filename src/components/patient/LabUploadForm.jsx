import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  FlaskConical, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  ShieldCheck,
  UserCheck,
  Activity,
  ArrowRight,
  Info
} from "lucide-react";
import { collection, doc, getDocs, query, where, setDoc } from "firebase/firestore";
import { auth, db } from "../../firebase/config";
import { onAuthStateChanged } from "firebase/auth";
import CardTransition from "../animations/CardTransition";

const LabUploadForm = ({ setSelectedTab }) => {
  const [labValues, setLabValues] = useState({
    RF: "",
    "Anti-CCP": "",
    CRP: "",
    ESR: ""
  });

  const [userData, setUserData] = useState({
    age: "",
    gender: ""
  });
  
  const [loading, setLoading] = useState(false);
  const [submissionSuccess, setSubmissionSuccess] = useState(false);
  const [error, setError] = useState("");
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUser(user);
        await loadUserProfileData(user.uid);
      } else {
        setCurrentUser(null);
      }
    });

    return () => unsubscribe();
  }, []);

  const loadUserProfileData = async (userId) => {
    try {
      const personalInfoQuery = query(
        collection(db, "personalInformation"), 
        where("userId", "==", userId)
      );
      
      const querySnapshot = await getDocs(personalInfoQuery);
      
      if (!querySnapshot.empty) {
        const profileDoc = querySnapshot.docs[0];
        const profileData = profileDoc.data();
        
        setUserData({
          age: profileData.age || "",
          gender: profileData.gender || ""
        });
      }
    } catch (err) {
      console.error("Error loading profile data:", err);
    }
  };

  const handleInputChange = (key, value) => {
    setLabValues(prev => ({ ...prev, [key]: value }));
  };

  const saveLabDataToFirebase = async () => {
    try {
      if (!currentUser) throw new Error("User authentication required");

      if (!userData.age || !userData.gender) {
        throw new Error("Please complete your profile first with age and gender.");
      }

      const emptyLabFields = Object.entries(labValues)
        .filter(([key, value]) => !String(value).trim())
        .map(([key]) => key);

      if (emptyLabFields.length > 0) {
        throw new Error(`Please fill all lab biomarker values: ${emptyLabFields.join(", ")}`);
      }

      const docName = `user_${currentUser.uid}_lab_${Date.now()}`;

      const labData = {
        userAge: userData.age,
        userGender: userData.gender,
        userId: currentUser.uid,
        rheumatoidFactor: labValues.RF,
        antiCCP: labValues["Anti-CCP"],
        cReactiveProtein: labValues.CRP,
        erythrocyteSedimentationRate: labValues.ESR,
        createdAt: new Date().toISOString(),
        lastUpdated: new Date().toISOString(),
        documentName: docName
      };

      const labInfoRef = doc(collection(db, "LabInformation"), docName);

      await setDoc(labInfoRef, labData);

      return true;

    } catch (err) {
      console.error("Error saving lab data:", err);
      throw err;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await saveLabDataToFirebase();
      setSubmissionSuccess(true);
      setLabValues({
        RF: "",
        "Anti-CCP": "",
        CRP: "",
        ESR: ""
      });
    } catch (err) {
      setError(err.message || "Failed to save lab data.");
    } finally {
      setLoading(false);
    }
  };

  const handleClearForm = () => {
    setLabValues({
      RF: "",
      "Anti-CCP": "",
      CRP: "",
      ESR: ""
    });
    setSubmissionSuccess(false);
    setError("");
  };

  const labTests = [
    { 
      key: "RF", 
      label: "Rheumatoid Factor (RF)", 
      unit: "IU/mL", 
      normalRange: "0 - 14 IU/mL",
      desc: "Quantitative measurement of autoantibodies targeting IgG antibodies."
    },
    { 
      key: "Anti-CCP", 
      label: "Anti-CCP Antibodies", 
      unit: "U/mL", 
      normalRange: "< 20 U/mL",
      desc: "High-specificity diagnostic marker for Rheumatoid Arthritis."
    },
    { 
      key: "CRP", 
      label: "C-Reactive Protein (CRP)", 
      unit: "mg/L", 
      normalRange: "< 3.0 mg/L",
      desc: "Acute-phase inflammatory protein synthesized by liver in response to cytokines."
    },
    { 
      key: "ESR", 
      label: "Erythrocyte Sedimentation Rate", 
      unit: "mm/hr", 
      normalRange: "0 - 20 mm/hr",
      desc: "Rate at which red blood cells settle, measuring systemic inflammatory activity."
    }
  ];

  return (
    <CardTransition className="space-y-6">
      
      {/* Profile Demographic Validation Card */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-4 mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-teal-50 rounded-xl border border-teal-200 flex items-center justify-center text-teal-700">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Demographic Baseline Status</h2>
              <p className="text-xs text-slate-500">Required for age and sex-adjusted biomarker risk calculations</p>
            </div>
          </div>

          <div className="flex items-center space-x-3 text-xs">
            <div className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg">
              <span className="text-slate-500 font-medium">Age: </span>
              <span className="font-bold text-slate-900">{userData.age ? `${userData.age} yrs` : 'Not set'}</span>
            </div>
            <div className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg">
              <span className="text-slate-500 font-medium">Gender: </span>
              <span className="font-bold text-slate-900">{userData.gender || 'Not set'}</span>
            </div>
          </div>
        </div>

        {(!userData.age || !userData.gender) && (
          <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-xs flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Demographic profile incomplete. Please complete profile details first.</span>
            </div>
            {window.dashboardSetTab && (
              <button 
                onClick={() => window.dashboardSetTab("Profile & Medical Info")}
                className="text-xs font-bold text-amber-900 underline hover:text-amber-700"
              >
                Go to Profile Form
              </button>
            )}
          </div>
        )}
      </div>

      {/* Main Lab Entry Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 space-y-6">
        
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-teal-700 rounded-xl flex items-center justify-center text-white shadow-sm">
              <FlaskConical className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Enter Serology & Inflammatory Lab Values</h2>
              <p className="text-xs text-slate-500">Inputs must be numerical values obtained from recent blood panel analysis</p>
            </div>
          </div>
          
          <button
            type="button"
            onClick={handleClearForm}
            className="text-xs font-semibold text-slate-500 hover:text-slate-700 flex items-center space-x-1"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reset Fields</span>
          </button>
        </div>

        {/* Input Cards Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          {labTests.map((test) => (
            <div key={test.key} className="p-4 bg-slate-50/70 border border-slate-200 rounded-xl space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider">
                    {test.label} *
                  </label>
                  <div className="text-[11px] text-slate-500 mt-0.5">{test.desc}</div>
                </div>
                <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-teal-50 text-teal-800 border border-teal-200/80 shrink-0">
                  Normal: {test.normalRange}
                </span>
              </div>

              <div className="relative">
                <input
                  type="number"
                  step="any"
                  placeholder={`Enter value (${test.unit})`}
                  value={labValues[test.key]}
                  onChange={(e) => handleInputChange(test.key, e.target.value)}
                  required
                  className="w-full pl-4 pr-16 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-600 transition-all"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 pointer-events-none">
                  {test.unit}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Feedback Alert Messages */}
        {error && (
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-start space-x-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {submissionSuccess && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span className="font-semibold">Lab values recorded successfully in Firestore!</span>
            </div>
            {setSelectedTab && (
              <button
                type="button"
                onClick={() => setSelectedTab("Risk Prediction")}
                className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-lg text-xs transition-colors flex items-center space-x-1 shadow-sm"
              >
                <span>View Risk Prediction</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        )}

        {/* Submit Actions */}
        <div className="flex justify-end pt-4 border-t border-slate-100">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-teal-700 hover:bg-teal-800 text-white font-semibold text-sm rounded-xl shadow-sm transition-all duration-150 flex items-center space-x-2 disabled:opacity-50"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Saving Lab Panel...</span>
              </>
            ) : (
              <>
                <ShieldCheck className="w-4 h-4" />
                <span>Save Lab Measurements & Run Model</span>
              </>
            )}
          </button>
        </div>

      </form>

    </CardTransition>
  );
};

export default LabUploadForm;
