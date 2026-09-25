import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';
import { Check } from 'lucide-react-native';
import { theme } from '@/constants/theme';
import { usePet } from '@/context/PetContext';
import { accessories, PetCustomization } from '@/data/petData';

export default function CustomizationShop() {
  const { currentPet, points, buyCustomization, applyCustomization } = usePet();

  if (!currentPet) return null;

  const owned = currentPet.customizations;
  const equipped = currentPet.activeCustomization;

  const handlePress = (item: PetCustomization) => {
    const isOwned = owned.includes(item.id);
    if (isOwned) {
      applyCustomization(currentPet.id, item.id);
    } else if (buyCustomization(item)) {
      applyCustomization(currentPet.id, item.id);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>🎀 Accessory Shop</Text>
        <Text style={styles.points}>{points} Points</Text>
      </View>
      <Text style={styles.subtitle}>
        Dress up {currentPet.name} — every pet can wear every accessory!
      </Text>

      <View style={styles.grid}>
        {accessories.map(item => {
          const isOwned = owned.includes(item.id);
          const isEquipped = equipped === item.id;
          const affordable = points >= item.cost;
          return (
            <TouchableOpacity
              key={item.id}
              style={[styles.card, isEquipped && styles.equippedCard]}
              onPress={() => handlePress(item)}
              disabled={!isOwned && !affordable}
              activeOpacity={0.7}
            >
              {isEquipped && (
                <View style={styles.equippedBadge}>
                  <Check size={14} color="white" />
                </View>
              )}
              <View style={styles.artBox}>
                {item.image ? (
                  <Image source={item.image} style={styles.art} resizeMode="contain" />
                ) : (
                  <Text style={styles.emoji}>{item.emoji}</Text>
                )}
              </View>
              <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
              {isEquipped ? (
                <Text style={styles.wearingText}>Wearing ✨</Text>
              ) : isOwned ? (
                <Text style={styles.wearText}>Tap to wear</Text>
              ) : (
                <Text style={[styles.costText, !affordable && styles.cantAfford]}>
                  {item.cost} pts
                </Text>
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    marginVertical: theme.spacing.md,
    ...theme.shadows.small,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontFamily: theme.fonts.bold,
    fontSize: 18,
    color: theme.colors.text,
  },
  points: {
    fontFamily: theme.fonts.semiBold,
    fontSize: 16,
    color: theme.colors.primary,
  },
  subtitle: {
    fontFamily: theme.fonts.regular,
    fontSize: 13,
    color: theme.colors.subtext,
    marginTop: 4,
    marginBottom: theme.spacing.md,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  card: {
    width: '48%',
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  equippedCard: {
    borderColor: theme.colors.primary,
    backgroundColor: '#FFF7ED',
  },
  equippedBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: theme.colors.primary,
    borderRadius: 12,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  artBox: {
    width: 72,
    height: 72,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.sm,
  },
  art: {
    width: '100%',
    height: '100%',
  },
  emoji: {
    fontSize: 52,
  },
  name: {
    fontFamily: theme.fonts.semiBold,
    fontSize: 14,
    color: theme.colors.text,
    marginBottom: 2,
  },
  costText: {
    fontFamily: theme.fonts.bold,
    fontSize: 14,
    color: theme.colors.primary,
  },
  cantAfford: {
    color: theme.colors.gray,
  },
  wearText: {
    fontFamily: theme.fonts.semiBold,
    fontSize: 13,
    color: theme.colors.subtext,
  },
  wearingText: {
    fontFamily: theme.fonts.bold,
    fontSize: 13,
    color: theme.colors.primary,
  },
});
