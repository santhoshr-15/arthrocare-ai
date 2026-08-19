import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff, AlertCircle, ArrowRight, ShieldCheck, Activity, ClipboardCheck, HeartPulse } from "lucide-react";
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

  const infoItems = [
    {
      icon: ShieldCheck,
      title: "Secure Clinical Portal",
      text: "Authenticated, protected patient data access"
    },
    {
      icon: Activity,
      title: "Real-Time Risk Assessment",
      text: "ML-powered RA risk stratification"
    },
    {
      icon: ClipboardCheck,
      title: "Evidence-Based Guidance",
      text: "ACR/EULAR-aligned monitoring protocols"
    }
  ];

  return (
    <div className="min-h-screen bg-[#f4f8fb] lg:flex">
      {/* Left panel */}
      <aside className="relative hidden w-[44%] flex-col justify-between overflow-hidden bg-gradient-to-br from-primary-800 via-primary-900 to-primary-950 p-10 text-white lg:flex">
        {/* Decorative blobs */}
        <div className="pointer-events-none absolute -top-20 -right-20 h-72 w-72 rounded-full bg-primary-600/20 blur-3xl" aria-hidden="true" />
        <div className="pointer-events-none absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-primary-500/15 blur-3xl" aria-hidden="true" />

        <div className="relative">
          <Logo dark subtitle="Clinical Decision Support" />
        </div>

        <div className="relative space-y-7">
          {infoItems.map((item) => (
            <div key={item.title} className="flex items-start gap-4">
              <span className="mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/10 text-primary-200 ring-1 ring-white/10 backdrop-blur-sm">
                <item.icon className="h-5 w-5" aria-hidden="true" />
              </span>
              <div>
                <h2 className="text-[15px] font-semibold">{item.title}</h2>
                <p className="mt-0.5 text-sm text-primary-200/60">{item.text}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="relative border-t border-white/10 pt-5 text-xs text-primary-300/50">
          <p>© {new Date().getFullYear()} ArthroCare AI Healthcare Suite</p>
          <p className="mt-1">System Version 2.4.0 · ACR/EULAR Aligned</p>
        </div>
      </aside>

      {/* Right panel */}
      <div className="flex w-full flex-col justify-center px-5 py-12 sm:px-8 lg:w-[56%] lg:px-16">
        <div className="mx-auto w-full max-w-md">
          <div className="lg:hidden">
            <Logo subtitle="Clinical Decision Support" />
          </div>

          <div className="mt-8 lg:mt-0">
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">Sign in to your account</h1>
            <p className="mt-2 text-sm text-slate-500">
              Access your clinical workspace to manage patient assessments and review risk reports.
            </p>
          </div>

          <div className="mt-8">
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-rose-500" aria-hidden="true" />
                  <span>{error}</span>
                </div>
              )}

              <div>
                <label className="field-label" htmlFor="email">
                  Email address
                </label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
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
                <label className="field-label" htmlFor="password">
                  Password
                </label>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
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
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-lg p-1 text-slate-400 transition-colors hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" aria-hidden="true" /> : <Eye className="h-4 w-4" aria-hidden="true" />}
                  </button>
                </div>
              </div>

              <label className="flex items-center gap-2.5 text-sm text-slate-600">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="h-4 w-4 rounded-lg border-slate-300 text-primary-600 focus:ring-primary-500"
                />
                Remember me
              </label>

              <button type="submit" disabled={loading} className="btn-primary w-full py-3">
                {loading ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Signing in…
                  </>
                ) : (
                  <>
                    Sign in
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 text-center text-sm text-slate-500">
              Don't have an account?{" "}
              <Link to="/register" className="font-semibold text-primary-600 transition-colors hover:text-primary-700">
                Register a workspace
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
