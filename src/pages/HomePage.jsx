import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import {
  Activity,
  Brain,
  BarChart3,
  ShieldCheck,
  FlaskConical,
  Stethoscope,
  Sparkles,
  Mail,
  Phone,
  MapPin,
  ArrowRight,
  CheckCircle2,
  Lock,
  ChevronRight,
  TrendingUp,
  FileSpreadsheet
} from "lucide-react";

const features = [
  {
    title: "Age & Gender-Adjusted ML Scoring",
    description: "Evaluates ESR, CRP, RF, and Anti-CCP levels against age- and sex-adjusted physiological baselines.",
    icon: Brain,
    badge: "ML Analytics"
  },
  {
    title: "Multi-Biomarker Progression Engine",
    description: "Tracks serial lab measurements over time to evaluate inflammatory trends and longitudinal risk trajectories.",
    icon: Activity,
    badge: "Biomarker Tracking"
  },
  {
    title: "Clinical Guidance & Lifestyle Protocol",
    description: "Generates evidence-backed recommendations for exercise, nutrition, and lifestyle optimization.",
    icon: Stethoscope,
    badge: "Personalized Protocol"
  }
];

const clinicalTech = [
  {
    title: "Rheumatoid Factor (RF) Analysis",
    unit: "0 - 14 IU/mL Normal",
    description: "Quantitative serological evaluation for autoantibodies targeting immunoglobulin G heavy chains.",
    icon: FlaskConical
  },
  {
    title: "Anti-CCP Antibody Sensitivity",
    unit: "< 20 U/mL Normal",
    description: "High-specificity biomarker detection for early-stage rheumatoid arthritis identification.",
    icon: ShieldCheck
  },
  {
    title: "Acute Phase Inflammatory Markers",
    unit: "CRP < 3.0 mg/L | ESR 0-20 mm/hr",
    description: "Continuous tracking of systemic inflammation using C-Reactive Protein and Erythrocyte Sedimentation Rate.",
    icon: BarChart3
  }
];

