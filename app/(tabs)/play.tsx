import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Platform,
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { X, Trophy, Timer, Play as PlayIcon, RotateCcw, ChevronLeft, Flame, Sparkles } from 'lucide-react-native';
import { theme } from '@/constants/theme';
import { usePet } from '@/context/PetContext';
import LuckySpin from '@/components/LuckySpin';

const GAME_DURATION = 30; // seconds
const BASE_SPAWN_MS = 800;
const BASE_LIFETIME_MS = 1100;
const TREAT_SIZE = 56;
const TREAT_EMOJIS = ['🦴', '🍪', '🧀', '🥕'];

interface Treat {
  id: number;
  x: number;
  y: number;
  emoji: string;
  golden: boolean;
}

type Phase = 'ready' | 'playing' | 'done';
type Screen = 'menu' | 'treat' | 'spin';

export default function PlayScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { currentPet } = usePet();
  const [screen, setScreen] = useState<Screen>('menu');

  if (!currentPet) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.emptyState}>
          <Text style={styles.emptyEmoji}>🐾</Text>
          <Text style={styles.emptyTitle}>Adopt a pet first!</Text>
          <Text style={styles.emptyText}>
            Your pet needs to exist before you can play together.
          </Text>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => router.push('/(tabs)/adopt')}
          >
            <Text style={styles.primaryButtonText}>Adopt a Pet</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {screen === 'menu' && <GameMenu onSelect={setScreen} petName={currentPet.name} />}
      {screen === 'treat' && <TreatCatchGame onExit={() => setScreen('menu')} />}
      {screen === 'spin' && <SpinScreen onExit={() => setScreen('menu')} />}
    </View>
  );
}

// ---------------------------------------------------------------------------
// Game select menu
// ---------------------------------------------------------------------------

function GameMenu({ onSelect, petName }: { onSelect: (s: Screen) => void; petName: string }) {
  const { treatBest, freeSpinAvailable, bestCombo } = usePet();
  return (
    <ScrollView contentContainerStyle={styles.menuContainer}>
      <Text style={styles.menuTitle}>Play with {petName}</Text>
      <Text style={styles.menuSubtitle}>Games earn XP and points — every day!</Text>

      <TouchableOpacity style={styles.gameCard} onPress={() => onSelect('treat')}>
        <Text style={styles.gameEmoji}>🦴</Text>
        <View style={styles.gameInfo}>
          <Text style={styles.gameTitle}>Treat Catch</Text>
          <Text style={styles.gameDesc}>Tap treats fast for 30 seconds. Combos multiply your score!</Text>
          <View style={styles.gameMeta}>
            <View style={styles.metaChip}>
              <Trophy size={14} color={theme.colors.primary} />
              <Text style={styles.metaText}>Best: {treatBest}</Text>
            </View>
            {bestCombo > 0 && (
              <View style={styles.metaChip}>
                <Flame size={14} color="#FF6B35" />
                <Text style={styles.metaText}>Combo: {bestCombo}</Text>
              </View>
            )}
          </View>
        </View>
        <Text style={styles.gameArrow}>›</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.gameCard} onPress={() => onSelect('spin')}>
        <Text style={styles.gameEmoji}>🎰</Text>
        <View style={styles.gameInfo}>
          <Text style={styles.gameTitle}>Lucky Spin</Text>
          <Text style={styles.gameDesc}>Spin the reel for surprise rewards — jackpots included!</Text>
          <View style={styles.gameMeta}>
            {freeSpinAvailable ? (
              <View style={[styles.metaChip, styles.freeChip]}>
                <Sparkles size={14} color="white" />
                <Text style={[styles.metaText, styles.freeChipText]}>FREE SPIN</Text>
              </View>
            ) : (
              <View style={styles.metaChip}>
                <Text style={styles.metaText}>Free spin tomorrow</Text>
              </View>
            )}
          </View>
        </View>
        <Text style={styles.gameArrow}>›</Text>
      </TouchableOpacity>

      <View style={styles.comingSoonCard}>
        <Text style={styles.comingSoonEmoji}>✨</Text>
        <Text style={styles.comingSoonText}>More games are on the way!</Text>
      </View>
    </ScrollView>
  );
}

