/**
 * Organisation Worker Login Screen
 * Separate authentication for org workers
 * Uses username (phone) and password (org_id + first_name + birth_year)
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_ENDPOINTS } from '../../config/api';
import { translate } from '../../utils/translations';
import { useTextToSpeech } from '../../utils/useTextToSpeech';
import VoiceGuidanceButton from '../../components/VoiceGuidanceButton';

const PURPLE = '#49769F';
const LIGHT_PURPLE = '#EEF4F8';
const TEXT = '#111827';
const MUTED = '#6B7280';

let orgWorkerLoginIntroSpoken = false;

export default function OrgWorkerLogin({ go, language = "English" }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const { speak: speakOrgWorkerLogin, stop: stopOrgWorkerLogin } = useTextToSpeech(language);

  React.useEffect(() => {
    if (orgWorkerLoginIntroSpoken) {
      return;
    }
    orgWorkerLoginIntroSpoken = true;
    const intro = translate('orgWorkerLoginAutoIntro', language);
    speakOrgWorkerLogin(intro);
    return () => {
      stopOrgWorkerLogin();
    };
  }, [language, speakOrgWorkerLogin, stopOrgWorkerLogin]);

  const handleLogin = async () => {
    if (!username.trim()) {
      Alert.alert(translate('error', language), translate('pleaseEnterUsername', language));
      return;
    }

    if (!password.trim()) {
      Alert.alert(translate('error', language), translate('pleaseEnterPassword', language));
      return;
    }

    setLoading(true);

    try {
      console.log('[AUTH] Org Worker Login attempt:', username);

      const response = await fetch(API_ENDPOINTS.ORG_WORKER_LOGIN, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: username.trim(),
          password: password.trim(),
        }),
      });

      const data = await response.json();
      console.log('Response:', data);

      if (data.success) {
        // Store org worker data
        await AsyncStorage.setItem('org_worker_data', JSON.stringify(data.user));
        await AsyncStorage.setItem('worker_data', JSON.stringify(data.user));
        if (data.access) {
          await AsyncStorage.setItem('access_token', data.access);
          if (data.refresh) {
            await AsyncStorage.setItem('refresh_token', data.refresh);
          }
          console.log('[AUTH] Stored JWT access token for org worker');
        } else {
          const simpleToken = `org_worker_${data.user.id}_${Date.now()}`;
          await AsyncStorage.setItem('access_token', simpleToken);
        }
        await AsyncStorage.setItem('org_worker_token', JSON.stringify(data.token));
        await AsyncStorage.setItem('user_role', 'organization_worker');
        await AsyncStorage.setItem('user_type', 'org_worker');
        await AsyncStorage.setItem('@sahayak:just_logged_in', 'true');

        Alert.alert(translate('success', language), translate('loginSuccessful', language), [
          { text: translate('ok', language), onPress: () => go('orgWorkerHome') },
        ]);
      } else {
        Alert.alert(translate('loginFailed', language), data.error || translate('invalidCredentialsSimple', language));
      }
    } catch (error) {
      console.error('Login error:', error);
      Alert.alert(translate('error', language), translate('failedToLoginRetry', language));
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => go('workerWelcome')} style={styles.backButton}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={TEXT} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{translate('orgWorkerLoginTitle', language)}</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.voiceGuidanceWrap}>
        <VoiceGuidanceButton
          labeled
          text={translate('orgWorkerLoginVoiceGuidance', language)}
          language={language}
          title={translate('voiceAssistance', language)}
          subtitle={translate('orgWorkerLoginHearHowToUse', language)}
        />
      </View>

      <View style={styles.content}>
        {/* Logo/Icon */}
        <View style={styles.iconContainer}>
          <View style={styles.iconCircle}>
            <MaterialCommunityIcons name="account-hard-hat" size={64} color={PURPLE} />
          </View>
          <Text style={styles.welcomeText}>{translate('welcomeBackExcl', language)}</Text>
          <Text style={styles.subtitleText}>{translate('orgWorkerLoginSubtitle', language)}</Text>
        </View>

        {/* Login Form */}
        <View style={styles.form}>
          <View style={styles.inputBox}>
            <MaterialCommunityIcons name="account" size={22} color={PURPLE} />
            <TextInput
              style={styles.textInput}
              placeholder={translate('usernamePhonePlaceholder', language)}
              placeholderTextColor={MUTED}
              value={username}
              onChangeText={setUsername}
              keyboardType="phone-pad"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <View style={styles.inputBox}>
            <MaterialCommunityIcons name="lock" size={22} color={PURPLE} />
            <TextInput
              style={styles.textInput}
              placeholder={translate('password', language)}
              placeholderTextColor={MUTED}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              autoCorrect={false}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              <MaterialCommunityIcons
                name={showPassword ? 'eye-off' : 'eye'}
                size={22}
                color={MUTED}
              />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[styles.loginButton, loading && styles.disabledButton]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <>
                <Text style={styles.loginButtonText}>{translate('login', language)}</Text>
                <MaterialCommunityIcons name="arrow-right" size={20} color="#fff" />
              </>
            )}
          </TouchableOpacity>

          <View style={styles.infoBox}>
            <MaterialCommunityIcons name="information" size={20} color={PURPLE} />
            <Text style={styles.infoText}>
              {translate('orgWorkerCredentialsInfo', language)}
            </Text>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>{translate('dontHaveOrganisation', language)}</Text>
          <TouchableOpacity onPress={() => go('organizationRegistration')}>
            <Text style={styles.footerLink}>{translate('registerOrganisation', language)}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

// =====================================================
// STYLES
// =====================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E7ED',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: TEXT,
  },
  voiceGuidanceWrap: {
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 4,
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'space-between',
  },
  iconContainer: {
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 40,
  },
  iconCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: LIGHT_PURPLE,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: '700',
    color: TEXT,
    marginBottom: 8,
  },
  subtitleText: {
    fontSize: 15,
    color: MUTED,
    textAlign: 'center',
  },
  form: {
    flex: 1,
  },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: LIGHT_PURPLE,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 16,
    gap: 12,
  },
  textInput: {
    flex: 1,
    fontSize: 15,
    color: TEXT,
  },
  loginButton: {
    backgroundColor: PURPLE,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    marginTop: 8,
    gap: 8,
  },
  disabledButton: {
    opacity: 0.6,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#EFF6FF',
    borderRadius: 12,
    padding: 16,
    marginTop: 24,
    gap: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: TEXT,
    lineHeight: 18,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 16,
  },
  footerText: {
    fontSize: 14,
    color: MUTED,
  },
  footerLink: {
    fontSize: 14,
    fontWeight: '600',
    color: PURPLE,
  },
});
