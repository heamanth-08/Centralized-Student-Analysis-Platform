import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import {
  UploadCloud,
  FileSpreadsheet,
  Download,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ShieldCheck,
  FileText
} from 'lucide-react';

export default function DataImport() {
  const [file, setFile] = useState(null);
  const [datasetType, setDatasetType] = useState('students');
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    loadHistory();
  }, []);

  async function loadHistory() {
    try {
      const h = await api.imports.list();
      setHistory(h);
    } catch (e) {
      console.error(e);
    }
  }

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) {
      alert('Please select a file to import');
      return;
    }
    setErrorMsg('');
    setResult(null);
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('dataset_type', datasetType);

      const res = await api.imports.upload(formData);
      setResult(res);
      setFile(null);
      loadHistory();
    } catch (err) {
      setErrorMsg(err.message || 'File import failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Templates & Guidelines Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="font-bold text-sm text-slate-900 dark:text-white">
            Data Import & Spreadsheet Ingestion
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Supports CSV and Excel (.xlsx). Validates duplicate keys, numerical ranges, and sanitizes formula injection.
          </p>
        </div>

        {/* Downloadable templates */}
        <div className="flex flex-wrap items-center gap-2">
          <a
            href={api.imports.getTemplate('students')}
            download
            className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 text-slate-700 dark:text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition"
          >
            <Download size={13} /> Students Template
          </a>
          <a
            href={api.imports.getTemplate('attendance')}
            download
            className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 text-slate-700 dark:text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition"
          >
            <Download size={13} /> Attendance Template
          </a>
          <a
            href={api.imports.getTemplate('marks')}
            download
            className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 text-slate-700 dark:text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition"
          >
            <Download size={13} /> Marks Template
          </a>
        </div>
      </div>

      {/* Upload Box */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm">
        <form onSubmit={handleUpload} className="space-y-4 max-w-xl">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Select Dataset Category
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'students', label: 'Student Directory' },
                { id: 'attendance', label: 'Attendance Records' },
                { id: 'marks', label: 'Academic Marks' },
              ].map((cat) => (
                <button
                  type="button"
                  key={cat.id}
                  onClick={() => setDatasetType(cat.id)}
                  className={`py-2 px-3 rounded-lg text-xs font-semibold border transition text-center ${
                    datasetType === cat.id
                      ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                      : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Select File (.csv, .xlsx)
            </label>
            <input
              type="file"
              accept=".csv,.xlsx,.xls"
              onChange={(e) => setFile(e.target.files[0])}
              className="w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-blue-950 dark:file:text-blue-300 border border-slate-200 dark:border-slate-700 rounded-lg p-2"
            />
          </div>

          {errorMsg && (
            <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-300 text-xs rounded-lg">
              {errorMsg}
            </div>
          )}

          <button
            type="submit"
            disabled={uploading || !file}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold text-xs rounded-lg shadow-sm flex items-center gap-2 transition"
          >
            <UploadCloud size={16} />
            {uploading ? 'Validating and Ingesting...' : 'Upload & Validate Dataset'}
          </button>
        </form>
      </div>

      {/* Row-Level Errors and Summary */}
      {result && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                Import Result Summary: {result.filename}
              </h4>
              <p className="text-xs text-slate-400 mt-0.5">
                Dataset: <span className="capitalize">{result.dataset_type}</span>
              </p>
            </div>
            <span
              className={`px-2.5 py-1 rounded-full text-xs font-semibold uppercase ${
                result.status === 'completed'
                  ? 'bg-emerald-100 text-emerald-700'
                  : result.status === 'partial'
                  ? 'bg-amber-100 text-amber-700'
                  : 'bg-red-100 text-red-700'
              }`}
            >
              {result.status}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-3 text-center text-xs">
            <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
              <div className="text-slate-400 font-semibold uppercase text-[10px]">Total Rows</div>
              <div className="text-lg font-bold text-slate-900 dark:text-white mt-1">
                {result.total_rows}
              </div>
            </div>
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-lg">
              <div className="text-emerald-600 font-semibold uppercase text-[10px]">Successfully Ingested</div>
              <div className="text-lg font-bold text-emerald-700 dark:text-emerald-300 mt-1">
                {result.success_count}
              </div>
            </div>
            <div className="p-3 bg-red-50 dark:bg-red-950/40 rounded-lg">
              <div className="text-red-600 font-semibold uppercase text-[10px]">Row-Level Errors</div>
              <div className="text-lg font-bold text-red-700 dark:text-red-300 mt-1">
                {result.error_count}
              </div>
            </div>
          </div>

          {result.errors && result.errors.length > 0 && (
            <div>
              <h5 className="font-bold text-xs text-red-600 uppercase mb-2">
                Row-Level Validation Error Log ({result.errors.length})
              </h5>
              <div className="border border-red-200 dark:border-red-900/60 rounded-lg overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300">
                    <tr>
                      <th className="py-2 px-3">File Line #</th>
                      <th className="py-2 px-3">Student Identifier</th>
                      <th className="py-2 px-3">Validation Failure Reason</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-red-100 dark:divide-red-900/40">
                    {result.errors.map((err, i) => (
                      <tr key={i}>
                        <td className="py-2 px-3 font-mono font-bold">{err.row}</td>
                        <td className="py-2 px-3 font-mono">{err.identifier || '—'}</td>
                        <td className="py-2 px-3 text-red-600">{err.error}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Historical Upload Log */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800">
          <h4 className="font-bold text-xs uppercase text-slate-700 dark:text-slate-300">
            Past Ingestion History
          </h4>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="py-3 px-4">Filename</th>
                <th className="py-3 px-4">Dataset Type</th>
                <th className="py-3 px-4">Total Rows</th>
                <th className="py-3 px-4">Success</th>
                <th className="py-3 px-4">Errors</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Ingestion Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {history.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">No imports performed yet.</td>
                </tr>
              ) : (
                history.map((h) => (
                  <tr key={h.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="py-3 px-4 font-mono font-medium text-slate-900 dark:text-white">{h.filename}</td>
                    <td className="py-3 px-4 capitalize">{h.dataset_type}</td>
                    <td className="py-3 px-4">{h.row_count}</td>
                    <td className="py-3 px-4 text-emerald-600 font-bold">{h.success_count}</td>
                    <td className="py-3 px-4 text-red-500 font-bold">{h.error_count}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase ${
                        h.status === 'completed'
                          ? 'bg-emerald-100 text-emerald-700'
                          : h.status === 'partial'
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-red-100 text-red-700'
                      }`}>
                        {h.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-400">
                      {new Date(h.created_at).toLocaleDateString()}
                    </td>
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
