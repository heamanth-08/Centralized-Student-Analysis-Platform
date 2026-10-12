import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import {
  Users,
  Building2,
  GraduationCap,
  CalendarCheck,
  AlertTriangle,
  Award,
  ArrowRight,
  TrendingUp,
  Activity,
  CheckCircle2,
  Clock
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';

export default function Dashboard({ onNavigate }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchDashboard() {
      try {
        setLoading(true);
        const res = await api.analytics.getDashboard();
        setData(res);
      } catch (e) {
        setError(e.message || 'Failed to load dashboard analytics');
      } finally {
        setLoading(false);
      }
    }
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm font-medium text-slate-500">Aggregating institutional analytics...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 rounded-xl text-red-700 dark:text-red-300">
        <h3 className="font-bold flex items-center gap-2">
          <AlertTriangle size={18} /> Error loading dashboard
        </h3>
        <p className="text-sm mt-1">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-3 px-3 py-1.5 text-xs font-semibold bg-red-600 text-white rounded-lg hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    );
  }

  const kpis = [
    {
      title: 'Active Students',
      value: data?.total_students || 0,
      sub: `${data?.total_departments || 0} Departments • ${data?.total_courses || 0} Courses`,
      icon: Users,
      color: 'from-blue-600 to-indigo-600',
      action: () => onNavigate('students'),
    },
    {
      title: 'Average Academic CGPA',
      value: data?.average_cgpa ? `${data.average_cgpa} / 10` : 'N/A',
      sub: 'Computed across active semester',
      icon: GraduationCap,
      color: 'from-emerald-600 to-teal-600',
      action: () => onNavigate('academic'),
    },
    {
      title: 'Average Attendance',
      value: data?.average_attendance ? `${data.average_attendance}%` : 'N/A',
      sub: 'Classes attended vs held',
      icon: CalendarCheck,
      color: 'from-cyan-600 to-blue-600',
      action: () => onNavigate('attendance'),
    },
    {
      title: 'Students Needing Review',
      value: data?.students_at_risk_count || 0,
      sub: 'Low attendance (<75%) or CGPA (<5.0)',
      icon: AlertTriangle,
      color: 'from-amber-600 to-rose-600',
      action: () => onNavigate('support'),
      alert: (data?.students_at_risk_count || 0) > 0,
    },
    {
      title: 'Stride Points Awarded',
      value: data?.total_stride_points_awarded || 0,
      sub: 'Append-only ledger (Policy pending)',
      icon: Award,
      color: 'from-purple-600 to-indigo-600',
      action: () => onNavigate('stride'),
    },
    {
      title: 'Active Interventions',
      value: data?.active_interventions_count || 0,
      sub: 'Mentoring & remedial actions in review',
      icon: Activity,
      color: 'from-sky-600 to-blue-700',
      action: () => onNavigate('support'),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Banner Notice */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 opacity-10 flex items-center pr-8 pointer-events-none">
          <GraduationCap size={220} />
        </div>
        <div className="relative z-10 max-w-2xl">
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-500/30 text-blue-200 border border-blue-400/30 uppercase tracking-wider">
            Campus Innovation • Production Analytics
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-2 text-white">
            Centralised Student Analysis Platform
          </h1>
          <p className="text-slate-300 text-xs sm:text-sm mt-1.5 leading-relaxed">
            Real-time institutional metrics, automated attendance thresholds, transparent risk flags, and append-only student development tracking.
          </p>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {kpis.map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <div
              key={idx}
              onClick={kpi.action}
              className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl p-5 shadow-sm hover:shadow-md hover:border-blue-400 dark:hover:border-blue-500 transition cursor-pointer group"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  {kpi.title}
                </span>
                <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${kpi.color} flex items-center justify-center text-white shadow-sm`}>
                  <Icon size={18} />
                </div>
              </div>
              <div className="mt-3">
                <div className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                  {kpi.value}
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center justify-between">
                  <span>{kpi.sub}</span>
                  <ArrowRight size={14} className="opacity-0 group-hover:opacity-100 transition text-blue-600 dark:text-blue-400" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Department Performance Comparison */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                Department Performance Benchmarks
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Comparative Average CGPA (out of 10) by Department
              </p>
            </div>
            <button
              onClick={() => onNavigate('departments')}
              className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
            >
              Details <ArrowRight size={12} />
            </button>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data?.department_performance || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="department_code" tick={{ fontSize: 12 }} />
                <YAxis domain={[0, 10]} tick={{ fontSize: 12 }} />
                <Tooltip
                  formatter={(val, name) => [val, name === 'average_cgpa' ? 'Average CGPA' : 'Average Attendance %']}
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Bar dataKey="average_cgpa" fill="#2563eb" radius={[4, 4, 0, 0]} name="Average CGPA" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Attendance Distribution */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                Attendance Distribution Ranges
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Student cohort breakdown across attendance bands
              </p>
            </div>
            <button
              onClick={() => onNavigate('attendance')}
              className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
            >
              Details <ArrowRight size={12} />
            </button>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data?.attendance_trend || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="range" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                />
                <Bar dataKey="count" fill="#06b6d4" radius={[4, 4, 0, 0]} name="Number of Records" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Grade Distribution & Quick Action Hub */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Grade Distribution Chart */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                Cohort Academic Grade Distribution
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Number of student records awarded per letter grade
              </p>
            </div>
            <button
              onClick={() => onNavigate('academic')}
              className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
            >
              View Analytics <ArrowRight size={12} />
            </button>
          </div>
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data?.grade_distribution || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="grade" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                />
                <Bar dataKey="count" fill="#10b981" radius={[4, 4, 0, 0]} name="Awarded Grades" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Quick Review Center */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
              <AlertTriangle size={16} className="text-amber-500" />
              Immediate Review Tasks
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Active student welfare flags requiring faculty advisor attention:
            </p>

            <div className="mt-4 space-y-3">
              <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 flex items-start gap-2.5">
                <Clock size={16} className="text-amber-600 mt-0.5 shrink-0" />
                <div className="text-xs">
                  <div className="font-semibold text-amber-900 dark:text-amber-200">
                    {data?.students_at_risk_count || 0} Students Flagged
                  </div>
                  <div className="text-amber-700 dark:text-amber-400 text-[11px] mt-0.5">
                    Attendance below 75% or GPA below 5.0 threshold
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-900/60 flex items-start gap-2.5">
                <Award size={16} className="text-purple-600 mt-0.5 shrink-0" />
                <div className="text-xs">
                  <div className="font-semibold text-purple-900 dark:text-purple-200">
                    Stride Point Ledger
                  </div>
                  <div className="text-purple-700 dark:text-purple-400 text-[11px] mt-0.5">
                    Append-only ledger maintains full reversal audit trail
                  </div>
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={() => onNavigate('support')}
            className="w-full mt-4 py-2.5 px-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-lg transition shadow-sm flex items-center justify-center gap-1.5"
          >
            Open Student Support Queue <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
