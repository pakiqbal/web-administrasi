import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { storageService } from '../../services/storage';
import {
  LayoutDashboard,
  School as SchoolIcon,
  Users,
  UserCog,
  FolderTree,
  FileCheck2,
  CalendarDays,
  FileSpreadsheet,
  Settings,
  ClipboardList,
  Clock,
  AlertCircle,
  History,
  UserCheck,
  UploadCloud,
  ListOrdered,
  Bell,
  CheckCircle2,
  FileText,
  User,
  ShieldAlert,
} from 'lucide-react';

interface SidebarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  isOpenMobile,
  onCloseMobile,
}) => {
  const { currentUser, currentTeacher } = useAuth();

  if (!currentUser) return null;

  // Compute live badges
  const allDocs = storageService.getDocuments();
  const allTeachers = storageService.getTeachers();

  const pendingReviewCount = allDocs.filter((d) => d.status === 'MENUNGGU_PEMERIKSAAN').length;
  const needRevisionCount = allDocs.filter((d) => d.status === 'PERLU_PERBAIKAN').length;

  let myNeedRevisionCount = 0;
  let myPendingCount = 0;
  if (currentTeacher) {
    const myDocs = storageService.getDocumentsByTeacherId(currentTeacher.id);
    myNeedRevisionCount = myDocs.filter((d) => d.status === 'PERLU_PERBAIKAN').length;
    myPendingCount = myDocs.filter((d) => d.status === 'MENUNGGU_PEMERIKSAAN').length;
  }

  // Define Navigation Items based on Role
  interface NavItem {
    id: string;
    label: string;
    icon: React.ElementType;
    badge?: number | string;
    badgeColor?: string;
  }

  let navItems: NavItem[] = [];

  if (currentUser.role === 'ADMIN') {
    navItems = [
      { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { id: 'data_sekolah', label: 'Data Sekolah', icon: SchoolIcon },
      {
        id: 'data_guru',
        label: 'Data Guru/Pegawai',
        icon: Users,
        badge: allTeachers.length,
        badgeColor: 'bg-blue-100 text-blue-700',
      },
      { id: 'akun_pengguna', label: 'Akun Pengguna', icon: UserCog },
      { id: 'kategori_administrasi', label: 'Kategori Administrasi', icon: FolderTree },
      { id: 'jenis_dokumen', label: 'Jenis Dokumen', icon: FileCheck2 },
      { id: 'tahun_pelajaran', label: 'Tahun & Semester', icon: CalendarDays },
      { id: 'laporan', label: 'Laporan', icon: FileSpreadsheet },
      { id: 'pengaturan', label: 'Pengaturan', icon: Settings },
    ];
  } else if (currentUser.role === 'KEPALA_SEKOLAH') {
    navItems = [
      { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
      {
        id: 'data_guru_kepsek',
        label: 'Data Guru/Pegawai',
        icon: Users,
        badge: allTeachers.length,
        badgeColor: 'bg-blue-100 text-blue-700',
      },
      { id: 'monitoring', label: 'Monitoring Administrasi', icon: ClipboardList },
      {
        id: 'pemeriksaan',
        label: 'Pemeriksaan Dokumen',
        icon: FileCheck2,
        badge: pendingReviewCount > 0 ? pendingReviewCount : undefined,
        badgeColor: 'bg-amber-100 text-amber-800',
      },
      { id: 'belum_diunggah', label: 'Belum Diunggah', icon: Clock },
      {
        id: 'menunggu_pemeriksaan',
        label: 'Menunggu Pemeriksaan',
        icon: Clock,
        badge: pendingReviewCount > 0 ? pendingReviewCount : undefined,
        badgeColor: 'bg-amber-100 text-amber-800',
      },
      {
        id: 'perlu_perbaikan',
        label: 'Perlu Perbaikan',
        icon: AlertCircle,
        badge: needRevisionCount > 0 ? needRevisionCount : undefined,
        badgeColor: 'bg-orange-100 text-orange-800',
      },
      { id: 'riwayat_pemeriksaan', label: 'Riwayat Pemeriksaan', icon: History },
      { id: 'laporan', label: 'Laporan', icon: FileSpreadsheet },
      { id: 'profil', label: 'Profil Kepala Sekolah', icon: UserCheck },
      { id: 'pengaturan', label: 'Pengaturan', icon: Settings },
    ];
  } else {
    // GURU / PEGAWAI
    navItems = [
      { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { id: 'profil', label: 'Profil Saya', icon: User },
      { id: 'administrasi', label: 'Administrasi Saya', icon: ListOrdered },
      { id: 'upload_dokumen', label: 'Upload Dokumen', icon: UploadCloud },
      {
        id: 'status_pemeriksaan',
        label: 'Status Pemeriksaan',
        icon: FileCheck2,
        badge: myPendingCount > 0 ? myPendingCount : undefined,
        badgeColor: 'bg-amber-100 text-amber-800',
      },
      {
        id: 'perbaikan_guru',
        label: 'Perlu Perbaikan',
        icon: AlertCircle,
        badge: myNeedRevisionCount > 0 ? myNeedRevisionCount : undefined,
        badgeColor: 'bg-orange-100 text-orange-800 animate-pulse',
      },
      { id: 'notifikasi', label: 'Notifikasi', icon: Bell },
      { id: 'riwayat_dokumen', label: 'Riwayat Dokumen', icon: History },
      { id: 'pengaturan', label: 'Pengaturan', icon: Settings },
    ];
  }

  const handleNavClick = (id: string) => {
    onSelectTab(id);
    onCloseMobile();
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpenMobile && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-xs lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-slate-900 text-slate-300 transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:z-auto flex flex-col ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Sidebar Header */}
        <div className="h-16 flex items-center justify-between px-5 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-500 text-white flex items-center justify-center font-black text-xs shadow-md">
              MI
            </div>
            <div>
              <span className="font-extrabold text-sm text-white tracking-wider block">
                ADMINISTRASI
              </span>
              <span className="text-[10px] text-blue-400 font-semibold tracking-widest uppercase">
                TKIT MUTIARA ISLAM
              </span>
            </div>
          </div>
        </div>

        {/* Role identification badge */}
        <div className="px-4 py-3 bg-slate-800/60 border-b border-slate-800/80 flex items-center gap-2.5">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          <div className="overflow-hidden">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Menu Aktif
            </span>
            <span className="text-xs font-bold text-white truncate block">
              {currentUser.role === 'ADMIN'
                ? 'Panel Administrator'
                : currentUser.role === 'KEPALA_SEKOLAH'
                ? 'Dashboard Kepala Sekolah'
                : 'Portal Guru & Pegawai'}
            </span>
          </div>
        </div>

        {/* Navigation items */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white font-semibold shadow-md shadow-blue-600/30'
                    : 'text-slate-400 hover:bg-slate-800/80 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span className="truncate">{item.label}</span>
                </div>

                {item.badge !== undefined && (
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${
                      isActive ? 'bg-white text-blue-700' : item.badgeColor || 'bg-slate-800 text-slate-300'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Sidebar Footer info */}
        <div className="p-3.5 border-t border-slate-800/80 bg-slate-950/40 text-[11px] text-slate-500">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span>Kepala Sekolah:</span>
          </div>
          <p className="font-semibold text-white truncate">Sitti Hidayati, S.Pd</p>
          <p className="text-[10px] text-slate-500 mt-1">Palopo, Sulawesi Selatan</p>
        </div>
      </aside>
    </>
  );
};
