import { Redirect, router } from "expo-router";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { useAuth } from "../src/context/AuthContext";

export default function HomeScreen() {
  const {
    user,
    loading,
    signOut,
  } = useAuth();

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator
          size="large"
          color="#2563EB"
        />
      </View>
    );
  }

  if (!user) {
    return <Redirect href="/login" />;
  }

  const handleLogout = async () => {
    await signOut();

    router.replace("/login");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.welcome}>
        Welcome, {user.name}
      </Text>

      <Text style={styles.subtitle}>
        Your EventEase account is connected
        successfully.
      </Text>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>
          Authentication Complete
        </Text>

        <Text style={styles.cardText}>
          Email: {user.email}
        </Text>

        <Text style={styles.cardText}>
          JWT authentication is active.
        </Text>
      </View>

      <Pressable
        style={styles.logoutButton}
        onPress={handleLogout}
      >
        <Text style={styles.logoutText}>
          Logout
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
    padding: 24,
    paddingTop: 40,
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  welcome: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#0F172A",
  },

  subtitle: {
    color: "#64748B",
    marginTop: 8,
    marginBottom: 30,
  },

  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
  },

  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
    color: "#2563EB",
  },

  cardText: {
    color: "#475569",
    marginBottom: 8,
  },

  logoutButton: {
    marginTop: 25,
    borderWidth: 1,
    borderColor: "#DC2626",
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
  },

  logoutText: {
    color: "#DC2626",
    fontWeight: "bold",
  },
});
