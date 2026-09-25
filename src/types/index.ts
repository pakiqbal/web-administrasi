export type UserRole = 'ADMIN' | 'KEPALA_SEKOLAH' | 'GURU';

export type DocumentStatus =
  | 'BELUM_DIUNGGAH'
  | 'SUDAH_DIUNGGAH'
  | 'MENUNGGU_PEMERIKSAAN'
  | 'LENGKAP'
  | 'PERLU_PERBAIKAN'
  | 'DITOLAK';

export interface User {
  id: string;
  username: string;
  password?: string;
  role: UserRole;
  name: string;
  email: string;
  teacher_id?: string;
  avatar?: string;
  created_at: string;
}

export interface Teacher {
  id: string;
  user_id?: string;
  name: string;
  nip_nuptk: string;
  position: string; // e.g. "Guru Kelas TK A", "Guru Pendamping", "Staff Tata Usaha"
  subject_or_group: string; // e.g. "Kelompok Bintang", "Sentra Imtaq", "Administrasi"
  employment_status: string; // e.g. "GTY / Tetap Yayasan", "PNS", "PPPK", "Honorer"
  phone: string;
  email: string;
  photo?: string;
  is_active: boolean;
  is_staff?: boolean; // true if Pegawai/TU, false if Guru
  created_at: string;
}

export interface School {
  id: string;
  name: string;
  principal_name: string;
  principal_nip: string;
  npsn: string;
  address: string;
  city?: string;
  phone: string;
  email: string;
  website: string;
  logo_url?: string;
  max_file_size_mb: number;
  current_school_year_id: string;
  current_semester_id: string;
}

export interface KopSuratConfig {
  foundation_name: string;
  school_name: string;
  address: string;
  npsn: string;
  phone: string;
  email: string;
  website: string;
  logo_url: string;
  right_logo_url: string;
  right_text_top: string;
  right_text_bottom: string;
}

export interface SchoolYear {
  id: string;
  name: string; // e.g. "2025/2026"
  is_active: boolean;
}

export interface Semester {
  id: string;
  name: string; // e.g. "Semester Ganjil"
  is_active: boolean;
}

export interface DocumentCategory {
  id: string;
  name: string;
  description?: string;
  order: number;
  is_active: boolean;
}

export interface DocumentRequirement {
  id: string;
  category_id: string;
  name: string;
  description?: string;
  is_mandatory: boolean; // WAJIB or TIDAK WAJIB
  target_role: 'GURU' | 'PEGAWAI' | 'SEMUA';
  is_active: boolean;
  order: number;
}

export interface TeacherDocument {
  id: string;
  teacher_id: string;
  document_requirement_id: string;
  school_year_id: string;
  semester_id: string;
  file_name: string;
  file_url: string; // Data URL or storage string
  file_size: number; // in bytes
  file_type: string; // pdf, doc, xls, image, etc.
  description: string; // Keterangan guru
  status: DocumentStatus;
  uploaded_at: string;
  updated_at: string;
}

export interface DocumentReview {
  id: string;
  document_id: string;
  reviewer_id: string;
  reviewer_name: string;
  status: 'LENGKAP' | 'PERLU_PERBAIKAN' | 'DITOLAK';
  notes: string;
  reviewed_at: string;
}

export interface NotificationItem {
  id: string;
  user_id: string; // Specific user or 'ALL_TEACHERS' or 'KEPALA_SEKOLAH' or 'ADMIN'
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  is_read: boolean;
  link_tab?: string;
  created_at: string;
}

export interface ActivityLog {
  id: string;
  user_id: string;
  user_name: string;
  action: string;
  details: string;
  timestamp: string;
}

export interface TeacherProgress {
  teacher: Teacher;
  total_requirements: number;
  total_mandatory: number;
  mandatory_complete: number;
  total_uploaded: number;
  status_counts: {
    belum_diunggah: number;
    sudah_diunggah: number;
    menunggu_pemeriksaan: number;
    lengkap: number;
    perlu_perbaikan: number;
    ditolak: number;
  };
  percentage: number; // calculated: (mandatory_complete / total_mandatory) * 100
}
