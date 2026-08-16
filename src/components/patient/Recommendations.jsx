import React, { useState, useEffect } from 'react';
import { Utensils, Activity, Sun, Brain, ChevronDown, ChevronUp, ShieldCheck, Stethoscope, Sparkles, AlertCircle, CheckCircle2 } from 'lucide-react';
import { collection, query, where, getDocs, orderBy, limit } from "firebase/firestore";
import { auth, db } from "../../firebase/config";
import { onAuthStateChanged } from "firebase/auth";
import Badge from '../ui/Badge';
import EmptyState from '../ui/EmptyState';
import Loader from '../ui/Loader';

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
      setError('Please sign in to generate clinical recommendations.');
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

      if (result.error) {
        throw new Error(result.error);
      }

      setRecommendations(result);

      // Auto-expand all sections on generate
      if (result.recommendations) {
        const initialOpen = {};
        Object.keys(result.recommendations).forEach(k => { initialOpen[k] = true; });
        setExpandedSections(initialOpen);
      }

    } catch (err) {
      console.error("Error generating recommendations:", err);
      setError(err.message || 'Failed to generate recommendations. Ensure the Flask API is running.');
    } finally {
      setLoading(false);
    }
  };

  const getSeverityTone = (severity) => {
    const map = {
      'Severe - Urgent': 'rose',
      'Severe': 'rose',
      'Moderate': 'amber',
      'Borderline': 'teal',
      'Low/Normal': 'emerald'
    };
    return map[severity] || 'slate';
  };

  const getSectionIcon = (section) => {
    const icons = {
      'diet': Utensils,
      'exercise': Activity,
      'lifestyle': Sun,
      'mentalWellness': Brain
    };
    return icons[section] || Sparkles;
  };

  if (loading) {
    return <Loader label="Synthesizing evidence-based clinical guidance protocol…" />;
  }

  return (
    <div className="space-y-6">
      {/* Trigger Card Banner */}
      <div className="flex flex-col gap-4 rounded-lg border border-slate-200 bg-white p-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-800 border border-blue-200">
            <Stethoscope className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold uppercase tracking-widest text-slate-900">Evidence-Based Clinical Guidance Protocol</h2>
            <p className="text-xs text-slate-500">Synthesizes targeted dietary, physical therapy, and joint preservation recommendations.</p>
          </div>
        </div>
        <button type="button" onClick={generateRecommendations} disabled={loading} className="btn-primary shrink-0 text-sm">
          <Sparkles className="h-4 w-4" />
          {recommendations ? 'Regenerate Protocol' : 'Synthesize Protocol'}
        </button>
      </div>

      {error && (
        <div className="flex items-start gap-3 rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-rose-600" />
          <span>{error}</span>
        </div>
      )}

      {/* Protocol Display */}
      {recommendations && (
        <div className="space-y-5">
          {/* Clinical Summary Bar */}
          <div className="rounded-lg border border-slate-200 bg-white p-6">
            <div className="mb-4 flex items-center justify-between border-b border-slate-200 pb-4">
              <h3 className="text-sm font-bold uppercase tracking-widest text-slate-900">Clinical Baseline Summary</h3>
              <Badge tone={getSeverityTone(recommendations.patientSummary.severity)} showDot>
                Severity Classification: {recommendations.patientSummary.severity}
              </Badge>
            </div>

            <dl className="grid grid-cols-2 gap-4 text-sm lg:grid-cols-4">
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                <dt className="text-slate-500 font-medium">Demographics Context</dt>
                <dd className="mt-1 font-bold text-slate-900">
                  {recommendations.patientSummary.age} yrs ({recommendations.patientSummary.gender})
                </dd>
              </div>
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                <dt className="text-slate-500 font-medium">Model Risk Index</dt>
                <dd className="mt-1 font-bold text-slate-900">{recommendations.patientSummary.riskScore}%</dd>
              </div>
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                <dt className="text-slate-500 font-medium">ML Probability</dt>
                <dd className="mt-1 font-bold text-slate-900">
                  {recommendations.patientSummary.modelProbability
                    ? `${(recommendations.patientSummary.modelProbability * 100).toFixed(1)}%`
                    : 'Evaluated'}
                </dd>
              </div>
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                <dt className="text-slate-500 font-medium">Protocol Categories</dt>
                <dd className="mt-1 font-bold text-blue-800">
                  {Object.keys(recommendations.recommendations).length} Modules
                </dd>
              </div>
            </dl>
          </div>

          {/* Structured Accordion Cards */}
          <div className="space-y-4">
            {Object.entries(recommendations.recommendations).map(([sectionKey, sectionData]) => {
              const Icon = getSectionIcon(sectionKey);
              const isOpen = !!expandedSections[sectionKey];
              return (
                <div key={sectionKey} className="overflow-hidden rounded-lg border border-slate-200 bg-white">
                  <button
                    type="button"
                    onClick={() => toggleSection(sectionKey)}
                    aria-expanded={isOpen}
                    className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left transition-colors hover:bg-slate-50"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-800 border border-blue-200">
                        <Icon className="h-4 w-4" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold uppercase tracking-widest text-slate-900">{sectionData.title}</h4>
                        <p className="text-xs text-slate-500">{sectionData.sections.length} evidence categories</p>
                      </div>
                    </div>
                    {isOpen ? (
                      <ChevronUp className="h-5 w-5 shrink-0 text-slate-400" />
                    ) : (
                      <ChevronDown className="h-5 w-5 shrink-0 text-slate-400" />
                    )}
                  </button>

                  {isOpen && (
                    <div className="space-y-4 border-t border-slate-200 bg-slate-50/50 p-5">
                      {sectionData.sections.map((subsection, index) => (
                        <div key={index} className="space-y-3 rounded-lg border border-slate-200 bg-white p-4">
                          <h5 className="text-sm font-bold text-slate-900">{subsection.title}</h5>
                          <ul className="space-y-2 text-sm text-slate-700">
                            {subsection.items.map((item, itemIndex) => (
                              <li key={itemIndex} className="flex items-start gap-2">
                                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-blue-700" />
                                <span className="leading-normal">{item}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Essential Clinical Notes & Reminders */}
          {recommendations.keyMessages && (
            <div className="space-y-3 rounded-lg border border-blue-200 bg-blue-50/80 p-5">
              <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-blue-950">
                <ShieldCheck className="h-5 w-5 text-blue-800" />
                Essential Clinical Notes &amp; Monitoring Directives
              </div>
              <ul className="list-disc space-y-2 pl-5 text-sm font-medium text-slate-800">
                {recommendations.keyMessages.map((msg, idx) => (
                  <li key={idx} className="leading-relaxed">{msg}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Empty State */}
      {!recommendations && !loading && !error && (
        <EmptyState
          icon={Stethoscope}
          title="Evidence-Based Clinical Protocol"
          description="Synthesize tailored nutrition, physical therapy, joint preservation, lifestyle, and follow-up scheduling protocols from latest serology data."
          action={
            <button type="button" onClick={generateRecommendations} className="btn-primary">
              <Sparkles className="h-4 w-4" />
              Synthesize Protocol
            </button>
          }
        />
      )}
    </div>
  );
};

export default Recommendations;