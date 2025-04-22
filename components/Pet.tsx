import React, { useRef, useEffect } from 'react';
import { View, Image, StyleSheet, Animated, Easing, Text } from 'react-native';
import { PetType } from '@/data/petData';
import { petTypes } from '@/data/petData';
import { theme } from '@/constants/theme';

interface PetProps {
  type: PetType;
  name: string;
  level: number;
  size?: 'small' | 'medium' | 'large';
  animation?: 'idle' | 'happy' | 'sad' | 'sleeping';
}

export default function Pet({ 
  type, 
  name, 
  level, 
  size = 'large', 
  animation = 'idle' 
}: PetProps) {
  const petData = petTypes[type];
  const bounceAnim = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

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

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.petContainer, petAnimatedStyle]}>
        <Image
          source={{ uri: petData.imageUrl }}
          style={[styles.petImage, sizeStyles[size]]}
          resizeMode="contain"
        />
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
  petImage: {
    width: 200,
    height: 200,
  },
  petInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: theme.spacing.md,
    justifyContent: 'center',
  },
  petName: {
    fontFamily: theme.fonts.bold,
    fontSize: 20,
    color: theme.colors.text,
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