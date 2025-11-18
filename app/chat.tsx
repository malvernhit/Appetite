import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, Send } from 'lucide-react-native';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '@/constants/theme';
import { mockBiker } from '@/data/mockData';
import { useThemedColors } from '@/hooks/useThemedColors';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'other';
  timestamp: string;
}

export default function ChatScreen() {
  const router = useRouter();
  const colors = useThemedColors();
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Hi! I'm on my way to pick up your order.",
      sender: 'other',
      timestamp: new Date().toISOString(),
    },
    {
      id: '2',
      text: 'Great! Thank you!',
      sender: 'user',
      timestamp: new Date().toISOString(),
    },
  ]);

  const handleSend = () => {
    if (message.trim()) {
      const newMessage: Message = {
        id: Date.now().toString(),
        text: message.trim(),
        sender: 'user',
        timestamp: new Date().toISOString(),
      };
      setMessages([...messages, newMessage]);
      setMessage('');
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Image source={{ uri: mockBiker.photo }} style={styles.avatar} />
        <View style={styles.headerInfo}>
          <Text style={[styles.headerName, { color: colors.text }]}>{mockBiker.name}</Text>
          <Text style={styles.headerStatus}>Online</Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <ScrollView
          style={styles.messagesContainer}
          contentContainerStyle={styles.messagesContent}
          showsVerticalScrollIndicator={false}
        >
          {messages.map((msg) => (
            <View
              key={msg.id}
              style={[
                styles.messageBubble,
                { backgroundColor: msg.sender === 'user' ? Colors.success : colors.neutral },
                msg.sender === 'user' && styles.messageBubbleUser
              ]}
            >
              <Text style={[styles.messageText, { color: msg.sender === 'user' ? Colors.white : colors.text }, msg.sender === 'user' && styles.messageTextUser]}>
                {msg.text}
              </Text>
            </View>
          ))}
        </ScrollView>

        <View style={[styles.inputContainer, { backgroundColor: colors.card, borderTopColor: colors.border }]}>
          <TextInput
            style={[styles.input, { backgroundColor: colors.background, color: colors.text }]}
            value={message}
            onChangeText={setMessage}
            placeholder="Type a message..."
            placeholderTextColor={colors.muted}
            multiline
            maxLength={500}
          />
          <TouchableOpacity
            style={[
              styles.sendButton,
              !message.trim() && [styles.sendButtonDisabled, { backgroundColor: colors.neutral }]
            ]}
            onPress={handleSend}
            disabled={!message.trim()}
          >
            <Send size={20} color={Colors.white} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.lg,
    backgroundColor: Colors.background,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.round,
    marginLeft: Spacing.sm,
  },
  headerInfo: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  headerName: {
    ...Typography.bodyMedium,
    color: Colors.text,
  },
  headerStatus: {
    ...Typography.caption,
    color: Colors.success,
  },
  keyboardView: {
    flex: 1,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: Spacing.lg,
  },
  messageBubble: {
    maxWidth: '75%',
    backgroundColor: Colors.neutral,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    alignSelf: 'flex-start',
  },
  messageBubbleUser: {
    backgroundColor: Colors.success,
    alignSelf: 'flex-end',
  },
  messageText: {
    ...Typography.body,
    color: Colors.text,
  },
  messageTextUser: {
    color: Colors.white,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: Spacing.lg,
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.neutral,
  },
  input: {
    flex: 1,
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    ...Typography.body,
    color: Colors.text,
    maxHeight: 100,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.round,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: Spacing.sm,
    ...Shadows.button,
  },
  sendButtonDisabled: {
    backgroundColor: Colors.neutral,
    opacity: 0.5,
  },
});
