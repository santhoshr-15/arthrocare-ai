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
  Activity,
  UserCheck,
  BarChart3,
  Dna,
  Sliders,
  ArrowDown,
  Clock,
  Zap,
  Stethoscope,
  LockKeyhole,
  Sparkles,
  TrendingUp,
  Users,
  HeartPulse
} from 'lucide-react';
import Logo from '../components/ui/Logo';

const biomarkerSuite = [
  {
    id: 'rf',
    name: 'Rheumatoid Factor (RF)',
    category: 'Autoantibody Serology',
    reference: '< 14.0 IU/mL',
    mechanism: 'Autoantibody directed against the Fc region of human Immunoglobulin G (IgG).',
    clinicalSignificance: 'Identified in 70–80% of established RA cases. High titers correlate with extra-articular manifestations and disease severity.',
    axis: 'serology'
  },
  {
    id: 'anticcp',
    name: 'Anti-CCP Antibodies',
    category: 'Autoantibody Serology',
    reference: '< 20.0 U/mL',
    mechanism: 'Autoantibodies highly specific to cyclic citrullinated peptide (CCP) antigens.',
    clinicalSignificance: 'Highest single-biomarker diagnostic specificity (~96%) for early RA. Strong predictor of progressive erosive joint damage.',
    axis: 'serology'
  },
  {
    id: 'crp',
    name: 'C-Reactive Protein (CRP)',
    category: 'Acute-Phase Reactant',
    reference: '< 3.0 mg/L',
    mechanism: 'Hepatic acute-phase reactant synthesized in response to IL-6 cytokine stimulation.',
    clinicalSignificance: 'Quantitative real-time indicator of active systemic joint inflammation. Rapidly responsive to therapy.',
    axis: 'reactant'
  },
  {
    id: 'esr',
    name: 'Erythrocyte Sedimentation Rate (ESR)',
    category: 'Acute-Phase Reactant',
    reference: '0–20 mm/hr (F) · 0–15 mm/hr (M)',
    mechanism: 'Settling velocity of red blood cells influenced by plasma fibrinogen concentrations.',
    clinicalSignificance: 'Tracks chronic systemic inflammatory burden over time, calibrated to age- and sex-adjusted reference models.',
    axis: 'reactant'
  }
];

const workflowSteps = [
  {
    stage: '01',
    title: 'Demographic Baseline',
    description: 'Record patient age, biological sex, lifestyle factors, and clinical history to establish personalized reference models.',
    deliverable: 'Baseline calibrated'
  },
  {
    stage: '02',
    title: 'Serology Panel Entry',
    description: 'Input quantitative laboratory measurements for RF, Anti-CCP, CRP, and ESR with real-time threshold elevation flags.',
    deliverable: 'Panel normalized'
  },
  {
    stage: '03',
    title: 'ML Risk Analysis',
    description: 'Compute age- and sex-adjusted RA risk probability, biomarker contribution weights, and targeted guidance protocols.',
    deliverable: 'Report generated'
  }
];

