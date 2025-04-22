import React, { createContext, useState, useContext, useEffect } from 'react';
import { Platform } from 'react-native';
import { Audio } from 'expo-av';
import { petTypes, PetType, CareAction, careActions, dailyTasks, DailyTask, PetCustomization } from '@/data/petData';
import * as Haptics from 'expo-haptics';

interface PetStats {
  happiness: number;
  hunger: number;
  energy: number;
  health: number;
}

interface Pet {
  id: string;
  name: string;
  type: PetType;
  level: number;
  experience: number;
  stats: PetStats;
  lastInteracted: Date;
  adopted: boolean;
  birthday: Date;
  customizations: string[];
}

interface PetContextType {
  pets: Pet[];
  currentPet: Pet | null;
  points: number;
  dailyTasks: DailyTask[];
  adoptPet: (type: PetType, name: string) => void;
  performCareAction: (action: CareAction) => void;
  selectPet: (id: string) => void;
  buyCustomization: (customization: PetCustomization) => boolean;
  applyCustomization: (petId: string, customizationId: string) => void;
  removeCustomization: (petId: string, customizationId: string) => void;
  resetDailyTasks: () => void;
}

const defaultStats: PetStats = {
  happiness: 80,
  hunger: 80,
  energy: 100,
  health: 100,
};

const PetContext = createContext<PetContextType | undefined>(undefined);

export const PetProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [pets, setPets] = useState<Pet[]>([]);
  const [currentPet, setCurrentPet] = useState<Pet | null>(null);
  const [points, setPoints] = useState(500); // Starting points
  const [tasks, setTasks] = useState(dailyTasks);
  const [sound, setSound] = useState<Audio.Sound | null>(null);

  // Initialize with a default pet for demo purposes
  useEffect(() => {
    if (pets.length === 0) {
      const defaultPet: Pet = {
        id: '1',
        name: 'Chirpy',
        type: 'bird',
        level: 1,
        experience: 0,
        stats: { ...defaultStats },
        lastInteracted: new Date(),
        adopted: true,
        birthday: new Date(),
        customizations: [],
      };
      
      setPets([defaultPet]);
      setCurrentPet(defaultPet);
    }
  }, []);

  // Reset daily tasks at midnight
  useEffect(() => {
    const now = new Date();
    const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
    const timeUntilMidnight = tomorrow.getTime() - now.getTime();

    const timer = setTimeout(() => {
      resetDailyTasks();
    }, timeUntilMidnight);

    return () => clearTimeout(timer);
  }, []);

  // Cleanup sound when component unmounts
  useEffect(() => {
    return sound
      ? () => {
          sound.unloadAsync();
        }
      : undefined;
  }, [sound]);

  const playSound = async (soundUrl: string) => {
    if (Platform.OS === 'web') return;
    
    try {
      const { sound: newSound } = await Audio.Sound.createAsync({ uri: soundUrl });
      setSound(newSound);
      await newSound.playAsync();
    } catch (error) {
      console.error('Error playing sound:', error);
    }
  };

  const resetDailyTasks = () => {
    setTasks(tasks.map(task => ({ ...task, completed: false })));
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
      
      // Trigger haptic feedback for task completion
      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    }
  };

  const adoptPet = (type: PetType, name: string) => {
    const newPet: Pet = {
      id: Date.now().toString(),
      name,
      type,
      level: 1,
      experience: 0,
      stats: { ...defaultStats },
      lastInteracted: new Date(),
      adopted: true,
      birthday: new Date(),
      customizations: [],
    };
    
    setPets(prev => [...prev, newPet]);
    setCurrentPet(newPet);
    
    // Play adoption sound
    playSound('https://assets.mixkit.co/active_storage/sfx/2574/2574-preview.mp3');
    
    // Award points for adopting
    setPoints(prev => prev + 200);
    
    // Trigger haptic feedback
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  };

  const performCareAction = async (action: CareAction) => {
    if (!currentPet) return;
    
    // Play action sound
    playSound(careActions[action].soundEffect);
    
    setPets(currentPets => 
      currentPets.map(pet => {
        if (pet.id === currentPet.id) {
          const newStats = { ...pet.stats };
          let experience = pet.experience;
          
          // Update stats based on action type
          switch (action) {
            case 'feed':
              newStats.hunger = Math.min(newStats.hunger + 20, 100);
              experience += 5;
              break;
            case 'play':
              newStats.happiness = Math.min(newStats.happiness + 20, 100);
              newStats.energy = Math.max(newStats.energy - 10, 0);
              experience += 10;
              break;
            case 'sleep':
              newStats.energy = Math.min(newStats.energy + 30, 100);
              experience += 5;
              break;
            case 'clean':
              newStats.health = Math.min(newStats.health + 15, 100);
              experience += 5;
              break;
          }
          
          // Calculate level based on experience
          const level = Math.floor(experience / 100) + 1;
          
          // Check for level up
          if (level > pet.level) {
            playSound('https://assets.mixkit.co/active_storage/sfx/2575/2575-preview.mp3');
            setPoints(prev => prev + 100); // Bonus points for leveling up
          }
          
          return {
            ...pet,
            stats: newStats,
            experience,
            level,
            lastInteracted: new Date(),
          };
        }
        return pet;
      })
    );
    
    // Check for task completion
    checkAndCompleteTask(action);
    
    // Update current pet
    setCurrentPet(prev => {
      if (!prev) return null;
      
      const updatedPet = pets.find(p => p.id === prev.id);
      return updatedPet || prev;
    });
  };

  const buyCustomization = (customization: PetCustomization): boolean => {
    if (points >= customization.cost) {
      setPoints(prev => prev - customization.cost);
      playSound('https://assets.mixkit.co/active_storage/sfx/2576/2576-preview.mp3');
      return true;
    }
    return false;
  };

  const applyCustomization = (petId: string, customizationId: string) => {
    setPets(prevPets =>
      prevPets.map(pet =>
        pet.id === petId
          ? { ...pet, customizations: [...pet.customizations, customizationId] }
          : pet
      )
    );
    playSound('https://assets.mixkit.co/active_storage/sfx/2577/2577-preview.mp3');
  };

  const removeCustomization = (petId: string, customizationId: string) => {
    setPets(prevPets =>
      prevPets.map(pet =>
        pet.id === petId
          ? {
              ...pet,
              customizations: pet.customizations.filter(id => id !== customizationId),
            }
          : pet
      )
    );
  };

  const selectPet = (id: string) => {
    const pet = pets.find(p => p.id === id);
    if (pet) {
      setCurrentPet(pet);
      playSound('https://assets.mixkit.co/active_storage/sfx/2578/2578-preview.mp3');
      
      // Trigger haptic feedback
      if (Platform.OS !== 'web') {
        Haptics.selectionAsync();
      }
    }
  };

  return (
    <PetContext.Provider
      value={{
        pets,
        currentPet,
        points,
        dailyTasks: tasks,
        adoptPet,
        performCareAction,
        selectPet,
        buyCustomization,
        applyCustomization,
        removeCustomization,
        resetDailyTasks,
      }}
    >
      {children}
    </PetContext.Provider>
  );
};

export const usePet = () => {
  const context = useContext(PetContext);
  if (context === undefined) {
    throw new Error('usePet must be used within a PetProvider');
  }
  return context;
};