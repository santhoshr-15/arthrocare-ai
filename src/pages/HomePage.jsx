import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ShieldCheck, FileCheck, Scale, TrendingUp, FlaskConical, BrainCircuit, FileText } from 'lucide-react';
import Logo from '../components/ui/Logo';

const biomarkerTable = [
  {
    name: 'Rheumatoid Factor (RF)',
    reference: '< 14 IU/mL',
    role: 'Autoantibody against immunoglobulin G; one of the classic RA serology markers.',
    elevation: 'Elevated levels are seen in RA but also occur in other autoimmune and infectious conditions.'
  },
  {
    name: 'Anti-CCP Antibodies',
    reference: '< 20 U/mL',
    role: 'High-specificity autoantibody associated with early and established rheumatoid arthritis.',
    elevation: 'Elevated levels are the strongest single serology signal for RA.'
  },
  {
    name: 'C-Reactive Protein (CRP)',
    reference: '< 3.0 mg/L',
    role: 'Acute-phase protein that rises quickly in response to systemic inflammation.',
    elevation: 'Elevated levels indicate active inflammation and can guide disease-activity monitoring.'
  },
  {
    name: 'Erythrocyte Sedimentation Rate (ESR)',
    reference: '0–20 mm/hr',
    role: 'Measures how quickly red blood cells settle; a non-specific marker of inflammation.',
    elevation: 'Elevated rates signal systemic inflammation and are tracked over time for trends.'
  }
];

const steps = [
  {
    number: '01',
    title: 'Create your account',
    description: 'Register with your basic demographics — age and sex are used to adjust every calculation.'
  },
  {
    number: '02',
    title: 'Enter your lab panel',
    description: 'Add RF, Anti-CCP, CRP, and ESR values from a recent blood test in under two minutes.'
  },
  {
    number: '03',
    title: 'Review your risk profile',
    description: 'Get an age- and sex-adjusted risk score, a breakdown of contributing factors, and clear next steps.'
  }
];