const HomePage = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const { scrollY } = useScroll();
  
  const headerBg = useTransform(
    scrollY,
    [0, 60],
    ["rgba(255, 255, 255, 0.8)", "rgba(255, 255, 255, 0.98)"]
  );

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 40);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-teal-500/20 selection:text-teal-900">
      
      {/* HEADER */}
      <motion.header
        style={{ background: headerBg }}
        className={`fixed top-0 w-full z-50 transition-all duration-300 border-b ${
          isScrolled ? "border-slate-200 shadow-sm backdrop-blur-md" : "border-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 py-3.5 flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 bg-teal-700 rounded-xl flex items-center justify-center text-white shadow-sm transition-transform group-hover:scale-105">
              <Activity className="w-5 h-5 text-teal-100" />
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight text-slate-900">
                ArthroCare <span className="text-teal-700">AI</span>
              </span>
              <span className="block text-[10px] uppercase font-semibold text-slate-600 tracking-wider">
                Clinical Intelligence
              </span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center space-x-8">
            <a href="#features" className="text-sm font-medium text-slate-600 hover:text-teal-700 transition-colors">
              Platform Features
            </a>
            <a href="#biomarkers" className="text-sm font-medium text-slate-600 hover:text-teal-700 transition-colors">
              Biomarker Suite
            </a>
            <a href="#research" className="text-sm font-medium text-slate-600 hover:text-teal-700 transition-colors">
              Clinical Science
            </a>
            <a href="#contact" className="text-sm font-medium text-slate-600 hover:text-teal-700 transition-colors">
              Contact
            </a>
          </nav>

          <div className="flex items-center space-x-4">
            <Link to="/login">
              <button className="px-4 py-2 text-sm font-medium text-slate-700 hover:text-teal-700 transition-colors">
                Sign In
              </button>
            </Link>
            <Link to="/login">
              <button className="inline-flex items-center justify-center px-4 py-2 text-sm font-semibold text-white bg-teal-700 hover:bg-teal-800 rounded-xl shadow-sm transition-all duration-150">
                <span>Begin Assessment</span>
                <ChevronRight className="w-4 h-4 ml-1" />
              </button>
            </Link>
          </div>
        </div>
      </motion.header>

      {/* HERO SECTION */}
      <section className="relative pt-32 pb-20 lg:pt-36 lg:pb-28 overflow-hidden bg-gradient-to-b from-white via-slate-50 to-slate-100/60 border-b border-slate-200/60">
        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column */}
          <div className="lg:col-span-7 space-y-8">
            <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-teal-50 border border-teal-200/80 text-teal-800 text-xs font-semibold">
              <ShieldCheck className="w-4 h-4 text-teal-600" />
              <span>Clinical Diagnostic & Risk Prediction System</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.15]">
              Precision Biomarker Analytics for{" "}
              <span className="text-teal-700 underline decoration-teal-300 decoration-wavy decoration-2">
                Rheumatoid Arthritis
              </span>
            </h1>

            <p className="text-lg text-slate-600 leading-relaxed max-w-2xl font-normal">
              ArthroCare AI integrates 4-biomarker serology (RF, Anti-CCP, CRP, ESR) with patient age and sex baselines to provide early risk identification, longitudinal tracking, and evidence-guided clinical protocols.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 pt-2">
              <Link to="/login">
                <button className="w-full sm:w-auto inline-flex items-center justify-center px-7 py-3.5 text-base font-semibold text-white bg-teal-700 hover:bg-teal-800 rounded-xl shadow-md transition-all duration-200">
                  <Activity className="w-5 h-5 mr-2" />
                  <span>Start Patient Assessment</span>
                  <ArrowRight className="w-5 h-5 ml-2" />
                </button>
              </Link>
              <a href="#biomarkers">
                <button className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3.5 text-base font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-xl shadow-sm transition-all duration-200">
                  <FileSpreadsheet className="w-5 h-5 mr-2 text-slate-500" />
                  <span>Explore Biomarkers</span>
                </button>
              </a>
            </div>

            <div className="grid grid-cols-3 gap-6 pt-6 border-t border-slate-200/80">
              <div>
                <div className="text-2xl font-bold text-slate-900">4 Biomarkers</div>
                <div className="text-xs text-slate-500 mt-0.5">RF, Anti-CCP, CRP, ESR</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-teal-700">Multi-Model</div>
                <div className="text-xs text-slate-500 mt-0.5">Age & Gender Adjusted</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-slate-900">Real-Time</div>
                <div className="text-xs text-slate-500 mt-0.5">Progression Analysis</div>
              </div>
            </div>
          </div>

          {/* Right Column - Clinical Data Card Showcase */}
          <div className="lg:col-span-5">
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xl p-6 relative">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-lg bg-teal-50 border border-teal-200 flex items-center justify-center">
                    <Activity className="w-4 h-4 text-teal-700" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Clinical Preview</div>
                    <div className="text-sm font-bold text-slate-900">Diagnostic Summary Card</div>
                  </div>
                </div>
                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Verified Model
                </span>
              </div>

              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/70">
                  <div className="flex justify-between items-center text-xs text-slate-500 mb-1">
                    <span>Rheumatoid Factor (RF)</span>
                    <span className="font-semibold text-slate-700">18.5 IU/mL (Slight Elev)</span>
                  </div>
                  <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                    <div className="bg-amber-500 h-full w-[65%]" />
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/70">
                  <div className="flex justify-between items-center text-xs text-slate-500 mb-1">
                    <span>Anti-CCP Antibodies</span>
                    <span className="font-semibold text-slate-700">42 U/mL (Positive)</span>
                  </div>
                  <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                    <div className="bg-rose-500 h-full w-[80%]" />
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/70">
                  <div className="flex justify-between items-center text-xs text-slate-500 mb-1">
                    <span>C-Reactive Protein (CRP)</span>
                    <span className="font-semibold text-slate-700">2.4 mg/L (Normal)</span>
                  </div>
                  <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                    <div className="bg-teal-600 h-full w-[35%]" />
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/70">
                  <div className="flex justify-between items-center text-xs text-slate-500 mb-1">
                    <span>Erythrocyte Sed. Rate (ESR)</span>
                    <span className="font-semibold text-slate-700">16 mm/hr (Normal)</span>
                  </div>
                  <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                    <div className="bg-teal-600 h-full w-[40%]" />
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span className="flex items-center">
                  <Lock className="w-3.5 h-3.5 text-slate-400 mr-1" />
                  Encrypted & Patient Safe
                </span>
                <span className="font-medium text-teal-700">Clinical Dashboard v2.0</span>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* FEATURES SECTION */}
      <section id="features" className="py-20 bg-white border-b border-slate-200/60">
        <div className="max-w-7xl mx-auto px-6">
          <div className="max-w-3xl mx-auto text-center space-y-4 mb-16">
            <h2 className="text-xs font-bold uppercase tracking-widest text-teal-700">Core Engine Capabilities</h2>
            <h3 className="text-3xl font-extrabold text-slate-900 tracking-tight sm:text-4xl">
              Comprehensive Clinical RA Assessment
            </h3>
            <p className="text-slate-600 text-base">
              Combining standardized diagnostic ranges, patient demographics, and machine learning risk classification to support clinical evaluation.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feat) => {
              const Icon = feat.icon;
              return (
                <div key={feat.title} className="bg-slate-50/70 rounded-2xl p-8 border border-slate-200/80 transition-all duration-200 hover:border-slate-300 hover:shadow-md flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-6">
                      <div className="w-12 h-12 bg-white rounded-xl border border-slate-200 flex items-center justify-center text-teal-700 shadow-sm">
                        <Icon className="w-6 h-6" />
                      </div>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-teal-800 bg-teal-50 px-2.5 py-1 rounded-full border border-teal-200/60">
                        {feat.badge}
                      </span>
                    </div>
                    <h4 className="text-xl font-bold text-slate-900 mb-3">{feat.title}</h4>
                    <p className="text-slate-600 text-sm leading-relaxed">{feat.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* BIOMARKER SUITE SECTION */}
      <section id="biomarkers" className="py-20 bg-slate-50 border-b border-slate-200/60">
        <div className="max-w-7xl mx-auto px-6">
          <div className="max-w-3xl mx-auto text-center space-y-4 mb-16">
            <h2 className="text-xs font-bold uppercase tracking-widest text-teal-700">Biomarker Suite</h2>
            <h3 className="text-3xl font-extrabold text-slate-900 tracking-tight sm:text-4xl">
              Targeted Serology & Inflammatory Metrics
            </h3>
            <p className="text-slate-600 text-base">
              Key lab parameters required for evaluation and their standard reference parameters.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {clinicalTech.map((tech) => {
              const Icon = tech.icon;
              return (
                <div key={tech.title} className="bg-white rounded-2xl p-8 border border-slate-200/90 shadow-sm flex flex-col justify-between">
                  <div>
                    <div className="w-10 h-10 bg-teal-50 rounded-lg border border-teal-200/80 flex items-center justify-center text-teal-700 mb-6">
                      <Icon className="w-5 h-5" />
                    </div>
                    <h4 className="text-lg font-bold text-slate-900 mb-1">{tech.title}</h4>
                    <div className="inline-block text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded mb-4">
                      {tech.unit}
                    </div>
                    <p className="text-slate-600 text-sm leading-relaxed">{tech.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* RESEARCH & CLINICAL SCIENCE */}
      <section id="research" className="py-20 bg-white border-b border-slate-200/60">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <span className="text-xs font-bold uppercase tracking-widest text-teal-700">Diagnostic Rigor</span>
              <h3 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                Designed to Support Early Rheumatoid Arthritis Detection
              </h3>
              <p className="text-slate-600 leading-relaxed text-base">
                Rheumatoid arthritis (RA) can cause joint damage before outward swelling becomes evident. By combining quantitative autoantibody screening with acute-phase protein monitoring and patient age/sex adjustments, ArthroCare AI helps identify risk signals early.
              </p>
              
              <ul className="space-y-3 pt-2">
                {[
                  "Age and gender adjusted reference ranges",
                  "Automated comparative risk matrix over time",
                  "Actionable lifestyle, dietary & joint preservation advice"
                ].map((item) => (
                  <li key={item} className="flex items-start text-sm text-slate-700 font-medium">
                    <CheckCircle2 className="w-5 h-5 text-teal-600 mr-3 shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>

              <div className="pt-4">
                <Link to="/login">
                  <button className="inline-flex items-center px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm rounded-xl shadow-sm transition-colors">
                    <span>Access Assessment Portal</span>
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </button>
                </Link>
              </div>
            </div>

            <div className="bg-slate-50 p-8 rounded-2xl border border-slate-200 space-y-6">
              <h4 className="text-lg font-bold text-slate-900 border-b border-slate-200 pb-4">
                Biomarker Assessment Matrix
              </h4>
              
              <div className="space-y-4 text-xs">
                <div className="flex justify-between items-center p-3 bg-white rounded-xl border border-slate-200">
                  <span className="font-semibold text-slate-800">Rheumatoid Factor (RF)</span>
                  <span className="text-slate-500">Normal Range: &lt; 14 IU/mL</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-white rounded-xl border border-slate-200">
                  <span className="font-semibold text-slate-800">Anti-CCP Antibodies</span>
                  <span className="text-slate-500">Normal Range: &lt; 20 U/mL</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-white rounded-xl border border-slate-200">
                  <span className="font-semibold text-slate-800">C-Reactive Protein (CRP)</span>
                  <span className="text-slate-500">Normal Range: &lt; 3.0 mg/L</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-white rounded-xl border border-slate-200">
                  <span className="font-semibold text-slate-800">Erythrocyte Sed. Rate (ESR)</span>
                  <span className="text-slate-500">Normal Range: 0 - 20 mm/hr</span>
                </div>
              </div>

              <div className="text-[11px] text-slate-600 bg-teal-50/70 p-3.5 rounded-xl border border-teal-200/60 leading-relaxed">
                Note: Diagnostic findings from ArthroCare AI provide risk assessment guidance and are designed to complement professional rheumatology consultation.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer id="contact" className="bg-slate-900 text-slate-300">
        <div className="max-w-7xl mx-auto px-6 pt-16 pb-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 pb-12 border-b border-slate-800">
            
            {/* Brand */}
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-teal-600 rounded-lg flex items-center justify-center text-white">
                  <Activity className="w-4 h-4" />
                </div>
                <span className="text-xl font-bold text-white tracking-tight">ArthroCare AI</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Clinical risk intelligence system for early identification and personalized management of Rheumatoid Arthritis.
              </p>
            </div>

            {/* Platform Links */}
            <div>
              <h5 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">Platform</h5>
              <ul className="space-y-2.5 text-xs">
                <li><a href="#features" className="hover:text-teal-400 transition-colors">Features</a></li>
                <li><a href="#biomarkers" className="hover:text-teal-400 transition-colors">Biomarker Suite</a></li>
                <li><a href="#research" className="hover:text-teal-400 transition-colors">Clinical Research</a></li>
                <li><Link to="/login" className="hover:text-teal-400 transition-colors">Patient Assessment</Link></li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h5 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">Compliance</h5>
              <ul className="space-y-2.5 text-xs">
                <li><a href="#" className="hover:text-teal-400 transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-teal-400 transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-teal-400 transition-colors">Data Security</a></li>
                <li><a href="#" className="hover:text-teal-400 transition-colors">Clinical Disclaimer</a></li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h5 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">Contact</h5>
              <ul className="space-y-3 text-xs">
                <li className="flex items-center space-x-2.5">
                  <Mail className="w-4 h-4 text-teal-500 shrink-0" />
                  <a href="mailto:info@arthrocare.com" className="hover:text-white transition-colors">info@arthrocare.com</a>
                </li>
                <li className="flex items-center space-x-2.5">
                  <Phone className="w-4 h-4 text-teal-500 shrink-0" />
                  <a href="tel:+1555432584" className="hover:text-white transition-colors">+1 (555) 432-584</a>
                </li>
                <li className="flex items-center space-x-2.5">
                  <MapPin className="w-4 h-4 text-teal-500 shrink-0" />
                  <span>123 Health Tech Blvd, CA</span>
                </li>
              </ul>
            </div>

          </div>

          <div className="pt-8 flex flex-col md:flex-row justify-between items-center text-xs text-slate-500">
            <p>© {new Date().getFullYear()} ArthroCare AI. All rights reserved.</p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a href="#" className="hover:text-slate-300 transition-colors">Documentation</a>
              <a href="#" className="hover:text-slate-300 transition-colors">System Status</a>
              <a href="#" className="hover:text-slate-300 transition-colors">Support</a>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
};

export default HomePage;