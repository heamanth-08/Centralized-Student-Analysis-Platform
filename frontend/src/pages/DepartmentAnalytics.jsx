import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Building2, BookOpen, Plus, Users, GraduationCap, CalendarCheck, X } from 'lucide-react';

export default function DepartmentAnalytics() {
  const { role } = useAuth();
  const isAdmin = role === 'admin';

  const [departments, setDepartments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [showDeptModal, setShowDeptModal] = useState(false);
  const [deptForm, setDeptForm] = useState({ code: '', name: '', description: '' });

  const [showCourseModal, setShowCourseModal] = useState(false);
  const [courseForm, setCourseForm] = useState({
    code: '',
    title: '',
    department_id: '',
    semester: 1,
    credits: 3,
  });

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      const [deptRes, coursesRes] = await Promise.all([
        api.analytics.getDepartments(),
        api.departments.listCourses(),
      ]);
      setDepartments(deptRes);
      setCourses(coursesRes);
      if (deptRes.length > 0 && !courseForm.department_id) {
        setCourseForm((prev) => ({ ...prev, department_id: deptRes[0].department_id }));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  const handleCreateDept = async (e) => {
    e.preventDefault();
    try {
      await api.departments.create(deptForm);
      setShowDeptModal(false);
      setDeptForm({ code: '', name: '', description: '' });
      loadData();
    } catch (err) {
      alert(err.message || 'Failed to create department');
    }
  };

  const handleCreateCourse = async (e) => {
    e.preventDefault();
    try {
      await api.departments.createCourse({
        ...courseForm,
        department_id: Number(courseForm.department_id),
        semester: Number(courseForm.semester),
        credits: Number(courseForm.credits),
      });
      setShowCourseModal(false);
      loadData();
    } catch (err) {
      alert(err.message || 'Failed to create course');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <h3 className="font-bold text-slate-900 dark:text-white text-sm">
            Department & Course Analytics
          </h3>
          <p className="text-xs text-slate-500">
            Institutional structure, departmental strength, and course offerings
          </p>
        </div>

        {isAdmin && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowDeptModal(true)}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1 shadow-sm transition"
            >
              <Plus size={14} /> Add Department
            </button>
            <button
              onClick={() => setShowCourseModal(true)}
              className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1 shadow-sm transition"
            >
              <Plus size={14} /> Add Course
            </button>
          </div>
        )}
      </div>

      {/* Departments Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {departments.map((dept) => (
          <div
            key={dept.department_id}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-3"
          >
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-1 rounded bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-mono font-bold text-xs">
                {dept.department_code}
              </span>
              <span className="text-[11px] text-slate-400">{dept.total_courses} Courses</span>
            </div>
            <div>
              <h4 className="font-bold text-sm text-slate-900 dark:text-white leading-tight">
                {dept.department_name}
              </h4>
              <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                <Users size={13} /> {dept.total_students} Enrolled Students
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
              <div className="bg-slate-50 dark:bg-slate-800/40 p-2 rounded">
                <div className="text-[10px] text-slate-400 font-semibold uppercase">Avg CGPA</div>
                <div className="font-bold text-slate-900 dark:text-white mt-0.5">
                  {dept.average_cgpa ? `${dept.average_cgpa} / 10` : 'N/A'}
                </div>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800/40 p-2 rounded">
                <div className="text-[10px] text-slate-400 font-semibold uppercase">Avg Attendance</div>
                <div className="font-bold text-slate-900 dark:text-white mt-0.5">
                  {dept.average_attendance ? `${dept.average_attendance}%` : 'N/A'}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Course Catalog Table */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800">
          <h4 className="font-bold text-xs uppercase text-slate-700 dark:text-slate-300">
            Course Catalog & Academic Curriculum
          </h4>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="py-3 px-4">Course Code</th>
                <th className="py-3 px-4">Title</th>
                <th className="py-3 px-4">Department</th>
                <th className="py-3 px-4">Semester</th>
                <th className="py-3 px-4">Credits</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {courses.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                  <td className="py-3 px-4 font-mono font-bold text-blue-600">{c.code}</td>
                  <td className="py-3 px-4 font-semibold text-slate-900 dark:text-white">{c.title}</td>
                  <td className="py-3 px-4 text-slate-600 dark:text-slate-300">{c.department_name || '—'}</td>
                  <td className="py-3 px-4">Semester {c.semester}</td>
                  <td className="py-3 px-4 font-mono">{c.credits} Credits</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Create Department */}
      {showDeptModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-sm w-full p-6 relative">
            <button
              onClick={() => setShowDeptModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
            >
              <X size={20} />
            </button>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-3">Add Department</h3>
            <form onSubmit={handleCreateDept} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1">Code (e.g. CSE) *</label>
                <input
                  type="text"
                  required
                  value={deptForm.code}
                  onChange={(e) => setDeptForm({ ...deptForm, code: e.target.value.toUpperCase() })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">Name *</label>
                <input
                  type="text"
                  required
                  value={deptForm.name}
                  onChange={(e) => setDeptForm({ ...deptForm, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowDeptModal(false)}
                  className="px-3 py-1.5 border rounded-lg"
                >
                  Cancel
                </button>
                <button type="submit" className="px-3 py-1.5 bg-blue-600 text-white rounded-lg">
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Create Course */}
      {showCourseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-sm w-full p-6 relative">
            <button
              onClick={() => setShowCourseModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
            >
              <X size={20} />
            </button>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-3">Add Course</h3>
            <form onSubmit={handleCreateCourse} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1">Course Code *</label>
                <input
                  type="text"
                  required
                  value={courseForm.code}
                  onChange={(e) => setCourseForm({ ...courseForm, code: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">Title *</label>
                <input
                  type="text"
                  required
                  value={courseForm.title}
                  onChange={(e) => setCourseForm({ ...courseForm, title: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">Department *</label>
                <select
                  value={courseForm.department_id}
                  onChange={(e) => setCourseForm({ ...courseForm, department_id: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                >
                  {departments.map((d) => (
                    <option key={d.department_id} value={d.department_id}>
                      {d.department_code} - {d.department_name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold mb-1">Semester</label>
                  <input
                    type="number"
                    min="1"
                    max="8"
                    value={courseForm.semester}
                    onChange={(e) => setCourseForm({ ...courseForm, semester: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Credits</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={courseForm.credits}
                    onChange={(e) => setCourseForm({ ...courseForm, credits: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCourseModal(false)}
                  className="px-3 py-1.5 border rounded-lg"
                >
                  Cancel
                </button>
                <button type="submit" className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg">
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
