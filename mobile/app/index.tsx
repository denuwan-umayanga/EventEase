import {
  Redirect,
} from "expo-router";
import {
  ActivityIndicator,
  StyleSheet,
  View,
} from "react-native";

import { useAuth } from "../src/context/AuthContext";

export default function IndexScreen() {
  const {
    token,
    user,
    loading,
  } = useAuth();

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator
          size="large"
          color="#A855F7"
        />
      </View>
    );
  }

  if (!token || !user) {
    return (
      <Redirect href="/login" />
    );
  }

  if (user.isAdmin) {
    return (
      <Redirect
        href={"/admin" as any}
      />
    );
  }

  return (
    <Redirect href="/home" />
  );
}

const styles =
  StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: "#F8F5FF",
    },
  });