import React, { useState } from 'react';
import {
  Shield,
  QrCode,
  Sliders,
  BellRing,
  FileSpreadsheet,
  AlertTriangle,
  CheckCircle,
  Download,
  Printer,
  Plus,
  RefreshCw,
  Search,
  Filter,
  Flame,
  Fuel,
  Users,
  Award,
  Sparkles,
  MapPin,
  Clock,
  Car,
  DollarSign,
  Settings,
  Bot,
  Lock,
  KeyRound,
  Send,
  Trash2,
  TrendingUp,
  BarChart3,
  Layers,
  Edit,
  Tag,
  Check,
  Smartphone,
  Gift,
  Wrench,
  Percent,
  UploadCloud,
  Eye,
  EyeOff,
  FileText,
  CheckCircle2,
  UserPlus,
  UserCheck,
  LayoutGrid,
} from 'lucide-react';
import {
  Station,
  Dispenser,
  Transaction,
  Promotion,
  Reward,
  AuditLog,
  SystemConfig,
  GeographicRegion,
  ShiftTimingConfig,
  GeographicRegionId,
  RewardType,
  PromotionTargetingType,
  DropdownItem,
  Worker,
  StaffRole,
} from '../../types';
import { StorageService } from '../../services/storage';
import { QRCodeRenderer } from '../common/QRCodeRenderer';
import { CargasLogo } from '../common/CargasLogo';
import { DriverDashboard } from '../driver/DriverDashboard';
import { WorkerDashboard } from '../worker/WorkerDashboard';
import { PumpPrintModal } from './PumpPrintModal';

