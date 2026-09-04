-- Contenu du programme : parcours "reconnect-6-weeks" (semaines 1 à 6,
-- section 6 du brief produit) et mode continu "continue" (rituel
-- hebdomadaire après la semaine 6).
--
-- Tout ce contenu est modifiable plus tard par simple migration ou via
-- le dashboard Supabase (table editor), sans toucher au code de
-- l'application (voir section 16 du brief produit).
--
-- Les questions de type "choice" réutilisent volontairement les mêmes
-- catégories de besoins d'une semaine à l'autre : c'est ce qui permet
-- au moteur de synthèse par règles (get_week_insights) de rapprocher
-- les réponses des deux partenaires sans IA (section 10).

insert into public.tracks (id, title, description, is_default) values
  ('reconnect-6-weeks', 'Se retrouver', 'Le parcours guidé de 6 semaines pour se reconnecter.', true),
  ('continue', 'Continuer ensemble', 'Le rituel hebdomadaire après le parcours initial.', false);

-- =========================================================================
-- Semaine 1 — Où en sommes-nous ?
-- =========================================================================
insert into public.program_weeks (track_id, week_number, title, objective, experience_title, experience_instructions) values (
  'reconnect-6-weeks', 1, 'Où en sommes-nous ?',
  'Prendre conscience, ensemble, de votre situation actuelle.',
  '20 minutes sans téléphone',
  'Prenez 20 minutes ensemble, sans téléphone. Répondez chacun à voix haute à cette question : quel souvenir de nous te fait encore sourire ?'
);

insert into public.questions (week_id, position, prompt, kind, options)
select id, 1, 'À quel point te sens-tu proche de ton/ta partenaire aujourd''hui ?', 'scale', null
from public.program_weeks where track_id = 'reconnect-6-weeks' and week_number = 1;

insert into public.questions (week_id, position, prompt, kind, options)
select id, 2, 'Qu''aimerais-tu retrouver davantage dans votre relation ?', 'choice', '[
  {"value": "temps_ensemble", "label": "Temps ensemble"},
  {"value": "affection", "label": "Affection"},
  {"value": "communication", "label": "Communication"},
  {"value": "spontaneite", "label": "Spontanéité"},
  {"value": "sorties", "label": "Sorties"},
  {"value": "attention", "label": "Attention"},
  {"value": "intimite", "label": "Intimité"}
]'::jsonb
from public.program_weeks where track_id = 'reconnect-6-weeks' and week_number = 1;

insert into public.questions (week_id, position, prompt, kind, options)
select id, 3, 'Qu''est-ce qui te manque le plus, en ce moment, dans votre relation ?', 'text', null
from public.program_weeks where track_id = 'reconnect-6-weeks' and week_number = 1;

insert into public.questions (week_id, position, prompt, kind, options)
select id, 4, 'Qu''est-ce qui fonctionne encore très bien entre vous ?', 'text', null
from public.program_weeks where track_id = 'reconnect-6-weeks' and week_number = 1;

insert into public.questions (week_id, position, prompt, kind, options)
select id, 5, 'À quel point avez-vous, ces derniers temps, du temps de qualité ensemble ?', 'scale', null
from public.program_weeks where track_id = 'reconnect-6-weeks' and week_number = 1;

insert into public.questions (week_id, position, prompt, kind, options)
select id, 6, 'À quel point te sens-tu compris(e) par ton/ta partenaire ?', 'scale', null
from public.program_weeks where track_id = 'reconnect-6-weeks' and week_number = 1;

-- =========================================================================
-- Semaine 2 — Retrouver la complicité
-- =========================================================================
insert into public.program_weeks (track_id, week_number, title, objective, experience_title, experience_instructions) values (
  'reconnect-6-weeks', 2, 'Retrouver la complicité',
  'Réintroduire de petites interactions positives dans votre quotidien.',
  'Une attention surprise',
  'Cette semaine, offrez-vous chacun une petite attention surprise (un mot, un café apporté, un message dans la journée). Racontez-vous ensuite ce que vous avez choisi, et pourquoi.'
);

