import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  ArrowLeft,
  GraduationCap,
  CalendarCheck,
  Award,
  AlertTriangle,
  BookOpen,
  Plus,
  ShieldCheck,
  CheckCircle,
  XCircle,
  Clock,
  RotateCcw,
  X
} from 'lucide-react';

export default function StudentProfile({ studentId, onBack }) {
  const { user, role } = useAuth();
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('academic');

  // Modals
  const [showStrideModal, setShowStrideModal] = useState(false);
  const [strideActivities, setStrideActivities] = useState([]);
  const [strideForm, setStrideForm] = useState({ activity_id: '', points: '', reason: '' });

  const [showInterventionModal, setShowInterventionModal] = useState(false);
  const [interventionForm, setInterventionForm] = useState({
    flag_reason: '',
    intervention_type: 'Academic Mentoring',
    notes: '',
  });

  useEffect(() => {
    loadStudent();
  }, [studentId]);

  async function loadStudent() {
    try {
      setLoading(true);
      const res = await api.students.get(studentId);
      setStudent(res);
    } catch (e) {
      setError(e.message || 'Failed to fetch student details');
    } finally {
      setLoading(false);
    }
  }

  const handleOpenStrideModal = async () => {
    try {
      const acts = await api.stride.getActivities();
      setStrideActivities(acts);
      if (acts.length > 0) {
        setStrideForm({
          activity_id: acts[0].id,
          points: acts[0].default_points,
          reason: `Participation in ${acts[0].name}`,
        });
      }
      setShowStrideModal(true);
    } catch (e) {
      alert('Failed to load activities');
    }
  };

  const handleAwardStride = async (e) => {
    e.preventDefault();
    try {
      await api.stride.awardPoints({
        student_id: student.id,
        activity_id: Number(strideForm.activity_id),
        points: Number(strideForm.points),
        reason: strideForm.reason,
      });
      setShowStrideModal(false);
      loadStudent();
    } catch (err) {
      alert(err.message || 'Award failed');
    }
  };

  const handleSaveIntervention = async (e) => {
    e.preventDefault();
    try {
      await api.support.createIntervention({
        student_id: student.id,
        flag_reason: interventionForm.flag_reason,
        intervention_type: interventionForm.intervention_type,
        notes: interventionForm.notes,
      });
      setShowInterventionModal(false);
      loadStudent();
    } catch (err) {
      alert(err.message || 'Failed to record intervention');
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs text-slate-500">Loading student profile...</p>
      </div>
    );
  }

  if (error || !student) {
    return (
      <div className="p-6 bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 rounded-xl">
        <p className="text-sm font-semibold">{error || 'Student not found'}</p>
        <button
          onClick={onBack}
          className="mt-3 px-3 py-1.5 bg-red-600 text-white rounded text-xs font-semibold"
        >
          Back to Directory
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back button & Title */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-blue-600 transition"
        >
          <ArrowLeft size={16} /> Back to Directory
        </button>
        <div className="flex items-center gap-2">
          {role !== 'student' && (
            <>
              <button
                onClick={handleOpenStrideModal}
                className="px-3 py-1.5 text-xs font-semibold bg-purple-600 hover:bg-purple-700 text-white rounded-lg flex items-center gap-1 shadow-sm transition"
              >
                <Award size={14} /> Award Stride Points
              </button>
              <button
                onClick={() => {
                  setInterventionForm({
                    flag_reason: student.attendance_percentage < 75 ? 'Low Attendance (<75%)' : 'Academic Mentoring',
                    intervention_type: 'Academic Mentoring',
                    notes: '',
                  });
                  setShowInterventionModal(true);
                }}
                className="px-3 py-1.5 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-1 shadow-sm transition"
              >
                <Plus size={14} /> Log Intervention
              </button>
            </>
          )}
        </div>
      </div>

      {/* Student Header Banner */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-700 to-indigo-500 text-white font-extrabold text-2xl flex items-center justify-center shadow-lg shadow-blue-500/20">
            {student.full_name.charAt(0)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                {student.full_name}
              </h2>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                  student.status === 'active'
                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                    : 'bg-slate-100 text-slate-500'
                }`}
              >
                {student.status}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs text-slate-500 dark:text-slate-400">
              <span className="font-mono font-semibold text-blue-600 dark:text-blue-400">
                {student.roll_number}
              </span>
              <span>•</span>
              <span>{student.department_name}</span>
              <span>•</span>
              <span>Semester {student.current_semester}</span>
              <span>•</span>
              <span>{student.email}</span>
            </div>
          </div>
        </div>

        {/* Quick metrics in banner */}
        <div className="flex items-center gap-3">
          <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 rounded-xl px-4 py-2.5 text-center min-w-[90px]">
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              CGPA
            </div>
            <div className="text-lg font-bold text-slate-900 dark:text-white">
              {student.cgpa !== null ? student.cgpa : 'N/A'}
            </div>
          </div>
          <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 rounded-xl px-4 py-2.5 text-center min-w-[90px]">
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Attendance
            </div>
            <div className={`text-lg font-bold ${
              student.attendance_percentage !== null && student.attendance_percentage < 75
                ? 'text-amber-600 dark:text-amber-400'
                : 'text-slate-900 dark:text-white'
            }`}>
              {student.attendance_percentage !== null ? `${student.attendance_percentage}%` : 'N/A'}
            </div>
          </div>
          <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 rounded-xl px-4 py-2.5 text-center min-w-[90px]">
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Stride Pts
            </div>
            <div className="text-lg font-bold text-purple-600 dark:text-purple-400">
              {student.stride_balance}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-1">
        {[
          { id: 'academic', label: 'Academic Performance', icon: GraduationCap, count: student.academic_records.length },
          { id: 'attendance', label: 'Attendance Records', icon: CalendarCheck, count: student.attendance_records.length },
          { id: 'stride', label: 'Stride Point Ledger', icon: Award, count: student.stride_transactions.length },
          { id: 'support', label: 'Support & Interventions', icon: AlertTriangle, count: student.support_interventions.length },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-semibold transition ${
                isActive
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Icon size={15} />
              <span>{tab.label}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${isActive ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'}`}>
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Tab 1: Academic Records */}
      {activeTab === 'academic' && (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <h3 className="font-bold text-slate-900 dark:text-white text-xs">
              Course-wise Examination & Continuous Evaluation Records
            </h3>
            <span className="text-xs text-slate-400">
              Overall CGPA: <strong className="text-blue-600">{student.cgpa || 'N/A'}</strong>
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="py-3 px-4">Course Code</th>
                  <th className="py-3 px-4">Course Title</th>
                  <th className="py-3 px-4">Credits</th>
                  <th className="py-3 px-4">Internal Marks</th>
                  <th className="py-3 px-4">External Marks</th>
                  <th className="py-3 px-4">Total Marks</th>
                  <th className="py-3 px-4">Grade</th>
                  <th className="py-3 px-4">Grade Point</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {student.academic_records.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-8 text-center text-slate-400">
                      No academic examination records found for this student.
                    </td>
                  </tr>
                ) : (
                  student.academic_records.map((r) => (
                    <tr key={r.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <td className="py-3 px-4 font-mono font-semibold text-blue-600">{r.course_code}</td>
                      <td className="py-3 px-4 font-medium text-slate-900 dark:text-white">{r.course_title}</td>
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-300">{r.credits}</td>
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-300">{r.internal_marks}</td>
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-300">{r.external_marks}</td>
                      <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">{r.total_marks}</td>
                      <td className="py-3 px-4 font-bold text-blue-600">{r.grade}</td>
                      <td className="py-3 px-4 font-mono">{r.grade_point}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                          r.is_passed ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300' : 'bg-red-100 text-red-700'
                        }`}>
                          {r.is_passed ? 'Passed' : 'Failed'}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Attendance Records */}
      {activeTab === 'attendance' && (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <h3 className="font-bold text-slate-900 dark:text-white text-xs">
              Subject Attendance Breakdowns
            </h3>
            <span className="text-xs text-slate-400">
              Formula: (Attended / Held) × 100 • Threshold: 75%
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="py-3 px-4">Course Code</th>
                  <th className="py-3 px-4">Course Title</th>
                  <th className="py-3 px-4">Classes Held</th>
                  <th className="py-3 px-4">Classes Attended</th>
                  <th className="py-3 px-4">Attendance %</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {student.attendance_records.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400">
                      No attendance records logged for this student.
                    </td>
                  </tr>
                ) : (
                  student.attendance_records.map((a) => {
                    const isBelow = a.percentage !== null && a.percentage < 75;
                    return (
                      <tr key={a.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                        <td className="py-3 px-4 font-mono font-semibold text-blue-600">{a.course_code}</td>
                        <td className="py-3 px-4 font-medium text-slate-900 dark:text-white">{a.course_title}</td>
                        <td className="py-3 px-4">{a.classes_held}</td>
                        <td className="py-3 px-4">{a.classes_attended}</td>
                        <td className="py-3 px-4 font-bold">
                          {a.percentage !== null ? `${a.percentage}%` : 'N/A'}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                            a.percentage === null
                              ? 'bg-slate-100 text-slate-500'
                              : isBelow
                              ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200'
                              : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                          }`}>
                            {a.percentage === null ? 'Not Available' : isBelow ? 'Below Threshold' : 'Adequate'}
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
      )}

      {/* Tab 3: Stride Point Ledger */}
      {activeTab === 'stride' && (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-xs">
                Append-Only Stride Point Ledger
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Balances are strictly derived from valid approved transactions.
              </p>
            </div>
            <div className="text-xs">
              Balance: <strong className="text-purple-600 font-bold">{student.stride_balance} pts</strong>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="py-3 px-4">TX ID</th>
                  <th className="py-3 px-4">Activity</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Points</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Reason / Verification</th>
                  <th className="py-3 px-4">Awarded By</th>
                  <th className="py-3 px-4">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {student.stride_transactions.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-slate-400">
                      No Stride Point transactions recorded for this student.
                    </td>
                  </tr>
                ) : (
                  student.stride_transactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <td className="py-3 px-4 font-mono text-slate-400">#{tx.id}</td>
                      <td className="py-3 px-4 font-semibold text-slate-900 dark:text-white">{tx.activity_name}</td>
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-300">{tx.activity_category}</td>
                      <td className={`py-3 px-4 font-bold ${tx.points >= 0 ? 'text-purple-600' : 'text-red-500'}`}>
                        {tx.points > 0 ? `+${tx.points}` : tx.points}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                          tx.status === 'approved'
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                            : 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300'
                        }`}>
                          {tx.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-300">{tx.reason}</td>
                      <td className="py-3 px-4 text-slate-500">{tx.awarded_by_name}</td>
                      <td className="py-3 px-4 text-slate-400 font-mono">
                        {new Date(tx.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 4: Support & Interventions */}
      {activeTab === 'support' && (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <h3 className="font-bold text-slate-900 dark:text-white text-xs">
              Student Welfare, Risk Flags & Mentoring History
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="py-3 px-4">Flag Reason</th>
                  <th className="py-3 px-4">Intervention Type</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Advisor Notes</th>
                  <th className="py-3 px-4">Action By</th>
                  <th className="py-3 px-4">Logged Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {student.support_interventions.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400">
                      No active welfare interventions logged for this student.
                    </td>
                  </tr>
                ) : (
                  student.support_interventions.map((i) => (
                    <tr key={i.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <td className="py-3 px-4 font-semibold text-amber-600 dark:text-amber-400">{i.flag_reason}</td>
                      <td className="py-3 px-4 font-medium text-slate-900 dark:text-white">{i.intervention_type}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold capitalize ${
                          i.status === 'resolved'
                            ? 'bg-emerald-100 text-emerald-700'
                            : i.status === 'in_progress'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-amber-100 text-amber-700'
                        }`}>
                          {i.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-300 max-w-xs">{i.notes || '—'}</td>
                      <td className="py-3 px-4 text-slate-500">{i.action_taken_by_name}</td>
                      <td className="py-3 px-4 text-slate-400 font-mono">
                        {new Date(i.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal: Award Stride Points */}
      {showStrideModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full shadow-2xl p-6 relative">
            <button
              onClick={() => setShowStrideModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X size={20} />
            </button>
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
              Award Stride Development Points
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Awards create an append-only auditable transaction for {student.full_name}.
            </p>

            <form onSubmit={handleAwardStride} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                  Eligible Activity *
                </label>
                <select
                  value={strideForm.activity_id}
                  onChange={(e) => {
                    const act = strideActivities.find((a) => a.id === Number(e.target.value));
                    setStrideForm({
                      ...strideForm,
                      activity_id: e.target.value,
                      points: act ? act.default_points : strideForm.points,
                    });
                  }}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                >
                  {strideActivities.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name} ({a.category} - {a.default_points} pts)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                  Points *
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  max="100"
                  value={strideForm.points}
                  onChange={(e) => setStrideForm({ ...strideForm, points: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                  Verification Reason / Document Reference *
                </label>
                <textarea
                  required
                  rows="2"
                  value={strideForm.reason}
                  onChange={(e) => setStrideForm({ ...strideForm, reason: e.target.value })}
                  placeholder="e.g., Certificate of completion submitted / Hackathon 1st Place"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowStrideModal(false)}
                  className="px-3.5 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg shadow-sm"
                >
                  Award Points
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Log Support Intervention */}
      {showInterventionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full shadow-2xl p-6 relative">
            <button
              onClick={() => setShowInterventionModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X size={20} />
            </button>
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
              Record Support Action / Intervention
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Transparent human review action for {student.full_name}.
            </p>

            <form onSubmit={handleSaveIntervention} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                  Trigger / Reason *
                </label>
                <input
                  type="text"
                  required
                  value={interventionForm.flag_reason}
                  onChange={(e) => setInterventionForm({ ...interventionForm, flag_reason: e.target.value })}
                  placeholder="e.g. Attendance below 75%"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                  Action Type *
                </label>
                <select
                  value={interventionForm.intervention_type}
                  onChange={(e) => setInterventionForm({ ...interventionForm, intervention_type: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                >
                  <option value="Academic Mentoring">Academic Mentoring</option>
                  <option value="Remedial Tutoring">Remedial Tutoring</option>
                  <option value="Attendance Counseling">Attendance Counseling</option>
                  <option value="Faculty Advisor Consultation">Faculty Advisor Consultation</option>
                  <option value="Parent Discussion">Parent Discussion</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                  Advisor Notes & Next Steps
                </label>
                <textarea
                  rows="3"
                  value={interventionForm.notes}
                  onChange={(e) => setInterventionForm({ ...interventionForm, notes: e.target.value })}
                  placeholder="Details of remedial sessions or counseling advice given..."
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowInterventionModal(false)}
                  className="px-3.5 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-sm"
                >
                  Save Intervention
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
