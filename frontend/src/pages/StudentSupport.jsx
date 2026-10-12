import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  AlertTriangle,
  ShieldAlert,
  CheckCircle2,
  Clock,
  Plus,
  ArrowRight,
  ExternalLink,
  X,
  FileText
} from 'lucide-react';

export default function StudentSupport({ onSelectStudent }) {
  const { role } = useAuth();
  const [flags, setFlags] = useState([]);
  const [loading, setLoading] = useState(true);

  // Intervention modal
  const [showModal, setShowModal] = useState(false);
  const [selectedFlag, setSelectedFlag] = useState(null);
  const [formData, setFormData] = useState({
    intervention_type: 'Academic Mentoring',
    notes: '',
  });

  useEffect(() => {
    loadFlags();
  }, []);

  async function loadFlags() {
    try {
      setLoading(true);
      const res = await api.support.getFlags();
      setFlags(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  const handleOpenIntervention = (flag) => {
    setSelectedFlag(flag);
    setFormData({
      intervention_type: flag.flag_type === 'Low Attendance' ? 'Attendance Counseling' : 'Academic Mentoring',
      notes: '',
    });
    setShowModal(true);
  };

  const handleSubmitIntervention = async (e) => {
    e.preventDefault();
    try {
      await api.support.createIntervention({
        student_id: selectedFlag.student_id,
        flag_reason: selectedFlag.reason,
        intervention_type: formData.intervention_type,
        notes: formData.notes,
      });
      setShowModal(false);
      loadFlags();
    } catch (err) {
      alert(err.message || 'Failed to record intervention');
    }
  };

  return (
    <div className="space-y-6">
      {/* Banner Notice */}
      <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 rounded-2xl p-5 shadow-sm flex items-start gap-3">
        <ShieldAlert size={22} className="text-amber-600 shrink-0 mt-0.5" />
        <div className="text-xs text-amber-950 dark:text-amber-200">
          <h3 className="font-bold text-sm text-amber-900 dark:text-amber-100">
            Explainable Student Support & Welfare Queue
          </h3>
          <p className="mt-1 leading-relaxed text-amber-800 dark:text-amber-300">
            Indicators are derived using transparent institutional thresholds (Attendance &lt; 75%, CGPA &lt; 5.0, or incomplete records).
            Every flag displays its explicit cause and is intended exclusively for human review and advisory support, never for automated disciplinary judgments.
          </p>
        </div>
      </div>

      {/* Flags List Table */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <h4 className="font-bold text-xs uppercase text-slate-700 dark:text-slate-300">
            Flagged Students Requiring Human Review ({flags.length})
          </h4>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="py-3 px-4">Student</th>
                <th className="py-3 px-4">Department</th>
                <th className="py-3 px-4">Semester</th>
                <th className="py-3 px-4">Flag Type</th>
                <th className="py-3 px-4">Explainable Reason</th>
                <th className="py-3 px-4">Observed Metric</th>
                <th className="py-3 px-4 text-right">Support Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">Loading support queue...</td>
                </tr>
              ) : flags.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-emerald-600 font-semibold">
                    ✓ No active student welfare flags. All cohorts meet configured threshold standards!
                  </td>
                </tr>
              ) : (
                flags.map((flag, idx) => (
                  <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="py-3 px-4">
                      <div
                        onClick={() => onSelectStudent(flag.student_id)}
                        className="font-semibold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                      >
                        {flag.full_name}
                      </div>
                      <div className="text-[11px] font-mono text-slate-400">{flag.roll_number}</div>
                    </td>
                    <td className="py-3 px-4 text-slate-700 dark:text-slate-300">{flag.department_name}</td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-300">Semester {flag.semester}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-900">
                        {flag.flag_type}
                      </span>
                    </td>
                    <td className="py-3 px-4 max-w-xs text-slate-600 dark:text-slate-300 text-[11px] leading-relaxed">
                      {flag.reason}
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-slate-900 dark:text-white">
                      {flag.metric_value !== null ? `${flag.metric_value}` : 'N/A'}
                      {flag.threshold ? ` (Cutoff: ${flag.threshold})` : ''}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleOpenIntervention(flag)}
                        className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-[11px] font-semibold shadow-sm transition"
                      >
                        Log Intervention
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Log Support Intervention */}
      {showModal && selectedFlag && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full shadow-2xl p-6 relative">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X size={20} />
            </button>
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
              Log Support Action
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Recording remedial action for {selectedFlag.full_name} ({selectedFlag.roll_number}).
            </p>

            <form onSubmit={handleSubmitIntervention} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                  Observed Concern
                </label>
                <div className="p-2.5 rounded bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                  {selectedFlag.reason}
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                  Intervention Action Type *
                </label>
                <select
                  value={formData.intervention_type}
                  onChange={(e) => setFormData({ ...formData, intervention_type: e.target.value })}
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
                  Advisor Action Plan & Notes *
                </label>
                <textarea
                  required
                  rows="3"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Record discussions, assigned remedial sessions, or student responses..."
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-3.5 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-sm"
                >
                  Record Intervention
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
