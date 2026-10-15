import React, { useState } from "react";

import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from "react-native";

import { MaterialCommunityIcons } from "@expo/vector-icons";

import { translate } from "../utils/translations";

const PURPLE = "#49769F";

export default function LanguageSelection({
  onContinue,
  onBack,
  onLanguage,
  language = "English",
}) {
  const [selectedLanguage, setLanguage] = useState(language || "English");

  const languages = [
    ["English", "English"],
    ["मराठी", "Marathi"],
    ["हिंदी", "Hindi"],
  ];

  return (
    <View style={styles.container}>

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack}>
          <MaterialCommunityIcons
            name="arrow-left"
            size={26}
            color="#111827"
          />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>
          Language
        </Text>
      </View>

      {/* Icon */}
      <View style={styles.centerIllustration}>
        <View style={styles.bigIconCircle}>
          <MaterialCommunityIcons
            name="translate"
            size={58}
            color={PURPLE}
          />
        </View>
      </View>

      {/* Title */}
      <Text style={styles.pageTitle}>
        Choose Your Language
      </Text>

      <Text style={styles.pageSubtitle}>
        Select your preferred language to continue
      </Text>

      {/* Languages */}
      {languages.map(([title, sub]) => {
        const active = selectedLanguage === title;

        return (
          <TouchableOpacity
            key={title}
            style={[
              styles.languageCard,
              active && styles.languageActive,
            ]}
            onPress={() => {
              setLanguage(title);
              onLanguage(title);
            }}
          >

            <MaterialCommunityIcons
              name="translate"
              size={23}
              color={active ? "#fff" : PURPLE}
            />

            <View style={styles.languageText}>
              <Text
                style={[
                  styles.languageName,
                  active && styles.activeText,
                ]}
              >
                {title}
              </Text>

              <Text
                style={[
                  styles.languageSub,
                  active && styles.activeSub,
                ]}
              >
                {sub}
              </Text>
            </View>

            {/* Radio */}
            <View
              style={[
                styles.radio,
                active && styles.radioActive,
              ]}
            >
              {active && (
                <View style={styles.radioDot} />
              )}
            </View>

          </TouchableOpacity>
        );
      })}

      {/* Continue */}
      <TouchableOpacity
        style={styles.continueButton}
        onPress={onContinue}
      >
        <Text style={styles.continueText}>
          {translate("continue", language)}
        </Text>

        <MaterialCommunityIcons
          name="arrow-right"
          size={22}
          color="#fff"
        />
      </TouchableOpacity>

      <Text style={styles.bottomHint}>
        You can change your language later in Settings
      </Text>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
    paddingHorizontal: 20,
    paddingTop: 45,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 25,
  },

  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginLeft: 15,
    color: "#111827",
  },

  centerIllustration: {
    alignItems: "center",
    marginTop: 20,
    marginBottom: 25,
  },

  bigIconCircle: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: "#EEF4F8",
    alignItems: "center",
    justifyContent: "center",
  },

  pageTitle: {
    fontSize: 25,
    fontWeight: "700",
    color: "#111827",
    textAlign: "center",
  },

  pageSubtitle: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    marginTop: 8,
    marginBottom: 25,
  },

  languageCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#E0E7ED",
    borderRadius: 14,
    padding: 17,
    marginBottom: 12,
  },

  languageActive: {
    backgroundColor: PURPLE,
    borderColor: PURPLE,
  },

  languageText: {
    flex: 1,
    marginLeft: 14,
  },

  languageName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
  },

  languageSub: {
    fontSize: 13,
    color: "#6B7280",
    marginTop: 3,
  },

  activeText: {
    color: "#fff",
  },

  activeSub: {
    color: "#EDE8FF",
  },

  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: "#CBD5E1",
    alignItems: "center",
    justifyContent: "center",
  },

  radioActive: {
    borderColor: "#fff",
  },

  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#fff",
  },

  continueButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: PURPLE,
    paddingVertical: 15,
    borderRadius: 12,
    marginTop: 20,
  },

  continueText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
    marginRight: 8,
  },

  bottomHint: {
    textAlign: "center",
    color: "#6B7280",
    fontSize: 12,
    marginTop: 15,
  },
});
