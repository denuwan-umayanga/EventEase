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
import { EventItem } from "../../src/types/Event";

export default function CreateBookingScreen() {
  const { eventId } = useLocalSearchParams<{
    eventId: string;
  }>();

  const { token } = useAuth();

  const [event, setEvent] =
    useState<EventItem | null>(null);

  const [seats, setSeats] = useState(1);

  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    loadEvent();
  }, [eventId]);

  const loadEvent = async () => {
    try {
      setLoading(true);

      const response = await fetch(
        `${API_URL}/api/events/${eventId}`
      );

      const data = await response.json();

      if (!response.ok) {
        setError(
          data.message || "Unable to load event."
        );
        return;
      }

      setEvent(data.event);
    } catch (error) {
      setError(
        "Unable to connect to the EventEase server."
      );
    } finally {
      setLoading(false);
    }
  };

  const increaseSeats = () => {
    if (
      event &&
      seats < event.availableSeats
    ) {
      setSeats(seats + 1);
    }
  };

  const decreaseSeats = () => {
    if (seats > 1) {
      setSeats(seats - 1);
    }
  };

  const confirmBooking = async () => {
    if (!event) return;

    try {
      setBooking(true);
      setError("");

      const response = await fetch(
        `${API_URL}/api/bookings`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },

          body: JSON.stringify({
            eventId: event._id,
            numberOfSeats: seats,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(
          data.message ||
            "Unable to complete booking."
        );
        return;
      }

      Alert.alert(
        "Booking Confirmed 🎉",
        `${seats} seat${
          seats > 1 ? "s" : ""
        } successfully reserved.`,
        [
          {
            text: "View My Bookings",
            onPress: () =>
              router.replace("/bookings"),
          },
        ]
      );
    } catch (error) {
      setError(
        "Unable to connect to the EventEase server."
      );
    } finally {
      setBooking(false);
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

  if (!event) {
    return (
      <View style={styles.center}>
        <Ionicons
          name="alert-circle-outline"
          size={48}
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

  const soldOut =
    event.availableSeats <= 0;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <LinearGradient
        colors={["#1D4ED8", "#4F46E5"]}
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
          BOOK YOUR SEATS
        </Text>

        <Text style={styles.title}>
          {event.title}
        </Text>

        <View style={styles.locationRow}>
          <Ionicons
            name="location-outline"
            size={17}
            color="#DBEAFE"
          />

          <Text style={styles.location}>
            {event.location}
          </Text>
        </View>
      </LinearGradient>

      <View style={styles.availabilityCard}>
        <View>
          <Text style={styles.availabilityLabel}>
            Seats available
          </Text>

          <Text style={styles.availabilityNumber}>
            {event.availableSeats}
          </Text>
        </View>

        <View style={styles.capacityBadge}>
          <Ionicons
            name="people-outline"
            size={18}
            color="#2563EB"
          />

          <Text style={styles.capacityText}>
            Capacity {event.capacity}
          </Text>
        </View>
      </View>

      {!soldOut ? (
        <View style={styles.seatCard}>
          <Text style={styles.sectionTitle}>
            How many seats?
          </Text>

          <Text style={styles.sectionSubtitle}>
            Select the number of seats you want
            to reserve.
          </Text>

          <View style={styles.selector}>
            <Pressable
              style={[
                styles.selectorButton,
                seats === 1 &&
                  styles.disabledSelector,
              ]}
              disabled={seats === 1}
              onPress={decreaseSeats}
            >
              <Ionicons
                name="remove"
                size={26}
                color={
                  seats === 1
                    ? "#94A3B8"
                    : "#2563EB"
                }
              />
            </Pressable>

            <View style={styles.seatCountBox}>
              <Text style={styles.seatCount}>
                {seats}
              </Text>

              <Text style={styles.seatLabel}>
                {seats === 1
                  ? "seat"
                  : "seats"}
              </Text>
            </View>

            <Pressable
              style={[
                styles.selectorButton,
                seats >=
                  event.availableSeats &&
                  styles.disabledSelector,
              ]}
              disabled={
                seats >=
                event.availableSeats
              }
              onPress={increaseSeats}
            >
              <Ionicons
                name="add"
                size={26}
                color={
                  seats >=
                  event.availableSeats
                    ? "#94A3B8"
                    : "#2563EB"
                }
              />
            </Pressable>
          </View>

          <View style={styles.summary}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>
                Event
              </Text>

              <Text
                style={styles.summaryValue}
                numberOfLines={1}
              >
                {event.title}
              </Text>
            </View>

            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>
                Seats
              </Text>

              <Text style={styles.summaryValue}>
                {seats}
              </Text>
            </View>

            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>
                Status
              </Text>

              <View style={styles.statusPill}>
                <View style={styles.greenDot} />

                <Text style={styles.statusText}>
                  Confirmed instantly
                </Text>
              </View>
            </View>
          </View>

          {error ? (
            <View style={styles.errorBox}>
              <Ionicons
                name="alert-circle-outline"
                size={19}
                color="#DC2626"
              />

              <Text style={styles.errorBoxText}>
                {error}
              </Text>
            </View>
          ) : null}

          <Pressable
            onPress={confirmBooking}
            disabled={booking}
          >
            <LinearGradient
              colors={["#2563EB", "#4F46E5"]}
              style={styles.confirmButton}
            >
              {booking ? (
                <ActivityIndicator
                  color="#FFFFFF"
                />
              ) : (
                <>
                  <Ionicons
                    name="ticket-outline"
                    size={22}
                    color="#FFFFFF"
                  />

                  <Text style={styles.confirmText}>
                    Confirm Booking
                  </Text>
                </>
              )}
            </LinearGradient>
          </Pressable>
        </View>
      ) : (
        <View style={styles.soldOutCard}>
          <Ionicons
            name="close-circle-outline"
            size={48}
            color="#DC2626"
          />

          <Text style={styles.soldOutTitle}>
            Event Sold Out
          </Text>

          <Text style={styles.soldOutText}>
            There are currently no seats
            available for this event.
          </Text>
        </View>
      )}
    </ScrollView>
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
    justifyContent: "center",
    alignItems: "center",
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
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 19,
  },

  heroLabel: {
    color: "#BFDBFE",
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 1.2,
  },

  title: {
    color: "#FFFFFF",
    fontSize: 27,
    fontWeight: "900",
    marginTop: 7,
  },

  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginTop: 10,
  },

  location: {
    color: "#DBEAFE",
  },

  availabilityCard: {
    backgroundColor: "#FFFFFF",
    margin: 18,
    borderRadius: 21,
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",

    shadowColor: "#0F172A",
    shadowOpacity: 0.06,
    shadowRadius: 14,
    elevation: 2,
  },

  availabilityLabel: {
    color: "#64748B",
    fontWeight: "600",
  },

  availabilityNumber: {
    fontSize: 32,
    fontWeight: "900",
    color: "#0F172A",
    marginTop: 3,
  },

  capacityBadge: {
    flexDirection: "row",
    gap: 6,
    alignItems: "center",
    padding: 10,
    borderRadius: 13,
    backgroundColor: "#EFF6FF",
  },

  capacityText: {
    color: "#2563EB",
    fontWeight: "700",
  },

  seatCard: {
    marginHorizontal: 18,
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    padding: 21,
  },

  sectionTitle: {
    fontSize: 21,
    fontWeight: "900",
    color: "#0F172A",
  },

  sectionSubtitle: {
    color: "#64748B",
    marginTop: 5,
    lineHeight: 20,
  },

  selector: {
    marginTop: 28,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 25,
  },

  selectorButton: {
    width: 53,
    height: 53,
    borderRadius: 17,
    backgroundColor: "#EFF6FF",
    justifyContent: "center",
    alignItems: "center",
  },

  disabledSelector: {
    backgroundColor: "#F1F5F9",
  },

  seatCountBox: {
    alignItems: "center",
    minWidth: 70,
  },

  seatCount: {
    fontSize: 42,
    fontWeight: "900",
    color: "#0F172A",
  },

  seatLabel: {
    color: "#64748B",
    fontWeight: "600",
  },

  summary: {
    marginTop: 30,
    borderTopWidth: 1,
    borderColor: "#F1F5F9",
    paddingTop: 17,
    marginBottom: 20,
  },

  summaryRow: {
    minHeight: 39,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  summaryLabel: {
    color: "#64748B",
  },

  summaryValue: {
    color: "#0F172A",
    fontWeight: "700",
    maxWidth: "65%",
  },

  statusPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },

  greenDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#22C55E",
  },

  statusText: {
    color: "#16A34A",
    fontWeight: "700",
  },

  errorBox: {
    backgroundColor: "#FEF2F2",
    borderRadius: 12,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 17,
  },

  errorBoxText: {
    color: "#B91C1C",
    flex: 1,
  },

  confirmButton: {
    height: 56,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
  },

  confirmText: {
    color: "#FFFFFF",
    fontWeight: "900",
    fontSize: 16,
  },

  soldOutCard: {
    marginHorizontal: 18,
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    padding: 30,
    alignItems: "center",
  },

  soldOutTitle: {
    fontWeight: "900",
    fontSize: 21,
    color: "#0F172A",
    marginTop: 13,
  },

  soldOutText: {
    color: "#64748B",
    textAlign: "center",
    marginTop: 7,
    lineHeight: 20,
  },

  errorTitle: {
    fontSize: 20,
    fontWeight: "900",
    marginTop: 13,
  },

  errorText: {
    color: "#64748B",
    textAlign: "center",
    marginTop: 7,
  },
});
