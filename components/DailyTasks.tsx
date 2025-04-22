import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { theme } from '@/constants/theme';
import { usePet } from '@/context/PetContext';
import { CircleCheck as CheckCircle2, Circle } from 'lucide-react-native';

export default function DailyTasks() {
  const { dailyTasks, points } = usePet();

  const completedTasks = dailyTasks.filter(task => task.completed).length;
  const totalTasks = dailyTasks.length;
  const progress = (completedTasks / totalTasks) * 100;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Daily Tasks</Text>
        <Text style={styles.points}>{points} Points</Text>
      </View>

      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${progress}%` }]} />
        </View>
        <Text style={styles.progressText}>
          {completedTasks}/{totalTasks} Completed
        </Text>
      </View>

      <View style={styles.taskList}>
        {dailyTasks.map(task => (
          <View key={task.id} style={styles.taskItem}>
            {task.completed ? (
              <CheckCircle2 size={24} color={theme.colors.success} />
            ) : (
              <Circle size={24} color={theme.colors.gray} />
            )}
            <View style={styles.taskContent}>
              <Text style={styles.taskDescription}>{task.description}</Text>
              <Text style={styles.taskPoints}>+{task.points} points</Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginVertical: theme.spacing.md,
    ...theme.shadows.small,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  title: {
    fontFamily: theme.fonts.bold,
    fontSize: 18,
    color: theme.colors.text,
  },
  points: {
    fontFamily: theme.fonts.semiBold,
    fontSize: 16,
    color: theme.colors.primary,
  },
  progressContainer: {
    marginBottom: theme.spacing.md,
  },
  progressBar: {
    height: 8,
    backgroundColor: theme.colors.lightGray,
    borderRadius: theme.borderRadius.full,
    overflow: 'hidden',
    marginBottom: theme.spacing.xs,
  },
  progressFill: {
    height: '100%',
    backgroundColor: theme.colors.success,
    borderRadius: theme.borderRadius.full,
  },
  progressText: {
    fontFamily: theme.fonts.regular,
    fontSize: 12,
    color: theme.colors.subtext,
    textAlign: 'right',
  },
  taskList: {
    gap: theme.spacing.sm,
  },
  taskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.sm,
    backgroundColor: theme.colors.lightGray,
    borderRadius: theme.borderRadius.sm,
  },
  taskContent: {
    marginLeft: theme.spacing.sm,
    flex: 1,
  },
  taskDescription: {
    fontFamily: theme.fonts.semiBold,
    fontSize: 14,
    color: theme.colors.text,
  },
  taskPoints: {
    fontFamily: theme.fonts.regular,
    fontSize: 12,
    color: theme.colors.success,
  },
});