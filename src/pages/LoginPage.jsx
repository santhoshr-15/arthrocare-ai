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
    <div className="min-h-screen bg-slate-100 flex">
      {/* Left Panel - Clinical System Information */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between bg-slate-900 text-white p-16">
        <div>
          <Logo dark subtitle="Clinical decision support" />
        </div>
        <div className="space-y-8">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-800 text-white">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Secure Clinical Portal</h2>
              <p className="text-sm text-slate-400">HIPAA-compliant authentication system</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-800 text-white">
              <Activity className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Real-Time Risk Assessment</h2>
              <p className="text-sm text-slate-400">ML-powered RA risk stratification</p>
            </div>
          </div>
        </div>
        <div className="text-sm text-slate-500">
          <p>© {new Date().getFullYear()} ArthroCare AI Healthcare Suite</p>
          <p className="mt-1">System Version: 2.4.0 · ACR/EULAR Aligned</p>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="flex w-full flex-col justify-center px-4 py-16 sm:px-6 lg:w-1/2 lg:px-16">
        <div className="mx-auto w-full max-w-md">
          <div className="text-center lg:text-left">
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Sign in to your account
            </h1>
            <p className="mt-3 text-base text-slate-600">
              Access your clinical workspace to manage patient assessments and review risk reports.
            </p>
          </div>

          <div className="mt-10">
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="flex items-start gap-3 rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
                  <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-rose-600" />
                  <span>{error}</span>
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold text-slate-700" htmlFor="email">
                  Email address
                </label>
                <div className="mt-2 relative">
                  <Mail className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="field pl-10"
                    placeholder="you@example.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700" htmlFor="password">
                  Password
                </label>
                <div className="mt-2 relative">
                  <Lock className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="field pl-10 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-sm text-slate-600">
                  <input
                    type="checkbox"
                    checked={remember}
                    onChange={(e) => setRemember(e.target.checked)}
                    className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-600"
                  />
                  Remember me
                </label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full"
              >
                {loading ? (
                  <>
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Signing in…
                  </>
                ) : (
                  <>
                    Sign in
                    <ArrowRight className="h-5 w-5" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-8 text-center text-sm text-slate-600">
              <p>
                Don't have an account?{" "}
                <Link to="/register" className="font-semibold text-blue-800 hover:text-blue-700">
                  Register a new workspace
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;