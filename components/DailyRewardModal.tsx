import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Animated,
} from 'react-native';
import { Flame, Gift } from 'lucide-react-native';
import { theme } from '@/constants/theme';
import { usePet } from '@/context/PetContext';

export default function DailyRewardModal() {
  const { dailyReward, dismissDailyReward } = usePet();
  const scale = useRef(new Animated.Value(0.8)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (dailyReward) {
      Animated.parallel([
        Animated.spring(scale, {
          toValue: 1,
          friction: 7,
          tension: 80,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      scale.setValue(0.8);
      opacity.setValue(0);
    }
  }, [dailyReward, scale, opacity]);

  return (
    <Modal
      visible={!!dailyReward}
      transparent
      animationType="none"
      onRequestClose={dismissDailyReward}
    >
      <Animated.View style={[styles.backdrop, { opacity }]}>
        <Animated.View style={[styles.card, { transform: [{ scale }] }]}>
          <View style={styles.giftCircle}>
            <Gift size={40} color={theme.colors.primary} />
          </View>
          <Text style={styles.title}>Daily Reward!</Text>
          <View style={styles.streakRow}>
            <Flame size={20} color="#FF6B35" />
            <Text style={styles.streakText}>Day {dailyReward?.day} streak</Text>
          </View>
          <Text style={styles.points}>+{dailyReward?.points} points</Text>
          <Text style={styles.hint}>
            Come back tomorrow to keep your streak going!
          </Text>
          <TouchableOpacity style={styles.claimButton} onPress={dismissDailyReward}>
            <Text style={styles.claimText}>Claim</Text>
          </TouchableOpacity>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.xl,
  },
  card: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.xl,
    alignItems: 'center',
    ...theme.shadows.medium,
  },
  giftCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: '#FFF3E0',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.md,
  },
  title: {
    fontFamily: theme.fonts.bold,
    fontSize: 26,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  streakRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: theme.spacing.sm,
  },
  streakText: {
    fontFamily: theme.fonts.semiBold,
    fontSize: 16,
    color: theme.colors.text,
  },
  points: {
    fontFamily: theme.fonts.bold,
    fontSize: 32,
    color: theme.colors.primary,
    marginBottom: theme.spacing.sm,
  },
  hint: {
    fontFamily: theme.fonts.regular,
    fontSize: 14,
    color: theme.colors.subtext,
    textAlign: 'center',
    marginBottom: theme.spacing.lg,
  },
  claimButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.full,
    minWidth: 160,
    alignItems: 'center',
  },
  claimText: {
    fontFamily: theme.fonts.bold,
    fontSize: 18,
    color: 'white',
  },
});
