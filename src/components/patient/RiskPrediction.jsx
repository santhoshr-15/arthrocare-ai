import React, { useState, useEffect, useCallback } from 'react';
import { AlertTriangle, AlertCircle, RefreshCw, ShieldCheck, Stethoscope, FlaskConical } from 'lucide-react';
import { collection, query, where, getDocs, orderBy, limit } from "firebase/firestore";
import { auth, db } from "../../firebase/config";
import { onAuthStateChanged } from "firebase/auth";
import Badge from '../ui/Badge';
import EmptyState from '../ui/EmptyState';
import Loader from '../ui/Loader';

const backendURL = import.meta.env.VITE_BACKEND_URL;

const RiskPrediction = () => {
  const [predictionData, setPredictionData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  const [hasLabData, setHasLabData] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUser(user);
      } else {
        setError('Please log in to view predictions.');
        setCurrentUser(null);
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  const loadLatestLabDataAndPredict = useCallback(async () => {
    try {
      setLoading(true);
      setError('');

      if (!currentUser) {
        setError('Please log in first.');
        setLoading(false);
        return;
      }

      const labQuery = query(
        collection(db, "LabInformation"),
        where("userId", "==", currentUser.uid),
        orderBy("createdAt", "desc"),
        limit(1)
      );
      const snapshot = await getDocs(labQuery);

      if (snapshot.empty) {
        setError('No lab measurement records found. Please enter lab test results first.');
        setHasLabData(false);
        setLoading(false);
        return;
      }

      const labData = snapshot.docs[0].data();
      setHasLabData(true);

      const payload = {
        age: labData.userAge,
        gender: labData.userGender,
        rheumatoidFactor: labData.rheumatoidFactor,
        antiCCP: labData.antiCCP,
        cReactiveProtein: labData.cReactiveProtein,
        erythrocyteSedimentationRate: labData.erythrocyteSedimentationRate
      };

      const response = await fetch(`${backendURL}/api/predict-ra-risk`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`Backend API error: ${response.status}`);
      }

      const result = await response.json();
      if (result.error) throw new Error(result.error);

      setPredictionData(result);
    } catch (err) {
      console.error("Prediction error:", err);
      setError(err.message || 'Unable to load prediction report.');
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    if (currentUser) loadLatestLabDataAndPredict();
  }, [currentUser, loadLatestLabDataAndPredict]);

  const getRiskBadge = (risk) => {
    switch (risk) {
      case 'Very Low':
        return { tone: 'emerald', bar: 'bg-emerald-600', icon: <ShieldCheck className="h-5 w-5 text-emerald-600" /> };
      case 'Low':
        return { tone: 'amber', bar: 'bg-amber-500', icon: <ShieldCheck className="h-5 w-5 text-amber-600" /> };
      case 'Moderate':
        return { tone: 'orange', bar: 'bg-orange-500', icon: <AlertCircle className="h-5 w-5 text-orange-600" /> };
      case 'High':
        return { tone: 'rose', bar: 'bg-rose-600', icon: <AlertTriangle className="h-5 w-5 text-rose-600" /> };
      default:
        return { tone: 'slate', bar: 'bg-slate-500', icon: <ShieldCheck className="h-5 w-5 text-slate-600" /> };
    }
  };

  if (loading) {
    return <Loader label="Running the machine-learning risk model…" />;
  }

  if (error && !predictionData) {
    return (
      <EmptyState
        icon={AlertCircle}
        title="Unable to generate risk report"
        description={error}
        action={
          <button type="button" onClick={loadLatestLabDataAndPredict} className="btn-primary">
            <RefreshCw className="h-4 w-4" />
            Retry analysis
          </button>
        }
      />
    );
  }

  if (!hasLabData && !predictionData) {
    return (
      <EmptyState
        icon={Stethoscope}
        title="No lab biomarkers recorded"
        description="Enter your serological laboratory measurements first to calculate your RA risk probability."
      />
    );
  }

  const riskBadge = getRiskBadge(predictionData.risk_level);

  return (
    <div className="space-y-6">
      {/* Risk summary */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6">
        <div className="flex flex-col gap-4 border-b border-slate-200 pb-5 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-teal-50 text-teal-700">
              <ShieldCheck className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-slate-900">Diagnostic risk probability report</h2>
              <p className="mt-0.5 text-xs text-slate-500">Multi-factor machine-learning output with physiological baselines.</p>
            </div>
          </div>
          <Badge tone={riskBadge.tone}>
            {riskBadge.icon}
            Risk classification: {predictionData.risk_level}
          </Badge>
        </div>

        <div className="mt-6 grid gap-6 md:grid-cols-2 md:items-center">
          <div className="space-y-2">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Calculated risk index</p>
            <p className="text-5xl font-semibold tracking-tight text-slate-900">
              {predictionData.risk_score}<span className="text-2xl text-slate-400">%</span>
            </p>
            <p className="text-sm text-slate-600">
              Probability ratio: <span className="font-semibold text-slate-900">{predictionData.risk_probability}</span>
            </p>
            <p className="text-sm text-slate-600">
              Binary model output:{" "}
              <span className="font-semibold text-slate-900">
                {predictionData.binary_prediction === 1 ? 'Positive sign' : 'Negative sign'}
              </span>
            </p>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between text-xs font-medium text-slate-600">
              <span>Very low (0–40%)</span>
              <span>Low (40–65%)</span>
              <span>Moderate (65–85%)</span>
              <span>High (85–100%)</span>
            </div>
            <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
              <div
                className={`h-2.5 rounded-full transition-all duration-500 ${riskBadge.bar}`}
                style={{ width: `${Math.max(predictionData.risk_score, 4)}%` }}
              />
            </div>
            <p className="text-xs text-slate-500">Assessed on a 4-biomarker quantitative serology panel.</p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        {/* Clinical observations */}
        <div className="space-y-4 lg:col-span-7">
          <div className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6">
            <div className="mb-4 flex items-center gap-2 border-b border-slate-200 pb-4">
              <Stethoscope className="h-4 w-4 text-teal-700" />
              <h3 className="text-sm font-semibold text-slate-900">Clinical observations & guidance</h3>
            </div>

            {predictionData.recommendations && predictionData.recommendations.length > 0 ? (
              <ul className="space-y-3">
                {predictionData.recommendations.map((rec, idx) => (
                  <li key={idx} className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-relaxed text-slate-700">
                    {rec}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-slate-500">No additional observations were generated.</p>
            )}
          </div>
        </div>

        {/* Analyzed parameters */}
        <div className="lg:col-span-5">
          <div className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6">
            <div className="mb-4 flex items-center justify-between border-b border-slate-200 pb-4">
              <div className="flex items-center gap-2">
                <FlaskConical className="h-4 w-4 text-teal-700" />
                <h3 className="text-sm font-semibold text-slate-900">Analyzed parameters</h3>
              </div>
              <button
                type="button"
                onClick={loadLatestLabDataAndPredict}
                className="btn-ghost"
              >
                <RefreshCw className="h-4 w-4" />
                Refresh
              </button>
            </div>

            <dl className="space-y-2 text-sm">
              <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-2.5">
                <dt className="text-slate-500">Age / sex</dt>
                <dd className="font-semibold text-slate-900">
                  {predictionData.factors_analyzed.age} yrs ({predictionData.factors_analyzed.gender})
                </dd>
              </div>
              <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-2.5">
                <dt className="text-slate-500">Rheumatoid factor</dt>
                <dd className="font-semibold text-slate-900">{predictionData.factors_analyzed.rheumatoid_factor} IU/mL</dd>
              </div>
              <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-2.5">
                <dt className="text-slate-500">Anti-CCP antibodies</dt>
                <dd className="font-semibold text-slate-900">{predictionData.factors_analyzed.anti_ccp} U/mL</dd>
              </div>
              <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-2.5">
                <dt className="text-slate-500">C-reactive protein</dt>
                <dd className="font-semibold text-slate-900">{predictionData.factors_analyzed.c_reactive_protein} mg/L</dd>
              </div>
              <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-2.5">
                <dt className="text-slate-500">ESR rate</dt>
                <dd className="font-semibold text-slate-900">{predictionData.factors_analyzed.esr} mm/hr</dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RiskPrediction;