import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { storageService } from '../../services/storage';
import { SchoolYear, Semester } from '../../types';
import { Calendar, Plus, CheckCircle2, AlertCircle, Trash2, X } from 'lucide-react';

export const AdminPeriodsView: React.FC = () => {
  const { school, refreshData } = useAuth();
  const schoolYears = storageService.getSchoolYears();
  const semesters = storageService.getSemesters();

  const [newYearName, setNewYearName] = useState('');
  const [newYearStart, setNewYearStart] = useState('2025-07-01');
  const [newYearEnd, setNewYearEnd] = useState('2026-06-30');

  const [notification, setNotification] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const notify = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(''), 3500);
  };

  const handleSetActiveYear = (id: string) => {
    storageService.setActiveSchoolYear(id);
    refreshData();
    notify('Tahun pelajaran aktif berhasil diperbarui.');
  };

  const handleSetActiveSemester = (id: string) => {
    storageService.setActiveSemester(id);
    refreshData();
    notify('Semester aktif berhasil diperbarui.');
  };

  const handleAddYear = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newYearName.trim()) {
      setErrorMsg('Nama tahun pelajaran wajib diisi.');
      return;
    }

    try {
      storageService.createSchoolYear({
        name: newYearName.trim(),
        start_date: newYearStart,
        end_date: newYearEnd,
        is_active: false,
      });

      setNewYearName('');
      refreshData();
      notify(`Tahun pelajaran ${newYearName} berhasil ditambahkan.`);
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal menambahkan tahun pelajaran.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm">
        <h1 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
          <Calendar className="w-6 h-6 text-blue-600" />
          PENGATURAN TAHUN PELAJARAN & SEMESTER
        </h1>
        <p className="text-xs text-slate-500 font-medium mt-1">
          Tentukan tahun pelajaran dan semester yang aktif sebagai acuan pemantauan administrasi guru dan pegawai.
        </p>
      </div>

      {notification && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span className="font-semibold">{notification}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Card 1: Tahun Pelajaran */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-3">
            Tahun Pelajaran
          </h2>

          <div className="space-y-2">
            {schoolYears.map((sy) => (
              <div
                key={sy.id}
                className={`p-3.5 rounded-2xl border flex items-center justify-between text-xs transition-all ${
                  sy.is_active
                    ? 'bg-blue-50 border-blue-500 text-blue-950 font-bold'
                    : 'bg-slate-50 border-slate-200 text-slate-700 font-medium'
                }`}
              >
                <div>
                  <span className="text-sm block">{sy.name}</span>
                  <span className="text-[11px] text-slate-400">
                    Periode Akademik
                  </span>
                </div>

                <div>
                  {sy.is_active ? (
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-blue-600 text-white shadow-xs">
                      AKTIF SAAT INI
                    </span>
                  ) : (
                    <button
                      onClick={() => handleSetActiveYear(sy.id)}
                      className="px-3 py-1 bg-white hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold border border-slate-300 transition-colors cursor-pointer"
                    >
                      Aktifkan
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Form Tambah Tahun Pelajaran */}
          <form onSubmit={handleAddYear} className="pt-3 border-t border-slate-100 space-y-3 text-xs">
            <span className="font-bold text-slate-800 block text-[11px] uppercase">
              + Tambah Tahun Pelajaran Baru
            </span>
            <div>
              <input
                type="text"
                value={newYearName}
                onChange={(e) => setNewYearName(e.target.value)}
                placeholder="Contoh: 2026/2027"
                className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 font-bold"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="date"
                value={newYearStart}
                onChange={(e) => setNewYearStart(e.target.value)}
                className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl px-2 py-1.5"
              />
              <input
                type="date"
                value={newYearEnd}
                onChange={(e) => setNewYearEnd(e.target.value)}
                className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl px-2 py-1.5"
              />
            </div>
            <button
              type="submit"
              className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold cursor-pointer transition-colors"
            >
              Simpan Tahun Pelajaran
            </button>
          </form>
        </div>

        {/* Card 2: Semester */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-3">
            Semester Aktif
          </h2>

          <div className="space-y-3">
            {semesters.map((sem) => (
              <div
                key={sem.id}
                className={`p-4 rounded-2xl border flex items-center justify-between text-xs transition-all ${
                  sem.is_active
                    ? 'bg-emerald-50 border-emerald-500 text-emerald-950 font-bold'
                    : 'bg-slate-50 border-slate-200 text-slate-700 font-medium'
                }`}
              >
                <div>
                  <span className="text-sm block font-bold">{sem.name}</span>
                  <span className="text-[11px] text-slate-400">
                    {sem.name.toLowerCase().includes('ganjil') ? 'Bulan Juli - Desember' : 'Bulan Januari - Juni'}
                  </span>
                </div>

                <div>
                  {sem.is_active ? (
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-600 text-white shadow-xs">
                      SEMESTER AKTIF
                    </span>
                  ) : (
                    <button
                      onClick={() => handleSetActiveSemester(sem.id)}
                      className="px-3 py-1 bg-white hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold border border-slate-300 transition-colors cursor-pointer"
                    >
                      Pilih Semester
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-500">
            <p>
              Perubahan semester aktif akan menyesuaikan formulir upload dokumen administrasi bagi guru dan rekap pemeriksaan Kepala Sekolah secara otomatis.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
