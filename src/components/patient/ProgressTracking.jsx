import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { auth, db } from '../../firebase/config';
import { onAuthStateChanged } from 'firebase/auth';
import CardTransition from '../animations/CardTransition';
import { 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  Clock, 
  FileSpreadsheet, 
  Activity, 
  CheckCircle2, 
  AlertTriangle,
  RefreshCw,
  FlaskConical,
  Stethoscope,
  Info
} from 'lucide-react';

const ProgressTracking = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [previousTestData, setPreviousTestData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    monthsSinceLastTest: '',
    currentAge: '',
    currentGender: '',
    currentESR: '',
    currentCRP: '',
    currentRF: '',
    currentAntiCCP: ''
  });
  
  const [comparisonResult, setComparisonResult] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUser(user);
        await loadPreviousTestData(user.uid);
      } else {
        setCurrentUser(null);
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  const loadPreviousTestData = async (userId) => {
    try {
      const collections = ['LabInformation', 'labInformation', 'userLabs', 'labResults'];
      let foundData = null;

      for (const collectionName of collections) {
        try {
          const labInfoQuery = query(
            collection(db, collectionName), 
            where("userId", "==", userId),
            orderBy("createdAt", "desc"),
            limit(1)
          );
          const querySnapshot = await getDocs(labInfoQuery);
          
          if (!querySnapshot.empty) {
            const latestTest = querySnapshot.docs[0];
            const testData = latestTest.data();
            
            foundData = {
              age: Number(testData.userAge || testData.age),
              gender: testData.userGender || testData.gender,
              ESR: Number(testData.erythrocyteSedimentationRate || testData.ESR),
              CRP: Number(testData.cReactiveProtein || testData.CRP),
              RF: Number(testData.rheumatoidFactor || testData.RF),
              antiCCP: Number(testData.antiCCP || testData.antiCCP),
              createdAt: testData.createdAt,
              documentId: latestTest.id
            };
            break;
          }
        } catch (err) { continue; }
      }

      if (foundData) {
        setPreviousTestData(foundData);
        setFormData(prev => ({ ...prev, currentAge: foundData.age }));
      }
    } catch (err) {
      console.error("Error loading data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));

    if (field === 'monthsSinceLastTest' && previousTestData?.age) {
      const months = parseFloat(value);
      if (!isNaN(months) && months > 0) {
        const prevAge = parseFloat(previousTestData.age);
        const estimatedAge = (prevAge + (months / 12)).toFixed(1);
        setFormData(prev => ({ ...prev, currentAge: estimatedAge }));
      }
    }
  };

  const normalizeGender = (genderString) => {
    if (!genderString) return 'F';
    const s = String(genderString).toUpperCase();
    return (s.startsWith('M') || s === '1') ? 'M' : 'F';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setComparisonResult(null);
    
    if (!previousTestData || !formData.monthsSinceLastTest) {
      alert("Please ensure all required input fields are filled.");
      return;
    }

    setIsSubmitting(true);
    
    try {
      const payload = {
        monthsSinceLastTest: Number(formData.monthsSinceLastTest),
        previousAge: Number(previousTestData.age),
        previousGender: normalizeGender(previousTestData.gender),
        previousESR: Number(previousTestData.ESR),
        previousCRP: Number(previousTestData.CRP),
        previousRF: Number(previousTestData.RF),
        previousAntiCCP: Number(previousTestData.antiCCP),
        currentAge: Number(formData.currentAge),
        currentGender: normalizeGender(formData.currentGender),
        currentESR: Number(formData.currentESR),
        currentCRP: Number(formData.currentCRP),
        currentRF: Number(formData.currentRF),
        currentAntiCCP: Number(formData.currentAntiCCP)
      };

      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/compare-ra-risk`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          mode: 'cors',
          body: JSON.stringify(payload)
        }
      );

      const responseText = await response.text();
      let result;
      
      try {
        result = JSON.parse(responseText);
      } catch (err) {
        throw new Error("Backend returned HTML instead of JSON. Check server logs.");
      }

      if (!response.ok) throw new Error(result.error || "Server Error");

      setComparisonResult(result);

    } catch (err) {
      alert(`Analysis Error: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const clearForm = () => {
    setFormData({
      monthsSinceLastTest: '',
      currentAge: previousTestData?.age || '',
      currentGender: '',
      currentESR: '',
      currentCRP: '',
      currentRF: '',
      currentAntiCCP: ''
    });
    setComparisonResult(null);
  };

  if (loading) {
    return (
      <CardTransition className="bg-white p-8 rounded-2xl border border-slate-200/90 shadow-sm text-center">
        <div className="w-8 h-8 border-3 border-teal-700 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Retrieving Historical Lab Measurements...</p>
      </CardTransition>
    );
  }

  if (!previousTestData) {
    return (
      <CardTransition className="bg-white p-8 rounded-2xl border border-slate-200/90 shadow-sm text-center space-y-4">
        <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto" />
        <h3 className="text-lg font-bold text-slate-900">Initial Lab Test Required</h3>
        <p className="text-xs text-slate-500 max-w-sm mx-auto">You must submit at least one laboratory measurement entry before running comparative progression tracking.</p>
      </CardTransition>
    );
  }

  return (
    <CardTransition className="space-y-6">
      
      {/* Comparative Form Card */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-teal-700 rounded-xl flex items-center justify-center text-white shadow-sm">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Comparative Disease Progression Analysis</h2>
              <p className="text-xs text-slate-500">Evaluate serial lab measurements against historical baseline panel</p>
            </div>
          </div>

          <button
            onClick={clearForm}
            className="text-xs font-semibold text-slate-500 hover:text-slate-700"
          >
            Clear Form
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Time & Interval Card */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
            <div className="flex items-center space-x-2 text-xs font-bold text-slate-900 uppercase tracking-wider">
              <Clock className="w-4 h-4 text-teal-700" />
              <span>Interval Information</span>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Months Elapsed Since Baseline Test *
                </label>
                <input
                  type="number"
                  value={formData.monthsSinceLastTest}
                  onChange={(e) => handleInputChange('monthsSinceLastTest', e.target.value)}
                  placeholder="e.g. 6"
                  required
                  min="1"
                  className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl text-slate-900 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-teal-500/30"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Baseline Test Record Date
                </label>
                <input
                  type="text"
                  value={previousTestData.createdAt ? new Date(previousTestData.createdAt).toLocaleDateString() : 'Baseline Recorded'}
                  readOnly
                  className="w-full px-4 py-2 bg-slate-100 border border-slate-200 rounded-xl text-slate-600 text-sm font-medium cursor-not-allowed"
                />
              </div>
            </div>
          </div>

          {/* Side by Side Inputs */}
          <div className="grid lg:grid-cols-2 gap-6">
            
            {/* Baseline Record (Read-Only) */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
              <div className="flex items-center justify-between border-b border-slate-200/80 pb-2">
                <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">Baseline Measurements (Auto-Filled)</span>
                <span className="text-[10px] font-bold bg-teal-50 text-teal-800 border border-teal-200 px-2 py-0.5 rounded">Recorded Baseline</span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="text-slate-500 font-medium">Age</label>
                  <input type="text" value={`${previousTestData.age} yrs`} readOnly className="w-full mt-1 p-2 bg-white border border-slate-200 rounded-lg font-semibold" />
                </div>
                <div>
                  <label className="text-slate-500 font-medium">Gender</label>
                  <input type="text" value={previousTestData.gender} readOnly className="w-full mt-1 p-2 bg-white border border-slate-200 rounded-lg font-semibold" />
                </div>
                <div>
                  <label className="text-slate-500 font-medium">ESR (mm/hr)</label>
                  <input type="text" value={previousTestData.ESR} readOnly className="w-full mt-1 p-2 bg-white border border-slate-200 rounded-lg font-semibold" />
                </div>
                <div>
                  <label className="text-slate-500 font-medium">CRP (mg/L)</label>
                  <input type="text" value={previousTestData.CRP} readOnly className="w-full mt-1 p-2 bg-white border border-slate-200 rounded-lg font-semibold" />
                </div>
                <div>
                  <label className="text-slate-500 font-medium">RF (IU/mL)</label>
                  <input type="text" value={previousTestData.RF} readOnly className="w-full mt-1 p-2 bg-white border border-slate-200 rounded-lg font-semibold" />
                </div>
                <div>
                  <label className="text-slate-500 font-medium">Anti-CCP (U/mL)</label>
                  <input type="text" value={previousTestData.antiCCP} readOnly className="w-full mt-1 p-2 bg-white border border-slate-200 rounded-lg font-semibold" />
                </div>
              </div>
            </div>

            {/* Follow-up Test Inputs */}
            <div className="p-4 bg-teal-50/40 border border-teal-200/80 rounded-xl space-y-3">
              <div className="flex items-center justify-between border-b border-teal-200/80 pb-2">
                <span className="text-xs font-bold text-teal-900 uppercase tracking-wider">Follow-Up Measurements</span>
                <span className="text-[10px] font-bold bg-teal-700 text-white px-2 py-0.5 rounded">Current Input</span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="text-slate-700 font-medium">Current Age *</label>
                  <input type="number" step="0.1" value={formData.currentAge} onChange={(e) => handleInputChange('currentAge', e.target.value)} required className="w-full mt-1 p-2 bg-white border border-slate-200 rounded-lg font-semibold focus:ring-2 focus:ring-teal-500/30" />
                </div>
                <div>
                  <label className="text-slate-700 font-medium">Gender *</label>
                  <select value={formData.currentGender} onChange={(e) => handleInputChange('currentGender', e.target.value)} required className="w-full mt-1 p-2 bg-white border border-slate-200 rounded-lg font-semibold focus:ring-2 focus:ring-teal-500/30">
                    <option value="">Select</option>
                    <option value="M">Male</option>
                    <option value="F">Female</option>
                  </select>
                </div>
                <div>
                  <label className="text-slate-700 font-medium">ESR (mm/hr) *</label>
                  <input type="number" step="0.1" value={formData.currentESR} onChange={(e) => handleInputChange('currentESR', e.target.value)} required className="w-full mt-1 p-2 bg-white border border-slate-200 rounded-lg font-semibold focus:ring-2 focus:ring-teal-500/30" />
                </div>
                <div>
                  <label className="text-slate-700 font-medium">CRP (mg/L) *</label>
                  <input type="number" step="0.1" value={formData.currentCRP} onChange={(e) => handleInputChange('currentCRP', e.target.value)} required className="w-full mt-1 p-2 bg-white border border-slate-200 rounded-lg font-semibold focus:ring-2 focus:ring-teal-500/30" />
                </div>
                <div>
                  <label className="text-slate-700 font-medium">RF (IU/mL) *</label>
                  <input type="number" step="0.1" value={formData.currentRF} onChange={(e) => handleInputChange('currentRF', e.target.value)} required className="w-full mt-1 p-2 bg-white border border-slate-200 rounded-lg font-semibold focus:ring-2 focus:ring-teal-500/30" />
                </div>
                <div>
                  <label className="text-slate-700 font-medium">Anti-CCP (U/mL) *</label>
                  <input type="number" step="0.1" value={formData.currentAntiCCP} onChange={(e) => handleInputChange('currentAntiCCP', e.target.value)} required className="w-full mt-1 p-2 bg-white border border-slate-200 rounded-lg font-semibold focus:ring-2 focus:ring-teal-500/30" />
                </div>
              </div>
            </div>

          </div>

          <div className="flex justify-end border-t border-slate-100 pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-3 bg-teal-700 hover:bg-teal-800 text-white font-semibold text-sm rounded-xl shadow-sm transition-all duration-150 flex items-center space-x-2 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Calculating Progression Matrix...</span>
                </>
              ) : (
                <>
                  <Activity className="w-4 h-4" />
                  <span>Run Comparative ML Progression Analysis</span>
                </>
              )}
            </button>
          </div>

        </form>
      </div>

      {/* Comparison Results Card */}
      {comparisonResult && (
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 space-y-6">
          
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 bg-teal-700 rounded-xl flex items-center justify-center text-white shadow-sm">
                <Stethoscope className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">Progression Trajectory Report</h3>
                <p className="text-xs text-slate-500">ML Model Output for Serial Biomarker Change</p>
              </div>
            </div>

            <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
              comparisonResult.riskTrend === 'Improved' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' :
              comparisonResult.riskTrend === 'Worsened' ? 'bg-rose-50 text-rose-800 border-rose-200' :
              'bg-amber-50 text-amber-800 border-amber-200'
            }`}>
              Trend Classification: {comparisonResult.riskTrend}
            </span>
          </div>

          {/* Probability Comparison Metrics */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-center space-y-1">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Baseline Risk Probability</div>
              <div className="text-3xl font-extrabold text-slate-800">{comparisonResult.previousProbability}%</div>
            </div>
            <div className="p-4 bg-teal-50/60 border border-teal-200 rounded-xl text-center space-y-1">
              <div className="text-xs font-bold text-teal-800 uppercase tracking-wider">Current Follow-Up Probability</div>
              <div className="text-3xl font-extrabold text-teal-900">{comparisonResult.currentProbability}%</div>
            </div>
          </div>

          {/* Percentage Change Indicator */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs">
            <span className="text-slate-600 font-medium">Net Calculated Probability Delta over {comparisonResult.monthsBetweenTests} months:</span>
            <span className={`font-bold font-mono ${comparisonResult.probabilityChange > 0 ? 'text-rose-700' : 'text-emerald-700'}`}>
              {comparisonResult.probabilityChange > 0 ? '▲ +' : '▼ '}{comparisonResult.probabilityChange}%
            </span>
          </div>

          {/* Individual Biomarker Changes Grid */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Biomarker Delta Matrix</h4>
            <div className="grid sm:grid-cols-2 gap-3 text-xs">
              {comparisonResult.biomarkerChanges.map((change, idx) => (
                <div key={idx} className="flex justify-between items-center p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="font-semibold text-slate-700">{change.name}</span>
                  <div className="text-right">
                    <span className="font-mono font-bold text-slate-900">{change.change}</span>
                    <span className={`block text-[10px] font-bold ${change.percentChange > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                      {change.percentChange > 0 ? '+' : ''}{change.percentChange}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Clinical Interpretation & Summary */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Clinical Interpretation</h4>
            <p className="text-xs text-slate-700 leading-relaxed font-medium">{comparisonResult.interpretation}</p>
          </div>

          <div className="p-4 bg-teal-50/70 border border-teal-200/80 rounded-xl space-y-2">
            <h4 className="text-xs font-bold text-teal-900 uppercase tracking-wider">Summary Protocol Report</h4>
            <div className="text-xs text-slate-800 whitespace-pre-line leading-relaxed font-medium">{comparisonResult.summary}</div>
          </div>

        </div>
      )}

    </CardTransition>
  );
};

export default ProgressTracking;