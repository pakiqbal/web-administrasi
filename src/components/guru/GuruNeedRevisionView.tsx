import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { storageService } from '../../services/storage';
import { StatusBadge } from '../common/StatusBadge';
import { FilePreviewModal } from '../common/FilePreviewModal';
import { GuruUploadModal } from './GuruUploadModal';
import { TeacherDocument } from '../../types';
import { AlertCircle, RotateCcw, Eye, Download, FileText, CheckCircle2 } from 'lucide-react';

export const GuruNeedRevisionView: React.FC = () => {
  const { currentTeacher, refreshData } = useAuth();
  const [previewDoc, setPreviewDoc] = useState<TeacherDocument | null>(null);
  const [reuploadReqId, setReuploadReqId] = useState<string | null>(null);
  const [reuploadDocId, setReuploadDocId] = useState<string | null>(null);

  if (!currentTeacher) return null;

  const myDocs = storageService.getDocumentsByTeacherId(currentTeacher.id);
  const revisionDocs = myDocs.filter((d) => d.status === 'PERLU_PERBAIKAN' || d.status === 'DITOLAK');

  return (
    <div className="space-y-6">
      <div className="bg-orange-50 border border-orange-200 rounded-3xl p-6 sm:p-8">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-orange-600 text-white">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-black text-orange-950 tracking-tight">
              DOKUMEN PERLU PERBAIKAN
            </h1>
            <p className="text-xs text-orange-800 font-medium mt-0.5">
              Daftar dokumen yang telah diperiksa oleh Kepala Sekolah dan memerlukan revisi serta unggah ulang.
            </p>
          </div>
        </div>
      </div>

      {revisionDocs.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-sm space-y-3">
          <div className="w-14 h-14 mx-auto rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h3 className="text-base font-bold text-slate-800">Tidak Ada Dokumen yang Perlu Diperbaiki</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Alhamdulillah! Semua dokumen yang Anda unggah berstatus lengkap atau sedang dalam proses antrean pemeriksaan Kepala Sekolah.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {revisionDocs.map((doc) => {
            const req = storageService.getRequirements().find((r) => r.id === doc.document_requirement_id);
            const reviews = storageService.getReviewsByDocumentId(doc.id);
            const latestReview = reviews[0];

            return (
              <div
                key={doc.id}
                className="bg-white rounded-3xl border-2 border-orange-200 p-6 shadow-sm space-y-4 hover:border-orange-300 transition-colors"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                  <div className="flex items-start gap-3">
                    <div className="p-3 rounded-2xl bg-orange-100 text-orange-700 shrink-0">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 leading-tight">
                        {req?.name || doc.file_name}
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        File Terakhir: <span className="font-medium text-slate-700">{doc.file_name}</span> &bull; Diunggah: {new Date(doc.uploaded_at).toLocaleDateString('id-ID')}
                      </p>
                    </div>
                  </div>

                  <StatusBadge status={doc.status} size="md" />
                </div>

                {/* Catatan Kepala Sekolah */}
                <div className="bg-orange-50/80 rounded-2xl p-4 border border-orange-200 space-y-1.5 text-xs">
                  <div className="flex items-center justify-between text-orange-950 font-bold">
                    <span className="flex items-center gap-1.5">
                      <AlertCircle className="w-4 h-4 text-orange-600" />
                      Catatan Kepala Sekolah (Sitti Hidayati, S.Pd):
                    </span>
                    {latestReview && (
                      <span className="text-[10px] text-orange-700 font-normal">
                        {new Date(latestReview.reviewed_at).toLocaleString('id-ID')}
                      </span>
                    )}
                  </div>
                  <p className="text-orange-900 italic font-medium bg-white/80 p-3 rounded-xl border border-orange-100">
                    "{latestReview?.notes || 'Silakan perbaiki dokumen ini dan unggah ulang berkas yang sudah direvisi.'}"
                  </p>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setPreviewDoc(doc)}
                      className="px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Lihat Dokumen Saat Ini</span>
                    </button>
                  </div>

                  <button
                    onClick={() => {
                      setReuploadReqId(doc.document_requirement_id);
                      setReuploadDocId(doc.id);
                    }}
                    className="px-5 py-2.5 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-bold shadow-md shadow-orange-600/30 flex items-center gap-2 transition-all cursor-pointer"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>UNGGAH ULANG PERBAIKAN</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Upload Modal */}
      {(reuploadReqId || reuploadDocId) && (
        <GuruUploadModal
          initialRequirementId={reuploadReqId || undefined}
          initialDocId={reuploadDocId || undefined}
          onClose={() => {
            setReuploadReqId(null);
            setReuploadDocId(null);
          }}
          onSuccess={() => {
            setReuploadReqId(null);
            setReuploadDocId(null);
            refreshData();
          }}
        />
      )}

      {/* File Preview */}
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
