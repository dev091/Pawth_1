import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Easing,
  Platform,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { theme } from '@/constants/theme';
import { usePet } from '@/context/PetContext';
import { spinRewards, SPIN_COST, SpinReward } from '@/data/petData';

const ITEM_H = 64;
const VISIBLE = 3;
const SPIN_DURATION = 3000;

export default function LuckySpin() {
  const { spinWheel, freeSpinAvailable, points, spinCount } = usePet();
  const [strip, setStrip] = useState<SpinReward[]>(spinRewards);
  const [spinning, setSpinning] = useState(false);
  const [lastReward, setLastReward] = useState<SpinReward | null>(null);
  const [error, setError] = useState<string | null>(null);
  const anim = useRef(new Animated.Value(0)).current;

  const totalWeight = spinRewards.reduce((s, r) => s + r.weight, 0);

  const doSpin = () => {
    if (spinning) return;
    const result = spinWheel();
    if (!result) {
      setLastReward(null);
      setError(`Not enough points — a spin costs ${SPIN_COST} pts. Play Treat Catch to earn more!`);
      return;
    }
    setError(null);
    setLastReward(null);

    // Build the strip: fullTurns repeats of the reel, then land on targetIndex.
    const newStrip: SpinReward[] = [];
    for (let r = 0; r < result.fullTurns; r++) {
      newStrip.push(...spinRewards);
    }
    newStrip.push(...spinRewards.slice(0, result.targetIndex + 1));
    setStrip(newStrip);

    const finalIndex = newStrip.length - 1;
    const targetOffset = -(finalIndex * ITEM_H - ITEM_H); // center the winner

    setSpinning(true);
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    anim.setValue(0);
    Animated.timing(anim, {
      toValue: targetOffset,
      duration: SPIN_DURATION,
      easing: Easing.bezier(0.12, 0.8, 0.08, 1),
      useNativeDriver: true,
    }).start(() => {
      setSpinning(false);
      setLastReward(result.reward);
      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    });
  };

  const costLabel = freeSpinAvailable ? 'FREE SPIN' : `SPIN · ${SPIN_COST} pts`;

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title}>🎰 Lucky Spin</Text>
        {freeSpinAvailable ? (
          <View style={styles.freeBadge}>
            <Text style={styles.freeText}>FREE SPIN READY</Text>
          </View>
        ) : (
          <Text style={styles.subtle}>Free spin returns tomorrow</Text>
        )}
      </View>

      {/* Reel window */}
      <View style={styles.reelWindow}>
        <Animated.View style={{ transform: [{ translateY: anim }] }}>
          {strip.map((reward, i) => (
            <View key={`${reward.id}-${i}`} style={styles.reelItem}>
              <Text style={styles.reelEmoji}>{reward.emoji}</Text>
              <Text style={styles.reelLabel}>{reward.label}</Text>
            </View>
          ))}
        </Animated.View>
        {/* Center highlight */}
        <View style={styles.highlight} pointerEvents="none" />
        <View style={styles.fadeTop} pointerEvents="none" />
        <View style={styles.fadeBottom} pointerEvents="none" />
      </View>

      {/* Result banner */}
      {lastReward && !spinning && (
        <View style={styles.resultBanner}>
          <Text style={styles.resultEmoji}>{lastReward.emoji}</Text>
          <Text style={styles.resultText}>You won {lastReward.label}!</Text>
        </View>
      )}
      {error && !spinning && <Text style={styles.errorText}>{error}</Text>}

      <TouchableOpacity
        style={[styles.spinButton, spinning && styles.spinButtonDisabled]}
        onPress={doSpin}
        disabled={spinning}
      >
        <Text style={styles.spinButtonText}>
          {spinning ? 'Spinning...' : costLabel}
        </Text>
      </TouchableOpacity>

      <Text style={styles.meta}>
        {spinCount} spin{spinCount === 1 ? '' : 's'} so far · {points} pts
      </Text>

      {/* Transparent odds table */}
      <View style={styles.oddsBox}>
        <Text style={styles.oddsTitle}>Reward odds</Text>
        {spinRewards.map(r => (
          <View key={r.id} style={styles.oddsRow}>
            <Text style={styles.oddsLabel}>
              {r.emoji} {r.label}
            </Text>
            <Text style={styles.oddsPct}>
              {Math.round((r.weight / totalWeight) * 100)}%
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    alignItems: 'center',
    ...theme.shadows.small,
  },
  header: {
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  title: {
    fontFamily: theme.fonts.bold,
    fontSize: 24,
    color: theme.colors.text,
  },
  freeBadge: {
    marginTop: theme.spacing.xs,
    backgroundColor: '#22C55E',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.full,
  },
  freeText: {
    fontFamily: theme.fonts.bold,
    fontSize: 12,
    color: 'white',
  },
  subtle: {
    fontFamily: theme.fonts.regular,
    fontSize: 13,
    color: theme.colors.subtext,
    marginTop: theme.spacing.xs,
  },
  reelWindow: {
    height: ITEM_H * VISIBLE,
    width: '100%',
    overflow: 'hidden',
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.md,
    borderWidth: 2,
    borderColor: theme.colors.primary,
  },
  reelItem: {
    height: ITEM_H,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  reelEmoji: {
    fontSize: 30,
  },
  reelLabel: {
    fontFamily: theme.fonts.bold,
    fontSize: 18,
    color: theme.colors.text,
  },
  highlight: {
    position: 'absolute',
    top: ITEM_H,
    left: 0,
    right: 0,
    height: ITEM_H,
    borderTopWidth: 2,
    borderBottomWidth: 2,
    borderColor: theme.colors.primary,
    backgroundColor: 'rgba(255,255,255,0.25)',
  },
  fadeTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 40,
    backgroundColor: 'rgba(255,255,255,0.55)',
  },
  fadeBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 40,
    backgroundColor: 'rgba(255,255,255,0.55)',
  },
  resultBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: theme.spacing.md,
    backgroundColor: '#FEF3C7',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.full,
  },
  resultEmoji: {
    fontSize: 24,
  },
  resultText: {
    fontFamily: theme.fonts.bold,
    fontSize: 16,
    color: theme.colors.text,
  },
  errorText: {
    fontFamily: theme.fonts.regular,
    fontSize: 13,
    color: '#DC2626',
    textAlign: 'center',
    marginTop: theme.spacing.md,
  },
  spinButton: {
    marginTop: theme.spacing.lg,
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.full,
    minWidth: 200,
    alignItems: 'center',
    ...theme.shadows.small,
  },
  spinButtonDisabled: {
    opacity: 0.6,
  },
  spinButtonText: {
    fontFamily: theme.fonts.bold,
    fontSize: 17,
    color: 'white',
  },
  meta: {
    fontFamily: theme.fonts.regular,
    fontSize: 13,
    color: theme.colors.subtext,
    marginTop: theme.spacing.sm,
  },
  oddsBox: {
    marginTop: theme.spacing.lg,
    width: '100%',
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
  },
  oddsTitle: {
    fontFamily: theme.fonts.semiBold,
    fontSize: 14,
    color: theme.colors.subtext,
    marginBottom: theme.spacing.xs,
  },
  oddsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 3,
  },
  oddsLabel: {
    fontFamily: theme.fonts.regular,
    fontSize: 13,
    color: theme.colors.text,
  },
  oddsPct: {
    fontFamily: theme.fonts.semiBold,
    fontSize: 13,
    color: theme.colors.subtext,
  },
});
