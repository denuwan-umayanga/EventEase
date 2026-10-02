import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { EventItem } from "../types/Event";
import { getImageUrl } from "../utils/imageUrl";

type Props = {
  event: EventItem;
  onPress: () => void;
};

export default function EventCard({
  event,
  onPress,
}: Props) {
  const eventDate = new Date(event.eventDate);

  const formattedDate =
    eventDate.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

  const formattedTime =
    eventDate.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });

  const soldOut = event.availableSeats <= 0;

  const imageUrl = getImageUrl(event.image);

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        pressed && styles.pressed,
      ]}
    >
      {/* COVER IMAGE */}
      <View style={styles.coverContainer}>
        {imageUrl ? (
          <Image
            source={{
              uri: imageUrl,
            }}
            style={styles.coverImage}
            resizeMode="cover"
          />
        ) : (
          <LinearGradient
            colors={[
              "#2563EB",
              "#4F46E5",
            ]}
            style={styles.placeholderCover}
          >
            <Ionicons
              name="calendar"
              size={50}
              color="rgba(255,255,255,0.35)"
            />
          </LinearGradient>
        )}

        {/* DARK IMAGE OVERLAY */}
        <LinearGradient
          colors={[
            "rgba(15,23,42,0.02)",
            "rgba(15,23,42,0.15)",
            "rgba(15,23,42,0.82)",
          ]}
          style={styles.overlay}
        />

        {/* TOP ROW */}
        <View style={styles.coverTop}>
          <View style={styles.iconBox}>
            <Ionicons
              name="calendar"
              size={21}
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
              {soldOut
                ? "SOLD OUT"
                : "AVAILABLE"}
            </Text>
          </View>
        </View>

        {/* EVENT TITLE */}
        <Text
          style={styles.coverTitle}
          numberOfLines={2}
        >
          {event.title}
        </Text>
      </View>

      {/* CARD INFORMATION */}
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

          <Ionicons
            name="time-outline"
            size={17}
            color="#2563EB"
          />

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

        {/* FOOTER */}
        <View style={styles.footer}>
          <View style={styles.seatPill}>
            <Ionicons
              name="people-outline"
              size={16}
              color={
                soldOut
                  ? "#DC2626"
                  : "#475569"
              }
            />

            <Text
              style={[
                styles.seatText,
                soldOut &&
                  styles.soldOutSeatText,
              ]}
            >
              {event.availableSeats} /{" "}
              {event.capacity} seats
            </Text>
          </View>

          <View style={styles.viewButton}>
            <Text
              style={styles.viewButtonText}
            >
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
    shadowOpacity: 0.1,
    shadowRadius: 14,

    shadowOffset: {
      width: 0,
      height: 6,
    },

    elevation: 4,
  },

  pressed: {
    opacity: 0.93,
    transform: [
      {
        scale: 0.99,
      },
    ],
  },

  /*
   * IMAGE AREA
   */
  coverContainer: {
    height: 190,
    position: "relative",
    backgroundColor: "#2563EB",
  },

  coverImage: {
    ...StyleSheet.absoluteFillObject,
    width: "100%",
    height: "100%",
  },

  placeholderCover: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
  },

  overlay: {
    ...StyleSheet.absoluteFillObject,
  },

  /*
   * IMAGE TOP
   */
  coverTop: {
    position: "absolute",
    top: 15,
    left: 15,
    right: 15,

    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  iconBox: {
    width: 42,
    height: 42,
    borderRadius: 13,

    backgroundColor:
      "rgba(15,23,42,0.40)",

    borderWidth: 1,

    borderColor:
      "rgba(255,255,255,0.20)",

    justifyContent: "center",
    alignItems: "center",
  },

  statusBadge: {
    paddingHorizontal: 11,
    paddingVertical: 7,
    borderRadius: 20,
  },

  availableBadge: {
    backgroundColor:
      "rgba(22,163,74,0.94)",
  },

  soldOutBadge: {
    backgroundColor:
      "rgba(220,38,38,0.94)",
  },

  statusText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 0.6,
  },

  /*
   * TITLE ON IMAGE
   */
  coverTitle: {
    position: "absolute",

    left: 17,
    right: 17,
    bottom: 17,

    color: "#FFFFFF",

    fontSize: 23,
    fontWeight: "900",
    lineHeight: 28,

    textShadowColor:
      "rgba(0,0,0,0.35)",

    textShadowOffset: {
      width: 0,
      height: 1,
    },

    textShadowRadius: 3,
  },

  /*
   * CARD BODY
   */
  content: {
    paddingHorizontal: 17,
    paddingTop: 16,
    paddingBottom: 15,
  },

  infoRow: {
    flexDirection: "row",
    alignItems: "center",

    gap: 7,

    marginBottom: 10,
  },

  infoText: {
    color: "#475569",
    fontSize: 13,
    flexShrink: 1,
  },

  dot: {
    width: 4,
    height: 4,

    borderRadius: 2,

    backgroundColor: "#CBD5E1",

    marginHorizontal: 1,
  },

  /*
   * FOOTER
   */
  footer: {
    borderTopWidth: 1,

    borderTopColor: "#F1F5F9",

    paddingTop: 13,
    marginTop: 3,

    flexDirection: "row",

    justifyContent: "space-between",

    alignItems: "center",
  },

  seatPill: {
    flexDirection: "row",

    alignItems: "center",

    gap: 6,

    backgroundColor: "#F8FAFC",

    paddingHorizontal: 10,

    paddingVertical: 7,

    borderRadius: 11,
  },

  seatText: {
    color: "#475569",

    fontWeight: "700",

    fontSize: 12,
  },

  soldOutSeatText: {
    color: "#DC2626",
  },

  viewButton: {
    flexDirection: "row",

    alignItems: "center",

    gap: 5,

    paddingHorizontal: 4,

    paddingVertical: 6,
  },

  viewButtonText: {
    color: "#2563EB",

    fontWeight: "900",

    fontSize: 13,
  },
});