import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Modal,
} from "react-native";

import { MaterialCommunityIcons } from "@expo/vector-icons";

const PURPLE = "#49769F";

export default function OTPVerification({
  phone = "",
  onBack,
  onVerified,
}) {
  const [otp, setOtp] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [resendTimer, setResendTimer] = useState(30);

  // SUCCESS POPUP
  const [successVisible, setSuccessVisible] = useState(false);

  const otpInputRef = useRef(null);

  // ============================================================
  // DEMO OTP
  // ============================================================

  const DEMO_OTP = "123456";

  // ============================================================
  // AUTO FOCUS
  // ============================================================

  useEffect(() => {
    const timer = setTimeout(() => {
      otpInputRef.current?.focus();
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  // ============================================================
  // RESEND TIMER
  // ============================================================

  useEffect(() => {
    if (resendTimer <= 0) {
      return;
    }

    const timer = setInterval(() => {
      setResendTimer((previous) => {
        if (previous <= 1) {
          clearInterval(timer);
          return 0;
        }

        return previous - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [resendTimer]);

  // ============================================================
  // AUTO OTP VERIFICATION
  // ============================================================

  useEffect(() => {
    if (otp.length === 6 && !verifying && !successVisible) {
      verifyOTP(otp);
    }
  }, [otp]);

  // ============================================================
  // VERIFY OTP
  // ============================================================

  const verifyOTP = (enteredOTP) => {
    if (verifying || successVisible) {
      return;
    }

    setVerifying(true);

    setTimeout(() => {
      // ========================================================
      // CORRECT DEMO OTP
      // ========================================================

      if (enteredOTP === DEMO_OTP) {
        setVerifying(false);

        // SHOW SUCCESS POPUP
        setSuccessVisible(true);

        // GO TO NEXT SCREEN AFTER POPUP
        setTimeout(() => {
          setSuccessVisible(false);

          if (onVerified) {
            onVerified();
          }
        }, 1800);

        return;
      }

      // ========================================================
      // WRONG OTP
      // ========================================================

      setVerifying(false);

      Alert.alert(
        "Invalid OTP",
        "The OTP you entered is incorrect.",
        [
          {
            text: "OK",
            onPress: () => {
              setOtp("");

              setTimeout(() => {
                otpInputRef.current?.focus();
              }, 200);
            },
          },
        ]
      );
    }, 800);
  };

  // ============================================================
  // OTP INPUT
  // ============================================================

  const handleOTPChange = (text) => {
    const cleanOTP = text
      .replace(/\D/g, "")
      .slice(0, 6);

    setOtp(cleanOTP);
  };

  // ============================================================
  // RESEND OTP
  // ============================================================

  const resendOTP = () => {
    if (resendTimer > 0 || verifying || successVisible) {
      return;
    }

    setOtp("");
    setResendTimer(30);

    Alert.alert(
      "OTP Sent",
      `A new OTP has been sent to ${
        phone || "your phone number"
      }.`
    );

    setTimeout(() => {
      otpInputRef.current?.focus();
    }, 200);
  };

  // ============================================================
  // PHONE DISPLAY
  // ============================================================

  const maskedPhone = phone
    ? `******${phone.slice(-4)}`
    : "your registered number";

  // ============================================================
  // TIMER FORMAT
  // ============================================================

  const minutes = Math.floor(resendTimer / 60)
    .toString()
    .padStart(2, "0");

  const seconds = (resendTimer % 60)
    .toString()
    .padStart(2, "0");

  // ============================================================
  // UI
  // ============================================================

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={
        Platform.OS === "ios"
          ? "padding"
          : "height"
      }
    >
      <View style={styles.screen}>

        {/* ======================================================
            HEADER
        ====================================================== */}

        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={onBack}
            disabled={verifying || successVisible}
            activeOpacity={0.7}
          >
            <MaterialCommunityIcons
              name="arrow-left"
              size={24}
              color="#222222"
            />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>
            OTP Verification
          </Text>

          <View style={styles.headerSpacer} />
        </View>

        {/* ======================================================
            CONTENT
        ====================================================== */}

        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="always"
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.content}>

            {/* SHIELD ICON */}

            <View style={styles.iconCircle}>
              <MaterialCommunityIcons
                name="shield-check-outline"
                size={48}
                color={PURPLE}
              />
            </View>

            {/* TITLE */}

            <Text style={styles.title}>
              Verify Your Phone
            </Text>

            <Text style={styles.subtitle}>
              We've sent a 6-digit verification code to
            </Text>

            <Text style={styles.phone}>
              {maskedPhone}
            </Text>

            {/* INFO BOX */}

            <View style={styles.infoBox}>
              <View style={styles.infoIcon}>
                <MaterialCommunityIcons
                  name="information-outline"
                  size={21}
                  color={PURPLE}
                />
              </View>

              <Text style={styles.infoText}>
                Enter the OTP received on your phone.
                Verification will happen automatically
                when all 6 digits are entered.
              </Text>
            </View>

            {/* ENTER OTP */}

            <Text style={styles.label}>
              Enter OTP
            </Text>

            {/* ACTUAL INPUT */}

            <TextInput
              ref={otpInputRef}
              value={otp}
              onChangeText={handleOTPChange}
              keyboardType="number-pad"
              maxLength={6}
              autoFocus
              textContentType="oneTimeCode"
              autoComplete="sms-otp"
              importantForAutofill="yes"
              style={styles.hiddenOTPInput}
              editable={!verifying && !successVisible}
              caretHidden={true}
              contextMenuHidden={false}
            />

            {/* OTP BOXES */}

            <TouchableOpacity
              activeOpacity={1}
              style={styles.otpBoxes}
              onPress={() => {
                if (!verifying && !successVisible) {
                  otpInputRef.current?.focus();
                }
              }}
            >
              {[0, 1, 2, 3, 4, 5].map((index) => {
                const digit = otp[index];

                const isActive =
                  index === otp.length &&
                  !verifying &&
                  !successVisible;

                return (
                  <View
                    key={index}
                    style={[
                      styles.otpBox,
                      digit && styles.otpBoxFilled,
                      isActive && styles.otpBoxActive,
                    ]}
                  >
                    <Text style={styles.otpDigit}>
                      {digit || ""}
                    </Text>
                  </View>
                );
              })}
            </TouchableOpacity>

            {/* VERIFYING */}

            {verifying && (
              <View style={styles.verifyingBox}>
                <MaterialCommunityIcons
                  name="loading"
                  size={20}
                  color={PURPLE}
                />

                <Text style={styles.verifyingText}>
                  Verifying OTP...
                </Text>
              </View>
            )}

            {/* TIMER CARD */}

            <View style={styles.timerCard}>
              <View style={styles.timerIconCircle}>
                <MaterialCommunityIcons
                  name="timer-outline"
                  size={22}
                  color={PURPLE}
                />
              </View>

              <View style={styles.timerTextContainer}>
                <Text style={styles.timerTitle}>
                  Didn't receive the OTP?
                </Text>

                <Text style={styles.timerSubtitle}>
                  {resendTimer > 0
                    ? "You can request a new OTP after"
                    : "You can request a new OTP now"}
                </Text>
              </View>

              {resendTimer > 0 ? (
                <View style={styles.timerCircle}>
                  <Text style={styles.timerValue}>
                    {seconds}
                  </Text>

                  <Text style={styles.timerSec}>
                    sec
                  </Text>
                </View>
              ) : (
                <TouchableOpacity
                  activeOpacity={0.8}
                  disabled={verifying || successVisible}
                  style={styles.resendButtonBox}
                  onPress={resendOTP}
                >
                  <MaterialCommunityIcons
                    name="refresh"
                    size={19}
                    color="#FFFFFF"
                  />

                  <Text style={styles.resendButtonText}>
                    Resend
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            {/* WAIT TEXT */}

            {resendTimer > 0 && (
              <Text style={styles.waitText}>
                Resend OTP available in{" "}
                <Text style={styles.waitTimer}>
                  {minutes}:{seconds}
                </Text>
              </Text>
            )}

            <View style={styles.bottomSpace} />

          </View>
        </ScrollView>

        {/* ======================================================
            SUCCESS POPUP
        ====================================================== */}

        <Modal
          visible={successVisible}
          transparent={true}
          animationType="fade"
          statusBarTranslucent={true}
          onRequestClose={() => {}}
        >
          <View style={styles.successOverlay}>

            <View style={styles.successCard}>

              {/* BLUE CIRCLE */}

              <View style={styles.successCircle}>
                <MaterialCommunityIcons
                  name="check"
                  size={55}
                  color="#FFFFFF"
                />
              </View>

              {/* SUCCESS TITLE */}

              <Text style={styles.successTitle}>
                Registration Successful!
              </Text>

              {/* SUCCESS MESSAGE */}

              <Text style={styles.successMessage}>
                Your phone number has been verified
                successfully.
              </Text>

              <Text style={styles.successSubMessage}>
                Your worker account is ready.
              </Text>

              {/* SMALL CHECK */}

              <View style={styles.successBottomRow}>
                <MaterialCommunityIcons
                  name="check-circle"
                  size={18}
                  color={PURPLE}
                />

                <Text style={styles.successBottomText}>
                  Verification Complete
                </Text>
              </View>

            </View>
          </View>
        </Modal>

      </View>
    </KeyboardAvoidingView>
  );
}

// ============================================================
// STYLES
// ============================================================

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },

  // HEADER

  header: {
    height: 62,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#EEEEEE",
    backgroundColor: "#FFFFFF",
  },

  backButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },

  headerTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#202020",
  },

  headerSpacer: {
    width: 40,
  },

  // SCROLL

  scrollContent: {
    flexGrow: 1,
    paddingBottom: 30,
  },

  // CONTENT

  content: {
    flex: 1,
    paddingHorizontal: 22,
    alignItems: "center",
    paddingTop: 45,
  },

  // ICON

  iconCircle: {
    width: 92,
    height: 92,
    borderRadius: 46,
    backgroundColor: "#EEF5F9",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#DDEAF1",
  },

  // TITLE

  title: {
    fontSize: 25,
    fontWeight: "800",
    color: "#202020",
    marginTop: 24,
    textAlign: "center",
  },

  subtitle: {
    fontSize: 14,
    color: "#777777",
    marginTop: 8,
    textAlign: "center",
    lineHeight: 21,
  },

  phone: {
    fontSize: 15,
    fontWeight: "800",
    color: PURPLE,
    marginTop: 4,
  },

  // INFO

  infoBox: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EEF5F9",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#DDEAF1",
    padding: 13,
    marginTop: 25,
  },

  infoIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },

  infoText: {
    flex: 1,
    marginLeft: 10,
    fontSize: 12.5,
    color: "#555555",
    lineHeight: 18,
  },

  // LABEL

  label: {
    width: "100%",
    fontSize: 14,
    fontWeight: "800",
    color: "#333333",
    marginTop: 25,
    marginBottom: 10,
  },

  // HIDDEN INPUT

  hiddenOTPInput: {
    position: "absolute",
    width: 2,
    height: 2,
    opacity: 0,
    left: 0,
    top: 0,
  },

  // OTP BOXES

  otpBoxes: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    minHeight: 54,
  },

  otpBox: {
    width: 48,
    height: 54,
    borderWidth: 1.5,
    borderColor: "#D9D9D9",
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },

  otpBoxFilled: {
    borderColor: PURPLE,
    backgroundColor: "#F3F7FA",
  },

  otpBoxActive: {
    borderColor: PURPLE,
    borderWidth: 2,
  },

  otpDigit: {
    fontSize: 21,
    fontWeight: "800",
    color: PURPLE,
  },

  // VERIFYING

  verifyingBox: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 18,
  },

  verifyingText: {
    marginLeft: 7,
    color: PURPLE,
    fontSize: 13,
    fontWeight: "700",
  },

  // TIMER

  timerCard: {
    width: "100%",
    minHeight: 78,
    marginTop: 28,
    paddingHorizontal: 13,
    paddingVertical: 12,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: "#DDEAF1",
    backgroundColor: "#F8FBFD",
    flexDirection: "row",
    alignItems: "center",
  },

  timerIconCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#EEF5F9",
    alignItems: "center",
    justifyContent: "center",
  },

  timerTextContainer: {
    flex: 1,
    marginLeft: 10,
  },

  timerTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: "#333333",
  },

  timerSubtitle: {
    fontSize: 11.5,
    color: "#777777",
    marginTop: 4,
    lineHeight: 16,
  },

  // TIMER CIRCLE

  timerCircle: {
    width: 53,
    height: 53,
    borderRadius: 27,
    borderWidth: 2,
    borderColor: PURPLE,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },

  timerValue: {
    fontSize: 16,
    fontWeight: "800",
    color: PURPLE,
    lineHeight: 18,
  },

  timerSec: {
    fontSize: 8,
    fontWeight: "700",
    color: "#777777",
  },

  // RESEND

  resendButtonBox: {
    minWidth: 82,
    height: 40,
    paddingHorizontal: 11,
    borderRadius: 10,
    backgroundColor: PURPLE,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
  },

  resendButtonText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "800",
    marginLeft: 5,
  },

  // WAIT

  waitText: {
    marginTop: 12,
    fontSize: 12,
    color: "#888888",
    textAlign: "center",
  },

  waitTimer: {
    color: PURPLE,
    fontWeight: "800",
  },

  // BOTTOM

  bottomSpace: {
    height: 40,
  },

  // ==========================================================
  // SUCCESS POPUP
  // ==========================================================

  successOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 28,
  },

  successCard: {
    width: "100%",
    maxWidth: 380,
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    paddingHorizontal: 25,
    paddingVertical: 30,
    alignItems: "center",
    elevation: 10,
    shadowColor: "#000000",
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.2,
    shadowRadius: 12,
  },

  // BLUE CHECK CIRCLE

  successCircle: {
    width: 92,
    height: 92,
    borderRadius: 46,
    backgroundColor: PURPLE,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
    borderWidth: 5,
    borderColor: "#EAF3F9",
  },

  successTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#202020",
    textAlign: "center",
  },

  successMessage: {
    fontSize: 14,
    color: "#666666",
    textAlign: "center",
    lineHeight: 21,
    marginTop: 10,
  },

  successSubMessage: {
    fontSize: 13,
    color: PURPLE,
    fontWeight: "700",
    textAlign: "center",
    marginTop: 5,
  },

  successBottomRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 20,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: "#EEEEEE",
    width: "100%",
    justifyContent: "center",
  },

  successBottomText: {
    fontSize: 12,
    fontWeight: "700",
    color: PURPLE,
    marginLeft: 6,
  },
});
