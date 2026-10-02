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
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";

import { API_URL } from "../../src/config/api";
import { useAuth } from "../../src/context/AuthContext";
import { BookingItem } from "../../src/types/Booking";

export default function MyBookingsScreen() {
  const { token } = useAuth();

  const [bookings, setBookings] = useState<
    BookingItem[]
  >([]);

  const [loading, setLoading] = useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [error, setError] = useState("");

  const loadBookings = async (
    showLoader = true
  ) => {
    try {
      if (showLoader) setLoading(true);

      setError("");

      const response = await fetch(
        `${API_URL}/api/bookings/my`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(
          data.message ||
            "Unable to load bookings."
        );
        return;
      }

      setBookings(data.bookings || []);
    } catch (error) {
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
      loadBookings();
    }, [])
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator
          size="large"
          color="#2563EB"
        />

        <Text style={styles.loadingText}>
          Loading bookings...
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={bookings}
        keyExtractor={(item) => item._id}
        contentContainerStyle={
          styles.listContent
        }
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              loadBookings(false);
            }}
          />
        }
        ListHeaderComponent={
          <LinearGradient
            colors={["#1D4ED8", "#4F46E5"]}
            style={styles.header}
          >
            <View style={styles.headerIcon}>
              <Ionicons
                name="ticket"
                size={28}
                color="#FFFFFF"
              />
            </View>

            <Text style={styles.headerTitle}>
              My Bookings
            </Text>

            <Text style={styles.headerSubtitle}>
              Manage your upcoming event
              reservations.
            </Text>
          </LinearGradient>
        }
        renderItem={({ item }) => {
          const event = item.eventId;

          if (!event) return null;

          const date = new Date(
            event.eventDate
          );

          const cancelled =
            item.status === "Cancelled";

          return (
            <Pressable
              style={styles.bookingCard}
              onPress={() =>
                router.push({
                  pathname: "/bookings/[id]",
                  params: {
                    id: item._id,
                  },
                })
              }
            >
              <View style={styles.cardTop}>
                <View
                  style={[
                    styles.statusBadge,
                    cancelled
                      ? styles.cancelledBadge
                      : styles.confirmedBadge,
                  ]}
                >
                  <Text
                    style={[
                      styles.statusText,
                      cancelled
                        ? styles.cancelledText
                        : styles.confirmedText,
                    ]}
                  >
                    {item.status}
                  </Text>
                </View>

                <Ionicons
                  name="chevron-forward"
                  size={20}
                  color="#94A3B8"
                />
              </View>

              <Text style={styles.eventTitle}>
                {event.title}
              </Text>

              <View style={styles.infoRow}>
                <Ionicons
                  name="calendar-outline"
                  size={17}
                  color="#2563EB"
                />

                <Text style={styles.infoText}>
                  {date.toLocaleDateString(
                    "en-US",
                    {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    }
                  )}
                </Text>
              </View>

              <View style={styles.infoRow}>
                <Ionicons
                  name="location-outline"
                  size={17}
                  color="#2563EB"
                />

                <Text
                  style={styles.infoText}
                  numberOfLines={1}
                >
                  {event.location}
                </Text>
              </View>

              <View style={styles.seatFooter}>
                <View style={styles.seatIcon}>
                  <Ionicons
                    name="people-outline"
                    size={18}
                    color="#4F46E5"
                  />
                </View>

                <Text style={styles.seatText}>
                  {item.numberOfSeats}{" "}
                  {item.numberOfSeats === 1
                    ? "seat"
                    : "seats"}
                </Text>
              </View>
            </Pressable>
          );
        }}
        ListEmptyComponent={
          <View style={styles.empty}>
            <View style={styles.emptyIcon}>
              <Ionicons
                name={
                  error
                    ? "cloud-offline-outline"
                    : "ticket-outline"
                }
                size={42}
                color={
                  error
                    ? "#DC2626"
                    : "#2563EB"
                }
              />
            </View>

            <Text style={styles.emptyTitle}>
              {error
                ? "Unable to load bookings"
                : "No bookings yet"}
            </Text>

            <Text style={styles.emptyText}>
              {error ||
                "Explore events and reserve your first seat."}
            </Text>

            {!error && (
              <Pressable
                style={styles.exploreButton}
                onPress={() =>
                  router.replace("/home")
                }
              >
                <Text
                  style={styles.exploreText}
                >
                  Explore Events
                </Text>
              </Pressable>
            )}
          </View>
        }
      />
    </View>
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
    color: "#64748B",
    marginTop: 13,
  },

  listContent: {
    paddingBottom: 35,
  },

  header: {
    padding: 22,
    paddingTop: 30,
    paddingBottom: 30,
    marginBottom: 19,
  },

  headerIcon: {
    width: 53,
    height: 53,
    borderRadius: 17,
    backgroundColor:
      "rgba(255,255,255,0.17)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 17,
  },

  headerTitle: {
    color: "#FFFFFF",
    fontWeight: "900",
    fontSize: 28,
  },

  headerSubtitle: {
    color: "#DBEAFE",
    marginTop: 5,
  },

  bookingCard: {
    marginHorizontal: 18,
    marginBottom: 15,
    backgroundColor: "#FFFFFF",
    borderRadius: 21,
    padding: 19,

    shadowColor: "#0F172A",
    shadowOpacity: 0.05,
    shadowRadius: 13,

    elevation: 2,
  },

  cardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },

  confirmedBadge: {
    backgroundColor: "#DCFCE7",
  },

  cancelledBadge: {
    backgroundColor: "#FEE2E2",
  },

  statusText: {
    fontSize: 11,
    fontWeight: "900",
    textTransform: "uppercase",
  },

  confirmedText: {
    color: "#15803D",
  },

  cancelledText: {
    color: "#B91C1C",
  },

  eventTitle: {
    color: "#0F172A",
    fontSize: 20,
    fontWeight: "900",
    marginTop: 15,
    marginBottom: 13,
  },

  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    marginBottom: 8,
  },

  infoText: {
    color: "#64748B",
    flexShrink: 1,
  },

  seatFooter: {
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
    marginTop: 8,
    paddingTop: 13,
    flexDirection: "row",
    alignItems: "center",
  },

  seatIcon: {
    width: 34,
    height: 34,
    borderRadius: 11,
    backgroundColor: "#EEF2FF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },

  seatText: {
    color: "#4F46E5",
    fontWeight: "800",
  },

  empty: {
    alignItems: "center",
    padding: 40,
  },

  emptyIcon: {
    width: 85,
    height: 85,
    borderRadius: 27,
    backgroundColor: "#EFF6FF",
    justifyContent: "center",
    alignItems: "center",
  },

  emptyTitle: {
    marginTop: 17,
    fontSize: 20,
    fontWeight: "900",
    color: "#0F172A",
  },

  emptyText: {
    marginTop: 7,
    color: "#64748B",
    textAlign: "center",
    lineHeight: 20,
  },

  exploreButton: {
    marginTop: 20,
    backgroundColor: "#2563EB",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 13,
  },

  exploreText: {
    color: "#FFFFFF",
    fontWeight: "800",
  },
});
