import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { GraduationCap, ShieldCheck, UserCheck, Lock, Sun, Moon, ArrowRight } from 'lucide-react';

export default function Login() {
  const { login, demoLogin, darkMode, toggleDarkMode } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(username, password);
    } catch (err) {
      setError(err.message || 'Invalid username or password');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async (role) => {
    setError('');
    setLoading(true);
    try {
      await demoLogin(role);
    } catch (err) {
      setError(err.message || 'Demo login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center p-4 bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 relative">
      {/* Theme toggle in corner */}
      <button
        onClick={toggleDarkMode}
        className="absolute top-6 right-6 p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 shadow-sm"
        title="Toggle Theme"
      >
        {darkMode ? <Sun size={18} className="text-amber-400" /> : <Moon size={18} />}
      </button>

      <div className="max-w-md w-full bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-xl">
        {/* Logo and Brand */}
        <div className="text-center space-y-2 mb-6">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-tr from-blue-700 to-indigo-500 text-white flex items-center justify-center font-extrabold text-2xl shadow-lg shadow-blue-500/25">
            CIQ
          </div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
            CampusIQ Login
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Centralised Student Analysis Platform
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-300 text-xs font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
              Institutional Username
            </label>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="e.g. admin or faculty.cs"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold rounded-xl shadow-md shadow-blue-600/20 transition flex items-center justify-center gap-1.5"
          >
            {loading ? 'Authenticating...' : 'Sign In'}
            <ArrowRight size={14} />
          </button>
        </form>

        {/* Demo Fast Login Buttons */}
        <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider text-center mb-3">
            Quick Demo Accounts (Evaluation)
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              onClick={() => handleQuickLogin('admin')}
              className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 hover:bg-blue-50 hover:border-blue-300 dark:hover:bg-slate-800 text-left transition"
            >
              <div className="font-bold text-slate-900 dark:text-white">Administrator</div>
              <div className="text-[10px] text-slate-500">Dr. Eleanor Vance</div>
            </button>
            <button
              onClick={() => handleQuickLogin('faculty')}
              className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 hover:bg-blue-50 hover:border-blue-300 dark:hover:bg-slate-800 text-left transition"
            >
              <div className="font-bold text-slate-900 dark:text-white">Faculty</div>
              <div className="text-[10px] text-slate-500">Prof. Alan Turing</div>
            </button>
            <button
              onClick={() => handleQuickLogin('coordinator')}
              className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 hover:bg-blue-50 hover:border-blue-300 dark:hover:bg-slate-800 text-left transition"
            >
              <div className="font-bold text-slate-900 dark:text-white">Coordinator</div>
              <div className="text-[10px] text-slate-500">Dr. Grace Hopper</div>
            </button>
            <button
              onClick={() => handleQuickLogin('student')}
              className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 hover:bg-blue-50 hover:border-blue-300 dark:hover:bg-slate-800 text-left transition"
            >
              <div className="font-bold text-slate-900 dark:text-white">Student</div>
              <div className="text-[10px] text-slate-500">Alex Mercer</div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