const HomePage = () => {
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

  const riskBadge =
    sampleScore < 40
      ? { label: 'Low Risk', cls: 'bg-emerald-50 text-emerald-700 ring-emerald-200' }
      : sampleScore < 65
        ? { label: 'Moderate Risk', cls: 'bg-amber-50 text-amber-700 ring-amber-200' }
        : { label: 'Elevated Risk', cls: 'bg-rose-50 text-rose-700 ring-rose-200' };

  const meterColor =
    sampleScore < 40 ? 'bg-emerald-500' : sampleScore < 65 ? 'bg-amber-500' : 'bg-rose-500';

  const sliders = [
    { key: 'rf', name: 'Rheumatoid Factor (RF)', unit: 'IU/mL', ref: 14, refText: 'Ref <14', min: 5, max: 80, value: sampleValues.rf, elevated: rfElevated },
    { key: 'antiCCP', name: 'Anti-CCP Antibodies', unit: 'U/mL', ref: 20, refText: 'Ref <20', min: 5, max: 100, value: sampleValues.antiCCP, elevated: antiCCPElevated },
    { key: 'crp', name: 'C-Reactive Protein (CRP)', unit: 'mg/L', ref: 3.0, refText: 'Ref <3.0', min: 0.5, max: 15, value: sampleValues.crp, elevated: crpElevated },
    { key: 'esr', name: 'ESR', unit: 'mm/hr', ref: 20, refText: 'Ref <20', min: 5, max: 50, value: sampleValues.esr, elevated: esrElevated }
  ];

  return (
    <div className="min-h-screen bg-[#f4f8fb] text-slate-900">
      {/* Top navigation */}
      <header className="sticky top-0 z-40 border-b border-slate-100/80 bg-white/80 backdrop-blur-xl">
        <div className="container-page flex h-[72px] items-center justify-between">
          <Link to="/" aria-label="ArthroCare AI — Clinical Home">
            <Logo subtitle="Clinical Decision Support" />
          </Link>

          <nav className="hidden items-center gap-1 md:flex" aria-label="Primary Navigation">
            <a href="#how-it-works" className="rounded-lg px-3.5 py-2 text-sm font-medium text-slate-600 transition-all hover:bg-primary-50 hover:text-primary-700">
              Workflow
            </a>
            <a href="#biomarkers" className="rounded-lg px-3.5 py-2 text-sm font-medium text-slate-600 transition-all hover:bg-primary-50 hover:text-primary-700">
              Biomarkers
            </a>
            <a href="#clinical-approach" className="rounded-lg px-3.5 py-2 text-sm font-medium text-slate-600 transition-all hover:bg-primary-50 hover:text-primary-700">
              Clinical Approach
            </a>
          </nav>

          <div className="flex items-center gap-2.5">
            <Link to="/login" className="btn-ghost text-sm">
              Sign in
            </Link>
            <Link to="/register" className="btn-primary text-sm">
              Get Started
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden bg-soft-hero">
        {/* Decorative blobs */}
        <div className="pointer-events-none absolute -top-24 -right-24 h-96 w-96 rounded-full bg-primary-200/30 blur-3xl" aria-hidden="true" />
        <div className="pointer-events-none absolute -bottom-32 -left-32 h-80 w-80 rounded-full bg-sky-200/30 blur-3xl" aria-hidden="true" />

        <div className="container-page relative grid items-center gap-12 py-16 lg:grid-cols-12 lg:py-20">
          <div className="lg:col-span-7">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary-200/60 bg-white/70 px-4 py-1.5 text-xs font-semibold text-primary-700 shadow-sm backdrop-blur-sm">
              <Sparkles className="h-3.5 w-3.5 text-primary-500" aria-hidden="true" />
              AI-Powered Clinical Decision Support
            </div>

            <h1 className="mt-5 text-4xl font-extrabold leading-[1.1] tracking-tight text-slate-900 sm:text-5xl lg:text-[52px]">
              Smarter Risk Detection for{' '}
              <span className="gradient-text">Rheumatoid Arthritis</span>
            </h1>

            <p className="mt-5 max-w-xl text-lg leading-relaxed text-slate-600">
              ArthroCare AI interprets serum biomarkers against age- and sex-adjusted clinical reference models to deliver explainable, early-stage RA risk stratification.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link to="/register" className="btn-primary px-6 py-3 text-sm">
                Start Patient Assessment
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
              <a href="#how-it-works" className="btn-secondary px-6 py-3 text-sm">
                View Workflow
              </a>
            </div>

            <div className="mt-10 flex items-center gap-6">
              {[
                { icon: ShieldCheck, label: 'HIPAA-Aligned' },
                { icon: Users, label: '2,400+ Clinicians' },
                { icon: TrendingUp, label: '96% Specificity' }
              ].map((item) => (
                <span key={item.label} className="flex items-center gap-1.5 text-sm text-slate-500">
                  <item.icon className="h-4 w-4 text-primary-500" aria-hidden="true" />
                  {item.label}
                </span>
              ))}
            </div>
          </div>

          {/* Live sample serology panel */}
          <div className="relative lg:col-span-5">
            {/* Floating stat card */}
            <div className="absolute -top-4 -right-4 z-10 animate-float-delayed rounded-2xl border border-white/60 bg-white/90 px-4 py-3 shadow-lg shadow-slate-900/5 backdrop-blur-sm lg:-right-8">
              <div className="flex items-center gap-2.5">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 text-white shadow-md shadow-primary-600/20">
                  <HeartPulse className="h-4.5 w-4.5" aria-hidden="true" />
                </span>
                <div>
                  <p className="text-[11px] font-medium text-slate-400">Model Accuracy</p>
                  <p className="text-lg font-bold text-slate-900">96%</p>
                </div>
              </div>
            </div>

            <div className="panel overflow-hidden shadow-lg shadow-slate-900/5">
              <div className="flex items-center justify-between border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white px-6 py-4">
                <div>
                  <p className="text-sm font-semibold text-slate-900">Sample Serology Panel</p>
                  <p className="mt-0.5 text-xs text-slate-400">Demographic context: 48-year-old female</p>
                </div>
                <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-inset ${riskBadge.cls}`}>
                  {riskBadge.label}
                </span>
              </div>

              <div className="space-y-5 p-6">
                {sliders.map((s) => (
                  <div key={s.key}>
                    <div className="flex items-baseline justify-between text-sm">
                      <span className="font-medium text-slate-700">{s.name}</span>
                      <span className="tabular-nums font-semibold text-slate-900">
                        {s.value} {s.unit}
                        <span className="ml-1 text-xs font-normal text-slate-400">({s.refText})</span>
                      </span>
                    </div>
                    <input
                      type="range"
                      min={s.min}
                      max={s.max}
                      step={s.key === 'crp' ? 0.5 : 1}
                      value={s.value}
                      aria-label={`Adjust ${s.name}`}
                      onChange={(e) => setSampleValues((prev) => ({ ...prev, [s.key]: Number(e.target.value) }))}
                      className="mt-2"
                    />
                    {s.elevated && (
                      <p className="mt-1 text-[11px] font-medium text-amber-600">Above reference threshold</p>
                    )}
                  </div>
                ))}

                <div className="rounded-xl bg-gradient-to-br from-primary-50/80 to-sky-50/50 p-4 ring-1 ring-primary-100/50">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2 text-sm font-medium text-slate-700">
                      <Scale className="h-4 w-4 text-primary-600" aria-hidden="true" />
                      Modeled RA Risk Probability
                    </span>
                    <span className="tabular-nums text-2xl font-bold text-primary-700">{sampleScore}%</span>
                  </div>
                  <div className="meter-track mt-3">
                    <div className={`meter-fill ${meterColor}`} style={{ width: `${sampleScore}%` }} />
                  </div>
                  <p className="mt-2.5 text-xs text-slate-500">
                    {elevatedCount === 0
                      ? 'All four biomarker values are within normal baseline thresholds.'
                      : `${elevatedCount} of 4 biomarkers exceed standard reference thresholds.`}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trusted by section */}
      <section className="border-y border-slate-100/80 bg-white/60 backdrop-blur-sm">
        <div className="container-page py-8">
          <div className="flex flex-col items-center gap-6 sm:flex-row sm:justify-center sm:gap-12">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">Trusted by healthcare professionals</p>
            <div className="flex items-center gap-8">
              {['ACR Aligned', 'EULAR Criteria', 'FDA Ready', 'HIPAA Secure'].map((item) => (
                <span key={item} className="flex items-center gap-1.5 text-sm font-medium text-slate-500">
                  <CheckCircle2 className="h-4 w-4 text-primary-500" aria-hidden="true" />
                  {item}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Workflow */}
      <section id="how-it-works" className="relative overflow-hidden bg-soft-section py-16 lg:py-20">
        <div className="pointer-events-none absolute top-1/2 -right-32 h-64 w-64 -translate-y-1/2 rounded-full bg-primary-100/40 blur-3xl" aria-hidden="true" />

        <div className="container-page relative">
          <div className="mx-auto mb-12 max-w-2xl text-center">
            <p className="eyebrow justify-center">
              <Zap className="h-3.5 w-3.5" aria-hidden="true" />
              Clinical Workflow
            </p>
            <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
              Three steps to smarter risk assessment
            </h2>
            <p className="mt-3 text-lg leading-relaxed text-slate-500">
              Designed for seamless integration into outpatient rheumatology and primary care workflows without administrative friction.
            </p>
          </div>

          <ol className="grid gap-6 md:grid-cols-3">
            {workflowSteps.map((step, idx) => (
              <li key={step.stage} className="panel group relative overflow-hidden p-6 transition-all duration-300 hover:shadow-md hover:shadow-primary-900/5">
                <div className="flex items-center justify-between">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 text-sm font-bold text-white shadow-md shadow-primary-600/20">
                    {step.stage}
                  </span>
                  <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">
                    Step {idx + 1} of 3
                  </span>
                </div>
                <h3 className="mt-4 text-lg font-bold text-slate-900">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-500">{step.description}</p>
                <p className="mt-4 flex items-center gap-1.5 border-t border-slate-100 pt-3.5 text-xs font-medium text-primary-600">
                  <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
                  {step.deliverable}
                </p>
              </li>
            ))}
          </ol>

          <div className="mt-8 grid gap-5 sm:grid-cols-3">
            {[
              { icon: Clock, title: 'Rapid Requisition', text: 'Average panel execution under 2 minutes' },
              { icon: Zap, title: 'Real-Time Elevation Flags', text: 'Automated RF, CCP, CRP and ESR highlights' },
              { icon: BarChart3, title: 'Longitudinal Ready', text: 'Serial trajectory comparison across visits' }
            ].map((item) => (
              <div key={item.title} className="flex items-start gap-3.5 rounded-2xl border border-slate-100 bg-white/80 p-5 backdrop-blur-sm">
                <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-primary-600">
                  <item.icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <div>
                  <p className="text-sm font-semibold text-slate-900">{item.title}</p>
                  <p className="mt-0.5 text-xs leading-relaxed text-slate-500">{item.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Biomarkers */}
      <section id="biomarkers" className="relative overflow-hidden bg-white py-16 lg:py-20">
        <div className="pointer-events-none absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-sky-100/40 blur-3xl" aria-hidden="true" />

        <div className="container-page relative">
          <div className="mx-auto mb-12 max-w-2xl text-center">
            <p className="eyebrow justify-center">
              <FlaskConical className="h-3.5 w-3.5" aria-hidden="true" />
              Serological Panel
            </p>
            <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
              Four biomarkers, dual pathological axes
            </h2>
            <p className="mt-3 text-lg leading-relaxed text-slate-500">
              ArthroCare AI categorizes biomarker inputs into disease-specific autoantibodies and acute-phase inflammatory reactants to distinguish autoimmune etiology from non-specific systemic activity.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            {biomarkerSuite.map((marker) => (
              <article
                key={marker.id}
                className={`panel group p-6 transition-all duration-300 hover:shadow-md hover:shadow-slate-900/5 ${
                  marker.axis === 'serology'
                    ? 'border-l-[3px] border-l-primary-500'
                    : 'border-l-[3px] border-l-amber-400'
                }`}
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">{marker.category}</p>
                    <h3 className="mt-1 text-base font-bold text-slate-900">{marker.name}</h3>
                  </div>
                  <span className="rounded-lg bg-slate-50 px-2.5 py-1 font-mono text-[11px] font-semibold text-slate-600 ring-1 ring-inset ring-slate-100">
                    Ref: {marker.reference}
                  </span>
                </div>

                <dl className="mt-4 space-y-3 border-t border-slate-100 pt-4 text-sm">
                  <div>
                    <dt className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">Mechanism</dt>
                    <dd className="mt-1 leading-relaxed text-slate-600">{marker.mechanism}</dd>
                  </div>
                  <div>
                    <dt className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">Clinical Utility</dt>
                    <dd className="mt-1 leading-relaxed text-slate-600">{marker.clinicalSignificance}</dd>
                  </div>
                </dl>
              </article>
            ))}
          </div>

          <div className="mt-8 flex items-start gap-4 rounded-2xl border border-primary-100 bg-gradient-to-r from-primary-50/80 to-sky-50/40 px-6 py-5">
            <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-primary-600" aria-hidden="true" />
            <p className="text-sm leading-relaxed text-slate-700">
              <strong className="font-semibold text-primary-800">Dual-signal advantage:</strong> combining autoantibody specificity (Anti-CCP / RF) with acute-phase inflammatory sensitivity (CRP / ESR) maximizes diagnostic accuracy while minimizing false-positive serology classifications.
            </p>
          </div>
        </div>
      </section>

      {/* Clinical approach */}
      <section id="clinical-approach" className="relative overflow-hidden bg-soft-section py-16 lg:py-20">
        <div className="pointer-events-none absolute top-0 left-1/2 h-48 w-96 -translate-x-1/2 rounded-full bg-primary-100/30 blur-3xl" aria-hidden="true" />

        <div className="container-page relative">
          <div className="mx-auto mb-12 max-w-2xl text-center">
            <p className="eyebrow justify-center">
              <BrainCircuit className="h-3.5 w-3.5" aria-hidden="true" />
              Evidence-Based Engine
            </p>
            <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
              How ArthroCare AI delivers clinically actionable decision support
            </h2>
            <p className="mt-3 text-lg leading-relaxed text-slate-500">
              Rheumatoid arthritis diagnosis requires correlating multiple subtle lab signals against patient-specific baselines. ArthroCare AI unifies autoantibody serology, acute-phase reactants, and demographic calibration into one explainable framework.
            </p>
          </div>

          <div className="grid gap-6 lg:grid-cols-12 lg:items-start">
            {/* Decision engine diagram */}
            <div className="panel p-6 lg:col-span-5">
              <div className="section-head">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 text-white shadow-md shadow-primary-600/20">
                  <BrainCircuit className="h-5 w-5" aria-hidden="true" />
                </span>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Multivariable Decision Engine</h3>
                  <p className="text-xs text-slate-400">Unified three-input synthesis model</p>
                </div>
              </div>

              <div className="mt-5 space-y-2 text-sm">
                {[
                  { icon: Dna, title: 'Serological Precision', sub: 'RF + Anti-CCP Autoantibody Axis', tag: 'Autoimmune', tagCls: 'bg-primary-50 text-primary-700 ring-primary-200', iconCls: 'text-primary-600' },
                  { icon: UserCheck, title: 'Demographic Normalization', sub: 'Age and Sex Adjusted Curves', tag: 'Calibration', tagCls: 'bg-sky-50 text-sky-700 ring-sky-200', iconCls: 'text-sky-600' },
                  { icon: Activity, title: 'Inflammatory Reactants', sub: 'CRP + ESR Inflammatory Load', tag: 'Acute Phase', tagCls: 'bg-amber-50 text-amber-700 ring-amber-200', iconCls: 'text-amber-600' }
                ].map((row, i) => (
                  <div key={row.title}>
                    <div className="flex items-center justify-between rounded-xl bg-slate-50/80 px-4 py-3 ring-1 ring-inset ring-slate-100">
                      <span className="flex items-center gap-3">
                        <row.icon className={`h-4.5 w-4.5 ${row.iconCls}`} aria-hidden="true" />
                        <span>
                          <span className="block font-semibold text-slate-900">{i + 1}. {row.title}</span>
                          <span className="block text-xs text-slate-400">{row.sub}</span>
                        </span>
                      </span>
                      <span className={`rounded-lg px-2.5 py-0.5 font-mono text-[10px] font-bold ring-1 ring-inset ${row.tagCls}`}>
                        {row.tag}
                      </span>
                    </div>
                    {i < 2 && (
                      <div className="flex justify-center py-1.5">
                        <ArrowDown className="h-4 w-4 text-slate-300" aria-hidden="true" />
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="mt-5 rounded-xl bg-gradient-to-br from-primary-50 to-primary-100/50 px-5 py-3.5 ring-1 ring-primary-200/50">
                <p className="text-center text-[11px] font-semibold uppercase tracking-[0.12em] text-primary-700">Output Stratification</p>
                <p className="mt-1 text-center text-sm font-bold text-primary-800">
                  Age- and sex-adjusted RA risk profile and protocol
                </p>
              </div>
            </div>

            {/* Three core concepts */}
            <div className="space-y-4 lg:col-span-7">
              {[
                { icon: FlaskConical, title: 'Serological precision and dual-signal validation', text: 'Combines high-sensitivity Rheumatoid Factor (RF) with high-specificity Anti-CCP antibodies. This dual-signal approach minimizes false-positive serology classifications while identifying early erosive RA risks that single-marker tests miss.' },
                { icon: Sliders, title: 'Age and sex demographic normalization', text: 'Inflammatory reactants (particularly ESR and CRP) naturally vary with patient age and biological sex. ArthroCare adjusts raw laboratory values against demographic control baselines rather than static single cut-offs, preventing age-related misclassification.' },
                { icon: FileText, title: 'Actionable guidance and serial monitoring', text: 'Outputs transparent biomarker contribution weights, serial progression trend tracking across historical lab panels, and evidence-based dietary, physical therapy, and joint preservation directives aligned with ACR/EULAR guidelines.' }
              ].map((item) => (
                <div key={item.title} className="panel p-6 transition-all duration-300 hover:shadow-md hover:shadow-slate-900/5">
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 text-white shadow-md shadow-primary-600/20">
                      <item.icon className="h-5 w-5" aria-hidden="true" />
                    </span>
                    <h3 className="text-base font-bold text-slate-900">{item.title}</h3>
                  </div>
                  <p className="mt-3 text-sm leading-relaxed text-slate-500">{item.text}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-8 flex items-start gap-4 rounded-2xl bg-slate-50/80 px-6 py-5 ring-1 ring-inset ring-slate-100">
            <Stethoscope className="mt-0.5 h-5 w-5 shrink-0 text-slate-400" aria-hidden="true" />
            <p className="text-sm leading-relaxed text-slate-500">
              <strong className="font-semibold text-slate-700">ACR / EULAR alignment note:</strong> ArthroCare AI is an assistive decision-support platform designed to complement clinical judgment and formal rheumatological evaluation. It provides risk probability stratification and monitoring protocols for healthcare professionals and patients.
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative overflow-hidden bg-white py-16 lg:py-20">
        <div className="pointer-events-none absolute -top-20 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-primary-100/40 blur-3xl" aria-hidden="true" />

        <div className="container-page relative flex flex-col items-center gap-6 text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-500 to-primary-600 text-white shadow-lg shadow-primary-600/25">
            <LockKeyhole className="h-6 w-6" aria-hidden="true" />
          </span>
          <h2 className="max-w-xl text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
            Ready to evaluate patient serology?
          </h2>
          <p className="max-w-lg text-lg leading-relaxed text-slate-500">
            Access the patient workspace to submit serology panels, compute age-adjusted risk profiles, and generate evidence-based protocols.
          </p>
          <div className="mt-1 flex flex-col gap-3 sm:flex-row">
            <Link to="/register" className="btn-primary px-7 py-3 text-sm">
              Create Patient Account
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
            <Link to="/login" className="btn-secondary px-7 py-3 text-sm">
              Sign In to Portal
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-100 bg-white py-12">
        <div className="container-page flex flex-col gap-8 sm:flex-row sm:items-start sm:justify-between">
          <div className="max-w-sm">
            <Logo subtitle="Clinical Decision Support" />
            <p className="mt-4 text-sm leading-relaxed text-slate-400">
              ArthroCare AI is an assistive decision-support tool. It does not replace independent clinical judgment or formal diagnostic evaluation.
            </p>
          </div>

          <nav className="grid grid-cols-2 gap-x-12 gap-y-2.5 text-sm font-medium text-slate-500" aria-label="Footer">
            <Link to="/login" className="transition-colors hover:text-primary-600">Sign in</Link>
            <Link to="/register" className="transition-colors hover:text-primary-600">Register workspace</Link>
            <a href="#how-it-works" className="transition-colors hover:text-primary-600">Workflow</a>
            <a href="#biomarkers" className="transition-colors hover:text-primary-600">Biomarkers</a>
            <a href="#clinical-approach" className="transition-colors hover:text-primary-600">Clinical approach</a>
          </nav>
        </div>

        <div className="container-page mt-8 flex flex-col gap-2 border-t border-slate-100 pt-6 text-xs text-slate-400 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} ArthroCare AI Healthcare Suite. All rights reserved.</p>
          <p>System Version 2.4.0 · ACR/EULAR Aligned</p>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
