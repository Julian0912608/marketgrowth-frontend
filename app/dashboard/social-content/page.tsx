'use client';

import { useState } from 'react';
import {
  Sparkles, Copy, CheckCircle, Zap, TrendingUp,
  ShoppingBag, Megaphone, Image, Layers, Video,
  Download, ChevronRight, ChevronLeft, Loader2, AlertCircle,
} from 'lucide-react';
import { api } from '@/lib/api';

type Platform      = 'instagram' | 'tiktok';
type Tone          = 'educational' | 'inspirational' | 'data-driven' | 'behind-the-scenes';
type Topic         = 'roas' | 'product-performance' | 'ads-tips' | 'ecommerce-growth' | 'platform-insights';
type ContentFormat = 'single' | 'carousel' | 'video_script';

interface GeneratedPost {
  hook?:           string;
  caption?:        string;
  cta?:            string;
  hashtags:        string[];
  image_prompt?:   string;
  generatedImage?: string | null;
  slideImages?:    (string | null)[];
  slides?:         { headline: string; body: string; visual_hint: string }[];
  script?:         string;
}

const PLATFORMS = [
  { id: 'instagram' as Platform, label: 'Instagram', icon: '📸' },
  { id: 'tiktok'    as Platform, label: 'TikTok',    icon: '🎵' },
];

const FORMATS = [
  { id: 'single'       as ContentFormat, label: 'Single image', icon: Image,  desc: 'One impactful post' },
  { id: 'carousel'     as ContentFormat, label: 'Carousel',     icon: Layers, desc: 'Swipeable slides' },
  { id: 'video_script' as ContentFormat, label: 'Video script', icon: Video,  desc: '30-60 second script' },
];

const TONES = [
  { id: 'educational'       as Tone, label: 'Educational',       desc: 'Teach something' },
  { id: 'inspirational'     as Tone, label: 'Inspirational',     desc: 'Motivate action' },
  { id: 'data-driven'       as Tone, label: 'Data-driven',       desc: 'Lead with numbers' },
  { id: 'behind-the-scenes' as Tone, label: 'Behind the scenes', desc: 'Authentic & real' },
];

const TOPICS = [
  { id: 'roas'                as Topic, label: 'ROAS & Ad Performance', icon: TrendingUp },
  { id: 'product-performance' as Topic, label: 'Product Performance',   icon: ShoppingBag },
  { id: 'ads-tips'            as Topic, label: 'Advertising Tips',      icon: Megaphone },
  { id: 'ecommerce-growth'    as Topic, label: 'Ecommerce Growth',      icon: Zap },
  { id: 'platform-insights'   as Topic, label: 'Platform Insights',     icon: Sparkles },
];

// ── Hulpfunctie: één image genereren via backend ──────────────
async function fetchGeneratedImage(
  prompt: string,
  slideTitle?: string,
  slideBody?: string,
  index?: number,
): Promise<string | null> {
  try {
    const res = await api.post('/ai/generate-image', {
      prompt,
      slideTitle,
      slideBody,
      index: index ?? 0,
    });
    return res.data.imageUrl ?? null;
  } catch {
    return null;
  }
}