insert into public.questions (week_id, position, prompt, kind, options)
select id, 1, 'Quel moment récent avec ton/ta partenaire t''a fait sourire ?', 'text', null
from public.program_weeks where track_id = 'reconnect-6-weeks' and week_number = 2;

insert into public.questions (week_id, position, prompt, kind, options)
select id, 2, 'De quoi es-tu le/la plus reconnaissant(e) envers ton/ta partenaire en ce moment ?', 'text', null
from public.program_weeks where track_id = 'reconnect-6-weeks' and week_number = 2;

insert into public.questions (week_id, position, prompt, kind, options)
select id, 3, 'À quel point te sens-tu remarqué(e) au quotidien ?', 'scale', null
from public.program_weeks where track_id = 'reconnect-6-weeks' and week_number = 2;

insert into public.questions (week_id, position, prompt, kind, options)
select id, 4, 'Qu''est-ce qui te ferait te sentir plus proche de ton/ta partenaire cette semaine ?', 'choice', '[
  {"value": "temps_ensemble", "label": "Temps ensemble"},
  {"value": "affection", "label": "Affection"},
  {"value": "communication", "label": "Communication"},
  {"value": "spontaneite", "label": "Spontanéité"},
  {"value": "sorties", "label": "Sorties"},
  {"value": "attention", "label": "Attention"},
  {"value": "intimite", "label": "Intimité"}
]'::jsonb
from public.program_weeks where track_id = 'reconnect-6-weeks' and week_number = 2;

insert into public.questions (week_id, position, prompt, kind, options)
select id, 5, 'Quelle petite attention aimerais-tu recevoir plus souvent ?', 'text', null
from public.program_weeks where track_id = 'reconnect-6-weeks' and week_number = 2;

-- =========================================================================
-- Semaine 3 — Parler du désir sans pression
-- =========================================================================
insert into public.program_weeks (track_id, week_number, title, objective, experience_title, experience_instructions) values (
  'reconnect-6-weeks', 3, 'Parler du désir sans pression',
  'Créer un espace pour parler de proximité et d''intimité, sans reproche ni attente.',
  'Un moment de proximité, sans objectif',
  'Accordez-vous un moment de proximité sans objectif précis cette semaine : un massage des mains, une soirée blottis l''un contre l''autre, une discussion dans le noir avant de dormir. Aucune attente, juste de la présence.'
);

insert into public.questions (week_id, position, prompt, kind, options)
select id, 1, 'À quel point te sens-tu désiré(e) par ton/ta partenaire en ce moment ?', 'scale', null
from public.program_weeks where track_id = 'reconnect-6-weeks' and week_number = 3;

insert into public.questions (week_id, position, prompt, kind, options)
select id, 2, 'Qu''est-ce qui t''aide le plus à te sentir proche physiquement de ton/ta partenaire ?', 'choice', '[
  {"value": "temps_sans_pression", "label": "Du temps sans pression"},
  {"value": "tendresse_quotidienne", "label": "De la tendresse au quotidien"},
  {"value": "communication", "label": "Pouvoir en parler ouvertement"},
  {"value": "complicite", "label": "De la complicité et de l''humour"},
  {"value": "redecouverte", "label": "Prendre le temps de se redécouvrir"}
]'::jsonb
from public.program_weeks where track_id = 'reconnect-6-weeks' and week_number = 3;

insert into public.questions (week_id, position, prompt, kind, options)
select id, 3, 'Qu''aimerais-tu que ton/ta partenaire comprenne mieux sur tes besoins d''intimité ?', 'text', null
from public.program_weeks where track_id = 'reconnect-6-weeks' and week_number = 3;

insert into public.questions (week_id, position, prompt, kind, options)
select id, 4, 'À quel point est-il facile pour toi de parler de désir avec ton/ta partenaire ?', 'scale', null
from public.program_weeks where track_id = 'reconnect-6-weeks' and week_number = 3;

insert into public.questions (week_id, position, prompt, kind, options)
select id, 5, 'Qu''est-ce qui pourrait vous rapprocher physiquement, sans pression ni attente ?', 'text', null
from public.program_weeks where track_id = 'reconnect-6-weeks' and week_number = 3;

