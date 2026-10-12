import React from 'react';
import { api } from '../services/api';
import {
  FileSpreadsheet,
  Download,
  ShieldCheck,
  Users,
  CalendarCheck,
  Award
} from 'lucide-react';

export default function Reports() {
  const reportsList = [
    {
      title: 'Institutional Student Cohort Report',
      description: 'Includes full student roster with calculated CGPA, attendance percentage, active status, and departmental classification.',
      url: api.reports.downloadStudentsUrl,
      filename: 'campusiq_students_report.csv',
      icon: Users,
      color: 'bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-300',
    },
    {
      title: 'Course-Wise Attendance Report',
      description: 'Detailed attendance records per course enrollment showing total classes held, attended, and attendance percentage.',
      url: api.reports.downloadAttendanceUrl,
      filename: 'campusiq_attendance_report.csv',
      icon: CalendarCheck,
      color: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-300',
    },
    {
      title: 'Stride Point Auditable Ledger Report',
      description: 'Complete append-only audit trail of all Stride Point activity awards, reversals, timestamps, and staff references.',
      url: api.reports.downloadStrideUrl,
      filename: 'campusiq_stride_report.csv',
      icon: Award,
      color: 'bg-purple-50 text-purple-600 dark:bg-purple-950/60 dark:text-purple-300',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
        <h3 className="font-bold text-sm text-slate-900 dark:text-white">
          Institutional Reports & Data Exports
        </h3>
        <p className="text-xs text-slate-500 mt-1">
          Export verified student analytics and attendance records directly to CSV for external archival or accreditation.
        </p>
      </div>

      {/* Formula Injection Callout */}
      <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 rounded-xl text-xs text-emerald-900 dark:text-emerald-200 flex items-start gap-3">
        <ShieldCheck size={20} className="text-emerald-600 shrink-0 mt-0.5" />
        <div>
          <h4 className="font-bold text-emerald-950 dark:text-emerald-100">
            Spreadsheet Formula Injection Protection Active
          </h4>
          <p className="mt-0.5 text-emerald-800 dark:text-emerald-300 leading-relaxed">
            All exported CSV files automatically neutralize spreadsheet formula injection vulnerabilities by escaping cells starting with <code className="bg-emerald-100 dark:bg-emerald-900 px-1 py-0.5 rounded font-mono">=</code>, <code className="bg-emerald-100 dark:bg-emerald-900 px-1 py-0.5 rounded font-mono">+</code>, <code className="bg-emerald-100 dark:bg-emerald-900 px-1 py-0.5 rounded font-mono">-</code>, or <code className="bg-emerald-100 dark:bg-emerald-900 px-1 py-0.5 rounded font-mono">@</code>, preventing malicious formula execution in Microsoft Excel or Google Sheets.
          </p>
        </div>
      </div>

      {/* Reports List */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {reportsList.map((rep, idx) => {
          const Icon = rep.icon;
          return (
            <div
              key={idx}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm flex flex-col justify-between"
            >
              <div>
                <div className={`w-10 h-10 rounded-xl ${rep.color} flex items-center justify-center mb-3`}>
                  <Icon size={20} />
                </div>
                <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                  {rep.title}
                </h4>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  {rep.description}
                </p>
              </div>

              <a
                href={rep.url}
                download={rep.filename}
                className="mt-5 w-full py-2.5 px-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-lg flex items-center justify-center gap-2 shadow-sm transition"
              >
                <Download size={14} /> Download CSV Export
              </a>
            </div>
          );
        })}
      </div>
    </div>
  );
}
