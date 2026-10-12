import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { CalendarCheck, AlertTriangle, ShieldCheck, Users, ArrowRight } from 'lucide-react';

export default function AttendanceAnalytics({ onSelectStudent, onLogIntervention }) {
  const [data, setData] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [selectedDept, setSelectedDept] = useState('');
  const [threshold, setThreshold] = useState(75.0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDepts() {
      try {
        const d = await api.departments.list();
        setDepartments(d);
      } catch (e) {
        console.error(e);
      }
    }
    loadDepts();
  }, []);

  useEffect(() => {
    loadAttendance();
  }, [selectedDept, threshold]);

  async function loadAttendance() {
    try {
      setLoading(true);
      const params = { threshold };
      if (selectedDept) params.department_id = selectedDept;
      const res = await api.analytics.getAttendance(params);
      setData(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Top Filter and Threshold Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <h3 className="font-bold text-slate-900 dark:text-white text-sm">
            Institutional Attendance Analytics
          </h3>
          <p className="text-xs text-slate-500">
            Attendance % = (Classes Attended / Total Classes Held) × 100
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200"
          >
            <option value="">All Departments</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>
                {d.code} - {d.name}
              </option>
            ))}
          </select>

          <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800/60 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700">
            <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
              Threshold:
            </span>
            <input
              type="number"
              min="50"
              max="95"
              step="5"
              value={threshold}
              onChange={(e) => setThreshold(Number(e.target.value))}
              className="w-14 px-1.5 py-0.5 text-xs text-center font-bold text-blue-600 bg-white dark:bg-slate-700 rounded border border-slate-300 dark:border-slate-600"
            />
            <span className="text-xs text-slate-500">%</span>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="text-xs font-semibold uppercase text-slate-500">Average Attendance</div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white mt-2">
            {data?.average_attendance ? `${data.average_attendance}%` : 'N/A'}
          </div>
          <div className="text-xs text-slate-400 mt-1">Cohort weighted attendance mean</div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="text-xs font-semibold uppercase text-slate-500">Below {threshold}% Threshold</div>
          <div className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-2">
            {data?.below_threshold_count || 0}
          </div>
          <div className="text-xs text-slate-400 mt-1">Records subject to review flags</div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="text-xs font-semibold uppercase text-slate-500">Active Records Monitored</div>
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-2">
            {data?.total_records || 0}
          </div>
          <div className="text-xs text-slate-400 mt-1">Subject tracking sessions</div>
        </div>
      </div>

      {/* Policy Notice Callout */}
      <div className="p-4 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 rounded-xl text-xs text-blue-900 dark:text-blue-200 flex items-start gap-2.5">
        <ShieldCheck size={18} className="text-blue-600 shrink-0 mt-0.5" />
        <div>
          <strong>Institutional Attendance Rule:</strong> When zero classes have been held or records are missing, the system returns <code className="bg-blue-100 dark:bg-blue-900 px-1 py-0.5 rounded">not available</code> (null) rather than 0% to prevent falsifying performance history. Medical and duty leave policies remain pending official institutional confirmation.
        </div>
      </div>

      {/* Course Attendance Breakdown */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800">
          <h4 className="font-bold text-xs uppercase text-slate-700 dark:text-slate-300">
            Course-Wise Attendance Statistics
          </h4>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="py-3 px-4">Course Code</th>
                <th className="py-3 px-4">Course Title</th>
                <th className="py-3 px-4">Total Classes Held</th>
                <th className="py-3 px-4">Average Attendance %</th>
                <th className="py-3 px-4">Below {threshold}% Students</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">Loading...</td>
                </tr>
              ) : !data?.courses_attendance || data.courses_attendance.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">No attendance data available.</td>
                </tr>
              ) : (
                data.courses_attendance.map((c) => {
                  const hasConcern = c.average_attendance !== null && c.average_attendance < threshold;
                  return (
                    <tr key={c.course_id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <td className="py-3 px-4 font-mono font-bold text-blue-600">{c.course_code}</td>
                      <td className="py-3 px-4 font-semibold text-slate-900 dark:text-white">{c.course_title}</td>
                      <td className="py-3 px-4">{c.total_classes_held}</td>
                      <td className={`py-3 px-4 font-bold ${hasConcern ? 'text-amber-600' : 'text-slate-900 dark:text-white'}`}>
                        {c.average_attendance !== null ? `${c.average_attendance}%` : 'N/A'}
                      </td>
                      <td className="py-3 px-4 font-mono">
                        {c.below_threshold_students > 0 ? (
                          <span className="text-amber-600 font-bold">{c.below_threshold_students} students</span>
                        ) : (
                          <span className="text-slate-400">0</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                          hasConcern ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300' : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                        }`}>
                          {hasConcern ? 'Review Recommended' : 'Optimal'}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
