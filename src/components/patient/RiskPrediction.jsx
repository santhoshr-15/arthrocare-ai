import React, { useState, useEffect, useCallback } from 'react';
import { AlertCircle, RefreshCw, ShieldCheck, Stethoscope, CheckCircle2 } from 'lucide-react';
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
    <div className="space-y-5">
      {/* Executive Risk Score Banner */}
      <div className="panel overflow-hidden">
        <div className="panel-header">
          <div className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-md bg-primary-50 text-primary-700 ring-1 ring-primary-100">
              <ShieldCheck className="h-4 w-4" aria-hidden="true" />
            </span>
            <div>
              <h2 className="panel-title">Multivariable Decision Support Summary</h2>
              <p className="panel-subtitle">Machine learning model trained on age- and sex-adjusted serology.</p>
            </div>
          </div>
          <Badge tone={tone} showDot>
            Risk Stratification: {predictionData.risk_level}
          </Badge>
        </div>

        <div className="grid gap-6 p-5 md:grid-cols-12 md:items-center">
          <div className="md:col-span-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">Calculated RA Risk Score</p>
            <p className="mt-1 tabular-nums text-4xl font-bold tracking-tight text-slate-900">
              {predictionData.risk_score}<span className="text-xl font-semibold text-slate-400">%</span>
            </p>
            <dl className="mt-3 space-y-1 text-[13px] text-slate-600">
              <div className="flex justify-between gap-3">
                <dt className="font-medium text-slate-500">Probability ratio</dt>
                <dd className="tabular-nums font-semibold text-slate-900">{predictionData.risk_probability}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="font-medium text-slate-500">Binary classification</dt>
                <dd className="font-semibold text-slate-900">
                  {predictionData.binary_prediction === 1 ? 'Positive serology signal' : 'Negative serology signal'}
                </dd>
              </div>
            </dl>
          </div>

          <div className="md:col-span-7">
            <div className="mb-2 flex justify-between text-[11px] font-semibold text-slate-500">
              <span>Very Low (&lt;40%)</span>
              <span>Low (40–65%)</span>
              <span>Moderate (65–85%)</span>
              <span>High (&gt;85%)</span>
            </div>
            <div className="meter-track">
              <div
                className={`meter-fill ${
                  tone === 'emerald' ? 'bg-emerald-600' :
                  tone === 'amber' ? 'bg-amber-500' :
                  tone === 'orange' ? 'bg-orange-500' : 'bg-rose-600'
                }`}
                style={{ width: `${Math.max(predictionData.risk_score, 4)}%` }}
              />
            </div>
            <p className="mt-2.5 text-xs leading-relaxed text-slate-500">
              Assessed via a four-biomarker quantitative panel normalized against baseline demographic controls.
            </p>
          </div>
        </div>
      </div>

      {/* Clinical Guidance Observations */}
      <div className="panel overflow-hidden">
        <div className="panel-header">
          <div className="flex items-center gap-2">
            <Stethoscope className="h-4 w-4 text-primary-700" aria-hidden="true" />
            <h3 className="panel-title">Model Interpretations &amp; Clinical Guidance</h3>
          </div>
        </div>
        <div className="panel-body">
          {predictionData.recommendations && predictionData.recommendations.length > 0 ? (
            <ul className="space-y-2">
              {predictionData.recommendations.map((rec, idx) => (
                <li key={idx} className="flex items-start gap-2.5 rounded-md bg-slate-50 px-3 py-2.5 text-sm leading-relaxed text-slate-700 ring-1 ring-inset ring-slate-200">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary-700" aria-hidden="true" />
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-slate-500">No additional diagnostic observations recorded.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default RiskPrediction;