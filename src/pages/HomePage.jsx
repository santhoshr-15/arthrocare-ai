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
  Zap
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
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* Primary Top Navigation */}
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur-xs">
        <div className="container-page flex h-16 items-center justify-between">
          <Link to="/" aria-label="ArthroCare AI Clinical Home">
            <Logo subtitle="Clinical Decision Support" />
          </Link>

          <nav className="hidden items-center gap-7 md:flex" aria-label="Primary Navigation">
            <a href="#how-it-works" className="text-xs font-semibold text-slate-600 transition-colors hover:text-teal-800">
              How It Works
            </a>
            <a href="#biomarkers" className="text-xs font-semibold text-slate-600 transition-colors hover:text-teal-800">
              Biomarkers
            </a>
            <a href="#clinical-approach" className="text-xs font-semibold text-slate-600 transition-colors hover:text-teal-800">
              Clinical Approach
            </a>
          </nav>

          <div className="flex items-center gap-2.5">
            <Link to="/login" className="btn-ghost text-xs">
              Sign in
            </Link>
            <Link to="/register" className="btn-primary text-xs">
              Access workspace
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="border-b border-slate-200 bg-white">
        <div className="container-page grid items-center gap-10 py-12 lg:grid-cols-12 lg:py-16">
          <div className="lg:col-span-7 space-y-4">
            <div className="inline-flex items-center gap-2 rounded-md border border-teal-200 bg-teal-50 px-2.5 py-1 text-xs font-semibold text-teal-900">
              <ShieldCheck className="h-3.5 w-3.5 text-teal-700" />
              Machine Learning Decision-Support System v2.4
            </div>
            
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl lg:leading-tight">
              Quantitative serology &amp; machine learning for early rheumatoid arthritis risk assessment.
            </h1>
            
            <p className="text-xs sm:text-sm leading-relaxed text-slate-600">
              ArthroCare AI interprets serum Rheumatoid Factor (RF), Anti-CCP antibodies, C-Reactive Protein (CRP), and Erythrocyte Sedimentation Rate (ESR) against age- and sex-adjusted clinical reference models to deliver explainable risk stratification.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link to="/register" className="btn-primary text-xs">
                Start Patient Assessment
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
              <a href="#how-it-works" className="btn-secondary text-xs">
                View Workflow Details
              </a>
            </div>

            {/* Key Clinical Specs Bar */}
            <div className="grid grid-cols-3 gap-4 border-t border-slate-200 pt-5">
              <div>
                <dt className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Biomarker Suite</dt>
                <dd className="mt-0.5 text-xs font-bold text-slate-900">RF · Anti-CCP · CRP · ESR</dd>
              </div>
              <div>
                <dt className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Reference Adjustment</dt>
                <dd className="mt-0.5 text-xs font-bold text-slate-900">Age &amp; Sex Normalization</dd>
              </div>
              <div>
                <dt className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Clinical Alignment</dt>
                <dd className="mt-0.5 text-xs font-bold text-slate-900">ACR / EULAR Criteria</dd>
              </div>
            </div>
          </div>

          {/* Right Column: Live Interactive Assessment Preview */}
          <div className="lg:col-span-5">
            <div className="rounded-lg border border-slate-200 bg-slate-50/50 p-5 shadow-2xs">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">Sample Serology Panel</h3>
                  <p className="text-[11px] font-medium text-slate-500">Demographic context: 48-year-old Female</p>
                </div>
                <span className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-xs font-bold ${
                  sampleScore < 40 ? 'bg-emerald-50 text-emerald-800 border-emerald-200' :
                  sampleScore < 65 ? 'bg-amber-50 text-amber-800 border-amber-200' : 'bg-rose-50 text-rose-800 border-rose-200'
                }`}>
                  {sampleScore < 40 ? 'Low Risk' : sampleScore < 65 ? 'Moderate Risk' : 'Elevated Risk'}
                </span>
              </div>

              {/* Biomarker sliders / toggles for demo */}
              <div className="mt-4 space-y-3.5">
                <div>
                  <div className="flex items-center justify-between text-xs font-medium">
                    <span className="text-slate-700">Rheumatoid Factor (RF)</span>
                    <span className="font-bold text-slate-900">{sampleValues.rf} IU/mL <span className="text-[10px] font-normal text-slate-500">(Ref &lt;14)</span></span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="80"
                    value={sampleValues.rf}
                    onChange={(e) => setSampleValues(prev => ({ ...prev, rf: Number(e.target.value) }))}
                    className="mt-1 h-1.5 w-full cursor-pointer rounded-lg bg-slate-200 accent-teal-700"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between text-xs font-medium">
                    <span className="text-slate-700">Anti-CCP Antibodies</span>
                    <span className="font-bold text-slate-900">{sampleValues.antiCCP} U/mL <span className="text-[10px] font-normal text-slate-500">(Ref &lt;20)</span></span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="100"
                    value={sampleValues.antiCCP}
                    onChange={(e) => setSampleValues(prev => ({ ...prev, antiCCP: Number(e.target.value) }))}
                    className="mt-1 h-1.5 w-full cursor-pointer rounded-lg bg-slate-200 accent-teal-700"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between text-xs font-medium">
                    <span className="text-slate-700">C-Reactive Protein (CRP)</span>
                    <span className="font-bold text-slate-900">{sampleValues.crp} mg/L <span className="text-[10px] font-normal text-slate-500">(Ref &lt;3.0)</span></span>
                  </div>
                  <input
                    type="range"
                    min="0.5"
                    max="15.0"
                    step="0.5"
                    value={sampleValues.crp}
                    onChange={(e) => setSampleValues(prev => ({ ...prev, crp: Number(e.target.value) }))}
                    className="mt-1 h-1.5 w-full cursor-pointer rounded-lg bg-slate-200 accent-teal-700"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between text-xs font-medium">
                    <span className="text-slate-700">ESR</span>
                    <span className="font-bold text-slate-900">{sampleValues.esr} mm/hr <span className="text-[10px] font-normal text-slate-500">(Ref &lt;20)</span></span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="50"
                    value={sampleValues.esr}
                    onChange={(e) => setSampleValues(prev => ({ ...prev, esr: Number(e.target.value) }))}
                    className="mt-1 h-1.5 w-full cursor-pointer rounded-lg bg-slate-200 accent-teal-700"
                  />
                </div>
              </div>

              {/* Sample Risk Result Bar */}
              <div className="mt-5 rounded-md border border-slate-200 bg-white p-3.5">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="flex items-center gap-1.5 text-slate-700">
                    <Scale className="h-4 w-4 text-teal-700" />
                    Modeled RA Risk Probability
                  </span>
                  <span className="text-base font-bold text-teal-800">{sampleScore}%</span>
                </div>
                <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-100">
                  <div
                    className={`h-full transition-all duration-300 ${
                      sampleScore < 40 ? 'bg-emerald-600' : sampleScore < 65 ? 'bg-amber-500' : 'bg-rose-600'
                    }`}
                    style={{ width: `${sampleScore}%` }}
                  />
                </div>
                <p className="mt-2 text-[11px] text-slate-500">
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
        className="scroll-mt-16 border-b border-slate-200 bg-slate-50/70 flex flex-col"
        style={{ minHeight: 'calc(100vh - 4rem)' }}
      >
        <div className="container-page flex flex-col justify-between flex-1 pt-6 pb-10 lg:pt-8 lg:pb-14">
          {/* Header */}
          <div className="max-w-2xl space-y-1 mb-6 lg:mb-8">
            <p className="eyebrow">Clinical Workflow Pipeline</p>
            <h2 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
              Structured Three-Stage Diagnostic Workflow
            </h2>
            <p className="text-xs sm:text-sm leading-relaxed text-slate-600">
              Designed for seamless integration into outpatient rheumatology and primary care workflows without administrative friction.
            </p>
          </div>

          {/* Process Timeline Flow Grid — grows to fill available space */}
          <div className="grid gap-5 md:grid-cols-3 flex-1 mb-6 lg:mb-8">
            {workflowSteps.map((step, idx) => (
              <div key={step.stage} className="relative flex flex-col justify-between rounded-lg border border-slate-200 bg-white p-4.5 shadow-2xs space-y-3.5">
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                    <span className="flex h-5.5 items-center justify-center rounded-md bg-teal-50 px-2 text-[11px] font-bold text-teal-800 border border-teal-200">
                      {step.stage}
                    </span>
                    <span className="text-[11px] font-bold text-slate-400">Step 0{idx + 1} of 03</span>
                  </div>
                  <div>
                    <h3 className="text-xs sm:text-sm font-bold text-slate-900">{step.title}</h3>
                    <p className="text-[11px] font-bold text-teal-800 mt-0.5">{step.subtitle}</p>
                  </div>
                  <p className="text-xs leading-relaxed text-slate-600">{step.description}</p>
                </div>

                <div className="rounded-md border border-slate-200 bg-slate-50 p-2 text-[11px] font-medium text-slate-700 flex items-center gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-teal-700 shrink-0" />
                  <span>{step.deliverable}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Workflow Performance & Integration Specs Bar — anchored to bottom */}
          <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-2xs grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-teal-50 text-teal-800 border border-teal-200 shrink-0">
                <Clock className="h-4 w-4" />
              </div>
              <div>
                <p className="font-bold text-slate-900">Rapid Requisition</p>
                <p className="text-[11px] text-slate-500">Average panel execution &lt; 2 minutes</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-teal-50 text-teal-800 border border-teal-200 shrink-0">
                <Zap className="h-4 w-4" />
              </div>
              <div>
                <p className="font-bold text-slate-900">Real-Time Elevation Flags</p>
                <p className="text-[11px] text-slate-500">Automated RF, CCP, CRP &amp; ESR highlights</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-teal-50 text-teal-800 border border-teal-200 shrink-0">
                <BarChart3 className="h-4 w-4" />
              </div>
              <div>
                <p className="font-bold text-slate-900">Longitudinal Ready</p>
                <p className="text-[11px] text-slate-500">Serial trajectory comparison across visits</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2: Biomarkers Section (Structured Grid, Exact Scroll Offset) */}
      <section id="biomarkers" className="scroll-mt-16 border-b border-slate-200 bg-white pt-6 pb-16 lg:pt-8 lg:pb-24">
        <div className="container-page space-y-6 lg:space-y-8">
          <div className="max-w-2xl space-y-1">
            <p className="eyebrow">Serological Panel &amp; Reactant Suite</p>
            <h2 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
              Four Quantitative Biomarkers across Dual Pathological Axes
            </h2>
            <p className="text-xs sm:text-sm leading-relaxed text-slate-600">
              ArthroCare AI categorizes biomarker inputs into disease-specific autoantibodies and acute-phase inflammatory reactants to distinguish autoimmune etiology from non-specific systemic activity.
            </p>
          </div>

          {/* Structured Biomarker Grid Layout */}
          <div className="grid gap-5 md:grid-cols-2">
            {biomarkerSuite.map((marker) => (
              <div
                key={marker.id}
                className={`rounded-lg border border-slate-200 bg-white p-4.5 shadow-2xs space-y-3 border-l-4 ${marker.borderAccent}`}
              >
                <div className="flex flex-wrap items-start justify-between gap-2 border-b border-slate-100 pb-2.5">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">{marker.category}</span>
                    <h3 className="text-xs sm:text-sm font-bold text-slate-900">{marker.name}</h3>
                  </div>
                  <div className="rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5 text-xs font-mono font-bold text-slate-900">
                    Ref: {marker.reference}
                  </div>
                </div>

                <div className="space-y-2 text-xs">
                  <div>
                    <dt className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Biological Mechanism / Target</dt>
                    <dd className="mt-0.5 text-slate-700 leading-relaxed font-medium">{marker.mechanism}</dd>
                  </div>
                  <div>
                    <dt className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Clinical Utility &amp; Sensitivity</dt>
                    <dd className="mt-0.5 text-slate-700 leading-relaxed font-medium">{marker.clinicalSignificance}</dd>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Biomarker Dual-Signal Advantage Banner */}
          <div className="rounded-lg border border-teal-200 bg-teal-50/60 p-4 text-xs font-medium text-slate-800 flex items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <ShieldCheck className="h-4 w-4 text-teal-800 shrink-0" />
              <span><strong className="text-teal-950">Dual-Signal Advantage:</strong> Combining autoantibody specificity (Anti-CCP / RF) with acute-phase inflammatory sensitivity (CRP / ESR) maximizes diagnostic accuracy while minimizing false-positive serology classifications.</span>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3: Clinical Approach Section (Polished Decision Support Composition) */}
      <section id="clinical-approach" className="scroll-mt-16 border-b border-slate-200 bg-slate-50/70 pt-6 pb-16 lg:pt-8 lg:pb-24">
        <div className="container-page space-y-6 lg:space-y-8">
          <div className="max-w-2xl space-y-1">
            <p className="eyebrow">Evidence-Based Clinical Engine</p>
            <h2 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
              How ArthroCare AI Delivers Clinically Actionable Decision Support
            </h2>
            <p className="text-xs sm:text-sm leading-relaxed text-slate-600">
              Rheumatoid arthritis diagnosis requires correlating multiple subtle lab signals against patient-specific baselines. ArthroCare AI unifies autoantibody serology, acute-phase reactants, and demographic calibration into a single explainable framework.
            </p>
          </div>

          {/* Asymmetric Composition: Left Diagram Card + Right 3 Pillar Breakdown */}
          <div className="grid gap-5 lg:grid-cols-12 lg:items-start">
            {/* Left Column: Multivariable Diagnostic Triad Diagram Card */}
            <div className="lg:col-span-5 rounded-lg border border-slate-200 bg-white p-4.5 shadow-2xs space-y-3.5">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-2.5">
                <div className="flex h-6.5 w-6.5 items-center justify-center rounded-md bg-teal-50 text-teal-800 border border-teal-200">
                  <BrainCircuit className="h-3.5 w-3.5" />
                </div>
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">Multivariable Decision Engine</h3>
                  <p className="text-[11px] text-slate-500">Unified 3-input synthesis model</p>
                </div>
              </div>

              <div className="space-y-2 text-xs">
                <div className="rounded-md border border-slate-200 bg-slate-50 p-2.5 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Dna className="h-3.5 w-3.5 text-teal-800" />
                    <div>
                      <p className="font-bold text-slate-900">1. Serological Precision</p>
                      <p className="text-[11px] text-slate-500">RF + Anti-CCP Autoantibody Axis</p>
                    </div>
                  </div>
                  <span className="font-mono text-[10px] font-bold text-teal-800 bg-teal-50 px-1.5 py-0.5 rounded border border-teal-200">Autoimmune</span>
                </div>

                <div className="flex justify-center">
                  <ArrowDown className="h-3 w-3 text-slate-400" />
                </div>

                <div className="rounded-md border border-slate-200 bg-slate-50 p-2.5 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <UserCheck className="h-3.5 w-3.5 text-teal-800" />
                    <div>
                      <p className="font-bold text-slate-900">2. Demographic Normalization</p>
                      <p className="text-[11px] text-slate-500">Age &amp; Sex Adjusted Curves</p>
                    </div>
                  </div>
                  <span className="font-mono text-[10px] font-bold text-teal-800 bg-teal-50 px-1.5 py-0.5 rounded border border-teal-200">Calibration</span>
                </div>

                <div className="flex justify-center">
                  <ArrowDown className="h-3 w-3 text-slate-400" />
                </div>

                <div className="rounded-md border border-slate-200 bg-slate-50 p-2.5 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Activity className="h-3.5 w-3.5 text-amber-700" />
                    <div>
                      <p className="font-bold text-slate-900">3. Inflammatory Reactants</p>
                      <p className="text-[11px] text-slate-500">CRP + ESR Inflammatory Load</p>
                    </div>
                  </div>
                  <span className="font-mono text-[10px] font-bold text-amber-800 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">Acute Phase</span>
                </div>
              </div>

              <div className="rounded-md border border-teal-200 bg-teal-50/70 p-2.5 text-center space-y-0.5">
                <p className="text-[10px] font-bold uppercase tracking-wider text-teal-950">Output Stratification</p>
                <p className="text-xs font-bold text-teal-900">Age- &amp; Sex-Adjusted RA Risk Profile &amp; Protocol</p>
              </div>
            </div>

            {/* Right Column: 3 Connected Core Concepts */}
            <div className="lg:col-span-7 space-y-3.5">
              <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-2xs space-y-2">
                <div className="flex items-center gap-2">
                  <FlaskConical className="h-3.5 w-3.5 text-teal-800" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">1. Serological Precision &amp; Dual-Signal Validation</h3>
                </div>
                <p className="text-xs leading-relaxed text-slate-600">
                  Combines high-sensitivity Rheumatoid Factor (RF) with high-specificity Anti-CCP antibodies. This dual-signal approach minimizes false-positive serology classifications while identifying early erosive RA risks that single-marker tests miss.
                </p>
              </div>

              <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-2xs space-y-2">
                <div className="flex items-center gap-2">
                  <Sliders className="h-3.5 w-3.5 text-teal-800" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">2. Age &amp; Sex Demographic Normalization</h3>
                </div>
                <p className="text-xs leading-relaxed text-slate-600">
                  Inflammatory reactants (particularly ESR and CRP) naturally vary with patient age and biological sex. ArthroCare adjusts raw laboratory values against demographic control baselines rather than static single cut-offs, preventing age-related misclassification.
                </p>
              </div>

              <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-2xs space-y-2">
                <div className="flex items-center gap-2">
                  <FileText className="h-3.5 w-3.5 text-teal-800" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">3. Actionable Clinical Guidance &amp; Serial Monitoring</h3>
                </div>
                <p className="text-xs leading-relaxed text-slate-600">
                  Outputs transparent biomarker contribution weights, serial progression trend tracking across historical lab panels, and evidence-based dietary, physical therapy, and joint preservation directives aligned with ACR/EULAR guidelines.
                </p>
              </div>
            </div>
          </div>

          {/* Clinical Alignment Scope Note */}
          <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-2xs flex items-start gap-3">
            <ShieldCheck className="h-4 w-4 text-teal-800 shrink-0 mt-0.5" />
            <p className="text-xs leading-relaxed text-slate-600">
              <strong className="text-slate-900">ACR / EULAR Clinical Alignment Note:</strong> ArthroCare AI is an assistive decision-support platform designed to complement clinical judgment and formal rheumatological evaluation. It provides risk probability stratification and monitoring protocols for healthcare professionals and patients.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="border-b border-slate-200 bg-white py-12 lg:py-16">
        <div className="container-page flex flex-col items-center gap-5 text-center">
          <h2 className="max-w-xl text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
            Ready to Evaluate Patient Serology &amp; Risk Trajectory?
          </h2>
          <p className="max-w-lg text-xs sm:text-sm leading-relaxed text-slate-600">
            Access the patient workspace to submit serology panels, compute age-adjusted risk profiles, and generate evidence-based protocols.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row pt-2">
            <Link to="/register" className="btn-primary text-xs">
              Create Patient Account
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
            <Link to="/login" className="btn-secondary text-xs">
              Sign In to Portal
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-10">
        <div className="container-page flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Logo dark subtitle="Clinical decision support" />
            <p className="mt-2 text-xs text-slate-500 max-w-md">
              ArthroCare AI is an assistive decision-support tool. It does not replace independent clinical judgment or formal diagnostic evaluation.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-6 text-xs font-medium text-slate-300">
            <Link to="/login" className="hover:text-white transition-colors">Sign in</Link>
            <Link to="/register" className="hover:text-white transition-colors">Register Workspace</Link>
            <a href="#how-it-works" className="hover:text-white transition-colors">How It Works</a>
            <a href="#biomarkers" className="hover:text-white transition-colors">Biomarkers</a>
            <a href="#clinical-approach" className="hover:text-white transition-colors">Clinical Approach</a>
          </div>
        </div>

        <div className="container-page mt-8 border-t border-slate-800 pt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between text-[11px] text-slate-500">
          <p>© {new Date().getFullYear()} ArthroCare AI Healthcare Suite. All rights reserved.</p>
          <p>System Version: 2.4.0 · ACR/EULAR Aligned</p>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;