-- =========================================================================
-- Semaine 4 — Retrouver du temps à deux
-- =========================================================================
insert into public.program_weeks (track_id, week_number, title, objective, experience_title, experience_instructions) values (
  'reconnect-6-weeks', 4, 'Retrouver du temps à deux',
  'Recréer intentionnellement des moments rien que tous les deux.',
  'Choisissez votre moment à deux',
  'À partir de vos réponses, choisissez ensemble votre moment à deux cette semaine — même court.'
);

insert into public.questions (week_id, position, prompt, kind, options)
select id, 1, 'Ces dernières semaines, à quel point avez-vous des moments rien que tous les deux ?', 'scale', null
from public.program_weeks where track_id = 'reconnect-6-weeks' and week_number = 4;

insert into public.questions (week_id, position, prompt, kind, options)
select id, 2, 'Qu''est-ce qui vous empêche le plus souvent de prendre du temps à deux ?', 'text', null
from public.program_weeks where track_id = 'reconnect-6-weeks' and week_number = 4;

insert into public.questions (week_id, position, prompt, kind, options)
select id, 3, 'Si tu pouvais choisir votre moment à deux cette semaine, ce serait plutôt :', 'choice', '[
  {"value": "promenade", "label": "Une promenade"},
  {"value": "restaurant", "label": "Un restaurant"},
  {"value": "cafe", "label": "Un café"},
  {"value": "cuisiner", "label": "Cuisiner ensemble"},
  {"value": "film", "label": "Regarder un film"},
  {"value": "discuter_avant_dormir", "label": "Discuter avant de dormir"},
  {"value": "autre", "label": "Autre chose"}
]'::jsonb
from public.program_weeks where track_id = 'reconnect-6-weeks' and week_number = 4;

insert into public.questions (week_id, position, prompt, kind, options)
select id, 4, 'Qu''est-ce qui rend un moment à deux vraiment réussi pour toi ?', 'text', null
from public.program_weeks where track_id = 'reconnect-6-weeks' and week_number = 4;

-- =========================================================================
-- Semaine 5 — Comprendre les besoins de l'autre
-- =========================================================================
insert into public.program_weeks (track_id, week_number, title, objective, experience_title, experience_instructions) values (
  'reconnect-6-weeks', 5, 'Comprendre les besoins de l''autre',
  'Découvrir vos besoins communs, vos différences, et vos complémentarités.',
  'Dire un besoin, sans le justifier',
  'Partagez à voix haute, chacun votre tour, une chose dont vous avez besoin cette semaine — sans justification, sans négociation. L''autre écoute, simplement.'
);

insert into public.questions (week_id, position, prompt, kind, options)
select id, 1, 'De quoi as-tu le plus besoin en ce moment dans votre relation ?', 'choice', '[
  {"value": "temps_ensemble", "label": "Temps ensemble"},
  {"value": "affection", "label": "Affection"},
  {"value": "communication", "label": "Communication"},
  {"value": "spontaneite", "label": "Spontanéité"},
  {"value": "sorties", "label": "Sorties"},
  {"value": "attention", "label": "Attention"},
  {"value": "intimite", "label": "Intimité"}
]'::jsonb
from public.program_weeks where track_id = 'reconnect-6-weeks' and week_number = 5;

insert into public.questions (week_id, position, prompt, kind, options)
select id, 2, 'Qu''est-ce qui te fait te sentir soutenu(e) par ton/ta partenaire ?', 'text', null
from public.program_weeks where track_id = 'reconnect-6-weeks' and week_number = 5;

insert into public.questions (week_id, position, prompt, kind, options)
select id, 3, 'À quel point sens-tu que tes besoins sont pris en compte au quotidien ?', 'scale', null
from public.program_weeks where track_id = 'reconnect-6-weeks' and week_number = 5;

insert into public.questions (week_id, position, prompt, kind, options)
select id, 4, 'Qu''aimerais-tu que ton/ta partenaire sache sur tes besoins, sans avoir à le demander ?', 'text', null
from public.program_weeks where track_id = 'reconnect-6-weeks' and week_number = 5;

