import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, {
  useCallback,
  useState,
} from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";

import EventCard from "../src/components/EventCard";
import { API_URL } from "../src/config/api";
import { useAuth } from "../src/context/AuthContext";
import { EventItem } from "../src/types/Event";

export default function HomeScreen() {
  const { user, signOut } = useAuth();

  const [events, setEvents] = useState<EventItem[]>(
    []
  );

  const [loading, setLoading] = useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [error, setError] = useState("");

  const loadEvents = async (
    showLoader = true
  ) => {
    try {
      if (showLoader) {
        setLoading(true);
      }

      setError("");

      const response = await fetch(
        `${API_URL}/api/events`
      );

      const data = await response.json();

      if (!response.ok) {
        setError(
          data.message ||
            "Unable to load events."
        );

        return;
      }

      setEvents(data.events || []);
    } catch (err) {
      setError(
        "Unable to connect to the EventEase server."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadEvents();
    }, [])
  );

  const handleRefresh = () => {
    setRefreshing(true);
    loadEvents(false);
  };

  const handleLogout = async () => {
    await signOut();
    router.replace("/login");
  };

  const renderHeader = () => (
    <>
      <LinearGradient
        colors={["#1D4ED8", "#4F46E5"]}
        style={styles.hero}
      >
        <View style={styles.topRow}>
          <View style={styles.greetingContainer}>
            <Text style={styles.greeting}>
              Hello,{" "}
              {user?.name?.split(" ")[0]} 👋
            </Text>

            <Text style={styles.heroSubtitle}>
              Find your next experience
            </Text>
          </View>

          <Pressable
            style={({ pressed }) => [
              styles.profileButton,
              pressed && styles.buttonPressed,
            ]}
            onPress={handleLogout}
          >
            <Ionicons
              name="log-out-outline"
              size={22}
              color="#FFFFFF"
            />
          </Pressable>
        </View>

        <View style={styles.heroStat}>
          <View>
            <Text style={styles.heroStatNumber}>
              {events.length}
            </Text>

            <Text style={styles.heroStatLabel}>
              Upcoming events
            </Text>
          </View>

          <View style={styles.sparkleContainer}>
            <Ionicons
              name="sparkles"
              size={30}
              color="#FFFFFF"
            />
          </View>
        </View>
      </LinearGradient>

      {/* Quick Action */}
      <View style={styles.quickActions}>
        <Pressable
          style={({ pressed }) => [
            styles.quickActionCard,
            pressed && styles.quickActionPressed,
          ]}
          onPress={() =>
            router.push("/bookings" as any)
          }
        >
          <View style={styles.quickIcon}>
            <Ionicons
              name="ticket-outline"
              size={23}
              color="#4F46E5"
            />
          </View>

          <View style={styles.quickText}>
            <Text style={styles.quickTitle}>
              My Bookings
            </Text>

            <Text style={styles.quickSubtitle}>
              View and manage your reservations
            </Text>
          </View>

          <View style={styles.arrowContainer}>
            <Ionicons
              name="chevron-forward"
              size={20}
              color="#64748B"
            />
          </View>
        </Pressable>
      </View>

      {/* Events Heading */}
      <View style={styles.sectionHeader}>
        <View>
          <Text style={styles.sectionTitle}>
            Discover Events
          </Text>

          <Text style={styles.sectionSubtitle}>
            Browse events happening near you
          </Text>
        </View>

        <View style={styles.eventCountBadge}>
          <Text style={styles.eventCountText}>
            {events.length}
          </Text>
        </View>
      </View>
    </>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.center}>
        <View style={styles.loadingIcon}>
          <Ionicons
            name="calendar-outline"
            size={28}
            color="#2563EB"
          />
        </View>

        <ActivityIndicator
          size="large"
          color="#2563EB"
        />

        <Text style={styles.loadingText}>
          Loading events...
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={events}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <View style={styles.eventCardWrapper}>
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
          </View>
        )}
        ListHeaderComponent={renderHeader}
        contentContainerStyle={
          styles.listContent
        }
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="#2563EB"
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            {error ? (
              <>
                <View
                  style={[
                    styles.emptyIcon,
                    styles.errorIconBackground,
                  ]}
                >
                  <Ionicons
                    name="cloud-offline-outline"
                    size={40}
                    color="#DC2626"
                  />
                </View>

                <Text style={styles.emptyTitle}>
                  Something went wrong
                </Text>

                <Text style={styles.emptyText}>
                  {error}
                </Text>

                <Pressable
                  style={({ pressed }) => [
                    styles.retryButton,
                    pressed &&
                      styles.buttonPressed,
                  ]}
                  onPress={() =>
                    loadEvents()
                  }
                >
                  <Ionicons
                    name="refresh"
                    size={18}
                    color="#FFFFFF"
                  />

                  <Text
                    style={
                      styles.retryButtonText
                    }
                  >
                    Try Again
                  </Text>
                </Pressable>
              </>
            ) : (
              <>
                <View
                  style={styles.emptyIcon}
                >
                  <Ionicons
                    name="calendar-outline"
                    size={42}
                    color="#2563EB"
                  />
                </View>

                <Text style={styles.emptyTitle}>
                  No events yet
                </Text>

                <Text style={styles.emptyText}>
                  Create the first event and
                  start bringing people
                  together.
                </Text>

                <Pressable
                  style={
                    styles.emptyCreateButton
                  }
                  onPress={() =>
                    router.push(
                      "/events/create"
                    )
                  }
                >
                  <Ionicons
                    name="add-circle-outline"
                    size={19}
                    color="#2563EB"
                  />

                  <Text
                    style={
                      styles.emptyCreateText
                    }
                  >
                    Create Event
                  </Text>
                </Pressable>
              </>
            )}
          </View>
        }
      />

      {/* Floating Create Button */}
      <Pressable
        style={({ pressed }) => [
          styles.fab,
          pressed && styles.fabPressed,
        ]}
        onPress={() =>
          router.push("/events/create")
        }
      >
        <LinearGradient
          colors={["#2563EB", "#4F46E5"]}
          style={styles.fabGradient}
        >
          <Ionicons
            name="add"
            size={27}
            color="#FFFFFF"
          />

          <Text style={styles.fabText}>
            Create Event
          </Text>
        </LinearGradient>
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    paddingHorizontal: 30,
  },

  loadingIcon: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: "#EFF6FF",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 18,
  },

  loadingText: {
    marginTop: 14,
    color: "#64748B",
    fontSize: 14,
    fontWeight: "600",
  },

  listContent: {
    paddingBottom: 110,
  },

  hero: {
    paddingHorizontal: 22,
    paddingTop: 24,
    paddingBottom: 29,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },

  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  greetingContainer: {
    flex: 1,
    paddingRight: 15,
  },

  greeting: {
    color: "#FFFFFF",
    fontSize: 25,
    fontWeight: "900",
  },

  heroSubtitle: {
    color: "#DBEAFE",
    marginTop: 5,
    fontSize: 14,
    fontWeight: "500",
  },

  profileButton: {
    width: 46,
    height: 46,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor:
      "rgba(255,255,255,0.16)",
  },

  buttonPressed: {
    opacity: 0.75,
  },

  heroStat: {
    marginTop: 26,
    backgroundColor:
      "rgba(255,255,255,0.14)",
    borderRadius: 19,
    padding: 17,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  heroStatNumber: {
    color: "#FFFFFF",
    fontWeight: "900",
    fontSize: 30,
  },

  heroStatLabel: {
    color: "#DBEAFE",
    marginTop: 2,
    fontWeight: "600",
  },

  sparkleContainer: {
    width: 48,
    height: 48,
    borderRadius: 15,
    backgroundColor:
      "rgba(255,255,255,0.12)",
    alignItems: "center",
    justifyContent: "center",
  },

  quickActions: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },

  quickActionCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 15,
    flexDirection: "row",
    alignItems: "center",

    shadowColor: "#0F172A",
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: {
      width: 0,
      height: 5,
    },

    elevation: 3,
  },

  quickActionPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.99 }],
  },

  quickIcon: {
    width: 48,
    height: 48,
    borderRadius: 15,
    backgroundColor: "#EEF2FF",
    justifyContent: "center",
    alignItems: "center",
  },

  quickText: {
    flex: 1,
    marginLeft: 13,
  },

  quickTitle: {
    fontWeight: "900",
    color: "#0F172A",
    fontSize: 16,
  },

  quickSubtitle: {
    color: "#64748B",
    marginTop: 3,
    fontSize: 12,
    lineHeight: 17,
  },

  arrowContainer: {
    width: 34,
    height: 34,
    borderRadius: 11,
    backgroundColor: "#F8FAFC",
    justifyContent: "center",
    alignItems: "center",
  },

  sectionHeader: {
    paddingHorizontal: 20,
    paddingTop: 28,
    paddingBottom: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  sectionTitle: {
    fontSize: 23,
    color: "#0F172A",
    fontWeight: "900",
  },

  sectionSubtitle: {
    color: "#64748B",
    marginTop: 4,
    fontSize: 13,
  },

  eventCountBadge: {
    minWidth: 36,
    height: 36,
    paddingHorizontal: 10,
    borderRadius: 12,
    backgroundColor: "#EFF6FF",
    justifyContent: "center",
    alignItems: "center",
  },

  eventCountText: {
    color: "#2563EB",
    fontWeight: "900",
  },

  eventCardWrapper: {
    paddingHorizontal: 20,
  },

  emptyContainer: {
    alignItems: "center",
    paddingHorizontal: 35,
    paddingTop: 55,
  },

  emptyIcon: {
    width: 86,
    height: 86,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#EFF6FF",
    marginBottom: 18,
  },

  errorIconBackground: {
    backgroundColor: "#FEF2F2",
  },

  emptyTitle: {
    fontSize: 21,
    fontWeight: "900",
    color: "#0F172A",
  },

  emptyText: {
    color: "#64748B",
    textAlign: "center",
    lineHeight: 21,
    marginTop: 8,
  },

  retryButton: {
    marginTop: 20,
    backgroundColor: "#2563EB",
    paddingHorizontal: 22,
    paddingVertical: 12,
    borderRadius: 13,
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
  },

  retryButtonText: {
    color: "#FFFFFF",
    fontWeight: "800",
  },

  emptyCreateButton: {
    marginTop: 20,
    paddingHorizontal: 19,
    paddingVertical: 11,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: "#BFDBFE",
    backgroundColor: "#EFF6FF",
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
  },

  emptyCreateText: {
    color: "#2563EB",
    fontWeight: "800",
  },

  fab: {
    position: "absolute",
    right: 20,
    bottom: 24,

    shadowColor: "#1D4ED8",
    shadowOpacity: 0.3,
    shadowRadius: 12,
    shadowOffset: {
      width: 0,
      height: 6,
    },

    elevation: 9,
  },

  fabPressed: {
    transform: [{ scale: 0.96 }],
    opacity: 0.92,
  },

  fabGradient: {
    height: 57,
    paddingHorizontal: 19,
    borderRadius: 18,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  fabText: {
    color: "#FFFFFF",
    fontWeight: "900",
    fontSize: 15,
  },
});