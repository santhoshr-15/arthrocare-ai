import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Activity, TestTube, BarChart3, UserPlus, Search, Eye, Trash2, FlaskConical, X, ShieldAlert } from 'lucide-react';
import { collection, query, getDocs, doc, deleteDoc, orderBy, getDoc } from "firebase/firestore";
import { auth, db } from "../../firebase/config";
import AppShell from "../common/AppShell";
import Stat from "../ui/Stat";
import Badge from "../ui/Badge";
import EmptyState from "../ui/EmptyState";
import Loader from "../ui/Loader";

const formatDate = (value) => {
  if (!value) return '—';
  const d = new Date(value);
  if (isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
};

const formatDateTime = (value) => {
  if (!value) return '—';
  const d = new Date(value);
  if (isNaN(d.getTime())) return '—';
  return d.toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' });
};

const shortId = (id) => (id ? id.substring(0, 8).toUpperCase() : '—');

const getRiskBand = (lab) => {
  if (!lab) return { label: 'No Data', tone: 'slate' };
  const checks = [
    parseFloat(lab.rheumatoidFactor),
    parseFloat(lab.antiCCP),
    parseFloat(lab.cReactiveProtein),
    parseFloat(lab.erythrocyteSedimentationRate)
  ];
  const thresholds = [14, 20, 3.0, 20];
  const elevated = checks.filter((v, i) => !Number.isNaN(v) && v > thresholds[i]).length;

  if (elevated >= 3) return { label: 'Elevated Serology (3-4 Markers)', tone: 'rose' };
  if (elevated === 2) return { label: 'Moderate Serology (2 Markers)', tone: 'orange' };
  if (elevated === 1) return { label: 'Mild Elevation (1 Marker)', tone: 'amber' };
  return { label: 'Within Reference Range', tone: 'emerald' };
};

const adminNav = [
  { id: 'overview', label: 'System Overview', icon: BarChart3 },
  { id: 'patients', label: 'Patient Directory', icon: Users },
  { id: 'labdata', label: 'Biomarker Submissions', icon: TestTube },
  { id: 'activity', label: 'Access Audit Log', icon: Activity }
];

const pageMeta = {
  overview: { title: 'System Administrative Overview', description: 'System-wide telemetry across registered patient cohorts, serology panels, and access logs.' },
  patients: { title: 'Patient Directory', description: 'Master registry of verified patient accounts, diagnostic histories, and access status.' },
  labdata: { title: 'Biomarker Submissions Log', description: 'Central audit of serological panels with automated threshold elevation flags.' },
  activity: { title: 'Security & Access Audit Log', description: 'Timestamped trail of system authentication sessions and patient registrations.' }
};

const Admin = () => {
  const navigate = useNavigate();
  const [isVerifiedAdmin, setIsVerifiedAdmin] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [users, setUsers] = useState([]);
  const [labData, setLabData] = useState([]);
  const [loginData, setLoginData] = useState([]);
  const [signupData, setSignupData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);

  const loadUsers = useCallback(async () => {
    try {
      const usersQuery = query(collection(db, "users"));
      const snapshot = await getDocs(usersQuery);
      const usersData = snapshot.docs.map(docSnapshot => ({
        id: docSnapshot.id,
        ...docSnapshot.data(),
        joinedDate: docSnapshot.data().createdAt?.toDate?.() || new Date()
      }));
      setUsers(usersData);
      return usersData;
    } catch (error) {
      console.error('Error loading users:', error);
      return [];
    }
  }, []);

  const loadLabData = useCallback(async () => {
    try {
      const labQuery = query(collection(db, "LabInformation"), orderBy("createdAt", "desc"));
      const snapshot = await getDocs(labQuery);
      const labDataList = snapshot.docs.map(docSnapshot => ({
        id: docSnapshot.id,
        ...docSnapshot.data(),
        createdAt: docSnapshot.data().createdAt?.toDate?.() || new Date()
      }));
      setLabData(labDataList);
      return labDataList;
    } catch (error) {
      console.error('Error loading lab data:', error);
      return [];
    }
  }, []);

  const loadLoginData = useCallback(async () => {
    try {
      const loginQuery = query(collection(db, "login"), orderBy("timestamp", "desc"));
      const snapshot = await getDocs(loginQuery);
      const loginDataList = snapshot.docs.map(docSnapshot => ({
        id: docSnapshot.id,
        ...docSnapshot.data(),
        timestamp: docSnapshot.data().timestamp?.toDate?.() || new Date()
      }));
      setLoginData(loginDataList);
      return loginDataList;
    } catch (error) {
      console.error('Error loading login data:', error);
      return [];
    }
  }, []);

  const loadSignupData = useCallback(async () => {
    try {
      const signupQuery = query(collection(db, "signup"), orderBy("createdAt", "desc"));
      const snapshot = await getDocs(signupQuery);
      const signupDataList = snapshot.docs.map(docSnapshot => ({
        id: docSnapshot.id,
        ...docSnapshot.data(),
        createdAt: docSnapshot.data().createdAt?.toDate?.() || new Date()
      }));
      setSignupData(signupDataList);
      return signupDataList;
    } catch (error) {
      console.error('Error loading signup data:', error);
      return [];
    }
  }, []);

  const loadStats = useCallback((usersData, labDataList, loginDataList, signupDataList) => {
    const totalUsers = usersData.length;
    const totalLabEntries = labDataList.length;
    const totalLogins = loginDataList.length;
    const totalSignups = signupDataList.length;

    const today = new Date();
    const lastWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

    const recentUsers = usersData.filter(user =>
      new Date(user.joinedDate) > lastWeek
    ).length;

    const activeToday = loginDataList.filter(login =>
      new Date(login.timestamp).toDateString() === today.toDateString()
    ).length;

    setStats({ totalUsers, totalLabEntries, totalLogins, totalSignups, recentUsers, activeToday });
  }, []);

  const loadAllData = useCallback(async () => {
    try {
      setLoading(true);
      const [usersData, labDataList, loginDataList, signupDataList] = await Promise.all([
        loadUsers(),
        loadLabData(),
        loadLoginData(),
        loadSignupData()
      ]);
      loadStats(usersData, labDataList, loginDataList, signupDataList);
    } catch (error) {
      console.error('Error loading admin data:', error);
    } finally {
      setLoading(false);
    }
  }, [loadUsers, loadLabData, loadLoginData, loadSignupData, loadStats]);

  useEffect(() => {
    const verifyAdminAccess = async () => {
      const user = auth.currentUser;
      if (!user) {
        navigate('/login');
        return;
      }

      try {
        const adminDoc = await getDoc(doc(db, 'adminUsers', user.uid));
        if (!adminDoc.exists() || adminDoc.data().isAdmin !== true) {
          navigate('/patient/dashboard');
          return;
        }
        setIsVerifiedAdmin(true);
        loadAllData();
      } catch (error) {
        console.error('Security verification failed:', error);
        navigate('/login');
      }
    };

    verifyAdminAccess();
  }, [navigate, loadAllData]);

  const deleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this patient record? This action cannot be undone.')) {
      try {
        await deleteDoc(doc(db, "users", userId));
        await loadAllData();
      } catch (error) {
        console.error('Error deleting user:', error);
      }
    }
  };

  const filteredUsers = users.filter(user =>
    user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.id?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredLabs = labData.filter(lab =>
    lab.userId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    String(lab.userAge || '').includes(searchTerm.toLowerCase())
  );

  const filteredLogins = loginData.filter(login =>
    login.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    login.userId?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getUserLabEntries = (userId) => {
    return labData.filter(lab => lab.userId === userId);
  };

  const getUserLoginHistory = (userId) => {
    return loginData.filter(login => login.userId === userId);
  };

  const handleSignOut = () => {
    sessionStorage.removeItem("currentUser");
    localStorage.removeItem("currentUser");
    navigate('/login');
  };

  const currentUser = (() => {
    const sessionUser = sessionStorage.getItem("currentUser");
    const localUser = localStorage.getItem("currentUser");
    const raw = sessionUser || localUser;
    if (raw) {
      try {
        return JSON.parse(raw);
      } catch {
        return null;
      }
    }
    return null;
  })();

  if (!isVerifiedAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-center space-y-3">
          <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-lg bg-teal-50 text-teal-800 border border-teal-200">
            <ShieldAlert className="h-5 w-5" />
          </div>
          <p className="text-xs font-bold uppercase tracking-wider text-slate-700">Verifying Administrative Privileges…</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <Loader label="Synchronizing administrative datastores…" />
      </div>
    );
  }

  const meta = pageMeta[activeTab];
  const showSearch = activeTab !== 'overview';

  return (
    <AppShell
      sections={adminNav}
      activeId={activeTab}
      onSelect={setActiveTab}
      user={currentUser}
      roleLabel="System Administration"
      onSignOut={handleSignOut}
    >
      <div className="space-y-6">
        <header className="mb-8">
          <p className="eyebrow mb-2">Administrative Console</p>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">{meta.title}</h1>
          <p className="mt-2 text-sm text-slate-500">{meta.description}</p>
        </header>

        {showSearch && (
          <div className="relative max-w-md">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Filter by patient name, email, UID, or biomarker…"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="field pl-10 text-sm"
            />
          </div>
        )}

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Stat label="Registered Patients" value={stats.totalUsers || 0} sub={`+${stats.recentUsers || 0} this week`} subClass="text-blue-800" icon={Users} />
              <Stat label="Biomarker Panels" value={stats.totalLabEntries || 0} sub="Recorded serology panels" icon={TestTube} />
              <Stat label="Total Sign-In Events" value={stats.totalLogins || 0} sub={`${stats.activeToday || 0} active today`} subClass="text-emerald-800" icon={Activity} />
              <Stat label="Account Registrations" value={stats.totalSignups || 0} sub="Completed signups" icon={UserPlus} />
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              {/* Recent Biomarker Submissions */}
              <div className="rounded-lg border border-slate-200 bg-white overflow-hidden">
                <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50/50 px-5 py-4">
                  <h3 className="text-sm font-bold uppercase tracking-widest text-slate-900">Recent Biomarker Submissions</h3>
                  <span className="text-sm font-semibold text-slate-500">{labData.length} Total</span>
                </div>
                {labData.length === 0 ? (
                  <EmptyState
                    icon={FlaskConical}
                    title="No Biomarker Panels Logged"
                    description="Submitted patient serology panels will appear here."
                  />
                ) : (
                  <ul className="divide-y divide-slate-100 text-xs">
                    {labData.slice(0, 5).map(lab => {
                      const band = getRiskBand(lab);
                      return (
                        <li key={lab.id} className="flex items-center justify-between gap-3 px-4 py-3 hover:bg-slate-50/80 transition-colors">
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="font-mono font-bold text-slate-900">{shortId(lab.userId)}</span>
                              <Badge tone={band.tone} showDot>{band.label}</Badge>
                            </div>
                            <p className="mt-1 truncate text-[11px] text-slate-500 font-mono">
                              Age {lab.userAge || '—'} · RF {lab.rheumatoidFactor || '—'} · Anti-CCP {lab.antiCCP || '—'} · CRP {lab.cReactiveProtein || '—'} · ESR {lab.erythrocyteSedimentationRate || '—'}
                            </p>
                          </div>
                          <span className="shrink-0 text-[11px] font-medium text-slate-400">{formatDate(lab.createdAt)}</span>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>

              {/* Recent Access Events */}
              <div className="rounded-lg border border-slate-200 bg-white overflow-hidden">
                <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50/50 px-5 py-4">
                  <h3 className="text-sm font-bold uppercase tracking-widest text-slate-900">Recent Portal Authentication Events</h3>
                  <span className="text-sm font-semibold text-slate-500">{loginData.length} Total</span>
                </div>
                {loginData.length === 0 ? (
                  <EmptyState
                    icon={Activity}
                    title="No Authentication Logs"
                    description="Sign-in events will appear here in real-time."
                  />
                ) : (
                  <ul className="divide-y divide-slate-100 text-xs">
                    {loginData.slice(0, 5).map(login => (
                      <li key={login.id} className="flex items-center justify-between gap-3 px-4 py-3 hover:bg-slate-50/80 transition-colors">
                        <div className="min-w-0">
                          <p className="truncate font-bold text-slate-900">{login.email}</p>
                          <p className="font-mono text-[11px] text-slate-400">UID: {shortId(login.userId)}</p>
                        </div>
                        <span className="shrink-0 text-[11px] font-medium text-slate-400">{formatDateTime(login.timestamp)}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Patient Directory Tab */}
        {activeTab === 'patients' && (
          <div className="rounded-lg border border-slate-200 bg-white overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50/50 px-5 py-4">
              <h3 className="text-sm font-bold uppercase tracking-widest text-slate-900">Registered Patient Accounts</h3>
              <span className="text-sm font-semibold text-slate-500">{filteredUsers.length} Records</span>
            </div>

            {filteredUsers.length === 0 ? (
              <EmptyState
                icon={Users}
                title="No Patient Records Found"
                description={searchTerm ? 'No results matched your search criteria.' : 'Registered patient accounts will appear here.'}
              />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr>
                      <th scope="col" className="th">Patient Identity</th>
                      <th scope="col" className="th">Email Address</th>
                      <th scope="col" className="th">Registration Date</th>
                      <th scope="col" className="th">Panels Logged</th>
                      <th scope="col" className="th">Last Submission</th>
                      <th scope="col" className="th">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs">
                    {filteredUsers.map(userRecord => {
                      const userLabs = getUserLabEntries(userRecord.id);
                      const latestLab = userLabs[0];
                      return (
                        <tr key={userRecord.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="td font-bold text-slate-900">{userRecord.name || userRecord.displayName || 'Patient'}</td>
                          <td className="td font-medium text-slate-700">{userRecord.email}</td>
                          <td className="td text-slate-500">{formatDate(userRecord.joinedDate)}</td>
                          <td className="td">
                            <span className="inline-flex rounded-md border border-teal-200 bg-teal-50 px-2 py-0.5 text-xs font-bold text-teal-800">
                              {userLabs.length} Panels
                            </span>
                          </td>
                          <td className="td text-slate-500">{latestLab ? formatDate(latestLab.createdAt) : '—'}</td>
                          <td className="td">
                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() => setSelectedUser(userRecord)}
                                aria-label={`View record for ${userRecord.email}`}
                                className="rounded-md p-1.5 text-teal-800 hover:bg-teal-50 border border-transparent hover:border-teal-200 transition-colors"
                              >
                                <Eye className="h-3.5 w-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => deleteUser(userRecord.id)}
                                aria-label={`Delete record for ${userRecord.email}`}
                                className="rounded-md p-1.5 text-rose-700 hover:bg-rose-50 border border-transparent hover:border-rose-200 transition-colors"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Biomarker Submissions Log Tab */}
        {activeTab === 'labdata' && (
          <div className="rounded-lg border border-slate-200 bg-white overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50/50 px-5 py-4">
              <h3 className="text-sm font-bold uppercase tracking-widest text-slate-900">Biomarker Submission Audit Log</h3>
              <span className="text-sm font-semibold text-slate-500">{filteredLabs.length} Panels Logged</span>
            </div>

            {filteredLabs.length === 0 ? (
              <EmptyState
                icon={FlaskConical}
                title="No Submissions Found"
                description={searchTerm ? 'No lab entries matched your query.' : 'Submitted serology panels will appear here.'}
              />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr>
                      <th scope="col" className="th">Patient UID</th>
                      <th scope="col" className="th">Demographics</th>
                      <th scope="col" className="th">RF (IU/mL)</th>
                      <th scope="col" className="th">Anti-CCP (U/mL)</th>
                      <th scope="col" className="th">CRP (mg/L)</th>
                      <th scope="col" className="th">ESR (mm/hr)</th>
                      <th scope="col" className="th">Serological Band</th>
                      <th scope="col" className="th">Submission Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs">
                    {filteredLabs.map(lab => {
                      const band = getRiskBand(lab);
                      return (
                        <tr key={lab.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="td font-mono font-bold text-slate-900">{shortId(lab.userId)}</td>
                          <td className="td text-slate-700">{lab.userAge || '—'} yrs ({lab.userGender || '—'})</td>
                          <td className="td font-mono font-medium">{lab.rheumatoidFactor || '—'}</td>
                          <td className="td font-mono font-medium">{lab.antiCCP || '—'}</td>
                          <td className="td font-mono font-medium">{lab.cReactiveProtein || '—'}</td>
                          <td className="td font-mono font-medium">{lab.erythrocyteSedimentationRate || '—'}</td>
                          <td className="td">
                            <Badge tone={band.tone} showDot>{band.label}</Badge>
                          </td>
                          <td className="td text-slate-500">{formatDate(lab.createdAt)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Security & Access Audit Log Tab */}
        {activeTab === 'activity' && (
          <div className="space-y-6">
            <div className="rounded-lg border border-slate-200 bg-white overflow-hidden">
              <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50/50 px-5 py-4">
                <h3 className="text-sm font-bold uppercase tracking-widest text-slate-900">Portal Access Audit Trail</h3>
                <span className="text-sm font-semibold text-slate-500">{filteredLogins.length} Sign-In Events</span>
              </div>

              {filteredLogins.length === 0 ? (
                <EmptyState
                  icon={Activity}
                  title="No Authentication Events"
                  description={searchTerm ? 'No records matched your search.' : 'Sign-in activity will appear here.'}
                />
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr>
                        <th scope="col" className="th">Account Email</th>
                        <th scope="col" className="th">Patient UID</th>
                        <th scope="col" className="th">Authentication Timestamp</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs">
                      {filteredLogins.map(login => (
                        <tr key={login.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="td font-bold text-slate-900">{login.email}</td>
                          <td className="td font-mono text-slate-600">{shortId(login.userId)}</td>
                          <td className="td text-slate-500">{formatDateTime(login.timestamp)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="rounded-lg border border-slate-200 bg-white overflow-hidden">
              <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50/50 px-5 py-4">
                <h3 className="text-sm font-bold uppercase tracking-widest text-slate-900">Recent Registrations Audit</h3>
                <span className="text-sm font-semibold text-slate-500">{signupData.length} Signups</span>
              </div>

              {signupData.length === 0 ? (
                <EmptyState
                  icon={UserPlus}
                  title="No Registrations Recorded"
                  description="New patient signups will appear here."
                />
              ) : (
                <ul className="divide-y divide-slate-100 text-xs">
                  {signupData.slice(0, 6).map(signup => (
                    <li key={signup.id} className="flex items-center justify-between gap-3 px-5 py-3 hover:bg-slate-50/80 transition-colors">
                      <div className="min-w-0">
                        <p className="truncate font-bold text-slate-900">{signup.email || 'Registered Patient'}</p>
                        <p className="font-mono text-[11px] text-slate-400">UID: {shortId(signup.userId || signup.id)}</p>
                      </div>
                      <span className="shrink-0 text-[11px] text-slate-400">{formatDate(signup.createdAt)}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Patient Detail Modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm" role="dialog" aria-modal="true">
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-lg border border-slate-200 bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50/50 px-5 py-4">
              <h3 className="text-sm font-bold uppercase tracking-widest text-slate-900">Patient Record Inspection</h3>
              <button
                type="button"
                onClick={() => setSelectedUser(null)}
                aria-label="Close modal"
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-200 hover:text-slate-700 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4 p-5 text-sm">
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                <p className="text-xs font-bold uppercase tracking-widest text-slate-500">Patient UID</p>
                <p className="mt-1 font-mono text-sm font-bold text-slate-900">{selectedUser.id}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-lg border border-slate-200 p-3">
                  <p className="text-xs font-bold uppercase tracking-widest text-slate-500">Patient Name</p>
                  <p className="mt-1 text-sm font-bold text-slate-900">{selectedUser.name || selectedUser.displayName || 'N/A'}</p>
                </div>
                <div className="rounded-lg border border-slate-200 p-3">
                  <p className="text-xs font-bold uppercase tracking-widest text-slate-500">Email Address</p>
                  <p className="mt-1 break-all text-sm font-bold text-slate-900">{selectedUser.email}</p>
                </div>
                <div className="rounded-lg border border-slate-200 p-3">
                  <p className="text-xs font-bold uppercase tracking-widest text-slate-500">Joined Date</p>
                  <p className="mt-1 text-sm font-bold text-slate-900">{formatDate(selectedUser.joinedDate)}</p>
                </div>
                <div className="rounded-lg border border-slate-200 p-3">
                  <p className="text-xs font-bold uppercase tracking-widest text-slate-500">Sign-In Count</p>
                  <p className="mt-1 text-sm font-bold text-slate-900">{getUserLoginHistory(selectedUser.id).length} Sessions</p>
                </div>
              </div>

              <div className="border-t border-slate-200 pt-4">
                <div className="mb-3 flex items-center justify-between">
                  <h4 className="text-sm font-bold uppercase tracking-widest text-slate-900">Biomarker Panels Recorded</h4>
                  <span className="text-sm font-semibold text-slate-500">{getUserLabEntries(selectedUser.id).length} Panels</span>
                </div>

                {getUserLabEntries(selectedUser.id).length === 0 ? (
                  <p className="py-4 text-center text-sm text-slate-500">No laboratory submissions recorded for this patient.</p>
                ) : (
                  <div className="max-h-56 space-y-3 overflow-y-auto pr-1">
                    {getUserLabEntries(selectedUser.id).map(entry => {
                      const band = getRiskBand(entry);
                      return (
                        <div key={entry.id} className="rounded-lg border border-slate-200 p-3 bg-slate-50/30 space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-bold text-slate-900">{formatDate(entry.createdAt)}</span>
                            <Badge tone={band.tone} showDot>{band.label}</Badge>
                          </div>
                          <dl className="grid grid-cols-4 gap-2 text-xs">
                            <div>
                              <dt className="text-slate-500 font-medium">RF</dt>
                              <dd className="font-mono font-bold text-slate-900">{entry.rheumatoidFactor || '—'}</dd>
                            </div>
                            <div>
                              <dt className="text-slate-500 font-medium">Anti-CCP</dt>
                              <dd className="font-mono font-bold text-slate-900">{entry.antiCCP || '—'}</dd>
                            </div>
                            <div>
                              <dt className="text-slate-500 font-medium">CRP</dt>
                              <dd className="font-mono font-bold text-slate-900">{entry.cReactiveProtein || '—'}</dd>
                            </div>
                            <div>
                              <dt className="text-slate-500 font-medium">ESR</dt>
                              <dd className="font-mono font-bold text-slate-900">{entry.erythrocyteSedimentationRate || '—'}</dd>
                            </div>
                          </dl>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
};

export default Admin;