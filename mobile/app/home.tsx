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
          data.message || "Unable to load events."
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
          <View>
            <Text style={styles.greeting}>
              Hello, {user?.name?.split(" ")[0]} 👋
            </Text>

            <Text style={styles.heroSubtitle}>
              Find your next experience
            </Text>
          </View>

          <Pressable
            style={styles.profileButton}
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

          <Ionicons
            name="sparkles"
            size={30}
            color="#FFFFFF"
          />
        </View>
      </LinearGradient>

      <View style={styles.sectionHeader}>
        <View>
          <Text style={styles.sectionTitle}>
            Discover Events
          </Text>

          <Text style={styles.sectionSubtitle}>
            Browse events happening near you
          </Text>
        </View>
      </View>
    </>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.center}>
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
        ListHeaderComponent={renderHeader}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            {error ? (
              <>
                <View style={styles.emptyIcon}>
                  <Ionicons
                    name="cloud-offline-outline"
                    size={38}
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
                  style={styles.retryButton}
                  onPress={() => loadEvents()}
                >
                  <Text
                    style={styles.retryButtonText}
                  >
                    Try Again
                  </Text>
                </Pressable>
              </>
            ) : (
              <>
                <View style={styles.emptyIcon}>
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
                  Create the first event and start
                  bringing people together.
                </Text>
              </>
            )}
          </View>
        }
      />

      <Pressable
        style={styles.fab}
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
  },

  loadingText: {
    marginTop: 14,
    color: "#64748B",
  },

  listContent: {
    paddingBottom: 110,
  },

  hero: {
    paddingHorizontal: 22,
    paddingTop: 22,
    paddingBottom: 28,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },

  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  greeting: {
    color: "#FFFFFF",
    fontSize: 25,
    fontWeight: "800",
  },

  heroSubtitle: {
    color: "#DBEAFE",
    marginTop: 4,
    fontSize: 14,
  },

  profileButton: {
    width: 45,
    height: 45,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.15)",
  },

  heroStat: {
    marginTop: 26,
    backgroundColor: "rgba(255,255,255,0.14)",
    borderRadius: 18,
    padding: 17,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  heroStatNumber: {
    color: "#FFFFFF",
    fontWeight: "900",
    fontSize: 28,
  },

  heroStatLabel: {
    color: "#DBEAFE",
    marginTop: 2,
  },

  sectionHeader: {
    paddingHorizontal: 20,
    paddingTop: 27,
    paddingBottom: 16,
  },

  sectionTitle: {
    fontSize: 23,
    color: "#0F172A",
    fontWeight: "800",
  },

  sectionSubtitle: {
    color: "#64748B",
    marginTop: 3,
  },

  emptyContainer: {
    alignItems: "center",
    paddingHorizontal: 35,
    paddingTop: 60,
  },

  emptyIcon: {
    width: 85,
    height: 85,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#EFF6FF",
    marginBottom: 18,
  },

  emptyTitle: {
    fontSize: 21,
    fontWeight: "800",
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
    paddingHorizontal: 23,
    paddingVertical: 12,
    borderRadius: 13,
  },

  retryButtonText: {
    color: "#FFFFFF",
    fontWeight: "700",
  },

  fab: {
    position: "absolute",
    right: 20,
    bottom: 24,

    shadowColor: "#1D4ED8",
    shadowOpacity: 0.28,
    shadowRadius: 10,
    shadowOffset: {
      width: 0,
      height: 5,
    },

    elevation: 8,
  },

  fabGradient: {
    height: 56,
    paddingHorizontal: 19,
    borderRadius: 18,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  fabText: {
    color: "#FFFFFF",
    fontWeight: "800",
    fontSize: 15,
  },
});