const HomePage = () => {
  return (
    <div className="min-h-screen bg-white text-slate-900">
      {/* Top navigation */}
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="container-page flex h-16 items-center justify-between">
          <Link to="/" aria-label="ArthroCare AI home">
            <Logo subtitle="Clinical intelligence" />
          </Link>

          <nav className="hidden items-center gap-8 md:flex" aria-label="Primary">
            <a href="#how-it-works" className="text-sm font-medium text-slate-600 transition-colors hover:text-slate-900">
              How it works
            </a>
            <a href="#biomarkers" className="text-sm font-medium text-slate-600 transition-colors hover:text-slate-900">
              Biomarkers
            </a>
            <a href="#clinical-approach" className="text-sm font-medium text-slate-600 transition-colors hover:text-slate-900">
              Clinical approach
            </a>
          </nav>

          <div className="flex items-center gap-2">
            <Link to="/login" className="btn-ghost">
              Sign in
            </Link>
            <Link to="/register" className="btn-primary">
              Get started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="border-b border-slate-200 bg-slate-50/60">
        <div className="container-page grid items-center gap-12 py-16 lg:grid-cols-2 lg:py-24">
          <div>
            <p className="eyebrow mb-4">Rheumatoid arthritis risk assessment</p>
            <h1 className="text-4xl font-semibold leading-tight tracking-tight text-slate-900 lg:text-5xl">
              Turn four lab values into a clear RA risk profile.
            </h1>
            <p className="mt-5 max-w-lg text-lg leading-relaxed text-slate-600">
              ArthroCare AI interprets your RF, Anti-CCP, CRP, and ESR results against age- and sex-adjusted
              reference ranges, producing an explainable rheumatoid arthritis risk assessment with actionable guidance.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link to="/register" className="btn-primary">
                Start your assessment
                <ArrowRight className="h-4 w-4" />
              </Link>
              <a href="#how-it-works" className="btn-secondary">
                See how it works
              </a>
            </div>

            <dl className="mt-10 grid max-w-lg grid-cols-3 gap-6 border-t border-slate-200 pt-6">
              <div>
                <dt className="text-sm text-slate-500">Biomarkers analyzed</dt>
                <dd className="mt-1 text-2xl font-semibold text-slate-900">4</dd>
              </div>
              <div>
                <dt className="text-sm text-slate-500">Reference ranges</dt>
                <dd className="mt-1 text-2xl font-semibold text-slate-900">Age &amp; sex adjusted</dd>
              </div>
              <div>
                <dt className="text-sm text-slate-500">Output format</dt>
                <dd className="mt-1 text-2xl font-semibold text-slate-900">Risk + guidance</dd>
              </div>
            </dl>
          </div>

          {/* Assessment preview */}
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
              <div>
                <p className="text-sm font-semibold text-slate-900">Sample assessment</p>
                <p className="text-xs text-slate-500">Illustrative lab panel for a 47-year-old female</p>
              </div>
              <span className="inline-flex items-center gap-1.5 rounded-md border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-800">
                <ShieldCheck className="h-3.5 w-3.5" />
                Low risk
              </span>
            </div>

            <div className="space-y-4 px-6 py-6">
              {[
                { label: 'Rheumatoid Factor (RF)', value: '11 IU/mL', width: '28%', bar: 'bg-teal-600' },
                { label: 'Anti-CCP Antibodies', value: '9 U/mL', width: '22%', bar: 'bg-teal-600' },
                { label: 'C-Reactive Protein (CRP)', value: '1.8 mg/L', width: '30%', bar: 'bg-teal-600' },
                { label: 'ESR', value: '12 mm/hr', width: '26%', bar: 'bg-teal-600' }
              ].map((row) => (
                <div key={row.label}>
                  <div className="mb-1.5 flex items-center justify-between text-sm">
                    <span className="font-medium text-slate-700">{row.label}</span>
                    <span className="font-semibold text-slate-900">{row.value}</span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-slate-100">
                    <div className={`h-1.5 rounded-full ${row.bar}`} style={{ width: row.width }} />
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50 px-6 py-4">
              <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
                <Scale className="h-4 w-4 text-teal-700" />
                Modeled risk score
              </div>
              <span className="text-lg font-semibold text-teal-700">34%</span>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="border-b border-slate-200">
        <div className="container-page py-14 lg:py-16">
          <div className="grid gap-10 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:items-start">
            <div>
            <p className="eyebrow mb-3">How it works</p>
            <h2 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
              From blood panel to risk profile in three steps
            </h2>
            <p className="mt-4 max-w-lg text-base leading-relaxed text-slate-600">
              The platform is built for routine clinic workflows: no special equipment, no data-entry burden.
              Each assessment follows the same pipeline for every patient.
            </p>

              <ol className="mt-8 grid gap-3 sm:grid-cols-3">
                {[
                  { icon: FlaskConical, label: 'Lab panel' },
                  { icon: BrainCircuit, label: 'Risk model' },
                  { icon: FileText, label: 'Risk profile + guidance' }
                ].map((item, index) => {
                  const Icon = item.icon;
                  return (
                    <li key={item.label} className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-teal-200 bg-teal-50 text-teal-700">
                        <Icon className="h-4 w-4" />
                      </span>
                      <div className="min-w-0">
                        <span className="block text-sm font-medium text-slate-900">{item.label}</span>
                        <span className="block text-xs text-slate-500">Step {index + 1}</span>
                      </div>
                    </li>
                  );
                })}
              </ol>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 sm:p-6">
              <ol className="space-y-6">
                {steps.map((step) => (
                  <li key={step.number} className="relative border-l-2 border-teal-100 pl-7">
                    <span className="absolute -left-3 top-0 flex h-6 w-6 items-center justify-center rounded-full border-2 border-teal-600 bg-white text-[11px] font-semibold text-teal-700">
                      {parseInt(step.number, 10)}
                    </span>
                    <h3 className="text-base font-semibold text-slate-900">{step.title}</h3>
                    <p className="mt-1.5 max-w-md text-sm leading-relaxed text-slate-600">{step.description}</p>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      </section>

      {/* Biomarkers */}
      <section id="biomarkers" className="border-b border-slate-200 bg-slate-50/60">
        <div className="container-page py-14 lg:py-16">
          <div className="grid gap-10 xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] xl:items-end">
            <div className="max-w-xl">
              <p className="eyebrow mb-3">Biomarker suite</p>
              <h2 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
                The four markers behind every assessment
              </h2>
              <p className="mt-4 text-base leading-relaxed text-slate-600">
                All values are interpreted against standard clinical reference ranges and adjusted for age
                and sex. Together the panel captures two distinct signals.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <p className="text-sm font-semibold text-slate-900">Autoantibody serology</p>
                <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-teal-700">RF · Anti-CCP</p>
                <p className="mt-2.5 text-sm leading-relaxed text-slate-600">
                  Indicates the presence of RA-specific immune activity.
                </p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <p className="text-sm font-semibold text-slate-900">Inflammation markers</p>
                <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-teal-700">CRP · ESR</p>
                <p className="mt-2.5 text-sm leading-relaxed text-slate-600">
                  Reflects current systemic inflammatory burden and disease activity.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-10 overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
            <table className="w-full min-w-[720px] text-left">
              <thead>
                <tr className="border-b border-slate-200">
                  <th scope="col" className="th">Biomarker</th>
                  <th scope="col" className="th">Reference range</th>
                  <th scope="col" className="th">Clinical role</th>
                  <th scope="col" className="th">What elevation indicates</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {biomarkerTable.map((row) => (
                  <tr key={row.name} className="align-top">
                    <td className="td py-4 font-semibold text-slate-900">{row.name}</td>
                    <td className="td py-4 whitespace-nowrap">
                      <span className="inline-flex rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5 text-xs font-medium text-slate-700">
                        {row.reference}
                      </span>
                    </td>
                    <td className="td py-4">{row.role}</td>
                    <td className="td py-4">{row.elevation}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Clinical approach */}
      <section id="clinical-approach" className="border-b border-slate-200">
        <div className="container-page py-14 lg:py-16">
          <div className="grid gap-10 xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] xl:items-start">
            <div className="max-w-xl">
              <p className="eyebrow mb-3">Clinical approach</p>
              <h2 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
                Designed for earlier detection and clearer follow-up
              </h2>
              <p className="mt-4 text-base leading-relaxed text-slate-600">
                Rheumatoid arthritis is frequently missed in its early stages because symptoms overlap with
                everyday aches and single lab reports are hard to interpret in isolation. ArthroCare AI combines
                quantitative autoantibody serology with acute-phase markers and demographic baselines to surface
                risk signals that might otherwise go unnoticed.
              </p>
              <p className="mt-4 text-base leading-relaxed text-slate-600">
                Each assessment explains which markers are driving the score, and serial panels are tracked over
                time so changes — not just snapshots — inform the picture.
              </p>
            </div>

            <div className="grid gap-3">
              {[
                {
                  icon: Scale,
                  title: 'Adjusted, not absolute',
                  body: 'Age and sex influence normal biomarker ranges. Every score is calculated against patient-specific baselines rather than one-size-fits-all cut-offs.'
                },
                {
                  icon: FileCheck,
                  title: 'Explainable output',
                  body: 'The report lists each contributing marker alongside the modeled probability, so the reasoning behind a risk level is visible and reviewable.'
                },
                {
                  icon: TrendingUp,
                  title: 'Trend-aware monitoring',
                  body: 'Serial lab entries are compared against earlier panels, highlighting directional changes in inflammation and autoantibody levels over time.'
                }
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.title} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
                    <div className="flex items-start gap-4">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-teal-50 text-teal-700">
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-slate-900">{item.title}</h3>
                        <p className="mt-1 text-sm leading-relaxed text-slate-600">{item.body}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <p className="mt-8 max-w-3xl rounded-xl border border-slate-200 bg-slate-50 px-5 py-4 text-sm leading-relaxed text-slate-600">
            <span className="font-semibold text-slate-900">Scope note:</span> ArthroCare AI is a decision-support
            tool. Results should complement — not replace — evaluation by a qualified rheumatologist or
            primary care physician.
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="border-b border-slate-200">
        <div className="container-page flex flex-col items-center gap-6 py-16 text-center">
          <h2 className="max-w-2xl text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
            Ready to review your rheumatoid arthritis risk?
          </h2>
          <p className="max-w-xl text-base leading-relaxed text-slate-600">
            Create a patient account, enter your most recent lab panel, and receive an age- and sex-adjusted risk
            profile with next steps.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link to="/register" className="btn-primary">
              Create your account
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link to="/login" className="btn-secondary">
              Sign in to portal
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-300">
        <div className="container-page py-12">
          <div className="grid gap-10 md:grid-cols-4">
            <div className="space-y-3 md:col-span-2">
              <Logo subtitle="Clinical intelligence" dark />
              <p className="max-w-sm text-sm leading-relaxed text-slate-400">
                A clinical decision-support platform for early rheumatoid arthritis risk identification,
                longitudinal monitoring, and personalized management guidance.
              </p>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-white">Platform</h3>
              <ul className="mt-3 space-y-2 text-sm">
                <li><a href="#how-it-works" className="text-slate-400 transition-colors hover:text-white">How it works</a></li>
                <li><a href="#biomarkers" className="text-slate-400 transition-colors hover:text-white">Biomarker suite</a></li>
                <li><a href="#clinical-approach" className="text-slate-400 transition-colors hover:text-white">Clinical approach</a></li>
                <li><Link to="/login" className="text-slate-400 transition-colors hover:text-white">Patient portal</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-white">Compliance</h3>
              <ul className="mt-3 space-y-2 text-sm">
                <li><a href="#" className="text-slate-400 transition-colors hover:text-white">Privacy policy</a></li>
                <li><a href="#" className="text-slate-400 transition-colors hover:text-white">Terms of service</a></li>
                <li><a href="#" className="text-slate-400 transition-colors hover:text-white">Data security</a></li>
                <li><a href="#" className="text-slate-400 transition-colors hover:text-white">Clinical disclaimer</a></li>
              </ul>
            </div>
          </div>

          <div className="mt-10 flex flex-col items-start justify-between gap-3 border-t border-slate-800 pt-6 text-xs text-slate-500 sm:flex-row sm:items-center">
            <p>© {new Date().getFullYear()} ArthroCare AI. All rights reserved.</p>
            <p>Decision-support tool for educational and clinical use.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;