import { ImageSourcePropType } from 'react-native';

export type PetType = 'bird' | 'cat' | 'dog' | 'rabbit';
export type CareAction = 'feed' | 'play' | 'sleep' | 'clean';

export interface PetTypeData {
  id: PetType;
  name: string;
  description: string;
  image: ImageSourcePropType;
  personality: string;
  sounds: string[];
  favoriteFood: string;
  favoriteActivity: string;
}

export interface PetCustomization {
  id: string;
  name: string;
  type: 'accessory' | 'color' | 'outfit';
  emoji: string;
  /** Real artwork; wired in once the v2 art lands. Falls back to emoji. */
  image?: ImageSourcePropType;
  cost: number;
  description: string;
}

// ---------------------------------------------------------------------------
// Universal accessory catalog: every pet can wear every accessory.
// ---------------------------------------------------------------------------

export const accessories: PetCustomization[] = [
  { id: 'bow-tie', name: 'Dapper Bow Tie', type: 'accessory', emoji: '🎀', cost: 100, description: 'A dapper bow tie for fancy days', image: require('../assets/images/accessories/bow-tie.png') },
  { id: 'top-hat', name: 'Classy Top Hat', type: 'accessory', emoji: '🎩', cost: 150, description: 'A classy top hat for special occasions', image: require('../assets/images/accessories/top-hat.png') },
  { id: 'sunglasses', name: 'Cool Shades', type: 'accessory', emoji: '🕶️', cost: 120, description: 'Stylish sunglasses for cool pets', image: require('../assets/images/accessories/sunglasses.png') },
  { id: 'scarf', name: 'Cozy Scarf', type: 'accessory', emoji: '🧣', cost: 80, description: 'A warm scarf for chilly days', image: require('../assets/images/accessories/scarf.png') },
  { id: 'collar', name: 'Fancy Collar', type: 'accessory', emoji: '📿', cost: 90, description: 'A stylish collar with a name tag', image: require('../assets/images/accessories/collar.png') },
  { id: 'bandana', name: 'Adventure Bandana', type: 'accessory', emoji: '🧢', cost: 70, description: 'A cool bandana for outdoor adventures', image: require('../assets/images/accessories/bandana.png') },
  { id: 'flower-crown', name: 'Flower Crown', type: 'accessory', emoji: '🌸', cost: 110, description: 'A beautiful crown made of flowers', image: require('../assets/images/accessories/flower-crown.png') },
  { id: 'polka-bow', name: 'Polka Dot Bow', type: 'accessory', emoji: '💖', cost: 85, description: 'A cute polka dot bow', image: require('../assets/images/accessories/polka-bow.png') },
];

export const accessoryById: Record<string, PetCustomization> =
  Object.fromEntries(accessories.map(a => [a.id, a]));

// ---------------------------------------------------------------------------
// Pet moods: the pet "speaks" through thought bubbles when it needs care.
// ---------------------------------------------------------------------------

export type PetMood = 'ecstatic' | 'hungry' | 'tired' | 'sick' | 'lonely' | 'content';

export function getPetMood(stats: { happiness: number; hunger: number; energy: number; health: number }): PetMood {
  if (stats.health < 30) return 'sick';
  if (stats.hunger < 30) return 'hungry';
  if (stats.energy < 30) return 'tired';
  if (stats.happiness < 30) return 'lonely';
  if (stats.happiness > 75 && stats.hunger > 60) return 'ecstatic';
  return 'content';
}

export const petMoods: Record<PetMood, { emoji: string; text: string }> = {
  ecstatic: { emoji: '💛', text: 'Best day ever!' },
  hungry: { emoji: '🍽️', text: "I'm so hungry!" },
  tired: { emoji: '😴', text: 'So sleepy...' },
  sick: { emoji: '🤒', text: 'I feel sick...' },
  lonely: { emoji: '🥺', text: 'Play with me?' },
  content: { emoji: '💭', text: 'Pawth life!' },
};

export interface DailyTask {
  id: string;
  description: string;
  points: number;
  type: CareAction;
  completed: boolean;
}

