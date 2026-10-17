export type UserRole = 'driver' | 'worker' | 'admin';
export type Language = 'ar' | 'en';
export type VehicleType = 'taxi' | 'private' | 'microbus' | 'commercial';
export type DriverTier = 'Silver' | 'Gold' | 'Platinum';

export type GeographicRegionId =
  | 'east'
  | 'west'
  | 'upper_egypt'
  | 'alex_matrouh'
  | 'canal_red_sea'
  | 'delta';

export interface GeographicRegion {
  id: GeographicRegionId;
  nameAr: string;
  nameEn: string;
  governorates: string[];
}

export interface StationCoordinates {
  lat: number;
  lng: number;
}

export interface Station {
  id: string;
  name: string;
  nameEn: string;
  regionId: GeographicRegionId;
  governorate: string;
  city: string;
  cityEn: string;
  address: string;
  addressEn: string;
  coordinates: StationCoordinates;
  dispensersCount: number;          // Total pumps count (عدد الطلمبات الفعلي)
  operatingDispensersCount: number; // Operating pumps (عدد الطلمبات العاملة)
  disabledDispensersCount: number;  // Malfunctioning pumps (عدد الطلمبات المعطلة)
  shiftsCount: number;              // Shifts count (عدد الورديات)
  workersPerShift: number;          // Workers per shift (عدد العاملين بكل وردية)
  activeWorkersCount: number;
  status: 'active' | 'maintenance' | 'busy';
  phone: string;
}

export interface Dispenser {
  id: string;
  stationId: string;
  stationName: string;
  dispenserNumber: number;
  nozzleType: string;
  maxPressureBar: number;
  qrCodeString: string;
  status: 'online' | 'offline' | 'calibrating';
  lastInspectionDate: string;
}

export interface MaintenanceSchedule {
  id: string;
  driverId: string;
  serviceType: 'oil_change' | 'cylinder_test' | 'filter_replacement' | 'tire_nitrogen' | 'general_safety';
  title: string;
  dueDate: string;
  currentKm?: number;
  nextServiceKm?: number;
  stationName?: string;
  status: 'upcoming' | 'completed' | 'overdue';
  costEGP?: number;
  notes?: string;
}

export interface Driver {
  id: string;
  name: string;
  phone: string;
  plateNumber: string;
  vehicleType: VehicleType;
  vehicleModel: string;
  regionId: GeographicRegionId;
  governorate: string;
  tankCapacityM3: number;
  pointsBalance: number;
  tier: DriverTier;
  totalM3Pumped: number;
  totalTransactionsCount: number;
  totalSpentEGP: number;
  memberSince: string;
  qrToken: string;
  maintenanceSchedules?: MaintenanceSchedule[];
}

export interface ShiftTimingConfig {
  id: string;
  stationId?: string;               // Station ID or 'all'
  stationName?: string;             // Station Name
  shiftName: string;                // e.g. "الوردية الصباحية"
  startTime: string;                // e.g. "07:00"
  endTime: string;                  // e.g. "15:00"
  workersCount: number;             // عدد العاملين بكل وردية
  isActive: boolean;
  dailyPasscode: string;
  passcodeGeneratedDate: string;    // YYYY-MM-DD
  smsSentToWorkers: boolean;
  autoSendPasscode?: boolean;       // إرسال تلقائي يومي لرقم الفني المسجل
}

export interface WorkerShift {
  id: string;
  startTime: string;
  endTime?: string;
  isActive: boolean;
  stationId: string;
  dispenserId?: string;
  dispensedM3: number;
  transactionsCount: number;
  earnedCommissionEGP: number;
  fraudAlertsCount: number;
}

export type StaffRole = 'technician' | 'shift_leader' | 'station_supervisor';

export interface Worker {
  id: string;
  name: string;
  phone: string;
  role?: StaffRole;
  jobTitle?: string;
  stationId: string;
  stationName: string;
  regionId: GeographicRegionId;
  nationalId: string;
  assignedShiftId: string;
  status?: 'active' | 'suspended';
  activeShift: WorkerShift;
  dailyCommissionEGP: number;
  monthlyCommissionEGP: number;
  cleanAuditStreakDays: number;
  cleanAuditBonusEligible: boolean;
  stationRank: number;
  totalDispensedM3: number;
  rating: number;
}

export interface Transaction {
  id: string;
  timestamp: string;
  stationId: string;
  stationName: string;
  regionId: GeographicRegionId;
  governorate: string;
  dispenserId: string;
  dispenserNumber: number;
  driverId: string;
  driverName: string;
  plateNumber: string;
  vehicleType: VehicleType;
  workerId: string;
  workerName: string;
  m3Quantity: number;
  pricePerM3: number;
  totalCostEGP: number;
  earnedPoints: number;
  workerCommissionEGP: number;
  geoVerified: boolean;
  workerLat: number;
  workerLng: number;
  distanceFromStationMeters: number;
  status: 'completed' | 'flagged' | 'cancelled';
  fraudReason?: string;
  receiptNumber: string;
}

export type RewardType =
  | 'cash_voucher'
  | 'free_gas_m3'
  | 'oil_percent_discount'
  | 'free_service_labor_only'
  | 'free_service_full_parts'
  | 'car_wash_discount'
  | 'partner_tire_nitrogen';