// ---------------------------------------------------------------------------
// Lucky Spin screen
// ---------------------------------------------------------------------------

function SpinScreen({ onExit }: { onExit: () => void }) {
  return (
    <ScrollView contentContainerStyle={styles.spinContainer}>
      <TouchableOpacity style={styles.backButton} onPress={onExit}>
        <ChevronLeft size={20} color={theme.colors.text} />
        <Text style={styles.backText}>Games</Text>
      </TouchableOpacity>
      <LuckySpin />
    </ScrollView>
  );
}

// ---------------------------------------------------------------------------
// Treat Catch — with combos, golden treats, and a difficulty ramp
// ---------------------------------------------------------------------------

function TreatCatchGame({ onExit }: { onExit: () => void }) {
  const { rewardMinigame, recordCombo, recordTreatScore, treatBest } = usePet();

  const [phase, setPhase] = useState<Phase>('ready');
  const [treats, setTreats] = useState<Treat[]>([]);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
  const [result, setResult] = useState<{ xp: number; points: number } | null>(null);
  const [isNewBest, setIsNewBest] = useState(false);
  const [runBestCombo, setRunBestCombo] = useState(0);
  const [speedLevel, setSpeedLevel] = useState(0);

  const areaRef = useRef({ width: 0, height: 0 });
  const treatId = useRef(0);
  const mounted = useRef(true);
  const rewarded = useRef(false);
  const runId = useRef(0);
  const comboRef = useRef(0);
  const runBestComboRef = useRef(0);
  const caughtRef = useRef<Set<number>>(new Set());
  const bestAtStartRef = useRef(0);
  const spawnMsRef = useRef(BASE_SPAWN_MS);
  const lifetimeRef = useRef(BASE_LIFETIME_MS);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  // Difficulty ramp: treats spawn faster and vanish sooner as the run goes on.
  useEffect(() => {
    spawnMsRef.current = Math.max(450, BASE_SPAWN_MS - speedLevel * 50);
    lifetimeRef.current = Math.max(800, BASE_LIFETIME_MS - speedLevel * 45);
  }, [speedLevel]);

  const spawnTreat = useCallback(() => {
    const { width, height } = areaRef.current;
    if (width === 0 || height === 0) return;
    const id = ++treatId.current;
    const golden = Math.random() < 0.06;
    const treat: Treat = {
      id,
      x: Math.random() * Math.max(1, width - TREAT_SIZE),
      y: Math.random() * Math.max(1, height - TREAT_SIZE),
      emoji: golden ? '🌟' : TREAT_EMOJIS[Math.floor(Math.random() * TREAT_EMOJIS.length)],
      golden,
    };
    setTreats(prev => [...prev, treat]);
    const lifetime = lifetimeRef.current;
    const run = runId.current;
    setTimeout(() => {
      // Ignore timeouts from a previous run (e.g. user hit Play Again fast).
      if (!mounted.current || run !== runId.current) return;
      if (!caughtRef.current.has(id)) {
        // Missed treat — combo breaks.
        comboRef.current = 0;
        setCombo(0);
      } else {
        caughtRef.current.delete(id);
      }
      setTreats(prev => prev.filter(t => t.id !== id));
    }, lifetime);
  }, []);

  const endGame = useCallback(
    (finalScore: number) => {
      if (rewarded.current) return;
      rewarded.current = true;
      const r = rewardMinigame(finalScore);
      recordCombo(runBestComboRef.current);
      const beaten = finalScore > bestAtStartRef.current && finalScore > 0;
      recordTreatScore(finalScore);
      if (mounted.current) {
        setIsNewBest(beaten);
        setRunBestCombo(runBestComboRef.current);
        setResult(r);
        setTreats([]);
        setPhase('done');
      }
    },
    [rewardMinigame, recordCombo, recordTreatScore]
  );

  const startGame = () => {
    rewarded.current = false;
    runId.current += 1;
    comboRef.current = 0;
    runBestComboRef.current = 0;
    caughtRef.current.clear();
    bestAtStartRef.current = treatBest;
    setCombo(0);
    setScore(0);
    setTreats([]);
    setTimeLeft(GAME_DURATION);
    setResult(null);
    setIsNewBest(false);
    setRunBestCombo(0);
    setSpeedLevel(0);
    setPhase('playing');
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
  };

  // Game loop: spawn treats + countdown + ramp difficulty.
  useEffect(() => {
    if (phase !== 'playing') return;
    const spawner = setInterval(spawnTreat, spawnMsRef.current);
    const ramper = setInterval(() => {
      setSpeedLevel(prev => Math.min(7, prev + 1));
    }, 4000);
    const clock = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(spawner);
          clearInterval(clock);
          clearInterval(ramper);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => {
      clearInterval(spawner);
      clearInterval(clock);
      clearInterval(ramper);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, speedLevel, spawnTreat]);

  // End the game when the timer hits zero.
  useEffect(() => {
    if (phase === 'playing' && timeLeft === 0) {
      endGame(score);
    }
  }, [phase, timeLeft, score, endGame]);

  const catchTreat = (id: number, golden: boolean) => {
    caughtRef.current.add(id);
    setTreats(prev => prev.filter(t => t.id !== id));
    const newCombo = comboRef.current + 1;
    comboRef.current = newCombo;
    setCombo(newCombo);
    if (newCombo > runBestComboRef.current) {
      runBestComboRef.current = newCombo;
    }
    const mult = 1 + Math.floor(newCombo / 5);
    setScore(prev => prev + (golden ? 5 : 1) * mult);
    if (Platform.OS !== 'web') {
      if (newCombo > 0 && newCombo % 10 === 0) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } else {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    }
  };

  const mult = 1 + Math.floor(combo / 5);

  return (
    <View style={styles.gameContainer}>
      {/* HUD */}
      <View style={styles.hud}>
        <View style={styles.hudLeft}>
          <Trophy size={20} color={theme.colors.primary} />
          <Text style={styles.scoreText}>{score}</Text>
        </View>
        {combo >= 2 && (
          <View style={styles.comboBadge}>
            <Flame size={16} color="white" />
            <Text style={styles.comboText}>
              {combo} combo{mult > 1 ? ` · x${mult}` : ''}
            </Text>
          </View>
        )}
        <View style={styles.timerContainer}>
          <Timer size={16} color={theme.colors.subtext} />
          <View style={styles.timerBar}>
            <View
              style={[
                styles.timerFill,
                { width: `${(timeLeft / GAME_DURATION) * 100}%` },
              ]}
            />
          </View>
          <Text style={styles.timeText}>{timeLeft}s</Text>
        </View>
        <TouchableOpacity style={styles.quitButton} onPress={onExit}>
          <X size={20} color={theme.colors.subtext} />
        </TouchableOpacity>
      </View>

      {/* Play area */}
      <View
        style={styles.playArea}
        onLayout={e => {
          areaRef.current = {
            width: e.nativeEvent.layout.width,
            height: e.nativeEvent.layout.height,
          };
        }}
      >
        {treats.map(treat => (
          <TreatButton key={treat.id} treat={treat} onCatch={catchTreat} />
        ))}

        {phase === 'ready' && (
          <View style={styles.overlay}>
            <Text style={styles.overlayEmoji}>🦴</Text>
            <Text style={styles.overlayTitle}>Treat Catch!</Text>
            <Text style={styles.overlayText}>
              Tap as many treats as you can in {GAME_DURATION} seconds.{'\n'}
              Catch treats in a row to build a combo — every 5 combo multiplies your points!{'\n'}
              🌟 Golden treats are worth 5x.
            </Text>
            <TouchableOpacity style={styles.primaryButton} onPress={startGame}>
              <PlayIcon size={20} color="white" />
              <Text style={styles.primaryButtonText}>Start Game</Text>
            </TouchableOpacity>
            {treatBest > 0 && (
              <Text style={styles.bestLine}>Your best: {treatBest}</Text>
            )}
          </View>
        )}

        {phase === 'done' && result && (
          <View style={styles.overlay}>
            <Text style={styles.overlayEmoji}>🎉</Text>
            <Text style={styles.overlayTitle}>Time's up!</Text>
            {isNewBest && (
              <View style={styles.newBestBadge}>
                <Text style={styles.newBestText}>🏆 NEW BEST! 🏆</Text>
              </View>
            )}
            <Text style={styles.resultScore}>{score} points</Text>
            <Text style={styles.resultCombo}>🔥 Best combo: {runBestCombo}</Text>
            <View style={styles.rewardRow}>
              <Text style={styles.rewardText}>+{result.xp} XP</Text>
              <Text style={styles.rewardText}>+{result.points} points</Text>
            </View>
            <View style={styles.resultButtons}>
              <TouchableOpacity style={styles.primaryButton} onPress={startGame}>
                <RotateCcw size={18} color="white" />
                <Text style={styles.primaryButtonText}>Play Again</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.secondaryButton} onPress={onExit}>
                <Text style={styles.secondaryButtonText}>Games</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    </View>
  );
}

function TreatButton({
  treat,
  onCatch,
}: {
  treat: Treat;
  onCatch: (id: number, golden: boolean) => void;
}) {
  const scale = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(scale, {
      toValue: 1,
      friction: 5,
      tension: 120,
      useNativeDriver: true,
    }).start();
  }, [scale]);

  const pop = () => {
    Animated.timing(scale, {
      toValue: 1.4,
      duration: 90,
      useNativeDriver: true,
    }).start(() => onCatch(treat.id, treat.golden));
  };

  return (
    <Animated.View
      style={[
        styles.treat,
        treat.golden && styles.goldenTreat,
        { left: treat.x, top: treat.y, transform: [{ scale }] },
      ]}
    >
      <TouchableOpacity onPress={pop} activeOpacity={0.8} hitSlop={12}>
        <Text style={styles.treatEmoji}>{treat.emoji}</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  gameContainer: {
    flex: 1,
  },
  // Menu
  menuContainer: {
    padding: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  menuTitle: {
    fontFamily: theme.fonts.bold,
    fontSize: 28,
    color: theme.colors.text,
  },
  menuSubtitle: {
    fontFamily: theme.fonts.regular,
    fontSize: 15,
    color: theme.colors.subtext,
    marginBottom: theme.spacing.sm,
  },
  gameCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    gap: theme.spacing.md,
    ...theme.shadows.small,
  },
  gameEmoji: {
    fontSize: 52,
  },
  gameInfo: {
    flex: 1,
  },
  gameTitle: {
    fontFamily: theme.fonts.bold,
    fontSize: 20,
    color: theme.colors.text,
    marginBottom: 4,
  },
  gameDesc: {
    fontFamily: theme.fonts.regular,
    fontSize: 14,
    color: theme.colors.subtext,
    lineHeight: 20,
    marginBottom: theme.spacing.sm,
  },
  gameMeta: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  metaChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: theme.colors.background,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.full,
  },
  metaText: {
    fontFamily: theme.fonts.semiBold,
    fontSize: 13,
    color: theme.colors.text,
  },
  freeChip: {
    backgroundColor: '#22C55E',
  },
  freeChipText: {
    color: 'white',
  },
  gameArrow: {
    fontSize: 32,
    color: theme.colors.gray,
    fontWeight: '300',
  },
  comingSoonCard: {
    alignItems: 'center',
    paddingVertical: theme.spacing.xl,
    gap: theme.spacing.xs,
  },
  comingSoonEmoji: {
    fontSize: 28,
  },
  comingSoonText: {
    fontFamily: theme.fonts.semiBold,
    fontSize: 14,
    color: theme.colors.gray,
  },
  // Spin screen
  spinContainer: {
    padding: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    alignSelf: 'flex-start',
    paddingVertical: 6,
  },
  backText: {
    fontFamily: theme.fonts.semiBold,
    fontSize: 16,
    color: theme.colors.text,
  },
  // Treat Catch HUD + arena (kept from the original game)
  hud: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    backgroundColor: theme.colors.card,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.lightGray,
  },
  hudLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    minWidth: 64,
  },
  scoreText: {
    fontFamily: theme.fonts.bold,
    fontSize: 20,
    color: theme.colors.text,
  },
  comboBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FF6B35',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.full,
    marginLeft: theme.spacing.sm,
  },
  comboText: {
    fontFamily: theme.fonts.bold,
    fontSize: 13,
    color: 'white',
  },
  timerContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginHorizontal: theme.spacing.md,
  },
  timerBar: {
    flex: 1,
    height: 10,
    backgroundColor: theme.colors.lightGray,
    borderRadius: 5,
    overflow: 'hidden',
  },
  timerFill: {
    height: '100%',
    backgroundColor: theme.colors.primary,
    borderRadius: 5,
  },
  timeText: {
    fontFamily: theme.fonts.semiBold,
    fontSize: 14,
    color: theme.colors.subtext,
    minWidth: 32,
  },
  quitButton: {
    padding: 8,
  },
  playArea: {
    flex: 1,
    margin: theme.spacing.md,
    backgroundColor: '#FFF9F0',
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
    ...theme.shadows.small,
  },
  treat: {
    position: 'absolute',
    width: TREAT_SIZE,
    height: TREAT_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  goldenTreat: {
    shadowColor: '#FFD93D',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 12,
  },
  treatEmoji: {
    fontSize: 44,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.94)',
    padding: theme.spacing.xl,
  },
  overlayEmoji: {
    fontSize: 64,
    marginBottom: theme.spacing.md,
  },
  overlayTitle: {
    fontFamily: theme.fonts.bold,
    fontSize: 28,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  overlayText: {
    fontFamily: theme.fonts.regular,
    fontSize: 16,
    color: theme.colors.subtext,
    textAlign: 'center',
    marginBottom: theme.spacing.lg,
    lineHeight: 24,
  },
  bestLine: {
    fontFamily: theme.fonts.semiBold,
    fontSize: 14,
    color: theme.colors.subtext,
    marginTop: theme.spacing.md,
  },
  newBestBadge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.full,
    marginBottom: theme.spacing.sm,
  },
  newBestText: {
    fontFamily: theme.fonts.bold,
    fontSize: 16,
    color: '#B45309',
  },
  resultScore: {
    fontFamily: theme.fonts.bold,
    fontSize: 26,
    color: theme.colors.primary,
    marginBottom: 4,
  },
  resultCombo: {
    fontFamily: theme.fonts.semiBold,
    fontSize: 15,
    color: theme.colors.subtext,
    marginBottom: theme.spacing.sm,
  },
  rewardRow: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },
  rewardText: {
    fontFamily: theme.fonts.semiBold,
    fontSize: 16,
    color: theme.colors.text,
    backgroundColor: theme.colors.lightGray,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.full,
  },
  resultButtons: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.full,
    ...theme.shadows.small,
  },
  primaryButtonText: {
    fontFamily: theme.fonts.semiBold,
    fontSize: 16,
    color: 'white',
  },
  secondaryButton: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.full,
    borderWidth: 1,
    borderColor: theme.colors.primary,
  },
  secondaryButtonText: {
    fontFamily: theme.fonts.semiBold,
    fontSize: 16,
    color: theme.colors.primary,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.xl,
  },
  emptyEmoji: {
    fontSize: 64,
    marginBottom: theme.spacing.md,
  },
  emptyTitle: {
    fontFamily: theme.fonts.bold,
    fontSize: 22,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  emptyText: {
    fontFamily: theme.fonts.regular,
    fontSize: 16,
    color: theme.colors.subtext,
    textAlign: 'center',
    marginBottom: theme.spacing.lg,
  },
});
