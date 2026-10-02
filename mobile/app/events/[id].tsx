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
  Image,
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
import { getImageUrl } from "../../src/utils/imageUrl";

export default function EventDetailsScreen() {
  const { id } = useLocalSearchParams<{
    id: string;
  }>();

  const { token, user } = useAuth();

  const [event, setEvent] =
    useState<EventItem | null>(null);

  const [loading, setLoading] =
    useState(true);

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
          data.message ||
            "Unable to load event."
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
        "Unable to connect to the EventEase server."
      );
    } finally {
      setDeleting(false);
    }
  };

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

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator
          size="large"
          color="#2563EB"
        />

        <Text style={styles.loadingText}>
          Loading event...
        </Text>
      </View>
    );
  }

  if (!event || error) {
    return (
      <View style={styles.center}>
        <View style={styles.errorIcon}>
          <Ionicons
            name="alert-circle-outline"
            size={43}
            color="#DC2626"
          />
        </View>

        <Text style={styles.errorTitle}>
          Event unavailable
        </Text>

        <Text style={styles.errorText}>
          {error ||
            "Event could not be found."}
        </Text>

        <Pressable
          style={styles.retryButton}
          onPress={loadEvent}
        >
          <Ionicons
            name="refresh"
            size={18}
            color="#FFFFFF"
          />

          <Text style={styles.retryText}>
            Try Again
          </Text>
        </Pressable>
      </View>
    );
  }

  const date = new Date(event.eventDate);

  const ownerId =
    typeof event.createdBy === "string"
      ? event.createdBy
      : event.createdBy._id;

  const isOwner = ownerId === user?.id;

  const soldOut =
    event.availableSeats <= 0;

  const imageUrl =
    getImageUrl(event.image);

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={
        styles.scrollContent
      }
    >
      {/* IMAGE HERO */}
      <View style={styles.hero}>
        {imageUrl ? (
          <Image
            source={{
              uri: imageUrl,
            }}
            style={styles.heroImage}
            resizeMode="cover"
          />
        ) : (
          <LinearGradient
            colors={[
              "#1D4ED8",
              "#4F46E5",
            ]}
            style={styles.heroPlaceholder}
          >
            <Ionicons
              name="calendar"
              size={80}
              color="rgba(255,255,255,0.20)"
            />
          </LinearGradient>
        )}

        <LinearGradient
          colors={[
            "rgba(15,23,42,0.05)",
            "rgba(15,23,42,0.88)",
          ]}
          style={styles.heroOverlay}
        />

        <View style={styles.heroContent}>
          <View style={styles.heroTopRow}>
            <View style={styles.heroIcon}>
              <Ionicons
                name="calendar"
                size={30}
                color="#FFFFFF"
              />
            </View>

            <View
              style={[
                styles.heroStatus,
                soldOut
                  ? styles.soldOutStatus
                  : styles.availableStatus,
              ]}
            >
              <Text
                style={
                  styles.heroStatusText
                }
              >
                {soldOut
                  ? "SOLD OUT"
                  : "AVAILABLE"}
              </Text>
            </View>
          </View>

          <View>
            <Text
              style={styles.title}
              numberOfLines={3}
            >
              {event.title}
            </Text>

            <View
              style={
                styles.availabilityBadge
              }
            >
              <View
                style={[
                  styles.statusDot,
                  soldOut
                    ? styles.redDot
                    : styles.greenDot,
                ]}
              />

              <Text
                style={
                  styles.availabilityText
                }
              >
                {soldOut
                  ? "No seats remaining"
                  : `${event.availableSeats} seats available`}
              </Text>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.content}>
        {/* EVENT INFORMATION */}
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

        {/* DESCRIPTION */}
        <View style={styles.section}>
          <View
            style={styles.sectionHeadingRow}
          >
            <View
              style={styles.sectionIcon}
            >
              <Ionicons
                name="information-circle-outline"
                size={21}
                color="#2563EB"
              />
            </View>

            <Text
              style={styles.sectionTitle}
            >
              About this event
            </Text>
          </View>

          <Text style={styles.description}>
            {event.description}
          </Text>
        </View>

        {/* OWNER MANAGEMENT */}
        {isOwner ? (
          <View style={styles.ownerPanel}>
            <View style={styles.ownerHeader}>
              <View
                style={styles.ownerIcon}
              >
                <Ionicons
                  name="settings-outline"
                  size={21}
                  color="#4F46E5"
                />
              </View>

              <View style={styles.ownerText}>
                <Text
                  style={styles.ownerTitle}
                >
                  Event Management
                </Text>

                <Text
                  style={
                    styles.ownerSubtitle
                  }
                >
                  You created this event
                </Text>
              </View>
            </View>

            <View style={styles.actionRow}>
              <Pressable
                style={({ pressed }) => [
                  styles.editButton,
                  pressed &&
                    styles.buttonPressed,
                ]}
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

                <Text
                  style={styles.editText}
                >
                  Edit
                </Text>
              </Pressable>

              <Pressable
                style={({ pressed }) => [
                  styles.deleteButton,
                  pressed &&
                    styles.buttonPressed,
                ]}
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
                      style={
                        styles.deleteText
                      }
                    >
                      Delete
                    </Text>
                  </>
                )}
              </Pressable>
            </View>
          </View>
        ) : null}

        {/* BOOKING BUTTON */}
        <Pressable
          style={({ pressed }) => [
            styles.bookingButtonWrapper,
            pressed &&
              !soldOut &&
              styles.bookingPressed,
          ]}
          disabled={soldOut}
          onPress={() =>
            router.push({
              pathname:
                "/bookings/create",
              params: {
                eventId: event._id,
              },
            } as any)
          }
        >
          <LinearGradient
            colors={
              !soldOut
                ? [
                    "#2563EB",
                    "#4F46E5",
                  ]
                : [
                    "#94A3B8",
                    "#64748B",
                  ]
            }
            style={styles.bookingGradient}
          >
            <View
              style={styles.bookingIcon}
            >
              <Ionicons
                name={
                  !soldOut
                    ? "ticket-outline"
                    : "close-circle-outline"
                }
                size={24}
                color="#FFFFFF"
              />
            </View>

            <View
              style={
                styles.bookingTextArea
              }
            >
              <Text
                style={styles.bookingText}
              >
                {!soldOut
                  ? "Book This Event"
                  : "Event Sold Out"}
              </Text>

              {!soldOut && (
                <Text
                  style={
                    styles.bookingSubtext
                  }
                >
                  Reserve your seats now
                </Text>
              )}
            </View>

            {!soldOut && (
              <Ionicons
                name="arrow-forward"
                size={22}
                color="#FFFFFF"
              />
            )}
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

      <View
        style={styles.infoTextContainer}
      >
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

  scrollContent: {
    paddingBottom: 40,
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 30,
    backgroundColor: "#F8FAFC",
  },

  loadingText: {
    marginTop: 13,
    color: "#64748B",
    fontWeight: "600",
  },

  errorIcon: {
    width: 82,
    height: 82,
    borderRadius: 27,
    backgroundColor: "#FEF2F2",
    justifyContent: "center",
    alignItems: "center",
  },

  /*
   * HERO
   */
  hero: {
    height: 320,
    position: "relative",
    overflow: "hidden",
    backgroundColor: "#1D4ED8",
  },

  heroImage: {
    width: "100%",
    height: "100%",
  },

  heroPlaceholder: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },

  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
  },

  heroContent: {
    ...StyleSheet.absoluteFillObject,
    paddingHorizontal: 23,
    paddingTop: 28,
    paddingBottom: 26,
    justifyContent: "space-between",
  },

  heroTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },

  heroIcon: {
    width: 53,
    height: 53,
    borderRadius: 17,
    backgroundColor:
      "rgba(15,23,42,0.35)",
    borderWidth: 1,
    borderColor:
      "rgba(255,255,255,0.22)",
    alignItems: "center",
    justifyContent: "center",
  },

  heroStatus: {
    paddingHorizontal: 13,
    paddingVertical: 8,
    borderRadius: 20,
  },

  availableStatus: {
    backgroundColor:
      "rgba(22,163,74,0.94)",
  },

  soldOutStatus: {
    backgroundColor:
      "rgba(220,38,38,0.94)",
  },

  heroStatusText: {
    color: "#FFFFFF",
    fontWeight: "900",
    fontSize: 11,
    letterSpacing: 0.7,
  },

  title: {
    color: "#FFFFFF",
    fontSize: 30,
    fontWeight: "900",
    lineHeight: 36,
    textShadowColor:
      "rgba(0,0,0,0.30)",
    textShadowOffset: {
      width: 0,
      height: 1,
    },
    textShadowRadius: 3,
  },

  availabilityBadge: {
    marginTop: 14,
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    backgroundColor:
      "rgba(15,23,42,0.46)",
    paddingHorizontal: 13,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor:
      "rgba(255,255,255,0.15)",
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
    fontWeight: "800",
    fontSize: 13,
  },

  /*
   * CONTENT
   */
  content: {
    padding: 18,
  },

  infoCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    paddingHorizontal: 18,
    marginBottom: 20,

    shadowColor: "#0F172A",
    shadowOpacity: 0.06,
    shadowRadius: 15,
    shadowOffset: {
      width: 0,
      height: 5,
    },

    elevation: 3,
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
    fontSize: 11,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },

  infoValue: {
    color: "#0F172A",
    fontWeight: "700",
    marginTop: 4,
    lineHeight: 20,
  },

  /*
   * ABOUT
   */
  section: {
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    padding: 20,
    marginBottom: 20,

    shadowColor: "#0F172A",
    shadowOpacity: 0.04,
    shadowRadius: 10,

    elevation: 2,
  },

  sectionHeadingRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 13,
  },

  sectionIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },

  sectionTitle: {
    fontSize: 19,
    fontWeight: "900",
    color: "#0F172A",
  },

  description: {
    color: "#475569",
    lineHeight: 23,
    fontSize: 14,
  },

  /*
   * OWNER PANEL
   */
  ownerPanel: {
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    padding: 20,
    marginBottom: 20,

    shadowColor: "#0F172A",
    shadowOpacity: 0.04,
    shadowRadius: 10,

    elevation: 2,
  },

  ownerHeader: {
    flexDirection: "row",
    alignItems: "center",
  },

  ownerIcon: {
    width: 43,
    height: 43,
    borderRadius: 13,
    backgroundColor: "#EEF2FF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 11,
  },

  ownerText: {
    flex: 1,
  },

  ownerTitle: {
    fontSize: 18,
    fontWeight: "900",
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
    height: 49,
    borderRadius: 14,
    backgroundColor: "#EFF6FF",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 7,
  },

  editText: {
    color: "#2563EB",
    fontWeight: "900",
  },

  deleteButton: {
    flex: 1,
    height: 49,
    borderRadius: 14,
    backgroundColor: "#FEF2F2",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 7,
  },

  deleteText: {
    color: "#DC2626",
    fontWeight: "900",
  },

  buttonPressed: {
    opacity: 0.72,
  },

  /*
   * BOOKING
   */
  bookingButtonWrapper: {
    overflow: "hidden",
    borderRadius: 18,

    shadowColor: "#1D4ED8",
    shadowOpacity: 0.22,
    shadowRadius: 12,
    shadowOffset: {
      width: 0,
      height: 6,
    },

    elevation: 6,
  },

  bookingPressed: {
    transform: [
      {
        scale: 0.98,
      },
    ],
    opacity: 0.92,
  },

  bookingGradient: {
    minHeight: 70,
    flexDirection: "row",
    gap: 11,
    alignItems: "center",
    paddingHorizontal: 17,
  },

  bookingIcon: {
    width: 43,
    height: 43,
    borderRadius: 13,
    backgroundColor:
      "rgba(255,255,255,0.16)",
    justifyContent: "center",
    alignItems: "center",
  },

  bookingTextArea: {
    flex: 1,
  },

  bookingText: {
    color: "#FFFFFF",
    fontWeight: "900",
    fontSize: 16,
  },

  bookingSubtext: {
    color: "#DBEAFE",
    marginTop: 2,
    fontSize: 12,
  },

  /*
   * ERROR
   */
  errorTitle: {
    marginTop: 16,
    fontSize: 20,
    fontWeight: "900",
    color: "#0F172A",
  },

  errorText: {
    marginTop: 7,
    color: "#64748B",
    textAlign: "center",
    lineHeight: 20,
  },

  retryButton: {
    marginTop: 20,
    backgroundColor: "#2563EB",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 13,
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
  },

  retryText: {
    color: "#FFFFFF",
    fontWeight: "800",
  },
});