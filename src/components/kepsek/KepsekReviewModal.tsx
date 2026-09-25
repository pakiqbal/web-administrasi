import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { storageService } from '../../services/storage';
import { TeacherDocument, DocumentRequirement, Teacher, DocumentReview } from '../../types';
import {
  X,
  FileText,
  Download,
  Eye,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Calendar,
  User,
  ShieldCheck,
  Send,
} from 'lucide-react';
import { StatusBadge } from '../common/StatusBadge';

interface KepsekReviewModalProps {
  document: TeacherDocument;
  onClose: () => void;
  onSuccess: () => void;
}

export const KepsekReviewModal: React.FC<KepsekReviewModalProps> = ({
  document,
  onClose,
  onSuccess,
}) => {
  const { currentUser, refreshData } = useAuth();
  const teacher = storageService.getTeacherById(document.teacher_id);
  const requirement = storageService.getRequirements().find((r) => r.id === document.document_requirement_id);
  const schoolYears = storageService.getSchoolYears();
  const semesters = storageService.getSemesters();
  const categories = storageService.getCategories();
  const pastReviews = storageService.getReviewsByDocumentId(document.id);

  const category = categories.find((c) => c.id === requirement?.category_id);
  const schoolYear = schoolYears.find((sy) => sy.id === document.school_year_id);
  const semester = semesters.find((s) => s.id === document.semester_id);

  const [selectedStatus, setSelectedStatus] = useState<'LENGKAP' | 'PERLU_PERBAIKAN' | 'DITOLAK'>(
    document.status === 'PERLU_PERBAIKAN' || document.status === 'DITOLAK'
      ? document.status
      : 'LENGKAP'
  );
  const [notes, setNotes] = useState(pastReviews[0]?.notes || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const isImage =
    document.file_type.startsWith('image/') ||
    document.file_url.startsWith('data:image/');

  const isPdf =
    document.file_type === 'application/pdf' ||
    document.file_url.startsWith('data:application/pdf');

  const formatFileSize = (bytes: number) => {
    if (!bytes) return '0 KB';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  const handleDownload = () => {
    if (document.file_url.startsWith('data:')) {
      const link = window.document.createElement('a');
      link.href = document.file_url;
      link.download = document.file_name;
      window.document.body.appendChild(link);
      link.click();
      window.document.body.removeChild(link);
    } else {
      const content = `TKIT MUTIARA ISLAM PALOPO
Dokumen: ${requirement?.name || document.file_name}
Guru/Pegawai: ${teacher?.name}
Status: ${document.status}
Keterangan: ${document.description || '-'}`;
      const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = window.document.createElement('a');
      link.href = url;
      link.download = document.file_name.endsWith('.txt') ? document.file_name : `${document.file_name}.txt`;
      window.document.body.appendChild(link);
      link.click();
      window.document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if ((selectedStatus === 'PERLU_PERBAIKAN' || selectedStatus === 'DITOLAK') && !notes.trim()) {
      setErrorMsg('Harap berikan catatan/alasan perbaikan agar guru dapat memahami apa yang harus direvisi.');
      return;
    }

    setIsSubmitting(true);

    try {
      storageService.submitReview({
        document_id: document.id,
        reviewer_id: currentUser?.id || 'user_kepsek',
        reviewer_name: currentUser?.name || 'Sitti Hidayati, S.Pd',
        status: selectedStatus,
        notes: notes.trim(),
      });

      refreshData();
      setIsSubmitting(false);
      onSuccess();
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal menyimpan pemeriksaan.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/75 backdrop-blur-xs p-4 overflow-y-auto animate-in fade-in">
      <div className="bg-white rounded-3xl shadow-2xl max-w-3xl w-full overflow-hidden border border-slate-200 my-8">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-500 text-slate-950 font-bold">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold leading-tight">
                Pemeriksaan Dokumen Administrasi
              </h3>
              <p className="text-xs text-slate-300">
                Kepala Sekolah: Sitti Hidayati, S.Pd &bull; TKIT Mutiara Islam Palopo
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 max-h-[78vh] overflow-y-auto">
          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Section I: Metadata Dokumen (Sesuai Spesifikasi) */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <span className="text-slate-500 font-semibold uppercase tracking-wider block text-[10px]">
                Nama Guru / Pegawai
              </span>
              <strong className="text-slate-900 text-sm">{teacher?.name || '-'}</strong>
              <div className="text-slate-500 text-[11px] mt-0.5">
                {teacher?.position} ({teacher?.employment_status})
              </div>
            </div>

            <div>
              <span className="text-slate-500 font-semibold uppercase tracking-wider block text-[10px]">
                Kategori Administrasi
              </span>
              <strong className="text-slate-900">{category?.name || '-'}</strong>
            </div>

            <div>
              <span className="text-slate-500 font-semibold uppercase tracking-wider block text-[10px]">
                Nama Dokumen
              </span>
              <div className="flex items-center gap-1.5 mt-0.5">
                <strong className="text-blue-900 text-sm">{requirement?.name || document.file_name}</strong>
                <span
                  className={`text-[9px] px-2 py-0.5 rounded-full font-bold ${
                    requirement?.is_mandatory
                      ? 'bg-rose-100 text-rose-700'
                      : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  {requirement?.is_mandatory ? 'WAJIB' : 'TIDAK WAJIB'}
                </span>
              </div>
            </div>

            <div>
              <span className="text-slate-500 font-semibold uppercase tracking-wider block text-[10px]">
                Tahun & Semester
              </span>
              <div className="text-slate-800 font-semibold">
                {schoolYear?.name || '2025/2026'} &bull; {semester?.name || 'Semester Ganjil'}
              </div>
            </div>

            <div>
              <span className="text-slate-500 font-semibold uppercase tracking-wider block text-[10px]">
                Tanggal Unggah
              </span>
              <div className="text-slate-800 font-medium">
                {new Date(document.uploaded_at).toLocaleString('id-ID')}
              </div>
            </div>

            <div>
              <span className="text-slate-500 font-semibold uppercase tracking-wider block text-[10px]">
                Status Saat Ini
              </span>
              <div className="mt-1">
                <StatusBadge status={document.status} size="sm" />
              </div>
            </div>
          </div>

          {/* Teacher's Note */}
          {document.description && (
            <div className="p-3.5 bg-blue-50/70 border border-blue-200 rounded-xl text-xs">
              <span className="font-bold text-blue-900 block mb-0.5">Keterangan / Pesan Guru:</span>
              <p className="text-blue-800 italic">"{document.description}"</p>
            </div>
          )}

          {/* File Preview & Download Actions */}
          <div className="border border-slate-200 rounded-2xl overflow-hidden bg-slate-100 p-4">
            <div className="flex items-center justify-between mb-3 text-xs">
              <div className="flex items-center gap-2 font-bold text-slate-800">
                <FileText className="w-4 h-4 text-blue-600" />
                <span className="truncate max-w-[280px]">{document.file_name}</span>
                <span className="text-slate-500 font-normal">({formatFileSize(document.file_size)})</span>
              </div>

              <button
                type="button"
                onClick={handleDownload}
                className="px-3 py-1.5 bg-white hover:bg-slate-200 text-slate-800 border border-slate-300 rounded-xl font-bold flex items-center gap-1.5 transition-colors cursor-pointer text-xs"
              >
                <Download className="w-3.5 h-3.5" />
                <span>DOWNLOAD FILE</span>
              </button>
            </div>

            {/* Embedded Preview */}
            <div className="bg-white rounded-xl border border-slate-300 overflow-hidden min-h-[160px] flex items-center justify-center p-3">
              {isImage && document.file_url.startsWith('data:image') ? (
                <img
                  src={document.file_url}
                  alt={document.file_name}
                  className="max-h-[300px] w-auto object-contain rounded-lg"
                />
              ) : isPdf && document.file_url.startsWith('data:application/pdf') ? (
                <iframe
                  src={document.file_url}
                  title="PDF Preview"
                  className="w-full h-[280px] rounded-lg"
                />
              ) : (
                <div className="text-center py-6">
                  <FileText className="w-12 h-12 text-slate-400 mx-auto mb-2" />
                  <p className="font-semibold text-slate-700 text-xs">{document.file_name}</p>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Dokumen siap dibuka atau diperiksa. Silakan klik tombol Download di atas.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Section II: HASIL PEMERIKSAAN KEPALA SEKOLAH */}
          <form onSubmit={handleSubmit} className="space-y-4 pt-2 border-t border-slate-200">
            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-slate-900 mb-2">
                HASIL PEMERIKSAAN <span className="text-rose-500">*</span>
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-semibold">
                {/* LENGKAP */}
                <label
                  className={`flex items-center gap-2.5 p-3.5 rounded-2xl border-2 cursor-pointer transition-all ${
                    selectedStatus === 'LENGKAP'
                      ? 'bg-emerald-50 border-emerald-600 text-emerald-950 shadow-sm'
                      : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="review_status"
                    checked={selectedStatus === 'LENGKAP'}
                    onChange={() => setSelectedStatus('LENGKAP')}
                    className="w-4 h-4 text-emerald-600 focus:ring-emerald-500"
                  />
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>LENGKAP (Disetujui)</span>
                </label>

                {/* PERLU PERBAIKAN */}
                <label
                  className={`flex items-center gap-2.5 p-3.5 rounded-2xl border-2 cursor-pointer transition-all ${
                    selectedStatus === 'PERLU_PERBAIKAN'
                      ? 'bg-orange-50 border-orange-500 text-orange-950 shadow-sm'
                      : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="review_status"
                    checked={selectedStatus === 'PERLU_PERBAIKAN'}
                    onChange={() => setSelectedStatus('PERLU_PERBAIKAN')}
                    className="w-4 h-4 text-orange-600 focus:ring-orange-500"
                  />
                  <AlertCircle className="w-4 h-4 text-orange-600 shrink-0" />
                  <span>PERLU PERBAIKAN</span>
                </label>

                {/* DITOLAK */}
                <label
                  className={`flex items-center gap-2.5 p-3.5 rounded-2xl border-2 cursor-pointer transition-all ${
                    selectedStatus === 'DITOLAK'
                      ? 'bg-rose-50 border-rose-500 text-rose-950 shadow-sm'
                      : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="review_status"
                    checked={selectedStatus === 'DITOLAK'}
                    onChange={() => setSelectedStatus('DITOLAK')}
                    className="w-4 h-4 text-rose-600 focus:ring-rose-500"
                  />
                  <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>DITOLAK</span>
                </label>
              </div>
            </div>

            {/* CATATAN PEMERIKSA */}
            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-slate-900 mb-1.5">
                CATATAN PEMERIKSA:
                {selectedStatus !== 'LENGKAP' && <span className="text-rose-500 ml-1">*</span>}
              </label>
              <textarea
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder={
                  selectedStatus === 'PERLU_PERBAIKAN'
                    ? 'Contoh: Silakan perbaiki dokumen pada bagian tanggal dan tanda tangan.'
                    : selectedStatus === 'DITOLAK'
                    ? 'Contoh: Dokumen tidak sesuai dengan standar kurikulum TKIT Mutiara Islam.'
                    : 'Catatan opsional apresiasi (misal: Sangat baik dan lengkap, lanjutkan!)'
                }
                className="w-full text-xs bg-slate-50 border border-slate-300 rounded-2xl p-3.5 text-slate-900 focus:ring-2 focus:ring-blue-600 focus:outline-hidden placeholder:text-slate-400"
              />
              <p className="text-[11px] text-slate-500 mt-1">
                Catatan ini akan langsung diterima guru melalui sistem notifikasi.
              </p>
            </div>

            {/* Modal Actions */}
            <div className="pt-3 flex flex-col sm:flex-row items-center justify-between gap-3">
              <button
                type="button"
                onClick={onClose}
                className="w-full sm:w-auto px-4 py-2.5 text-xs font-bold text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-100 transition-colors"
              >
                Tutup
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full sm:w-auto px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                {isSubmitting ? (
                  'Menyimpan...'
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>SIMPAN PEMERIKSAAN</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
