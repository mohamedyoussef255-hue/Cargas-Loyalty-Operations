import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX, Bot, Sparkles, MessageCircle, X, ChevronDown, CheckCircle2, Flame } from 'lucide-react';
import { UserRole } from '../../types';
import { StorageService } from '../../services/storage';

interface MoeenAssistantProps {
  currentRole: UserRole;
}

export const MoeenAssistant: React.FC<MoeenAssistantProps> = ({ currentRole }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [currentMessage, setCurrentMessage] = useState<string>('');
  const [selectedTopic, setSelectedTopic] = useState<string>('welcome');
  const [voiceSupported, setVoiceSupported] = useState(true);
  const [config, setConfig] = useState(StorageService.getConfig());

  useEffect(() => {
    if (!('speechSynthesis' in window)) {
      setVoiceSupported(false);
    }
    const updateHandler = () => setConfig(StorageService.getConfig());
    window.addEventListener('cargas_data_updated', updateHandler);
    return () => window.removeEventListener('cargas_data_updated', updateHandler);
  }, []);

  // Preset smart scripts with warm Egyptian Ibn El Balad & Architect tone
  const scripts: Record<string, { title: string; text: string; roleOnly?: UserRole }> = {
    welcome: {
      title: 'يا مرحب بيك مع مُعين!',
      text: 'يا أهلاً بيك يا فندم! أنا مُعين.. صاحبك ومساعدك الذكي من شركة عزوتي للبرمجيات. في ضهرك خطوة بخطوة عشان أسهل عليك استخدام منظومة كارجاس للغاز الطبيعي والولاء.',
    },
    driver_guide: {
      title: 'طريقة استخدام التطبيق للسائق 🚗',
      text: 'يا باشا الموضوع في غاية البساطة! أول ما توصل محطة كارجاس، افتح صفحة "كود التموين" وخلي الفني يمسح الكود بكاميرته. بعد ما تفول، النقاط هتنزل فوراً في رصيدك وتقدر تبدلها بقسائم غاز مجانية أو خصومات تغيير زيت وغسيل.',
    },
    worker_incentive: {
      title: 'حافز التدقيق النظيف والعمولة للفني ⛽',
      text: 'يا بطل كارجاس، ليك عمولة فورية على كل متر مكعب بتضخه، وفوق كدة فيه "حافز التدقيق النظيف" 500 جنيه شهرياً لما تحافظ على وردياتك بدون أي مخالفات تدقيق أو محاولات خارج النطاق الجغرافي للمحطة. شغلك النظيف مكسب ليك وللمحطة!',
    },
    geofence_fraud: {
      title: 'نظام حماية الموقع ومكافحة التلاعب 🛡️',
      text: 'النظام بتاعنا مبني بذكاء كابتن لوكا! فيه فحص فوري للموقع الجغرافي (Geo-fencing) بيتأكد إن الفني داخل حرم المحطة فعلياً (في حدود 150 متر)، ومفيش تكرار تموين لنفس النمرة في أقل من 15 دقيقة، للحفاظ على أمان المنظومة وحقوق السائقين.',
    },
    dispenser_qr: {
      title: 'طباعة كود ومعرف طلمبة التموين 🖨️',
      text: 'يا ريسنا الغالي، وفرنالك ميزة طباعة ملصق طلمبة التموين بنقرة زر واحدة! من أعلى لوحة تحكم المدير اضغط على (طباعة كود الطلمبات 🖨️) أو من تبويب (كيو آر المضخات) أو من أيقونة كل محطة. تقدر تختار طلمبة معينة أو تطبع كل طلمبات المحطة دفعة واحدة في شبكة ملصقات، وتطبعها مباشرة أو تنزلها صورة عالية الدقة PNG وتلزقها على الطلمبة لضمان قراءة سريعة مع إرشادات السلامة وضغط الـ 200 بار.',
    },
    stop_safety: {
      title: 'الأمان ومعايير الغاز وتطبيق ستوب (STOP) ⚠️',
      text: 'سلامتك وسلامة المحطة أولويتنا المطلقة! ضغط الغاز الطبيعي بيوصل لـ 200 بار، فلازم التأكد من تاريخ فحص الاسطوانة، وسلامة محبس الأمان، وإيقاف المحرك ونزول الركاب أثناء التموين طبقاً لمعايير نظام ستوب للسلامة المهنية.',
    },
  };

  const handleSpeak = (textToSpeak: string) => {
    if (!('speechSynthesis' in window)) return;

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.lang = 'ar-EG';
    utterance.rate = 0.95;
    utterance.pitch = 1.0;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  const handleSelectTopic = (key: string) => {
    setSelectedTopic(key);
    const script = scripts[key];
    if (script) {
      setCurrentMessage(script.text);
      handleSpeak(script.text);
    }
  };

  // If Admin has disabled Moeen completely
  if (!config.moeenEnabled) {
    return null;
  }

  // If Admin has hidden Moeen from user pages (Driver and Worker), only show in Admin
  if (config.moeenShownInUserPages === false && currentRole !== 'admin') {
    return null;
  }


  return (
    <>
      {/* Floating Avatar Trigger Button */}
      <div className="fixed bottom-20 left-4 z-40">
        <button
          onClick={() => {
            const nextState = !isOpen;
            setIsOpen(nextState);
            if (nextState && !currentMessage) {
              handleSelectTopic('welcome');
            }
          }}
          className="relative group flex items-center gap-2 px-3 py-2.5 bg-gradient-to-r from-emerald-800 to-emerald-950 text-white rounded-full shadow-2xl border-2 border-amber-400 hover:scale-105 active:scale-95 transition-all duration-300"
        >
          <div className="relative">
            <div className="w-9 h-9 rounded-full bg-emerald-600 flex items-center justify-center text-amber-300 border border-amber-300/40">
              <Bot className="w-5 h-5 animate-pulse" />
            </div>
            {isSpeaking && (
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
              </span>
            )}
          </div>
          <div className="flex flex-col text-right pr-0.5">
            <span className="text-xs font-black text-amber-300 leading-tight">مُعـيـن الذكي</span>
            <span className="text-[10px] text-emerald-200">صاحبك ومرشدك</span>
          </div>
        </button>
      </div>

      {/* Moeen Popup Dialog */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-emerald-600/30 overflow-hidden flex flex-col max-h-[88vh]">
            {/* Header */}
            <div className="bg-gradient-to-r from-emerald-900 via-emerald-800 to-emerald-950 p-4 text-white flex items-center justify-between border-b border-amber-400/30">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-700/80 border-2 border-amber-400 flex items-center justify-center text-amber-300 shadow-md">
                  <Bot className="w-7 h-7" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-black text-lg text-white">مُعـيـن (المساعد الذكي)</h4>
                    <span className="bg-amber-400 text-emerald-950 text-[10px] font-bold px-2 py-0.5 rounded-full">
                      صوت مصري 🇪🇬
                    </span>
                  </div>
                  <p className="text-[11px] text-emerald-200">
                    عقل مهندس برمجيات & جدعنة ابن بلد من «عزوتي»
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {isSpeaking ? (
                  <button
                    onClick={stopSpeaking}
                    title="إيقاف الصوت"
                    className="p-2 bg-amber-400 text-emerald-950 rounded-full hover:bg-amber-300 transition-colors"
                  >
                    <VolumeX className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    onClick={() => handleSpeak(currentMessage || scripts[selectedTopic].text)}
                    title="تشغيل الصوت"
                    className="p-2 bg-emerald-700 hover:bg-emerald-600 text-amber-300 rounded-full transition-colors"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                )}
                <button
                  onClick={() => {
                    stopSpeaking();
                    setIsOpen(false);
                  }}
                  className="p-2 hover:bg-emerald-800/80 rounded-full text-emerald-300 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Speaking Waveform Animation */}
            {isSpeaking && (
              <div className="bg-amber-400/10 border-b border-amber-400/20 px-4 py-1.5 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping"></span>
                  <span className="text-[11px] font-bold text-amber-800 dark:text-amber-300">
                    مُعين بيتكلم معاك صوتياً الآن...
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="w-1 h-3 bg-amber-500 rounded-full animate-bounce"></span>
                  <span className="w-1 h-5 bg-amber-500 rounded-full animate-bounce [animation-delay:0.15s]"></span>
                  <span className="w-1 h-4 bg-amber-500 rounded-full animate-bounce [animation-delay:0.3s]"></span>
                </div>
              </div>
            )}

            {/* Main Content & Dialogue Bubble */}
            <div className="p-4 overflow-y-auto flex-1 space-y-4">
              {/* Egyptian dialogue box */}
              <div className="relative bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 rounded-2xl p-4 text-right">
                <div className="flex items-center gap-2 mb-2 text-emerald-900 dark:text-emerald-300 font-bold text-sm">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <span>{scripts[selectedTopic]?.title || 'كلام مُعين'}</span>
                </div>
                <p className="text-slate-800 dark:text-slate-200 text-sm leading-relaxed whitespace-pre-line font-medium">
                  {currentMessage || scripts[selectedTopic]?.text}
                </p>
              </div>

              {/* Quick Topic Chips */}
              <div>
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 block mb-2 text-right">
                  حابب أشرحلك إيه دلوقتي؟
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-right">
                  {Object.entries(scripts).map(([key, item]) => {
                    const isSelected = selectedTopic === key;
                    return (
                      <button
                        key={key}
                        onClick={() => handleSelectTopic(key)}
                        className={`p-2.5 rounded-xl border text-xs text-right transition-all flex items-center justify-between ${
                          isSelected
                            ? 'bg-emerald-700 text-white border-emerald-700 shadow-md font-bold'
                            : 'bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200'
                        }`}
                      >
                        <span className="truncate">{item.title}</span>
                        {isSelected && <CheckCircle2 className="w-4 h-4 text-amber-300 flex-shrink-0 mr-1" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Developer & Legal Attribution as required */}
              <div className="p-3 bg-slate-100 dark:bg-slate-800/60 rounded-xl text-[11px] text-slate-500 dark:text-slate-400 leading-tight border border-slate-200 dark:border-slate-700/60">
                <p className="font-semibold text-slate-700 dark:text-slate-300 mb-0.5">
                  تطوير وابتكار: شركة عزوتي للبرمجيات وتكنولوجيا المعلومات
                </p>
                <p>
                  المالك والمطور: <strong>محمد عبد الرحمن يوسف</strong>. كافة حقوق الملكية الفكرية وتصميم المنظومة محفوظة بالكامل.
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="p-3 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <span className="text-[11px] text-slate-500 dark:text-slate-400">
                متاح بالصوت عبر المتصفح
              </span>
              <button
                onClick={() => handleSpeak(currentMessage || scripts[selectedTopic].text)}
                className="px-4 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow"
              >
                <Volume2 className="w-3.5 h-3.5 text-amber-300" />
                <span>إعادة القراءة بالصوت</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
