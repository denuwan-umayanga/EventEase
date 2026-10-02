import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import {
  router,
  useLocalSearchParams,
} from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { API_URL } from "../../src/config/api";
import { useAuth } from "../../src/context/AuthContext";
import { BookingItem } from "../../src/types/Booking";

export default function BookingDetailsScreen() {
  const { id } = useLocalSearchParams<{
    id: string;
  }>();

  const { token } = useAuth();

  const [booking, setBooking] =
    useState<BookingItem | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [processing, setProcessing] =
    useState(false);

  const [error, setError] = useState("");

  useEffect(() => {
    loadBooking();
  }, [id]);

  const loadBooking = async () => {
    try {
      setLoading(true);

      const response = await fetch(
        `${API_URL}/api/bookings/${id}`,
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
            "Unable to load booking."
        );
        return;
      }

      setBooking(data.booking);
    } catch (error) {
      setError(
        "Unable to connect to the EventEase server."
      );
    } finally {
      setLoading(false);
    }
  };

  const cancelBooking = async () => {
    try {
      setProcessing(true);

      const response = await fetch(
        `${API_URL}/api/bookings/${id}/cancel`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        Alert.alert(
          "Unable to Cancel",
          data.message
        );
        return;
      }

      await loadBooking();

      Alert.alert(
        "Booking Cancelled",
        "Your seats have been released back to the event."
      );
    } catch (error) {
      Alert.alert(
        "Connection Error",
        "Unable to connect to the server."
      );
    } finally {
      setProcessing(false);
    }
  };

  const confirmCancel = () => {
    Alert.alert(
      "Cancel Booking?",
      "Your reserved seats will become available to other users.",
      [
        {
          text: "Keep Booking",
          style: "cancel",
        },
        {
          text: "Cancel Booking",
          style: "destructive",
          onPress: cancelBooking,
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
      </View>
    );
  }

  if (!booking || error) {
    return (
      <View style={styles.center}>
        <Ionicons
          name="alert-circle-outline"
          size={48}
          color="#DC2626"
        />

        <Text style={styles.errorTitle}>
          Booking unavailable
        </Text>

        <Text style={styles.errorText}>
          {error}
        </Text>
      </View>
    );
  }

  const event = booking.eventId;
  const date = new Date(event.eventDate);

  const cancelled =
    booking.status === "Cancelled";

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
    >
      <LinearGradient
        colors={
          cancelled
            ? ["#64748B", "#475569"]
            : ["#1D4ED8", "#4F46E5"]
        }
        style={styles.hero}
      >
        <View style={styles.ticketIcon}>
          <Ionicons
            name="ticket"
            size={31}
            color="#FFFFFF"
          />
        </View>

        <Text style={styles.heroLabel}>
          BOOKING
        </Text>

        <Text style={styles.title}>
          {event.title}
        </Text>

        <View style={styles.statusBadge}>
          <View
            style={[
              styles.statusDot,
              {
                backgroundColor: cancelled
                  ? "#FCA5A5"
                  : "#4ADE80",
              },
            ]}
          />

          <Text style={styles.statusText}>
            {booking.status}
          </Text>
        </View>
      </LinearGradient>

      <View style={styles.detailsCard}>
        <DetailRow
          icon="calendar-outline"
          label="Date"
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

        <DetailRow
          icon="time-outline"
          label="Time"
          value={date.toLocaleTimeString(
            "en-US",
            {
              hour: "2-digit",
              minute: "2-digit",
            }
          )}
        />

        <DetailRow
          icon="location-outline"
          label="Location"
          value={event.location}
        />

        <DetailRow
          icon="people-outline"
          label="Reserved Seats"
          value={`${booking.numberOfSeats}`}
          last
        />
      </View>

      {!cancelled && (
        <View style={styles.managementCard}>
          <Text style={styles.managementTitle}>
            Manage Booking
          </Text>

          <Text style={styles.managementSubtitle}>
            Change the number of reserved seats
            or cancel this booking.
          </Text>

          <Pressable
            style={styles.editButton}
            onPress={() =>
              router.push({
                pathname:
                  "/bookings/edit/[id]",
                params: {
                  id: booking._id,
                },
              })
            }
          >
            <Ionicons
              name="create-outline"
              size={20}
              color="#2563EB"
            />

            <Text style={styles.editText}>
              Change Seats
            </Text>
          </Pressable>

          <Pressable
            style={styles.cancelButton}
            disabled={processing}
            onPress={confirmCancel}
          >
            {processing ? (
              <ActivityIndicator
                color="#DC2626"
              />
            ) : (
              <>
                <Ionicons
                  name="close-circle-outline"
                  size={20}
                  color="#DC2626"
                />

                <Text style={styles.cancelText}>
                  Cancel Booking
                </Text>
              </>
            )}
          </Pressable>
        </View>
      )}
    </ScrollView>
  );
}

