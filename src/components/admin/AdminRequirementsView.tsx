import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { storageService } from '../../services/storage';
import { DocumentCategory, DocumentRequirement } from '../../types';
import {
  FolderTree,
  FilePlus,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertCircle,
  X,
  Layers,
  Sparkles,
  ToggleLeft,
  ToggleRight,
} from 'lucide-react';

export const AdminRequirementsView: React.FC = () => {
  const { refreshData, dataVersion } = useAuth();
  const categories = storageService.getCategories();
  const requirements = storageService.getRequirements();

  const [activeTab, setActiveTab] = useState<'DOKUMEN' | 'KATEGORI'>('DOKUMEN');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('ALL');

  // Requirement Modal state
  const [reqModalOpen, setReqModalOpen] = useState(false);
  const [editingReq, setEditingReq] = useState<DocumentRequirement | null>(null);
  const [deleteConfirmReq, setDeleteConfirmReq] = useState<DocumentRequirement | null>(null);
  const [blockedDeleteReq, setBlockedDeleteReq] = useState<{ name: string; reason: string } | null>(null);
  const [reqForm, setReqForm] = useState({
    name: '',
    category_id: categories[0]?.id || '',
    is_mandatory: true,
    target_role: 'GURU' as 'GURU' | 'PEGAWAI' | 'SEMUA',
    period_type: 'SEMESTER' as 'SEMESTER' | 'TAHUNAN' | 'SEKALI',
    description: '',
  });

  // Category Modal state
  const [catModalOpen, setCatModalOpen] = useState(false);
  const [editingCat, setEditingCat] = useState<DocumentCategory | null>(null);
  const [deleteConfirmCat, setDeleteConfirmCat] = useState<DocumentCategory | null>(null);
  const [blockedDeleteCat, setBlockedDeleteCat] = useState<{ name: string; reason: string } | null>(null);
  const [catForm, setCatForm] = useState({
    name: '',
    description: '',
  });

  const [notification, setNotification] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const notify = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(''), 3500);
  };

  // Toggle Mandatory
  const handleToggleMandatory = (req: DocumentRequirement) => {
    try {
      storageService.updateRequirement({
        ...req,
        is_mandatory: !req.is_mandatory,
      });
      refreshData();
      notify(`Status "${req.name}" diubah menjadi ${!req.is_mandatory ? 'WAJIB' : 'TIDAK WAJIB'}.`);
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal mengubah status.');
    }
  };

  // Requirement CRUD
  const handleOpenAddReq = () => {
    setEditingReq(null);
    setReqForm({
      name: '',
      category_id: categories[0]?.id || '',
      is_mandatory: true,
      target_role: 'GURU',
      period_type: 'SEMESTER',
      description: '',
    });
    setErrorMsg('');
    setReqModalOpen(true);
  };

  const handleOpenEditReq = (req: DocumentRequirement) => {
    setEditingReq(req);
    setReqForm({
      name: req.name,
      category_id: req.category_id,
      is_mandatory: req.is_mandatory,
      target_role: req.target_role,
      period_type: 'SEMESTER',
      description: req.description || '',
    });
    setErrorMsg('');
    setReqModalOpen(true);
  };

  const handleSaveReq = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reqForm.name.trim()) {
      setErrorMsg('Nama dokumen wajib diisi.');
      return;
    }

    try {
      if (editingReq) {
        storageService.updateRequirement({
          ...editingReq,
          name: reqForm.name,
          category_id: reqForm.category_id,
          is_mandatory: reqForm.is_mandatory,
          target_role: reqForm.target_role,
          description: reqForm.description,
        });
        notify(`Dokumen "${reqForm.name}" berhasil diperbarui.`);
      } else {
        storageService.createRequirement({
          name: reqForm.name,
          category_id: reqForm.category_id,
          is_mandatory: reqForm.is_mandatory,
          target_role: reqForm.target_role,
          description: reqForm.description,
          order_index: requirements.length + 1,
          is_active: true,
        });
        notify(`Dokumen "${reqForm.name}" berhasil ditambahkan.`);
      }

      refreshData();
      setReqModalOpen(false);
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal menyimpan dokumen.');
    }
  };

  const handleRequestDeleteReq = (req: DocumentRequirement) => {
    setErrorMsg('');
    const uploadedDocs = storageService.getDocuments().filter((d) => d.document_requirement_id === req.id);
    if (uploadedDocs.length > 0) {
      const reason = `Jenis dokumen "${req.name}" tidak dapat dihapus karena masih digunakan oleh ${uploadedDocs.length} berkas dokumen guru/pegawai yang telah tersimpan di sistem. Hapus berkas dokumen terkait terlebih dahulu.`;
      setErrorMsg(reason);
      setBlockedDeleteReq({ name: req.name, reason });
      return;
    }
    setDeleteConfirmReq(req);
  };

  const handleConfirmDeleteReq = () => {
    if (!deleteConfirmReq) return;
    try {
      storageService.deleteRequirement(deleteConfirmReq.id);
      refreshData();
      notify(`Dokumen "${deleteConfirmReq.name}" berhasil dihapus.`);
      setDeleteConfirmReq(null);
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal menghapus dokumen.');
      setDeleteConfirmReq(null);
    }
  };

  // Category CRUD
  const handleOpenAddCat = () => {
    setEditingCat(null);
    setCatForm({ name: '', description: '' });
    setErrorMsg('');
    setCatModalOpen(true);
  };

  const handleOpenEditCat = (cat: DocumentCategory) => {
    setEditingCat(cat);
    setCatForm({ name: cat.name, description: cat.description || '' });
    setErrorMsg('');
    setCatModalOpen(true);
  };

  const handleSaveCat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!catForm.name.trim()) {
      setErrorMsg('Nama kategori wajib diisi.');
      return;
    }

    try {
      if (editingCat) {
        storageService.updateCategory({
          ...editingCat,
          name: catForm.name,
          description: catForm.description,
        });
        notify(`Kategori "${catForm.name}" berhasil diperbarui.`);
      } else {
        storageService.createCategory({
          name: catForm.name,
          description: catForm.description,
          order_index: categories.length + 1,
          is_active: true,
        });
        notify(`Kategori "${catForm.name}" berhasil ditambahkan.`);
      }

      refreshData();
      setCatModalOpen(false);
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal menyimpan kategori.');
    }
  };

  const handleRequestDeleteCat = (c: DocumentCategory) => {
    setErrorMsg('');
    // Check if category is used by uploaded teacher documents
    const reqIds = requirements.filter((r) => r.category_id === c.id).map((r) => r.id);
    const uploadedDocs = storageService.getDocuments().filter((d) => reqIds.includes(d.document_requirement_id));
    if (uploadedDocs.length > 0) {
      const reason = `Kategori "${c.name}" tidak dapat dihapus karena masih digunakan oleh ${uploadedDocs.length} berkas dokumen guru/pegawai yang telah tersimpan di sistem. Hapus berkas dokumen terkait terlebih dahulu.`;
      setErrorMsg(reason);
      setBlockedDeleteCat({ name: c.name, reason });
      return;
    }
    setDeleteConfirmCat(c);
  };

  const handleConfirmDeleteCat = () => {
    if (!deleteConfirmCat) return;
    try {
      storageService.deleteCategory(deleteConfirmCat.id);
      refreshData();
      notify(`Kategori "${deleteConfirmCat.name}" berhasil dihapus.`);
      setDeleteConfirmCat(null);
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal menghapus kategori.');
      setDeleteConfirmCat(null);
    }
  };

  const filteredRequirements = requirements.filter((r) => {
    if (selectedCategoryFilter !== 'ALL' && r.category_id !== selectedCategoryFilter) {
      return false;
    }
    return true;
  });

  const totalMandatory = requirements.filter((r) => r.is_mandatory && r.is_active).length;
  const totalOptional = requirements.filter((r) => !r.is_mandatory && r.is_active).length;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <FolderTree className="w-6 h-6 text-blue-600" />
            JENIS ADMINISTRASI & DOKUMEN WAJIB
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Atur daftar berkas administrasi, tentukan status dokumen wajib / tidak wajib, dan kelompokkan berdasarkan kategori.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {activeTab === 'DOKUMEN' ? (
            <button
              onClick={handleOpenAddReq}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-xs font-bold shadow-md shadow-blue-600/30 flex items-center gap-2 transition-all cursor-pointer"
            >
              <FilePlus className="w-4 h-4" />
              <span>+ TAMBAH DOKUMEN</span>
            </button>
          ) : (
            <button
              onClick={handleOpenAddCat}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-xs font-bold shadow-md shadow-blue-600/30 flex items-center gap-2 transition-all cursor-pointer"
            >
              <FilePlus className="w-4 h-4" />
              <span>+ TAMBAH KATEGORI</span>
            </button>
          )}
        </div>
      </div>

      {/* Notifications */}
      {notification && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span className="font-semibold">{notification}</span>
        </div>
      )}

      {errorMsg && !reqModalOpen && !catModalOpen && !deleteConfirmCat && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center justify-between gap-2 animate-in fade-in">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span className="font-semibold">{errorMsg}</span>
          </div>
          <button onClick={() => setErrorMsg('')} className="text-rose-500 hover:text-rose-700 p-1 cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Tab Selector & Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('DOKUMEN')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'DOKUMEN'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Daftar Dokumen Administrasi ({requirements.length})
          </button>
          <button
            onClick={() => setActiveTab('KATEGORI')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'KATEGORI'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Kategori Administrasi ({categories.length})
          </button>
        </div>

        {activeTab === 'DOKUMEN' && (
          <div className="flex items-center gap-3 text-xs">
            <span className="px-2.5 py-1 rounded-full bg-rose-100 text-rose-800 font-bold">
              {totalMandatory} Dokumen Wajib
            </span>
            <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 font-semibold">
              {totalOptional} Tidak Wajib (Opsional)
            </span>
          </div>
        )}
      </div>

      {/* TAB 1: DAFTAR DOKUMEN */}
      {activeTab === 'DOKUMEN' && (
        <div className="space-y-4">
          {/* Category Filter */}
          <div className="flex items-center gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs text-xs">
            <span className="font-bold text-slate-700">Filter Kategori:</span>
            <select
              value={selectedCategoryFilter}
              onChange={(e) => setSelectedCategoryFilter(e.target.value)}
              className="bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-800 focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
            >
              <option value="ALL">Semua Kategori</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-700 font-bold uppercase tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3.5 text-center w-12">No</th>
                    <th className="px-4 py-3.5">Nama Dokumen</th>
                    <th className="px-4 py-3.5">Kategori</th>
                    <th className="px-4 py-3.5 text-center">Sasaran Role</th>
                    <th className="px-4 py-3.5 text-center">Sifat Dokumen</th>
                    <th className="px-4 py-3.5 text-center">Ubah Sifat</th>
                    <th className="px-4 py-3.5 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {filteredRequirements.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-12 text-center text-slate-400">
                        Belum ada dokumen yang terdaftar pada kategori ini.
                      </td>
                    </tr>
                  ) : (
                    filteredRequirements.map((r, idx) => {
                      const cat = categories.find((c) => c.id === r.category_id);
                      return (
                        <tr key={r.id} className="hover:bg-slate-50 transition-colors">
                          <td className="px-4 py-3.5 text-center text-slate-400 font-bold">{idx + 1}</td>
                          <td className="px-4 py-3.5">
                            <div className="font-bold text-slate-900">{r.name}</div>
                            {r.description && (
                              <div className="text-[11px] text-slate-400 mt-0.5">{r.description}</div>
                            )}
                          </td>
                          <td className="px-4 py-3.5 text-slate-600 font-medium">
                            {cat?.name || '-'}
                          </td>
                          <td className="px-4 py-3.5 text-center">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700">
                              {r.target_role}
                            </span>
                          </td>
                          <td className="px-4 py-3.5 text-center">
                            <span
                              className={`px-2.5 py-1 rounded-full text-xs font-extrabold ${
                                r.is_mandatory
                                  ? 'bg-rose-100 text-rose-800 border border-rose-200'
                                  : 'bg-slate-100 text-slate-600 border border-slate-200'
                              }`}
                            >
                              {r.is_mandatory ? 'WAJIB' : 'TIDAK WAJIB'}
                            </span>
                          </td>
                          <td className="px-4 py-3.5 text-center">
                            <button
                              onClick={() => handleToggleMandatory(r)}
                              className={`px-3 py-1 rounded-xl text-[11px] font-bold transition-all cursor-pointer ${
                                r.is_mandatory
                                  ? 'bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200'
                                  : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200'
                              }`}
                              title="Klik untuk mengubah sifat dokumen"
                            >
                              {r.is_mandatory ? 'Ubah ke Opsional' : 'Jadikan Wajib'}
                            </button>
                          </td>
                          <td className="px-4 py-3.5 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => handleOpenEditReq(r)}
                                className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
                                title="Edit Dokumen"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleRequestDeleteReq(r)}
                                className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 transition-colors cursor-pointer"
                                title="Hapus Dokumen"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
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
        </div>
      )}

      {/* TAB 2: KATEGORI ADMINISTRASI */}
      {activeTab === 'KATEGORI' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-700 font-bold uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3.5 text-center w-12">No</th>
                  <th className="px-4 py-3.5">Nama Kategori</th>
                  <th className="px-4 py-3.5">Keterangan</th>
                  <th className="px-4 py-3.5 text-center">Jumlah Dokumen</th>
                  <th className="px-4 py-3.5 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {categories.map((c, idx) => {
                  const docCount = requirements.filter((r) => r.category_id === c.id).length;
                  return (
                    <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3.5 text-center text-slate-400 font-bold">{idx + 1}</td>
                      <td className="px-4 py-3.5 font-bold text-slate-900">{c.name}</td>
                      <td className="px-4 py-3.5 text-slate-500">{c.description || '-'}</td>
                      <td className="px-4 py-3.5 text-center font-bold text-blue-700">
                        {docCount} jenis dokumen
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenEditCat(c)}
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleRequestDeleteCat(c)}
                            className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 transition-colors cursor-pointer"
                            title="Hapus Kategori"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL: Tambah/Edit Dokumen */}
      {reqModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-xs p-4 overflow-y-auto animate-in fade-in">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200">
            <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white">
              <h3 className="text-base font-bold">
                {editingReq ? 'Edit Dokumen Administrasi' : 'Tambah Dokumen Administrasi Baru'}
              </h3>
              <button onClick={() => setReqModalOpen(false)} className="p-1 text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveReq} className="p-6 space-y-4 text-xs">
              {errorMsg && (
                <div className="p-3 rounded-xl bg-rose-50 text-rose-700 border border-rose-200">
                  {errorMsg}
                </div>
              )}

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Nama Dokumen <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={reqForm.name}
                  onChange={(e) => setReqForm({ ...reqForm, name: e.target.value })}
                  placeholder="Contoh: Modul Ajar / RPPH Tema Tanaman"
                  className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 font-bold focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Kategori Administrasi <span className="text-rose-500">*</span>
                </label>
                <select
                  value={reqForm.category_id}
                  onChange={(e) => setReqForm({ ...reqForm, category_id: e.target.value })}
                  className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Sifat Dokumen: WAJIB vs TIDAK WAJIB */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Sifat Dokumen (Menentukan Perhitungan Progres) <span className="text-rose-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <label
                    className={`p-3 rounded-xl border flex items-center gap-2 cursor-pointer font-bold ${
                      reqForm.is_mandatory
                        ? 'border-rose-500 bg-rose-50 text-rose-900'
                        : 'border-slate-200 text-slate-700'
                    }`}
                  >
                    <input
                      type="radio"
                      name="is_mandatory"
                      checked={reqForm.is_mandatory}
                      onChange={() => setReqForm({ ...reqForm, is_mandatory: true })}
                    />
                    <span>WAJIB DIPENUHI</span>
                  </label>

                  <label
                    className={`p-3 rounded-xl border flex items-center gap-2 cursor-pointer font-bold ${
                      !reqForm.is_mandatory
                        ? 'border-slate-400 bg-slate-100 text-slate-900'
                        : 'border-slate-200 text-slate-700'
                    }`}
                  >
                    <input
                      type="radio"
                      name="is_mandatory"
                      checked={!reqForm.is_mandatory}
                      onChange={() => setReqForm({ ...reqForm, is_mandatory: false })}
                    />
                    <span>TIDAK WAJIB (OPSIONAL)</span>
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Target Pengguna</label>
                  <select
                    value={reqForm.target_role}
                    onChange={(e) => setReqForm({ ...reqForm, target_role: e.target.value as any })}
                    className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
                  >
                    <option value="GURU">Khusus Guru</option>
                    <option value="PEGAWAI">Khusus Pegawai / TU</option>
                    <option value="SEMUA">Semua (Guru & Pegawai)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Periode Dokumen</label>
                  <select
                    value={reqForm.period_type}
                    onChange={(e) => setReqForm({ ...reqForm, period_type: e.target.value as any })}
                    className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
                  >
                    <option value="SEMESTER">Setiap Semester</option>
                    <option value="TAHUNAN">Setiap Tahun Pelajaran</option>
                    <option value="SEKALI">Sekali Diunggah</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Deskripsi / Petunjuk Pengisian</label>
                <textarea
                  rows={2}
                  value={reqForm.description}
                  onChange={(e) => setReqForm({ ...reqForm, description: e.target.value })}
                  placeholder="Petunjuk singkat untuk guru..."
                  className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setReqModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-md shadow-blue-600/30"
                >
                  Simpan Dokumen
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Tambah/Edit Kategori */}
      {catModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-xs p-4 overflow-y-auto animate-in fade-in">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200">
            <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white">
              <h3 className="text-base font-bold">
                {editingCat ? 'Edit Kategori Administrasi' : 'Tambah Kategori Baru'}
              </h3>
              <button onClick={() => setCatModalOpen(false)} className="p-1 text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCat} className="p-6 space-y-4 text-xs">
              {errorMsg && (
                <div className="p-3 rounded-xl bg-rose-50 text-rose-700 border border-rose-200">
                  {errorMsg}
                </div>
              )}

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Nama Kategori <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={catForm.name}
                  onChange={(e) => setCatForm({ ...catForm, name: e.target.value })}
                  placeholder="Contoh: Administrasi Pembelajaran"
                  className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 font-bold focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Keterangan</label>
                <textarea
                  rows={2}
                  value={catForm.description}
                  onChange={(e) => setCatForm({ ...catForm, description: e.target.value })}
                  placeholder="Penjelasan kategori..."
                  className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setCatModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-md shadow-blue-600/30"
                >
                  Simpan Kategori
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Konfirmasi Hapus Kategori */}
      {deleteConfirmCat && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl shadow-2xl max-w-sm w-full p-6 text-center space-y-4 border border-slate-200">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Hapus Kategori?</h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Apakah Anda yakin ingin menghapus kategori <strong>"{deleteConfirmCat.name}"</strong>?
                {requirements.filter((r) => r.category_id === deleteConfirmCat.id).length > 0
                  ? ` Seluruh ${requirements.filter((r) => r.category_id === deleteConfirmCat.id).length} jenis dokumen persyaratan di dalam kategori ini juga akan ikut dihapus.`
                  : ''} Tindakan ini tidak dapat dibatalkan.
              </p>
            </div>
            <div className="flex gap-2 justify-center pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmCat(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteCat}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold text-xs shadow-md shadow-rose-600/30 transition-colors cursor-pointer"
              >
                Ya, Hapus Kategori
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Peringatan Kategori Masih Digunakan */}
      {blockedDeleteCat && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl shadow-2xl max-w-sm w-full p-6 text-center space-y-4 border border-slate-200">
            <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Tidak Dapat Menghapus Kategori</h3>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                {blockedDeleteCat.reason}
              </p>
            </div>
            <div className="pt-2">
              <button
                type="button"
                onClick={() => setBlockedDeleteCat(null)}
                className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-xs transition-colors cursor-pointer"
              >
                Mengerti
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Konfirmasi Hapus Dokumen */}
      {deleteConfirmReq && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl shadow-2xl max-w-sm w-full p-6 text-center space-y-4 border border-slate-200">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Hapus Jenis Dokumen?</h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Apakah Anda yakin ingin menghapus jenis dokumen <strong>"{deleteConfirmReq.name}"</strong>? Tindakan ini tidak dapat dibatalkan.
              </p>
            </div>
            <div className="flex gap-2 justify-center pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmReq(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteReq}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold text-xs shadow-md shadow-rose-600/30 transition-colors cursor-pointer"
              >
                Ya, Hapus Dokumen
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Peringatan Dokumen Masih Digunakan */}
      {blockedDeleteReq && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl shadow-2xl max-w-sm w-full p-6 text-center space-y-4 border border-slate-200">
            <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Tidak Dapat Menghapus Dokumen</h3>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                {blockedDeleteReq.reason}
              </p>
            </div>
            <div className="pt-2">
              <button
                type="button"
                onClick={() => setBlockedDeleteReq(null)}
                className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-xs transition-colors cursor-pointer"
              >
                Mengerti
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
