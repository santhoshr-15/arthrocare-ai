import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Utensils, 
  Activity, 
  Sun, 
  Brain, 
  ChevronDown, 
  ChevronUp, 
  Sparkles, 
  ShieldCheck, 
  Stethoscope,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { collection, query, where, getDocs, orderBy, limit } from "firebase/firestore";
import { auth, db } from "../../firebase/config";
import { onAuthStateChanged } from "firebase/auth";
import CardTransition from '../animations/CardTransition';

const Recommendations = () => {
  const [recommendations, setRecommendations] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  const [expandedSections, setExpandedSections] = useState({});
  const [userData, setUserData] = useState({});

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUser(user);
        loadUserData(user.uid);
      }
    });
    return () => unsubscribe();
  }, []);

  const loadUserData = async (userId) => {
    try {
      const profileQuery = query(
        collection(db, "personalInformation"), 
        where("userId", "==", userId)
      );
      const profileSnapshot = await getDocs(profileQuery);
      
      let profileData = {};
      if (!profileSnapshot.empty) {
        profileData = profileSnapshot.docs[0].data();
      }

      const labQuery = query(
        collection(db, "LabInformation"),
        where("userId", "==", userId),
        orderBy("createdAt", "desc"),
        limit(1)
      );
      const labSnapshot = await getDocs(labQuery);
      
      let labData = {};
      if (!labSnapshot.empty) {
        labData = labSnapshot.docs[0].data();
      }

      setUserData({ ...profileData, ...labData });
      
    } catch (err) {
      console.error("Error loading user data:", err);
    }
  };

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const generateRecommendations = async () => {
    if (!currentUser) {
      setError('Please log in to generate recommendations.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const requestData = {
        age: userData.age || 30,
        gender: userData.gender || 'Male',
        smokingStatus: userData.smoking || 'Never',
        drinkingStatus: userData.alcohol || 'Never',
        rheumatoidArthritis: userData.rheumatoidArthritis || 0,
        ESR: userData.erythrocyteSedimentationRate || userData.ESR || 0,
        CRP: userData.cReactiveProtein || userData.CRP || 0,
        RF: userData.rheumatoidFactor || userData.RF || 0,
        AntiCCP: userData.antiCCP || 0,
        weight: userData.weight || null,
        vegetarian: userData.vegetarian || false
      };

      console.log("📤 Sending data to recommendations API:", requestData);

      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/generate-recommendations`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(requestData)
        }
      );

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const result = await response.json();
      console.log("✅ Recommendations received:", result);
      
      if (result.error) {
        throw new Error(result.error);
      }

      setRecommendations(result);
      
    } catch (err) {
      console.error("❌ Error generating recommendations:", err);
      setError(err.message || 'Failed to generate recommendations. Ensure Flask API is running.');
    } finally {
      setLoading(false);
    }
  };

  const getSeverityBadge = (severity) => {
    const map = {
      'Severe - Urgent': 'bg-rose-100 text-rose-800 border-rose-200',
      'Severe': 'bg-rose-50 text-rose-700 border-rose-200',
      'Moderate': 'bg-amber-50 text-amber-800 border-amber-200',
      'Borderline': 'bg-teal-50 text-teal-800 border-teal-200',
      'Low/Normal': 'bg-emerald-50 text-emerald-800 border-emerald-200'
    };
    return map[severity] || 'bg-slate-100 text-slate-800 border-slate-200';
  };

  const getSectionIcon = (section) => {
    const icons = {
      'diet': <Utensils className="w-5 h-5" />,
      'exercise': <Activity className="w-5 h-5" />,
      'lifestyle': <Sun className="w-5 h-5" />,
      'mentalWellness': <Brain className="w-5 h-5" />
    };
    return icons[section] || <Sparkles className="w-5 h-5" />;
  };

  if (loading) {
    return (
      <CardTransition className="bg-white p-8 rounded-2xl border border-slate-200/90 shadow-sm text-center">
        <div className="flex flex-col items-center py-10 space-y-3">
          <div className="w-10 h-10 border-3 border-teal-700 border-t-transparent rounded-full animate-spin"></div>
          <h3 className="text-base font-bold text-slate-900">Synthesizing Evidence-Based Recommendations</h3>
          <p className="text-xs text-slate-500">Matching patient biomarkers with lifestyle & clinical guidance protocols...</p>
        </div>
      </CardTransition>
    );
  }

  return (
    <CardTransition className="space-y-6">
      
      {/* Trigger Card */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-teal-700 rounded-xl flex items-center justify-center text-white shadow-sm">
            <Stethoscope className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">Personalized Health Guidance Protocol</h2>
            <p className="text-xs text-slate-500">Generate targeted dietary, physical activity, and joint preservation recommendations</p>
          </div>
        </div>

        <button
          onClick={generateRecommendations}
          disabled={loading}
          className="px-5 py-2.5 bg-teal-700 hover:bg-teal-800 text-white font-semibold rounded-xl text-xs transition-all duration-150 shadow-sm flex items-center space-x-2 disabled:opacity-50 shrink-0"
        >
          <Sparkles className="w-4 h-4" />
          <span>{recommendations ? 'Regenerate Protocol' : 'Generate Protocol'}</span>
        </button>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-start space-x-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Protocol Display */}
      {recommendations && (
        <div className="space-y-6">
          
          {/* Summary Card */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h3 className="text-base font-bold text-slate-900">Clinical Baseline Summary</h3>
              <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getSeverityBadge(recommendations.patientSummary.severity)}`}>
                Severity Index: {recommendations.patientSummary.severity}
              </span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <span className="text-slate-500 font-medium">Age / Gender</span>
                <div className="text-sm font-bold text-slate-900 mt-0.5">
                  {recommendations.patientSummary.age} yrs ({recommendations.patientSummary.gender})
                </div>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <span className="text-slate-500 font-medium">Risk Index</span>
                <div className="text-sm font-bold text-slate-900 mt-0.5">
                  {recommendations.patientSummary.riskScore}%
                </div>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <span className="text-slate-500 font-medium">ML Probability</span>
                <div className="text-sm font-bold text-slate-900 mt-0.5">
                  {recommendations.patientSummary.modelProbability ? `${(recommendations.patientSummary.modelProbability * 100).toFixed(1)}%` : 'Evaluated'}
                </div>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <span className="text-slate-500 font-medium">Protocol Sections</span>
                <div className="text-sm font-bold text-teal-700 mt-0.5">
                  {Object.keys(recommendations.recommendations).length} Modules
                </div>
              </div>
            </div>
          </div>

          {/* Collapsible Guidance Cards */}
          <div className="space-y-4">
            {Object.entries(recommendations.recommendations).map(([sectionKey, sectionData]) => (
              <div key={sectionKey} className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
                <button
                  onClick={() => toggleSection(sectionKey)}
                  className="w-full p-5 text-left flex items-center justify-between hover:bg-slate-50/80 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-9 h-9 bg-teal-50 rounded-xl border border-teal-200 flex items-center justify-center text-teal-700">
                      {getSectionIcon(sectionKey)}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">{sectionData.title}</h4>
                      <span className="text-xs text-slate-500">{sectionData.sections.length} tailored guidance categories</span>
                    </div>
                  </div>
                  {expandedSections[sectionKey] ? (
                    <ChevronUp className="w-5 h-5 text-slate-400" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-slate-400" />
                  )}
                </button>

                {expandedSections[sectionKey] && (
                  <div className="p-6 border-t border-slate-100 space-y-4 bg-slate-50/50">
                    {sectionData.sections.map((subsection, index) => (
                      <div key={index} className="bg-white p-4 rounded-xl border border-slate-200 space-y-2">
                        <h5 className="font-bold text-slate-900 text-xs uppercase tracking-wider">{subsection.title}</h5>
                        <ul className="space-y-1.5 text-xs text-slate-700">
                          {subsection.items.map((item, itemIndex) => (
                            <li key={itemIndex} className="flex items-start space-x-2">
                              <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 shrink-0 mt-0.5" />
                              <span className="font-medium">{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Key Messages */}
          {recommendations.keyMessages && (
            <div className="p-4 bg-teal-50/70 border border-teal-200/80 rounded-2xl space-y-2 text-xs">
              <div className="flex items-center space-x-2 text-teal-900 font-bold">
                <ShieldCheck className="w-4 h-4 text-teal-700" />
                <span>Essential Clinical Notes & Reminders</span>
              </div>
              <ul className="space-y-1 text-slate-800 font-medium pl-6 list-disc">
                {recommendations.keyMessages.map((msg, idx) => (
                  <li key={idx}>{msg}</li>
                ))}
              </ul>
            </div>
          )}

        </div>
      )}

      {/* Empty State */}
      {!recommendations && !loading && !error && (
        <div className="bg-white p-12 rounded-2xl border border-slate-200/90 shadow-sm text-center space-y-4">
          <Stethoscope className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-900">Evidence-Based Clinical Protocol</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Click "Generate Protocol" to calculate tailored nutrition, physical therapy, lifestyle, and mental wellness recommendations based on your serology data.
          </p>
        </div>
      )}

    </CardTransition>
  );
};

export default Recommendations;