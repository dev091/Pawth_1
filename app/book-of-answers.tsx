import React, { useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { magicAnswers } from '@/data/petData';
import { theme, toolColors } from '@/constants/theme';
import { BookOpen } from 'lucide-react-native';

export default function BookOfAnswersScreen() {
  const [answer, setAnswer] = useState<string | null>(null);
  const flip = useRef(new Animated.Value(0)).current;

  const ask = () => {
    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    flip.setValue(0);
    Animated.timing(flip, { toValue: 1, duration: 350, useNativeDriver: true }).start();
    setAnswer(magicAnswers[Math.floor(Math.random() * magicAnswers.length)]);
  };

  const scale = flip.interpolate({ inputRange: [0, 0.5, 1], outputRange: [1, 0.85, 1] });

  return (
    <LinearGradient colors={[toolColors.purple, toolColors.purpleDark]} style={styles.container}>
      <View style={styles.iconWrap}>
        <BookOpen size={32} color="white" />
      </View>
      <Text style={styles.title}>Book of Answers</Text>
      <Text style={styles.subtitle}>Ask a yes/no question in your mind, then open the book.</Text>

      <Animated.View style={[styles.card, { transform: [{ scale }] }]}>
        <Text style={styles.answerText}>{answer ?? 'Tap below when you’re ready'}</Text>
      </Animated.View>

      <TouchableOpacity style={styles.button} onPress={ask}>
        <Text style={styles.buttonText}>{answer ? 'Ask again' : 'Open the Book'}</Text>
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
  title: {
    fontFamily: theme.fonts.extraBold,
    fontSize: 24,
    color: 'white',
    marginBottom: theme.spacing.xs,
  },
  subtitle: {
    fontFamily: theme.fonts.regular,
    fontSize: 14,
    color: 'rgba(255,255,255,0.75)',
    textAlign: 'center',
    marginBottom: theme.spacing.xl,
    paddingHorizontal: theme.spacing.md,
  },
  card: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.xl,
    marginBottom: theme.spacing.xl,
    minHeight: 120,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  answerText: {
    fontFamily: theme.fonts.bold,
    fontSize: 20,
    color: 'white',
    textAlign: 'center',
    lineHeight: 28,
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
    color: toolColors.purple,
  },
});
