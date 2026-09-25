import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
  Linking,
} from 'react-native';
import * as Location from 'expo-location';
import * as Haptics from 'expo-haptics';
import { theme } from '@/constants/theme';
import { usePet } from '@/context/PetContext';
import { fetchNearbyTrails, Trail, TrailKind } from '@/lib/trails';
import { MapPin, TreePine, Footprints, RefreshCw, Navigation } from 'lucide-react-native';

type ScreenStatus = 'requesting' | 'denied' | 'loading' | 'error' | 'ready';

const kindMeta: Record<TrailKind, { label: string; icon: typeof TreePine }> = {
  park: { label: 'Park', icon: TreePine },
  trail: { label: 'Trail', icon: Footprints },
  nature: { label: 'Nature area', icon: TreePine },
};

export default function TrailsScreen() {
  const { completeTrailWalk } = usePet();
  const [status, setStatus] = useState<ScreenStatus>('requesting');
  const [trails, setTrails] = useState<Trail[]>([]);
  const [activeWalk, setActiveWalk] = useState<Trail | null>(null);
  const [elapsedSec, setElapsedSec] = useState(0);
  const [reward, setReward] = useState<{ xp: number; points: number } | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const load = async () => {
    setStatus('requesting');
    try {
      const { status: permStatus } = await Location.requestForegroundPermissionsAsync();
      if (permStatus !== 'granted') {
        setStatus('denied');
        return;
      }
      setStatus('loading');
      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      const found = await fetchNearbyTrails(position.coords.latitude, position.coords.longitude);
      setTrails(found);
      setStatus('ready');
    } catch {
      setStatus('error');
    }
  };

  useEffect(() => {
    load();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const startWalk = (trail: Trail) => {
    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setActiveWalk(trail);
    setElapsedSec(0);
    setReward(null);
    timerRef.current = setInterval(() => setElapsedSec(s => s + 1), 1000);
  };

  const finishWalk = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    const minutes = Math.max(1, Math.round(elapsedSec / 60));
    const result = completeTrailWalk(minutes);
    setReward(result);
    if (Platform.OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const closeWalk = () => {
    setActiveWalk(null);
    setReward(null);
  };

  if (activeWalk) {
    const mins = Math.floor(elapsedSec / 60);
    const secs = elapsedSec % 60;
    return (
      <View style={styles.walkContainer}>
        {reward ? (
          <>
            <Text style={styles.walkDoneEmoji}>🎉</Text>
            <Text style={styles.walkDoneTitle}>Walk complete!</Text>
            <Text style={styles.walkDoneSubtitle}>{activeWalk.name}</Text>
            <View style={styles.rewardRow}>
              <Text style={styles.rewardText}>+{reward.xp} XP</Text>
              <Text style={styles.rewardText}>+{reward.points} pts</Text>
            </View>
            <TouchableOpacity style={styles.primaryButton} onPress={closeWalk}>
              <Text style={styles.primaryButtonText}>Done</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <Navigation size={40} color={theme.colors.primary} />
            <Text style={styles.walkTitle}>Walking at {activeWalk.name}</Text>
            <Text style={styles.timerText}>
              {String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}
            </Text>
            <Text style={styles.walkHint}>Enjoy the walk with your pet!</Text>
            <TouchableOpacity style={styles.primaryButton} onPress={finishWalk}>
              <Text style={styles.primaryButtonText}>Finish Walk</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    );
  }

  if (status === 'requesting' || status === 'loading') {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.centerText}>
          {status === 'requesting' ? 'Requesting location access…' : 'Finding trails nearby…'}
        </Text>
      </View>
    );
  }

  if (status === 'denied') {
    return (
      <View style={styles.centerContainer}>
        <MapPin size={40} color={theme.colors.gray} />
        <Text style={styles.centerTitle}>Location access needed</Text>
        <Text style={styles.centerText}>
          Pawth needs your location to find parks and trails nearby. Enable it in Settings to
          continue.
        </Text>
        <TouchableOpacity style={styles.primaryButton} onPress={() => Linking.openSettings()}>
          <Text style={styles.primaryButtonText}>Open Settings</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.secondaryButton} onPress={load}>
          <Text style={styles.secondaryButtonText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (status === 'error') {
    return (
      <View style={styles.centerContainer}>
        <RefreshCw size={40} color={theme.colors.gray} />
        <Text style={styles.centerTitle}>Couldn't load trails</Text>
        <Text style={styles.centerText}>
          Check your connection and try again.
        </Text>
        <TouchableOpacity style={styles.primaryButton} onPress={load}>
          <Text style={styles.primaryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <FlatList
      style={styles.container}
      contentContainerStyle={styles.listContent}
      data={trails}
      keyExtractor={item => item.id}
      ListEmptyComponent={
        <View style={styles.centerContainer}>
          <TreePine size={40} color={theme.colors.gray} />
          <Text style={styles.centerTitle}>No trails found nearby</Text>
          <Text style={styles.centerText}>Try again later or from a different location.</Text>
        </View>
      }
      renderItem={({ item }) => {
        const meta = kindMeta[item.kind];
        const Icon = meta.icon;
        return (
          <View style={styles.trailCard}>
            <View style={styles.trailIconWrap}>
              <Icon size={22} color={theme.colors.primary} />
            </View>
            <View style={styles.trailInfo}>
              <Text style={styles.trailName}>{item.name}</Text>
              <Text style={styles.trailMeta}>
                {meta.label} · {item.distanceKm.toFixed(1)} km away
              </Text>
            </View>
            <TouchableOpacity style={styles.walkButton} onPress={() => startWalk(item)}>
              <Text style={styles.walkButtonText}>Walk</Text>
            </TouchableOpacity>
          </View>
        );
      }}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  listContent: {
    padding: theme.spacing.md,
    paddingBottom: theme.spacing.xl,
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.xl,
    gap: theme.spacing.sm,
    backgroundColor: theme.colors.background,
  },
  centerTitle: {
    fontFamily: theme.fonts.bold,
    fontSize: 18,
    color: theme.colors.text,
    marginTop: theme.spacing.sm,
    textAlign: 'center',
  },
  centerText: {
    fontFamily: theme.fonts.regular,
    fontSize: 14,
    color: theme.colors.subtext,
    textAlign: 'center',
    lineHeight: 20,
  },
  primaryButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.full,
    marginTop: theme.spacing.md,
  },
  primaryButtonText: {
    fontFamily: theme.fonts.bold,
    fontSize: 16,
    color: 'white',
  },
  secondaryButton: {
    paddingVertical: theme.spacing.sm,
  },
  secondaryButtonText: {
    fontFamily: theme.fonts.semiBold,
    fontSize: 14,
    color: theme.colors.subtext,
  },
  trailCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    ...theme.shadows.small,
  },
  trailIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#EAFBF9',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.md,
  },
  trailInfo: {
    flex: 1,
  },
  trailName: {
    fontFamily: theme.fonts.bold,
    fontSize: 15,
    color: theme.colors.text,
  },
  trailMeta: {
    fontFamily: theme.fonts.regular,
    fontSize: 12,
    color: theme.colors.subtext,
    marginTop: 2,
  },
  walkButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.full,
  },
  walkButtonText: {
    fontFamily: theme.fonts.bold,
    fontSize: 13,
    color: 'white',
  },
  walkContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.background,
    padding: theme.spacing.xl,
    gap: theme.spacing.sm,
  },
  walkTitle: {
    fontFamily: theme.fonts.bold,
    fontSize: 18,
    color: theme.colors.text,
    textAlign: 'center',
    marginTop: theme.spacing.sm,
  },
  timerText: {
    fontFamily: theme.fonts.bold,
    fontSize: 48,
    color: theme.colors.primary,
    marginVertical: theme.spacing.md,
  },
  walkHint: {
    fontFamily: theme.fonts.regular,
    fontSize: 14,
    color: theme.colors.subtext,
    marginBottom: theme.spacing.md,
  },
  walkDoneEmoji: {
    fontSize: 56,
  },
  walkDoneTitle: {
    fontFamily: theme.fonts.bold,
    fontSize: 22,
    color: theme.colors.text,
  },
  walkDoneSubtitle: {
    fontFamily: theme.fonts.regular,
    fontSize: 14,
    color: theme.colors.subtext,
    marginBottom: theme.spacing.md,
  },
  rewardRow: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },
  rewardText: {
    fontFamily: theme.fonts.bold,
    fontSize: 16,
    color: theme.colors.primary,
    backgroundColor: '#EAFBF9',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.full,
  },
});
