import React, { useState, useEffect } from "react";
import { AlertCircle, CheckCircle2, ShieldCheck, ArrowRight, UserCheck, TestTube, RotateCcw } from "lucide-react";
import { collection, doc, getDocs, query, where, setDoc } from "firebase/firestore";
import { auth, db } from "../../firebase/config";
import { onAuthStateChanged } from "firebase/auth";
import Badge from "../ui/Badge";

const labTests = [
  {
    key: "RF",
    label: "Rheumatoid Factor (RF)",
    unit: "IU/mL",
    normalRange: "< 14.0 IU/mL",
    refVal: 14.0,
    desc: "Autoantibody against IgG Fc region (serological marker)."
  },
  {
    key: "Anti-CCP",
    label: "Anti-CCP Antibodies",
    unit: "U/mL",
    normalRange: "< 20.0 U/mL",
    refVal: 20.0,
    desc: "High-specificity diagnostic marker for rheumatoid arthritis."
  },
  {
    key: "CRP",
    label: "C-Reactive Protein (CRP)",
    unit: "mg/L",
    normalRange: "< 3.0 mg/L",
    refVal: 3.0,
    desc: "Acute-phase hepatic reactant reflecting systemic inflammation."
  },
  {
    key: "ESR",
    label: "Erythrocyte Sedimentation Rate",
    unit: "mm/hr",
    normalRange: "0 – 20 mm/hr",
    refVal: 20.0,
    desc: "Red blood cell settling velocity (inflammatory indicator)."
  }
];

