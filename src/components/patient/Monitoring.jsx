import React, { useState, useEffect } from 'react';
import { Line, Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import { TrendingUp, BarChart3, RefreshCw, Calendar, Activity } from 'lucide-react';
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";
import { auth, db } from "../../firebase/config";
import { onAuthStateChanged } from "firebase/auth";
import Stat from '../ui/Stat';
import Badge from '../ui/Badge';
import Loader from '../ui/Loader';
import EmptyState from '../ui/EmptyState';

ChartJS.register(
  CategoryScale, LinearScale, PointElement, LineElement, BarElement,
  Title, Tooltip, Legend, Filler
);

const riskTone = (level) => {
  if (level === 'High') return 'rose';
  if (level === 'Moderate') return 'orange';
  if (level === 'Low') return 'amber';
  return 'emerald';
};

const Monitoring = () => {
  const [predictionHistory, setPredictionHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [timeRange, setTimeRange] = useState('all');
  const [selectedMetric, setSelectedMetric] = useState('risk_score');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUser(user);
        loadPredictionHistory(user.uid);
      } else {
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  const loadPredictionHistory = async (userId) => {
    try {
      setLoading(true);

      const labQuery = query(
        collection(db, "LabInformation"),
        where("userId", "==", userId),
        orderBy("createdAt", "desc")
      );

      const snapshot = await getDocs(labQuery);

      if (snapshot.empty) {
        setPredictionHistory([]);
        setLoading(false);
        return;
      }

      const history = [];
      const backendURL = import.meta.env.VITE_BACKEND_URL;

      for (const docSnapshot of snapshot.docs) {
        const labData = docSnapshot.data();

        try {
          const payload = {
            age: parseFloat(labData.userAge),
            gender: labData.userGender,
            rheumatoidFactor: parseFloat(labData.rheumatoidFactor),
            antiCCP: parseFloat(labData.antiCCP),
            cReactiveProtein: parseFloat(labData.cReactiveProtein),
            erythrocyteSedimentationRate: parseFloat(labData.erythrocyteSedimentationRate)
          };

          const response = await fetch(`${backendURL}/api/predict-ra-risk`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          });

          if (response.ok) {
            const prediction = await response.json();

            history.push({
              id: docSnapshot.id,
              date: new Date(labData.createdAt).toLocaleDateString('en-US', {
                year: 'numeric', month: 'short', day: 'numeric'
              }),
              timestamp: new Date(labData.createdAt),
              risk_score: prediction.risk_score,
              risk_level: prediction.risk_level,
              risk_probability: prediction.risk_probability,
              binary_prediction: prediction.binary_prediction,
              factors: {
                age: payload.age,
                gender: payload.gender,
                rheumatoidFactor: payload.rheumatoidFactor,
                antiCCP: payload.antiCCP,
                cReactiveProtein: payload.cReactiveProtein,
                erythrocyteSedimentationRate: payload.erythrocyteSedimentationRate
              },
              recommendations: prediction.recommendations,
              full_prediction: prediction
            });
          }
        } catch (err) {
          console.error("Error processing lab entry:", err);
        }
      }

      setPredictionHistory(history);
    } catch (err) {
      console.error("Error loading prediction history:", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredHistory = predictionHistory.filter(entry => {
    const now = new Date();
    const entryDate = new Date(entry.timestamp);

    switch (timeRange) {
      case 'week':
        return entryDate >= new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      case 'month':
        return entryDate >= new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      default:
        return true;
    }
  });

  const riskScoreChartData = {
    labels: filteredHistory.map(entry => entry.date),
    datasets: [
      {
        label: 'RA Risk Score (%)',
        data: filteredHistory.map(entry => entry.risk_score),
        borderColor: '#0f766e',
        backgroundColor: 'rgba(15, 118, 110, 0.08)',
        borderWidth: 2,
        fill: true,
        tension: 0.2,
        pointBackgroundColor: filteredHistory.map(entry =>
          entry.risk_level === 'High' ? '#be123c' :
          entry.risk_level === 'Moderate' ? '#c2410c' :
          entry.risk_level === 'Low' ? '#b45309' : '#047857'
        ),
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
        pointRadius: 4
      }
    ]
  };

  const labValuesChartData = {
    labels: filteredHistory.map(entry => entry.date),
    datasets: [
      {
        label: 'Rheumatoid Factor (RF)',
        data: filteredHistory.map(entry => entry.factors.rheumatoidFactor),
        borderColor: '#0f766e',
        backgroundColor: 'transparent',
        borderWidth: 2,
        tension: 0.2
      },
      {
        label: 'Anti-CCP Antibodies',
        data: filteredHistory.map(entry => entry.factors.antiCCP),
        borderColor: '#2563eb',
        backgroundColor: 'transparent',
        borderWidth: 2,
        tension: 0.2
      },
      {
        label: 'C-Reactive Protein (CRP)',
        data: filteredHistory.map(entry => entry.factors.cReactiveProtein),
        borderColor: '#d97706',
        backgroundColor: 'transparent',
        borderWidth: 2,
        tension: 0.2
      },
      {
        label: 'ESR Rate',
        data: filteredHistory.map(entry => entry.factors.erythrocyteSedimentationRate),
        borderColor: '#dc2626',
        backgroundColor: 'transparent',
        borderWidth: 2,
        tension: 0.2
      }
    ]
  };

  const riskLevelDistribution = {
    labels: ['Very Low', 'Low', 'Moderate', 'High'],
    datasets: [
      {
        label: 'Frequency',
        data: [
          filteredHistory.filter(e => e.risk_level === 'Very Low').length,
          filteredHistory.filter(e => e.risk_level === 'Low').length,
          filteredHistory.filter(e => e.risk_level === 'Moderate').length,
          filteredHistory.filter(e => e.risk_level === 'High').length
        ],
        backgroundColor: [
          'rgba(4, 120, 87, 0.8)',
          'rgba(180, 83, 9, 0.8)',
          'rgba(194, 65, 12, 0.8)',
          'rgba(190, 18, 60, 0.8)'
        ],
        borderRadius: 4
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top', labels: { boxWidth: 12, font: { size: 11, weight: 'bold' } } }
    },
    scales: {
      y: { beginAtZero: true, max: 100, ticks: { font: { size: 10 } }, grid: { color: '#f1f5f9' } },
      x: { ticks: { font: { size: 10 } }, grid: { color: '#f1f5f9' } }
    }
  };

  const refreshData = () => {
    if (currentUser) loadPredictionHistory(currentUser.uid);
  };

  if (loading) {
    return <Loader label="Generating serial biomarker analytics & trajectory charts…" />;
  }

  if (predictionHistory.length === 0) {
    return (
      <EmptyState
        icon={TrendingUp}
        title="No Serial Laboratory Records Recorded"
        description="Submit at least two laboratory panels over time to compute longitudinal trend graphs and risk trajectory analytics."
        action={
          window.dashboardSetTab && (
            <button
              type="button"
              onClick={() => window.dashboardSetTab("Lab Test Entry")}
              className="btn-primary"
            >
              Submit Laboratory Panel
            </button>
          )
        }
      />
    );
  }

  const latest = predictionHistory[0];

  return (
    <div className="space-y-6">
      {/* Key Metrics Grid */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat label="Total Panels Logged" value={predictionHistory.length} icon={Activity} />
        <Stat label="Latest RA Risk Score" value={`${latest?.risk_score || 0}%`} valueClass="text-blue-800" icon={TrendingUp} />
        <Stat label="Current Risk Band" value={latest?.risk_level || 'N/A'} icon={BarChart3} />
        <Stat label="Last Assessment Date" value={latest?.date || 'N/A'} valueClass="text-sm font-bold" icon={Calendar} />
      </div>

      {/* Control Filter Bar */}
      <div className="flex flex-col gap-4 rounded-lg border border-slate-200 bg-white p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-600">
            <span>Window:</span>
            <div className="flex rounded-lg border border-slate-200 p-0.5 bg-slate-50" role="group" aria-label="Time range">
              {['week', 'month', 'all'].map(r => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setTimeRange(r)}
                  className={`rounded-md px-3 py-1.5 text-xs font-semibold uppercase tracking-wider transition-colors ${
                    timeRange === r ? 'bg-blue-800 text-white' : 'text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {r === 'all' ? 'All Time' : r}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2 text-sm font-semibold text-slate-600">
            <span>Metric:</span>
            <div className="flex rounded-lg border border-slate-200 p-0.5 bg-slate-50" role="group" aria-label="Display metric">
              {['risk_score', 'lab_values'].map(m => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setSelectedMetric(m)}
                  className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-colors ${
                    selectedMetric === m ? 'bg-blue-800 text-white' : 'text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {m === 'risk_score' ? 'Risk Trajectory' : 'Biomarker Levels'}
                </button>
              ))}
            </div>
          </div>
        </div>

        <button type="button" onClick={refreshData} className="btn-secondary shrink-0 text-sm">
          <RefreshCw className="h-4 w-4" />
          Refresh Analytics
        </button>
      </div>

      {/* Chart Visualizations */}
      <div className="grid gap-6 lg:grid-cols-12">
        <div className="space-y-4 rounded-lg border border-slate-200 bg-white p-6 lg:col-span-8">
          <div className="flex items-center justify-between border-b border-slate-200 pb-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-800" />
              <h3 className="text-sm font-bold uppercase tracking-widest text-slate-900">
                {selectedMetric === 'risk_score' ? 'Longitudinal RA Risk Score Trajectory (%)' : 'Serial Biomarker Concentrations'}
              </h3>
            </div>
          </div>
          <div className="h-80">
            {selectedMetric === 'risk_score' ? (
              <Line data={riskScoreChartData} options={chartOptions} />
            ) : (
              <Line data={labValuesChartData} options={chartOptions} />
            )}
          </div>
        </div>

        <div className="space-y-4 rounded-lg border border-slate-200 bg-white p-6 lg:col-span-4">
          <div className="flex items-center justify-between border-b border-slate-200 pb-4">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-blue-800" />
              <h3 className="text-sm font-bold uppercase tracking-widest text-slate-900">Risk Band Distribution</h3>
            </div>
          </div>
          <div className="h-80">
            <Bar data={riskLevelDistribution} options={chartOptions} />
          </div>
        </div>
      </div>

      {/* Serial Laboratory Audit Log Table */}
      <div className="rounded-lg border border-slate-200 bg-white overflow-hidden">
        <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50/50 px-5 py-4">
          <h3 className="text-sm font-bold uppercase tracking-widest text-slate-900">Serial Laboratory Audit Log &amp; Historical Submissions</h3>
          <span className="text-sm font-semibold text-slate-500">{filteredHistory.length} Entries</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr>
                <th scope="col" className="th">Assessment Date</th>
                <th scope="col" className="th">Risk Score</th>
                <th scope="col" className="th">Risk Band</th>
                <th scope="col" className="th">RF (IU/mL)</th>
                <th scope="col" className="th">Anti-CCP (U/mL)</th>
                <th scope="col" className="th">CRP (mg/L)</th>
                <th scope="col" className="th">ESR (mm/hr)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredHistory.map((entry) => (
                <tr key={entry.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="td font-bold text-slate-900">{entry.date}</td>
                  <td className="td font-extrabold text-teal-800">{entry.risk_score}%</td>
                  <td className="td">
                    <Badge tone={riskTone(entry.risk_level)} showDot>{entry.risk_level}</Badge>
                  </td>
                  <td className="td font-mono font-medium">{entry.factors.rheumatoidFactor}</td>
                  <td className="td font-mono font-medium">{entry.factors.antiCCP}</td>
                  <td className="td font-mono font-medium">{entry.factors.cReactiveProtein}</td>
                  <td className="td font-mono font-medium">{entry.factors.erythrocyteSedimentationRate}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Monitoring;