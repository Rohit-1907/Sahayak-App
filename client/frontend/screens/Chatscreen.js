import React, { useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  Pressable,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Image,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';

const COLORS = {
  primary: '#49769F',
  dark: '#2A2A2A',
  muted: '#64748B',
  lightBlue: '#EAF3F8',
  border: '#D6E4EE',
  background: '#F8FAFC',
  white: '#FFFFFF',
  green: '#16A34A',
};

export default function Chatscreen({
  conversation,
  onBack,
}) {
  const [message, setMessage] = useState('');

  const [messages, setMessages] = useState([
    {
      id: 1,
      text: conversation?.message || 'Hello!',
      sender: 'professional',
      time: '10:24 AM',
    },
    {
      id: 2,
      text: 'Hi! Thank you for the update.',
      sender: 'user',
      time: '10:26 AM',
    },
    {
      id: 3,
      text: 'You’re welcome! I will reach on time.',
      sender: 'professional',
      time: '10:27 AM',
    },
  ]);

  const sendMessage = () => {
    if (!message.trim()) return;

    const newMessage = {
      id: Date.now(),
      text: message.trim(),
      sender: 'user',
      time: 'Now',
    };

    setMessages((prev) => [...prev, newMessage]);
    setMessage('');
  };

  return (
    <SafeAreaView style={styles.container}>

      {/* HEADER */}

      <View style={styles.header}>

        <Pressable
          style={styles.backButton}
          onPress={onBack}
        >
          <Ionicons
            name="arrow-back"
            size={23}
            color={COLORS.dark}
          />
        </Pressable>

        <Image
          source={{
            uri:
              conversation?.image ||
              'https://randomuser.me/api/portraits/men/32.jpg',
          }}
          style={styles.avatar}
        />

        <View style={styles.headerInfo}>

          <Text style={styles.name}>
            {conversation?.name || 'Professional'}
          </Text>

          <View style={styles.statusRow}>

            <View
              style={[
                styles.statusDot,
                {
                  backgroundColor:
                    conversation?.online
                      ? COLORS.green
                      : '#94A3B8',
                },
              ]}
            />

            <Text style={styles.statusText}>
              {conversation?.online
                ? 'Online'
                : 'Offline'}
            </Text>

          </View>

        </View>

        <Pressable style={styles.infoButton}>
          <Ionicons
            name="information-circle-outline"
            size={24}
            color={COLORS.primary}
          />
        </Pressable>

      </View>

      {/* BOOKING INFO */}

      <View style={styles.bookingInfo}>

        <View style={styles.bookingIcon}>
          <Ionicons
            name={conversation?.serviceIcon || 'construct-outline'}
            size={20}
            color={COLORS.primary}
          />
        </View>

        <View style={styles.bookingText}>

          <Text style={styles.service}>
            {conversation?.service || 'Service'}
          </Text>

          <Text style={styles.bookingId}>
            Booking {conversation?.bookingId || '#UW10256'}
          </Text>

        </View>

        <Text style={styles.bookingDate}>
          {conversation?.date || 'Today'}
        </Text>

      </View>

      {/* CHAT */}

      <KeyboardAvoidingView
        style={styles.chatContainer}
        behavior={
          Platform.OS === 'ios'
            ? 'padding'
            : undefined
        }
      >

        <ScrollView
          style={styles.messagesContainer}
          contentContainerStyle={styles.messagesContent}
          showsVerticalScrollIndicator={false}
        >

          <Text style={styles.dateLabel}>
            Today
          </Text>

          {messages.map((item) => {

            const isUser =
              item.sender === 'user';

            return (
              <View
                key={item.id}
                style={[
                  styles.messageRow,
                  isUser &&
                    styles.userMessageRow,
                ]}
              >

                <View
                  style={[
                    styles.messageBubble,
                    isUser &&
                      styles.userBubble,
                  ]}
                >

                  <Text
                    style={[
                      styles.messageText,
                      isUser &&
                        styles.userMessageText,
                    ]}
                  >
                    {item.text}
                  </Text>

                  <Text
                    style={[
                      styles.messageTime,
                      isUser &&
                        styles.userMessageTime,
                    ]}
                  >
                    {item.time}
                  </Text>

                </View>

              </View>
            );
          })}

        </ScrollView>

        {/* MESSAGE INPUT */}

        <View style={styles.inputArea}>

          <Pressable style={styles.attachButton}>
            <Ionicons
              name="add"
              size={24}
              color={COLORS.primary}
            />
          </Pressable>

          <TextInput
            value={message}
            onChangeText={setMessage}
            placeholder="Type a message..."
            placeholderTextColor="#94A3B8"
            style={styles.input}
            multiline
          />

          <Pressable
            style={[
              styles.sendButton,
              !message.trim() &&
                styles.sendButtonDisabled,
            ]}
            onPress={sendMessage}
          >
            <Ionicons
              name="send"
              size={19}
              color={COLORS.white}
            />
          </Pressable>

        </View>

      </KeyboardAvoidingView>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  /* HEADER */

  header: {
    height: 75,
    backgroundColor: COLORS.white,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },

  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F6F8',
    justifyContent: 'center',
    alignItems: 'center',
  },

  avatar: {
    width: 43,
    height: 43,
    borderRadius: 22,
    marginLeft: 12,
  },

  headerInfo: {
    flex: 1,
    marginLeft: 10,
  },

  name: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.dark,
  },

  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 3,
  },

  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    marginRight: 5,
  },

  statusText: {
    fontSize: 11,
    color: COLORS.muted,
  },

  infoButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },

  /* BOOKING */

  bookingInfo: {
    marginHorizontal: 15,
    marginTop: 12,
    padding: 12,
    backgroundColor: COLORS.lightBlue,
    borderRadius: 15,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  bookingIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
  },

  bookingText: {
    flex: 1,
    marginLeft: 10,
  },

  service: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.dark,
  },

  bookingId: {
    marginTop: 3,
    fontSize: 10,
    color: COLORS.muted,
  },

  bookingDate: {
    fontSize: 10,
    color: COLORS.muted,
  },

  /* CHAT */

  chatContainer: {
    flex: 1,
  },

  messagesContainer: {
    flex: 1,
  },

  messagesContent: {
    padding: 18,
    paddingBottom: 25,
  },

  dateLabel: {
    alignSelf: 'center',
    fontSize: 10,
    color: COLORS.muted,
    backgroundColor: '#E9EEF2',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 12,
    marginBottom: 18,
  },

  messageRow: {
    width: '100%',
    alignItems: 'flex-start',
    marginBottom: 12,
  },

  userMessageRow: {
    alignItems: 'flex-end',
  },

  messageBubble: {
    maxWidth: '78%',
    backgroundColor: COLORS.white,
    borderRadius: 17,
    borderTopLeftRadius: 5,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  userBubble: {
    backgroundColor: COLORS.primary,
    borderTopLeftRadius: 17,
    borderTopRightRadius: 5,
    borderColor: COLORS.primary,
  },

  messageText: {
    fontSize: 13,
    lineHeight: 19,
    color: COLORS.dark,
  },

  userMessageText: {
    color: COLORS.white,
  },

  messageTime: {
    marginTop: 5,
    fontSize: 9,
    color: '#94A3B8',
    textAlign: 'right',
  },

  userMessageTime: {
    color: '#DCEAF3',
  },

  /* INPUT */

  inputArea: {
    minHeight: 65,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'flex-end',
  },

  attachButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.lightBlue,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },

  input: {
    flex: 1,
    minHeight: 40,
    maxHeight: 90,
    backgroundColor: '#F3F6F8',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    fontSize: 13,
    color: COLORS.dark,
  },

  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },

  sendButtonDisabled: {
    opacity: 0.5,
  },

});