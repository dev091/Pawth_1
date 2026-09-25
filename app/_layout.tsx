import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { useFonts, Nunito_400Regular, Nunito_600SemiBold, Nunito_700Bold } from '@expo-google-fonts/nunito';
import { SplashScreen } from 'expo-router';
import { PetProvider } from '@/context/PetContext';
import DailyRewardModal from '@/components/DailyRewardModal';
import AchievementToast from '@/components/AchievementToast';
import EvolutionModal from '@/components/EvolutionModal';

// Prevent splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  useFrameworkReady();

  const [fontsLoaded, fontError] = useFonts({
    'Nunito-Regular': Nunito_400Regular,
    'Nunito-SemiBold': Nunito_600SemiBold,
    'Nunito-Bold': Nunito_700Bold,
  });

  // Hide splash screen once fonts are loaded
  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  // Return null to keep splash screen visible while fonts load
  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <PetProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="mood-history"
          options={{
            headerShown: true,
            title: 'Mood History',
            headerStyle: { backgroundColor: '#FBF6EE' },
            headerTitleStyle: { fontFamily: 'Nunito-Bold' },
          }}
        />
        <Stack.Screen
          name="trails"
          options={{
            headerShown: true,
            title: 'Nearby Trails',
            headerStyle: { backgroundColor: '#FBF6EE' },
            headerTitleStyle: { fontFamily: 'Nunito-Bold' },
          }}
        />
        <Stack.Screen
          name="pet-chat"
          options={{
            headerShown: true,
            title: 'Chat',
            headerStyle: { backgroundColor: '#FBF6EE' },
            headerTitleStyle: { fontFamily: 'Nunito-Bold' },
          }}
        />
        <Stack.Screen name="+not-found" options={{ title: 'Oops!' }} />
      </Stack>
      <DailyRewardModal />
      <AchievementToast />
      <EvolutionModal />
      <StatusBar style="auto" />
    </PetProvider>
  );
}