const LabUploadForm = ({ setSelectedTab }) => {
  const [labValues, setLabValues] = useState({
    RF: "",
    "Anti-CCP": "",
    CRP: "",
    ESR: ""
  });

  const [userData, setUserData] = useState({ age: "", gender: "" });
  const [loading, setLoading] = useState(false);
  const [submissionSuccess, setSubmissionSuccess] = useState(false);
  const [error, setError] = useState("");
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUser(user);
        await loadUserProfileData(user.uid);
      } else {
        setCurrentUser(null);
      }
    });

    return () => unsubscribe();
  }, []);

  const loadUserProfileData = async (userId) => {
    try {
      const personalInfoQuery = query(
        collection(db, "personalInformation"),
        where("userId", "==", userId)
      );

      const querySnapshot = await getDocs(personalInfoQuery);

      if (!querySnapshot.empty) {
        const profileDoc = querySnapshot.docs[0];
        const profileData = profileDoc.data();

        setUserData({
          age: profileData.age || "",
          gender: profileData.gender || ""
        });
      }
    } catch (err) {
      console.error("Error loading profile data:", err);
    }
  };

  const handleInputChange = (key, value) => {
    setLabValues(prev => ({ ...prev, [key]: value }));
  };

  const saveLabDataToFirebase = async () => {
    try {
      if (!currentUser) throw new Error("User authentication required");

      if (!userData.age || !userData.gender) {
        throw new Error("Please complete your demographic profile first with age and biological sex.");
      }

      const emptyLabFields = Object.entries(labValues)
        .filter(([, value]) => !String(value).trim())
        .map(([field]) => field);

      if (emptyLabFields.length > 0) {
        throw new Error(`Please enter values for all four biomarkers: ${emptyLabFields.join(", ")}`);
      }

      const docName = `user_${currentUser.uid}_lab_${Date.now()}`;

      const labData = {
        userAge: userData.age,
        userGender: userData.gender,
        userId: currentUser.uid,
        rheumatoidFactor: labValues.RF,
        antiCCP: labValues["Anti-CCP"],
        cReactiveProtein: labValues.CRP,
        erythrocyteSedimentationRate: labValues.ESR,
        createdAt: new Date().toISOString(),
        lastUpdated: new Date().toISOString(),
        documentName: docName
      };

      const labInfoRef = doc(collection(db, "LabInformation"), docName);

      await setDoc(labInfoRef, labData);

      return true;

    } catch (err) {
      console.error("Error saving lab data:", err);
      throw err;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await saveLabDataToFirebase();
      setSubmissionSuccess(true);
      setLabValues({
        RF: "",
        "Anti-CCP": "",
        CRP: "",
        ESR: ""
      });
    } catch (err) {
      setError(err.message || "Failed to save lab data.");
    } finally {
      setLoading(false);
    }
  };

  const handleClearForm = () => {
    setLabValues({
      RF: "",
      "Anti-CCP": "",
      CRP: "",
      ESR: ""
    });
    setSubmissionSuccess(false);
    setError("");
  };

  const profileIncomplete = !userData.age || !userData.gender;

  return (
    <div className="space-y-6">
      {/* Patient Demographic Context Bar */}
      <div className="rounded-lg border border-slate-200 bg-white p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-800 border border-blue-200">
              <UserCheck className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold uppercase tracking-widest text-slate-900">Demographic Context Baseline</h2>
              <p className="text-xs text-slate-500">Demographics normalize inflammatory reference models.</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm">
              <span className="text-slate-500 font-medium">Age:</span>
              <span className="font-bold text-slate-900">{userData.age ? `${userData.age} yrs` : 'Not set'}</span>
            </span>
            <span className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm">
              <span className="text-slate-500 font-medium">Sex:</span>
              <span className="font-bold text-slate-900">{userData.gender || 'Not set'}</span>
            </span>
          </div>
        </div>

        {profileIncomplete && (
          <div className="mt-4 flex flex-col items-start justify-between gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900 sm:flex-row sm:items-center">
            <span className="flex items-center gap-2 font-medium">
              <AlertCircle className="h-5 w-5 shrink-0 text-amber-700" />
              Complete demographic profile first to enable risk calculation models.
            </span>
            {window.dashboardSetTab && (
              <button
                type="button"
                onClick={() => window.dashboardSetTab("Profile & Medical Info")}
                className="btn-secondary shrink-0 text-sm py-1.5 px-3 text-amber-900 hover:bg-amber-100"
              >
                Go to Profile
              </button>
            )}
          </div>
        )}
      </div>

      {/* Laboratory Requisition Form */}
      <form onSubmit={handleSubmit} className="rounded-lg border border-slate-200 bg-white p-6 space-y-6">
        <div className="flex items-center justify-between border-b border-slate-200 pb-4">
          <div>
            <h2 className="text-base font-bold tracking-tight text-slate-900">Serology &amp; Inflammatory Markers Panel</h2>
            <p className="text-sm text-slate-500">Enter quantitative serum measurements from recent blood panel report.</p>
          </div>
          <button
            type="button"
            onClick={handleClearForm}
            className="btn-ghost text-sm"
          >
            <RotateCcw className="h-4 w-4" />
            Reset values
          </button>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          {labTests.map((test) => {
            const numVal = parseFloat(labValues[test.key]);
            const isExceeded = !isNaN(numVal) && numVal > test.refVal;

            return (
              <div key={test.key} className={`rounded-lg border p-5 transition-colors ${
                isExceeded ? 'border-amber-300 bg-amber-50/30' : 'border-slate-200 bg-slate-50/40'
              }`}>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <label className="text-sm font-bold uppercase tracking-widest text-slate-900">{test.label}</label>
                    <p className="mt-1 text-xs text-slate-500 leading-tight">{test.desc}</p>
                  </div>
                  <Badge tone={isExceeded ? 'amber' : 'blue'}>
                    Ref: {test.normalRange}
                  </Badge>
                </div>

                <div className="relative mt-4">
                  <input
                    type="number"
                    step="any"
                    placeholder={`Enter ${test.key} value`}
                    value={labValues[test.key]}
                    onChange={(e) => handleInputChange(test.key, e.target.value)}
                    required
                    aria-label={test.label}
                    className={`field pr-16 text-base font-semibold ${isExceeded ? 'border-amber-400 focus:border-amber-600 focus:ring-amber-600' : ''}`}
                  />
                  <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">
                    {test.unit}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {error && (
          <div className="flex items-start gap-3 rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-rose-600" />
            <span>{error}</span>
          </div>
        )}

        {submissionSuccess && (
          <div className="flex flex-col items-start justify-between gap-4 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900 sm:flex-row sm:items-center">
            <span className="flex items-center gap-2 font-semibold">
              <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-700" />
              Laboratory panel recorded successfully.
            </span>
            {(setSelectedTab || window.dashboardSetTab) && (
              <button
                type="button"
                onClick={() => {
                  if (setSelectedTab) setSelectedTab("Risk Prediction");
                  else if (window.dashboardSetTab) window.dashboardSetTab("Risk Prediction");
                }}
                className="btn-primary shrink-0 text-sm py-1.5 px-4"
              >
                View Risk Report
                <ArrowRight className="h-4 w-4" />
              </button>
            )}
          </div>
        )}

        <div className="flex items-center justify-end border-t border-slate-200 pt-5">
          <button type="submit" disabled={loading || profileIncomplete} className="btn-primary">
            {loading ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Processing panel…
              </>
            ) : (
              <>
                <ShieldCheck className="h-4 w-4" />
                Submit Laboratory Panel &amp; Run Risk Model
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default LabUploadForm;