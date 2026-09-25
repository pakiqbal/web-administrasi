import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  Settings,
  KeyRound,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  User,
  Lock,
  Save,
  ShieldAlert,
  Info,
  Calendar,
  Clock,
} from 'lucide-react';

export const SettingsView: React.FC = () => {
  const { currentUser, currentTeacher, changePassword, school } = useAuth();

  // Active sub-tab inside Pengaturan
  const [activeSubTab, setActiveSubTab] = useState<'password' | 'profile'>('password');

  // Form State
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Password visibility toggles
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Status feedback
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!currentUser) return null;

  const handleSubmitPassword = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    // Validasi form tidak boleh kosong
    if (!oldPassword.trim()) {
      setErrorMessage('Silakan masukkan Password Lama Anda.');
      return;
    }
    if (!newPassword.trim()) {
      setErrorMessage('Silakan masukkan Password Baru Anda.');
      return;
    }
    if (!confirmPassword.trim()) {
      setErrorMessage('Silakan ulangi konfirmasi Password Baru Anda.');
      return;
    }

    // Validasi panjang password baru
    if (newPassword.length < 5) {
      setErrorMessage('Password baru minimal 5 karakter demi keamanan akun.');
      return;
    }

    // Validasi konfirmasi password baru harus sama
    if (newPassword !== confirmPassword) {
      setErrorMessage('Password Baru dan Konfirmasi Password Baru tidak sama. Pastikan keduanya identik.');
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      const result = changePassword(oldPassword, newPassword);
      setIsSubmitting(false);

      if (!result.success) {
        setErrorMessage(result.message);
      } else {
        setSuccessMessage(result.message);
        // Reset field input setelah berhasil
        setOldPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setShowOldPassword(false);
        setShowNewPassword(false);
        setShowConfirmPassword(false);
      }
    }, 300);
  };

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'Administrator Sistem';
      case 'KEPALA_SEKOLAH':
        return 'Kepala Sekolah';
      case 'GURU':
        return 'Guru / Pegawai';
      default:
        return role;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'KEPALA_SEKOLAH':
        return 'bg-amber-100 text-amber-900 border-amber-200';
      default:
        return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-bold mb-2">
            <Settings className="w-3.5 h-3.5 text-blue-600" />
            PENGATURAN SISTEM
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            Pengaturan Akun & Keamanan
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
            Kelola kata sandi akun dan tinjau informasi kredensial yang sedang aktif.
          </p>
        </div>

        {/* Current user badge */}
        <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-200 shrink-0">
          <div className="w-10 h-10 rounded-xl bg-blue-600 text-white font-bold flex items-center justify-center text-sm shadow-sm">
            {currentUser.name.charAt(0)}
          </div>
          <div>
            <p className="text-xs font-bold text-slate-900 leading-tight truncate max-w-[160px]">
              {currentUser.name}
            </p>
            <p className="text-[11px] font-mono font-semibold text-blue-700">
              @{currentUser.username}
            </p>
            <span
              className={`mt-1 inline-block px-2 py-0.5 rounded-md text-[10px] font-black border ${getRoleColor(
                currentUser.role
              )}`}
            >
              {getRoleDisplayName(currentUser.role)}
            </span>
          </div>
        </div>
      </div>

      {/* Navigation Sub-tabs inside Pengaturan */}
      <div className="flex border-b border-slate-200 gap-2 sm:gap-4 overflow-x-auto pb-1">
        <button
          onClick={() => {
            setActiveSubTab('password');
            setErrorMessage('');
            setSuccessMessage('');
          }}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap cursor-pointer ${
            activeSubTab === 'password'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white'
          }`}
        >
          <KeyRound className="w-4 h-4" />
          <span>🔑 Ganti Password</span>
        </button>

        <button
          onClick={() => {
            setActiveSubTab('profile');
            setErrorMessage('');
            setSuccessMessage('');
          }}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap cursor-pointer ${
            activeSubTab === 'profile'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white'
          }`}
        >
          <User className="w-4 h-4" />
          <span>👤 Informasi Akun Pengguna</span>
        </button>
      </div>

      {/* SUB-TAB 1: GANTI PASSWORD */}
      {activeSubTab === 'password' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Password Form Card */}
          <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Lock className="w-5 h-5 text-blue-600" />
                Formulir Ganti Password
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Silakan isi password lama untuk verifikasi, lalu masukkan password baru yang ingin Anda gunakan.
              </p>
            </div>

            {/* Error Message Box */}
            {errorMessage && (
              <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-start gap-3 animate-in fade-in">
                <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold block">Gagal Menyimpan Perubahan:</span>
                  <p className="mt-0.5 leading-relaxed">{errorMessage}</p>
                </div>
              </div>
            )}

            {/* Success Message Box */}
            {successMessage && (
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-start gap-3 animate-in fade-in">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold block">Perubahan Berhasil Disimpan:</span>
                  <p className="mt-0.5 leading-relaxed">{successMessage}</p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmitPassword} className="space-y-5">
              {/* Field 1: Password Lama */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Password Lama <span className="text-rose-500">*</span>
                </label>
                <div className="relative rounded-2xl shadow-xs">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <KeyRound className="w-4 h-4" />
                  </div>
                  <input
                    type={showOldPassword ? 'text' : 'password'}
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    placeholder="Masukkan kata sandi lama Anda saat ini"
                    className="block w-full pl-10 pr-12 py-3 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-2xl focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition-colors font-mono"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowOldPassword(!showOldPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                    title={showOldPassword ? 'Sembunyikan password' : 'Tampilkan password'}
                    aria-label="Toggle password lama"
                  >
                    {showOldPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Password lama diperlukan untuk memverifikasi bahwa ini memang Anda.
                </p>
              </div>

              {/* Field 2: Password Baru */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Password Baru <span className="text-rose-500">*</span>
                </label>
                <div className="relative rounded-2xl shadow-xs">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Masukkan kata sandi baru (minimal 5 karakter)"
                    className="block w-full pl-10 pr-12 py-3 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-2xl focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition-colors font-mono"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                    title={showNewPassword ? 'Sembunyikan password' : 'Tampilkan password'}
                    aria-label="Toggle password baru"
                  >
                    {showNewPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
                {/* Visual feedback if new password typed */}
                {newPassword && (
                  <div className="mt-2 flex items-center gap-2 text-[11px]">
                    <span className="text-slate-500 font-medium">Kekuatan:</span>
                    <span
                      className={`font-bold ${
                        newPassword.length >= 8
                          ? 'text-emerald-600'
                          : newPassword.length >= 5
                          ? 'text-amber-600'
                          : 'text-rose-600'
                      }`}
                    >
                      {newPassword.length >= 8
                        ? 'Kuat (Aman)'
                        : newPassword.length >= 5
                        ? 'Cukup'
                        : 'Terlalu Pendek'}
                    </span>
                  </div>
                )}
              </div>

              {/* Field 3: Konfirmasi Password Baru */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Konfirmasi Password Baru <span className="text-rose-500">*</span>
                </label>
                <div className="relative rounded-2xl shadow-xs">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Ketik ulang kata sandi baru Anda"
                    className={`block w-full pl-10 pr-12 py-3 text-xs sm:text-sm bg-slate-50 border rounded-2xl focus:ring-2 focus:border-blue-600 transition-colors font-mono ${
                      confirmPassword && newPassword !== confirmPassword
                        ? 'border-rose-400 focus:ring-rose-400'
                        : confirmPassword && newPassword === confirmPassword
                        ? 'border-emerald-400 focus:ring-emerald-400'
                        : 'border-slate-300 focus:ring-blue-600'
                    }`}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                    title={showConfirmPassword ? 'Sembunyikan password' : 'Tampilkan password'}
                    aria-label="Toggle konfirmasi password"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>

                {/* Match indicator */}
                {confirmPassword && (
                  <p
                    className={`text-[11px] mt-1 font-semibold flex items-center gap-1 ${
                      newPassword === confirmPassword ? 'text-emerald-600' : 'text-rose-600'
                    }`}
                  >
                    {newPassword === confirmPassword ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5" /> Konfirmasi cocok dengan password baru
                      </>
                    ) : (
                      <>
                        <AlertCircle className="w-3.5 h-3.5" /> Konfirmasi belum cocok dengan password baru
                      </>
                    )}
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-4 flex flex-col sm:flex-row items-center justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setOldPassword('');
                    setNewPassword('');
                    setConfirmPassword('');
                    setErrorMessage('');
                    setSuccessMessage('');
                  }}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all cursor-pointer"
                >
                  Batal / Reset Form
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full sm:w-auto px-7 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-600/30 flex items-center justify-center gap-2 transition-all disabled:opacity-60 cursor-pointer"
                >
                  {isSubmitting ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>Simpan Perubahan</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Side Info & Tips Card */}
          <div className="space-y-4">
            {/* Account Card */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-2">
                <User className="w-4 h-4 text-blue-600" />
                Akun Terautentikasi
              </h3>
              <div className="space-y-2.5 text-xs">
                <div>
                  <span className="text-slate-400 block text-[10px]">Nama Lengkap:</span>
                  <span className="font-bold text-slate-900">{currentUser.name}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Username Login:</span>
                  <span className="font-mono font-bold text-blue-700">@{currentUser.username}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Peran / Hak Akses:</span>
                  <span className="font-bold text-slate-800">
                    {getRoleDisplayName(currentUser.role)}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Email Terdaftar:</span>
                  <span className="font-medium text-slate-600 truncate block">
                    {currentUser.email || '-'}
                  </span>
                </div>
              </div>
            </div>

            {/* Security Tips */}
            <div className="bg-blue-50/60 rounded-3xl border border-blue-200 p-6 text-xs text-blue-950 space-y-3">
              <div className="flex items-center gap-2 font-bold text-blue-900">
                <ShieldAlert className="w-4 h-4 text-blue-600 shrink-0" />
                <span>Petunjuk Keamanan Sandi</span>
              </div>
              <ul className="space-y-2 text-[11px] text-blue-900/80 list-disc list-inside leading-relaxed">
                <li>
                  Gunakan kombinasi minimal 5 karakter atau lebih.
                </li>
                <li>
                  Hindari menggunakan password yang mudah ditebak seperti tanggal lahir atau 123456.
                </li>
                <li>
                  Setiap akun (Admin dan Kepala Sekolah) memiliki kredensial independen. Perubahan ini hanya berlaku untuk akun yang sedang Anda gunakan saat ini.
                </li>
                <li>
                  Setelah disimpan, password langsung aktif dan digunakan saat Anda login di kemudian hari.
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 2: INFORMASI AKUN & PROFIL */}
      {activeSubTab === 'profile' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
          <div className="border-b border-slate-100 pb-4 flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <User className="w-5 h-5 text-blue-600" />
                Detail Informasi Akun Pengguna
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Informasi hak akses dan profil sistem yang terhubung dengan akun Anda.
              </p>
            </div>
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold border ${getRoleColor(
                currentUser.role
              )}`}
            >
              {getRoleDisplayName(currentUser.role)}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <h4 className="font-bold text-slate-800 text-xs border-b border-slate-200 pb-2">
                Kredensial Login
              </h4>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-slate-400 text-[11px]">ID Pengguna:</span>
                  <p className="font-mono font-semibold text-slate-800 truncate">{currentUser.id}</p>
                </div>
                <div>
                  <span className="text-slate-400 text-[11px]">Username:</span>
                  <p className="font-mono font-bold text-blue-700">@{currentUser.username}</p>
                </div>
                <div>
                  <span className="text-slate-400 text-[11px]">Status Akun:</span>
                  <p className="font-bold text-emerald-600 flex items-center gap-1 mt-0.5">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Aktif
                  </p>
                </div>
                <div>
                  <span className="text-slate-400 text-[11px]">Terdaftar Pada:</span>
                  <p className="text-slate-600 font-medium">
                    {new Date(currentUser.created_at || Date.now()).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </p>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <h4 className="font-bold text-slate-800 text-xs border-b border-slate-200 pb-2">
                Data Lembaga & Sekolah
              </h4>
              <div className="space-y-1.5">
                <div>
                  <span className="text-slate-400 text-[11px]">Nama Satuan:</span>
                  <p className="font-bold text-slate-900">{school.name}</p>
                </div>
                <div>
                  <span className="text-slate-400 text-[11px]">NPSN Sekolah:</span>
                  <p className="font-mono text-slate-700">{school.npsn}</p>
                </div>
                <div>
                  <span className="text-slate-400 text-[11px]">Kepala Sekolah:</span>
                  <p className="font-semibold text-slate-800">{school.principal_name}</p>
                </div>
              </div>
            </div>
          </div>

          {currentTeacher && (
            <div className="p-4 rounded-2xl bg-blue-50/50 border border-blue-200 space-y-3 text-xs">
              <h4 className="font-bold text-blue-900 border-b border-blue-200 pb-2">
                Tautan Profil Guru / Staf
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <span className="text-blue-600/80 text-[11px]">Jabatan:</span>
                  <p className="font-bold text-slate-900">{currentTeacher.position}</p>
                </div>
                <div>
                  <span className="text-blue-600/80 text-[11px]">NIP / NUPTK:</span>
                  <p className="font-mono text-slate-800">{currentTeacher.nip_nuptk || '-'}</p>
                </div>
                <div>
                  <span className="text-blue-600/80 text-[11px]">Status Kepegawaian:</span>
                  <p className="font-semibold text-slate-800">{currentTeacher.employment_status}</p>
                </div>
              </div>
            </div>
          )}

          <div className="pt-2 flex justify-start">
            <button
              onClick={() => setActiveSubTab('password')}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-xs font-bold shadow-md shadow-blue-600/20 flex items-center gap-2 cursor-pointer transition-all"
            >
              <KeyRound className="w-4 h-4" />
              <span>Buka Formulir Ganti Password &rarr;</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
