import React, { useState, useEffect } from "react";
import { AlertCircle, CheckCircle2, ShieldCheck, ArrowRight, UserCheck } from "lucide-react";
import { collection, doc, getDocs, query, where, setDoc } from "firebase/firestore";
import { auth, db } from "../../firebase/config";
import { onAuthStateChanged } from "firebase/auth";
import Badge from "../ui/Badge";

const labTests = [
  {
    key: "RF",
    label: "Rheumatoid Factor (RF)",
    unit: "IU/mL",
    normalRange: "< 14 IU/mL",
    desc: "Autoantibodies targeting immunoglobulin G."
  },
  {
    key: "Anti-CCP",
    label: "Anti-CCP Antibodies",
    unit: "U/mL",
    normalRange: "< 20 U/mL",
    desc: "High-specificity diagnostic marker for RA."
  },
  {
    key: "CRP",
    label: "C-Reactive Protein (CRP)",
    unit: "mg/L",
    normalRange: "< 3.0 mg/L",
    desc: "Acute-phase protein reflecting systemic inflammation."
  },
  {
    key: "ESR",
    label: "Erythrocyte Sedimentation Rate",
    unit: "mm/hr",
    normalRange: "0 - 20 mm/hr",
    desc: "Rate of red blood cell settling, a general inflammation marker."
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
        throw new Error("Please complete your profile first with age and gender.");
      }

      const emptyLabFields = Object.entries(labValues)
        .filter(([, value]) => !String(value).trim())
        .map(([field]) => field);

      if (emptyLabFields.length > 0) {
        throw new Error(`Please fill all lab biomarker values: ${emptyLabFields.join(", ")}`);
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
      {/* Required context */}
      <div className="rounded-xl border border-slate-200 bg-white p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-teal-50 text-teal-700">
              <UserCheck className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-slate-900">Patient context</h2>
              <p className="text-xs text-slate-500">Age and sex are required for adjusted risk calculations.</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm">
              <span className="text-slate-500">Age:</span>
              <span className="font-semibold text-slate-900">{userData.age ? `${userData.age} yrs` : 'Not set'}</span>
            </span>
            <span className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm">
              <span className="text-slate-500">Sex:</span>
              <span className="font-semibold text-slate-900">{userData.gender || 'Not set'}</span>
            </span>
          </div>
        </div>

        {profileIncomplete && (
          <div className="mt-4 flex flex-col items-start justify-between gap-3 rounded-lg border border-amber-200 bg-amber-50 px-3.5 py-3 text-sm text-amber-800 sm:flex-row sm:items-center">
            <span className="flex items-start gap-2">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              Complete your demographic profile before entering lab values.
            </span>
            {window.dashboardSetTab && (
              <button
                type="button"
                onClick={() => window.dashboardSetTab("Profile & Medical Info")}
                className="btn-ghost shrink-0 text-amber-900 hover:bg-amber-100"
              >
                Go to profile
              </button>
            )}
          </div>
        )}
      </div>

      {/* Lab entry form */}
      <form onSubmit={handleSubmit} className="space-y-6 rounded-xl border border-slate-200 bg-white p-5 sm:p-6">
        <div className="flex items-center justify-between border-b border-slate-200 pb-4">
          <div>
            <h2 className="text-sm font-semibold text-slate-900">Serology & inflammatory markers</h2>
            <p className="mt-0.5 text-xs text-slate-500">Enter numerical values from a recent blood panel analysis.</p>
          </div>
          <button
            type="button"
            onClick={handleClearForm}
            className="btn-ghost"
          >
            Reset
          </button>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          {labTests.map((test) => (
            <div key={test.key} className="space-y-3 rounded-lg border border-slate-200 bg-slate-50/60 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <label className="text-sm font-semibold text-slate-900">{test.label}</label>
                  <p className="mt-0.5 text-xs text-slate-500">{test.desc}</p>
                </div>
                <Badge tone="teal">Normal: {test.normalRange}</Badge>
              </div>

              <div className="relative">
                <input
                  type="number"
                  step="any"
                  placeholder={`Enter value (${test.unit})`}
                  value={labValues[test.key]}
                  onChange={(e) => handleInputChange(test.key, e.target.value)}
                  required
                  aria-label={test.label}
                  className="field pr-16"
                />
                <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-medium text-slate-400">
                  {test.unit}
                </span>
              </div>
            </div>
          ))}
        </div>

        {error && (
          <div className="flex items-start gap-2 rounded-lg border border-rose-200 bg-rose-50 px-3.5 py-3 text-sm text-rose-700">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {submissionSuccess && (
          <div className="flex flex-col items-start justify-between gap-3 rounded-lg border border-emerald-200 bg-emerald-50 px-3.5 py-3 text-sm text-emerald-800 sm:flex-row sm:items-center">
            <span className="flex items-start gap-2">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
              <span className="font-medium">Lab values recorded successfully.</span>
            </span>
            {(setSelectedTab || window.dashboardSetTab) && (
              <button
                type="button"
                onClick={() => {
                  if (setSelectedTab) setSelectedTab("Risk Prediction");
                  else if (window.dashboardSetTab) window.dashboardSetTab("Risk Prediction");
                }}
                className="btn-primary shrink-0"
              >
                View risk prediction
                <ArrowRight className="h-4 w-4" />
              </button>
            )}
          </div>
        )}

        <div className="flex justify-end border-t border-slate-200 pt-5">
          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Saving lab panel…
              </>
            ) : (
              <>
                <ShieldCheck className="h-4 w-4" />
                Save measurements & run model
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default LabUploadForm;