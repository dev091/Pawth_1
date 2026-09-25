import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Easing, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { usePet } from '@/context/PetContext';
import { theme } from '@/constants/theme';
import { Wind, Eye, X } from 'lucide-react-native';

type Mode = 'menu' | 'breathing' | 'grounding' | 'done';

// Box breathing (used by Rootd/Headspace-style tools): 4s in, 4s hold,
// 4s out, 4s hold. Evidence-based, easy to follow without instructions.
const PHASES: { label: string; duration: number; scale: number }[] = [
  { label: 'Breathe In', duration: 4000, scale: 1.4 },
  { label: 'Hold', duration: 4000, scale: 1.4 },
  { label: 'Breathe Out', duration: 4000, scale: 0.8 },
  { label: 'Hold', duration: 4000, scale: 0.8 },
];

const GROUNDING_STEPS = [
  { count: 5, sense: 'things you can see', emoji: '👀' },
  { count: 4, sense: 'things you can touch', emoji: '✋' },
  { count: 3, sense: 'things you can hear', emoji: '👂' },
  { count: 2, sense: 'things you can smell', emoji: '👃' },
  { count: 1, sense: 'thing you can taste', emoji: '👅' },
];

export default function CalmScreen() {
  const params = useLocalSearchParams<{ mode?: string }>();
  const initialMode: Mode =
    params.mode === 'breathing' || params.mode === 'grounding' ? params.mode : 'menu';
  const [mode, setMode] = useState<Mode>(initialMode);
  const [reward, setReward] = useState<{ xp: number; points: number } | null>(null);
  const { completeCalmSession } = usePet();

  const finish = (kind: 'breathing' | 'grounding') => {
    setReward(completeCalmSession(kind));
    setMode('done');
  };

  return (
    <LinearGradient colors={['#1B2A4A', '#0E1830']} style={styles.container}>
      {mode === 'menu' && <Menu onPick={setMode} />}
      {mode === 'breathing' && (
        <BreathingExercise onExit={() => setMode('menu')} onComplete={() => finish('breathing')} />
      )}
      {mode === 'grounding' && (
        <GroundingExercise onExit={() => setMode('menu')} onComplete={() => finish('grounding')} />
      )}
      {mode === 'done' && reward && (
        <DoneScreen reward={reward} onClose={() => setMode('menu')} />
      )}
    </LinearGradient>
  );
}

function Menu({ onPick }: { onPick: (m: Mode) => void }) {
  const router = useRouter();
  return (
    <View style={styles.menu}>
      <TouchableOpacity style={styles.exitButton} onPress={() => router.back()}>
        <X size={22} color="rgba(255,255,255,0.7)" />
      </TouchableOpacity>
      <Text style={styles.menuEyebrow}>CALM CORNER</Text>
      <Text style={styles.menuTitle}>Take a moment for yourself</Text>
      <Text style={styles.menuSubtitle}>
        A couple of minutes of calm — your pet feels it too.
      </Text>

      <TouchableOpacity style={styles.optionCard} onPress={() => onPick('breathing')} activeOpacity={0.85}>
        <View style={[styles.optionIcon, { backgroundColor: 'rgba(111,184,222,0.25)' }]}>
          <Wind size={24} color="#9FD3EE" />
        </View>
        <View style={styles.optionText}>
          <Text style={styles.optionTitle}>Guided Breathing</Text>
          <Text style={styles.optionDesc}>A slow, guided breathing cycle to settle your body.</Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity style={styles.optionCard} onPress={() => onPick('grounding')} activeOpacity={0.85}>
        <View style={[styles.optionIcon, { backgroundColor: 'rgba(126,214,167,0.25)' }]}>
          <Eye size={24} color="#9FEBC2" />
        </View>
        <View style={styles.optionText}>
          <Text style={styles.optionTitle}>5-4-3-2-1 Grounding</Text>
          <Text style={styles.optionDesc}>Use your senses to gently return to the present.</Text>
        </View>
      </TouchableOpacity>
    </View>
  );
}

function BreathingExercise({ onExit, onComplete }: { onExit: () => void; onComplete: () => void }) {
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [cycles, setCycles] = useState(0);
  const scale = useRef(new Animated.Value(0.8)).current;
  const TOTAL_CYCLES = 3;

  useEffect(() => {
    const phase = PHASES[phaseIndex];
    Animated.timing(scale, {
      toValue: phase.scale,
      duration: phase.duration,
      easing: Easing.inOut(Easing.sin),
      useNativeDriver: true,
    }).start();

    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    const timer = setTimeout(() => {
      const next = phaseIndex + 1;
      if (next >= PHASES.length) {
        if (cycles + 1 >= TOTAL_CYCLES) {
          onComplete();
          return;
        }
        setCycles(c => c + 1);
        setPhaseIndex(0);
      } else {
        setPhaseIndex(next);
      }
    }, phase.duration);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phaseIndex, cycles]);

  return (
    <View style={styles.exerciseContainer}>
      <TouchableOpacity style={styles.exitButton} onPress={onExit}>
        <X size={22} color="rgba(255,255,255,0.7)" />
      </TouchableOpacity>

      <View style={styles.orbWrap}>
        <Animated.View style={[styles.orb, { transform: [{ scale }] }]} />
        <Text style={styles.phaseText}>{PHASES[phaseIndex].label}</Text>
      </View>

      <Text style={styles.cycleText}>Cycle {cycles + 1} of {TOTAL_CYCLES}</Text>
    </View>
  );
}

