import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { EventItem } from "../types/Event";

type Props = {
  event: EventItem;
  onPress: () => void;
};

export default function EventCard({
  event,
  onPress,
}: Props) {
  const eventDate = new Date(event.eventDate);

  const formattedDate = eventDate.toLocaleDateString(
    "en-US",
    {
      month: "short",
      day: "numeric",
      year: "numeric",
    }
  );

  const formattedTime = eventDate.toLocaleTimeString(
    "en-US",
    {
      hour: "2-digit",
      minute: "2-digit",
    }
  );

  const soldOut = event.availableSeats <= 0;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        pressed && styles.pressed,
      ]}
    >
      <LinearGradient
        colors={["#2563EB", "#4F46E5"]}
        style={styles.cover}
      >
        <View style={styles.coverTop}>
          <View style={styles.iconBox}>
            <Ionicons
              name="calendar"
              size={26}
              color="#FFFFFF"
            />
          </View>

          <View
            style={[
              styles.statusBadge,
              soldOut
                ? styles.soldOutBadge
                : styles.availableBadge,
            ]}
          >
            <Text style={styles.statusText}>
              {soldOut ? "SOLD OUT" : "AVAILABLE"}
            </Text>
          </View>
        </View>

        <Text
          style={styles.coverTitle}
          numberOfLines={2}
        >
          {event.title}
        </Text>
      </LinearGradient>

      <View style={styles.content}>
        <View style={styles.infoRow}>
          <Ionicons
            name="calendar-outline"
            size={18}
            color="#2563EB"
          />

          <Text style={styles.infoText}>
            {formattedDate}
          </Text>

          <View style={styles.dot} />

          <Text style={styles.infoText}>
            {formattedTime}
          </Text>
        </View>

        <View style={styles.infoRow}>
          <Ionicons
            name="location-outline"
            size={18}
            color="#2563EB"
          />

          <Text
            style={styles.infoText}
            numberOfLines={1}
          >
            {event.location}
          </Text>
        </View>

        <View style={styles.footer}>
          <View style={styles.seatPill}>
            <Ionicons
              name="people-outline"
              size={16}
              color="#475569"
            />

            <Text style={styles.seatText}>
              {event.availableSeats} / {event.capacity} seats
            </Text>
          </View>

          <View style={styles.viewButton}>
            <Text style={styles.viewButtonText}>
              View
            </Text>

            <Ionicons
              name="arrow-forward"
              size={16}
              color="#2563EB"
            />
          </View>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    overflow: "hidden",
    marginBottom: 18,

    shadowColor: "#0F172A",
    shadowOpacity: 0.08,
    shadowRadius: 14,
    shadowOffset: {
      width: 0,
      height: 7,
    },

    elevation: 4,
  },

  pressed: {
    opacity: 0.92,
    transform: [{ scale: 0.99 }],
  },

  cover: {
    height: 150,
    padding: 18,
    justifyContent: "space-between",
  },

  coverTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  iconBox: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.18)",
    justifyContent: "center",
    alignItems: "center",
  },

  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
  },

  availableBadge: {
    backgroundColor: "rgba(22, 163, 74, 0.92)",
  },

  soldOutBadge: {
    backgroundColor: "rgba(220, 38, 38, 0.92)",
  },

  statusText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.5,
  },

  coverTitle: {
    fontSize: 23,
    color: "#FFFFFF",
    fontWeight: "800",
    lineHeight: 29,
  },

  content: {
    padding: 18,
  },

  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 11,
    gap: 8,
  },

  infoText: {
    color: "#475569",
    fontSize: 14,
    flexShrink: 1,
  },

  dot: {
    width: 4,
    height: 4,
    backgroundColor: "#CBD5E1",
    borderRadius: 2,
  },

  footer: {
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
    paddingTop: 14,
    marginTop: 2,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  seatPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#F8FAFC",
    paddingHorizontal: 11,
    paddingVertical: 8,
    borderRadius: 12,
  },

  seatText: {
    color: "#475569",
    fontWeight: "600",
    fontSize: 13,
  },

  viewButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },

  viewButtonText: {
    color: "#2563EB",
    fontWeight: "700",
  },
});
