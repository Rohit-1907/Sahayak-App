import React, { useState } from "react";

import {
  SafeAreaView,
  StatusBar,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  Platform,
} from "react-native";

import { MaterialCommunityIcons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import * as Clipboard from "expo-clipboard";

const PURPLE = "#49769F";
const LIGHT_PURPLE = "#EEF4F8";
const BG = "#F8FAFC";
const TEXT = "#111827";
const MUTED = "#6B7280";
const BORDER = "#E0E7ED";

export default function AddWorker({ go }) {
  const [name, setName] = useState("");
  const [dob, setDob] = useState("");
  const [gender, setGender] = useState("");
  const [experience, setExperience] = useState("");
  const [contactType, setContactType] = useState("");
  const [credentials, setCredentials] = useState(null);

  // DATE PICKER
  const [showDatePicker, setShowDatePicker] = useState(false);

  const [selectedDate, setSelectedDate] = useState(
    new Date(2000, 0, 1)
  );

  // FORMAT DATE
  const formatDate = (date) => {
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();

    return `${day}/${month}/${year}`;
  };

  // OPEN DATE PICKER
  const openDatePicker = () => {
    setShowDatePicker(true);
  };

  // DATE CHANGE
  const handleDateChange = (event, date) => {
    if (Platform.OS === "android") {
      setShowDatePicker(false);
    }

    if (date) {
      setSelectedDate(date);
      setDob(formatDate(date));
    }
  };

  // GENDER SELECT
  const openGenderPicker = () => {
    Alert.alert(
      "Gender",
      "Select Gender",
      [
        {
          text: "Male",
          onPress: () => setGender("Male"),
        },
        {
          text: "Female",
          onPress: () => setGender("Female"),
        },
        {
          text: "Other",
          onPress: () => setGender("Other"),
        },
        {
          text: "Cancel",
          style: "cancel",
        },
      ]
    );
  };

  // CONTACT TYPE SELECT
  const openContactPicker = () => {
    Alert.alert(
      "Contact Type",
      "Select Contact Type",
      [
        {
          text: "Mobile",
          onPress: () => setContactType("Mobile"),
        },
        {
          text: "Email",
          onPress: () => setContactType("Email"),
        },
        {
          text: "Both",
          onPress: () => setContactType("Both"),
        },
        {
          text: "Cancel",
          style: "cancel",
        },
      ]
    );
  };

  // GENERATE CREDENTIALS
  const generateCredentials = () => {
    if (!name.trim()) {
      Alert.alert(
        "Name Required",
        "Please enter worker name first."
      );
      return;
    }

    if (!dob) {
      Alert.alert(
        "Date of Birth Required",
        "Please select worker's date of birth."
      );
      return;
    }

    if (!gender) {
      Alert.alert(
        "Gender Required",
        "Please select worker's gender."
      );
      return;
    }

    if (!experience.trim()) {
      Alert.alert(
        "Experience Required",
        "Please enter worker experience."
      );
      return;
    }

    if (!contactType) {
      Alert.alert(
        "Contact Type Required",
        "Please select contact type."
      );
      return;
    }

    const cleanName = name
      .trim()
      .toLowerCase()
      .replace(/[^a-zA-Z0-9]/g, "");

    const username = cleanName + "123";
    const password = "Abc@1234";

    setCredentials({
      username,
      password,
    });

    Alert.alert(
      "Credentials Generated",
      "Username and password have been generated successfully."
    );
  };

  // COPY CREDENTIALS
  const copyCredentials = async () => {
    if (!credentials) {
      Alert.alert(
        "No Credentials",
        "Please generate credentials first."
      );
      return;
    }

    const text =
      `Username: ${credentials.username}\n` +
      `Password: ${credentials.password}`;

    try {
      await Clipboard.setStringAsync(text);

      Alert.alert(
        "Copied",
        "Username and password copied successfully."
      );
    } catch (error) {
      Alert.alert(
        "Copy Failed",
        "Unable to copy credentials."
      );
    }
  };

  // BACK BUTTON
  const handleBack = () => {
    if (go) {
      go("home");
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={BG}
      />

      {/* HEADER */}
      <View style={styles.header}>

        <TouchableOpacity
          style={styles.backButton}
          onPress={handleBack}
          activeOpacity={0.7}
          hitSlop={{
            top: 8,
            bottom: 8,
            left: 8,
            right: 8,
          }}
        >
          <MaterialCommunityIcons
            name="arrow-left"
            size={22}
            color="#fff"
          />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>
          Add Worker
        </Text>

        <View style={styles.headerRightSpace} />

      </View>

      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >

        {/* NAME */}
        <View style={styles.inputBox}>

          <MaterialCommunityIcons
            name="account-outline"
            size={19}
            color={MUTED}
          />

          <TextInput
            style={styles.input}
            placeholder="Name"
            placeholderTextColor={MUTED}
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
            returnKeyType="next"
          />

        </View>

        {/* DATE OF BIRTH */}
        <TouchableOpacity
          style={styles.inputBox}
          onPress={openDatePicker}
          activeOpacity={0.7}
        >

          <MaterialCommunityIcons
            name="calendar-outline"
            size={19}
            color={MUTED}
          />

          <Text
            style={[
              styles.selectText,
              !dob && styles.placeholderText,
            ]}
          >
            {dob || "Date of Birth"}
          </Text>

          <MaterialCommunityIcons
            name="calendar"
            size={18}
            color={MUTED}
          />

        </TouchableOpacity>

        {/* DATE PICKER */}
        {showDatePicker && (
          <DateTimePicker
            value={selectedDate}
            mode="date"
            display={
              Platform.OS === "ios"
                ? "spinner"
                : "default"
            }
            maximumDate={new Date()}
            onChange={handleDateChange}
          />
        )}

        {/* GENDER */}
        <TouchableOpacity
          style={styles.inputBox}
          onPress={openGenderPicker}
          activeOpacity={0.7}
        >

          <MaterialCommunityIcons
            name="gender-male-female"
            size={19}
            color={MUTED}
          />

          <Text
            style={[
              styles.selectText,
              !gender && styles.placeholderText,
            ]}
          >
            {gender || "Gender"}
          </Text>

          <MaterialCommunityIcons
            name="chevron-down"
            size={20}
            color={MUTED}
          />

        </TouchableOpacity>

        {/* EXPERIENCE */}
        <View style={styles.inputBox}>

          <MaterialCommunityIcons
            name="briefcase-outline"
            size={19}
            color={MUTED}
          />

          <TextInput
            style={styles.input}
            placeholder="Experience (in years)"
            placeholderTextColor={MUTED}
            value={experience}
            onChangeText={(text) =>
              setExperience(
                text.replace(/[^0-9.]/g, "")
              )
            }
            keyboardType="numeric"
            returnKeyType="done"
          />

        </View>

        {/* CONTACT TYPE */}
        <TouchableOpacity
          style={styles.inputBox}
          onPress={openContactPicker}
          activeOpacity={0.7}
        >

          <MaterialCommunityIcons
            name="card-account-details-outline"
            size={19}
            color={MUTED}
          />

          <Text
            style={[
              styles.selectText,
              !contactType && styles.placeholderText,
            ]}
          >
            {contactType || "Contact Type"}
          </Text>

          <MaterialCommunityIcons
            name="chevron-down"
            size={20}
            color={MUTED}
          />

        </TouchableOpacity>

        {/* GENERATE */}
        <TouchableOpacity
          style={styles.generateButton}
          onPress={generateCredentials}
          activeOpacity={0.8}
        >

          <MaterialCommunityIcons
            name="account-key-outline"
            size={20}
            color="#fff"
          />

          <Text style={styles.generateText}>
            Generate Username & Password
          </Text>

        </TouchableOpacity>

        {/* CREDENTIALS */}
        {credentials && (
          <View style={styles.credentialsCard}>

            <Text style={styles.credentialsTitle}>
              Generated Credentials
            </Text>

            {/* USERNAME */}
            <View style={styles.credentialRow}>

              <Text style={styles.credentialLabel}>
                Username:
              </Text>

              <Text style={styles.credentialValue}>
                {credentials.username}
              </Text>

            </View>

            {/* PASSWORD */}
            <View style={styles.credentialRow}>

              <Text style={styles.credentialLabel}>
                Password:
              </Text>

              <Text style={styles.credentialValue}>
                {credentials.password}
              </Text>

            </View>

            {/* COPY BUTTON */}
            <TouchableOpacity
              style={styles.copyButton}
              onPress={copyCredentials}
              activeOpacity={0.7}
              hitSlop={{
                top: 8,
                bottom: 8,
                left: 8,
                right: 8,
              }}
            >

              <MaterialCommunityIcons
                name="content-copy"
                size={17}
                color={PURPLE}
              />

              <Text style={styles.copyText}>
                Copy Credentials
              </Text>

            </TouchableOpacity>

          </View>
        )}

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({

  safe: {
    flex: 1,
    backgroundColor: BG,
  },

  scroll: {
    flex: 1,
  },

  /* HEADER */
  header: {
    height: 62,
    backgroundColor: PURPLE,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
  },

  backButton: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },

  headerTitle: {
    flex: 1,
    textAlign: "center",
    color: "#fff",
    fontSize: 19,
    fontWeight: "800",
  },

  headerRightSpace: {
    width: 44,
  },

  /* CONTENT */
  content: {
    padding: 19,
    paddingTop: 20,
    paddingBottom: 50,
  },

  /* INPUT */
  inputBox: {
    minHeight: 55,
    backgroundColor: "#fff",
    borderRadius: 13,
    borderWidth: 1,
    borderColor: BORDER,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    marginBottom: 11,
  },

  input: {
    flex: 1,
    height: 53,
    marginLeft: 10,
    color: TEXT,
    fontSize: 14,
  },

  selectText: {
    flex: 1,
    marginLeft: 10,
    color: TEXT,
    fontSize: 14,
    fontWeight: "500",
  },

  placeholderText: {
    color: MUTED,
    fontWeight: "400",
  },

  /* GENERATE BUTTON */
  generateButton: {
    minHeight: 55,
    borderRadius: 13,
    backgroundColor: PURPLE,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 4,
    elevation: 2,
  },

  generateText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "800",
    marginLeft: 9,
  },

  /* CREDENTIALS */
  credentialsCard: {
    backgroundColor: LIGHT_PURPLE,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: BORDER,
    padding: 16,
    marginTop: 13,
  },

  credentialsTitle: {
    color: TEXT,
    fontSize: 14,
    fontWeight: "900",
    marginBottom: 11,
  },

  credentialRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 7,
  },

  credentialLabel: {
    width: 82,
    color: MUTED,
    fontSize: 12,
    fontWeight: "700",
  },

  credentialValue: {
    flex: 1,
    color: PURPLE,
    fontSize: 13,
    fontWeight: "900",
  },

  copyButton: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-end",
    marginTop: 13,
    paddingVertical: 6,
    paddingHorizontal: 5,
  },

  copyText: {
    color: PURPLE,
    fontSize: 12,
    fontWeight: "800",
    marginLeft: 6,
  },

});
