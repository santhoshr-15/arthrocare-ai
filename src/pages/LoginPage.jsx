import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Mail, Lock, Eye, EyeOff, ShieldCheck, Activity, ArrowRight, AlertCircle, CheckCircle2 } from "lucide-react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../firebase/config";
import { doc, getDoc, updateDoc, setDoc } from "firebase/firestore";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      console.log("🔄 Starting login process...");

      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      console.log("✅ User signed in successfully:", user.uid);

      let userData = {};
      let docName = "";
      
      try {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          userData = userDoc.data();
          docName = userData.docName || user.displayName?.replace(/[^a-zA-Z0-9]/g, '_') || "user";
          console.log("✅ User data retrieved from Firestore");
        } else {
          console.log("⚠️ No user data found in Firestore, using basic info");
          userData = {
            name: user.displayName || "User",
            email: user.email,
            role: "patient"
          };
          docName = user.displayName?.replace(/[^a-zA-Z0-9]/g, '_') || "user";
        }
      } catch (firestoreError) {
        console.error("❌ Firestore error:", firestoreError);
        userData = {
          name: user.displayName || "User",
          email: user.email,
          role: "patient"
        };
        docName = user.displayName?.replace(/[^a-zA-Z0-9]/g, '_') || "user";
      }

      const loginData = {
        email: user.email,
        name: userData.name || user.displayName || "User",
        lastLogin: new Date().toISOString(),
        loginCount: (userData.loginCount || 0) + 1,
        uid: user.uid,
        timestamp: new Date().toISOString(),
        docName: docName
      };

      try {
        await setDoc(doc(db, "login", docName), loginData);
        console.log("✅ Login details saved to login collection");
      } catch (firestoreError) {
        console.error("❌ Login details save failed:", firestoreError);
      }

      try {
        await updateDoc(doc(db, "users", user.uid), {
          lastLogin: new Date().toISOString(),
          loginCount: (userData.loginCount || 0) + 1
        });
        console.log("✅ User login details updated");
      } catch (firestoreError) {
        console.error("❌ User login update failed:", firestoreError);
      }

      const userWithRole = {
        uid: user.uid,
        name: userData.name || user.displayName || "User",
        email: user.email,
        role: userData.role || "patient",
        docName: docName
      };

      if (remember) {
        localStorage.setItem("currentUser", JSON.stringify(userWithRole));
        console.log("✅ User stored in localStorage");
      } else {
        sessionStorage.setItem("currentUser", JSON.stringify(userWithRole));
        console.log("✅ User stored in sessionStorage");
      }

      if (userWithRole.role === "admin") {
        console.log("🔄 Redirecting to admin dashboard");
        navigate("/admin/dashboard");
      } else {
        console.log("🔄 Redirecting to patient dashboard");
        navigate("/patient/dashboard");
      }

    } catch (error) {
      console.error("❌ Login error:", error);
      
      switch (error.code) {
        case 'auth/invalid-email':
          setError("Invalid email address format.");
          break;
        case 'auth/user-disabled':
          setError("This account has been disabled. Please contact support.");
          break;
        case 'auth/user-not-found':
          setError("No account found with this email. Please check your email or register.");
          break;
        case 'auth/wrong-password':
          setError("Incorrect password. Please try again.");
          break;
        case 'auth/too-many-requests':
          setError("Too many failed attempts. Please try again later or reset your password.");
          break;
        case 'auth/network-request-failed':
          setError("Network error. Please check your internet connection.");
          break;
        case 'auth/invalid-credential':
          setError("Invalid login credentials. Please check your email and password.");
          break;
        default:
          setError("Login failed. Please try again. Error: " + error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-between">
      
      {/* Top Navbar */}
      <header className="w-full bg-white border-b border-slate-200 py-3.5 px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-3">
            <div className="w-9 h-9 bg-teal-700 rounded-xl flex items-center justify-center text-white shadow-sm">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <span className="text-lg font-bold text-slate-900">ArthroCare <span className="text-teal-700">AI</span></span>
              <span className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Clinical Portal</span>
            </div>
          </Link>
          <Link to="/" className="text-xs font-semibold text-slate-500 hover:text-teal-700 transition-colors">
            Return to Homepage
          </Link>
        </div>
      </header>

      {/* Main Container */}
      <div className="flex-1 flex items-center justify-center p-6 my-8">
        <div className="w-full max-w-5xl grid lg:grid-cols-12 gap-8 items-center bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden">
          
          {/* Left Column: Clinical Info Panel */}
          <div className="lg:col-span-6 bg-slate-900 text-white p-8 lg:p-12 flex flex-col justify-between min-h-[460px]">
            <div>
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-teal-900/60 border border-teal-700/80 text-teal-300 text-xs font-medium mb-6">
                <ShieldCheck className="w-4 h-4" />
                <span>Encrypted Health Portal</span>
              </div>

              <h1 className="text-3xl font-extrabold text-white tracking-tight mb-4">
                Clinical Decision Support System
              </h1>

              <p className="text-slate-300 text-sm leading-relaxed mb-8">
                Access your personalized rheumatoid arthritis risk assessments, biomarker tracking metrics, and clinical recommendations.
              </p>

              <div className="space-y-4">
                <div className="flex items-start space-x-3 text-xs text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
                  <span>4-Biomarker Analysis (RF, Anti-CCP, CRP, ESR)</span>
                </div>
                <div className="flex items-start space-x-3 text-xs text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
                  <span>Age & Gender Adjusted ML Risk Scoring</span>
                </div>
                <div className="flex items-start space-x-3 text-xs text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
                  <span>Longitudinal Trend & Progression Matrix</span>
                </div>
              </div>
            </div>

            <div className="pt-8 border-t border-slate-800 text-[11px] text-slate-500 flex items-center justify-between">
              <span>ArthroCare AI Healthcare Suite</span>
              <span>Secure Authorization</span>
            </div>
          </div>

          {/* Right Column: Login Form */}
          <div className="lg:col-span-6 p-8 lg:p-10">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Sign In to Account</h2>
              <p className="text-slate-500 text-xs mt-1">Enter your clinical credentials to continue.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Email Input */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <input
                    type="email"
                    placeholder="patient@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50/60 border border-slate-200 rounded-xl text-slate-900 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-600 transition-all"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full pl-10 pr-10 py-2.5 bg-slate-50/60 border border-slate-200 rounded-xl text-slate-900 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-600 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Remember + Forgot */}
              <div className="flex items-center justify-between text-xs pt-1">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={remember}
                    onChange={() => setRemember(!remember)}
                    className="rounded border-slate-300 text-teal-600 focus:ring-teal-500 w-4 h-4"
                  />
                  <span className="text-slate-600 font-medium">Keep me signed in</span>
                </label>
              </div>

              {/* Error Alert */}
              {error && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-start space-x-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 bg-teal-700 hover:bg-teal-800 text-white font-semibold text-sm rounded-xl shadow-sm transition-all duration-150 flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                {loading ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Authenticating...</span>
                  </div>
                ) : (
                  <>
                    <span>Sign In to Portal</span>
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </>
                )}
              </button>

            </form>

            <div className="mt-6 pt-4 border-t border-slate-100 text-center text-xs text-slate-500">
              New patient or clinician?{" "}
              <Link to="/register" className="font-bold text-teal-700 hover:text-teal-800 transition-colors">
                Create an account
              </Link>
            </div>
          </div>

        </div>
      </div>

      {/* Footer */}
      <footer className="py-4 text-center text-xs text-slate-400 border-t border-slate-200">
        © {new Date().getFullYear()} ArthroCare AI System. Confidential & HIPAA Compliant Data Infrastructure.
      </footer>

    </div>
  );
};

export default LoginPage;
