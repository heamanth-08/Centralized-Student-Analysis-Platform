import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import StudentDirectory from './pages/StudentDirectory';
import StudentProfile from './pages/StudentProfile';
import AcademicAnalytics from './pages/AcademicAnalytics';
import AttendanceAnalytics from './pages/AttendanceAnalytics';
import DepartmentAnalytics from './pages/DepartmentAnalytics';
import StudentSupport from './pages/StudentSupport';
import StridePoint from './pages/StridePoint';
import DataImport from './pages/DataImport';
import Reports from './pages/Reports';
import Settings from './pages/Settings';

function AppContent() {
  const { isAuthenticated, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedStudentId, setSelectedStudentId] = useState(null);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-xs font-semibold text-slate-500">Initializing CampusIQ...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Login />;
  }

  const handleSelectStudent = (id) => {
    setSelectedStudentId(id);
  };

  const handleBackToDirectory = () => {
    setSelectedStudentId(null);
  };

  return (
    <Layout
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      selectedStudentId={selectedStudentId}
      setSelectedStudentId={setSelectedStudentId}
    >
      {selectedStudentId ? (
        <StudentProfile studentId={selectedStudentId} onBack={handleBackToDirectory} />
      ) : (
        <>
          {activeTab === 'dashboard' && <Dashboard onNavigate={setActiveTab} />}
          {activeTab === 'students' && (
            <StudentDirectory onSelectStudent={handleSelectStudent} />
          )}
          {activeTab === 'academic' && <AcademicAnalytics />}
          {activeTab === 'attendance' && (
            <AttendanceAnalytics onSelectStudent={handleSelectStudent} />
          )}
          {activeTab === 'departments' && <DepartmentAnalytics />}
          {activeTab === 'support' && (
            <StudentSupport onSelectStudent={handleSelectStudent} />
          )}
          {activeTab === 'stride' && (
            <StridePoint onSelectStudent={handleSelectStudent} />
          )}
          {activeTab === 'imports' && <DataImport />}
          {activeTab === 'reports' && <Reports />}
          {activeTab === 'settings' && <Settings />}
        </>
      )}
    </Layout>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
