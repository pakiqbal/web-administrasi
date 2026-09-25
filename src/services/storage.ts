import {
  School,
  SchoolYear,
  Semester,
  DocumentCategory,
  DocumentRequirement,
  User,
  UserRole,
  Teacher,
  TeacherDocument,
  DocumentReview,
  NotificationItem,
  ActivityLog,
  TeacherProgress,
  KopSuratConfig,
} from '../types';

const STORAGE_KEYS = {
  SCHOOL: 'tkit_school',
  KOP_SURAT: 'tkit_kop_surat',
  SCHOOL_YEARS: 'tkit_school_years',
  SEMESTERS: 'tkit_semesters',
  CATEGORIES: 'tkit_categories',
  REQUIREMENTS: 'tkit_requirements',
  USERS: 'tkit_users',
  TEACHERS: 'tkit_teachers',
  DOCUMENTS: 'tkit_teacher_documents',
  REVIEWS: 'tkit_document_reviews',
  NOTIFICATIONS: 'tkit_notifications',
  LOGS: 'tkit_activity_logs',
  INITIALIZED: 'tkit_initialized_v2',
};

// Default School Profile
const DEFAULT_SCHOOL: School = {
  id: 'sch_tkit_01',
  name: 'TKIT MUTIARA ISLAM PALOPO',
  principal_name: 'Sitti Hidayati, S.Pd',
  principal_nip: '19790615 200801 2 018',
  npsn: '69978120',
  address: 'Jl. K.H. Ahmad Dahlan No. 12, Wara, Kota Palopo, Sulawesi Selatan',
  phone: '(0471) 3201882 / 0812-4211-9876',
  email: 'tkitmutiaraislampalopo@gmail.com',
  website: 'https://tkitmutiaraislam.sch.id',
  logo_url: '',
  max_file_size_mb: 15,
  current_school_year_id: 'sy_2025_2026',
  current_semester_id: 'sem_ganjil',
};

const DEFAULT_SCHOOL_YEARS: SchoolYear[] = [
  { id: 'sy_2025_2026', name: '2025/2026', is_active: true },
  { id: 'sy_2024_2025', name: '2024/2025', is_active: false },
];

const DEFAULT_SEMESTERS: Semester[] = [
  { id: 'sem_ganjil', name: 'Semester Ganjil', is_active: true },
  { id: 'sem_genap', name: 'Semester Genap', is_active: false },
];

// Default Categories
const DEFAULT_CATEGORIES: DocumentCategory[] = [
  { id: 'cat_perencanaan', name: 'PERENCANAAN PEMBELAJARAN', description: 'Perangkat dan dokumen perencanaan ajar', order: 1, is_active: true },
  { id: 'cat_pelaksanaan', name: 'PELAKSANAAN PEMBELAJARAN', description: 'Dokumentasi dan jurnal proses belajar mengajar', order: 2, is_active: true },
  { id: 'cat_asesmen', name: 'ASESMEN/PENILAIAN', description: 'Instrumen, rubrik, dan evaluasi tumbuh kembang peserta didik', order: 3, is_active: true },
  { id: 'cat_wali_kelas', name: 'ADMINISTRASI WALI KELAS', description: 'Kelengkapan administrasi pengelolaan kelas / kelompok belajar', order: 4, is_active: true },
  { id: 'cat_tugas_tambahan', name: 'TUGAS TAMBAHAN', description: 'Surat keputusan dan laporan tugas amanah sekolah', order: 5, is_active: true },
  { id: 'cat_pengembangan', name: 'PENGEMBANGAN PROFESIONAL', description: 'Sertifikat pelatihan, workshop, webinar, dan karya inovasi', order: 6, is_active: true },
  { id: 'cat_pegawai', name: 'ADMINISTRASI PEGAWAI', description: 'Dokumen kepegawaian tata usaha dan staf kependidikan', order: 7, is_active: true },
  { id: 'cat_khusus_tk', name: 'ADMINISTRASI KHUSUS TK/PAUD', description: 'Administrasi khas pembelajaran anak usia dini dan sentra bermain', order: 8, is_active: true },
];

