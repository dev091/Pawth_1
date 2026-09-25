import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Animated } from 'react-native';
import { PetType, petTypes } from '@/data/petData';
import { theme } from '@/constants/theme';
import { useRef } from 'react';

interface PetCardProps {
  type: PetType;
  onSelect: () => void;
  selected: boolean;
}

const backdropColor: Record<PetType, string> = {
  bird: '#FFF3D6',
  cat: '#F3E6FF',
  dog: '#FFE9D6',
  rabbit: '#E6FFF3',
};

export default function PetCard({ type, onSelect, selected }: PetCardProps) {
  const petData = petTypes[type];
  const scaleAnim = useRef(new Animated.Value(1)).current;
  
  const handlePress = () => {
    // Animate scale
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.9,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1.05,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
    
    onSelect();
  };

  return (
    <Animated.View
      style={[
        styles.cardContainer,
        selected && styles.selectedCard,
        { transform: [{ scale: scaleAnim }] }
      ]}
    >
      <TouchableOpacity
        style={styles.touchable}
        onPress={handlePress}
        activeOpacity={0.9}
      >
        <View style={[styles.imageBackdrop, { backgroundColor: backdropColor[type] }]}>
          <Image
            source={petData.image}
            style={styles.petImage}
            resizeMode="contain"
          />
        </View>
        
        <Text style={styles.petName}>{petData.name}</Text>
        
        <View style={styles.personalityContainer}>
          <Text style={styles.personalityText}>{petData.personality}</Text>
        </View>
        
        <Text style={styles.descriptionText} numberOfLines={2}>
          {petData.description}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    width: 160,
    height: 240,
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.md,
    marginHorizontal: theme.spacing.sm,
    marginVertical: theme.spacing.md,
    overflow: 'hidden',
    ...theme.shadows.small,
  },
  selectedCard: {
    borderWidth: 3,
    borderColor: theme.colors.primary,
  },
  touchable: {
    flex: 1,
    padding: theme.spacing.md,
    alignItems: 'center',
  },
  imageBackdrop: {
    width: 108,
    height: 108,
    borderRadius: 54,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.sm,
  },
  petImage: {
    width: 92,
    height: 92,
  },
  petName: {
    fontFamily: theme.fonts.bold,
    fontSize: 18,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  personalityContainer: {
    backgroundColor: theme.colors.lightGray,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.full,
    marginBottom: theme.spacing.sm,
  },
  personalityText: {
    fontFamily: theme.fonts.semiBold,
    fontSize: 12,
    color: theme.colors.subtext,
  },
  descriptionText: {
    fontFamily: theme.fonts.regular,
    fontSize: 12,
    color: theme.colors.subtext,
    textAlign: 'center',
  },
});