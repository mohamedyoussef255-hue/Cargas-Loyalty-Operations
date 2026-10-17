import React, { useState } from 'react';
import { Wrench, X, KeyRound, ShieldAlert, CheckCircle2, Clock, MapPin } from 'lucide-react';
import { StorageService } from '../../services/storage';
import { Worker } from '../../types';

interface WorkerLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (worker: Worker) => void;
}

export const WorkerLoginModal: React.FC<WorkerLoginModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [workerId, setWorkerId] = useState('TECH-104');
  const [passcode, setPasscode] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  const shifts = StorageService.getShifts();
  const morningShift = shifts.find(s => s.id === 'SHIFT-MORNING') || shifts[0];

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!workerId.trim() || !passcode.trim()) {
      setErrorMessage('يرجى إدخال كود الفني ورمز المرور اليومي');
      return;
    }

    const auth = StorageService.authenticateWorker(workerId, passcode);
    if (auth.success && auth.worker) {
      onSuccess(auth.worker);
    } else {
      setErrorMessage(auth.error || 'فشل تسجيل الدخول للوردية');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-emerald-600/30 overflow-hidden text-right p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 left-4 p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="w-16 h-16 mx-auto mb-4 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 rounded-2xl flex items-center justify-center shadow-inner">
          <Wrench className="w-8 h-8" />
        </div>

        <h3 className="text-xl font-black text-slate-900 dark:text-white text-center mb-1">
          بوابة فنيي محطات كارجاس (الوردية اليومية)
        </h3>
        <p className="text-xs text-slate-500 text-center mb-6">
          يتم توليد رمز الدخول يومياً من قِبل مدير النظام وينتهي تلقائياً بانتهاء الوردية
        </p>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              رقم / كود الفني التعريفي (Worker ID)
            </label>
            <input
              type="text"
              placeholder="مثال: TECH-104"
              value={workerId}
              onChange={e => setWorkerId(e.target.value)}
              className="w-full p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-mono font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-600 uppercase"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center justify-between">
              <span>كلمة المرور اليومية المولدة (Daily Passcode)</span>
              <span className="text-[10px] text-amber-600 dark:text-amber-400">تصلك عبر الـ SMS</span>
            </label>
            <div className="relative">
              <KeyRound className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                maxLength={6}
                placeholder="أدخل الرمز اليومي (4 أرقام)"
                value={passcode}
                onChange={e => setPasscode(e.target.value)}
                className="w-full p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-mono font-black tracking-widest text-center text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-600"
              />
            </div>
          </div>

          {errorMessage && (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-xl text-xs text-rose-700 dark:text-rose-300 font-semibold flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <button
            type="submit"
            className="w-full py-4 bg-emerald-700 hover:bg-emerald-800 text-white font-black text-sm rounded-2xl shadow-lg flex items-center justify-center gap-2 active:scale-98 transition-all"
          >
            <CheckCircle2 className="w-5 h-5 text-amber-300" />
            <span>تسجيل دخول وتفعيل وردية التموين</span>
          </button>
        </form>

        {/* Dynamic Demo Quick Helper */}
        <div className="mt-5 p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/40 text-[11px] text-amber-900 dark:text-amber-300 space-y-1">
          <div className="font-bold flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            <span>الوردية النشطة حالياً: {morningShift.shiftName}</span>
          </div>
          <div className="flex items-center justify-between">
            <span>الرمز اليومي المولد: <strong className="font-mono text-emerald-800 dark:text-emerald-300">{morningShift.dailyPasscode}</strong></span>
            <button
              type="button"
              onClick={() => {
                setWorkerId('TECH-104');
                setPasscode(morningShift.dailyPasscode);
              }}
              className="text-[10px] bg-amber-200 dark:bg-amber-900/60 px-2 py-0.5 rounded font-bold hover:underline"
            >
              تعبئة تلقائية للاختبار
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
