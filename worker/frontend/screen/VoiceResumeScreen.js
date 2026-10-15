import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const COLORS = {
  PRIMARY_BG: '#F0F4F8',
  WHITE: '#FFFFFF',
  PURPLE: '#6B46C1',
  DARK_GRAY: '#4A5568',
  GRAY: '#718096',
  LIGHT_BG: '#E2E8F0',
};

const VoiceResumeScreen = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <MaterialCommunityIcons name="arrow-left" size={24} color={COLORS.PURPLE} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Voice Resume</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.content}>
        {/* COMING SOON CARD */}
        <View style={styles.comingSoonCard}>
          <MaterialCommunityIcons
            name="microphone-settings"
            size={64}
            color={COLORS.PURPLE}
          />
          <Text style={styles.comingSoonTitle}>Voice Recording Coming Soon!</Text>
          <Text style={styles.comingSoonText}>
            In-app voice recording feature will be available in the next app update. 
          </Text>
          <Text style={styles.comingSoonSubText}>
            This feature requires a full native build which is currently in progress.
          </Text>
        </View>

        {/* INFO CARD */}
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}> What's Next:</Text>
          <Text style={styles.infoText}>• Full Android APK build with native audio support</Text>
          <Text style={styles.infoText}>• Record 30-60 second voice introductions</Text>
          <Text style={styles.infoText}>• Upload to your worker profile</Text>
          <Text style={styles.infoText}>• Clients can hear your voice introduction</Text>
        </View>

        <TouchableOpacity
          style={styles.okayButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.8}
        >
          <Text style={styles.okayButtonText}>Okay, Got It</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.PRIMARY_BG,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.WHITE,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.LIGHT_BG,
  },

  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: COLORS.LIGHT_BG,
    alignItems: 'center',
    justifyContent: 'center',
  },

  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.DARK_GRAY,
  },

  content: {
    flex: 1,
    padding: 20,
  },

  comingSoonCard: {
    backgroundColor: '#F0F9FF',
    borderRadius: 20,
    padding: 40,
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 2,
    borderColor: '#BFDBFE',
    borderStyle: 'dashed',
  },

  comingSoonTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.PURPLE,
    marginTop: 20,
    marginBottom: 12,
    textAlign: 'center',
  },

  comingSoonText: {
    fontSize: 15,
    color: COLORS.DARK_GRAY,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 8,
  },

  comingSoonSubText: {
    fontSize: 13,
    color: COLORS.GRAY,
    textAlign: 'center',
    fontStyle: 'italic',
  },

  infoCard: {
    backgroundColor: COLORS.WHITE,
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
  },

  infoTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.PURPLE,
    marginBottom: 12,
  },

  infoText: {
    fontSize: 14,
    color: COLORS.DARK_GRAY,
    lineHeight: 24,
    marginLeft: 8,
  },

  okayButton: {
    height: 56,
    borderRadius: 16,
    backgroundColor: COLORS.PURPLE,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 'auto',
  },

  okayButtonText: {
    color: COLORS.WHITE,
    fontSize: 16,
    fontWeight: '700',
  },
});

export default VoiceResumeScreen;
