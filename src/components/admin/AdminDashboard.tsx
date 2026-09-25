import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { storageService } from '../../services/storage';
import {
  Users,
  School,
  FolderTree,
  Calendar,
  Shield,
  FileSpreadsheet,
  ArrowRight,
  UserPlus,
  FilePlus,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';

interface AdminDashboardProps {
  onNavigateTab: (tab: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onNavigateTab }) => {
  const { school } = useAuth();
  const teachers = storageService.getTeachers();
  const requirements = storageService.getRequirements();
  const categories = storageService.getCategories();
  const users = storageService.getUsers();
  const schoolYears = storageService.getSchoolYears();
  const activeYear = schoolYears.find((y) => y.is_active);

  const mandatoryCount = requirements.filter((r) => r.is_mandatory && r.is_active).length;

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-slate-900 to-indigo-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 space-y-2">
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-500/20 text-blue-200 border border-blue-500/30 inline-flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            PANEL ADMINISTRATOR SISTEM
          </span>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">{school.name}</h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl">
            Sistem Pemantauan Administrasi Guru & Pegawai &bull; Kepala Sekolah: {school.principal_name}
          </p>
        </div>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div
          onClick={() => onNavigateTab('data_guru')}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-blue-400 transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between text-blue-600 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Guru & Pegawai
            </span>
            <Users className="w-5 h-5" />
          </div>
          <div className="text-2xl font-black text-slate-900">{teachers.length}</div>
          <span className="text-[11px] text-slate-400 block mt-0.5">
            {teachers.length === 0 ? 'KOSONG (Perlu diisi)' : 'Terdaftar'}
          </span>
        </div>

        <div
          onClick={() => onNavigateTab('jenis_administrasi')}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-blue-400 transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between text-indigo-600 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Dokumen Wajib
            </span>
            <FolderTree className="w-5 h-5" />
          </div>
          <div className="text-2xl font-black text-slate-900">{mandatoryCount}</div>
          <span className="text-[11px] text-slate-400 block mt-0.5">
            dari {requirements.length} jenis berkas
          </span>
        </div>

        <div
          onClick={() => onNavigateTab('akun_pengguna')}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-blue-400 transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between text-purple-600 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Akun Pengguna
            </span>
            <Shield className="w-5 h-5" />
          </div>
          <div className="text-2xl font-black text-slate-900">{users.length}</div>
          <span className="text-[11px] text-slate-400 block mt-0.5">Admin, Kepsek, Guru</span>
        </div>

        <div
          onClick={() => onNavigateTab('tahun_pelajaran')}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-blue-400 transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between text-emerald-600 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Tahun Ajaran
            </span>
            <Calendar className="w-5 h-5" />
          </div>
          <div className="text-lg font-black text-slate-900 truncate">
            {activeYear?.name || '2025/2026'}
          </div>
          <span className="text-[11px] text-emerald-600 font-bold block mt-0.5">
            Semester Aktif
          </span>
        </div>
      </div>

      {/* Notice on Installation Initial State */}
      {teachers.length === 0 && (
        <div className="bg-amber-50 border-2 border-amber-300 rounded-3xl p-6 sm:p-8 space-y-4">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-amber-500 text-slate-950 rounded-2xl font-bold shrink-0">
              <Users className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-amber-950">
                Pemberitahuan Instalasi Awal: Jumlah Guru/Pegawai Kosong
              </h3>
              <p className="text-xs text-amber-900 leading-relaxed">
                Sesuai petunjuk, data guru dan pegawai tidak dibuat secara otomatis (kosong pada instalasi awal). Anda sebagai <strong>ADMINISTRATOR</strong> dapat memasukkan data guru/pegawai beserta akun login melalui tombol di bawah.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-3 pt-2">
            <button
              onClick={() => onNavigateTab('data_guru')}
              className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold shadow-md shadow-amber-600/30 flex items-center gap-2 cursor-pointer transition-colors"
            >
              <UserPlus className="w-4 h-4" />
              <span>Tambah Guru / Pegawai Sekarang</span>
            </button>
          </div>
        </div>
      )}

      {/* Quick Action Navigation Grid */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
          Menu Pengaturan & Pengelolaan Utama
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
          <button
            onClick={() => onNavigateTab('data_guru')}
            className="p-4 rounded-2xl border border-slate-200 hover:border-blue-500 hover:bg-blue-50/40 text-left transition-all group cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <Users className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-slate-900 group-hover:text-blue-700 text-sm">
              Data Guru & Pegawai
            </h4>
            <p className="text-slate-500 text-[11px] mt-1">
              Tambah, edit, hapus tenaga pendidik dan staf serta buat akun login.
            </p>
          </button>

          <button
            onClick={() => onNavigateTab('jenis_administrasi')}
            className="p-4 rounded-2xl border border-slate-200 hover:border-blue-500 hover:bg-blue-50/40 text-left transition-all group cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <FolderTree className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-slate-900 group-hover:text-blue-700 text-sm">
              Jenis Administrasi & Dokumen Wajib
            </h4>
            <p className="text-slate-500 text-[11px] mt-1">
              Atur berkas wajib / tidak wajib dan kategori administrasi PAUD.
            </p>
          </button>

          <button
            onClick={() => onNavigateTab('data_sekolah')}
            className="p-4 rounded-2xl border border-slate-200 hover:border-blue-500 hover:bg-blue-50/40 text-left transition-all group cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <School className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-slate-900 group-hover:text-blue-700 text-sm">
              Data Sekolah & Logo
            </h4>
            <p className="text-slate-500 text-[11px] mt-1">
              Atur identitas resmi sekolah, logo untuk kop surat, dan batas ukuran file.
            </p>
          </button>

          <button
            onClick={() => onNavigateTab('tahun_pelajaran')}
            className="p-4 rounded-2xl border border-slate-200 hover:border-blue-500 hover:bg-blue-50/40 text-left transition-all group cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <Calendar className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-slate-900 group-hover:text-blue-700 text-sm">
              Tahun Pelajaran & Semester
            </h4>
            <p className="text-slate-500 text-[11px] mt-1">
              Tentukan periode aktif untuk tahun pelajaran dan semester ganjil/genap.
            </p>
          </button>

          <button
            onClick={() => onNavigateTab('akun_pengguna')}
            className="p-4 rounded-2xl border border-slate-200 hover:border-blue-500 hover:bg-blue-50/40 text-left transition-all group cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <Shield className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-slate-900 group-hover:text-blue-700 text-sm">
              Akun & Role Pengguna
            </h4>
            <p className="text-slate-500 text-[11px] mt-1">
              Kelola kredensial akun login dan tetapkan hak akses admin/kepsek/guru.
            </p>
          </button>

          <button
            onClick={() => onNavigateTab('laporan')}
            className="p-4 rounded-2xl border border-slate-200 hover:border-blue-500 hover:bg-blue-50/40 text-left transition-all group cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-slate-900 group-hover:text-blue-700 text-sm">
              Laporan Administrasi
            </h4>
            <p className="text-slate-500 text-[11px] mt-1">
              Pratinjau dan ekspor laporan administrasi ke PDF atau Excel.
            </p>
          </button>
        </div>
      </div>
    </div>
  );
};
