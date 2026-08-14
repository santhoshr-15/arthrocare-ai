import React, { useState, useEffect } from "react";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { auth, db } from "../../firebase/config";
import { onAuthStateChanged } from "firebase/auth";
import { Save, RotateCcw, AlertCircle, CheckCircle2 } from "lucide-react";
import Field from "../ui/Field";
import Loader from "../ui/Loader";
import EmptyState from "../ui/EmptyState";

const SectionHeading = ({ number, title }) => (
  <div className="flex items-center gap-3">
    <span className="text-xs font-semibold text-teal-700">{number}</span>
    <h2 className="text-sm font-semibold text-slate-900">{title}</h2>
    <div className="h-px flex-1 bg-slate-200" />
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

      setNotice({ type: "success", text: "Profile saved successfully." });

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
        title="Sign in required"
        description="Please sign in to access your personal medical profile."
      />
    );
  }

  if (loading) {
    return <Loader label="Loading your medical profile…" />;
  }

  return (
    <div className="space-y-6">
      {notice && (
        <div
          role="status"
          className={`flex items-start gap-2 rounded-lg border px-3.5 py-3 text-sm ${
            notice.type === "success"
              ? "border-emerald-200 bg-emerald-50 text-emerald-800"
              : "border-rose-200 bg-rose-50 text-rose-700"
          }`}
        >
          {notice.type === "success" ? (
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
          ) : (
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          )}
          <span>{notice.text}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        <section className="space-y-5">
          <SectionHeading number="01" title="Patient demographics" />
          <div className="grid gap-x-6 gap-y-4 sm:grid-cols-2 lg:grid-cols-3">
            <Field label="Full name" htmlFor="name" required>
              <input id="name" name="name" type="text" autoComplete="name" placeholder="Jane Doe"
                value={formData.name} onChange={handleChange} required className="field" />
            </Field>

            <Field label="Date of birth" htmlFor="dob">
              <input id="dob" name="dob" type="date" value={formData.dob} onChange={handleChange} className="field" />
            </Field>

            <Field label="Age" htmlFor="age" hint="Auto-calculated from date of birth">
              <input id="age" name="age" type="text" readOnly
                value={formData.age ? `${formData.age} years` : ''}
                placeholder="Auto-calculated"
                className="field bg-slate-100 text-slate-500" />
            </Field>

            <Field label="Email address" htmlFor="email" required>
              <input id="email" name="email" type="email" autoComplete="email" placeholder="jane@example.com"
                value={formData.email} onChange={handleChange} required className="field" />
            </Field>

            <Field label="Phone number" htmlFor="phone">
              <input id="phone" name="phone" type="tel" autoComplete="tel" placeholder="+1 (555) 000-0000"
                value={formData.phone} onChange={handleChange} className="field" />
            </Field>

            <Field label="Sex" htmlFor="gender" required>
              <select id="gender" name="gender" value={formData.gender} onChange={handleChange} required className="field">
                <option value="">Select sex</option>
                <option>Female</option>
                <option>Male</option>
                <option>Other</option>
              </select>
            </Field>
          </div>
        </section>

        <section className="space-y-5">
          <SectionHeading number="02" title="Health & lifestyle baselines" />
          <div className="grid gap-x-6 gap-y-4 sm:grid-cols-3">
            <Field label="Body Mass Index (BMI)" htmlFor="bmi" hint="e.g. 23.4">
              <input id="bmi" name="bmi" type="text" inputMode="decimal" placeholder="e.g. 23.4"
                value={formData.bmi} onChange={handleChange} className="field" />
            </Field>

            <Field label="Smoking history" htmlFor="smoking">
              <select id="smoking" name="smoking" value={formData.smoking} onChange={handleChange} className="field">
                <option>No</option>
                <option>Yes</option>
              </select>
            </Field>

            <Field label="Alcohol intake" htmlFor="alcohol">
              <select id="alcohol" name="alcohol" value={formData.alcohol} onChange={handleChange} className="field">
                <option>No</option>
                <option>Yes</option>
              </select>
            </Field>
          </div>
        </section>

        <section className="space-y-5">
          <SectionHeading number="03" title="Medical & family history" />
          <div className="grid gap-x-6 gap-y-4 sm:grid-cols-2">
            <Field label="Family medical history" htmlFor="familyHistory"
              hint="Any family history of rheumatoid arthritis or autoimmune conditions.">
              <textarea id="familyHistory" name="familyHistory" rows={4}
                placeholder="Mention any family history of rheumatoid arthritis, autoimmune conditions..."
                value={formData.familyHistory} onChange={handleChange} className="field resize-none" />
            </Field>

            <Field label="Personal medical history" htmlFor="medicalHistory"
              hint="Prior surgeries, chronic conditions, current joint pain, or medications.">
              <textarea id="medicalHistory" name="medicalHistory" rows={4}
                placeholder="Mention prior surgeries, chronic conditions, current joint pain, or medications..."
                value={formData.medicalHistory} onChange={handleChange} className="field resize-none" />
            </Field>
          </div>
        </section>

        <div className="flex flex-col-reverse gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:justify-end">
          <button type="button" onClick={handleClearForm} className="btn-secondary">
            <RotateCcw className="h-4 w-4" />
            Reset fields
          </button>
          <button type="submit" disabled={isSubmitting || !formData.name.trim()} className="btn-primary">
            {isSubmitting ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Saving profile…
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
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