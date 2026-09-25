import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { storageService } from '../../services/storage';
import { ProgressBar } from '../common/ProgressBar';
import { StatusBadge } from '../common/StatusBadge';
import { GuruUploadModal } from './GuruUploadModal';
import { FilePreviewModal } from '../common/FilePreviewModal';
import { TeacherDocument } from '../../types';
import {
  UploadCloud,
  CheckCircle2,
  Clock,
  AlertCircle,
  CircleDashed,
  Layers,
  User,
  Eye,
  ArrowUpRight,
  Sparkles,
  RefreshCw,
  FolderCheck,
} from 'lucide-react';

interface GuruDashboardProps {
  onNavigateTab: (tab: string) => void;
}

export const GuruDashboard: React.FC<GuruDashboardProps> = ({ onNavigateTab }) => {
  const { currentTeacher, refreshData } = useAuth();
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [previewDoc, setPreviewDoc] = useState<TeacherDocument | null>(null);

  if (!currentTeacher) {
    return (
      <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 shadow-sm">
        <AlertCircle className="w-12 h-12 text-amber-500 mx-auto mb-3" />
        <h3 className="text-base font-bold text-slate-800">Profil Guru Tidak Ditemukan</h3>
        <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
          Akun ini belum ditautkan dengan data profil Guru/Pegawai. Silakan hubungi Administrator Sekolah.
        </p>
      </div>
    );
  }

  const progress = storageService.calculateTeacherProgress(currentTeacher.id);
  const myDocs = storageService.getDocumentsByTeacherId(currentTeacher.id);
  const requirements = storageService.getRequirements().filter((r) => {
    if (!r.is_active) return false;
    if (currentTeacher.is_staff) {
      return r.target_role === 'PEGAWAI' || r.target_role === 'SEMUA';
    }
    return r.target_role === 'GURU' || r.target_role === 'SEMUA';
  });

  const needRevisionDocs = myDocs.filter((d) => d.status === 'PERLU_PERBAIKAN');
  const pendingDocs = myDocs.filter((d) => d.status === 'MENUNGGU_PEMERIKSAAN');

  const percentage = progress ? progress.percentage : 0;
  const statusCounts = progress?.status_counts || {
    belum_diunggah: 0,
    sudah_diunggah: 0,
    menunggu_pemeriksaan: 0,
    lengkap: 0,
    perlu_perbaikan: 0,
    ditolak: 0,
  };

  return (
    <div className="space-y-6">
      {/* Greeting & Header */}
      <div className="bg-gradient-to-r from-blue-700 via-blue-800 to-indigo-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-blue-900/10 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-white/5 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1.5">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/15 text-blue-100 backdrop-blur-xs">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              TKIT Mutiara Islam Palopo
            </span>
            <h1 className="text-xl sm:text-3xl font-black tracking-tight">
              Selamat Datang, {currentTeacher.name}
            </h1>
            <p className="text-xs sm:text-sm text-blue-100/90 font-medium">
              Sistem Pemantauan Administrasi Guru & Pegawai &bull; Kepala Sekolah: Sitti Hidayati, S.Pd
            </p>
          </div>

          {/* Profile Short Card */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 flex items-center gap-4 min-w-[260px]">
            <div className="w-14 h-14 rounded-2xl bg-white text-blue-800 flex items-center justify-center font-black text-xl shadow-md overflow-hidden shrink-0">
              {currentTeacher.photo ? (
                <img
                  src={currentTeacher.photo}
                  alt={currentTeacher.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="w-8 h-8 text-blue-700" />
              )}
            </div>
            <div className="overflow-hidden text-xs">
              <div className="font-bold text-white text-sm truncate">{currentTeacher.name}</div>
              <div className="text-blue-200 mt-0.5 font-mono">NIP/NUPTK: {currentTeacher.nip_nuptk || '-'}</div>
              <div className="text-blue-100 font-medium mt-0.5 truncate">{currentTeacher.position}</div>
              <div className="text-blue-200 text-[11px] truncate">
                {currentTeacher.subject_or_group} &bull; {currentTeacher.employment_status}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* FITUR WAJIB: TOMBOL BESAR UNGGAH FILE ADMINISTRASI */}
      <div className="bg-white rounded-3xl p-6 border-2 border-blue-200 shadow-lg shadow-blue-500/5 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="space-y-1 text-center sm:text-left">
          <h2 className="text-base font-black text-slate-900 tracking-tight flex items-center justify-center sm:justify-start gap-2">
            <UploadCloud className="w-5 h-5 text-blue-600" />
            UNGGAH DOKUMEN ADMINISTRASI BARU
          </h2>
          <p className="text-xs text-slate-500 font-medium">
            Unggah modul ajar, prota, promes, asesmen, atau administrasi lainnya untuk diperiksa Kepala Sekolah.
          </p>
        </div>

        <button
          onClick={() => setShowUploadModal(true)}
          className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-2xl font-black text-sm tracking-wide shadow-xl shadow-blue-600/30 hover:shadow-blue-600/50 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 cursor-pointer shrink-0"
        >
          <UploadCloud className="w-6 h-6" />
          <span>+ UNGGAH FILE ADMINISTRASI</span>
        </button>
      </div>

      {/* PROGRES ADMINISTRASI SAYA */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-base font-black text-slate-900 uppercase tracking-tight flex items-center gap-2">
              <FolderCheck className="w-5 h-5 text-blue-600" />
              PROGRES ADMINISTRASI SAYA
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              Persentase dihitung dari jumlah dokumen <strong>WAJIB</strong> yang berstatus <strong>LENGKAP</strong>.
            </p>
          </div>
          <div className="text-right">
            <span className="text-3xl font-black text-blue-700 tracking-tight">
              {percentage}%
            </span>
            <span className="text-xs text-slate-400 block font-medium">
              {progress?.mandatory_complete || 0} dari {progress?.total_mandatory || 0} Dokumen Wajib
            </span>
          </div>
        </div>

        <ProgressBar percentage={percentage} height="h-4" showLabel={false} />

        {/* 5 KARTU STATISTIK GURU */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 pt-4">
          {/* TOTAL ADMINISTRASI */}
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider">Total Dokumen</span>
              <Layers className="w-4 h-4 text-slate-400" />
            </div>
            <div>
              <span className="text-2xl font-black text-slate-900">
                {requirements.length}
              </span>
              <span className="text-[11px] text-slate-500 block mt-0.5">
                ({progress?.total_mandatory || 0} Wajib)
              </span>
            </div>
          </div>

          {/* SUDAH LENGKAP */}
          <div className="bg-emerald-50/70 rounded-2xl p-4 border border-emerald-200 flex flex-col justify-between">
            <div className="flex items-center justify-between text-emerald-700 mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider">Sudah Lengkap</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </div>
            <div>
              <span className="text-2xl font-black text-emerald-800">
                {statusCounts.lengkap}
              </span>
              <span className="text-[11px] text-emerald-600 block mt-0.5">
                Disetujui Kepsek
              </span>
            </div>
          </div>

          {/* MENUNGGU PEMERIKSAAN */}
          <div className="bg-amber-50/70 rounded-2xl p-4 border border-amber-200 flex flex-col justify-between">
            <div className="flex items-center justify-between text-amber-700 mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider">Menunggu Periksa</span>
              <Clock className="w-4 h-4 text-amber-600" />
            </div>
            <div>
              <span className="text-2xl font-black text-amber-800">
                {statusCounts.menunggu_pemeriksaan}
              </span>
              <span className="text-[11px] text-amber-600 block mt-0.5">
                Dalam antrean
              </span>
            </div>
          </div>

          {/* PERLU PERBAIKAN */}
          <div className="bg-orange-50/70 rounded-2xl p-4 border border-orange-200 flex flex-col justify-between">
            <div className="flex items-center justify-between text-orange-700 mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider">Perlu Perbaikan</span>
              <AlertCircle className="w-4 h-4 text-orange-600" />
            </div>
            <div>
              <span className="text-2xl font-black text-orange-800">
                {statusCounts.perlu_perbaikan}
              </span>
              <span className="text-[11px] text-orange-600 block mt-0.5">
                Ada catatan Kepsek
              </span>
            </div>
          </div>

          {/* BELUM DIUNGGAH */}
          <div className="bg-slate-100 rounded-2xl p-4 border border-slate-300 flex flex-col justify-between col-span-2 sm:col-span-1">
            <div className="flex items-center justify-between text-slate-600 mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider">Belum Diunggah</span>
              <CircleDashed className="w-4 h-4 text-slate-400" />
            </div>
            <div>
              <span className="text-2xl font-black text-slate-800">
                {statusCounts.belum_diunggah}
              </span>
              <span className="text-[11px] text-slate-500 block mt-0.5">
                Harus dipenuhi
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ALERT BOX IF THERE ARE REVISIONS NEEDED */}
      {needRevisionDocs.length > 0 && (
        <div className="bg-orange-50 border-2 border-orange-300 rounded-3xl p-6 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-orange-900 font-bold text-sm">
              <AlertCircle className="w-5 h-5 text-orange-600 animate-bounce" />
              <span>PERHATIAN: Terdapat {needRevisionDocs.length} Dokumen Membutuhkan Perbaikan</span>
            </div>
            <button
              onClick={() => onNavigateTab('perbaikan_guru')}
              className="text-xs font-bold text-orange-800 hover:underline flex items-center gap-1"
            >
              Lihat Semua Perbaikan <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2">
            {needRevisionDocs.slice(0, 3).map((doc) => {
              const req = storageService.getRequirements().find((r) => r.id === doc.document_requirement_id);
              const latestReview = storageService.getReviewsByDocumentId(doc.id)[0];
              return (
                <div
                  key={doc.id}
                  className="bg-white p-3.5 rounded-2xl border border-orange-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                >
                  <div>
                    <span className="font-bold text-slate-900 block">{req?.name || doc.file_name}</span>
                    <p className="text-orange-800 italic mt-0.5">
                      Catatan Kepala Sekolah: "{latestReview?.notes || 'Perbaiki dan upload ulang.'}"
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setShowUploadModal(true);
                    }}
                    className="px-4 py-1.5 bg-orange-600 text-white rounded-xl font-bold hover:bg-orange-700 transition-colors shrink-0"
                  >
                    Upload Ulang
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Quick Summary of Recent Submissions */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            Dokumen Terakhir Diunggah
          </h3>
          <button
            onClick={() => onNavigateTab('administrasi')}
            className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1"
          >
            Lihat Administrasi Saya <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {myDocs.length === 0 ? (
          <div className="py-8 text-center text-slate-400 text-xs">
            Belum ada dokumen yang diunggah. Klik tombol <strong>+ Unggah File Administrasi</strong> di atas untuk memulai.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {myDocs.slice(0, 5).map((doc) => {
              const req = storageService.getRequirements().find((r) => r.id === doc.document_requirement_id);
              return (
                <div key={doc.id} className="py-3 flex items-center justify-between gap-3 text-xs">
                  <div>
                    <div className="font-bold text-slate-900">{req?.name || doc.file_name}</div>
                    <div className="text-slate-400 text-[11px] mt-0.5">
                      {doc.file_name} &bull; Upload: {new Date(doc.uploaded_at).toLocaleDateString('id-ID')}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusBadge status={doc.status} size="sm" />
                    <button
                      onClick={() => setPreviewDoc(doc)}
                      className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
                      title="Lihat Pratinjau"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <GuruUploadModal
          onClose={() => setShowUploadModal(false)}
          onSuccess={() => {
            setShowUploadModal(false);
            refreshData();
          }}
        />
      )}

      {/* File Preview Modal */}
      {previewDoc && (
        <FilePreviewModal
          document={previewDoc}
          requirement={storageService.getRequirements().find((r) => r.id === previewDoc.document_requirement_id)}
          teacher={currentTeacher}
          reviews={storageService.getReviewsByDocumentId(previewDoc.id)}
          onClose={() => setPreviewDoc(null)}
        />
      )}
    </div>
  );
};
