import React, { useRef, useEffect } from 'react';
import { View, Image, StyleSheet, Animated, Easing, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { PetType, PetMood, petMoods, petTypes, accessoryById, getEvolutionStage } from '@/data/petData';
import { theme } from '@/constants/theme';

// Per-type glow palette for the soft "stage" backdrop behind the pet —
// gives each species its own elite, premium presence.
const glowPalette: Record<PetType, [string, string]> = {
  bird: ['#FFF3D6', '#FFE1A8'],
  cat: ['#F3E6FF', '#E0C8FF'],
  dog: ['#FFE9D6', '#FFD1A8'],
  rabbit: ['#E6FFF3', '#C8FFE0'],
};

interface PetProps {
  type: PetType;
  name: string;
  level: number;
  size?: 'small' | 'medium' | 'large';
  animation?: 'idle' | 'happy' | 'sad' | 'sleeping';
  /** Equipped accessory id — rendered as an overlay on the pet. */
  accessoryId?: string;
  /** Current mood; drives the thought bubble. */
  mood?: PetMood;
  /** Show the thought bubble (only when the pet has something to say). */
  showMoodBubble?: boolean;
  /** Soft circular halo behind the pet. Turn off when it already sits in
   *  an illustrated scene, where a spotlight disc reads as a sticker. */
  showGlow?: boolean;
}

// Accessory overlay layout: position + size as % of the pet image box.
// Tuned for the v2 soft-3D character art (front-facing, centered).
type Pct = `${number}%`;
// Per-accessory overlay placement, tuned against the v2 pet art.
// Positions are percentages of the pet image box. Verified via compositing
// on all four pets: each item sits naturally without covering eyes/mouth.
const accessoryLayout: Record<string, { top: Pct; left: Pct; width: Pct }> = {
  'top-hat': { top: '-29%', left: '27%', width: '45%' },
  'flower-crown': { top: '-12%', left: '27%', width: '45%' },
  'polka-bow': { top: '8%', left: '62%', width: '26%' },
  sunglasses: { top: '30%', left: '12%', width: '76%' },
  'bow-tie': { top: '62%', left: '38%', width: '24%' },
  scarf: { top: '52%', left: '29%', width: '42%' },
  collar: { top: '50%', left: '31%', width: '38%' },
  bandana: { top: '-8%', left: '29%', width: '42%' },
};

export default function Pet({
  type,
  name,
  level,
  size = 'large',
  animation = 'idle',
  accessoryId,
  mood = 'content',
  showMoodBubble = false,
  showGlow = true,
}: PetProps) {
  const petData = petTypes[type];
  const stage = getEvolutionStage(level);
  const bounceAnim = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const bubbleAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    let animationSequence;

    switch (animation) {
      case 'idle':
        // Gentle breathing animation
        animationSequence = Animated.loop(
          Animated.sequence([
            Animated.timing(bounceAnim, {
              toValue: 1,
              duration: 1500,
              easing: Easing.inOut(Easing.sin),
              useNativeDriver: true,
            }),
            Animated.timing(bounceAnim, {
              toValue: 0,
              duration: 1500,
              easing: Easing.inOut(Easing.sin),
              useNativeDriver: true,
            }),
          ])
        );
        break;

      case 'happy':
        // Excited jumping animation
        animationSequence = Animated.loop(
          Animated.sequence([
            Animated.timing(bounceAnim, {
              toValue: 1.1,
              duration: 300,
              easing: Easing.out(Easing.back(1.5)),
              useNativeDriver: true,
            }),
            Animated.timing(bounceAnim, {
              toValue: 0,
              duration: 300,
              easing: Easing.in(Easing.bounce),
              useNativeDriver: true,
            }),
          ])
        );
        break;

      case 'sad':
        // Sad drooping animation
        animationSequence = Animated.loop(
          Animated.sequence([
            Animated.timing(rotateAnim, {
              toValue: -0.03,
              duration: 1000,
              easing: Easing.inOut(Easing.sin),
              useNativeDriver: true,
            }),
            Animated.timing(rotateAnim, {
              toValue: 0.03,
              duration: 1000,
              easing: Easing.inOut(Easing.sin),
              useNativeDriver: true,
            }),
          ])
        );
        break;

      case 'sleeping':
        // Gentle sleeping animation
        animationSequence = Animated.loop(
          Animated.sequence([
            Animated.timing(bounceAnim, {
              toValue: 0.3,
              duration: 2000,
              easing: Easing.inOut(Easing.sin),
              useNativeDriver: true,
            }),
            Animated.timing(bounceAnim, {
              toValue: 0,
              duration: 2000,
              easing: Easing.inOut(Easing.sin),
              useNativeDriver: true,
            }),
          ])
        );
        break;
    }

    if (animationSequence) {
      animationSequence.start();
    }

    return () => {
      if (animationSequence) {
        animationSequence.stop();
      }
    };
  }, [animation, bounceAnim, rotateAnim]);

  // Thought-bubble float loop.
  useEffect(() => {
    if (!showMoodBubble) return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(bubbleAnim, {
          toValue: 1,
          duration: 1200,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(bubbleAnim, {
          toValue: 0,
          duration: 1200,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [showMoodBubble, bubbleAnim]);

  // Calculate styles based on animation type
  const petAnimatedStyle = {
    transform: [
      {
        translateY: bounceAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [0, animation === 'happy' ? -20 : -10],
        }),
      },
      {
        scale: bounceAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [1, animation === 'happy' ? 1.1 : 1.05],
        }),
      },
      {
        rotate: rotateAnim.interpolate({
          inputRange: [-1, 1],
          outputRange: ['-0.1rad', '0.1rad'],
        }),
      },
    ],
  };

  // Size mapping
  const sizeStyles = {
    small: { width: 80, height: 80 },
    medium: { width: 120, height: 120 },
    large: { width: 200, height: 200 },
  };

  const accessory = accessoryId ? accessoryById[accessoryId] : undefined;
  const layout = accessoryId ? accessoryLayout[accessoryId] : undefined;
  const moodInfo = petMoods[mood];
  const bubbleVisible = showMoodBubble && mood !== 'content';

  const glowColors = glowPalette[type];

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.petContainer, petAnimatedStyle]}>
        {size !== 'small' && showGlow && (
          <LinearGradient
            colors={glowColors}
            start={{ x: 0.5, y: 0 }}
            end={{ x: 0.5, y: 1 }}
            style={[
              styles.glow,
              {
                width: sizeStyles[size].width * 1.5,
                height: sizeStyles[size].width * 1.5,
                borderRadius: (sizeStyles[size].width * 1.5) / 2,
              },
            ]}
          />
        )}
        <View style={[styles.imageBox, sizeStyles[size], { transform: [{ scale: stage.scale }] }]}>
          <Image
            source={petData.image}
            style={styles.petImage}
            resizeMode="contain"
          />
          {accessory && layout && (
            <View style={[styles.accessoryBox, { top: layout.top, left: layout.left, width: layout.width }]}>
              {accessory.image ? (
                <Image
                  source={accessory.image}
                  style={styles.accessoryImage}
                  resizeMode="contain"
                />
              ) : (
                <Text style={styles.accessoryEmoji}>{accessory.emoji}</Text>
              )}
            </View>
          )}
        </View>

        {size !== 'small' && (
          <View style={styles.groundShadowWrap} pointerEvents="none">
            <View style={[styles.groundShadow, styles.groundShadowOuter, { width: sizeStyles[size].width * 0.8 }]} />
            <View style={[styles.groundShadow, styles.groundShadowInner, { width: sizeStyles[size].width * 0.5 }]} />
          </View>
        )}

        {bubbleVisible && (
          <Animated.View
            style={[
              styles.moodBubble,
              {
                transform: [
                  {
                    translateY: bubbleAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, -7],
                    }),
                  },
                ],
              },
            ]}
          >
            <Text style={styles.moodEmoji}>{moodInfo.emoji}</Text>
            <Text style={styles.moodText}>{moodInfo.text}</Text>
            <View style={styles.bubbleTail} />
          </Animated.View>
        )}
      </Animated.View>

      {size !== 'small' && (
        <View style={styles.petInfoContainer}>
          <Text style={styles.petName}>{name}</Text>
          <View style={styles.levelBadge}>
            <Text style={styles.levelText}>Lv. {level}</Text>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  petContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageBox: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  glow: {
    position: 'absolute',
    opacity: 0.9,
  },
  groundShadowWrap: {
    position: 'absolute',
    bottom: -4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  groundShadow: {
    position: 'absolute',
    borderRadius: 999,
    transform: [{ scaleX: 1.7 }],
  },
  groundShadowOuter: {
    height: 16,
    backgroundColor: 'rgba(60,45,30,0.06)',
  },
  groundShadowInner: {
    height: 8,
    backgroundColor: 'rgba(60,45,30,0.08)',
  },
  petImage: {
    width: '100%',
    height: '100%',
  },
  accessoryBox: {
    position: 'absolute',
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  accessoryImage: {
    width: '100%',
    height: '100%',
  },
  accessoryEmoji: {
    fontSize: 40,
    textShadowColor: 'rgba(0,0,0,0.15)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 3,
  },
  moodBubble: {
    position: 'absolute',
    top: -54,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.full,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    gap: 6,
    ...theme.shadows.small,
  },
  moodEmoji: {
    fontSize: 20,
  },
  moodText: {
    fontFamily: theme.fonts.semiBold,
    fontSize: 13,
    color: theme.colors.text,
  },
  bubbleTail: {
    position: 'absolute',
    bottom: -5,
    left: '50%',
    marginLeft: -6,
    width: 12,
    height: 12,
    backgroundColor: theme.colors.card,
    transform: [{ rotate: '45deg' }],
  },
  // Name sits on a translucent pill so it stays legible whether the pet
  // is on a light card or inside a dark illustrated scene.
  petInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: theme.spacing.md,
    justifyContent: 'center',
    backgroundColor: 'rgba(28,22,16,0.4)',
    paddingLeft: theme.spacing.md,
    paddingRight: theme.spacing.xs,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.full,
  },
  petName: {
    fontFamily: theme.fonts.extraBold,
    fontSize: 18,
    color: 'white',
    marginRight: theme.spacing.sm,
  },
  levelBadge: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.full,
  },
  levelText: {
    fontFamily: theme.fonts.semiBold,
    fontSize: 14,
    color: 'white',
  },
});
