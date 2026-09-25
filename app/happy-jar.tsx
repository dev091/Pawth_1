import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, FlatList, Platform } from 'react-native';
import * as Haptics from 'expo-haptics';
import { usePet } from '@/context/PetContext';
import { theme, toolColors } from '@/constants/theme';
import { Plus, Trash2 } from 'lucide-react-native';

export default function HappyJarScreen() {
  const { happyMoments, addHappyMoment, removeHappyMoment } = usePet();
  const [text, setText] = useState('');

  const submit = () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    addHappyMoment(trimmed);
    setText('');
  };

  return (
    <View style={styles.container}>
      <View style={styles.jarHeader}>
        <Text style={styles.jarEmoji}>🫙</Text>
        <Text style={styles.title}>Happy Energy Jar</Text>
        <Text style={styles.subtitle}>
          Drop in the small good things — a warm coffee, a kind text, sunshine.
        </Text>
      </View>

      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          value={text}
          onChangeText={setText}
          placeholder="What made you smile today?"
          placeholderTextColor={theme.colors.gray}
          maxLength={120}
          onSubmitEditing={submit}
          returnKeyType="done"
        />
        <TouchableOpacity style={styles.addButton} onPress={submit}>
          <Plus size={20} color="white" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={happyMoments}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <Text style={styles.emptyText}>Your jar is empty — add your first happy moment above.</Text>
        }
        renderItem={({ item }) => (
          <View style={styles.momentCard}>
            <Text style={styles.momentText}>{item.text}</Text>
            <TouchableOpacity onPress={() => removeHappyMoment(item.id)} hitSlop={8}>
              <Trash2 size={16} color={theme.colors.gray} />
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  jarHeader: {
    alignItems: 'center',
    padding: theme.spacing.lg,
  },
  jarEmoji: {
    fontSize: 44,
    marginBottom: theme.spacing.sm,
  },
  title: {
    fontFamily: theme.fonts.extraBold,
    fontSize: 22,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  subtitle: {
    fontFamily: theme.fonts.regular,
    fontSize: 14,
    color: theme.colors.subtext,
    textAlign: 'center',
    lineHeight: 20,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    paddingHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.md,
  },
  input: {
    flex: 1,
    fontFamily: theme.fonts.regular,
    fontSize: 14,
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.full,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    color: theme.colors.text,
    ...theme.shadows.small,
  },
  addButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: toolColors.amber,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listContent: {
    padding: theme.spacing.lg,
    paddingTop: 0,
    gap: theme.spacing.sm,
  },
  emptyText: {
    fontFamily: theme.fonts.regular,
    fontSize: 14,
    color: theme.colors.subtext,
    textAlign: 'center',
    marginTop: theme.spacing.xl,
  },
  momentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFF3DE',
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    gap: theme.spacing.sm,
  },
  momentText: {
    flex: 1,
    fontFamily: theme.fonts.semiBold,
    fontSize: 14,
    color: '#7A5A1E',
  },
});
