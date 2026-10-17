import React, { useState } from 'react';
import {
  Bell,
  Moon,
  Sun,
  Globe,
  LogOut,
  Shield,
  Wrench,
  User,
  Car,
} from 'lucide-react';
import { UserRole, Language } from '../../types';
import { CargasLogo } from './CargasLogo';
import { StorageService } from '../../services/storage';

interface HeaderProps {
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  language: Language;
  onLanguageChange: (lang: Language) => void;
  darkMode: boolean;
  onToggleDarkMode: () => void;
  onOpenAdminPasscode: () => void;
  onOpenWorkerLogin: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentRole,
  onRoleChange,
  language,
  onLanguageChange,
  darkMode,
  onToggleDarkMode,
  onOpenAdminPasscode,
  onOpenWorkerLogin,
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const notifications = StorageService.getNotifications();
  const unreadCount = notifications.filter(n => !n.read).length;

  const handleLogoutStaff = () => {
    StorageService.logoutWorker();
    onRoleChange('driver');
  };

  const handleMarkAllRead = () => {
    StorageService.markNotificationsAsRead();
    setShowNotifications(false);
  };

  return (
    <header className="sticky top-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-emerald-900/10 dark:border-emerald-800/30 transition-colors shadow-sm">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2.5">
        <div className="flex items-center justify-between gap-2">
          {/* Brand Logo with 5-tap Admin backdoor */}
          <CargasLogo
            size="md"
            onAdminPasscodeTrigger={onOpenAdminPasscode}
          />

          {/* If logged into Admin or Worker, show dedicated staff bar with Logout button */}
          {currentRole !== 'driver' ? (
            <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800/90 px-3 py-1.5 rounded-2xl border border-slate-200 dark:border-slate-700">
              <span className="flex items-center gap-1.5 text-xs font-bold text-slate-800 dark:text-slate-200">
                {currentRole === 'admin' ? (
                  <>
                    <Shield className="w-4 h-4 text-amber-500" />
                    <span>لوحة تحكم مدير النظام</span>
                  </>
                ) : (
                  <>
                    <Wrench className="w-4 h-4 text-emerald-600" />
                    <span>منظومة تشغيل فني التموين</span>
                  </>
                )}
              </span>

              <button
                onClick={handleLogoutStaff}
                className="flex items-center gap-1 text-[11px] font-bold text-rose-600 hover:text-rose-700 bg-rose-50 dark:bg-rose-950/40 px-2.5 py-1 rounded-xl transition-colors"
                title="تسجيل الخروج والعودة لتطبيق السائق"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>خروج للرئيسية</span>
              </button>
            </div>
          ) : (
            /* Discrete subtle Driver Welcome status */
            <div className="hidden sm:flex items-center gap-2 text-xs font-semibold text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1.5 rounded-2xl border border-emerald-200 dark:border-emerald-800/50">
              <Car className="w-4 h-4 text-emerald-600" />
              <span>نادي كارجاس للولاء والطاقة النظيفة</span>
            </div>
          )}

          {/* Quick Actions (Notifications, Language, Theme) */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Notification Bell */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                title="الإشعارات"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-amber-500 text-slate-950 text-[10px] font-black rounded-full flex items-center justify-center animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notifications Dropdown */}
              {showNotifications && (
                <div className="absolute left-0 mt-2 w-80 sm:w-96 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-3 z-50 animate-fadeIn">
                  <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2 mb-2">
                    <span className="font-bold text-xs text-slate-900 dark:text-white flex items-center gap-1.5">
                      <Bell className="w-3.5 h-3.5 text-emerald-600" />
                      إشعارات النظام اللحظية
                    </span>
                    {unreadCount > 0 && (
                      <button
                        onClick={handleMarkAllRead}
                        className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold hover:underline"
                      >
                        تحديد الكل كمقروء
                      </button>
                    )}
                  </div>

                  <div className="max-h-72 overflow-y-auto space-y-2">
                    {notifications.length === 0 ? (
                      <p className="text-xs text-slate-400 text-center py-4">لا توجد إشعارات حالياً</p>
                    ) : (
                      notifications.slice(0, 5).map(n => (
                        <div
                          key={n.id}
                          className={`p-2.5 rounded-xl border text-right text-xs transition-colors ${
                            n.read
                              ? 'bg-slate-50 dark:bg-slate-800/40 border-slate-100 dark:border-slate-800 text-slate-500'
                              : 'bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800/50 text-slate-800 dark:text-slate-200'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-bold text-emerald-800 dark:text-emerald-400">
                              {language === 'ar' ? n.title : n.titleEn}
                            </span>
                            <span className="text-[10px] text-slate-400">{n.timestamp}</span>
                          </div>
                          <p className="text-[11px] leading-relaxed">
                            {language === 'ar' ? n.message : n.messageEn}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Language Switcher */}
            <button
              onClick={() => onLanguageChange(language === 'ar' ? 'en' : 'ar')}
              className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold text-xs flex items-center gap-1"
              title="تغيير اللغة"
            >
              <Globe className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span className="uppercase">{language === 'ar' ? 'EN' : 'عربي'}</span>
            </button>

            {/* Dark Mode Toggle */}
            <button
              onClick={onToggleDarkMode}
              className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="الوضع الليلي / النهاري"
            >
              {darkMode ? (
                <Sun className="w-5 h-5 text-amber-400" />
              ) : (
                <Moon className="w-5 h-5 text-slate-600" />
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