export const petTypes: Record<PetType, PetTypeData> = {
  bird: {
    id: 'bird',
    name: 'Finch',
    description: 'A cheerful, energetic companion who loves to sing and fly around.',
    image: require('../assets/images/pets/v2/bird.png'),
    personality: 'Cheerful and energetic',
    sounds: ['chirp', 'tweet', 'whistle'],
    favoriteFood: 'Seeds',
    favoriteActivity: 'Flying',
  },
  cat: {
    id: 'cat',
    name: 'Kitten',
    description: 'A curious, playful companion who loves to cuddle and explore.',
    image: require('../assets/images/pets/v2/cat.png'),
    personality: 'Curious and affectionate',
    sounds: ['meow', 'purr', 'hiss'],
    favoriteFood: 'Fish',
    favoriteActivity: 'Pouncing',
  },
  dog: {
    id: 'dog',
    name: 'Puppy',
    description: 'A loyal, energetic friend who loves to play and learn new tricks.',
    image: require('../assets/images/pets/v2/dog.png'),
    personality: 'Playful and loyal',
    sounds: ['woof', 'bark', 'pant'],
    favoriteFood: 'Bones',
    favoriteActivity: 'Fetching',
  },
  rabbit: {
    id: 'rabbit',
    name: 'Bunny',
    description: 'A gentle, calm companion who loves carrots and hopping around.',
    image: require('../assets/images/pets/v2/rabbit.png'),
    personality: 'Gentle and curious',
    sounds: ['thump', 'squeak', 'purr'],
    favoriteFood: 'Carrots',
    favoriteActivity: 'Hopping',
  }
};

export const careActions: Record<CareAction, {
  id: CareAction;
  label: string;
  icon: string;
  description: string;
  effect: string;
  soundEffect: string;
}> = {
  feed: {
    id: 'feed',
    label: 'Feed',
    icon: 'utensils',
    description: 'Give your pet some food to satisfy their hunger.',
    effect: 'Increases hunger level',
    soundEffect: 'https://assets.mixkit.co/active_storage/sfx/2570/2570-preview.mp3'
  },
  play: {
    id: 'play',
    label: 'Play',
    icon: 'heart',
    description: 'Play with your pet to increase their happiness.',
    effect: 'Increases happiness, decreases energy',
    soundEffect: 'https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3'
  },
  sleep: {
    id: 'sleep',
    label: 'Sleep',
    icon: 'moon',
    description: 'Let your pet take a nap to restore energy.',
    effect: 'Increases energy',
    soundEffect: 'https://assets.mixkit.co/active_storage/sfx/2572/2572-preview.mp3'
  },
  clean: {
    id: 'clean',
    label: 'Clean',
    icon: 'shower',
    description: 'Keep your pet clean and healthy.',
    effect: 'Increases health',
    soundEffect: 'https://assets.mixkit.co/active_storage/sfx/2573/2573-preview.mp3'
  }
};

export const dailyTasks: DailyTask[] = [
  {
    id: 'feed-morning',
    description: 'Feed your pet in the morning',
    points: 50,
    type: 'feed',
    completed: false
  },
  {
    id: 'play-afternoon',
    description: 'Play with your pet for 5 minutes',
    points: 75,
    type: 'play',
    completed: false
  },
  {
    id: 'clean-evening',
    description: 'Clean your pet before bedtime',
    points: 50,
    type: 'clean',
    completed: false
  },
  {
    id: 'sleep-night',
    description: 'Ensure your pet gets proper rest',
    points: 50,
    type: 'sleep',
    completed: false
  }
];

// ---------------------------------------------------------------------------
// Evolution: pets grow through stages as they level up
// ---------------------------------------------------------------------------

export interface EvolutionStage {
  name: string;
  emoji: string;
  minLevel: number;
  /** Visual scale applied to the pet art for this stage */
  scale: number;
}

export const evolutionStages: EvolutionStage[] = [
  { name: 'Baby', emoji: '🍼', minLevel: 1, scale: 0.85 },
  { name: 'Buddy', emoji: '🌟', minLevel: 5, scale: 1 },
  { name: 'Star', emoji: '⭐', minLevel: 10, scale: 1.12 },
  { name: 'Legend', emoji: '👑', minLevel: 20, scale: 1.25 },
];

