import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { theme } from '@/constants/theme';
import { usePet } from '@/context/PetContext';
import { moodById, MoodEntry } from '@/data/petData';
import { Flame } from 'lucide-react-native';

function dayKeyOffset(offsetDays: number): string {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function formatDateLabel(dateKey: string): string {
  const [y, m, d] = dateKey.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  const today = dayKeyOffset(0);
  const yesterday = dayKeyOffset(-1);
  if (dateKey === today) return 'Today';
  if (dateKey === yesterday) return 'Yesterday';
  return date.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
}

export default function MoodHistoryScreen() {
  const { moodEntries, moodStreak } = usePet();

  const last7 = useMemo(() => {
    const byDate = new Map(moodEntries.map(e => [e.date, e]));
    const days: { date: string; entry: MoodEntry | undefined }[] = [];
    for (let i = 6; i >= 0; i--) {
      const date = dayKeyOffset(-i);
      days.push({ date, entry: byDate.get(date) });
    }
    return days;
  }, [moodEntries]);

  const sortedEntries = useMemo(
    () => [...moodEntries].sort((a, b) => (a.date < b.date ? 1 : -1)),
    [moodEntries]
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {moodStreak > 0 && (
        <View style={styles.streakBanner}>
          <Flame size={20} color="#FF6B35" />
          <Text style={styles.streakBannerText}>
            {moodStreak} day{moodStreak === 1 ? '' : 's'} in a row — keep it going!
          </Text>
        </View>
      )}

      <Text style={styles.sectionTitle}>Last 7 days</Text>
      <View style={styles.weekStrip}>
        {last7.map(({ date, entry }) => (
          <View key={date} style={styles.dayCell}>
            <Text style={styles.dayEmoji}>{entry ? moodById[entry.mood].emoji : '·'}</Text>
            <Text style={styles.dayLabel}>{formatDateLabel(date).slice(0, 3)}</Text>
          </View>
        ))}
      </View>

      <Text style={styles.sectionTitle}>Journal</Text>
      {sortedEntries.length === 0 ? (
        <Text style={styles.emptyText}>
          No check-ins yet. Log how you're feeling from the Home screen to start your history.
        </Text>
      ) : (
        sortedEntries.map(entry => (
          <View key={entry.date} style={styles.entryCard}>
            <Text style={styles.entryEmoji}>{moodById[entry.mood].emoji}</Text>
            <View style={styles.entryBody}>
              <View style={styles.entryHeaderRow}>
                <Text style={styles.entryDate}>{formatDateLabel(entry.date)}</Text>
                <Text style={styles.entryMoodLabel}>{moodById[entry.mood].label}</Text>
              </View>
              {!!entry.note && <Text style={styles.entryNote}>{entry.note}</Text>}
            </View>
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    padding: theme.spacing.md,
    paddingBottom: theme.spacing.xl,
  },
  streakBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    backgroundColor: '#FFF3E9',
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },
  streakBannerText: {
    fontFamily: theme.fonts.semiBold,
    fontSize: 14,
    color: '#B7521B',
    flex: 1,
  },
  sectionTitle: {
    fontFamily: theme.fonts.bold,
    fontSize: 16,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
    marginTop: theme.spacing.sm,
  },
  weekStrip: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.lg,
    ...theme.shadows.small,
  },
  dayCell: {
    alignItems: 'center',
    gap: 4,
  },
  dayEmoji: {
    fontSize: 22,
  },
  dayLabel: {
    fontFamily: theme.fonts.regular,
    fontSize: 11,
    color: theme.colors.subtext,
  },
  emptyText: {
    fontFamily: theme.fonts.regular,
    fontSize: 14,
    color: theme.colors.subtext,
    lineHeight: 20,
  },
  entryCard: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    ...theme.shadows.small,
  },
  entryEmoji: {
    fontSize: 28,
  },
  entryBody: {
    flex: 1,
  },
  entryHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  entryDate: {
    fontFamily: theme.fonts.semiBold,
    fontSize: 14,
    color: theme.colors.text,
  },
  entryMoodLabel: {
    fontFamily: theme.fonts.semiBold,
    fontSize: 13,
    color: theme.colors.primary,
  },
  entryNote: {
    fontFamily: theme.fonts.regular,
    fontSize: 13,
    color: theme.colors.subtext,
    marginTop: 2,
  },
});
