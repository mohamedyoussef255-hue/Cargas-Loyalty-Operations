import React, { useState, useEffect } from 'react';
import { UserRole, Language, Worker } from './types';
import { Header } from './components/common/Header';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { WorkerDashboard } from './components/worker/WorkerDashboard';
import { DriverDashboard } from './components/driver/DriverDashboard';
import { MoeenAssistant } from './components/common/MoeenAssistant';
import { AdminPasscodeModal } from './components/common/AdminPasscodeModal';
import { WorkerLoginModal } from './components/worker/WorkerLoginModal';
import { StorageService } from './services/storage';
import { Wrench, Shield, Lock } from 'lucide-react';

export default function App() {
  const [currentRole, setCurrentRole] = useState<UserRole>('driver');
  const [language, setLanguage] = useState<Language>('ar');
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  });
  const [isAdminPasscodeOpen, setIsAdminPasscodeOpen] = useState<boolean>(false);
  const [isWorkerLoginOpen, setIsWorkerLoginOpen] = useState<boolean>(false);

  // Check if a worker is already logged in on mount
  useEffect(() => {
    const loggedInWorker = StorageService.getLoggedInWorker();
    if (loggedInWorker) {
      setCurrentRole('worker');
    }
  }, []);

  // Dark mode class
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // RTL/LTR
  useEffect(() => {
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
  }, [language]);

  const handleAdminPasscodeSuccess = () => {
    setIsAdminPasscodeOpen(false);
    setCurrentRole('admin');
  };

  const handleWorkerLoginSuccess = (worker: Worker) => {
    setIsWorkerLoginOpen(false);
    setCurrentRole('worker');
  };

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-cairo antialiased selection:bg-emerald-500 selection:text-white transition-colors duration-200">
      {/* Top Header with Segregated Controls */}
      <Header
        currentRole={currentRole}
        onRoleChange={setCurrentRole}
        language={language}
        onLanguageChange={setLanguage}
        darkMode={darkMode}
        onToggleDarkMode={() => setDarkMode(!darkMode)}
        onOpenAdminPasscode={() => setIsAdminPasscodeOpen(true)}
        onOpenWorkerLogin={() => setIsWorkerLoginOpen(true)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-6 lg:p-8">
        {currentRole === 'admin' && <AdminDashboard />}
        {currentRole === 'worker' && <WorkerDashboard />}
        {currentRole === 'driver' && <DriverDashboard />}
      </main>

      {/* Intelligent Voice Assistant "معين" */}
      <MoeenAssistant currentRole={currentRole} />

      {/* Admin 4-Digit Passcode Modal */}
      <AdminPasscodeModal
        isOpen={isAdminPasscodeOpen}
        onClose={() => setIsAdminPasscodeOpen(false)}
        onSuccess={handleAdminPasscodeSuccess}
      />

      {/* Worker Daily Passcode Login Modal */}
      <WorkerLoginModal
        isOpen={isWorkerLoginOpen}
        onClose={() => setIsWorkerLoginOpen(false)}
        onSuccess={handleWorkerLoginSuccess}
      />

      {/* Discrete Footer with Portal Gateway */}
      <footer className="mt-auto border-t border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 backdrop-blur-sm py-5 px-4 text-xs text-slate-500 dark:text-slate-400">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-emerald-800 dark:text-emerald-400">
              شركة كارجاس للغاز الطبيعي للمركبات (CARGAS NGV)
            </span>
            <span>• طاقة خضراء مستدامة</span>
          </div>

          {/* Discreet Staff Portal link for Technicians (Keeps Customer Interface Clean & Segregated) */}
          {currentRole === 'driver' && (
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsWorkerLoginOpen(true)}
                className="text-[11px] font-semibold text-slate-400 hover:text-emerald-700 dark:hover:text-emerald-400 flex items-center gap-1 transition-colors"
                title="تسجيل دخول فني المحطة بالرمز اليومي"
              >
                <Wrench className="w-3.5 h-3.5" />
                <span>بوابة فنيي المحطات (الوردية)</span>
              </button>

              <span className="text-slate-300 dark:text-slate-700">•</span>

              <button
                onClick={() => setIsAdminPasscodeOpen(true)}
                className="text-[11px] font-semibold text-slate-400 hover:text-amber-500 flex items-center gap-1 transition-colors"
                title="دخول مدير النظام"
              >
                <Lock className="w-3 h-3" />
                <span>الإدارة</span>
              </button>
            </div>
          )}

          <div className="text-[11px] leading-relaxed text-center sm:text-left">
            تطوير وابتكار: <strong className="text-slate-800 dark:text-slate-200">شركة عزوتي للبرمجيات وتكنولوجيا المعلومات</strong> | المطور والمالك: <strong className="text-slate-800 dark:text-slate-200">محمد عبد الرحمن يوسف</strong>. كافة حقوق الملكية الفكرية وتصميم المنظومة محفوظة.
          </div>
        </div>
      </footer>
    </div>
  );
}
