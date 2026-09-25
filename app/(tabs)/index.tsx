import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Pet from '@/components/Pet';
import StatusIndicator from '@/components/StatusIndicator';
import DailyTasks from '@/components/DailyTasks';
import MoodCheckIn from '@/components/MoodCheckIn';
import { usePet } from '@/context/PetContext';
import { getEvolutionStage, evolutionStages, getPetMood } from '@/data/petData';
import { theme } from '@/constants/theme';
import { Bell, Flame, TreePine, ChevronRight, MessageCircle } from 'lucide-react-native';

// Sky palette per time of day — turns the pet's stage into a little scene
// instead of a plain white card.
const scenePalette: Record<'morning' | 'afternoon' | 'evening' | 'night', [string, string]> = {
  morning: ['#FFF6E0', '#FFE8C2'],
  afternoon: ['#E3F6FF', '#C7ECFF'],
  evening: ['#FFE3D6', '#FFC9C9'],
  night: ['#2A2F5C', '#171A38'],
};

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { currentPet, streak } = usePet();
  const [petAnimation, setPetAnimation] = useState<'idle' | 'happy' | 'sad' | 'sleeping'>('idle');
  const [timeOfDay, setTimeOfDay] = useState<'morning' | 'afternoon' | 'evening' | 'night'>('morning');

  // Set time of day based on current time
  useEffect(() => {
    const updateTimeOfDay = () => {
      const hour = new Date().getHours();
      if (hour >= 5 && hour < 12) {
        setTimeOfDay('morning');
      } else if (hour >= 12 && hour < 17) {
        setTimeOfDay('afternoon');
      } else if (hour >= 17 && hour < 21) {
        setTimeOfDay('evening');
      } else {
        setTimeOfDay('night');
      }
    };

    updateTimeOfDay();
    const interval = setInterval(updateTimeOfDay, 60000);
    return () => clearInterval(interval);
  }, []);

  // Set pet animation based on stats
  useEffect(() => {
    if (!currentPet) return;

    const { happiness, energy } = currentPet.stats;
    
    if (energy < 30) {
      setPetAnimation('sleeping');
    } else if (happiness < 40) {
      setPetAnimation('sad');
    } else if (happiness > 80) {
      setPetAnimation('happy');
    } else {
      setPetAnimation('idle');
    }
  }, [currentPet]);

  // Get greeting based on time of day
  const getGreeting = () => {
    switch (timeOfDay) {
      case 'morning':
        return 'Good Morning!';
      case 'afternoon':
        return 'Good Afternoon!';
      case 'evening':
        return 'Good Evening!';
      case 'night':
        return 'Good Night!';
    }
  };

  // Early return if no current pet
  if (!currentPet) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <Text style={styles.emptyText}>
          You don't have any pets yet. Go to the Adopt tab to get started!
        </Text>
      </View>
    );
  }

  const stage = getEvolutionStage(currentPet.level);
  const nextStage = evolutionStages.find(s => s.minLevel > currentPet.level);

  return (
    <ScrollView
      style={[styles.container, { paddingTop: insets.top }]}
      contentContainerStyle={styles.contentContainer}
    >
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>{getGreeting()}</Text>
          <Text style={styles.subtitle}>
            {timeOfDay === 'morning' || timeOfDay === 'afternoon' 
              ? "It's a beautiful day to play with your pet!" 
              : "Time to relax with your furry friend!"}
          </Text>
        </View>
        <View style={styles.headerRight}>
          {streak > 0 && (
            <View style={styles.streakPill}>
              <Flame size={16} color="#FF6B35" />
              <Text style={styles.streakText}>{streak}</Text>
            </View>
          )}
          <TouchableOpacity style={styles.notificationButton}>
            <Bell size={24} color={theme.colors.text} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Pet display area — a cozy little scene, Finch-style */}
      <LinearGradient
        colors={scenePalette[timeOfDay]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={styles.sceneCard}
      >
        {timeOfDay === 'night' ? (
          <>
            <Text style={[styles.decor, styles.starTopLeft]}>✨</Text>
            <Text style={[styles.decor, styles.starTopRight]}>⭐</Text>
            <Text style={[styles.decor, styles.moonIcon]}>🌙</Text>
          </>
        ) : (
          <>
            <Text style={[styles.decor, styles.cloudLeft]}>☁️</Text>
            <Text style={[styles.decor, styles.cloudRight]}>☁️</Text>
            {timeOfDay !== 'evening' && <Text style={[styles.decor, styles.sunIcon]}>☀️</Text>}
          </>
        )}

        <View style={styles.petContainer}>
          <Pet
            type={currentPet.type}
            name={currentPet.name}
            level={currentPet.level}
            animation={petAnimation}
            accessoryId={currentPet.activeCustomization}
            mood={getPetMood(currentPet.stats)}
            showMoodBubble
          />
          <View style={[styles.stageBadge, timeOfDay === 'night' && styles.stageBadgeNight]}>
            <Text style={styles.stageEmoji}>{stage.emoji}</Text>
            <Text style={[styles.stageText, timeOfDay === 'night' && styles.stageTextNight]}>
              {stage.name}
            </Text>
          </View>
          {nextStage && (
            <Text style={[styles.nextStageText, timeOfDay === 'night' && styles.nextStageTextNight]}>
              Evolves to {nextStage.name} {nextStage.emoji} at Lv. {nextStage.minLevel}
            </Text>
          )}
        </View>

        <TouchableOpacity
          style={styles.chatFab}
          activeOpacity={0.85}
          onPress={() => router.push('/pet-chat')}
        >
          <MessageCircle size={20} color={theme.colors.primary} />
        </TouchableOpacity>
      </LinearGradient>

      {/* Mood check-in */}
      <MoodCheckIn />

      {/* Nearby Trails entry */}
      <TouchableOpacity
        style={styles.trailsCard}
        activeOpacity={0.85}
        onPress={() => router.push('/trails')}
      >
        <View style={styles.trailsIconWrap}>
          <TreePine size={22} color={theme.colors.primary} />
        </View>
        <View style={styles.trailsTextWrap}>
          <Text style={styles.trailsTitle}>Nearby Trails</Text>
          <Text style={styles.trailsSubtitle}>Take your pet for a real walk outside</Text>
        </View>
        <ChevronRight size={20} color={theme.colors.gray} />
      </TouchableOpacity>

      {/* Pet status indicators */}
      <View style={styles.statusContainer}>
        <StatusIndicator 
          type="happiness" 
          value={currentPet.stats.happiness} 
        />
        <StatusIndicator 
          type="hunger" 
          value={currentPet.stats.hunger} 
        />
        <StatusIndicator 
          type="energy" 
          value={currentPet.stats.energy} 
        />
        <StatusIndicator 
          type="health" 
          value={currentPet.stats.health} 
        />
      </View>

      {/* Daily tasks */}
      <DailyTasks />

      {/* Pet info card */}
      <View style={styles.infoCard}>
        <Text style={styles.infoCardTitle}>Pet Details</Text>
        
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Name:</Text>
          <Text style={styles.infoValue}>{currentPet.name}</Text>
        </View>
        
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Type:</Text>
          <Text style={styles.infoValue}>
            {currentPet.type.charAt(0).toUpperCase() + currentPet.type.slice(1)}
          </Text>
        </View>
        
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Level:</Text>
          <Text style={styles.infoValue}>{currentPet.level}</Text>
        </View>
        
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Experience:</Text>
          <View style={styles.expBarContainer}>
            <View 
              style={[
                styles.expBar, 
                { width: `${(currentPet.experience % 100)}%` }
              ]} 
            />
          </View>
          <Text style={styles.expText}>
            {currentPet.experience % 100}/100
          </Text>
        </View>
        
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Birthday:</Text>
          <Text style={styles.infoValue}>
            {new Date(currentPet.createdAt).toLocaleDateString()}
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  contentContainer: {
    padding: theme.spacing.md,
    paddingBottom: theme.spacing.xl,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.lg,
  },
  greeting: {
    fontFamily: theme.fonts.bold,
    fontSize: 24,
    color: theme.colors.text,
  },
  subtitle: {
    fontFamily: theme.fonts.regular,
    fontSize: 16,
    color: theme.colors.subtext,
    marginTop: theme.spacing.xs,
  },
  notificationButton: {
    padding: theme.spacing.sm,
    backgroundColor: 'white',
    borderRadius: theme.borderRadius.full,
    ...theme.shadows.small,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  streakPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'white',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.full,
    ...theme.shadows.small,
  },
  streakText: {
    fontFamily: theme.fonts.bold,
    fontSize: 16,
    color: theme.colors.text,
  },
  stageBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'white',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.full,
    marginTop: theme.spacing.sm,
    ...theme.shadows.small,
  },
  stageEmoji: {
    fontSize: 18,
  },
  stageText: {
    fontFamily: theme.fonts.bold,
    fontSize: 16,
    color: theme.colors.primary,
  },
  nextStageText: {
    fontFamily: theme.fonts.regular,
    fontSize: 13,
    color: theme.colors.subtext,
    marginTop: theme.spacing.xs,
  },
  sceneCard: {
    borderRadius: theme.borderRadius.xl,
    paddingVertical: theme.spacing.xl,
    paddingHorizontal: theme.spacing.md,
    marginBottom: theme.spacing.lg,
    overflow: 'hidden',
    position: 'relative',
    ...theme.shadows.medium,
  },
  petContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  decor: {
    position: 'absolute',
    fontSize: 22,
    opacity: 0.9,
  },
  cloudLeft: {
    top: 16,
    left: 20,
    fontSize: 26,
  },
  cloudRight: {
    top: 36,
    right: 24,
    fontSize: 20,
  },
  sunIcon: {
    top: 14,
    right: 20,
    fontSize: 24,
  },
  starTopLeft: {
    top: 18,
    left: 28,
    fontSize: 16,
  },
  starTopRight: {
    top: 40,
    right: 40,
    fontSize: 14,
  },
  moonIcon: {
    top: 16,
    right: 22,
    fontSize: 26,
  },
  chatFab: {
    position: 'absolute',
    bottom: theme.spacing.md,
    right: theme.spacing.md,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
    ...theme.shadows.small,
  },
  stageBadgeNight: {
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  stageTextNight: {
    color: '#FFE8C2',
  },
  nextStageTextNight: {
    color: 'rgba(255,255,255,0.75)',
  },
  trailsCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.lg,
    ...theme.shadows.small,
  },
  trailsIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#EAFBF9',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.md,
  },
  trailsTextWrap: {
    flex: 1,
  },
  trailsTitle: {
    fontFamily: theme.fonts.bold,
    fontSize: 15,
    color: theme.colors.text,
  },
  trailsSubtitle: {
    fontFamily: theme.fonts.regular,
    fontSize: 12,
    color: theme.colors.subtext,
    marginTop: 2,
  },
  statusContainer: {
    backgroundColor: 'white',
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.lg,
    ...theme.shadows.small,
  },
  infoCard: {
    backgroundColor: 'white',
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    ...theme.shadows.small,
  },
  infoCardTitle: {
    fontFamily: theme.fonts.bold,
    fontSize: 18,
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  infoLabel: {
    fontFamily: theme.fonts.semiBold,
    fontSize: 16,
    color: theme.colors.subtext,
    width: 100,
  },
  infoValue: {
    fontFamily: theme.fonts.regular,
    fontSize: 16,
    color: theme.colors.text,
    flex: 1,
  },
  expBarContainer: {
    flex: 1,
    height: 10,
    backgroundColor: theme.colors.lightGray,
    borderRadius: theme.borderRadius.full,
    overflow: 'hidden',
    marginRight: theme.spacing.sm,
  },
  expBar: {
    height: '100%',
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.full,
  },
  expText: {
    fontFamily: theme.fonts.semiBold,
    fontSize: 14,
    color: theme.colors.primary,
  },
  emptyText: {
    fontFamily: theme.fonts.regular,
    fontSize: 16,
    color: theme.colors.subtext,
    textAlign: 'center',
    marginTop: 100,
    padding: theme.spacing.lg,
  },
});