import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Pet from '@/components/Pet';
import StatusIndicator from '@/components/StatusIndicator';
import { usePet } from '@/context/PetContext';
import { theme } from '@/constants/theme';
import { Bell } from 'lucide-react-native';

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { currentPet } = usePet();
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
        <TouchableOpacity style={styles.notificationButton}>
          <Bell size={24} color={theme.colors.text} />
        </TouchableOpacity>
      </View>

      {/* Pet display area */}
      <View style={styles.petContainer}>
        <Pet 
          type={currentPet.type}
          name={currentPet.name}
          level={currentPet.level}
          animation={petAnimation}
        />
      </View>

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
            {new Date(currentPet.birthday).toLocaleDateString()}
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
  petContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: theme.spacing.lg,
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