function DetailRow({
  icon,
  label,
  value,
  last = false,
}: {
  icon: any;
  label: string;
  value: string;
  last?: boolean;
}) {
  return (
    <View
      style={[
        styles.detailRow,
        last && styles.lastRow,
      ]}
    >
      <View style={styles.detailIcon}>
        <Ionicons
          name={icon}
          size={21}
          color="#2563EB"
        />
      </View>

      <View style={styles.detailContent}>
        <Text style={styles.detailLabel}>
          {label}
        </Text>

        <Text style={styles.detailValue}>
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

  content: {
    paddingBottom: 40,
  },

  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 30,
    backgroundColor: "#F8FAFC",
  },

  hero: {
    padding: 24,
    paddingTop: 35,
    paddingBottom: 34,
  },

  ticketIcon: {
    width: 55,
    height: 55,
    borderRadius: 17,
    backgroundColor:
      "rgba(255,255,255,0.18)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 17,
  },

  heroLabel: {
    color: "#DBEAFE",
    fontWeight: "900",
    letterSpacing: 1.2,
    fontSize: 11,
  },

  title: {
    color: "#FFFFFF",
    fontSize: 27,
    lineHeight: 33,
    fontWeight: "900",
    marginTop: 7,
  },

  statusBadge: {
    alignSelf: "flex-start",
    marginTop: 17,
    paddingHorizontal: 12,
    paddingVertical: 7,
    backgroundColor:
      "rgba(255,255,255,0.16)",
    borderRadius: 20,
    flexDirection: "row",
    alignItems: "center",
  },

  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 7,
  },

  statusText: {
    color: "#FFFFFF",
    fontWeight: "800",
  },

  detailsCard: {
    backgroundColor: "#FFFFFF",
    margin: 18,
    borderRadius: 22,
    paddingHorizontal: 18,
  },

  detailRow: {
    flexDirection: "row",
    paddingVertical: 17,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },

  lastRow: {
    borderBottomWidth: 0,
  },

  detailIcon: {
    width: 43,
    height: 43,
    borderRadius: 13,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 13,
  },

  detailContent: {
    flex: 1,
    justifyContent: "center",
  },

  detailLabel: {
    color: "#94A3B8",
    fontSize: 11,
    fontWeight: "800",
    textTransform: "uppercase",
  },

  detailValue: {
    color: "#0F172A",
    marginTop: 3,
    fontWeight: "700",
    lineHeight: 20,
  },

  managementCard: {
    marginHorizontal: 18,
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    padding: 20,
  },

  managementTitle: {
    fontSize: 19,
    fontWeight: "900",
    color: "#0F172A",
  },

  managementSubtitle: {
    color: "#64748B",
    marginTop: 5,
    marginBottom: 18,
    lineHeight: 20,
  },

  editButton: {
    height: 50,
    borderRadius: 14,
    backgroundColor: "#EFF6FF",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
  },

  editText: {
    color: "#2563EB",
    fontWeight: "800",
  },

  cancelButton: {
    marginTop: 11,
    height: 50,
    borderRadius: 14,
    backgroundColor: "#FEF2F2",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
  },

  cancelText: {
    color: "#DC2626",
    fontWeight: "800",
  },

  errorTitle: {
    fontSize: 20,
    fontWeight: "900",
    marginTop: 13,
  },

  errorText: {
    marginTop: 7,
    color: "#64748B",
    textAlign: "center",
  },
});