function GroundingExercise({ onExit, onComplete }: { onExit: () => void; onComplete: () => void }) {
  const [stepIndex, setStepIndex] = useState(0);
  const step = GROUNDING_STEPS[stepIndex];

  const next = () => {
    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (stepIndex + 1 >= GROUNDING_STEPS.length) {
      onComplete();
    } else {
      setStepIndex(stepIndex + 1);
    }
  };

  return (
    <View style={styles.exerciseContainer}>
      <TouchableOpacity style={styles.exitButton} onPress={onExit}>
        <X size={22} color="rgba(255,255,255,0.7)" />
      </TouchableOpacity>

      <Text style={styles.groundingEmoji}>{step.emoji}</Text>
      <Text style={styles.groundingCount}>{step.count}</Text>
      <Text style={styles.groundingLabel}>{step.sense}</Text>
      <Text style={styles.groundingHint}>Take your time noticing each one.</Text>

      <TouchableOpacity style={styles.primaryButton} onPress={next}>
        <Text style={styles.primaryButtonText}>
          {stepIndex + 1 >= GROUNDING_STEPS.length ? 'Finish' : "I've noticed them"}
        </Text>
      </TouchableOpacity>

      <View style={styles.dotsRow}>
        {GROUNDING_STEPS.map((_, i) => (
          <View key={i} style={[styles.dot, i <= stepIndex && styles.dotActive]} />
        ))}
      </View>
    </View>
  );
}

function DoneScreen({ reward, onClose }: { reward: { xp: number; points: number }; onClose: () => void }) {
  return (
    <View style={styles.exerciseContainer}>
      <Text style={styles.doneEmoji}>🌙</Text>
      <Text style={styles.doneTitle}>Well done</Text>
      <Text style={styles.doneSubtitle}>You showed up for yourself today.</Text>
      <View style={styles.rewardRow}>
        <Text style={styles.rewardChip}>+{reward.xp} XP</Text>
        <Text style={styles.rewardChip}>+{reward.points} pts</Text>
      </View>
      <TouchableOpacity style={styles.primaryButton} onPress={onClose}>
        <Text style={styles.primaryButtonText}>Done</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  menu: {
    flex: 1,
    padding: theme.spacing.lg,
    paddingTop: theme.spacing.xxl,
  },
  menuEyebrow: {
    fontFamily: theme.fonts.bold,
    fontSize: 12,
    letterSpacing: 2,
    color: '#9FD3EE',
    marginBottom: theme.spacing.sm,
  },
  menuTitle: {
    fontFamily: theme.fonts.bold,
    fontSize: 28,
    color: 'white',
    marginBottom: theme.spacing.sm,
  },
  menuSubtitle: {
    fontFamily: theme.fonts.regular,
    fontSize: 15,
    color: 'rgba(255,255,255,0.65)',
    marginBottom: theme.spacing.xl,
    lineHeight: 22,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  optionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionText: {
    flex: 1,
  },
  optionTitle: {
    fontFamily: theme.fonts.bold,
    fontSize: 16,
    color: 'white',
    marginBottom: 2,
  },
  optionDesc: {
    fontFamily: theme.fonts.regular,
    fontSize: 13,
    color: 'rgba(255,255,255,0.6)',
    lineHeight: 18,
  },
  exerciseContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.xl,
  },
  exitButton: {
    position: 'absolute',
    top: theme.spacing.xl,
    right: theme.spacing.lg,
    padding: theme.spacing.sm,
  },
  orbWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.xl,
  },
  orb: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(159,211,238,0.35)',
    borderWidth: 2,
    borderColor: 'rgba(159,211,238,0.6)',
  },
  phaseText: {
    position: 'absolute',
    fontFamily: theme.fonts.semiBold,
    fontSize: 18,
    color: 'white',
  },
  cycleText: {
    fontFamily: theme.fonts.regular,
    fontSize: 14,
    color: 'rgba(255,255,255,0.5)',
  },
  groundingEmoji: {
    fontSize: 56,
    marginBottom: theme.spacing.md,
  },
  groundingCount: {
    fontFamily: theme.fonts.bold,
    fontSize: 56,
    color: 'white',
  },
  groundingLabel: {
    fontFamily: theme.fonts.semiBold,
    fontSize: 20,
    color: 'white',
    marginBottom: theme.spacing.sm,
    textAlign: 'center',
  },
  groundingHint: {
    fontFamily: theme.fonts.regular,
    fontSize: 14,
    color: 'rgba(255,255,255,0.55)',
    marginBottom: theme.spacing.xl,
  },
  dotsRow: {
    flexDirection: 'row',
    gap: theme.spacing.xs,
    marginTop: theme.spacing.lg,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.25)',
  },
  dotActive: {
    backgroundColor: '#9FEBC2',
  },
  doneEmoji: {
    fontSize: 56,
    marginBottom: theme.spacing.md,
  },
  doneTitle: {
    fontFamily: theme.fonts.bold,
    fontSize: 26,
    color: 'white',
    marginBottom: theme.spacing.xs,
  },
  doneSubtitle: {
    fontFamily: theme.fonts.regular,
    fontSize: 15,
    color: 'rgba(255,255,255,0.65)',
    marginBottom: theme.spacing.lg,
  },
  rewardRow: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.xl,
  },
  rewardChip: {
    fontFamily: theme.fonts.semiBold,
    fontSize: 15,
    color: 'white',
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.full,
  },
  primaryButton: {
    backgroundColor: 'white',
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.full,
  },
  primaryButtonText: {
    fontFamily: theme.fonts.bold,
    fontSize: 16,
    color: '#1B2A4A',
  },
});
