import {
  Station,
  Dispenser,
  Driver,
  Worker,
  Transaction,
  Promotion,
  Reward,
  RedeemedVoucher,
  PushNotification,
  AuditLog,
  SystemConfig,
  GeographicRegion,
  ShiftTimingConfig,
  DropdownItem,
  MaintenanceSchedule,
} from '../types';
import {
  INITIAL_REGIONS,
  INITIAL_SHIFTS,
  INITIAL_STATIONS,
  INITIAL_DISPENSERS,
  INITIAL_DRIVERS,
  INITIAL_WORKERS,
  INITIAL_TRANSACTIONS,
  INITIAL_PROMOTIONS,
  INITIAL_REWARDS,
  INITIAL_NOTIFICATIONS,
  INITIAL_AUDIT_LOGS,
  INITIAL_DROPDOWNS,
  INITIAL_SYSTEM_CONFIG,
} from '../data/mockData';

const STORAGE_KEYS = {
  STATIONS: 'cargas_stations_v2',
  DISPENSERS: 'cargas_dispensers_v2',
  DRIVERS: 'cargas_drivers_v2',
  WORKERS: 'cargas_workers_v2',
  TRANSACTIONS: 'cargas_transactions_v2',
  PROMOTIONS: 'cargas_promotions_v2',
  REWARDS: 'cargas_rewards_v2',
  VOUCHERS: 'cargas_vouchers_v2',
  NOTIFICATIONS: 'cargas_notifications_v2',
  AUDIT_LOGS: 'cargas_audit_logs_v2',
  CONFIG: 'cargas_config_v2',
  ACTIVE_DRIVER_ID: 'cargas_active_driver_id_v2',
  ACTIVE_WORKER_ID: 'cargas_active_worker_id_v2',
  LOGGED_IN_WORKER: 'cargas_logged_in_worker_v2',
};

function getJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch (e) {
    console.error(`Error loading ${key}`, e);
    return fallback;
  }
}

function setJson<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    window.dispatchEvent(new Event('cargas_data_updated'));
  } catch (e) {
    console.error(`Error saving ${key}`, e);
  }
}