export const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<
    | 'analytics'
    | 'staff_management'
    | 'live_pages_view'
    | 'shifts_passcodes'
    | 'qr_generator'
    | 'regions_stations'
    | 'targeted_promos'
    | 'loyalty_scenarios'
    | 'roi_financial_budget'
    | 'dropdowns'
    | 'audit_logs'
    | 'settings'
  >('analytics');

  const [stations, setStations] = useState<Station[]>(StorageService.getStations());
  const [dispensers, setDispensers] = useState<Dispenser[]>(StorageService.getDispensers());
  const [transactions, setTransactions] = useState<Transaction[]>(StorageService.getTransactions());
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(StorageService.getAuditLogs());
  const [promotions, setPromotions] = useState<Promotion[]>(StorageService.getPromotions());
  const [rewards, setRewards] = useState<Reward[]>(StorageService.getRewards());
  const [shifts, setShifts] = useState<ShiftTimingConfig[]>(StorageService.getShifts());
  const [regions, setRegions] = useState<GeographicRegion[]>(StorageService.getRegions());
  const [drivers, setDrivers] = useState(StorageService.getDrivers());
  const [dropdownItems, setDropdownItems] = useState<DropdownItem[]>(StorageService.getDropdownItems());
  const [config, setConfig] = useState<SystemConfig>(StorageService.getConfig());
  const [workers, setWorkers] = useState<Worker[]>(StorageService.getWorkers());

  // Staff Management State (Technicians, Shift Leaders, Station Supervisors)
  const [showStaffModal, setShowStaffModal] = useState<boolean>(false);
  const [editingStaffId, setEditingStaffId] = useState<string | null>(null);
  const [staffName, setStaffName] = useState<string>('');
  const [staffRole, setStaffRole] = useState<StaffRole>('technician');
  const [staffJobTitle, setStaffJobTitle] = useState<string>('');
  const [staffPhone, setStaffPhone] = useState<string>('');
  const [staffNationalId, setStaffNationalId] = useState<string>('');
  const [staffStationId, setStaffStationId] = useState<string>(stations[0]?.id || '');
  const [staffShiftId, setStaffShiftId] = useState<string>('SHIFT-MORNING');
  const [staffSearchQuery, setStaffSearchQuery] = useState<string>('');
  const [staffRoleFilter, setStaffRoleFilter] = useState<'all' | StaffRole>('all');

  // Live Pages Simulator State
  const [livePreviewRole, setLivePreviewRole] = useState<'driver' | 'worker'>('driver');
  const [livePreviewDevice, setLivePreviewDevice] = useState<'mobile' | 'responsive'>('mobile');

  // Toast
  const [successToast, setSuccessToast] = useState<string>('');

  // QR Mode: Dispenser or Google Play
  const [qrType, setQrType] = useState<'dispenser' | 'google_play'>('dispenser');
  const [selectedStationId, setSelectedStationId] = useState<string>(stations[0]?.id || '');
  const [pumpNumber, setPumpNumber] = useState<number>(dispensers.length + 1);
  const [nozzleType, setNozzleType] = useState<string>('NGV NGV1 / High-Flow 200 Bar');
  const [maxPressure, setMaxPressure] = useState<number>(200);

  // Pump QR Code Print Modal State
  const [showPumpPrintModal, setShowPumpPrintModal] = useState<boolean>(false);
  const [printModalStation, setPrintModalStation] = useState<Station>(stations[0]);
  const [printModalPump, setPrintModalPump] = useState<number>(1);

  const handleOpenPumpPrintModal = (st?: Station, pumpNo?: number) => {
    setPrintModalStation(st || stations.find(s => s.id === selectedStationId) || stations[0]);
    setPrintModalPump(pumpNo || pumpNumber || 1);
    setShowPumpPrintModal(true);
  };

  // New Station Form
  const [newStationName, setNewStationName] = useState('');
  const [newStationRegion, setNewStationRegion] = useState<GeographicRegionId>('east');
  const [newStationGov, setNewStationGov] = useState('القاهرة (شرق)');
  const [newStationAddress, setNewStationAddress] = useState('');
  const [newStationPumps, setNewStationPumps] = useState(6);

  // Targeted Campaign Form
  const [promoTitle, setPromoTitle] = useState('');
  const [promoDesc, setPromoDesc] = useState('');
  const [promoMultiplier, setPromoMultiplier] = useState(2.0);
  const [promoBonusPts, setPromoBonusPts] = useState(50);
  const [promoTargetType, setPromoTargetType] = useState<PromotionTargetingType>('region');
  const [promoRegion, setPromoRegion] = useState<GeographicRegionId>('upper_egypt');
  const [promoGov, setPromoGov] = useState('أسيوط');
  const [promoPlate, setPromoPlate] = useState('ط ر أ 4921');
  const [promoSelectedDrivers, setPromoSelectedDrivers] = useState<string[]>([drivers[0]?.id || '']);

  // New Reward Scenario Form
  const [newRewardTitle, setNewRewardTitle] = useState('');
  const [newRewardDesc, setNewRewardDesc] = useState('');
  const [newRewardType, setNewRewardType] = useState<RewardType>('free_gas_m3');
  const [newRewardPoints, setNewRewardPoints] = useState(500);
  const [newRewardFreeM3, setNewRewardFreeM3] = useState(15);
  const [newRewardOilPercent, setNewRewardOilPercent] = useState(25);
  const [newRewardDiscountEGP, setNewRewardDiscountEGP] = useState(120);
  const [newRewardCompanyCost, setNewRewardCompanyCost] = useState(70);
  const [newRewardSalesLift, setNewRewardSalesLift] = useState(100);
  const [newRewardStaffTitle, setNewRewardStaffTitle] = useState('فني مركز الزيوت والخدمة السريعة');
  const [newRewardStaffPhone, setNewRewardStaffPhone] = useState('01011223344');

  // Active editing reward modal state
  const [editingReward, setEditingReward] = useState<Reward | null>(null);

  // Dropdown Manager Form
  const [newDropdownLabel, setNewDropdownLabel] = useState('');
  const [newDropdownCategory, setNewDropdownCategory] = useState<'vehicle_types' | 'nozzle_types' | 'reward_categories'>('vehicle_types');

  // ROI Simulator Slider State
  const [simExtraRewardsCount, setSimExtraRewardsCount] = useState<number>(150);

  const showNotification = (msg: string) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(''), 3500);
  };

  // Financial Metrics
  const totalM3Pumped = transactions.reduce((sum, t) => sum + t.m3Quantity, 0);
  const totalRevenueEGP = transactions.reduce((sum, t) => sum + t.totalCostEGP, 0);
  const totalGiftsCostEGP = rewards.reduce((sum, r) => sum + r.costToCompanyEGP, 0) * 12; // Sample baseline
  const estimatedGrossMarginEGP = totalRevenueEGP * 0.35; // 35% margin on CNG
  const netProfitEGP = Math.max(0, estimatedGrossMarginEGP - totalGiftsCostEGP);
  const roiPercent = totalGiftsCostEGP > 0 ? ((netProfitEGP / totalGiftsCostEGP) * 100).toFixed(1) : '185.0';

  // 1. Shift Passcode Generation Handler
  const handleGenerateShiftPasscode = (shiftId: string) => {
    const newCode = StorageService.generateNewShiftPasscode(shiftId);
    setShifts(StorageService.getShifts());
    setAuditLogs(StorageService.getAuditLogs());
    showNotification(`تم توليد الرمز اليومي الجديد (${newCode}) بنجاح وإرساله للفنيين 🔑`);
  };

  // 2. Toggle Shift Status
  const handleToggleShiftActive = (shiftId: string) => {
    const updated = shifts.map(s => {
      if (s.id === shiftId) {
        return { ...s, isActive: !s.isActive };
      }
      return s;
    });
    StorageService.saveShifts(updated);
    setShifts(updated);
    showNotification('تم تحديث حالة الوردية بنجاح');
  };

  // Excel Shift & Stations Matrix State
  const [excelRows, setExcelRows] = useState<Array<{
    id: string;
    stationName: string;
    governorate: string;
    shiftName: string;
    startTime: string;
    endTime: string;
    workersCount: number;
    dispensersCount: number;
    operatingDispensersCount: number;
    disabledDispensersCount: number;
    dailyPasscode: string;
    workerPhone: string;
    workerName: string;
  }>>([
    {
      id: 'EXL-1',
      stationName: 'محطة كارجاس ألماظة النموذجية',
      governorate: 'القاهرة (شرق)',
      shiftName: 'الوردية الأولى (الصباحية)',
      startTime: '07:00',
      endTime: '15:00',
      workersCount: 4,
      dispensersCount: 6,
      operatingDispensersCount: 5,
      disabledDispensersCount: 1,
      dailyPasscode: '7821',
      workerPhone: '01012345678',
      workerName: 'أحمد صابر عبد العليم',
    },
    {
      id: 'EXL-2',
      stationName: 'محطة كارجاس ألماظة النموذجية',
      governorate: 'القاهرة (شرق)',
      shiftName: 'الوردية الثانية (المسائية)',
      startTime: '15:00',
      endTime: '23:00',
      workersCount: 4,
      dispensersCount: 6,
      operatingDispensersCount: 6,
      disabledDispensersCount: 0,
      dailyPasscode: '4392',
      workerPhone: '01098765432',
      workerName: 'محمود عزت السيد',
    },
    {
      id: 'EXL-3',
      stationName: 'محطة كارجاس 6 أكتوبر المركزية',
      governorate: 'الجيزة (غرب)',
      shiftName: 'الوردية الأولى (الصباحية)',
      startTime: '07:00',
      endTime: '15:00',
      workersCount: 5,
      dispensersCount: 8,
      operatingDispensersCount: 7,
      disabledDispensersCount: 1,
      dailyPasscode: '6195',
      workerPhone: '01123456789',
      workerName: 'كريم عبد التواب',
    },
    {
      id: 'EXL-4',
      stationName: 'محطة كارجاس سموحة الدولية',
      governorate: 'الإسكندرية ومطروح',
      shiftName: 'الوردية الأولى (الصباحية)',
      startTime: '08:00',
      endTime: '16:00',
      workersCount: 3,
      dispensersCount: 4,
      operatingDispensersCount: 4,
      disabledDispensersCount: 0,
      dailyPasscode: '9043',
      workerPhone: '01223344556',
      workerName: 'سامح حسن مرسي',
    },
    {
      id: 'EXL-5',
      stationName: 'محطة أسيوط الكبرى',
      governorate: 'الصعيد (أسيوط)',
      shiftName: 'الوردية الأولى (الصباحية)',
      startTime: '07:00',
      endTime: '15:00',
      workersCount: 4,
      dispensersCount: 6,
      operatingDispensersCount: 5,
      disabledDispensersCount: 1,
      dailyPasscode: '3318',
      workerPhone: '01055667788',
      workerName: 'خالد الصعيدي',
    },
  ]);
  const [excelFileName, setExcelFileName] = useState<string>('cargas_stations_shifts_matrix.xlsx');
  const [isExcelUploading, setIsExcelUploading] = useState<boolean>(false);

  // Download Excel / CSV Template
  const handleDownloadExcelTemplate = () => {
    const csvContent =
      '\uFEFF' +
      'اسم المحطة,المحافظة,اسم الوردية,بداية الوردية,نهاية الوردية,عدد العاملين,إجمالي الطلمبات,الطلمبات العاملة,الطلمبات المعطلة,اسم الفني,رقم الواتساب\n' +
      'محطة كارجاس ألماظة,القاهرة,الوردية الصباحية,07:00,15:00,4,6,5,1,أحمد صابر,01012345678\n' +
      'محطة كارجاس ألماظة,القاهرة,الوردية المسائية,15:00,23:00,4,6,6,0,محمود عزت,01098765432\n' +
      'محطة كارجاس 6 أكتوبر,الجيزة,الوردية الصباحية,07:00,15:00,5,8,7,1,كريم عبد التواب,01123456789\n' +
      'محطة كارجاس سموحة,الإسكندرية,الوردية الصباحية,08:00,16:00,3,4,4,0,سامح حسن,01223344556\n';
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'نموذج_إكسيل_ورديات_وطلمبات_كارجاس.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showNotification('تم تنزيل نموذج شيت الإكسيل الاسترشادي بنجاح! 📥');
  };

  // Upload and parse Excel / CSV
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setExcelFileName(file.name);
    setIsExcelUploading(true);

    const reader = new FileReader();
    reader.onload = evt => {
      const text = evt.target?.result as string;
      if (text) {
        const lines = text.split('\n').filter(l => l.trim().length > 0);
        const parsedRows: typeof excelRows = [];
        const dataLines =
          lines.length > 1 && (lines[0].includes('المحطة') || lines[0].includes('Station'))
            ? lines.slice(1)
            : lines;

        dataLines.forEach((line, idx) => {
          const parts = line.split(',').map(p => p.trim().replace(/^["']|["']$/g, ''));
          if (parts.length >= 3) {
            const stName = parts[0] || `محطة #${idx + 1}`;
            const gov = parts[1] || 'القاهرة';
            const sName = parts[2] || `وردية #${idx + 1}`;
            const sStart = parts[3] || '08:00';
            const sEnd = parts[4] || '16:00';
            const workers = Number(parts[5]) || 4;
            const totalP = Number(parts[6]) || 6;
            const opP = Number(parts[7]) || (totalP > 1 ? totalP - 1 : 1);
            const disP = Number(parts[8]) || (totalP - opP);
            const wName = parts[9] || 'فني معتمد';
            const phone = parts[10] || '01012345678';
            parsedRows.push({
              id: `EXL-UPLOAD-${idx + 1}`,
              stationName: stName,
              governorate: gov,
              shiftName: sName,
              startTime: sStart,
              endTime: sEnd,
              workersCount: workers,
              dispensersCount: totalP,
              operatingDispensersCount: opP,
              disabledDispensersCount: disP,
              dailyPasscode: Math.floor(1000 + Math.random() * 9000).toString(),
              workerName: wName,
              workerPhone: phone,
            });
          }
        });
        if (parsedRows.length > 0) {
          setExcelRows(parsedRows);
          showNotification(`تمت معالجة شيت الإكسيل بنجاح (${parsedRows.length} سجل وردية ومحطة)!`);
        } else {
          showNotification('تم استيراد الملف وتوليد الأكواد اليومية.');
        }
      }
      setIsExcelUploading(false);
    };
    reader.onerror = () => {
      setIsExcelUploading(false);
      showNotification('حدث خطأ أثناء قراءة الملف، تم الإبقاء على البيانات الحالية.');
    };
    reader.readAsText(file);
  };

  // Commit Excel Sheet to Live System
  const handleCommitExcelImport = () => {
    // 1. Sync station dispenser counts and operating statuses
    const updatedStations = [...stations];
    excelRows.forEach(row => {
      const match = updatedStations.find(
        s => s.name.includes(row.stationName) || row.stationName.includes(s.name)
      );
      if (match) {
        match.dispensersCount = row.dispensersCount;
        match.operatingDispensersCount = row.operatingDispensersCount;
        match.disabledDispensersCount = row.disabledDispensersCount;
        match.workersPerShift = row.workersCount;
      }
    });
    setStations(updatedStations);
    StorageService.saveStations(updatedStations);

    // 2. Sync shifts
    const newShifts: ShiftTimingConfig[] = excelRows.map((r, i) => ({
      id: `SHIFT-EXL-${i + 1}`,
      stationName: r.stationName,
      shiftName: r.shiftName,
      startTime: r.startTime,
      endTime: r.endTime,
      workersCount: r.workersCount,
      isActive: true,
      dailyPasscode: r.dailyPasscode,
      passcodeGeneratedDate: new Date().toISOString().split('T')[0],
      smsSentToWorkers: true,
      autoSendPasscode: true,
    }));
    setShifts(newShifts);
    StorageService.saveShifts(newShifts);

    // 3. Audit Log
    StorageService.addAuditLog({
      eventType: 'rules_updated',
      title: 'استيراد واعتماد جدول الورديات والمحطات من شيت إكسيل',
      details: `تم تحديث ${excelRows.length} وردية ومحطة وتوليد أكواد الدخول اليومية تلقائياً.`,
      severity: 'info',
      user: 'مدير النظام (Admin)',
    });
    setAuditLogs(StorageService.getAuditLogs());
    showNotification('تم اعتماد وحفظ جدول الورديات والمحطات من شيت الإكسيل بنجاح! ✓');
  };

  // Dispatch Passcode to Registered Worker WhatsApp
  const handleSendWhatsAppPasscode = (row: typeof excelRows[0]) => {
    const cleanPhone = row.workerPhone.replace(/\D/g, '');
    const intlPhone = cleanPhone.startsWith('0') ? '2' + cleanPhone : cleanPhone;
    const msg = `مرحباً زميلنا الفني ${row.workerName} في ${row.stationName}.\nرمز دخولك السري للوردية (${row.shiftName}) اليوم هو:\n🔑 ${row.dailyPasscode}\nساعات العمل: من ${row.startTime} إلى ${row.endTime}.\n- إدارة العمليات بشركة كارجاس`;
    const waUrl = `https://api.whatsapp.com/send?phone=${intlPhone}&text=${encodeURIComponent(msg)}`;
    window.open(waUrl, '_blank');
    showNotification(`تم إرسال الرمز (${row.dailyPasscode}) لواتساب الفني ${row.workerName} بنجاح! 📲`);
  };

  // Open Staff Modal for Create or Edit
  const handleOpenStaffModal = (workerToEdit?: Worker) => {
    if (workerToEdit) {
      setEditingStaffId(workerToEdit.id);
      setStaffName(workerToEdit.name);
      setStaffRole(workerToEdit.role || 'technician');
      setStaffJobTitle(workerToEdit.jobTitle || '');
      setStaffPhone(workerToEdit.phone);
      setStaffNationalId(workerToEdit.nationalId || '');
      setStaffStationId(workerToEdit.stationId);
      setStaffShiftId(workerToEdit.assignedShiftId || 'SHIFT-MORNING');
    } else {
      setEditingStaffId(null);
      setStaffName('');
      setStaffRole('technician');
      setStaffJobTitle('');
      setStaffPhone('');
      setStaffNationalId('');
      setStaffStationId(stations[0]?.id || '');
      setStaffShiftId('SHIFT-MORNING');
    }
    setShowStaffModal(true);
  };

  // Save Staff Member (Technician, Shift Leader, Supervisor)
  const handleSaveStaff = (e: React.FormEvent) => {
    e.preventDefault();
    if (!staffName.trim() || !staffPhone.trim()) {
      alert('يرجى إدخال اسم الموظف ورقم الهاتف');
      return;
    }

    const assignedStation = stations.find(s => s.id === staffStationId) || stations[0];
    const defaultJobTitles: Record<StaffRole, string> = {
      technician: 'فني تموين ومسؤول مضخات',
      shift_leader: 'رئيس وردية تشغيل',
      station_supervisor: 'مشرف عام المحطة ومسؤول العمليات',
    };

    if (editingStaffId) {
      // Update
      const existing = workers.find(w => w.id === editingStaffId);
      if (!existing) return;
      const updated: Worker = {
        ...existing,
        name: staffName.trim(),
        role: staffRole,
        jobTitle: staffJobTitle.trim() || defaultJobTitles[staffRole],
        phone: staffPhone.trim(),
        nationalId: staffNationalId.trim() || existing.nationalId,
        stationId: assignedStation.id,
        stationName: assignedStation.name,
        regionId: assignedStation.regionId,
        assignedShiftId: staffShiftId,
      };
      StorageService.updateWorker(updated);
      setWorkers(StorageService.getWorkers());
      showNotification(`تم تحديث بيانات (${updated.name}) بنجاح! 👤`);
    } else {
      // Create
      const prefix = staffRole === 'technician' ? 'TECH' : staffRole === 'shift_leader' ? 'SHF' : 'SUP';
      const newId = `${prefix}-${Date.now().toString().slice(-4)}`;
      const newWorker: Worker = {
        id: newId,
        name: staffName.trim(),
        role: staffRole,
        jobTitle: staffJobTitle.trim() || defaultJobTitles[staffRole],
        phone: staffPhone.trim(),
        nationalId: staffNationalId.trim() || '29000000000000',
        stationId: assignedStation.id,
        stationName: assignedStation.name,
        regionId: assignedStation.regionId,
        assignedShiftId: staffShiftId,
        status: 'active',
        activeShift: {
          id: `SH-${Date.now()}`,
          startTime: '07:00 AM',
          endTime: '03:00 PM',
          isActive: true,
          stationId: assignedStation.id,
          dispenserId: dispensers[0]?.id || 'DSP-01',
          dispensedM3: 0,
          transactionsCount: 0,
          earnedCommissionEGP: 0,
          fraudAlertsCount: 0,
        },
        dailyCommissionEGP: 0,
        monthlyCommissionEGP: 0,
        cleanAuditStreakDays: 1,
        cleanAuditBonusEligible: true,
        stationRank: workers.length + 1,
        totalDispensedM3: 0,
        rating: 5.0,
      };
      StorageService.addWorker(newWorker);
      setWorkers(StorageService.getWorkers());
      showNotification(`تمت إضافة الموظف الجديد (${newWorker.name} - ${newWorker.jobTitle}) بنجاح! 🎉`);
    }

    setShowStaffModal(false);
  };

  // Toggle Worker status (active / suspended)
  const handleToggleStaffStatus = (workerId: string) => {
    const target = workers.find(w => w.id === workerId);
    if (!target) return;
    const nextStatus = target.status === 'suspended' ? 'active' : 'suspended';
    const updated = { ...target, status: nextStatus as 'active' | 'suspended' };
    StorageService.updateWorker(updated);
    setWorkers(StorageService.getWorkers());
    showNotification(`تم تغيير حالة الموظف (${target.name}) إلى: ${nextStatus === 'active' ? 'مصرح ونشط ✓' : 'موقوف مؤقتاً ✕'}`);
  };

  // Delete Staff
  const handleDeleteStaff = (workerId: string, name: string) => {
    if (confirm(`هل أنت متأكد من حذف الموظف (${name}) نهائياً من سجلات كارجاس؟`)) {
      StorageService.deleteWorker(workerId);
      setWorkers(StorageService.getWorkers());
      showNotification(`تم حذف الموظف (${name}) بنجاح`);
    }
  };

  // Direct WhatsApp Passcode Dispatch for Staff
  const handleSendStaffWhatsAppPasscode = (w: Worker) => {
    const cleanPhone = w.phone.replace(/\D/g, '');
    const intlPhone = cleanPhone.startsWith('0') ? '2' + cleanPhone : cleanPhone;
    const shift = shifts.find(s => s.id === w.assignedShiftId) || shifts[0];
    const roleTitle = w.role === 'station_supervisor' ? 'مشرف المحطة' : w.role === 'shift_leader' ? 'رئيس الوردية' : 'فني التموين';
    const msg = `مرحباً زميلنا ${roleTitle} ${w.name} في ${w.stationName}.\nرمز دخولك السري للوردية (${shift.shiftName}) اليوم هو:\n🔑 ${shift.dailyPasscode}\nساعات العمل: من ${shift.startTime} إلى ${shift.endTime}.\n- إدارة العمليات بشركة كارجاس`;
    const waUrl = `https://api.whatsapp.com/send?phone=${intlPhone}&text=${encodeURIComponent(msg)}`;
    window.open(waUrl, '_blank');
    showNotification(`تم إرسال الرمز لواتساب ${roleTitle} ${w.name} بنجاح! 📲`);
  };

  // 3. Add Station
  const handleAddStation = () => {
    if (!newStationName.trim()) return;
    const regionObj = regions.find(r => r.id === newStationRegion);
    const newSt: Station = {
      id: `ST-${Date.now().toString().slice(-4)}`,
      name: newStationName,
      nameEn: newStationName,
      regionId: newStationRegion,
      governorate: newStationGov || regionObj?.governorates[0] || 'القاهرة',
      city: newStationGov,
      cityEn: newStationGov,
      address: newStationAddress || 'طريق المحور السريع',
      addressEn: 'Main Axis Road',
      coordinates: { lat: 30.0444, lng: 31.2357 },
      dispensersCount: newStationPumps,
      operatingDispensersCount: newStationPumps,
      disabledDispensersCount: 0,
      shiftsCount: 3,
      workersPerShift: 4,
      activeWorkersCount: 3,
      status: 'active',
      phone: '0223901122',
    };
    StorageService.addStation(newSt);
    setStations(StorageService.getStations());
    setNewStationName('');
    setNewStationAddress('');
    showNotification(`تمت إضافة محطة (${newStationName}) ضمن ${regionObj?.nameAr} بنجاح!`);
  };

  // 4. Create Targeted Promotion
  const handleCreateTargetedPromo = () => {
    if (!promoTitle.trim()) return;
    const newPromo: Promotion = {
      id: `PROMO-${Date.now().toString().slice(-4)}`,
      title: promoTitle,
      titleEn: promoTitle,
      description: promoDesc || 'عرض حصري ومخصص لزيادة كميات الغاز',
      descriptionEn: promoDesc,
      pointsMultiplier: promoMultiplier,
      bonusPoints: promoBonusPts,
      validUntil: '2026-12-31',
      targetVehicle: 'all',
      targetingType: promoTargetType,
      targetRegionId: promoTargetType === 'region' ? promoRegion : undefined,
      targetGovernorate: promoTargetType === 'governorate' ? promoGov : undefined,
      targetPlates: promoTargetType === 'specific_plates' ? [promoPlate] : undefined,
      targetDriverIds: promoTargetType === 'specific_drivers' ? promoSelectedDrivers : undefined,
      bannerColor: 'from-emerald-700 to-teal-900',
      active: true,
    };

    const updated = [newPromo, ...promotions];
    StorageService.savePromotions(updated);
    setPromotions(updated);
    setPromoTitle('');
    setPromoDesc('');
    showNotification('تم إطلاق وتوجيه الحملة الترويجية للفئة المستهدفة بنجاح 🎯');
  };

  // 5. Create Reward Scenario
  const handleCreateRewardScenario = () => {
    if (!newRewardTitle.trim()) return;
    const calculatedDiscountVal =
      newRewardType === 'free_gas_m3'
        ? Number((newRewardFreeM3 * config.egpPerM3).toFixed(2))
        : newRewardDiscountEGP || 150;

    const newReward: Reward = {
      id: `REW-${Date.now().toString().slice(-4)}`,
      title: newRewardTitle,
      titleEn: newRewardTitle,
      description: newRewardDesc || 'خدمة استبدال مميزة لمعايير الولاء بكارجاس',
      descriptionEn: newRewardDesc || 'Special loyalty reward service',
      rewardType: newRewardType,
      pointsCost: newRewardPoints,
      category:
        newRewardType === 'free_gas_m3'
          ? 'fuel'
          : newRewardType === 'oil_percent_discount'
          ? 'service'
          : newRewardType.includes('service')
          ? 'maintenance'
          : 'partner',
      voucherCodePrefix: `CG-${newRewardType.slice(0, 4).toUpperCase()}`,
      discountValueEGP: calculatedDiscountVal,
      freeM3Amount: newRewardType === 'free_gas_m3' ? newRewardFreeM3 : undefined,
      discountPercent: newRewardType === 'oil_percent_discount' ? newRewardOilPercent : undefined,
      costToCompanyEGP: newRewardCompanyCost,
      estimatedSalesLiftM3: newRewardSalesLift,
      responsibleStaffTitle: newRewardStaffTitle || 'فني مركز الصيانة وتغيير الزيوت',
      responsibleStaffPhone: newRewardStaffPhone || '01011223344',
      available: true,
    };

    const updated = [newReward, ...rewards];
    StorageService.saveRewards(updated);
    setRewards(updated);
    setNewRewardTitle('');
    setNewRewardDesc('');
    showNotification('تمت إضافة الخدمة / المكافأة وتخصيص رقم واتساب المسؤول بنجاح 🎁');
  };

  // Update existing reward
  const handleUpdateReward = (updatedReward: Reward) => {
    const updated = rewards.map(r => (r.id === updatedReward.id ? updatedReward : r));
    StorageService.saveRewards(updated);
    setRewards(updated);
    setEditingReward(null);
    showNotification(`تم حفظ وتحديث بيانات (${updatedReward.title}) وقيم النقاط والواتساب بنجاح 🛠️`);
  };

  // Delete reward
  const handleDeleteReward = (rewardId: string) => {
    if (window.confirm('هل أنت متأكد من حذف هذه المكافأة نهائياً من المنظومة؟')) {
      const updated = rewards.filter(r => r.id !== rewardId);
      StorageService.saveRewards(updated);
      setRewards(updated);
      setEditingReward(null);
      showNotification('تم حذف المكافأة من كتالوج الهدايا');
    }
  };

  // 6. Add Dropdown Item
  const handleAddDropdownItem = () => {
    if (!newDropdownLabel.trim()) return;
    const newItem: DropdownItem = {
      id: `drop-${Date.now().toString().slice(-5)}`,
      labelAr: newDropdownLabel,
      labelEn: newDropdownLabel,
      category: newDropdownCategory,
    };
    const updated = [...dropdownItems, newItem];
    StorageService.saveDropdownItems(updated);
    setDropdownItems(updated);
    setNewDropdownLabel('');
    showNotification('تمت إضافة المعيار الجديد للقائمة المنسدلة');
  };

  // 7. Wipe All Demo Data
  const handleWipeAllDemoData = () => {
    if (
      confirm(
        '⚠️ تحذير أمني هام:\nهل أنت متأكد تماماً من رغبتك في مسح كافة البيانات التجريبية وسجلات التموين وإعادة المنظومة لحالة المصنع النقية؟'
      )
    ) {
      StorageService.wipeAllDemoData();
      setTransactions([]);
      setAuditLogs(StorageService.getAuditLogs());
      showNotification('تم مسح كافة البيانات التجريبية بنجاح 🧹');
      setTimeout(() => window.location.reload(), 1500);
    }
  };

  const currentSelectedStation = stations.find(s => s.id === selectedStationId) || stations[0];
  const previewDispenserId = `DSP-${selectedStationId.replace('ST-', '')}-${String(pumpNumber).padStart(2, '0')}`;
  const currentDispenserQRPayload = JSON.stringify({
    type: 'CARGAS_DISPENSER',
    stationId: currentSelectedStation?.id,
    stationName: currentSelectedStation?.name,
    dispenserId: previewDispenserId,
    pumpNo: pumpNumber,
    maxBar: maxPressure,
  });

  const googlePlayPayload = 'https://play.google.com/store/apps/details?id=com.cargas.loyalty&hl=ar';

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {successToast && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-emerald-800 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-2 text-sm font-bold border-2 border-amber-400 animate-bounce">
          <CheckCircle className="w-5 h-5 text-amber-300" />
          <span>{successToast}</span>
        </div>
      )}

      {/* Admin Top Header Banner */}
      <div className="bg-gradient-to-r from-emerald-950 via-emerald-900 to-slate-900 text-white rounded-3xl p-5 sm:p-7 shadow-xl border border-emerald-700/30 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center font-black shadow-lg">
              <Shield className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black">لوحة تحكم مدير النظام الشاملة</h1>
                <span className="bg-amber-400/20 text-amber-300 border border-amber-400/40 text-[10px] font-black px-2 py-0.5 rounded-full">
                  Admin Master Control
                </span>
              </div>
              <p className="text-xs sm:text-sm text-emerald-200/90 mt-1">
                إدارة الورديات، باسوورد الفني اليومي، تقسيم المحطات والمناطق، استهداف الحملات، وموازنة الهدايا
              </p>
            </div>
          </div>

          {/* Quick Header Actions: Staff Modal, Live Preview, Print Pump QR & Wipe */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => handleOpenPumpPrintModal()}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl text-xs font-black shadow-lg border border-emerald-400/40 transition-all active:scale-95"
              title="طباعة كود طلمبة التموين وملصقات المضخات الرسمية"
            >
              <Printer className="w-4 h-4 text-amber-300" />
              <span>طباعة كود الطلمبات 🖨️</span>
            </button>

            <button
              onClick={() => handleOpenStaffModal()}
              className="flex items-center gap-2 px-4 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 rounded-2xl text-xs font-black shadow-lg transition-all active:scale-95"
              title="إدخال بيانات عامل جديد: فني تموين، رئيس وردية، أو مشرف محطة"
            >
              <UserPlus className="w-4 h-4 text-emerald-950" />
              <span>إدخال بيانات العاملين 👤</span>
            </button>

            <button
              onClick={() => setActiveTab('live_pages_view')}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-700/80 hover:bg-emerald-600 text-white rounded-2xl text-xs font-bold shadow border border-emerald-500/40 transition-all active:scale-95"
              title="استعراض كافة صفحات النظام (فنيين وعملاء) كمدير"
            >
              <Eye className="w-4 h-4 text-amber-300" />
              <span>استعراض كافة الصفحات 📱</span>
            </button>

            <button
              onClick={handleWipeAllDemoData}
              className="flex items-center gap-2 px-3.5 py-2 bg-rose-600/90 hover:bg-rose-700 text-white rounded-2xl text-xs font-bold shadow border border-rose-400/40 transition-all active:scale-95"
              title="مسح كافة سجلات التموين والعمليات التجريبية"
            >
              <Trash2 className="w-4 h-4 text-rose-200" />
              <span>مسح التجريبي</span>
            </button>
          </div>
        </div>

        {/* Dynamic Navigation Tabs */}
        <div className="flex items-center gap-1.5 sm:gap-2 mt-6 overflow-x-auto no-scrollbar pt-2 border-t border-emerald-800/60 text-xs sm:text-sm">
          {[
            { id: 'analytics', label: 'المؤشرات والعمليات', icon: FileSpreadsheet },
            { id: 'staff_management', label: 'بيانات العاملين والمشرفين', icon: UserCheck },
            { id: 'live_pages_view', label: 'استعراض كافة الصفحات', icon: Smartphone },
            { id: 'shifts_passcodes', label: 'الورديات وشيت الإكسيل', icon: KeyRound },
            { id: 'qr_generator', label: 'كيو آر المضخات وجوجل بلاي', icon: QrCode },
            { id: 'regions_stations', label: 'المناطق والمحطات الـ 6', icon: MapPin },
            { id: 'targeted_promos', label: 'تخصيص الحملات والسائقين', icon: Tag },
            { id: 'loyalty_scenarios', label: 'سيناريوهات الهدايا والولاء', icon: Gift },
            { id: 'roi_financial_budget', label: 'الجدوى وموازنة الأرباح', icon: TrendingUp },
            { id: 'dropdowns', label: 'القوائم المنسدلة والمعايير', icon: Layers },
            { id: 'audit_logs', label: 'سجل التدقيق والأمان', icon: AlertTriangle },
            { id: 'settings', label: 'إعدادات النظام ومُعين', icon: Settings },
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl font-bold whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-amber-400 text-slate-950 shadow-md scale-102'
                    : 'text-emerald-100 hover:bg-emerald-800/60'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* TAB 1: OVERVIEW & ANALYTICS */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-xs font-semibold">إجمالي الغاز المضخوخ</span>
                <Fuel className="w-5 h-5 text-emerald-600" />
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                  {totalM3Pumped.toFixed(1)}
                </span>
                <span className="text-xs font-bold text-emerald-700">م³</span>
              </div>
              <p className="text-[11px] text-emerald-600 mt-2 font-medium">
                توزيع عبر 6 قطاعات جغرافية
              </p>
            </div>

            <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-xs font-semibold">إجمالي إيرادات الغاز</span>
                <DollarSign className="w-5 h-5 text-amber-500" />
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                  {Number(totalRevenueEGP.toFixed(0)).toLocaleString()}
                </span>
                <span className="text-xs font-bold text-slate-500">ج.م</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-2 font-medium">
                بسعر {config.egpPerM3} ج.م / م³
              </p>
            </div>

            <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-xs font-semibold">تكلفة الهدايا على الموازنة</span>
                <Gift className="w-5 h-5 text-rose-500" />
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl sm:text-3xl font-black text-rose-600 dark:text-rose-400">
                  {Number(totalGiftsCostEGP.toFixed(0)).toLocaleString()}
                </span>
                <span className="text-xs font-bold text-slate-500">ج.م</span>
              </div>
              <p className="text-[11px] text-emerald-600 mt-2 font-medium">
                عائد الاستثمار المقدر: {roiPercent}% 📈
              </p>
            </div>

            <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-xs font-semibold">محطات الوقود العاملة</span>
                <MapPin className="w-5 h-5 text-blue-500" />
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                  {stations.length}
                </span>
                <span className="text-xs font-bold text-slate-500">محطة في 6 قطاعات</span>
              </div>
              <p className="text-[11px] text-emerald-600 mt-2 font-medium">
                {dispensers.length} مضخات تموين ذكية
              </p>
            </div>
          </div>

          {/* Recent Live Operations */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm">
            <h3 className="font-bold text-base text-slate-900 dark:text-white mb-3 text-right">
              سجل التموين الميداني اللحظي
            </h3>
            {transactions.length === 0 ? (
              <div className="text-center py-8 text-slate-400 text-xs">
                لا توجد عمليات تموين مسجلة حالياً (يمكنك إجراء عمليات تجريبية من صفحة فني التموين)
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-right text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500">
                      <th className="py-2 px-3">رقم العملية</th>
                      <th className="py-2 px-3">التاريخ والوقت</th>
                      <th className="py-2 px-3">المحطة والقطاع</th>
                      <th className="py-2 px-3">السائق واللوحة</th>
                      <th className="py-2 px-3">الكمية (م³)</th>
                      <th className="py-2 px-3">المبلغ (ج.م)</th>
                      <th className="py-2 px-3">الفني</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {transactions.slice(0, 6).map(t => (
                      <tr key={t.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                        <td className="py-3 px-3 font-mono font-bold text-emerald-700">{t.id}</td>
                        <td className="py-3 px-3 text-slate-400">{t.timestamp}</td>
                        <td className="py-3 px-3 font-semibold">{t.stationName}</td>
                        <td className="py-3 px-3 font-mono font-bold">{t.plateNumber}</td>
                        <td className="py-3 px-3 font-black">{t.m3Quantity} م³</td>
                        <td className="py-3 px-3 font-black text-emerald-600">{t.totalCostEGP} ج.م</td>
                        <td className="py-3 px-3 text-slate-500">{t.workerName}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB: STAFF & SUPERVISORS MANAGEMENT (فني تموين / رئيس وردية / مشرف محطة) */}
      {activeTab === 'staff_management' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6 text-right">
          {/* Header & New Staff Button */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
            <div>
              <h3 className="font-black text-lg text-slate-900 dark:text-white flex items-center gap-2">
                <UserCheck className="w-6 h-6 text-emerald-600" />
                إدارة وإدخال بيانات العاملين (فني تموين / رئيس وردية / مشرف محطة)
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                تسجيل وتعديل بيانات طاقم المحطات، تعيين الأدوار والصلاحيات، وربطهم بالورديات وتوليد وإرسال باسوورد الدخول اليومي عبر الواتساب فورياً.
              </p>
            </div>

            <button
              onClick={() => handleOpenStaffModal()}
              className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-2xl text-xs shadow-lg flex items-center gap-2 transition-all active:scale-95"
            >
              <UserPlus className="w-4 h-4 text-amber-300" />
              <span>إضافة موظف / فني / مشرف جديد 👤➕</span>
            </button>
          </div>

          {/* Quick Metrics Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
              <span className="text-[11px] text-slate-500 block mb-1">إجمالي فريق العمل المسجل</span>
              <span className="text-2xl font-black text-slate-900 dark:text-white">
                {workers.length}
              </span>
              <span className="text-[10px] text-emerald-600 block mt-1">في كافة محطات الجمهورية</span>
            </div>

            <div className="p-4 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800">
              <span className="text-[11px] text-emerald-800 dark:text-emerald-300 block mb-1">فنيو التموين (Technicians)</span>
              <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                {workers.filter(w => (w.role || 'technician') === 'technician').length}
              </span>
              <span className="text-[10px] text-slate-400 block mt-1">مباشرة على مضخات الغاز</span>
            </div>

            <div className="p-4 rounded-2xl bg-blue-50/70 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800">
              <span className="text-[11px] text-blue-800 dark:text-blue-300 block mb-1">رؤساء الورديات (Shift Leaders)</span>
              <span className="text-2xl font-black text-blue-600 dark:text-blue-400">
                {workers.filter(w => w.role === 'shift_leader').length}
              </span>
              <span className="text-[10px] text-slate-400 block mt-1">إدارة التشغيل وضغط الغاز</span>
            </div>

            <div className="p-4 rounded-2xl bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800">
              <span className="text-[11px] text-amber-800 dark:text-amber-300 block mb-1">مشرفو المحطات (Supervisors)</span>
              <span className="text-2xl font-black text-amber-600 dark:text-amber-400">
                {workers.filter(w => w.role === 'station_supervisor').length}
              </span>
              <span className="text-[10px] text-slate-400 block mt-1">المسؤولية الكاملة عن المحطة</span>
            </div>
          </div>

          {/* Filter & Search Toolbar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-50 dark:bg-slate-800/60 p-3 rounded-2xl border border-slate-200 dark:border-slate-700">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="ابحث بالاسم، الكود الوظيفي، المحطة، أو رقم الهاتف..."
                value={staffSearchQuery}
                onChange={e => setStaffSearchQuery(e.target.value)}
                className="w-full pr-9 pl-3 py-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 text-xs"
              />
            </div>

            {/* Role Filter Buttons */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
              {[
                { id: 'all', label: 'الكل' },
                { id: 'technician', label: 'فنيو التموين ⛽' },
                { id: 'shift_leader', label: 'رؤساء الورديات ⏱️' },
                { id: 'station_supervisor', label: 'مشرفو المحطات 👔' },
              ].map(f => (
                <button
                  key={f.id}
                  onClick={() => setStaffRoleFilter(f.id as any)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                    staffRoleFilter === f.id
                      ? 'bg-emerald-700 text-white shadow-sm'
                      : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Staff Table */}
          <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
            <table className="w-full text-right text-xs">
              <thead>
                <tr className="bg-slate-100 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300">
                  <th className="py-3 px-3">الموظف / الاسم</th>
                  <th className="py-3 px-3">الدور والمسمى الوظيفي</th>
                  <th className="py-3 px-3">المحطة المعين بها</th>
                  <th className="py-3 px-3 text-center">الوردية</th>
                  <th className="py-3 px-3">الموبايل / الرقم القومي</th>
                  <th className="py-3 px-3 text-center">حالة الحساب</th>
                  <th className="py-3 px-3 text-center">إجراءات سريعة</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {workers
                  .filter(w => {
                    const matchesSearch =
                      w.name.includes(staffSearchQuery) ||
                      w.id.toLowerCase().includes(staffSearchQuery.toLowerCase()) ||
                      w.phone.includes(staffSearchQuery) ||
                      w.stationName.includes(staffSearchQuery);
                    const matchesRole =
                      staffRoleFilter === 'all' || (w.role || 'technician') === staffRoleFilter;
                    return matchesSearch && matchesRole;
                  })
                  .map(w => {
                    const shiftObj = shifts.find(s => s.id === w.assignedShiftId) || shifts[0];
                    const isSupervisor = w.role === 'station_supervisor';
                    const isShiftLeader = w.role === 'shift_leader';
                    const isSuspended = w.status === 'suspended';

                    return (
                      <tr key={w.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                        {/* Name & ID */}
                        <td className="py-3 px-3">
                          <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                            <span>{w.name}</span>
                          </div>
                          <span className="font-mono text-[10px] text-emerald-700 dark:text-emerald-400 font-bold block mt-0.5">
                            {w.id}
                          </span>
                        </td>

                        {/* Role & Job Title Badge */}
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-1.5 mb-1">
                            {isSupervisor ? (
                              <span className="bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 font-bold text-[10px] px-2 py-0.5 rounded-full border border-amber-300 dark:border-amber-800 flex items-center gap-1">
                                <span>مشرف محطة</span>
                              </span>
                            ) : isShiftLeader ? (
                              <span className="bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 font-bold text-[10px] px-2 py-0.5 rounded-full border border-blue-300 dark:border-blue-800 flex items-center gap-1">
                                <span>رئيس وردية</span>
                              </span>
                            ) : (
                              <span className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 font-bold text-[10px] px-2 py-0.5 rounded-full border border-emerald-300 dark:border-emerald-800 flex items-center gap-1">
                                <span>فني تموين</span>
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] text-slate-500 block">
                            {w.jobTitle || 'فني تشغيل معتمد'}
                          </span>
                        </td>

                        {/* Station */}
                        <td className="py-3 px-3">
                          <span className="font-semibold text-slate-800 dark:text-slate-200 block">
                            {w.stationName}
                          </span>
                          <span className="text-[10px] text-slate-400 block">
                            {w.nationalId ? `الرقم القومي: ${w.nationalId.slice(0, 6)}******` : ''}
                          </span>
                        </td>

                        {/* Shift */}
                        <td className="py-3 px-3 text-center">
                          <span className="font-mono font-bold bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-lg text-slate-700 dark:text-slate-300 inline-block text-[11px]">
                            {shiftObj?.shiftName || 'الوردية الصباحية'}
                          </span>
                          <span className="text-[10px] text-slate-400 block mt-0.5">
                            {shiftObj?.startTime} - {shiftObj?.endTime}
                          </span>
                        </td>

                        {/* Phone & National ID */}
                        <td className="py-3 px-3 font-mono">
                          <span className="font-bold text-slate-900 dark:text-white block">
                            {w.phone}
                          </span>
                          <span className="text-[10px] text-slate-400 font-sans block">
                            كود الوردية: {shiftObj?.dailyPasscode}
                          </span>
                        </td>

                        {/* Status */}
                        <td className="py-3 px-3 text-center">
                          <button
                            onClick={() => handleToggleStaffStatus(w.id)}
                            className={`text-[10px] font-bold px-2.5 py-1 rounded-full transition-all ${
                              isSuspended
                                ? 'bg-rose-100 text-rose-800 hover:bg-rose-200'
                                : 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                            }`}
                            title="اضغط لتغيير حالة الموظف"
                          >
                            {isSuspended ? '✕ موقوف مؤقتاً' : '✓ مصرح ونشط'}
                          </button>
                        </td>

                        {/* Actions */}
                        <td className="py-3 px-3 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            {/* WhatsApp PIN Dispatch Button */}
                            <button
                              onClick={() => handleSendStaffWhatsAppPasscode(w)}
                              className="p-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-transform active:scale-95"
                              title="إرسال باسوورد الوردية اليومي لواتساب الموظف"
                            >
                              <Send className="w-3.5 h-3.5 text-amber-300" />
                            </button>

                            {/* Edit Button */}
                            <button
                              onClick={() => handleOpenStaffModal(w)}
                              className="p-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg transition-colors"
                              title="تعديل بيانات الموظف"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>

                            {/* Delete Button */}
                            <button
                              onClick={() => handleDeleteStaff(w.id, w.name)}
                              className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg transition-colors"
                              title="حذف الموظف"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB: LIVE PAGES SIMULATOR & INSPECTOR (استعراض كافة الصفحات كمدير) */}
      {activeTab === 'live_pages_view' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5 text-right">
          {/* Header & Page Selector Controls */}
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
            <div>
              <h3 className="font-black text-lg text-slate-900 dark:text-white flex items-center gap-2">
                <Smartphone className="w-6 h-6 text-emerald-600" />
                استعراض ومحاكاة كافة صفحات النظام (فنيين & عملاء)
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                استعراض حي وتفاعلي لما يراه العميل وفني التموين داخل لوحة مدير النظام، مع إمكانية اختبار العمليات ومراجعة تأثير إعدادات الإظهار والإخفاء فورياً دون تسجيل الخروج.
              </p>
            </div>

            {/* View Selector Controls */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Role Toggle */}
              <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl">
                <button
                  onClick={() => setLivePreviewRole('driver')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                    livePreviewRole === 'driver'
                      ? 'bg-emerald-700 text-white shadow-md'
                      : 'text-slate-600 dark:text-slate-300 hover:text-emerald-700'
                  }`}
                >
                  <Car className="w-4 h-4" />
                  <span>صفحة العميل / السائق 🚗</span>
                </button>

                <button
                  onClick={() => setLivePreviewRole('worker')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                    livePreviewRole === 'worker'
                      ? 'bg-amber-400 text-slate-950 shadow-md font-black'
                      : 'text-slate-600 dark:text-slate-300 hover:text-amber-500'
                  }`}
                >
                  <Wrench className="w-4 h-4" />
                  <span>صفحة فني التموين بالمحطة ⛽</span>
                </button>
              </div>

              {/* Viewport Frame Toggle */}
              <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl text-xs">
                <button
                  onClick={() => setLivePreviewDevice('mobile')}
                  className={`px-3 py-2 rounded-xl font-bold transition-all ${
                    livePreviewDevice === 'mobile'
                      ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                      : 'text-slate-500'
                  }`}
                >
                  📱 شاشة جوال
                </button>
                <button
                  onClick={() => setLivePreviewDevice('responsive')}
                  className={`px-3 py-2 rounded-xl font-bold transition-all ${
                    livePreviewDevice === 'responsive'
                      ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                      : 'text-slate-500'
                  }`}
                >
                  💻 شاشة كاملة
                </button>
              </div>
            </div>
          </div>

          {/* Admin Live Inspector Banner */}
          <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-800/60 p-3.5 rounded-2xl flex items-center justify-between text-xs">
            <div className="flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-bold text-amber-900 dark:text-amber-200">
                وضع المعاينة الحية المباشرة (Live Admin Inspector):
              </span>
              <span className="text-amber-800/80 dark:text-amber-300 text-[11px] hidden sm:inline">
                أنت الآن تستعرض الواجهة الحقيقية كمدير للنظام. يمكنك تجربة وظائف التموين، فحص الأكواد، ومعاينة تأثير أزرار الإخفاء والإظهار لحظياً.
              </span>
            </div>
            <span className="font-mono text-[11px] font-bold bg-white dark:bg-slate-900 px-2.5 py-1 rounded-lg border border-amber-300 text-amber-800 dark:text-amber-400">
              {livePreviewRole === 'driver' ? 'Driver View' : 'Worker Station View'}
            </span>
          </div>

          {/* Live Simulator Viewport Container */}
          <div className="w-full flex justify-center bg-slate-100 dark:bg-slate-950/80 p-3 sm:p-6 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            {livePreviewDevice === 'mobile' ? (
              /* Mobile Bezel Simulation Frame */
              <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl border-4 border-slate-700 dark:border-slate-600 overflow-hidden relative">
                {/* Mobile Top Speaker & Camera Notch */}
                <div className="w-full bg-slate-800 py-1.5 flex items-center justify-center">
                  <div className="w-16 h-1 bg-slate-600 rounded-full" />
                </div>

                {/* Embedded Live Component */}
                <div className="p-3 sm:p-4 max-h-[82vh] overflow-y-auto">
                  {livePreviewRole === 'driver' ? (
                    <DriverDashboard />
                  ) : (
                    <WorkerDashboard />
                  )}
                </div>
              </div>
            ) : (
              /* Full Width Responsive View */
              <div className="w-full">
                {livePreviewRole === 'driver' ? (
                  <DriverDashboard />
                ) : (
                  <WorkerDashboard />
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: SHIFTS & DAILY PASSCODE CONTROL */}
      {activeTab === 'shifts_passcodes' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6 text-right">
          <div>
            <h3 className="font-black text-lg text-slate-900 dark:text-white flex items-center gap-2">
              <KeyRound className="w-6 h-6 text-emerald-600" />
              إدارة مواعيد الورديات وتوليد باسوورد الدخول اليومي للفنيين
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              يتم منح فني التموين رمز مرور يومي يتم تجديده تلقائياً. عند انتهاء الوردية أو إيقافها، يتم غلق الدخول فوراً لحماية النظام.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {shifts.map(shift => (
              <div
                key={shift.id}
                className={`p-5 rounded-3xl border transition-all text-right flex flex-col justify-between ${
                  shift.isActive
                    ? 'bg-emerald-50/60 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-800'
                    : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 opacity-80'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-black text-base text-slate-900 dark:text-white">
                      {shift.shiftName}
                    </span>
                    <span
                      className={`text-[10px] font-black px-2.5 py-0.5 rounded-full ${
                        shift.isActive
                          ? 'bg-emerald-600 text-white shadow-sm'
                          : 'bg-slate-300 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                      }`}
                    >
                      {shift.isActive ? 'مفعلة ونشطة' : 'متوقفة'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300 mb-4">
                    <Clock className="w-4 h-4 text-emerald-600" />
                    <span>
                      من الساعة <strong>{shift.startTime}</strong> إلى <strong>{shift.endTime}</strong>
                    </span>
                  </div>

                  {/* Daily Passcode Display */}
                  <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-emerald-200 dark:border-emerald-800/60 text-center mb-4">
                    <span className="text-[11px] text-slate-400 block mb-1">
                      الرمز السري اليومي المولد (Passcode):
                    </span>
                    <span className="text-3xl font-mono font-black text-amber-500 tracking-widest block">
                      {shift.dailyPasscode}
                    </span>
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 block mt-1">
                      تم التوليد لتاريخ: {shift.passcodeGeneratedDate}
                    </span>
                  </div>
                </div>

                <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                  <button
                    onClick={() => handleGenerateShiftPasscode(shift.id)}
                    className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow flex items-center justify-center gap-1.5"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>توليد باسوورد يومي جديد</span>
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleToggleShiftActive(shift.id)}
                      className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-colors ${
                        shift.isActive
                          ? 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
                          : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                      }`}
                    >
                      {shift.isActive ? 'إيقاف الوردية الآن' : 'تفعيل الوردية'}
                    </button>

                    <button
                      onClick={() => showNotification(`تمت محاكاة إرسال الرمز (${shift.dailyPasscode}) في رسائل SMS لجميع فنيي ${shift.shiftName} 📲`)}
                      className="p-2 bg-amber-400 hover:bg-amber-500 text-slate-950 rounded-xl"
                      title="إرسال الرمز عبر SMS"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* EXCEL SHIFTS & STATIONS MATRIX UPLOADER & CONTROLLER */}
          <div className="p-5 rounded-3xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-700/80 pb-4">
              <div>
                <h4 className="font-black text-base text-slate-900 dark:text-white flex items-center gap-2">
                  <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
                  رفع وتحديث جدول الورديات والمحطات عبر شيت إكسيل (Excel / CSV)
                </h4>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  رفع شيت إكسيل يحدد فيه مواعيد ورديات كل محطة، عدد العاملين بكل وردية، عدد الطلمبات الفعلي، وعدد الطلمبات العاملة والمعطلة، مع توليد الرقم السري تلقائياً وإرساله فورياً إلى رقم الفني المسجل.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
                <button
                  onClick={handleDownloadExcelTemplate}
                  className="px-3.5 py-2 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold rounded-xl text-xs border border-slate-300 dark:border-slate-600 flex items-center gap-1.5 shadow-sm active:scale-95 transition-all"
                  title="تنزيل نموذج إكسيل فارغ معتمد ومجهز برؤوس الأعمدة المطلوبة"
                >
                  <Download className="w-3.5 h-3.5 text-emerald-600" />
                  <span>تنزيل نموذج إكسيل (CSV)</span>
                </button>

                <label className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow cursor-pointer active:scale-95 transition-all">
                  <UploadCloud className="w-4 h-4 text-amber-300" />
                  <span>{isExcelUploading ? 'جارِ القراءة...' : 'رفع شيت إكسيل'}</span>
                  <input
                    type="file"
                    accept=".csv,.xlsx,.xls,text/csv"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>

                <button
                  onClick={handleCommitExcelImport}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black rounded-xl text-xs flex items-center gap-1.5 shadow-md active:scale-95 transition-all"
                  title="اعتماد وتطبيق بيانات الإكسيل في المنظومة فوراً"
                >
                  <Check className="w-4 h-4" />
                  <span>اعتماد وحفظ الجدول بالمنظومة</span>
                </button>
              </div>
            </div>

            {/* Current Active Sheet Status */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 bg-emerald-50/70 dark:bg-emerald-950/30 p-3 rounded-2xl border border-emerald-200 dark:border-emerald-800 text-xs">
              <div className="flex items-center gap-2">
                <span className="font-mono bg-white dark:bg-slate-900 px-2.5 py-1 rounded-lg border border-emerald-300 dark:border-emerald-700 font-bold text-emerald-800 dark:text-emerald-300">
                  📄 {excelFileName}
                </span>
                <span className="text-emerald-900 dark:text-emerald-200 font-bold">
                  {excelRows.length} سجلات ورديات ومحطات جاهزة
                </span>
              </div>

              {/* Automatic Passcode Dispatch Toggle */}
              <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-700 dark:text-slate-300">
                <input
                  type="checkbox"
                  checked={config.autoGenerateDailyPasscode !== false}
                  onChange={e => {
                    const updated = { ...config, autoGenerateDailyPasscode: e.target.checked };
                    setConfig(updated);
                    StorageService.saveConfig(updated);
                    showNotification(
                      updated.autoGenerateDailyPasscode
                        ? 'تم تفعيل التوليد والإرسال التلقائي للباسوورد اليومي'
                        : 'تم إيقاف التوليد التلقائي'
                    );
                  }}
                  className="w-4 h-4 text-emerald-600 rounded"
                />
                <span className="text-[11px]">
                  توليد وإرسال الرقم السري تلقائياً لرقم الفني المسجل يومياً
                </span>
              </label>
            </div>

            {/* Interactive Preview Table for Excel Rows */}
            <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm">
              <table className="w-full text-right text-xs">
                <thead>
                  <tr className="bg-slate-100 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300">
                    <th className="py-2.5 px-3">المحطة والمحافظة</th>
                    <th className="py-2.5 px-3">الوردية</th>
                    <th className="py-2.5 px-3 text-center">المواعيد (البدء والانتهاء)</th>
                    <th className="py-2.5 px-3 text-center">عدد العاملين</th>
                    <th className="py-2.5 px-3 text-center">إجمالي الطلمبات (الفعلي)</th>
                    <th className="py-2.5 px-3 text-center">العاملة</th>
                    <th className="py-2.5 px-3 text-center">المعطلة</th>
                    <th className="py-2.5 px-3 text-center">الباسوورد اليومي</th>
                    <th className="py-2.5 px-3">الفني المسجل والواتساب</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {excelRows.map(row => (
                    <tr key={row.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <td className="py-2.5 px-3 font-bold text-slate-900 dark:text-white">
                        <div>{row.stationName}</div>
                        <span className="text-[10px] text-slate-400 font-normal">{row.governorate}</span>
                      </td>
                      <td className="py-2.5 px-3 font-semibold text-emerald-700 dark:text-emerald-400">
                        {row.shiftName}
                      </td>
                      <td className="py-2.5 px-3 text-center font-mono">
                        <span className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md font-bold">
                          {row.startTime} - {row.endTime}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-center font-bold">
                        {row.workersCount} فنيين
                      </td>
                      <td className="py-2.5 px-3 text-center font-mono font-bold text-slate-800 dark:text-slate-200">
                        {row.dispensersCount} مضخات
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <span className="bg-emerald-100 text-emerald-800 text-[11px] font-bold px-2 py-0.5 rounded-full font-mono">
                          {row.operatingDispensersCount} عاملة
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <span
                          className={`text-[11px] font-bold px-2 py-0.5 rounded-full font-mono ${
                            row.disabledDispensersCount > 0
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                          }`}
                        >
                          {row.disabledDispensersCount} معطلة
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <span className="font-mono font-black text-amber-500 bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 px-2.5 py-1 rounded-lg text-sm tracking-wider inline-block">
                          {row.dailyPasscode}
                        </span>
                      </td>
                      <td className="py-2.5 px-3">
                        <div className="flex items-center justify-between gap-2">
                          <div>
                            <span className="font-semibold block text-slate-800 dark:text-slate-200">
                              {row.workerName}
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono block">
                              {row.workerPhone}
                            </span>
                          </div>
                          <button
                            onClick={() => handleSendWhatsAppPasscode(row)}
                            className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-[10px] font-bold flex items-center gap-1 shadow-sm transition-transform active:scale-95"
                            title="إرسال الباسوورد تلقائياً لرقم واتساب الفني المسجل"
                          >
                            <Send className="w-3 h-3 text-amber-300" />
                            <span>واتساب 📲</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300">
            🔒 <strong>قاعدة الأمان الصارمة:</strong> عند تسجيل الفني الدخول، يتحقق النظام من تطابق الرمز السري اليومي وتوافق وقت الدخول مع الوردية المصرح بها. عند انتهاء الوردية، يتم إغلاق الوصول تلقائياً ولا يستطيع الفني تسجيل أي عملية تموين.
          </div>
        </div>
      )}

      {/* TAB 3: QR GENERATOR (DISPENSER & GOOGLE PLAY) */}
      {activeTab === 'qr_generator' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
          <div className="flex items-center justify-between text-right">
            <div>
              <h3 className="font-black text-lg text-slate-900 dark:text-white flex items-center gap-2">
                <QrCode className="w-6 h-6 text-emerald-600" />
                مولد ملصقات الكيو آر كود (المضخات & تحميل تطبيق جوجل بلاي)
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                توليد كود رسمي لكل طلمبة تموين لتعريف المحطة، وتوليد ملصق رسمي لتحميل التطبيق من Google Play.
              </p>
            </div>

            {/* Toggle QR Type */}
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl">
              <button
                onClick={() => setQrType('dispenser')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  qrType === 'dispenser'
                    ? 'bg-emerald-700 text-white shadow'
                    : 'text-slate-600 dark:text-slate-300'
                }`}
              >
                كود طلمبة التموين
              </button>
              <button
                onClick={() => setQrType('google_play')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  qrType === 'google_play'
                    ? 'bg-amber-400 text-slate-950 shadow'
                    : 'text-slate-600 dark:text-slate-300'
                }`}
              >
                تحميل تطبيق Google Play
              </button>
            </div>
          </div>

          {qrType === 'dispenser' ? (
            /* Dispenser QR Builder */
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-5 space-y-4 text-right">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    اختر المحطة
                  </label>
                  <select
                    value={selectedStationId}
                    onChange={e => setSelectedStationId(e.target.value)}
                    className="w-full p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-semibold"
                  >
                    {stations.map(st => (
                      <option key={st.id} value={st.id}>
                        {st.name} ({st.governorate})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      رقم الطلمبة / المسدس
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="30"
                      value={pumpNumber}
                      onChange={e => setPumpNumber(Number(e.target.value))}
                      className="w-full p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-bold text-center"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      أقصى ضغط تشغيل
                    </label>
                    <select
                      value={maxPressure}
                      onChange={e => setMaxPressure(Number(e.target.value))}
                      className="w-full p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-semibold"
                    >
                      <option value={200}>200 بار (قياسي)</option>
                      <option value={220}>220 بار (سريع)</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <button
                    onClick={() => {
                      const newDsp: Dispenser = {
                        id: previewDispenserId,
                        stationId: currentSelectedStation.id,
                        stationName: currentSelectedStation.name,
                        dispenserNumber: pumpNumber,
                        nozzleType,
                        maxPressureBar: maxPressure,
                        qrCodeString: currentDispenserQRPayload,
                        status: 'online',
                        lastInspectionDate: new Date().toLocaleDateString('ar-EG'),
                      };
                      StorageService.addDispenser(newDsp);
                      setDispensers(StorageService.getDispensers());
                      setPumpNumber(p => p + 1);
                      showNotification(`تم حفظ وتوليد ملصق الطلمبة #${pumpNumber} بنجاح!`);
                    }}
                    className="w-full py-3.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-2xl shadow active:scale-98 transition-all"
                  >
                    حفظ وتوليد ملصق الطلمبة
                  </button>

                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => handleOpenPumpPrintModal(currentSelectedStation, pumpNumber)}
                      className="py-3 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold rounded-2xl shadow flex items-center justify-center gap-1.5 active:scale-95 transition-all text-xs"
                    >
                      <Printer className="w-4 h-4 text-emerald-950" />
                      <span>طباعة ملصق طلمبة #{pumpNumber} 🖨️</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleOpenPumpPrintModal(currentSelectedStation, 1)}
                      className="py-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold rounded-2xl border border-slate-300 dark:border-slate-700 flex items-center justify-center gap-1.5 active:scale-95 transition-all text-xs"
                    >
                      <Layers className="w-4 h-4 text-emerald-600" />
                      <span>طباعة مجمعة ({currentSelectedStation.dispensersCount || 6})</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Printable Dispenser Card */}
              <div className="lg:col-span-7 flex flex-col items-center justify-center p-6 bg-slate-100 dark:bg-slate-950 rounded-3xl border border-slate-200 dark:border-slate-800">
                <div className="w-full max-w-sm bg-white text-slate-900 rounded-3xl p-6 shadow-2xl border-4 border-emerald-700 text-center">
                  <div className="bg-gradient-to-r from-emerald-800 to-emerald-950 text-white p-3 -mx-6 -mt-6 mb-4 flex items-center justify-between px-4">
                    <CargasLogo size="sm" />
                    <span className="bg-amber-400 text-emerald-950 text-[10px] font-black px-2 py-0.5 rounded-full">
                      CNG مضخة معتمدة
                    </span>
                  </div>

                  <h4 className="text-2xl font-black text-emerald-800">
                    طلمبة تموين رقم {pumpNumber}
                  </h4>
                  <p className="text-xs font-bold text-slate-600">{currentSelectedStation.name}</p>
                  <p className="text-[10px] text-slate-400 font-mono mb-2">ID: {previewDispenserId} | {maxPressure} Bar</p>

                  <div className="my-2 flex justify-center">
                    <QRCodeRenderer value={currentDispenserQRPayload} size={200} darkColor="#0B4E24" />
                  </div>

                  <p className="text-[11px] font-bold text-emerald-800 bg-emerald-50 p-2 rounded-xl">
                    امسح الكود عبر تطبيق كارجاس لتسجيل نقاط التموين فوراً
                  </p>

                  <div className="mt-4 pt-3 border-t border-slate-200 flex flex-wrap items-center justify-center gap-2">
                    <button
                      onClick={() => handleOpenPumpPrintModal(currentSelectedStation, pumpNumber)}
                      className="flex-1 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow active:scale-95 transition-all"
                    >
                      <Printer className="w-4 h-4 text-amber-300" />
                      <span>طباعة هذا الملصق الآن 🖨️</span>
                    </button>

                    <button
                      onClick={() => handleOpenPumpPrintModal(currentSelectedStation, 1)}
                      className="px-3.5 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow active:scale-95 transition-all"
                      title="طباعة كافة طلمبات المحطة (1 إلى N)"
                    >
                      <Layers className="w-4 h-4 text-emerald-950" />
                      <span>طباعة المحطة بالكامل</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Google Play Download QR Poster */
            <div className="flex flex-col items-center justify-center p-6 bg-slate-100 dark:bg-slate-950 rounded-3xl border border-slate-200 dark:border-slate-800">
              <span className="text-xs font-bold text-slate-500 mb-4">
                ملصق دعائي رسمي جاهز للطباعة والتعليق في المحطات لتحميل التطبيق من Google Play
              </span>

              <div className="w-full max-w-md bg-gradient-to-b from-white via-slate-50 to-emerald-50 text-slate-900 rounded-3xl p-7 shadow-2xl border-4 border-amber-400 text-center space-y-4">
                <CargasLogo size="lg" className="justify-center" />

                <div>
                  <h4 className="text-2xl font-black text-emerald-900">
                    حمّل تطبيق كارجاس للولاء والغاز الآن!
                  </h4>
                  <p className="text-xs text-slate-600 mt-1">
                    وفّر حتى 65% من تكلفة الوقود، واجمع نقاطاً مع كل تفويلة واستبدلها بهدايا وصيانة مجانية.
                  </p>
                </div>

                <div className="p-4 bg-white rounded-3xl border-2 border-emerald-500 shadow-lg inline-block">
                  <QRCodeRenderer value={googlePlayPayload} size={220} darkColor="#0B4E24" />
                </div>

                {/* Google Play Badge Graphic */}
                <div className="flex items-center justify-center gap-3 bg-slate-900 text-white py-3 px-6 rounded-2xl mx-auto w-fit shadow-md">
                  <Smartphone className="w-6 h-6 text-amber-400" />
                  <div className="text-right">
                    <span className="text-[10px] text-slate-300 block uppercase">متاح مجاناً على</span>
                    <span className="text-sm font-black font-sans">Google Play</span>
                  </div>
                </div>

                <div className="text-[10px] text-slate-500 pt-2 border-t border-slate-200">
                  شركة كارجاس • الطاقة النظيفة لمستقبل مصر 🇪🇬
                </div>
              </div>

              <button
                onClick={() => window.print()}
                className="mt-5 px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-2xl text-xs flex items-center gap-2 shadow"
              >
                <Printer className="w-4 h-4" />
                <span>طباعة الملصق الدعائي</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* TAB 4: GEOGRAPHIC REGIONS & STATIONS (6 SECTORS) */}
      {activeTab === 'regions_stations' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6 text-right">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-black text-lg text-slate-900 dark:text-white flex items-center gap-2">
                <MapPin className="w-6 h-6 text-emerald-600" />
                تقسيم المحطات طبقاً للقطاعات الجغرافية الـ 6 والمحافظات
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                (شرق / غرب / الصعيد / الإسكندرية ومطروح / القناة والبحر الأحمر / الدلتا) مع إمكانية إضافة وتعديل المحطات.
              </p>
            </div>
          </div>

          {/* 6 Regions Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {regions.map(r => {
              const regStations = stations.filter(s => s.regionId === r.id);
              return (
                <div
                  key={r.id}
                  className="p-4 rounded-3xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-black text-sm text-slate-900 dark:text-white">
                        {r.nameAr}
                      </span>
                      <span className="bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-xs font-bold px-2 py-0.5 rounded-full">
                        {regStations.length} محطات
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-1 mb-3">
                      {r.governorates.map(gov => (
                        <span
                          key={gov}
                          className="text-[10px] bg-white dark:bg-slate-900 px-2 py-0.5 rounded-md border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300"
                        >
                          {gov}
                        </span>
                      ))}
                    </div>

                    {/* Stations in this region */}
                    <div className="space-y-1.5 mb-2">
                      {regStations.map(st => (
                        <div
                          key={st.id}
                          className="p-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 text-xs flex items-center justify-between gap-2"
                        >
                          <div className="truncate flex-1">
                            <span className="font-bold block truncate">{st.name}</span>
                            <span className="text-[10px] font-mono text-emerald-600">
                              {st.dispensersCount} مضخات
                            </span>
                          </div>
                          <button
                            onClick={() => handleOpenPumpPrintModal(st, 1)}
                            className="p-1.5 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-transform active:scale-95 flex-shrink-0"
                            title={`طباعة ملصقات وأكواد طلمبات ${st.name}`}
                          >
                            <Printer className="w-3.5 h-3.5 text-amber-500" />
                            <span>طباعة 🖨️</span>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Add New Station Form */}
          <div className="p-5 rounded-3xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/40 space-y-4">
            <h4 className="font-bold text-sm text-emerald-950 dark:text-emerald-300">
              إضافة محطة جديدة إلى أحد القطاعات الجغرافية
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  اسم المحطة
                </label>
                <input
                  type="text"
                  placeholder="مثال: محطة كارجاس سموحة"
                  value={newStationName}
                  onChange={e => setNewStationName(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  القطاع الجغرافي
                </label>
                <select
                  value={newStationRegion}
                  onChange={e => setNewStationRegion(e.target.value as any)}
                  className="w-full p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold"
                >
                  {regions.map(r => (
                    <option key={r.id} value={r.id}>
                      {r.nameAr}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  المحافظة / المدينة
                </label>
                <input
                  type="text"
                  placeholder="مثال: الإسكندرية"
                  value={newStationGov}
                  onChange={e => setNewStationGov(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
                />
              </div>
            </div>

            <button
              onClick={handleAddStation}
              className="px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl text-xs shadow flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4 text-amber-300" />
              <span>إضافة المحطة للقطاع</span>
            </button>
          </div>
        </div>
      )}

      {/* TAB 5: TARGETED CAMPAIGNS & DRIVER SELECTION */}
      {activeTab === 'targeted_promos' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6 text-right">
          <div>
            <h3 className="font-black text-lg text-slate-900 dark:text-white flex items-center gap-2">
              <Tag className="w-6 h-6 text-emerald-600" />
              تخصيص الحملات والعروض (برقم السيارة / سائقين محددين / منطقة أو محافظة)
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              إمكانية حصر العرض على سيارة محددة باللوحة، أو سائقين بالاسم، أو قطاع جغرافي كامل، أو تطبيقه على الجميع.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-6 space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  عنوان الحملة الترويجية
                </label>
                <input
                  type="text"
                  placeholder="مثال: خصم خاص لسيارات الأجرة بأسيوط"
                  value={promoTitle}
                  onChange={e => setPromoTitle(e.target.value)}
                  className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  نطاق الاستهداف (Targeting Scope)
                </label>
                <select
                  value={promoTargetType}
                  onChange={e => setPromoTargetType(e.target.value as any)}
                  className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold"
                >
                  <option value="all">تطبيق على كافة السائقين والسيارات</option>
                  <option value="region">قطاع جغرافي محدد (مثلاً الصعيد أو الإسكندرية)</option>
                  <option value="governorate">محافظة محددة دون غيرها</option>
                  <option value="specific_plates">تخصيص برقم لوحة سيارة محددة</option>
                  <option value="specific_drivers">اختيار سائقين محددين بالاسم</option>
                </select>
              </div>

              {promoTargetType === 'region' && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    اختر القطاع الجغرافي المستهدف
                  </label>
                  <select
                    value={promoRegion}
                    onChange={e => setPromoRegion(e.target.value as any)}
                    className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold"
                  >
                    {regions.map(r => (
                      <option key={r.id} value={r.id}>
                        {r.nameAr}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {promoTargetType === 'specific_plates' && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    أدخل رقم لوحة السيارة المستهدفة
                  </label>
                  <input
                    type="text"
                    placeholder="مثال: ط ر أ 4921"
                    value={promoPlate}
                    onChange={e => setPromoPlate(e.target.value)}
                    className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-mono font-bold"
                  />
                </div>
              )}

              {promoTargetType === 'specific_drivers' && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    اختر السائقين من قاعدة البيانات
                  </label>
                  <div className="space-y-1 max-h-36 overflow-y-auto p-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-xs">
                    {drivers.map(d => (
                      <label key={d.id} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={promoSelectedDrivers.includes(d.id)}
                          onChange={e => {
                            if (e.target.checked) {
                              setPromoSelectedDrivers([...promoSelectedDrivers, d.id]);
                            } else {
                              setPromoSelectedDrivers(promoSelectedDrivers.filter(id => id !== d.id));
                            }
                          }}
                          className="w-4 h-4 text-emerald-600 rounded"
                        />
                        <span>{d.name} ({d.plateNumber})</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    مضاعف النقاط
                  </label>
                  <select
                    value={promoMultiplier}
                    onChange={e => setPromoMultiplier(Number(e.target.value))}
                    className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold"
                  >
                    <option value={1.5}>1.5× نقاط</option>
                    <option value={2.0}>2× نقاط مضاعفة</option>
                    <option value={3.0}>3× نقاط ثلاثية</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    نقاط هدية إضافية
                  </label>
                  <input
                    type="number"
                    value={promoBonusPts}
                    onChange={e => setPromoBonusPts(Number(e.target.value))}
                    className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-center"
                  />
                </div>
              </div>

              <button
                onClick={handleCreateTargetedPromo}
                className="w-full py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl text-xs shadow flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4 text-amber-300" />
                <span>إطلاق الحملة وتوجيهها للمستهدفين</span>
              </button>
            </div>

            {/* Active Promotions List */}
            <div className="lg:col-span-6 space-y-3">
              <span className="text-xs font-bold text-slate-500 block mb-1">
                الحملات الترويجية النشطة حالياً في المنظومة:
              </span>
              <div className="space-y-2">
                {promotions.map(p => (
                  <div
                    key={p.id}
                    className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-right space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm text-slate-900 dark:text-white">
                        {p.title}
                      </span>
                      <span className="bg-amber-400 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded-full">
                        {p.pointsMultiplier}× نقاط
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 leading-relaxed">{p.description}</p>
                    <div className="flex items-center justify-between text-[10px] text-emerald-700 dark:text-emerald-400 font-bold pt-1 border-t border-slate-200 dark:border-slate-700">
                      <span>
                        النطاق:{' '}
                        {p.targetingType === 'all'
                          ? 'كافة السائقين'
                          : p.targetingType === 'region'
                          ? `قطاع (${p.targetRegionId})`
                          : p.targetingType === 'specific_plates'
                          ? `اللوحة: ${p.targetPlates?.join(', ')}`
                          : 'سائقين محددين'}
                      </span>
                      <span>سارٍ حتى: {p.validUntil}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: LOYALTY REWARDS & SCENARIOS BUILDER */}
      {activeTab === 'loyalty_scenarios' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6 text-right">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-black text-lg text-slate-900 dark:text-white flex items-center gap-2">
                <Gift className="w-6 h-6 text-amber-500" />
                التحكم الكامل في كتالوج الهدايا والصيانة وتغيير الزيوت وكود اعتماد الواتساب
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                تحديد قيم النقاط، وقيمة الهدايا والخدمات، وتخصيص هاتف الواتساب للمسؤول عن كل خدمة لاستلام كود الاعتماد اللحظي فور ضغط العميل على «استبدال».
              </p>
            </div>
            <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950 px-3 py-1.5 rounded-xl border border-emerald-200 dark:border-emerald-800">
              {rewards.length} خدمات ومكافآت معتمدة
            </span>
          </div>

          {/* Grid of Reward Cards with Edit & WhatsApp info */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {rewards.map(r => (
              <div
                key={r.id}
                className="p-4 rounded-3xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 flex flex-col justify-between text-right relative group hover:border-emerald-500 transition-all shadow-sm"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-xs font-black px-2.5 py-0.5 rounded-lg">
                      {r.pointsCost} نقطة
                    </span>
                    <span className="text-[10px] text-slate-400 font-bold">
                      {r.rewardType === 'free_gas_m3'
                        ? '⛽ أمتار غاز'
                        : r.rewardType === 'oil_percent_discount'
                        ? '🛢️ نسبة خصم زيت'
                        : r.rewardType === 'free_service_labor_only'
                        ? '🔧 صيانة مصنعية'
                        : r.rewardType === 'free_service_full_parts'
                        ? '🛠️ صيانة شاملة قطع'
                        : r.rewardType === 'car_wash_discount'
                        ? '🧼 خصم مغسلة'
                        : '🤝 خدمات شركاء'}
                    </span>
                  </div>

                  <h4 className="font-bold text-sm text-slate-900 dark:text-white mb-1">
                    {r.title}
                  </h4>
                  <p className="text-xs text-slate-500 leading-relaxed mb-3">
                    {r.description}
                  </p>
                </div>

                <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-700/60 text-xs">
                  <div className="flex justify-between text-slate-600 dark:text-slate-300">
                    <span>قيمة الخصم للعميل:</span>
                    <span className="font-bold text-slate-900 dark:text-white">{r.discountValueEGP} ج.م</span>
                  </div>
                  <div className="flex justify-between text-rose-600 dark:text-rose-400">
                    <span>تكلفة الهدية على الشركة:</span>
                    <span className="font-bold">{r.costToCompanyEGP} ج.م</span>
                  </div>
                  <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
                    <span>الزيادة في المبيعات:</span>
                    <span className="font-bold">+{r.estimatedSalesLiftM3} م³ غاز</span>
                  </div>

                  {/* Responsible Staff & WhatsApp Target */}
                  <div className="p-2.5 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-[11px] text-emerald-950 dark:text-emerald-200 space-y-1">
                    <div className="font-bold flex items-center gap-1">
                      <span>📲 مسؤول استلام كود الواتساب:</span>
                    </div>
                    <div className="text-slate-700 dark:text-slate-300">
                      {r.responsibleStaffTitle || 'مسؤول الخدمة بالمحطة'}
                    </div>
                    <div className="font-mono font-bold text-emerald-700 dark:text-emerald-400">
                      واتساب: {r.responsibleStaffPhone || '01011223344'}
                    </div>
                  </div>

                  {/* Actions: Edit & Delete */}
                  <div className="pt-2 flex items-center gap-2">
                    <button
                      onClick={() => setEditingReward(r)}
                      className="flex-1 py-1.5 px-3 bg-white dark:bg-slate-700 hover:bg-emerald-50 dark:hover:bg-slate-600 border border-slate-200 dark:border-slate-600 rounded-xl text-xs font-bold text-emerald-800 dark:text-emerald-300 flex items-center justify-center gap-1 shadow-sm transition-colors"
                    >
                      <Edit className="w-3.5 h-3.5" />
                      <span>تعديل المعايير</span>
                    </button>
                    <button
                      onClick={() => handleDeleteReward(r.id)}
                      className="p-1.5 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 text-rose-600 rounded-xl border border-rose-200 dark:border-rose-900 transition-colors"
                      title="حذف المكافأة"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Add New Scenario Form */}
          <div className="p-5 sm:p-6 rounded-3xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/40 space-y-4">
            <h4 className="font-bold text-sm text-amber-950 dark:text-amber-300 flex items-center gap-2">
              <Plus className="w-4 h-4 text-amber-600" />
              إضافة خدمة / مكافأة جديدة لكتالوج الهدايا والصيانة
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  عنوان الخدمة / المكافأة
                </label>
                <input
                  type="text"
                  placeholder="مثال: خصم 50% على غيار الزيت التخليقي"
                  value={newRewardTitle}
                  onChange={e => setNewRewardTitle(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  نوع الخدمة والسيناريو
                </label>
                <select
                  value={newRewardType}
                  onChange={e => setNewRewardType(e.target.value as any)}
                  className="w-full p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold"
                >
                  <option value="free_gas_m3">أمتار غاز طبيعي مجانية</option>
                  <option value="oil_percent_discount">كوبون خصم بنسبة على الزيوت</option>
                  <option value="free_service_labor_only">صيانة مجانية (غير شاملة قطع الغيار)</option>
                  <option value="free_service_full_parts">صيانة شاملة قطع الغيار والمصنعية</option>
                  <option value="car_wash_discount">كوبون غسيل بخصم محدد في مغسلة</option>
                  <option value="partner_tire_nitrogen">خدمات الشركاء (نفخ نيتروجين/فحص أمان)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  تكلفة النقاط المطلوبة للاستبدال
                </label>
                <input
                  type="number"
                  value={newRewardPoints}
                  onChange={e => setNewRewardPoints(Number(e.target.value))}
                  className="w-full p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-center"
                />
              </div>

              {newRewardType === 'free_gas_m3' && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    كمية الغاز المجانية (م³ m³)
                  </label>
                  <input
                    type="number"
                    value={newRewardFreeM3}
                    onChange={e => setNewRewardFreeM3(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-center"
                  />
                </div>
              )}

              {newRewardType === 'oil_percent_discount' && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    نسبة خصم الزيت (%)
                  </label>
                  <input
                    type="number"
                    value={newRewardOilPercent}
                    onChange={e => setNewRewardOilPercent(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-center"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  قيمة الخصم للعميل (ج.م)
                </label>
                <input
                  type="number"
                  value={newRewardDiscountEGP}
                  onChange={e => setNewRewardDiscountEGP(Number(e.target.value))}
                  className="w-full p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-center"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  تكلفة الخدمة على موازنة كارجاس (ج.م)
                </label>
                <input
                  type="number"
                  value={newRewardCompanyCost}
                  onChange={e => setNewRewardCompanyCost(Number(e.target.value))}
                  className="w-full p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-center"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  الزيادة المتوقعة في مبيعات الغاز (م³)
                </label>
                <input
                  type="number"
                  value={newRewardSalesLift}
                  onChange={e => setNewRewardSalesLift(Number(e.target.value))}
                  className="w-full p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-center"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  المسؤول المستلم لكود الاعتماد
                </label>
                <input
                  type="text"
                  placeholder="مثال: فني مركز زيوت كارجاس ألماظة"
                  value={newRewardStaffTitle}
                  onChange={e => setNewRewardStaffTitle(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  رقم واتساب المسؤول (لاستلام الكود 4 أرقام)
                </label>
                <input
                  type="text"
                  placeholder="مثال: 01011223344"
                  value={newRewardStaffPhone}
                  onChange={e => setNewRewardStaffPhone(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-mono font-bold text-center"
                />
              </div>
            </div>

            <div className="pt-1">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                وصف وتفاصيل الخدمة للعميل
              </label>
              <textarea
                rows={2}
                placeholder="أدخل الشروط والتعليمات وطريقة الاستفادة..."
                value={newRewardDesc}
                onChange={e => setNewRewardDesc(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
              />
            </div>

            <button
              onClick={handleCreateRewardScenario}
              className="px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black rounded-xl text-xs shadow flex items-center gap-1.5 active:scale-98 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة الخدمة / المكافأة لكتالوج المنظومة</span>
            </button>
          </div>

          {/* EDIT REWARD MODAL */}
          {editingReward && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-md animate-fadeIn">
              <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border-2 border-emerald-600 text-right space-y-4 max-h-[92vh] overflow-y-auto relative">
                <button
                  onClick={() => setEditingReward(null)}
                  className="absolute top-4 left-4 p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600"
                >
                  ✕
                </button>

                <div className="border-b border-slate-200 dark:border-slate-800 pb-3">
                  <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <Edit className="w-5 h-5 text-emerald-600" />
                    تعديل معايير الخدمة وقيم النقاط والواتساب
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    كود المعرف: {editingReward.id} | {editingReward.voucherCodePrefix}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="sm:col-span-2">
                    <label className="block font-bold mb-1">اسم الخدمة / المكافأة</label>
                    <input
                      type="text"
                      value={editingReward.title}
                      onChange={e => setEditingReward({ ...editingReward, title: e.target.value })}
                      className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block font-bold mb-1">الوصف والشروط للعميل</label>
                    <textarea
                      rows={2}
                      value={editingReward.description}
                      onChange={e => setEditingReward({ ...editingReward, description: e.target.value })}
                      className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                    />
                  </div>

                  <div>
                    <label className="block font-bold mb-1">النقاط المطلوبة للاستبدال</label>
                    <input
                      type="number"
                      value={editingReward.pointsCost}
                      onChange={e => setEditingReward({ ...editingReward, pointsCost: Number(e.target.value) })}
                      className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold text-center text-amber-600"
                    />
                  </div>

                  <div>
                    <label className="block font-bold mb-1">قيمة الخصم للعميل (ج.م)</label>
                    <input
                      type="number"
                      value={editingReward.discountValueEGP}
                      onChange={e => setEditingReward({ ...editingReward, discountValueEGP: Number(e.target.value) })}
                      className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold text-center"
                    />
                  </div>

                  <div>
                    <label className="block font-bold mb-1">تكلفة الخدمة على الشركة (ج.م)</label>
                    <input
                      type="number"
                      value={editingReward.costToCompanyEGP}
                      onChange={e => setEditingReward({ ...editingReward, costToCompanyEGP: Number(e.target.value) })}
                      className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold text-center text-rose-600"
                    />
                  </div>

                  <div>
                    <label className="block font-bold mb-1">الزيادة المتوقعة في مبيعات الغاز (م³)</label>
                    <input
                      type="number"
                      value={editingReward.estimatedSalesLiftM3}
                      onChange={e => setEditingReward({ ...editingReward, estimatedSalesLiftM3: Number(e.target.value) })}
                      className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold text-center text-emerald-600"
                    />
                  </div>

                  <div>
                    <label className="block font-bold mb-1">المسؤول عن التنفيذ (Staff Title)</label>
                    <input
                      type="text"
                      value={editingReward.responsibleStaffTitle}
                      onChange={e => setEditingReward({ ...editingReward, responsibleStaffTitle: e.target.value })}
                      className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                    />
                  </div>

                  <div>
                    <label className="block font-bold mb-1">رقم واتساب المسؤول (لاستلام كود الـ OTP)</label>
                    <input
                      type="text"
                      value={editingReward.responsibleStaffPhone}
                      onChange={e => setEditingReward({ ...editingReward, responsibleStaffPhone: e.target.value })}
                      className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono font-bold text-center"
                    />
                  </div>

                  <div className="sm:col-span-2 pt-2 flex items-center justify-between">
                    <label className="flex items-center gap-2 cursor-pointer font-bold">
                      <input
                        type="checkbox"
                        checked={editingReward.available}
                        onChange={e => setEditingReward({ ...editingReward, available: e.target.checked })}
                        className="w-4 h-4 text-emerald-600 rounded"
                      />
                      <span>الخدمة مفعلة ومتاحة للعملاء في التطبيق</span>
                    </label>

                    <button
                      type="button"
                      onClick={() => handleDeleteReward(editingReward.id)}
                      className="text-xs text-rose-600 hover:text-rose-700 font-bold flex items-center gap-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>حذف هذه الخدمة</span>
                    </button>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2">
                  <button
                    onClick={() => handleUpdateReward(editingReward)}
                    className="flex-1 py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl text-xs shadow flex items-center justify-center gap-1.5"
                  >
                    <Check className="w-4 h-4" />
                    <span>حفظ التعديلات في النظام فوراً</span>
                  </button>
                  <button
                    onClick={() => setEditingReward(null)}
                    className="px-5 py-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-xl text-xs"
                  >
                    إلغاء
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 7: ROI & BUDGET FINANCIAL IMPACT ANALYZER */}
      {activeTab === 'roi_financial_budget' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6 text-right">
          <div>
            <h3 className="font-black text-lg text-slate-900 dark:text-white flex items-center gap-2">
              <TrendingUp className="w-6 h-6 text-emerald-600" />
              دراسة الجدوى وموازنة الهدايا وتأثيرها على زيادة مبيعات الغاز وأرباح الشركة
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              تحليل دقيق لتكلفة الهدايا الممنوحة، العائد الإضافي على ضخ الغاز، وهامش الربح الصافي للشركة.
            </p>
          </div>

          {/* Budget Metrics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-5 rounded-3xl bg-rose-50/60 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/60">
              <span className="text-xs font-bold text-rose-800 dark:text-rose-300 block mb-1">
                تكلفة الهدايا على موازنة كارجاس
              </span>
              <span className="text-3xl font-black text-rose-600 dark:text-rose-400">
                {Number(totalGiftsCostEGP.toFixed(0)).toLocaleString()} ج.م
              </span>
              <p className="text-[11px] text-slate-500 mt-2">
                محسوبة بالتكلفة الفعلية المباشرة (Wholesale Cost) للهدايا والزيوت والأمتار المجانية.
              </p>
            </div>

            <div className="p-5 rounded-3xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/60">
              <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300 block mb-1">
                كميات الغاز الإضافية المحفزة (Sales Lift)
              </span>
              <span className="text-3xl font-black text-emerald-600 dark:text-emerald-400">
                +{(totalM3Pumped * 0.28).toFixed(1)} م³
              </span>
              <p className="text-[11px] text-slate-500 mt-2">
                زيادة بنسبة ~28% في تكرار التموين نتيجة حوافز وبرنامج ولاء كارجاس.
              </p>
            </div>

            <div className="p-5 rounded-3xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/60">
              <span className="text-xs font-bold text-amber-800 dark:text-amber-300 block mb-1">
                صافي الربح الإضافي للشركة (Net Margin)
              </span>
              <span className="text-3xl font-black text-amber-600 dark:text-amber-400">
                +{Number(netProfitEGP.toFixed(0)).toLocaleString()} ج.م
              </span>
              <p className="text-[11px] text-slate-500 mt-2">
                عائد الاستثمار (ROI): <strong>{roiPercent}%</strong> لكل جنيه ينفق على الهدايا.
              </p>
            </div>
          </div>

          {/* Interactive What-If Budget Simulator */}
          <div className="p-5 rounded-3xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-emerald-600" />
                محاكي الموازنة التفاعلي (What-If Budget Simulator)
              </h4>
              <span className="text-xs text-emerald-700 font-bold bg-white dark:bg-slate-900 px-3 py-1 rounded-xl">
                عدد الهدايا المتوقع صرفها شهرياً: {simExtraRewardsCount} هدية
              </span>
            </div>

            <div>
              <input
                type="range"
                min="50"
                max="1000"
                step="25"
                value={simExtraRewardsCount}
                onChange={e => setSimExtraRewardsCount(Number(e.target.value))}
                className="w-full accent-emerald-600"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                <span>50 هدية</span>
                <span>500 هدية</span>
                <span>1000 هدية شهرياً</span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 text-center text-xs">
              <div className="bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200 dark:border-slate-800">
                <span className="text-slate-400 block mb-1">التكلفة التقديرية</span>
                <span className="text-lg font-black text-rose-600">
                  {(simExtraRewardsCount * 65).toLocaleString()} ج.م
                </span>
              </div>
              <div className="bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200 dark:border-slate-800">
                <span className="text-slate-400 block mb-1">الزيادة في كميات الغاز</span>
                <span className="text-lg font-black text-emerald-600">
                  +{(simExtraRewardsCount * 110).toLocaleString()} م³
                </span>
              </div>
              <div className="bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200 dark:border-slate-800">
                <span className="text-slate-400 block mb-1">الربح الصافي العائد لكارجاس</span>
                <span className="text-lg font-black text-amber-500">
                  +{((simExtraRewardsCount * 110 * 7.0 * 0.35) - (simExtraRewardsCount * 65)).toLocaleString()} ج.م
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 8: DROPDOWNS & CUSTOM CRITERIA MANAGER */}
      {activeTab === 'dropdowns' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6 text-right">
          <div>
            <h3 className="font-black text-lg text-slate-900 dark:text-white flex items-center gap-2">
              <Layers className="w-6 h-6 text-emerald-600" />
              التحكم في القوائم المنسدلة وإضافة معايير مخصصة
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              إضافة وتعديل خيارات نوع المركبات، طرازات مسدسات التموين، وفئات الهدايا لتظهر في كافة صفحات التطبيق.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {['vehicle_types', 'nozzle_types', 'reward_categories'].map(cat => {
              const catTitle =
                cat === 'vehicle_types'
                  ? 'أنواع المركبات والسيارات'
                  : cat === 'nozzle_types'
                  ? 'طرازات مسدسات التموين'
                  : 'فئات المكافآت والهدايا';
              const items = dropdownItems.filter(i => i.category === cat);
              return (
                <div
                  key={cat}
                  className="p-4 rounded-3xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700"
                >
                  <h4 className="font-bold text-xs text-slate-900 dark:text-white mb-2">
                    {catTitle} ({items.length})
                  </h4>
                  <div className="space-y-1.5">
                    {items.map(item => (
                      <div
                        key={item.id}
                        className="p-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 text-xs flex items-center justify-between"
                      >
                        <span className="font-semibold">{item.labelAr}</span>
                        <span className="text-[10px] text-slate-400 font-mono">{item.labelEn}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Add Dropdown Item Form */}
          <div className="p-4 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/40 space-y-3">
            <span className="font-bold text-xs text-emerald-950 dark:text-emerald-300 block">
              إضافة خيار / معيار جديد للقوائم المنسدلة:
            </span>
            <div className="flex flex-col sm:flex-row items-center gap-2">
              <input
                type="text"
                placeholder="اسم المعيار باللغة العربية"
                value={newDropdownLabel}
                onChange={e => setNewDropdownLabel(e.target.value)}
                className="flex-1 p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
              />
              <select
                value={newDropdownCategory}
                onChange={e => setNewDropdownCategory(e.target.value as any)}
                className="p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold"
              >
                <option value="vehicle_types">أنواع المركبات</option>
                <option value="nozzle_types">طرازات المسدسات</option>
                <option value="reward_categories">فئات الهدايا</option>
              </select>
              <button
                onClick={handleAddDropdownItem}
                className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl text-xs flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>إضافة المعيار</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 9: AUDIT LOGS */}
      {activeTab === 'audit_logs' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 text-right">
          <h3 className="font-black text-lg text-slate-900 dark:text-white flex items-center gap-2">
            <AlertTriangle className="w-6 h-6 text-amber-500" />
            سجل التدقيق والأمان اللحظي
          </h3>

          <div className="space-y-2">
            {auditLogs.map(log => (
              <div
                key={log.id}
                className={`p-3.5 rounded-2xl border text-xs leading-relaxed ${
                  log.severity === 'warning'
                    ? 'bg-rose-50/80 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900'
                    : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-slate-900 dark:text-white">{log.title}</span>
                  <span className="text-[10px] text-slate-400 font-mono">{log.timestamp}</span>
                </div>
                <p className="text-slate-600 dark:text-slate-300">{log.details}</p>
                <div className="text-[10px] text-slate-400 mt-1">المستخدم: {log.user}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 10: SETTINGS & MOEEN */}
      {activeTab === 'settings' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6 text-right">
          <h3 className="font-black text-lg text-slate-900 dark:text-white flex items-center gap-2">
            <Settings className="w-6 h-6 text-emerald-600" />
            إعدادات النظام العامة والمساعد مُعين
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
              <label className="block text-xs font-bold mb-1">رمز مرور مدير النظام (Admin Passcode)</label>
              <input
                type="text"
                maxLength={4}
                value={config.adminPasscode}
                onChange={e => {
                  const updated = { ...config, adminPasscode: e.target.value };
                  setConfig(updated);
                  StorageService.saveConfig(updated);
                }}
                className="w-full p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-center font-mono font-black text-sm"
              />
              <span className="text-[10px] text-slate-400 block mt-1">الافتراضي: 0000</span>
            </div>

            {/* Moeen Assistant Global Controls */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 flex flex-col justify-between">
              <div>
                <span className="text-xs font-bold block mb-1 text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Bot className="w-4 h-4 text-emerald-600" />
                  المساعد الذكي «مُعين» (Moeen Assistant)
                </span>
                <span className="text-[11px] text-slate-400 block leading-relaxed">
                  تفعيل أو تعطيل معين، وإمكانية إخفائه من صفحات السائق والفني مع إبقائه في لوحة المدير.
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-2 mt-3">
                <button
                  onClick={() => {
                    const updated = { ...config, moeenEnabled: !config.moeenEnabled };
                    setConfig(updated);
                    StorageService.saveConfig(updated);
                    showNotification(updated.moeenEnabled ? 'تم تفعيل معين كلياً' : 'تم إيقاف معين كلياً');
                  }}
                  className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all ${
                    config.moeenEnabled
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-300 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  {config.moeenEnabled ? '✓ معين مفعل' : '✕ معين معطل'}
                </button>

                <button
                  onClick={() => {
                    const currentVal = config.moeenShownInUserPages !== false;
                    const updated = { ...config, moeenShownInUserPages: !currentVal };
                    setConfig(updated);
                    StorageService.saveConfig(updated);
                    showNotification(
                      updated.moeenShownInUserPages
                        ? 'معين ظاهر في صفحات السائق والفني'
                        : 'تم إخفاء معين من صفحات المستخدمين (متاح لمدير النظام فقط)'
                    );
                  }}
                  className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all ${
                    config.moeenShownInUserPages !== false
                      ? 'bg-amber-500 text-slate-950 font-black'
                      : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  {config.moeenShownInUserPages !== false ? '✓ ظاهر للمستخدمين' : '✕ للمدير فقط'}
                </button>
              </div>
            </div>

            {/* Anti-Fraud Visibility Toggle on Worker Dashboard */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 flex flex-col justify-between">
              <div>
                <span className="text-xs font-bold text-slate-900 dark:text-white block mb-1 flex items-center gap-1.5">
                  <Shield className="w-4 h-4 text-emerald-600" />
                  صمام الأمان والتحقق من التلاعب (Anti-Fraud) للفني
                </span>
                <span className="text-[11px] text-slate-500 leading-relaxed block">
                  إظهار أو إخفاء بطاقة صمام الأمان في صفحة فني التموين (مع استمرار عمل النظام والتحقق الجغرافي وقفل التردد في الخلفية بنسبة 100%).
                </span>
              </div>
              <button
                onClick={() => {
                  const currentVal = config.showAntiFraudToWorker !== false;
                  const updated = { ...config, showAntiFraudToWorker: !currentVal };
                  setConfig(updated);
                  StorageService.saveConfig(updated);
                  showNotification(
                    updated.showAntiFraudToWorker
                      ? 'تم إظهار صمام الأمان في صفحة الفني'
                      : 'تم إخفاء صمام الأمان من شاشة الفني (والحماية مستمرة بالخلفية)'
                  );
                }}
                className={`py-2 px-4 rounded-xl text-xs font-bold mt-3 transition-all ${
                  config.showAntiFraudToWorker !== false
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-300 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                }`}
              >
                {config.showAntiFraudToWorker !== false
                  ? '✓ ظاهر بشاشة الفني (الحماية نشطة)'
                  : '✕ مخفي من شاشة الفني (الحماية نشطة بالخلفية)'}
              </button>
            </div>

            {/* Worker Incentive System Activation & Visibility */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 flex flex-col justify-between">
              <div>
                <span className="text-xs font-bold text-slate-900 dark:text-white block mb-1 flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-amber-500" />
                  نظام برنامج حوافز الفنيين والتدقيق النظيف
                </span>
                <span className="text-[11px] text-slate-500 leading-relaxed block">
                  التحكم في تفعيل أو إيقاف العمولات، وإظهار أو إخفاء قسم الحوافز كاملاً من واجهة الفني.
                </span>
              </div>
              <div className="flex items-center gap-2 mt-3">
                <button
                  onClick={() => {
                    const currentVal = config.workerIncentiveEnabled !== false;
                    const updated = { ...config, workerIncentiveEnabled: !currentVal };
                    setConfig(updated);
                    StorageService.saveConfig(updated);
                    showNotification(
                      updated.workerIncentiveEnabled
                        ? 'تم تفعيل برنامج الحوافز والعمولات'
                        : 'تم إيقاف برنامج الحوافز والعمولات'
                    );
                  }}
                  className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all ${
                    config.workerIncentiveEnabled !== false
                      ? 'bg-amber-500 text-slate-950 font-black'
                      : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  {config.workerIncentiveEnabled !== false ? '✓ الحوافز مفعلة' : '✕ الحوافز متوقفة'}
                </button>

                <button
                  onClick={() => {
                    const currentVal = config.showWorkerIncentiveToWorker !== false;
                    const updated = { ...config, showWorkerIncentiveToWorker: !currentVal };
                    setConfig(updated);
                    StorageService.saveConfig(updated);
                    showNotification(
                      updated.showWorkerIncentiveToWorker
                        ? 'تم إظهار قسم الحوافز للفني'
                        : 'تم إخفاء قسم الحوافز من واجهة الفني'
                    );
                  }}
                  className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all ${
                    config.showWorkerIncentiveToWorker !== false
                      ? 'bg-emerald-700 text-white'
                      : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  {config.showWorkerIncentiveToWorker !== false ? '✓ ظاهر للفني' : '✕ مخفي عن الفني'}
                </button>
              </div>
            </div>
          </div>

          {/* FULL PAGE VISIBILITY CMS CONTROLLER */}
          <div className="p-5 rounded-3xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 space-y-5">
            <div>
              <h4 className="font-black text-base text-slate-900 dark:text-white flex items-center gap-2">
                <Eye className="w-5 h-5 text-emerald-600" />
                التحكم الكامل في ظهور وإخفاء محتويات وتفاصيل صفحات السائق والفني
              </h4>
              <p className="text-xs text-slate-500 mt-1">
                تحديد دقيق لما يظهر للمستخدم في كل صفحة (إظهار، إخفاء، تفعيل، أو تعطيل فوري لكافة التبويبات والبطاقات).
              </p>
            </div>

            {/* Sub-grid: Driver Page Toggles */}
            <div className="space-y-3">
              <span className="text-xs font-black text-emerald-800 dark:text-emerald-400 block border-b border-slate-200 dark:border-slate-700 pb-1">
                🚗 محتويات صفحة السائق (Driver Dashboard):
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                {[
                  { key: 'showDriverQR', label: 'كود التموين بالمحطة (QR)' },
                  { key: 'showDriverLoyaltyCard', label: 'بطاقة رصيد النقاط وتوفير الغاز' },
                  { key: 'showDriverMaintenance', label: 'تبويب الصيانة والزيوت' },
                  { key: 'showDriverRewards', label: 'كتالوج استبدال الهدايا' },
                  { key: 'showDriverHistory', label: 'سجل عمليات التموين السابقة' },
                  { key: 'showDriverPromotions', label: 'شريط العروض الترويجية الموجهة' },
                  { key: 'showDriverSwitcher', label: 'أداة تبديل السائقين للتجربة' },
                ].map(item => {
                  const isVisible = (config.pageVisibility as any)?.[item.key] !== false;
                  return (
                    <div
                      key={item.key}
                      onClick={() => {
                        const updated = {
                          ...config,
                          pageVisibility: {
                            ...config.pageVisibility,
                            [item.key]: !isVisible,
                          },
                        };
                        setConfig(updated);
                        StorageService.saveConfig(updated);
                        showNotification(
                          !isVisible
                            ? `تم إظهار: ${item.label}`
                            : `تم إخفاء: ${item.label}`
                        );
                      }}
                      className={`p-3 rounded-2xl border cursor-pointer select-none transition-all flex items-center justify-between ${
                        isVisible
                          ? 'bg-emerald-50/80 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-800 text-emerald-950 dark:text-emerald-200'
                          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-400 opacity-70'
                      }`}
                    >
                      <span className="font-bold">{item.label}</span>
                      <span
                        className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${
                          isVisible
                            ? 'bg-emerald-600 text-white font-bold'
                            : 'bg-slate-200 dark:bg-slate-700 text-slate-500'
                        }`}
                      >
                        {isVisible ? 'ظاهر ✓' : 'مخفي ✕'}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Sub-grid: Worker Page Toggles */}
            <div className="space-y-3 pt-2">
              <span className="text-xs font-black text-amber-600 dark:text-amber-400 block border-b border-slate-200 dark:border-slate-700 pb-1">
                ⛽ محتويات صفحة فني التموين (Worker Dashboard):
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
                {[
                  { key: 'showWorkerCamera', label: 'كاميرا الماسح اللحظي' },
                  { key: 'showWorkerDemoDrivers', label: 'شريط محاكاة السائقين التجريبي' },
                  { key: 'showWorkerVoucherValidation', label: 'زر اعتماد قسائم المكافآت والصيانة' },
                ].map(item => {
                  const isVisible = (config.pageVisibility as any)?.[item.key] !== false;
                  return (
                    <div
                      key={item.key}
                      onClick={() => {
                        const updated = {
                          ...config,
                          pageVisibility: {
                            ...config.pageVisibility,
                            [item.key]: !isVisible,
                          },
                        };
                        setConfig(updated);
                        StorageService.saveConfig(updated);
                        showNotification(
                          !isVisible
                            ? `تم إظهار: ${item.label}`
                            : `تم إخفاء: ${item.label}`
                        );
                      }}
                      className={`p-3 rounded-2xl border cursor-pointer select-none transition-all flex items-center justify-between ${
                        isVisible
                          ? 'bg-amber-50/80 dark:bg-amber-950/30 border-amber-300 dark:border-amber-800 text-amber-950 dark:text-amber-200'
                          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-400 opacity-70'
                      }`}
                    >
                      <span className="font-bold">{item.label}</span>
                      <span
                        className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${
                          isVisible
                            ? 'bg-amber-500 text-slate-950 font-black'
                            : 'bg-slate-200 dark:bg-slate-700 text-slate-500'
                        }`}
                      >
                        {isVisible ? 'ظاهر ✓' : 'مخفي ✕'}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* CMS Headings & Instruction Texts Editor */}
            <div className="space-y-3 pt-3 border-t border-slate-200 dark:border-slate-700">
              <span className="text-xs font-black text-slate-900 dark:text-white block">
                ✏️ تعديل نصوص وعناوين صفحات المستخدمين المعروضة:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    عنوان ترحيب صفحة السائق
                  </label>
                  <input
                    type="text"
                    value={config.pageVisibility?.driverWelcomeTitle || ''}
                    onChange={e => {
                      const updated = {
                        ...config,
                        pageVisibility: {
                          ...config.pageVisibility,
                          driverWelcomeTitle: e.target.value,
                        },
                      };
                      setConfig(updated);
                      StorageService.saveConfig(updated);
                    }}
                    placeholder="كود كارجاس الشخصي للتموين"
                    className="w-full p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    إرشادات مسح كود السائق
                  </label>
                  <input
                    type="text"
                    value={config.pageVisibility?.driverQrHelpText || ''}
                    onChange={e => {
                      const updated = {
                        ...config,
                        pageVisibility: {
                          ...config.pageVisibility,
                          driverQrHelpText: e.target.value,
                        },
                      };
                      setConfig(updated);
                      StorageService.saveConfig(updated);
                    }}
                    placeholder="وجّه شاشة هاتفك نحو فني المحطة لمسح الكود..."
                    className="w-full p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    عنوان شاشة فني التموين
                  </label>
                  <input
                    type="text"
                    value={config.pageVisibility?.workerHeaderTitle || ''}
                    onChange={e => {
                      const updated = {
                        ...config,
                        pageVisibility: {
                          ...config.pageVisibility,
                          workerHeaderTitle: e.target.value,
                        },
                      };
                      setConfig(updated);
                      StorageService.saveConfig(updated);
                    }}
                    placeholder="مسح كيو آر كود السائق وتوثيق التموين"
                    className="w-full p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    إرشادات ماسح الفني
                  </label>
                  <input
                    type="text"
                    value={config.pageVisibility?.workerScannerHelpText || ''}
                    onChange={e => {
                      const updated = {
                        ...config,
                        pageVisibility: {
                          ...config.pageVisibility,
                          workerScannerHelpText: e.target.value,
                        },
                      };
                      setConfig(updated);
                      StorageService.saveConfig(updated);
                    }}
                    placeholder="امسح الكود الشخصي من هاتف السائق للتحقق الفوري..."
                    className="w-full p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: ADD / EDIT STAFF MEMBER (فني تموين / رئيس وردية / مشرف محطة) */}
      {showStaffModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-xl bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border-2 border-emerald-600 text-right space-y-4 max-h-[92vh] overflow-y-auto relative">
            <button
              onClick={() => setShowStaffModal(false)}
              className="absolute top-4 left-4 p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600"
            >
              ✕
            </button>

            <div className="border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-emerald-600" />
                {editingStaffId ? 'تعديل بيانات الموظف' : 'إدخال بيانات عامل جديد (فني / رئيس وردية / مشرف)'}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                تحديد الدور والصلاحيات والمحطة المعين بها ورقم الواتساب لاستلام رمز دخول الوردية اليومي تلقائياً.
              </p>
            </div>

            <form onSubmit={handleSaveStaff} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Full Name */}
                <div className="sm:col-span-2">
                  <label className="block font-bold mb-1 text-slate-700 dark:text-slate-300">
                    الاسم بالكامل *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="مثال: أحمد صابر عبد السلام"
                    value={staffName}
                    onChange={e => setStaffName(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold"
                  />
                </div>

                {/* Role */}
                <div>
                  <label className="block font-bold mb-1 text-slate-700 dark:text-slate-300">
                    الدور الوظيفي الرئيسي *
                  </label>
                  <select
                    value={staffRole}
                    onChange={e => {
                      const r = e.target.value as StaffRole;
                      setStaffRole(r);
                      if (!staffJobTitle) {
                        setStaffJobTitle(
                          r === 'technician'
                            ? 'فني تموين ومسؤول مضخات'
                            : r === 'shift_leader'
                            ? 'رئيس وردية تشغيل'
                            : 'مشرف عام المحطة'
                        );
                      }
                    }}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold"
                  >
                    <option value="technician">فني تموين (Technician) ⛽</option>
                    <option value="shift_leader">رئيس وردية (Shift Leader) ⏱️</option>
                    <option value="station_supervisor">مشرف محطة (Station Supervisor) 👔</option>
                  </select>
                </div>

                {/* Custom Job Title */}
                <div>
                  <label className="block font-bold mb-1 text-slate-700 dark:text-slate-300">
                    المسمى الوظيفي الداخلي
                  </label>
                  <input
                    type="text"
                    placeholder="مثال: مسؤول مسدسات الضغط العالي"
                    value={staffJobTitle}
                    onChange={e => setStaffJobTitle(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                  />
                </div>

                {/* Phone / WhatsApp */}
                <div>
                  <label className="block font-bold mb-1 text-slate-700 dark:text-slate-300 flex items-center justify-between">
                    <span>رقم الموبايل / الواتساب *</span>
                    <span className="text-[10px] text-emerald-600 font-bold">لاستلام باسوورد الوردية</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="مثال: 01011223344"
                    value={staffPhone}
                    onChange={e => setStaffPhone(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono font-bold text-center"
                  />
                </div>

                {/* National ID */}
                <div>
                  <label className="block font-bold mb-1 text-slate-700 dark:text-slate-300">
                    الرقم القومي (14 رقم)
                  </label>
                  <input
                    type="text"
                    maxLength={14}
                    placeholder="مثال: 29304151203491"
                    value={staffNationalId}
                    onChange={e => setStaffNationalId(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono text-center"
                  />
                </div>

                {/* Assigned Station */}
                <div>
                  <label className="block font-bold mb-1 text-slate-700 dark:text-slate-300">
                    المحطة المعين بها *
                  </label>
                  <select
                    value={staffStationId}
                    onChange={e => setStaffStationId(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold"
                  >
                    {stations.map(st => (
                      <option key={st.id} value={st.id}>
                        {st.name} ({st.governorate})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Assigned Shift */}
                <div>
                  <label className="block font-bold mb-1 text-slate-700 dark:text-slate-300">
                    الوردية المخصصة *
                  </label>
                  <select
                    value={staffShiftId}
                    onChange={e => setStaffShiftId(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold"
                  >
                    {shifts.map(s => (
                      <option key={s.id} value={s.id}>
                        {s.shiftName} ({s.startTime} - {s.endTime})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2">
                <button
                  type="submit"
                  className="flex-1 py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl text-xs shadow flex items-center justify-center gap-1.5 active:scale-98 transition-all"
                >
                  <Check className="w-4 h-4 text-amber-300" />
                  <span>{editingStaffId ? 'حفظ التعديلات' : 'تسجيل واعتماد الموظف'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowStaffModal(false)}
                  className="px-5 py-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-xl text-xs"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PUMP QR CODE PRINT MODAL */}
      {showPumpPrintModal && (
        <PumpPrintModal
          isOpen={showPumpPrintModal}
          onClose={() => setShowPumpPrintModal(false)}
          station={printModalStation}
          initialPumpNumber={printModalPump}
          maxPressureBar={maxPressure}
          stations={stations}
          onSelectStation={st => setPrintModalStation(st)}
        />
      )}
    </div>
  );
};
