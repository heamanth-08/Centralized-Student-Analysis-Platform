import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { GraduationCap, Filter, Award, TrendingUp, CheckCircle, BarChart2 } from 'lucide-react';
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

export default function AcademicAnalytics() {
  const [data, setData] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [selectedDept, setSelectedDept] = useState('');
  const [selectedSemester, setSelectedSemester] = useState('');
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
    loadAnalytics();
  }, [selectedDept, selectedSemester]);

  async function loadAnalytics() {
    try {
      setLoading(true);
      const params = {};
      if (selectedDept) params.department_id = selectedDept;
      if (selectedSemester) params.semester = selectedSemester;
      const res = await api.analytics.getAcademic(params);
      setData(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Top Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <h3 className="font-bold text-slate-900 dark:text-white text-sm">
            Academic Performance Analytics
          </h3>
          <p className="text-xs text-slate-500">
            Course evaluation results, pass rates, and grade frequency
          </p>
        </div>

        <div className="flex items-center gap-2">
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

          <select
            value={selectedSemester}
            onChange={(e) => setSelectedSemester(e.target.value)}
            className="px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200"
          >
            <option value="">All Semesters</option>
            {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
              <option key={s} value={s}>
                Semester {s}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="text-xs font-semibold uppercase text-slate-500">Overall Average Score</div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white mt-2">
            {data?.overall_average ? `${data.overall_average} / 100` : 'N/A'}
          </div>
          <div className="text-xs text-slate-400 mt-1">Based on internal & external evaluations</div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="text-xs font-semibold uppercase text-slate-500">Cohort Pass Rate</div>
          <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-2">
            {data?.pass_rate ? `${data.pass_rate}%` : 'N/A'}
          </div>
          <div className="text-xs text-slate-400 mt-1">Students meeting passing grade criteria</div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="text-xs font-semibold uppercase text-slate-500">Total Exam Records</div>
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-2">
            {data?.total_records || 0}
          </div>
          <div className="text-xs text-slate-400 mt-1">Evaluated course enrollments</div>
        </div>
      </div>

      {/* Grade Distribution Chart */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <h4 className="font-bold text-sm text-slate-900 dark:text-white mb-1">
          Letter Grade Distribution
        </h4>
        <p className="text-xs text-slate-500 mb-4">
          Frequency of grades awarded across selected filter
        </p>
        <div className="h-60 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data?.grade_distribution || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
              <XAxis dataKey="grade" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
              />
              <Bar dataKey="count" fill="#2563eb" radius={[4, 4, 0, 0]} name="Students" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Course Breakdown Table */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800">
          <h4 className="font-bold text-xs uppercase text-slate-700 dark:text-slate-300">
            Course Performance Breakdown
          </h4>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="py-3 px-4">Course Code</th>
                <th className="py-3 px-4">Course Title</th>
                <th className="py-3 px-4">Evaluated Count</th>
                <th className="py-3 px-4">Average Score</th>
                <th className="py-3 px-4">Pass Rate</th>
                <th className="py-3 px-4">Average Grade Point</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">Loading...</td>
                </tr>
              ) : !data?.courses_analysis || data.courses_analysis.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">No course examination records found.</td>
                </tr>
              ) : (
                data.courses_analysis.map((c) => (
                  <tr key={c.course_id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="py-3 px-4 font-mono font-bold text-blue-600">{c.course_code}</td>
                    <td className="py-3 px-4 font-semibold text-slate-900 dark:text-white">{c.course_title}</td>
                    <td className="py-3 px-4">{c.student_count}</td>
                    <td className="py-3 px-4 font-bold">{c.average_marks} / 100</td>
                    <td className="py-3 px-4 text-emerald-600 font-bold">{c.pass_rate}%</td>
                    <td className="py-3 px-4 font-mono">{c.average_grade_point} / 10</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
