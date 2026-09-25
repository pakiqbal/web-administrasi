import React, { useState, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { storageService } from '../../services/storage';
import { KopSurat } from '../common/KopSurat';
import { ProgressBar } from '../common/ProgressBar';
import { KopSuratConfig } from '../../types';
import jsPDF from 'jspdf';
import { toPng } from 'html-to-image';
import {
  FileSpreadsheet,
  Printer,
  Download,
  FileText,
  Filter,
  CheckCircle2,
  Clock,
  AlertCircle,
  CircleDashed,
  Calendar,
  Settings,
  Upload,
  Image,
  RotateCcw,
  X,
  Loader2,
} from 'lucide-react';

interface KepsekReportsViewProps {
  initialTeacherId?: string;
}

export const KepsekReportsView: React.FC<KepsekReportsViewProps> = ({ initialTeacherId }) => {
  const { school, refreshData, dataVersion } = useAuth();
  const kopConfig = storageService.getKopSuratConfig();

  const [reportType, setReportType] = useState<string>(initialTeacherId ? 'per_guru' : 'seluruh_guru');
  const [selectedTeacherId, setSelectedTeacherId] = useState<string>(initialTeacherId || '');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  // Kop Surat Settings Modal State
  const [kopModalOpen, setKopModalOpen] = useState(false);
  const [kopForm, setKopForm] = useState<KopSuratConfig>(kopConfig);
  const [notification, setNotification] = useState('');

  const notify = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(''), 3500);
  };

  const reportContainerRef = useRef<HTMLDivElement>(null);
  const leftLogoInputRef = useRef<HTMLInputElement>(null);
  const rightLogoInputRef = useRef<HTMLInputElement>(null);

  const allTeachers = storageService.getTeachers();
  const allDocs = storageService.getDocuments();
  const categories = storageService.getCategories();
  const requirements = storageService.getRequirements().filter((r) => r.is_active);
  const progressList = storageService.getAllTeachersProgress();
  const reviews = storageService.getReviews();

  // Set default teacher/category if empty
  if (!selectedTeacherId && allTeachers.length > 0) {
    setSelectedTeacherId(allTeachers[0].id);
  }
  if (!selectedCategoryId && categories.length > 0) {
    setSelectedCategoryId(categories[0].id);
  }

  // Handle Print
  const handlePrint = () => {
    window.print();
  };

  // Handle Real PDF Download with native browser rendering and multi-page slicing
  const handleDownloadPDF = async () => {
    if (!reportContainerRef.current) return;
    setIsGeneratingPdf(true);

    try {
      const element = reportContainerRef.current;

      // Render element to high quality PNG using native browser engine (supports all modern CSS & oklch)
      const dataUrl = await toPng(element, {
        quality: 0.98,
        pixelRatio: 2,
        backgroundColor: '#ffffff',
        cacheBust: true,
      });

      // Load image into an HTMLImageElement to obtain dimensions
      const img = new window.Image();
      img.src = dataUrl;
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error('Gagal memuat canvas gambar laporan'));
      });

      // Standard A4 dimensions in mm: 210 x 297
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();

      const margin = 10; // 10mm margin
      const contentWidth = pageWidth - margin * 2; // 190mm
      const pageUsableHeightMm = pageHeight - margin * 2; // 277mm

      // Calculate pixel height corresponding to one A4 page usable height
      const pxPerMm = img.width / contentWidth;
      const pageUsableHeightPx = pageUsableHeightMm * pxPerMm;

      const totalPages = Math.max(1, Math.ceil(img.height / pageUsableHeightPx));

      for (let i = 0; i < totalPages; i++) {
        if (i > 0) {
          pdf.addPage();
        }

        const currentSliceHeightPx = Math.min(pageUsableHeightPx, img.height - i * pageUsableHeightPx);

        const pageCanvas = document.createElement('canvas');
        pageCanvas.width = img.width;
        pageCanvas.height = currentSliceHeightPx;

        const ctx = pageCanvas.getContext('2d');
        if (ctx) {
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, pageCanvas.width, pageCanvas.height);
          ctx.drawImage(
            img,
            0,
            i * pageUsableHeightPx,
            img.width,
            currentSliceHeightPx, // source
            0,
            0,
            pageCanvas.width,
            currentSliceHeightPx // destination
          );
        }

        const sliceData = pageCanvas.toDataURL('image/png');
        const sliceHeightMm = (currentSliceHeightPx * contentWidth) / img.width;
        pdf.addImage(sliceData, 'PNG', margin, margin, contentWidth, sliceHeightMm);
      }

      const cleanTitle = getReportTitle().replace(/[^a-zA-Z0-9_\u0600-\u06FF]/g, '_');
      pdf.save(`${cleanTitle}_${new Date().toISOString().slice(0, 10)}.pdf`);
      notify('File PDF laporan berhasil di-download.');
    } catch (err: any) {
      console.error('Gagal membuat PDF:', err);
      alert('Terjadi kendala saat membuat file PDF: ' + (err?.message || 'Silakan coba lagi.'));
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const handleUploadLogo = (e: React.ChangeEvent<HTMLInputElement>, field: 'logo_url' | 'right_logo_url') => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check valid format: JPG, JPEG, PNG, WEBP
    const validExtensions = /\.(jpe?g|png|webp|svg)$/i;
    const validMimes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/svg+xml'];
    if (!validMimes.includes(file.type.toLowerCase()) && !file.name.match(validExtensions)) {
      alert('Format file gambar tidak valid. Gunakan format JPG, JPEG, atau PNG.');
      e.target.value = '';
      return;
    }

    if (file.size > 3 * 1024 * 1024) {
      alert('Ukuran file gambar maksimal 3 MB.');
      e.target.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        const dataUrl = reader.result;
        setKopForm((prev) => ({
          ...prev,
          [field]: dataUrl,
        }));
      }
      e.target.value = '';
    };
    reader.onerror = () => {
      alert('Gagal membaca file gambar.');
      e.target.value = '';
    };
    reader.readAsDataURL(file);
  };

  const handleSaveKopSurat = (e: React.FormEvent) => {
    e.preventDefault();
    storageService.updateKopSuratConfig(kopForm);
    refreshData();
    notify('Pengaturan kop surat laporan berhasil disimpan.');
    setKopModalOpen(false);
  };

  const handleResetKopSurat = () => {
    if (window.confirm('Kembalikan pengaturan kop surat ke format standar sekolah?')) {
      const defaults: KopSuratConfig = {
        foundation_name: 'YAYASAN MUTIARA ISLAM PALOPO',
        school_name: school.name || 'TKIT MUTIARA ISLAM PALOPO',
        address: school.address || 'Jl. K.H. Ahmad Dahlan No. 12, Wara, Kota Palopo, Sulawesi Selatan',
        npsn: school.npsn || '69978120',
        phone: school.phone || '(0471) 3201882 / 0812-4211-9876',
        email: school.email || 'tkitmutiaraislampalopo@gmail.com',
        website: school.website || 'https://tkitmutiaraislam.sch.id',
        logo_url: school.logo_url || '',
        right_logo_url: '',
        right_text_top: 'KOTA PALOPO',
        right_text_bottom: 'SUL-SEL',
      };
      setKopForm(defaults);
      storageService.updateKopSuratConfig(defaults);
      refreshData();
      notify('Kop surat dikembalikan ke format default.');
    }
  };

  // Handle Export Excel (CSV / HTML Excel)
  const handleExportExcel = () => {
    let filename = `Laporan_${reportType}_${kopConfig.school_name.replace(/[^a-zA-Z0-9_-]/g, '_')}_${new Date().toISOString().slice(0, 10)}.csv`;
    let csvContent = 'data:text/csv;charset=utf-8,';

    // Header Kop
    csvContent += `"${kopConfig.foundation_name}"\r\n`;
    csvContent += `"${kopConfig.school_name}"\r\n`;
    csvContent += `"Alamat: ${kopConfig.address} - NPSN: ${kopConfig.npsn}"\r\n`;
    csvContent += `"Kepala Sekolah: ${school.principal_name}"\r\n`;
    csvContent += `"Laporan: ${getReportTitle()}"\r\n`;
    csvContent += `"Tanggal Cetak: ${new Date().toLocaleDateString('id-ID')}"\r\n\r\n`;

    if (reportType === 'seluruh_guru' || reportType === 'administrasi_pegawai' || reportType === 'rekap_persentase') {
      csvContent += `No,Nama,NIP/NUPTK,Jabatan,Status,Total Wajib,Wajib Lengkap,Persentase\r\n`;
      const list = reportType === 'administrasi_pegawai'
        ? progressList.filter((p) => p.teacher.is_staff)
        : progressList.filter((p) => !p.teacher.is_staff);

      list.forEach((p, idx) => {
        csvContent += `"${idx + 1}","${p.teacher.name}","${p.teacher.nip_nuptk || '-'}","${p.teacher.position}","${p.teacher.employment_status}","${p.total_mandatory}","${p.mandatory_complete}","${p.percentage}%"\r\n`;
      });
    } else if (reportType === 'per_guru') {
      const teacher = allTeachers.find((t) => t.id === selectedTeacherId);
      csvContent += `Guru/Pegawai: ${teacher?.name || '-'}\r\n`;
      csvContent += `Jabatan: ${teacher?.position || '-'}\r\n\r\n`;
      csvContent += `No,Kategori,Nama Dokumen,Sifat,Status,File,Tanggal Upload\r\n`;

      const teacherDocs = allDocs.filter((d) => d.teacher_id === selectedTeacherId);
      requirements.forEach((req, idx) => {
        const doc = teacherDocs.find((d) => d.document_requirement_id === req.id);
        const cat = categories.find((c) => c.id === req.category_id);
        csvContent += `"${idx + 1}","${cat?.name || '-'}","${req.name}","${req.is_mandatory ? 'WAJIB' : 'OPSIONAL'}","${doc?.status || 'BELUM_DIUNGGAH'}","${doc?.file_name || '-'}","${doc ? new Date(doc.uploaded_at).toLocaleDateString('id-ID') : '-'}"\r\n`;
      });
    } else {
      // General docs export
      csvContent += `No,Guru/Pegawai,Nama Dokumen,File,Status,Tanggal\r\n`;
      allDocs.forEach((doc, idx) => {
        const teacher = storageService.getTeacherById(doc.teacher_id);
        const req = requirements.find((r) => r.id === doc.document_requirement_id);
        csvContent += `"${idx + 1}","${teacher?.name || '-'}","${req?.name || doc.file_name}","${doc.file_name}","${doc.status}","${new Date(doc.uploaded_at).toLocaleDateString('id-ID')}"\r\n`;
      });
    }

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getReportTitle = () => {
    switch (reportType) {
      case 'seluruh_guru':
        return 'Laporan Administrasi Seluruh Guru';
      case 'per_guru':
        const t = allTeachers.find((tch) => tch.id === selectedTeacherId);
        return `Laporan Administrasi Perorangan: ${t?.name || 'Guru'}`;
      case 'administrasi_pegawai':
        return 'Laporan Administrasi Staf & Pegawai';
      case 'per_kategori':
        const c = categories.find((cat) => cat.id === selectedCategoryId);
        return `Laporan Administrasi Kategori: ${c?.name || 'Kategori'}`;
      case 'belum_diunggah':
        return 'Daftar Dokumen Belum Diunggah';
      case 'menunggu_pemeriksaan':
        return 'Daftar Dokumen Menunggu Pemeriksaan';
      case 'perlu_perbaikan':
        return 'Daftar Dokumen Perlu Perbaikan';
      case 'rekap_persentase':
        return 'Rekap Persentase Kelengkapan Administrasi';
      case 'riwayat_pemeriksaan':
        return 'Riwayat Pemeriksaan Dokumen Kepala Sekolah';
      default:
        return 'Laporan Pemantauan Administrasi';
    }
  };

  return (
    <div className="space-y-6">
      {/* Configuration Toolbar (Hidden during Print) */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4 no-print">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <h1 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <FileSpreadsheet className="w-6 h-6 text-blue-600" />
              PUSAT LAPORAN ADMINISTRASI
            </h1>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Kepala Sekolah: <strong>{school.principal_name}</strong> &bull; {school.name}
            </p>
          </div>

          {/* Action Buttons: [PRINT] [DOWNLOAD PDF] [EXPORT EXCEL] [PENGATURAN KOP] */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-sm flex items-center gap-2 transition-colors cursor-pointer"
              title="Cetak laporan ke printer atau Simpan PDF via browser"
            >
              <Printer className="w-4 h-4" />
              <span>PRINT / CETAK</span>
            </button>

            <button
              type="button"
              onClick={handleDownloadPDF}
              disabled={isGeneratingPdf}
              className={`px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-sm flex items-center gap-2 transition-colors cursor-pointer ${
                isGeneratingPdf ? 'opacity-75 cursor-wait' : ''
              }`}
              title="Download file PDF resmi format A4"
            >
              {isGeneratingPdf ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>MEMBUAT PDF...</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>DOWNLOAD PDF</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleExportExcel}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm flex items-center gap-2 transition-colors cursor-pointer"
              title="Export data laporan ke format Excel / Spreadsheet CSV"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>EXPORT EXCEL</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setKopForm(storageService.getKopSuratConfig());
                setKopModalOpen(true);
              }}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-sm flex items-center gap-2 transition-colors cursor-pointer"
              title="Atur logo sekolah, identitas yayasan, lambang daerah, dan teks kop surat"
            >
              <Settings className="w-4 h-4" />
              <span>⚙️ PENGATURAN KOP SURAT</span>
            </button>
          </div>
        </div>

        {/* 9 Jenis Laporan Selector */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Pilih Jenis Laporan:
            </label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              className="w-full text-xs font-semibold bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-800 focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
            >
              <option value="seluruh_guru">1. Laporan Administrasi Seluruh Guru</option>
              <option value="per_guru">2. Laporan Per Guru</option>
              <option value="administrasi_pegawai">3. Laporan Administrasi Pegawai</option>
              <option value="per_kategori">4. Laporan Per Kategori</option>
              <option value="belum_diunggah">5. Daftar Dokumen Belum Diunggah</option>
              <option value="menunggu_pemeriksaan">6. Daftar Dokumen Menunggu Pemeriksaan</option>
              <option value="perlu_perbaikan">7. Daftar Dokumen Perlu Perbaikan</option>
              <option value="rekap_persentase">8. Rekap Persentase Kelengkapan</option>
              <option value="riwayat_pemeriksaan">9. Riwayat Pemeriksaan</option>
            </select>
          </div>

          {reportType === 'per_guru' && (
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Pilih Guru / Pegawai:
              </label>
              <select
                value={selectedTeacherId}
                onChange={(e) => setSelectedTeacherId(e.target.value)}
                className="w-full text-xs font-semibold bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-800 focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
              >
                {allTeachers.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name} ({t.position})
                  </option>
                ))}
              </select>
            </div>
          )}

          {reportType === 'per_kategori' && (
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Pilih Kategori Administrasi:
              </label>
              <select
                value={selectedCategoryId}
                onChange={(e) => setSelectedCategoryId(e.target.value)}
                className="w-full text-xs font-semibold bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-800 focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {notification && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center justify-between gap-2 animate-in fade-in no-print">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-semibold">{notification}</span>
          </div>
          <button onClick={() => setNotification('')} className="text-emerald-600 hover:text-emerald-800 p-1 cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Printable Report Canvas */}
      <div
        ref={reportContainerRef}
        className="bg-white p-8 sm:p-12 rounded-3xl border border-slate-200 shadow-sm text-slate-900"
      >
        {/* Official Kop Surat */}
        <KopSurat
          school={school}
          config={kopConfig}
          title={getReportTitle()}
          subtitle={`Tahun Pelajaran: 2025/2026 • Semester: Ganjil • Dicetak pada: ${new Date().toLocaleDateString(
            'id-ID',
            { day: 'numeric', month: 'long', year: 'numeric' }
          )}`}
        />

        {/* Report Content based on selected type */}
        <div className="mt-6 space-y-6 text-xs">
          {/* 1. SELURUH GURU / 3. PEGAWAI / 8. REKAP */}
          {(reportType === 'seluruh_guru' ||
            reportType === 'administrasi_pegawai' ||
            reportType === 'rekap_persentase') && (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse border border-slate-300">
                <thead>
                  <tr className="bg-slate-100 text-slate-800 font-bold border-b border-slate-300">
                    <th className="border border-slate-300 p-2.5 text-center w-10">No</th>
                    <th className="border border-slate-300 p-2.5">Nama Guru / Pegawai</th>
                    <th className="border border-slate-300 p-2.5">NIP/NUPTK</th>
                    <th className="border border-slate-300 p-2.5">Jabatan</th>
                    <th className="border border-slate-300 p-2.5 text-center">Wajib</th>
                    <th className="border border-slate-300 p-2.5 text-center">Lengkap</th>
                    <th className="border border-slate-300 p-2.5 text-center">Menunggu</th>
                    <th className="border border-slate-300 p-2.5 text-center">Perlu Revisi</th>
                    <th className="border border-slate-300 p-2.5 text-center">Persentase</th>
                  </tr>
                </thead>
                <tbody>
                  {progressList.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="text-center p-6 text-slate-400">
                        Belum ada data guru/pegawai terdaftar.
                      </td>
                    </tr>
                  ) : (
                    progressList
                      .filter((p) => {
                        if (reportType === 'administrasi_pegawai') return p.teacher.is_staff;
                        if (reportType === 'seluruh_guru') return !p.teacher.is_staff;
                        return true;
                      })
                      .map((p, idx) => (
                        <tr key={p.teacher.id} className="border-b border-slate-200">
                          <td className="border border-slate-300 p-2.5 text-center font-semibold">
                            {idx + 1}
                          </td>
                          <td className="border border-slate-300 p-2.5 font-bold">
                            {p.teacher.name}
                          </td>
                          <td className="border border-slate-300 p-2.5 font-mono">
                            {p.teacher.nip_nuptk || '-'}
                          </td>
                          <td className="border border-slate-300 p-2.5">{p.teacher.position}</td>
                          <td className="border border-slate-300 p-2.5 text-center font-bold">
                            {p.total_mandatory}
                          </td>
                          <td className="border border-slate-300 p-2.5 text-center font-bold text-emerald-800">
                            {p.mandatory_complete}
                          </td>
                          <td className="border border-slate-300 p-2.5 text-center text-amber-800">
                            {p.status_counts.menunggu_pemeriksaan}
                          </td>
                          <td className="border border-slate-300 p-2.5 text-center text-orange-800">
                            {p.status_counts.perlu_perbaikan}
                          </td>
                          <td className="border border-slate-300 p-2.5 text-center font-extrabold text-blue-900">
                            {p.percentage}%
                          </td>
                        </tr>
                      ))
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* 2. LAPORAN PER GURU */}
          {reportType === 'per_guru' && (
            <div>
              {(() => {
                const teacher = allTeachers.find((t) => t.id === selectedTeacherId);
                const teacherDocs = allDocs.filter((d) => d.teacher_id === selectedTeacherId);
                const teacherProg = teacher ? storageService.calculateTeacherProgress(teacher.id) : null;

                if (!teacher) {
                  return (
                    <div className="p-8 text-center text-slate-400">
                      Silakan pilih guru pada dropdown di atas.
                    </div>
                  );
                }

                return (
                  <div className="space-y-4">
                    {/* Bio Box */}
                    <div className="border border-slate-300 p-4 rounded-xl bg-slate-50 grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <div>
                        <span className="text-slate-500 font-semibold block text-[10px]">Nama:</span>
                        <strong className="text-slate-900">{teacher.name}</strong>
                      </div>
                      <div>
                        <span className="text-slate-500 font-semibold block text-[10px]">NIP/NUPTK:</span>
                        <strong className="text-slate-900 font-mono">{teacher.nip_nuptk || '-'}</strong>
                      </div>
                      <div>
                        <span className="text-slate-500 font-semibold block text-[10px]">Jabatan:</span>
                        <strong className="text-slate-900">{teacher.position}</strong>
                      </div>
                      <div>
                        <span className="text-slate-500 font-semibold block text-[10px]">Kelengkapan:</span>
                        <strong className="text-blue-700 text-sm">{teacherProg?.percentage || 0}%</strong>
                      </div>
                    </div>

                    {/* Table */}
                    <table className="w-full text-left border-collapse border border-slate-300">
                      <thead>
                        <tr className="bg-slate-100 font-bold">
                          <th className="border border-slate-300 p-2 text-center w-10">No</th>
                          <th className="border border-slate-300 p-2">Kategori</th>
                          <th className="border border-slate-300 p-2">Nama Dokumen</th>
                          <th className="border border-slate-300 p-2 text-center">Sifat</th>
                          <th className="border border-slate-300 p-2 text-center">Status</th>
                          <th className="border border-slate-300 p-2">File Terlampir</th>
                        </tr>
                      </thead>
                      <tbody>
                        {requirements
                          .filter((r) => {
                            if (teacher.is_staff) return r.target_role === 'PEGAWAI' || r.target_role === 'SEMUA';
                            return r.target_role === 'GURU' || r.target_role === 'SEMUA';
                          })
                          .map((req, idx) => {
                            const doc = teacherDocs.find((d) => d.document_requirement_id === req.id);
                            const cat = categories.find((c) => c.id === req.category_id);
                            return (
                              <tr key={req.id}>
                                <td className="border border-slate-300 p-2 text-center">{idx + 1}</td>
                                <td className="border border-slate-300 p-2 text-slate-600">{cat?.name}</td>
                                <td className="border border-slate-300 p-2 font-semibold">{req.name}</td>
                                <td className="border border-slate-300 p-2 text-center">
                                  {req.is_mandatory ? 'WAJIB' : 'OPSIONAL'}
                                </td>
                                <td className="border border-slate-300 p-2 text-center font-bold">
                                  {doc?.status || 'BELUM_DIUNGGAH'}
                                </td>
                                <td className="border border-slate-300 p-2 text-slate-600 font-mono text-[11px]">
                                  {doc?.file_name || '-'}
                                </td>
                              </tr>
                            );
                          })}
                      </tbody>
                    </table>
                  </div>
                );
              })()}
            </div>
          )}

          {/* 4. PER KATEGORI */}
          {reportType === 'per_kategori' && (
            <div className="space-y-4">
              <table className="w-full text-left border-collapse border border-slate-300">
                <thead>
                  <tr className="bg-slate-100 font-bold">
                    <th className="border border-slate-300 p-2 text-center w-10">No</th>
                    <th className="border border-slate-300 p-2">Nama Dokumen</th>
                    <th className="border border-slate-300 p-2 text-center">Sifat</th>
                    <th className="border border-slate-300 p-2 text-center">Total Guru Terkait</th>
                    <th className="border border-slate-300 p-2 text-center">Lengkap</th>
                    <th className="border border-slate-300 p-2 text-center">Belum Diunggah</th>
                  </tr>
                </thead>
                <tbody>
                  {requirements
                    .filter((r) => r.category_id === selectedCategoryId)
                    .map((req, idx) => {
                      const relevantDocs = allDocs.filter(
                        (d) => d.document_requirement_id === req.id
                      );
                      const lengkapCount = relevantDocs.filter((d) => d.status === 'LENGKAP').length;
                      return (
                        <tr key={req.id}>
                          <td className="border border-slate-300 p-2 text-center">{idx + 1}</td>
                          <td className="border border-slate-300 p-2 font-bold">{req.name}</td>
                          <td className="border border-slate-300 p-2 text-center">
                            {req.is_mandatory ? 'WAJIB' : 'OPSIONAL'}
                          </td>
                          <td className="border border-slate-300 p-2 text-center">{allTeachers.length}</td>
                          <td className="border border-slate-300 p-2 text-center font-bold text-emerald-700">
                            {lengkapCount}
                          </td>
                          <td className="border border-slate-300 p-2 text-center text-slate-600">
                            {Math.max(0, allTeachers.length - relevantDocs.length)}
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          )}

          {/* 5, 6, 7. STATUS LISTS */}
          {(reportType === 'belum_diunggah' ||
            reportType === 'menunggu_pemeriksaan' ||
            reportType === 'perlu_perbaikan') && (
            <table className="w-full text-left border-collapse border border-slate-300">
              <thead>
                <tr className="bg-slate-100 font-bold">
                  <th className="border border-slate-300 p-2 text-center w-10">No</th>
                  <th className="border border-slate-300 p-2">Nama Guru / Pegawai</th>
                  <th className="border border-slate-300 p-2">Jabatan</th>
                  <th className="border border-slate-300 p-2">Nama Dokumen</th>
                  <th className="border border-slate-300 p-2 text-center">Status</th>
                  <th className="border border-slate-300 p-2">Catatan Pemeriksa</th>
                </tr>
              </thead>
              <tbody>
                {allDocs
                  .filter((d) => {
                    if (reportType === 'menunggu_pemeriksaan') return d.status === 'MENUNGGU_PEMERIKSAAN';
                    if (reportType === 'perlu_perbaikan') return d.status === 'PERLU_PERBAIKAN';
                    return true;
                  })
                  .map((doc, idx) => {
                    const teacher = storageService.getTeacherById(doc.teacher_id);
                    const req = requirements.find((r) => r.id === doc.document_requirement_id);
                    const docReview = reviews.find((r) => r.document_id === doc.id);
                    return (
                      <tr key={doc.id}>
                        <td className="border border-slate-300 p-2 text-center">{idx + 1}</td>
                        <td className="border border-slate-300 p-2 font-bold">{teacher?.name}</td>
                        <td className="border border-slate-300 p-2">{teacher?.position}</td>
                        <td className="border border-slate-300 p-2">{req?.name || doc.file_name}</td>
                        <td className="border border-slate-300 p-2 text-center font-bold">{doc.status}</td>
                        <td className="border border-slate-300 p-2 italic text-slate-600">
                          {docReview?.notes || '-'}
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          )}

          {/* 9. RIWAYAT PEMERIKSAAN */}
          {reportType === 'riwayat_pemeriksaan' && (
            <table className="w-full text-left border-collapse border border-slate-300">
              <thead>
                <tr className="bg-slate-100 font-bold">
                  <th className="border border-slate-300 p-2 text-center w-10">No</th>
                  <th className="border border-slate-300 p-2">Tanggal Pemeriksaan</th>
                  <th className="border border-slate-300 p-2">Guru/Pegawai</th>
                  <th className="border border-slate-300 p-2">Nama Dokumen</th>
                  <th className="border border-slate-300 p-2 text-center">Hasil</th>
                  <th className="border border-slate-300 p-2">Catatan Kepala Sekolah</th>
                </tr>
              </thead>
              <tbody>
                {reviews.map((rev, idx) => {
                  const doc = allDocs.find((d) => d.id === rev.document_id);
                  const teacher = doc ? storageService.getTeacherById(doc.teacher_id) : null;
                  const req = doc ? requirements.find((r) => r.id === doc.document_requirement_id) : null;
                  return (
                    <tr key={rev.id}>
                      <td className="border border-slate-300 p-2 text-center">{idx + 1}</td>
                      <td className="border border-slate-300 p-2 whitespace-nowrap">
                        {new Date(rev.reviewed_at).toLocaleDateString('id-ID')}
                      </td>
                      <td className="border border-slate-300 p-2 font-bold">{teacher?.name || '-'}</td>
                      <td className="border border-slate-300 p-2">{req?.name || '-'}</td>
                      <td className="border border-slate-300 p-2 text-center font-bold">
                        {rev.status}
                      </td>
                      <td className="border border-slate-300 p-2 italic">{rev.notes || '-'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Official Signature Section */}
        <div className="mt-12 pt-6 border-t border-slate-200 flex justify-between items-start text-xs">
          <div className="text-slate-500">
            <p>Dicetak secara otomatis oleh:</p>
            <p className="font-semibold text-slate-700">Sistem Pemantauan Administrasi Guru & Pegawai</p>
            <p className="text-[10px]">{school.name}</p>
          </div>

          <div className="text-center min-w-[220px]">
            <p className="text-slate-700">Palopo, {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
            <p className="font-semibold text-slate-800 mt-0.5">Mengetahui,</p>
            <p className="font-bold text-slate-900">Kepala Sekolah TKIT Mutiara Islam</p>

            {/* Signature space */}
            <div className="h-20 flex items-center justify-center">
              <span className="text-slate-300 italic text-[11px]">[Tanda Tangan & Cap Sekolah]</span>
            </div>

            <p className="font-black text-slate-950 underline text-sm">{school.principal_name}</p>
            <p className="text-slate-600 font-mono text-[11px]">NIP: {school.principal_nip || '-'}</p>
          </div>
        </div>
      </div>

      {/* MODAL: Pengaturan Kop Surat Laporan */}
      {kopModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-xs p-4 overflow-y-auto animate-in fade-in no-print">
          <div className="bg-white rounded-3xl shadow-2xl max-w-3xl w-full my-8 overflow-hidden border border-slate-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white">
              <div className="flex items-center gap-2">
                <Settings className="w-5 h-5 text-blue-400" />
                <h3 className="text-base font-bold">Pengaturan Kop Surat Laporan</h3>
              </div>
              <button
                type="button"
                onClick={() => setKopModalOpen(false)}
                className="p-1 text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveKopSurat} className="p-6 space-y-6 max-h-[80vh] overflow-y-auto text-xs">
              {/* 1. Live Preview Section */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-700 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-blue-600" />
                    Pratinjau Langsung Kop Surat (Live Preview)
                  </span>
                  <span className="text-[10px] text-slate-400 italic">
                    Tampilan saat dicetak atau di-download PDF
                  </span>
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
                  <KopSurat
                    school={school}
                    config={kopForm}
                    title="CONTOH JUDUL LAPORAN RESMI"
                    subtitle="Tahun Pelajaran: 2025/2026 • Semester: Ganjil"
                  />
                </div>
              </div>

              {/* 2. Logo Kiri & Logo / Lambang Kanan */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Logo Sekolah (Kiri) */}
                <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="block font-bold text-slate-800">
                      1. Logo Sekolah (Sisi Kiri)
                    </label>
                    {kopForm.logo_url && (
                      <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold">
                        Gambar Terpasang
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-16 h-16 shrink-0 rounded-xl bg-white border border-slate-300 flex items-center justify-center overflow-hidden p-1 shadow-2xs">
                      {kopForm.logo_url ? (
                        <img src={kopForm.logo_url} alt="Logo Sekolah" className="max-h-14 max-w-14 object-contain" />
                      ) : (
                        <Image className="w-6 h-6 text-slate-300" />
                      )}
                    </div>
                    <div className="space-y-1.5 flex-1">
                      <input
                        ref={leftLogoInputRef}
                        type="file"
                        accept="image/png,image/jpeg,image/jpg,image/webp"
                        onChange={(e) => handleUploadLogo(e, 'logo_url')}
                        style={{ display: 'none' }}
                      />
                      <button
                        type="button"
                        onClick={() => leftLogoInputRef.current?.click()}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold cursor-pointer shadow-xs transition-colors"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>{kopForm.logo_url ? 'Ganti Logo Sekolah' : 'Upload File Logo'}</span>
                      </button>

                      {kopForm.logo_url && (
                        <button
                          type="button"
                          onClick={() => setKopForm((prev) => ({ ...prev, logo_url: '' }))}
                          className="block text-[11px] text-rose-600 hover:text-rose-700 font-semibold cursor-pointer mt-1"
                        >
                          Hapus Logo
                        </button>
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Atau Masukkan URL Logo (Opsional):
                    </label>
                    <input
                      type="text"
                      value={kopForm.logo_url}
                      onChange={(e) => setKopForm((prev) => ({ ...prev, logo_url: e.target.value }))}
                      placeholder="https://..."
                      className="w-full text-xs bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-800 focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
                    />
                  </div>
                </div>

                {/* Logo / Lambang Daerah & Teks (Kanan) */}
                <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="block font-bold text-slate-800">
                      2. Foto / Logo Lambang Provinsi / Daerah (Sisi Kanan)
                    </label>
                    {kopForm.right_logo_url && (
                      <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold">
                        Gambar Terpasang
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-16 h-16 shrink-0 rounded-xl bg-white border border-slate-300 flex items-center justify-center overflow-hidden p-1 text-center shadow-2xs">
                      {kopForm.right_logo_url ? (
                        <img src={kopForm.right_logo_url} alt="Logo Daerah" className="max-h-14 max-w-14 object-contain" />
                      ) : (
                        <div className="text-[9px] font-bold text-slate-500 leading-tight">
                          {kopForm.right_text_top || 'PALOPO'}
                        </div>
                      )}
                    </div>
                    <div className="space-y-1.5 flex-1">
                      <input
                        ref={rightLogoInputRef}
                        type="file"
                        accept="image/png,image/jpeg,image/jpg,image/webp"
                        onChange={(e) => handleUploadLogo(e, 'right_logo_url')}
                        style={{ display: 'none' }}
                      />
                      <button
                        type="button"
                        onClick={() => rightLogoInputRef.current?.click()}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold cursor-pointer shadow-xs transition-colors"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>{kopForm.right_logo_url ? 'Ganti Foto / Logo Provinsi' : 'Upload Foto / Logo Provinsi'}</span>
                      </button>

                      {kopForm.right_logo_url && (
                        <button
                          type="button"
                          onClick={() => setKopForm((prev) => ({ ...prev, right_logo_url: '' }))}
                          className="block text-[11px] text-rose-600 hover:text-rose-700 font-semibold cursor-pointer mt-1"
                        >
                          Hapus Foto / Logo Provinsi
                        </button>
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Atau Masukkan URL Logo Provinsi (Opsional):
                    </label>
                    <input
                      type="text"
                      value={kopForm.right_logo_url}
                      onChange={(e) => setKopForm((prev) => ({ ...prev, right_logo_url: e.target.value }))}
                      placeholder="https://... atau data URL"
                      className="w-full text-xs bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-800 focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        Teks Kanan Atas:
                      </label>
                      <input
                        type="text"
                        value={kopForm.right_text_top}
                        onChange={(e) => setKopForm((prev) => ({ ...prev, right_text_top: e.target.value }))}
                        placeholder="KOTA PALOPO"
                        className="w-full text-xs bg-white border border-slate-300 rounded-xl px-3 py-2 font-bold text-slate-800 focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        Teks Kanan Bawah:
                      </label>
                      <input
                        type="text"
                        value={kopForm.right_text_bottom}
                        onChange={(e) => setKopForm((prev) => ({ ...prev, right_text_bottom: e.target.value }))}
                        placeholder="SUL-SEL"
                        className="w-full text-xs bg-white border border-slate-300 rounded-xl px-3 py-2 font-bold text-slate-800 focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* 3. Teks Informasi Sekolah & Yayasan */}
              <div className="space-y-3">
                <h4 className="font-bold text-slate-900 border-b border-slate-200 pb-1">
                  3. Informasi Identitas Sekolah & Yayasan
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Nama Yayasan / Header Atas:
                    </label>
                    <input
                      type="text"
                      required
                      value={kopForm.foundation_name}
                      onChange={(e) => setKopForm((prev) => ({ ...prev, foundation_name: e.target.value }))}
                      placeholder="YAYASAN MUTIARA ISLAM PALOPO"
                      className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 font-semibold text-slate-800 focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Nama Satuan Sekolah / Lembaga:
                    </label>
                    <input
                      type="text"
                      required
                      value={kopForm.school_name}
                      onChange={(e) => setKopForm((prev) => ({ ...prev, school_name: e.target.value }))}
                      placeholder="TKIT MUTIARA ISLAM PALOPO"
                      className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 font-bold text-slate-800 focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Alamat Lengkap Sekolah:
                  </label>
                  <input
                    type="text"
                    required
                    value={kopForm.address}
                    onChange={(e) => setKopForm((prev) => ({ ...prev, address: e.target.value }))}
                    placeholder="Jl. K.H. Ahmad Dahlan No. 12, Wara, Kota Palopo, Sulawesi Selatan"
                    className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-800 focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
                  />
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">NPSN:</label>
                    <input
                      type="text"
                      value={kopForm.npsn}
                      onChange={(e) => setKopForm((prev) => ({ ...prev, npsn: e.target.value }))}
                      placeholder="69978120"
                      className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 font-mono text-slate-800 focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">No. Telepon:</label>
                    <input
                      type="text"
                      value={kopForm.phone}
                      onChange={(e) => setKopForm((prev) => ({ ...prev, phone: e.target.value }))}
                      placeholder="(0471) 3201882"
                      className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-800 focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Email:</label>
                    <input
                      type="email"
                      value={kopForm.email}
                      onChange={(e) => setKopForm((prev) => ({ ...prev, email: e.target.value }))}
                      placeholder="tkitmutiaraislampalopo@gmail.com"
                      className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-800 focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Website:</label>
                    <input
                      type="text"
                      value={kopForm.website}
                      onChange={(e) => setKopForm((prev) => ({ ...prev, website: e.target.value }))}
                      placeholder="https://tkitmutiaraislam.sch.id"
                      className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-800 focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={handleResetKopSurat}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer w-fit"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Kembalikan Default</span>
                </button>

                <div className="flex items-center gap-2 justify-end">
                  <button
                    type="button"
                    onClick={() => setKopModalOpen(false)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs transition-colors cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs shadow-md shadow-blue-600/30 flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Simpan Pengaturan Kop Surat</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
