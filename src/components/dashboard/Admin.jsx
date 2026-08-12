import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  Activity,
  TestTube,
  RefreshCw,
  User,
  Search,
  Trash2,
  Eye,
  BarChart3,
  LogIn,
  UserPlus,
  Calendar,
  ShieldCheck,
  Stethoscope,
  X
} from 'lucide-react';
import { 
  collection, 
  query, 
  getDocs, 
  doc, 
  deleteDoc, 
  orderBy,
  getDoc
} from "firebase/firestore";
import { auth, db } from "../../firebase/config";

const Admin = () => {
  const navigate = useNavigate();
  const [isVerifiedAdmin, setIsVerifiedAdmin] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [users, setUsers] = useState([]);
  const [labData, setLabData] = useState([]);
  const [loginData, setLoginData] = useState([]);
  const [signupData, setSignupData] = useState([]);
  const [personalInfo, setPersonalInfo] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);

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
  }, [navigate]);

  const loadAllData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        loadUsers(),
        loadLabData(),
        loadLoginData(),
        loadSignupData(),
        loadPersonalInfo()
      ]);
      loadStats();
    } catch (error) {
      console.error('Error loading admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      const usersQuery = query(collection(db, "users"));
      const snapshot = await getDocs(usersQuery);
      const usersData = snapshot.docs.map(docSnapshot => ({
        id: docSnapshot.id,
        ...docSnapshot.data(),
        joinedDate: docSnapshot.data().createdAt?.toDate?.() || new Date()
      }));
      setUsers(usersData);
    } catch (error) {
      console.error('Error loading users:', error);
    }
  };

  const loadLabData = async () => {
    try {
      const labQuery = query(collection(db, "LabInformation"), orderBy("createdAt", "desc"));
      const snapshot = await getDocs(labQuery);
      const labDataList = snapshot.docs.map(docSnapshot => ({
        id: docSnapshot.id,
        ...docSnapshot.data(),
        createdAt: docSnapshot.data().createdAt?.toDate?.() || new Date()
      }));
      setLabData(labDataList);
    } catch (error) {
      console.error('Error loading lab data:', error);
    }
  };

  const loadLoginData = async () => {
    try {
      const loginQuery = query(collection(db, "login"), orderBy("timestamp", "desc"));
      const snapshot = await getDocs(loginQuery);
      const loginDataList = snapshot.docs.map(docSnapshot => ({
        id: docSnapshot.id,
        ...docSnapshot.data(),
        timestamp: docSnapshot.data().timestamp?.toDate?.() || new Date()
      }));
      setLoginData(loginDataList);
    } catch (error) {
      console.error('Error loading login data:', error);
    }
  };

  const loadSignupData = async () => {
    try {
      const signupQuery = query(collection(db, "signup"), orderBy("createdAt", "desc"));
      const snapshot = await getDocs(signupQuery);
      const signupDataList = snapshot.docs.map(docSnapshot => ({
        id: docSnapshot.id,
        ...docSnapshot.data(),
        createdAt: docSnapshot.data().createdAt?.toDate?.() || new Date()
      }));
      setSignupData(signupDataList);
    } catch (error) {
      console.error('Error loading signup data:', error);
    }
  };

  const loadPersonalInfo = async () => {
    try {
      const personalQuery = query(collection(db, "personalInformation"));
      const snapshot = await getDocs(personalQuery);
      const personalData = snapshot.docs.map(docSnapshot => ({
        id: docSnapshot.id,
        ...docSnapshot.data(),
        updatedAt: docSnapshot.data().updatedAt?.toDate?.() || new Date()
      }));
      setPersonalInfo(personalData);
    } catch (error) {
      console.error('Error loading personal info:', error);
    }
  };

  const loadStats = () => {
    const totalUsers = users.length;
    const totalLabEntries = labData.length;
    const totalLogins = loginData.length;
    const totalSignups = signupData.length;
    
    const today = new Date();
    const lastWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    const recentUsers = users.filter(user => 
      new Date(user.joinedDate) > lastWeek
    ).length;
    
    const activeToday = loginData.filter(login => 
      new Date(login.timestamp).toDateString() === today.toDateString()
    ).length;

    setStats({
      totalUsers,
      totalLabEntries,
      totalLogins,
      totalSignups,
      recentUsers,
      activeToday
    });
  };

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

  const getUserLabEntries = (userId) => {
    return labData.filter(lab => lab.userId === userId);
  };

  const getUserLoginHistory = (userId) => {
    return loginData.filter(login => login.userId === userId);
  };

  if (!isVerifiedAdmin) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-3 border-teal-700 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Verifying Admin Access...</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-3 border-teal-700 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Loading System Data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-teal-700 rounded-xl flex items-center justify-center text-white shadow-sm">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">Clinical Administration & Audit Console</h1>
              <p className="text-xs text-slate-500">Monitor system activity, patient records, and serology submissions</p>
            </div>
          </div>

          <button
            onClick={loadAllData}
            className="px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 font-semibold rounded-xl text-xs transition-colors flex items-center space-x-2 shadow-sm"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh Audit Trail</span>
          </button>
        </div>

        {/* Tab Controls */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-3 flex flex-wrap gap-2 text-xs font-semibold">
          {[
            { id: 'dashboard', label: 'System Overview', icon: BarChart3 },
            { id: 'users', label: 'Patient Directory', icon: Users },
            { id: 'labdata', label: 'Biomarker Submissions', icon: TestTube },
            { id: 'activity', label: 'Access Audit', icon: Activity }
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl transition-all ${
                  isActive ? 'bg-teal-700 text-white shadow-sm' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Search */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-4">
          <div className="relative max-w-md text-xs">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name, email, or UID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50/60 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/30"
            />
          </div>
        </div>

        {/* Overview Tab */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
              <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm space-y-1">
                <span className="text-slate-500 font-medium">Registered Patients</span>
                <div className="text-2xl font-extrabold text-slate-900">{stats.totalUsers || 0}</div>
                <div className="text-[11px] text-teal-700 font-semibold">+{stats.recentUsers || 0} this week</div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm space-y-1">
                <span className="text-slate-500 font-medium">Lab Submissions</span>
                <div className="text-2xl font-extrabold text-slate-900">{stats.totalLabEntries || 0}</div>
                <div className="text-[11px] text-slate-500 font-medium">Recorded serology panels</div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm space-y-1">
                <span className="text-slate-500 font-medium">Total Login Events</span>
                <div className="text-2xl font-extrabold text-slate-900">{stats.totalLogins || 0}</div>
                <div className="text-[11px] text-emerald-700 font-semibold">{stats.activeToday || 0} active today</div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm space-y-1">
                <span className="text-slate-500 font-medium">Signups Recorded</span>
                <div className="text-2xl font-extrabold text-slate-900">{stats.totalSignups || 0}</div>
                <div className="text-[11px] text-slate-500 font-medium">Completed registrations</div>
              </div>
            </div>

            <div className="grid lg:grid-cols-2 gap-6 text-xs">
              <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-sm space-y-4">
                <h3 className="font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-3">Recent Lab Submissions</h3>
                <div className="space-y-2">
                  {labData.slice(0, 5).map(lab => (
                    <div key={lab.id} className="flex justify-between items-center p-3 bg-slate-50 rounded-xl border border-slate-200">
                      <div>
                        <div className="font-bold text-slate-900 font-mono">{lab.userId?.substring(0, 10)}...</div>
                        <div className="text-slate-500 text-[11px]">Age: {lab.userAge} • RF: {lab.rheumatoidFactor} IU/mL</div>
                      </div>
                      <span className="text-slate-400 font-medium text-[11px]">{new Date(lab.createdAt).toLocaleDateString()}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-sm space-y-4">
                <h3 className="font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-3">Recent Portal Access Events</h3>
                <div className="space-y-2">
                  {loginData.slice(0, 5).map(login => (
                    <div key={login.id} className="flex justify-between items-center p-3 bg-slate-50 rounded-xl border border-slate-200">
                      <div className="font-semibold text-slate-800">{login.email}</div>
                      <div className="text-slate-400 font-medium text-[11px]">{new Date(login.timestamp).toLocaleString()}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Directory Tab */}
        {activeTab === 'users' && (
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900">Registered Patient Directory</h3>
              <span className="text-slate-500 font-medium">{filteredUsers.length} records</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                    <th className="py-2.5 px-3">Patient</th>
                    <th className="py-2.5 px-3">Email</th>
                    <th className="py-2.5 px-3">Joined Date</th>
                    <th className="py-2.5 px-3">Lab Entries</th>
                    <th className="py-2.5 px-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredUsers.map(userRecord => {
                    const userLabs = getUserLabEntries(userRecord.id);
                    return (
                      <tr key={userRecord.id} className="hover:bg-slate-50">
                        <td className="py-2.5 px-3 font-semibold text-slate-900">{userRecord.name || userRecord.displayName || 'Patient'}</td>
                        <td className="py-2.5 px-3 text-slate-600">{userRecord.email}</td>
                        <td className="py-2.5 px-3 text-slate-500">{new Date(userRecord.joinedDate).toLocaleDateString()}</td>
                        <td className="py-2.5 px-3">
                          <span className="bg-teal-50 text-teal-800 border border-teal-200 px-2 py-0.5 rounded font-bold">
                            {userLabs.length}
                          </span>
                        </td>
                        <td className="py-2.5 px-3">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => setSelectedUser(userRecord)}
                              className="p-1.5 text-teal-700 hover:bg-teal-50 rounded"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => deleteUser(userRecord.id)}
                              className="p-1.5 text-rose-600 hover:bg-rose-50 rounded"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Modal */}
        {selectedUser && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-lg w-full p-6 space-y-4 text-xs">
              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <h3 className="font-bold text-slate-900 text-sm">Patient Record Details</h3>
                <button onClick={() => setSelectedUser(null)} className="text-slate-400 hover:text-slate-600">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                  <span className="text-slate-400 font-bold uppercase">Patient UID</span>
                  <div className="font-mono font-bold text-slate-900">{selectedUser.id}</div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-slate-400 font-bold uppercase">Name</span>
                    <div className="font-semibold text-slate-900 mt-0.5">{selectedUser.name || selectedUser.displayName || 'N/A'}</div>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-slate-400 font-bold uppercase">Email</span>
                    <div className="font-semibold text-slate-900 mt-0.5">{selectedUser.email}</div>
                  </div>
                </div>

                <div className="p-3 bg-teal-50/70 border border-teal-200/80 rounded-xl flex justify-between items-center">
                  <span className="text-teal-900 font-bold">Total Lab Submissions:</span>
                  <span className="font-extrabold text-teal-800 text-sm">{getUserLabEntries(selectedUser.id).length}</span>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default Admin;