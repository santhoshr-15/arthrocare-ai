import React, { useState, useEffect, useCallback } from 'react';
import { AlertTriangle, AlertCircle, RefreshCw, ShieldCheck, Stethoscope, FlaskConical, CheckCircle2 } from 'lucide-react';
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
        setError('Please sign in to access risk prediction reports.');
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
        setError('Please sign in first.');
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
        setError('No laboratory measurement records found. Please enter lab test results first.');
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

  const getRiskTone = (risk) => {
    switch (risk) {
      case 'Very Low': return 'emerald';
      case 'Low': return 'amber';
      case 'Moderate': return 'orange';
      case 'High': return 'rose';
      default: return 'slate';
    }
  };

  if (loading) {
    return <Loader label="Executing multivariable machine-learning risk scoring model…" />;
  }

  if (error && !predictionData) {
    return (
      <EmptyState
        icon={AlertCircle}
        title="Unable to Generate Risk Stratification Report"
        description={error}
        action={
          <button type="button" onClick={loadLatestLabDataAndPredict} className="btn-primary">
            <RefreshCw className="h-3.5 w-3.5" />
            Retry Analysis Model
          </button>
        }
      />
    );
  }

  if (!hasLabData && !predictionData) {
    return (
      <EmptyState
        icon={Stethoscope}
        title="No Laboratory Biomarkers Recorded"
        description="Please submit quantitative serology measurements (RF, Anti-CCP, CRP, ESR) to compute RA risk probability."
        action={
          window.dashboardSetTab && (
            <button
              type="button"
              onClick={() => window.dashboardSetTab("Lab Test Entry")}
              className="btn-primary"
            >
              Enter Laboratory Panel
            </button>
          )
        }
      />
    );
  }

  const tone = getRiskTone(predictionData.risk_level);

  return (
    <div className="space-y-6">
      {/* Executive Risk Score Banner */}
      <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-2xs">
        <div className="flex flex-col gap-3 border-b border-slate-200 pb-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-teal-50 text-teal-800 border border-teal-200">
              <ShieldCheck className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900">Multivariable Decision Support Summary</h2>
              <p className="text-[11px] text-slate-500">Machine learning model trained on age- &amp; sex-adjusted serology.</p>
            </div>
          </div>
          <Badge tone={tone} showDot>
            Risk Stratification: {predictionData.risk_level}
          </Badge>
        </div>

        <div className="mt-5 grid gap-6 md:grid-cols-12 md:items-center">
          <div className="md:col-span-5 space-y-1.5 border-r border-slate-100 pr-4">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Calculated RA Risk Score</p>
            <p className="text-4xl font-extrabold tracking-tight text-slate-900">
              {predictionData.risk_score}<span className="text-xl font-bold text-slate-400">%</span>
            </p>
            <div className="flex flex-col gap-1 text-xs text-slate-600 font-medium pt-1">
              <span>Probability Ratio: <strong className="text-slate-900">{predictionData.risk_probability}</strong></span>
              <span>Binary Classification: <strong className="text-slate-900">{predictionData.binary_prediction === 1 ? 'Positive Serology Signal' : 'Negative Serology Signal'}</strong></span>
            </div>
          </div>

          <div className="md:col-span-7 space-y-2.5">
            <div className="flex justify-between text-[11px] font-bold uppercase text-slate-500">
              <span>Very Low (&lt;40%)</span>
              <span>Low (40–65%)</span>
              <span>Moderate (65–85%)</span>
              <span>High (&gt;85%)</span>
            </div>
            <div className="h-2.5 w-full overflow-hidden rounded-md bg-slate-100 border border-slate-200">
              <div
                className={`h-full transition-all duration-500 ${
                  tone === 'emerald' ? 'bg-emerald-600' :
                  tone === 'amber' ? 'bg-amber-500' :
                  tone === 'orange' ? 'bg-orange-500' : 'bg-rose-600'
                }`}
                style={{ width: `${Math.max(predictionData.risk_score, 4)}%` }}
              />
            </div>
            <p className="text-[11px] text-slate-500 leading-tight">
              Assessed via 4-biomarker quantitative panel normalized against baseline demographic controls.
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        {/* Clinical Guidance Observations */}
        <div className="lg:col-span-7">
          <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-2xs">
            <div className="mb-4 flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2">
                <Stethoscope className="h-4 w-4 text-teal-800" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">Model Interpretations &amp; Clinical Guidance</h3>
              </div>
            </div>

            {predictionData.recommendations && predictionData.recommendations.length > 0 ? (
              <div className="space-y-2.5">
                {predictionData.recommendations.map((rec, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 rounded-md border border-slate-200 bg-slate-50 p-3 text-xs leading-relaxed text-slate-700">
                    <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 text-teal-700 shrink-0" />
                    <span>{rec}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-500">No additional diagnostic observations recorded.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RiskPrediction;