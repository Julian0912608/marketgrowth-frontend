'use client';

// app/dashboard/social-content/page.tsx
// Compleet herbouwd: product-first marketing content generator
// Kies een product uit je winkel → kies platform + stijl → genereer content + beeld

import { useState, useEffect, useCallback } from 'react';
import {
  Sparkles, Search, Loader2, Instagram, Image as ImageIcon,
  Layers, BookOpen, ShoppingBag, RefreshCw, Copy, CheckCircle,
  ChevronLeft, ChevronRight, Download, TrendingUp, Package,
} from 'lucide-react';
import { api } from '@/lib/api';

// ── Types ──────────────────────────────────────────────────────
interface Product {
  id:           string;
  title:        string;
  ean:          string | null;
  priceMin:     number | null;
  priceMax:     number | null;
  inventory:    number;
  platform:     string;
  shopName:     string;
  revenue30d:   number;
  units30d:     number;
}

interface GeneratedContent {
  hook?:       string;
  caption?:    string;
  cta?:        string;
  hashtags:    string[];
  image_prompt?: string;
  imageUrl?:   string | null;
  slides?:     { headline: string; body: string; visual_hint: string }[];
  product:     { title: string; price: string };
}

type Platform = 'instagram' | 'tiktok' | 'facebook' | 'pinterest';
type Format   = 'single' | 'carousel' | 'story';
type Tone     = 'lifestyle' | 'promotional' | 'educational' | 'ugc';
type Language = 'nl' | 'en';

// ── Config ─────────────────────────────────────────────────────
const PLATFORMS: { id: Platform; label: string; icon: string }[] = [
  { id: 'instagram', label: 'Instagram', icon: '📸' },
  { id: 'tiktok',    label: 'TikTok',    icon: '🎵' },
  { id: 'facebook',  label: 'Facebook',  icon: '👍' },
  { id: 'pinterest', label: 'Pinterest', icon: '📌' },
];

const FORMATS: { id: Format; label: string; desc: string; icon: any }[] = [
  { id: 'single',   label: 'Single post',  desc: 'Eén impactvolle post',  icon: ImageIcon },
  { id: 'carousel', label: 'Carousel',     desc: 'Meerdere slides',       icon: Layers },
  { id: 'story',    label: 'Story',        desc: 'Verticaal formaat',     icon: BookOpen },
];

