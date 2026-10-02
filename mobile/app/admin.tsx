import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";

import EventCard from "../src/components/EventCard";
import RoleGuard from "../src/components/RoleGuard";
import { API_URL } from "../src/config/api";
import { useAuth } from "../src/context/AuthContext";
import { EventItem } from "../src/types/Event";

export default function AdminScreen() {
  const { user, signOut } = useAuth();

  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);

  const loadEvents = async () => {
    try {
      setLoading(true);

      const response = await fetch(
        `${API_URL}/api/events`
      );

      const data = await response.json();

      if (response.ok) {
        setEvents(data.events || []);
      }
    } catch (error) {
      console.log(
        "Admin events error:",
        error
      );
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadEvents();
    }, [])
  );

  const logout = async () => {
    await signOut();

    router.replace("/login");
  };

  if (loading) {
    return (
      <RoleGuard allow="admin">
        <View style={styles.center}>
          <ActivityIndicator
            size="large"
            color="#A855F7"
          />
        </View>
      </RoleGuard>
    );
  }

  return (
    <RoleGuard allow="admin">
      <SafeAreaView style={styles.container}>
        <FlatList
          data={events}
          keyExtractor={(item) => item._id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.list}
          ListHeaderComponent={
            <>
              <LinearGradient
                colors={[
                  "#7C3AED",
                  "#A855F7",
                  "#EC4899",
                ]}
                style={styles.hero}
              >
                <View style={styles.topRow}>
                  <View>
                    <Text style={styles.smallLabel}>
                      ADMIN DASHBOARD
                    </Text>

                    <Text style={styles.greeting}>
                      Hello,{" "}
                      {user?.name?.split(" ")[0] ||
                        "Admin"}{" "}
                      👋
                    </Text>

                    <Text style={styles.subtitle}>
                      Manage EventEase events
                    </Text>
                  </View>

                  <Pressable
                    style={styles.logout}
                    onPress={logout}
                  >
                    <Ionicons
                      name="log-out-outline"
                      size={22}
                      color="#FFFFFF"
                    />
                  </Pressable>
                </View>

                <View style={styles.stats}>
                  <View>
                    <Text style={styles.statNumber}>
                      {events.length}
                    </Text>

                    <Text style={styles.statLabel}>
                      Total Events
                    </Text>
                  </View>

                  <Ionicons
                    name="calendar"
                    size={35}
                    color="#FFFFFF"
                  />
                </View>
              </LinearGradient>

              <Pressable
                onPress={() =>
                  router.push("/events/create")
                }
              >
                <LinearGradient
                  colors={[
                    "#7C3AED",
                    "#EC4899",
                  ]}
                  style={styles.createButton}
                >
                  <View style={styles.createIcon}>
                    <Ionicons
                      name="add"
                      size={24}
                      color="#FFFFFF"
                    />
                  </View>

                  <View
                    style={styles.createTextArea}
                  >
                    <Text
                      style={styles.createTitle}
                    >
                      Create New Event
                    </Text>

                    <Text
                      style={
                        styles.createSubtitle
                      }
                    >
                      Publish an event for users
                    </Text>
                  </View>

                  <Ionicons
                    name="arrow-forward"
                    size={21}
                    color="#FFFFFF"
                  />
                </LinearGradient>
              </Pressable>

              <View style={styles.headingRow}>
                <View>
                  <Text style={styles.heading}>
                    Manage Events
                  </Text>

                  <Text
                    style={
                      styles.headingSubtitle
                    }
                  >
                    Open an event to edit or
                    delete it
                  </Text>
                </View>

                <View style={styles.countBadge}>
                  <Text style={styles.countText}>
                    {events.length}
                  </Text>
                </View>
              </View>
            </>
          }
          renderItem={({ item }) => (
            <EventCard
              event={item}
              onPress={() =>
                router.push({
                  pathname: "/events/[id]",
                  params: {
                    id: item._id,
                  },
                })
              }
            />
          )}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons
                name="calendar-outline"
                size={45}
                color="#A855F7"
              />

              <Text style={styles.emptyTitle}>
                No events yet
              </Text>

              <Text style={styles.emptyText}>
                Create the first EventEase
                event.
              </Text>
            </View>
          }
        />
      </SafeAreaView>
    </RoleGuard>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F5FF",
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F8F5FF",
  },

  list: {
    paddingBottom: 40,
  },

  hero: {
    paddingHorizontal: 22,
    paddingTop: 28,
    paddingBottom: 28,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    marginBottom: 18,
  },

  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  smallLabel: {
    color: "#F5D0FE",
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 1.1,
  },

  greeting: {
    color: "#FFFFFF",
    fontSize: 27,
    fontWeight: "900",
    marginTop: 5,
  },

  subtitle: {
    color: "#FCE7F3",
    marginTop: 3,
  },

  logout: {
    width: 46,
    height: 46,
    borderRadius: 15,
    backgroundColor:
      "rgba(255,255,255,0.16)",
    alignItems: "center",
    justifyContent: "center",
  },

  stats: {
    marginTop: 24,
    borderRadius: 20,
    backgroundColor:
      "rgba(255,255,255,0.15)",
    padding: 17,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  statNumber: {
    color: "#FFFFFF",
    fontSize: 30,
    fontWeight: "900",
  },

  statLabel: {
    color: "#FCE7F3",
    marginTop: 2,
  },

  createButton: {
    marginHorizontal: 20,
    borderRadius: 21,
    padding: 17,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 27,
  },

  createIcon: {
    width: 47,
    height: 47,
    borderRadius: 15,
    backgroundColor:
      "rgba(255,255,255,0.16)",
    justifyContent: "center",
    alignItems: "center",
  },

  createTextArea: {
    flex: 1,
    marginLeft: 12,
  },

  createTitle: {
    color: "#FFFFFF",
    fontWeight: "900",
    fontSize: 16,
  },

  createSubtitle: {
    color: "#FCE7F3",
    fontSize: 12,
    marginTop: 2,
  },

  headingRow: {
    paddingHorizontal: 20,
    marginBottom: 15,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  heading: {
    color: "#111827",
    fontSize: 21,
    fontWeight: "900",
  },

  headingSubtitle: {
    color: "#9CA3AF",
    fontSize: 11,
    marginTop: 3,
  },

  countBadge: {
    width: 38,
    height: 38,
    borderRadius: 13,
    backgroundColor: "#F3E8FF",
    alignItems: "center",
    justifyContent: "center",
  },

  countText: {
    color: "#9333EA",
    fontWeight: "900",
  },

  empty: {
    marginHorizontal: 20,
    marginTop: 15,
    paddingVertical: 45,
    borderRadius: 22,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
  },

  emptyTitle: {
    color: "#111827",
    fontSize: 18,
    fontWeight: "900",
    marginTop: 12,
  },

  emptyText: {
    color: "#9CA3AF",
    marginTop: 5,
  },
});