import React, { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';
import { Audio } from 'expo-av';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  PetType,
  CareAction,
  careActions,
  dailyTasks as seedDailyTasks,
  DailyTask,
  PetCustomization,
  Achievement,
  achievements,
  rewardForStreak,
  SpinReward,
  spinRewards,
  SPIN_COST,
  EvolutionStage,
  getEvolutionStage,
  MoodType,
  MoodEntry,
  moodById,
} from '@/data/petData';

const STORAGE_KEY = '@pawth:save:v2';

interface PetStats {
  happiness: number;
  hunger: number;
  energy: number;
  health: number;
}

export interface Pet {
  id: string;
  name: string;
  type: PetType;
  stats: PetStats;
  level: number;
  experience: number;
  createdAt: string;
  lastInteracted: string;
  customizations: string[];
  activeCustomization?: string;
}

export interface DailyReward {
  day: number;
  points: number;
}

export interface EvolutionCelebration {
  petName: string;
  stage: EvolutionStage;
}

interface SaveData {
  version: number;
  pets: Pet[];
  currentPetId: string | null;
  points: number;
  tasks: DailyTask[];
  streak: number;
  lastLoginDay: string | null;
  achievements: string[];
  careActionCount: number;
  minigamesPlayed: number;
  spinsCount: number;
  bestCombo: number;
  evolutionsCount: number;
  treatBest: number;
  lastFreeSpinDay: string | null;
  soundEnabled: boolean;
  moodEntries: MoodEntry[];
  trailsWalked: number;
  lastChatDay: string | null;
  calmSessionsCount: number;
  savedAt: string;
}

interface PetContextType {
  pets: Pet[];
  currentPet: Pet | null;
  currentPetId: string | null;
  dailyTasks: DailyTask[];
  points: number;
  streak: number;
  achievements: string[];
  dailyReward: DailyReward | null;
  achievementToast: Achievement | null;
  soundEnabled: boolean;
  careActionCount: number;
  minigamesPlayed: number;
  evolutionCelebration: EvolutionCelebration | null;
  dismissEvolution: () => void;
  freeSpinAvailable: boolean;
  spinCount: number;
  bestCombo: number;
  treatBest: number;
  spinWheel: () => { reward: SpinReward; cost: number; targetIndex: number; fullTurns: number } | null;
  recordCombo: (combo: number) => void;
  recordTreatScore: (score: number) => void;
  moodEntries: MoodEntry[];
  todaysMood: MoodEntry | null;
  moodStreak: number;
  logMood: (mood: MoodType, note?: string) => void;
  trailsWalked: number;
  completeTrailWalk: (minutes: number) => { xp: number; points: number };
  chatBonusAvailable: boolean;
  recordChatInteraction: () => void;
  calmSessionsCount: number;
  completeCalmSession: (kind: 'breathing' | 'grounding') => { xp: number; points: number };
  adoptPet: (type: PetType, name: string) => void;
  selectPet: (id: string) => void;
  performCareAction: (action: CareAction) => void;
  buyCustomization: (customization: PetCustomization) => boolean;
  applyCustomization: (petId: string, customizationId: string) => void;
  resetDailyTasks: () => void;
  rewardMinigame: (catches: number) => { xp: number; points: number };
  addPoints: (n: number) => void;
  toggleSound: () => void;
  dismissDailyReward: () => void;
}

const PetContext = createContext<PetContextType | undefined>(undefined);

export const usePet = () => {
  const context = useContext(PetContext);
  if (!context) {
    throw new Error('usePet must be used within a PetProvider');
  }
  return context;
};

