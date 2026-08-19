import React, { useState, useEffect } from 'react';
import { Utensils, Activity, Sun, Brain, ChevronDown, ChevronUp, ShieldCheck, Stethoscope, ClipboardCheck, AlertCircle, CheckCircle2 } from 'lucide-react';
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
    return icons[section] || ClipboardCheck;
  };

  if (loading) {
    return <Loader label="Synthesizing evidence-based clinical guidance protocol…" />;
  }

  return (
    <div className="space-y-5">
      {/* Trigger Card Banner */}
      <div className="panel p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary-50 text-primary-700 ring-1 ring-primary-100">
              <Stethoscope className="h-4 w-4" aria-hidden="true" />
            </span>
            <div>
              <h2 className="text-sm font-semibold text-slate-900">Evidence-Based Clinical Guidance Protocol</h2>
              <p className="text-xs text-slate-500">Synthesizes targeted dietary, physical therapy, and joint preservation recommendations.</p>
            </div>
          </div>
          <button type="button" onClick={generateRecommendations} disabled={loading} className="btn-primary shrink-0 text-sm">
            <ClipboardCheck className="h-4 w-4" aria-hidden="true" />
            {recommendations ? 'Regenerate Protocol' : 'Synthesize Protocol'}
          </button>
        </div>
      </div>

      {error && (
        <div className="flex items-start gap-2.5 rounded-md border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-rose-600" aria-hidden="true" />
          <span>{error}</span>
        </div>
      )}

      {/* Protocol Display */}
      {recommendations && (
        <div className="space-y-5">
          {/* Clinical Summary Bar */}
          <div className="panel overflow-hidden">
            <div className="panel-header">
              <h3 className="panel-title">Clinical Baseline Summary</h3>
              <Badge tone={getSeverityTone(recommendations.patientSummary.severity)} showDot>
                Severity Classification: {recommendations.patientSummary.severity}
              </Badge>
            </div>

            <dl className="grid grid-cols-2 gap-4 p-5 text-sm lg:grid-cols-4">
              <div className="rounded-md bg-slate-50 px-3 py-2.5 ring-1 ring-inset ring-slate-200">
                <dt className="text-xs font-medium text-slate-500">Demographics Context</dt>
                <dd className="mt-0.5 tabular-nums font-semibold text-slate-900">
                  {recommendations.patientSummary.age} yrs ({recommendations.patientSummary.gender})
                </dd>
              </div>
              <div className="rounded-md bg-slate-50 px-3 py-2.5 ring-1 ring-inset ring-slate-200">
                <dt className="text-xs font-medium text-slate-500">Model Risk Index</dt>
                <dd className="mt-0.5 tabular-nums font-semibold text-slate-900">{recommendations.patientSummary.riskScore}%</dd>
              </div>
              <div className="rounded-md bg-slate-50 px-3 py-2.5 ring-1 ring-inset ring-slate-200">
                <dt className="text-xs font-medium text-slate-500">ML Probability</dt>
                <dd className="mt-0.5 tabular-nums font-semibold text-slate-900">
                  {recommendations.patientSummary.modelProbability
                    ? `${(recommendations.patientSummary.modelProbability * 100).toFixed(1)}%`
                    : 'Evaluated'}
                </dd>
              </div>
              <div className="rounded-md bg-slate-50 px-3 py-2.5 ring-1 ring-inset ring-slate-200">
                <dt className="text-xs font-medium text-slate-500">Protocol Categories</dt>
                <dd className="mt-0.5 tabular-nums font-semibold text-primary-800">
                  {Object.keys(recommendations.recommendations).length} Modules
                </dd>
              </div>
            </dl>
          </div>

          {/* Structured Accordion Cards */}
          <div className="space-y-3">
            {Object.entries(recommendations.recommendations).map(([sectionKey, sectionData]) => {
              const Icon = getSectionIcon(sectionKey);
              const isOpen = !!expandedSections[sectionKey];
              return (
                <div key={sectionKey} className="panel overflow-hidden">
                  <button
                    type="button"
                    onClick={() => toggleSection(sectionKey)}
                    aria-expanded={isOpen}
                    className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left transition-colors hover:bg-slate-50"
                  >
                    <div className="flex items-center gap-3">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary-50 text-primary-700 ring-1 ring-primary-100">
                        <Icon className="h-4 w-4" aria-hidden="true" />
                      </span>
                      <div>
                        <h4 className="text-[14px] font-semibold text-slate-900">{sectionData.title}</h4>
                        <p className="text-xs text-slate-500">{sectionData.sections.length} evidence categories</p>
                      </div>
                    </div>
                    {isOpen ? (
                      <ChevronUp className="h-5 w-5 shrink-0 text-slate-400" aria-hidden="true" />
                    ) : (
                      <ChevronDown className="h-5 w-5 shrink-0 text-slate-400" aria-hidden="true" />
                    )}
                  </button>

                  {isOpen && (
                    <div className="space-y-4 border-t border-slate-200 bg-slate-50/50 p-5">
                      {sectionData.sections.map((subsection, index) => (
                        <div key={index} className="space-y-2.5">
                          <h5 className="text-[13px] font-semibold text-slate-900">{subsection.title}</h5>
                          <ul className="space-y-2 text-sm text-slate-700">
                            {subsection.items.map((item, itemIndex) => (
                              <li key={itemIndex} className="flex items-start gap-2">
                                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary-700" aria-hidden="true" />
                                <span className="leading-relaxed">{item}</span>
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
            <div className="rounded-md border border-primary-200 bg-primary-50/60 p-5">
              <div className="flex items-center gap-2 text-sm font-semibold text-primary-950">
                <ShieldCheck className="h-4 w-4 text-primary-800" aria-hidden="true" />
                Essential Clinical Notes &amp; Monitoring Directives
              </div>
              <ul className="mt-3 space-y-2 pl-1 text-sm text-slate-800">
                {recommendations.keyMessages.map((msg, idx) => (
                  <li key={idx} className="flex items-start gap-2 leading-relaxed">
                    <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-primary-700" aria-hidden="true" />
                    {msg}
                  </li>
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
          description="Synthesize tailored nutrition, physical therapy, joint preservation, lifestyle, and follow-up scheduling protocols from the latest serology data."
          action={
            <button type="button" onClick={generateRecommendations} className="btn-primary">
              <ClipboardCheck className="h-4 w-4" aria-hidden="true" />
              Synthesize Protocol
            </button>
          }
        />
      )}
    </div>
  );
};

export default Recommendations;