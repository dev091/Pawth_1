import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import PawPattern from '@/components/PawPattern';
import { theme, toolColors, sceneBands } from '@/constants/theme';
import {
  Compass,
  PenLine,
  Wind,
  Fish,
  BookOpen,
  Moon,
  Heart,
  Sun,
  Radio,
  Eye,
  TreePine,
  MessageCircle,
  LucideIcon,
} from 'lucide-react-native';

interface Tile {
  key: string;
  label: string;
  description?: string;
  icon: LucideIcon;
  color: string;
  wide?: boolean;
  disabled?: boolean;
  onPress?: () => void;
}

export default function ToolkitScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const tiles: Tile[] = [
    {
      key: 'journeys',
      label: 'Journeys',
      description: 'Every streak and milestone, all in one place.',
      icon: Compass,
      color: toolColors.purple,
      wide: true,
      onPress: () => router.push('/(tabs)/profile'),
    },
    {
      key: 'reflection',
      label: 'Reflection',
      icon: PenLine,
      color: toolColors.pink,
      onPress: () => router.push('/mood-history'),
    },
    {
      key: 'breathe',
      label: 'Breathe',
      icon: Wind,
      color: toolColors.blue,
      onPress: () => router.push('/calm?mode=breathing'),
    },
    {
      key: 'focus',
      label: 'Focus Timer',
      icon: Fish,
      color: toolColors.orange,
      onPress: () => router.push('/focus-timer'),
    },
    {
      key: 'book',
      label: 'Book of Answers',
      icon: BookOpen,
      color: toolColors.purpleDark,
      onPress: () => router.push('/book-of-answers'),
    },
    {
      key: 'sleep',
      label: 'Sleep Assistant',
      icon: Moon,
      color: toolColors.navy,
      disabled: true,
    },
    {
      key: 'emotion',
      label: 'Emotion Check-in',
      icon: Heart,
      color: toolColors.teal,
      onPress: () => router.push('/(tabs)'),
    },
    {
      key: 'jar',
      label: 'Happy Energy Jar',
      icon: Sun,
      color: toolColors.amber,
      onPress: () => router.push('/happy-jar'),
    },
    {
      key: 'channel',
      label: 'Calm Channel',
      icon: Radio,
      color: toolColors.brown,
      disabled: true,
    },
    {
      key: 'affirmations',
      label: 'Affirmations',
      icon: Sun,
      color: toolColors.blue,
      onPress: () => router.push('/affirmations'),
    },
    {
      key: 'grounding',
      label: '5-4-3-2-1',
      icon: Eye,
      color: toolColors.navy,
      onPress: () => router.push('/calm?mode=grounding'),
    },
    {
      key: 'trails',
      label: 'Nearby Trails',
      icon: TreePine,
      color: toolColors.teal,
      onPress: () => router.push('/trails'),
    },
    {
      key: 'chat',
      label: 'Talk to Pet',
      icon: MessageCircle,
      color: toolColors.pink,
      onPress: () => router.push('/pet-chat'),
    },
  ];

  return (
    <View style={styles.container}>
      <LinearGradient colors={sceneBands.day} style={[styles.hero, { paddingTop: insets.top + theme.spacing.lg }]}>
        <PawPattern color="rgba(255,255,255,0.22)" />
        <Text style={styles.heroTitle}>Complete your{'\n'}Self-Care Journey</Text>
      </LinearGradient>

      <ScrollView style={styles.sheet} contentContainerStyle={styles.grid} showsVerticalScrollIndicator={false}>
        {tiles.map(tile => {
          const Icon = tile.icon;
          return (
            <TouchableOpacity
              key={tile.key}
              style={[
                styles.tile,
                tile.wide && styles.tileWide,
                { backgroundColor: tile.color },
                tile.disabled && styles.tileDisabled,
              ]}
              activeOpacity={tile.disabled ? 1 : 0.85}
              onPress={tile.onPress}
              disabled={tile.disabled || !tile.onPress}
            >
              <Text style={styles.tileLabel}>{tile.label}</Text>
              {tile.description && <Text style={styles.tileDescription}>{tile.description}</Text>}
              {tile.disabled && <Text style={styles.soonBadge}>Coming soon</Text>}
              <View style={styles.tileIconWrap}>
                <Icon size={20} color="rgba(255,255,255,0.85)" />
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#B8B0E8',
  },
  hero: {
    paddingBottom: theme.spacing.xl,
    paddingHorizontal: theme.spacing.lg,
    overflow: 'hidden',
  },
  heroTitle: {
    fontFamily: theme.fonts.extraBold,
    fontSize: 28,
    lineHeight: 34,
    color: '#2A2F6B',
  },
  sheet: {
    flex: 1,
    backgroundColor: '#B8B0E8',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    padding: theme.spacing.md,
    paddingBottom: theme.spacing.xxl,
    gap: theme.spacing.sm,
  },
  tile: {
    width: '48%',
    minHeight: 84,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    justifyContent: 'space-between',
  },
  tileWide: {
    width: '100%',
  },
  tileDisabled: {
    opacity: 0.55,
  },
  tileLabel: {
    fontFamily: theme.fonts.extraBold,
    fontSize: 16,
    color: 'white',
    marginBottom: 4,
  },
  tileDescription: {
    fontFamily: theme.fonts.regular,
    fontSize: 13,
    color: 'rgba(255,255,255,0.85)',
    lineHeight: 18,
    marginBottom: theme.spacing.sm,
  },
  soonBadge: {
    fontFamily: theme.fonts.semiBold,
    fontSize: 11,
    color: 'rgba(255,255,255,0.85)',
  },
  tileIconWrap: {
    alignSelf: 'flex-end',
  },
});
