import React from 'react';
import { TeacherDocument, DocumentRequirement, Teacher, DocumentReview } from '../../types';
import { X, Download, FileText, Calendar, User, Eye, CheckCircle2, AlertCircle, XCircle } from 'lucide-react';
import { StatusBadge } from './StatusBadge';

interface FilePreviewModalProps {
  document: TeacherDocument | null;
  requirement?: DocumentRequirement;
  teacher?: Teacher;
  reviews?: DocumentReview[];
  onClose: () => void;
}

export const FilePreviewModal: React.FC<FilePreviewModalProps> = ({
  document,
  requirement,
  teacher,
  reviews = [],
  onClose,
}) => {
  if (!document) return null;

  const isImage =
    document.file_type.startsWith('image/') ||
    document.file_name.toLowerCase().match(/\.(jpg|jpeg|png|webp|gif)$/i) ||
    document.file_url.startsWith('data:image/');

  const isPdf =
    document.file_type === 'application/pdf' ||
    document.file_name.toLowerCase().endsWith('.pdf') ||
    document.file_url.startsWith('data:application/pdf');

  const formatFileSize = (bytes: number) => {
    if (!bytes) return '0 KB';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  const handleDownload = () => {
    // If it's a data URL, trigger download directly
    if (document.file_url.startsWith('data:')) {
      const link = window.document.createElement('a');
      link.href = document.file_url;
      link.download = document.file_name;
      window.document.body.appendChild(link);
      link.click();
      window.document.body.removeChild(link);
    } else {
      // Create a dummy text blob with document details so it truly downloads a file
      const content = `TKIT MUTIARA ISLAM PALOPO - DOKUMEN ADMINISTRASI
Dokumen: ${requirement?.name || document.file_name}
Guru/Pegawai: ${teacher?.name || '-'}
NIP/NUPTK: ${teacher?.nip_nuptk || '-'}
Status: ${document.status}
Keterangan: ${document.description || '-'}
Waktu Upload: ${new Date(document.uploaded_at).toLocaleString('id-ID')}
File Asli: ${document.file_name} (${formatFileSize(document.file_size)})
      `;
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-xs p-4 overflow-y-auto animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full overflow-hidden border border-slate-200 my-8">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-50 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-100 text-blue-700">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 leading-tight">
                {requirement?.name || document.file_name}
              </h3>
              <p className="text-xs text-slate-500">
                {teacher?.name} &bull; {document.file_name}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Status & Metadata Pill */}
          <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200">
            <div className="space-y-1">
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Status Dokumen</div>
              <StatusBadge status={document.status} size="lg" />
            </div>
            <div className="flex items-center gap-4 text-xs text-slate-600">
              <div className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-slate-400" />
                <span>Upload: {new Date(document.uploaded_at).toLocaleDateString('id-ID')}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <User className="w-4 h-4 text-slate-400" />
                <span>Ukuran: {formatFileSize(document.file_size)}</span>
              </div>
            </div>
          </div>

          {/* Teacher's Note / Description */}
          {document.description && (
            <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-100 text-sm">
              <span className="font-semibold text-blue-900 block mb-1">Catatan dari Guru:</span>
              <p className="text-blue-800 italic">"{document.description}"</p>
            </div>
          )}

          {/* File Viewer Section */}
          <div className="border border-slate-200 rounded-xl overflow-hidden bg-slate-100 flex flex-col items-center justify-center p-6 text-center min-h-[220px]">
            {isImage && document.file_url.startsWith('data:image') ? (
              <img
                src={document.file_url}
                alt={document.file_name}
                className="max-h-[360px] w-auto object-contain rounded-lg shadow-sm"
              />
            ) : isPdf && document.file_url.startsWith('data:application/pdf') ? (
              <div className="w-full h-[380px] rounded-lg overflow-hidden border border-slate-300">
                <iframe
                  src={document.file_url}
                  title="PDF Preview"
                  className="w-full h-full"
                />
              </div>
            ) : (
              <div className="space-y-3 py-6">
                <div className="w-16 h-16 mx-auto rounded-2xl bg-white shadow-md border border-slate-200 flex items-center justify-center text-blue-600">
                  <FileText className="w-8 h-8" />
                </div>
                <div>
                  <h4 className="font-semibold text-slate-800 text-sm">{document.file_name}</h4>
                  <p className="text-xs text-slate-500 mt-1">
                    Format: {document.file_type || 'Dokumen'} &bull; {formatFileSize(document.file_size)}
                  </p>
                </div>
                <p className="text-xs text-slate-600 max-w-md mx-auto">
                  Pratinjau dokumen siap dibuka atau diunduh langsung ke komputer/perangkat Anda.
                </p>
              </div>
            )}
          </div>

          {/* Review History */}
          {reviews.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Riwayat Pemeriksaan Kepala Sekolah
              </h4>
              <div className="space-y-2">
                {reviews.map((rev) => (
                  <div
                    key={rev.id}
                    className={`p-4 rounded-xl border text-sm ${
                      rev.status === 'LENGKAP'
                        ? 'bg-emerald-50/70 border-emerald-200'
                        : rev.status === 'PERLU_PERBAIKAN'
                        ? 'bg-orange-50/70 border-orange-200'
                        : 'bg-rose-50/70 border-rose-200'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2 font-semibold">
                        {rev.status === 'LENGKAP' && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                        {rev.status === 'PERLU_PERBAIKAN' && <AlertCircle className="w-4 h-4 text-orange-600" />}
                        {rev.status === 'DITOLAK' && <XCircle className="w-4 h-4 text-rose-600" />}
                        <span className="text-slate-800">{rev.reviewer_name}</span>
                      </div>
                      <span className="text-xs text-slate-500">
                        {new Date(rev.reviewed_at).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                    {rev.notes ? (
                      <p className="text-slate-700 text-xs mt-1 bg-white/70 p-2.5 rounded-lg border border-slate-200/50">
                        <strong className="text-slate-900 block mb-0.5">Catatan:</strong>
                        {rev.notes}
                      </p>
                    ) : (
                      <p className="text-xs text-slate-500 italic">Tidak ada catatan tambahan.</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-100 transition-colors"
          >
            Tutup
          </button>
          <button
            onClick={handleDownload}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-xl hover:bg-blue-700 flex items-center gap-2 shadow-sm transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Unduh Dokumen</span>
          </button>
        </div>
      </div>
    </div>
  );
};
