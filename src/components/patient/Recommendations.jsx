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
    return <Loader label="Synthesizing evidence-based recommendations…" />;
  }

  return (
    <div className="space-y-6">
      {/* Trigger */}
      <div className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-teal-50 text-teal-700">
            <Stethoscope className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-slate-900">Personalized health guidance protocol</h2>
            <p className="mt-0.5 text-xs text-slate-500">
              Generate dietary, physical activity, and joint preservation recommendations from your latest serology data.
            </p>
          </div>
        </div>
        <button type="button" onClick={generateRecommendations} disabled={loading} className="btn-primary shrink-0">
          <Sparkles className="h-4 w-4" />
          {recommendations ? 'Regenerate protocol' : 'Generate protocol'}
        </button>
      </div>

      {error && (
        <div className="flex items-start gap-2 rounded-lg border border-rose-200 bg-rose-50 px-3.5 py-3 text-sm text-rose-700">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Protocol display */}
      {recommendations && (
        <div className="space-y-6">
          {/* Patient summary */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6">
            <div className="mb-4 flex items-center justify-between border-b border-slate-200 pb-4">
              <h3 className="text-sm font-semibold text-slate-900">Clinical baseline summary</h3>
              <Badge tone={getSeverityTone(recommendations.patientSummary.severity)}>
                Severity index: {recommendations.patientSummary.severity}
              </Badge>
            </div>

            <dl className="grid grid-cols-2 gap-4 text-sm lg:grid-cols-4">
              <div>
                <dt className="text-xs text-slate-500">Age / sex</dt>
                <dd className="mt-0.5 font-semibold text-slate-900">
                  {recommendations.patientSummary.age} yrs ({recommendations.patientSummary.gender})
                </dd>
              </div>
              <div>
                <dt className="text-xs text-slate-500">Risk index</dt>
                <dd className="mt-0.5 font-semibold text-slate-900">{recommendations.patientSummary.riskScore}%</dd>
              </div>
              <div>
                <dt className="text-xs text-slate-500">ML probability</dt>
                <dd className="mt-0.5 font-semibold text-slate-900">
                  {recommendations.patientSummary.modelProbability
                    ? `${(recommendations.patientSummary.modelProbability * 100).toFixed(1)}%`
                    : 'Evaluated'}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-slate-500">Protocol modules</dt>
                <dd className="mt-0.5 font-semibold text-teal-700">
                  {Object.keys(recommendations.recommendations).length}
                </dd>
              </div>
            </dl>
          </div>

          {/* Collapsible guidance modules */}
          <div className="space-y-4">
            {Object.entries(recommendations.recommendations).map(([sectionKey, sectionData]) => {
              const Icon = getSectionIcon(sectionKey);
              const isOpen = !!expandedSections[sectionKey];
              return (
                <div key={sectionKey} className="overflow-hidden rounded-xl border border-slate-200 bg-white">
                  <button
                    type="button"
                    onClick={() => toggleSection(sectionKey)}
                    aria-expanded={isOpen}
                    className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left transition-colors hover:bg-slate-50"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-teal-50 text-teal-700">
                        <Icon className="h-4 w-4" />
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-slate-900">{sectionData.title}</h4>
                        <p className="text-xs text-slate-500">{sectionData.sections.length} tailored guidance categories</p>
                      </div>
                    </div>
                    {isOpen ? (
                      <ChevronUp className="h-5 w-5 shrink-0 text-slate-400" />
                    ) : (
                      <ChevronDown className="h-5 w-5 shrink-0 text-slate-400" />
                    )}
                  </button>

                  {isOpen && (
                    <div className="space-y-4 border-t border-slate-200 bg-slate-50/60 p-5">
                      {sectionData.sections.map((subsection, index) => (
                        <div key={index} className="space-y-2 rounded-lg border border-slate-200 bg-white p-4">
                          <h5 className="text-xs font-semibold uppercase tracking-wide text-slate-900">{subsection.title}</h5>
                          <ul className="space-y-1.5 text-sm text-slate-700">
                            {subsection.items.map((item, itemIndex) => (
                              <li key={itemIndex} className="flex items-start gap-2">
                                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-teal-600" />
                                <span>{item}</span>
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

          {/* Key messages */}
          {recommendations.keyMessages && (
            <div className="space-y-2 rounded-xl border border-teal-200 bg-teal-50/70 px-5 py-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-teal-900">
                <ShieldCheck className="h-4 w-4 text-teal-700" />
                Essential clinical notes & reminders
              </div>
              <ul className="list-disc space-y-1 pl-6 text-sm text-slate-800">
                {recommendations.keyMessages.map((msg, idx) => (
                  <li key={idx}>{msg}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Empty state */}
      {!recommendations && !loading && !error && (
        <EmptyState
          icon={Stethoscope}
          title="Evidence-based clinical protocol"
          description="Generate tailored nutrition, physical therapy, lifestyle, and mental wellness recommendations based on your serology data."
          action={
            <button type="button" onClick={generateRecommendations} className="btn-primary">
              <Sparkles className="h-4 w-4" />
              Generate protocol
            </button>
          }
        />
      )}
    </div>
  );
};

export default Recommendations;