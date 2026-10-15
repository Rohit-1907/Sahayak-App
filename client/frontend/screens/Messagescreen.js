import React, { useEffect, useRef, useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
  Animated,
  Image,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';

/* =====================================================
   COLORS
===================================================== */

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

/* =====================================================
   SAMPLE CONVERSATIONS
===================================================== */

const conversations = [
  {
    id: 1,
    name: 'Rohit Deshmukh',
    service: 'Painting Service',
    message: "I'll reach by 10 AM.",
    time: '10:24 AM',
    unread: 2,
    online: true,
    bookingId: '#UW10256',
    date: '10 Aug 2026',
    serviceIcon: 'color-palette-outline',
    image:
      'https://randomuser.me/api/portraits/men/32.jpg',
  },

  {
    id: 2,
    name: 'Priya Sharma',
    service: 'Home Cleaning',
    message: 'Thank you! See you tomorrow.',
    time: 'Yesterday',
    unread: 0,
    online: true,
    bookingId: '#UW10241',
    date: '12 Aug 2026',
    serviceIcon: 'sparkles-outline',
    image:
      'https://randomuser.me/api/portraits/women/44.jpg',
  },

  {
    id: 3,
    name: 'Amit Patil',
    service: 'Plumbing Service',
    message: 'I have received your booking.',
    time: 'Yesterday',
    unread: 1,
    online: false,
    bookingId: '#UW10231',
    date: '14 Aug 2026',
    serviceIcon: 'water-outline',
    image:
      'https://randomuser.me/api/portraits/men/45.jpg',
  },

  {
    id: 4,
    name: 'Sneha Kulkarni',
    service: 'Electrical Service',
    message: 'Your service has been confirmed.',
    time: 'Mon',
    unread: 0,
    online: false,
    bookingId: '#UW10215',
    date: '16 Aug 2026',
    serviceIcon: 'flash-outline',
    image:
      'https://randomuser.me/api/portraits/women/65.jpg',
  },
];

/* =====================================================
   ANIMATED CONVERSATION
===================================================== */

function ConversationItem({
  conversation,
  index,
  onPress,
}) {
  const opacity = useRef(
    new Animated.Value(0)
  ).current;

  const translateX = useRef(
    new Animated.Value(25)
  ).current;

  const scale = useRef(
    new Animated.Value(1)
  ).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 450,
        delay: index * 100,
        useNativeDriver: true,
      }),

      Animated.timing(translateX, {
        toValue: 0,
        duration: 450,
        delay: index * 100,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handlePressIn = () => {
    Animated.spring(scale, {
      toValue: 0.97,
      useNativeDriver: true,
      speed: 20,
      bounciness: 3,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
      speed: 20,
      bounciness: 5,
    }).start();
  };

  return (
    <Animated.View
      style={[
        styles.conversationAnimated,
        {
          opacity,
          transform: [
            { translateX },
            { scale },
          ],
        },
      ]}
    >
      <Pressable
        style={({ pressed }) => [
          styles.conversationCard,
          pressed && styles.cardPressed,
        ]}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
      >

        {/* PROFILE IMAGE */}

        <View style={styles.avatarContainer}>

          <Image
            source={{
              uri: conversation.image,
            }}
            style={styles.avatar}
          />

          {conversation.online && (
            <View style={styles.onlineDot} />
          )}

        </View>

        {/* MESSAGE CONTENT */}

        <View style={styles.messageContent}>

          {/* NAME + TIME */}

          <View style={styles.topRow}>

            <Text
              style={styles.name}
              numberOfLines={1}
            >
              {conversation.name}
            </Text>

            <Text style={styles.time}>
              {conversation.time}
            </Text>

          </View>

          {/* SERVICE */}

          <View style={styles.serviceRow}>

            <Ionicons
              name={conversation.serviceIcon}
              size={13}
              color={COLORS.primary}
            />

            <Text style={styles.service}>
              {conversation.service}
            </Text>

          </View>

          {/* MESSAGE */}

          <View style={styles.bottomRow}>

            <Text
              style={[
                styles.message,
                conversation.unread > 0 &&
                  styles.unreadMessage,
              ]}
              numberOfLines={1}
            >
              {conversation.message}
            </Text>

            {conversation.unread > 0 && (
              <View style={styles.unreadBadge}>
                <Text style={styles.unreadText}>
                  {conversation.unread}
                </Text>
              </View>
            )}

          </View>

        </View>

        {/* ARROW */}

        <Ionicons
          name="chevron-forward"
          size={19}
          color="#A0AEC0"
        />

      </Pressable>
    </Animated.View>
  );
}

/* =====================================================
   MAIN SCREEN
===================================================== */

export default function Messagescreen({
  onBack,
  onOpenChat,
}) {
  const [search, setSearch] = useState('');

  /* ===================================================
     SEARCH FILTER
  =================================================== */

  const filteredConversations =
    conversations.filter((conversation) => {
      const text =
        `${conversation.name} ${conversation.service}`
          .toLowerCase();

      return text.includes(
        search.toLowerCase()
      );
    });

  /* ===================================================
     OPEN CHAT
  =================================================== */

  const handleConversationPress = (
    conversation
  ) => {
    if (typeof onOpenChat === 'function') {
      onOpenChat(conversation);
    }
  };

  return (
    <SafeAreaView style={styles.container}>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={
          styles.scrollContent
        }
      >

        {/* =================================================
            HEADER
        ================================================= */}

        <View style={styles.header}>

          {/* BACK BUTTON */}

          <Pressable
            style={styles.headerButton}
            onPress={onBack}
          >
            <Ionicons
              name="arrow-back"
              size={23}
              color={COLORS.dark}
            />
          </Pressable>

          {/* HEADER TEXT */}

          <View style={styles.headerText}>

            <Text style={styles.headerTitle}>
              Messages
            </Text>

            <Text style={styles.headerSubtitle}>
              Chat with your professionals
            </Text>

          </View>

          {/* CHAT ICON */}

          <View style={styles.headerIcon}>

            <Ionicons
              name="chatbubbles-outline"
              size={23}
              color={COLORS.primary}
            />

          </View>

        </View>

        {/* =================================================
            SEARCH
        ================================================= */}

        <View style={styles.searchContainer}>

          <Ionicons
            name="search-outline"
            size={21}
            color="#94A3B8"
          />

          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search conversations..."
            placeholderTextColor="#94A3B8"
            style={styles.searchInput}
          />

          {search.length > 0 && (
            <Pressable
              onPress={() => setSearch('')}
            >
              <Ionicons
                name="close-circle"
                size={20}
                color="#94A3B8"
              />
            </Pressable>
          )}

        </View>

        {/* =================================================
            CONVERSATIONS TITLE
        ================================================= */}

        <View style={styles.sectionHeader}>

          <Text style={styles.sectionTitle}>
            Your Conversations
          </Text>

          <Text style={styles.conversationCount}>
            {filteredConversations.length}
          </Text>

        </View>

        {/* =================================================
            CONVERSATIONS
        ================================================= */}

        {filteredConversations.length > 0 ? (

          filteredConversations.map(
            (conversation, index) => (

              <ConversationItem
                key={conversation.id}
                conversation={conversation}
                index={index}
                onPress={() =>
                  handleConversationPress(
                    conversation
                  )
                }
              />

            )
          )

        ) : (

          /* =================================================
             EMPTY SEARCH RESULT
          ================================================= */

          <View style={styles.emptyState}>

            <View style={styles.emptyIcon}>

              <Ionicons
                name="chatbubbles-outline"
                size={38}
                color={COLORS.primary}
              />

            </View>

            <Text style={styles.emptyTitle}>
              No conversations found
            </Text>

            <Text style={styles.emptyText}>
              Try searching for another
              professional or service.
            </Text>

          </View>

        )}

        {/* =================================================
            SAFETY MESSAGE
        ================================================= */}

        <View style={styles.safetyCard}>

          <View style={styles.safetyIcon}>

            <Ionicons
              name="shield-checkmark-outline"
              size={21}
              color={COLORS.green}
            />

          </View>

          <View
            style={styles.safetyTextContainer}
          >

            <Text style={styles.safetyTitle}>
              Stay safe with Sahayak
            </Text>

            <Text style={styles.safetyText}>
              Keep your conversations related
              to your service booking.
            </Text>

          </View>

        </View>

        {/* =================================================
            VERSION
        ================================================= */}

        <Text style={styles.version}>
          Sahayak • Version 1.0.0
        </Text>

      </ScrollView>

    </SafeAreaView>
  );
}

/* =====================================================
   STYLES
===================================================== */

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  scrollContent: {
    paddingBottom: 35,
  },

  /* =====================================================
     HEADER
  ===================================================== */

  header: {
    height: 105,

    paddingTop: 30,
    paddingHorizontal: 20,

    backgroundColor: COLORS.white,

    flexDirection: 'row',
    alignItems: 'center',

    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },

  headerButton: {
    width: 42,
    height: 42,

    borderRadius: 21,

    backgroundColor: '#F3F6F8',

    justifyContent: 'center',
    alignItems: 'center',

    borderWidth: 1,
    borderColor: COLORS.border,
  },

  headerText: {
    flex: 1,
    marginLeft: 13,
  },

  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.dark,
  },

  headerSubtitle: {
    marginTop: 2,

    fontSize: 12,
    color: COLORS.muted,
  },

  headerIcon: {
    width: 42,
    height: 42,

    borderRadius: 21,

    backgroundColor: COLORS.lightBlue,

    justifyContent: 'center',
    alignItems: 'center',

    borderWidth: 1,
    borderColor: COLORS.border,
  },

  /* =====================================================
     SEARCH
  ===================================================== */

  searchContainer: {
    marginHorizontal: 20,
    marginTop: 18,

    height: 52,

    backgroundColor: COLORS.white,

    borderRadius: 15,

    borderWidth: 1,
    borderColor: COLORS.border,

    flexDirection: 'row',
    alignItems: 'center',

    paddingHorizontal: 15,
  },

  searchInput: {
    flex: 1,

    marginLeft: 10,

    fontSize: 14,
    color: COLORS.dark,
  },

  /* =====================================================
     SECTION
  ===================================================== */

  sectionHeader: {
    marginHorizontal: 20,

    marginTop: 25,
    marginBottom: 11,

    flexDirection: 'row',
    alignItems: 'center',
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.dark,
  },

  conversationCount: {
    marginLeft: 8,

    minWidth: 22,
    height: 22,

    borderRadius: 11,

    backgroundColor: COLORS.lightBlue,

    textAlign: 'center',
    lineHeight: 22,

    fontSize: 11,
    fontWeight: '700',
    color: COLORS.primary,
  },

  /* =====================================================
     CONVERSATION
  ===================================================== */

  conversationAnimated: {
    marginHorizontal: 20,
    marginBottom: 11,
  },

  conversationCard: {
    minHeight: 86,

    backgroundColor: COLORS.white,

    borderRadius: 17,

    borderWidth: 1,
    borderColor: COLORS.border,

    paddingHorizontal: 13,
    paddingVertical: 12,

    flexDirection: 'row',
    alignItems: 'center',

    shadowColor: '#000',

    shadowOffset: {
      width: 0,
      height: 2,
    },

    shadowOpacity: 0.03,
    shadowRadius: 5,

    elevation: 2,
  },

  cardPressed: {
    opacity: 0.85,
  },

  /* =====================================================
     AVATAR
  ===================================================== */

  avatarContainer: {
    width: 57,
    height: 57,

    position: 'relative',
  },

  avatar: {
    width: 57,
    height: 57,

    borderRadius: 29,

    backgroundColor: COLORS.lightBlue,
  },

  onlineDot: {
    position: 'absolute',

    right: 0,
    bottom: 1,

    width: 14,
    height: 14,

    borderRadius: 7,

    backgroundColor: '#22C55E',

    borderWidth: 2,
    borderColor: COLORS.white,
  },

  /* =====================================================
     MESSAGE
  ===================================================== */

  messageContent: {
    flex: 1,

    marginLeft: 12,
    marginRight: 8,
  },

  topRow: {
    flexDirection: 'row',

    alignItems: 'center',

    justifyContent: 'space-between',
  },

  name: {
    flex: 1,

    fontSize: 15,
    fontWeight: '700',

    color: COLORS.dark,
  },

  time: {
    marginLeft: 7,

    fontSize: 10,
    color: COLORS.muted,
  },

  serviceRow: {
    marginTop: 4,

    flexDirection: 'row',
    alignItems: 'center',
  },

  service: {
    marginLeft: 4,

    fontSize: 10,
    color: COLORS.primary,

    fontWeight: '600',
  },

  bottomRow: {
    marginTop: 5,

    flexDirection: 'row',
    alignItems: 'center',
  },

  message: {
    flex: 1,

    fontSize: 12,
    color: COLORS.muted,
  },

  unreadMessage: {
    color: COLORS.dark,
    fontWeight: '600',
  },

  unreadBadge: {
    minWidth: 21,
    height: 21,

    borderRadius: 11,

    backgroundColor: COLORS.primary,

    justifyContent: 'center',
    alignItems: 'center',

    marginLeft: 7,
  },

  unreadText: {
    color: COLORS.white,

    fontSize: 10,
    fontWeight: '700',
  },

  /* =====================================================
     EMPTY
  ===================================================== */

  emptyState: {
    marginHorizontal: 20,
    marginTop: 20,

    paddingVertical: 45,

    backgroundColor: COLORS.white,

    borderRadius: 18,

    borderWidth: 1,
    borderColor: COLORS.border,

    alignItems: 'center',
  },

  emptyIcon: {
    width: 75,
    height: 75,

    borderRadius: 38,

    backgroundColor: COLORS.lightBlue,

    justifyContent: 'center',
    alignItems: 'center',
  },

  emptyTitle: {
    marginTop: 15,

    fontSize: 16,
    fontWeight: '700',

    color: COLORS.dark,
  },

  emptyText: {
    marginTop: 6,

    maxWidth: 250,

    textAlign: 'center',

    fontSize: 12,
    lineHeight: 18,

    color: COLORS.muted,
  },

  /* =====================================================
     SAFETY
  ===================================================== */

  safetyCard: {
    marginHorizontal: 20,
    marginTop: 22,

    padding: 14,

    backgroundColor: COLORS.white,

    borderRadius: 16,

    borderWidth: 1,
    borderColor: COLORS.border,

    flexDirection: 'row',
    alignItems: 'center',
  },

  safetyIcon: {
    width: 42,
    height: 42,

    borderRadius: 13,

    backgroundColor: '#ECFDF5',

    justifyContent: 'center',
    alignItems: 'center',
  },

  safetyTextContainer: {
    flex: 1,

    marginLeft: 11,
  },

  safetyTitle: {
    fontSize: 12,
    fontWeight: '700',

    color: COLORS.dark,
  },

  safetyText: {
    marginTop: 3,

    fontSize: 10,
    lineHeight: 15,

    color: COLORS.muted,
  },

  /* =====================================================
     VERSION
  ===================================================== */

  version: {
    marginTop: 22,

    textAlign: 'center',

    fontSize: 11,
    color: '#94A3B8',
  },

});