export interface Reward {
  id: string;
  title: string;
  titleEn: string;
  description: string;
  descriptionEn: string;
  rewardType: RewardType;
  pointsCost: number;
  category: 'fuel' | 'service' | 'maintenance' | 'gift' | 'partner';
  voucherCodePrefix: string;
  discountValueEGP: number;
  freeM3Amount?: number;
  discountPercent?: number;
  costToCompanyEGP: number;     // Cost incurred by Cargas
  estimatedSalesLiftM3: number; // Gas volume gain stimulated
  responsibleStaffTitle: string; // e.g. 'فني صيانة وتغيير زيوت كارجاس'
  responsibleStaffPhone: string; // WhatsApp number
  available: boolean;
}

export interface RedeemedVoucher {
  id: string;
  rewardId: string;
  driverId: string;
  driverName?: string;
  plateNumber?: string;
  rewardTitle: string;
  rewardType: RewardType;
  voucherCode: string;
  redeemedAt: string;
  expiresAt: string;
  pointsSpent: number;
  valueEGP: number;
  secretAuthPin: string;             // 4-digit PIN generated and sent to staff WhatsApp
  authPinSentToPhone: string;        // WhatsApp number received the PIN
  responsibleStaffTitle: string;     // Staff role responsible for executing service
  verifiedByWorkerName?: string;     // Name or ID of worker who entered the PIN
  verifiedAt?: string;               // Exact time the PIN was validated
  whatsappMessageText?: string;      // The actual WhatsApp message payload
  whatsappDirectUrl?: string;        // wa.me direct link
  status: 'pending_worker_pin' | 'completed' | 'expired';
}

export type PromotionTargetingType =
  | 'all'
  | 'region'
  | 'governorate'
  | 'specific_plates'
  | 'specific_drivers';

export interface Promotion {
  id: string;
  title: string;
  titleEn: string;
  description: string;
  descriptionEn: string;
  pointsMultiplier: number;
  bonusPoints: number;
  validUntil: string;
  targetVehicle: 'all' | VehicleType;
  targetingType: PromotionTargetingType;
  targetRegionId?: GeographicRegionId;
  targetGovernorate?: string;
  targetPlates?: string[];
  targetDriverIds?: string[];
  bannerColor: string;
  active: boolean;
}

export interface PushNotification {
  id: string;
  title: string;
  titleEn: string;
  message: string;
  messageEn: string;
  timestamp: string;
  targetRole: 'all' | 'driver' | 'worker';
  targetDriverId?: string;
  targetRegionId?: GeographicRegionId;
  read: boolean;
  type: 'fuel_confirm' | 'points_add' | 'promo' | 'security' | 'commission' | 'shift_passcode';
}

export interface AuditLog {
  id: string;
  timestamp: string;
  eventType:
    | 'transaction_completed'
    | 'fraud_detected'
    | 'shift_started'
    | 'shift_ended'
    | 'rules_updated'
    | 'qr_generated'
    | 'passcode_generated'
    | 'targeting_campaign_created';
  title: string;
  details: string;
  severity: 'info' | 'warning' | 'critical';
  user: string;
  stationName?: string;
}

export interface DropdownItem {
  id: string;
  labelAr: string;
  labelEn: string;
  category: 'vehicle_types' | 'nozzle_types' | 'reward_categories' | 'regions';
}

export interface PageVisibilityConfig {
  // Driver Page Sections
  showDriverLoyaltyCard: boolean;
  showDriverQR: boolean;
  showDriverMaintenance: boolean;
  showDriverRewards: boolean;
  showDriverHistory: boolean;
  showDriverPromotions: boolean;
  showDriverSwitcher: boolean;

  // Worker Page Sections
  showWorkerCamera: boolean;
  showWorkerDemoDrivers: boolean;
  showWorkerVoucherValidation: boolean;
  showWorkerAntiFraud: boolean;
  showWorkerIncentive: boolean;
  showWorkerLastReceipt: boolean;

  // Customizable CMS Headings & Instruction Texts
  driverWelcomeTitle: string;
  driverQrHelpText: string;
  workerHeaderTitle: string;
  workerScannerHelpText: string;
}

export interface SystemConfig {
  pointsPerM3: number;
  egpPerM3: number;
  workerCommissionPerM3: number;
  cleanAuditBonusAmountEGP: number;
  geofenceRadiusMeters: number;
  adminPasscode: string;
  simulationGpsInside: boolean;
  moeenEnabled: boolean;
  moeenVoiceEnabled: boolean;
  moeenShownInUserPages: boolean;     // إظهار أو إخفاء معين في صفحات المستخدمين (السائق والفني)
  moeenAllowedTopics: string[];
  themePrimaryColor: string;
  themeAccentColor: string;
  shifts: ShiftTimingConfig[];
  dropdownItems: DropdownItem[];
  regions: GeographicRegion[];
  showAntiFraudToWorker: boolean;
  workerIncentiveEnabled: boolean;
  showWorkerIncentiveToWorker: boolean;
  autoGenerateDailyPasscode: boolean; // توليد وإرسال تلقائي للرقم السري يومياً
  pageVisibility: PageVisibilityConfig;
}

