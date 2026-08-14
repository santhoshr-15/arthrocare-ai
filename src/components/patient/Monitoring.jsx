import React, { useState, useEffect } from 'react';
import { Line, Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import { TrendingUp, BarChart3, RefreshCw } from 'lucide-react';
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
        label: 'RA risk score (%)',
        data: filteredHistory.map(entry => entry.risk_score),
        borderColor: '#0f766e',
        backgroundColor: 'rgba(15, 118, 110, 0.08)',
        borderWidth: 2.5,
        fill: true,
        tension: 0.3,
        pointBackgroundColor: filteredHistory.map(entry =>
          entry.risk_level === 'High' ? '#dc2626' :
          entry.risk_level === 'Moderate' ? '#ea580c' :
          entry.risk_level === 'Low' ? '#d97706' : '#16a34a'
        ),
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
        pointRadius: 5
      }
    ]
  };

  const labValuesChartData = {
    labels: filteredHistory.map(entry => entry.date),
    datasets: [
      {
        label: 'Rheumatoid Factor (RF)',
        data: filteredHistory.map(entry => entry.factors.rheumatoidFactor),
        borderColor: '#7c3aed',
        backgroundColor: 'transparent',
        borderWidth: 2,
        tension: 0.3
      },
      {
        label: 'Anti-CCP antibodies',
        data: filteredHistory.map(entry => entry.factors.antiCCP),
        borderColor: '#db2777',
        backgroundColor: 'transparent',
        borderWidth: 2,
        tension: 0.3
      },
      {
        label: 'C-Reactive Protein (CRP)',
        data: filteredHistory.map(entry => entry.factors.cReactiveProtein),
        borderColor: '#0284c7',
        backgroundColor: 'transparent',
        borderWidth: 2,
        tension: 0.3
      },
      {
        label: 'ESR rate',
        data: filteredHistory.map(entry => entry.factors.erythrocyteSedimentationRate),
        borderColor: '#d97706',
        backgroundColor: 'transparent',
        borderWidth: 2,
        tension: 0.3
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
          'rgba(22, 163, 74, 0.8)',
          'rgba(217, 119, 6, 0.8)',
          'rgba(234, 88, 12, 0.8)',
          'rgba(220, 38, 38, 0.8)'
        ],
        borderRadius: 6
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top', labels: { boxWidth: 12, font: { size: 11 } } }
    },
    scales: {
      y: { beginAtZero: true, max: 100, ticks: { font: { size: 11 } } },
      x: { ticks: { font: { size: 11 } } }
    }
  };

  const refreshData = () => {
    if (currentUser) loadPredictionHistory(currentUser.uid);
  };

  if (loading) {
    return <Loader label="Generating serial measurement analytics…" />;
  }

  if (predictionHistory.length === 0) {
    return (
      <EmptyState
        icon={TrendingUp}
        title="No serial measurements yet"
        description="Submit at least two lab panels over time to view longitudinal trends and biomarker trajectories."
      />
    );
  }

  const latest = predictionHistory[0];

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat label="Serial tests recorded" value={predictionHistory.length} />
        <Stat label="Latest risk score" value={`${latest?.risk_score || 0}%`} valueClass="text-teal-700" />
        <Stat label="Current risk band" value={latest?.risk_level || 'N/A'} />
        <Stat label="Last assessed" value={latest?.date || 'N/A'} valueClass="text-sm font-semibold" />
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2 text-sm">
          <span className="text-slate-600">Time range:</span>
          <div className="flex rounded-lg border border-slate-200 p-0.5" role="group" aria-label="Time range">
            {['week', 'month', 'all'].map(r => (
              <button
                key={r}
                type="button"
                onClick={() => setTimeRange(r)}
                className={`rounded-md px-3 py-1.5 text-xs font-medium capitalize transition-colors ${
                  timeRange === r ? 'bg-teal-700 text-white' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2 text-sm">
          <span className="text-slate-600">Display:</span>
          <div className="flex rounded-lg border border-slate-200 p-0.5" role="group" aria-label="Display metric">
            {['risk_score', 'lab_values'].map(m => (
              <button
                key={m}
                type="button"
                onClick={() => setSelectedMetric(m)}
                className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                  selectedMetric === m ? 'bg-teal-700 text-white' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {m === 'risk_score' ? 'Risk trajectory' : 'Biomarker levels'}
              </button>
            ))}
          </div>
        </div>

        <button type="button" onClick={refreshData} className="btn-secondary shrink-0">
          <RefreshCw className="h-4 w-4" />
          Refresh data
        </button>
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-12">
        <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-5 sm:p-6 lg:col-span-8">
          <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
            <TrendingUp className="h-4 w-4 text-teal-700" />
            <h3 className="text-sm font-semibold text-slate-900">
              {selectedMetric === 'risk_score' ? 'Longitudinal risk score trajectory' : 'Serial lab biomarker concentrations'}
            </h3>
          </div>
          <div className="h-72">
            {selectedMetric === 'risk_score' ? (
              <Line data={riskScoreChartData} options={chartOptions} />
            ) : (
              <Line data={labValuesChartData} options={chartOptions} />
            )}
          </div>
        </div>

        <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-5 sm:p-6 lg:col-span-4">
          <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
            <BarChart3 className="h-4 w-4 text-teal-700" />
            <h3 className="text-sm font-semibold text-slate-900">Risk band frequency</h3>
          </div>
          <div className="h-72">
            <Bar data={riskLevelDistribution} options={chartOptions} />
          </div>
        </div>
      </div>

      {/* History table */}
      <div className="rounded-xl border border-slate-200 bg-white">
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <h3 className="text-sm font-semibold text-slate-900">Historical serology & risk records</h3>
          <span className="text-xs text-slate-500">{filteredHistory.length} entries</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-200">
                <th scope="col" className="th">Date</th>
                <th scope="col" className="th">Risk score</th>
                <th scope="col" className="th">Risk band</th>
                <th scope="col" className="th">RF (IU/mL)</th>
                <th scope="col" className="th">Anti-CCP (U/mL)</th>
                <th scope="col" className="th">CRP (mg/L)</th>
                <th scope="col" className="th">ESR (mm/hr)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredHistory.map((entry) => (
                <tr key={entry.id} className="hover:bg-slate-50">
                  <td className="td font-semibold text-slate-900">{entry.date}</td>
                  <td className="td font-semibold text-teal-700">{entry.risk_score}%</td>
                  <td className="td">
                    <Badge tone={riskTone(entry.risk_level)}>{entry.risk_level}</Badge>
                  </td>
                  <td className="td font-mono">{entry.factors.rheumatoidFactor}</td>
                  <td className="td font-mono">{entry.factors.antiCCP}</td>
                  <td className="td font-mono">{entry.factors.cReactiveProtein}</td>
                  <td className="td font-mono">{entry.factors.erythrocyteSedimentationRate}</td>
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