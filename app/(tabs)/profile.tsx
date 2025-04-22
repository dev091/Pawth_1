import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Image,
  Switch
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { theme } from '@/constants/theme';
import { usePet } from '@/context/PetContext';
import Pet from '@/components/Pet';
import { Bell, Settings, ChevronRight, Award, Gift, Calendar } from 'lucide-react-native';

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const { pets, currentPet, selectPet } = usePet();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  
  // Current user data (in a real app, this would come from user auth)
  const userData = {
    name: 'Pet Lover',
    joinDate: new Date(2023, 0, 15),
    totalPets: pets.length,
    streak: 7, // Days in a row of pet care
    points: 350,
  };

  // Get the number of days since joining
  const daysSinceJoining = Math.floor(
    (new Date().getTime() - userData.joinDate.getTime()) / (1000 * 60 * 60 * 24)
  );

  return (
    <ScrollView 
      style={[styles.container, { paddingTop: insets.top }]}
      contentContainerStyle={styles.contentContainer}
    >
      {/* Profile header */}
      <View style={styles.profileHeader}>
        <View style={styles.profileImageContainer}>
          <Text style={styles.profileImageText}>
            {userData.name.charAt(0)}
          </Text>
        </View>
        <View style={styles.profileInfo}>
          <Text style={styles.profileName}>{userData.name}</Text>
          <Text style={styles.profileJoined}>
            Member for {daysSinceJoining} days
          </Text>
        </View>
      </View>

      {/* Stats card */}
      <View style={styles.statsCard}>
        <View style={styles.statItem}>
          <View style={styles.statIconContainer}>
            <Award size={20} color={theme.colors.primary} />
          </View>
          <Text style={styles.statValue}>{userData.streak}</Text>
          <Text style={styles.statLabel}>Day Streak</Text>
        </View>
        
        <View style={styles.statDivider} />
        
        <View style={styles.statItem}>
          <View style={styles.statIconContainer}>
            <Gift size={20} color={theme.colors.primary} />
          </View>
          <Text style={styles.statValue}>{userData.points}</Text>
          <Text style={styles.statLabel}>Points</Text>
        </View>
        
        <View style={styles.statDivider} />
        
        <View style={styles.statItem}>
          <View style={styles.statIconContainer}>
            <Calendar size={20} color={theme.colors.primary} />
          </View>
          <Text style={styles.statValue}>{userData.totalPets}</Text>
          <Text style={styles.statLabel}>Pets</Text>
        </View>
      </View>

      {/* Current pet section */}
      {currentPet && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Current Pet</Text>
          <View style={styles.currentPetCard}>
            <Pet 
              type={currentPet.type}
              name={currentPet.name}
              level={currentPet.level}
              size="medium"
            />
          </View>
        </View>
      )}

      {/* My pets section */}
      {pets.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>My Pets</Text>
          <ScrollView 
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.petsScrollContainer}
          >
            {pets.map((pet) => (
              <TouchableOpacity
                key={pet.id}
                style={[
                  styles.petItem,
                  currentPet?.id === pet.id && styles.activePetItem
                ]}
                onPress={() => selectPet(pet.id)}
              >
                <Pet 
                  type={pet.type}
                  name={pet.name}
                  level={pet.level}
                  size="small"
                />
                <Text style={styles.petItemName}>{pet.name}</Text>
                <Text style={styles.petItemLevel}>Lv. {pet.level}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Settings section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Settings</Text>
        
        <View style={styles.settingCard}>
          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <View style={[styles.settingIcon, { backgroundColor: '#FFD1DC' }]}>
                <Bell size={20} color="#FF6B8B" />
              </View>
              <Text style={styles.settingLabel}>Notifications</Text>
            </View>
            <Switch
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
              trackColor={{ false: theme.colors.lightGray, true: theme.colors.primary }}
              thumbColor="white"
            />
          </View>
          
          <View style={styles.divider} />
          
          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <View style={[styles.settingIcon, { backgroundColor: '#D1F4FF' }]}>
                <Settings size={20} color="#4ECDC4" />
              </View>
              <Text style={styles.settingLabel}>Sound Effects</Text>
            </View>
            <Switch
              value={soundEnabled}
              onValueChange={setSoundEnabled}
              trackColor={{ false: theme.colors.lightGray, true: theme.colors.primary }}
              thumbColor="white"
            />
          </View>
        </View>
      </View>

      {/* Additional menu items */}
      <View style={styles.section}>
        <TouchableOpacity style={styles.menuItem}>
          <Text style={styles.menuItemText}>Help & Support</Text>
          <ChevronRight size={20} color={theme.colors.gray} />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.menuItem}>
          <Text style={styles.menuItemText}>Privacy Policy</Text>
          <ChevronRight size={20} color={theme.colors.gray} />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.menuItem}>
          <Text style={styles.menuItemText}>Terms of Service</Text>
          <ChevronRight size={20} color={theme.colors.gray} />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.menuItem}>
          <Text style={styles.menuItemText}>About Pawth</Text>
          <ChevronRight size={20} color={theme.colors.gray} />
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Pawth v1.0.0</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  contentContainer: {
    padding: theme.spacing.md,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
  },
  profileImageContainer: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.md,
  },
  profileImageText: {
    fontFamily: theme.fonts.bold,
    fontSize: 30,
    color: 'white',
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontFamily: theme.fonts.bold,
    fontSize: 20,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  profileJoined: {
    fontFamily: theme.fonts.regular,
    fontSize: 14,
    color: theme.colors.subtext,
  },
  statsCard: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.xl,
    ...theme.shadows.small,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F0F9FE',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.sm,
  },
  statValue: {
    fontFamily: theme.fonts.bold,
    fontSize: 20,
    color: theme.colors.text,
  },
  statLabel: {
    fontFamily: theme.fonts.regular,
    fontSize: 12,
    color: theme.colors.subtext,
  },
  statDivider: {
    width: 1,
    backgroundColor: theme.colors.lightGray,
    marginHorizontal: theme.spacing.sm,
  },
  section: {
    marginBottom: theme.spacing.xl,
  },
  sectionTitle: {
    fontFamily: theme.fonts.semiBold,
    fontSize: 18,
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  currentPetCard: {
    backgroundColor: 'white',
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    alignItems: 'center',
    ...theme.shadows.small,
  },
  petsScrollContainer: {
    paddingBottom: theme.spacing.sm,
  },
  petItem: {
    width: 100,
    height: 140,
    backgroundColor: 'white',
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.sm,
    marginRight: theme.spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    ...theme.shadows.small,
  },
  activePetItem: {
    borderWidth: 2,
    borderColor: theme.colors.primary,
  },
  petItemName: {
    fontFamily: theme.fonts.semiBold,
    fontSize: 14,
    color: theme.colors.text,
    marginTop: theme.spacing.xs,
  },
  petItemLevel: {
    fontFamily: theme.fonts.regular,
    fontSize: 12,
    color: theme.colors.subtext,
  },
  settingCard: {
    backgroundColor: 'white',
    borderRadius: theme.borderRadius.md,
    overflow: 'hidden',
    ...theme.shadows.small,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: theme.spacing.md,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.md,
  },
  settingLabel: {
    fontFamily: theme.fonts.semiBold,
    fontSize: 16,
    color: theme.colors.text,
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.lightGray,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'white',
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    ...theme.shadows.small,
  },
  menuItemText: {
    fontFamily: theme.fonts.semiBold,
    fontSize: 16,
    color: theme.colors.text,
  },
  footer: {
    alignItems: 'center',
    marginVertical: theme.spacing.xl,
  },
  footerText: {
    fontFamily: theme.fonts.regular,
    fontSize: 14,
    color: theme.colors.subtext,
  },
});