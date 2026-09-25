import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User, Teacher, School } from '../types';
import { storageService } from '../services/storage';

interface AuthContextType {
  currentUser: User | null;
  currentTeacher: Teacher | null;
  isAuthenticated: boolean;
  school: School;
  login: (username: string, password?: string) => { success: boolean; message?: string };
  logout: () => void;
  refreshData: () => void;
  changePassword: (oldPassword: string, newPassword: string) => { success: boolean; message: string };
  dataVersion: number;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentTeacher, setCurrentTeacher] = useState<Teacher | null>(null);
  const [school, setSchool] = useState<School>(storageService.getSchool());
  const [dataVersion, setDataVersion] = useState<number>(1);

  const refreshData = useCallback(() => {
    setDataVersion(prev => prev + 1);
    setSchool(storageService.getSchool());
  }, []);

  useEffect(() => {
    storageService.initialize();
    setSchool(storageService.getSchool());

    // Check if session stored
    const savedUserId = sessionStorage.getItem('tkit_session_user_id');
    if (savedUserId) {
      const user = storageService.getUserById(savedUserId);
      if (user) {
        setCurrentUser(user);
        if (user.teacher_id) {
          const teacher = storageService.getTeacherById(user.teacher_id);
          setCurrentTeacher(teacher || null);
        }
      }
    }
  }, [dataVersion]);

  const login = (username: string, password?: string): { success: boolean; message?: string } => {
    const cleanUsername = username.trim().toLowerCase();
    const users = storageService.getUsers();
    
    // Find user by username or email
    const user = users.find(
      u => u.username.toLowerCase() === cleanUsername || u.email.toLowerCase() === cleanUsername
    );

    if (!user) {
      return { success: false, message: 'Nama Pengguna atau Email tidak terdaftar dalam sistem.' };
    }

    if (password && user.password && user.password !== password) {
      return { success: false, message: 'Kata sandi tidak sesuai. Silakan periksa kembali.' };
    }

    sessionStorage.setItem('tkit_session_user_id', user.id);
    setCurrentUser(user);

    if (user.teacher_id) {
      const teacher = storageService.getTeacherById(user.teacher_id);
      setCurrentTeacher(teacher || null);
    } else {
      setCurrentTeacher(null);
    }

    storageService.addLog(
      user.id,
      user.name,
      'LOGIN_SUKSES',
      `Pengguna masuk sebagai ${user.role}`
    );

    refreshData();
    return { success: true };
  };

  const logout = () => {
    if (currentUser) {
      storageService.addLog(
        currentUser.id,
        currentUser.name,
        'LOGOUT',
        'Pengguna keluar dari aplikasi'
      );
    }
    sessionStorage.removeItem('tkit_session_user_id');
    setCurrentUser(null);
    setCurrentTeacher(null);
  };

  const changePassword = (
    oldPassword: string,
    newPassword: string
  ): { success: boolean; message: string } => {
    if (!currentUser) {
      return { success: false, message: 'Sesi akun tidak ditemukan. Silakan login kembali.' };
    }

    // Ambil data user terkini langsung dari storage
    const user = storageService.getUserById(currentUser.id);
    if (!user) {
      return { success: false, message: 'Data pengguna tidak ditemukan di sistem.' };
    }

    // Verifikasi password lama
    if ((user.password || '') !== oldPassword) {
      return { success: false, message: 'Password lama yang Anda masukkan salah. Silakan periksa kembali.' };
    }

    // Validasi kesamaan password baru dengan lama
    if (oldPassword === newPassword) {
      return { success: false, message: 'Password baru tidak boleh sama dengan password lama.' };
    }

    // Simpan password baru
    const updatedUser: User = {
      ...user,
      password: newPassword,
    };

    storageService.updateUser(updatedUser);
    setCurrentUser(updatedUser);

    // Catat log aktivitas & notifikasi
    storageService.addLog(
      updatedUser.id,
      updatedUser.name,
      'GANTI_PASSWORD',
      `Kata sandi akun ${updatedUser.username} (${updatedUser.role}) berhasil diperbarui.`
    );

    storageService.addNotification({
      user_id: updatedUser.id,
      title: 'Keamanan Akun: Password Diperbarui',
      message: 'Password akun Anda telah berhasil diubah. Gunakan password baru ini untuk login berikutnya.',
      type: 'success',
    });

    refreshData();

    return {
      success: true,
      message: 'Password berhasil diperbarui dan disimpan! Anda dapat menggunakan password ini untuk login berikutnya.',
    };
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        currentTeacher,
        isAuthenticated: !!currentUser,
        school,
        login,
        logout,
        refreshData,
        changePassword,
        dataVersion,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