// Default Requirements (Per prompt: can be marked WAJIB or TIDAK WAJIB)
const DEFAULT_REQUIREMENTS: DocumentRequirement[] = [
  // 1. PERENCANAAN PEMBELAJARAN
  { id: 'req_1_01', category_id: 'cat_perencanaan', name: 'Kalender Pendidikan', is_mandatory: true, target_role: 'GURU', is_active: true, order: 1 },
  { id: 'req_1_02', category_id: 'cat_perencanaan', name: 'Program Tahunan (Prota)', is_mandatory: true, target_role: 'GURU', is_active: true, order: 2 },
  { id: 'req_1_03', category_id: 'cat_perencanaan', name: 'Program Semester (Promes)', is_mandatory: true, target_role: 'GURU', is_active: true, order: 3 },
  { id: 'req_1_04', category_id: 'cat_perencanaan', name: 'Capaian Pembelajaran (CP)', is_mandatory: true, target_role: 'GURU', is_active: true, order: 4 },
  { id: 'req_1_05', category_id: 'cat_perencanaan', name: 'Tujuan Pembelajaran (TP)', is_mandatory: true, target_role: 'GURU', is_active: true, order: 5 },
  { id: 'req_1_06', category_id: 'cat_perencanaan', name: 'Alur Tujuan Pembelajaran (ATP)', is_mandatory: true, target_role: 'GURU', is_active: true, order: 6 },
  { id: 'req_1_07', category_id: 'cat_perencanaan', name: 'Modul Ajar / RPPH / RPPM', is_mandatory: true, target_role: 'GURU', is_active: true, order: 7 },
  { id: 'req_1_08', category_id: 'cat_perencanaan', name: 'Perencanaan Asesmen', is_mandatory: true, target_role: 'GURU', is_active: true, order: 8 },
  { id: 'req_1_09', category_id: 'cat_perencanaan', name: 'Jadwal Mengajar', is_mandatory: true, target_role: 'GURU', is_active: true, order: 9 },
  { id: 'req_1_10', category_id: 'cat_perencanaan', name: 'Pembagian Tugas Mengajar', is_mandatory: false, target_role: 'GURU', is_active: true, order: 10 },

  // 2. PELAKSANAAN PEMBELAJARAN
  { id: 'req_2_01', category_id: 'cat_pelaksanaan', name: 'Jurnal Mengajar Harian', is_mandatory: true, target_role: 'GURU', is_active: true, order: 1 },
  { id: 'req_2_02', category_id: 'cat_pelaksanaan', name: 'Daftar Hadir Peserta Didik', is_mandatory: true, target_role: 'GURU', is_active: true, order: 2 },
  { id: 'req_2_03', category_id: 'cat_pelaksanaan', name: 'Catatan Pelaksanaan Pembelajaran', is_mandatory: false, target_role: 'GURU', is_active: true, order: 3 },
  { id: 'req_2_04', category_id: 'cat_pelaksanaan', name: 'Media Pembelajaran / APE', is_mandatory: true, target_role: 'GURU', is_active: true, order: 4 },
  { id: 'req_2_05', category_id: 'cat_pelaksanaan', name: 'Bahan Ajar / Lembar Kerja Anak', is_mandatory: true, target_role: 'GURU', is_active: true, order: 5 },
  { id: 'req_2_06', category_id: 'cat_pelaksanaan', name: 'Dokumentasi Kegiatan Pembelajaran', is_mandatory: true, target_role: 'GURU', is_active: true, order: 6 },

  // 3. ASESMEN/PENILAIAN
  { id: 'req_3_01', category_id: 'cat_asesmen', name: 'Perencanaan Asesmen Awal / Diagnostik', is_mandatory: true, target_role: 'GURU', is_active: true, order: 1 },
  { id: 'req_3_02', category_id: 'cat_asesmen', name: 'Instrumen Penilaian Checklist / Catatan Anekdot', is_mandatory: true, target_role: 'GURU', is_active: true, order: 2 },
  { id: 'req_3_03', category_id: 'cat_asesmen', name: 'Kisi-kisi Asesmen', is_mandatory: false, target_role: 'GURU', is_active: true, order: 3 },
  { id: 'req_3_04', category_id: 'cat_asesmen', name: 'Soal / Lembar Evaluasi', is_mandatory: false, target_role: 'GURU', is_active: true, order: 4 },
  { id: 'req_3_05', category_id: 'cat_asesmen', name: 'Rubrik Penilaian Hasil Karya', is_mandatory: true, target_role: 'GURU', is_active: true, order: 5 },
  { id: 'req_3_06', category_id: 'cat_asesmen', name: 'Daftar Nilai / Rekap Capaian', is_mandatory: true, target_role: 'GURU', is_active: true, order: 6 },
  { id: 'req_3_07', category_id: 'cat_asesmen', name: 'Rekap Hasil Penilaian', is_mandatory: true, target_role: 'GURU', is_active: true, order: 7 },
  { id: 'req_3_08', category_id: 'cat_asesmen', name: 'Analisis Hasil Asesmen', is_mandatory: false, target_role: 'GURU', is_active: true, order: 8 },
  { id: 'req_3_09', category_id: 'cat_asesmen', name: 'Program Remedial / Pendampingan', is_mandatory: false, target_role: 'GURU', is_active: true, order: 9 },
  { id: 'req_3_10', category_id: 'cat_asesmen', name: 'Program Pengayaan', is_mandatory: false, target_role: 'GURU', is_active: true, order: 10 },
  { id: 'req_3_11', category_id: 'cat_asesmen', name: 'Laporan Perkembangan Peserta Didik (Raport)', is_mandatory: true, target_role: 'GURU', is_active: true, order: 11 },

  // 4. ADMINISTRASI WALI KELAS
  { id: 'req_4_01', category_id: 'cat_wali_kelas', name: 'Data Peserta Didik (Buku Induk Kelas)', is_mandatory: true, target_role: 'GURU', is_active: true, order: 1 },
  { id: 'req_4_02', category_id: 'cat_wali_kelas', name: 'Daftar Hadir Bulanan', is_mandatory: true, target_role: 'GURU', is_active: true, order: 2 },
  { id: 'req_4_03', category_id: 'cat_wali_kelas', name: 'Catatan Perkembangan Peserta Didik', is_mandatory: true, target_role: 'GURU', is_active: true, order: 3 },
  { id: 'req_4_04', category_id: 'cat_wali_kelas', name: 'Catatan Komunikasi Orang Tua (Buku Penghubung)', is_mandatory: true, target_role: 'GURU', is_active: true, order: 4 },
  { id: 'req_4_05', category_id: 'cat_wali_kelas', name: 'Data Prestasi & Minat Bakat Anak', is_mandatory: false, target_role: 'GURU', is_active: true, order: 5 },
  { id: 'req_4_06', category_id: 'cat_wali_kelas', name: 'Dokumentasi Kegiatan Kelas', is_mandatory: true, target_role: 'GURU', is_active: true, order: 6 },
  { id: 'req_4_07', category_id: 'cat_wali_kelas', name: 'Laporan Wali Kelas', is_mandatory: true, target_role: 'GURU', is_active: true, order: 7 },

  // 5. TUGAS TAMBAHAN
  { id: 'req_5_01', category_id: 'cat_tugas_tambahan', name: 'SK Tugas Tambahan', is_mandatory: false, target_role: 'SEMUA', is_active: true, order: 1 },
  { id: 'req_5_02', category_id: 'cat_tugas_tambahan', name: 'Program Kerja Tugas Tambahan', is_mandatory: false, target_role: 'SEMUA', is_active: true, order: 2 },
  { id: 'req_5_03', category_id: 'cat_tugas_tambahan', name: 'Jadwal Kegiatan Tugas Tambahan', is_mandatory: false, target_role: 'SEMUA', is_active: true, order: 3 },
  { id: 'req_5_04', category_id: 'cat_tugas_tambahan', name: 'Laporan Pelaksanaan Tugas', is_mandatory: false, target_role: 'SEMUA', is_active: true, order: 4 },
  { id: 'req_5_05', category_id: 'cat_tugas_tambahan', name: 'Dokumentasi Kegiatan Tugas Tambahan', is_mandatory: false, target_role: 'SEMUA', is_active: true, order: 5 },

  // 6. PENGEMBANGAN PROFESIONAL
  { id: 'req_6_01', category_id: 'cat_pengembangan', name: 'Sertifikat Pelatihan Kurikulum Merdeka / PAUD', is_mandatory: true, target_role: 'SEMUA', is_active: true, order: 1 },
  { id: 'req_6_02', category_id: 'cat_pengembangan', name: 'Sertifikat Workshop / Bimtek', is_mandatory: false, target_role: 'SEMUA', is_active: true, order: 2 },
  { id: 'req_6_03', category_id: 'cat_pengembangan', name: 'Sertifikat Seminar / Webinar', is_mandatory: false, target_role: 'SEMUA', is_active: true, order: 3 },
  { id: 'req_6_04', category_id: 'cat_pengembangan', name: 'Sertifikat KKG / IGTKI / HIMPAUDI', is_mandatory: true, target_role: 'GURU', is_active: true, order: 4 },
  { id: 'req_6_05', category_id: 'cat_pengembangan', name: 'Bukti Pengembangan Kompetensi Mandiri (PMM)', is_mandatory: false, target_role: 'GURU', is_active: true, order: 5 },
  { id: 'req_6_06', category_id: 'cat_pengembangan', name: 'Karya / Inovasi Pembelajaran PAUD', is_mandatory: false, target_role: 'GURU', is_active: true, order: 6 },

  // 7. ADMINISTRASI PEGAWAI
  { id: 'req_7_01', category_id: 'cat_pegawai', name: 'SK Pengangkatan Pegawai', is_mandatory: true, target_role: 'PEGAWAI', is_active: true, order: 1 },
  { id: 'req_7_02', category_id: 'cat_pegawai', name: 'Uraian Tugas (Job Description)', is_mandatory: true, target_role: 'PEGAWAI', is_active: true, order: 2 },
  { id: 'req_7_03', category_id: 'cat_pegawai', name: 'Program Kerja Staf / TU', is_mandatory: true, target_role: 'PEGAWAI', is_active: true, order: 3 },
  { id: 'req_7_04', category_id: 'cat_pegawai', name: 'Jurnal Kegiatan Pegawai Harian', is_mandatory: true, target_role: 'PEGAWAI', is_active: true, order: 4 },
  { id: 'req_7_05', category_id: 'cat_pegawai', name: 'Laporan Pelaksanaan Tugas Bulanan', is_mandatory: true, target_role: 'PEGAWAI', is_active: true, order: 5 },
  { id: 'req_7_06', category_id: 'cat_pegawai', name: 'Sertifikat Pelatihan Administrasi', is_mandatory: false, target_role: 'PEGAWAI', is_active: true, order: 6 },
  { id: 'req_7_07', category_id: 'cat_pegawai', name: 'Dokumen Pendukung Lainnya', is_mandatory: false, target_role: 'PEGAWAI', is_active: true, order: 7 },

  // 8. ADMINISTRASI KHUSUS TK/PAUD
  { id: 'req_8_01', category_id: 'cat_khusus_tk', name: 'Program Pembelajaran TK Terpadu Islam', is_mandatory: true, target_role: 'GURU', is_active: true, order: 1 },
  { id: 'req_8_02', category_id: 'cat_khusus_tk', name: 'Perencanaan Kegiatan Sentra Bermain', is_mandatory: true, target_role: 'GURU', is_active: true, order: 2 },
  { id: 'req_8_03', category_id: 'cat_khusus_tk', name: 'Catatan Perkembangan Anak (DDTK / Tumbuh Kembang)', is_mandatory: true, target_role: 'GURU', is_active: true, order: 3 },
  { id: 'req_8_04', category_id: 'cat_khusus_tk', name: 'Dokumentasi Foto Perkembangan Anak', is_mandatory: true, target_role: 'GURU', is_active: true, order: 4 },
  { id: 'req_8_05', category_id: 'cat_khusus_tk', name: 'Portofolio Karya Anak', is_mandatory: true, target_role: 'GURU', is_active: true, order: 5 },
  { id: 'req_8_06', category_id: 'cat_khusus_tk', name: 'Administrasi Kegiatan Makan Bersama & Parenting', is_mandatory: false, target_role: 'GURU', is_active: true, order: 6 },
];