export const StorageService = {
  // Wipe all demo data completely to factory clean state
  wipeAllDemoData: () => {
    localStorage.clear();
    setJson(STORAGE_KEYS.STATIONS, INITIAL_STATIONS);
    setJson(STORAGE_KEYS.DISPENSERS, INITIAL_DISPENSERS);
    setJson(STORAGE_KEYS.DRIVERS, INITIAL_DRIVERS);
    setJson(STORAGE_KEYS.WORKERS, INITIAL_WORKERS);
    setJson(STORAGE_KEYS.TRANSACTIONS, []); // Clear all transactions
    setJson(STORAGE_KEYS.PROMOTIONS, INITIAL_PROMOTIONS);
    setJson(STORAGE_KEYS.REWARDS, INITIAL_REWARDS);
    setJson(STORAGE_KEYS.VOUCHERS, []);
    setJson(STORAGE_KEYS.NOTIFICATIONS, []);
    setJson(STORAGE_KEYS.AUDIT_LOGS, [
      {
        id: `AUD-${Date.now().toString().slice(-5)}`,
        timestamp: new Date().toLocaleString('ar-EG'),
        eventType: 'rules_updated',
        title: 'تم مسح كافة البيانات التجريبية',
        details: 'قام مدير النظام بإعادة تهيئة المنظومة ومسح كافة سجلات التموين والعمليات التجريبية بنجاح.',
        severity: 'warning',
        user: 'مدير النظام (Admin)',
      },
    ]);
    setJson(STORAGE_KEYS.CONFIG, INITIAL_SYSTEM_CONFIG);
    localStorage.removeItem(STORAGE_KEYS.LOGGED_IN_WORKER);
    window.dispatchEvent(new Event('cargas_data_updated'));
  },

  // Reset to full sample database
  resetAll: () => {
    localStorage.clear();
    setJson(STORAGE_KEYS.STATIONS, INITIAL_STATIONS);
    setJson(STORAGE_KEYS.DISPENSERS, INITIAL_DISPENSERS);
    setJson(STORAGE_KEYS.DRIVERS, INITIAL_DRIVERS);
    setJson(STORAGE_KEYS.WORKERS, INITIAL_WORKERS);
    setJson(STORAGE_KEYS.TRANSACTIONS, INITIAL_TRANSACTIONS);
    setJson(STORAGE_KEYS.PROMOTIONS, INITIAL_PROMOTIONS);
    setJson(STORAGE_KEYS.REWARDS, INITIAL_REWARDS);
    setJson(STORAGE_KEYS.VOUCHERS, []);
    setJson(STORAGE_KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS);
    setJson(STORAGE_KEYS.AUDIT_LOGS, INITIAL_AUDIT_LOGS);
    setJson(STORAGE_KEYS.CONFIG, INITIAL_SYSTEM_CONFIG);
    setJson(STORAGE_KEYS.ACTIVE_DRIVER_ID, INITIAL_DRIVERS[0].id);
  },

  // Regions & Stations
  getRegions: (): GeographicRegion[] => {
    const config = StorageService.getConfig();
    return config.regions || INITIAL_REGIONS;
  },
  saveRegions: (regions: GeographicRegion[]) => {
    const cfg = StorageService.getConfig();
    cfg.regions = regions;
    StorageService.saveConfig(cfg);
  },
  getStations: (): Station[] => getJson(STORAGE_KEYS.STATIONS, INITIAL_STATIONS),
  saveStations: (stations: Station[]) => setJson(STORAGE_KEYS.STATIONS, stations),
  addStation: (station: Station) => {
    const list = StorageService.getStations();
    list.unshift(station);
    StorageService.saveStations(list);
  },

  // Dispensers
  getDispensers: (): Dispenser[] => getJson(STORAGE_KEYS.DISPENSERS, INITIAL_DISPENSERS),
  saveDispensers: (dispensers: Dispenser[]) => setJson(STORAGE_KEYS.DISPENSERS, dispensers),
  addDispenser: (dispenser: Dispenser) => {
    const list = StorageService.getDispensers();
    list.unshift(dispenser);
    StorageService.saveDispensers(list);

    StorageService.addAuditLog({
      id: `AUD-${Date.now().toString().slice(-5)}`,
      timestamp: new Date().toLocaleString('ar-EG'),
      eventType: 'qr_generated',
      title: `توليد كيو آر كود لمضخة #${dispenser.dispenserNumber}`,
      details: `المحطة: ${dispenser.stationName} | الطراز: ${dispenser.nozzleType} | الضغط: ${dispenser.maxPressureBar} بار`,
      severity: 'info',
      user: 'مدير النظام (Admin)',
      stationName: dispenser.stationName,
    });
  },

  // Drivers
  getDrivers: (): Driver[] => getJson(STORAGE_KEYS.DRIVERS, INITIAL_DRIVERS),
  saveDrivers: (drivers: Driver[]) => setJson(STORAGE_KEYS.DRIVERS, drivers),
  getActiveDriverId: (): string => getJson(STORAGE_KEYS.ACTIVE_DRIVER_ID, INITIAL_DRIVERS[0].id),
  setActiveDriverId: (id: string) => setJson(STORAGE_KEYS.ACTIVE_DRIVER_ID, id),
  getActiveDriver: (): Driver => {
    const drivers = StorageService.getDrivers();
    const activeId = StorageService.getActiveDriverId();
    return drivers.find(d => d.id === activeId) || drivers[0] || INITIAL_DRIVERS[0];
  },

  // Driver Maintenance Schedules
  addMaintenanceSchedule: (driverId: string, item: Omit<MaintenanceSchedule, 'id'>) => {
    const drivers = StorageService.getDrivers();
    const driver = drivers.find(d => d.id === driverId);
    if (!driver) return;
    if (!driver.maintenanceSchedules) driver.maintenanceSchedules = [];

    const newItem: MaintenanceSchedule = {
      ...item,
      id: `MNT-${Date.now().toString().slice(-5)}`,
    };
    driver.maintenanceSchedules.unshift(newItem);
    StorageService.saveDrivers(drivers);
  },

  // Shifts and Worker Dynamic Daily Passcode
  getShifts: (): ShiftTimingConfig[] => {
    const cfg = StorageService.getConfig();
    return cfg.shifts || INITIAL_SHIFTS;
  },
  saveShifts: (shifts: ShiftTimingConfig[]) => {
    const cfg = StorageService.getConfig();
    cfg.shifts = shifts;
    StorageService.saveConfig(cfg);
  },
  generateNewShiftPasscode: (shiftId: string): string => {
    const shifts = StorageService.getShifts();
    const shift = shifts.find(s => s.id === shiftId);
    if (!shift) return '0000';

    const newPasscode = String(Math.floor(1000 + Math.random() * 9000));
    shift.dailyPasscode = newPasscode;
    shift.passcodeGeneratedDate = new Date().toISOString().slice(0, 10);
    shift.smsSentToWorkers = true;
    StorageService.saveShifts(shifts);

    // Collect registered worker phones for automated dispatch
    const workers = StorageService.getWorkers();
    const targetWorkers = workers.filter(
      w => w.assignedShiftId === shift.id || shift.id === 'SHIFT-MORNING'
    );
    const workerPhonesList = targetWorkers.map(w => `${w.name} (${w.phone})`).join('، ');

    // Audit log
    StorageService.addAuditLog({
      id: `AUD-${Date.now().toString().slice(-5)}`,
      timestamp: new Date().toLocaleString('ar-EG'),
      eventType: 'passcode_generated',
      title: `توليد رمز مرور يومي جديد للوردية (${shift.shiftName})`,
      details: `الرمز الجديد: ${newPasscode} | المواعيد: من ${shift.startTime} إلى ${shift.endTime} | تم الإرسال التلقائي عبر SMS/واتساب إلى أرقام الفنيين المسجلين: ${workerPhonesList || 'فنيي المحطة'}`,
      severity: 'info',
      user: 'مدير النظام (Admin)',
      stationName: shift.stationName || 'كافة محطات كارجاس',
    });

    // Notify workers
    targetWorkers.forEach(w => {
      StorageService.addNotification({
        id: `NOTIF-${Date.now()}-${w.id}`,
        title: `رمز دخول ورديتك اليومي: ${newPasscode} 🔑`,
        titleEn: `Your new shift access passcode: ${newPasscode}`,
        message: `مرحباً فني التموين ${w.name}، رمز دخول وردية (${shift.shiftName}) اليوم هو: ${newPasscode}. ينتهي الدخول تلقائياً عند انتهاء موعد الوردية الساعة (${shift.endTime}).`,
        messageEn: `Shift passcode: ${newPasscode}. Valid until ${shift.endTime}.`,
        timestamp: 'الآن',
        targetRole: 'worker',
        read: false,
        type: 'shift_passcode',
      });
    });

    return newPasscode;
  },

  // Worker Login Validation (Strict Shift & Daily Passcode check)
  authenticateWorker: (
    workerId: string,
    passcode: string
  ): { success: boolean; worker?: Worker; error?: string } => {
    const workers = StorageService.getWorkers();
    const worker = workers.find(w => w.id.toUpperCase() === workerId.toUpperCase().trim());

    if (!worker) {
      return { success: false, error: 'رقم الفني غير مسجل بقاعدة بيانات المحطات' };
    }

    const shifts = StorageService.getShifts();
    const assignedShift = shifts.find(s => s.id === worker.assignedShiftId) || shifts[0];

    // Check 1: Is shift active in system
    if (!assignedShift.isActive) {
      return {
        success: false,
        error: `الوردية (${assignedShift.shiftName}) متوقفة حالياً بقرار من مدير النظام، ولا يمكن تسجيل الدخول.`,
      };
    }

    // Check 2: Passcode verification
    if (assignedShift.dailyPasscode !== passcode.trim()) {
      return {
        success: false,
        error: 'كلمة السر اليومية غير صحيحة أو منتهية الصلاحية. تواصل مع مدير المحطة.',
      };
    }

    // Authenticated! Store in session
    setJson(STORAGE_KEYS.LOGGED_IN_WORKER, worker);
    setJson(STORAGE_KEYS.ACTIVE_WORKER_ID, worker.id);

    return { success: true, worker };
  },

  getLoggedInWorker: (): Worker | null => {
    return getJson<Worker | null>(STORAGE_KEYS.LOGGED_IN_WORKER, null);
  },

  logoutWorker: () => {
    localStorage.removeItem(STORAGE_KEYS.LOGGED_IN_WORKER);
    window.dispatchEvent(new Event('cargas_data_updated'));
  },

  // Workers & Station Staff
  getWorkers: (): Worker[] => getJson(STORAGE_KEYS.WORKERS, INITIAL_WORKERS),
  saveWorkers: (workers: Worker[]) => {
    setJson(STORAGE_KEYS.WORKERS, workers);
    window.dispatchEvent(new Event('cargas_data_updated'));
  },
  addWorker: (worker: Worker) => {
    const list = StorageService.getWorkers();
    list.unshift(worker);
    StorageService.saveWorkers(list);
  },
  updateWorker: (updatedWorker: Worker) => {
    const list = StorageService.getWorkers();
    const updated = list.map(w => (w.id === updatedWorker.id ? updatedWorker : w));
    StorageService.saveWorkers(updated);
  },
  deleteWorker: (workerId: string) => {
    const list = StorageService.getWorkers();
    const filtered = list.filter(w => w.id !== workerId);
    StorageService.saveWorkers(filtered);
  },
  getActiveWorker: (): Worker => {
    const logged = StorageService.getLoggedInWorker();
    if (logged) return logged;
    const workers = StorageService.getWorkers();
    return workers[0] || INITIAL_WORKERS[0];
  },

  // Transactions
  getTransactions: (): Transaction[] => getJson(STORAGE_KEYS.TRANSACTIONS, INITIAL_TRANSACTIONS),
  saveTransactions: (txns: Transaction[]) => setJson(STORAGE_KEYS.TRANSACTIONS, txns),

  recordFueling: (params: {
    driverId: string;
    workerId: string;
    stationId: string;
    dispenserId: string;
    m3Quantity: number;
    geoVerified: boolean;
    workerLat: number;
    workerLng: number;
    distanceMeters: number;
    fraudFlag?: string;
  }): { success: boolean; transaction: Transaction; error?: string } => {
    const config = StorageService.getConfig();
    const drivers = StorageService.getDrivers();
    const workers = StorageService.getWorkers();
    const stations = StorageService.getStations();
    const dispensers = StorageService.getDispensers();

    const driver = drivers.find(d => d.id === params.driverId);
    const worker = workers.find(w => w.id === params.workerId);
    const station = stations.find(s => s.id === params.stationId);
    const dispenser = dispensers.find(dsp => dsp.id === params.dispenserId);

    if (!driver || !worker || !station) {
      return { success: false, transaction: null as any, error: 'بيانات العملية غير مكتملة' };
    }

    // Cost and points calculations
    const pricePerM3 = config.egpPerM3;
    const totalCostEGP = Number((params.m3Quantity * pricePerM3).toFixed(2));
    const earnedPoints = Math.round(params.m3Quantity * config.pointsPerM3);
    const workerCommissionEGP = config.workerIncentiveEnabled !== false
      ? Number((params.m3Quantity * config.workerCommissionPerM3).toFixed(2))
      : 0;

    const txnId = `TXN-${Math.floor(10000 + Math.random() * 90000)}`;
    const receiptNumber = `CG-RCP-${Math.floor(10000 + Math.random() * 90000)}`;
    const timestampStr = new Date().toLocaleString('ar-EG', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });

    const newTxn: Transaction = {
      id: txnId,
      timestamp: timestampStr,
      stationId: station.id,
      stationName: station.name,
      regionId: station.regionId,
      governorate: station.governorate,
      dispenserId: dispenser ? dispenser.id : 'DSP-GEN',
      dispenserNumber: dispenser ? dispenser.dispenserNumber : 1,
      driverId: driver.id,
      driverName: driver.name,
      plateNumber: driver.plateNumber,
      vehicleType: driver.vehicleType,
      workerId: worker.id,
      workerName: worker.name,
      m3Quantity: params.m3Quantity,
      pricePerM3,
      totalCostEGP,
      earnedPoints,
      workerCommissionEGP,
      geoVerified: params.geoVerified,
      workerLat: params.workerLat,
      workerLng: params.workerLng,
      distanceFromStationMeters: params.distanceMeters,
      status: params.fraudFlag ? 'flagged' : 'completed',
      fraudReason: params.fraudFlag,
      receiptNumber,
    };

    const transactions = StorageService.getTransactions();
    transactions.unshift(newTxn);
    StorageService.saveTransactions(transactions);

    // Update Driver
    driver.pointsBalance += earnedPoints;
    driver.totalM3Pumped = Number((driver.totalM3Pumped + params.m3Quantity).toFixed(1));
    driver.totalSpentEGP = Number((driver.totalSpentEGP + totalCostEGP).toFixed(2));
    driver.totalTransactionsCount += 1;
    if (driver.pointsBalance > 3000) driver.tier = 'Platinum';
    else if (driver.pointsBalance > 1200) driver.tier = 'Gold';
    StorageService.saveDrivers(drivers);

    // Update Worker
    worker.activeShift.dispensedM3 = Number((worker.activeShift.dispensedM3 + params.m3Quantity).toFixed(1));
    worker.activeShift.transactionsCount += 1;
    worker.activeShift.earnedCommissionEGP = Number(
      (worker.activeShift.earnedCommissionEGP + workerCommissionEGP).toFixed(2)
    );
    worker.dailyCommissionEGP = Number((worker.dailyCommissionEGP + workerCommissionEGP).toFixed(2));
    worker.monthlyCommissionEGP = Number((worker.monthlyCommissionEGP + workerCommissionEGP).toFixed(2));
    worker.totalDispensedM3 = Number((worker.totalDispensedM3 + params.m3Quantity).toFixed(1));

    if (params.fraudFlag) {
      worker.activeShift.fraudAlertsCount += 1;
      worker.cleanAuditBonusEligible = false;
      worker.cleanAuditStreakDays = 0;
    }
    StorageService.saveWorkers(workers);

    // Notify Driver
    StorageService.addNotification({
      id: `NOTIF-${Date.now()}`,
      title: 'تم تسجيل التموين وإضافة النقاط! ⛽',
      titleEn: 'Fueling Registered & Points Added!',
      message: `تم تموين ${params.m3Quantity} م³ في ${station.name} بمبلغ ${totalCostEGP} ج.م - أُضيف ${earnedPoints} نقطة لرصيدك.`,
      messageEn: `Dispensed ${params.m3Quantity} m³ at ${station.nameEn}.`,
      timestamp: 'الآن',
      targetRole: 'driver',
      targetDriverId: driver.id,
      read: false,
      type: 'fuel_confirm',
    });

    // Add Audit Log
    StorageService.addAuditLog({
      id: `AUD-${Date.now().toString().slice(-5)}`,
      timestamp: timestampStr,
      eventType: params.fraudFlag ? 'fraud_detected' : 'transaction_completed',
      title: params.fraudFlag ? `تحذير تدقيق: عملية تموين مشبوهة` : `عملية تموين موثقة (${params.m3Quantity} م³)`,
      details: `المركبة: ${driver.plateNumber} | المحطة: ${station.name} | القيمة: ${totalCostEGP} ج.م | النقاط: ${earnedPoints} | الفني: ${worker.name}`,
      severity: params.fraudFlag ? 'warning' : 'info',
      user: `${worker.id} (${worker.name})`,
      stationName: station.name,
    });

    return { success: true, transaction: newTxn };
  },

  // Promotions with granular targeting filter
  getPromotions: (): Promotion[] => getJson(STORAGE_KEYS.PROMOTIONS, INITIAL_PROMOTIONS),
  savePromotions: (promos: Promotion[]) => setJson(STORAGE_KEYS.PROMOTIONS, promos),

  getPromotionsForDriver: (driver: Driver): Promotion[] => {
    const promos = StorageService.getPromotions().filter(p => p.active);
    return promos.filter(p => {
      // Vehicle type match
      if (p.targetVehicle !== 'all' && p.targetVehicle !== driver.vehicleType) return false;

      // Targeting type match
      if (p.targetingType === 'all') return true;
      if (p.targetingType === 'region') return p.targetRegionId === driver.regionId;
      if (p.targetingType === 'governorate') return p.targetGovernorate === driver.governorate;
      if (p.targetingType === 'specific_plates') {
        return p.targetPlates?.some(
          plate => plate.replace(/\s+/g, '') === driver.plateNumber.replace(/\s+/g, '')
        );
      }
      if (p.targetingType === 'specific_drivers') {
        return p.targetDriverIds?.includes(driver.id);
      }
      return true;
    });
  },

  // Rewards & Vouchers
  getRewards: (): Reward[] => getJson(STORAGE_KEYS.REWARDS, INITIAL_REWARDS),
  saveRewards: (rewards: Reward[]) => setJson(STORAGE_KEYS.REWARDS, rewards),
  getRedeemedVouchers: (): RedeemedVoucher[] => getJson(STORAGE_KEYS.VOUCHERS, []),
  saveRedeemedVouchers: (vouchers: RedeemedVoucher[]) => setJson(STORAGE_KEYS.VOUCHERS, vouchers),

  redeemReward: (rewardId: string, driverId: string): { success: boolean; voucher?: RedeemedVoucher; error?: string } => {
    const rewards = StorageService.getRewards();
    const drivers = StorageService.getDrivers();
    const reward = rewards.find(r => r.id === rewardId);
    const driver = drivers.find(d => d.id === driverId);

    if (!reward || !driver) {
      return { success: false, error: 'المكافأة أو السائق غير موجود' };
    }

    if (driver.pointsBalance < reward.pointsCost) {
      return { success: false, error: 'رصيد نقاطك غير كافٍ لاستبدال هذه المكافأة' };
    }

    driver.pointsBalance -= reward.pointsCost;
    StorageService.saveDrivers(drivers);

    const secretAuthPin = String(Math.floor(1000 + Math.random() * 9000));
    const voucherUniqueCode = `${reward.voucherCodePrefix}-${Math.floor(1000 + Math.random() * 9000)}-${Math.random().toString(36).substring(2, 5).toUpperCase()}`;

    const staffPhone = reward.responsibleStaffPhone || '01011223344';
    const staffTitle = reward.responsibleStaffTitle || 'مسؤول الخدمة بالمحطة';

    const whatsappMessageText = `*منظومة كارجاس للولاء والعمليات* ⛽\nإشعار طلب استبدال مكافأة جديد:\n- العميل: ${driver.name}\n- لوحة المركبة: ${driver.plateNumber}\n- الخدمة المطلوبة: ${reward.title}\n- رقم القسيمة: ${voucherUniqueCode}\n- *كود اعتماد التنفيذ الخاص بك*: *${secretAuthPin}*\n\nيرجى إدخال هذا الكود في شاشة هاتف العميل لتأكيد واعتماد التنفيذ.`;

    const encodedMsg = encodeURIComponent(whatsappMessageText);
    const whatsappDirectUrl = `https://wa.me/2${staffPhone.replace(/^0/, '')}?text=${encodedMsg}`;

    const voucher: RedeemedVoucher = {
      id: `VCH-${Date.now().toString().slice(-6)}`,
      rewardId: reward.id,
      driverId: driver.id,
      driverName: driver.name,
      plateNumber: driver.plateNumber,
      rewardTitle: reward.title,
      rewardType: reward.rewardType,
      voucherCode: voucherUniqueCode,
      redeemedAt: new Date().toLocaleString('ar-EG', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      }),
      expiresAt: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toLocaleDateString('ar-EG'),
      pointsSpent: reward.pointsCost,
      valueEGP: reward.discountValueEGP,
      secretAuthPin,
      authPinSentToPhone: staffPhone,
      responsibleStaffTitle: staffTitle,
      whatsappMessageText,
      whatsappDirectUrl,
      status: 'pending_worker_pin',
    };

    const vouchers = StorageService.getRedeemedVouchers();
    vouchers.unshift(voucher);
    StorageService.saveRedeemedVouchers(vouchers);

    StorageService.addAuditLog({
      id: `AUD-${Date.now().toString().slice(-5)}`,
      timestamp: new Date().toLocaleString('ar-EG'),
      eventType: 'transaction_completed',
      title: `طلب استبدال مكافأة (${reward.title})`,
      details: `السائق: ${driver.name} (${driver.plateNumber}) | كود القسيمة: ${voucherUniqueCode} | كود اعتماد الواتساب (${secretAuthPin}) أرسل إلى: ${staffPhone} (${staffTitle})`,
      severity: 'info',
      user: driver.name,
    });

    return { success: true, voucher };
  },

  verifyVoucherAuthPin: (
    voucherId: string,
    enteredPin: string,
    workerName?: string
  ): { success: boolean; error?: string; voucher?: RedeemedVoucher } => {
    const vouchers = StorageService.getRedeemedVouchers();
    const v = vouchers.find(item => item.id === voucherId);

    if (!v) {
      return { success: false, error: 'القسيمة غير موجودة بالمنظومة' };
    }

    if (v.status === 'completed') {
      return { success: false, error: 'هذه القسيمة تم استبدالها واعتمادها مسبقاً' };
    }

    if (v.secretAuthPin.trim() !== enteredPin.trim()) {
      return {
        success: false,
        error: 'كود اعتماد المسؤول غير صحيح! يرجى مراجعة رسالة الواتساب الواردة إلى رقم المسؤول المسجل.',
      };
    }

    v.status = 'completed';
    v.verifiedByWorkerName = workerName || v.responsibleStaffTitle;
    v.verifiedAt = new Date().toLocaleString('ar-EG', {
      hour: '2-digit',
      minute: '2-digit',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
    StorageService.saveRedeemedVouchers(vouchers);

    StorageService.addAuditLog({
      id: `AUD-${Date.now().toString().slice(-5)}`,
      timestamp: new Date().toLocaleString('ar-EG'),
      eventType: 'transaction_completed',
      title: `اعتماد وتنفيذ استبدال قسيمة: ${v.rewardTitle}`,
      details: `تم إدخال كود الاعتماد الصحيح (${v.secretAuthPin}) بواسطة: ${v.verifiedByWorkerName} لصالح المركبة (${v.plateNumber || 'عميل كارجاس'}). تم إغلاق القسيمة بنجاح.`,
      severity: 'info',
      user: v.verifiedByWorkerName,
    });

    return { success: true, voucher: v };
  },

  verifyVoucherAuthPinByCode: (
    voucherCode: string,
    enteredPin: string,
    workerName?: string
  ): { success: boolean; error?: string; voucher?: RedeemedVoucher } => {
    const vouchers = StorageService.getRedeemedVouchers();
    const v = vouchers.find(
      item => item.voucherCode.trim().toUpperCase() === voucherCode.trim().toUpperCase()
    );
    if (!v) {
      return { success: false, error: 'رقم القسيمة الفريد غير صحيح أو غير مسجل بالمنظومة' };
    }
    return StorageService.verifyVoucherAuthPin(v.id, enteredPin, workerName);
  },


  // Notifications
  getNotifications: (): PushNotification[] => getJson(STORAGE_KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS),
  addNotification: (notif: PushNotification) => {
    const list = StorageService.getNotifications();
    list.unshift(notif);
    setJson(STORAGE_KEYS.NOTIFICATIONS, list);
  },
  markNotificationsAsRead: () => {
    const list = StorageService.getNotifications();
    list.forEach(n => (n.read = true));
    setJson(STORAGE_KEYS.NOTIFICATIONS, list);
  },

  // Audit Logs
  getAuditLogs: (): AuditLog[] => getJson(STORAGE_KEYS.AUDIT_LOGS, INITIAL_AUDIT_LOGS),
  addAuditLog: (log: Omit<AuditLog, 'id' | 'timestamp'> & { id?: string; timestamp?: string }) => {
    const list = StorageService.getAuditLogs();
    const completeLog: AuditLog = {
      id: log.id || `AUD-${Date.now().toString().slice(-5)}`,
      timestamp: log.timestamp || new Date().toLocaleString('ar-EG'),
      ...log,
    };
    list.unshift(completeLog);
    setJson(STORAGE_KEYS.AUDIT_LOGS, list);
  },

  // Dropdown items
  getDropdownItems: (): DropdownItem[] => {
    const cfg = StorageService.getConfig();
    return cfg.dropdownItems || INITIAL_DROPDOWNS;
  },
  saveDropdownItems: (items: DropdownItem[]) => {
    const cfg = StorageService.getConfig();
    cfg.dropdownItems = items;
    StorageService.saveConfig(cfg);
  },

  // Batch import stations and shifts from Excel/CSV data
  batchUpdateStationsAndShifts: (
    rows: Array<{
      stationName: string;
      governorate?: string;
      dispensersCount: number;
      operatingDispensersCount: number;
      disabledDispensersCount: number;
      shiftsCount: number;
      workersPerShift: number;
      shift1Start?: string;
      shift1End?: string;
      shift2Start?: string;
      shift2End?: string;
      shift3Start?: string;
      shift3End?: string;
    }>
  ) => {
    const stations = StorageService.getStations();
    const shifts = StorageService.getShifts();

    let updatedCount = 0;
    let addedCount = 0;

    rows.forEach(row => {
      if (!row.stationName) return;
      const existing = stations.find(
        s => s.name.trim().toLowerCase() === row.stationName.trim().toLowerCase()
      );

      if (existing) {
        existing.dispensersCount = Number(row.dispensersCount) || existing.dispensersCount;
        existing.operatingDispensersCount =
          Number(row.operatingDispensersCount) || existing.operatingDispensersCount;
        existing.disabledDispensersCount =
          Number(row.disabledDispensersCount) ||
          Math.max(0, existing.dispensersCount - existing.operatingDispensersCount);
        existing.shiftsCount = Number(row.shiftsCount) || existing.shiftsCount || 3;
        existing.workersPerShift = Number(row.workersPerShift) || existing.workersPerShift || 3;
        if (row.governorate) existing.governorate = row.governorate;
        updatedCount++;
      } else {
        const total = Number(row.dispensersCount) || 6;
        const op = Number(row.operatingDispensersCount) || total;
        const dis = Number(row.disabledDispensersCount) || Math.max(0, total - op);
        const newStation: Station = {
          id: `ST-${Date.now().toString().slice(-4)}-${Math.floor(Math.random() * 900)}`,
          name: row.stationName,
          nameEn: row.stationName,
          regionId: 'east',
          governorate: row.governorate || 'القاهرة',
          city: row.governorate || 'القاهرة',
          cityEn: 'Cairo',
          address: 'محطة تموين كارجاس للغاز الطبيعي',
          addressEn: 'Cargas CNG Station',
          coordinates: { lat: 30.0444, lng: 31.2357 },
          dispensersCount: total,
          operatingDispensersCount: op,
          disabledDispensersCount: dis,
          shiftsCount: Number(row.shiftsCount) || 3,
          workersPerShift: Number(row.workersPerShift) || 3,
          activeWorkersCount: Number(row.workersPerShift) || 3,
          status: 'active',
          phone: '0223901122',
        };
        stations.unshift(newStation);
        addedCount++;
      }
    });

    // Update global shift timings if specified in row 1
    if (rows[0]) {
      const r = rows[0];
      if (r.shift1Start && r.shift1End && shifts[0]) {
        shifts[0].startTime = r.shift1Start;
        shifts[0].endTime = r.shift1End;
        if (r.workersPerShift) shifts[0].workersCount = Number(r.workersPerShift);
      }
      if (r.shift2Start && r.shift2End && shifts[1]) {
        shifts[1].startTime = r.shift2Start;
        shifts[1].endTime = r.shift2End;
        if (r.workersPerShift) shifts[1].workersCount = Number(r.workersPerShift);
      }
      if (r.shift3Start && r.shift3End && shifts[2]) {
        shifts[2].startTime = r.shift3Start;
        shifts[2].endTime = r.shift3End;
        if (r.workersPerShift) shifts[2].workersCount = Number(r.workersPerShift);
        shifts[2].isActive = true;
      }
    }

    StorageService.saveStations(stations);
    StorageService.saveShifts(shifts);

    StorageService.addAuditLog({
      id: `AUD-${Date.now().toString().slice(-5)}`,
      timestamp: new Date().toLocaleString('ar-EG'),
      eventType: 'rules_updated',
      title: 'استيراد وتحديث بيانات المحطات والورديات من ملف إكسيل',
      details: `تم تحديث ${updatedCount} محطة، وإضافة ${addedCount} محطة جديدة، وتحديث عدد العاملين والطلمبات ومواعيد الورديات بنجاح.`,
      severity: 'info',
      user: 'مدير النظام (Admin)',
    });

    return { updatedCount, addedCount, totalStations: stations.length };
  },

  // System Config
  getConfig: (): SystemConfig => {
    const cfg = getJson<SystemConfig>(STORAGE_KEYS.CONFIG, INITIAL_SYSTEM_CONFIG);
    if (!cfg.pageVisibility) {
      cfg.pageVisibility = INITIAL_SYSTEM_CONFIG.pageVisibility;
    }
    if (cfg.moeenShownInUserPages === undefined) {
      cfg.moeenShownInUserPages = true;
    }
    if (cfg.autoGenerateDailyPasscode === undefined) {
      cfg.autoGenerateDailyPasscode = true;
    }
    return cfg;
  },
  saveConfig: (cfg: SystemConfig) => setJson(STORAGE_KEYS.CONFIG, cfg),
};

