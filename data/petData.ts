export type PetType = 'bird' | 'cat' | 'dog' | 'rabbit';
export type CareAction = 'feed' | 'play' | 'sleep' | 'clean';

export interface PetTypeData {
  id: PetType;
  name: string;
  description: string;
  imageUrl: string;
  personality: string;
  sounds: string[];
  favoriteFood: string;
  favoriteActivity: string;
  customizations: PetCustomization[];
}

export interface PetCustomization {
  id: string;
  name: string;
  type: 'accessory' | 'color' | 'outfit';
  imageUrl: string;
  cost: number;
  description: string;
}

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
    imageUrl: 'https://i.imgur.com/oT4QTpb.png',
    personality: 'Cheerful and energetic',
    sounds: ['chirp', 'tweet', 'whistle'],
    favoriteFood: 'Seeds',
    favoriteActivity: 'Flying',
    customizations: [
      {
        id: 'bow-tie',
        name: 'Bow Tie',
        type: 'accessory',
        imageUrl: 'https://i.imgur.com/accessory1.png',
        cost: 100,
        description: 'A dapper bow tie for your sophisticated bird'
      },
      {
        id: 'top-hat',
        name: 'Top Hat',
        type: 'accessory',
        imageUrl: 'https://i.imgur.com/accessory2.png',
        cost: 150,
        description: 'A classy top hat for special occasions'
      }
    ]
  },
  cat: {
    id: 'cat',
    name: 'Kitten',
    description: 'A curious, playful companion who loves to cuddle and explore.',
    imageUrl: 'https://i.imgur.com/uQ0klP2.png',
    personality: 'Curious and affectionate',
    sounds: ['meow', 'purr', 'hiss'],
    favoriteFood: 'Fish',
    favoriteActivity: 'Pouncing',
    customizations: [
      {
        id: 'sunglasses',
        name: 'Cool Shades',
        type: 'accessory',
        imageUrl: 'https://i.imgur.com/accessory3.png',
        cost: 120,
        description: 'Stylish sunglasses for your cool cat'
      },
      {
        id: 'scarf',
        name: 'Cozy Scarf',
        type: 'accessory',
        imageUrl: 'https://i.imgur.com/accessory4.png',
        cost: 80,
        description: 'A warm scarf for chilly days'
      }
    ]
  },
  dog: {
    id: 'dog',
    name: 'Puppy',
    description: 'A loyal, energetic friend who loves to play and learn new tricks.',
    imageUrl: 'https://i.imgur.com/dog.png',
    personality: 'Playful and loyal',
    sounds: ['woof', 'bark', 'pant'],
    favoriteFood: 'Bones',
    favoriteActivity: 'Fetching',
    customizations: [
      {
        id: 'collar',
        name: 'Fancy Collar',
        type: 'accessory',
        imageUrl: 'https://i.imgur.com/accessory5.png',
        cost: 90,
        description: 'A stylish collar with a name tag'
      },
      {
        id: 'bandana',
        name: 'Adventure Bandana',
        type: 'accessory',
        imageUrl: 'https://i.imgur.com/accessory6.png',
        cost: 70,
        description: 'A cool bandana for outdoor adventures'
      }
    ]
  },
  rabbit: {
    id: 'rabbit',
    name: 'Bunny',
    description: 'A gentle, calm companion who loves carrots and hopping around.',
    imageUrl: 'https://i.imgur.com/9cBEfXN.png',
    personality: 'Gentle and curious',
    sounds: ['thump', 'squeak', 'purr'],
    favoriteFood: 'Carrots',
    favoriteActivity: 'Hopping',
    customizations: [
      {
        id: 'flower-crown',
        name: 'Flower Crown',
        type: 'accessory',
        imageUrl: 'https://i.imgur.com/accessory7.png',
        cost: 110,
        description: 'A beautiful crown made of flowers'
      },
      {
        id: 'bowtie',
        name: 'Polka Dot Bow',
        type: 'accessory',
        imageUrl: 'https://i.imgur.com/accessory8.png',
        cost: 85,
        description: 'A cute polka dot bow'
      }
    ]
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