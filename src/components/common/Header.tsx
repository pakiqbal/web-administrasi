import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { storageService } from '../../services/storage';
import {
  Bell,
  LogOut,
  User,
  Menu,
  CheckCheck,
  Settings,
} from 'lucide-react';

interface HeaderProps {
  onToggleSidebar?: () => void;
  currentTab: string;
  onSelectTab: (tab: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  onToggleSidebar,
  currentTab,
  onSelectTab,
}) => {
  const { currentUser, currentTeacher, school, logout, refreshData } = useAuth();
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  const notifications = currentUser
    ? storageService.getUserNotifications(currentUser.id)
    : [];
  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const handleMarkAllRead = () => {
    if (currentUser) {
      storageService.markAllNotificationsAsRead(currentUser.id);
      refreshData();
    }
  };

  const handleNotifClick = (notif: typeof notifications[0]) => {
    storageService.markNotificationAsRead(notif.id);
    setShowNotifDropdown(false);
    refreshData();
    if (notif.link_tab) {
      onSelectTab(notif.link_tab);
    }
  };

  const getRoleBadge = () => {
    if (!currentUser) return null;
    if (currentUser.role === 'ADMIN') {
      return (
        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-100 text-purple-700 border border-purple-200">
          ADMIN
        </span>
      );
    }
    if (currentUser.role === 'KEPALA_SEKOLAH') {
      return (
        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
          KEPALA SEKOLAH
        </span>
      );
    }
    return (
      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-700 border border-blue-200">
        GURU / PEGAWAI
      </span>
    );
  };

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200 shadow-xs">
      <div className="px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Left: Mobile Menu button + School Brand */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleSidebar}
            className="lg:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100 focus:outline-hidden"
            aria-label="Toggle Menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-black text-sm shadow-sm shadow-blue-500/30">
              {school.logo_url ? (
                <img
                  src={school.logo_url}
                  alt="Logo"
                  className="w-8 h-8 object-contain rounded-lg"
                />
              ) : (
                'MI'
              )}
            </div>
            <div className="hidden sm:block">
              <h1 className="text-sm font-bold text-slate-900 tracking-tight leading-none uppercase">
                {school.name}
              </h1>
              <p className="text-[11px] text-slate-500 mt-0.5 font-medium">
                Sistem Pemantauan Administrasi Guru & Pegawai
              </p>
            </div>
          </div>
        </div>

        {/* Right: Notifications, Profile Dropdown */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Notifications Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowNotifDropdown(!showNotifDropdown)}
              className="relative p-2 rounded-xl text-slate-600 hover:bg-slate-100 focus:outline-hidden transition-colors"
              aria-label="Notifikasi"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-rose-500 text-white rounded-full text-[10px] font-bold flex items-center justify-center animate-pulse">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {showNotifDropdown && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-slate-200 py-3 z-50 animate-in fade-in slide-in-from-top-2">
                <div className="px-4 pb-2 border-b border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-slate-800">Notifikasi</span>
                    {unreadCount > 0 && (
                      <span className="text-xs bg-rose-100 text-rose-700 px-2 py-0.5 rounded-full font-semibold">
                        {unreadCount} baru
                      </span>
                    )}
                  </div>
                  {unreadCount > 0 && (
                    <button
                      onClick={handleMarkAllRead}
                      className="text-xs text-blue-600 hover:underline flex items-center gap-1 font-medium"
                    >
                      <CheckCheck className="w-3.5 h-3.5" />
                      Tandai dibaca
                    </button>
                  )}
                </div>

                <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                  {notifications.length === 0 ? (
                    <div className="py-8 text-center text-xs text-slate-400">
                      Belum ada notifikasi
                    </div>
                  ) : (
                    notifications.map((notif) => (
                      <div
                        key={notif.id}
                        onClick={() => handleNotifClick(notif)}
                        className={`p-3.5 hover:bg-slate-50 cursor-pointer transition-colors text-left ${
                          !notif.is_read ? 'bg-blue-50/50' : ''
                        }`}
                      >
                        <div className="flex items-start gap-2">
                          <div
                            className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                              !notif.is_read ? 'bg-blue-600' : 'bg-transparent'
                            }`}
                          />
                          <div className="flex-1">
                            <p className="text-xs font-semibold text-slate-900 leading-tight">
                              {notif.title}
                            </p>
                            <p className="text-xs text-slate-600 mt-1 leading-snug">
                              {notif.message}
                            </p>
                            <span className="text-[10px] text-slate-400 mt-1 block">
                              {new Date(notif.created_at).toLocaleTimeString('id-ID', {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Profile Pill */}
          <div className="relative">
            <button
              onClick={() => setShowUserDropdown(!showUserDropdown)}
              className="flex items-center gap-2.5 p-1.5 sm:px-3 sm:py-1.5 rounded-xl hover:bg-slate-100 focus:outline-hidden transition-colors"
            >
              <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
                {currentUser?.name.charAt(0) || 'U'}
              </div>
              <div className="text-left hidden sm:block">
                <div className="text-xs font-bold text-slate-900 leading-tight truncate max-w-[120px]">
                  {currentUser?.name}
                </div>
                <div className="text-[10px] text-slate-500 font-medium">
                  {currentUser?.role === 'ADMIN'
                    ? 'Admin'
                    : currentUser?.role === 'KEPALA_SEKOLAH'
                    ? 'Kepala Sekolah'
                    : currentTeacher?.position || 'Guru / Pegawai'}
                </div>
              </div>
            </button>

            {showUserDropdown && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in slide-in-from-top-2">
                <div className="px-4 py-2 border-b border-slate-100">
                  <p className="text-xs font-bold text-slate-900">{currentUser?.name}</p>
                  <p className="text-[11px] text-slate-500 truncate">{currentUser?.email}</p>
                  <div className="mt-2">{getRoleBadge()}</div>
                </div>

                <div className="p-1">
                  <button
                    onClick={() => {
                      setShowUserDropdown(false);
                      onSelectTab('profil');
                    }}
                    className="w-full text-left px-3 py-2 text-xs text-slate-700 hover:bg-slate-100 rounded-lg flex items-center gap-2"
                  >
                    <User className="w-4 h-4 text-slate-400" />
                    <span>Profil Pengguna</span>
                  </button>

                  <button
                    onClick={() => {
                      setShowUserDropdown(false);
                      onSelectTab('pengaturan');
                    }}
                    className="w-full text-left px-3 py-2 text-xs text-slate-700 hover:bg-slate-100 rounded-lg flex items-center gap-2"
                  >
                    <Settings className="w-4 h-4 text-blue-600" />
                    <span className="font-semibold text-slate-800">⚙️ Pengaturan & Ganti Password</span>
                  </button>

                  <button
                    onClick={() => {
                      setShowUserDropdown(false);
                      logout();
                    }}
                    className="w-full text-left px-3 py-2 text-xs text-rose-600 hover:bg-rose-50 rounded-lg flex items-center gap-2 font-medium"
                  >
                    <LogOut className="w-4 h-4 text-rose-500" />
                    <span>Keluar (Logout)</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
