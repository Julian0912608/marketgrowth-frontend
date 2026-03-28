'use client';

// app/dashboard/social-content/page.tsx

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  Sparkles, Search, Loader2, Image as ImageIcon,
  Layers, BookOpen, Copy, CheckCircle,
  ChevronLeft, ChevronRight, Download, TrendingUp, Package,
  Upload, X,
} from 'lucide-react';
import { api } from '@/lib/api';
import { useContentStore } from '@/lib/contentStore';

// ── Types ──────────────────────────────────────────────────────
interface Product {
  id:        string;
  title:     string;
  ean:       string | null;
  imageUrl:  string | null;
  priceMin:  number | null;
  platform:  string;
  revenue30d: number;
  units30d:  number;
}

type Platform = 'instagram' | 'tiktok' | 'facebook' | 'pinterest';
type Format   = 'single' | 'carousel' | 'story';
type Tone     = 'lifestyle' | 'promotional' | 'educational' | 'ugc';
type Language = 'nl' | 'en';

const PLATFORMS = [
  { id: 'instagram' as Platform, label: 'Instagram', icon: '📸' },
  { id: 'tiktok'    as Platform, label: 'TikTok',    icon: '🎵' },
  { id: 'facebook'  as Platform, label: 'Facebook',  icon: '👍' },
  { id: 'pinterest' as Platform, label: 'Pinterest', icon: '📌' },
];

const FORMATS = [
  { id: 'single'   as Format, label: 'Single post', desc: 'Eén impactvolle post',  icon: ImageIcon },
  { id: 'carousel' as Format, label: 'Carousel',    desc: 'Meerdere slides',       icon: Layers },
  { id: 'story'    as Format, label: 'Story',       desc: 'Verticaal formaat',     icon: BookOpen },
];

const TONES = [
  { id: 'lifestyle'   as Tone, label: 'Lifestyle',    desc: 'Aspirationeel & warm' },
  { id: 'promotional' as Tone, label: 'Promotioneel', desc: 'Sales-gericht' },
  { id: 'educational' as Tone, label: 'Educatief',    desc: 'Informerend' },
  { id: 'ugc'         as Tone, label: 'UGC-stijl',    desc: 'Authentiek' },
];

const PLATFORM_COLORS: Record<string, string> = {
  bolcom:      'bg-blue-500/20 text-blue-400 border-blue-500/30',
  shopify:     'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  woocommerce: 'bg-violet-500/20 text-violet-400 border-violet-500/30',
  amazon:      'bg-orange-500/20 text-orange-400 border-orange-500/30',
  etsy:        'bg-amber-500/20 text-amber-400 border-amber-500/30',
};

function formatEur(val: number) {
  return new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR', minimumFractionDigits: 0 }).format(val);
}

