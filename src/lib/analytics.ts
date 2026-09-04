// Analytics minimal (section 19 du brief produit) : quelques événements
// pour comprendre l'usage, jamais de contenu sensible (aucune réponse,
// aucun prénom). Pas de SDK branché pour le MVP — remplace `track` par
// un vrai fournisseur (PostHog, Amplitude…) quand le besoin se
// confirmera ; tous les points d'appel sont déjà en place.

export type AnalyticsEvent =
  | 'onboarding_started'
  | 'account_created'
  | 'couple_created'
  | 'partner_invited'
  | 'partner_joined'
  | 'week_started'
  | 'question_completed'
  | 'week_completed'
  | 'program_completed';

export function track(event: AnalyticsEvent, properties?: Record<string, string | number | boolean>) {
  if (__DEV__) {
    console.log('[analytics]', event, properties ?? {});
  }
  // Brancher ici un vrai fournisseur quand nécessaire.
}
