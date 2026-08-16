import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  ShieldCheck,
  Scale,
  FlaskConical,
  BrainCircuit,
  FileText,
  CheckCircle2,
  ChevronRight,
  Activity,
  UserCheck,
  BarChart3,
  Dna,
  Sliders,
  Sparkles,
  ArrowDown,
  Clock,
  Zap,
  TrendingUp,
  Users,
  Calendar
} from 'lucide-react';
import Logo from '../components/ui/Logo';

const biomarkerSuite = [
  {
    id: 'rf',
    name: 'Rheumatoid Factor (RF)',
    category: 'Autoantibody Serology',
    categoryTone: 'teal',
    reference: '< 14.0 IU/mL',
    mechanism: 'Autoantibody directed against the Fc region of human Immunoglobulin G (IgG).',
    clinicalSignificance: 'Identified in 70–80% of established RA cases. High titers correlate strongly with extra-articular manifestations and disease severity.',
    borderAccent: 'border-l-teal-700'
  },
  {
    id: 'anticcp',
    name: 'Anti-CCP Antibodies',
    category: 'Autoantibody Serology',
    categoryTone: 'teal',
    reference: '< 20.0 U/mL',
    mechanism: 'Autoantibodies highly specific to cyclic citrullinated peptide (CCP) antigens.',
    clinicalSignificance: 'Highest single-biomarker diagnostic specificity (~96%) for early RA. Serves as a strong predictor of progressive erosive joint damage.',
    borderAccent: 'border-l-teal-700'
  },
  {
    id: 'crp',
    name: 'C-Reactive Protein (CRP)',
    category: 'Acute-Phase Reactant',
    categoryTone: 'amber',
    reference: '< 3.0 mg/L',
    mechanism: 'Hepatic acute-phase reactant synthesized in response to IL-6 cytokine stimulation.',
    clinicalSignificance: 'Quantitative real-time indicator of active systemic joint inflammation. Rapidly responsive to disease activity changes and therapy.',
    borderAccent: 'border-l-amber-600'
  },
  {
    id: 'esr',
    name: 'Erythrocyte Sedimentation Rate (ESR)',
    category: 'Acute-Phase Reactant',
    categoryTone: 'amber',
    reference: '0–20 mm/hr (F) · 0–15 mm/hr (M)',
    mechanism: 'Settling velocity of red blood cells influenced by plasma fibrinogen concentrations.',
    clinicalSignificance: 'Tracks chronic systemic inflammatory burden over time. Calibrated against age- and biological sex-adjusted reference models.',
    borderAccent: 'border-l-amber-600'
  }
];

const workflowSteps = [
  {
    stage: 'STAGE 01',
    title: 'Patient Demographic Baseline',
    subtitle: 'Reference Calibration',
    description: 'Record patient age, biological sex, lifestyle factors, and clinical history to establish personalized baseline models.',
    deliverable: 'Demographic Baseline Calibrated'
  },
  {
    stage: 'STAGE 02',
    title: 'Four-Biomarker Serology Entry',
    subtitle: 'Quantitative Lab Inputs',
    description: 'Input quantitative laboratory panel measurements for RF, Anti-CCP, CRP, and ESR with real-time threshold elevation flags.',
    deliverable: 'Biomarker Panel Normalized'
  },
  {
    stage: 'STAGE 03',
    title: 'Multivariable ML Risk Analysis',
    subtitle: 'Decision Support Output',
    description: 'Compute age- & sex-adjusted RA risk probability, biomarker contribution weights, and targeted guidance protocols.',
    deliverable: 'Risk Stratification Report Generated'
  }
];