// Local calendar-day key, e.g. "2026-09-15"
function dayKey(offsetDays = 0): string {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

// One tick of needs decay: pets get hungry and bored over time.
function applyDecay(pet: Pet): Pet {
  const stats = { ...pet.stats };
  stats.hunger = Math.max(0, stats.hunger - 2);
  stats.happiness = Math.max(0, stats.happiness - 2);
  stats.energy = Math.max(0, stats.energy - 1);
  if (stats.hunger <= 0) {
    stats.health = Math.max(0, stats.health - 3);
  } else if (stats.hunger > 50 && stats.happiness > 50) {
    stats.health = Math.min(100, stats.health + 1);
  }
  return { ...pet, stats };
}

function makeDefaultPet(): Pet {
  const now = new Date().toISOString();
  return {
    id: `pet-${Date.now()}`,
    name: 'Chirpy',
    type: 'bird',
    stats: { happiness: 70, hunger: 60, energy: 80, health: 90 },
    level: 1,
    experience: 0,
    createdAt: now,
    lastInteracted: now,
    customizations: [],
  };
}

export const PetProvider = ({ children }: { children: ReactNode }) => {
  const [pets, setPets] = useState<Pet[]>([]);
  const [currentPetId, setCurrentPetId] = useState<string | null>(null);
  const [tasks, setTasks] = useState<DailyTask[]>(() => seedDailyTasks.map(t => ({ ...t })));
  const [points, setPoints] = useState(500);
  const [streak, setStreak] = useState(0);
  const [lastLoginDay, setLastLoginDay] = useState<string | null>(null);
  const [unlockedAchievements, setUnlockedAchievements] = useState<string[]>([]);
  const [careActionCount, setCareActionCount] = useState(0);
  const [minigamesPlayed, setMinigamesPlayed] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [dailyReward, setDailyReward] = useState<DailyReward | null>(null);
  const [achievementToast, setAchievementToast] = useState<Achievement | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [spinsCount, setSpinsCount] = useState(0);
  const [bestCombo, setBestCombo] = useState(0);
  const [evolutionsCount, setEvolutionsCount] = useState(0);
  const [treatBest, setTreatBest] = useState(0);
  const [lastFreeSpinDay, setLastFreeSpinDay] = useState<string | null>(null);
  const [evolutionCelebration, setEvolutionCelebration] = useState<EvolutionCelebration | null>(null);
  const celebratedStageRef = useRef<Record<string, string>>({});
  const [moodEntries, setMoodEntries] = useState<MoodEntry[]>([]);
  const [trailsWalked, setTrailsWalked] = useState(0);
  const [lastChatDay, setLastChatDay] = useState<string | null>(null);
  const [calmSessionsCount, setCalmSessionsCount] = useState(0);

  const soundEnabledRef = useRef(soundEnabled);
  useEffect(() => {
    soundEnabledRef.current = soundEnabled;
  }, [soundEnabled]);

  const currentPet = pets.find(p => p.id === currentPetId) ?? null;

  const todaysMood = moodEntries.find(m => m.date === dayKey()) ?? null;

  // Consecutive days (ending today or yesterday) with a mood check-in logged.
  const moodStreak = (() => {
    if (moodEntries.length === 0) return 0;
    const dates = new Set(moodEntries.map(m => m.date));
    const today = dayKey();
    let offset = dates.has(today) ? 0 : 1;
    if (!dates.has(dayKey(-offset))) return 0;
    let streakCount = 0;
    while (dates.has(dayKey(-offset))) {
      streakCount++;
      offset++;
    }
    return streakCount;
  })();

  // ---- Daily login / streak ------------------------------------------------
  const grantDailyReward = (day: number) => {
    const reward = rewardForStreak(day);
    setDailyReward({ day, points: reward });
    setPoints(prev => prev + reward);
  };

  const handleDailyLogin = (prevStreak: number, prevLoginDay: string | null) => {
    const today = dayKey();
    const yesterday = dayKey(-1);
    if (prevLoginDay === today) {
      setStreak(prevStreak);
    } else if (prevLoginDay === yesterday) {
      const next = prevStreak + 1;
      setStreak(next);
      grantDailyReward(next);
    } else {
      setStreak(1);
      grantDailyReward(1);
    }
    setLastLoginDay(today);
  };

  // ---- Load persisted state -------------------------------------------------
  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) {
          const data: SaveData = JSON.parse(raw);

          // Offline decay: 1 tick per hour away, capped at 12 ticks.
          const hoursAway = Math.min(
            12,
            Math.max(0, Math.floor((Date.now() - new Date(data.savedAt).getTime()) / 3600000))
          );
          let restoredPets = data.pets;
          for (let i = 0; i < hoursAway; i++) {
            restoredPets = restoredPets.map(applyDecay);
          }

          setPets(restoredPets);
          setCurrentPetId(data.currentPetId);
          setPoints(data.points);
          setTasks(data.tasks && data.tasks.length ? data.tasks : seedDailyTasks.map(t => ({ ...t })));
          setUnlockedAchievements(data.achievements ?? []);
          setCareActionCount(data.careActionCount ?? 0);
          setMinigamesPlayed(data.minigamesPlayed ?? 0);
          setSpinsCount(data.spinsCount ?? 0);
          setBestCombo(data.bestCombo ?? 0);
          setEvolutionsCount(data.evolutionsCount ?? 0);
          setTreatBest(data.treatBest ?? 0);
          setLastFreeSpinDay(data.lastFreeSpinDay ?? null);
          setSoundEnabled(data.soundEnabled ?? true);
          setMoodEntries(data.moodEntries ?? []);
          setTrailsWalked(data.trailsWalked ?? 0);
          setLastChatDay(data.lastChatDay ?? null);
          setCalmSessionsCount(data.calmSessionsCount ?? 0);
          handleDailyLogin(data.streak ?? 0, data.lastLoginDay ?? null);
        } else {
          // First launch: seed a starter pet and a welcome reward.
          const starter = makeDefaultPet();
          setPets([starter]);
          setCurrentPetId(starter.id);
          setTasks(seedDailyTasks.map(t => ({ ...t })));
          setStreak(1);
          setLastLoginDay(dayKey());
          grantDailyReward(1);
        }
      } catch {
        const starter = makeDefaultPet();
        setPets([starter]);
        setCurrentPetId(starter.id);
      }
      setLoaded(true);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---- Persist on every change ----------------------------------------------
  useEffect(() => {
    if (!loaded) return;
    const data: SaveData = {
      version: 2,
      pets,
      currentPetId,
      points,
      tasks,
      streak,
      lastLoginDay,
      achievements: unlockedAchievements,
      careActionCount,
      minigamesPlayed,
      spinsCount,
      bestCombo,
      evolutionsCount,
      treatBest,
      lastFreeSpinDay,
      soundEnabled,
      moodEntries,
      trailsWalked,
      lastChatDay,
      calmSessionsCount,
      savedAt: new Date().toISOString(),
    };
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data)).catch(() => {});
  }, [loaded, pets, currentPetId, points, tasks, streak, lastLoginDay, unlockedAchievements, careActionCount, minigamesPlayed, spinsCount, bestCombo, evolutionsCount, treatBest, lastFreeSpinDay, soundEnabled, moodEntries, trailsWalked, lastChatDay, calmSessionsCount]);

  // ---- Live needs decay (1 tick per minute) ----------------------------------
  useEffect(() => {
    if (!loaded) return;
    const interval = setInterval(() => {
      setPets(prev => prev.map(applyDecay));
    }, 60000);
    return () => clearInterval(interval);
  }, [loaded]);

  // ---- Reset daily tasks at midnight -----------------------------------------
  useEffect(() => {
    if (!loaded) return;
    const now = new Date();
    const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
    const timeUntilMidnight = tomorrow.getTime() - now.getTime();

    const timer = setTimeout(() => {
      setTasks(prevTasks => prevTasks.map(task => ({ ...task, completed: false })));
    }, timeUntilMidnight);

    return () => clearTimeout(timer);
  }, [loaded]);

  // ---- Achievements -----------------------------------------------------------
  useEffect(() => {
    if (!loaded) return;
    const meets = (id: string): boolean => {
      switch (id) {
        case 'first-friend': return pets.length >= 1;
        case 'caretaker-10': return careActionCount >= 10;
        case 'caretaker-100': return careActionCount >= 100;
        case 'level-5': return pets.some(p => p.level >= 5);
        case 'level-10': return pets.some(p => p.level >= 10);
        case 'streak-3': return streak >= 3;
        case 'streak-7': return streak >= 7;
        case 'collector-3': return pets.length >= 3;
        case 'gamer-5': return minigamesPlayed >= 5;
        case 'rich-1000': return points >= 1000;
        case 'spinner-1': return spinsCount >= 1;
        case 'combo-10': return bestCombo >= 10;
        case 'evolved-1': return evolutionsCount >= 1;
        case 'mood-streak-3': return moodStreak >= 3;
        case 'mood-streak-7': return moodStreak >= 7;
        case 'trailblazer-1': return trailsWalked >= 1;
        case 'calm-1': return calmSessionsCount >= 1;
        default: return false;
      }
    };
    const newly = achievements.filter(a => !unlockedAchievements.includes(a.id) && meets(a.id));
    if (newly.length > 0) {
      setUnlockedAchievements(prev => [...prev, ...newly.map(a => a.id)]);
      setPoints(prev => prev + newly.reduce((sum, a) => sum + a.points, 0));
      setAchievementToast(newly[0]);
    }
  }, [loaded, pets, careActionCount, minigamesPlayed, streak, points, unlockedAchievements, spinsCount, bestCombo, evolutionsCount, moodStreak, trailsWalked, calmSessionsCount]);

  // ---- Evolution celebration --------------------------------------------------
  // Watches each pet's evolution stage; when a stage advances, queue a
  // celebration modal and count it (once per evolution).
  useEffect(() => {
    if (!loaded) return;
    for (const pet of pets) {
      const stage = getEvolutionStage(pet.level);
      const prev = celebratedStageRef.current[pet.id];
      if (!prev) {
        celebratedStageRef.current[pet.id] = stage.name;
      } else if (prev !== stage.name) {
        celebratedStageRef.current[pet.id] = stage.name;
        setEvolutionsCount(c => c + 1);
        setEvolutionCelebration({ petName: pet.name, stage });
        break;
      }
    }
  }, [loaded, pets]);

  // Auto-dismiss the achievement toast.
  useEffect(() => {
    if (!achievementToast) return;
    const t = setTimeout(() => setAchievementToast(null), 3500);
    return () => clearTimeout(t);
  }, [achievementToast]);

  const playSound = async (soundUri: string) => {
    if (!soundEnabledRef.current) return;
    try {
      const { sound } = await Audio.Sound.createAsync({ uri: soundUri });
      await sound.playAsync();
      sound.setOnPlaybackStatusUpdate(status => {
        if (status.isLoaded && status.didJustFinish) {
          sound.unloadAsync();
        }
      });
    } catch (error) {
      console.log('Error playing sound:', error);
    }
  };

  const selectPet = (id: string) => {
    setCurrentPetId(id);
  };

  const adoptPet = (type: PetType, name: string) => {
    const now = new Date().toISOString();
    const baseStats: Record<PetType, PetStats> = {
      bird: { happiness: 70, hunger: 60, energy: 80, health: 90 },
      cat: { happiness: 65, hunger: 55, energy: 75, health: 85 },
      dog: { happiness: 80, hunger: 70, energy: 90, health: 95 },
      rabbit: { happiness: 75, hunger: 65, energy: 70, health: 90 },
    };
    const newPet: Pet = {
      id: `pet-${Date.now()}`,
      name,
      type,
      stats: { ...baseStats[type] },
      level: 1,
      experience: 0,
      createdAt: now,
      lastInteracted: now,
      customizations: [],
    };
    setPets(prev => [...prev, newPet]);
    setCurrentPetId(newPet.id);
    playSound('https://assets.mixkit.co/active_storage/sfx/2574/2574-preview.mp3');
  };

  const addExperience = (pet: Pet, xp: number): Pet => {
    const experience = pet.experience + xp;
    const level = Math.floor(experience / 100) + 1;
    if (level > pet.level) {
      playSound('https://assets.mixkit.co/active_storage/sfx/2575/2575-preview.mp3');
      setPoints(prev => prev + 100); // Bonus points for leveling up
    }
    return { ...pet, experience, level, lastInteracted: new Date().toISOString() };
  };

  const performCareAction = async (action: CareAction) => {
    const pet = pets.find(p => p.id === currentPetId);
    if (!pet) return;

    playSound(careActions[action].soundEffect);

    const applyAction = (p: Pet): Pet => {
      const stats = { ...p.stats };
      let xp = 0;
      switch (action) {
        case 'feed':
          stats.hunger = Math.min(stats.hunger + 20, 100);
          xp = 5;
          break;
        case 'play':
          stats.happiness = Math.min(stats.happiness + 20, 100);
          stats.energy = Math.max(stats.energy - 10, 0);
          xp = 10;
          break;
        case 'sleep':
          stats.energy = Math.min(stats.energy + 30, 100);
          xp = 5;
          break;
        case 'clean':
          stats.health = Math.min(stats.health + 15, 100);
          xp = 5;
          break;
      }
      return addExperience({ ...p, stats }, xp);
    };

    // currentPet is derived from pets + currentPetId, so updating pets is enough.
    setPets(prevPets => prevPets.map(p => (p.id === pet.id ? applyAction(p) : p)));
    setCareActionCount(c => c + 1);

    checkAndCompleteTask(action);
  };

  const checkAndCompleteTask = (action: CareAction) => {
    const taskToComplete = tasks.find(task => !task.completed && task.type === action);
    if (taskToComplete) {
      setTasks(prevTasks =>
        prevTasks.map(task =>
          task.id === taskToComplete.id ? { ...task, completed: true } : task
        )
      );
      setPoints(prev => prev + taskToComplete.points);
      playSound('https://assets.mixkit.co/active_storage/sfx/2576/2576-preview.mp3');
    }
  };

  const resetDailyTasks = () => {
    setTasks(prevTasks => prevTasks.map(task => ({ ...task, completed: false })));
  };

  const buyCustomization = (customization: PetCustomization) => {
    if (!currentPet) return false;
    if (points < customization.cost || currentPet.customizations.includes(customization.id)) {
      return false;
    }
    setPoints(prev => prev - customization.cost);
    setPets(prevPets =>
      prevPets.map(pet =>
        pet.id === currentPet.id
          ? { ...pet, customizations: [...pet.customizations, customization.id] }
          : pet
      )
    );
    playSound('https://assets.mixkit.co/active_storage/sfx/2577/2577-preview.mp3');
    return true;
  };

  const applyCustomization = (petId: string, customizationId: string) => {
    setPets(prevPets =>
      prevPets.map(pet =>
        pet.id === petId ? { ...pet, activeCustomization: customizationId } : pet
      )
    );
  };

  // Minigame rewards: XP scales with catches, plus a points payout.
  const rewardMinigame = (catches: number) => {
    const xp = catches * 3;
    const pts = catches * 5;
    if (currentPetId) {
      setPets(prevPets =>
        prevPets.map(p => (p.id === currentPetId ? addExperience(p, xp) : p))
      );
    }
    setPoints(prev => prev + pts);
    setMinigamesPlayed(n => n + 1);
    checkAndCompleteTask('play');
    return { xp, points: pts };
  };

  const addPoints = (n: number) => {
    setPoints(prev => prev + n);
  };

  // ---- Lucky Spin -------------------------------------------------------------
  // Variable-ratio reward schedule: free once per day, then costs points.
  // Returns the landed reward plus animation parameters for the reel.
  const freeSpinAvailable = lastFreeSpinDay !== dayKey();

  const spinWheel = () => {
    const today = dayKey();
    const free = lastFreeSpinDay !== today;
    const cost = free ? 0 : SPIN_COST;
    if (points < cost) return null;

    // Weighted random pick. `roll` lands in [0, totalWeight); each reward
    // owns the half-open segment [cumWeight, cumWeight + weight), so a roll
    // landing exactly on a boundary belongs to the later segment.
    const totalWeight = spinRewards.reduce((s, r) => s + r.weight, 0);
    let roll = Math.random() * totalWeight;
    let targetIndex = spinRewards.length - 1;
    for (let i = 0; i < spinRewards.length; i++) {
      roll -= spinRewards[i].weight;
      if (roll < 0) { targetIndex = i; break; }
    }
    const reward = spinRewards[targetIndex];

    if (free) {
      setLastFreeSpinDay(today);
    } else {
      setPoints(prev => prev - cost);
    }

    if (reward.type === 'points') {
      setPoints(prev => prev + reward.amount);
    } else if (currentPetId) {
      setPets(prevPets =>
        prevPets.map(p => (p.id === currentPetId ? addExperience(p, reward.amount) : p))
      );
    }
    setSpinsCount(c => c + 1);
    playSound('https://assets.mixkit.co/active_storage/sfx/2576/2576-preview.mp3');
    return { reward, cost, targetIndex, fullTurns: 5 + Math.floor(Math.random() * 3) };
  };

  const recordCombo = (combo: number) => {
    setBestCombo(prev => Math.max(prev, combo));
  };

  const recordTreatScore = (score: number) => {
    setTreatBest(prev => Math.max(prev, score));
  };

  // ---- Mood tracker -----------------------------------------------------------
  // Logging a mood is a real-world self-care habit: it always nudges the
  // active pet's happiness up a little, regardless of how the day went.
  const logMood = (mood: MoodType, note: string = '') => {
    const today = dayKey();
    const entry: MoodEntry = { date: today, mood, note, loggedAt: new Date().toISOString() };
    setMoodEntries(prev => [...prev.filter(m => m.date !== today), entry]);

    const bonus = moodById[mood].petBonus;
    if (currentPetId) {
      setPets(prevPets =>
        prevPets.map(p =>
          p.id === currentPetId
            ? { ...p, stats: { ...p.stats, happiness: Math.min(100, p.stats.happiness + bonus) } }
            : p
        )
      );
    }
    playSound('https://assets.mixkit.co/active_storage/sfx/2576/2576-preview.mp3');
  };

  // ---- Nearby Trails -----------------------------------------------------------
  // Rewards a completed real-world walk with pet XP and points, same payout
  // shape as the minigames.
  const completeTrailWalk = (minutes: number) => {
    const xp = Math.max(5, Math.round(minutes * 2));
    const pts = Math.max(10, Math.round(minutes * 4));
    if (currentPetId) {
      setPets(prevPets =>
        prevPets.map(p => (p.id === currentPetId ? addExperience(p, xp) : p))
      );
    }
    setPoints(prev => prev + pts);
    setTrailsWalked(n => n + 1);
    playSound('https://assets.mixkit.co/active_storage/sfx/2576/2576-preview.mp3');
    return { xp, points: pts };
  };

  // ---- Calm Corner (breathing / grounding) --------------------------------
  const completeCalmSession = (kind: 'breathing' | 'grounding') => {
    const xp = 8;
    const pts = 15;
    if (currentPetId) {
      setPets(prevPets =>
        prevPets.map(p =>
          p.id === currentPetId
            ? {
                ...addExperience(p, xp),
                stats: { ...p.stats, happiness: Math.min(100, p.stats.happiness + 6) },
              }
            : p
        )
      );
    }
    setPoints(prev => prev + pts);
    setCalmSessionsCount(c => c + 1);
    playSound('https://assets.mixkit.co/active_storage/sfx/2576/2576-preview.mp3');
    return { xp, points: pts };
  };

  const chatBonusAvailable = lastChatDay !== dayKey();

  // First conversation of the day gives the pet a little happiness/points
  // boost — same "real interaction" logic as the mood check-in.
  const recordChatInteraction = () => {
    if (!chatBonusAvailable) return;
    setLastChatDay(dayKey());
    if (currentPetId) {
      setPets(prevPets =>
        prevPets.map(p =>
          p.id === currentPetId
            ? { ...p, stats: { ...p.stats, happiness: Math.min(100, p.stats.happiness + 5) } }
            : p
        )
      );
    }
    setPoints(prev => prev + 10);
  };

  const dismissEvolution = () => {
    setEvolutionCelebration(null);
  };

  const toggleSound = () => {
    setSoundEnabled(prev => !prev);
  };

  const dismissDailyReward = () => {
    setDailyReward(null);
  };

  return (
    <PetContext.Provider
      value={{
        pets,
        currentPet,
        currentPetId,
        dailyTasks: tasks,
        points,
        streak,
        achievements: unlockedAchievements,
        dailyReward,
        achievementToast,
        soundEnabled,
        careActionCount,
        minigamesPlayed,
        evolutionCelebration,
        dismissEvolution,
        freeSpinAvailable,
        spinCount: spinsCount,
        bestCombo,
        treatBest,
        spinWheel,
        recordCombo,
        recordTreatScore,
        moodEntries,
        todaysMood,
        moodStreak,
        logMood,
        trailsWalked,
        completeTrailWalk,
        chatBonusAvailable,
        recordChatInteraction,
        calmSessionsCount,
        completeCalmSession,
        adoptPet,
        selectPet,
        performCareAction,
        buyCustomization,
        applyCustomization,
        resetDailyTasks,
        rewardMinigame,
        addPoints,
        toggleSound,
        dismissDailyReward,
      }}
    >
      {children}
    </PetContext.Provider>
  );
};
