import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { auth, db } from '../../firebase/config';
import { onAuthStateChanged } from 'firebase/auth';
import { Activity, AlertTriangle, TrendingUp, RotateCcw } from 'lucide-react';
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
      } catch {
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
    return <Loader label="Retrieving historical lab measurements…" />;
  }

  if (!previousTestData) {
    return (
      <EmptyState
        icon={AlertTriangle}
        title="Initial lab test required"
        description="Submit at least one laboratory measurement entry before running comparative progression tracking."
      />
    );
  }

  const baselineDate = previousTestData.createdAt
    ? new Date(previousTestData.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
    : 'Recorded baseline';

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
      {/* Comparison form */}
      <form onSubmit={handleSubmit} className="space-y-6 rounded-xl border border-slate-200 bg-white p-5 sm:p-6">
        <div className="flex items-center justify-between border-b border-slate-200 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-teal-50 text-teal-700">
              <TrendingUp className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-slate-900">Comparative disease progression analysis</h2>
              <p className="mt-0.5 text-xs text-slate-500">Evaluate serial lab measurements against the historical baseline panel.</p>
            </div>
          </div>
          <button type="button" onClick={clearForm} className="btn-ghost">
            <RotateCcw className="h-4 w-4" />
            Clear
          </button>
        </div>

        {/* Interval */}
        <div className="grid gap-x-6 gap-y-4 sm:grid-cols-2">
          <Field
            label="Months elapsed since baseline test"
            htmlFor="months"
            required
            hint="e.g. 6"
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

          <Field label="Baseline test record date" htmlFor="baselineDate">
            <input
              id="baselineDate"
              type="text"
              value={baselineDate}
              readOnly
              className="field bg-slate-100 text-slate-500"
            />
          </Field>
        </div>

        {/* Baseline + follow-up */}
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-3 rounded-lg border border-slate-200 p-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <h3 className="text-sm font-semibold text-slate-900">Baseline measurements</h3>
              <Badge tone="teal">Recorded baseline</Badge>
            </div>
            <dl className="grid grid-cols-2 gap-3 text-sm">
              {baselineFields.map((field) => (
                <div key={field.label}>
                  <dt className="text-xs text-slate-500">{field.label}</dt>
                  <dd className="mt-0.5 font-semibold text-slate-900">{field.value}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="space-y-4 rounded-lg border border-teal-200 bg-teal-50/40 p-4">
            <div className="flex items-center justify-between border-b border-teal-200 pb-2">
              <h3 className="text-sm font-semibold text-teal-900">Follow-up measurements</h3>
              <Badge tone="teal">Current input</Badge>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Current age" htmlFor="currentAge" required>
                <input id="currentAge" type="number" step="0.1" value={formData.currentAge}
                  onChange={(e) => handleInputChange('currentAge', e.target.value)} required className="field" />
              </Field>
              <Field label="Sex" htmlFor="currentGender" required>
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

        <div className="flex justify-end border-t border-slate-200 pt-5">
          <button type="submit" disabled={isSubmitting} className="btn-primary">
            {isSubmitting ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Calculating progression matrix…
              </>
            ) : (
              <>
                <Activity className="h-4 w-4" />
                Run comparative ML progression analysis
              </>
            )}
          </button>
        </div>
      </form>

      {/* Results */}
      {comparisonResult && (
        <div className="space-y-6 rounded-xl border border-slate-200 bg-white p-5 sm:p-6">
          <div className="flex flex-col gap-4 border-b border-slate-200 pb-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-teal-50 text-teal-700">
                <Activity className="h-4 w-4" />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-slate-900">Progression trajectory report</h2>
                <p className="mt-0.5 text-xs text-slate-500">ML model output for serial biomarker change.</p>
              </div>
            </div>
            <Badge tone={trendTone}>Trend classification: {comparisonResult.riskTrend}</Badge>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-4 text-center">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Baseline risk probability</p>
              <p className="mt-1 text-3xl font-semibold text-slate-900">{comparisonResult.previousProbability}%</p>
            </div>
            <div className="rounded-lg border border-teal-200 bg-teal-50/60 px-4 py-4 text-center">
              <p className="text-xs font-medium uppercase tracking-wide text-teal-800">Current follow-up probability</p>
              <p className="mt-1 text-3xl font-semibold text-teal-900">{comparisonResult.currentProbability}%</p>
            </div>
          </div>

          <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm">
            <span className="text-slate-600">Net probability delta over {comparisonResult.monthsBetweenTests} months:</span>
            <span className={`font-semibold ${comparisonResult.probabilityChange > 0 ? 'text-rose-700' : 'text-emerald-700'}`}>
              {comparisonResult.probabilityChange > 0 ? '▲ +' : '▼ '}{comparisonResult.probabilityChange}%
            </span>
          </div>

          {comparisonResult.biomarkerChanges && comparisonResult.biomarkerChanges.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-900">Biomarker delta matrix</h3>
              <div className="grid gap-3 sm:grid-cols-2">
                {comparisonResult.biomarkerChanges.map((change, idx) => (
                  <div key={idx} className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm">
                    <span className="font-medium text-slate-700">{change.name}</span>
                    <div className="text-right">
                      <span className="font-semibold text-slate-900">{change.change}</span>
                      <span className={`block text-xs font-semibold ${change.percentChange > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                        {change.percentChange > 0 ? '+' : ''}{change.percentChange}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {comparisonResult.interpretation && (
            <div className="space-y-2 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-900">Clinical interpretation</h3>
              <p className="text-sm leading-relaxed text-slate-700">{comparisonResult.interpretation}</p>
            </div>
          )}

          {comparisonResult.summary && (
            <div className="space-y-2 rounded-lg border border-teal-200 bg-teal-50/70 px-4 py-3">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-teal-900">Summary protocol report</h3>
              <p className="whitespace-pre-line text-sm leading-relaxed text-slate-800">{comparisonResult.summary}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ProgressTracking;