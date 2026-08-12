import React, { useState, useEffect } from 'react';
import { Line, Bar } from 'react-chartjs-2';
import CardTransition from '../animations/CardTransition';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  BarElement,
  Title, 
  Tooltip, 
  Legend,
  Filler
} from 'chart.js';
import { 
  TrendingUp, 
  Activity, 
  Calendar, 
  FlaskConical, 
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  User,
  Stethoscope,
  BarChart3
} from 'lucide-react';
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";
import { auth, db } from "../../firebase/config";
import { onAuthStateChanged } from "firebase/auth";

ChartJS.register(
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  BarElement,
  Title, 
  Tooltip, 
  Legend,
  Filler
);

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
      console.log("📥 Loading ALL lab data for user:", userId);

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
                year: 'numeric',
                month: 'short',
                day: 'numeric'
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
        const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        return entryDate >= oneWeekAgo;
      case 'month':
        const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        return entryDate >= oneMonthAgo;
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
        borderWidth: 2.5,
        fill: true,
        tension: 0.3,
        pointBackgroundColor: filteredHistory.map(entry => 
          entry.risk_level === 'High' ? '#dc2626' :
          entry.risk_level === 'Moderate' ? '#ea580c' :
          entry.risk_level === 'Low' ? '#d97706' :
          '#16a34a'
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
        label: 'Anti-CCP Antibodies',
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
        label: 'ESR Rate',
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
        borderRadius: 8
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top', labels: { font: { size: 11, weight: 'bold' } } }
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
    return (
      <CardTransition className="bg-white p-8 rounded-2xl border border-slate-200/90 shadow-sm text-center">
        <div className="w-8 h-8 border-3 border-teal-700 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Generating Serial Measurement Analytics...</p>
      </CardTransition>
    );
  }

  return (
    <CardTransition className="space-y-6">
      
      {/* Header Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-teal-700 rounded-xl flex items-center justify-center text-white shadow-sm">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">Longitudinal Risk & Biomarker Analytics</h2>
            <p className="text-xs text-slate-500">Track changes across serial blood tests over time</p>
          </div>
        </div>

        <button
          onClick={refreshData}
          className="px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 font-semibold rounded-xl text-xs transition-colors flex items-center space-x-2 shadow-sm"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* Metric Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-sm space-y-1">
          <span className="text-slate-500 font-medium">Serial Tests Recorded</span>
          <div className="text-2xl font-extrabold text-slate-900">{predictionHistory.length}</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-sm space-y-1">
          <span className="text-slate-500 font-medium">Latest Risk Score</span>
          <div className="text-2xl font-extrabold text-teal-700">{predictionHistory[0]?.risk_score || 0}%</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-sm space-y-1">
          <span className="text-slate-500 font-medium">Current Risk Band</span>
          <div className="text-sm font-extrabold text-slate-900 mt-1">{predictionHistory[0]?.risk_level || 'N/A'}</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-sm space-y-1">
          <span className="text-slate-500 font-medium">Last Assessed Date</span>
          <div className="text-xs font-bold text-slate-800 mt-1">{predictionHistory[0]?.date || 'N/A'}</div>
        </div>
      </div>

      {/* Filter Controls */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-4 flex flex-wrap items-center justify-between gap-4 text-xs">
        <div className="flex items-center space-x-2">
          <span className="font-bold text-slate-700">Time Range:</span>
          {['week', 'month', 'all'].map(r => (
            <button
              key={r}
              onClick={() => setTimeRange(r)}
              className={`px-3 py-1.5 rounded-lg font-semibold capitalize transition-all ${
                timeRange === r ? 'bg-teal-700 text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {r}
            </button>
          ))}
        </div>

        <div className="flex items-center space-x-2">
          <span className="font-bold text-slate-700">Display Metric:</span>
          {['risk_score', 'lab_values'].map(m => (
            <button
              key={m}
              onClick={() => setSelectedMetric(m)}
              className={`px-3 py-1.5 rounded-lg font-semibold capitalize transition-all ${
                selectedMetric === m ? 'bg-teal-700 text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {m === 'risk_score' ? 'Risk Trajectory' : 'Biomarker Levels'}
            </button>
          ))}
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid lg:grid-cols-12 gap-6">
        
        {/* Main Line Chart */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 space-y-4">
          <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
            <TrendingUp className="w-4 h-4 text-teal-700" />
            <h3 className="text-sm font-bold text-slate-900">
              {selectedMetric === 'risk_score' ? 'Longitudinal Risk Score Trajectory' : 'Serial Lab Biomarker Concentrations'}
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

        {/* Risk Distribution Bar Chart */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 space-y-4">
          <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
            <BarChart3 className="w-4 h-4 text-teal-700" />
            <h3 className="text-sm font-bold text-slate-900">Risk Band Frequency</h3>
          </div>

          <div className="h-72">
            <Bar data={riskLevelDistribution} options={chartOptions} />
          </div>
        </div>

      </div>

      {/* Historical Data Table */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <h3 className="text-sm font-bold text-slate-900">Historical Serology & Risk Records</h3>
          <span className="text-xs text-slate-500">{filteredHistory.length} total entries</span>
        </div>

        {filteredHistory.length === 0 ? (
          <div className="text-center py-8 text-xs text-slate-500">
            No lab test records found for the selected time filter.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">Risk Score</th>
                  <th className="py-2.5 px-3">Risk Band</th>
                  <th className="py-2.5 px-3">RF (IU/mL)</th>
                  <th className="py-2.5 px-3">Anti-CCP (U/mL)</th>
                  <th className="py-2.5 px-3">CRP (mg/L)</th>
                  <th className="py-2.5 px-3">ESR (mm/hr)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredHistory.map((entry) => (
                  <tr key={entry.id} className="hover:bg-slate-50/80">
                    <td className="py-2.5 px-3 font-semibold text-slate-900">{entry.date}</td>
                    <td className="py-2.5 px-3 font-bold text-teal-700">{entry.risk_score}%</td>
                    <td className="py-2.5 px-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${
                        entry.risk_level === 'High' ? 'bg-rose-50 text-rose-700 border border-rose-200' :
                        entry.risk_level === 'Moderate' ? 'bg-amber-50 text-amber-800 border border-amber-200' :
                        'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      }`}>
                        {entry.risk_level}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-mono text-slate-700">{entry.factors.rheumatoidFactor}</td>
                    <td className="py-2.5 px-3 font-mono text-slate-700">{entry.factors.antiCCP}</td>
                    <td className="py-2.5 px-3 font-mono text-slate-700">{entry.factors.cReactiveProtein}</td>
                    <td className="py-2.5 px-3 font-mono text-slate-700">{entry.factors.erythrocyteSedimentationRate}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </CardTransition>
  );
};

export default Monitoring;