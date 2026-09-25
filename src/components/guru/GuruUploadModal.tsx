import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { storageService } from '../../services/storage';
import { DocumentRequirement, DocumentCategory, TeacherDocument } from '../../types';
import { X, Upload, FileText, AlertCircle, CheckCircle2, ShieldAlert } from 'lucide-react';

interface GuruUploadModalProps {
  initialRequirementId?: string;
  initialDocId?: string;
  onClose: () => void;
  onSuccess: () => void;
}

export const GuruUploadModal: React.FC<GuruUploadModalProps> = ({
  initialRequirementId,
  initialDocId,
  onClose,
  onSuccess,
}) => {
  const { currentTeacher, school, refreshData } = useAuth();

  const categories = storageService.getCategories().filter((c) => c.is_active);
  const allReqs = storageService.getRequirements().filter((r) => r.is_active);
  const schoolYears = storageService.getSchoolYears();
  const semesters = storageService.getSemesters();

  // Find existing document if editing or re-uploading
  const existingDoc: TeacherDocument | undefined = initialDocId
    ? storageService.getDocumentById(initialDocId)
    : initialRequirementId && currentTeacher
    ? storageService.getDocumentsByTeacherId(currentTeacher.id).find((d) => d.document_requirement_id === initialRequirementId)
    : undefined;

  const targetReq = initialRequirementId
    ? allReqs.find((r) => r.id === initialRequirementId)
    : existingDoc
    ? allReqs.find((r) => r.id === existingDoc.document_requirement_id)
    : undefined;

  const [selectedCategoryId, setSelectedCategoryId] = useState<string>(
    targetReq ? targetReq.category_id : categories[0]?.id || ''
  );
  const [selectedReqId, setSelectedReqId] = useState<string>(
    initialRequirementId || existingDoc?.document_requirement_id || ''
  );
  const [selectedSchoolYearId, setSelectedSchoolYearId] = useState<string>(
    existingDoc?.school_year_id || school.current_school_year_id || schoolYears[0]?.id || ''
  );
  const [selectedSemesterId, setSelectedSemesterId] = useState<string>(
    existingDoc?.semester_id || school.current_semester_id || semesters[0]?.id || ''
  );

  const [description, setDescription] = useState<string>(existingDoc?.description || '');
  const [fileObject, setFileObject] = useState<File | null>(null);
  const [fileDataUrl, setFileDataUrl] = useState<string>(existingDoc?.file_url || '');
  const [fileName, setFileName] = useState<string>(existingDoc?.file_name || '');
  const [fileSize, setFileSize] = useState<number>(existingDoc?.file_size || 0);
  const [fileType, setFileType] = useState<string>(existingDoc?.file_type || '');

  const [errorMsg, setErrorMsg] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Requirements filtered by selected category and teacher's role (Guru vs Pegawai)
  const filteredReqs = allReqs.filter((r) => {
    if (r.category_id !== selectedCategoryId) return false;
    if (currentTeacher?.is_staff) {
      return r.target_role === 'PEGAWAI' || r.target_role === 'SEMUA';
    }
    return r.target_role === 'GURU' || r.target_role === 'SEMUA';
  });

  // Auto select requirement if current one doesn't belong to selected category
  useEffect(() => {
    if (!filteredReqs.some((r) => r.id === selectedReqId)) {
      if (filteredReqs.length > 0) {
        setSelectedReqId(filteredReqs[0].id);
      } else {
        setSelectedReqId('');
      }
    }
  }, [selectedCategoryId, filteredReqs, selectedReqId]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check size against school's max size
    const maxBytes = school.max_file_size_mb * 1024 * 1024;
    if (file.size > maxBytes) {
      setErrorMsg(`Ukuran file melebihi batas maksimal ${school.max_file_size_mb} MB.`);
      return;
    }

    // Check allowed extensions: PDF, DOC, DOCX, JPG, JPEG, PNG, XLS, XLSX
    const allowedExtensions = /\.(pdf|doc|docx|jpg|jpeg|png|xls|xlsx)$/i;
    if (!allowedExtensions.test(file.name)) {
      setErrorMsg('Format file tidak didukung. Format yang diperbolehkan: PDF, DOC, DOCX, JPG, JPEG, PNG, XLS, XLSX.');
      return;
    }

    setErrorMsg('');
    setFileObject(file);
    setFileName(file.name);
    setFileSize(file.size);
    setFileType(file.type || 'application/octet-stream');

    // Read to Data URL
    const reader = new FileReader();
    reader.onload = () => {
      setFileDataUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSave = (status: 'SUDAH_DIUNGGAH' | 'MENUNGGU_PEMERIKSAAN') => {
    if (!currentTeacher) {
      setErrorMsg('Data guru/pegawai aktif tidak ditemukan.');
      return;
    }

    if (!selectedReqId) {
      setErrorMsg('Silakan pilih nama dokumen yang akan diunggah.');
      return;
    }

    if (!fileDataUrl && !existingDoc?.file_url) {
      setErrorMsg('Silakan pilih file dokumen terlebih dahulu.');
      return;
    }

    setIsSubmitting(true);

    try {
      storageService.upsertDocument({
        teacher_id: currentTeacher.id,
        document_requirement_id: selectedReqId,
        school_year_id: selectedSchoolYearId,
        semester_id: selectedSemesterId,
        file_name: fileName || 'Dokumen_Administrasi.pdf',
        file_url: fileDataUrl || existingDoc?.file_url || '',
        file_size: fileSize || existingDoc?.file_size || 1024,
        file_type: fileType || existingDoc?.file_type || 'application/pdf',
        description: description,
        status: status,
      });

      refreshData();
      setIsSubmitting(false);
      onSuccess();
    } catch (err: any) {
      setErrorMsg(err.message || 'Terjadi kesalahan saat menyimpan dokumen.');
      setIsSubmitting(false);
    }
  };

  const activeRequirement = allReqs.find((r) => r.id === selectedReqId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-xs p-4 overflow-y-auto animate-in fade-in">
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full overflow-hidden border border-slate-200 my-8">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-blue-700 to-blue-800 text-white">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-white/15 text-white">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold leading-tight">
                {existingDoc ? 'Perbarui / Unggah Ulang Dokumen' : 'Unggah File Administrasi'}
              </h3>
              <p className="text-xs text-blue-100">
                {currentTeacher?.name} &bull; TKIT Mutiara Islam Palopo
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {existingDoc && existingDoc.status === 'PERLU_PERBAIKAN' && (
            <div className="p-3.5 rounded-xl bg-orange-50 border border-orange-200 text-xs text-orange-800">
              <strong className="block font-bold mb-0.5 flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 text-orange-600" />
                Catatan Kepala Sekolah Sebelumnya:
              </strong>
              <p className="italic bg-white/70 p-2 rounded-lg border border-orange-100 mt-1">
                "{storageService.getReviewsByDocumentId(existingDoc.id)[0]?.notes || 'Silakan periksa dan perbaiki file ini.'}"
              </p>
            </div>
          )}

          {/* Kategori Administrasi */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Kategori Administrasi <span className="text-rose-500">*</span>
            </label>
            <select
              value={selectedCategoryId}
              onChange={(e) => setSelectedCategoryId(e.target.value)}
              className="w-full text-sm bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 font-medium text-slate-800 focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
            >
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Nama Dokumen */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Nama Dokumen <span className="text-rose-500">*</span>
              </label>
              {activeRequirement && (
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    activeRequirement.is_mandatory
                      ? 'bg-rose-100 text-rose-700'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {activeRequirement.is_mandatory ? 'WAJIB' : 'TIDAK WAJIB'}
                </span>
              )}
            </div>
            <select
              value={selectedReqId}
              onChange={(e) => setSelectedReqId(e.target.value)}
              className="w-full text-sm bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 font-medium text-slate-800 focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
            >
              {filteredReqs.length === 0 ? (
                <option value="">Tidak ada dokumen tersedia di kategori ini</option>
              ) : (
                filteredReqs.map((req) => (
                  <option key={req.id} value={req.id}>
                    {req.name} {req.is_mandatory ? '(Wajib)' : '(Opsional)'}
                  </option>
                ))
              )}
            </select>
          </div>

          {/* Period: Tahun Pelajaran & Semester */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Tahun Pelajaran
              </label>
              <select
                value={selectedSchoolYearId}
                onChange={(e) => setSelectedSchoolYearId(e.target.value)}
                className="w-full text-sm bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 font-medium text-slate-800 focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
              >
                {schoolYears.map((sy) => (
                  <option key={sy.id} value={sy.id}>
                    {sy.name} {sy.is_active ? '(Aktif)' : ''}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Semester
              </label>
              <select
                value={selectedSemesterId}
                onChange={(e) => setSelectedSemesterId(e.target.value)}
                className="w-full text-sm bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 font-medium text-slate-800 focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
              >
                {semesters.map((sem) => (
                  <option key={sem.id} value={sem.id}>
                    {sem.name} {sem.is_active ? '(Aktif)' : ''}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* File Upload Box */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Pilih File Dokumen <span className="text-rose-500">*</span>
            </label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-slate-300 border-dashed rounded-2xl hover:border-blue-500 bg-slate-50 transition-colors relative cursor-pointer">
              <input
                type="file"
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.xls,.xlsx"
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <div className="space-y-1 text-center">
                <div className="w-12 h-12 mx-auto rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
                  <Upload className="w-6 h-6" />
                </div>
                <div className="flex text-xs text-slate-600 justify-center">
                  <span className="font-bold text-blue-600 hover:text-blue-500">
                    Klik untuk memilih file
                  </span>
                  <p className="pl-1">atau seret file ke sini</p>
                </div>
                <p className="text-[11px] text-slate-500 font-medium">
                  Format yang diperbolehkan: <strong className="text-slate-700">PDF, DOC, DOCX, JPG, JPEG, PNG, XLS, XLSX</strong>
                </p>
                <p className="text-[11px] text-slate-400">
                  Batas maksimal ukuran file: <strong>{school.max_file_size_mb} MB</strong> (Diatur Admin)
                </p>
              </div>
            </div>

            {fileName && (
              <div className="mt-2.5 p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 overflow-hidden">
                  <FileText className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="font-semibold text-emerald-900 truncate">{fileName}</span>
                  {fileSize > 0 && (
                    <span className="text-emerald-700 text-[11px]">
                      ({(fileSize / 1024).toFixed(1)} KB)
                    </span>
                  )}
                </div>
                <span className="text-emerald-700 font-bold flex items-center gap-1 shrink-0">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Siap diunggah
                </span>
              </div>
            )}
          </div>

          {/* Keterangan Guru */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Keterangan Guru / Catatan Tambahan
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Contoh: Modul ajar tema Tanaman pekan 1-4, sudah dilengkapi lembar observasi anak."
              className="w-full text-sm bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-800 focus:ring-2 focus:ring-blue-600 focus:outline-hidden placeholder:text-slate-400"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2.5 text-xs font-bold text-slate-600 bg-white border border-slate-300 rounded-xl hover:bg-slate-100 transition-colors"
          >
            Batal
          </button>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => handleSave('SUDAH_DIUNGGAH')}
              className="flex-1 sm:flex-none px-4 py-2.5 text-xs font-bold text-blue-700 bg-blue-50 border border-blue-200 rounded-xl hover:bg-blue-100 transition-colors cursor-pointer"
            >
              SIMPAN DRAFT
            </button>

            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => handleSave('MENUNGGU_PEMERIKSAAN')}
              className="flex-1 sm:flex-none px-5 py-2.5 text-xs font-bold text-white bg-blue-600 rounded-xl hover:bg-blue-700 shadow-md shadow-blue-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              {isSubmitting ? (
                'Menyimpan...'
              ) : (
                <>
                  <Upload className="w-3.5 h-3.5" />
                  <span>KIRIM UNTUK PEMERIKSAAN</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
