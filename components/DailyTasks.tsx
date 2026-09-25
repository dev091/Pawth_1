import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { theme } from '@/constants/theme';
import { usePet } from '@/context/PetContext';
import { CareAction } from '@/data/petData';
import { CircleCheck as CheckCircle2, Circle, Utensils, Heart, Moon, Droplets } from 'lucide-react-native';

const taskIcon: Record<CareAction, typeof Utensils> = {
  feed: Utensils,
  play: Heart,
  sleep: Moon,
  clean: Droplets,
};

const taskAccent: Record<CareAction, string> = {
  feed: theme.colors.hunger,
  play: theme.colors.happiness,
  sleep: theme.colors.energy,
  clean: theme.colors.health,
};

export default function DailyTasks() {
  const { dailyTasks, points } = usePet();

  const completedTasks = dailyTasks.filter(task => task.completed).length;
  const totalTasks = dailyTasks.length;
  const progress = (completedTasks / totalTasks) * 100;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Self-Care Journey</Text>
          <Text style={styles.subtitleLine}>Left for today {totalTasks - completedTasks}/{totalTasks}</Text>
        </View>
        <Text style={styles.points}>{points} pts</Text>
      </View>

      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${progress}%` }]} />
        </View>
      </View>

      <View style={styles.taskList}>
        {dailyTasks.map(task => {
          const Icon = taskIcon[task.type];
          const accent = taskAccent[task.type];
          return (
            <View key={task.id} style={styles.taskItem}>
              <View style={[styles.taskIconBadge, { backgroundColor: accent }]}>
                <Icon size={20} color="white" />
              </View>
              <View style={styles.taskContent}>
                <Text style={styles.taskDescription}>{task.description}</Text>
                <Text style={styles.taskSubtitle}>Self-Care Journey</Text>
              </View>
              <View style={styles.taskRewardRow}>
                <Text style={styles.taskPoints}>+{task.points} 🐾</Text>
                {task.completed ? (
                  <CheckCircle2 size={22} color={theme.colors.success} />
                ) : (
                  <Circle size={22} color={theme.colors.gray} />
                )}
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginVertical: theme.spacing.md,
    ...theme.shadows.small,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.md,
  },
  title: {
    fontFamily: theme.fonts.extraBold,
    fontSize: 18,
    color: theme.colors.text,
  },
  subtitleLine: {
    fontFamily: theme.fonts.regular,
    fontSize: 13,
    color: theme.colors.subtext,
    marginTop: 2,
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
  },
  progressFill: {
    height: '100%',
    backgroundColor: theme.colors.success,
    borderRadius: theme.borderRadius.full,
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
    gap: theme.spacing.sm,
  },
  taskIconBadge: {
    width: 40,
    height: 40,
    borderRadius: theme.borderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  taskContent: {
    flex: 1,
  },
  taskDescription: {
    fontFamily: theme.fonts.semiBold,
    fontSize: 14,
    color: theme.colors.text,
  },
  taskSubtitle: {
    fontFamily: theme.fonts.regular,
    fontSize: 12,
    color: theme.colors.subtext,
    marginTop: 1,
  },
  taskRewardRow: {
    alignItems: 'flex-end',
    gap: 4,
  },
  taskPoints: {
    fontFamily: theme.fonts.semiBold,
    fontSize: 12,
    color: theme.colors.success,
  },
});
