import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff, AlertCircle, ShieldCheck, ArrowRight, Activity, CheckCircle2 } from "lucide-react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../firebase/config";
import { doc, getDoc, updateDoc, setDoc } from "firebase/firestore";
import Logo from "../components/ui/Logo";

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
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      let userData = {};
      let docName = "";

      try {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          userData = userDoc.data();
          docName = userData.docName || user.displayName?.replace(/[^a-zA-Z0-9]/g, '_') || "user";
        } else {
          userData = {
            name: user.displayName || "User",
            email: user.email,
            role: "patient"
          };
          docName = user.displayName?.replace(/[^a-zA-Z0-9]/g, '_') || "user";
        }
      } catch (firestoreError) {
        console.error("Firestore error:", firestoreError);
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
      } catch (firestoreError) {
        console.error("Login details save failed:", firestoreError);
      }

      try {
        await updateDoc(doc(db, "users", user.uid), {
          lastLogin: new Date().toISOString(),
          loginCount: (userData.loginCount || 0) + 1
        });
      } catch (firestoreError) {
        console.error("User login update failed:", firestoreError);
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
      } else {
        sessionStorage.setItem("currentUser", JSON.stringify(userWithRole));
      }

      if (userWithRole.role === "admin") {
        navigate("/admin/dashboard");
      } else {
        navigate("/patient/dashboard");
      }

    } catch (error) {
      console.error("Login error:", error);

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
    <div className="flex min-h-screen flex-col bg-slate-50">
      {/* Top Header */}
      <header className="border-b border-slate-200 bg-white">
        <div className="container-page flex h-16 items-center justify-between">
          <Link to="/" aria-label="Back to home">
            <Logo subtitle="Clinical Portal" />
          </Link>
          <Link to="/" className="btn-ghost text-xs">
            Return to public portal
          </Link>
        </div>
      </header>

      {/* Main Workspace Area */}
      <main className="flex flex-1 items-center justify-center px-4 py-10">
        <div className="w-full max-w-4xl overflow-hidden rounded-lg border border-slate-200 bg-white shadow-2xs md:grid md:grid-cols-12">
          {/* Left Clinical System Info Panel */}
          <div className="hidden flex-col justify-between bg-slate-900 p-8 text-white md:col-span-5 md:flex">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-md border border-teal-700/60 bg-teal-900/40 px-2.5 py-1 text-xs font-semibold text-teal-300">
                <ShieldCheck className="h-3.5 w-3.5" />
                Encrypted Clinical Workspace
              </div>
              
              <h1 className="text-xl font-bold tracking-tight text-white">Sign in to your clinical account</h1>
              <p className="mt-2 text-xs leading-relaxed text-slate-300">
                Access patient serology records, multivariable machine-learning risk predictions, and evidence-based recommendation protocols.
              </p>

              <div className="mt-6 space-y-3 border-t border-slate-800 pt-5 text-xs text-slate-300">
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-teal-400" />
                  <span>Four-biomarker quantitative panel (RF, Anti-CCP, CRP, ESR)</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-teal-400" />
                  <span>Age- and sex-adjusted machine-learning RA probability models</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-teal-400" />
                  <span>Longitudinal biomarker tracking &amp; serial risk comparisons</span>
                </div>
              </div>
            </div>

            <div className="border-t border-slate-800 pt-4 text-[11px] font-medium text-slate-500">
              System ID: AC-DS24 · Secure Authorization Protocol
            </div>
          </div>

          {/* Right Credentials Form Panel */}
          <div className="p-7 sm:p-9 md:col-span-7">
            <h2 className="text-lg font-bold tracking-tight text-slate-900">Sign in to clinical portal</h2>
            <p className="mt-1 text-xs text-slate-500">Enter your account credentials to access your workspace.</p>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div>
                <label htmlFor="email" className="field-label">Email Address</label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    placeholder="patient@clinical.org"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="field pl-9"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="field-label">Account Password</label>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    placeholder="Enter password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="field pl-9 pr-9"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <label className="flex cursor-pointer items-center gap-2 text-xs font-medium text-slate-600">
                  <input
                    type="checkbox"
                    checked={remember}
                    onChange={() => setRemember(!remember)}
                    className="h-3.5 w-3.5 rounded border-slate-300 text-teal-700 focus:ring-teal-700"
                  />
                  Keep signed in on this device
                </label>
              </div>

              {error && (
                <div className="flex items-start gap-2.5 rounded-md border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-rose-600" />
                  <span>{error}</span>
                </div>
              )}

              <button type="submit" disabled={loading} className="btn-primary w-full mt-2">
                {loading ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Authenticating credentials…
                  </>
                ) : (
                  <>
                    Sign in workspace
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 border-t border-slate-200 pt-4 text-center text-xs text-slate-500">
              Need a patient or clinician account?{" "}
              <Link to="/register" className="font-semibold text-teal-800 hover:underline">
                Create account
              </Link>
            </div>
          </div>
        </div>
      </main>

      <footer className="border-t border-slate-200 bg-white py-3 text-center text-[11px] font-medium text-slate-400">
        © {new Date().getFullYear()} ArthroCare AI Healthcare Suite · Confidential Clinical Infrastructure
      </footer>
    </div>
  );
};

export default LoginPage;