insert into public.questions (week_id, position, prompt, kind, options)
select id, 5, 'Qu''est-ce que tu fais, toi, pour répondre aux besoins de ton/ta partenaire ?', 'text', null
from public.program_weeks where track_id = 'reconnect-6-weeks' and week_number = 5;

-- =========================================================================
-- Semaine 6 — Construire la suite
-- =========================================================================
insert into public.program_weeks (track_id, week_number, title, objective, experience_title, experience_instructions) values (
  'reconnect-6-weeks', 6, 'Construire la suite',
  'Faire le bilan de ces 6 semaines et décider, ensemble, ce que vous souhaitez continuer.',
  'Un bilan à deux',
  'Prenez un moment ensemble pour vous dire, chacun votre tour, une chose que vous avez appréciée pendant ces 6 semaines.'
);

insert into public.questions (week_id, position, prompt, kind, options)
select id, 1, 'Vous sentez-vous plus proches qu''il y a 6 semaines ?', 'scale', null
from public.program_weeks where track_id = 'reconnect-6-weeks' and week_number = 6;

insert into public.questions (week_id, position, prompt, kind, options)
select id, 2, 'Qu''est-ce qui vous a le plus aidés pendant ces 6 semaines ?', 'text', null
from public.program_weeks where track_id = 'reconnect-6-weeks' and week_number = 6;

insert into public.questions (week_id, position, prompt, kind, options)
select id, 3, 'Qu''aimeriez-vous continuer ?', 'text', null
from public.program_weeks where track_id = 'reconnect-6-weeks' and week_number = 6;

insert into public.questions (week_id, position, prompt, kind, options)
select id, 4, 'Qu''avez-vous découvert sur votre partenaire ?', 'text', null
from public.program_weeks where track_id = 'reconnect-6-weeks' and week_number = 6;

insert into public.questions (week_id, position, prompt, kind, options)
select id, 5, 'Quelle petite habitude aimeriez-vous conserver ?', 'text', null
from public.program_weeks where track_id = 'reconnect-6-weeks' and week_number = 6;

-- =========================================================================
-- Mode continu — rituel hebdomadaire après la semaine 6
--
-- Contenu court (5 à 10 minutes maximum) qui tourne en boucle sur 8
-- semaines (voir public.advance_current_week). Ajouter d'autres lignes
-- ici plus tard allonge le cycle sans changer le code.
-- =========================================================================

insert into public.program_weeks (track_id, week_number, title, objective, experience_title, experience_instructions) values
  ('continue', 1, 'Check-in de la semaine', 'Un point rapide sur comment vous allez, à deux.', '30 minutes rien que vous deux', 'Choisissez un moment de 30 minutes cette semaine où vous serez uniquement tous les deux, sans téléphone.'),
  ('continue', 2, 'Check-in de la semaine', 'Un point rapide sur comment vous allez, à deux.', 'Un souvenir de la semaine', 'Racontez-vous un souvenir heureux de la semaine, chacun votre tour, sans être interrompu(e).'),
  ('continue', 3, 'Check-in de la semaine', 'Un point rapide sur comment vous allez, à deux.', 'Un café sans écran', 'Prenez un café ou un thé ensemble, sans écran, juste pour parler de votre semaine.'),
  ('continue', 4, 'Check-in de la semaine', 'Un point rapide sur comment vous allez, à deux.', 'Un geste surprise', 'Faites chacun un petit geste d''attention pour l''autre avant la fin de la semaine, sans le dire à l''avance.'),
  ('continue', 5, 'Check-in de la semaine', 'Un point rapide sur comment vous allez, à deux.', 'Une marche à deux', 'Marchez ensemble 20 minutes sans téléphone, juste pour parler.'),
  ('continue', 6, 'Check-in de la semaine', 'Un point rapide sur comment vous allez, à deux.', 'Quelque chose de spontané', 'Proposez une activité spontanée à faire ensemble avant la fin de la semaine, sans trop planifier.'),
  ('continue', 7, 'Check-in de la semaine', 'Un point rapide sur comment vous allez, à deux.', 'Un compliment à voix haute', 'Partagez chacun une chose que vous appréciez chez l''autre en ce moment, à voix haute.'),
  ('continue', 8, 'Check-in de la semaine', 'Un point rapide sur comment vous allez, à deux.', 'Un rendez-vous à venir', 'Choisissez ensemble un rendez-vous à deux pour la semaine prochaine, même court.');

