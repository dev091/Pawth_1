import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TextInput, 
  TouchableOpacity,
  Alert,
  Platform,
  KeyboardAvoidingView
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { theme } from '@/constants/theme';
import PetCard from '@/components/PetCard';
import { PetType, petTypes } from '@/data/petData';
import { usePet } from '@/context/PetContext';
import * as Haptics from 'expo-haptics';
import { Info } from 'lucide-react-native';
import Pet from '@/components/Pet';

export default function AdoptScreen() {
  const insets = useSafeAreaInsets();
  const { adoptPet } = usePet();
  const [selectedPet, setSelectedPet] = useState<PetType | null>(null);
  const [petName, setPetName] = useState('');
  const [step, setStep] = useState<'select' | 'name' | 'confirm'>('select');

  const handleSelectPet = (type: PetType) => {
    setSelectedPet(type);
    
    // Trigger haptic feedback on non-web platforms
    if (Platform.OS !== 'web') {
      Haptics.selectionAsync();
    }
  };

  const handleContinue = () => {
    if (step === 'select' && selectedPet) {
      setStep('name');
    } else if (step === 'name' && petName.trim()) {
      setStep('confirm');
    } else if (step === 'confirm' && selectedPet && petName.trim()) {
      adoptPet(selectedPet, petName.trim());
      
      // Reset form
      setSelectedPet(null);
      setPetName('');
      setStep('select');
      
      // Show success message
      if (Platform.OS === 'web') {
        alert(`Congratulations! You've adopted ${petName}!`);
      } else {
        Alert.alert(
          'Adoption Complete!', 
          `Congratulations! You've adopted ${petName}!`,
          [{ text: 'OK' }]
        );
        
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    }
  };

  const handleBack = () => {
    if (step === 'name') {
      setStep('select');
    } else if (step === 'confirm') {
      setStep('name');
    }
  };

  const getPetTypeData = (type: PetType) => petTypes[type];

  const renderStepContent = () => {
    switch (step) {
      case 'select':
        return (
          <>
            <Text style={styles.stepTitle}>Choose Your Pet</Text>
            <Text style={styles.stepDescription}>
              Select a pet companion to adopt. Each pet has unique traits and needs.
            </Text>
            
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.petCardsContainer}
            >
              {Object.keys(petTypes).map((type) => (
                <PetCard
                  key={type}
                  type={type as PetType}
                  onSelect={() => handleSelectPet(type as PetType)}
                  selected={selectedPet === type}
                />
              ))}
            </ScrollView>
            
            {selectedPet && (
              <View style={styles.petDetailCard}>
                <Text style={styles.petDetailTitle}>
                  About {getPetTypeData(selectedPet).name}s
                </Text>
                <Text style={styles.petDetailText}>
                  <Text style={styles.boldText}>Personality: </Text>
                  {getPetTypeData(selectedPet).personality}
                </Text>
                <Text style={styles.petDetailText}>
                  <Text style={styles.boldText}>Favorite Food: </Text>
                  {getPetTypeData(selectedPet).favoriteFood}
                </Text>
                <Text style={styles.petDetailText}>
                  <Text style={styles.boldText}>Favorite Activity: </Text>
                  {getPetTypeData(selectedPet).favoriteActivity}
                </Text>
              </View>
            )}
          </>
        );
        
      case 'name':
        return (
          <>
            <Text style={styles.stepTitle}>Name Your Pet</Text>
            <Text style={styles.stepDescription}>
              Give your new friend a name that suits their personality!
            </Text>
            
            {selectedPet && (
              <View style={styles.namePreviewContainer}>
                <Pet 
                  type={selectedPet}
                  name={petName || 'Your Pet'}
                  level={1}
                  size="medium"
                  animation="happy"
                />
              </View>
            )}
            
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Enter pet name"
                value={petName}
                onChangeText={setPetName}
                maxLength={20}
                autoFocus
              />
            </View>
          </>
        );
        
      case 'confirm':
        return (
          <>
            <Text style={styles.stepTitle}>Confirm Adoption</Text>
            <Text style={styles.stepDescription}>
              Review your choice before making it official!
            </Text>
            
            {selectedPet && (
              <View style={styles.confirmContainer}>
                <Pet 
                  type={selectedPet}
                  name={petName}
                  level={1}
                  animation="happy"
                />
                
                <View style={styles.confirmDetails}>
                  <Text style={styles.confirmText}>
                    You're adopting <Text style={styles.highlightText}>{petName}</Text>, 
                    a <Text style={styles.highlightText}>{getPetTypeData(selectedPet).name.toLowerCase()}</Text>.
                  </Text>
                  
                  <View style={styles.infoBox}>
                    <Info size={20} color={theme.colors.primary} style={styles.infoIcon} />
                    <Text style={styles.infoText}>
                      Remember that pets need regular care. Feed them, play with them,
                      and keep them clean to maintain their happiness and health!
                    </Text>
                  </View>
                </View>
              </View>
            )}
          </>
        );
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.progressContainer}>
          <View style={[
            styles.progressStep, 
            { backgroundColor: step === 'select' || step === 'name' || step === 'confirm' 
              ? theme.colors.primary 
              : theme.colors.lightGray 
            }
          ]} />
          <View style={styles.progressLine} />
          <View style={[
            styles.progressStep, 
            { backgroundColor: step === 'name' || step === 'confirm' 
              ? theme.colors.primary 
              : theme.colors.lightGray 
            }
          ]} />
          <View style={styles.progressLine} />
          <View style={[
            styles.progressStep, 
            { backgroundColor: step === 'confirm' 
              ? theme.colors.primary 
              : theme.colors.lightGray 
            }
          ]} />
        </View>

        <View style={styles.content}>
          {renderStepContent()}
        </View>

        <View style={styles.buttonContainer}>
          {step !== 'select' && (
            <TouchableOpacity
              style={styles.backButton}
              onPress={handleBack}
            >
              <Text style={styles.backButtonText}>Back</Text>
            </TouchableOpacity>
          )}
          
          <TouchableOpacity
            style={[
              styles.continueButton,
              (!selectedPet && step === 'select') || (petName.trim() === '' && step === 'name')
                ? styles.disabledButton
                : {}
            ]}
            onPress={handleContinue}
            disabled={(!selectedPet && step === 'select') || (petName.trim() === '' && step === 'name')}
          >
            <Text style={styles.continueButtonText}>
              {step === 'confirm' ? 'Adopt Now' : 'Continue'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    padding: theme.spacing.md,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: theme.spacing.md,
  },
  progressStep: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: theme.colors.primary,
  },
  progressLine: {
    flex: 1,
    height: 3,
    backgroundColor: theme.colors.lightGray,
    marginHorizontal: theme.spacing.xs,
  },
  content: {
    flex: 1,
    marginTop: theme.spacing.md,
  },
  stepTitle: {
    fontFamily: theme.fonts.bold,
    fontSize: 24,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  stepDescription: {
    fontFamily: theme.fonts.regular,
    fontSize: 16,
    color: theme.colors.subtext,
    marginBottom: theme.spacing.lg,
  },
  petCardsContainer: {
    paddingVertical: theme.spacing.md,
  },
  petDetailCard: {
    backgroundColor: 'white',
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginTop: theme.spacing.md,
    ...theme.shadows.small,
  },
  petDetailTitle: {
    fontFamily: theme.fonts.semiBold,
    fontSize: 18,
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  petDetailText: {
    fontFamily: theme.fonts.regular,
    fontSize: 16,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  boldText: {
    fontFamily: theme.fonts.semiBold,
  },
  namePreviewContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: theme.spacing.xl,
  },
  inputContainer: {
    marginVertical: theme.spacing.md,
  },
  input: {
    backgroundColor: 'white',
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    fontFamily: theme.fonts.regular,
    fontSize: 16,
    ...theme.shadows.small,
  },
  confirmContainer: {
    alignItems: 'center',
    marginVertical: theme.spacing.md,
  },
  confirmDetails: {
    width: '100%',
    marginTop: theme.spacing.lg,
  },
  confirmText: {
    fontFamily: theme.fonts.regular,
    fontSize: 18,
    color: theme.colors.text,
    textAlign: 'center',
    marginBottom: theme.spacing.lg,
  },
  highlightText: {
    fontFamily: theme.fonts.bold,
    color: theme.colors.primary,
  },
  infoBox: {
    backgroundColor: theme.colors.lightGray,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  infoIcon: {
    marginRight: theme.spacing.sm,
    marginTop: 2,
  },
  infoText: {
    flex: 1,
    fontFamily: theme.fonts.regular,
    fontSize: 14,
    color: theme.colors.subtext,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: theme.spacing.md,
    marginBottom: Math.max(theme.spacing.md, insets.bottom),
  },
  backButton: {
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.primary,
    marginRight: theme.spacing.sm,
  },
  backButtonText: {
    fontFamily: theme.fonts.semiBold,
    fontSize: 16,
    color: theme.colors.primary,
    textAlign: 'center',
  },
  continueButton: {
    flex: 1,
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.borderRadius.md,
    ...theme.shadows.small,
  },
  continueButtonText: {
    fontFamily: theme.fonts.semiBold,
    fontSize: 16,
    color: 'white',
    textAlign: 'center',
  },
  disabledButton: {
    backgroundColor: theme.colors.lightGray,
    ...theme.shadows.small,
  },
});