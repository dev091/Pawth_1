import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { usePet } from '@/context/PetContext';
import { affirmations } from '@/data/petData';
import { theme, toolColors } from '@/constants/theme';
import { Sun } from 'lucide-react-native';

function pickAffirmation(exclude?: string): string {
  let next = affirmations[Math.floor(Math.random() * affirmations.length)];
  if (affirmations.length > 1) {
    while (next === exclude) {
      next = affirmations[Math.floor(Math.random() * affirmations.length)];
    }
  }
  return next;
}

export default function AffirmationsScreen() {
  const { recordAffirmationView } = usePet();
  const [current, setCurrent] = useState(() => pickAffirmation());
  const [viewedOnce, setViewedOnce] = useState(false);

  const next = () => {
    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setCurrent(prev => pickAffirmation(prev));
    if (!viewedOnce) {
      recordAffirmationView();
      setViewedOnce(true);
    }
  };

  return (
    <LinearGradient colors={[toolColors.blue, '#3F8FC4']} style={styles.container}>
      <View style={styles.iconWrap}>
        <Sun size={32} color="white" />
      </View>
      <Text style={styles.eyebrow}>TODAY'S AFFIRMATION</Text>
      <View style={styles.card}>
        <Text style={styles.affirmationText}>{current}</Text>
      </View>
      <TouchableOpacity style={styles.button} onPress={next}>
        <Text style={styles.buttonText}>Another one</Text>
      </TouchableOpacity>
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
  eyebrow: {
    fontFamily: theme.fonts.bold,
    fontSize: 12,
    letterSpacing: 2,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: theme.spacing.lg,
  },
  card: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.xl,
    marginBottom: theme.spacing.xl,
    minHeight: 140,
    alignItems: 'center',
    justifyContent: 'center',
  },
  affirmationText: {
    fontFamily: theme.fonts.extraBold,
    fontSize: 24,
    color: 'white',
    textAlign: 'center',
    lineHeight: 32,
  },
  button: {
    backgroundColor: 'white',
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.full,
  },
  buttonText: {
    fontFamily: theme.fonts.bold,
    fontSize: 16,
    color: toolColors.blue,
  },
});
