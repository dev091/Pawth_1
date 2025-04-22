import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { theme } from '@/constants/theme';

type StatusType = 'happiness' | 'hunger' | 'energy' | 'health';

interface StatusIndicatorProps {
  type: StatusType;
  value: number;
  showLabel?: boolean;
}

export default function StatusIndicator({ type, value, showLabel = true }: StatusIndicatorProps) {
  const getStatusInfo = (type: StatusType) => {
    switch (type) {
      case 'happiness':
        return { 
          color: theme.colors.happiness, 
          label: 'Happiness',
          icon: '😊' 
        };
      case 'hunger':
        return { 
          color: theme.colors.hunger, 
          label: 'Hunger',
          icon: '🍔' 
        };
      case 'energy':
        return { 
          color: theme.colors.energy, 
          label: 'Energy',
          icon: '⚡' 
        };
      case 'health':
        return { 
          color: theme.colors.health, 
          label: 'Health',
          icon: '❤️' 
        };
      default:
        return { 
          color: theme.colors.gray, 
          label: 'Status',
          icon: '📊' 
        };
    }
  };

  const { color, label, icon } = getStatusInfo(type);

  // Determine appropriate color based on value level
  const getValueColor = () => {
    if (value <= 20) return theme.colors.error;
    if (value <= 50) return theme.colors.warning;
    return color;
  };

  return (
    <View style={styles.container}>
      {showLabel && (
        <View style={styles.labelContainer}>
          <Text style={styles.icon}>{icon}</Text>
          <Text style={styles.label}>{label}</Text>
        </View>
      )}
      <View style={styles.barContainer}>
        <View 
          style={[
            styles.valueBar, 
            { width: `${value}%`, backgroundColor: getValueColor() }
          ]} 
        />
      </View>
      <Text style={[styles.valueText, { color: getValueColor() }]}>
        {value}%
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: theme.spacing.sm,
    width: '100%',
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.xs,
  },
  icon: {
    fontSize: 16,
    marginRight: theme.spacing.xs,
  },
  label: {
    fontFamily: theme.fonts.semiBold,
    fontSize: 14,
    color: theme.colors.subtext,
  },
  barContainer: {
    height: 12,
    backgroundColor: theme.colors.lightGray,
    borderRadius: theme.borderRadius.full,
    overflow: 'hidden',
  },
  valueBar: {
    height: '100%',
    borderRadius: theme.borderRadius.full,
  },
  valueText: {
    fontFamily: theme.fonts.semiBold,
    fontSize: 12,
    alignSelf: 'flex-end',
    marginTop: theme.spacing.xs,
  },
});