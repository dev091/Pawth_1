import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Animated,
  Easing,
  Platform,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { theme } from '@/constants/theme';
import { usePet } from '@/context/PetContext';

const CONFETTI_COLORS = ['#FF6B6B', '#FFD93D', '#6BCB77', '#4D96FF', '#FF9F45', '#B983FF'];

export default function EvolutionModal() {
  const { evolutionCelebration, dismissEvolution } = usePet();
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const confetti = useRef(
    CONFETTI_COLORS.map((color, i) => ({
      color,
      anim: new Animated.Value(0),
      x: (i - 2.5) * 46,
      delay: i * 90,
    }))
  ).current;

  useEffect(() => {
    if (!evolutionCelebration) return;
    scaleAnim.setValue(0);
    confetti.forEach(c => c.anim.setValue(0));
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 6,
      tension: 90,
      useNativeDriver: true,
    }).start();
    confetti.forEach(c => {
      Animated.timing(c.anim, {
        toValue: 1,
        duration: 900,
        delay: c.delay,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }).start();
    });
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  }, [evolutionCelebration, scaleAnim, confetti]);

  if (!evolutionCelebration) return null;
  const { petName, stage } = evolutionCelebration;

  return (
    <Modal transparent visible animationType="fade" onRequestClose={dismissEvolution}>
      <View style={styles.backdrop}>
        {/* Confetti burst */}
        {confetti.map((c, i) => (
          <Animated.View
            key={i}
            style={[
              styles.confetti,
              {
                backgroundColor: c.color,
                marginLeft: c.x,
                opacity: c.anim.interpolate({
                  inputRange: [0, 0.7, 1],
                  outputRange: [1, 1, 0],
                }),
                transform: [
                  {
                    translateY: c.anim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [-40, 220],
                    }),
                  },
                  {
                    rotate: c.anim.interpolate({
                      inputRange: [0, 1],
                      outputRange: ['0deg', '360deg'],
                    }),
                  },
                ],
              },
            ]}
          />
        ))}

        <Animated.View
          style={[styles.card, { transform: [{ scale: scaleAnim }] }]}
        >
          <Text style={styles.kicker}>✨ EVOLUTION ✨</Text>
          <Text style={styles.stageEmoji}>{stage.emoji}</Text>
          <Text style={styles.title}>{petName} evolved!</Text>
          <Text style={styles.stageName}>
            Now a <Text style={styles.stageNameBold}>{stage.name}</Text>
          </Text>
          <Text style={styles.flavor}>
            Your bond grew stronger — {petName} is bigger, brighter, and ready for new adventures.
          </Text>
          <TouchableOpacity style={styles.button} onPress={dismissEvolution}>
            <Text style={styles.buttonText}>Awesome!</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.xl,
  },
  confetti: {
    position: 'absolute',
    top: '30%',
    left: '50%',
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  card: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.xl,
    alignItems: 'center',
    width: '100%',
    maxWidth: 340,
    ...theme.shadows.small,
  },
  kicker: {
    fontFamily: theme.fonts.bold,
    fontSize: 14,
    color: theme.colors.primary,
    letterSpacing: 2,
    marginBottom: theme.spacing.sm,
  },
  stageEmoji: {
    fontSize: 84,
    marginVertical: theme.spacing.sm,
  },
  title: {
    fontFamily: theme.fonts.bold,
    fontSize: 26,
    color: theme.colors.text,
    textAlign: 'center',
  },
  stageName: {
    fontFamily: theme.fonts.regular,
    fontSize: 17,
    color: theme.colors.subtext,
    marginTop: theme.spacing.xs,
  },
  stageNameBold: {
    fontFamily: theme.fonts.bold,
    color: theme.colors.primary,
  },
  flavor: {
    fontFamily: theme.fonts.regular,
    fontSize: 14,
    color: theme.colors.subtext,
    textAlign: 'center',
    lineHeight: 21,
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },
  button: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.full,
    minWidth: 180,
    alignItems: 'center',
  },
  buttonText: {
    fontFamily: theme.fonts.bold,
    fontSize: 17,
    color: 'white',
  },
});
