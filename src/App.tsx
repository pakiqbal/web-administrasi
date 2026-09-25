import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LoginPage } from './components/auth/LoginPage';
import { Header } from './components/common/Header';
import { Sidebar } from './components/common/Sidebar';

// Admin Components
import { AdminDashboard } from './components/admin/AdminDashboard';
import { AdminTeachersView } from './components/admin/AdminTeachersView';
import { AdminSchoolSettingsView } from './components/admin/AdminSchoolSettingsView';
import { AdminRequirementsView } from './components/admin/AdminRequirementsView';
import { AdminPeriodsView } from './components/admin/AdminPeriodsView';
import { AdminUsersView } from './components/admin/AdminUsersView';

// Kepsek Components
import { KepsekDashboard } from './components/kepsek/KepsekDashboard';
import { KepsekMonitoringView } from './components/kepsek/KepsekMonitoringView';
import { KepsekPendingReviewList } from './components/kepsek/KepsekPendingReviewList';
import { KepsekReportsView } from './components/kepsek/KepsekReportsView';

// Guru Components
import { GuruDashboard } from './components/guru/GuruDashboard';
import { GuruAdminView } from './components/guru/GuruAdminView';
import { GuruNeedRevisionView } from './components/guru/GuruNeedRevisionView';
import { GuruProfileView } from './components/guru/GuruProfileView';

// Settings & Security Component
import { SettingsView } from './components/settings/SettingsView';

const MainLayout: React.FC = () => {
  const { currentUser, isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [reportTeacherId, setReportTeacherId] = useState<string | undefined>(undefined);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState<boolean>(false);

  // Reset tab to dashboard on role change
  useEffect(() => {
    setActiveTab('dashboard');
    setReportTeacherId(undefined);
    setIsMobileSidebarOpen(false);
  }, [currentUser?.role]);

  if (!isAuthenticated || !currentUser) {
    return <LoginPage />;
  }

  const handleNavigateToTeacherReport = (teacherId: string) => {
    setReportTeacherId(teacherId);
    setActiveTab('laporan');
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setIsMobileSidebarOpen(false);
    if (tab !== 'laporan') {
      setReportTeacherId(undefined);
    }
  };

  const renderContent = () => {
    const role = currentUser.role;

    // 1. ADMIN ROLE VIEWS
    if (role === 'ADMIN') {
      switch (activeTab) {
        case 'dashboard':
          return <AdminDashboard onNavigateTab={handleTabChange} />;
        case 'data_guru':
          return <AdminTeachersView />;
        case 'jenis_administrasi':
        case 'jenis_dokumen':
        case 'kategori_administrasi':
          return <AdminRequirementsView />;
        case 'data_sekolah':
          return <AdminSchoolSettingsView />;
        case 'tahun_pelajaran':
          return <AdminPeriodsView />;
        case 'akun_pengguna':
          return <AdminUsersView />;
        case 'laporan':
          return <KepsekReportsView initialTeacherId={reportTeacherId} />;
        case 'pengaturan':
          return <SettingsView />;
        default:
          return <AdminDashboard onNavigateTab={handleTabChange} />;
      }
    }

    // 2. KEPALA SEKOLAH ROLE VIEWS
    if (role === 'KEPALA_SEKOLAH') {
      switch (activeTab) {
        case 'dashboard':
          return <KepsekDashboard onNavigateTab={handleTabChange} />;
        case 'monitoring':
          return (
            <KepsekMonitoringView
              onGenerateReportForTeacher={handleNavigateToTeacherReport}
            />
          );
        case 'pemeriksaan':
        case 'menunggu_pemeriksaan':
          return <KepsekPendingReviewList mode="menunggu" />;
        case 'belum_diunggah':
          return <KepsekPendingReviewList mode="belum_diunggah" />;
        case 'perlu_perbaikan':
          return <KepsekPendingReviewList mode="perbaikan" />;
        case 'riwayat_pemeriksaan':
          return <KepsekPendingReviewList mode="riwayat" />;
        case 'data_guru_kepsek':
          return <AdminTeachersView />;
        case 'laporan':
          return <KepsekReportsView initialTeacherId={reportTeacherId} />;
        case 'pengaturan':
          return <SettingsView />;
        case 'profil':
          return <SettingsView />;
        default:
          return <KepsekDashboard onNavigateTab={handleTabChange} />;
      }
    }

    // 3. GURU / PEGAWAI ROLE VIEWS
    if (role === 'GURU') {
      switch (activeTab) {
        case 'dashboard':
          return <GuruDashboard onNavigateTab={handleTabChange} />;
        case 'administrasi':
        case 'upload_dokumen':
        case 'status_pemeriksaan':
        case 'riwayat_dokumen':
          return <GuruAdminView />;
        case 'perbaikan_guru':
          return <GuruNeedRevisionView />;
        case 'profil':
          return <GuruProfileView />;
        case 'pengaturan':
          return <SettingsView />;
        default:
          return <GuruDashboard onNavigateTab={handleTabChange} />;
      }
    }

    return null;
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col antialiased">
      {/* Header */}
      <Header
        currentTab={activeTab}
        onSelectTab={handleTabChange}
        onToggleSidebar={() => setIsMobileSidebarOpen(prev => !prev)}
      />

      {/* Main Body */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 gap-6">
        {/* Responsive Sidebar */}
        <Sidebar
          currentTab={activeTab}
          onSelectTab={handleTabChange}
          isOpenMobile={isMobileSidebarOpen}
          onCloseMobile={() => setIsMobileSidebarOpen(false)}
        />

        {/* Content Area */}
        <main className="flex-1 min-w-0 pb-12">
          {renderContent()}
        </main>
      </div>

      {/* Screen Footer (Hidden in print) */}
      <footer className="bg-white border-t border-slate-200 py-4 text-center text-xs text-slate-500 no-print">
        <p className="font-semibold text-slate-700">
          TKIT MUTIARA ISLAM PALOPO &bull; Sistem Pemantauan Administrasi Guru & Pegawai
        </p>
        <p className="text-[11px] text-slate-400 mt-0.5">
          Kepala Sekolah: Sitti Hidayati, S.Pd &bull; Hak Cipta &copy; {new Date().getFullYear()}
        </p>
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <MainLayout />
    </AuthProvider>
  );
}
