import type { NeedCategory } from '@/lib/supabase/types';

/**
 * Libellé + emoji pour chacun des 7 besoins. Les questions à choix
 * portent déjà leurs propres libellés (voir `Question.options`, en
 * base) ; cette table sert uniquement à afficher une catégorie inférée
 * par mots-clés sur une réponse en texte libre (voir
 * `get_week_insights` et `infer_need_categories` côté base), qui n'a
 * pas d'options prédéfinies à consulter.
 */
export const NEED_LABELS: Record<NeedCategory, string> = {
  affection: '❤️ Affection',
  temps_ensemble: '🕐 Temps ensemble',
  communication: '💬 Communication',
  spontaneite: '✨ Spontanéité',
  sorties: '🍿 Sorties',
  attention: '👀 Attention',
  intimite: '🔥 Intimité',
};

export function needLabel(category: string): string {
  return NEED_LABELS[category as NeedCategory] ?? category;
}
