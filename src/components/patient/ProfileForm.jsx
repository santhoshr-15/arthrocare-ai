import React, { useState, useEffect } from "react";
import { collection, doc, setDoc, getDocs, query, where, getDoc } from "firebase/firestore";
import { auth, db } from "../../firebase/config";
import { onAuthStateChanged } from "firebase/auth";
import CardTransition from "../animations/CardTransition";
import { User, Calendar, Mail, Phone, Heart, FileText, Save, RefreshCw, AlertCircle } from "lucide-react";

const ProfileForm = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
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
        } catch (err) {
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

  const handleSubmitAlternative = async (e) => {
    e.preventDefault();
    
    if (!currentUser) {
      alert("⚠️ Please log in to save your profile.");
      return;
    }

    if (!formData.name.trim()) {
      alert("⚠️ Please enter your name.");
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
          continue;
        }
      }

      if (!savedSuccessfully) {
        throw lastError || new Error('Failed to save to any collection');
      }

      alert("✅ Profile saved successfully!");

      if (window.dashboardSetTab) {
        window.dashboardSetTab("Lab Test Entry");
      }

    } catch (err) {
      alert(`⚠️ Error saving profile: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClearForm = () => {
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
      <CardTransition className="bg-white p-8 rounded-2xl border border-slate-200/90 shadow-sm text-center">
        <AlertCircle className="w-10 h-10 text-amber-500 mx-auto mb-3" />
        <h3 className="text-base font-bold text-slate-900">Authentication Required</h3>
        <p className="text-xs text-slate-500">Please sign in to access your personal medical profile.</p>
      </CardTransition>
    );
  }

  if (loading) {
    return (
      <CardTransition className="bg-white p-8 rounded-2xl border border-slate-200/90 shadow-sm text-center">
        <div className="w-8 h-8 border-3 border-teal-700 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Retrieving Medical Profile...</p>
      </CardTransition>
    );
  }

  return (
    <CardTransition className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 space-y-6">
      
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-teal-700 rounded-xl flex items-center justify-center text-white shadow-sm">
            <User className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">Personal Demographics & Clinical Profile</h2>
            <p className="text-xs text-slate-500">Essential baseline info for age/gender adjusted risk scoring</p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleClearForm}
          className="text-xs font-semibold text-slate-500 hover:text-slate-700 flex items-center space-x-1"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Reset Fields</span>
        </button>
      </div>

      <form onSubmit={handleSubmitAlternative} className="space-y-6">
        
        {/* Section 1: Demographics */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2">
            1. Patient Demographics
          </h3>
          
          <div className="grid md:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                Full Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="Jane Doe"
                className="w-full px-3.5 py-2.5 bg-slate-50/60 border border-slate-200 rounded-xl text-slate-900 font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/30"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                Date of Birth
              </label>
              <input
                type="date"
                name="dob"
                value={formData.dob}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 bg-slate-50/60 border border-slate-200 rounded-xl text-slate-900 font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/30"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                Calculated Age
              </label>
              <input
                type="text"
                name="age"
                value={formData.age ? `${formData.age} years` : ''}
                readOnly
                placeholder="Auto-calculated"
                className="w-full px-3.5 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-slate-700 font-bold cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                Email Address *
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="jane@example.com"
                className="w-full px-3.5 py-2.5 bg-slate-50/60 border border-slate-200 rounded-xl text-slate-900 font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/30"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+1 (555) 000-0000"
                className="w-full px-3.5 py-2.5 bg-slate-50/60 border border-slate-200 rounded-xl text-slate-900 font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/30"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                Gender *
              </label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                required
                className="w-full px-3.5 py-2.5 bg-slate-50/60 border border-slate-200 rounded-xl text-slate-900 font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/30"
              >
                <option value="">Select Gender</option>
                <option>Female</option>
                <option>Male</option>
                <option>Other</option>
              </select>
            </div>
          </div>
        </div>

        {/* Section 2: Clinical Baselines & Lifestyle */}
        <div className="space-y-4 pt-2">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2">
            2. Health Baselines & Lifestyle Indicators
          </h3>

          <div className="grid md:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                Body Mass Index (BMI)
              </label>
              <input
                type="text"
                name="bmi"
                value={formData.bmi}
                onChange={handleChange}
                placeholder="e.g. 23.4"
                className="w-full px-3.5 py-2.5 bg-slate-50/60 border border-slate-200 rounded-xl text-slate-900 font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/30"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                Smoking History
              </label>
              <select
                name="smoking"
                value={formData.smoking}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 bg-slate-50/60 border border-slate-200 rounded-xl text-slate-900 font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/30"
              >
                <option>No</option>
                <option>Yes</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                Alcohol Intake
              </label>
              <select
                name="alcohol"
                value={formData.alcohol}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 bg-slate-50/60 border border-slate-200 rounded-xl text-slate-900 font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/30"
              >
                <option>No</option>
                <option>Yes</option>
              </select>
            </div>
          </div>
        </div>

        {/* Section 3: Medical Notes */}
        <div className="space-y-4 pt-2">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2">
            3. Medical & Family History
          </h3>

          <div className="grid md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                Family Medical History
              </label>
              <textarea
                name="familyHistory"
                value={formData.familyHistory}
                onChange={handleChange}
                rows={3}
                placeholder="Mention any family history of rheumatoid arthritis, autoimmune conditions..."
                className="w-full p-3 bg-slate-50/60 border border-slate-200 rounded-xl text-slate-900 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/30"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                Personal Medical History
              </label>
              <textarea
                name="medicalHistory"
                value={formData.medicalHistory}
                onChange={handleChange}
                rows={3}
                placeholder="Mention prior surgeries, chronic conditions, current joint pain, or medications..."
                className="w-full p-3 bg-slate-50/60 border border-slate-200 rounded-xl text-slate-900 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/30"
              />
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex justify-end border-t border-slate-100 pt-4">
          <button
            type="submit"
            disabled={isSubmitting || !formData.name.trim()}
            className="px-6 py-3 bg-teal-700 hover:bg-teal-800 text-white font-semibold text-sm rounded-xl shadow-sm transition-all duration-150 flex items-center space-x-2 disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Saving Profile Data...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save Medical Profile</span>
              </>
            )}
          </button>
        </div>

      </form>

    </CardTransition>
  );
};

export default ProfileForm;
