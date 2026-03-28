// lib/contentStore.ts
// Globale state voor AI Content Studio generatie.
// Leeft buiten de component zodat navigatie de state NIET reset.
// Bij nieuwe generatie: vorige wordt geannuleerd en state begint vanaf 0.

import { create } from 'zustand';

export interface GeneratedContent {
  hook?:         string;
  caption?:      string;
  cta?:          string;
  hashtags:      string[];
  image_prompt?: string;
  imageUrl?:     string | null;
  slides?:       { headline: string; body: string; visual_hint: string }[];
  product?:      { title: string; price: string };
}

export interface GenerationConfig {
  productId:     string;
  productTitle:  string;
  platform:      string;
  format:        string;
  tone:          string;
  language:      string;
  generateImage: boolean;
}

type GenerationStatus = 'idle' | 'generating' | 'done' | 'error';

interface ContentStore {
  status:          GenerationStatus;
  result:          GeneratedContent | null;
  error:           string;
  config:          GenerationConfig | null;
  // Uniek ID per generatie — als dit verandert is de vorige generatie verouderd
  generationId:    number;

  startGeneration: (config: GenerationConfig) => number;
  setResult:       (result: GeneratedContent, forGenerationId: number) => void;
  setError:        (error: string, forGenerationId: number) => void;
  reset:           () => void;
}

export const useContentStore = create<ContentStore>((set, get) => ({
  status:       'idle',
  result:       null,
  error:        '',
  config:       null,
  generationId: 0,

  // Start een nieuwe generatie — geeft een uniek ID terug
  // De caller gebruikt dit ID om te checken of zijn resultaat nog relevant is
  startGeneration: (config) => {
    const newId = get().generationId + 1;
    set({
      status:       'generating',
      result:       null,
      error:        '',
      config,
      generationId: newId,
    });
    return newId;
  },

  // Sla resultaat alleen op als de generatie nog de actieve is
  setResult: (result, forGenerationId) => {
    if (get().generationId !== forGenerationId) return;
    set({ status: 'done', result });
  },

  // Sla error alleen op als de generatie nog de actieve is
  setError: (error, forGenerationId) => {
    if (get().generationId !== forGenerationId) return;
    set({ status: 'error', error });
  },

  reset: () => set({
    status: 'idle', result: null, error: '', config: null,
  }),
}));
