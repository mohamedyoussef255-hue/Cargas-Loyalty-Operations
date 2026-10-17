import React, { useState, useRef } from 'react';
import {
  X,
  Printer,
  Download,
  Fuel,
  QrCode,
  ShieldCheck,
  AlertTriangle,
  Flame,
  Check,
  Copy,
  Layers,
  Sparkles,
} from 'lucide-react';
import { Station } from '../../types';
import { QRCodeRenderer } from '../common/QRCodeRenderer';
import { CargasLogo } from '../common/CargasLogo';

interface PumpPrintModalProps {
  isOpen: boolean;
  onClose: () => void;
  station: Station;
  initialPumpNumber?: number;
  maxPressureBar?: number;
  stations: Station[];
  onSelectStation?: (station: Station) => void;
}

export const PumpPrintModal: React.FC<PumpPrintModalProps> = ({
  isOpen,
  onClose,
  station,
  initialPumpNumber = 1,
  maxPressureBar = 200,
  stations,
  onSelectStation,
}) => {
  const [selectedStation, setSelectedStation] = useState<Station>(station);
  const [selectedPump, setSelectedPump] = useState<number>(initialPumpNumber);
  const [printMode, setPrintMode] = useState<'single' | 'bulk'>('single');
  const [badgeTheme, setBadgeTheme] = useState<'cargas_color' | 'monochrome'>('cargas_color');
  const [badgeSize, setBadgeSize] = useState<'standard' | 'compact' | 'large'>('standard');
  const [showSafetyTips, setShowSafetyTips] = useState<boolean>(true);
  const [showInstructions, setShowInstructions] = useState<boolean>(true);
  const [copiedText, setCopiedText] = useState<boolean>(false);
  const printAreaRef = useRef<HTMLDivElement | null>(null);

  if (!isOpen) return null;

  const currentStation = selectedStation || station;
  const totalPumps = currentStation.dispensersCount || 6;
  const pumpList = Array.from({ length: totalPumps }, (_, i) => i + 1);

  // Generate payload for a specific pump
  const getDispenserPayload = (pumpNo: number) => {
    const dispenserId = `DSP-${currentStation.id.replace('ST-', '')}-${String(pumpNo).padStart(2, '0')}`;
    return JSON.stringify({
      type: 'CARGAS_DISPENSER',
      stationId: currentStation.id,
      stationName: currentStation.name,
      dispenserId,
      pumpNo,
      maxBar: maxPressureBar,
    });
  };

  const getDispenserId = (pumpNo: number) => {
    return `DSP-${currentStation.id.replace('ST-', '')}-${String(pumpNo).padStart(2, '0')}`;
  };

  // Direct print action using clean isolated window
  const handlePrint = () => {
    if (!printAreaRef.current) return;
    const printContent = printAreaRef.current.innerHTML;
    const printWindow = window.open('', '_blank', 'width=850,height=950');
    if (!printWindow) {
      // Fallback to window.print if popup blocked
      window.print();
      return;
    }

    printWindow.document.write(`
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
        <head>
          <meta charset="utf-8" />
          <title>طباعة ملصق طلمبة التموين - كارجاس - ${currentStation.name}</title>
          <link rel="preconnect" href="https://fonts.googleapis.com">
          <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
          <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800;900&family=Inter:wght@400;600;700;800&display=swap" rel="stylesheet">
          <style>
            * { box-sizing: border-box; margin: 0; padding: 0; }
            body {
              font-family: 'Cairo', system-ui, sans-serif;
              background: #ffffff;
              color: #0f172a;
              padding: 10mm;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            .print-wrapper {
              display: flex;
              flex-direction: column;
              align-items: center;
              gap: 20mm;
            }
            .sticker-card {
              width: 135mm;
              border: 3.5mm solid ${badgeTheme === 'cargas_color' ? '#0b4e24' : '#000000'};
              border-radius: 8mm;
              padding: 6mm;
              text-align: center;
              background: #ffffff;
              page-break-inside: avoid;
              box-sizing: border-box;
              margin-bottom: 10mm;
            }
            .sticker-header {
              background: ${badgeTheme === 'cargas_color' ? '#0b4e24' : '#111111'};
              color: #ffffff;
              padding: 4mm 6mm;
              border-radius: 4mm;
              margin-bottom: 4mm;
              display: flex;
              align-items: center;
              justify-content: space-between;
            }
            .sticker-title {
              font-size: 26pt;
              font-weight: 900;
              color: ${badgeTheme === 'cargas_color' ? '#0b4e24' : '#000000'};
              margin: 3mm 0;
            }
            .station-name {
              font-size: 14pt;
              font-weight: 700;
              color: #334155;
            }
            .badge-id {
              font-family: monospace;
              font-size: 11pt;
              font-weight: bold;
              color: #64748b;
              margin-bottom: 4mm;
            }
            .qr-holder {
              display: flex;
              justify-content: center;
              margin: 4mm 0;
            }
            .qr-holder canvas, .qr-holder img {
              width: 60mm !important;
              height: 60mm !important;
            }
            .safety-box {
              background: #fffbeb;
              border: 1.5mm solid #f59e0b;
              border-radius: 4mm;
              padding: 3mm;
              font-size: 10pt;
              font-weight: bold;
              color: #92400e;
              margin-top: 4mm;
              display: flex;
              justify-content: space-around;
            }
            .footer-note {
              font-size: 9pt;
              font-weight: 600;
              color: #475569;
              margin-top: 3mm;
            }
            @media print {
              body { padding: 0; }
              .page-break {
                page-break-after: always;
                break-after: page;
              }
            }
          </style>
        </head>
        <body>
          <div class="print-wrapper">
            ${printContent}
          </div>
          <script>
            window.onload = function() {
              window.print();
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  // Download high-resolution PNG of the sticker
  const handleDownloadPNG = () => {
    // Locate the first QR canvas in the print area
    const canvas = printAreaRef.current?.querySelector('canvas');
    if (!canvas) {
      alert('لم يتم العثور على الكود للتحميل');
      return;
    }

    // Create a new off-screen canvas to render the complete badge as an image
    const badgeCanvas = document.createElement('canvas');
    badgeCanvas.width = 900;
    badgeCanvas.height = 1250;
    const ctx = badgeCanvas.getContext('2d');
    if (!ctx) return;

    // Background
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, badgeCanvas.width, badgeCanvas.height);

    // Outer Border
    ctx.strokeStyle = badgeTheme === 'cargas_color' ? '#0B4E24' : '#000000';
    ctx.lineWidth = 24;
    ctx.strokeRect(12, 12, badgeCanvas.width - 24, badgeCanvas.height - 24);

    // Inner subtle border
    ctx.strokeStyle = badgeTheme === 'cargas_color' ? '#FFC72C' : '#E2E8F0';
    ctx.lineWidth = 6;
    ctx.strokeRect(28, 28, badgeCanvas.width - 56, badgeCanvas.height - 56);

    // Header Background
    ctx.fillStyle = badgeTheme === 'cargas_color' ? '#0B4E24' : '#1E293B';
    ctx.fillRect(34, 34, badgeCanvas.width - 68, 140);

    // Header Text
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 36px Cairo, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('شركة الغاز الطبيعي للسيارات (كارجاس)', badgeCanvas.width / 2, 95);

    ctx.fillStyle = '#FFC72C';
    ctx.font = 'bold 22px Cairo, sans-serif';
    ctx.fillText('CARGAS NATURAL GAS VEHICLES • قطاع العمليات', badgeCanvas.width / 2, 140);

    // Pump Number Title
    ctx.fillStyle = badgeTheme === 'cargas_color' ? '#0B4E24' : '#000000';
    ctx.font = '900 68px Cairo, sans-serif';
    ctx.fillText(`طلمبة تموين رقم ${selectedPump}`, badgeCanvas.width / 2, 260);

    ctx.fillStyle = '#64748B';
    ctx.font = 'bold 30px Inter, sans-serif';
    ctx.fillText(`CNG DISPENSER PUMP #${selectedPump}`, badgeCanvas.width / 2, 310);

    // Station Name
    ctx.fillStyle = '#1E293B';
    ctx.font = 'bold 34px Cairo, sans-serif';
    ctx.fillText(currentStation.name, badgeCanvas.width / 2, 375);

    // Dispenser ID & Specs
    ctx.fillStyle = '#0B4E24';
    ctx.font = 'bold 24px monospace';
    ctx.fillText(
      `ID: ${getDispenserId(selectedPump)} | MAX: ${maxPressureBar} BAR | CNG NGV1`,
      badgeCanvas.width / 2,
      420
    );

    // Draw QR Code from canvas
    const qrSize = 420;
    const qrX = (badgeCanvas.width - qrSize) / 2;
    const qrY = 460;

    // White QR background frame
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(qrX - 15, qrY - 15, qrSize + 30, qrSize + 30);
    ctx.strokeStyle = '#CBD5E1';
    ctx.lineWidth = 4;
    ctx.strokeRect(qrX - 15, qrY - 15, qrSize + 30, qrSize + 30);

    ctx.drawImage(canvas, qrX, qrY, qrSize, qrSize);

    // Call to Action
    ctx.fillStyle = badgeTheme === 'cargas_color' ? '#0B4E24' : '#1E293B';
    ctx.font = 'bold 26px Cairo, sans-serif';
    ctx.fillText(
      'امسح الكود عبر تطبيق كارجاس لتسجيل التموين وحساب النقاط',
      badgeCanvas.width / 2,
      945
    );

    // Safety Bar
    ctx.fillStyle = '#FEF3C7';
    ctx.fillRect(45, 990, badgeCanvas.width - 90, 140);
    ctx.strokeStyle = '#F59E0B';
    ctx.lineWidth = 4;
    ctx.strokeRect(45, 990, badgeCanvas.width - 90, 140);

    ctx.fillStyle = '#92400E';
    ctx.font = 'bold 24px Cairo, sans-serif';
    ctx.fillText('⚠️ تعليمات وإرشادات السلامة والأمان المهني:', badgeCanvas.width / 2, 1035);

    ctx.fillStyle = '#78350F';
    ctx.font = 'bold 20px Cairo, sans-serif';
    ctx.fillText(
      'إطفاء المحرك تماماً • ممنوع التدخين • التزم بتعليمات فني التموين',
      badgeCanvas.width / 2,
      1090
    );

    // Footer
    ctx.fillStyle = '#94A3B8';
    ctx.font = '18px Cairo, sans-serif';
    ctx.fillText(
      'شركة كارجاس • طاقة نظيفة واقتصادية لمستقبل مصر 🇪🇬 • www.cargas.com.eg',
      badgeCanvas.width / 2,
      1190
    );

    // Trigger Download
    const dataUrl = badgeCanvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = `cargas_pump_${currentStation.id}_${selectedPump}.png`;
    link.href = dataUrl;
    link.click();
  };

  const handleCopyPayload = () => {
    navigator.clipboard.writeText(getDispenserPayload(selectedPump));
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-5xl max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden text-right">
        {/* Top Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-emerald-950 via-emerald-900 to-slate-900 text-white flex items-center justify-between border-b border-emerald-800/50">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center font-black shadow">
              <Printer className="w-6 h-6 text-emerald-950" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-base sm:text-lg">
                  طباعة كود ومعرّف طلمبة التموين (Dispenser QR Badge)
                </h3>
                <span className="bg-amber-400/20 text-amber-300 border border-amber-400/40 text-[10px] font-black px-2 py-0.5 rounded-full">
                  Industrial Print
                </span>
              </div>
              <p className="text-xs text-emerald-200/90 mt-0.5">
                توليد وطباعة الملصق الفني المعتمد لطلمبات ومسدسات الغاز الطبيعي CNG بمحطات كارجاس
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-300 hover:text-white hover:bg-white/10 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body: Split into Settings Panel & Live Print Preview */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Controls & Customization Sidebar */}
          <div className="lg:col-span-5 space-y-4 text-xs">
            {/* Station Selector */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
              <label className="block font-bold text-slate-700 dark:text-slate-300">
                المحطة المستهدفة *
              </label>
              <select
                value={currentStation.id}
                onChange={e => {
                  const found = stations.find(s => s.id === e.target.value);
                  if (found) {
                    setSelectedStation(found);
                    if (onSelectStation) onSelectStation(found);
                  }
                }}
                className="w-full p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-bold text-xs"
              >
                {stations.map(st => (
                  <option key={st.id} value={st.id}>
                    {st.name} ({st.governorate}) - {st.dispensersCount} مضخات
                  </option>
                ))}
              </select>
            </div>

            {/* Print Mode Selector: Single vs Bulk */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
              <span className="block font-bold text-slate-700 dark:text-slate-300">
                نطاق الطباعة *
              </span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setPrintMode('single')}
                  className={`p-2.5 rounded-xl font-bold flex items-center justify-center gap-1.5 transition-all ${
                    printMode === 'single'
                      ? 'bg-emerald-700 text-white shadow'
                      : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                  }`}
                >
                  <Fuel className="w-4 h-4" />
                  <span>طلمبة فردية محددة</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPrintMode('bulk')}
                  className={`p-2.5 rounded-xl font-bold flex items-center justify-center gap-1.5 transition-all ${
                    printMode === 'bulk'
                      ? 'bg-amber-400 text-slate-950 font-black shadow'
                      : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                  }`}
                >
                  <Layers className="w-4 h-4" />
                  <span>كافة طلمبات المحطة ({totalPumps})</span>
                </button>
              </div>

              {printMode === 'single' && (
                <div className="pt-2">
                  <span className="block text-[11px] text-slate-500 mb-1.5 font-bold">
                    اختر رقم الطلمبة / المسدس المراد طباعته:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {pumpList.map(num => (
                      <button
                        key={num}
                        type="button"
                        onClick={() => setSelectedPump(num)}
                        className={`w-9 h-9 rounded-xl font-mono font-black text-xs transition-all ${
                          selectedPump === num
                            ? 'bg-emerald-700 text-white shadow-md scale-105'
                            : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        {num}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Design & Print Options */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3">
              <span className="block font-bold text-slate-700 dark:text-slate-300">
                خيارات ومواصفات الملصق:
              </span>

              {/* Theme */}
              <div className="flex items-center justify-between">
                <span className="text-slate-600 dark:text-slate-400">النمط اللوني:</span>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setBadgeTheme('cargas_color')}
                    className={`px-2.5 py-1 rounded-lg font-bold text-[11px] ${
                      badgeTheme === 'cargas_color'
                        ? 'bg-emerald-800 text-white'
                        : 'bg-white dark:bg-slate-900 text-slate-600'
                    }`}
                  >
                    ألوان كارجاس الرسمية 🟢
                  </button>
                  <button
                    type="button"
                    onClick={() => setBadgeTheme('monochrome')}
                    className={`px-2.5 py-1 rounded-lg font-bold text-[11px] ${
                      badgeTheme === 'monochrome'
                        ? 'bg-slate-900 text-white'
                        : 'bg-white dark:bg-slate-900 text-slate-600'
                    }`}
                  >
                    أبيض وأسود (طابعات حرارية) 🖨️
                  </button>
                </div>
              </div>

              {/* Safety Rules Toggle */}
              <div className="flex items-center justify-between pt-1 border-t border-slate-200 dark:border-slate-700">
                <span className="text-slate-600 dark:text-slate-400">
                  شريط إرشادات السلامة والأمان:
                </span>
                <input
                  type="checkbox"
                  checked={showSafetyTips}
                  onChange={e => setShowSafetyTips(e.target.checked)}
                  className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
                />
              </div>

              {/* Instructions Toggle */}
              <div className="flex items-center justify-between">
                <span className="text-slate-600 dark:text-slate-400">
                  إرشادات مسح الكود بتطبيق الولاء:
                </span>
                <input
                  type="checkbox"
                  checked={showInstructions}
                  onChange={e => setShowInstructions(e.target.checked)}
                  className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
                />
              </div>
            </div>

            {/* Quick Actions (Print, Download PNG, Copy) */}
            <div className="space-y-2 pt-2">
              <button
                type="button"
                onClick={handlePrint}
                className="w-full py-3.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-2xl shadow-lg flex items-center justify-center gap-2 active:scale-98 transition-all text-xs"
              >
                <Printer className="w-4 h-4 text-amber-300" />
                <span>
                  {printMode === 'single'
                    ? `طباعة ملصق طلمبة رقم ${selectedPump} 🖨️`
                    : `طباعة مجمعة لكافة طلمبات المحطة (${totalPumps}) 🖨️`}
                </span>
              </button>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={handleDownloadPNG}
                  className="py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow active:scale-95 transition-all"
                  title="تنزيل كصورة PNG عالية الدقة لإرسالها لمطبعة ملصقات الفينيل"
                >
                  <Download className="w-3.5 h-3.5 text-emerald-950" />
                  <span>تنزيل ملصق PNG 💾</span>
                </button>

                <button
                  type="button"
                  onClick={handleCopyPayload}
                  className="py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all"
                >
                  {copiedText ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span>تم النسخ ✓</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>نسخ كود الكيو آر</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Practical Advice Note */}
            <div className="p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-xl text-[11px] text-amber-900 dark:text-amber-200 leading-relaxed">
              💡 <strong>توصية المهندس الفني:</strong> يفضل طباعة الملصق على ورق فينيل مقاوم للحرارة
              والرطوبة ومسحوبات الوقود (Outdoor Weatherproof Vinyl Sticker) وتثبيته على جسم المضخة
              بجانب شاشة العداد الرقمي مباشرة لسهولة مسحه من قبل السائق أو فني التموين.
            </div>
          </div>

          {/* Live Printable Badge Preview Area */}
          <div className="lg:col-span-7 flex flex-col items-center justify-start bg-slate-100 dark:bg-slate-950 p-4 sm:p-6 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-y-auto max-h-[75vh]">
            <div className="w-full flex items-center justify-between text-xs text-slate-500 mb-3 px-2">
              <span className="font-bold flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                معاينة الملصق المطبوع (Live Print Preview):
              </span>
              <span className="font-mono text-[10px] bg-white dark:bg-slate-900 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700">
                {printMode === 'single' ? 'ملصق فردي' : `ورقة مجمعة (${totalPumps} طلمبات)`}
              </span>
            </div>

            {/* Ref container that gets grabbed for print */}
            <div ref={printAreaRef} className="w-full flex flex-col items-center gap-6">
              {printMode === 'single' ? (
                /* SINGLE BADGE */
                <SingleDispenserBadge
                  pumpNo={selectedPump}
                  station={currentStation}
                  payload={getDispenserPayload(selectedPump)}
                  dispenserId={getDispenserId(selectedPump)}
                  maxBar={maxPressureBar}
                  theme={badgeTheme}
                  showSafety={showSafetyTips}
                  showInstructions={showInstructions}
                />
              ) : (
                /* BULK BADGES (ALL PUMPS OF THE STATION) */
                pumpList.map(num => (
                  <div key={num} className="w-full flex justify-center print-page-break">
                    <SingleDispenserBadge
                      pumpNo={num}
                      station={currentStation}
                      payload={getDispenserPayload(num)}
                      dispenserId={getDispenserId(num)}
                      maxBar={maxPressureBar}
                      theme={badgeTheme}
                      showSafety={showSafetyTips}
                      showInstructions={showInstructions}
                    />
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Modal Bottom Bar */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
          <div className="text-slate-500 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>معتمد ومطابق لمواصفات وزارة البترول والهيئة المصرية العامة للبترول EGPC</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-5 py-2.5 bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 font-bold rounded-xl"
            >
              إغلاق
            </button>
            <button
              onClick={handlePrint}
              className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl shadow flex items-center gap-1.5"
            >
              <Printer className="w-4 h-4 text-amber-300" />
              <span>بدء الطباعة</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Reusable Single Dispenser Badge Component
interface SingleDispenserBadgeProps {
  pumpNo: number;
  station: Station;
  payload: string;
  dispenserId: string;
  maxBar: number;
  theme: 'cargas_color' | 'monochrome';
  showSafety: boolean;
  showInstructions: boolean;
}

const SingleDispenserBadge: React.FC<SingleDispenserBadgeProps> = ({
  pumpNo,
  station,
  payload,
  dispenserId,
  maxBar,
  theme,
  showSafety,
  showInstructions,
}) => {
  const isColor = theme === 'cargas_color';

  return (
    <div
      className={`w-full max-w-sm rounded-[2rem] p-5 shadow-xl text-center transition-all ${
        isColor
          ? 'bg-white text-slate-900 border-4 border-emerald-800 shadow-emerald-950/10'
          : 'bg-white text-slate-950 border-4 border-black'
      }`}
      style={{ boxSizing: 'border-box' }}
    >
      {/* Badge Top Header */}
      <div
        className={`-mx-5 -mt-5 p-3.5 mb-3 flex items-center justify-between px-4 rounded-t-[1.7rem] ${
          isColor ? 'bg-gradient-to-r from-emerald-900 to-emerald-800 text-white' : 'bg-black text-white'
        }`}
      >
        <div className="flex items-center gap-1.5">
          <CargasLogo size="sm" />
        </div>
        <div className="text-left font-mono">
          <span
            className={`text-[9px] font-black px-2 py-0.5 rounded-full inline-block ${
              isColor ? 'bg-amber-400 text-slate-950' : 'bg-white text-black'
            }`}
          >
            CNG GAS DISPENSER
          </span>
        </div>
      </div>

      {/* Main Pump Number */}
      <div className="my-1">
        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest block">
          طلمبة تموين غاز طبيعي مضغوط
        </span>
        <h2
          className={`text-3xl sm:text-4xl font-black mt-0.5 ${
            isColor ? 'text-emerald-800' : 'text-black'
          }`}
        >
          طلمبة رقم {pumpNo}
        </h2>
        <span className="text-xs font-mono font-bold text-slate-500">
          PUMP NO. {String(pumpNo).padStart(2, '0')}
        </span>
      </div>

      {/* Station Name & Technical Specs */}
      <div className="my-2 bg-slate-50 dark:bg-slate-100 p-2 rounded-xl border border-slate-200">
        <p className="text-xs font-bold text-slate-800">{station.name}</p>
        <p className="text-[10px] text-slate-600 mt-0.5">
          المحافظة: {station.governorate} • كود المحطة: {station.id}
        </p>
        <p className="text-[10px] font-mono font-bold text-emerald-800 mt-0.5">
          معرّف المضخة: {dispenserId} | أقصى ضغط: {maxBar} بار
        </p>
      </div>

      {/* High-Resolution QR Code Canvas */}
      <div className="my-3 flex justify-center">
        <div className="p-3 bg-white rounded-2xl border-2 border-slate-300 shadow-md inline-block">
          <QRCodeRenderer
            value={payload}
            size={190}
            darkColor={isColor ? '#0B4E24' : '#000000'}
            lightColor="#FFFFFF"
          />
        </div>
      </div>

      {/* Loyalty Instructions */}
      {showInstructions && (
        <p
          className={`text-[11px] font-bold p-2 rounded-xl mb-2.5 ${
            isColor
              ? 'bg-emerald-50 text-emerald-900 border border-emerald-200'
              : 'bg-slate-100 text-slate-900 border border-slate-300'
          }`}
        >
          📱 امسح الكود عبر تطبيق كارجاس لتسجيل نقاط التموين فوراً
        </p>
      )}

      {/* Safety Instructions Card */}
      {showSafety && (
        <div
          className={`p-2.5 rounded-xl text-[10px] font-bold flex items-center justify-around border ${
            isColor
              ? 'bg-amber-50 text-amber-900 border-amber-300'
              : 'bg-slate-50 text-slate-900 border-slate-400'
          }`}
        >
          <div className="flex items-center gap-1">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
            <span>إطفاء المحرك</span>
          </div>
          <span className="text-slate-300">•</span>
          <div className="flex items-center gap-1">
            <Flame className="w-3.5 h-3.5 text-rose-600 flex-shrink-0" />
            <span>ممنوع التدخين</span>
          </div>
          <span className="text-slate-300">•</span>
          <div className="flex items-center gap-1">
            <Fuel className="w-3.5 h-3.5 text-emerald-700 flex-shrink-0" />
            <span>{maxBar} بار</span>
          </div>
        </div>
      )}

      {/* Bottom Footer Details */}
      <div className="mt-3 pt-2 border-t border-slate-200 text-[9px] text-slate-400 flex items-center justify-between">
        <span>شركة كارجاس للغاز الطبيعي 🇪🇬</span>
        <span className="font-mono">VERIFIED CNG DISPENSER</span>
      </div>
    </div>
  );
};
