
import React, { useState, useMemo, useRef } from 'react';
import { SplitMode, AspectRatio, NickPosition, TemplateId, AppSettings, SlideData } from './types';
import { TEMPLATES, FONT_PAIRS, MAX_SLIDES } from './constants';
import { parseTextToSlides } from './utils/parser';
import { renderSlideToCanvas } from './utils/renderer';
import { 
  Type, 
  Image as ImageIcon, 
  Download, 
  AlertCircle,
  FileArchive,
  Loader2,
  Trash2,
  ArrowRight,
  Palette,
  MousePointer2,
  UserCircle,
  Upload,
  TextCursorInput
} from 'lucide-react';
import JSZip from 'jszip';

const App: React.FC = () => {
  const [text, setText] = useState('');
  const [settings, setSettings] = useState<AppSettings>({
    splitMode: SplitMode.EMPTY_LINE,
    aspectRatio: AspectRatio.PORTRAIT,
    nick: '',
    nickPosition: NickPosition.BOTTOM_LEFT,
    templateId: 'white',
    fontPairId: null,
    avatarUrl: null,
    blogDescription: ''
  });

  const [slides, setSlides] = useState<SlideData[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const parsedSlideTexts = useMemo(() => parseTextToSlides(text, settings.splitMode), [text, settings.splitMode]);

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setSettings(prev => ({ ...prev, avatarUrl: event.target?.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const removeAvatar = () => {
    setSettings(prev => ({ ...prev, avatarUrl: null }));
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const generateSlides = async () => {
    if (!settings.fontPairId) return;
    setIsGenerating(true);
    setError(null);
    const currentFontPair = FONT_PAIRS.find(p => p.id === settings.fontPairId)!;
    try {
      const results = await Promise.all(
        parsedSlideTexts.slice(0, MAX_SLIDES).map(async (slideText, idx) => {
          const res = await renderSlideToCanvas({
            text: slideText,
            templateId: settings.templateId,
            fontPair: currentFontPair,
            aspectRatio: settings.aspectRatio,
            nick: settings.nick,
            nickPosition: settings.nickPosition,
            slideNumber: idx + 1,
            totalSlides: parsedSlideTexts.length,
            avatarUrl: settings.avatarUrl,
            blogDescription: settings.blogDescription
          });
          return { id: idx, text: slideText, isValid: res.isValid, error: res.error, previewUrl: res.dataUrl, blob: res.blob };
        })
      );
      setSlides(results);
      const invalid = results.filter(r => !r.isValid);
      if (invalid.length > 0) {
        setError(`Проблема: ${invalid.map(r => `№${r.id + 1}`).join(', ')}. Текст не помещается.`);
      }
    } catch (e) {
      setError('Ошибка при генерации. Проверьте шрифты.');
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadOne = (dataUrl: string, idx: number) => {
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = `carousel_${(idx + 1).toString().padStart(2, '0')}.png`;
    link.click();
  };

  const downloadZip = async () => {
    const zip = new JSZip();
    slides.forEach((slide, idx) => {
      if (slide.blob) {
        zip.file(`carousel_${(idx + 1).toString().padStart(2, '0')}.png`, slide.blob);
      }
    });
    const content = await zip.generateAsync({ type: 'blob' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(content);
    link.download = 'instagram_carousel.zip';
    link.click();
  };

  const isBlocked = !settings.fontPairId || parsedSlideTexts.length === 0 || parsedSlideTexts.length > MAX_SLIDES;

  return (
    <div className="min-h-screen pb-20 selection:bg-purple-100 antialiased">
      <header className="bg-white/90 backdrop-blur-md border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-black p-2 rounded-xl">
              <ImageIcon className="text-white w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tight text-gray-900 leading-none uppercase">CarouselGen</h1>
              <span className="text-[9px] font-bold text-gray-400 uppercase tracking-[0.2em]">Cyrillic & Simple</span>
            </div>
          </div>
          <p className="hidden md:block text-[10px] font-black text-gray-400 uppercase tracking-widest">v3.1 • Minimal UI</p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 pt-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          <div className="lg:col-span-5 space-y-8">
            <section className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-5">
              <div className="flex items-center gap-3">
                <div className="bg-purple-50 p-2 rounded-lg"><Type className="w-5 h-5 text-purple-600" /></div>
                <h2 className="font-extrabold text-lg text-gray-800 tracking-tight">1. Текст и формат</h2>
              </div>
              <textarea 
                className="w-full h-40 p-5 bg-gray-50 border border-transparent rounded-2xl focus:ring-2 focus:ring-purple-500 focus:bg-white transition-all outline-none text-sm leading-relaxed"
                placeholder="Вставьте ваш текст..."
                value={text}
                onChange={(e) => setText(e.target.value)}
              />
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase ml-1 tracking-tighter">Разделитель</label>
                  <select 
                    className="w-full p-3 bg-gray-50 border-none rounded-xl text-sm font-bold cursor-pointer hover:bg-gray-100 transition-colors"
                    value={settings.splitMode}
                    onChange={(e) => setSettings({...settings, splitMode: e.target.value as SplitMode})}
                  >
                    <option value={SplitMode.EMPTY_LINE}>Пустая строка</option>
                    <option value={SplitMode.DASHES}>Линия ---</option>
                    <option value={SplitMode.SLIDE_N}>Слайд N:</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase ml-1 tracking-tighter">Формат IG</label>
                  <select 
                    className="w-full p-3 bg-gray-50 border-none rounded-xl text-sm font-bold cursor-pointer hover:bg-gray-100 transition-colors"
                    value={settings.aspectRatio}
                    onChange={(e) => setSettings({...settings, aspectRatio: e.target.value as AspectRatio})}
                  >
                    <option value={AspectRatio.PORTRAIT}>Портрет 4:5</option>
                    <option value={AspectRatio.SQUARE}>Квадрат 1:1</option>
                  </select>
                </div>
              </div>
            </section>

            <section className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-5">
              <div className="flex items-center gap-3">
                <div className="bg-orange-50 p-2 rounded-lg"><Palette className="w-5 h-5 text-orange-600" /></div>
                <h2 className="font-extrabold text-lg text-gray-800 tracking-tight">2. Выбор дизайна</h2>
              </div>
              <div className="grid grid-cols-4 gap-2.5">
                {TEMPLATES.map(t => (
                  <button 
                    key={t.id}
                    onClick={() => setSettings({...settings, templateId: t.id})}
                    className={`relative h-12 rounded-xl overflow-hidden border-2 transition-all ${settings.templateId === t.id ? 'border-black ring-4 ring-black/5' : 'border-transparent hover:border-gray-200 shadow-sm'}`}
                  >
                    <div className={`w-full h-full ${t.previewClass}`}></div>
                    <div className="absolute inset-0 flex items-center justify-center bg-black/5">
                      <span className="text-[7px] font-black uppercase text-gray-900 tracking-tighter bg-white/90 px-1.5 py-0.5 rounded shadow-sm">{t.name}</span>
                    </div>
                  </button>
                ))}
              </div>
            </section>

            <section className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-50 p-2 rounded-lg"><MousePointer2 className="w-5 h-5 text-blue-600" /></div>
                  <h2 className="font-extrabold text-lg text-gray-800 tracking-tight">3. Шрифтовая пара</h2>
                </div>
                {!settings.fontPairId && <span className="text-[9px] font-black text-red-500 uppercase animate-pulse tracking-widest">ВЫБЕРИТЕ</span>}
              </div>
              
              <div className="grid grid-cols-2 gap-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar p-1">
                {FONT_PAIRS.map(pair => (
                  <button 
                    key={pair.id}
                    onClick={() => setSettings({...settings, fontPairId: pair.id})}
                    className={`group relative p-4 rounded-2xl border-2 transition-all flex flex-col items-start gap-1 text-left bg-gray-50/50 hover:bg-white ${settings.fontPairId === pair.id ? 'border-black bg-white ring-4 ring-black/5 shadow-md scale-[1.02]' : 'border-transparent hover:border-gray-200 shadow-sm'}`}
                  >
                    <div className="w-full flex justify-between items-center mb-1">
                       <span className={`text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded ${settings.fontPairId === pair.id ? 'bg-black text-white' : 'bg-gray-200 text-gray-500'}`}>{pair.name}</span>
                    </div>
                    <div className="w-full overflow-hidden">
                      <p style={{ fontFamily: pair.headerFont, fontWeight: 700 }} className="text-sm truncate leading-tight text-gray-900">Заголовок</p>
                      <p style={{ fontFamily: pair.bodyFont, fontWeight: 400 }} className="text-[10px] truncate leading-tight text-gray-500 mt-0.5">Основной текст</p>
                    </div>
                  </button>
                ))}
              </div>
            </section>

            <section className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-5">
               <div className="flex items-center gap-3">
                <div className="bg-green-50 p-2 rounded-lg"><UserCircle className="w-5 h-5 text-green-600" /></div>
                <h2 className="font-extrabold text-lg text-gray-800 tracking-tight">4. Профиль и CTA</h2>
              </div>
              
              <div className="flex gap-4 items-center">
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="w-20 h-20 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center cursor-pointer hover:border-black transition-colors overflow-hidden group relative flex-shrink-0"
                >
                  {settings.avatarUrl ? (
                    <img src={settings.avatarUrl} className="w-full h-full object-cover" />
                  ) : (
                    <Upload className="w-6 h-6 text-gray-300 group-hover:text-black transition-colors" />
                  )}
                  <input type="file" hidden ref={fileInputRef} accept="image/*" onChange={handleAvatarUpload} />
                </div>
                <div className="flex-1 space-y-3">
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-sm">@</span>
                    <input 
                      type="text" 
                      placeholder="account"
                      className="w-full pl-7 p-3 bg-gray-50 border-none rounded-xl text-sm font-bold focus:ring-2 focus:ring-black outline-none transition-all"
                      value={settings.nick.replace('@', '')}
                      onChange={(e) => setSettings({...settings, nick: `@${e.target.value}`})}
                    />
                  </div>
                  {settings.avatarUrl && (
                    <button onClick={removeAvatar} className="text-[10px] font-black text-red-500 uppercase flex items-center gap-1 hover:underline">
                      <Trash2 className="w-3 h-3" /> УДАЛИТЬ ФОТО
                    </button>
                  )}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-400 uppercase ml-1 tracking-tighter flex items-center gap-1">
                  <TextCursorInput className="w-3 h-3" /> О чем ваш блог?
                </label>
                <textarea 
                  className="w-full p-3 bg-gray-50 border-none rounded-xl text-sm font-bold focus:ring-2 focus:ring-black outline-none transition-all min-h-[80px]"
                  placeholder="Напишите кратко, чтобы добавить на последний слайд..."
                  value={settings.blogDescription}
                  onChange={(e) => setSettings({...settings, blogDescription: e.target.value})}
                />
              </div>

              <select 
                   className="w-full p-3 bg-gray-50 border-none rounded-xl text-xs font-black cursor-pointer hover:bg-gray-100 transition-colors"
                   value={settings.nickPosition}
                   onChange={(e) => setSettings({...settings, nickPosition: e.target.value as NickPosition})}
                >
                  <option value={NickPosition.BOTTOM_LEFT}>↙ Ник слева</option>
                  <option value={NickPosition.BOTTOM_RIGHT}>↘ Ник справа</option>
                  <option value={NickPosition.BOTTOM_CENTER}>↓ Ник по центру</option>
                  <option value={NickPosition.TOP_RIGHT}>↗ Ник сверху</option>
                </select>
            </section>

            <button 
              disabled={isBlocked || isGenerating}
              onClick={generateSlides}
              className={`w-full py-5 rounded-[2rem] font-black text-lg flex items-center justify-center gap-3 shadow-2xl transition-all transform active:scale-95 ${!isBlocked && !isGenerating ? 'bg-black text-white hover:bg-zinc-800 shadow-zinc-200' : 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none'}`}
            >
              {isGenerating ? <Loader2 className="w-6 h-6 animate-spin" /> : <ImageIcon className="w-6 h-6" />}
              {isGenerating ? 'ОТРИСОВКА...' : 'ГЕНЕРИРОВАТЬ'}
            </button>
          </div>

          <div className="lg:col-span-7 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="font-black text-2xl text-gray-900 tracking-tight flex items-center gap-3">
                Предпросмотр
                {slides.length > 0 && <span className="bg-black text-white px-3 py-1 rounded-xl text-xs font-black animate-in fade-in zoom-in">{slides.length}</span>}
              </h2>
              {slides.length > 0 && slides.every(s => s.isValid) && (
                <button 
                  onClick={downloadZip}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-2xl text-xs font-black flex items-center gap-2 shadow-xl shadow-purple-100 transition-all hover:scale-105 active:scale-95"
                >
                  <FileArchive className="w-4 h-4" />
                  СКАЧАТЬ ZIP
                </button>
              )}
            </div>

            {error && (
              <div className="bg-red-50 border-2 border-red-100 text-red-600 p-5 rounded-[2rem] flex items-start gap-4 shadow-sm animate-in slide-in-from-top-4">
                <div className="bg-red-100 p-2 rounded-full"><AlertCircle className="w-6 h-6" /></div>
                <p className="font-bold text-sm uppercase tracking-tight leading-tight">{error}</p>
              </div>
            )}

            {slides.length === 0 ? (
              <div className="bg-white border-4 border-dashed border-gray-100 rounded-[3.5rem] h-[600px] flex flex-col items-center justify-center text-center p-12 group transition-all hover:border-purple-200 hover:bg-purple-50/5">
                <div className="p-12 bg-gray-50 rounded-[3rem] mb-6 shadow-sm group-hover:scale-110 group-hover:bg-purple-50 transition-all duration-700">
                  <ArrowRight className="w-20 h-20 text-gray-200 group-hover:text-purple-300" />
                </div>
                <h3 className="text-2xl font-black text-gray-900 tracking-tighter uppercase">Готово к работе</h3>
                <p className="text-gray-400 mt-4 max-w-sm text-sm font-semibold leading-relaxed tracking-tight">Вставьте текст слева и нажмите кнопку генерации</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-20">
                {slides.map((slide, idx) => (
                  <div key={idx} className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden group hover:shadow-2xl hover:shadow-purple-100/30 transition-all duration-500">
                    <div className="relative aspect-[4/5] bg-gray-50 flex items-center justify-center">
                      {slide.previewUrl ? (
                        <>
                          <img src={slide.previewUrl} className={`w-full h-full object-contain ${!slide.isValid ? 'grayscale opacity-10' : ''}`} />
                          {!slide.isValid && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
                              <AlertCircle className="w-12 h-12 text-red-600 mb-4" />
                              <span className="text-red-600 font-black text-[10px] uppercase leading-tight bg-white p-3 rounded-2xl shadow-xl border border-red-50">{slide.error}</span>
                            </div>
                          )}
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/60 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100 duration-300 backdrop-blur-[2px]">
                             <button 
                              onClick={() => downloadOne(slide.previewUrl!, idx)}
                              className="bg-white text-black p-5 rounded-full shadow-2xl hover:scale-110 active:scale-95 transition-transform"
                             >
                                <Download className="w-8 h-8" />
                             </button>
                          </div>
                        </>
                      ) : (
                        <div className="flex flex-col items-center gap-3">
                          <Loader2 className="w-10 h-10 text-purple-400 animate-spin" />
                        </div>
                      )}
                    </div>
                    <div className="px-6 py-4 flex items-center justify-between border-t border-gray-50 bg-gray-50/50">
                      <div className="flex items-center gap-2">
                        <span className="w-7 h-7 flex items-center justify-center bg-black text-white rounded-lg text-[10px] font-black italic">#{idx + 1}</span>
                        <span className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em]">
                          {idx === slides.length - 1 && settings.avatarUrl ? 'FINAL CTA' : 'Slide Preview'}
                        </span>
                      </div>
                      <button 
                         onClick={() => setSlides(prev => prev.filter(s => s.id !== slide.id))}
                         className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-full transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
      <footer className="max-w-7xl mx-auto px-4 py-10 border-t border-gray-100 text-center">
        <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">
          No Login Required • Public & Free • Cyrillic Support
        </p>
      </footer>
    </div>
  );
};

export default App;
