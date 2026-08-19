import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, User, Eye, EyeOff, AlertCircle, ShieldCheck, CheckCircle2, ArrowRight } from "lucide-react";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth, db } from "../firebase/config";
import { doc, setDoc } from "firebase/firestore";
import Logo from "../components/ui/Logo";

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
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await updateProfile(user, {
        displayName: name.trim()
      });

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

      try {
        await setDoc(doc(db, "users", user.uid), userData);
      } catch (usersError) {
        console.error("Users collection save failed:", usersError);
      }

      try {
        await setDoc(doc(db, "signup", docName), userData);
      } catch (signupError) {
        console.error("Signup collection save failed:", signupError);
      }

      setSuccess("Registration successful. Redirecting to sign in...");

      await auth.signOut();

      setTimeout(() => {
        navigate("/login");
      }, 1800);

    } catch (error) {
      console.error("Registration error:", error);

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
    <div className="min-h-screen bg-slate-100">
      {/* Top header */}
      <header className="border-b border-slate-200 bg-white">
        <div className="container-page flex h-16 items-center justify-between">
          <Link to="/" aria-label="Back to home">
            <Logo subtitle="Account Setup" />
          </Link>
          <Link to="/login" className="btn-ghost text-sm">
            Already registered? Sign in
          </Link>
        </div>
      </header>

      {/* Main workspace area */}
      <main className="flex flex-1 items-center justify-center px-4 py-10">
        <div className="w-full max-w-4xl overflow-hidden rounded-lg bg-white shadow-sm ring-1 ring-slate-200 md:grid md:grid-cols-12">
          {/* Left info panel */}
          <aside className="hidden flex-col justify-between bg-primary-950 p-8 text-white md:col-span-5 md:flex">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-primary-700/60 bg-primary-900/60 px-3 py-1 text-xs font-semibold text-primary-200">
                <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
                Clinical Account Registration
              </div>
              <h1 className="mt-4 text-xl font-bold tracking-tight">Join the ArthroCare clinical workspace</h1>
              <p className="mt-2 text-sm leading-relaxed text-primary-200/70">
                Register a patient account to enter laboratory serology values, access age- and sex-adjusted risk predictions, and receive tailored monitoring guidance.
              </p>

              <ul className="mt-7 space-y-3.5 border-t border-primary-800/60 pt-6 text-sm text-primary-100/80">
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary-300" aria-hidden="true" />
                  Secure, HIPAA-aligned data structure
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary-300" aria-hidden="true" />
                  Real-time ML risk stratification engine
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary-300" aria-hidden="true" />
                  Evidence-based lifestyle and diet recommendations
                </li>
              </ul>
            </div>

            <div className="border-t border-primary-800/60 pt-5 text-xs font-medium text-primary-300/60">
              System ID: AC-DS24 · Verified Data Protection
            </div>
          </aside>

          {/* Right registration form */}
          <div className="p-6 sm:p-8 md:col-span-7">
            <h2 className="page-title">Create patient account</h2>
            <p className="mt-1 text-sm text-slate-500">Enter patient details to register your clinical workspace account.</p>

            <form onSubmit={handleSubmit} className="mt-6 space-y-5">
              <div>
                <label htmlFor="name" className="field-label">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
                  <input
                    id="name"
                    type="text"
                    autoComplete="name"
                    placeholder="Jane Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="field pl-9"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="email" className="field-label">
                  Email Address <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    placeholder="jane.doe@clinical.org"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="field pl-9"
                  />
                </div>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label htmlFor="password" className="field-label">
                    Password <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="new-password"
                      placeholder="Min 6 chars + number"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="field pl-9 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                      className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" aria-hidden="true" /> : <Eye className="h-4 w-4" aria-hidden="true" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label htmlFor="confirm" className="field-label">
                    Confirm Password <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
                    <input
                      id="confirm"
                      type={showConfirmPassword ? "text" : "password"}
                      autoComplete="new-password"
                      placeholder="Repeat password"
                      value={confirm}
                      onChange={(e) => setConfirm(e.target.value)}
                      required
                      className="field pl-9 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
                      className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-slate-400 hover:text-slate-600"
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" aria-hidden="true" /> : <Eye className="h-4 w-4" aria-hidden="true" />}
                    </button>
                  </div>
                </div>
              </div>

              {error && (
                <div className="flex items-start gap-2.5 rounded-md border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-rose-600" aria-hidden="true" />
                  <span>{error}</span>
                </div>
              )}

              {success && (
                <div className="flex items-start gap-2.5 rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" aria-hidden="true" />
                  <span>{success}</span>
                </div>
              )}

              <button type="submit" disabled={loading} className="btn-primary w-full">
                {loading ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Creating account…
                  </>
                ) : (
                  <>
                    Complete account registration
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 border-t border-slate-200 pt-4 text-center text-sm text-slate-500">
              Already have an account?{" "}
              <Link to="/login" className="font-semibold text-primary-800 hover:text-primary-700">
                Sign in
              </Link>
            </div>
          </div>
        </div>
      </main>

      <footer className="border-t border-slate-200 bg-white py-4 text-center text-xs font-medium text-slate-400">
        © {new Date().getFullYear()} ArthroCare AI Healthcare Suite · Protected Clinical Data System
      </footer>
    </div>
  );
};

export default RegisterPage;