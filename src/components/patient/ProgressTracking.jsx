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
    <div className="space-y-5">
      {/* Requisition & Comparison Input Form */}
      <form onSubmit={handleSubmit} className="panel overflow-hidden">
        <div className="panel-header">
          <div className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-md bg-primary-50 text-primary-700 ring-1 ring-primary-100">
              <TrendingUp className="h-4 w-4" aria-hidden="true" />
            </span>
            <div>
              <h2 className="panel-title">Serial Disease Progression Analysis</h2>
              <p className="panel-subtitle">Compare the current laboratory panel against the historical baseline panel.</p>
            </div>
          </div>
          <button type="button" onClick={clearForm} className="btn-ghost text-sm">
            <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
            Clear values
          </button>
        </div>

        <div className="panel-body space-y-5">
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
                className="field tabular-nums"
              />
            </Field>

            <Field label="Baseline Record Date" htmlFor="baselineDate">
              <input
                id="baselineDate"
                type="text"
                value={baselineDate}
                readOnly
                className="field field-readonly"
              />
            </Field>
          </div>

          {/* Side-by-side Baseline vs Follow-up Grid */}
          <div className="grid gap-4 lg:grid-cols-2">
            {/* Baseline Record Panel */}
            <div className="rounded-md border border-slate-200 bg-slate-50/50 p-4 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <h3 className="text-[13px] font-semibold text-slate-900">Historical Baseline Record</h3>
                <Badge tone="slate">Baseline</Badge>
              </div>
              <dl className="grid grid-cols-2 gap-3 text-sm">
                {baselineFields.map((field) => (
                  <div key={field.label} className="rounded-md bg-white px-3 py-2.5 ring-1 ring-inset ring-slate-200">
                    <dt className="text-xs font-medium text-slate-500">{field.label}</dt>
                    <dd className="mt-0.5 tabular-nums font-semibold text-slate-900">{field.value}</dd>
                  </div>
                ))}
              </dl>
            </div>

            {/* Follow-up Measurement Inputs */}
            <div className="rounded-md border border-primary-200 bg-primary-50/30 p-4 space-y-4">
              <div className="flex items-center justify-between border-b border-primary-200 pb-3">
                <h3 className="text-[13px] font-semibold text-primary-950">Follow-Up Measurements</h3>
                <Badge tone="primary">Current Entry</Badge>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Current Age" htmlFor="currentAge" required>
                  <input id="currentAge" type="number" step="0.1" value={formData.currentAge}
                    onChange={(e) => handleInputChange('currentAge', e.target.value)} required className="field tabular-nums" />
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
                    onChange={(e) => handleInputChange('currentESR', e.target.value)} required className="field tabular-nums" />
                </Field>
                <Field label="CRP (mg/L)" htmlFor="currentCRP" required>
                  <input id="currentCRP" type="number" step="0.1" value={formData.currentCRP}
                    onChange={(e) => handleInputChange('currentCRP', e.target.value)} required className="field tabular-nums" />
                </Field>
                <Field label="RF (IU/mL)" htmlFor="currentRF" required>
                  <input id="currentRF" type="number" step="0.1" value={formData.currentRF}
                    onChange={(e) => handleInputChange('currentRF', e.target.value)} required className="field tabular-nums" />
                </Field>
                <Field label="Anti-CCP (U/mL)" htmlFor="currentAntiCCP" required>
                  <input id="currentAntiCCP" type="number" step="0.1" value={formData.currentAntiCCP}
                    onChange={(e) => handleInputChange('currentAntiCCP', e.target.value)} required className="field tabular-nums" />
                </Field>
              </div>
            </div>
          </div>
        </div>

        <div className="panel-footer">
          <button type="submit" disabled={isSubmitting} className="btn-primary">
            {isSubmitting ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Computing Progression Matrix…
              </>
            ) : (
              <>
                <Activity className="h-4 w-4" aria-hidden="true" />
                Run Comparative ML Progression Analysis
              </>
            )}
          </button>
        </div>
      </form>

      {/* Progression Report Results */}
      {comparisonResult && (
        <div className="panel overflow-hidden">
          <div className="panel-header">
            <div className="flex items-center gap-2.5">
              <span className="flex h-8 w-8 items-center justify-center rounded-md bg-primary-50 text-primary-700 ring-1 ring-primary-100">
                <Activity className="h-4 w-4" aria-hidden="true" />
              </span>
              <div>
                <h2 className="panel-title">Progression Trajectory Report</h2>
                <p className="panel-subtitle">Comparative ML output for serial biomarker change.</p>
              </div>
            </div>
            <Badge tone={trendTone} showDot>Trend Classification: {comparisonResult.riskTrend}</Badge>
          </div>

          <div className="panel-body space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-md bg-slate-50 p-5 text-center ring-1 ring-inset ring-slate-200">
                <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">Baseline Risk Probability</p>
                <p className="mt-1.5 tabular-nums text-3xl font-bold text-slate-900">{comparisonResult.previousProbability}%</p>
              </div>
              <div className="rounded-md bg-primary-50 p-5 text-center ring-1 ring-inset ring-primary-200">
                <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-primary-900">Follow-Up Risk Probability</p>
                <p className="mt-1.5 tabular-nums text-3xl font-bold text-primary-950">{comparisonResult.currentProbability}%</p>
              </div>
            </div>

            <div className="flex items-center justify-between rounded-md bg-slate-50 px-4 py-3 text-sm font-medium ring-1 ring-inset ring-slate-200">
              <span className="text-slate-600">Net Risk Score Delta over {comparisonResult.monthsBetweenTests} months</span>
              <span className={`flex items-center gap-1.5 tabular-nums font-bold ${comparisonResult.probabilityChange > 0 ? 'text-rose-700' : 'text-emerald-700'}`}>
                {comparisonResult.probabilityChange > 0 ? (
                  <>
                    <ArrowUpRight className="h-4 w-4 text-rose-600" aria-hidden="true" />
                    +{comparisonResult.probabilityChange}%
                  </>
                ) : comparisonResult.probabilityChange < 0 ? (
                  <>
                    <ArrowDownRight className="h-4 w-4 text-emerald-600" aria-hidden="true" />
                    {comparisonResult.probabilityChange}%
                  </>
                ) : (
                  <>
                    <Minus className="h-4 w-4 text-slate-400" aria-hidden="true" />
                    0% (Stable)
                  </>
                )}
              </span>
            </div>

            {comparisonResult.biomarkerChanges && comparisonResult.biomarkerChanges.length > 0 && (
              <div>
                <h3 className="mb-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">Biomarker Delta Matrix</h3>
                <div className="grid gap-3 sm:grid-cols-2">
                  {comparisonResult.biomarkerChanges.map((change, idx) => (
                    <div key={idx} className="flex items-center justify-between rounded-md bg-slate-50 px-3 py-2.5 text-sm ring-1 ring-inset ring-slate-200">
                      <span className="font-medium text-slate-800">{change.name}</span>
                      <div className="text-right">
                        <span className="tabular-nums font-semibold text-slate-900">{change.change}</span>
                        <span className={`block text-[11px] font-semibold tabular-nums ${change.percentChange > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                          {change.percentChange > 0 ? '+' : ''}{change.percentChange}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {comparisonResult.interpretation && (
              <div className="rounded-md bg-slate-50 p-4 ring-1 ring-inset ring-slate-200">
                <h3 className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">Clinical Interpretation</h3>
                <p className="mt-1 text-sm leading-relaxed text-slate-700">{comparisonResult.interpretation}</p>
              </div>
            )}

            {comparisonResult.summary && (
              <div className="rounded-md bg-primary-50 p-4 ring-1 ring-inset ring-primary-200">
                <h3 className="text-[11px] font-semibold uppercase tracking-[0.12em] text-primary-950">Summary Protocol Report</h3>
                <p className="mt-1 whitespace-pre-line text-sm leading-relaxed text-slate-800">{comparisonResult.summary}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProgressTracking;