import React, { useState } from "react";

import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StatusBar,
} from "react-native";

import { MaterialCommunityIcons } from "@expo/vector-icons";

const PURPLE = "#49769F";
const BG = "#F8FAFC";
const TEXT = "#111827";
const MUTED = "#6B7280";
const BORDER = "#E0E7ED";

export default function ChatbotScreen({ onBack }) {
  const [message, setMessage] = useState("");

  const [messages, setMessages] = useState([
    {
      id: "1",
      text:
        "Hi Aditya 👋\nI'm your Worker Assistant. Ask me anything about jobs, requests, calendar, profile or this app.",
      sender: "bot",
    },
  ]);

  const getAnswer = (question) => {
    const q = question.toLowerCase();

    if (
      q.includes("job") ||
      q.includes("work") ||
      q.includes("काम")
    ) {
      return "You can find suitable jobs from the Jobs section. You can search jobs by skill, location and work type.";
    }

    if (
      q.includes("request") ||
      q.includes("client")
    ) {
      return "You can check Client and Organization work requests from the Work Requests section on your dashboard.";
    }

    if (
      q.includes("calendar") ||
      q.includes("schedule")
    ) {
      return "Your upcoming work can be viewed in My Calendar. You can see job time, location and payment details there.";
    }

    if (
      q.includes("profile") ||
      q.includes("account")
    ) {
      return "You can manage your worker profile, skills and account information from the Profile section.";
    }

    if (
      q.includes("search")
    ) {
      return "Use the search bar on the dashboard to search for jobs and skills. You can also use voice search.";
    }

    if (
      q.includes("voice") ||
      q.includes("microphone")
    ) {
      return "Tap the microphone button to use voice search and speak the type of job you are looking for.";
    }

    if (
      q.includes("registration") ||
      q.includes("register")
    ) {
      return "During registration you provide your name, date of birth, gender, work type, ID proof, address, email, password and skills.";
    }

    if (
      q.includes("payment") ||
      q.includes("charge") ||
      q.includes("salary")
    ) {
      return "Job cards show the expected work charge, for example Rs. 800 / Day or Rs. 900 / Day.";
    }

    if (
      q.includes("hello") ||
      q.includes("hi") ||
      q.includes("hey")
    ) {
      return "Hello 👋 How can I help you with the Worker app?";
    }

    return "I can help you with Jobs, Work Requests, Calendar, Profile, Voice Search, Registration and other app features. Try asking me about any of these.";
  };

  const sendMessage = () => {
    const text = message.trim();

    if (!text) {
      return;
    }

    const userMessage = {
      id: Date.now().toString(),
      text: text,
      sender: "user",
    };

    const botMessage = {
      id: (Date.now() + 1).toString(),
      text: getAnswer(text),
      sender: "bot",
    };

    setMessages((oldMessages) => [
      ...oldMessages,
      userMessage,
      botMessage,
    ]);

    setMessage("");
  };

  const renderMessage = ({ item }) => {
    const isUser = item.sender === "user";

    return (
      <View
        style={[
          styles.messageRow,
          isUser && styles.messageRowUser,
        ]}
      >
        {!isUser && (
          <View style={styles.botSmallIcon}>
            <MaterialCommunityIcons
              name="robot-outline"
              size={20}
              color="#fff"
            />
          </View>
        )}

        <View
          style={[
            styles.messageBubble,
            isUser
              ? styles.userBubble
              : styles.botBubble,
          ]}
        >
          <Text
            style={[
              styles.messageText,
              isUser && styles.userMessageText,
            ]}
          >
            {item.text}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="#fff"
      />

      <KeyboardAvoidingView
        style={styles.container}
        behavior={
          Platform.OS === "ios"
            ? "padding"
            : undefined
        }
      >

        {/* HEADER */}
        <View style={styles.header}>

          <TouchableOpacity
            style={styles.backButton}
            onPress={onBack}
          >
            <MaterialCommunityIcons
              name="arrow-left"
              size={24}
              color={TEXT}
            />
          </TouchableOpacity>

          <View style={styles.headerIcon}>
            <MaterialCommunityIcons
              name="robot-outline"
              size={25}
              color="#fff"
            />
          </View>

          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>
              Worker Assistant
            </Text>

            <View style={styles.onlineRow}>
              <View style={styles.onlineDot} />

              <Text style={styles.onlineText}>
                Online
              </Text>
            </View>
          </View>

        </View>

        {/* CHAT */}
        <FlatList
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.chatContainer}
          showsVerticalScrollIndicator={false}
        />

        {/* QUICK QUESTIONS */}
        <View style={styles.quickContainer}>

          <Text style={styles.quickTitle}>
            Quick questions
          </Text>

          <View style={styles.quickRow}>

            <TouchableOpacity
              style={styles.quickButton}
              onPress={() => {
                setMessage("How can I find jobs?");
              }}
            >
              <Text style={styles.quickText}>
                Find Jobs
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickButton}
              onPress={() => {
                setMessage("How can I check requests?");
              }}
            >
              <Text style={styles.quickText}>
                Requests
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickButton}
              onPress={() => {
                setMessage("How can I check my calendar?");
              }}
            >
              <Text style={styles.quickText}>
                Calendar
              </Text>
            </TouchableOpacity>

          </View>

        </View>

        {/* INPUT */}
        <View style={styles.inputArea}>

          <TextInput
            style={styles.input}
            placeholder="Ask something..."
            placeholderTextColor="#9CA3AF"
            value={message}
            onChangeText={setMessage}
            onSubmitEditing={sendMessage}
            returnKeyType="send"
          />

          <TouchableOpacity
            style={styles.sendButton}
            onPress={sendMessage}
            activeOpacity={0.8}
          >
            <MaterialCommunityIcons
              name="send"
              size={22}
              color="#fff"
            />
          </TouchableOpacity>

        </View>

      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({

  safe: {
    flex: 1,
    backgroundColor: BG,
  },

  container: {
    flex: 1,
  },

  header: {
    height: 70,
    marginTop:40,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
  },

  backButton: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },

  headerIcon: {
    width: 44,
    height: 44,
    borderRadius: 13,
    backgroundColor: PURPLE,
    alignItems: "center",
    justifyContent: "center",
  },

  headerTextContainer: {
    marginLeft: 10,
  },

  headerTitle: {
    fontSize: 16,
    fontWeight: "900",
    color: TEXT,
  },

  onlineRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 3,
  },

  onlineDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: "#22C55E",
    marginRight: 5,
  },

  onlineText: {
    fontSize: 10,
    color: MUTED,
  },

  chatContainer: {
    padding: 16,
    paddingBottom: 10,
  },

  messageRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    marginBottom: 13,
  },

  messageRowUser: {
    justifyContent: "flex-end",
  },

  botSmallIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: PURPLE,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 7,
  },

  messageBubble: {
    maxWidth: "78%",
    paddingHorizontal: 14,
    paddingVertical: 11,
    borderRadius: 16,
  },

  botBubble: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: BORDER,
    borderBottomLeftRadius: 4,
  },

  userBubble: {
    backgroundColor: PURPLE,
    borderBottomRightRadius: 4,
  },

  messageText: {
    fontSize: 13,
    color: TEXT,
    lineHeight: 19,
  },

  userMessageText: {
    color: "#fff",
  },

  quickContainer: {
    paddingHorizontal: 14,
    paddingTop: 8,
    paddingBottom: 8,
  },

  quickTitle: {
    fontSize: 10,
    fontWeight: "800",
    color: MUTED,
    marginBottom: 7,
  },

  quickRow: {
    flexDirection: "row",
    gap: 7,
  },

  quickButton: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 18,
    paddingHorizontal: 11,
    paddingVertical: 8,
  },

  quickText: {
    fontSize: 10,
    color: PURPLE,
    fontWeight: "800",
  },

  inputArea: {
    backgroundColor: "#fff",
    borderTopWidth: 1,
    marginBottom:40,
    borderTopColor: BORDER,
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
  },

  input: {
    flex: 1,
    height: 46,
    backgroundColor: BG,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 23,
    paddingHorizontal: 16,
    fontSize: 13,
    color: TEXT,
  },

  sendButton: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: PURPLE,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8,
  },

});