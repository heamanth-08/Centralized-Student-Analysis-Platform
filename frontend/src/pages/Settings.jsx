import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  Settings as SettingsIcon,
  Users,
  Shield,
  Save,
  Plus,
  Power,
  Sun,
  Moon,
  CheckCircle,
  X
} from 'lucide-react';

export default function Settings() {
  const { user, role, darkMode, toggleDarkMode } = useAuth();
  const isAdmin = role === 'admin';

  const [settingsData, setSettingsData] = useState({});
  const [usersList, setUsersList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savedNotice, setSavedNotice] = useState(false);

  // User modal
  const [showUserModal, setShowUserModal] = useState(false);
  const [userForm, setUserForm] = useState({
    username: '',
    email: '',
    password: '',
    full_name: '',
    role: 'faculty',
  });

  useEffect(() => {
    loadSettingsAndUsers();
  }, []);

  async function loadSettingsAndUsers() {
    try {
      setLoading(true);
      const s = await api.settings.get();
      setSettingsData(s);
      if (isAdmin) {
        const u = await api.users.list();
        setUsersList(u);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  const handleSaveThresholds = async (e) => {
    e.preventDefault();
    try {
      await api.settings.update('attendance_threshold', settingsData.attendance_threshold);
      await api.settings.update('at_risk_gpa_threshold', settingsData.at_risk_gpa_threshold);
      setSavedNotice(true);
      setTimeout(() => setSavedNotice(false), 3000);
    } catch (err) {
      alert(err.message || 'Failed to update settings');
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      await api.users.create(userForm);
      setShowUserModal(false);
      setUserForm({ username: '', email: '', password: '', full_name: '', role: 'faculty' });
      loadSettingsAndUsers();
    } catch (err) {
      alert(err.message || 'Failed to create user');
    }
  };

  const handleToggleUserActive = async (u) => {
    if (u.id === user.id) {
      alert('Cannot deactivate your own account.');
      return;
    }
    try {
      await api.users.update(u.id, { is_active: !u.is_active });
      loadSettingsAndUsers();
    } catch (err) {
      alert(err.message || 'Failed to update user');
    }
  };

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Settings Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
        <h3 className="font-bold text-sm text-slate-900 dark:text-white">
          System Configuration & Role Permissions
        </h3>
        <p className="text-xs text-slate-500 mt-1">
          Configure institutional thresholds, manage authorized staff access, and view permission policies.
        </p>
      </div>

      {/* Thresholds Form */}
      {isAdmin && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100 dark:border-slate-800">
            <h4 className="font-bold text-xs uppercase text-slate-700 dark:text-slate-300">
              Configurable Review Thresholds
            </h4>
            {savedNotice && (
              <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
                <CheckCircle size={14} /> Thresholds updated successfully
              </span>
            )}
          </div>

          <form onSubmit={handleSaveThresholds} className="space-y-4 max-w-lg text-xs">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                  Attendance Review Threshold (%)
                </label>
                <input
                  type="number"
                  step="0.5"
                  min="40"
                  max="100"
                  value={settingsData.attendance_threshold || '75.0'}
                  onChange={(e) =>
                    setSettingsData({ ...settingsData, attendance_threshold: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
                <span className="text-[10px] text-slate-400">Default: 75.0%</span>
              </div>

              <div>
                <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                  At-Risk CGPA Threshold
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="1"
                  max="10"
                  value={settingsData.at_risk_gpa_threshold || '5.0'}
                  onChange={(e) =>
                    setSettingsData({ ...settingsData, at_risk_gpa_threshold: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
                <span className="text-[10px] text-slate-400">Default: 5.0 (out of 10)</span>
              </div>
            </div>

            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-sm flex items-center gap-1.5"
            >
              <Save size={14} /> Save Threshold Settings
            </button>
          </form>
        </div>
      )}

      {/* User Accounts Management (Admin) */}
      {isAdmin && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <h4 className="font-bold text-xs uppercase text-slate-700 dark:text-slate-300">
              User Accounts & Access Control ({usersList.length})
            </h4>
            <button
              onClick={() => setShowUserModal(true)}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1 shadow-sm"
            >
              <Plus size={14} /> Create User Account
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="py-3 px-4">Username</th>
                  <th className="py-3 px-4">Full Name</th>
                  <th className="py-3 px-4">Email</th>
                  <th className="py-3 px-4">Assigned Role</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {usersList.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="py-3 px-4 font-mono font-bold text-blue-600">{u.username}</td>
                    <td className="py-3 px-4 font-medium text-slate-900 dark:text-white">{u.full_name}</td>
                    <td className="py-3 px-4 text-slate-500">{u.email}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 capitalize border border-slate-200 dark:border-slate-700">
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                          u.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {u.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      {u.id !== user?.id && (
                        <button
                          onClick={() => handleToggleUserActive(u)}
                          className={`p-1.5 rounded transition ${
                            u.is_active ? 'text-slate-400 hover:text-red-600' : 'text-slate-400 hover:text-emerald-600'
                          }`}
                          title={u.is_active ? 'Deactivate' : 'Activate'}
                        >
                          <Power size={15} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Permissions Matrix Reference */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm overflow-hidden">
        <h4 className="font-bold text-xs uppercase text-slate-700 dark:text-slate-300 mb-2">
          Role-Based Access Control (RBAC) Permission Matrix
        </h4>
        <p className="text-xs text-slate-500 mb-3">
          Enforced strictly on the Python FastAPI backend for every API endpoint.
        </p>

        <div className="overflow-x-auto border border-slate-100 dark:border-slate-800 rounded-lg">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 font-semibold uppercase tracking-wider">
              <tr>
                <th className="py-2.5 px-3">System Capability</th>
                <th className="py-2.5 px-3 text-center">Admin</th>
                <th className="py-2.5 px-3 text-center">Coordinator</th>
                <th className="py-2.5 px-3 text-center">Faculty</th>
                <th className="py-2.5 px-3 text-center">Student</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {[
                ['Manage Users, Roles & Thresholds', '✔', '—', '—', '—'],
                ['Create / Update / Deactivate Students', '✔', '—', '—', '—'],
                ['View Student Records & Analytics', 'All', 'Own Department', 'Assigned Courses', 'Self Only'],
                ['Import Data (CSV/Excel)', '✔', '—', '—', '—'],
                ['Log Support Flags & Interventions', '✔', 'View Only', 'Record / Update', '—'],
                ['Stride Point Award & Auditable Reversals', '✔', 'Propose', 'Propose', 'View Own'],
                ['Export Institutional Reports', 'All', 'Own Department', 'Permitted Scope', 'Own Approved'],
              ].map(([cap, a, c, f, s], i) => (
                <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                  <td className="py-2.5 px-3 font-medium text-slate-800 dark:text-slate-200">{cap}</td>
                  <td className="py-2.5 px-3 text-center font-bold text-blue-600">{a}</td>
                  <td className="py-2.5 px-3 text-center">{c}</td>
                  <td className="py-2.5 px-3 text-center">{f}</td>
                  <td className="py-2.5 px-3 text-center">{s}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Create User */}
      {showUserModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-sm w-full p-6 relative">
            <button
              onClick={() => setShowUserModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
            >
              <X size={20} />
            </button>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-3">Create User Account</h3>
            <form onSubmit={handleCreateUser} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1">Username *</label>
                <input
                  type="text"
                  required
                  value={userForm.username}
                  onChange={(e) => setUserForm({ ...userForm, username: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={userForm.full_name}
                  onChange={(e) => setUserForm({ ...userForm, full_name: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">Email *</label>
                <input
                  type="email"
                  required
                  value={userForm.email}
                  onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">Password *</label>
                <input
                  type="password"
                  required
                  value={userForm.password}
                  onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">Role *</label>
                <select
                  value={userForm.role}
                  onChange={(e) => setUserForm({ ...userForm, role: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                >
                  <option value="admin">Administrator</option>
                  <option value="faculty">Faculty</option>
                  <option value="coordinator">Department Coordinator</option>
                  <option value="student">Student</option>
                </select>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowUserModal(false)}
                  className="px-3 py-1.5 border rounded-lg"
                >
                  Cancel
                </button>
                <button type="submit" className="px-3 py-1.5 bg-blue-600 text-white rounded-lg">
                  Create User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
