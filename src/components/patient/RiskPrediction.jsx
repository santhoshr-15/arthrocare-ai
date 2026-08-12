import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  AlertTriangle, 
  CheckCircle2, 
  AlertCircle, 
  TrendingUp, 
  Activity, 
  Stethoscope, 
  RefreshCw,
  FlaskConical,
  ShieldCheck,
  FileSpreadsheet,
  Info
} from 'lucide-react';
import { collection, query, where, getDocs, orderBy, limit } from "firebase/firestore";
import { auth, db } from "../../firebase/config";
import { onAuthStateChanged } from "firebase/auth";
import CardTransition from '../animations/CardTransition';

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

  useEffect(() => {
    if (currentUser) loadLatestLabDataAndPredict();
  }, [currentUser]);

  const loadLatestLabDataAndPredict = async () => {
    try {
      setLoading(true);
      setError('');

      if (!currentUser) {
        setError('Please log in first.');
        setLoading(false);
        return;
      }

      console.log("📥 Fetching lab data for:", currentUser.uid);
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

      console.log("🚀 Sending payload:", payload);

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

      console.log("✅ Prediction received:", result);
      setPredictionData(result);
    } catch (err) {
      console.error("❌ Prediction error:", err);
      setError(err.message || 'Unable to load prediction report.');
    } finally {
      setLoading(false);
    }
  };

  const getRiskBadge = (risk) => {
    switch (risk) {
      case 'Very Low':
        return {
          bg: "bg-emerald-50 text-emerald-800 border-emerald-200",
          bar: "bg-emerald-600",
          icon: <CheckCircle2 className="w-5 h-5 text-emerald-600" />
        };
      case 'Low':
        return {
          bg: "bg-amber-50 text-amber-800 border-amber-200",
          bar: "bg-amber-500",
          icon: <CheckCircle2 className="w-5 h-5 text-amber-600" />
        };
      case 'Moderate':
        return {
          bg: "bg-orange-50 text-orange-800 border-orange-200",
          bar: "bg-orange-500",
          icon: <AlertCircle className="w-5 h-5 text-orange-600" />
        };
      case 'High':
        return {
          bg: "bg-rose-50 text-rose-800 border-rose-200",
          bar: "bg-rose-600",
          icon: <AlertTriangle className="w-5 h-5 text-rose-600" />
        };
      default:
        return {
          bg: "bg-slate-50 text-slate-800 border-slate-200",
          bar: "bg-slate-500",
          icon: <Activity className="w-5 h-5 text-slate-600" />
        };
    }
  };

  if (loading) return (
    <CardTransition className="bg-white p-8 rounded-2xl border border-slate-200/90 shadow-sm text-center">
      <div className="flex flex-col items-center py-12 space-y-3">
        <div className="w-10 h-10 border-3 border-teal-700 border-t-transparent rounded-full animate-spin"></div>
        <h3 className="text-base font-bold text-slate-900">Running Machine Learning Model</h3>
        <p className="text-xs text-slate-500">Evaluating age & gender adjusted serology thresholds...</p>
      </div>
    </CardTransition>
  );

  if (error) return (
    <CardTransition className="bg-white p-8 rounded-2xl border border-slate-200/90 shadow-sm text-center">
      <AlertCircle className="w-12 h-12 text-rose-600 mx-auto mb-4" />
      <h3 className="text-lg font-bold text-rose-800 mb-2">Unable to Generate Risk Report</h3>
      <p className="text-xs text-slate-600 max-w-md mx-auto mb-6">{error}</p>
      <button
        onClick={loadLatestLabDataAndPredict}
        className="px-5 py-2.5 bg-teal-700 hover:bg-teal-800 text-white font-semibold rounded-xl text-xs transition-colors inline-flex items-center space-x-2 shadow-sm mx-auto"
      >
        <RefreshCw className="w-4 h-4" />
        <span>Retry Analysis</span>
      </button>
    </CardTransition>
  );

  if (!hasLabData && !predictionData) return (
    <CardTransition className="bg-white p-8 rounded-2xl border border-slate-200/90 shadow-sm text-center space-y-4">
      <Stethoscope className="w-12 h-12 text-slate-400 mx-auto" />
      <h3 className="text-lg font-bold text-slate-900">No Lab Biomarkers Recorded</h3>
      <p className="text-xs text-slate-500 max-w-sm mx-auto">Please enter your serological laboratory measurements first to calculate RA risk probability.</p>
    </CardTransition>
  );

  const riskBadge = getRiskBadge(predictionData.risk_level);

  return (
    <CardTransition className="space-y-6">
      
      {/* Risk Score Summary Card */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between border-b border-slate-100 pb-6 mb-6 gap-4">
          <div>
            <div className="inline-flex items-center space-x-2 text-xs font-semibold text-teal-700 bg-teal-50 px-2.5 py-1 rounded-md border border-teal-200/60 mb-2">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Diagnostic Risk Probability Report</span>
            </div>
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Rheumatoid Arthritis Risk Profile</h2>
            <p className="text-xs text-slate-500 mt-1">Multi-factor Machine Learning output with physiological baselines</p>
          </div>

          <div className="flex items-center space-x-3">
            <span className={`inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full text-xs font-bold border ${riskBadge.bg}`}>
              {riskBadge.icon}
              <span>Risk Classification: {predictionData.risk_level}</span>
            </span>
          </div>
        </div>

        {/* Gauge Bar & Numerical Score */}
        <div className="grid md:grid-cols-12 gap-8 items-center bg-slate-50/70 p-6 rounded-xl border border-slate-200">
          
          <div className="md:col-span-5 text-center md:text-left space-y-2">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Calculated Risk Index</div>
            <div className="text-5xl font-extrabold text-slate-900 tracking-tight">
              {predictionData.risk_score}<span className="text-2xl text-slate-500">%</span>
            </div>
            <div className="text-xs text-slate-600 font-medium">
              Probability Ratio: <span className="font-bold text-slate-900">{predictionData.risk_probability}</span>
            </div>
            <div className="text-xs text-slate-500">
              Binary Model Output: <span className="font-bold text-slate-800">{predictionData.binary_prediction === 1 ? 'Positive Sign' : 'Negative Sign'}</span>
            </div>
          </div>

          <div className="md:col-span-7 space-y-3">
            <div className="flex justify-between items-center text-xs font-semibold text-slate-600">
              <span>Very Low (0-40%)</span>
              <span>Low (40-65%)</span>
              <span>Moderate (65-85%)</span>
              <span>High (85-100%)</span>
            </div>
            <div className="w-full bg-slate-200 h-3 rounded-full overflow-hidden flex">
              <div className={`h-full ${riskBadge.bar} transition-all duration-500`} style={{ width: `${Math.max(predictionData.risk_score, 4)}%` }} />
            </div>
            <div className="text-[11px] text-slate-500 text-right">
              Assessed on 4-biomarker quantitative serology panel
            </div>
          </div>

        </div>

      </div>

      {/* Clinical Assessment & Next Steps */}
      <div className="grid lg:grid-cols-12 gap-6">
        
        {/* Assessment Recommendations */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 space-y-4">
          <div className="flex items-center space-x-2 border-b border-slate-100 pb-4">
            <Stethoscope className="w-5 h-5 text-teal-700" />
            <h3 className="text-base font-bold text-slate-900">Clinical Observations & Guidance</h3>
          </div>

          <div className="space-y-3">
            {predictionData.recommendations && predictionData.recommendations.map((rec, idx) => (
              <div key={idx} className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl text-xs text-slate-700 leading-relaxed font-medium">
                {rec}
              </div>
            ))}
          </div>
        </div>

        {/* Analyzed Biomarker Matrix */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center space-x-2">
              <FlaskConical className="w-5 h-5 text-teal-700" />
              <h3 className="text-base font-bold text-slate-900">Analyzed Parameters</h3>
            </div>
            <button
              onClick={loadLatestLabDataAndPredict}
              className="text-xs text-slate-500 hover:text-teal-700 flex items-center space-x-1"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Refresh</span>
            </button>
          </div>

          <div className="space-y-2.5 text-xs">
            <div className="flex justify-between items-center p-2.5 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-slate-500 font-medium">Age / Gender</span>
              <span className="font-bold text-slate-900">{predictionData.factors_analyzed.age} yrs ({predictionData.factors_analyzed.gender})</span>
            </div>
            <div className="flex justify-between items-center p-2.5 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-slate-500 font-medium">Rheumatoid Factor</span>
              <span className="font-bold text-slate-900">{predictionData.factors_analyzed.rheumatoid_factor} IU/mL</span>
            </div>
            <div className="flex justify-between items-center p-2.5 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-slate-500 font-medium">Anti-CCP Antibodies</span>
              <span className="font-bold text-slate-900">{predictionData.factors_analyzed.anti_ccp} U/mL</span>
            </div>
            <div className="flex justify-between items-center p-2.5 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-slate-500 font-medium">C-Reactive Protein</span>
              <span className="font-bold text-slate-900">{predictionData.factors_analyzed.c_reactive_protein} mg/L</span>
            </div>
            <div className="flex justify-between items-center p-2.5 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-slate-500 font-medium">ESR Rate</span>
              <span className="font-bold text-slate-900">{predictionData.factors_analyzed.esr} mm/hr</span>
            </div>
          </div>
        </div>

      </div>

    </CardTransition>
  );
};

export default RiskPrediction;
