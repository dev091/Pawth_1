import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity,
  Animated,
  Platform,
  Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { theme } from '@/constants/theme';
import Pet from '@/components/Pet';
import CareActionButton from '@/components/CareActionButton';
import { usePet } from '@/context/PetContext';
import { CareAction, careActions } from '@/data/petData';
import StatusIndicator from '@/components/StatusIndicator';
import * as Haptics from 'expo-haptics';

export default function CareScreen() {
  const insets = useSafeAreaInsets();
  const { currentPet, performCareAction } = usePet();
  const [activeFeedback, setActiveFeedback] = useState<{
    action: CareAction;
    timestamp: number;
  } | null>(null);
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.5)).current;
  
  // Animation and feedback logic
  useEffect(() => {
    if (activeFeedback) {
      // Start animation
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 8,
          useNativeDriver: true,
        })
      ]).start();
      
      // Clear feedback after 2 seconds
      const timer = setTimeout(() => {
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnim, {
            toValue: 0.5,
            duration: 300,
            useNativeDriver: true,
          })
        ]).start(() => {
          setActiveFeedback(null);
        });
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [activeFeedback, fadeAnim, scaleAnim]);

  const handleCareAction = (action: CareAction) => {
    if (!currentPet) return;
    
    performCareAction(action);
    
    // Set active feedback
    setActiveFeedback({
      action,
      timestamp: Date.now(),
    });
    
    // Haptic feedback on non-web platforms
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
  };

  // Helper function to get formatted timestamp
  const getActionTimeInfo = () => {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const formattedHours = hours % 12 || 12;
    const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;
    
    return `Today at ${formattedHours}:${formattedMinutes} ${ampm}`;
  };

  // Get feedback text based on action
  const getFeedbackText = (action: CareAction) => {
    switch (action) {
      case 'feed':
        return `Yum! ${currentPet?.name} is feeling full and happy!`;
      case 'play':
        return `${currentPet?.name} had a great time playing with you!`;
      case 'sleep':
        return `${currentPet?.name} took a refreshing nap!`;
      case 'clean':
        return `${currentPet?.name} is squeaky clean now!`;
    }
  };

  // Check if pet can perform certain actions
  const canPerformAction = (action: CareAction) => {
    if (!currentPet) return false;
    
    const { stats } = currentPet;
    
    switch (action) {
      case 'feed':
        return stats.hunger < 90;
      case 'play':
        return stats.energy > 20;
      case 'sleep':
        return stats.energy < 90;
      case 'clean':
        return stats.health < 90;
      default:
        return true;
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
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Text style={styles.title}>Care for {currentPet.name}</Text>
      
      {/* Pet animation */}
      <View style={styles.petContainer}>
        <Pet 
          type={currentPet.type}
          name={currentPet.name}
          level={currentPet.level}
          animation={activeFeedback ? 'happy' : 'idle'}
        />
      </View>
      
      {/* Care actions */}
      <View style={styles.actionsContainer}>
        <View style={styles.actionsRow}>
          <CareActionButton
            action="feed"
            onPress={() => handleCareAction('feed')}
            disabled={!canPerformAction('feed')}
          />
          <CareActionButton
            action="play"
            onPress={() => handleCareAction('play')}
            disabled={!canPerformAction('play')}
          />
        </View>
        <View style={styles.actionsRow}>
          <CareActionButton
            action="sleep"
            onPress={() => handleCareAction('sleep')}
            disabled={!canPerformAction('sleep')}
          />
          <CareActionButton
            action="clean"
            onPress={() => handleCareAction('clean')}
            disabled={!canPerformAction('clean')}
          />
        </View>
      </View>
      
      {/* Pet status */}
      <View style={styles.statusCard}>
        <Text style={styles.statusTitle}>Status</Text>
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
      
      {/* Activity log */}
      <View style={styles.activityContainer}>
        <Text style={styles.activityTitle}>Recent Activity</Text>
        
        {activeFeedback && (
          <Animated.View 
            style={[
              styles.activityItem, 
              styles.activeActivity,
              { 
                opacity: fadeAnim,
                transform: [{ scale: scaleAnim }]
              }
            ]}
          >
            <View style={styles.activityIconContainer}>
              {activeFeedback.action === 'feed' && <Text style={styles.activityEmoji}>🍔</Text>}
              {activeFeedback.action === 'play' && <Text style={styles.activityEmoji}>🎮</Text>}
              {activeFeedback.action === 'sleep' && <Text style={styles.activityEmoji}>😴</Text>}
              {activeFeedback.action === 'clean' && <Text style={styles.activityEmoji}>🚿</Text>}
            </View>
            <View style={styles.activityContent}>
              <Text style={styles.activityAction}>
                {careActions[activeFeedback.action].label}
              </Text>
              <Text style={styles.activityFeedback}>
                {getFeedbackText(activeFeedback.action)}
              </Text>
              <Text style={styles.activityTime}>{getActionTimeInfo()}</Text>
            </View>
          </Animated.View>
        )}
        
        <View style={styles.activityItem}>
          <View style={styles.activityIconContainer}>
            <Text style={styles.activityEmoji}>🏠</Text>
          </View>
          <View style={styles.activityContent}>
            <Text style={styles.activityAction}>Adoption</Text>
            <Text style={styles.activityFeedback}>
              {currentPet.name} joined your family!
            </Text>
            <Text style={styles.activityTime}>
              {new Date(currentPet.birthday).toLocaleDateString()}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    padding: theme.spacing.md,
  },
  title: {
    fontFamily: theme.fonts.bold,
    fontSize: 24,
    color: theme.colors.text,
    marginBottom: theme.spacing.lg,
  },
  petContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.lg,
  },
  actionsContainer: {
    marginBottom: theme.spacing.lg,
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: theme.spacing.md,
  },
  statusCard: {
    backgroundColor: 'white',
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.lg,
    ...theme.shadows.small,
  },
  statusTitle: {
    fontFamily: theme.fonts.semiBold,
    fontSize: 18,
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  activityContainer: {
    flex: 1,
  },
  activityTitle: {
    fontFamily: theme.fonts.semiBold,
    fontSize: 18,
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  activityItem: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    ...theme.shadows.small,
  },
  activeActivity: {
    borderWidth: 2,
    borderColor: theme.colors.primary,
  },
  activityIconContainer: {
    width: 40,
    height: 40,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.lightGray,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.md,
  },
  activityEmoji: {
    fontSize: 20,
  },
  activityContent: {
    flex: 1,
  },
  activityAction: {
    fontFamily: theme.fonts.semiBold,
    fontSize: 16,
    color: theme.colors.text,
  },
  activityFeedback: {
    fontFamily: theme.fonts.regular,
    fontSize: 14,
    color: theme.colors.text,
    marginTop: theme.spacing.xs,
  },
  activityTime: {
    fontFamily: theme.fonts.regular,
    fontSize: 12,
    color: theme.colors.subtext,
    marginTop: theme.spacing.xs,
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