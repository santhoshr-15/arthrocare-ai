import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Activity, TestTube, BarChart3, UserPlus, Search, Eye, Trash2, FlaskConical, X } from 'lucide-react';
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
  if (!lab) return { label: 'No data', tone: 'slate' };
  const checks = [
    parseFloat(lab.rheumatoidFactor),
    parseFloat(lab.antiCCP),
    parseFloat(lab.cReactiveProtein),
    parseFloat(lab.erythrocyteSedimentationRate)
  ];
  const thresholds = [14, 20, 3.0, 20];
  const elevated = checks.filter((v, i) => !Number.isNaN(v) && v > thresholds[i]).length;

  if (elevated >= 3) return { label: 'Elevated (3-4 markers)', tone: 'rose' };
  if (elevated === 2) return { label: 'Moderate (2 markers)', tone: 'orange' };
  if (elevated === 1) return { label: 'Mild (1 marker)', tone: 'amber' };
  return { label: 'Within reference range', tone: 'emerald' };
};

const adminNav = [
  { id: 'overview', label: 'System overview', icon: BarChart3 },
  { id: 'patients', label: 'Patient directory', icon: Users },
  { id: 'labdata', label: 'Biomarker submissions', icon: TestTube },
  { id: 'activity', label: 'Access audit', icon: Activity }
];

