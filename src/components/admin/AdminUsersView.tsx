import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { storageService } from '../../services/storage';
import { User, UserRole } from '../../types';
import {
  Shield,
  UserPlus,
  Edit2,
  Trash2,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  X,
  Search,
} from 'lucide-react';

export const AdminUsersView: React.FC = () => {
  const { currentUser, refreshData, dataVersion } = useAuth();
  const users = storageService.getUsers();
  const teachers = storageService.getTeachers();

  const [searchQuery, setSearchQuery] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [deleteConfirmUser, setDeleteConfirmUser] = useState<User | null>(null);

  const [formName, setFormName] = useState('');
  const [formUsername, setFormUsername] = useState('');
  const [formPassword, setFormPassword] = useState('');
  const [formRole, setFormRole] = useState<UserRole>('GURU');
  const [formTeacherId, setFormTeacherId] = useState<string>('');

  const [notification, setNotification] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const notify = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(''), 3500);
  };

  const handleOpenAdd = () => {
    setEditingUser(null);
    setFormName('');
    setFormUsername('');
    setFormPassword('123456');
    setFormRole('GURU');
    setFormTeacherId(teachers[0]?.id || '');
    setErrorMsg('');
    setModalOpen(true);
  };

  const handleOpenEdit = (u: User) => {
    setEditingUser(u);
    setFormName(u.name);
    setFormUsername(u.username);
    setFormPassword(u.password || '');
    setFormRole(u.role);
    setFormTeacherId(u.teacher_id || '');
    setErrorMsg('');
    setModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formUsername.trim() || !formPassword.trim()) {
      setErrorMsg('Username dan password wajib diisi.');
      return;
    }

    try {
      if (editingUser) {
        storageService.updateUser({
          ...editingUser,
          name: formName || formUsername,
          username: formUsername.trim().toLowerCase(),
          password: formPassword,
          role: formRole,
          teacher_id: formRole === 'GURU' ? formTeacherId || undefined : undefined,
        });
        notify(`Akun @${formUsername} berhasil diperbarui.`);
      } else {
        storageService.createUser({
          name: formName || formUsername,
          username: formUsername.trim().toLowerCase(),
          password: formPassword,
          role: formRole,
          teacher_id: formRole === 'GURU' ? formTeacherId || undefined : undefined,
          is_active: true,
        });
        notify(`Akun @${formUsername} berhasil dibuat.`);
      }

      refreshData();
      setModalOpen(false);
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal menyimpan akun.');
    }
  };

  const handleRequestDelete = (u: User) => {
    setErrorMsg('');
    if (u.id === currentUser?.id) {
      setErrorMsg('Tidak dapat menghapus akun Anda sendiri yang sedang aktif digunakan.');
      return;
    }
    if (u.role === 'ADMIN') {
      const adminCount = users.filter((x) => x.role === 'ADMIN').length;
      if (adminCount <= 1) {
        setErrorMsg('Tidak dapat menghapus akun Administrator ini karena merupakan satu-satunya Administrator dalam sistem.');
        return;
      }
    }
    if (u.teacher_id) {
      const linkedTeacher = storageService.getTeacherById(u.teacher_id);
      const docs = storageService.getDocuments().filter((d) => d.teacher_id === u.teacher_id);
      if (docs.length > 0) {
        setErrorMsg(`Akun @${u.username} tidak dapat dihapus karena terhubung dengan data guru/pegawai (${linkedTeacher?.name || 'Guru'}) yang memiliki ${docs.length} berkas dokumen administrasi tersimpan.`);
        return;
      }
    }
    setDeleteConfirmUser(u);
  };

  const handleConfirmDelete = () => {
    if (!deleteConfirmUser) return;
    try {
      const u = deleteConfirmUser;
      if (u.teacher_id) {
        const teacher = storageService.getTeacherById(u.teacher_id);
        if (teacher && teacher.user_id === u.id) {
          storageService.updateTeacher({
            ...teacher,
            user_id: undefined,
          });
        }
      }
      storageService.deleteUser(u.id);
      refreshData();
      notify(`Akun @${u.username} berhasil dihapus.`);
      setDeleteConfirmUser(null);
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal menghapus akun.');
      setDeleteConfirmUser(null);
    }
  };

  const filteredUsers = users.filter((u) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return u.username.toLowerCase().includes(q) || u.name.toLowerCase().includes(q) || u.role.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <Shield className="w-6 h-6 text-blue-600" />
            MANAJEMEN AKUN & ROLE PENGGUNA
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Atur username, password, dan hak akses peran (ADMIN, KEPALA SEKOLAH, GURU/PEGAWAI).
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-xs font-bold shadow-md shadow-blue-600/30 flex items-center gap-2 transition-all cursor-pointer"
        >
          <UserPlus className="w-4 h-4" />
          <span>+ BUAT AKUN PENGGUNA</span>
        </button>
      </div>

      {notification && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span className="font-semibold">{notification}</span>
        </div>
      )}

      {errorMsg && !modalOpen && !deleteConfirmUser && (
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

      {/* Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari nama, username, role..."
            className="w-full text-xs pl-10 pr-4 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
          />
        </div>
        <span className="text-xs text-slate-500 font-medium">
          Total: <strong>{users.length}</strong> Akun
        </span>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-700 font-bold uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="px-4 py-3.5 text-center w-12">No</th>
                <th className="px-4 py-3.5">Nama Pengguna</th>
                <th className="px-4 py-3.5">Username</th>
                <th className="px-4 py-3.5">Password</th>
                <th className="px-4 py-3.5 text-center">Peran (Role)</th>
                <th className="px-4 py-3.5">Tautan Profil Guru</th>
                <th className="px-4 py-3.5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUsers.map((u, idx) => {
                const linkedTeacher = u.teacher_id ? storageService.getTeacherById(u.teacher_id) : null;
                const isCurrentUser = u.id === currentUser?.id;

                return (
                  <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3.5 text-center text-slate-400 font-bold">{idx + 1}</td>
                    <td className="px-4 py-3.5 font-bold text-slate-900">
                      {u.name}
                      {isCurrentUser && (
                        <span className="ml-2 text-[10px] text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full font-bold">
                          Anda
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3.5 font-mono text-blue-700 font-bold">
                      @{u.username}
                    </td>
                    <td className="px-4 py-3.5 font-mono text-slate-500">
                      {u.password}
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-black ${
                          u.role === 'ADMIN'
                            ? 'bg-purple-100 text-purple-800'
                            : u.role === 'KEPALA_SEKOLAH'
                            ? 'bg-amber-100 text-amber-900'
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {u.role === 'ADMIN'
                          ? 'ADMINISTRATOR'
                          : u.role === 'KEPALA_SEKOLAH'
                          ? 'KEPALA SEKOLAH'
                          : 'GURU / PEGAWAI'}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-slate-600">
                      {linkedTeacher ? (
                        <span className="font-semibold text-slate-800">{linkedTeacher.name}</span>
                      ) : (
                        <span className="text-slate-400 italic">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenEdit(u)}
                          className="p-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 transition-colors cursor-pointer"
                          title="Edit Akun"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleRequestDelete(u)}
                          className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 transition-colors cursor-pointer"
                          title="Hapus Akun"
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

      {/* Modal Tambah/Edit Akun */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-xs p-4 overflow-y-auto animate-in fade-in">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200">
            <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white">
              <h3 className="text-base font-bold">
                {editingUser ? 'Edit Akun Pengguna' : 'Buat Akun Pengguna Baru'}
              </h3>
              <button onClick={() => setModalOpen(false)} className="p-1 text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4 text-xs">
              {errorMsg && (
                <div className="p-3 rounded-xl bg-rose-50 text-rose-700 border border-rose-200">
                  {errorMsg}
                </div>
              )}

              <div>
                <label className="block font-bold text-slate-700 mb-1">Nama Tampilan</label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="Nama pemilik akun"
                  className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Username Login <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formUsername}
                  onChange={(e) => setFormUsername(e.target.value)}
                  placeholder="Username tanpa spasi"
                  className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 font-mono focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Password <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formPassword}
                  onChange={(e) => setFormPassword(e.target.value)}
                  placeholder="Kata sandi login"
                  className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 font-mono focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Peran Akun (Role) <span className="text-rose-500">*</span>
                </label>
                <select
                  value={formRole}
                  onChange={(e) => setFormRole(e.target.value as any)}
                  className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 font-bold focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
                >
                  <option value="GURU">GURU / PEGAWAI</option>
                  <option value="KEPALA_SEKOLAH">KEPALA SEKOLAH</option>
                  <option value="ADMIN">ADMINISTRATOR</option>
                </select>
              </div>

              {formRole === 'GURU' && (
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Tautkan ke Data Guru / Pegawai
                  </label>
                  <select
                    value={formTeacherId}
                    onChange={(e) => setFormTeacherId(e.target.value)}
                    className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
                  >
                    <option value="">-- Pilih Profil Guru / Pegawai --</option>
                    {teachers.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name} ({t.position})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-md shadow-blue-600/30"
                >
                  Simpan Akun
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Konfirmasi Hapus Akun */}
      {deleteConfirmUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl shadow-2xl max-w-sm w-full p-6 text-center space-y-4 border border-slate-200">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Hapus Akun Pengguna?</h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Apakah Anda yakin ingin menghapus akun <strong>@{deleteConfirmUser.username}</strong> ({deleteConfirmUser.name})? Tindakan ini tidak dapat dibatalkan.
              </p>
            </div>
            <div className="flex gap-2 justify-center pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmUser(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold text-xs shadow-md shadow-rose-600/30 transition-colors cursor-pointer"
              >
                Ya, Hapus Akun
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
