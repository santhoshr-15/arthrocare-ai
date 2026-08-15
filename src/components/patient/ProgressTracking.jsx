import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { auth, db } from '../../firebase/config';
import { onAuthStateChanged } from 'firebase/auth';
import { Activity, AlertTriangle, TrendingUp, RotateCcw, ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';
import Field from '../ui/Field';
import Badge from '../ui/Badge';
import Loader from '../ui/Loader';
import EmptyState from '../ui/EmptyState';

const ProgressTracking = () => {
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
        await loadPreviousTestData(user.uid);
      } else {
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
        } catch {
          continue;
        }
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
      alert("Please enter the number of elapsed months.");
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
      } catch {
        throw new Error("Backend returned non-JSON response. Ensure Flask backend API is online.");
      }

      if (!response.ok) throw new Error(result.error || "Server error running risk comparison.");

      setComparisonResult(result);

    } catch (err) {
      alert(`Comparative Analysis Error: ${err.message}`);
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
    return <Loader label="Retrieving baseline serology measurements…" />;
  }

  if (!previousTestData) {
    return (
      <EmptyState
        icon={AlertTriangle}
        title="Baseline Laboratory Record Required"
        description="Please submit an initial serology panel in Lab Test Entry before evaluating serial disease progression."
        action={
          window.dashboardSetTab && (
            <button
              type="button"
              onClick={() => window.dashboardSetTab("Lab Test Entry")}
              className="btn-primary"
            >
              Submit Baseline Panel
            </button>
          )
        }
      />
    );
  }

  const baselineDate = previousTestData.createdAt
    ? new Date(previousTestData.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
    : 'Recorded Baseline';

  const baselineFields = [
    { label: 'Age', value: `${previousTestData.age} yrs` },
    { label: 'Sex', value: previousTestData.gender },
    { label: 'ESR (mm/hr)', value: previousTestData.ESR },
    { label: 'CRP (mg/L)', value: previousTestData.CRP },
    { label: 'RF (IU/mL)', value: previousTestData.RF },
    { label: 'Anti-CCP (U/mL)', value: previousTestData.antiCCP }
  ];

  const trendTone =
    comparisonResult?.riskTrend === 'Improved' ? 'emerald' :
    comparisonResult?.riskTrend === 'Worsened' ? 'rose' : 'amber';

  return (
    <div className="space-y-6">
      {/* Requisition & Comparison Input Form */}
      <form onSubmit={handleSubmit} className="rounded-lg border border-slate-200 bg-white p-5 shadow-2xs space-y-5">
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-teal-50 text-teal-800 border border-teal-200">
              <TrendingUp className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900">Serial Disease Progression Analysis</h2>
              <p className="text-[11px] text-slate-500">Compare current laboratory panel against historical baseline panel.</p>
            </div>
          </div>
          <button type="button" onClick={clearForm} className="btn-ghost text-xs">
            <RotateCcw className="h-3.5 w-3.5" />
            Clear values
          </button>
        </div>

        {/* Interval Context Bar */}
        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            label="Elapsed Time (Months)"
            htmlFor="months"
            required
            hint="Months elapsed between baseline and current follow-up test"
          >
            <input
              id="months"
              type="number"
              min="1"
              placeholder="e.g. 6"
              value={formData.monthsSinceLastTest}
              onChange={(e) => handleInputChange('monthsSinceLastTest', e.target.value)}
              required
              className="field"
            />
          </Field>

          <Field label="Baseline Record Date" htmlFor="baselineDate">
            <input
              id="baselineDate"
              type="text"
              value={baselineDate}
              readOnly
              className="field bg-slate-50 text-slate-600 font-semibold"
            />
          </Field>
        </div>

        {/* Side-by-side Baseline vs Follow-up Grid */}
        <div className="grid gap-5 lg:grid-cols-2">
          {/* Baseline Record Panel */}
          <div className="rounded-md border border-slate-200 bg-slate-50/50 p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">Historical Baseline Record</h3>
              <Badge tone="slate">Baseline</Badge>
            </div>
            <dl className="grid grid-cols-2 gap-3 text-xs">
              {baselineFields.map((field) => (
                <div key={field.label} className="rounded-md border border-slate-200 bg-white p-2.5">
                  <dt className="text-slate-500 font-medium">{field.label}</dt>
                  <dd className="mt-0.5 font-bold text-slate-900">{field.value}</dd>
                </div>
              ))}
            </dl>
          </div>

          {/* Follow-up Measurement Inputs */}
          <div className="rounded-md border border-teal-200 bg-teal-50/30 p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-teal-200 pb-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-teal-950">Follow-Up Measurements</h3>
              <Badge tone="teal">Current Entry</Badge>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Current Age" htmlFor="currentAge" required>
                <input id="currentAge" type="number" step="0.1" value={formData.currentAge}
                  onChange={(e) => handleInputChange('currentAge', e.target.value)} required className="field" />
              </Field>
              <Field label="Biological Sex" htmlFor="currentGender" required>
                <select id="currentGender" value={formData.currentGender}
                  onChange={(e) => handleInputChange('currentGender', e.target.value)} required className="field">
                  <option value="">Select</option>
                  <option value="M">Male</option>
                  <option value="F">Female</option>
                </select>
              </Field>
              <Field label="ESR (mm/hr)" htmlFor="currentESR" required>
                <input id="currentESR" type="number" step="0.1" value={formData.currentESR}
                  onChange={(e) => handleInputChange('currentESR', e.target.value)} required className="field" />
              </Field>
              <Field label="CRP (mg/L)" htmlFor="currentCRP" required>
                <input id="currentCRP" type="number" step="0.1" value={formData.currentCRP}
                  onChange={(e) => handleInputChange('currentCRP', e.target.value)} required className="field" />
              </Field>
              <Field label="RF (IU/mL)" htmlFor="currentRF" required>
                <input id="currentRF" type="number" step="0.1" value={formData.currentRF}
                  onChange={(e) => handleInputChange('currentRF', e.target.value)} required className="field" />
              </Field>
              <Field label="Anti-CCP (U/mL)" htmlFor="currentAntiCCP" required>
                <input id="currentAntiCCP" type="number" step="0.1" value={formData.currentAntiCCP}
                  onChange={(e) => handleInputChange('currentAntiCCP', e.target.value)} required className="field" />
              </Field>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end border-t border-slate-200 pt-4">
          <button type="submit" disabled={isSubmitting} className="btn-primary">
            {isSubmitting ? (
              <>
                <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Computing Progression Matrix…
              </>
            ) : (
              <>
                <Activity className="h-4 w-4" />
                Run Comparative ML Progression Analysis
              </>
            )}
          </button>
        </div>
      </form>

      {/* Progression Report Results */}
      {comparisonResult && (
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-2xs space-y-5">
          <div className="flex flex-col gap-3 border-b border-slate-200 pb-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2.5">
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-teal-50 text-teal-800 border border-teal-200">
                <Activity className="h-4 w-4" />
              </div>
              <div>
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900">Progression Trajectory Report</h2>
                <p className="text-[11px] text-slate-500">Comparative ML output for serial biomarker change.</p>
              </div>
            </div>
            <Badge tone={trendTone} showDot>Trend Classification: {comparisonResult.riskTrend}</Badge>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-md border border-slate-200 bg-slate-50 p-4 text-center">
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Baseline Risk Probability</p>
              <p className="mt-1 text-3xl font-bold text-slate-900">{comparisonResult.previousProbability}%</p>
            </div>
            <div className="rounded-md border border-teal-200 bg-teal-50/60 p-4 text-center">
              <p className="text-[11px] font-bold uppercase tracking-wider text-teal-900">Follow-Up Risk Probability</p>
              <p className="mt-1 text-3xl font-bold text-teal-950">{comparisonResult.currentProbability}%</p>
            </div>
          </div>

          <div className="flex items-center justify-between rounded-md border border-slate-200 bg-slate-50 p-3 text-xs font-semibold">
            <span className="text-slate-600">Net Risk Score Delta over {comparisonResult.monthsBetweenTests} Months:</span>
            <span className={`flex items-center gap-1 font-bold ${comparisonResult.probabilityChange > 0 ? 'text-rose-700' : 'text-emerald-700'}`}>
              {comparisonResult.probabilityChange > 0 ? (
                <>
                  <ArrowUpRight className="h-4 w-4 text-rose-600" />
                  +{comparisonResult.probabilityChange}%
                </>
              ) : comparisonResult.probabilityChange < 0 ? (
                <>
                  <ArrowDownRight className="h-4 w-4 text-emerald-600" />
                  {comparisonResult.probabilityChange}%
                </>
              ) : (
                <>
                  <Minus className="h-4 w-4 text-slate-400" />
                  0% (Stable)
                </>
              )}
            </span>
          </div>

          {comparisonResult.biomarkerChanges && comparisonResult.biomarkerChanges.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">Biomarker Delta Matrix</h3>
              <div className="grid gap-3 sm:grid-cols-2">
                {comparisonResult.biomarkerChanges.map((change, idx) => (
                  <div key={idx} className="flex items-center justify-between rounded-md border border-slate-200 bg-slate-50 p-3 text-xs">
                    <span className="font-semibold text-slate-800">{change.name}</span>
                    <div className="text-right">
                      <span className="font-bold text-slate-900">{change.change}</span>
                      <span className={`block text-[11px] font-bold ${change.percentChange > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                        {change.percentChange > 0 ? '+' : ''}{change.percentChange}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {comparisonResult.interpretation && (
            <div className="space-y-1.5 rounded-md border border-slate-200 bg-slate-50 p-3.5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">Clinical Interpretation</h3>
              <p className="text-xs leading-relaxed text-slate-700">{comparisonResult.interpretation}</p>
            </div>
          )}

          {comparisonResult.summary && (
            <div className="space-y-1.5 rounded-md border border-teal-200 bg-teal-50/70 p-3.5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-teal-950">Summary Protocol Report</h3>
              <p className="whitespace-pre-line text-xs leading-relaxed text-slate-800 font-medium">{comparisonResult.summary}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ProgressTracking;