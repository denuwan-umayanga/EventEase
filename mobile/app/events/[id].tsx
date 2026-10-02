import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import {
  router,
  useLocalSearchParams,
} from "expo-router";
import React, {
  useCallback,
  useState,
} from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";

import { API_URL } from "../../src/config/api";
import { useAuth } from "../../src/context/AuthContext";
import { EventItem } from "../../src/types/Event";

export default function EventDetailsScreen() {
  const { id } = useLocalSearchParams<{
    id: string;
  }>();

  const { token, user } = useAuth();

  const [event, setEvent] =
    useState<EventItem | null>(null);

  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] =
    useState(false);

  const [error, setError] = useState("");

  const loadEvent = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `${API_URL}/api/events/${id}`
      );

      const data = await response.json();

      if (!response.ok) {
        setError(
          data.message || "Unable to load event."
        );
        return;
      }

      setEvent(data.event);
    } catch (err) {
      setError(
        "Unable to connect to the EventEase server."
      );
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadEvent();
    }, [id])
  );

  const handleDelete = () => {
    Alert.alert(
      "Delete Event?",
      "This action cannot be undone.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: deleteEvent,
        },
      ]
    );
  };

  const deleteEvent = async () => {
    try {
      setDeleting(true);

      const response = await fetch(
        `${API_URL}/api/events/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        Alert.alert(
          "Delete Failed",
          data.message ||
            "Unable to delete event."
        );
        return;
      }

      Alert.alert(
        "Event Deleted",
        "The event was deleted successfully.",
        [
          {
            text: "OK",
            onPress: () =>
              router.replace("/home"),
          },
        ]
      );
    } catch (err) {
      Alert.alert(
        "Connection Error",
        "Unable to connect to the server."
      );
    } finally {
      setDeleting(false);
    }
  };

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

  if (!event || error) {
    return (
      <View style={styles.center}>
        <Ionicons
          name="alert-circle-outline"
          size={50}
          color="#DC2626"
        />

        <Text style={styles.errorTitle}>
          Event unavailable
        </Text>

        <Text style={styles.errorText}>
          {error}
        </Text>
      </View>
    );
  }

  const date = new Date(event.eventDate);

  const ownerId =
    typeof event.createdBy === "string"
      ? event.createdBy
      : event.createdBy._id;

  const isOwner = ownerId === user?.id;

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
    >
      <LinearGradient
        colors={["#1D4ED8", "#4F46E5"]}
        style={styles.hero}
      >
        <View style={styles.heroIcon}>
          <Ionicons
            name="calendar"
            size={34}
            color="#FFFFFF"
          />
        </View>

        <Text style={styles.title}>
          {event.title}
        </Text>

        <View style={styles.availabilityBadge}>
          <View
            style={[
              styles.statusDot,
              event.availableSeats > 0
                ? styles.greenDot
                : styles.redDot,
            ]}
          />

          <Text style={styles.availabilityText}>
            {event.availableSeats > 0
              ? `${event.availableSeats} seats available`
              : "Sold out"}
          </Text>
        </View>
      </LinearGradient>

      <View style={styles.content}>
        <View style={styles.infoCard}>
          <InfoRow
            icon="calendar-outline"
            title="Date"
            value={date.toLocaleDateString(
              "en-US",
              {
                weekday: "long",
                month: "long",
                day: "numeric",
                year: "numeric",
              }
            )}
          />

          <InfoRow
            icon="time-outline"
            title="Time"
            value={date.toLocaleTimeString(
              "en-US",
              {
                hour: "2-digit",
                minute: "2-digit",
              }
            )}
          />

          <InfoRow
            icon="location-outline"
            title="Location"
            value={event.location}
          />

          <InfoRow
            icon="people-outline"
            title="Capacity"
            value={`${event.availableSeats} of ${event.capacity} seats available`}
            last
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            About this event
          </Text>

          <Text style={styles.description}>
            {event.description}
          </Text>
        </View>

        {isOwner ? (
          <View style={styles.ownerPanel}>
            <View>
              <Text style={styles.ownerTitle}>
                Event Management
              </Text>

              <Text style={styles.ownerSubtitle}>
                You created this event
              </Text>
            </View>

            <View style={styles.actionRow}>
              <Pressable
                style={styles.editButton}
                onPress={() =>
                  router.push({
                    pathname:
                      "/events/edit/[id]",
                    params: {
                      id: event._id,
                    },
                  })
                }
              >
                <Ionicons
                  name="create-outline"
                  size={19}
                  color="#2563EB"
                />

                <Text style={styles.editText}>
                  Edit
                </Text>
              </Pressable>

              <Pressable
                style={styles.deleteButton}
                disabled={deleting}
                onPress={handleDelete}
              >
                {deleting ? (
                  <ActivityIndicator
                    color="#DC2626"
                  />
                ) : (
                  <>
                    <Ionicons
                      name="trash-outline"
                      size={19}
                      color="#DC2626"
                    />

                    <Text
                      style={styles.deleteText}
                    >
                      Delete
                    </Text>
                  </>
                )}
              </Pressable>
            </View>
          </View>
        ) : null}

        <Pressable
          style={styles.bookingPreview}
          disabled
        >
          <LinearGradient
            colors={
              event.availableSeats > 0
                ? ["#2563EB", "#4F46E5"]
                : ["#94A3B8", "#64748B"]
            }
            style={styles.bookingGradient}
          >
            <Ionicons
              name="ticket-outline"
              size={22}
              color="#FFFFFF"
            />

            <Text style={styles.bookingText}>
              {event.availableSeats > 0
                ? "Book Event — Coming Next"
                : "Event Sold Out"}
            </Text>
          </LinearGradient>
        </Pressable>
      </View>
    </ScrollView>
  );
}

function InfoRow({
  icon,
  title,
  value,
  last = false,
}: {
  icon: any;
  title: string;
  value: string;
  last?: boolean;
}) {
  return (
    <View
      style={[
        styles.infoRow,
        last && styles.lastInfoRow,
      ]}
    >
      <View style={styles.infoIcon}>
        <Ionicons
          name={icon}
          size={21}
          color="#2563EB"
        />
      </View>

      <View style={styles.infoTextContainer}>
        <Text style={styles.infoTitle}>
          {title}
        </Text>

        <Text style={styles.infoValue}>
          {value}
        </Text>
      </View>
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
    padding: 30,
    backgroundColor: "#F8FAFC",
  },

  hero: {
    padding: 24,
    paddingTop: 35,
    paddingBottom: 35,
  },

  heroIcon: {
    width: 60,
    height: 60,
    borderRadius: 19,
    backgroundColor:
      "rgba(255,255,255,0.17)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 22,
  },

  title: {
    color: "#FFFFFF",
    fontSize: 30,
    fontWeight: "900",
    lineHeight: 37,
  },

  availabilityBadge: {
    marginTop: 18,
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    backgroundColor:
      "rgba(255,255,255,0.15)",
    paddingHorizontal: 13,
    paddingVertical: 8,
    borderRadius: 20,
  },

  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 7,
  },

  greenDot: {
    backgroundColor: "#4ADE80",
  },

  redDot: {
    backgroundColor: "#F87171",
  },

  availabilityText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 13,
  },

  content: {
    padding: 18,
    paddingBottom: 40,
  },

  infoCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    paddingHorizontal: 18,
    marginBottom: 20,

    shadowColor: "#0F172A",
    shadowOpacity: 0.05,
    shadowRadius: 15,

    elevation: 2,
  },

  infoRow: {
    flexDirection: "row",
    paddingVertical: 17,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },

  lastInfoRow: {
    borderBottomWidth: 0,
  },

  infoIcon: {
    width: 43,
    height: 43,
    borderRadius: 13,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 13,
  },

  infoTextContainer: {
    flex: 1,
    justifyContent: "center",
  },

  infoTitle: {
    color: "#94A3B8",
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
  },

  infoValue: {
    color: "#0F172A",
    fontWeight: "700",
    marginTop: 3,
    lineHeight: 20,
  },

  section: {
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    padding: 20,
    marginBottom: 20,
  },

  sectionTitle: {
    fontSize: 19,
    fontWeight: "800",
    color: "#0F172A",
    marginBottom: 12,
  },

  description: {
    color: "#475569",
    lineHeight: 23,
  },

  ownerPanel: {
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    padding: 20,
    marginBottom: 20,
  },

  ownerTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#0F172A",
  },

  ownerSubtitle: {
    color: "#64748B",
    marginTop: 3,
  },

  actionRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 18,
  },

  editButton: {
    flex: 1,
    height: 48,
    borderRadius: 14,
    backgroundColor: "#EFF6FF",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 7,
  },

  editText: {
    color: "#2563EB",
    fontWeight: "800",
  },

  deleteButton: {
    flex: 1,
    height: 48,
    borderRadius: 14,
    backgroundColor: "#FEF2F2",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 7,
  },

  deleteText: {
    color: "#DC2626",
    fontWeight: "800",
  },

  bookingPreview: {
    overflow: "hidden",
    borderRadius: 16,
  },

  bookingGradient: {
    height: 57,
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
    justifyContent: "center",
  },

  bookingText: {
    color: "#FFFFFF",
    fontWeight: "800",
    fontSize: 16,
  },

  errorTitle: {
    marginTop: 15,
    fontSize: 20,
    fontWeight: "800",
    color: "#0F172A",
  },

  errorText: {
    marginTop: 7,
    color: "#64748B",
    textAlign: "center",
  },
});