// ── Product Card ───────────────────────────────────────────────
function ProductCard({ product, selected, onSelect }: {
  product: Product; selected: boolean; onSelect: () => void;
}) {
  return (
    <button
      onClick={onSelect}
      className={`w-full text-left p-3 rounded-xl border transition-all ${
        selected ? 'border-brand-500 bg-brand-600/10' : 'border-slate-700/50 bg-slate-800/30 hover:border-slate-600'
      }`}
    >
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-lg bg-slate-700 flex-shrink-0 overflow-hidden">
          {product.imageUrl ? (
            <img src={product.imageUrl} alt={product.title} className="w-full h-full object-cover"
              onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Package className="w-5 h-5 text-slate-500" />
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-white truncate">{product.title}</p>
          <div className="flex items-center gap-2 mt-0.5 flex-wrap">
            <span className={`text-xs px-1.5 py-0.5 rounded border ${PLATFORM_COLORS[product.platform] ?? 'bg-slate-700 text-slate-400 border-slate-600'}`}>
              {product.platform}
            </span>
            {product.priceMin && <span className="text-xs text-slate-500">{formatEur(product.priceMin)}</span>}
            {product.units30d > 0 && (
              <span className="text-xs text-emerald-400 flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />{product.units30d}×
              </span>
            )}
          </div>
        </div>
        {selected && <CheckCircle className="w-4 h-4 text-brand-400 flex-shrink-0" />}
      </div>
    </button>
  );
}

// ── Content Result ─────────────────────────────────────────────
function ContentResult({ format }: { format: Format }) {
  const { result } = useContentStore();
  const [copied,     setCopied]     = useState(false);
  const [slideIndex, setSlideIndex] = useState(0);

  if (!result) return null;

  const totalSlides  = result.slides?.length ?? 0;
  const currentSlide = result.slides?.[slideIndex];

  const copyText = () => {
    let text = '';
    if (format === 'carousel' && result.slides) {
      text = result.slides.map((s, i) => `Slide ${i + 1}:\n${s.headline}\n${s.body}`).join('\n\n');
      text += `\n\n${result.caption ?? ''}\n\n${result.cta ?? ''}\n\n${result.hashtags?.map(h => `#${h}`).join(' ')}`;
    } else {
      text = `${result.hook ?? ''}\n\n${result.caption ?? ''}\n\n${result.cta ?? ''}\n\n${result.hashtags?.map(h => `#${h}`).join(' ')}`;
    }
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadImage = () => {
    if (!result.imageUrl) return;
    const a = document.createElement('a');
    a.href = result.imageUrl;
    a.download = `marketgrow-${(result.product?.title ?? 'product').slice(0, 30).replace(/\s+/g, '-')}.png`;
    a.click();
  };

  return (
    <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl overflow-hidden">
      <div className="aspect-square bg-slate-900 relative">
        {result.imageUrl ? (
          <img src={result.imageUrl} alt="Generated" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-slate-600">
            <ImageIcon className="w-10 h-10" />
            <p className="text-xs">Geen beeld gegenereerd</p>
          </div>
        )}
        {format === 'carousel' && totalSlides > 1 && (
          <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5">
            {Array.from({ length: totalSlides }).map((_, i) => (
              <button key={i} onClick={() => setSlideIndex(i)}
                className={`rounded-full transition-all ${i === slideIndex ? 'w-4 h-1.5 bg-white' : 'w-1.5 h-1.5 bg-white/50'}`} />
            ))}
          </div>
        )}
        {result.imageUrl && (
          <button onClick={downloadImage}
            className="absolute top-3 right-3 w-8 h-8 rounded-lg bg-black/50 backdrop-blur flex items-center justify-center text-white hover:bg-black/70 transition-colors">
            <Download className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
      <div className="p-5">
        {format === 'carousel' && currentSlide && (
          <div className="mb-4 p-3 bg-slate-900/50 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-slate-500">Slide {slideIndex + 1} / {totalSlides}</p>
              <div className="flex gap-1">
                <button onClick={() => setSlideIndex(Math.max(0, slideIndex - 1))} disabled={slideIndex === 0}
                  className="w-6 h-6 rounded bg-slate-700 disabled:opacity-30 flex items-center justify-center">
                  <ChevronLeft className="w-3 h-3 text-slate-300" />
                </button>
                <button onClick={() => setSlideIndex(Math.min(totalSlides - 1, slideIndex + 1))} disabled={slideIndex === totalSlides - 1}
                  className="w-6 h-6 rounded bg-slate-700 disabled:opacity-30 flex items-center justify-center">
                  <ChevronRight className="w-3 h-3 text-slate-300" />
                </button>
              </div>
            </div>
            <p className="text-sm font-semibold text-white mb-1">{currentSlide.headline}</p>
            <p className="text-xs text-slate-400">{currentSlide.body}</p>
          </div>
        )}
        {result.hook    && <p className="text-sm font-semibold text-white mb-2">{result.hook}</p>}
        {result.caption && <p className="text-sm text-slate-300 mb-3 leading-relaxed whitespace-pre-line">{result.caption}</p>}
        {result.cta     && <p className="text-sm font-semibold text-brand-400 mb-3">{result.cta}</p>}
        {result.hashtags?.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-4">
            {result.hashtags.slice(0, 8).map(tag => (
              <span key={tag} className="text-xs text-slate-500 bg-slate-700/50 px-2 py-0.5 rounded">#{tag}</span>
            ))}
            {result.hashtags.length > 8 && <span className="text-xs text-slate-600">+{result.hashtags.length - 8}</span>}
          </div>
        )}
        <button onClick={copyText}
          className={`w-full py-2 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
            copied ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-slate-700 hover:bg-slate-600 text-slate-300'
          }`}>
          {copied ? <CheckCircle className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
          {copied ? 'Gekopieerd!' : 'Kopieer caption + hashtags'}
        </button>
      </div>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────
export default function SocialContentPage() {
  const [products,      setProducts]      = useState<Product[]>([]);
  const [loadingProds,  setLoadingProds]  = useState(true);
  const [search,        setSearch]        = useState('');
  const [selectedProd,  setSelectedProd]  = useState<Product | null>(null);
  const [uploadedImage, setUploadedImage] = useState<{ base64: string; preview: string } | null>(null);
  const [uploadMode,    setUploadMode]    = useState(false); // false = product kiezen, true = foto uploaden
  const [platform,      setPlatform]      = useState<Platform>('instagram');
  const [format,        setFormat]        = useState<Format>('single');
  const [tone,          setTone]          = useState<Tone>('lifestyle');
  const [language,      setLanguage]      = useState<Language>('nl');
  const [withImage,     setWithImage]     = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { status, result, error, startGeneration, setResult, setError, reset } = useContentStore();
  const isGenerating = status === 'generating';
  const isDone       = status === 'done';

  const loadProducts = useCallback(async () => {
    setLoadingProds(true);
    try {
      const res = await api.get(`/ai/products${search ? `?search=${encodeURIComponent(search)}` : ''}`);
      setProducts(res.data.products ?? []);
    } catch {}
    setLoadingProds(false);
  }, [search]);

  useEffect(() => {
    const t = setTimeout(loadProducts, 300);
    return () => clearTimeout(t);
  }, [loadProducts]);

  // Foto upload handler — comprimeert via canvas tot max 4MB voor Anthropic API
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);

      // Resize naar max 1024px aan de langste kant
      const MAX_PX = 1024;
      let { width, height } = img;
      if (width > MAX_PX || height > MAX_PX) {
        if (width > height) { height = Math.round((height / width) * MAX_PX); width = MAX_PX; }
        else                { width = Math.round((width / height) * MAX_PX);  height = MAX_PX; }
      }

      const canvas = document.createElement('canvas');
      canvas.width  = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(img, 0, 0, width, height);

      // Comprimeer als JPEG met kwaliteit 0.85 — houdt file klein
      const preview  = canvas.toDataURL('image/jpeg', 0.85);
      const base64   = preview.split(',')[1];

      // Check grootte (max 4MB base64 = ~3MB binair)
      if (base64.length > 4 * 1024 * 1024) {
        // Extra compressie bij grote foto's
        const preview2 = canvas.toDataURL('image/jpeg', 0.6);
        const base64b  = preview2.split(',')[1];
        setUploadedImage({ base64: base64b, preview: preview2 });
      } else {
        setUploadedImage({ base64, preview });
      }
    };

    img.src = objectUrl;
  };

  const generate = async () => {
    const canGenerate = uploadMode ? !!uploadedImage : !!selectedProd;
    if (!canGenerate) return;

    const genId = startGeneration({
      productId:     selectedProd?.id ?? 'uploaded',
      productTitle:  selectedProd?.title ?? 'Geüpload product',
      platform, format, tone, language,
      generateImage: withImage,
    });

    try {
      let res;

      if (uploadMode && uploadedImage) {
        // Genereer content op basis van geüploade foto
        res = await api.post('/ai/product-content-from-image', {
          imageBase64:  uploadedImage.base64,
          platform, format, tone, language,
          generateImage: withImage,
        });
      } else {
        // Genereer content op basis van geselecteerd product
        res = await api.post('/ai/product-content', {
          productId:     selectedProd!.id,
          platform, format, tone, language,
          generateImage: withImage,
        });
      }

      setResult(res.data, genId);
    } catch (e: any) {
      setError(e.response?.data?.error ?? 'Er ging iets mis.', genId);
    }
  };

  const canGenerate = uploadMode ? !!uploadedImage : !!selectedProd;

  return (
    <div className="p-6 max-w-7xl mx-auto">

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <h1 className="font-display text-2xl font-800 text-white">AI Content Studio</h1>
        </div>
        <p className="text-slate-400 text-sm ml-12">
          Maak marketing content voor je producten — met AI-gegenereerde visuals en captions.
        </p>
      </div>

      {isGenerating && !canGenerate && (
        <div className="mb-6 flex items-center gap-3 px-4 py-3 bg-purple-500/10 border border-purple-500/30 rounded-xl text-purple-300 text-sm">
          <Loader2 className="w-4 h-4 animate-spin flex-shrink-0" />
          Bezig met genereren op de achtergrond...
        </div>
      )}

      <div className="grid lg:grid-cols-5 gap-6">

        {/* ── Links: configuratie ── */}
        <div className="lg:col-span-2 space-y-5">

          {/* Stap 1: Input mode toggle */}
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-5">
            <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
              1. Kies invoer
            </h2>
            <div className="grid grid-cols-2 gap-2 mb-4">
              <button
                onClick={() => { setUploadMode(false); setUploadedImage(null); }}
                className={`py-2.5 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-2 ${
                  !uploadMode ? 'bg-brand-600 text-white' : 'bg-slate-700 text-slate-400 hover:text-white'
                }`}
              >
                <Package className="w-3.5 h-3.5" />
                Mijn producten
              </button>
              <button
                onClick={() => { setUploadMode(true); setSelectedProd(null); }}
                className={`py-2.5 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-2 ${
                  uploadMode ? 'bg-brand-600 text-white' : 'bg-slate-700 text-slate-400 hover:text-white'
                }`}
              >
                <Upload className="w-3.5 h-3.5" />
                Foto uploaden
              </button>
            </div>

            {/* Product selector */}
            {!uploadMode && (
              <>
                <div className="relative mb-3">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
                  <input
                    type="text"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Zoek op naam of EAN..."
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                  />
                </div>
                <div className="space-y-2 max-h-56 overflow-y-auto">
                  {loadingProds ? (
                    <div className="flex justify-center py-6">
                      <Loader2 className="w-5 h-5 animate-spin text-slate-500" />
                    </div>
                  ) : products.length === 0 ? (
                    <p className="text-xs text-slate-500 text-center py-6">
                      {search ? 'Geen producten gevonden.' : 'Synchroniseer eerst een winkel.'}
                    </p>
                  ) : (
                    products.map(p => (
                      <ProductCard key={p.id} product={p}
                        selected={selectedProd?.id === p.id}
                        onSelect={() => setSelectedProd(p)} />
                    ))
                  )}
                </div>
              </>
            )}

            {/* Foto upload */}
            {uploadMode && (
              <div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                {uploadedImage ? (
                  <div className="relative">
                    <img src={uploadedImage.preview} alt="Upload preview"
                      className="w-full h-40 object-cover rounded-xl" />
                    <button
                      onClick={() => { setUploadedImage(null); if (fileInputRef.current) fileInputRef.current.value = ''; }}
                      className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/60 flex items-center justify-center text-white hover:bg-black/80"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                    <p className="text-xs text-emerald-400 mt-2 text-center">✓ Foto geladen</p>
                  </div>
                ) : (
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full h-32 border-2 border-dashed border-slate-600 hover:border-brand-500 rounded-xl flex flex-col items-center justify-center gap-2 text-slate-500 hover:text-slate-300 transition-colors"
                  >
                    <Upload className="w-6 h-6" />
                    <span className="text-xs font-medium">Klik om foto te uploaden</span>
                    <span className="text-xs opacity-60">JPG, PNG, WEBP</span>
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Stap 2: Platform */}
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-5">
            <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">2. Platform</h2>
            <div className="grid grid-cols-2 gap-2">
              {PLATFORMS.map(p => (
                <button key={p.id} onClick={() => setPlatform(p.id)}
                  className={`py-2 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                    platform === p.id ? 'bg-brand-600 text-white' : 'bg-slate-700 text-slate-400 hover:text-white'
                  }`}>
                  <span>{p.icon}</span>{p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Stap 3: Format & stijl */}
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-5 space-y-4">
            <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">3. Format & stijl</h2>

            <div>
              <p className="text-xs text-slate-500 mb-2">Format</p>
              <div className="grid grid-cols-3 gap-2">
                {FORMATS.map(f => (
                  <button key={f.id} onClick={() => setFormat(f.id)}
                    className={`py-2 px-1 rounded-lg text-xs font-medium transition-all flex flex-col items-center gap-1 ${
                      format === f.id ? 'bg-brand-600 text-white' : 'bg-slate-700 text-slate-400 hover:text-white'
                    }`}>
                    <f.icon className="w-3.5 h-3.5" />
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-xs text-slate-500 mb-2">Toon</p>
              <div className="grid grid-cols-2 gap-2">
                {TONES.map(t => (
                  <button key={t.id} onClick={() => setTone(t.id)}
                    className={`py-2 px-3 rounded-lg text-xs font-medium transition-all text-left ${
                      tone === t.id ? 'bg-brand-600 text-white' : 'bg-slate-700 text-slate-400 hover:text-white'
                    }`}>
                    <div>{t.label}</div>
                    <div className="opacity-70 mt-0.5">{t.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <p className="text-xs font-medium text-white">Taal</p>
              <div className="flex gap-2">
                {(['nl', 'en'] as Language[]).map(l => (
                  <button key={l} onClick={() => setLanguage(l)}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                      language === l ? 'bg-brand-600 text-white' : 'bg-slate-700 text-slate-400'
                    }`}>
                    {l.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-white">AI marketing beeld</p>
                <p className="text-xs text-slate-500">
                  {uploadMode ? 'Gebaseerd op geüploade foto' : 'Genereert een productafbeelding'}
                </p>
              </div>
              <button onClick={() => setWithImage(!withImage)}
                className={`w-10 h-5 rounded-full transition-all relative ${withImage ? 'bg-brand-600' : 'bg-slate-700'}`}>
                <div className="w-4 h-4 bg-white rounded-full absolute top-0.5 transition-all"
                  style={{ left: withImage ? '22px' : '2px' }} />
              </button>
            </div>
          </div>

          {/* Genereer */}
          <div className="space-y-2">
            <button
              onClick={generate}
              disabled={isGenerating || !canGenerate}
              className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 disabled:opacity-50 text-white font-semibold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg"
            >
              {isGenerating
                ? <><Loader2 className="w-4 h-4 animate-spin" /> Genereren...</>
                : <><Sparkles className="w-4 h-4" />
                  {uploadMode
                    ? uploadedImage ? 'Genereer voor geüploade foto' : 'Upload eerst een foto'
                    : selectedProd
                    ? `Genereer voor "${selectedProd.title.slice(0, 18)}${selectedProd.title.length > 18 ? '...' : ''}"`
                    : 'Selecteer een product'
                  }
                </>
              }
            </button>

            {isDone && !isGenerating && (
              <button onClick={generate} disabled={!canGenerate}
                className="w-full bg-slate-700 hover:bg-slate-600 disabled:opacity-50 text-slate-300 text-sm font-medium py-2.5 rounded-xl transition-all flex items-center justify-center gap-2">
                <Sparkles className="w-3.5 h-3.5" />
                Opnieuw genereren
              </button>
            )}

            {error && status === 'error' && (
              <p className="text-xs text-rose-400 text-center">{error}</p>
            )}
          </div>
        </div>

        {/* ── Rechts: resultaat ── */}
        <div className="lg:col-span-3">
          {isGenerating ? (
            <div className="h-full min-h-96 flex flex-col items-center justify-center gap-4 bg-slate-800/30 rounded-2xl border border-slate-700/50">
              <Loader2 className="w-8 h-8 animate-spin text-brand-400" />
              <p className="text-slate-400 text-sm">
                {withImage ? 'Content + beeld genereren...' : 'Content genereren...'}
              </p>
              {withImage && <p className="text-xs text-slate-600 max-w-xs text-center">AI beeld genereren duurt 15–30 seconden.</p>}
            </div>
          ) : isDone && result ? (
            <ContentResult format={format} />
          ) : (
            <div className="h-full min-h-96 flex flex-col items-center justify-center gap-3 bg-slate-800/30 rounded-2xl border border-dashed border-slate-700/50 text-center px-8">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-pink-500/20 to-purple-600/20 border border-pink-500/30 flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-pink-400" />
              </div>
              <h3 className="text-white font-semibold">Kies een product of upload een foto</h3>
              <p className="text-slate-400 text-sm max-w-xs">
                Selecteer een product uit je winkel, of upload een productfoto — en genereer direct marketing content met AI.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
