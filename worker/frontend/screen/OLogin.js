import React, { useState } from "react";
import {
  SafeAreaView,
  StatusBar,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Keyboard,
  Image,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { login } from '../services/auth.service';
import { translate } from '../utils/translations';

const PURPLE = "#49769F";
const BG = "#F8FAFC";
const TEXT = "#111827";
const MUTED = "#6B7280";
const BORDER = "#E0E7ED";

export default function OrganizationLogin({ go, onLogin, language = "English" }) {
  const [emailOrPhone, setEmailOrPhone] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    const enteredCredential = emailOrPhone.trim();
    const enteredPassword = password.trim();

    if (!enteredCredential) {
      Alert.alert(
        translate('required', language),
        translate('enterEmailOrPhone', language)
      );
      return;
    }

    if (!enteredPassword) {
      Alert.alert(
        translate('required', language),
        translate('enterPassword', language)
      );
      return;
    }

    Keyboard.dismiss();
    setLoading(true);

    try {
      // First, try regular login (for org admins)
      try {
        console.log('[SEC] Attempting login for:', enteredCredential);
        const response = await login(enteredCredential, enteredPassword);
        
        // Check if user is organization admin
        const userRole = response.user.role;
        if (userRole === 'organization_admin') {
          console.log('[OK] Organization admin login successful');
          
          // Store user_type and user_role for profile screen
          await AsyncStorage.setItem('user_type', 'organization_admin');
          await AsyncStorage.setItem('user_role', 'organization_admin');
          await AsyncStorage.setItem('@sahayak:just_logged_in', 'true');
          
          Alert.alert(
            translate('successExclamation', language),
            `${translate('welcomeBack', language)}, ${response.user.full_name || response.user.username}!`,
            [
              {
                text: 'OK',
                onPress: () => {
                  if (onLogin) {
                    onLogin(response.user.role_name || response.user.role);
                  } else {
                    go("home");
                  }
                },
              },
            ]
          );
          setLoading(false);
          return;
        } else if (userRole === 'organization_worker') {
          // This shouldn't happen, but handle it anyway
          console.log('[OK] Organization worker found in regular auth');
          
          // Store user_type and user_role for profile screen
          await AsyncStorage.setItem('user_type', 'organization_worker');
          await AsyncStorage.setItem('user_role', 'organization_worker');
          
          Alert.alert(
            translate('successExclamation', language),
            `${translate('welcomeBack', language)}, ${response.user.full_name || response.user.username}!`,
            [
              {
                text: 'OK',
                onPress: () => {
                  if (onLogin) {
                    onLogin(response.user.role_name || response.user.role);
                  } else {
                    go("orgWorkerHome");
                  }
                },
              },
            ]
          );
          setLoading(false);
          return;
        } else {
          // Wrong user type
          Alert.alert(
            translate('accessDenied', language),
            translate('orgLoginOnlyMessage', language)
          );
          setLoading(false);
          return;
        }
      } catch (adminError) {
        // Silently try org worker login (no error logging yet)
        
        // Try org worker login
        const { API_ENDPOINTS } = require('../config/api');
        const AsyncStorage = require('@react-native-async-storage/async-storage').default;
        
        const workerResponse = await fetch(API_ENDPOINTS.ORG_WORKER_LOGIN, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            username: enteredCredential,
            password: enteredPassword,
          }),
        });

        const workerData = await workerResponse.json();

        if (workerData.success) {
          console.log('[OK] Organization worker login successful');
          
          // Store org worker data
          await AsyncStorage.setItem('worker_data', JSON.stringify(workerData.user));
          await AsyncStorage.setItem('org_worker_data', JSON.stringify(workerData.user));
          await AsyncStorage.setItem('org_worker_token', JSON.stringify(workerData.token || { worker_id: workerData.user.id }));
          // Store real JWT token for push notifications and API auth
          if (workerData.access) {
            await AsyncStorage.setItem('access_token', workerData.access);
            if (workerData.refresh) {
              await AsyncStorage.setItem('refresh_token', workerData.refresh);
            }
            console.log('[AUTH] Stored JWT access token for org worker');
          } else {
            const simpleToken = `org_worker_${workerData.user.id}_${Date.now()}`;
            await AsyncStorage.setItem('access_token', simpleToken);
            console.log('[AUTH] Stored fallback token:', simpleToken);
          }
          await AsyncStorage.setItem('user_role', 'organization_worker');
          await AsyncStorage.setItem('user_type', 'org_worker');
          await AsyncStorage.setItem('@sahayak:just_logged_in', 'true');
          
          Alert.alert(
            translate('successExclamation', language),
            `${translate('welcomeBack', language)}, ${workerData.user.full_name || workerData.user.username}!`,
            [
              {
                text: 'OK',
                onPress: () => {
                  if (onLogin) {
                    onLogin('organization_worker');
                  } else {
                    go("orgWorkerHome");
                  }
                },
              },
            ]
          );
          setLoading(false);
          return;
        } else {
          // Both logins failed - NOW log the error
          throw new Error(workerData.error || 'Invalid credentials');
        }
      }
    } catch (error) {
      console.error('[FAIL] Organization Login failed:', error.message || 'Invalid credentials');
      
      let errorMessage = translate('invalidCredentialsMessage', language);
      
      if (error.message && error.message !== 'Invalid credentials') {
        errorMessage = error.message;
      }
      
      Alert.alert(translate('loginFailed', language), errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>

      <StatusBar
        barStyle="light-content"
        backgroundColor={PURPLE}
      />

      {/* BACK BUTTON */}
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => go("workerWelcome")}
        activeOpacity={0.7}
      >
        <MaterialCommunityIcons
          name="arrow-left"
          size={24}
          color="#fff"
        />
      </TouchableOpacity>

      {/* BLUE TOP */}
      <View style={styles.topShape}>
        <Image
          source={require('../assets/logo.png')}
          style={styles.logoImage}
          resizeMode="cover"
        />
        <Text style={styles.title}>
          {translate('organizationLogin', language)}
        </Text>
        <Text style={styles.subtitle}>
          {translate('organizationLoginSubtitle', language)}
        </Text>
      </View>

      {/* LOGIN FORM */}
      <View style={styles.formCard}>

        {/* EMAIL / PHONE */}
        <View style={styles.inputBox}>
          <MaterialCommunityIcons
            name="account-outline"
            size={20}
            color={MUTED}
          />

          <TextInput
            style={styles.input}
            placeholder={translate('emailOrPhoneNumber', language)}
            placeholderTextColor={MUTED}
            value={emailOrPhone}
            onChangeText={setEmailOrPhone}
            autoCapitalize="none"
            keyboardType="email-address"
          />
        </View>

        {/* PASSWORD */}
        <View style={styles.inputBox}>
          <MaterialCommunityIcons
            name="lock-outline"
            size={20}
            color={MUTED}
          />

          <TextInput
            style={styles.input}
            placeholder={translate('password', language)}
            placeholderTextColor={MUTED}
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
          />

          <TouchableOpacity
            onPress={() => setShowPassword(!showPassword)}
            activeOpacity={0.7}
          >
            <MaterialCommunityIcons
              name={showPassword ? "eye-outline" : "eye-off-outline"}
              size={20}
              color={MUTED}
            />
          </TouchableOpacity>
        </View>

        {/* FORGOT */}
        <TouchableOpacity
          style={styles.forgotButton}
          onPress={() =>
            Alert.alert(
              translate('forgotPassword', language),
              translate('pleaseContactOrgAdmin', language)
            )
          }
        >
          <Text style={styles.forgotText}>
            {translate('forgotPassword', language)}
          </Text>
        </TouchableOpacity>

        {/* LOGIN */}
        <TouchableOpacity
          style={[styles.loginButton, loading && styles.loginButtonDisabled]}
          onPress={handleLogin}
          activeOpacity={0.85}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text style={styles.loginText}>
              {translate('loginButton', language)}
            </Text>
          )}
        </TouchableOpacity>

        {/* REGISTER */}
        <View style={styles.registerRow}>
          <Text style={styles.registerNormal}>
            {translate('dontHaveOrganization', language)}{" "}
          </Text>

          <TouchableOpacity
            onPress={() => go("organizationRegistration")}
          >
            <Text style={styles.registerLink}>
              {translate('register', language)}
            </Text>
          </TouchableOpacity>
        </View>

      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: BG,
  },

  backButton: {
    position: 'absolute',
    top: 40,
    left: 20,
    zIndex: 10,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  topShape: {
    height: 230,
    backgroundColor: PURPLE,
    alignItems: "center",
    paddingTop: 36,
    borderBottomLeftRadius: 90,
    borderBottomRightRadius: 90,
  },

  logoImage: {
    width: 52,
    height: 52,
    borderRadius: 14,
    marginBottom: 6,
  },

  title: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "800",
    marginBottom: 4,
  },

  subtitle: {
    color: "#fff",
    fontSize: 13,
    opacity: 0.9,
  },

  formCard: {
    marginHorizontal: 18,
    marginTop: -30,
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: BORDER,
  },

  inputBox: {
    height: 50,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 13,
    marginBottom: 10,
  },

  input: {
    flex: 1,
    height: 48,
    marginLeft: 9,
    color: TEXT,
    fontSize: 14,
  },

  forgotButton: {
    alignSelf: "flex-end",
    marginTop: -2,
    marginBottom: 15,
  },

  forgotText: {
    color: PURPLE,
    fontSize: 12,
    fontWeight: "700",
  },

  loginButton: {
    height: 52,
    backgroundColor: PURPLE,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 5,
  },

  loginButtonDisabled: {
    opacity: 0.6,
  },

  loginText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },

  registerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 18,
  },

  registerNormal: {
    color: MUTED,
    fontSize: 12,
  },

  registerLink: {
    color: PURPLE,
    fontSize: 12,
    fontWeight: "700",
  },
});
