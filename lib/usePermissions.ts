// lib/usePermissions.ts
//
// Hook die het planSlug uit de auth store leest en bepaalt
// welke features beschikbaar zijn. Wordt gebruikt in de
// navigatie en op pagina's om upgrade-prompts te tonen.
//
// SYNC MET BACKEND: src/shared/permissions/permission.service.ts
// en src/infrastructure/database/migrations/001_core_tenant_schema.sql
//
// BELANGRIJK: Starter heeft nu 'ai-recommendations' maar met een
// maandlimiet van 100 credits (zoals vermeld op de pricing pagina).
// De featureGate op de backend handelt de credit-limiet af.

import { useAuthStore } from '@/lib/store';

export type PlanSlug = 'starter' | 'growth' | 'scale';

// Zelfde definitie als de backend — altijd in sync houden
const PLAN_FEATURES: Record<PlanSlug, string[]> = {
  starter: [
    'sales-dashboard',
    'order-analytics',
    'ai-recommendations',   // 100 credits/month (enforced by backend)
  ],
  growth: [
    'sales-dashboard',
    'order-analytics',
    'ai-recommendations',
    'ad-analytics',
    'customer-ltv',
    'multi-shop',
    'report-export',
  ],
  scale: [
    'sales-dashboard',
    'order-analytics',
    'ai-recommendations',
    'ad-analytics',
    'ai-ad-optimization',
    'customer-ltv',
    'multi-shop',
    'report-export',
    'api-access',
    'white-label',
    'team-accounts',
  ],
};

// Features die op Starter een beperkte versie tonen
// (volledige toegang pas op Growth+)
export const STARTER_LIMITED_FEATURES: Record<string, string> = {
  'ai-recommendations': 'AI Chat and Social Content are available from Growth. You have 100 AI credits/month for insights.',
};

// Upgrade pad per plan
const UPGRADE_PATH: Record<PlanSlug, PlanSlug | null> = {
  starter: 'growth',
  growth:  'scale',
  scale:   null,
};

// Credit limits per plan (matcht backend + pricing pagina)
export const PLAN_AI_LIMITS: Record<PlanSlug, number | null> = {
  starter: 100,
  growth:  2000,
  scale:   null,   // unlimited
};

export function usePermissions() {
  const user     = useAuthStore(s => s.user);
  const planSlug = ((user as any)?.planSlug ?? 'starter') as PlanSlug;
  const features = PLAN_FEATURES[planSlug] ?? PLAN_FEATURES.starter;

  function can(feature: string): boolean {
    return features.includes(feature);
  }

  function requiredPlan(feature: string): PlanSlug | null {
    for (const plan of ['starter', 'growth', 'scale'] as PlanSlug[]) {
      if (PLAN_FEATURES[plan].includes(feature)) return plan;
    }
    return null;
  }

  // Is de feature beschikbaar maar met beperkingen op het huidige plan?
  function isLimited(feature: string): boolean {
    return planSlug === 'starter' && feature in STARTER_LIMITED_FEATURES;
  }

  return {
    planSlug,
    can,
    requiredPlan,
    isLimited,
    upgradeTo: UPGRADE_PATH[planSlug],
    aiLimit:   PLAN_AI_LIMITS[planSlug],
  };
}
