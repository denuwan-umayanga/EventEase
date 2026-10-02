import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useState } from "react";
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

import { API_URL } from "../src/config/api";
import { useAuth } from "../src/context/AuthContext";

export default function RegisterScreen() {
  const { signIn } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const [password, setPassword] =
    useState("");

  const [
    confirmPassword,
    setConfirmPassword,
  ] = useState("");

  const [
    showPassword,
    setShowPassword,
  ] = useState(false);

  const [
    showConfirmPassword,
    setShowConfirmPassword,
  ] = useState(false);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const handleRegister =
    async () => {
      setError("");

      if (
        !name.trim() ||
        !email.trim() ||
        !password ||
        !confirmPassword
      ) {
        setError(
          "Please complete all fields."
        );

        return;
      }

      if (
        password.length < 6
      ) {
        setError(
          "Password must be at least 6 characters."
        );

        return;
      }

      if (
        password !==
        confirmPassword
      ) {
        setError(
          "Passwords do not match."
        );

        return;
      }

      try {
        setLoading(true);

        const response =
          await fetch(
            `${API_URL}/api/auth/register`,
            {
              method: "POST",

              headers: {
                "Content-Type":
                  "application/json",
              },

              body:
                JSON.stringify({
                  name:
                    name.trim(),

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
              "Unable to create account."
          );

          return;
        }

        await signIn(
          data.token,
          data.user
        );

        router.replace(
          "/home"
        );
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
        {/* HERO */}

        <LinearGradient
          colors={[
            "#6D28D9",
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
          style={styles.hero}
        >
          <View
            style={
              styles.logoBox
            }
          >
            <Ionicons
              name="sparkles"
              size={31}
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
            Your next experience
            starts here.
          </Text>

          <Text
            style={
              styles.heroSubtitle
            }
          >
            Create an account,
            discover events and
            reserve your seats.
          </Text>
        </LinearGradient>

        {/* FORM */}

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
            Create account
          </Text>

          <Text
            style={
              styles.subtitle
            }
          >
            Join EventEase and
            start discovering
            events.
          </Text>

          <FieldLabel
            icon="person-outline"
            text="Full Name"
          />

          <View
            style={
              styles.inputBox
            }
          >
            <Ionicons
              name="person-outline"
              size={20}
              color="#A855F7"
            />

            <TextInput
              style={
                styles.input
              }
              placeholder="Your full name"
              placeholderTextColor="#9CA3AF"
              value={name}
              onChangeText={
                setName
              }
            />
          </View>

          <FieldLabel
            icon="mail-outline"
            text="Email Address"
          />

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
              placeholder="your@email.com"
              placeholderTextColor="#9CA3AF"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={
                setEmail
              }
            />
          </View>

          <FieldLabel
            icon="lock-closed-outline"
            text="Password"
          />

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
              placeholder="Minimum 6 characters"
              placeholderTextColor="#9CA3AF"
              secureTextEntry={
                !showPassword
              }
              value={
                password
              }
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

          <FieldLabel
            icon="shield-checkmark-outline"
            text="Confirm Password"
          />

          <View
            style={
              styles.inputBox
            }
          >
            <Ionicons
              name="shield-checkmark-outline"
              size={20}
              color="#EC4899"
            />

            <TextInput
              style={
                styles.input
              }
              placeholder="Re-enter password"
              placeholderTextColor="#9CA3AF"
              secureTextEntry={
                !showConfirmPassword
              }
              value={
                confirmPassword
              }
              onChangeText={
                setConfirmPassword
              }
            />

            <Pressable
              onPress={() =>
                setShowConfirmPassword(
                  !showConfirmPassword
                )
              }
            >
              <Ionicons
                name={
                  showConfirmPassword
                    ? "eye-off-outline"
                    : "eye-outline"
                }
                size={21}
                color="#9CA3AF"
              />
            </Pressable>
          </View>

          {/* INFO */}

          <View
            style={
              styles.infoBox
            }
          >
            <View
              style={
                styles.infoIcon
              }
            >
              <Ionicons
                name="information-circle-outline"
                size={20}
                color="#7C3AED"
              />
            </View>

            <Text
              style={
                styles.infoText
              }
            >
              New accounts are
              created as normal
              EventEase users.
              Administrator
              accounts are managed
              separately.
            </Text>
          </View>

          {/* ERROR */}

          {error ? (
            <View
              style={
                styles.errorBox
              }
            >
              <Ionicons
                name="alert-circle-outline"
                size={19}
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

          {/* REGISTER */}

          <Pressable
            disabled={
              loading
            }
            onPress={
              handleRegister
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
                styles.registerButton
              }
            >
              {loading ? (
                <ActivityIndicator
                  color="#FFFFFF"
                />
              ) : (
                <>
                  <View
                    style={
                      styles.registerIcon
                    }
                  >
                    <Ionicons
                      name="person-add-outline"
                      size={20}
                      color="#FFFFFF"
                    />
                  </View>

                  <Text
                    style={
                      styles.registerButtonText
                    }
                  >
                    Create Account
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
              styles.loginRow
            }
          >
            <Text
              style={
                styles.loginLabel
              }
            >
              Already have an
              account?
            </Text>

            <Pressable
              onPress={() =>
                router.replace(
                  "/login"
                )
              }
            >
              <Text
                style={
                  styles.loginLink
                }
              >
                Sign In
              </Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function FieldLabel({
  icon,
  text,
}: {
  icon: any;
  text: string;
}) {
  return (
    <View
      style={
        styles.labelRow
      }
    >
      <Ionicons
        name={icon}
        size={15}
        color="#A855F7"
      />

      <Text
        style={
          styles.label
        }
      >
        {text}
      </Text>
    </View>
  );
}

const styles =
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor:
        "#FAF7FF",
    },

    content: {
      flexGrow: 1,
      paddingBottom: 30,
    },

    hero: {
      minHeight: 300,

      paddingHorizontal: 25,
      paddingTop: 55,
      paddingBottom: 72,

      borderBottomLeftRadius:
        40,

      borderBottomRightRadius:
        40,
    },

    logoBox: {
      width: 56,
      height: 56,
      borderRadius: 18,

      backgroundColor:
        "rgba(255,255,255,0.17)",

      justifyContent:
        "center",

      alignItems:
        "center",
    },

    brand: {
      color: "#FFFFFF",
      fontSize: 18,
      fontWeight: "900",
      marginTop: 14,
      letterSpacing: 0.5,
    },

    heroTitle: {
      color: "#FFFFFF",
      fontSize: 29,
      lineHeight: 35,
      fontWeight: "900",
      marginTop: 20,
      maxWidth: 320,
    },

    heroSubtitle: {
      color: "#FCE7F3",
      lineHeight: 21,
      marginTop: 10,
      maxWidth: 300,
    },

    formCard: {
      marginHorizontal: 19,
      marginTop: -38,

      backgroundColor:
        "#FFFFFF",

      borderRadius: 27,
      padding: 22,

      shadowColor:
        "#581C87",

      shadowOpacity: 0.09,
      shadowRadius: 18,

      shadowOffset: {
        width: 0,
        height: 8,
      },

      elevation: 5,
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
      lineHeight: 19,
    },

    labelRow: {
      flexDirection:
        "row",

      alignItems:
        "center",

      gap: 5,

      marginBottom: 7,
    },

    label: {
      color: "#374151",
      fontSize: 12,
      fontWeight: "800",
    },

    inputBox: {
      minHeight: 55,

      borderWidth: 1,
      borderColor:
        "#E9D5FF",

      backgroundColor:
        "#FCFAFF",

      borderRadius: 16,

      flexDirection:
        "row",

      alignItems:
        "center",

      paddingHorizontal: 14,

      gap: 9,

      marginBottom: 17,
    },

    input: {
      flex: 1,
      color: "#111827",
      fontSize: 14,
    },

    infoBox: {
      flexDirection:
        "row",

      alignItems:
        "flex-start",

      gap: 9,

      backgroundColor:
        "#F5F3FF",

      borderRadius: 14,

      padding: 12,

      marginBottom: 15,
    },

    infoIcon: {
      width: 28,
      height: 28,

      borderRadius: 9,

      backgroundColor:
        "#EDE9FE",

      justifyContent:
        "center",

      alignItems:
        "center",
    },

    infoText: {
      flex: 1,
      color: "#6D28D9",
      fontSize: 10,
      lineHeight: 16,
      fontWeight: "600",
    },

    errorBox: {
      flexDirection:
        "row",

      alignItems:
        "center",

      gap: 8,

      backgroundColor:
        "#FEF2F2",

      borderRadius: 14,

      padding: 12,

      marginBottom: 15,
    },

    errorText: {
      color: "#B91C1C",
      flex: 1,
      fontSize: 12,
      lineHeight: 18,
    },

    registerButton: {
      minHeight: 58,

      borderRadius: 18,

      flexDirection:
        "row",

      justifyContent:
        "center",

      alignItems:
        "center",

      gap: 9,
    },

    registerIcon: {
      width: 31,
      height: 31,

      borderRadius: 10,

      backgroundColor:
        "rgba(255,255,255,0.16)",

      justifyContent:
        "center",

      alignItems:
        "center",
    },

    registerButtonText: {
      color: "#FFFFFF",
      fontSize: 16,
      fontWeight: "900",
    },

    loginRow: {
      flexDirection:
        "row",

      justifyContent:
        "center",

      gap: 5,

      marginTop: 21,
    },

    loginLabel: {
      color: "#6B7280",
      fontSize: 13,
    },

    loginLink: {
      color: "#A855F7",
      fontSize: 13,
      fontWeight: "900",
    },
  });