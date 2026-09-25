import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { useNavigation } from 'expo-router';
import { theme } from '@/constants/theme';
import { usePet } from '@/context/PetContext';
import { getPetMood, petTypes } from '@/data/petData';
import { getPetReply } from '@/lib/petChat';
import { Send } from 'lucide-react-native';

interface Message {
  id: string;
  from: 'user' | 'pet';
  text: string;
}

const QUICK_REPLIES = ["How are you feeling?", 'I love you!', "Let's play!", 'Are you hungry?'];

export default function PetChatScreen() {
  const { currentPet, chatBonusAvailable, recordChatInteraction } = usePet();
  const navigation = useNavigation();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [petTyping, setPetTyping] = useState(false);
  const listRef = useRef<FlatList<Message>>(null);
  const bonusGrantedRef = useRef(false);

  useEffect(() => {
    if (currentPet) navigation.setOptions({ title: currentPet.name });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPet?.name, navigation]);

  // Seeds the greeting once per pet — keyed on id only, so ongoing stat
  // decay (which produces a new `currentPet` object each tick) doesn't
  // wipe the conversation back to the opening line.
  useEffect(() => {
    if (!currentPet) return;
    setMessages([
      {
        id: 'greeting',
        from: 'pet',
        text: `${petTypes[currentPet.type].sounds[0]}! Hi, I'm ${currentPet.name}. What's on your mind?`,
      },
    ]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPet?.id]);

  useEffect(() => {
    listRef.current?.scrollToEnd({ animated: true });
  }, [messages, petTyping]);

  if (!currentPet) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.centerText}>Adopt a pet first to start chatting!</Text>
      </View>
    );
  }

  const send = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;

    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    const userMessage: Message = { id: `${Date.now()}-u`, from: 'user', text: trimmed };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setPetTyping(true);

    if (!bonusGrantedRef.current && chatBonusAvailable) {
      bonusGrantedRef.current = true;
      recordChatInteraction();
    }

    const reply = getPetReply(trimmed, {
      name: currentPet.name,
      type: currentPet.type,
      mood: getPetMood(currentPet.stats),
      level: currentPet.level,
      stats: currentPet.stats,
    });

    setTimeout(() => {
      setPetTyping(false);
      setMessages(prev => [...prev, { id: `${Date.now()}-p`, from: 'pet', text: reply }]);
    }, 500 + Math.random() * 500);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={90}
    >
      <FlatList
        ref={listRef}
        data={messages}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <View
            style={[
              styles.bubble,
              item.from === 'user' ? styles.userBubble : styles.petBubble,
            ]}
          >
            <Text style={item.from === 'user' ? styles.userText : styles.petText}>
              {item.text}
            </Text>
          </View>
        )}
        ListFooterComponent={
          petTyping ? (
            <View style={[styles.bubble, styles.petBubble]}>
              <Text style={styles.petText}>· · ·</Text>
            </View>
          ) : null
        }
      />

      <View style={styles.quickReplyRow}>
        {QUICK_REPLIES.map(q => (
          <TouchableOpacity key={q} style={styles.quickReplyChip} onPress={() => send(q)}>
            <Text style={styles.quickReplyText}>{q}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          value={input}
          onChangeText={setInput}
          placeholder={`Message ${currentPet.name}...`}
          placeholderTextColor={theme.colors.gray}
          onSubmitEditing={() => send(input)}
          returnKeyType="send"
        />
        <TouchableOpacity style={styles.sendButton} onPress={() => send(input)}>
          <Send size={18} color="white" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.xl,
    backgroundColor: theme.colors.background,
  },
  centerText: {
    fontFamily: theme.fonts.regular,
    fontSize: 14,
    color: theme.colors.subtext,
    textAlign: 'center',
  },
  listContent: {
    padding: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  bubble: {
    maxWidth: '78%',
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
  },
  userBubble: {
    alignSelf: 'flex-end',
    backgroundColor: theme.colors.primary,
    borderBottomRightRadius: 4,
  },
  petBubble: {
    alignSelf: 'flex-start',
    backgroundColor: 'white',
    borderBottomLeftRadius: 4,
    ...theme.shadows.small,
  },
  userText: {
    fontFamily: theme.fonts.semiBold,
    fontSize: 15,
    color: 'white',
  },
  petText: {
    fontFamily: theme.fonts.regular,
    fontSize: 15,
    color: theme.colors.text,
  },
  quickReplyRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    paddingBottom: theme.spacing.sm,
  },
  quickReplyChip: {
    backgroundColor: theme.colors.lightGray,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.full,
  },
  quickReplyText: {
    fontFamily: theme.fonts.semiBold,
    fontSize: 13,
    color: theme.colors.text,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: theme.colors.lightGray,
    backgroundColor: 'white',
  },
  input: {
    flex: 1,
    fontFamily: theme.fonts.regular,
    fontSize: 15,
    backgroundColor: theme.colors.lightGray,
    borderRadius: theme.borderRadius.full,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    color: theme.colors.text,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
