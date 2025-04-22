import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { theme } from '@/constants/theme';
import { usePet } from '@/context/PetContext';
import { PetCustomization } from '@/data/petData';

export default function CustomizationShop() {
  const { currentPet, points, buyCustomization, applyCustomization } = usePet();

  if (!currentPet) return null;

  const petCustomizations = currentPet.type
    ? petTypes[currentPet.type].customizations
    : [];

  const handlePurchase = (customization: PetCustomization) => {
    if (buyCustomization(customization)) {
      applyCustomization(currentPet.id, customization.id);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Pet Shop</Text>
        <Text style={styles.points}>{points} Points</Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.itemsContainer}
      >
        {petCustomizations.map(item => (
          <View key={item.id} style={styles.itemCard}>
            <Image
              source={{ uri: item.imageUrl }}
              style={styles.itemImage}
              resizeMode="contain"
            />
            <Text style={styles.itemName}>{item.name}</Text>
            <Text style={styles.itemDescription}>{item.description}</Text>
            <TouchableOpacity
              style={[
                styles.buyButton,
                points < item.cost && styles.disabledButton,
              ]}
              onPress={() => handlePurchase(item)}
              disabled={points < item.cost}
            >
              <Text style={styles.buyButtonText}>{item.cost} Points</Text>
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginVertical: theme.spacing.md,
    ...theme.shadows.small,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
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
  itemsContainer: {
    paddingVertical: theme.spacing.sm,
  },
  itemCard: {
    width: 160,
    backgroundColor: theme.colors.lightGray,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginRight: theme.spacing.md,
    alignItems: 'center',
  },
  itemImage: {
    width: 80,
    height: 80,
    marginBottom: theme.spacing.sm,
  },
  itemName: {
    fontFamily: theme.fonts.semiBold,
    fontSize: 16,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  itemDescription: {
    fontFamily: theme.fonts.regular,
    fontSize: 12,
    color: theme.colors.subtext,
    textAlign: 'center',
    marginBottom: theme.spacing.sm,
  },
  buyButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.full,
  },
  disabledButton: {
    backgroundColor: theme.colors.gray,
  },
  buyButtonText: {
    fontFamily: theme.fonts.semiBold,
    fontSize: 14,
    color: 'white',
  },
});