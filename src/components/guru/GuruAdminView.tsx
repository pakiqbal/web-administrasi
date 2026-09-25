import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { storageService } from '../../services/storage';
import { StatusBadge } from '../common/StatusBadge';
import { FilePreviewModal } from '../common/FilePreviewModal';
import { GuruUploadModal } from './GuruUploadModal';
import { DocumentRequirement, TeacherDocument } from '../../types';
import {
  FileText,
  Upload,
  Download,
  Eye,
  Edit,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Search,
  Filter,
  Layers,
  Sparkles,
} from 'lucide-react';

export const GuruAdminView: React.FC = () => {
  const { currentTeacher, refreshData } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  
  const [previewDoc, setPreviewDoc] = useState<TeacherDocument | null>(null);
  const [uploadReqId, setUploadReqId] = useState<string | null>(null);
  const [uploadDocId, setUploadDocId] = useState<string | null>(null);

  if (!currentTeacher) return null;

  const categories = storageService.getCategories().filter((c) => c.is_active);
  const allReqs = storageService.getRequirements().filter((r) => {
    if (!r.is_active) return false;
    if (currentTeacher.is_staff) {
      return r.target_role === 'PEGAWAI' || r.target_role === 'SEMUA';
    }
    return r.target_role === 'GURU' || r.target_role === 'SEMUA';
  });

  const myDocs = storageService.getDocumentsByTeacherId(currentTeacher.id);

  // Match each requirement with teacher's uploaded doc (if any)
  const rows = allReqs.map((req) => {
    const doc = myDocs.find((d) => d.document_requirement_id === req.id);
    const category = categories.find((c) => c.id === req.category_id);
    const reviews = doc ? storageService.getReviewsByDocumentId(doc.id) : [];
    const latestReview = reviews[0];

    return {
      requirement: req,
      categoryName: category?.name || 'Lainnya',
      document: doc,
      status: doc ? doc.status : ('BELUM_DIUNGGAH' as const),
      notes: latestReview?.notes || doc?.description || '',
    };
  });

  // Filter rows
  const filteredRows = rows.filter((row) => {
    if (selectedCategory !== 'ALL' && row.requirement.category_id !== selectedCategory) {
      return false;
    }
    if (selectedStatus !== 'ALL' && row.status !== selectedStatus) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = row.requirement.name.toLowerCase().includes(q);
      const matchCat = row.categoryName.toLowerCase().includes(q);
      const matchFile = row.document?.file_name.toLowerCase().includes(q) || false;
      if (!matchName && !matchCat && !matchFile) return false;
    }
    return true;
  });

  const handleDownload = (doc: TeacherDocument, reqName: string) => {
    if (doc.file_url.startsWith('data:')) {
      const link = window.document.createElement('a');
      link.href = doc.file_url;
      link.download = doc.file_name;
      window.document.body.appendChild(link);
      link.click();
      window.document.body.removeChild(link);
    } else {
      const text = `TKIT MUTIARA ISLAM PALOPO\nDokumen: ${reqName}\nGuru: ${currentTeacher.name}\nStatus: ${doc.status}\nFile: ${doc.file_name}`;
      const blob = new Blob([text], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const link = window.document.createElement('a');
      link.href = url;
      link.download = `${doc.file_name}.txt`;
      window.document.body.appendChild(link);
      link.click();
      window.document.body.removeChild(link);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <FileText className="w-6 h-6 text-blue-600" />
            ADMINISTRASI SAYA
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Kelola, periksa status, dan unggah berkas kelengkapan administrasi Anda untuk diperiksa Kepala Sekolah.
          </p>
        </div>

        <button
          onClick={() => {
            setUploadReqId(allReqs[0]?.id || null);
            setUploadDocId(null);
          }}
          className="px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-2xl shadow-md shadow-blue-600/30 flex items-center justify-center gap-2 transition-all cursor-pointer shrink-0"
        >
          <Upload className="w-4 h-4" />
          <span>+ UNGGAH DOKUMEN</span>
        </button>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari nama dokumen atau berkas..."
            className="w-full text-xs pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-slate-700 font-medium focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
          >
            <option value="ALL">Semua Kategori</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-slate-700 font-medium focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
          >
            <option value="ALL">Semua Status</option>
            <option value="BELUM_DIUNGGAH">Belum Diunggah</option>
            <option value="SUDAH_DIUNGGAH">Sudah Diunggah</option>
            <option value="MENUNGGU_PEMERIKSAAN">Menunggu Pemeriksaan</option>
            <option value="LENGKAP">Lengkap</option>
            <option value="PERLU_PERBAIKAN">Perlu Perbaikan</option>
            <option value="DITOLAK">Ditolak</option>
          </select>
        </div>
      </div>

      {/* Table: ADMINISTRASI SAYA */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-700 font-bold uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="px-4 py-3.5 w-12 text-center">No</th>
                <th className="px-4 py-3.5">Kategori</th>
                <th className="px-4 py-3.5">Nama Dokumen</th>
                <th className="px-4 py-3.5">File</th>
                <th className="px-4 py-3.5">Status</th>
                <th className="px-4 py-3.5">Catatan</th>
                <th className="px-4 py-3.5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRows.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-slate-400">
                    Tidak ada dokumen yang sesuai dengan kriteria pencarian.
                  </td>
                </tr>
              ) : (
                filteredRows.map((row, index) => {
                  const hasDoc = !!row.document;
                  const isLengkap = row.status === 'LENGKAP';
                  const isPerluPerbaikan = row.status === 'PERLU_PERBAIKAN';

                  return (
                    <tr
                      key={row.requirement.id}
                      className={`hover:bg-slate-50/80 transition-colors ${
                        isPerluPerbaikan ? 'bg-orange-50/40' : ''
                      }`}
                    >
                      {/* No */}
                      <td className="px-4 py-3.5 text-center font-medium text-slate-500">
                        {index + 1}
                      </td>

                      {/* Kategori */}
                      <td className="px-4 py-3.5 text-slate-600 font-medium">
                        <span className="line-clamp-2 max-w-[160px] text-[11px]">
                          {row.categoryName}
                        </span>
                      </td>

                      {/* Nama Dokumen */}
                      <td className="px-4 py-3.5">
                        <div className="font-bold text-slate-900 flex items-center gap-1.5">
                          <span>{row.requirement.name}</span>
                          <span
                            className={`text-[9px] px-1.5 py-0.2 rounded-full font-bold shrink-0 ${
                              row.requirement.is_mandatory
                                ? 'bg-rose-100 text-rose-700'
                                : 'bg-slate-100 text-slate-500'
                            }`}
                          >
                            {row.requirement.is_mandatory ? 'WAJIB' : 'OPSIONAL'}
                          </span>
                        </div>
                        {row.requirement.description && (
                          <div className="text-[10px] text-slate-400 mt-0.5">
                            {row.requirement.description}
                          </div>
                        )}
                      </td>

                      {/* File */}
                      <td className="px-4 py-3.5">
                        {hasDoc ? (
                          <div className="flex items-center gap-1.5 text-slate-700 max-w-[180px]">
                            <FileText className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                            <span className="truncate font-medium">{row.document!.file_name}</span>
                          </div>
                        ) : (
                          <span className="text-slate-400 italic text-[11px]">-</span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3.5">
                        {isLengkap ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            ✓ LENGKAP
                          </span>
                        ) : (
                          <StatusBadge status={row.status} size="sm" />
                        )}
                      </td>

                      {/* Catatan */}
                      <td className="px-4 py-3.5 max-w-[200px]">
                        {row.notes ? (
                          <div
                            className={`p-1.5 rounded-lg text-[11px] leading-tight ${
                              isPerluPerbaikan
                                ? 'bg-orange-100 text-orange-900 border border-orange-200'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {row.notes}
                          </div>
                        ) : (
                          <span className="text-slate-400 text-[11px]">-</span>
                        )}
                      </td>

                      {/* Aksi */}
                      <td className="px-4 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {hasDoc ? (
                            <>
                              {/* LIHAT */}
                              <button
                                onClick={() => setPreviewDoc(row.document!)}
                                className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-[11px] flex items-center gap-1 transition-colors cursor-pointer"
                                title="Lihat Dokumen"
                              >
                                <Eye className="w-3 h-3" />
                                <span>Lihat</span>
                              </button>

                              {/* DOWNLOAD */}
                              <button
                                onClick={() => handleDownload(row.document!, row.requirement.name)}
                                className="px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold text-[11px] flex items-center gap-1 transition-colors cursor-pointer"
                                title="Unduh File"
                              >
                                <Download className="w-3 h-3" />
                                <span>Download</span>
                              </button>

                              {/* EDIT / UPLOAD ULANG */}
                              {isPerluPerbaikan ? (
                                <button
                                  onClick={() => {
                                    setUploadReqId(row.requirement.id);
                                    setUploadDocId(row.document!.id);
                                  }}
                                  className="px-2.5 py-1 rounded-lg bg-orange-600 hover:bg-orange-700 text-white font-bold text-[11px] flex items-center gap-1 shadow-xs transition-colors cursor-pointer"
                                >
                                  <RotateCcw className="w-3 h-3" />
                                  <span>Upload Ulang</span>
                                </button>
                              ) : !isLengkap ? (
                                <button
                                  onClick={() => {
                                    setUploadReqId(row.requirement.id);
                                    setUploadDocId(row.document!.id);
                                  }}
                                  className="px-2.5 py-1 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold text-[11px] flex items-center gap-1 transition-colors cursor-pointer"
                                >
                                  <Edit className="w-3 h-3" />
                                  <span>Edit</span>
                                </button>
                              ) : null}
                            </>
                          ) : (
                            /* UPLOAD jika belum ada */
                            <button
                              onClick={() => {
                                setUploadReqId(row.requirement.id);
                                setUploadDocId(null);
                              }}
                              className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-[11px] flex items-center gap-1 shadow-xs transition-colors cursor-pointer"
                            >
                              <Upload className="w-3 h-3" />
                              <span>Upload</span>
                            </button>
                          )}
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

      {/* Upload Modal */}
      {(uploadReqId || uploadDocId) && (
        <GuruUploadModal
          initialRequirementId={uploadReqId || undefined}
          initialDocId={uploadDocId || undefined}
          onClose={() => {
            setUploadReqId(null);
            setUploadDocId(null);
          }}
          onSuccess={() => {
            setUploadReqId(null);
            setUploadDocId(null);
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
