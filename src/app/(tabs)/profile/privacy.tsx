import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Screen } from '@/components/ui/screen';
import { Spacing } from '@/constants/theme';

const POINTS = [
  {
    title: 'Vos réponses restent privées',
    body: 'Votre partenaire ne voit jamais le contenu exact de vos réponses individuelles — seulement si vous avez, ou non, un point commun.',
  },
  {
    title: 'Ce n’est pas qu’une question d’interface',
    body: 'La confidentialité est appliquée directement au niveau de la base de données : même une requête technique directe ne peut pas récupérer les réponses de votre partenaire.',
  },
  {
    title: 'Vous gardez le contrôle',
    body: 'Vous pouvez quitter votre couple ou supprimer votre compte à tout moment depuis cet écran de profil.',
  },
];

export default function Privacy() {
  return (
    <Screen>
      <ThemedText type="subtitle">Comment fonctionne la confidentialité</ThemedText>
      <View style={styles.list}>
        {POINTS.map((point) => (
          <View key={point.title} style={styles.item}>
            <ThemedText type="smallBold">{point.title}</ThemedText>
            <ThemedText themeColor="textSecondary">{point.body}</ThemedText>
          </View>
        ))}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  list: { gap: Spacing.four },
  item: { gap: Spacing.one },
});
