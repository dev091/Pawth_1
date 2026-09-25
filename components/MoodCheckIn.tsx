import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { theme } from '@/constants/theme';
import { usePet } from '@/context/PetContext';
import { moodOptions, moodById, MoodType } from '@/data/petData';
import { Flame, ChevronRight, Wind } from 'lucide-react-native';

export default function MoodCheckIn() {
  const router = useRouter();
  const { todaysMood, moodStreak, logMood } = usePet();
  const [note, setNote] = useState('');
  const [justLogged, setJustLogged] = useState(false);
  const [loggedMood, setLoggedMood] = useState<MoodType | null>(null);

  const handlePick = (moodId: MoodType) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    logMood(moodId, note.trim());
    setLoggedMood(moodId);
    setJustLogged(true);
  };

  const suggestCalm = justLogged && (loggedMood === 'low' || loggedMood === 'awful');

  if (todaysMood && !justLogged) {
    const mood = moodById[todaysMood.mood];
    return (
      <TouchableOpacity
        style={styles.container}
        activeOpacity={0.8}
        onPress={() => router.push('/mood-history')}
      >
        <View style={styles.doneRow}>
          <Text style={styles.doneEmoji}>{mood.emoji}</Text>
          <View style={styles.doneTextWrap}>
            <Text style={styles.title}>You felt {mood.label.toLowerCase()} today</Text>
            {moodStreak > 1 && (
              <View style={styles.streakPill}>
                <Flame size={14} color="#FF6B35" />
                <Text style={styles.streakText}>{moodStreak} day streak</Text>
              </View>
            )}
          </View>
          <ChevronRight size={20} color={theme.colors.gray} />
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>How are you feeling today?</Text>
        {moodStreak > 0 && (
          <View style={styles.streakPill}>
            <Flame size={14} color="#FF6B35" />
            <Text style={styles.streakText}>{moodStreak}</Text>
          </View>
        )}
      </View>

      {justLogged ? (
        <>
          <View style={styles.loggedRow}>
            <Text style={styles.loggedEmoji}>✅</Text>
            <Text style={styles.loggedText}>Logged! Your pet feels the love.</Text>
          </View>
          {suggestCalm && (
            <TouchableOpacity style={styles.calmSuggestion} onPress={() => router.push('/calm')}>
              <Wind size={18} color="#3F6E8C" />
              <Text style={styles.calmSuggestionText}>
                Rough day? Try a 2-minute breathing exercise
              </Text>
              <ChevronRight size={16} color="#3F6E8C" />
            </TouchableOpacity>
          )}
        </>
      ) : (
        <>
          <View style={styles.moodRow}>
            {moodOptions.map(option => (
              <TouchableOpacity
                key={option.id}
                style={styles.moodButton}
                onPress={() => handlePick(option.id)}
              >
                <Text style={styles.moodEmoji}>{option.emoji}</Text>
                <Text style={styles.moodLabel}>{option.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <TextInput
            style={styles.noteInput}
            placeholder="Add a quick note (optional)"
            placeholderTextColor={theme.colors.gray}
            value={note}
            onChangeText={setNote}
            maxLength={140}
          />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.lg,
    ...theme.shadows.small,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.md,
  },
  title: {
    fontFamily: theme.fonts.bold,
    fontSize: 16,
    color: theme.colors.text,
  },
  streakPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FFF3E9',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.full,
  },
  streakText: {
    fontFamily: theme.fonts.semiBold,
    fontSize: 12,
    color: '#FF6B35',
  },
  moodRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.sm,
  },
  moodButton: {
    alignItems: 'center',
    flex: 1,
    paddingVertical: theme.spacing.sm,
  },
  moodEmoji: {
    fontSize: 28,
    marginBottom: 4,
  },
  moodLabel: {
    fontFamily: theme.fonts.regular,
    fontSize: 11,
    color: theme.colors.subtext,
  },
  noteInput: {
    fontFamily: theme.fonts.regular,
    fontSize: 14,
    color: theme.colors.text,
    backgroundColor: theme.colors.lightGray,
    borderRadius: theme.borderRadius.sm,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
  },
  loggedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    paddingVertical: theme.spacing.sm,
  },
  loggedEmoji: {
    fontSize: 20,
  },
  loggedText: {
    fontFamily: theme.fonts.semiBold,
    fontSize: 14,
    color: theme.colors.success,
  },
  doneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  doneEmoji: {
    fontSize: 32,
  },
  doneTextWrap: {
    flex: 1,
    gap: 4,
  },
  calmSuggestion: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    backgroundColor: '#E8F4FB',
    borderRadius: theme.borderRadius.sm,
    padding: theme.spacing.sm,
    marginTop: theme.spacing.sm,
  },
  calmSuggestionText: {
    flex: 1,
    fontFamily: theme.fonts.semiBold,
    fontSize: 13,
    color: '#3F6E8C',
  },
});