// ── Post Card ─────────────────────────────────────────────────
function PostCard({
  post,
  index,
  format,
  onImagesGenerated,
}: {
  post: GeneratedPost;
  index: number;
  format: ContentFormat;
  onImagesGenerated?: (postIndex: number, images: (string | null)[]) => void;
}) {
  const [copied,        setCopied]        = useState(false);
  const [imgLoading,    setImgLoading]    = useState(false);
  const [imageUrl,      setImageUrl]      = useState<string | null>(post.generatedImage ?? null);
  const [slideImages,   setSlideImages]   = useState<(string | null)[]>(post.slideImages ?? []);
  const [slideIndex,    setSlideIndex]    = useState(0);
  const [imagesGenerated, setImagesGenerated] = useState(0);

  const currentSlideImage = format === 'carousel'
    ? (slideImages[slideIndex] ?? null)
    : null;

  const activeImage = format === 'carousel' ? currentSlideImage : imageUrl;
  const totalSlides = post.slides?.length ?? 0;

  const copyText = () => {
    let text = '';
    if (format === 'video_script') {
      text = `${post.hook ?? ''}\n\n${post.script ?? ''}\n\n${post.cta ?? ''}`;
    } else if (format === 'carousel') {
      text = post.slides?.map((s, i) => `Slide ${i + 1}:\n${s.headline}\n${s.body}`).join('\n\n') ?? '';
      text += `\n\n${post.caption ?? ''}\n\n${post.cta ?? ''}\n\n${post.hashtags?.map(h => `#${h}`).join(' ')}`;
    } else {
      text = `${post.hook ?? ''}\n\n${post.caption ?? ''}\n\n${post.cta ?? ''}\n\n${post.hashtags?.map(h => `#${h}`).join(' ')}`;
    }
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Single image genereren
  const generateSingleImage = async () => {
    if (!post.image_prompt) return;
    setImgLoading(true);
    const url = await fetchGeneratedImage(post.image_prompt, post.hook, post.caption, index);
    if (url) setImageUrl(url);
    setImgLoading(false);
  };

  // Alle carousel slides genereren
  const generateCarouselImages = async () => {
    if (!post.slides || post.slides.length === 0) return;
    setImgLoading(true);
    setImagesGenerated(0);

    const newImages: (string | null)[] = new Array(post.slides.length).fill(null);

    for (let i = 0; i < post.slides.length; i++) {
      const slide = post.slides[i];
      const prompt = slide.visual_hint || post.image_prompt || `${slide.headline} — professional ecommerce analytics slide`;
      const url = await fetchGeneratedImage(prompt, slide.headline, slide.body, i);
      newImages[i] = url;
      setSlideImages([...newImages]);
      setImagesGenerated(i + 1);
    }

    onImagesGenerated?.(index, newImages);
    setImgLoading(false);
  };

  const downloadImage = (url: string, suffix: string = '') => {
    const a = document.createElement('a');
    a.href = url;
    a.download = `marketgrow-post-${index + 1}${suffix}.svg`;
    a.click();
  };

  return (
    <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl overflow-hidden">

      {/* Image area */}
      {activeImage ? (
        <div className="relative">
          <img src={activeImage} alt="Generated creative" className="w-full aspect-square object-cover" />
          <button
            onClick={() => downloadImage(activeImage, format === 'carousel' ? `-slide${slideIndex + 1}` : '')}
            className="absolute top-3 right-3 w-8 h-8 rounded-lg bg-black/50 hover:bg-black/70 flex items-center justify-center transition-colors"
          >
            <Download className="w-4 h-4 text-white" />
          </button>
          {format === 'carousel' && totalSlides > 1 && (
            <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1">
              {post.slides!.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setSlideIndex(i)}
                  className={`h-1.5 rounded-full transition-all ${i === slideIndex ? 'w-4 bg-white' : 'w-1.5 bg-white/50'}`}
                />
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="aspect-square bg-slate-900/50 border-b border-slate-700/50 flex flex-col items-center justify-center gap-3 text-slate-500">
          {imgLoading ? (
            <>
              <Loader2 className="w-6 h-6 animate-spin text-brand-400" />
              <span className="text-xs text-slate-400">
                {format === 'carousel'
                  ? `Generating slide ${imagesGenerated + 1} of ${totalSlides}...`
                  : 'Generating image...'}
              </span>
            </>
          ) : (
            <>
              <Image className="w-8 h-8" />
              {format === 'carousel' && post.slides && post.slides.length > 0 && (
                <button
                  onClick={generateCarouselImages}
                  className="flex items-center gap-1.5 text-xs font-medium text-brand-400 hover:text-brand-300 border border-brand-500/30 hover:border-brand-500/50 px-3 py-1.5 rounded-lg transition-colors"
                >
                  <Sparkles className="w-3 h-3" />
                  Generate {totalSlides} slide images
                </button>
              )}
              {format === 'single' && post.image_prompt && (
                <button
                  onClick={generateSingleImage}
                  className="flex items-center gap-1.5 text-xs font-medium text-brand-400 hover:text-brand-300 border border-brand-500/30 hover:border-brand-500/50 px-3 py-1.5 rounded-lg transition-colors"
                >
                  <Sparkles className="w-3 h-3" />
                  Generate with AI
                </button>
              )}
              {post.image_prompt && (
                <span className="text-xs px-4 text-center opacity-50 line-clamp-2">
                  {post.image_prompt.slice(0, 80)}...
                </span>
              )}
            </>
          )}
        </div>
      )}

      {/* Content */}
      <div className="p-5">

        {/* Carousel slide navigator */}
        {format === 'carousel' && post.slides && post.slides.length > 0 && (
          <div className="mb-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Slide {slideIndex + 1} / {post.slides.length}
              </span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setSlideIndex(Math.max(0, slideIndex - 1))}
                  disabled={slideIndex === 0}
                  className="w-6 h-6 rounded bg-slate-700 flex items-center justify-center disabled:opacity-30"
                >
                  <ChevronLeft className="w-3.5 h-3.5 text-white" />
                </button>
                <button
                  onClick={() => setSlideIndex(Math.min(post.slides!.length - 1, slideIndex + 1))}
                  disabled={slideIndex === post.slides.length - 1}
                  className="w-6 h-6 rounded bg-slate-700 flex items-center justify-center disabled:opacity-30"
                >
                  <ChevronRight className="w-3.5 h-3.5 text-white" />
                </button>
              </div>
            </div>
            <div className="bg-slate-900/50 rounded-xl p-4">
              <p className="text-sm font-bold text-white mb-1">{post.slides[slideIndex].headline}</p>
              <p className="text-xs text-slate-300 leading-relaxed">{post.slides[slideIndex].body}</p>
              <p className="text-xs text-slate-500 mt-2 italic">Visual: {post.slides[slideIndex].visual_hint}</p>
            </div>
            {post.caption && <p className="text-xs text-slate-400 mt-3">{post.caption}</p>}
          </div>
        )}

        {/* Video script */}
        {format === 'video_script' && (
          <>
            <div className="mb-3">
              <span className="text-xs font-semibold text-brand-400 uppercase tracking-wider">Hook (0-3s)</span>
              <p className="text-sm text-white mt-1 font-medium">{post.hook}</p>
            </div>
            <div className="mb-3">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Script</span>
              <p className="text-sm text-slate-300 mt-1 leading-relaxed whitespace-pre-line">{post.script}</p>
            </div>
            <div className="mb-4">
              <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">CTA</span>
              <p className="text-sm text-white mt-1">{post.cta}</p>
            </div>
          </>
        )}

        {/* Single post */}
        {format === 'single' && (
          <>
            <p className="text-sm font-bold text-white mb-2">{post.hook}</p>
            <p className="text-sm text-slate-300 leading-relaxed mb-3 whitespace-pre-line">{post.caption}</p>
            <p className="text-sm text-brand-400 mb-4">{post.cta}</p>
          </>
        )}

        {/* Hashtags */}
        {post.hashtags && post.hashtags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {post.hashtags.map((h, i) => (
              <span key={i} className="text-xs text-brand-400 bg-brand-600/10 px-2 py-0.5 rounded-full">#{h}</span>
            ))}
          </div>
        )}

        {/* Image prompt preview */}
        {post.image_prompt && !activeImage && (
          <div className="mb-4 p-3 bg-slate-900/50 rounded-xl border border-slate-700/30">
            <p className="text-xs font-semibold text-slate-400 mb-1">AI image prompt</p>
            <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">{post.image_prompt}</p>
          </div>
        )}

        {/* Copy button */}
        <button
          onClick={copyText}
          className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-semibold transition-all ${
            copied
              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
              : 'bg-slate-700 hover:bg-slate-600 text-slate-300 hover:text-white'
          }`}
        >
          {copied ? <CheckCircle className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
          {copied ? 'Copied!' : 'Copy to clipboard'}
        </button>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────
export default function SocialContentPage() {
  const [platform,       setPlatform]       = useState<Platform>('instagram');
  const [format,         setFormat]         = useState<ContentFormat>('single');
  const [tone,           setTone]           = useState<Tone>('educational');
  const [topic,          setTopic]          = useState<Topic>('roas');
  const [customCtx,      setCustomCtx]      = useState('');
  const [loading,        setLoading]        = useState(false);
  const [posts,          setPosts]          = useState<GeneratedPost[]>([]);
  const [error,          setError]          = useState('');
  const [count,          setCount]          = useState(3);
  const [generateImages, setGenerateImages] = useState(false);

  const generate = async () => {
    setLoading(true);
    setError('');
    setPosts([]);
    try {
      const res = await api.post('/ai/social-content', {
        platform,
        tone,
        topic,
        format,
        customContext: customCtx,
        count,
      });

      const generatedPosts: GeneratedPost[] = res.data.posts ?? [];

      // Als images toggle aan staat: direct images genereren na content
      if (generateImages && generatedPosts.length > 0) {
        const postsWithImages = await Promise.all(
          generatedPosts.map(async (post, i) => {
            if (format === 'single' && post.image_prompt) {
              const imageUrl = await fetchGeneratedImage(post.image_prompt, post.hook, post.caption, i);
              return { ...post, generatedImage: imageUrl };
            }
            if (format === 'carousel' && post.slides) {
              const slideImages: (string | null)[] = [];
              for (let s = 0; s < post.slides.length; s++) {
                const slide = post.slides[s];
                const prompt = slide.visual_hint || post.image_prompt || slide.headline;
                const url = await fetchGeneratedImage(prompt, slide.headline, slide.body, s);
                slideImages.push(url);
              }
              return { ...post, slideImages };
            }
            return post;
          })
        );
        setPosts(postsWithImages);
      } else {
        setPosts(generatedPosts);
      }
    } catch (e: any) {
      setError(e.response?.data?.error ?? 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleImagesGenerated = (postIndex: number, images: (string | null)[]) => {
    setPosts(prev => prev.map((p, i) => i === postIndex ? { ...p, slideImages: images } : p));
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
          Generate Instagram & TikTok content powered by your real store data — with AI-generated visuals.
        </p>
      </div>

      {error && (
        <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm px-4 py-3 rounded-xl mb-6 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />{error}
        </div>
      )}

      <div className="grid lg:grid-cols-[360px_1fr] gap-6">

        {/* ── Left: Controls ── */}
        <div className="space-y-4">

          {/* Platform */}
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-5">
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Platform</label>
            <div className="grid grid-cols-2 gap-2">
              {PLATFORMS.map(p => (
                <button key={p.id} onClick={() => setPlatform(p.id)}
                  className={`flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-all ${
                    platform === p.id ? 'bg-brand-600 text-white' : 'bg-slate-700/50 text-slate-400 hover:text-white hover:bg-slate-700'
                  }`}>
                  <span>{p.icon}</span>{p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Format */}
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-5">
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Content format</label>
            <div className="space-y-2">
              {FORMATS.map(f => {
                const Icon = f.icon;
                return (
                  <button key={f.id} onClick={() => setFormat(f.id)}
                    className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left transition-all ${
                      format === f.id ? 'bg-brand-600/20 border border-brand-500/40' : 'bg-slate-700/30 hover:bg-slate-700/60'
                    }`}>
                    <Icon className={`w-4 h-4 flex-shrink-0 ${format === f.id ? 'text-brand-400' : 'text-slate-400'}`} />
                    <div>
                      <p className={`text-xs font-semibold ${format === f.id ? 'text-brand-300' : 'text-white'}`}>{f.label}</p>
                      <p className="text-xs text-slate-500">{f.desc}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Topic */}
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-5">
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Topic</label>
            <div className="space-y-2">
              {TOPICS.map(t => (
                <button key={t.id} onClick={() => setTopic(t.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all ${
                    topic === t.id ? 'bg-brand-600/20 border border-brand-500/40 text-brand-300' : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                  }`}>
                  <t.icon className="w-4 h-4 shrink-0" />{t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Tone */}
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-5">
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Tone</label>
            <div className="grid grid-cols-2 gap-2">
              {TONES.map(t => (
                <button key={t.id} onClick={() => setTone(t.id)}
                  className={`flex flex-col items-start px-3 py-2.5 rounded-xl text-left transition-all ${
                    tone === t.id ? 'bg-brand-600/20 border border-brand-500/40' : 'bg-slate-700/30 hover:bg-slate-700/60'
                  }`}>
                  <span className={`text-xs font-semibold ${tone === t.id ? 'text-brand-300' : 'text-white'}`}>{t.label}</span>
                  <span className="text-xs text-slate-500 mt-0.5">{t.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Custom context */}
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-5">
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
              Add context <span className="text-slate-600 normal-case font-normal">(optional)</span>
            </label>
            <textarea
              value={customCtx}
              onChange={e => setCustomCtx(e.target.value)}
              placeholder="e.g. 'We just hit €10k this month' or 'New product launching next week'"
              rows={3}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-brand-500 resize-none"
            />
          </div>

          {/* Count + AI images + Generate */}
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-5 space-y-4">

            {format !== 'carousel' && (
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Number of posts</label>
                <div className="flex gap-2">
                  {[1, 3, 5].map(n => (
                    <button key={n} onClick={() => setCount(n)}
                      className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${count === n ? 'bg-brand-600 text-white' : 'bg-slate-700 text-slate-400 hover:text-white'}`}>
                      {n}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {format === 'carousel' && (
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Number of slides</label>
                <div className="flex gap-2">
                  {[3, 5, 7].map(n => (
                    <button key={n} onClick={() => setCount(n)}
                      className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${count === n ? 'bg-brand-600 text-white' : 'bg-slate-700 text-slate-400 hover:text-white'}`}>
                      {n}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* AI Image toggle */}
            <div className="flex items-center justify-between py-1">
              <div>
                <p className="text-xs font-semibold text-white">Generate AI images</p>
                <p className="text-xs text-slate-500">
                  {format === 'carousel' ? 'Branded SVG slide per image' : 'Branded SVG visual (uses AI credits)'}
                </p>
              </div>
              <button
                onClick={() => setGenerateImages(!generateImages)}
                className={`w-10 h-5 rounded-full transition-all relative ${generateImages ? 'bg-brand-600' : 'bg-slate-700'}`}
              >
                <div
                  className="w-4 h-4 bg-white rounded-full absolute top-0.5 transition-all"
                  style={{ left: generateImages ? '22px' : '2px' }}
                />
              </button>
            </div>

            <button
              onClick={generate}
              disabled={loading}
              className="w-full bg-gradient-to-r from-brand-600 to-purple-600 hover:from-brand-700 hover:to-purple-700 disabled:opacity-60 text-white font-semibold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              {loading
                ? generateImages ? 'Generating content + images...' : 'Generating...'
                : 'Generate content'}
            </button>
          </div>
        </div>

        {/* ── Right: Generated posts ── */}
        <div>
          {loading ? (
            <div className="flex flex-col items-center justify-center h-80 gap-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center animate-pulse">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div className="text-center">
                <p className="text-white font-medium mb-1">Generating your content...</p>
                <p className="text-slate-400 text-sm">
                  {generateImages
                    ? 'Creating posts + AI images — this takes ~30 seconds'
                    : 'Analysing your store data and creating posts'}
                </p>
              </div>
            </div>
          ) : posts.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-80 gap-4 text-center">
              <div className="w-16 h-16 rounded-2xl bg-slate-800/50 border border-slate-700/50 flex items-center justify-center">
                <Sparkles className="w-7 h-7 text-slate-500" />
              </div>
              <div>
                <p className="text-slate-300 font-medium mb-1">Ready to generate</p>
                <p className="text-slate-500 text-sm max-w-xs">
                  Choose your platform, format and topic — then hit generate. Your real store data will power the content.
                </p>
              </div>
            </div>
          ) : (
            <div className={`grid gap-6 ${posts.length === 1 ? 'max-w-sm' : 'sm:grid-cols-2 xl:grid-cols-3'}`}>
              {posts.map((post, i) => (
                <PostCard
                  key={i}
                  post={post}
                  index={i}
                  format={format}
                  onImagesGenerated={handleImagesGenerated}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