insert into public.questions (week_id, position, prompt, kind, options)
select id, 1, 'Comment te sens-tu dans votre couple cette semaine ?', 'scale', null
from public.program_weeks where track_id = 'continue' and week_number = 1;
insert into public.questions (week_id, position, prompt, kind, options)
select id, 2, 'As-tu envie de davantage de temps à deux cette semaine ?', 'choice', '[
  {"value": "oui_beaucoup", "label": "Oui, beaucoup"},
  {"value": "un_peu", "label": "Un peu"},
  {"value": "pas_particulierement", "label": "Pas particulièrement"}
]'::jsonb
from public.program_weeks where track_id = 'continue' and week_number = 1;
insert into public.questions (week_id, position, prompt, kind, options)
select id, 3, 'De quoi aurais-tu le plus besoin cette semaine ?', 'choice', '[
  {"value": "temps_ensemble", "label": "Temps ensemble"},
  {"value": "affection", "label": "Affection"},
  {"value": "communication", "label": "Communication"},
  {"value": "spontaneite", "label": "Spontanéité"},
  {"value": "sorties", "label": "Sorties"},
  {"value": "attention", "label": "Attention"},
  {"value": "intimite", "label": "Intimité"}
]'::jsonb
from public.program_weeks where track_id = 'continue' and week_number = 1;

insert into public.questions (week_id, position, prompt, kind, options)
select id, 1, 'Te sens-tu proche de ton/ta partenaire actuellement ?', 'scale', null
from public.program_weeks where track_id = 'continue' and week_number = 2;
insert into public.questions (week_id, position, prompt, kind, options)
select id, 2, 'Qu''est-ce qui t''a fait sourire cette semaine grâce à ton/ta partenaire ?', 'text', null
from public.program_weeks where track_id = 'continue' and week_number = 2;
insert into public.questions (week_id, position, prompt, kind, options)
select id, 3, 'As-tu l''impression d''être écouté(e) ces derniers jours ?', 'scale', null
from public.program_weeks where track_id = 'continue' and week_number = 2;

insert into public.questions (week_id, position, prompt, kind, options)
select id, 1, 'À quel point vous sentez-vous complices en ce moment ?', 'scale', null
from public.program_weeks where track_id = 'continue' and week_number = 3;
insert into public.questions (week_id, position, prompt, kind, options)
select id, 2, 'Qu''est-ce qui vous ferait du bien de faire ensemble cette semaine ?', 'choice', '[
  {"value": "temps_ensemble", "label": "Temps ensemble"},
  {"value": "affection", "label": "Affection"},
  {"value": "communication", "label": "Communication"},
  {"value": "spontaneite", "label": "Spontanéité"},
  {"value": "sorties", "label": "Sorties"},
  {"value": "attention", "label": "Attention"},
  {"value": "intimite", "label": "Intimité"}
]'::jsonb
from public.program_weeks where track_id = 'continue' and week_number = 3;
insert into public.questions (week_id, position, prompt, kind, options)
select id, 3, 'Y a-t-il quelque chose que tu n''as pas eu l''occasion de dire à ton/ta partenaire récemment ?', 'text', null
from public.program_weeks where track_id = 'continue' and week_number = 3;

insert into public.questions (week_id, position, prompt, kind, options)
select id, 1, 'Comment décrirais-tu l''ambiance entre vous cette semaine ?', 'choice', '[
  {"value": "sereine", "label": "Sereine"},
  {"value": "chaleureuse", "label": "Chaleureuse"},
  {"value": "joyeuse", "label": "Joyeuse"},
  {"value": "tendue", "label": "Un peu tendue"},
  {"value": "distante", "label": "Un peu distante"}
]'::jsonb
from public.program_weeks where track_id = 'continue' and week_number = 4;
insert into public.questions (week_id, position, prompt, kind, options)
select id, 2, 'As-tu envie de plus de tendresse en ce moment ?', 'scale', null
from public.program_weeks where track_id = 'continue' and week_number = 4;
insert into public.questions (week_id, position, prompt, kind, options)
select id, 3, 'Qu''est-ce qui t''aiderait à te sentir soutenu(e) cette semaine ?', 'text', null
from public.program_weeks where track_id = 'continue' and week_number = 4;

