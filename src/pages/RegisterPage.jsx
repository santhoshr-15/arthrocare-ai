import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Mail, Lock, User, Eye, EyeOff, ShieldCheck, Activity, ArrowRight, AlertCircle, CheckCircle2 } from "lucide-react";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth, db } from "../firebase/config";
import { doc, setDoc } from "firebase/firestore";

const RegisterPage = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const validatePassword = (pwd) => {
    if (!pwd || pwd.length < 6) return "Password must be at least 6 characters.";
    if (!/\d/.test(pwd)) return "Password must contain at least one number.";
    return null;
  };

  const validateForm = () => {
    if (!name.trim()) {
      setError("Please enter your full name.");
      return false;
    }
    
    if (!email.trim()) {
      setError("Please enter your email address.");
      return false;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      setError("Please enter a valid email address.");
      return false;
    }

    if (password !== confirm) {
      setError("Passwords do not match.");
      return false;
    }

    const pwdErr = validatePassword(password);
    if (pwdErr) {
      setError(pwdErr);
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      console.log("🔄 Starting registration process...");

      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      console.log("✅ User created successfully:", user.uid);

      await updateProfile(user, {
        displayName: name.trim()
      });

      console.log("✅ User profile updated");

      const docName = name.trim().replace(/[^a-zA-Z0-9]/g, '_');

      const userData = {
        name: name.trim(),
        email: email.trim(),
        role: 'patient',
        createdAt: new Date().toISOString(),
        lastUpdated: new Date().toISOString(),
        uid: user.uid,
        registrationMethod: 'email',
        status: 'active',
        docName: docName
      };

      console.log("📝 Saving to Firestore...");

      try {
        console.log("🔄 Saving to users collection...");
        await setDoc(doc(db, "users", user.uid), userData);
        console.log("✅ User data saved to users collection");
      } catch (usersError) {
        console.error("❌ Users collection save failed:", usersError);
      }

      try {
        console.log("🔄 Saving to signup collection...");
        await setDoc(doc(db, "signup", docName), userData);
        console.log("✅ User data saved to signup collection");
      } catch (signupError) {
        console.error("❌ Signup collection save failed:", signupError);
      }

      setSuccess("🎉 Registration successful! Redirecting to login...");
      
      await auth.signOut();
      console.log("✅ User signed out after registration");
      
      setTimeout(() => {
        navigate("/login");
      }, 1800);

    } catch (error) {
      console.error("❌ Registration error:", error);
      
      switch (error.code) {
        case 'auth/email-already-in-use':
          setError("An account with this email already exists. Please try logging in instead.");
          break;
        case 'auth/invalid-email':
          setError("Invalid email address format. Please check your email.");
          break;
        case 'auth/operation-not-allowed':
          setError("Email/password accounts are not enabled. Please contact support.");
          break;
        case 'auth/weak-password':
          setError("Password is too weak. Please choose a stronger password with at least 6 characters including a number.");
          break;
        case 'auth/network-request-failed':
          setError("Network error. Please check your internet connection and try again.");
          break;
        case 'auth/too-many-requests':
          setError("Too many attempts. Please try again later.");
          break;
        case 'permission-denied':
          setError("Database permission denied. Please check Firestore rules.");
          break;
        default:
          setError("Registration failed. Please try again. Error: " + error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-between">
      
      {/* Header */}
      <header className="w-full bg-white border-b border-slate-200 py-3.5 px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-3">
            <div className="w-9 h-9 bg-teal-700 rounded-xl flex items-center justify-center text-white shadow-sm">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <span className="text-lg font-bold text-slate-900">ArthroCare <span className="text-teal-700">AI</span></span>
              <span className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Patient Registration</span>
            </div>
          </Link>
          <Link to="/login" className="text-xs font-semibold text-teal-700 hover:text-teal-800 transition-colors">
            Already registered? Sign In
          </Link>
        </div>
      </header>

      {/* Main Container */}
      <div className="flex-1 flex items-center justify-center p-6 my-6">
        <div className="w-full max-w-5xl grid lg:grid-cols-12 gap-8 items-center bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden">
          
          {/* Left Panel */}
          <div className="lg:col-span-5 bg-slate-900 text-white p-8 lg:p-10 flex flex-col justify-between min-h-[500px]">
            <div>
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-teal-900/60 border border-teal-700/80 text-teal-300 text-xs font-medium mb-6">
                <ShieldCheck className="w-4 h-4" />
                <span>Patient Account Setup</span>
              </div>

              <h1 className="text-2xl font-extrabold text-white tracking-tight mb-4">
                Join ArthroCare Clinical Platform
              </h1>

              <p className="text-slate-300 text-xs leading-relaxed mb-6">
                Create your patient account to submit lab biomarker data, receive age/gender-adjusted RA predictions, and track your joint wellness over time.
              </p>

              <div className="space-y-3.5">
                <div className="flex items-start space-x-3 text-xs text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
                  <span>Secure patient data protection</span>
                </div>
                <div className="flex items-start space-x-3 text-xs text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
                  <span>Instant ML risk prediction reports</span>
                </div>
                <div className="flex items-start space-x-3 text-xs text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
                  <span>Personalized diet & exercise plans</span>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-slate-800 text-[11px] text-slate-500">
              HIPAA & Clinical Standards Compliant Platform
            </div>
          </div>

          {/* Right Form */}
          <div className="lg:col-span-7 p-8 lg:p-10">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Create Patient Account</h2>
              <p className="text-slate-500 text-xs mt-1">Fill out your information to get started.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Name */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Full Name *
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Jane Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50/60 border border-slate-200 rounded-xl text-slate-900 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-600 transition-all"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Email Address *
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <input
                    type="email"
                    placeholder="jane.doe@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50/60 border border-slate-200 rounded-xl text-slate-900 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-600 transition-all"
                  />
                </div>
              </div>

              {/* Password & Confirm */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Password *
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="At least 6 chars"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="w-full pl-10 pr-10 py-2.5 bg-slate-50/60 border border-slate-200 rounded-xl text-slate-900 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-600 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Confirm Password *
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Repeat password"
                      value={confirm}
                      onChange={(e) => setConfirm(e.target.value)}
                      required
                      className="w-full pl-10 pr-10 py-2.5 bg-slate-50/60 border border-slate-200 rounded-xl text-slate-900 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-600 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3.5 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Feedback messages */}
              {error && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-start space-x-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              {success && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 text-xs flex items-start space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>{success}</span>
                </div>
              )}

              {/* Submit button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 bg-teal-700 hover:bg-teal-800 text-white font-semibold text-sm rounded-xl shadow-sm transition-all duration-150 flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                {loading ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Creating Account...</span>
                  </div>
                ) : (
                  <>
                    <span>Complete Registration</span>
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </>
                )}
              </button>

            </form>

            <div className="mt-6 pt-4 border-t border-slate-100 text-center text-xs text-slate-500">
              Already have an account?{" "}
              <Link to="/login" className="font-bold text-teal-700 hover:text-teal-800 transition-colors">
                Sign In
              </Link>
            </div>
          </div>

        </div>
      </div>

      <footer className="py-4 text-center text-xs text-slate-400 border-t border-slate-200">
        © {new Date().getFullYear()} ArthroCare AI System. Privacy protected & encrypted.
      </footer>

    </div>
  );
};

export default RegisterPage;