import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { theme } from '@/constants/theme';
import { usePet } from '@/context/PetContext';

/**
 * Floating banner that celebrates a freshly unlocked achievement.
 * Auto-dismiss is handled by the PetContext timer.
 */
export default function AchievementToast() {
  const insets = useSafeAreaInsets();
  const { achievementToast } = usePet();
  const slide = useRef(new Animated.Value(-120)).current;

  useEffect(() => {
    if (achievementToast) {
      Animated.spring(slide, {
        toValue: 0,
        friction: 8,
        tension: 60,
        useNativeDriver: true,
      }).start();
    } else {
      slide.setValue(-120);
    }
  }, [achievementToast, slide]);

  if (!achievementToast) return null;

  return (
    <Animated.View
      pointerEvents="none"
      style={[styles.wrapper, { top: insets.top + 8, transform: [{ translateY: slide }] }]}
    >
      <View style={styles.toast}>
        <Text style={styles.emoji}>{achievementToast.emoji}</Text>
        <View style={styles.textCol}>
          <Text style={styles.title}>Achievement unlocked!</Text>
          <Text style={styles.name}>
            {achievementToast.name} · +{achievementToast.points} pts
          </Text>
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    left: theme.spacing.md,
    right: theme.spacing.md,
    zIndex: 999,
    elevation: 999,
  },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1F2937',
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    gap: theme.spacing.md,
    ...theme.shadows.medium,
  },
  emoji: {
    fontSize: 32,
  },
  textCol: {
    flex: 1,
  },
  title: {
    fontFamily: theme.fonts.semiBold,
    fontSize: 13,
    color: '#FBBF24',
    marginBottom: 2,
  },
  name: {
    fontFamily: theme.fonts.bold,
    fontSize: 15,
    color: 'white',
  },
});