insert into public.questions (week_id, position, prompt, kind, options)
select id, 1, 'Te sens-tu écouté(e) sur ce qui compte pour toi en ce moment ?', 'scale', null
from public.program_weeks where track_id = 'continue' and week_number = 5;
insert into public.questions (week_id, position, prompt, kind, options)
select id, 2, 'De quoi as-tu le plus besoin cette semaine ?', 'choice', '[
  {"value": "temps_ensemble", "label": "Temps ensemble"},
  {"value": "affection", "label": "Affection"},
  {"value": "communication", "label": "Communication"},
  {"value": "spontaneite", "label": "Spontanéité"},
  {"value": "sorties", "label": "Sorties"},
  {"value": "attention", "label": "Attention"},
  {"value": "intimite", "label": "Intimité"}
]'::jsonb
from public.program_weeks where track_id = 'continue' and week_number = 5;
insert into public.questions (week_id, position, prompt, kind, options)
select id, 3, 'Qu''est-ce qui vous a rapprochés récemment ?', 'text', null
from public.program_weeks where track_id = 'continue' and week_number = 5;

insert into public.questions (week_id, position, prompt, kind, options)
select id, 1, 'Comment te sens-tu par rapport à votre proximité physique en ce moment ?', 'scale', null
from public.program_weeks where track_id = 'continue' and week_number = 6;
insert into public.questions (week_id, position, prompt, kind, options)
select id, 2, 'Qu''est-ce qui te ferait te sentir plus détendu(e) avec ton/ta partenaire ?', 'text', null
from public.program_weeks where track_id = 'continue' and week_number = 6;
insert into public.questions (week_id, position, prompt, kind, options)
select id, 3, 'As-tu envie de plus de spontanéité dans votre relation en ce moment ?', 'scale', null
from public.program_weeks where track_id = 'continue' and week_number = 6;

insert into public.questions (week_id, position, prompt, kind, options)
select id, 1, 'À quel point la communication est-elle fluide entre vous en ce moment ?', 'scale', null
from public.program_weeks where track_id = 'continue' and week_number = 7;
insert into public.questions (week_id, position, prompt, kind, options)
select id, 2, 'Qu''aimerais-tu que ton/ta partenaire comprenne mieux sur toi cette semaine ?', 'text', null
from public.program_weeks where track_id = 'continue' and week_number = 7;
insert into public.questions (week_id, position, prompt, kind, options)
select id, 3, 'Qu''est-ce qui fonctionne bien entre vous en ce moment ?', 'text', null
from public.program_weeks where track_id = 'continue' and week_number = 7;

insert into public.questions (week_id, position, prompt, kind, options)
select id, 1, 'Globalement, comment te sens-tu dans votre relation cette semaine ?', 'scale', null
from public.program_weeks where track_id = 'continue' and week_number = 8;
insert into public.questions (week_id, position, prompt, kind, options)
select id, 2, 'De quoi aurais-tu le plus besoin la semaine prochaine ?', 'choice', '[
  {"value": "temps_ensemble", "label": "Temps ensemble"},
  {"value": "affection", "label": "Affection"},
  {"value": "communication", "label": "Communication"},
  {"value": "spontaneite", "label": "Spontanéité"},
  {"value": "sorties", "label": "Sorties"},
  {"value": "attention", "label": "Attention"},
  {"value": "intimite", "label": "Intimité"}
]'::jsonb
from public.program_weeks where track_id = 'continue' and week_number = 8;
insert into public.questions (week_id, position, prompt, kind, options)
select id, 3, 'Qu''aimerais-tu faire plus souvent ensemble ?', 'text', null
from public.program_weeks where track_id = 'continue' and week_number = 8;