const pageMeta = {
  overview: { title: 'System overview', description: 'High-level activity across patients, serology panels, and portal access.' },
  patients: { title: 'Patient directory', description: 'Registered patient accounts with submission history and actions.' },
  labdata: { title: 'Biomarker submissions', description: 'All recorded serology panels with clinical status classification.' },
  activity: { title: 'Access audit', description: 'Portal sign-in events and recent registrations.' }
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
    if (window.confirm('Are you sure you want to delete this patient record?')) {
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
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-slate-300 border-t-teal-600" />
          <p className="mt-3 text-sm font-medium text-slate-500">Verifying admin access…</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <Loader label="Loading system data…" />
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
      roleLabel="Admin console"
      onSignOut={handleSignOut}
    >
      <div className="space-y-6">
        <header className="mb-6">
          <p className="eyebrow mb-2">Admin console</p>
          <h1 className="text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl">{meta.title}</h1>
          <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-slate-500">{meta.description}</p>
        </header>

        {showSearch && (
          <div className="relative max-w-md">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name, email, UID, or biomarker panel…"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="field pl-10"
            />
          </div>
        )}

        {/* Overview */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Stat label="Registered patients" value={stats.totalUsers || 0} sub={`+${stats.recentUsers || 0} this week`} subClass="text-teal-700" />
              <Stat label="Biomarker panels" value={stats.totalLabEntries || 0} sub="Recorded serology panels" />
              <Stat label="Total login events" value={stats.totalLogins || 0} sub={`${stats.activeToday || 0} active today`} subClass="text-emerald-700" />
              <Stat label="Signups recorded" value={stats.totalSignups || 0} sub="Completed registrations" />
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              {/* Recent biomarker submissions */}
              <div className="rounded-xl border border-slate-200 bg-white">
                <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
                  <h3 className="text-sm font-semibold text-slate-900">Recent biomarker submissions</h3>
                  <span className="text-xs text-slate-500">{labData.length} total</span>
                </div>
                {labData.length === 0 ? (
                  <EmptyState
                    icon={FlaskConical}
                    title="No biomarker panels yet"
                    description="Submitted serology panels from the patient portal will appear here."
                  />
                ) : (
                  <ul className="divide-y divide-slate-100">
                    {labData.slice(0, 5).map(lab => {
                      const band = getRiskBand(lab);
                      return (
                        <li key={lab.id} className="flex items-center justify-between gap-3 px-5 py-3">
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="font-mono text-sm font-semibold text-slate-900">{shortId(lab.userId)}</span>
                              <Badge tone={band.tone}>{band.label}</Badge>
                            </div>
                            <p className="mt-0.5 truncate text-xs text-slate-500">
                              Age {lab.userAge || '—'} · RF {lab.rheumatoidFactor || '—'} · Anti-CCP {lab.antiCCP || '—'} · CRP {lab.cReactiveProtein || '—'} · ESR {lab.erythrocyteSedimentationRate || '—'}
                            </p>
                          </div>
                          <span className="shrink-0 text-xs text-slate-400">{formatDate(lab.createdAt)}</span>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>

              {/* Recent access events */}
              <div className="rounded-xl border border-slate-200 bg-white">
                <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
                  <h3 className="text-sm font-semibold text-slate-900">Recent portal access events</h3>
                  <span className="text-xs text-slate-500">{loginData.length} total</span>
                </div>
                {loginData.length === 0 ? (
                  <EmptyState
                    icon={Activity}
                    title="No access events yet"
                    description="Sign-in activity across the patient portal will appear here."
                  />
                ) : (
                  <ul className="divide-y divide-slate-100">
                    {loginData.slice(0, 5).map(login => (
                      <li key={login.id} className="flex items-center justify-between gap-3 px-5 py-3">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-slate-900">{login.email}</p>
                          <p className="font-mono text-xs text-slate-400">{shortId(login.userId)}</p>
                        </div>
                        <span className="shrink-0 text-xs text-slate-400">{formatDateTime(login.timestamp)}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Patient directory */}
        {activeTab === 'patients' && (
          <div className="rounded-xl border border-slate-200 bg-white">
            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
              <h3 className="text-sm font-semibold text-slate-900">Registered patient directory</h3>
              <span className="text-xs text-slate-500">{filteredUsers.length} records</span>
            </div>

            {filteredUsers.length === 0 ? (
              <EmptyState
                icon={Users}
                title="No patients found"
                description={searchTerm ? 'Try a different search term.' : 'Registered patient accounts will appear here.'}
              />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th scope="col" className="th">Patient</th>
                      <th scope="col" className="th">Email</th>
                      <th scope="col" className="th">Joined</th>
                      <th scope="col" className="th">Panels</th>
                      <th scope="col" className="th">Last submission</th>
                      <th scope="col" className="th">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredUsers.map(userRecord => {
                      const userLabs = getUserLabEntries(userRecord.id);
                      const latestLab = userLabs[0];
                      return (
                        <tr key={userRecord.id} className="hover:bg-slate-50">
                          <td className="td font-semibold text-slate-900">{userRecord.name || userRecord.displayName || 'Patient'}</td>
                          <td className="td">{userRecord.email}</td>
                          <td className="td text-slate-500">{formatDate(userRecord.joinedDate)}</td>
                          <td className="td">
                            <span className="inline-flex rounded-md border border-teal-200 bg-teal-50 px-2 py-0.5 text-xs font-semibold text-teal-800">
                              {userLabs.length}
                            </span>
                          </td>
                          <td className="td text-slate-500">{latestLab ? formatDate(latestLab.createdAt) : '—'}</td>
                          <td className="td">
                            <div className="flex gap-1">
                              <button
                                type="button"
                                onClick={() => setSelectedUser(userRecord)}
                                aria-label={`View details for ${userRecord.email}`}
                                className="rounded-md p-1.5 text-teal-700 hover:bg-teal-50"
                              >
                                <Eye className="h-4 w-4" />
                              </button>
                              <button
                                type="button"
                                onClick={() => deleteUser(userRecord.id)}
                                aria-label={`Delete record for ${userRecord.email}`}
                                className="rounded-md p-1.5 text-rose-600 hover:bg-rose-50"
                              >
                                <Trash2 className="h-4 w-4" />
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

        {/* Biomarker submissions */}
        {activeTab === 'labdata' && (
          <div className="rounded-xl border border-slate-200 bg-white">
            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
              <h3 className="text-sm font-semibold text-slate-900">Biomarker submission log</h3>
              <span className="text-xs text-slate-500">{filteredLabs.length} panels</span>
            </div>

            {filteredLabs.length === 0 ? (
              <EmptyState
                icon={FlaskConical}
                title="No biomarker submissions"
                description={searchTerm ? 'Try a different search term.' : 'Submitted serology panels will appear here.'}
              />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th scope="col" className="th">Patient ID</th>
                      <th scope="col" className="th">Age / sex</th>
                      <th scope="col" className="th">RF (IU/mL)</th>
                      <th scope="col" className="th">Anti-CCP (U/mL)</th>
                      <th scope="col" className="th">CRP (mg/L)</th>
                      <th scope="col" className="th">ESR (mm/hr)</th>
                      <th scope="col" className="th">Clinical status</th>
                      <th scope="col" className="th">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredLabs.map(lab => {
                      const band = getRiskBand(lab);
                      return (
                        <tr key={lab.id} className="hover:bg-slate-50">
                          <td className="td font-mono font-semibold text-slate-900">{shortId(lab.userId)}</td>
                          <td className="td">{lab.userAge || '—'} / {lab.userGender || '—'}</td>
                          <td className="td font-mono">{lab.rheumatoidFactor || '—'}</td>
                          <td className="td font-mono">{lab.antiCCP || '—'}</td>
                          <td className="td font-mono">{lab.cReactiveProtein || '—'}</td>
                          <td className="td font-mono">{lab.erythrocyteSedimentationRate || '—'}</td>
                          <td className="td">
                            <Badge tone={band.tone}>{band.label}</Badge>
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

        {/* Access audit */}
        {activeTab === 'activity' && (
          <div className="space-y-6">
            <div className="rounded-xl border border-slate-200 bg-white">
              <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
                <h3 className="text-sm font-semibold text-slate-900">Portal access audit trail</h3>
                <span className="text-xs text-slate-500">{filteredLogins.length} sessions</span>
              </div>

              {filteredLogins.length === 0 ? (
                <EmptyState
                  icon={Activity}
                  title="No access events"
                  description={searchTerm ? 'Try a different search term.' : 'Sign-in activity will appear here.'}
                />
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-slate-200">
                        <th scope="col" className="th">Email</th>
                        <th scope="col" className="th">User ID</th>
                        <th scope="col" className="th">Sign-in time</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredLogins.map(login => (
                        <tr key={login.id} className="hover:bg-slate-50">
                          <td className="td font-semibold text-slate-900">{login.email}</td>
                          <td className="td font-mono">{shortId(login.userId)}</td>
                          <td className="td text-slate-500">{formatDateTime(login.timestamp)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="rounded-xl border border-slate-200 bg-white">
              <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
                <h3 className="text-sm font-semibold text-slate-900">Recent registrations</h3>
                <span className="text-xs text-slate-500">{signupData.length} signups</span>
              </div>

              {signupData.length === 0 ? (
                <EmptyState
                  icon={UserPlus}
                  title="No registrations yet"
                  description="New patient registrations will appear here."
                />
              ) : (
                <ul className="divide-y divide-slate-100">
                  {signupData.slice(0, 6).map(signup => (
                    <li key={signup.id} className="flex items-center justify-between gap-3 px-5 py-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-slate-900">{signup.email || 'Registered patient'}</p>
                        <p className="font-mono text-xs text-slate-400">{shortId(signup.userId || signup.id)}</p>
                      </div>
                      <span className="shrink-0 text-xs text-slate-400">{formatDate(signup.createdAt)}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Patient detail modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4" role="dialog" aria-modal="true">
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl border border-slate-200 bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
              <h3 className="text-sm font-semibold text-slate-900">Patient record details</h3>
              <button
                type="button"
                onClick={() => setSelectedUser(null)}
                aria-label="Close details"
                className="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4 p-5">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Patient UID</p>
                <p className="mt-0.5 font-mono text-sm font-semibold text-slate-900">{selectedUser.id}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Name</p>
                  <p className="mt-0.5 text-sm font-semibold text-slate-900">{selectedUser.name || selectedUser.displayName || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Email</p>
                  <p className="mt-0.5 break-all text-sm font-semibold text-slate-900">{selectedUser.email}</p>
                </div>
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Joined date</p>
                  <p className="mt-0.5 text-sm font-semibold text-slate-900">{formatDate(selectedUser.joinedDate)}</p>
                </div>
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Total logins</p>
                  <p className="mt-0.5 text-sm font-semibold text-slate-900">{getUserLoginHistory(selectedUser.id).length}</p>
                </div>
              </div>

              <div className="border-t border-slate-200 pt-4">
                <div className="mb-3 flex items-center justify-between">
                  <h4 className="text-sm font-semibold text-slate-900">Biomarker submission history</h4>
                  <span className="text-xs text-slate-500">{getUserLabEntries(selectedUser.id).length} panel(s)</span>
                </div>

                {getUserLabEntries(selectedUser.id).length === 0 ? (
                  <p className="py-4 text-center text-sm text-slate-500">No lab submissions recorded for this patient.</p>
                ) : (
                  <div className="max-h-56 space-y-2 overflow-y-auto pr-1">
                    {getUserLabEntries(selectedUser.id).map(entry => {
                      const band = getRiskBand(entry);
                      return (
                        <div key={entry.id} className="rounded-lg border border-slate-200 p-3">
                          <div className="mb-2 flex items-center justify-between">
                            <span className="text-xs font-semibold text-slate-900">{formatDate(entry.createdAt)}</span>
                            <Badge tone={band.tone}>{band.label}</Badge>
                          </div>
                          <dl className="grid grid-cols-4 gap-2 text-xs">
                            <div>
                              <dt className="text-slate-400">RF</dt>
                              <dd className="font-mono font-semibold text-slate-800">{entry.rheumatoidFactor || '—'}</dd>
                            </div>
                            <div>
                              <dt className="text-slate-400">Anti-CCP</dt>
                              <dd className="font-mono font-semibold text-slate-800">{entry.antiCCP || '—'}</dd>
                            </div>
                            <div>
                              <dt className="text-slate-400">CRP</dt>
                              <dd className="font-mono font-semibold text-slate-800">{entry.cReactiveProtein || '—'}</dd>
                            </div>
                            <div>
                              <dt className="text-slate-400">ESR</dt>
                              <dd className="font-mono font-semibold text-slate-800">{entry.erythrocyteSedimentationRate || '—'}</dd>
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