const TONES: { id: Tone; label: string; desc: string }[] = [
  { id: 'lifestyle',   label: 'Lifestyle',     desc: 'Aspirationeel & warm' },
  { id: 'promotional', label: 'Promotioneel',  desc: 'Sales-gericht, urgentie' },
  { id: 'educational', label: 'Educatief',     desc: 'Informerend & betrouwbaar' },
  { id: 'ugc',         label: 'UGC-stijl',     desc: 'Authentiek, eerste persoon' },
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

// ── Product Card ────────────────────────────────────────────────
function ProductCard({ product, selected, onSelect }: { product: Product; selected: boolean; onSelect: () => void }) {
  return (
    <button
      onClick={onSelect}
      className={`w-full text-left p-4 rounded-xl border transition-all ${
        selected
          ? 'border-brand-500 bg-brand-600/10'
          : 'border-slate-700/50 bg-slate-800/30 hover:border-slate-600'
      }`}
    >
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-lg bg-slate-700 flex items-center justify-center flex-shrink-0">
          <Package className="w-4 h-4 text-slate-400" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-white truncate">{product.title}</p>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <span className={`text-xs px-1.5 py-0.5 rounded border ${PLATFORM_COLORS[product.platform] ?? 'bg-slate-700 text-slate-400 border-slate-600'}`}>
              {product.platform}
            </span>
            {product.priceMin && (
              <span className="text-xs text-slate-500">{formatEur(product.priceMin)}</span>
            )}
            {product.units30d > 0 && (
              <span className="text-xs text-emerald-400 flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                {product.units30d} sold
              </span>
            )}
          </div>
        </div>
        {selected && (
          <CheckCircle className="w-4 h-4 text-brand-400 flex-shrink-0 mt-0.5" />
        )}
      </div>
    </button>
  );
}

// ── Generated Content Display ───────────────────────────────────
function ContentResult({ content, format }: { content: GeneratedContent; format: Format }) {
  const [copied,     setCopied]     = useState(false);
  const [slideIndex, setSlideIndex] = useState(0);

  const copyText = () => {
    let text = '';
    if (format === 'carousel' && content.slides) {
      text = content.slides.map((s, i) => `Slide ${i + 1}:\n${s.headline}\n${s.body}`).join('\n\n');
      text += `\n\n${content.caption ?? ''}\n\n${content.cta ?? ''}\n\n${content.hashtags?.map(h => `#${h}`).join(' ')}`;
    } else {
      text = `${content.hook ?? ''}\n\n${content.caption ?? ''}\n\n${content.cta ?? ''}\n\n${content.hashtags?.map(h => `#${h}`).join(' ')}`;
    }
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadImage = () => {
    if (!content.imageUrl) return;
    const a = document.createElement('a');
    a.href = content.imageUrl;
    a.download = `marketgrow-${content.product?.title?.slice(0, 30).replace(/\s+/g, '-')}.png`;
    a.click();
  };

  const totalSlides = content.slides?.length ?? 0;
  const currentSlide = content.slides?.[slideIndex];

  return (
    <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl overflow-hidden">

      {/* Beeld */}
      <div className="aspect-square bg-slate-900 relative">
        {content.imageUrl ? (
          <img
            src={content.imageUrl}
            alt={content.product?.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-slate-600">
            <ImageIcon className="w-10 h-10" />
            <p className="text-xs">No image generated</p>
          </div>
        )}

        {/* Carousel navigator */}
        {format === 'carousel' && totalSlides > 1 && (
          <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5">
            {Array.from({ length: totalSlides }).map((_, i) => (
              <button
                key={i}
                onClick={() => setSlideIndex(i)}
                className={`rounded-full transition-all ${i === slideIndex ? 'w-4 h-1.5 bg-white' : 'w-1.5 h-1.5 bg-white/50'}`}
              />
            ))}
          </div>
        )}

        {content.imageUrl && (
          <button
            onClick={downloadImage}
            className="absolute top-3 right-3 w-8 h-8 rounded-lg bg-black/50 backdrop-blur flex items-center justify-center text-white hover:bg-black/70 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Content */}
      <div className="p-5">

        {/* Carousel slide content */}
        {format === 'carousel' && currentSlide && (
          <div className="mb-4 p-3 bg-slate-900/50 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-slate-500">Slide {slideIndex + 1} / {totalSlides}</p>
              <div className="flex gap-1">
                <button onClick={() => setSlideIndex(Math.max(0, slideIndex - 1))} disabled={slideIndex === 0} className="w-6 h-6 rounded bg-slate-700 disabled:opacity-30 flex items-center justify-center">
                  <ChevronLeft className="w-3 h-3 text-slate-300" />
                </button>
                <button onClick={() => setSlideIndex(Math.min(totalSlides - 1, slideIndex + 1))} disabled={slideIndex === totalSlides - 1} className="w-6 h-6 rounded bg-slate-700 disabled:opacity-30 flex items-center justify-center">
                  <ChevronRight className="w-3 h-3 text-slate-300" />
                </button>
              </div>
            </div>
            <p className="text-sm font-semibold text-white mb-1">{currentSlide.headline}</p>
            <p className="text-xs text-slate-400">{currentSlide.body}</p>
          </div>
        )}

        {/* Hook */}
        {content.hook && (
          <p className="text-sm font-semibold text-white mb-2">{content.hook}</p>
        )}

        {/* Caption */}
        {content.caption && (
          <p className="text-sm text-slate-300 mb-3 leading-relaxed whitespace-pre-line">{content.caption}</p>
        )}

        {/* CTA */}
        {content.cta && (
          <p className="text-sm font-semibold text-brand-400 mb-3">{content.cta}</p>
        )}

        {/* Hashtags */}
        {content.hashtags?.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-4">
            {content.hashtags.slice(0, 8).map(tag => (
              <span key={tag} className="text-xs text-slate-500 bg-slate-700/50 px-2 py-0.5 rounded">
                #{tag}
              </span>
            ))}
            {content.hashtags.length > 8 && (
              <span className="text-xs text-slate-600">+{content.hashtags.length - 8} more</span>
            )}
          </div>
        )}

        <button
          onClick={copyText}
          className={`w-full py-2 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
            copied
              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
              : 'bg-slate-700 hover:bg-slate-600 text-slate-300'
          }`}
        >
          {copied ? <CheckCircle className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
          {copied ? 'Copied!' : 'Copy caption + hashtags'}
        </button>
      </div>
    </div>
  );
}

// ── Main Page ───────────────────────────────────────────────────
export default function SocialContentPage() {
  const [products,     setProducts]     = useState<Product[]>([]);
  const [loadingProds, setLoadingProds] = useState(true);
  const [search,       setSearch]       = useState('');
  const [selectedProd, setSelectedProd] = useState<Product | null>(null);

  const [platform,  setPlatform]  = useState<Platform>('instagram');
  const [format,    setFormat]    = useState<Format>('single');
  const [tone,      setTone]      = useState<Tone>('lifestyle');
  const [language,  setLanguage]  = useState<Language>('nl');
  const [withImage, setWithImage] = useState(true);

  const [loading,  setLoading]  = useState(false);
  const [result,   setResult]   = useState<GeneratedContent | null>(null);
  const [error,    setError]    = useState('');

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

  const generate = async () => {
    if (!selectedProd) return;
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const res = await api.post('/ai/product-content', {
        productId:    selectedProd.id,
        platform,
        format,
        tone,
        language,
        generateImage: withImage,
      });
      setResult(res.data);
    } catch (e: any) {
      setError(e.response?.data?.error ?? 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

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

      <div className="grid lg:grid-cols-5 gap-6">

        {/* ── Links: configuratie ── */}
        <div className="lg:col-span-2 space-y-5">

          {/* Stap 1: Product kiezen */}
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-5">
            <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
              1. Kies een product
            </h2>
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
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {loadingProds ? (
                <div className="flex justify-center py-6">
                  <Loader2 className="w-5 h-5 animate-spin text-slate-500" />
                </div>
              ) : products.length === 0 ? (
                <p className="text-xs text-slate-500 text-center py-6">
                  {search ? 'Geen producten gevonden.' : 'Synchroniseer eerst een winkel om producten te zien.'}
                </p>
              ) : (
                products.map(p => (
                  <ProductCard
                    key={p.id}
                    product={p}
                    selected={selectedProd?.id === p.id}
                    onSelect={() => setSelectedProd(p)}
                  />
                ))
              )}
            </div>
          </div>

          {/* Stap 2: Platform */}
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-5">
            <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
              2. Platform
            </h2>
            <div className="grid grid-cols-2 gap-2">
              {PLATFORMS.map(p => (
                <button
                  key={p.id}
                  onClick={() => setPlatform(p.id)}
                  className={`py-2 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                    platform === p.id ? 'bg-brand-600 text-white' : 'bg-slate-700 text-slate-400 hover:text-white'
                  }`}
                >
                  <span>{p.icon}</span> {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Stap 3: Format & stijl */}
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-5 space-y-4">
            <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              3. Format & stijl
            </h2>

            <div>
              <p className="text-xs text-slate-500 mb-2">Format</p>
              <div className="grid grid-cols-3 gap-2">
                {FORMATS.map(f => (
                  <button
                    key={f.id}
                    onClick={() => setFormat(f.id)}
                    className={`py-2 px-1 rounded-lg text-xs font-medium transition-all flex flex-col items-center gap-1 ${
                      format === f.id ? 'bg-brand-600 text-white' : 'bg-slate-700 text-slate-400 hover:text-white'
                    }`}
                  >
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
                  <button
                    key={t.id}
                    onClick={() => setTone(t.id)}
                    className={`py-2 px-3 rounded-lg text-xs font-medium transition-all text-left ${
                      tone === t.id ? 'bg-brand-600 text-white' : 'bg-slate-700 text-slate-400 hover:text-white'
                    }`}
                  >
                    <div>{t.label}</div>
                    <div className="text-xs opacity-70 mt-0.5">{t.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-white">Taal</p>
              </div>
              <div className="flex gap-2">
                {(['nl', 'en'] as Language[]).map(l => (
                  <button
                    key={l}
                    onClick={() => setLanguage(l)}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                      language === l ? 'bg-brand-600 text-white' : 'bg-slate-700 text-slate-400'
                    }`}
                  >
                    {l.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-white">AI marketing beeld</p>
                <p className="text-xs text-slate-500">Genereert een productafbeelding</p>
              </div>
              <button
                onClick={() => setWithImage(!withImage)}
                className={`w-10 h-5 rounded-full transition-all relative ${withImage ? 'bg-brand-600' : 'bg-slate-700'}`}
              >
                <div className="w-4 h-4 bg-white rounded-full absolute top-0.5 transition-all" style={{ left: withImage ? '22px' : '2px' }} />
              </button>
            </div>
          </div>

          {/* Generate knop */}
          <button
            onClick={generate}
            disabled={loading || !selectedProd}
            className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 disabled:opacity-50 text-white font-semibold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            {loading ? 'Genereren...' : selectedProd ? `Genereer voor "${selectedProd.title.slice(0, 25)}..."` : 'Selecteer een product'}
          </button>

          {error && (
            <p className="text-xs text-rose-400 text-center">{error}</p>
          )}
        </div>

        {/* ── Rechts: resultaat ── */}
        <div className="lg:col-span-3">
          {loading ? (
            <div className="h-full min-h-96 flex flex-col items-center justify-center gap-4 bg-slate-800/30 rounded-2xl border border-slate-700/50">
              <Loader2 className="w-8 h-8 animate-spin text-brand-400" />
              <p className="text-slate-400 text-sm">
                {withImage ? 'Content + beeld genereren...' : 'Content genereren...'}
              </p>
              {withImage && (
                <p className="text-xs text-slate-600 max-w-xs text-center">
                  Het genereren van een AI beeld kan 15-30 seconden duren.
                </p>
              )}
            </div>
          ) : result ? (
            <ContentResult content={result} format={format} />
          ) : (
            <div className="h-full min-h-96 flex flex-col items-center justify-center gap-3 bg-slate-800/30 rounded-2xl border border-dashed border-slate-700/50 text-center px-8">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-pink-500/20 to-purple-600/20 border border-pink-500/30 flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-pink-400" />
              </div>
              <h3 className="text-white font-semibold">Selecteer een product</h3>
              <p className="text-slate-400 text-sm max-w-xs">
                Kies een product uit je winkel, stel het platform en de stijl in, en genereer direct marketing content met AI.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
