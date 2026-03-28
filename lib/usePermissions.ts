// lib/usePermissions.ts
//
// Hook die het planSlug uit de auth store leest en bepaalt
// welke features beschikbaar zijn. Wordt gebruikt in de
// navigatie en op pagina's om upgrade-prompts te tonen.

import { useAuthStore } from '@/lib/store';

export type PlanSlug = 'starter' | 'growth' | 'scale';

// Zelfde definitie als de backend — altijd in sync houden
const PLAN_FEATURES: Record<PlanSlug, string[]> = {
  starter: [
    'sales-dashboard',
    'order-analytics',
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

const UPGRADE_PATH: Record<PlanSlug, PlanSlug | null> = {
  starter: 'growth',
  growth:  'scale',
  scale:   null,
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

  return {
    planSlug,
    can,
    requiredPlan,
    upgradeTo: UPGRADE_PATH[planSlug],
  };
}