// Initial Users: ONLY ADMIN AND KEPALA SEKOLAH (TEACHERS STRICTLY EMPTY!)
const DEFAULT_USERS: User[] = [
  {
    id: 'user_admin',
    username: 'admin',
    password: 'admin123',
    role: 'ADMIN',
    name: 'Administrator Sekolah',
    email: 'admin@tkitmutiaraislam.sch.id',
    created_at: new Date().toISOString(),
  },
  {
    id: 'user_kepsek',
    username: 'kepsek',
    password: 'kepsek123',
    role: 'KEPALA_SEKOLAH',
    name: 'Sitti Hidayati, S.Pd',
    email: 'hidayati@tkitmutiaraislam.sch.id',
    created_at: new Date().toISOString(),
  },
];

export const storageService = {
  initialize() {
    if (!localStorage.getItem(STORAGE_KEYS.INITIALIZED)) {
      localStorage.setItem(STORAGE_KEYS.SCHOOL, JSON.stringify(DEFAULT_SCHOOL));
      localStorage.setItem(STORAGE_KEYS.SCHOOL_YEARS, JSON.stringify(DEFAULT_SCHOOL_YEARS));
      localStorage.setItem(STORAGE_KEYS.SEMESTERS, JSON.stringify(DEFAULT_SEMESTERS));
      localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(DEFAULT_CATEGORIES));
      localStorage.setItem(STORAGE_KEYS.REQUIREMENTS, JSON.stringify(DEFAULT_REQUIREMENTS));
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(DEFAULT_USERS));
      
      // CRITICAL REQUIREMENT:
      // JUMLAH GURU/PEGAWAI AWAL HARUS KOSONG!
      // Admin will add teachers and staff manually.
      localStorage.setItem(STORAGE_KEYS.TEACHERS, JSON.stringify([]));
      localStorage.setItem(STORAGE_KEYS.DOCUMENTS, JSON.stringify([]));
      localStorage.setItem(STORAGE_KEYS.REVIEWS, JSON.stringify([]));
      localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify([
        {
          id: 'notif_welcome_admin',
          user_id: 'user_admin',
          title: 'Selamat Datang di Sistem Pemantauan Administrasi',
          message: 'Instalasi sistem berhasil untuk TKIT Mutiara Islam Palopo. Silakan masukkan data Guru dan Pegawai pada menu Data Guru/Pegawai.',
          type: 'info',
          is_read: false,
          created_at: new Date().toISOString(),
        },
        {
          id: 'notif_welcome_kepsek',
          user_id: 'user_kepsek',
          title: 'Selamat Datang Kepala Sekolah',
          message: 'Sistem Pemantauan Administrasi Guru & Pegawai siap digunakan. Menunggu penambahan guru/pegawai dari Administrator.',
          type: 'info',
          is_read: false,
          created_at: new Date().toISOString(),
        },
      ]));
      localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify([
        {
          id: 'log_init',
          user_id: 'user_admin',
          user_name: 'Administrator',
          action: 'SISTEM_DIINSTAL',
          details: 'Sistem Administrasi TKIT Mutiara Islam Palopo berhasil diinisialisasi. Data guru/pegawai kosong.',
          timestamp: new Date().toISOString(),
        }
      ]));

      localStorage.setItem(STORAGE_KEYS.INITIALIZED, 'true');
    }
  },

  // Reset database back to clean empty slate
  resetDatabase(keepEmptyTeachers: boolean = true) {
    localStorage.removeItem(STORAGE_KEYS.INITIALIZED);
    localStorage.removeItem(STORAGE_KEYS.SCHOOL);
    localStorage.removeItem(STORAGE_KEYS.SCHOOL_YEARS);
    localStorage.removeItem(STORAGE_KEYS.SEMESTERS);
    localStorage.removeItem(STORAGE_KEYS.CATEGORIES);
    localStorage.removeItem(STORAGE_KEYS.REQUIREMENTS);
    localStorage.removeItem(STORAGE_KEYS.USERS);
    localStorage.removeItem(STORAGE_KEYS.TEACHERS);
    localStorage.removeItem(STORAGE_KEYS.DOCUMENTS);
    localStorage.removeItem(STORAGE_KEYS.REVIEWS);
    localStorage.removeItem(STORAGE_KEYS.NOTIFICATIONS);
    localStorage.removeItem(STORAGE_KEYS.LOGS);
    this.initialize();
  },

  // School
  getSchool(): School {
    this.initialize();
    const data = localStorage.getItem(STORAGE_KEYS.SCHOOL);
    return data ? JSON.parse(data) : DEFAULT_SCHOOL;
  },

  updateSchool(school: School) {
    localStorage.setItem(STORAGE_KEYS.SCHOOL, JSON.stringify(school));
    this.addLog('SYSTEM', 'Admin', 'UPDATE_SEKOLAH', 'Data profil sekolah diperbarui');
  },

  updateSchoolInfo(school: School) {
    this.updateSchool(school);
  },

  // Kop Surat Configuration
  getKopSuratConfig(): KopSuratConfig {
    this.initialize();
    const school = this.getSchool();
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
    const data = localStorage.getItem(STORAGE_KEYS.KOP_SURAT);
    if (!data) return defaults;
    try {
      return { ...defaults, ...JSON.parse(data) };
    } catch {
      return defaults;
    }
  },

  updateKopSuratConfig(config: KopSuratConfig) {
    localStorage.setItem(STORAGE_KEYS.KOP_SURAT, JSON.stringify(config));
    // Also sync standard fields to school object
    const school = this.getSchool();
    if (config.school_name) school.name = config.school_name;
    if (config.address) school.address = config.address;
    if (config.npsn) school.npsn = config.npsn;
    if (config.phone) school.phone = config.phone;
    if (config.email) school.email = config.email;
    if (config.website) school.website = config.website;
    if (config.logo_url !== undefined) school.logo_url = config.logo_url;
    this.updateSchool(school);
    this.addLog('ADMIN', 'Administrator', 'UPDATE_KOP_SURAT', 'Pengaturan Kop Surat laporan diperbarui');
  },

  // School Years & Semesters
  getSchoolYears(): SchoolYear[] {
    this.initialize();
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.SCHOOL_YEARS) || '[]');
  },

  saveSchoolYears(years: SchoolYear[]) {
    localStorage.setItem(STORAGE_KEYS.SCHOOL_YEARS, JSON.stringify(years));
  },

  setActiveSchoolYear(yearId: string) {
    const years = this.getSchoolYears().map(y => ({ ...y, is_active: y.id === yearId }));
    this.saveSchoolYears(years);
    const school = this.getSchool();
    school.current_school_year_id = yearId;
    this.updateSchool(school);
  },

  createSchoolYear(data: { name: string; start_date?: string; end_date?: string; is_active?: boolean }): SchoolYear {
    const years = this.getSchoolYears();
    const newYear: SchoolYear = {
      id: 'sy_' + Date.now(),
      name: data.name,
      is_active: data.is_active || false,
    };
    years.push(newYear);
    this.saveSchoolYears(years);
    return newYear;
  },

  getSemesters(): Semester[] {
    this.initialize();
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.SEMESTERS) || '[]');
  },

  saveSemesters(semesters: Semester[]) {
    localStorage.setItem(STORAGE_KEYS.SEMESTERS, JSON.stringify(semesters));
  },

  setActiveSemester(semId: string) {
    const sems = this.getSemesters().map(s => ({ ...s, is_active: s.id === semId }));
    this.saveSemesters(sems);
    const school = this.getSchool();
    school.current_semester_id = semId;
    this.updateSchool(school);
  },

  // Categories
  getCategories(): DocumentCategory[] {
    this.initialize();
    const list: DocumentCategory[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.CATEGORIES) || '[]');
    return list.sort((a, b) => a.order - b.order);
  },

  saveCategories(categories: DocumentCategory[]) {
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
  },

  addCategory(category: Omit<DocumentCategory, 'id'>): DocumentCategory {
    const categories = this.getCategories();
    const newCat: DocumentCategory = {
      ...category,
      id: 'cat_' + Date.now(),
    };
    categories.push(newCat);
    this.saveCategories(categories);
    this.addLog('ADMIN', 'Admin', 'TAMBAH_KATEGORI', `Menambahkan kategori baru: ${newCat.name}`);
    return newCat;
  },

  createCategory(data: { name: string; description?: string; order_index?: number; is_active?: boolean }): DocumentCategory {
    return this.addCategory({
      name: data.name,
      description: data.description || '',
      order: data.order_index || (this.getCategories().length + 1),
      is_active: data.is_active !== undefined ? data.is_active : true,
    });
  },

  updateCategory(category: DocumentCategory) {
    const categories = this.getCategories().map(c => c.id === category.id ? category : c);
    this.saveCategories(categories);
    this.addLog('ADMIN', 'Admin', 'UPDATE_KATEGORI', `Mengubah kategori: ${category.name}`);
  },

  deleteCategory(categoryId: string) {
    const targetCat = this.getCategories().find(c => c.id === categoryId);
    const categories = this.getCategories().filter(c => c.id !== categoryId);
    this.saveCategories(categories);
    // Also remove or unlink requirements
    const reqs = this.getRequirements().filter(r => r.category_id !== categoryId);
    this.saveRequirements(reqs);
    if (targetCat) {
      this.addLog('ADMIN', 'Administrator', 'HAPUS_KATEGORI', `Menghapus kategori: ${targetCat.name}`);
    }
  },

  // Requirements
  getRequirements(): DocumentRequirement[] {
    this.initialize();
    const list: DocumentRequirement[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.REQUIREMENTS) || '[]');
    return list.sort((a, b) => a.order - b.order);
  },

  saveRequirements(requirements: DocumentRequirement[]) {
    localStorage.setItem(STORAGE_KEYS.REQUIREMENTS, JSON.stringify(requirements));
  },

  addRequirement(req: Omit<DocumentRequirement, 'id'>): DocumentRequirement {
    const list = this.getRequirements();
    const newReq: DocumentRequirement = {
      ...req,
      id: 'req_' + Date.now(),
    };
    list.push(newReq);
    this.saveRequirements(list);
    this.addLog('ADMIN', 'Admin', 'TAMBAH_DOKUMEN_PERSYARATAN', `Menambah persyaratan: ${newReq.name}`);
    return newReq;
  },

  createRequirement(data: {
    name: string;
    category_id: string;
    is_mandatory: boolean;
    target_role: 'GURU' | 'PEGAWAI' | 'SEMUA';
    period_type?: string;
    description?: string;
    order_index?: number;
    is_active?: boolean;
  }): DocumentRequirement {
    return this.addRequirement({
      name: data.name,
      category_id: data.category_id,
      is_mandatory: data.is_mandatory,
      target_role: data.target_role,
      description: data.description || '',
      order: data.order_index || (this.getRequirements().length + 1),
      is_active: data.is_active !== undefined ? data.is_active : true,
    });
  },

  updateRequirement(req: DocumentRequirement) {
    const list = this.getRequirements().map(r => r.id === req.id ? req : r);
    this.saveRequirements(list);
    this.addLog('ADMIN', 'Admin', 'UPDATE_DOKUMEN_PERSYARATAN', `Memperbarui persyaratan: ${req.name}`);
  },

  deleteRequirement(id: string) {
    const targetReq = this.getRequirements().find(r => r.id === id);
    const list = this.getRequirements().filter(r => r.id !== id);
    this.saveRequirements(list);
    if (targetReq) {
      this.addLog('ADMIN', 'Administrator', 'HAPUS_DOKUMEN_PERSYARATAN', `Menghapus jenis dokumen: ${targetReq.name}`);
    }
  },

  // Users
  getUsers(): User[] {
    this.initialize();
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');
  },

  saveUsers(users: User[]) {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  },

  getUserById(id: string): User | undefined {
    return this.getUsers().find(u => u.id === id);
  },

  getUserByTeacherId(teacherId: string): User | undefined {
    return this.getUsers().find(u => u.teacher_id === teacherId);
  },

  addUser(user: Omit<User, 'id'>): User {
    const users = this.getUsers();
    const newUser: User = {
      ...user,
      id: 'usr_' + Date.now(),
    };
    users.push(newUser);
    this.saveUsers(users);
    return newUser;
  },

  createUser(user: {
    name: string;
    username: string;
    password?: string;
    role: UserRole;
    teacher_id?: string;
    email?: string;
    avatar?: string;
    is_active?: boolean;
  }): User {
    return this.addUser({
      name: user.name,
      username: user.username,
      password: user.password || '123456',
      role: user.role,
      email: user.email || `${user.username}@tkitmutiaraislam.sch.id`,
      teacher_id: user.teacher_id,
      avatar: user.avatar,
      created_at: new Date().toISOString(),
    });
  },

  updateUser(user: User) {
    const users = this.getUsers().map(u => u.id === user.id ? user : u);
    this.saveUsers(users);
  },

  deleteUser(userId: string) {
    const users = this.getUsers().filter(u => u.id !== userId);
    this.saveUsers(users);
  },

  // Teachers (Staff & Teachers)
  getTeachers(): Teacher[] {
    this.initialize();
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.TEACHERS) || '[]');
  },

  saveTeachers(teachers: Teacher[]) {
    localStorage.setItem(STORAGE_KEYS.TEACHERS, JSON.stringify(teachers));
  },

  getTeacherById(id: string): Teacher | undefined {
    return this.getTeachers().find(t => t.id === id);
  },

  addTeacher(
    teacherData: Omit<Teacher, 'id' | 'created_at'>,
    accountOptions?: { username: string; password: string }
  ): Teacher {
    const teachers = this.getTeachers();
    const newTeacherId = 'tchr_' + Date.now();
    const newTeacher: Teacher = {
      ...teacherData,
      id: newTeacherId,
      created_at: new Date().toISOString(),
    };

    if (accountOptions?.username && accountOptions?.password) {
      const newUser = this.addUser({
        username: accountOptions.username.trim().toLowerCase(),
        password: accountOptions.password,
        role: 'GURU',
        name: newTeacher.name,
        email: newTeacher.email || `${accountOptions.username}@tkitmutiaraislam.sch.id`,
        teacher_id: newTeacherId,
        avatar: newTeacher.photo,
        created_at: new Date().toISOString(),
      });
      newTeacher.user_id = newUser.id;
    }

    teachers.push(newTeacher);
    this.saveTeachers(teachers);

    this.addLog(
      'ADMIN',
      'Administrator',
      'TAMBAH_GURU_PEGAWAI',
      `Menambahkan ${newTeacher.is_staff ? 'Pegawai' : 'Guru'}: ${newTeacher.name} (${newTeacher.position})`
    );

    return newTeacher;
  },

  updateTeacher(teacher: Teacher, accountOptions?: { username?: string; password?: string }) {
    const teachers = this.getTeachers().map(t => t.id === teacher.id ? teacher : t);
    this.saveTeachers(teachers);

    // Update associated user if exists
    if (teacher.user_id) {
      const user = this.getUserById(teacher.user_id);
      if (user) {
        user.name = teacher.name;
        user.email = teacher.email;
        if (teacher.photo) user.avatar = teacher.photo;
        if (accountOptions?.username) user.username = accountOptions.username.trim().toLowerCase();
        if (accountOptions?.password) user.password = accountOptions.password;
        this.updateUser(user);
      }
    } else if (accountOptions?.username && accountOptions?.password) {
      const newUser = this.addUser({
        username: accountOptions.username.trim().toLowerCase(),
        password: accountOptions.password,
        role: 'GURU',
        name: teacher.name,
        email: teacher.email,
        teacher_id: teacher.id,
        avatar: teacher.photo,
        created_at: new Date().toISOString(),
      });
      teacher.user_id = newUser.id;
      this.updateTeacher(teacher);
    }

    this.addLog('ADMIN', 'Administrator', 'UPDATE_GURU', `Memperbarui data ${teacher.name}`);
  },

  deleteTeacher(teacherId: string) {
    const teacher = this.getTeacherById(teacherId);
    if (!teacher) return;

    // Delete associated user
    if (teacher.user_id) {
      this.deleteUser(teacher.user_id);
    }

    // Delete associated documents and reviews
    const docs = this.getDocuments().filter(d => d.teacher_id === teacherId);
    const docIds = new Set(docs.map(d => d.id));
    
    const remainingDocs = this.getDocuments().filter(d => d.teacher_id !== teacherId);
    localStorage.setItem(STORAGE_KEYS.DOCUMENTS, JSON.stringify(remainingDocs));

    const remainingReviews = this.getReviews().filter(r => !docIds.has(r.document_id));
    localStorage.setItem(STORAGE_KEYS.REVIEWS, JSON.stringify(remainingReviews));

    const teachers = this.getTeachers().filter(t => t.id !== teacherId);
    this.saveTeachers(teachers);

    this.addLog('ADMIN', 'Administrator', 'HAPUS_GURU', `Menghapus guru/pegawai: ${teacher.name}`);
  },

  createTeacher(
    teacherData: Omit<Teacher, 'id' | 'created_at'>,
    accountOptions?: { username: string; password: string }
  ): Teacher {
    return this.addTeacher(teacherData, accountOptions);
  },

  resetTeachersToEmpty() {
    localStorage.setItem(STORAGE_KEYS.TEACHERS, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.DOCUMENTS, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.REVIEWS, JSON.stringify([]));
    const users = this.getUsers().filter(u => u.role !== 'GURU');
    this.saveUsers(users);
    this.addLog('ADMIN', 'Administrator', 'RESET_GURU', 'Data guru dan pegawai dikosongkan.');
  },

  // Documents
  getDocuments(): TeacherDocument[] {
    this.initialize();
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.DOCUMENTS) || '[]');
  },

  saveDocuments(docs: TeacherDocument[]) {
    localStorage.setItem(STORAGE_KEYS.DOCUMENTS, JSON.stringify(docs));
  },

  getDocumentById(id: string): TeacherDocument | undefined {
    return this.getDocuments().find(d => d.id === id);
  },

  getDocumentsByTeacherId(teacherId: string): TeacherDocument[] {
    return this.getDocuments().filter(d => d.teacher_id === teacherId);
  },

  upsertDocument(docData: {
    teacher_id: string;
    document_requirement_id: string;
    school_year_id: string;
    semester_id: string;
    file_name: string;
    file_url: string;
    file_size: number;
    file_type: string;
    description: string;
    status: TeacherDocument['status'];
  }): TeacherDocument {
    const docs = this.getDocuments();
    const teacher = this.getTeacherById(docData.teacher_id);
    const req = this.getRequirements().find(r => r.id === docData.document_requirement_id);
    const now = new Date().toISOString();

    const existingIndex = docs.findIndex(
      d => d.teacher_id === docData.teacher_id && d.document_requirement_id === docData.document_requirement_id
    );

    let finalDoc: TeacherDocument;

    if (existingIndex >= 0) {
      const existing = docs[existingIndex];
      const isReupload = existing.status === 'PERLU_PERBAIKAN' || existing.status === 'DITOLAK';
      finalDoc = {
        ...existing,
        ...docData,
        updated_at: now,
      };
      docs[existingIndex] = finalDoc;

      // Notify Kepsek if submitted for review
      if (docData.status === 'MENUNGGU_PEMERIKSAAN') {
        this.addNotification({
          user_id: 'user_kepsek',
          title: isReupload ? 'Perbaikan Dokumen Diunggah Ulang' : 'Dokumen Baru Menunggu Pemeriksaan',
          message: `${teacher?.name || 'Guru'} telah mengunggah ${isReupload ? 'perbaikan untuk' : 'dokumen'}: ${req?.name || 'Dokumen'}`,
          type: 'warning',
          link_tab: 'pemeriksaan',
        });
      }
    } else {
      finalDoc = {
        id: 'doc_' + Date.now(),
        ...docData,
        uploaded_at: now,
        updated_at: now,
      };
      docs.push(finalDoc);

      if (docData.status === 'MENUNGGU_PEMERIKSAAN') {
        this.addNotification({
          user_id: 'user_kepsek',
          title: 'Dokumen Baru Menunggu Pemeriksaan',
          message: `${teacher?.name || 'Guru'} telah mengunggah dokumen baru: ${req?.name || 'Dokumen'}`,
          type: 'warning',
          link_tab: 'pemeriksaan',
        });
      }
    }

    this.saveDocuments(docs);

    // Notify teacher
    if (teacher?.user_id) {
      this.addNotification({
        user_id: teacher.user_id,
        title: 'Dokumen Berhasil Disimpan',
        message: docData.status === 'MENUNGGU_PEMERIKSAAN'
          ? `Dokumen "${req?.name}" berhasil dikirim untuk diperiksa Kepala Sekolah.`
          : `Dokumen "${req?.name}" disimpan sebagai draf.`,
        type: 'success',
        link_tab: 'administrasi',
      });
    }

    this.addLog(
      teacher?.user_id || 'GURU',
      teacher?.name || 'Guru',
      'UNGGAH_DOKUMEN',
      `Mengunggah dokumen ${req?.name} (${docData.file_name}) - Status: ${docData.status}`
    );

    return finalDoc;
  },

  // Document Reviews
  getReviews(): DocumentReview[] {
    this.initialize();
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.REVIEWS) || '[]');
  },

  saveReviews(reviews: DocumentReview[]) {
    localStorage.setItem(STORAGE_KEYS.REVIEWS, JSON.stringify(reviews));
  },

  getReviewsByDocumentId(documentId: string): DocumentReview[] {
    return this.getReviews().filter(r => r.document_id === documentId);
  },

  submitReview(params: {
    document_id: string;
    reviewer_id: string;
    reviewer_name: string;
    status: 'LENGKAP' | 'PERLU_PERBAIKAN' | 'DITOLAK';
    notes: string;
  }): DocumentReview {
    const reviews = this.getReviews();
    const doc = this.getDocumentById(params.document_id);
    if (!doc) throw new Error('Dokumen tidak ditemukan');

    const newReview: DocumentReview = {
      id: 'rev_' + Date.now(),
      document_id: params.document_id,
      reviewer_id: params.reviewer_id,
      reviewer_name: params.reviewer_name,
      status: params.status,
      notes: params.notes,
      reviewed_at: new Date().toISOString(),
    };
    reviews.push(newReview);
    this.saveReviews(reviews);

    // Update document status
    doc.status = params.status;
    doc.updated_at = new Date().toISOString();
    this.saveDocuments(this.getDocuments().map(d => d.id === doc.id ? doc : d));

    // Notify Teacher
    const teacher = this.getTeacherById(doc.teacher_id);
    const req = this.getRequirements().find(r => r.id === doc.document_requirement_id);

    if (teacher?.user_id) {
      let notifTitle = '';
      let notifMsg = '';
      let notifType: NotificationItem['type'] = 'info';

      if (params.status === 'LENGKAP') {
        notifTitle = '✓ Dokumen Telah Lengkap';
        notifMsg = `Dokumen "${req?.name}" telah diperiksa dan disetujui sebagai LENGKAP oleh Kepala Sekolah.`;
        notifType = 'success';
      } else if (params.status === 'PERLU_PERBAIKAN') {
        notifTitle = '⚠ Dokumen Perlu Perbaikan';
        notifMsg = `Dokumen "${req?.name}" perlu diperbaiki. Catatan Kepala Sekolah: "${params.notes}". Silakan lakukan upload ulang.`;
        notifType = 'warning';
      } else {
        notifTitle = '✕ Dokumen Ditolak';
        notifMsg = `Dokumen "${req?.name}" ditolak oleh Kepala Sekolah. Catatan: "${params.notes}".`;
        notifType = 'error';
      }

      this.addNotification({
        user_id: teacher.user_id,
        title: notifTitle,
        message: notifMsg,
        type: notifType,
        link_tab: params.status === 'PERLU_PERBAIKAN' ? 'perbaikan' : 'administrasi',
      });
    }

    this.addLog(
      params.reviewer_id,
      params.reviewer_name,
      'PEMERIKSAAN_DOKUMEN',
      `Memeriksa dokumen ${req?.name} (${teacher?.name}) - Hasil: ${params.status}`
    );

    return newReview;
  },

  // Notifications
  getNotifications(): NotificationItem[] {
    this.initialize();
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS) || '[]');
  },

  getUserNotifications(userId: string): NotificationItem[] {
    const all = this.getNotifications();
    return all.filter(n => n.user_id === userId || n.user_id === 'ALL');
  },

  addNotification(notif: Omit<NotificationItem, 'id' | 'created_at' | 'is_read'>) {
    const all = this.getNotifications();
    const newNotif: NotificationItem = {
      ...notif,
      id: 'notif_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      is_read: false,
      created_at: new Date().toISOString(),
    };
    all.unshift(newNotif);
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(all));
  },

  markNotificationAsRead(id: string) {
    const all = this.getNotifications().map(n => n.id === id ? { ...n, is_read: true } : n);
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(all));
  },

  markAllNotificationsAsRead(userId: string) {
    const all = this.getNotifications().map(n => 
      (n.user_id === userId || n.user_id === 'ALL') ? { ...n, is_read: true } : n
    );
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(all));
  },

  // Activity Logs
  getLogs(): ActivityLog[] {
    this.initialize();
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.LOGS) || '[]');
  },

  addLog(user_id: string, user_name: string, action: string, details: string) {
    const logs = this.getLogs();
    const newLog: ActivityLog = {
      id: 'log_' + Date.now(),
      user_id,
      user_name,
      action,
      details,
      timestamp: new Date().toISOString(),
    };
    logs.unshift(newLog);
    // Keep last 150 logs
    if (logs.length > 150) logs.length = 150;
    localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(logs));
  },

  // Calculated Progress for a Teacher
  calculateTeacherProgress(teacherId: string): TeacherProgress | null {
    const teacher = this.getTeacherById(teacherId);
    if (!teacher) return null;

    const requirements = this.getRequirements().filter(r => {
      if (!r.is_active) return false;
      if (teacher.is_staff) {
        return r.target_role === 'PEGAWAI' || r.target_role === 'SEMUA';
      } else {
        return r.target_role === 'GURU' || r.target_role === 'SEMUA';
      }
    });

    const docs = this.getDocumentsByTeacherId(teacherId);

    const status_counts = {
      belum_diunggah: 0,
      sudah_diunggah: 0,
      menunggu_pemeriksaan: 0,
      lengkap: 0,
      perlu_perbaikan: 0,
      ditolak: 0,
    };

    let mandatoryComplete = 0;
    let totalMandatory = 0;

    requirements.forEach(req => {
      if (req.is_mandatory) {
        totalMandatory++;
      }

      const doc = docs.find(d => d.document_requirement_id === req.id);
      if (!doc || doc.status === 'BELUM_DIUNGGAH') {
        status_counts.belum_diunggah++;
      } else {
        if (doc.status === 'SUDAH_DIUNGGAH') status_counts.sudah_diunggah++;
        else if (doc.status === 'MENUNGGU_PEMERIKSAAN') status_counts.menunggu_pemeriksaan++;
        else if (doc.status === 'LENGKAP') {
          status_counts.lengkap++;
          if (req.is_mandatory) {
            mandatoryComplete++;
          }
        } else if (doc.status === 'PERLU_PERBAIKAN') status_counts.perlu_perbaikan++;
        else if (doc.status === 'DITOLAK') status_counts.ditolak++;
      }
    });

    // Per Requirement N:
    // Persentase = (Jumlah dokumen WAJIB LENGKAP / Jumlah seluruh dokumen WAJIB) * 100%
    const percentage = totalMandatory > 0
      ? Math.round((mandatoryComplete / totalMandatory) * 100)
      : 100;

    return {
      teacher,
      total_requirements: requirements.length,
      total_mandatory: totalMandatory,
      mandatory_complete: mandatoryComplete,
      total_uploaded: docs.length,
      status_counts,
      percentage,
    };
  },

  getAllTeachersProgress(): TeacherProgress[] {
    const teachers = this.getTeachers();
    return teachers
      .map(t => this.calculateTeacherProgress(t.id))
      .filter((p): p is TeacherProgress => p !== null);
  },

  // Helper to seed demo teachers IF AND ONLY IF explicitly triggered by the Admin
  // (Satisfies requirement that default is EMPTY, but provides optional test helper if user wants)
  seedDemoTeachersForTesting() {
    const demoTeachers: Array<Omit<Teacher, 'id' | 'created_at'>> = [
      {
        name: 'Nurfadillah, S.Pd',
        nip_nuptk: '19880412 201502 2 003',
        position: 'Guru Kelas TK A (Kelompok Bintang)',
        subject_or_group: 'Sentra Seni & Kreativitas',
        employment_status: 'GTY / Tetap Yayasan',
        phone: '0852-9988-1122',
        email: 'fadillah@tkitmutiaraislam.sch.id',
        is_active: true,
        is_staff: false,
      },
      {
        name: 'Andi Megawati, S.Pd.I',
        nip_nuptk: '19910815 201903 2 007',
        position: 'Guru Kelas TK B (Kelompok Pelangi)',
        subject_or_group: 'Sentra Imtaq & Tahfidz Quran',
        employment_status: 'GTY / Tetap Yayasan',
        phone: '0813-4455-6677',
        email: 'megawati@tkitmutiaraislam.sch.id',
        is_active: true,
        is_staff: false,
      },
      {
        name: 'Rahmawati, S.Pd',
        nip_nuptk: '19940120 202104 2 011',
        position: 'Guru Pendamping TK A & B',
        subject_or_group: 'Sentra Balok & Bahan Alam',
        employment_status: 'GTT / Honorer',
        phone: '0821-3344-5566',
        email: 'rahmawati@tkitmutiaraislam.sch.id',
        is_active: true,
        is_staff: false,
      },
      {
        name: 'Fitriani Syam, A.Md',
        nip_nuptk: '19950710 202201 2 015',
        position: 'Kepala Tata Usaha & Kepegawaian',
        subject_or_group: 'Administrasi & Kepegawaian',
        employment_status: 'Pegawai Tetap',
        phone: '0853-1122-3344',
        email: 'fitriani@tkitmutiaraislam.sch.id',
        is_active: true,
        is_staff: true,
      },
      {
        name: 'Muh. Yusuf, S.E',
        nip_nuptk: '19930305 202002 1 009',
        position: 'Staff Keuangan & Bendahara',
        subject_or_group: 'Keuangan & Sarpras',
        employment_status: 'Pegawai Tetap',
        phone: '0812-9988-7766',
        email: 'yusuf@tkitmutiaraislam.sch.id',
        is_active: true,
        is_staff: true,
      },
    ];

    demoTeachers.forEach((t, idx) => {
      const username = t.name.split(' ')[0].toLowerCase().replace(/[^a-z]/g, '');
      const teacher = this.addTeacher(t, {
        username: username,
        password: 'guru123',
      });

      // Add a few sample uploaded documents for demonstration
      if (idx === 0) {
        // Teacher 1 has some completed docs and 1 waiting review
        this.upsertDocument({
          teacher_id: teacher.id,
          document_requirement_id: 'req_1_01',
          school_year_id: 'sy_2025_2026',
          semester_id: 'sem_ganjil',
          file_name: 'Kalender_Pendidikan_TKIT_2025_2026.pdf',
          file_url: 'sample_pdf_kalender',
          file_size: 1048576,
          file_type: 'application/pdf',
          description: 'Kalender Pendidikan disesuaikan dengan Dinas Pendidikan Kota Palopo dan Yayasan',
          status: 'LENGKAP',
        });
        this.upsertDocument({
          teacher_id: teacher.id,
          document_requirement_id: 'req_1_02',
          school_year_id: 'sy_2025_2026',
          semester_id: 'sem_ganjil',
          file_name: 'Program_Tahunan_TK_A_Kelompok_Bintang.docx',
          file_url: 'sample_doc_prota',
          file_size: 2048576,
          file_type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          description: 'Program tahunan lengkap semester 1 dan semester 2',
          status: 'MENUNGGU_PEMERIKSAAN',
        });
        this.upsertDocument({
          teacher_id: teacher.id,
          document_requirement_id: 'req_1_07',
          school_year_id: 'sy_2025_2026',
          semester_id: 'sem_ganjil',
          file_name: 'Modul_Ajar_TKIT_Tema_Diri_Sendiri.pdf',
          file_url: 'sample_pdf_modul',
          file_size: 1548576,
          file_type: 'application/pdf',
          description: 'Modul ajar kurikulum merdeka PAUD 4 pekan pertama',
          status: 'PERLU_PERBAIKAN',
        });
        // Create review for the one needing revision
        const docNeedRevision = this.getDocuments().find(d => d.teacher_id === teacher.id && d.document_requirement_id === 'req_1_07');
        if (docNeedRevision) {
          this.submitReview({
            document_id: docNeedRevision.id,
            reviewer_id: 'user_kepsek',
            reviewer_name: 'Sitti Hidayati, S.Pd',
            status: 'PERLU_PERBAIKAN',
            notes: 'Silakan perbaiki dokumen pada bagian alur kegiatan penutup serta lengkapi tanda tangan Kepala Sekolah.',
          });
        }
      }
    });

    this.addLog('ADMIN', 'Administrator', 'SEED_DEMO', 'Data simulasi guru/pegawai ditambahkan untuk pengujian.');
  },
};
