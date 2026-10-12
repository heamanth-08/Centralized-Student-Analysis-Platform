import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  Award,
  ShieldAlert,
  Plus,
  RotateCcw,
  CheckCircle,
  XCircle,
  Clock,
  ChevronLeft,
  ChevronRight,
  X,
  Search
} from 'lucide-react';

export default function StridePoint({ onSelectStudent }) {
  const { user, role } = useAuth();
  const isAdmin = role === 'admin';

  const [transactions, setTransactions] = useState([]);
  const [activities, setActivities] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalTxs, setTotalTxs] = useState(0);

  // Modals
  const [showAwardModal, setShowAwardModal] = useState(false);
  const [awardForm, setAwardForm] = useState({
    student_id: '',
    activity_id: '',
    points: 10,
    reason: '',
  });

  const [showReverseModal, setShowReverseModal] = useState(false);
  const [selectedTxId, setSelectedTxId] = useState(null);
  const [reverseReason, setReverseReason] = useState('');

  useEffect(() => {
    loadActivitiesAndStudents();
  }, []);

  useEffect(() => {
    loadTransactions();
  }, [page]);

  async function loadActivitiesAndStudents() {
    try {
      const [acts, studs] = await Promise.all([
        api.stride.getActivities(),
        api.students.list({ page: 1, page_size: 50, status: 'active' }),
      ]);
      setActivities(acts);
      setStudents(studs.items);
      if (studs.items.length > 0 && !awardForm.student_id) {
        setAwardForm((prev) => ({
          ...prev,
          student_id: studs.items[0].id,
          activity_id: acts[0]?.id || '',
          points: acts[0]?.default_points || 10,
        }));
      }
    } catch (e) {
      console.error(e);
    }
  }

  async function loadTransactions() {
    try {
      setLoading(true);
      const res = await api.stride.getTransactions({ page, page_size: 15 });
      setTransactions(res.items);
      setTotalPages(res.total_pages);
      setTotalTxs(res.total);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  const handleAward = async (e) => {
    e.preventDefault();
    try {
      await api.stride.awardPoints({
        student_id: Number(awardForm.student_id),
        activity_id: Number(awardForm.activity_id),
        points: Number(awardForm.points),
        reason: awardForm.reason,
      });
      setShowAwardModal(false);
      loadTransactions();
    } catch (err) {
      alert(err.message || 'Award failed');
    }
  };

  const handleReverse = async (e) => {
    e.preventDefault();
    try {
      await api.stride.reverseTransaction(selectedTxId, reverseReason);
      setShowReverseModal(false);
      setReverseReason('');
      setSelectedTxId(null);
      loadTransactions();
    } catch (err) {
      alert(err.message || 'Reversal failed');
    }
  };

  return (
    <div className="space-y-6">
      {/* Policy Notice Callout */}
      <div className="bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-900 rounded-2xl p-5 shadow-sm flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <Award size={24} className="text-purple-600 shrink-0 mt-0.5" />
          <div className="text-xs text-purple-950 dark:text-purple-200">
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-sm text-purple-900 dark:text-purple-100">
                Stride Point Student Development Feature
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-purple-200 dark:bg-purple-800 text-purple-900 dark:text-purple-200">
                Policy Pending Institutional Finalization
              </span>
            </div>
            <p className="mt-1 leading-relaxed text-purple-800 dark:text-purple-300">
              Per project specifications, official activity point caps, category weights, and expiry rules are pending administrative governance.
              The system runs a configuration-driven, append-only auditable transaction ledger where point balances are strictly derived from approved non-reversed transactions.
            </p>
          </div>
        </div>

        {role !== 'student' && (
          <button
            onClick={() => setShowAwardModal(true)}
            className="px-3.5 py-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs rounded-lg flex items-center gap-1.5 shadow-sm shrink-0 transition"
          >
            <Plus size={15} /> Award Points
          </button>
        )}
      </div>

      {/* Activities Reference Cards */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm">
        <h4 className="font-bold text-xs uppercase text-slate-700 dark:text-slate-300 mb-3">
          Configured Activity Point Values (Configuration-Driven)
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
          {activities.map((a) => (
            <div
              key={a.id}
              className="p-3 rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 flex items-start justify-between"
            >
              <div>
                <div className="font-semibold text-slate-900 dark:text-white">{a.name}</div>
                <div className="text-[11px] text-slate-400 mt-0.5">{a.category}</div>
              </div>
              <span className="font-mono font-bold text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-950 px-2 py-0.5 rounded">
                +{a.default_points} pts
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Transactions Ledger Table */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <h4 className="font-bold text-xs uppercase text-slate-700 dark:text-slate-300">
            Append-Only Transaction History ({totalTxs})
          </h4>
          <span className="text-[11px] text-slate-400">
            Corrections are executed via offsetting reversal entries
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="py-3 px-4">TX ID</th>
                <th className="py-3 px-4">Student</th>
                <th className="py-3 px-4">Activity</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Points</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Reason / Audit Trail</th>
                <th className="py-3 px-4">Date</th>
                {isAdmin && <th className="py-3 px-4 text-right">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {loading ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-400">Loading ledger records...</td>
                </tr>
              ) : transactions.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-400">No transactions recorded yet.</td>
                </tr>
              ) : (
                transactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="py-3 px-4 font-mono text-slate-400">#{tx.id}</td>
                    <td className="py-3 px-4">
                      <div
                        onClick={() => onSelectStudent(tx.student_id)}
                        className="font-semibold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                      >
                        {tx.student_name}
                      </div>
                      <div className="text-[11px] font-mono text-slate-400">{tx.student_roll}</div>
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-900 dark:text-white">{tx.activity_name}</td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-300">{tx.activity_category}</td>
                    <td className={`py-3 px-4 font-mono font-bold ${tx.points >= 0 ? 'text-purple-600 dark:text-purple-400' : 'text-red-500'}`}>
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
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-300 max-w-xs">{tx.reason}</td>
                    <td className="py-3 px-4 font-mono text-slate-400">
                      {new Date(tx.created_at).toLocaleDateString()}
                    </td>
                    {isAdmin && (
                      <td className="py-3 px-4 text-right">
                        {tx.status === 'approved' && tx.points > 0 && (
                          <button
                            onClick={() => {
                              setSelectedTxId(tx.id);
                              setShowReverseModal(true);
                            }}
                            className="px-2 py-1 rounded text-[11px] font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 border border-red-200 dark:border-red-900"
                            title="Offsetting Reversal"
                          >
                            <RotateCcw size={13} className="inline mr-1" /> Reverse
                          </button>
                        )}
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/40 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
          <div>Showing {transactions.length} of {totalTxs} transactions</div>
          <div className="flex items-center gap-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="p-1.5 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 disabled:opacity-40"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="font-semibold text-slate-700 dark:text-slate-200">
              Page {page} of {totalPages}
            </span>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="p-1.5 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 disabled:opacity-40"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Modal: Award Stride Points */}
      {showAwardModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full shadow-2xl p-6 relative">
            <button
              onClick={() => setShowAwardModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X size={20} />
            </button>
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
              Award Stride Development Points
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Select eligible student and verified activity.
            </p>

            <form onSubmit={handleAward} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                  Select Student *
                </label>
                <select
                  value={awardForm.student_id}
                  onChange={(e) => setAwardForm({ ...awardForm, student_id: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                >
                  {students.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.full_name} ({s.roll_number})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                  Activity *
                </label>
                <select
                  value={awardForm.activity_id}
                  onChange={(e) => {
                    const act = activities.find((a) => a.id === Number(e.target.value));
                    setAwardForm({
                      ...awardForm,
                      activity_id: e.target.value,
                      points: act ? act.default_points : awardForm.points,
                    });
                  }}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                >
                  {activities.map((a) => (
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
                  value={awardForm.points}
                  onChange={(e) => setAwardForm({ ...awardForm, points: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                  Verification Reason & Documentation Reference *
                </label>
                <textarea
                  required
                  rows="2"
                  value={awardForm.reason}
                  onChange={(e) => setAwardForm({ ...awardForm, reason: e.target.value })}
                  placeholder="e.g. Winner in Inter-College Technical Hackathon 2026"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAwardModal(false)}
                  className="px-3.5 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
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

      {/* Modal: Reverse Transaction */}
      {showReverseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full shadow-2xl p-6 relative">
            <button
              onClick={() => setShowReverseModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X size={20} />
            </button>
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
              Append-Only Reversal
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Creating reversal entry for TX#{selectedTxId}. The original entry remains preserved in audit history.
            </p>

            <form onSubmit={handleReverse} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                  Reason for Reversal / Correction *
                </label>
                <textarea
                  required
                  rows="3"
                  value={reverseReason}
                  onChange={(e) => setReverseReason(e.target.value)}
                  placeholder="State justification for reversing this award (e.g. Duplicate certificate submission)"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowReverseModal(false)}
                  className="px-3.5 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg shadow-sm"
                >
                  Execute Reversal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
