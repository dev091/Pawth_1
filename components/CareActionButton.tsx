import React from 'react';
import { TouchableOpacity, Text, StyleSheet, Platform, View } from 'react-native';
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
  disabled = false,
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
        return <Utensils size={20} color="white" />;
      case 'play':
        return <Heart size={20} color="white" />;
      case 'sleep':
        return <Moon size={20} color="white" />;
      case 'clean':
        return <Droplets size={20} color="white" />;
      default:
        return null;
    }
  };

  const getAccentColor = () => {
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

  const accent = getAccentColor();

  return (
    <TouchableOpacity
      style={[
        styles.button,
        { backgroundColor: `${accent}1F` },
        disabled && styles.disabledButton,
      ]}
      onPress={handlePress}
      disabled={disabled}
      activeOpacity={0.75}
    >
      <View style={[styles.iconCircle, { backgroundColor: disabled ? theme.colors.gray : accent }]}>
        {renderIcon()}
      </View>
      <Text style={[styles.label, { color: disabled ? theme.colors.gray : theme.colors.text }]}>
        {actionData.label}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    gap: theme.spacing.xs,
  },
  disabledButton: {
    opacity: 0.55,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontFamily: theme.fonts.semiBold,
    fontSize: 13,
    textAlign: 'center',
  },
});
