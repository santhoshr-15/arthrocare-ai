import React, { useState, useEffect } from "react";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { auth, db } from "../../firebase/config";
import { onAuthStateChanged } from "firebase/auth";
import { Save, RotateCcw, AlertCircle, CheckCircle2, User, Activity, FileText } from "lucide-react";
import Field from "../ui/Field";
import Loader from "../ui/Loader";
import EmptyState from "../ui/EmptyState";

const SectionHeading = ({ icon: Icon, number, title }) => (
  <div className="section-head">
    <span className="section-head-index">{number}</span>
    <h2 className="text-[15px] font-semibold text-slate-900">{title}</h2>
    {Icon && <Icon className="ml-auto h-4 w-4 text-slate-400" aria-hidden="true" />}
  </div>
);

const ProfileForm = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notice, setNotice] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    dob: "",
    age: "",
    email: "",
    phone: "",
    gender: "",
    bmi: "",
    familyHistory: "",
    medicalHistory: "",
    smoking: "No",
    alcohol: "No",
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUser(user);
        setFormData(prev => ({
          ...prev,
          email: user.email
        }));
        await loadUserProfile(user.uid);
      } else {
        setCurrentUser(null);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const loadUserProfile = async (userId) => {
    try {
      setLoading(true);
      const collections = ['personalInformation', 'users', 'userProfiles', 'profiles'];

      for (const collectionName of collections) {
        try {
          const userDocRef = doc(db, collectionName, userId);
          const userDoc = await getDoc(userDocRef);

          if (userDoc.exists()) {
            const userData = userDoc.data();
            setFormData(prev => ({
              ...prev,
              ...userData,
              email: prev.email || userData.email
            }));
            break;
          }
        } catch {
          continue;
        }
      }
    } catch (err) {
      console.error("Error loading profile:", err);
    } finally {
      setLoading(false);
    }
  };

  const calculateAge = (dob) => {
    if (!dob) return "";
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    return age.toString();
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "dob") {
      const age = calculateAge(value);
      setFormData((prev) => ({
        ...prev,
        [name]: value,
        age: age
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setNotice(null);

    if (!currentUser) {
      setNotice({ type: "error", text: "Please sign in to save your profile." });
      return;
    }

    if (!formData.name.trim()) {
      setNotice({ type: "error", text: "Full name is required." });
      return;
    }

    setIsSubmitting(true);

    try {
      const collections = ['personalInformation', 'users', 'userProfiles', 'profiles'];
      let savedSuccessfully = false;
      let lastError = null;

      const profileData = {
        ...formData,
        userId: currentUser.uid,
        createdAt: new Date(),
        lastUpdated: new Date()
      };

      for (const collectionName of collections) {
        try {
          const userDocRef = doc(db, collectionName, currentUser.uid);
          await setDoc(userDocRef, profileData, { merge: true });
          savedSuccessfully = true;
          break;
        } catch (err) {
          lastError = err;
        }
      }

      if (!savedSuccessfully) {
        throw lastError || new Error('Failed to save profile.');
      }

      setNotice({ type: "success", text: "Patient medical profile saved successfully." });

      if (window.dashboardSetTab) {
        window.dashboardSetTab("Lab Test Entry");
      }

    } catch (err) {
      setNotice({ type: "error", text: `Error saving profile: ${err.message}` });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClearForm = () => {
    setNotice(null);
    setFormData({
      name: "",
      dob: "",
      age: "",
      email: currentUser?.email || "",
      phone: "",
      gender: "",
      bmi: "",
      familyHistory: "",
      medicalHistory: "",
      smoking: "No",
      alcohol: "No",
    });
  };

  if (!currentUser) {
    return (
      <EmptyState
        icon={AlertCircle}
        title="Authentication Required"
        description="Please sign in to view and update your personal medical profile."
      />
    );
  }

  if (loading) {
    return <Loader label="Retrieving patient demographic profile…" />;
  }

  return (
    <div className="space-y-5">
      {notice && (
        <div
          role="status"
          className={`flex items-start gap-3 rounded-lg border p-4 text-sm font-medium ${
            notice.type === "success"
              ? "border-emerald-200 bg-emerald-50 text-emerald-800"
              : "border-rose-200 bg-rose-50 text-rose-700"
          }`}
        >
          {notice.type === "success" ? (
            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
          ) : (
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-rose-600" />
          )}
          <span>{notice.text}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Panel 1: Patient Demographics */}
        <div className="panel p-5 space-y-5">
          <SectionHeading number="01" title="Demographic Identity" icon={User} />
          <div className="grid gap-x-5 gap-y-4 sm:grid-cols-2 lg:grid-cols-3">
            <Field label="Full Patient Name" htmlFor="name" required>
              <input id="name" name="name" type="text" autoComplete="name" placeholder="Jane Doe"
                value={formData.name} onChange={handleChange} required className="field" />
            </Field>

            <Field label="Date of Birth" htmlFor="dob">
              <input id="dob" name="dob" type="date" value={formData.dob} onChange={handleChange} className="field" />
            </Field>

            <Field label="Calculated Age" htmlFor="age" hint="Auto-derived from date of birth">
              <input id="age" name="age" type="text" readOnly
                value={formData.age ? `${formData.age} years` : ''}
                placeholder="Auto-derived"
                className="field field-readonly" />
            </Field>

            <Field label="Email Address" htmlFor="email" required>
              <input id="email" name="email" type="email" autoComplete="email" placeholder="patient@clinical.org"
                value={formData.email} onChange={handleChange} required className="field" />
            </Field>

            <Field label="Contact Phone" htmlFor="phone">
              <input id="phone" name="phone" type="tel" autoComplete="tel" placeholder="+1 (555) 000-0000"
                value={formData.phone} onChange={handleChange} className="field" />
            </Field>

            <Field label="Biological Sex" htmlFor="gender" required hint="Used for ESR reference model adjustment">
              <select id="gender" name="gender" value={formData.gender} onChange={handleChange} required className="field">
                <option value="">Select Biological Sex</option>
                <option>Female</option>
                <option>Male</option>
                <option>Other</option>
              </select>
            </Field>
          </div>
        </div>

        {/* Panel 2: Vital & Lifestyle Baselines */}
        <div className="panel p-5 space-y-5">
          <SectionHeading number="02" title="Health & Lifestyle Baselines" icon={Activity} />
          <div className="grid gap-x-5 gap-y-4 sm:grid-cols-3">
            <Field label="Body Mass Index (BMI)" htmlFor="bmi" hint="Metric formula: weight(kg) / height(m)²">
              <input id="bmi" name="bmi" type="text" inputMode="decimal" placeholder="e.g. 23.4"
                value={formData.bmi} onChange={handleChange} className="field" />
            </Field>

            <Field label="Tobacco Smoking Status" htmlFor="smoking">
              <select id="smoking" name="smoking" value={formData.smoking} onChange={handleChange} className="field">
                <option>No</option>
                <option>Yes</option>
              </select>
            </Field>

            <Field label="Alcohol Consumption" htmlFor="alcohol">
              <select id="alcohol" name="alcohol" value={formData.alcohol} onChange={handleChange} className="field">
                <option>No</option>
                <option>Yes</option>
              </select>
            </Field>
          </div>
        </div>

        {/* Panel 3: Medical & Family History */}
        <div className="panel p-5 space-y-5">
          <SectionHeading number="03" title="Clinical History & Genetic Susceptibility" icon={FileText} />
          <div className="grid gap-x-5 gap-y-4 sm:grid-cols-2">
            <Field label="Family History of Autoimmune Conditions" htmlFor="familyHistory"
              hint="Document first-degree relatives with RA, Lupus, Psoriatic Arthritis, etc.">
              <textarea id="familyHistory" name="familyHistory" rows={3}
                placeholder="Details of family members diagnosed with rheumatoid arthritis or autoimmune disorders..."
                value={formData.familyHistory} onChange={handleChange} className="field" />
            </Field>

            <Field label="Personal Clinical & Joint History" htmlFor="medicalHistory"
              hint="Document current morning stiffness, joint swelling, prior surgeries, or medications.">
              <textarea id="medicalHistory" name="medicalHistory" rows={3}
                placeholder="Details of joint pain, morning stiffness duration, active medications..."
                value={formData.medicalHistory} onChange={handleChange} className="field" />
            </Field>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex items-center justify-end gap-3 border-t border-slate-200 pt-5">
          <button type="button" onClick={handleClearForm} className="btn-secondary btn-sm">
            <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
            Reset profile
          </button>
          <button type="submit" disabled={isSubmitting || !formData.name.trim()} className="btn-primary">
            {isSubmitting ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Saving profile…
              </>
            ) : (
              <>
                <Save className="h-4 w-4" aria-hidden="true" />
                Save medical profile
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProfileForm;