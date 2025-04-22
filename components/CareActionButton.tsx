import React from 'react';
import { TouchableOpacity, Text, StyleSheet, Platform } from 'react-native';
import { CareAction, careActions } from '@/data/petData';
import { Heart, Utensils, Moon, Droplets } from 'lucide-react-native';
import { theme } from '@/constants/theme';
import * as Haptics from 'expo-haptics';

interface CareActionButtonProps {
  action: CareAction;
  onPress: () => void;
  disabled?: boolean;
}

export default function CareActionButton({ 
  action, 
  onPress, 
  disabled = false 
}: CareActionButtonProps) {
  const actionData = careActions[action];

  const handlePress = () => {
    if (disabled) return;
    
    // Trigger haptic feedback on non-web platforms
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    
    onPress();
  };

  const renderIcon = () => {
    switch (action) {
      case 'feed':
        return <Utensils size={24} color="white" />;
      case 'play':
        return <Heart size={24} color="white" />;
      case 'sleep':
        return <Moon size={24} color="white" />;
      case 'clean':
        return <Droplets size={24} color="white" />;
      default:
        return null;
    }
  };

  const getBackgroundColor = () => {
    if (disabled) return theme.colors.lightGray;

    switch (action) {
      case 'feed':
        return theme.colors.hunger;
      case 'play':
        return theme.colors.happiness;
      case 'sleep':
        return theme.colors.energy;
      case 'clean':
        return theme.colors.health;
      default:
        return theme.colors.primary;
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.button,
        { backgroundColor: getBackgroundColor() },
        disabled && styles.disabledButton
      ]}
      onPress={handlePress}
      disabled={disabled}
      activeOpacity={0.8}
    >
      <Text style={styles.icon}>{renderIcon()}</Text>
      <Text style={styles.label}>{actionData.label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    width: 80,
    height: 80,
    margin: theme.spacing.sm,
    ...theme.shadows.small,
  },
  disabledButton: {
    opacity: 0.5,
  },
  icon: {
    marginBottom: theme.spacing.xs,
  },
  label: {
    fontFamily: theme.fonts.semiBold,
    fontSize: 14,
    color: 'white',
    textAlign: 'center',
  },
});