const HomePage = () => {
  // Live sample lab calculator state for hero preview
  const [sampleValues, setSampleValues] = useState({
    rf: 12,
    antiCCP: 14,
    crp: 2.1,
    esr: 15
  });

  const isElevated = (val, ref) => val > ref;

  const rfElevated = isElevated(sampleValues.rf, 14);
  const antiCCPElevated = isElevated(sampleValues.antiCCP, 20);
  const crpElevated = isElevated(sampleValues.crp, 3.0);
  const esrElevated = isElevated(sampleValues.esr, 20);

  const elevatedCount = [rfElevated, antiCCPElevated, crpElevated, esrElevated].filter(Boolean).length;
  const sampleScore = Math.min(98, Math.round(18 + elevatedCount * 22 + (sampleValues.rf / 4) + (sampleValues.antiCCP / 5)));

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      {/* Primary Top Navigation */}
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white">
        <div className="container-page flex h-16 items-center justify-between">
          <Link to="/" aria-label="ArthroCare AI Clinical Home">
            <Logo subtitle="Clinical Decision Support" />
          </Link>

          <nav className="hidden items-center gap-8 md:flex" aria-label="Primary Navigation">
            <a href="#how-it-works" className="text-sm font-medium text-slate-600 transition-colors hover:text-blue-700">
              How It Works
            </a>
            <a href="#biomarkers" className="text-sm font-medium text-slate-600 transition-colors hover:text-blue-700">
              Biomarkers
            </a>
            <a href="#clinical-approach" className="text-sm font-medium text-slate-600 transition-colors hover:text-blue-700">
              Clinical Approach
            </a>
          </nav>

          <div className="flex items-center gap-3">
            <Link to="/login" className="btn-ghost text-sm">
              Sign in
            </Link>
            <Link to="/register" className="btn-primary text-sm">
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="border-b border-slate-200 bg-white">
        <div className="container-page grid items-center gap-12 py-16 lg:grid-cols-12 lg:py-20">
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-900">
              <ShieldCheck className="h-4 w-4 text-blue-700" />
              Machine Learning Decision-Support System v2.4
            </div>
            
            <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl lg:leading-tight">
              Quantitative serology &amp; machine learning for early rheumatoid arthritis risk assessment.
            </h1>
            
            <p className="text-base leading-relaxed text-slate-600">
              ArthroCare AI interprets serum Rheumatoid Factor (RF), Anti-CCP antibodies, C-Reactive Protein (CRP), and Erythrocyte Sedimentation Rate (ESR) against age- and sex-adjusted clinical reference models to deliver explainable risk stratification.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Link to="/register" className="btn-primary text-sm">
                Start Patient Assessment
                <ArrowRight className="h-4 w-4" />
              </Link>
              <a href="#how-it-works" className="btn-secondary text-sm">
                View Workflow Details
              </a>
            </div>

            {/* Key Clinical Specs Bar */}
            <div className="grid grid-cols-3 gap-6 border-t border-slate-200 pt-6">
              <div>
                <dt className="text-xs font-bold uppercase tracking-widest text-slate-500">Biomarker Suite</dt>
                <dd className="mt-1 text-sm font-bold text-slate-900">RF · Anti-CCP · CRP · ESR</dd>
              </div>
              <div>
                <dt className="text-xs font-bold uppercase tracking-widest text-slate-500">Reference Adjustment</dt>
                <dd className="mt-1 text-sm font-bold text-slate-900">Age &amp; Sex Normalization</dd>
              </div>
              <div>
                <dt className="text-xs font-bold uppercase tracking-widest text-slate-500">Clinical Alignment</dt>
                <dd className="mt-1 text-sm font-bold text-slate-900">ACR / EULAR Criteria</dd>
              </div>
            </div>
          </div>

          {/* Right Column: Live Interactive Assessment Preview */}
          <div className="lg:col-span-5">
            <div className="rounded-lg border border-slate-200 bg-white p-6">
              <div className="flex items-center justify-between border-b border-slate-200 pb-4">
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-widest text-slate-900">Sample Serology Panel</h3>
                  <p className="text-xs text-slate-500">Demographic context: 48-year-old Female</p>
                </div>
                <span className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm font-bold ${
                  sampleScore < 40 ? 'bg-emerald-50 text-emerald-800 border-emerald-200' :
                  sampleScore < 65 ? 'bg-amber-50 text-amber-800 border-amber-200' : 'bg-rose-50 text-rose-800 border-rose-200'
                }`}>
                  {sampleScore < 40 ? 'Low Risk' : sampleScore < 65 ? 'Moderate Risk' : 'Elevated Risk'}
                </span>
              </div>

              {/* Biomarker sliders / toggles for demo */}
              <div className="mt-5 space-y-4">
                <div>
                  <div className="flex items-center justify-between text-sm font-medium">
                    <span className="text-slate-700">Rheumatoid Factor (RF)</span>
                    <span className="font-bold text-slate-900">{sampleValues.rf} IU/mL <span className="text-xs font-normal text-slate-500">(Ref &lt;14)</span></span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="80"
                    value={sampleValues.rf}
                    onChange={(e) => setSampleValues(prev => ({ ...prev, rf: Number(e.target.value) }))}
                    className="mt-2 h-2 w-full cursor-pointer rounded-lg bg-slate-200 accent-blue-700"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between text-sm font-medium">
                    <span className="text-slate-700">Anti-CCP Antibodies</span>
                    <span className="font-bold text-slate-900">{sampleValues.antiCCP} U/mL <span className="text-xs font-normal text-slate-500">(Ref &lt;20)</span></span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="100"
                    value={sampleValues.antiCCP}
                    onChange={(e) => setSampleValues(prev => ({ ...prev, antiCCP: Number(e.target.value) }))}
                    className="mt-2 h-2 w-full cursor-pointer rounded-lg bg-slate-200 accent-blue-700"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between text-sm font-medium">
                    <span className="text-slate-700">C-Reactive Protein (CRP)</span>
                    <span className="font-bold text-slate-900">{sampleValues.crp} mg/L <span className="text-xs font-normal text-slate-500">(Ref &lt;3.0)</span></span>
                  </div>
                  <input
                    type="range"
                    min="0.5"
                    max="15.0"
                    step="0.5"
                    value={sampleValues.crp}
                    onChange={(e) => setSampleValues(prev => ({ ...prev, crp: Number(e.target.value) }))}
                    className="mt-2 h-2 w-full cursor-pointer rounded-lg bg-slate-200 accent-blue-700"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between text-sm font-medium">
                    <span className="text-slate-700">ESR</span>
                    <span className="font-bold text-slate-900">{sampleValues.esr} mm/hr <span className="text-xs font-normal text-slate-500">(Ref &lt;20)</span></span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="50"
                    value={sampleValues.esr}
                    onChange={(e) => setSampleValues(prev => ({ ...prev, esr: Number(e.target.value) }))}
                    className="mt-2 h-2 w-full cursor-pointer rounded-lg bg-slate-200 accent-blue-700"
                  />
                </div>
              </div>

              {/* Sample Risk Result Bar */}
              <div className="mt-6 rounded-lg border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-center justify-between text-sm font-semibold">
                  <span className="flex items-center gap-2 text-slate-700">
                    <Scale className="h-5 w-5 text-blue-700" />
                    Modeled RA Risk Probability
                  </span>
                  <span className="text-2xl font-bold text-blue-900">{sampleScore}%</span>
                </div>
                <div className="mt-3 h-3 w-full overflow-hidden rounded-full bg-slate-200">
                  <div
                    className={`h-full transition-all duration-300 ${
                      sampleScore < 40 ? 'bg-emerald-600' : sampleScore < 65 ? 'bg-amber-500' : 'bg-rose-600'
                    }`}
                    style={{ width: `${sampleScore}%` }}
                  />
                </div>
                <p className="mt-3 text-xs text-slate-600">
                  {elevatedCount === 0 ? 'All 4 biomarker values are within normal baseline thresholds.' : `${elevatedCount} of 4 biomarkers exhibit values exceeding standard reference thresholds.`}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 1: How It Works / Clinical Workflow Pipeline */}
      <section
        id="how-it-works"
        className="border-b border-slate-200 bg-slate-50 py-16 lg:py-20"
      >
        <div className="container-page">
          {/* Header */}
          <div className="max-w-2xl space-y-2 mb-10">
            <p className="eyebrow">Clinical Workflow Pipeline</p>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              Structured Three-Stage Diagnostic Workflow
            </h2>
            <p className="text-base leading-relaxed text-slate-600">
              Designed for seamless integration into outpatient rheumatology and primary care workflows without administrative friction.
            </p>
          </div>

          {/* Process Timeline Flow Grid */}
          <div className="grid gap-6 md:grid-cols-3 mb-10">
            {workflowSteps.map((step, idx) => (
              <div key={step.stage} className="relative flex flex-col justify-between rounded-lg border border-slate-200 bg-white p-6 space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-50 px-2 text-xs font-bold text-blue-800 border border-blue-200">
                      {step.stage}
                    </span>
                    <span className="text-xs font-bold text-slate-400">Step 0{idx + 1} of 03</span>
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">{step.title}</h3>
                    <p className="text-xs font-bold text-blue-700 mt-1">{step.subtitle}</p>
                  </div>
                  <p className="text-sm leading-relaxed text-slate-600">{step.description}</p>
                </div>

                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs font-medium text-slate-700 flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-blue-700 shrink-0" />
                  <span>{step.deliverable}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Workflow Performance & Integration Specs Bar */}
          <div className="rounded-lg border border-slate-200 bg-white p-6 grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-800 border border-blue-200 shrink-0">
                <Clock className="h-5 w-5" />
              </div>
              <div>
                <p className="font-bold text-slate-900">Rapid Requisition</p>
                <p className="text-xs text-slate-500">Average panel execution &lt; 2 minutes</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-800 border border-blue-200 shrink-0">
                <Zap className="h-5 w-5" />
              </div>
              <div>
                <p className="font-bold text-slate-900">Real-Time Elevation Flags</p>
                <p className="text-xs text-slate-500">Automated RF, CCP, CRP &amp; ESR highlights</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-800 border border-blue-200 shrink-0">
                <BarChart3 className="h-5 w-5" />
              </div>
              <div>
                <p className="font-bold text-slate-900">Longitudinal Ready</p>
                <p className="text-xs text-slate-500">Serial trajectory comparison across visits</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2: Biomarkers Section */}
      <section id="biomarkers" className="border-b border-slate-200 bg-white py-16 lg:py-20">
        <div className="container-page space-y-8">
          <div className="max-w-2xl space-y-2">
            <p className="eyebrow">Serological Panel &amp; Reactant Suite</p>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              Four Quantitative Biomarkers across Dual Pathological Axes
            </h2>
            <p className="text-base leading-relaxed text-slate-600">
              ArthroCare AI categorizes biomarker inputs into disease-specific autoantibodies and acute-phase inflammatory reactants to distinguish autoimmune etiology from non-specific systemic activity.
            </p>
          </div>

          {/* Structured Biomarker Grid Layout */}
          <div className="grid gap-6 md:grid-cols-2">
            {biomarkerSuite.map((marker) => (
              <div
                key={marker.id}
                className={`rounded-lg border border-slate-200 bg-white p-6 space-y-4 border-l-4 ${marker.borderAccent}`}
              >
                <div className="flex flex-wrap items-start justify-between gap-2 border-b border-slate-100 pb-3">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-widest text-slate-500">{marker.category}</span>
                    <h3 className="text-sm font-bold text-slate-900 mt-1">{marker.name}</h3>
                  </div>
                  <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-mono font-bold text-slate-900">
                    Ref: {marker.reference}
                  </div>
                </div>

                <div className="space-y-3 text-sm">
                  <div>
                    <dt className="text-xs font-bold uppercase tracking-widest text-slate-500">Biological Mechanism / Target</dt>
                    <dd className="mt-1 text-slate-700 leading-relaxed font-medium">{marker.mechanism}</dd>
                  </div>
                  <div>
                    <dt className="text-xs font-bold uppercase tracking-widest text-slate-500">Clinical Utility &amp; Sensitivity</dt>
                    <dd className="mt-1 text-slate-700 leading-relaxed font-medium">{marker.clinicalSignificance}</dd>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Biomarker Dual-Signal Advantage Banner */}
          <div className="rounded-lg border border-blue-200 bg-blue-50/60 p-5 text-sm font-medium text-slate-800 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <ShieldCheck className="h-5 w-5 text-blue-800 shrink-0" />
              <span><strong className="text-blue-950">Dual-Signal Advantage:</strong> Combining autoantibody specificity (Anti-CCP / RF) with acute-phase inflammatory sensitivity (CRP / ESR) maximizes diagnostic accuracy while minimizing false-positive serology classifications.</span>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3: Clinical Approach Section */}
      <section id="clinical-approach" className="border-b border-slate-200 bg-slate-50 py-16 lg:py-20">
        <div className="container-page space-y-8">
          <div className="max-w-2xl space-y-2">
            <p className="eyebrow">Evidence-Based Clinical Engine</p>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              How ArthroCare AI Delivers Clinically Actionable Decision Support
            </h2>
            <p className="text-base leading-relaxed text-slate-600">
              Rheumatoid arthritis diagnosis requires correlating multiple subtle lab signals against patient-specific baselines. ArthroCare AI unifies autoantibody serology, acute-phase reactants, and demographic calibration into a single explainable framework.
            </p>
          </div>

          {/* Asymmetric Composition: Left Diagram Card + Right 3 Pillar Breakdown */}
          <div className="grid gap-6 lg:grid-cols-12 lg:items-start">
            {/* Left Column: Multivariable Diagnostic Triad Diagram Card */}
            <div className="lg:col-span-5 rounded-lg border border-slate-200 bg-white p-6 space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-800 border border-blue-200">
                  <BrainCircuit className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-widest text-slate-900">Multivariable Decision Engine</h3>
                  <p className="text-xs text-slate-500">Unified 3-input synthesis model</p>
                </div>
              </div>

              <div className="space-y-3 text-sm">
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Dna className="h-4 w-4 text-blue-800" />
                    <div>
                      <p className="font-bold text-slate-900">1. Serological Precision</p>
                      <p className="text-xs text-slate-500">RF + Anti-CCP Autoantibody Axis</p>
                    </div>
                  </div>
                  <span className="font-mono text-xs font-bold text-blue-800 bg-blue-50 px-2 py-1 rounded border border-blue-200">Autoimmune</span>
                </div>

                <div className="flex justify-center">
                  <ArrowDown className="h-4 w-4 text-slate-400" />
                </div>

                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <UserCheck className="h-4 w-4 text-blue-800" />
                    <div>
                      <p className="font-bold text-slate-900">2. Demographic Normalization</p>
                      <p className="text-xs text-slate-500">Age &amp; Sex Adjusted Curves</p>
                    </div>
                  </div>
                  <span className="font-mono text-xs font-bold text-blue-800 bg-blue-50 px-2 py-1 rounded border border-blue-200">Calibration</span>
                </div>

                <div className="flex justify-center">
                  <ArrowDown className="h-4 w-4 text-slate-400" />
                </div>

                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Activity className="h-4 w-4 text-amber-700" />
                    <div>
                      <p className="font-bold text-slate-900">3. Inflammatory Reactants</p>
                      <p className="text-xs text-slate-500">CRP + ESR Inflammatory Load</p>
                    </div>
                  </div>
                  <span className="font-mono text-xs font-bold text-amber-800 bg-amber-50 px-2 py-1 rounded border border-amber-200">Acute Phase</span>
                </div>
              </div>

              <div className="rounded-lg border border-blue-200 bg-blue-50/70 p-3 text-center space-y-1">
                <p className="text-xs font-bold uppercase tracking-widest text-blue-950">Output Stratification</p>
                <p className="text-sm font-bold text-blue-900">Age- &amp; Sex-Adjusted RA Risk Profile &amp; Protocol</p>
              </div>
            </div>

            {/* Right Column: 3 Connected Core Concepts */}
            <div className="lg:col-span-7 space-y-4">
              <div className="rounded-lg border border-slate-200 bg-white p-5 space-y-3">
                <div className="flex items-center gap-2">
                  <FlaskConical className="h-4 w-4 text-blue-800" />
                  <h3 className="text-sm font-bold uppercase tracking-widest text-slate-900">1. Serological Precision &amp; Dual-Signal Validation</h3>
                </div>
                <p className="text-sm leading-relaxed text-slate-600">
                  Combines high-sensitivity Rheumatoid Factor (RF) with high-specificity Anti-CCP antibodies. This dual-signal approach minimizes false-positive serology classifications while identifying early erosive RA risks that single-marker tests miss.
                </p>
              </div>

              <div className="rounded-lg border border-slate-200 bg-white p-5 space-y-3">
                <div className="flex items-center gap-2">
                  <Sliders className="h-4 w-4 text-blue-800" />
                  <h3 className="text-sm font-bold uppercase tracking-widest text-slate-900">2. Age &amp; Sex Demographic Normalization</h3>
                </div>
                <p className="text-sm leading-relaxed text-slate-600">
                  Inflammatory reactants (particularly ESR and CRP) naturally vary with patient age and biological sex. ArthroCare adjusts raw laboratory values against demographic control baselines rather than static single cut-offs, preventing age-related misclassification.
                </p>
              </div>

              <div className="rounded-lg border border-slate-200 bg-white p-5 space-y-3">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-blue-800" />
                  <h3 className="text-sm font-bold uppercase tracking-widest text-slate-900">3. Actionable Clinical Guidance &amp; Serial Monitoring</h3>
                </div>
                <p className="text-sm leading-relaxed text-slate-600">
                  Outputs transparent biomarker contribution weights, serial progression trend tracking across historical lab panels, and evidence-based dietary, physical therapy, and joint preservation directives aligned with ACR/EULAR guidelines.
                </p>
              </div>
            </div>
          </div>

          {/* Clinical Alignment Scope Note */}
          <div className="rounded-lg border border-slate-200 bg-white p-5 flex items-start gap-3">
            <ShieldCheck className="h-5 w-5 text-blue-800 shrink-0 mt-0.5" />
            <p className="text-sm leading-relaxed text-slate-600">
              <strong className="text-slate-900">ACR / EULAR Clinical Alignment Note:</strong> ArthroCare AI is an assistive decision-support platform designed to complement clinical judgment and formal rheumatological evaluation. It provides risk probability stratification and monitoring protocols for healthcare professionals and patients.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="border-b border-slate-200 bg-white py-16 lg:py-20">
        <div className="container-page flex flex-col items-center gap-6 text-center">
          <h2 className="max-w-xl text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Ready to Evaluate Patient Serology &amp; Risk Trajectory?
          </h2>
          <p className="max-w-lg text-base leading-relaxed text-slate-600">
            Access the patient workspace to submit serology panels, compute age-adjusted risk profiles, and generate evidence-based protocols.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row pt-2">
            <Link to="/register" className="btn-primary text-sm">
              Create Patient Account
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link to="/login" className="btn-secondary text-sm">
              Sign In to Portal
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-12">
        <div className="container-page flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Logo dark subtitle="Clinical decision support" />
            <p className="mt-3 text-sm text-slate-500 max-w-md">
              ArthroCare AI is an assistive decision-support tool. It does not replace independent clinical judgment or formal diagnostic evaluation.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-6 text-sm font-medium text-slate-300">
            <Link to="/login" className="hover:text-white transition-colors">Sign in</Link>
            <Link to="/register" className="hover:text-white transition-colors">Register Workspace</Link>
            <a href="#how-it-works" className="hover:text-white transition-colors">How It Works</a>
            <a href="#biomarkers" className="hover:text-white transition-colors">Biomarkers</a>
            <a href="#clinical-approach" className="hover:text-white transition-colors">Clinical Approach</a>
          </div>
        </div>

        <div className="container-page mt-8 border-t border-slate-800 pt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between text-xs text-slate-500">
          <p>© {new Date().getFullYear()} ArthroCare AI Healthcare Suite. All rights reserved.</p>
          <p>System Version: 2.4.0 · ACR/EULAR Aligned</p>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;