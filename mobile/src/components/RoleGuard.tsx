import {
  router,
} from "expo-router";
import React, {
  ReactNode,
  useEffect,
} from "react";
import {
  ActivityIndicator,
  StyleSheet,
  View,
} from "react-native";

import {
  useAuth,
} from "../context/AuthContext";

type Props = {
  children: ReactNode;

  allow:
    | "admin"
    | "user";
};

export default function RoleGuard({
  children,
  allow,
}: Props) {
  const {
    token,
    user,
    loading,
  } = useAuth();

  const allowed =
    allow === "admin"
      ? user?.isAdmin === true
      : user?.isAdmin === false;

  useEffect(() => {
    if (loading) {
      return;
    }

    if (!token || !user) {
      router.replace(
        "/login"
      );

      return;
    }

    if (!allowed) {
      if (
        user.isAdmin
      ) {
        router.replace(
          "/admin" as any
        );
      } else {
        router.replace(
          "/home"
        );
      }
    }
  }, [
    token,
    user,
    loading,
    allowed,
  ]);

  if (
    loading ||
    !token ||
    !user ||
    !allowed
  ) {
    return (
      <View
        style={
          styles.container
        }
      >
        <ActivityIndicator
          size="large"
          color="#A855F7"
        />
      </View>
    );
  }

  return <>{children}</>;
}

const styles =
  StyleSheet.create({
    container: {
      flex: 1,

      alignItems:
        "center",

      justifyContent:
        "center",

      backgroundColor:
        "#FAF7FF",
    },
  });