import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { usePet } from '@/context/PetContext';
import { theme, toolColors } from '@/constants/theme';
import { Fish, Play, Pause, RotateCcw } from 'lucide-react-native';

const DURATIONS = [5, 15, 25];

export default function FocusTimerScreen() {
  const { addPoints } = usePet();
  const [durationMin, setDurationMin] = useState(15);
  const [secondsLeft, setSecondsLeft] = useState(15 * 60);
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!running) return;
    intervalRef.current = setInterval(() => {
      setSecondsLeft(prev => {
        if (prev <= 1) {
          if (intervalRef.current) clearInterval(intervalRef.current);
          setRunning(false);
          setDone(true);
          addPoints(20);
          if (Platform.OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [running, addPoints]);

  const selectDuration = (min: number) => {
    if (running) return;
    setDurationMin(min);
    setSecondsLeft(min * 60);
    setDone(false);
  };

  const toggle = () => {
    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setDone(false);
    setRunning(r => !r);
  };

  const reset = () => {
    setRunning(false);
    setDone(false);
    setSecondsLeft(durationMin * 60);
  };

  const mins = Math.floor(secondsLeft / 60);
  const secs = secondsLeft % 60;

  return (
    <LinearGradient colors={[toolColors.orange, '#E08A00']} style={styles.container}>
      <View style={styles.iconWrap}>
        <Fish size={32} color="white" />
      </View>
      <Text style={styles.title}>Focus Timer</Text>
      <Text style={styles.subtitle}>Pick a length and stay with one thing.</Text>

      <View style={styles.durationRow}>
        {DURATIONS.map(min => (
          <TouchableOpacity
            key={min}
            style={[styles.durationChip, durationMin === min && styles.durationChipActive]}
            onPress={() => selectDuration(min)}
          >
            <Text style={[styles.durationText, durationMin === min && styles.durationTextActive]}>
              {min}m
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.timerText}>
        {String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}
      </Text>

      {done && <Text style={styles.doneText}>Nice focus! +20 pts</Text>}

      <View style={styles.controlsRow}>
        <TouchableOpacity style={styles.iconButton} onPress={reset}>
          <RotateCcw size={20} color="white" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.primaryButton} onPress={toggle}>
          {running ? <Pause size={20} color={toolColors.orange} /> : <Play size={20} color={toolColors.orange} />}
          <Text style={styles.primaryButtonText}>{running ? 'Pause' : 'Start'}</Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.xl,
  },
  iconWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.lg,
  },
  title: {
    fontFamily: theme.fonts.extraBold,
    fontSize: 24,
    color: 'white',
    marginBottom: theme.spacing.xs,
  },
  subtitle: {
    fontFamily: theme.fonts.regular,
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: theme.spacing.lg,
  },
  durationRow: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.xl,
  },
  durationChip: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.full,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  durationChipActive: {
    backgroundColor: 'white',
  },
  durationText: {
    fontFamily: theme.fonts.bold,
    fontSize: 14,
    color: 'white',
  },
  durationTextActive: {
    color: toolColors.orange,
  },
  timerText: {
    fontFamily: theme.fonts.extraBold,
    fontSize: 56,
    color: 'white',
    marginBottom: theme.spacing.sm,
  },
  doneText: {
    fontFamily: theme.fonts.semiBold,
    fontSize: 15,
    color: 'white',
    marginBottom: theme.spacing.lg,
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    marginTop: theme.spacing.lg,
  },
  iconButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    backgroundColor: 'white',
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.full,
  },
  primaryButtonText: {
    fontFamily: theme.fonts.bold,
    fontSize: 16,
    color: toolColors.orange,
  },
});
