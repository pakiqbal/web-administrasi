import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { storageService } from '../../services/storage';
import { User, Mail, Phone, Building, Briefcase, Award, CheckCircle2, Shield } from 'lucide-react';

export const GuruProfileView: React.FC = () => {
  const { currentTeacher, currentUser, refreshData } = useAuth();

  const [phone, setPhone] = useState(currentTeacher?.phone || '');
  const [email, setEmail] = useState(currentTeacher?.email || '');
  const [isSaved, setIsSaved] = useState(false);

  if (!currentTeacher) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    storageService.updateTeacher({
      ...currentTeacher,
      phone,
      email,
    });
    setIsSaved(true);
    refreshData();
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row items-center gap-6 pb-6 border-b border-slate-100">
          <div className="w-24 h-24 rounded-3xl bg-blue-100 text-blue-700 flex items-center justify-center font-black text-3xl shadow-md border-2 border-blue-200 overflow-hidden">
            {currentTeacher.photo ? (
              <img
                src={currentTeacher.photo}
                alt={currentTeacher.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <User className="w-12 h-12 text-blue-600" />
            )}
          </div>
          <div className="text-center sm:text-left">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900">{currentTeacher.name}</h1>
            <p className="text-xs font-mono text-slate-500 mt-1">NIP/NUPTK: {currentTeacher.nip_nuptk || '-'}</p>
            <div className="mt-2 flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800">
                {currentTeacher.position}
              </span>
              <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
                {currentTeacher.employment_status}
              </span>
              <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
                {currentTeacher.subject_or_group}
              </span>
            </div>
          </div>
        </div>

        {isSaved && (
          <div className="mt-6 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Perubahan data kontak Anda berhasil disimpan.</span>
          </div>
        )}

        <form onSubmit={handleSave} className="mt-6 space-y-4 text-xs">
          <h3 className="font-bold text-slate-900 uppercase tracking-wider text-xs">Informasi Kontak & Akun</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Nama Pengguna (Username Login)</label>
              <input
                type="text"
                disabled
                value={currentUser?.username || ''}
                className="w-full bg-slate-100 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-500 font-mono"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">Diatur oleh Administrator Sekolah</span>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Status Kepegawaian</label>
              <input
                type="text"
                disabled
                value={currentTeacher.employment_status}
                className="w-full bg-slate-100 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Nomor Telepon / WhatsApp</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="0812-xxxx-xxxx"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-800 focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Email Aktif</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="guru@tkitmutiaraislam.sch.id"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-800 focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
              />
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <button
              type="submit"
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-md shadow-blue-600/30 transition-all cursor-pointer"
            >
              Simpan Perubahan Kontak
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
