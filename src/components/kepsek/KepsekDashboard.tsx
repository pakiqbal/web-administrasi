import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { storageService } from '../../services/storage';
import { ProgressBar } from '../common/ProgressBar';
import { StatusBadge } from '../common/StatusBadge';
import { KepsekReviewModal } from './KepsekReviewModal';
import { TeacherDocument } from '../../types';
import {
  Users,
  CheckCircle2,
  Clock,
  AlertCircle,
  CircleDashed,
  Percent,
  GraduationCap,
  Sparkles,
  BarChart3,
  PieChart as PieIcon,
  TrendingUp,
  FolderTree,
  ArrowRight,
  Eye,
  FileCheck2,
} from 'lucide-react';

interface KepsekDashboardProps {
  onNavigateTab: (tab: string) => void;
}

export const KepsekDashboard: React.FC<KepsekDashboardProps> = ({ onNavigateTab }) => {
  const { school, refreshData } = useAuth();
  const [reviewDoc, setReviewDoc] = useState<TeacherDocument | null>(null);

  const teachers = storageService.getTeachers();
  const progressList = storageService.getAllTeachersProgress();
  const allDocs = storageService.getDocuments();
  const categories = storageService.getCategories();
  const requirements = storageService.getRequirements().filter((r) => r.is_active);

  // Calculate Aggregates
  const totalTeachers = teachers.length;
  let totalLengkap = 0;
  let totalMenunggu = 0;
  let totalPerluPerbaikan = 0;
  let totalBelumDiunggah = 0;
  let totalDitolak = 0;

  progressList.forEach((p) => {
    totalLengkap += p.status_counts.lengkap;
    totalMenunggu += p.status_counts.menunggu_pemeriksaan;
    totalPerluPerbaikan += p.status_counts.perlu_perbaikan;
    totalBelumDiunggah += p.status_counts.belum_diunggah;
    totalDitolak += p.status_counts.ditolak;
  });

  const avgPercentage =
    progressList.length > 0
      ? Math.round(progressList.reduce((acc, p) => acc + p.percentage, 0) / progressList.length)
      : 0;

  // Documents waiting for review
  const pendingDocs = allDocs
    .filter((d) => d.status === 'MENUNGGU_PEMERIKSAAN')
    .slice(0, 5);

  // Category completion calculation
  const categoryStats = categories.map((cat) => {
    const catReqs = requirements.filter((r) => r.category_id === cat.id);
    const catReqIds = new Set(catReqs.map((r) => r.id));
    const catDocs = allDocs.filter((d) => catReqIds.has(d.document_requirement_id));
    const lengkap = catDocs.filter((d) => d.status === 'LENGKAP').length;
    const totalPotential = catReqs.length * Math.max(1, totalTeachers);
    const percent = totalPotential > 0 ? Math.round((lengkap / totalPotential) * 100) : 0;
    return {
      category: cat,
      reqCount: catReqs.length,
      lengkap,
      percent: Math.min(100, percent),
    };
  });

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-slate-950/20 border border-slate-800 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                DASHBOARD KEPALA SEKOLAH
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight uppercase">
              {school.name}
            </h1>
            <p className="text-sm text-slate-300 mt-1 font-medium">
              Kepala Sekolah: <strong className="text-white font-bold">{school.principal_name}</strong>
            </p>
            <p className="text-xs text-slate-400 mt-0.5">
              Tahun Ajaran: 2025/2026 &bull; Sistem Pemantauan Administrasi Guru & Pegawai
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => onNavigateTab('monitoring')}
              className="px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-2xl shadow-lg shadow-blue-600/30 transition-all flex items-center gap-2 cursor-pointer"
            >
              <span>Buka Monitoring Lengkap</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* 6 KARTU STATISTIK (Sesuai Permintaan D) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        {/* TOTAL GURU/PEGAWAI */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider">Guru & Pegawai</span>
            <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div>
            <span className="text-2xl font-black text-slate-900">{totalTeachers}</span>
            <span className="text-[10px] text-slate-400 block mt-0.5">Orang terdaftar</span>
          </div>
        </div>

        {/* DOKUMEN LENGKAP */}
        <div className="bg-white rounded-2xl p-4 border border-emerald-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-emerald-700 mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider">Lengkap</span>
            <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div>
            <span className="text-2xl font-black text-emerald-700">{totalLengkap}</span>
            <span className="text-[10px] text-emerald-600 block mt-0.5">Tervalidasi Kepsek</span>
          </div>
        </div>

        {/* MENUNGGU PEMERIKSAAN */}
        <div className="bg-white rounded-2xl p-4 border border-amber-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-amber-700 mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider">Menunggu</span>
            <div className="p-1.5 rounded-lg bg-amber-50 text-amber-600">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div>
            <span className="text-2xl font-black text-amber-700">{totalMenunggu}</span>
            <span className="text-[10px] text-amber-600 block mt-0.5">Perlu diperiksa</span>
          </div>
        </div>

        {/* PERLU PERBAIKAN */}
        <div className="bg-white rounded-2xl p-4 border border-orange-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-orange-700 mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider">Perlu Perbaikan</span>
            <div className="p-1.5 rounded-lg bg-orange-50 text-orange-600">
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>
          <div>
            <span className="text-2xl font-black text-orange-700">{totalPerluPerbaikan}</span>
            <span className="text-[10px] text-orange-600 block mt-0.5">Revisi guru</span>
          </div>
        </div>

        {/* BELUM DIUNGGAH */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider">Belum Diunggah</span>
            <div className="p-1.5 rounded-lg bg-slate-100 text-slate-500">
              <CircleDashed className="w-4 h-4" />
            </div>
          </div>
          <div>
            <span className="text-2xl font-black text-slate-800">{totalBelumDiunggah}</span>
            <span className="text-[10px] text-slate-400 block mt-0.5">Belum dikirim</span>
          </div>
        </div>

        {/* RATA-RATA KELENGKAPAN */}
        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white rounded-2xl p-4 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-blue-100 mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider">Rata-rata</span>
            <div className="p-1.5 rounded-lg bg-white/20 text-white">
              <Percent className="w-4 h-4" />
            </div>
          </div>
          <div>
            <span className="text-2xl font-black text-white">{avgPercentage}%</span>
            <span className="text-[10px] text-blue-200 block mt-0.5">Dokumen Wajib</span>
          </div>
        </div>
      </div>

      {/* Notice if Teachers List is Currently Empty */}
      {totalTeachers === 0 && (
        <div className="bg-blue-50 border-2 border-blue-200 rounded-3xl p-6 sm:p-8 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center mx-auto">
            <Users className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900">
            Data Guru & Pegawai Saat Ini Masih Kosong
          </h3>
          <p className="text-xs text-slate-600 max-w-lg mx-auto">
            Sesuai instruksi instalasi awal, data guru/pegawai dikosongkan. Administrator Sekolah dapat memasukkan data guru/pegawai melalui menu <strong>Data Guru/Pegawai</strong>.
          </p>
          <div className="pt-2">
            <button
              onClick={() => onNavigateTab('data_guru_kepsek')}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all"
            >
              Lihat Daftar Guru/Pegawai
            </button>
          </div>
        </div>
      )}

      {/* 4 GRAFIK MONITORING (Sesuai Permintaan D) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Grafik 1: Persentase Kelengkapan Setiap Guru */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-blue-600" />
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-tight">
                1. Persentase Kelengkapan Setiap Guru
              </h3>
            </div>
            <span className="text-xs text-slate-400">Dokumen Wajib</span>
          </div>

          {progressList.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-400">
              Belum ada data guru/pegawai yang dimasukkan ke dalam sistem.
            </div>
          ) : (
            <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
              {progressList.map((p) => (
                <div key={p.teacher.id} className="space-y-1 text-xs">
                  <div className="flex items-center justify-between font-medium">
                    <span className="text-slate-800 font-bold truncate max-w-[200px]">
                      {p.teacher.name}
                    </span>
                    <span className="text-blue-700 font-bold">{p.percentage}%</span>
                  </div>
                  <ProgressBar percentage={p.percentage} height="h-2.5" showLabel={false} />
                  <div className="flex justify-between text-[10px] text-slate-400">
                    <span>{p.teacher.position}</span>
                    <span>
                      {p.mandatory_complete} / {p.total_mandatory} Lengkap
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Grafik 2: Status Dokumen (Distribution Chart) */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <PieIcon className="w-5 h-5 text-indigo-600" />
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-tight">
                2. Distribusi Status Dokumen
              </h3>
            </div>
            <span className="text-xs text-slate-400">Total: {allDocs.length} diunggah</span>
          </div>

          <div className="space-y-3">
            {/* Status Bars */}
            <div className="space-y-2 text-xs">
              <div>
                <div className="flex justify-between text-slate-700 font-medium mb-1">
                  <span className="flex items-center gap-1.5 text-emerald-700 font-bold">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Lengkap (Disetujui)
                  </span>
                  <span className="font-bold text-emerald-800">{totalLengkap} berkas</span>
                </div>
                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                  <div
                    className="bg-emerald-500 h-full rounded-full transition-all"
                    style={{
                      width: `${allDocs.length > 0 ? (totalLengkap / allDocs.length) * 100 : 0}%`,
                    }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-slate-700 font-medium mb-1">
                  <span className="flex items-center gap-1.5 text-amber-700 font-bold">
                    <Clock className="w-3.5 h-3.5" /> Menunggu Pemeriksaan
                  </span>
                  <span className="font-bold text-amber-800">{totalMenunggu} berkas</span>
                </div>
                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                  <div
                    className="bg-amber-500 h-full rounded-full transition-all"
                    style={{
                      width: `${allDocs.length > 0 ? (totalMenunggu / allDocs.length) * 100 : 0}%`,
                    }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-slate-700 font-medium mb-1">
                  <span className="flex items-center gap-1.5 text-orange-700 font-bold">
                    <AlertCircle className="w-3.5 h-3.5" /> Perlu Perbaikan
                  </span>
                  <span className="font-bold text-orange-800">{totalPerluPerbaikan} berkas</span>
                </div>
                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                  <div
                    className="bg-orange-500 h-full rounded-full transition-all"
                    style={{
                      width: `${allDocs.length > 0 ? (totalPerluPerbaikan / allDocs.length) * 100 : 0}%`,
                    }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-slate-700 font-medium mb-1">
                  <span className="flex items-center gap-1.5 text-slate-600 font-semibold">
                    <CircleDashed className="w-3.5 h-3.5" /> Belum Diunggah
                  </span>
                  <span className="font-bold text-slate-700">{totalBelumDiunggah} item</span>
                </div>
                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                  <div
                    className="bg-slate-400 h-full rounded-full transition-all"
                    style={{
                      width: `${
                        totalBelumDiunggah + allDocs.length > 0
                          ? (totalBelumDiunggah / (totalBelumDiunggah + allDocs.length)) * 100
                          : 0
                      }%`,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Grafik 3: Kelengkapan Berdasarkan Kategori */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <FolderTree className="w-5 h-5 text-emerald-600" />
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-tight">
                3. Kelengkapan Berdasarkan Kategori
              </h3>
            </div>
            <span className="text-xs text-slate-400">8 Kategori</span>
          </div>

          <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
            {categoryStats.map((item) => (
              <div key={item.category.id} className="space-y-1 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800 text-[11px] truncate max-w-[240px]">
                    {item.category.name}
                  </span>
                  <span className="font-bold text-slate-700">{item.percent}%</span>
                </div>
                <ProgressBar percentage={item.percent} height="h-2" showLabel={false} />
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>{item.reqCount} jenis dokumen</span>
                  <span>{item.lengkap} berkas lengkap</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Grafik 4: Perkembangan Kelengkapan Administrasi */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-tight">
                4. Perkembangan Kelengkapan Administrasi
              </h3>
            </div>
            <span className="text-xs text-blue-600 font-bold">Semester Ganjil 2025/2026</span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-600">Target Kelengkapan Yayasan:</span>
              <strong className="text-slate-900 font-bold">100% Dokumen Wajib</strong>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-600">Capaian Saat Ini:</span>
              <strong className="text-blue-700 font-extrabold text-sm">{avgPercentage}%</strong>
            </div>

            <ProgressBar percentage={avgPercentage} height="h-4" showLabel={false} />

            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200 text-center text-[11px]">
              <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                <span className="text-slate-400 block text-[10px]">Dokumen Disetujui</span>
                <span className="text-emerald-700 font-bold text-base">{totalLengkap}</span>
              </div>
              <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                <span className="text-slate-400 block text-[10px]">Dalam Antrean Periksa</span>
                <span className="text-amber-700 font-bold text-base">{totalMenunggu}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Dokumen Menunggu Pemeriksaan Segera */}
      {pendingDocs.length > 0 && (
        <div className="bg-amber-50/70 border border-amber-200 rounded-3xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-amber-900 font-bold text-sm">
              <Clock className="w-5 h-5 text-amber-600" />
              <span>Dokumen Menunggu Pemeriksaan Kepala Sekolah Segera ({pendingDocs.length})</span>
            </div>
            <button
              onClick={() => onNavigateTab('pemeriksaan')}
              className="text-xs font-bold text-amber-800 hover:underline flex items-center gap-1"
            >
              Lihat Semua Antrean <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="divide-y divide-amber-100 bg-white rounded-2xl border border-amber-200 overflow-hidden">
            {pendingDocs.map((doc) => {
              const teacher = storageService.getTeacherById(doc.teacher_id);
              const req = storageService.getRequirements().find((r) => r.id === doc.document_requirement_id);

              return (
                <div key={doc.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div>
                    <span className="font-bold text-slate-900 text-sm block">
                      {req?.name || doc.file_name}
                    </span>
                    <div className="text-slate-500 text-[11px] mt-0.5">
                      Guru: <strong className="text-slate-700">{teacher?.name}</strong> &bull; File: {doc.file_name} &bull; Upload: {new Date(doc.uploaded_at).toLocaleDateString('id-ID')}
                    </div>
                  </div>

                  <button
                    onClick={() => setReviewDoc(doc)}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer shrink-0"
                  >
                    <FileCheck2 className="w-3.5 h-3.5" />
                    <span>PERIKSA DOKUMEN</span>
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Examination Review Modal */}
      {reviewDoc && (
        <KepsekReviewModal
          document={reviewDoc}
          onClose={() => setReviewDoc(null)}
          onSuccess={() => {
            setReviewDoc(null);
            refreshData();
          }}
        />
      )}
    </div>
  );
};
