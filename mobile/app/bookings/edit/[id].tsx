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
  StyleSheet,
  Text,
  View,
} from "react-native";

import { API_URL } from "../../../src/config/api";
import { useAuth } from "../../../src/context/AuthContext";
import { BookingItem } from "../../../src/types/Booking";

export default function EditBookingScreen() {
  const { id } = useLocalSearchParams<{
    id: string;
  }>();

  const { token } = useAuth();

  const [booking, setBooking] =
    useState<BookingItem | null>(null);

  const [seats, setSeats] = useState(1);
  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] = useState("");

  useEffect(() => {
    loadBooking();
  }, [id]);

  const loadBooking = async () => {
    try {
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
        setError(data.message);
        return;
      }

      setBooking(data.booking);
      setSeats(data.booking.numberOfSeats);
    } catch (error) {
      setError(
        "Unable to connect to the EventEase server."
      );
    } finally {
      setLoading(false);
    }
  };

  const saveChanges = async () => {
    try {
      setSaving(true);
      setError("");

      const response = await fetch(
        `${API_URL}/api/bookings/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },

          body: JSON.stringify({
            numberOfSeats: seats,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(data.message);
        return;
      }

      Alert.alert(
        "Booking Updated",
        "Your seat reservation has been updated.",
        [
          {
            text: "OK",
            onPress: () => router.back(),
          },
        ]
      );
    } catch (error) {
      setError(
        "Unable to connect to the EventEase server."
      );
    } finally {
      setSaving(false);
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

  if (!booking) {
    return (
      <View style={styles.center}>
        <Text>{error}</Text>
      </View>
    );
  }

  const event = booking.eventId;

  const maximumSeats =
    seats + event.availableSeats;

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={["#2563EB", "#4F46E5"]}
        style={styles.header}
      >
        <Ionicons
          name="people"
          size={34}
          color="#FFFFFF"
        />

        <Text style={styles.headerTitle}>
          Change Seats
        </Text>

        <Text style={styles.headerSubtitle}>
          {event.title}
        </Text>
      </LinearGradient>

      <View style={styles.card}>
        <Text style={styles.label}>
          Reserved seats
        </Text>

        <View style={styles.selector}>
          <Pressable
            style={styles.selectorButton}
            disabled={seats <= 1}
            onPress={() =>
              setSeats((value) =>
                Math.max(1, value - 1)
              )
            }
          >
            <Ionicons
              name="remove"
              size={27}
              color={
                seats <= 1
                  ? "#94A3B8"
                  : "#2563EB"
              }
            />
          </Pressable>

          <View style={styles.countBox}>
            <Text style={styles.count}>
              {seats}
            </Text>

            <Text style={styles.countLabel}>
              {seats === 1
                ? "seat"
                : "seats"}
            </Text>
          </View>

          <Pressable
            style={styles.selectorButton}
            disabled={
              seats >= maximumSeats
            }
            onPress={() =>
              setSeats((value) =>
                Math.min(
                  maximumSeats,
                  value + 1
                )
              )
            }
          >
            <Ionicons
              name="add"
              size={27}
              color={
                seats >= maximumSeats
                  ? "#94A3B8"
                  : "#2563EB"
              }
            />
          </Pressable>
        </View>

        <Text style={styles.availableText}>
          {event.availableSeats} additional
          seats currently available
        </Text>

        {error ? (
          <View style={styles.errorBox}>
            <Ionicons
              name="alert-circle-outline"
              size={18}
              color="#DC2626"
            />

            <Text style={styles.errorText}>
              {error}
            </Text>
          </View>
        ) : null}

        <Pressable
          disabled={saving}
          onPress={saveChanges}
        >
          <LinearGradient
            colors={["#2563EB", "#4F46E5"]}
            style={styles.saveButton}
          >
            {saving ? (
              <ActivityIndicator
                color="#FFFFFF"
              />
            ) : (
              <>
                <Ionicons
                  name="checkmark-circle-outline"
                  size={21}
                  color="#FFFFFF"
                />

                <Text style={styles.saveText}>
                  Save Changes
                </Text>
              </>
            )}
          </LinearGradient>
        </Pressable>
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
  },

  header: {
    padding: 25,
    paddingTop: 35,
    paddingBottom: 30,
  },

  headerTitle: {
    marginTop: 15,
    color: "#FFFFFF",
    fontSize: 27,
    fontWeight: "900",
  },

  headerSubtitle: {
    marginTop: 5,
    color: "#DBEAFE",
  },

  card: {
    backgroundColor: "#FFFFFF",
    margin: 18,
    borderRadius: 22,
    padding: 22,
  },

  label: {
    fontSize: 19,
    fontWeight: "900",
    color: "#0F172A",
    textAlign: "center",
  },

  selector: {
    marginTop: 28,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 26,
  },

  selectorButton: {
    width: 54,
    height: 54,
    borderRadius: 17,
    backgroundColor: "#EFF6FF",
    justifyContent: "center",
    alignItems: "center",
  },

  countBox: {
    alignItems: "center",
    minWidth: 75,
  },

  count: {
    fontSize: 43,
    fontWeight: "900",
    color: "#0F172A",
  },

  countLabel: {
    color: "#64748B",
  },

  availableText: {
    color: "#64748B",
    textAlign: "center",
    marginTop: 23,
    marginBottom: 22,
  },

  errorBox: {
    backgroundColor: "#FEF2F2",
    padding: 12,
    borderRadius: 12,
    flexDirection: "row",
    gap: 7,
    marginBottom: 15,
  },

  errorText: {
    color: "#B91C1C",
    flex: 1,
  },

  saveButton: {
    height: 55,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    gap: 8,
  },

  saveText: {
    color: "#FFFFFF",
    fontWeight: "900",
    fontSize: 16,
  },
});
