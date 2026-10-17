import React, { useState, useEffect, useRef } from 'react';
import {
  Wrench,
  Camera,
  QrCode,
  CheckCircle,
  AlertTriangle,
  Fuel,
  DollarSign,
  Award,
  Sparkles,
  MapPin,
  Clock,
  Car,
  UserCheck,
  ShieldCheck,
  RefreshCw,
  Zap,
  Check,
  AlertCircle,
  Play,
  Square,
  FileText,
  Ticket,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Worker, Driver, Station, Dispenser, Transaction, SystemConfig } from '../../types';
import { StorageService } from '../../services/storage';

export const WorkerDashboard: React.FC = () => {
  const [worker, setWorker] = useState<Worker>(StorageService.getActiveWorker());
  const [stations, setStations] = useState<Station[]>(StorageService.getStations());
  const [dispensers, setDispensers] = useState<Dispenser[]>(StorageService.getDispensers());
  const [drivers, setDrivers] = useState<Driver[]>(StorageService.getDrivers());
  const [config, setConfig] = useState<SystemConfig>(StorageService.getConfig());

  // Scanner & Fueling State
  const [isScanning, setIsScanning] = useState(false);
  const [scannedDriver, setScannedDriver] = useState<Driver | null>(null);
  const [dispensedQuantity, setDispensedQuantity] = useState<string>('20.0');
  const [selectedDispenserId, setSelectedDispenserId] = useState<string>(
    worker.activeShift?.dispenserId || dispensers[0]?.id || ''
  );

  // Anti-fraud simulation state
  const [simulateOutsideStation, setSimulateOutsideStation] = useState(false);
  const [fraudWarning, setFraudWarning] = useState<string | null>(null);
  const [lastConfirmedTxn, setLastConfirmedTxn] = useState<Transaction | null>(null);
  const [toastMessage, setToastMessage] = useState<string>('');

  // Voucher Validation Modal State
  const [isVoucherModalOpen, setIsVoucherModalOpen] = useState(false);
  const [voucherCodeInput, setVoucherCodeInput] = useState('');
  const [voucherPinInput, setVoucherPinInput] = useState('');
  const [voucherError, setVoucherError] = useState('');
  const [voucherSuccess, setVoucherSuccess] = useState('');

  // Camera video ref
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  const currentStation = stations.find(s => s.id === worker.stationId) || stations[0];
  const currentDispenser = dispensers.find(d => d.id === selectedDispenserId) || dispensers[0];

  // Start / Stop Camera Stream
  const startCamera = async () => {
    setIsScanning(true);
    setFraudWarning(null);
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' },
        });
        mediaStreamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
        }
      }
    } catch (err) {
      console.log('Camera access denied or unavailable, simulation mode ready.', err);
    }
  };

  const stopCamera = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }
    setIsScanning(false);
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  // Handle Driver QR Identification (via Camera scan or Test Driver selection)
  const handleSelectDriver = (driver: Driver) => {
    stopCamera();
    setScannedDriver(driver);

    // Anti-Fraud Check 1: Time-window check (has vehicle refueled in last 15 min?)
    const recentTxns = StorageService.getTransactions();
    const lastVehicleTxn = recentTxns.find(
      t => t.plateNumber === driver.plateNumber && t.stationId === currentStation.id
    );

    // If within 15 mins (for demo, check timestamp)
    if (lastVehicleTxn && lastVehicleTxn.id === 'TXN-RECENT-SAMPLE') {
      setFraudWarning('تحذير تكرار: تم تموين هذه المركبة منذ أقل من 15 دقيقة!');
    } else {
      setFraudWarning(null);
    }

    // Default suggested quantity based on tank capacity
    setDispensedQuantity(String(Math.min(22, driver.tankCapacityM3)));
  };

  // Toggle Shift Status
  const handleToggleShift = () => {
    const updatedWorker = { ...worker };
    const nextStatus = !updatedWorker.activeShift.isActive;
    updatedWorker.activeShift.isActive = nextStatus;

    if (nextStatus) {
      updatedWorker.activeShift.startTime = new Date().toLocaleTimeString('ar-EG', {
        hour: '2-digit',
        minute: '2-digit',
      });
      StorageService.addAuditLog({
        id: `AUD-${Date.now().toString().slice(-5)}`,
        timestamp: new Date().toLocaleString('ar-EG'),
        eventType: 'shift_started',
        title: `بدء وردية جديدة للفني ${worker.name}`,
        details: `المحطة: ${currentStation.name} | المضخة: ${currentDispenser.dispenserNumber}`,
        severity: 'info',
        user: `${worker.id} (${worker.name})`,
        stationName: currentStation.name,
      });
    }

    setWorker(updatedWorker);
    StorageService.saveWorkers([updatedWorker]);
    setToastMessage(nextStatus ? 'تم بدء الوردية بنجاح! جاهز لاستقبال السيارات ⛽' : 'تم إغلاق الوردية');
    setTimeout(() => setToastMessage(''), 3000);
  };

  // Calculate live values
  const numericQty = parseFloat(dispensedQuantity) || 0;
  const pricePerM3 = config.egpPerM3;
  const totalCost = (numericQty * pricePerM3).toFixed(2);
  const earnedPoints = Math.round(numericQty * config.pointsPerM3);
  const calculatedCommission = (numericQty * config.workerCommissionPerM3).toFixed(2);

  // Confirm Fueling
  const handleConfirmFueling = () => {
    if (!scannedDriver) return;

    if (!worker.activeShift.isActive) {
      alert('يجب بدء الوردية أولاً لتتمكن من تأكيد العملية');
      return;
    }

    if (numericQty <= 0) {
      alert('يرجى إدخال كمية صحيحة بالمتر المكعب');
      return;
    }

    // Anti-fraud: Geo-fencing evaluation
    const isInside = !simulateOutsideStation;
    const distanceMeters = isInside ? Math.floor(10 + Math.random() * 30) : 680;
    const fraudReason = !isInside
      ? 'مخالفة نطاق جغرافي: الجهاز خارج حرم المحطة (> 150م)'
      : numericQty > scannedDriver.tankCapacityM3 * 1.2
      ? 'كمية الغاز تتجاوز سعة أسطوانة المركبة المقررة'
      : undefined;

    const result = StorageService.recordFueling({
      driverId: scannedDriver.id,
      workerId: worker.id,
      stationId: currentStation.id,
      dispenserId: currentDispenser.id,
      m3Quantity: numericQty,
      geoVerified: isInside,
      workerLat: currentStation.coordinates.lat + (isInside ? 0.0001 : 0.008),
      workerLng: currentStation.coordinates.lng + (isInside ? 0.0001 : 0.008),
      distanceMeters,
      fraudFlag: fraudReason,
    });

    if (result.success) {
      // Fire celebration confetti!
      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#117A38', '#FFC72C', '#FFFFFF'],
      });

      setLastConfirmedTxn(result.transaction);
      setWorker(StorageService.getActiveWorker());
      setScannedDriver(null);
      setToastMessage(`تم تأكيد التموين بنجاح! +${calculatedCommission} ج.م عمولة الوردية`);
      setTimeout(() => setToastMessage(''), 4000);
    } else {
      alert(result.error || 'حدث خطأ أثناء تسجيل العملية');
    }
  };

  // Handler for technician validating customer voucher using received WhatsApp OTP PIN
  const handleWorkerVerifyVoucher = (e: React.FormEvent) => {
    e.preventDefault();
    if (!voucherCodeInput.trim() || !voucherPinInput.trim()) {
      setVoucherError('يرجى إدخال رقم القسيمة الفريد وكود الاعتماد المستلم على الواتساب');
      return;
    }

    const res = StorageService.verifyVoucherAuthPinByCode(
      voucherCodeInput.trim(),
      voucherPinInput.trim(),
      worker.name
    );

    if (res.success && res.voucher) {
      confetti({
        particleCount: 90,
        spread: 75,
        origin: { y: 0.6 },
        colors: ['#117A38', '#FFC72C', '#FFFFFF'],
      });
      setVoucherSuccess(
        `✓ تم اعتماد وتنفيذ القسيمة بنجاح! الخدمة: ${res.voucher.rewardTitle} لصالح: ${res.voucher.driverName || 'العميل'}`
      );
      setVoucherError('');
      setToastMessage('تم اعتماد وصرف القسيمة بنجاح! 🎟️');
      setTimeout(() => {
        setIsVoucherModalOpen(false);
        setVoucherCodeInput('');
        setVoucherPinInput('');
        setVoucherSuccess('');
      }, 3000);
    } else {
      setVoucherError(res.error || 'كود الاعتماد أو رقم القسيمة غير صحيح');
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-emerald-800 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-2 text-sm font-bold border-2 border-amber-400 animate-bounce">
          <CheckCircle className="w-5 h-5 text-amber-300" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Worker Active Shift Header Card */}
      <div className="bg-gradient-to-r from-emerald-900 via-emerald-800 to-emerald-950 text-white rounded-3xl p-5 sm:p-6 shadow-xl border border-emerald-700/40 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-14 h-14 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center font-black shadow-lg">
              <Wrench className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-black">{worker.name}</h2>
                <span className="bg-emerald-700/80 text-emerald-200 text-[10px] font-mono px-2 py-0.5 rounded-md">
                  {worker.id}
                </span>
              </div>
              <p className="text-xs text-emerald-200/90 mt-0.5 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-amber-300" />
                <span>{currentStation.name}</span>
              </p>
            </div>
          </div>

          {/* Shift & Voucher Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto justify-between sm:justify-end">
            {config.pageVisibility?.showWorkerVoucherValidation !== false && (
              <button
                onClick={() => {
                  setIsVoucherModalOpen(true);
                  setVoucherError('');
                  setVoucherSuccess('');
                }}
                className="px-3.5 py-2.5 rounded-2xl text-xs font-bold bg-white/10 hover:bg-white/20 text-white border border-white/20 flex items-center gap-1.5 transition-all shadow-md active:scale-95"
                title="اعتماد وصرف قسيمة مكافأة أو صيانة بالرقم الفريد"
              >
                <Ticket className="w-4 h-4 text-amber-300" />
                <span>اعتماد قسيمة مكافأة 🎟️</span>
              </button>
            )}

            <div className="text-right">
              <span className="text-[10px] text-emerald-300 block">حالة الوردية</span>
              <span className={`text-xs font-black ${worker.activeShift.isActive ? 'text-amber-300' : 'text-slate-400'}`}>
                {worker.activeShift.isActive ? 'نشطة ومسجلة ✓' : 'مغلقة'}
              </span>
            </div>

            <button
              onClick={handleToggleShift}
              className={`px-4 py-2.5 rounded-2xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-md ${
                worker.activeShift.isActive
                  ? 'bg-rose-600 hover:bg-rose-700 text-white'
                  : 'bg-amber-400 hover:bg-amber-300 text-slate-950'
              }`}
            >
              {worker.activeShift.isActive ? (
                <>
                  <Square className="w-4 h-4" />
                  <span>إنهاء الوردية</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" />
                  <span>بدء الوردية الآن</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Live Shift Counter Strip */}
        <div className="grid grid-cols-3 gap-2 mt-5 pt-4 border-t border-emerald-700/50 text-center">
          <div className="bg-emerald-950/50 p-2.5 rounded-2xl border border-emerald-800/40">
            <span className="text-[10px] text-emerald-300 block font-medium">الغاز المضخوخ</span>
            <span className="text-lg font-black text-white">
              {worker.activeShift.dispensedM3} <span className="text-[10px] text-amber-300">م³</span>
            </span>
          </div>
          <div className="bg-emerald-950/50 p-2.5 rounded-2xl border border-emerald-800/40">
            <span className="text-[10px] text-emerald-300 block font-medium">العمليات المنجزة</span>
            <span className="text-lg font-black text-white">
              {worker.activeShift.transactionsCount}
            </span>
          </div>
          <div className="bg-emerald-950/50 p-2.5 rounded-2xl border border-emerald-800/40">
            <span className="text-[10px] text-emerald-300 block font-medium">عمولة الوردية</span>
            <span className="text-lg font-black text-amber-300">
              {worker.activeShift.earnedCommissionEGP} <span className="text-[10px]">ج.م</span>
            </span>
          </div>
        </div>
      </div>

      {/* Main Fueling & QR Scanner Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: QR Scanner & Customer Verification */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between text-right">
            <div>
              <h3 className="font-black text-lg text-slate-900 dark:text-white flex items-center gap-2">
                <Camera className="w-6 h-6 text-emerald-600" />
                {config.pageVisibility?.workerHeaderTitle || 'مسح كيو آر كود السائق وتوثيق التموين'}
              </h3>
              <p className="text-xs text-slate-500">
                {config.pageVisibility?.workerScannerHelpText || 'امسح الكود الشخصي من هاتف السائق للتحقق الفوري من لوحة المركبة ورصيده.'}
              </p>
            </div>

            {/* Select Dispenser */}
            <div className="text-left">
              <select
                value={selectedDispenserId}
                onChange={e => setSelectedDispenserId(e.target.value)}
                className="py-1.5 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-slate-200"
              >
                {dispensers.map(d => (
                  <option key={d.id} value={d.id}>
                    مضخة #{d.dispenserNumber}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Camera Viewfinder / Simulation Box */}
          {!scannedDriver ? (
            <div className="space-y-3">
              {config.pageVisibility?.showWorkerCamera !== false && (
                <div className="relative w-full aspect-video sm:aspect-[4/3] bg-slate-950 rounded-3xl overflow-hidden border-2 border-emerald-600 flex flex-col items-center justify-center text-center p-4">
                  {isScanning ? (
                    <>
                      <video
                        ref={videoRef}
                        playsInline
                        muted
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                      {/* Viewfinder Target & Laser Scan Animation */}
                      <div className="relative z-10 w-56 h-56 border-2 border-amber-400 rounded-2xl flex items-center justify-center overflow-hidden">
                        <div className="w-full h-1 bg-amber-400 absolute scanner-laser shadow-[0_0_12px_#FFC72C]" />
                        <span className="text-[11px] font-bold text-white/80 bg-black/50 px-2 py-1 rounded">
                          وجّه الكاميرا نحو كود السائق
                        </span>
                      </div>

                      <button
                        onClick={stopCamera}
                        className="absolute bottom-4 z-20 px-4 py-1.5 bg-rose-600/90 text-white text-xs font-bold rounded-full"
                      >
                        إيقاف الكاميرا
                      </button>
                    </>
                  ) : (
                    <div className="space-y-3 z-10">
                      <div className="w-16 h-16 rounded-full bg-emerald-900/60 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/30">
                        <Camera className="w-8 h-8" />
                      </div>
                      <div>
                        <h4 className="text-white font-bold text-sm">كاميرا المسح اللحظي</h4>
                        <p className="text-xs text-slate-400 mt-0.5">
                          اضغط لفتح الكاميرا لمسح كود هاتف السائق
                        </p>
                      </div>

                      <button
                        onClick={startCamera}
                        className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-lg inline-flex items-center gap-2"
                      >
                        <Camera className="w-4 h-4 text-amber-300" />
                        <span>تشغيل كاميرا الماسح</span>
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Fast Test Scanner: One-click driver selection for testing anywhere! */}
              {config.pageVisibility?.showWorkerDemoDrivers !== false && (
                <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700">
                  <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 block mb-2 text-right flex items-center justify-between">
                    <span>أو اختر سائق تجريبي للمحاكاة الفورية (Test Simulation Scanner):</span>
                    <span className="text-[10px] text-emerald-600 font-normal">نقرة واحدة</span>
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {drivers.map(d => (
                      <button
                        key={d.id}
                        onClick={() => handleSelectDriver(d)}
                        className="p-2.5 bg-white dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 rounded-xl border border-slate-200 dark:border-slate-700 text-right transition-all hover:border-emerald-500"
                      >
                        <div className="font-bold text-xs text-slate-900 dark:text-white truncate">
                          {d.name}
                        </div>
                        <div className="text-[10px] font-mono text-emerald-700 dark:text-emerald-400 font-bold">
                          {d.plateNumber}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {d.vehicleType === 'taxi' ? 'تاكسي' : d.vehicleType === 'microbus' ? 'ميكروباص' : 'ملاكي'}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Scanned Customer Verification Card */
            <div className="space-y-4 animate-fadeIn">
              <div className="p-4 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border-2 border-emerald-500 text-right">
                <div className="flex items-center justify-between mb-3">
                  <span className="bg-emerald-700 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1.5">
                    <UserCheck className="w-3.5 h-3.5" />
                    تم التحقق من بيانات السائق
                  </span>
                  <button
                    onClick={() => {
                      setScannedDriver(null);
                      startCamera();
                    }}
                    className="text-xs text-emerald-700 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-300 font-bold flex items-center gap-1 bg-emerald-100/70 dark:bg-emerald-950 px-2.5 py-1 rounded-xl transition-colors"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>مسح سائق آخر</span>
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div>
                    <span className="text-[10px] text-slate-500 block">اسم السائق</span>
                    <span className="text-sm font-bold text-slate-900 dark:text-white">
                      {scannedDriver.name}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">رقم لوحة المركبة</span>
                    <span className="text-sm font-mono font-black text-emerald-700 dark:text-emerald-400 bg-white dark:bg-slate-900 px-2.5 py-1 rounded-lg border border-emerald-300 dark:border-emerald-800 inline-block">
                      {scannedDriver.plateNumber}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">طراز ونوع المركبة</span>
                    <span className="text-xs text-slate-700 dark:text-slate-300">
                      {scannedDriver.vehicleModel}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">فئة الولاء والرصيد</span>
                    <span className="text-xs font-bold text-amber-600 dark:text-amber-400">
                      {scannedDriver.pointsBalance} نقطة ({scannedDriver.tier})
                    </span>
                  </div>
                </div>

                {fraudWarning && (
                  <div className="p-2.5 bg-rose-100 text-rose-800 rounded-xl text-xs font-bold flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                    <span>{fraudWarning}</span>
                  </div>
                )}
              </div>

              {/* Quantity Entry & Quick buttons */}
              <div className="space-y-3 text-right">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  كمية الغاز الطبيعي المضخوخة فعلياً (متر مكعب m³)
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    step="0.5"
                    min="1"
                    max="60"
                    value={dispensedQuantity}
                    onChange={e => setDispensedQuantity(e.target.value)}
                    className="w-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border-2 border-emerald-600 text-2xl font-black text-center text-slate-900 dark:text-white focus:outline-none focus:ring-4 focus:ring-emerald-500/20"
                  />
                  <span className="text-lg font-black text-emerald-700 dark:text-emerald-400">
                    م³
                  </span>
                </div>

                {/* Quick Add Presets */}
                <div className="flex items-center gap-2">
                  {['10', '15', '20', '25', 'ملء تانك'].map(val => (
                    <button
                      key={val}
                      type="button"
                      onClick={() =>
                        setDispensedQuantity(
                          val === 'ملء تانك'
                            ? String(scannedDriver.tankCapacityM3)
                            : val
                        )
                      }
                      className="flex-1 py-2 rounded-xl bg-slate-100 hover:bg-emerald-50 dark:bg-slate-800 dark:hover:bg-emerald-950/40 text-xs font-bold text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition-colors"
                    >
                      {val === 'ملء تانك' ? 'فل تانك' : `+${val}`}
                    </button>
                  ))}
                </div>

                {/* Real-time Calculation Summary */}
                <div className="p-3.5 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-between text-xs">
                  <div>
                    <span className="text-slate-500 block">إجمالي السعر للمستهلك</span>
                    <span className="text-base font-black text-slate-900 dark:text-white">
                      {totalCost} ج.م
                    </span>
                  </div>
                  <div className="text-center">
                    <span className="text-slate-500 block">نقاط السائق المكتسبة</span>
                    <span className="text-base font-black text-amber-500">
                      +{earnedPoints} نقطة
                    </span>
                  </div>
                  <div className="text-left">
                    <span className="text-slate-500 block">عمولتك كفني</span>
                    <span className="text-base font-black text-emerald-600 dark:text-emerald-400">
                      +{calculatedCommission} ج.م
                    </span>
                  </div>
                </div>

                {/* Confirm Action Button */}
                <button
                  onClick={handleConfirmFueling}
                  className="w-full py-4 bg-emerald-700 hover:bg-emerald-800 text-white font-black text-base rounded-2xl shadow-xl flex items-center justify-center gap-2 active:scale-98 transition-all"
                >
                  <Fuel className="w-5 h-5 text-amber-300" />
                  <span>تأكيد التموين وإصدار الفاتورة وإضافة النقاط</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Anti-Fraud Checks & Worker Incentive Program */}
        <div className="lg:col-span-5 space-y-5">
          {/* Strict Anti-Fraud Guard Engine (Visible based on Admin setting; logic always runs) */}
          {config.showAntiFraudToWorker !== false && (
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm text-right space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-600" />
                  صمام الأمان والتحقق من التلاعب (Anti-Fraud)
                </span>
                <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                  نظام صارم
                </span>
              </div>

              <div className="space-y-2 text-xs">
                {/* Check 1: Geo-fencing */}
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                  <div>
                    <span className="font-bold block text-slate-800 dark:text-slate-200">
                      1. السياج الجغرافي (GPS Geofence)
                    </span>
                    <span className="text-[10px] text-slate-400">
                      نطاق {config.geofenceRadiusMeters}م من مركز المحطة
                    </span>
                  </div>
                  <span
                    className={`text-[11px] font-bold px-2 py-0.5 rounded-md ${
                      !simulateOutsideStation
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-rose-100 text-rose-800 animate-pulse'
                    }`}
                  >
                    {!simulateOutsideStation ? '✓ داخل المحطة (14م)' : '⚠️ خارج الحرم (680م)'}
                  </span>
                </div>

                {/* Check 2: Shift active */}
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                  <div>
                    <span className="font-bold block text-slate-800 dark:text-slate-200">
                      2. صلاحية الوردية (Shift Validation)
                    </span>
                    <span className="text-[10px] text-slate-400">
                      فني مصرح له ومسجل حضور
                    </span>
                  </div>
                  <span
                    className={`text-[11px] font-bold px-2 py-0.5 rounded-md ${
                      worker.activeShift.isActive
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    {worker.activeShift.isActive ? '✓ مصرح ونشط' : '✕ غير مفعل'}
                  </span>
                </div>

                {/* Check 3: Time window */}
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                  <div>
                    <span className="font-bold block text-slate-800 dark:text-slate-200">
                      3. قفل التردد الزمني (Time-Window)
                    </span>
                    <span className="text-[10px] text-slate-400">
                      منع تكرار نفس اللوحة خلال 15 دقيقة
                    </span>
                  </div>
                  <span className="text-[11px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-md">
                    ✓ مفعل تلقائياً
                  </span>
                </div>
              </div>

              {/* Test Simulation Toggle for Reviewers */}
              <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
                <label className="flex items-center justify-between text-xs font-semibold text-slate-600 dark:text-slate-300 cursor-pointer">
                  <span>محاكاة تموين خارج المحطة (لاختبار كشف التلاعب):</span>
                  <input
                    type="checkbox"
                    checked={simulateOutsideStation}
                    onChange={e => setSimulateOutsideStation(e.target.checked)}
                    className="w-4 h-4 text-rose-600 rounded"
                  />
                </label>
              </div>
            </div>
          )}

          {/* WORKER INCENTIVE PROGRAM & CLEAN AUDIT BONUS */}
          {config.showWorkerIncentiveToWorker !== false && (
            <div className="bg-gradient-to-br from-amber-50 to-emerald-50 dark:from-slate-900 dark:to-emerald-950/40 rounded-3xl p-5 border border-amber-300/60 dark:border-emerald-800 shadow-sm text-right space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-black text-base text-slate-900 dark:text-white flex items-center gap-2">
                  <Award className="w-5 h-5 text-amber-500" />
                  برنامج حوافز الفنيين والتدقيق النظيف
                </h3>
                <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                  config.workerIncentiveEnabled !== false
                    ? 'bg-amber-400 text-emerald-950'
                    : 'bg-slate-300 text-slate-700'
                }`}>
                  {config.workerIncentiveEnabled !== false ? 'حوافز نشطة ✓' : 'الحوافز متوقفة ✕'}
                </span>
              </div>

              {/* Clean Audit Bonus Tracker Card */}
              <div className="bg-white dark:bg-slate-900/90 p-4 rounded-2xl border border-amber-200 dark:border-amber-900/40 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    حافز التدقيق النظيف (Clean Audit Bonus)
                  </span>
                  <span className="text-sm font-black text-amber-600 dark:text-amber-400">
                    +{config.cleanAuditBonusAmountEGP} ج.م شهرياً
                  </span>
                </div>

                {/* Streak Tracker */}
                <div className="space-y-1 mb-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500">سلسلة الأيام النظيفة بدون تلاعب:</span>
                    <span className="font-black text-emerald-700 dark:text-emerald-400">
                      {worker.cleanAuditStreakDays} يوماً متتالياً 🔥
                    </span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-500 to-amber-400 rounded-full"
                      style={{ width: `${Math.min(100, (worker.cleanAuditStreakDays / 30) * 100)}%` }}
                    />
                  </div>
                </div>

                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                  {config.workerIncentiveEnabled !== false
                    ? '🎖️ تهانينا! سجلك خالي من المخالفات الجغرافية أو محاولات التلاعب. أنت مؤهل لصرف المكافأة كاملة في نهاية الشهر.'
                    : '⚠️ برنامج الحوافز متوقف مؤقتاً بقرار من مدير النظام.'}
                </p>
              </div>

              {/* Monthly Earnings & Ranking */}
              <div className="grid grid-cols-2 gap-3 text-center">
                <div className="bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200 dark:border-slate-800">
                  <span className="text-[10px] text-slate-500 block">إجمالي عمولة الشهر</span>
                  <span className="text-lg font-black text-emerald-700 dark:text-emerald-400">
                    {worker.monthlyCommissionEGP} ج.م
                  </span>
                </div>
                <div className="bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200 dark:border-slate-800">
                  <span className="text-[10px] text-slate-500 block">ترتيبك بالمحطة</span>
                  <span className="text-lg font-black text-amber-500">
                    المركز {worker.stationRank} 🏆
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Last Confirmed Fueling Receipt */}
          {lastConfirmedTxn && (
            <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl border-2 border-dashed border-emerald-600 text-right animate-fadeIn">
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-xs text-emerald-800 dark:text-emerald-400 flex items-center gap-1">
                  <FileText className="w-4 h-4" />
                  إيصال التموين الإلكتروني المعتمد
                </span>
                <span className="text-[10px] font-mono text-slate-400">
                  {lastConfirmedTxn.receiptNumber}
                </span>
              </div>

              <div className="text-xs space-y-1 text-slate-700 dark:text-slate-300">
                <div className="flex justify-between">
                  <span className="text-slate-500">المركبة:</span>
                  <span className="font-bold">{lastConfirmedTxn.plateNumber} ({lastConfirmedTxn.driverName})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">الكمية:</span>
                  <span className="font-bold">{lastConfirmedTxn.m3Quantity} م³</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">المبلغ المدفوع:</span>
                  <span className="font-bold text-slate-900 dark:text-white">{lastConfirmedTxn.totalCostEGP} ج.م</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">النقاط المضافة:</span>
                  <span className="font-bold text-amber-500">+{lastConfirmedTxn.earnedPoints} نقطة</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* WORKER VOUCHER VERIFICATION MODAL */}
      {isVoucherModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border-2 border-emerald-600 text-right space-y-4 relative">
            <button
              onClick={() => setIsVoucherModalOpen(false)}
              className="absolute top-4 left-4 p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600"
            >
              ✕
            </button>

            <div className="border-b border-slate-200 dark:border-slate-800 pb-3 text-center">
              <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-widest block">
                CARGAS VOUCHER VALIDATION
              </span>
              <h3 className="text-lg font-black text-slate-900 dark:text-white mt-0.5">
                اعتماد وصرف قسيمة مكافأة / زيوت / صيانة
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                أدخل رقم القسيمة الفريد الظاهر على شاشة هاتف العميل وكود الاعتماد (OTP) المستلم على واتسابك
              </p>
            </div>

            <form onSubmit={handleWorkerVerifyVoucher} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  رقم القسيمة الفريد (من شاشة العميل)
                </label>
                <input
                  type="text"
                  placeholder="مثال: CG-FREE-4921-XYZ"
                  value={voucherCodeInput}
                  onChange={e => setVoucherCodeInput(e.target.value)}
                  className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-mono font-bold text-center tracking-wider text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center justify-between">
                  <span>كود اعتماد التنفيذ (4 أرقام):</span>
                  <span className="text-[10px] text-amber-600 font-bold">المستلم عبر الواتساب</span>
                </label>
                <input
                  type="text"
                  maxLength={4}
                  placeholder="أدخل كود الواتساب (4 أرقام)"
                  value={voucherPinInput}
                  onChange={e => setVoucherPinInput(e.target.value)}
                  className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-amber-400 font-mono font-black text-xl text-center tracking-widest text-slate-900 dark:text-white"
                />
              </div>

              {voucherError && (
                <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl font-bold flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{voucherError}</span>
                </div>
              )}

              {voucherSuccess && (
                <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-800 rounded-xl font-bold text-center">
                  {voucherSuccess}
                </div>
              )}

              <div className="pt-2 flex items-center gap-2">
                <button
                  type="submit"
                  className="flex-1 py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl text-xs shadow flex items-center justify-center gap-1.5 active:scale-98 transition-all"
                >
                  <Check className="w-4 h-4" />
                  <span>اعتماد وصرف المكافأة للعميل</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsVoucherModalOpen(false)}
                  className="px-4 py-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-xl text-xs"
                >
                  إغلاق
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
