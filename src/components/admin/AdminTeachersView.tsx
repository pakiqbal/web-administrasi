import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { storageService } from '../../services/storage';
import { Teacher, User } from '../../types';
import {
  Users,
  UserPlus,
  Edit2,
  Trash2,
  KeyRound,
  Search,
  Filter,
  CheckCircle2,
  AlertCircle,
  X,
  Shield,
  Sparkles,
  Download,
  Upload,
  RefreshCw,
} from 'lucide-react';

export const AdminTeachersView: React.FC = () => {
  const { refreshData } = useAuth();
  const teachers = storageService.getTeachers();
  const users = storageService.getUsers();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState<'ALL' | 'GURU' | 'PEGAWAI'>('ALL');

  // Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);
  const [accountModalTeacher, setAccountModalTeacher] = useState<Teacher | null>(null);
  const [deleteConfirmTeacher, setDeleteConfirmTeacher] = useState<Teacher | null>(null);

  // Form fields for Teacher Add/Edit
  const [formData, setFormData] = useState({
    name: '',
    nip_nuptk: '',
    position: 'Guru Kelas TK',
    subject_or_group: 'Kelompok A (Usia 4-5 Tahun)',
    employment_status: 'GTY',
    phone: '',
    email: '',
    is_staff: false,
    username: '',
    password: '',
  });

  // Account Modal fields
  const [accountForm, setAccountForm] = useState({
    username: '',
    password: '',
  });

  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const showNotification = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  const handleOpenAdd = () => {
    setFormData({
      name: '',
      nip_nuptk: '',
      position: 'Guru Kelas TK',
      subject_or_group: 'Kelompok A (Usia 4-5 Tahun)',
      employment_status: 'GTY',
      phone: '',
      email: '',
      is_staff: false,
      username: '',
      password: '',
    });
    setErrorMsg('');
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (t: Teacher) => {
    setEditingTeacher(t);
    setFormData({
      name: t.name,
      nip_nuptk: t.nip_nuptk,
      position: t.position,
      subject_or_group: t.subject_or_group,
      employment_status: t.employment_status,
      phone: t.phone || '',
      email: t.email || '',
      is_staff: !!t.is_staff,
      username: '',
      password: '',
    });
    setErrorMsg('');
  };

  const handleOpenAccount = (t: Teacher) => {
    const existingUser = users.find((u) => u.teacher_id === t.id);
    setAccountModalTeacher(t);
    setAccountForm({
      username: existingUser ? existingUser.username : t.name.toLowerCase().replace(/[^a-z0-9]/g, ''),
      password: existingUser?.password || '123456',
    });
    setErrorMsg('');
  };

  const handleSaveTeacher = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setErrorMsg('Nama lengkap guru/pegawai wajib diisi.');
      return;
    }

    try {
      if (editingTeacher) {
        storageService.updateTeacher({
          ...editingTeacher,
          name: formData.name,
          nip_nuptk: formData.nip_nuptk,
          position: formData.position,
          subject_or_group: formData.subject_or_group,
          employment_status: formData.employment_status,
          phone: formData.phone,
          email: formData.email,
          is_staff: formData.is_staff,
        });
        showNotification(`Data ${formData.name} berhasil diperbarui.`);
        setEditingTeacher(null);
      } else {
        const newTeacher = storageService.createTeacher({
          name: formData.name,
          nip_nuptk: formData.nip_nuptk,
          position: formData.position,
          subject_or_group: formData.subject_or_group,
          employment_status: formData.employment_status,
          phone: formData.phone,
          email: formData.email,
          is_staff: formData.is_staff,
          is_active: true,
        });

        // Optionally create user account automatically if username provided
        if (formData.username.trim()) {
          storageService.createUser({
            name: newTeacher.name,
            username: formData.username.trim().toLowerCase(),
            password: formData.password || '123456',
            role: 'GURU',
            teacher_id: newTeacher.id,
            is_active: true,
          });
        }

        showNotification(`Guru/Pegawai ${formData.name} berhasil ditambahkan.`);
        setIsAddModalOpen(false);
      }

      refreshData();
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal menyimpan data.');
    }
  };

  const handleSaveAccount = (e: React.FormEvent) => {
    e.preventDefault();
    if (!accountModalTeacher) return;
    if (!accountForm.username.trim() || !accountForm.password.trim()) {
      setErrorMsg('Username dan password tidak boleh kosong.');
      return;
    }

    try {
      const existingUser = users.find((u) => u.teacher_id === accountModalTeacher.id);
      if (existingUser) {
        storageService.updateUser({
          ...existingUser,
          username: accountForm.username.trim().toLowerCase(),
          password: accountForm.password,
        });
        showNotification(`Akun login untuk ${accountModalTeacher.name} berhasil diperbarui.`);
      } else {
        storageService.createUser({
          name: accountModalTeacher.name,
          username: accountForm.username.trim().toLowerCase(),
          password: accountForm.password,
          role: 'GURU',
          teacher_id: accountModalTeacher.id,
          is_active: true,
        });
        showNotification(`Akun login untuk ${accountModalTeacher.name} berhasil dibuat.`);
      }

      refreshData();
      setAccountModalTeacher(null);
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal menyimpan akun.');
    }
  };

  const handleDelete = () => {
    if (!deleteConfirmTeacher) return;
    try {
      storageService.deleteTeacher(deleteConfirmTeacher.id);
      showNotification(`Data ${deleteConfirmTeacher.name} berhasil dihapus.`);
      setDeleteConfirmTeacher(null);
      refreshData();
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal menghapus data.');
    }
  };

  const handleQuickSeedDemo = () => {
    if (window.confirm('Muat data contoh 7 guru/pegawai TKIT Mutiara Islam Palopo beserta berkas demo untuk pengujian sistem? Data yang ada sebelumnya akan diperbarui.')) {
      storageService.seedDemoTeachersForTesting();
      refreshData();
      showNotification('Data contoh pengujian berhasil dimuat!');
    }
  };

  const handleResetTeachers = () => {
    if (window.confirm('PERINGATAN: Kosongkan seluruh data guru/pegawai sesuai kondisi instalasi awal?')) {
      storageService.resetTeachersToEmpty();
      refreshData();
      showNotification('Data guru dan pegawai telah dikosongkan.');
    }
  };

  // Filtered teachers
  const filteredTeachers = teachers.filter((t) => {
    if (filterRole === 'GURU' && t.is_staff) return false;
    if (filterRole === 'PEGAWAI' && !t.is_staff) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = t.name.toLowerCase().includes(q);
      const matchNip = t.nip_nuptk.toLowerCase().includes(q);
      const matchPos = t.position.toLowerCase().includes(q);
      if (!matchName && !matchNip && !matchPos) return false;
    }

    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <Users className="w-6 h-6 text-blue-600" />
            MANAJEMEN DATA GURU & PEGAWAI
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Tambah, edit, hapus, dan atur akun login untuk seluruh pendidik dan tenaga kependidikan.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleOpenAdd}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-xs font-bold shadow-md shadow-blue-600/30 flex items-center gap-2 transition-all cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>+ TAMBAH GURU/PEGAWAI</span>
          </button>
        </div>
      </div>

      {/* Notifications */}
      {successMsg && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span className="font-semibold">{successMsg}</span>
        </div>
      )}

      {/* Toolbar */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari guru, pegawai, NIP..."
            className="w-full text-xs pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value as any)}
            className="text-xs bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-slate-700 font-medium focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
          >
            <option value="ALL">Semua ({teachers.length})</option>
            <option value="GURU">Khusus Guru ({teachers.filter((t) => !t.is_staff).length})</option>
            <option value="PEGAWAI">Khusus Pegawai / TU ({teachers.filter((t) => t.is_staff).length})</option>
          </select>

          {/* Quick Demo Helper */}
          <button
            onClick={handleQuickSeedDemo}
            className="px-3 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Muat Data Contoh untuk Demo"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Muat Data Demo</span>
          </button>

          {teachers.length > 0 && (
            <button
              onClick={handleResetTeachers}
              className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Kosongkan Data Guru (Instalasi Awal)"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Kosongkan</span>
            </button>
          )}
        </div>
      </div>

      {/* Teachers Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-700 font-bold uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="px-4 py-3.5 text-center w-12">No</th>
                <th className="px-4 py-3.5">Nama Lengkap</th>
                <th className="px-4 py-3.5">NIP / NUPTK</th>
                <th className="px-4 py-3.5">Jabatan / Penugasan</th>
                <th className="px-4 py-3.5">Status Kepegawaian</th>
                <th className="px-4 py-3.5">Akun Login</th>
                <th className="px-4 py-3.5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTeachers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-16 text-center">
                    <div className="max-w-md mx-auto space-y-3">
                      <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
                        <Users className="w-6 h-6" />
                      </div>
                      <h4 className="text-sm font-bold text-slate-800">
                        {teachers.length === 0 ? 'Data Guru & Pegawai Masih Kosong' : 'Tidak Ditemukan'}
                      </h4>
                      <p className="text-xs text-slate-500">
                        {teachers.length === 0
                          ? 'Sesuai instruksi instalasi awal, data guru/pegawai dikosongkan. Klik tombol "+ Tambah Guru/Pegawai" untuk memasukkan data guru/pegawai baru.'
                          : 'Tidak ada guru yang sesuai dengan pencarian.'}
                      </p>
                      {teachers.length === 0 && (
                        <div className="pt-2 flex justify-center gap-2">
                          <button
                            onClick={handleOpenAdd}
                            className="px-4 py-2 bg-blue-600 text-white rounded-xl font-bold text-xs"
                          >
                            + Tambah Guru Sekarang
                          </button>
                          <button
                            onClick={handleQuickSeedDemo}
                            className="px-4 py-2 bg-indigo-100 text-indigo-800 rounded-xl font-bold text-xs"
                          >
                            Muat Data Demo Pengujian
                          </button>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                filteredTeachers.map((t, idx) => {
                  const teacherUser = users.find((u) => u.teacher_id === t.id);

                  return (
                    <tr key={t.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3.5 text-center text-slate-400 font-bold">{idx + 1}</td>
                      <td className="px-4 py-3.5">
                        <div className="font-bold text-slate-900">{t.name}</div>
                        <div className="text-[11px] text-slate-500">
                          {t.phone || t.email || '-'}
                        </div>
                      </td>
                      <td className="px-4 py-3.5 font-mono text-slate-700">
                        {t.nip_nuptk || '-'}
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="font-medium text-slate-800">{t.position}</div>
                        <div className="text-[11px] text-slate-500">{t.subject_or_group}</div>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
                          {t.employment_status}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        {teacherUser ? (
                          <div className="space-y-0.5">
                            <span className="font-mono text-blue-700 font-bold block">
                              @{teacherUser.username}
                            </span>
                            <span className="text-[10px] text-slate-400">
                              Pass: {teacherUser.password}
                            </span>
                          </div>
                        ) : (
                          <span className="text-[11px] text-rose-600 font-semibold italic">
                            Belum dibuat akun
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Akun */}
                          <button
                            onClick={() => handleOpenAccount(t)}
                            className="p-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-700 font-semibold transition-colors cursor-pointer"
                            title="Atur Username & Password Akun"
                          >
                            <KeyRound className="w-4 h-4" />
                          </button>

                          {/* Edit */}
                          <button
                            onClick={() => handleOpenEdit(t)}
                            className="p-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold transition-colors cursor-pointer"
                            title="Edit Data Guru"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>

                          {/* Hapus */}
                          <button
                            onClick={() => setDeleteConfirmTeacher(t)}
                            className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 font-semibold transition-colors cursor-pointer"
                            title="Hapus Data Guru"
                          >
                            <Trash2 className="w-4 h-4" />
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

      {/* MODAL: Tambah / Edit Guru */}
      {(isAddModalOpen || editingTeacher) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-xs p-4 overflow-y-auto animate-in fade-in">
          <div className="bg-white rounded-3xl shadow-2xl max-w-xl w-full overflow-hidden border border-slate-200 my-8">
            <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white">
              <h3 className="text-base font-bold">
                {editingTeacher ? 'Edit Data Guru / Pegawai' : 'Tambah Guru / Pegawai Baru'}
              </h3>
              <button
                onClick={() => {
                  setIsAddModalOpen(false);
                  setEditingTeacher(null);
                }}
                className="p-1 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveTeacher} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto text-xs">
              {errorMsg && (
                <div className="p-3 rounded-xl bg-rose-50 text-rose-700 border border-rose-200">
                  {errorMsg}
                </div>
              )}

              {/* Tipe Tenaga */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Tipe Tenaga Pendidik / Staf</label>
                <div className="grid grid-cols-2 gap-3">
                  <label className={`p-3 rounded-xl border flex items-center gap-2 cursor-pointer font-bold ${!formData.is_staff ? 'border-blue-600 bg-blue-50 text-blue-900' : 'border-slate-200'}`}>
                    <input
                      type="radio"
                      name="is_staff"
                      checked={!formData.is_staff}
                      onChange={() => setFormData({ ...formData, is_staff: false })}
                    />
                    <span>Guru / Tenaga Pendidik</span>
                  </label>
                  <label className={`p-3 rounded-xl border flex items-center gap-2 cursor-pointer font-bold ${formData.is_staff ? 'border-blue-600 bg-blue-50 text-blue-900' : 'border-slate-200'}`}>
                    <input
                      type="radio"
                      name="is_staff"
                      checked={formData.is_staff}
                      onChange={() => setFormData({ ...formData, is_staff: true, position: 'Staf Tata Usaha' })}
                    />
                    <span>Pegawai / Tenaga Kependidikan</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Nama Lengkap & Gelar <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Contoh: Nurul Qalbi, S.Pd"
                  className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 focus:ring-2 focus:ring-blue-600 focus:outline-hidden font-medium"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">NIP / NUPTK</label>
                  <input
                    type="text"
                    value={formData.nip_nuptk}
                    onChange={(e) => setFormData({ ...formData, nip_nuptk: e.target.value })}
                    placeholder="Contoh: 19850412 201001 2 021"
                    className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 focus:ring-2 focus:ring-blue-600 focus:outline-hidden font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Status Kepegawaian</label>
                  <select
                    value={formData.employment_status}
                    onChange={(e) => setFormData({ ...formData, employment_status: e.target.value })}
                    className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
                  >
                    <option value="GTY">GTY (Guru Tetap Yayasan)</option>
                    <option value="GTT">GTT (Guru Tidak Tetap)</option>
                    <option value="PNS DPK">PNS DPK</option>
                    <option value="PTY">PTY (Pegawai Tetap Yayasan)</option>
                    <option value="Honorer">Honorer</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Jabatan</label>
                  <input
                    type="text"
                    value={formData.position}
                    onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                    placeholder="Contoh: Guru Kelas TK, Guru Pendamping"
                    className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Rombel / Penugasan</label>
                  <input
                    type="text"
                    value={formData.subject_or_group}
                    onChange={(e) => setFormData({ ...formData, subject_or_group: e.target.value })}
                    placeholder="Contoh: Kelompok A, Tata Usaha"
                    className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Nomor Telepon / WhatsApp</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="0812-xxxx-xxxx"
                    className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="guru@tkitmutiaraislam.sch.id"
                    className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Automatic User Account Setup (Only when adding new teacher) */}
              {!editingTeacher && (
                <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200 space-y-2">
                  <span className="font-bold text-blue-950 block">Buat Akun Login Sekaligus (Opsional):</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">Username Login</label>
                      <input
                        type="text"
                        value={formData.username}
                        onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                        placeholder="misal: nurul"
                        className="w-full text-xs bg-white border border-slate-300 rounded-xl px-3 py-2 font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">Password</label>
                      <input
                        type="text"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        placeholder="Default: 123456"
                        className="w-full text-xs bg-white border border-slate-300 rounded-xl px-3 py-2 font-mono"
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddModalOpen(false);
                    setEditingTeacher(null);
                  }}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-md shadow-blue-600/30"
                >
                  Simpan Data
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Atur Akun Pengguna (Username & Password) */}
      {accountModalTeacher && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-xs p-4 overflow-y-auto animate-in fade-in">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200">
            <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white">
              <div className="flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-amber-400" />
                <h3 className="text-base font-bold">Atur Akun Login Guru/Pegawai</h3>
              </div>
              <button
                onClick={() => setAccountModalTeacher(null)}
                className="p-1 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveAccount} className="p-6 space-y-4 text-xs">
              {errorMsg && (
                <div className="p-3 rounded-xl bg-rose-50 text-rose-700 border border-rose-200">
                  {errorMsg}
                </div>
              )}

              <div className="p-3 rounded-xl bg-slate-100 border border-slate-200">
                <span className="text-[10px] text-slate-500 block uppercase font-bold">Guru/Pegawai:</span>
                <strong className="text-slate-900 text-sm">{accountModalTeacher.name}</strong>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Username Login <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={accountForm.username}
                  onChange={(e) => setAccountForm({ ...accountForm, username: e.target.value })}
                  placeholder="Username tanpa spasi"
                  className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 font-mono focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Password Login <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={accountForm.password}
                  onChange={(e) => setAccountForm({ ...accountForm, password: e.target.value })}
                  placeholder="Minimal 6 karakter"
                  className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 font-mono focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Password dapat langsung diberikan kepada guru untuk login ke sistem.
                </p>
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setAccountModalTeacher(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-xl font-bold shadow-md shadow-amber-500/20"
                >
                  Simpan Akun
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Konfirmasi Hapus Guru */}
      {deleteConfirmTeacher && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-sm w-full p-6 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Hapus Guru/Pegawai?</h3>
              <p className="text-xs text-slate-500 mt-1">
                Apakah Anda yakin ingin menghapus data <strong>{deleteConfirmTeacher.name}</strong>? Seluruh dokumen dan akun terkait akan dihapus.
              </p>
            </div>
            <div className="flex gap-2 justify-center pt-2">
              <button
                onClick={() => setDeleteConfirmTeacher(null)}
                className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-bold text-xs"
              >
                Batal
              </button>
              <button
                onClick={handleDelete}
                className="px-5 py-2 bg-rose-600 text-white rounded-xl font-bold text-xs hover:bg-rose-700"
              >
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