export function getEvolutionStage(level: number): EvolutionStage {
  let stage = evolutionStages[0];
  for (const s of evolutionStages) {
    if (level >= s.minLevel) stage = s;
  }
  return stage;
}

// ---------------------------------------------------------------------------
// Daily login rewards: streak day -> bonus points
// ---------------------------------------------------------------------------

export const dailyRewards: Record<number, number> = {
  1: 25,
  2: 40,
  3: 60,
  4: 85,
  5: 115,
  6: 150,
  7: 200,
};

/** Points awarded for a streak of N days (caps at the day-7 reward). */
export function rewardForStreak(day: number): number {
  return dailyRewards[Math.min(day, 7)];
}

// ---------------------------------------------------------------------------
// Achievements
// ---------------------------------------------------------------------------

export interface Achievement {
  id: string;
  name: string;
  description: string;
  emoji: string;
  points: number;
}

// ---------------------------------------------------------------------------
// Lucky Spin reel rewards (variable-ratio rewards: the addictive core loop)
// ---------------------------------------------------------------------------

export interface SpinReward {
  id: string;
  label: string;
  emoji: string;
  type: 'points' | 'xp';
  amount: number;
  /** Relative likelihood of landing on this reward */
  weight: number;
}

export const spinRewards: SpinReward[] = [
  { id: 'p10', label: '+10 pts', emoji: '🪙', type: 'points', amount: 10, weight: 25 },
  { id: 'p25', label: '+25 pts', emoji: '🪙', type: 'points', amount: 25, weight: 20 },
  { id: 'x5', label: '+5 XP', emoji: '⚡', type: 'xp', amount: 5, weight: 20 },
  { id: 'p50', label: '+50 pts', emoji: '💰', type: 'points', amount: 50, weight: 15 },
  { id: 'x15', label: '+15 XP', emoji: '⚡', type: 'xp', amount: 15, weight: 10 },
  { id: 'p100', label: '+100 pts', emoji: '💎', type: 'points', amount: 100, weight: 7 },
  { id: 'x30', label: '+30 XP', emoji: '🌟', type: 'xp', amount: 30, weight: 2 },
  { id: 'jackpot', label: 'JACKPOT +250', emoji: '🎰', type: 'points', amount: 250, weight: 1 },
];

/** Points a paid spin costs (first spin each day is free). */
export const SPIN_COST = 50;

// ---------------------------------------------------------------------------
// Achievements
// ---------------------------------------------------------------------------

export const achievements: Achievement[] = [
  { id: 'first-friend', name: 'First Friend', description: 'Adopt your first pet', emoji: '🐾', points: 50 },
  { id: 'caretaker-10', name: 'Getting the Hang', description: 'Perform 10 care actions', emoji: '💛', points: 30 },
  { id: 'caretaker-100', name: 'Devoted Caretaker', description: 'Perform 100 care actions', emoji: '🏅', points: 150 },
  { id: 'level-5', name: 'Growing Up', description: 'Reach level 5 with any pet', emoji: '🌟', points: 100 },
  { id: 'level-10', name: 'Superstar', description: 'Reach level 10 with any pet', emoji: '⭐', points: 250 },
  { id: 'streak-3', name: 'On a Roll', description: 'Keep a 3-day login streak', emoji: '🔥', points: 75 },
  { id: 'streak-7', name: 'Unstoppable', description: 'Keep a 7-day login streak', emoji: '🚀', points: 200 },
  { id: 'collector-3', name: 'Pet Collector', description: 'Adopt 3 pets', emoji: '🏠', points: 150 },
  { id: 'gamer-5', name: 'Game Time', description: 'Play 5 minigames', emoji: '🎮', points: 100 },
  { id: 'rich-1000', name: 'Big Spender', description: 'Hold 1,000 points at once', emoji: '💰', points: 50 },
  { id: 'spinner-1', name: 'Feeling Lucky', description: 'Spin the Lucky Reel', emoji: '🎰', points: 25 },
  { id: 'combo-10', name: 'Combo Master', description: 'Reach a 10x combo in Treat Catch', emoji: '⚡', points: 100 },
  { id: 'evolved-1', name: 'Evolution!', description: 'Evolve a pet to a new stage', emoji: '🦋', points: 150 },
];
