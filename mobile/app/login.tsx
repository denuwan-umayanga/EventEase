import {
  Ionicons,
} from "@expo/vector-icons";
import {
  LinearGradient,
} from "expo-linear-gradient";
import {
  router,
} from "expo-router";
import React, {
  useState,
} from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import {
  API_URL,
} from "../src/config/api";
import {
  useAuth,
} from "../src/context/AuthContext";

export default function LoginScreen() {
  const {
    signIn,
  } = useAuth();

  const [
    email,
    setEmail,
  ] = useState("");

  const [
    password,
    setPassword,
  ] = useState("");

  const [
    showPassword,
    setShowPassword,
  ] = useState(false);

  const [
    loading,
    setLoading,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState("");

  const handleLogin =
    async () => {
      setError("");

      if (
        !email.trim() ||
        !password
      ) {
        setError(
          "Please enter your email and password."
        );

        return;
      }

      try {
        setLoading(true);

        const response =
          await fetch(
            `${API_URL}/api/auth/login`,
            {
              method:
                "POST",

              headers: {
                "Content-Type":
                  "application/json",
              },

              body:
                JSON.stringify({
                  email:
                    email
                      .trim()
                      .toLowerCase(),

                  password,
                }),
            }
          );

        const data =
          await response.json();

        if (!response.ok) {
          setError(
            data.message ||
              "Unable to login."
          );

          return;
        }

        await signIn(
          data.token,
          data.user
        );

        if (
          data.user
            .isAdmin === true
        ) {
          router.replace(
            "/admin" as any
          );
        } else {
          router.replace(
            "/home"
          );
        }
      } catch (error) {
        setError(
          "Unable to connect to the EventEase server."
        );
      } finally {
        setLoading(false);
      }
    };

  return (
    <KeyboardAvoidingView
      style={
        styles.container
      }
      behavior={
        Platform.OS ===
        "ios"
          ? "padding"
          : undefined
      }
    >
      <ScrollView
        contentContainerStyle={
          styles.content
        }
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={
          false
        }
      >
        <LinearGradient
          colors={[
            "#7C3AED",
            "#A855F7",
            "#EC4899",
          ]}
          style={styles.hero}
        >
          <View
            style={
              styles.logoBox
            }
          >
            <Ionicons
              name="ticket"
              size={34}
              color="#FFFFFF"
            />
          </View>

          <Text
            style={
              styles.brand
            }
          >
            EventEase
          </Text>

          <Text
            style={
              styles.heroTitle
            }
          >
            Discover moments
            worth remembering.
          </Text>

          <Text
            style={
              styles.heroSubtitle
            }
          >
            Find events,
            reserve your seats
            and enjoy the
            experience.
          </Text>
        </LinearGradient>

        <View
          style={
            styles.formCard
          }
        >
          <Text
            style={
              styles.title
            }
          >
            Welcome back
          </Text>

          <Text
            style={
              styles.subtitle
            }
          >
            Sign in to continue
            to EventEase
          </Text>

          <View
            style={
              styles.inputBox
            }
          >
            <Ionicons
              name="mail-outline"
              size={20}
              color="#A855F7"
            />

            <TextInput
              style={
                styles.input
              }
              placeholder="Email address"
              placeholderTextColor="#9CA3AF"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={
                setEmail
              }
            />
          </View>

          <View
            style={
              styles.inputBox
            }
          >
            <Ionicons
              name="lock-closed-outline"
              size={20}
              color="#A855F7"
            />

            <TextInput
              style={
                styles.input
              }
              placeholder="Password"
              placeholderTextColor="#9CA3AF"
              secureTextEntry={
                !showPassword
              }
              value={password}
              onChangeText={
                setPassword
              }
            />

            <Pressable
              onPress={() =>
                setShowPassword(
                  !showPassword
                )
              }
            >
              <Ionicons
                name={
                  showPassword
                    ? "eye-off-outline"
                    : "eye-outline"
                }
                size={21}
                color="#9CA3AF"
              />
            </Pressable>
          </View>

          {error ? (
            <View
              style={
                styles.errorBox
              }
            >
              <Ionicons
                name="alert-circle-outline"
                size={18}
                color="#DC2626"
              />

              <Text
                style={
                  styles.errorText
                }
              >
                {error}
              </Text>
            </View>
          ) : null}

          <Pressable
            disabled={loading}
            onPress={
              handleLogin
            }
          >
            <LinearGradient
              colors={[
                "#7C3AED",
                "#A855F7",
                "#EC4899",
              ]}
              start={{
                x: 0,
                y: 0,
              }}
              end={{
                x: 1,
                y: 1,
              }}
              style={
                styles.loginButton
              }
            >
              {loading ? (
                <ActivityIndicator
                  color="#FFFFFF"
                />
              ) : (
                <>
                  <Text
                    style={
                      styles.loginText
                    }
                  >
                    Sign In
                  </Text>

                  <Ionicons
                    name="arrow-forward"
                    size={20}
                    color="#FFFFFF"
                  />
                </>
              )}
            </LinearGradient>
          </Pressable>

          <View
            style={
              styles.registerRow
            }
          >
            <Text
              style={
                styles.registerLabel
              }
            >
              New to
              EventEase?
            </Text>

            <Pressable
              onPress={() =>
                router.push(
                  "/register"
                )
              }
            >
              <Text
                style={
                  styles.registerLink
                }
              >
                Create account
              </Text>
            </Pressable>
          </View>

          <View
            style={
              styles.adminHint
            }
          >
            <Ionicons
              name="shield-checkmark-outline"
              size={17}
              color="#7C3AED"
            />

            <Text
              style={
                styles.adminHintText
              }
            >
              Administrators use
              the same secure
              sign-in screen.
            </Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles =
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor:
        "#F8F5FF",
    },

    content: {
      flexGrow: 1,
    },

    hero: {
      minHeight: 330,
      paddingHorizontal: 26,
      paddingTop: 64,
      paddingBottom: 80,

      borderBottomLeftRadius:
        42,

      borderBottomRightRadius:
        42,
    },

    logoBox: {
      width: 58,
      height: 58,
      borderRadius: 19,

      backgroundColor:
        "rgba(255,255,255,0.18)",

      justifyContent:
        "center",

      alignItems: "center",
    },

    brand: {
      color: "#FFFFFF",
      fontSize: 19,
      fontWeight: "900",
      marginTop: 15,
      letterSpacing: 0.5,
    },

    heroTitle: {
      color: "#FFFFFF",
      fontSize: 31,
      lineHeight: 38,
      fontWeight: "900",
      marginTop: 22,
      maxWidth: 330,
    },

    heroSubtitle: {
      color: "#FCE7F3",
      lineHeight: 22,
      marginTop: 12,
      maxWidth: 300,
    },

    formCard: {
      marginHorizontal: 20,
      marginTop: -42,

      backgroundColor:
        "#FFFFFF",

      borderRadius: 28,
      padding: 23,

      shadowColor:
        "#4C1D95",

      shadowOpacity: 0.1,
      shadowRadius: 20,

      shadowOffset: {
        width: 0,
        height: 8,
      },

      elevation: 5,

      marginBottom: 30,
    },

    title: {
      color: "#111827",
      fontSize: 25,
      fontWeight: "900",
    },

    subtitle: {
      color: "#6B7280",
      marginTop: 5,
      marginBottom: 22,
    },

    inputBox: {
      minHeight: 56,

      borderWidth: 1,
      borderColor:
        "#E9D5FF",

      backgroundColor:
        "#FCFAFF",

      borderRadius: 17,

      flexDirection:
        "row",

      alignItems: "center",

      paddingHorizontal:
        15,

      marginBottom: 13,

      gap: 10,
    },

    input: {
      flex: 1,
      color: "#111827",
      fontSize: 15,
    },

    errorBox: {
      flexDirection:
        "row",

      gap: 7,

      backgroundColor:
        "#FEF2F2",

      padding: 12,

      borderRadius: 13,
      marginBottom: 14,

      alignItems:
        "center",
    },

    errorText: {
      color: "#B91C1C",
      flex: 1,
      lineHeight: 18,
    },

    loginButton: {
      minHeight: 57,

      borderRadius: 18,

      flexDirection:
        "row",

      justifyContent:
        "center",

      alignItems:
        "center",

      gap: 8,

      marginTop: 3,
    },

    loginText: {
      color: "#FFFFFF",
      fontWeight: "900",
      fontSize: 16,
    },

    registerRow: {
      marginTop: 22,

      flexDirection:
        "row",

      justifyContent:
        "center",

      gap: 5,
    },

    registerLabel: {
      color: "#6B7280",
    },

    registerLink: {
      color: "#A855F7",
      fontWeight: "900",
    },

    adminHint: {
      marginTop: 22,

      borderTopWidth: 1,
      borderTopColor:
        "#F3E8FF",

      paddingTop: 17,

      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "center",

      gap: 7,
    },

    adminHintText: {
      color: "#7C3AED",
      fontSize: 12,
      fontWeight: "600",
    },
  });