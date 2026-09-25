import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { storageService } from '../../services/storage';
import { ProgressBar } from '../common/ProgressBar';
import { KepsekReviewModal } from './KepsekReviewModal';
import { FilePreviewModal } from '../common/FilePreviewModal';
import { StatusBadge } from '../common/StatusBadge';
import { Teacher, TeacherProgress, TeacherDocument } from '../../types';
import {
  ClipboardList,
  Search,
  Filter,
  Eye,
  FileCheck2,
  FileSpreadsheet,
  CheckCircle2,
  Clock,
  AlertCircle,
  CircleDashed,
  X,
  User,
  Download,
  Upload,
} from 'lucide-react';

interface KepsekMonitoringViewProps {
  onGenerateReportForTeacher?: (teacherId: string) => void;
}

export const KepsekMonitoringView: React.FC<KepsekMonitoringViewProps> = ({
  onGenerateReportForTeacher,
}) => {
  const { refreshData } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState<'ALL' | 'GURU' | 'PEGAWAI'>('ALL');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');

  const [detailTeacher, setDetailTeacher] = useState<Teacher | null>(null);
  const [reviewDoc, setReviewDoc] = useState<TeacherDocument | null>(null);
  const [previewDoc, setPreviewDoc] = useState<TeacherDocument | null>(null);

  const progressList = storageService.getAllTeachersProgress();

  // Filter list
  const filteredList = progressList.filter((p) => {
    if (filterRole === 'GURU' && p.teacher.is_staff) return false;
    if (filterRole === 'PEGAWAI' && !p.teacher.is_staff) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = p.teacher.name.toLowerCase().includes(q);
      const matchPosition = p.teacher.position.toLowerCase().includes(q);
      const matchNip = p.teacher.nip_nuptk.toLowerCase().includes(q);
      if (!matchName && !matchPosition && !matchNip) return false;
    }

    if (filterStatus === 'LENGKAP' && p.percentage < 100) return false;
    if (filterStatus === 'BELUM_LENGKAP' && p.percentage >= 100) return false;
    if (filterStatus === 'ADA_MENUNGGU' && p.status_counts.menunggu_pemeriksaan === 0) return false;
    if (filterStatus === 'ADA_REVISI' && p.status_counts.perlu_perbaikan === 0) return false;

    return true;
  });

  const getStatusBadgeForTeacher = (p: TeacherProgress) => {
    if (p.percentage >= 100) {
      return (
        <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
          ✓ Lengkap
        </span>
      );
    }
    if (p.status_counts.perlu_perbaikan > 0) {
      return (
        <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-orange-100 text-orange-800 border border-orange-200">
          Perlu Perbaikan
        </span>
      );
    }
    if (p.status_counts.menunggu_pemeriksaan > 0) {
      return (
        <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
          Menunggu Periksa
        </span>
      );
    }
    if (p.percentage > 0) {
      return (
        <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-200">
          Sedang Berjalan
        </span>
      );
    }
    return (
      <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-600 border border-slate-200">
        Belum Lengkap
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <ClipboardList className="w-6 h-6 text-blue-600" />
            MONITORING ADMINISTRASI GURU/PEGAWAI
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Pantau status kelengkapan dokumen seluruh guru dan pegawai TKIT Mutiara Islam Palopo secara berkala.
          </p>
        </div>
      </div>

      {/* Toolbar: Search and Filter */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari nama guru, jabatan, NIP..."
            className="w-full text-xs pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          {/* Filter Role */}
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value as any)}
            className="text-xs bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-slate-700 font-medium focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
          >
            <option value="ALL">Semua Tenaga Pendidik & Staf</option>
            <option value="GURU">Khusus Guru</option>
            <option value="PEGAWAI">Khusus Pegawai / TU</option>
          </select>

          {/* Filter Progress Status */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-slate-700 font-medium focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
          >
            <option value="ALL">Semua Kelengkapan</option>
            <option value="LENGKAP">100% Lengkap</option>
            <option value="BELUM_LENGKAP">Belum 100%</option>
            <option value="ADA_MENUNGGU">Ada Menunggu Periksa</option>
            <option value="ADA_REVISI">Ada Perlu Perbaikan</option>
          </select>
        </div>
      </div>

      {/* Tabel Monitoring Utama */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-700 font-bold uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="px-3.5 py-3.5 text-center w-12">No</th>
                <th className="px-3.5 py-3.5">Nama</th>
                <th className="px-3.5 py-3.5">Jabatan</th>
                <th className="px-3.5 py-3.5 text-center">Total Dokumen</th>
                <th className="px-3.5 py-3.5 text-center text-emerald-700">Lengkap</th>
                <th className="px-3.5 py-3.5 text-center text-slate-600">Belum Diunggah</th>
                <th className="px-3.5 py-3.5 text-center text-amber-700">Menunggu</th>
                <th className="px-3.5 py-3.5 text-center text-orange-700">Perlu Perbaikan</th>
                <th className="px-3.5 py-3.5 text-center w-36">Persentase</th>
                <th className="px-3.5 py-3.5 text-center">Status</th>
                <th className="px-3.5 py-3.5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredList.length === 0 ? (
                <tr>
                  <td colSpan={11} className="px-4 py-12 text-center text-slate-400">
                    {progressList.length === 0
                      ? 'Belum ada data guru/pegawai dalam sistem. Silakan minta Administrator untuk menambahkan guru/pegawai.'
                      : 'Tidak ada data guru yang cocok dengan pencarian.'}
                  </td>
                </tr>
              ) : (
                filteredList.map((p, index) => {
                  const teacher = p.teacher;
                  return (
                    <tr key={teacher.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* No */}
                      <td className="px-3.5 py-3.5 text-center text-slate-500 font-bold">
                        {index + 1}
                      </td>

                      {/* Nama */}
                      <td className="px-3.5 py-3.5">
                        <div className="font-bold text-slate-900">{teacher.name}</div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          NIP: {teacher.nip_nuptk || '-'}
                        </div>
                      </td>

                      {/* Jabatan */}
                      <td className="px-3.5 py-3.5 text-slate-600">
                        <div className="font-medium text-[11px] leading-tight">{teacher.position}</div>
                        <span className="text-[10px] text-slate-400 block">{teacher.employment_status}</span>
                      </td>

                      {/* Total Dokumen */}
                      <td className="px-3.5 py-3.5 text-center font-bold text-slate-800">
                        {p.total_requirements}
                      </td>

                      {/* Lengkap */}
                      <td className="px-3.5 py-3.5 text-center font-extrabold text-emerald-700 bg-emerald-50/40">
                        {p.status_counts.lengkap}
                      </td>

                      {/* Belum Diunggah */}
                      <td className="px-3.5 py-3.5 text-center text-slate-500">
                        {p.status_counts.belum_diunggah}
                      </td>

                      {/* Menunggu Pemeriksaan */}
                      <td className="px-3.5 py-3.5 text-center font-bold text-amber-700 bg-amber-50/40">
                        {p.status_counts.menunggu_pemeriksaan}
                      </td>

                      {/* Perlu Perbaikan */}
                      <td className="px-3.5 py-3.5 text-center font-bold text-orange-700 bg-orange-50/40">
                        {p.status_counts.perlu_perbaikan}
                      </td>

                      {/* Persentase */}
                      <td className="px-3.5 py-3.5 text-center">
                        <div className="flex items-center gap-2 justify-center">
                          <div className="w-20">
                            <ProgressBar percentage={p.percentage} height="h-2" showLabel={false} />
                          </div>
                          <span className="font-bold text-blue-700 text-xs min-w-[2.5rem] text-right">
                            {p.percentage}%
                          </span>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-3.5 py-3.5 text-center">
                        {getStatusBadgeForTeacher(p)}
                      </td>

                      {/* Aksi: [DETAIL] [PERIKSA] [LAPORAN] */}
                      <td className="px-3.5 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* DETAIL */}
                          <button
                            onClick={() => setDetailTeacher(teacher)}
                            className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[11px] transition-colors cursor-pointer"
                            title="Lihat Detail Kelengkapan Guru"
                          >
                            DETAIL
                          </button>

                          {/* PERIKSA */}
                          <button
                            onClick={() => {
                              const docs = storageService.getDocumentsByTeacherId(teacher.id);
                              const pending = docs.find((d) => d.status === 'MENUNGGU_PEMERIKSAAN');
                              if (pending) {
                                setReviewDoc(pending);
                              } else {
                                setDetailTeacher(teacher);
                              }
                            }}
                            className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-colors cursor-pointer ${
                              p.status_counts.menunggu_pemeriksaan > 0
                                ? 'bg-amber-500 hover:bg-amber-600 text-slate-950 shadow-xs'
                                : 'bg-blue-50 hover:bg-blue-100 text-blue-700'
                            }`}
                            title="Periksa Dokumen"
                          >
                            PERIKSA
                          </button>

                          {/* LAPORAN */}
                          <button
                            onClick={() => {
                              if (onGenerateReportForTeacher) {
                                onGenerateReportForTeacher(teacher.id);
                              }
                            }}
                            className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-[11px] transition-colors cursor-pointer"
                            title="Cetak Laporan Guru Ini"
                          >
                            LAPORAN
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* DETAIL MODAL: Detailed View for a Single Teacher */}
      {detailTeacher && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-xs p-4 overflow-y-auto animate-in fade-in">
          <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full overflow-hidden border border-slate-200 my-8">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center font-bold text-white">
                  {detailTeacher.name.charAt(0)}
                </div>
                <div>
                  <h3 className="text-base font-bold leading-tight">{detailTeacher.name}</h3>
                  <p className="text-xs text-slate-300">
                    {detailTeacher.position} &bull; NIP: {detailTeacher.nip_nuptk || '-'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setDetailTeacher(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 max-h-[75vh] overflow-y-auto space-y-5">
              {/* Progress Summary */}
              {(() => {
                const prog = storageService.calculateTeacherProgress(detailTeacher.id);
                if (!prog) return null;
                return (
                  <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200 space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-blue-900">
                        Capaian Kelengkapan Dokumen Wajib:
                      </span>
                      <span className="text-lg font-black text-blue-700">{prog.percentage}%</span>
                    </div>
                    <ProgressBar percentage={prog.percentage} height="h-3" showLabel={false} />
                    <div className="flex justify-between text-[11px] text-blue-800">
                      <span>
                        {prog.mandatory_complete} dari {prog.total_mandatory} Dokumen Wajib Lengkap
                      </span>
                      <span>Total Diunggah: {prog.total_uploaded}</span>
                    </div>
                  </div>
                );
              })()}

              {/* Document List */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                  Daftar Seluruh Dokumen & Status
                </h4>

                <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden bg-white text-xs">
                  {storageService
                    .getRequirements()
                    .filter((r) => {
                      if (!r.is_active) return false;
                      if (detailTeacher.is_staff) {
                        return r.target_role === 'PEGAWAI' || r.target_role === 'SEMUA';
                      }
                      return r.target_role === 'GURU' || r.target_role === 'SEMUA';
                    })
                    .map((req) => {
                      const doc = storageService
                        .getDocumentsByTeacherId(detailTeacher.id)
                        .find((d) => d.document_requirement_id === req.id);
                      const reviews = doc ? storageService.getReviewsByDocumentId(doc.id) : [];

                      return (
                        <div
                          key={req.id}
                          className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50 transition-colors"
                        >
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-1.5 font-bold text-slate-900">
                              <span>{req.name}</span>
                              <span
                                className={`text-[9px] px-1.5 py-0.2 rounded-full font-bold ${
                                  req.is_mandatory
                                    ? 'bg-rose-100 text-rose-700'
                                    : 'bg-slate-100 text-slate-500'
                                }`}
                              >
                                {req.is_mandatory ? 'WAJIB' : 'OPSIONAL'}
                              </span>
                            </div>
                            {doc ? (
                              <div className="text-slate-500 text-[11px] flex items-center gap-2">
                                <span>File: {doc.file_name}</span>
                                <span>&bull;</span>
                                <span>
                                  Tgl: {new Date(doc.uploaded_at).toLocaleDateString('id-ID')}
                                </span>
                              </div>
                            ) : (
                              <span className="text-[11px] text-slate-400 italic">
                                Belum ada berkas diunggah
                              </span>
                            )}
                            {reviews[0]?.notes && (
                              <div className="text-[11px] text-orange-800 bg-orange-50 px-2 py-1 rounded-md mt-1">
                                <strong>Catatan:</strong> {reviews[0].notes}
                              </div>
                            )}
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <StatusBadge
                              status={doc ? doc.status : 'BELUM_DIUNGGAH'}
                              size="sm"
                            />

                            {doc && (
                              <>
                                <button
                                  onClick={() => setPreviewDoc(doc)}
                                  className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                                  title="Lihat Berkas"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => setReviewDoc(doc)}
                                  className="px-2.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-[11px] flex items-center gap-1 shadow-xs transition-colors"
                                  title="Periksa / Beri Catatan"
                                >
                                  <FileCheck2 className="w-3.5 h-3.5" />
                                  <span>Periksa</span>
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setDetailTeacher(null)}
                className="px-5 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold transition-colors"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Review Modal */}
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

      {/* Preview Modal */}
      {previewDoc && (
        <FilePreviewModal
          document={previewDoc}
          requirement={storageService
            .getRequirements()
            .find((r) => r.id === previewDoc.document_requirement_id)}
          teacher={storageService.getTeacherById(previewDoc.teacher_id)}
          reviews={storageService.getReviewsByDocumentId(previewDoc.id)}
          onClose={() => setPreviewDoc(null)}
        />
      )}
    </div>
  );
};
