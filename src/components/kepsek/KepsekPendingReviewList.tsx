import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { storageService } from '../../services/storage';
import { StatusBadge } from '../common/StatusBadge';
import { KepsekReviewModal } from './KepsekReviewModal';
import { FilePreviewModal } from '../common/FilePreviewModal';
import { TeacherDocument } from '../../types';
import {
  Clock,
  AlertCircle,
  CircleDashed,
  History,
  FileCheck2,
  Eye,
  Search,
  Filter,
  User,
  Calendar,
  Download,
} from 'lucide-react';

interface KepsekPendingReviewListProps {
  mode: 'menunggu' | 'perbaikan' | 'belum_diunggah' | 'riwayat' | 'semua_pemeriksaan';
}

export const KepsekPendingReviewList: React.FC<KepsekPendingReviewListProps> = ({ mode }) => {
  const { refreshData } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [reviewDoc, setReviewDoc] = useState<TeacherDocument | null>(null);
  const [previewDoc, setPreviewDoc] = useState<TeacherDocument | null>(null);

  const allDocs = storageService.getDocuments();
  const allTeachers = storageService.getTeachers();
  const requirements = storageService.getRequirements().filter((r) => r.is_active);
  const reviews = storageService.getReviews();

  let title = '';
  let subtitle = '';
  let icon = Clock;
  let iconColor = 'text-amber-600 bg-amber-100';

  if (mode === 'menunggu' || mode === 'semua_pemeriksaan') {
    title = 'DOKUMEN MENUNGGU PEMERIKSAAN';
    subtitle = 'Dokumen yang telah dikirim oleh Guru/Pegawai dan menunggu verifikasi serta penilaian Kepala Sekolah.';
    icon = Clock;
    iconColor = 'text-amber-600 bg-amber-100';
  } else if (mode === 'perbaikan') {
    title = 'DOKUMEN PERLU PERBAIKAN';
    subtitle = 'Dokumen yang telah diperiksa dengan status Perlu Perbaikan dan sedang menunggu unggah ulang dari guru.';
    icon = AlertCircle;
    iconColor = 'text-orange-600 bg-orange-100';
  } else if (mode === 'riwayat') {
    title = 'RIWAYAT PEMERIKSAAN DOKUMEN';
    subtitle = 'Catatan lengkap seluruh dokumen yang telah dinilai dan diverifikasi oleh Kepala Sekolah.';
    icon = History;
    iconColor = 'text-blue-600 bg-blue-100';
  } else {
    title = 'DAFTAR DOKUMEN BELUM DIUNGGAH';
    subtitle = 'Monitoring dokumen wajib dan opsional yang belum diunggah oleh masing-masing guru atau pegawai.';
    icon = CircleDashed;
    iconColor = 'text-slate-600 bg-slate-100';
  }

  const IconComponent = icon;

  // Render for mode 'belum_diunggah'
  if (mode === 'belum_diunggah') {
    const unuploadedItems: Array<{
      teacher: typeof allTeachers[0];
      requirement: typeof requirements[0];
    }> = [];

    allTeachers.forEach((t) => {
      const teacherDocs = allDocs.filter((d) => d.teacher_id === t.id);
      const teacherReqs = requirements.filter((r) => {
        if (t.is_staff) return r.target_role === 'PEGAWAI' || r.target_role === 'SEMUA';
        return r.target_role === 'GURU' || r.target_role === 'SEMUA';
      });

      teacherReqs.forEach((r) => {
        const doc = teacherDocs.find((d) => d.document_requirement_id === r.id);
        if (!doc || doc.status === 'BELUM_DIUNGGAH') {
          unuploadedItems.push({ teacher: t, requirement: r });
        }
      });
    });

    const filteredUnuploaded = unuploadedItems.filter((item) => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        item.teacher.name.toLowerCase().includes(q) ||
        item.requirement.name.toLowerCase().includes(q)
      );
    });

    return (
      <div className="space-y-6">
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className={`p-3 rounded-2xl ${iconColor}`}>
            <IconComponent className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-900 tracking-tight">{title}</h1>
            <p className="text-xs text-slate-500 font-medium mt-0.5">{subtitle}</p>
          </div>
        </div>

        {/* Search */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari nama guru atau nama dokumen..."
              className="w-full text-xs pl-10 pr-4 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
            />
          </div>
          <span className="text-xs text-slate-500 font-medium">
            Total: <strong>{filteredUnuploaded.length}</strong> item belum diunggah
          </span>
        </div>

        {/* Table */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-700 font-bold uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3.5 text-center w-12">No</th>
                  <th className="px-4 py-3.5">Nama Guru / Pegawai</th>
                  <th className="px-4 py-3.5">Jabatan</th>
                  <th className="px-4 py-3.5">Nama Dokumen Belum Diunggah</th>
                  <th className="px-4 py-3.5 text-center">Sifat</th>
                  <th className="px-4 py-3.5 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredUnuploaded.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center text-slate-400">
                      Tidak ada dokumen belum diunggah yang sesuai kriteria.
                    </td>
                  </tr>
                ) : (
                  filteredUnuploaded.map((item, idx) => (
                    <tr key={`${item.teacher.id}_${item.requirement.id}`} className="hover:bg-slate-50">
                      <td className="px-4 py-3 text-center text-slate-400 font-medium">{idx + 1}</td>
                      <td className="px-4 py-3 font-bold text-slate-900">{item.teacher.name}</td>
                      <td className="px-4 py-3 text-slate-600">{item.teacher.position}</td>
                      <td className="px-4 py-3 text-slate-800 font-medium">{item.requirement.name}</td>
                      <td className="px-4 py-3 text-center">
                        <span
                          className={`text-[9px] px-2 py-0.5 rounded-full font-bold ${
                            item.requirement.is_mandatory
                              ? 'bg-rose-100 text-rose-700'
                              : 'bg-slate-100 text-slate-500'
                          }`}
                        >
                          {item.requirement.is_mandatory ? 'WAJIB' : 'OPSIONAL'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <StatusBadge status="BELUM_DIUNGGAH" size="sm" />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  // Filter docs for other modes
  const filteredDocs = allDocs.filter((doc) => {
    if (mode === 'menunggu' || mode === 'semua_pemeriksaan') {
      if (doc.status !== 'MENUNGGU_PEMERIKSAAN') return false;
    } else if (mode === 'perbaikan') {
      if (doc.status !== 'PERLU_PERBAIKAN' && doc.status !== 'DITOLAK') return false;
    } else if (mode === 'riwayat') {
      const docReviews = storageService.getReviewsByDocumentId(doc.id);
      if (docReviews.length === 0) return false;
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const teacher = storageService.getTeacherById(doc.teacher_id);
      const req = storageService.getRequirements().find((r) => r.id === doc.document_requirement_id);
      const matchTeacher = teacher?.name.toLowerCase().includes(q) || false;
      const matchDoc = req?.name.toLowerCase().includes(q) || false;
      const matchFile = doc.file_name.toLowerCase().includes(q);
      if (!matchTeacher && !matchDoc && !matchFile) return false;
    }

    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-4">
        <div className={`p-3 rounded-2xl ${iconColor}`}>
          <IconComponent className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight">{title}</h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">{subtitle}</p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari nama guru, dokumen..."
            className="w-full text-xs pl-10 pr-4 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
          />
        </div>
        <span className="text-xs text-slate-500 font-medium">
          Ditemukan: <strong>{filteredDocs.length}</strong> dokumen
        </span>
      </div>

      {/* Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-700 font-bold uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="px-4 py-3.5 text-center w-12">No</th>
                <th className="px-4 py-3.5">Nama Guru / Pegawai</th>
                <th className="px-4 py-3.5">Nama Dokumen</th>
                <th className="px-4 py-3.5">File</th>
                <th className="px-4 py-3.5">Tanggal</th>
                <th className="px-4 py-3.5 text-center">Status</th>
                <th className="px-4 py-3.5">Catatan Terakhir</th>
                <th className="px-4 py-3.5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredDocs.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-slate-400">
                    Tidak ada dokumen pada daftar ini saat ini.
                  </td>
                </tr>
              ) : (
                filteredDocs.map((doc, idx) => {
                  const teacher = storageService.getTeacherById(doc.teacher_id);
                  const req = storageService.getRequirements().find((r) => r.id === doc.document_requirement_id);
                  const docReviews = storageService.getReviewsByDocumentId(doc.id);
                  const latestReview = docReviews[0];

                  return (
                    <tr key={doc.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3.5 text-center text-slate-400 font-medium">{idx + 1}</td>
                      <td className="px-4 py-3.5 font-bold text-slate-900">
                        {teacher?.name || '-'}
                        <div className="text-[10px] text-slate-400 font-normal">{teacher?.position}</div>
                      </td>
                      <td className="px-4 py-3.5 font-semibold text-slate-800">{req?.name || doc.file_name}</td>
                      <td className="px-4 py-3.5 text-slate-600 max-w-[160px] truncate">{doc.file_name}</td>
                      <td className="px-4 py-3.5 text-slate-500 whitespace-nowrap">
                        {new Date(doc.uploaded_at).toLocaleDateString('id-ID')}
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        <StatusBadge status={doc.status} size="sm" />
                      </td>
                      <td className="px-4 py-3.5 max-w-[200px] text-slate-600 text-[11px]">
                        {latestReview?.notes ? (
                          <span className="line-clamp-2 italic">"{latestReview.notes}"</span>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setPreviewDoc(doc)}
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
                            title="Pratinjau Dokumen"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => setReviewDoc(doc)}
                            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-[11px] flex items-center gap-1 shadow-xs transition-colors cursor-pointer"
                          >
                            <FileCheck2 className="w-3.5 h-3.5" />
                            <span>Periksa</span>
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
          requirement={storageService.getRequirements().find((r) => r.id === previewDoc.document_requirement_id)}
          teacher={storageService.getTeacherById(previewDoc.teacher_id)}
          reviews={storageService.getReviewsByDocumentId(previewDoc.id)}
          onClose={() => setPreviewDoc(null)}
        />
      )}
    </div>
  );
};
