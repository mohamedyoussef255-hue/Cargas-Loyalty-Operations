import React, { useState } from 'react';
import {
  Car,
  QrCode,
  Sparkles,
  Gift,
  History,
  Fuel,
  Award,
  ChevronRight,
  Sun,
  Share2,
  CheckCircle,
  Clock,
  MapPin,
  FileText,
  AlertCircle,
  Copy,
  Receipt,
  Ticket,
  Wrench,
  Calendar,
  Plus,
  Gauge,
  Printer,
  Percent,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Driver, Transaction, Reward, RedeemedVoucher, MaintenanceSchedule } from '../../types';
import { StorageService } from '../../services/storage';
import { QRCodeRenderer } from '../common/QRCodeRenderer';

export const DriverDashboard: React.FC = () => {
  const [driver, setDriver] = useState<Driver>(StorageService.getActiveDriver());
  const [allDrivers, setAllDrivers] = useState<Driver[]>(StorageService.getDrivers());
  const [transactions, setTransactions] = useState<Transaction[]>(
    StorageService.getTransactions().filter(t => t.driverId === driver.id)
  );
  const [rewards, setRewards] = useState<Reward[]>(StorageService.getRewards());
  const [vouchers, setVouchers] = useState<RedeemedVoucher[]>(
    StorageService.getRedeemedVouchers().filter(v => v.driverId === driver.id)
  );

  const [activeTab, setActiveTab] = useState<'qr_fuel' | 'maintenance' | 'rewards' | 'history'>('qr_fuel');
  const [boostBrightness, setBoostBrightness] = useState(false);
  const [toastMessage, setToastMessage] = useState<string>('');
  const [selectedReceipt, setSelectedReceipt] = useState<Transaction | null>(null);

  // New Maintenance Schedule Form State
  const [serviceType, setServiceType] = useState<'oil_change' | 'cylinder_test' | 'filter_replacement' | 'tire_nitrogen' | 'general_safety'>('oil_change');
  const [serviceTitle, setServiceTitle] = useState('');
  const [serviceDueDate, setServiceDueDate] = useState('');
  const [currentKm, setCurrentKm] = useState<number>(145000);
  const [nextKm, setNextKm] = useState<number>(155000);
  const [serviceStation, setServiceStation] = useState('مركز خدمة كارجاس ألماظة');
  const [serviceNotes, setServiceNotes] = useState('');
  const [showAddMaintenance, setShowAddMaintenance] = useState(false);

  // Selected voucher for Worker Verification PIN modal
  const [activeVoucherForVerification, setActiveVoucherForVerification] = useState<RedeemedVoucher | null>(null);
  const [enteredWorkerPin, setEnteredWorkerPin] = useState('');
  const [pinVerificationError, setPinVerificationError] = useState('');
  const [showWhatsAppPreview, setShowWhatsAppPreview] = useState(false);

  // Dynamic system configuration & CMS Page Visibility
  const [config, setConfig] = useState(StorageService.getConfig());

  React.useEffect(() => {
    const handleUpdate = () => {
      setConfig(StorageService.getConfig());
      setRewards(StorageService.getRewards());
      setAllDrivers(StorageService.getDrivers());
      setDriver(StorageService.getActiveDriver());
    };
    window.addEventListener('cargas_data_updated', handleUpdate);
    return () => window.removeEventListener('cargas_data_updated', handleUpdate);
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  const handleSwitchDriver = (newDriverId: string) => {
    StorageService.setActiveDriverId(newDriverId);
    const selected = allDrivers.find(d => d.id === newDriverId) || allDrivers[0];
    setDriver(selected);
    setTransactions(StorageService.getTransactions().filter(t => t.driverId === selected.id));
    setVouchers(StorageService.getRedeemedVouchers().filter(v => v.driverId === selected.id));
    showToast(`تم التبديل لحساب: ${selected.name}`);
  };

  const handleRedeem = (rewardId: string) => {
    const res = StorageService.redeemReward(rewardId, driver.id);
    if (res.success && res.voucher) {
      setDriver(StorageService.getActiveDriver());
      setVouchers(StorageService.getRedeemedVouchers().filter(v => v.driverId === driver.id));
      setActiveVoucherForVerification(res.voucher);
      setEnteredWorkerPin('');
      setPinVerificationError('');
      showToast('تم إصدار القسيمة الفريدة وإرسال كود الاعتماد لواتساب المسؤول 📲');
    } else {
      alert(res.error || 'عفواً، لم يتم استبدال المكافأة');
    }
  };

  const handleVerifyWorkerPin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeVoucherForVerification) return;

    if (!enteredWorkerPin.trim()) {
      setPinVerificationError('يرجى من فني المحطة إدخال كود الاعتماد الوارد في رسالة الواتساب');
      return;
    }

    const result = StorageService.verifyVoucherAuthPin(
      activeVoucherForVerification.id,
      enteredWorkerPin,
      activeVoucherForVerification.responsibleStaffTitle
    );

    if (result.success && result.voucher) {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#117A38', '#FFC72C', '#FFFFFF'],
      });
      setVouchers(StorageService.getRedeemedVouchers().filter(v => v.driverId === driver.id));
      setActiveVoucherForVerification(result.voucher);
      setPinVerificationError('');
      showToast('تم تأكيد واعتماد الاستبدال بنجاح من المسؤول! 🎉');
    } else {
      setPinVerificationError(result.error || 'كود الاعتماد غير صحيح');
    }
  };

  const handleSaveMaintenance = (e: React.FormEvent) => {
    e.preventDefault();
    if (!serviceTitle.trim() || !serviceDueDate) {
      alert('يرجى إدخال اسم الخدمة وتاريخ الاستحقاق');
      return;
    }

    StorageService.addMaintenanceSchedule(driver.id, {
      driverId: driver.id,
      serviceType,
      title: serviceTitle,
      dueDate: serviceDueDate,
      currentKm,
      nextServiceKm: nextKm,
      stationName: serviceStation,
      status: 'upcoming',
      notes: serviceNotes,
    });

    setDriver(StorageService.getActiveDriver());
    setShowAddMaintenance(false);
    setServiceTitle('');
    setServiceNotes('');
    showToast('تم حفظ موعد الصيانة وتذكير تغيير الزيت بنجاح 🛠️');
  };

  // Targeted promotions for this specific driver
  const driverPromos = StorageService.getPromotionsForDriver(driver);

  return (
    <div className={`space-y-6 ${boostBrightness ? 'bg-white p-4 rounded-3xl' : ''}`}>
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-emerald-800 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-2 text-sm font-bold border-2 border-amber-400 animate-bounce">
          <CheckCircle className="w-5 h-5 text-amber-300" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Driver Switcher Bar (Demo helper) */}
      {config.pageVisibility?.showDriverSwitcher !== false && (
        <div className="bg-white dark:bg-slate-900 p-2.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between text-xs">
          <span className="font-bold text-slate-500 flex items-center gap-1.5">
            <Car className="w-4 h-4 text-emerald-600" />
            <span>تبديل السائق للتجربة:</span>
          </span>
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            {allDrivers.map(d => (
              <button
                key={d.id}
                onClick={() => handleSwitchDriver(d.id)}
                className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all ${
                  driver.id === d.id
                    ? 'bg-emerald-700 text-white shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                }`}
              >
                {d.name.split(' ')[0]} ({d.plateNumber})
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Driver Loyalty Card (Digital Membership) */}
      {config.pageVisibility?.showDriverLoyaltyCard !== false && (
        <div className="bg-gradient-to-br from-emerald-900 via-emerald-800 to-emerald-950 text-white rounded-3xl p-5 sm:p-7 shadow-2xl border border-emerald-700/50 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-72 h-72 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />

          <div className="flex items-start justify-between relative z-10 mb-4">
            <div className="text-right">
              <div className="flex items-center gap-2 mb-1">
                <span className="bg-amber-400 text-emerald-950 text-[10px] font-black px-2 py-0.5 rounded-full uppercase">
                  {driver.tier} Club
                </span>
                <span className="text-xs text-emerald-200 font-mono">
                  {driver.governorate}
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black">{driver.name}</h2>
              <div className="flex items-center gap-2 mt-1">
                <span className="bg-white/10 text-emerald-100 font-mono font-bold text-xs px-2.5 py-0.5 rounded-lg border border-white/10">
                  {driver.plateNumber}
                </span>
                <span className="text-xs text-emerald-200">
                  {driver.vehicleModel}
                </span>
              </div>
            </div>

            <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
              <Fuel className="w-7 h-7 text-amber-400" />
            </div>
          </div>

          {/* Live Counters */}
          <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-emerald-700/60 text-right relative z-10">
            <div className="bg-emerald-950/40 p-2.5 rounded-2xl border border-emerald-800/60">
              <span className="text-[10px] text-emerald-300 block font-medium">رصيد النقاط</span>
              <span className="text-2xl font-black text-amber-300 block">
                {driver.pointsBalance}
              </span>
              <span className="text-[9px] text-emerald-400">~{Math.floor(driver.pointsBalance / 10)} ج.م خصم</span>
            </div>

            <div className="bg-emerald-950/40 p-2.5 rounded-2xl border border-emerald-800/60">
              <span className="text-[10px] text-emerald-300 block font-medium">الغاز المضخوخ</span>
              <span className="text-2xl font-black text-white block">
                {driver.totalM3Pumped} <span className="text-[10px]">م³</span>
              </span>
              <span className="text-[9px] text-slate-300">{driver.totalTransactionsCount} عمليات تموين</span>
            </div>

            <div className="bg-emerald-950/40 p-2.5 rounded-2xl border border-emerald-800/60">
              <span className="text-[10px] text-emerald-300 block font-medium">إجمالي المدفوع</span>
              <span className="text-2xl font-black text-emerald-300 block">
                {driver.totalSpentEGP} <span className="text-[10px]">ج.م</span>
              </span>
              <span className="text-[9px] text-amber-300">توفير ~65% عن البنزين</span>
            </div>
          </div>
        </div>
      )}

      {/* Targeted Promotions Alert Banner if any match */}
      {config.pageVisibility?.showDriverPromotions !== false && driverPromos.length > 0 && (
        <div className="p-4 rounded-3xl bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-md text-right flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-slate-950/20 flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-slate-950" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider block">
                عرض حصري موجه لمركبتك:
              </span>
              <h4 className="font-black text-sm">{driverPromos[0].title}</h4>
              <p className="text-xs leading-tight opacity-90">{driverPromos[0].description}</p>
            </div>
          </div>
          <span className="bg-slate-950 text-amber-400 text-xs font-black px-3 py-1 rounded-xl">
            {driverPromos[0].pointsMultiplier}× نقاط
          </span>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex items-center gap-1.5 sm:gap-2 bg-slate-100 dark:bg-slate-800/80 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-700/60 text-xs sm:text-sm">
        {config.pageVisibility?.showDriverQR !== false && (
          <button
            onClick={() => setActiveTab('qr_fuel')}
            className={`flex-1 py-2.5 rounded-xl font-bold flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'qr_fuel'
                ? 'bg-emerald-700 text-white shadow'
                : 'text-slate-600 dark:text-slate-300 hover:text-emerald-700'
            }`}
          >
            <QrCode className="w-4 h-4" />
            <span>كود التموين بالمحطة</span>
          </button>
        )}

        {config.pageVisibility?.showDriverMaintenance !== false && (
          <button
            onClick={() => setActiveTab('maintenance')}
            className={`flex-1 py-2.5 rounded-xl font-bold flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'maintenance'
                ? 'bg-emerald-700 text-white shadow'
                : 'text-slate-600 dark:text-slate-300 hover:text-emerald-700'
            }`}
          >
            <Wrench className="w-4 h-4" />
            <span>الصيانة وتغيير الزيت</span>
          </button>
        )}

        {config.pageVisibility?.showDriverRewards !== false && (
          <button
            onClick={() => setActiveTab('rewards')}
            className={`flex-1 py-2.5 rounded-xl font-bold flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'rewards'
                ? 'bg-emerald-700 text-white shadow'
                : 'text-slate-600 dark:text-slate-300 hover:text-emerald-700'
            }`}
          >
            <Gift className="w-4 h-4" />
            <span>كتالوج الهدايا</span>
          </button>
        )}

        {config.pageVisibility?.showDriverHistory !== false && (
          <button
            onClick={() => setActiveTab('history')}
            className={`flex-1 py-2.5 rounded-xl font-bold flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'history'
                ? 'bg-emerald-700 text-white shadow'
                : 'text-slate-600 dark:text-slate-300 hover:text-emerald-700'
            }`}
          >
            <History className="w-4 h-4" />
            <span>سجل التموين والتفاصيل</span>
          </button>
        )}
      </div>

      {/* TAB 1: PERSONAL DRIVER QR CODE */}
      {activeTab === 'qr_fuel' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm text-center space-y-4">
          <div>
            <h3 className="font-black text-lg text-slate-900 dark:text-white">
              {config.pageVisibility?.driverWelcomeTitle || 'كود كارجاس الشخصي للتموين'}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {config.pageVisibility?.driverQrHelpText || 'وجّه شاشة هاتفك نحو فني المحطة لمسح الكود وتسجيل نقاط التموين فوراً'}
            </p>
          </div>

          <div className="flex justify-center my-2">
            <div className="p-4 bg-white rounded-3xl border-4 border-emerald-600 shadow-xl inline-block">
              <QRCodeRenderer value={driver.qrToken} size={230} darkColor="#0B4E24" />
              <div className="mt-2 text-center">
                <span className="font-mono font-black text-base text-emerald-900 tracking-wider">
                  {driver.plateNumber}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-center gap-3">
            <button
              onClick={() => setBoostBrightness(!boostBrightness)}
              className="px-4 py-2 bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/40 text-amber-900 dark:text-amber-300 text-xs font-bold rounded-xl border border-amber-300 dark:border-amber-800 flex items-center gap-1.5"
            >
              <Sun className="w-4 h-4 text-amber-500" />
              <span>{boostBrightness ? 'إلغاء وضع السطوع' : 'تعزيز سطوع الشاشة للمسح'}</span>
            </button>
          </div>
        </div>
      )}

      {/* TAB 2: MAINTENANCE & OIL SCHEDULE TRACKER */}
      {activeTab === 'maintenance' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-sm text-right space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-black text-base text-slate-900 dark:text-white flex items-center gap-2">
                <Wrench className="w-5 h-5 text-emerald-600" />
                جدول الصيانة الدورية ومواعيد تغيير الزيت
              </h3>
              <p className="text-xs text-slate-500">
                تسجيل ومتابعة مواعيد تغيير زيت المحرك، فحص أسطوانة الغاز، والصيانة الدورية بمراكز كارجاس.
              </p>
            </div>

            <button
              onClick={() => setShowAddMaintenance(!showAddMaintenance)}
              className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow"
            >
              <Plus className="w-4 h-4 text-amber-300" />
              <span>تسجيل موعد صيانة جديد</span>
            </button>
          </div>

          {/* Add Maintenance Form */}
          {showAddMaintenance && (
            <form onSubmit={handleSaveMaintenance} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3 animate-fadeIn">
              <span className="font-bold text-xs text-slate-900 dark:text-white block mb-1">
                بيانات موعد الصيانة / تغيير الزيت:
              </span>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">نوع الخدمة</label>
                  <select
                    value={serviceType}
                    onChange={e => setServiceType(e.target.value as any)}
                    className="w-full p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold"
                  >
                    <option value="oil_change">تغيير زيت المحرك والفلتر</option>
                    <option value="cylinder_test">الفحص الهيدروستاتيكي لأسطوانة الغاز</option>
                    <option value="filter_replacement">استبدال طقم فلاتر الغاز الطبيعي</option>
                    <option value="tire_nitrogen">فحص الإطارات ونفخ نيتروجين</option>
                    <option value="general_safety">فحص سلامة عام لنظام الغاز</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">عنوان التذكير</label>
                  <input
                    type="text"
                    placeholder="مثال: غيار زيت 10,000 كم"
                    value={serviceTitle}
                    onChange={e => setServiceTitle(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">تاريخ الاستحقاق القادم</label>
                  <input
                    type="date"
                    value={serviceDueDate}
                    onChange={e => setServiceDueDate(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">العداد الحالي (كم)</label>
                  <input
                    type="number"
                    value={currentKm}
                    onChange={e => setCurrentKm(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">العداد المستهدف للصيانة (كم)</label>
                  <input
                    type="number"
                    value={nextKm}
                    onChange={e => setNextKm(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddMaintenance(false)}
                  className="px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-xl"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-700 text-white text-xs font-bold rounded-xl shadow"
                >
                  حفظ الموعد
                </button>
              </div>
            </form>
          )}

          {/* Maintenance List */}
          <div className="space-y-3">
            {(!driver.maintenanceSchedules || driver.maintenanceSchedules.length === 0) ? (
              <p className="text-center text-slate-400 text-xs py-4">
                لا توجد مواعيد صيانة مسجلة حالياً
              </p>
            ) : (
              driver.maintenanceSchedules.map(item => (
                <div
                  key={item.id}
                  className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-right"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 flex items-center justify-center flex-shrink-0">
                      <Wrench className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-900 dark:text-white">
                          {item.title}
                        </span>
                        <span className="bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 text-[10px] font-bold px-2 py-0.5 rounded-md">
                          مستحق
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>تاريخ الاستحقاق: <strong>{item.dueDate}</strong></span>
                        {item.nextServiceKm && (
                          <span>• عند عداد: <strong>{item.nextServiceKm.toLocaleString()} كم</strong></span>
                        )}
                      </p>
                      {item.notes && <p className="text-[11px] text-slate-400 mt-1">{item.notes}</p>}
                    </div>
                  </div>

                  <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-3 py-1.5 rounded-xl">
                    {item.stationName || 'مراكز صيانة كارجاس المعتمدة'}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB 3: REWARDS CATALOG */}
      {activeTab === 'rewards' && (
        <div className="space-y-4 text-right">
          <div className="flex items-center justify-between">
            <h3 className="font-black text-base text-slate-900 dark:text-white flex items-center gap-2">
              <Gift className="w-5 h-5 text-amber-500" />
              كتالوج المكافآت واستبدال النقاط (كافة السيناريوهات)
            </h3>
            <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950 px-3 py-1 rounded-xl">
              رصيدك: {driver.pointsBalance} نقطة
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {rewards.map(reward => {
              const canAfford = driver.pointsBalance >= reward.pointsCost;
              return (
                <div
                  key={reward.id}
                  className="bg-white dark:bg-slate-900 rounded-3xl p-4 sm:p-5 border border-slate-200 dark:border-slate-800 shadow-sm text-right flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 text-xs font-black px-2.5 py-0.5 rounded-lg">
                        {reward.pointsCost} نقطة
                      </span>
                      <span className="text-[10px] text-slate-400 font-bold">
                        {reward.rewardType === 'free_gas_m3'
                          ? '⛽ أمتار غاز مجانية'
                          : reward.rewardType === 'oil_percent_discount'
                          ? '🛢️ خصم نسبة زيوت'
                          : reward.rewardType === 'free_service_labor_only'
                          ? '🔧 صيانة مصنعية'
                          : reward.rewardType === 'free_service_full_parts'
                          ? '🛠️ صيانة شاملة قطع'
                          : reward.rewardType === 'car_wash_discount'
                          ? '🧼 غسيل سيارة'
                          : '🤝 خدمة شريك'}
                      </span>
                    </div>

                    <h4 className="font-bold text-sm text-slate-900 dark:text-white mb-1">
                      {reward.title}
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 leading-relaxed">
                      {reward.description}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                      قيمة الخصم: <strong>{reward.discountValueEGP} ج.م</strong>
                    </span>

                    <button
                      disabled={!canAfford}
                      onClick={() => handleRedeem(reward.id)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                        canAfford
                          ? 'bg-emerald-700 hover:bg-emerald-800 text-white shadow-md active:scale-95'
                          : 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                      }`}
                    >
                      {canAfford ? 'استبدال الآن' : 'نقاطك غير كافية'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Active Vouchers with Worker Verification PIN state */}
          {vouchers.length > 0 && (
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                  <Ticket className="w-4 h-4 text-emerald-600" />
                  قسائمك وكوبوناتك الصادرة (تتطلب إدخال كود اعتماد المسؤول)
                </h4>
                <span className="text-xs text-slate-500">{vouchers.length} قسيمة</span>
              </div>

              <div className="space-y-2">
                {vouchers.map(v => {
                  const isCompleted = v.status === 'completed';
                  return (
                    <div
                      key={v.id}
                      className={`p-3.5 rounded-2xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-right transition-all ${
                        isCompleted
                          ? 'bg-emerald-50/60 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-800'
                          : 'bg-amber-50/70 dark:bg-amber-950/20 border-amber-300 dark:border-amber-900'
                      }`}
                    >
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-bold text-xs text-slate-900 dark:text-white">
                            {v.rewardTitle}
                          </span>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              isCompleted
                                ? 'bg-emerald-600 text-white'
                                : 'bg-amber-500 text-slate-950'
                            }`}
                          >
                            {isCompleted ? '✓ تم الاستبدال والتنفيذ' : '⏳ بانتظار كود المسؤول'}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500">
                          {isCompleted
                            ? `تم الاعتماد بواسطة: ${v.verifiedByWorkerName} • ${v.verifiedAt}`
                            : `كود الاعتماد أرسل لواتساب: ${v.responsibleStaffTitle} (${v.authPinSentToPhone})`}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
                        <span className="bg-white dark:bg-slate-800 px-3 py-1.5 rounded-xl font-mono font-black text-xs text-emerald-700 dark:text-emerald-400 border border-slate-200 dark:border-slate-700 shadow-sm">
                          {v.voucherCode}
                        </span>

                        <button
                          onClick={() => {
                            setActiveVoucherForVerification(v);
                            setEnteredWorkerPin('');
                            setPinVerificationError('');
                          }}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold shadow-sm transition-all ${
                            isCompleted
                              ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                              : 'bg-emerald-700 hover:bg-emerald-800 text-white'
                          }`}
                        >
                          {isCompleted ? 'عرض القسيمة' : 'إدخال كود الفني'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* SECURE VOUCHER REDEMPTION & WORKER WHATSAPP PIN MODAL */}
      {activeVoucherForVerification && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border-2 border-emerald-600 text-right space-y-4 max-h-[92vh] overflow-y-auto relative">
            <button
              onClick={() => setActiveVoucherForVerification(null)}
              className="absolute top-4 left-4 p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600"
            >
              ✕
            </button>

            {/* Modal Header */}
            <div className="text-center border-b border-slate-200 dark:border-slate-800 pb-3">
              <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-widest block">
                CARGAS SMART VOUCHER SYSTEM
              </span>
              <h3 className="text-xl font-black text-slate-900 dark:text-white mt-0.5">
                قسيمة استبدال الخدمة المعتمدة
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                {activeVoucherForVerification.rewardTitle}
              </p>
            </div>

            {/* Unique Voucher Code & QR Card */}
            <div className="p-4 bg-gradient-to-b from-slate-50 to-emerald-50/50 dark:from-slate-800 dark:to-emerald-950/30 rounded-2xl border border-emerald-200 dark:border-emerald-800 text-center space-y-2">
              <div className="flex justify-center">
                <QRCodeRenderer
                  value={activeVoucherForVerification.voucherCode}
                  size={170}
                  darkColor="#0B4E24"
                />
              </div>

              <div>
                <span className="text-[10px] text-slate-400 uppercase font-medium block">
                  كود القسيمة الفريد (Unique Security Identifier):
                </span>
                <span className="text-lg font-mono font-black text-emerald-800 dark:text-emerald-300 tracking-wider">
                  {activeVoucherForVerification.voucherCode}
                </span>
              </div>

              <div className="flex items-center justify-center gap-3 text-xs text-slate-600 dark:text-slate-300 font-semibold pt-1 border-t border-slate-200/60 dark:border-slate-700/60">
                <span>العميل: {activeVoucherForVerification.driverName}</span>
                <span>• اللوحة: {activeVoucherForVerification.plateNumber}</span>
                <span>• القيمة: {activeVoucherForVerification.valueEGP} ج.م</span>
              </div>
            </div>

            {/* WhatsApp Automatic Dispatch Notice Banner */}
            {activeVoucherForVerification.status === 'pending_worker_pin' ? (
              <div className="space-y-4">
                <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 rounded-2xl text-xs space-y-2">
                  <div className="flex items-start gap-2 text-emerald-900 dark:text-emerald-200 font-bold">
                    <span className="text-base">📲</span>
                    <div>
                      <span>تم إرسال كود اعتماد التنفيذ تلقائياً عبر الواتساب إلى هاتف المسؤول:</span>
                      <div className="text-sm font-black text-emerald-800 dark:text-emerald-300 mt-0.5">
                        {activeVoucherForVerification.responsibleStaffTitle} ({activeVoucherForVerification.authPinSentToPhone})
                      </div>
                    </div>
                  </div>

                  {/* Toggle WhatsApp Preview */}
                  <div className="pt-2 border-t border-emerald-200 dark:border-emerald-800/60 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => setShowWhatsAppPreview(!showWhatsAppPreview)}
                      className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 hover:underline flex items-center gap-1"
                    >
                      <span>{showWhatsAppPreview ? 'إخفاء نص الرسالة' : 'معاينة رسالة الواتساب المرسلة للمسؤول'}</span>
                    </button>

                    {activeVoucherForVerification.whatsappDirectUrl && (
                      <a
                        href={activeVoucherForVerification.whatsappDirectUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[11px] font-bold bg-emerald-600 hover:bg-emerald-700 text-white px-2.5 py-1 rounded-lg shadow-sm"
                      >
                        فتح محادثة الواتساب 💬
                      </a>
                    )}
                  </div>

                  {showWhatsAppPreview && (
                    <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-emerald-200 dark:border-emerald-800 text-[11px] font-mono whitespace-pre-line text-slate-700 dark:text-slate-300 animate-fadeIn">
                      {activeVoucherForVerification.whatsappMessageText}
                    </div>
                  )}
                </div>

                {/* Worker PIN Input Section */}
                <form onSubmit={handleVerifyWorkerPin} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border-2 border-amber-400 space-y-3">
                  <div>
                    <label className="block text-xs font-black text-slate-900 dark:text-white mb-1 flex items-center justify-between">
                      <span>كود اعتماد المسؤول (يدخله فني المحطة / مسؤول الخدمة):</span>
                      <span className="text-[10px] text-amber-600 font-bold">4 أرقام من الواتساب</span>
                    </label>
                    <input
                      type="text"
                      maxLength={4}
                      placeholder="أدخل كود الواتساب (مثال: 5832)"
                      value={enteredWorkerPin}
                      onChange={e => setEnteredWorkerPin(e.target.value)}
                      className="w-full p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-center font-mono font-black text-xl tracking-widest text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-600"
                    />
                  </div>

                  {pinVerificationError && (
                    <p className="text-xs text-rose-600 font-bold flex items-center gap-1">
                      <span>⚠️</span>
                      <span>{pinVerificationError}</span>
                    </p>
                  )}

                  <button
                    type="submit"
                    className="w-full py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl text-xs shadow flex items-center justify-center gap-1.5 active:scale-98 transition-all"
                  >
                    <span>اعتماد وتنفيذ الاستبدال فوراً</span>
                  </button>

                  <div className="text-[10px] text-slate-400 text-center">
                    💡 للتجربة السريعة: الكود المرسل لواتساب المسؤول هو: <strong className="font-mono text-emerald-700">{activeVoucherForVerification.secretAuthPin}</strong>
                  </div>
                </form>
              </div>
            ) : (
              /* Verified & Completed State Card */
              <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border-2 border-emerald-600 text-center space-y-2 animate-fadeIn">
                <div className="w-12 h-12 bg-emerald-600 text-white rounded-full flex items-center justify-center mx-auto text-xl shadow-md">
                  ✓
                </div>
                <h4 className="text-base font-black text-emerald-800 dark:text-emerald-300">
                  تم اعتماد وتنفيذ الاستبدال بنجاح!
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  تم إدخال كود الاعتماد الصحيح واعتماد الخدمة من قبل:{' '}
                  <strong>{activeVoucherForVerification.verifiedByWorkerName}</strong>
                  <br />
                  في: <span className="font-mono font-bold">{activeVoucherForVerification.verifiedAt}</span>
                </p>
              </div>
            )}

            <div className="pt-2 text-center">
              <button
                type="button"
                onClick={() => setActiveVoucherForVerification(null)}
                className="px-6 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-xs font-bold rounded-xl"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: DETAILED FUELING HISTORY WITH EXACT TIMESTAMP & CASH PAID */}
      {activeTab === 'history' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm text-right space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-black text-base text-slate-900 dark:text-white flex items-center gap-2">
                <History className="w-5 h-5 text-emerald-600" />
                سجل التموين الدقيق والمبالغ المنصرفة
              </h3>
              <p className="text-xs text-slate-500">
                مراجعة تفاصيل التموين بالتاريخ والوقت بالساعة والدقيقة والمبالغ النقدية المنصرفة والإيصال.
              </p>
            </div>
            <span className="text-xs font-bold text-slate-500">
              {transactions.length} عمليات
            </span>
          </div>

          {transactions.length === 0 ? (
            <p className="text-center text-xs text-slate-400 py-6">
              لم تسجل أي عمليات تموين سابقة حتى الآن
            </p>
          ) : (
            <div className="space-y-3">
              {transactions.map(txn => (
                <div
                  key={txn.id}
                  className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                >
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-sm text-slate-900 dark:text-white">
                        {txn.stationName}
                      </span>
                      <span className="text-[10px] bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold px-2 py-0.5 rounded">
                        طلمبة #{txn.dispenserNumber}
                      </span>
                    </div>

                    {/* Exact Timestamp */}
                    <p className="text-xs text-slate-600 dark:text-slate-300 flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span className="font-mono font-semibold">التاريخ والوقت: {txn.timestamp}</span>
                    </p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      فني التموين: <strong>{txn.workerName}</strong> | رقم الإيصال: {txn.receiptNumber}
                    </p>
                  </div>

                  <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                    <div className="text-left">
                      <div className="font-black text-lg text-emerald-700 dark:text-emerald-400">
                        {txn.totalCostEGP} ج.م
                      </div>
                      <div className="text-xs text-slate-500 font-bold">
                        {txn.m3Quantity} متر مكعب
                      </div>
                    </div>

                    <div className="text-center">
                      <span className="bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 font-black text-xs px-2.5 py-1 rounded-xl block">
                        +{txn.earnedPoints} نقطة
                      </span>
                    </div>

                    <button
                      onClick={() => setSelectedReceipt(txn)}
                      className="p-2.5 bg-emerald-50 dark:bg-emerald-950/50 hover:bg-emerald-100 text-emerald-700 dark:text-emerald-400 rounded-xl transition-colors shadow-sm"
                      title="عرض الإيصال الرسمي"
                    >
                      <Receipt className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Official Receipt Modal */}
      {selectedReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 text-right space-y-4">
            <div className="text-center border-b border-slate-200 dark:border-slate-800 pb-3">
              <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 block">
                شركة كارجاس للغاز الطبيعي للمركبات
              </span>
              <h4 className="text-lg font-black text-slate-900 dark:text-white">
                إيصال تموين وضخ غاز معتمد
              </h4>
              <span className="text-[10px] font-mono text-slate-400">
                {selectedReceipt.receiptNumber}
              </span>
            </div>

            <div className="text-xs space-y-2 text-slate-700 dark:text-slate-300">
              <div className="flex justify-between">
                <span className="text-slate-500">المحطة:</span>
                <span className="font-bold">{selectedReceipt.stationName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">رقم الطلمبة:</span>
                <span className="font-bold">طلمبة رقم {selectedReceipt.dispenserNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">التاريخ والوقت الدقيق:</span>
                <span className="font-mono font-bold">{selectedReceipt.timestamp}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">لوحة المركبة:</span>
                <span className="font-mono font-bold text-emerald-700">{selectedReceipt.plateNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">كمية الغاز:</span>
                <span className="font-black text-slate-900 dark:text-white">{selectedReceipt.m3Quantity} م³</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">سعر المتر المكعب:</span>
                <span>{selectedReceipt.pricePerM3} ج.م</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-slate-200 dark:border-slate-800 text-sm">
                <span className="font-bold text-slate-900 dark:text-white">المبلغ النقدي المسدد:</span>
                <span className="font-black text-emerald-700 dark:text-emerald-400">{selectedReceipt.totalCostEGP} ج.م</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">النقاط المكتسبة:</span>
                <span className="font-bold text-amber-500">+{selectedReceipt.earnedPoints} نقطة ولاء</span>
              </div>
            </div>

            <div className="pt-2 flex gap-2">
              <button
                onClick={() => window.print()}
                className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-xs font-bold rounded-xl flex items-center justify-center gap-1"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>طباعة</span>
              </button>
              <button
                onClick={() => setSelectedReceipt(null)}
                className="flex-1 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
