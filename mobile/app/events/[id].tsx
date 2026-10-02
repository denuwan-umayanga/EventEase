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

  const {
    token,
    user,
  } = useAuth();

  const [event, setEvent] =
    useState<EventItem | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [deleting, setDeleting] =
    useState(false);

  const [error, setError] =
    useState("");

  const loadEvent = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `${API_URL}/api/events/${id}`
      );

      const data =
        await response.json();

      if (!response.ok) {
        setError(
          data.message ||
            "Unable to load event."
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
            Authorization:
              `Bearer ${token}`,
          },
        }
      );

      const data =
        await response.json();

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
        "The event has been deleted successfully.",
        [
          {
            text: "OK",

            onPress: () =>
              router.replace(
                "/admin" as any
              ),
          },
        ]
      );
    } catch (error) {
      Alert.alert(
        "Connection Error",
        "Unable to connect to the EventEase server."
      );
    } finally {
      setDeleting(false);
    }
  };

  const confirmDelete = () => {
    Alert.alert(
      "Delete Event?",
      "This action cannot be undone.",
      [
        {
          text: "Keep Event",
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
        <LinearGradient
          colors={[
            "#7C3AED",
            "#EC4899",
          ]}
          style={styles.loadingIcon}
        >
          <Ionicons
            name="calendar"
            size={31}
            color="#FFFFFF"
          />
        </LinearGradient>

        <ActivityIndicator
          size="large"
          color="#A855F7"
          style={{
            marginTop: 20,
          }}
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
            size={45}
            color="#DC2626"
          />
        </View>

        <Text style={styles.errorTitle}>
          Event unavailable
        </Text>

        <Text style={styles.errorText}>
          {error ||
            "This event could not be found."}
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

  const date =
    new Date(event.eventDate);

  const imageUrl =
    getImageUrl(event.image);

  const soldOut =
    event.availableSeats <= 0;

  const isAdmin =
    user?.isAdmin === true;

  const category =
    event.category ||
    "Social";

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={
        styles.scrollContent
      }
      showsVerticalScrollIndicator={
        false
      }
    >
      {/* HERO IMAGE */}

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
              "#6D28D9",
              "#A855F7",
              "#EC4899",
            ]}
            style={styles.heroImage}
          >
            <Ionicons
              name="calendar"
              size={85}
              color="rgba(255,255,255,0.28)"
            />
          </LinearGradient>
        )}

        <LinearGradient
          colors={[
            "rgba(17,24,39,0.02)",
            "rgba(17,24,39,0.20)",
            "rgba(17,24,39,0.88)",
          ]}
          style={styles.heroOverlay}
        />

        <View style={styles.heroContent}>
          <View style={styles.heroTop}>
            <View style={styles.categoryPill}>
              <Ionicons
                name={
                  getCategoryIcon(
                    category
                  )
                }
                size={15}
                color="#FFFFFF"
              />

              <Text
                style={
                  styles.categoryText
                }
              >
                {category}
              </Text>
            </View>

            <View
              style={[
                styles.statusPill,

                soldOut
                  ? styles.soldOutPill
                  : styles.availablePill,
              ]}
            >
              <Text
                style={
                  styles.statusText
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
                styles.heroMetaRow
              }
            >
              <Ionicons
                name="location-outline"
                size={17}
                color="#FFFFFF"
              />

              <Text
                style={
                  styles.heroLocation
                }
                numberOfLines={1}
              >
                {event.location}
              </Text>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.body}>
        {/* AVAILABILITY */}

        <View
          style={styles.availabilityCard}
        >
          <LinearGradient
            colors={[
              "#F3E8FF",
              "#FCE7F3",
            ]}
            style={
              styles.availabilityIcon
            }
          >
            <Ionicons
              name="people-outline"
              size={25}
              color="#9333EA"
            />
          </LinearGradient>

          <View
            style={
              styles.availabilityInfo
            }
          >
            <Text
              style={
                styles.availabilityLabel
              }
            >
              Seats available
            </Text>

            <Text
              style={
                styles.availabilityNumber
              }
            >
              {event.availableSeats}
            </Text>
          </View>

          <View
            style={
              styles.capacityBox
            }
          >
            <Text
              style={
                styles.capacityLabel
              }
            >
              CAPACITY
            </Text>

            <Text
              style={
                styles.capacityValue
              }
            >
              {event.capacity}
            </Text>
          </View>
        </View>

        {/* DATE / TIME */}

        <View style={styles.infoCard}>
          <InfoRow
            icon="calendar-outline"
            label="Date"
            value={date.toLocaleDateString(
              "en-US",
              {
                weekday:
                  "long",

                month:
                  "long",

                day:
                  "numeric",

                year:
                  "numeric",
              }
            )}
          />

          <InfoRow
            icon="time-outline"
            label="Time"
            value={date.toLocaleTimeString(
              "en-US",
              {
                hour:
                  "2-digit",

                minute:
                  "2-digit",
              }
            )}
          />

          <InfoRow
            icon="location-outline"
            label="Location"
            value={
              event.location
            }
            last
          />
        </View>

        {/* DESCRIPTION */}

        <View
          style={styles.sectionCard}
        >
          <View
            style={
              styles.sectionHeader
            }
          >
            <LinearGradient
              colors={[
                "#F3E8FF",
                "#FCE7F3",
              ]}
              style={
                styles.sectionIcon
              }
            >
              <Ionicons
                name="information-circle-outline"
                size={22}
                color="#9333EA"
              />
            </LinearGradient>

            <View>
              <Text
                style={
                  styles.sectionTitle
                }
              >
                About this event
              </Text>

              <Text
                style={
                  styles.sectionSubtitle
                }
              >
                Event information
              </Text>
            </View>
          </View>

          <Text
            style={
              styles.description
            }
          >
            {event.description}
          </Text>
        </View>

        {/* ADMIN CONTROLS */}

        {isAdmin ? (
          <View
            style={
              styles.adminPanel
            }
          >
            <View
              style={
                styles.adminHeader
              }
            >
              <LinearGradient
                colors={[
                  "#7C3AED",
                  "#EC4899",
                ]}
                style={
                  styles.adminIcon
                }
              >
                <Ionicons
                  name="shield-checkmark-outline"
                  size={22}
                  color="#FFFFFF"
                />
              </LinearGradient>

              <View style={{ flex: 1 }}>
                <Text
                  style={
                    styles.adminTitle
                  }
                >
                  Event Management
                </Text>

                <Text
                  style={
                    styles.adminSubtitle
                  }
                >
                  Admin controls
                </Text>
              </View>

              <View
                style={
                  styles.adminBadge
                }
              >
                <Text
                  style={
                    styles.adminBadgeText
                  }
                >
                  ADMIN
                </Text>
              </View>
            </View>

            <View
              style={
                styles.adminActions
              }
            >
              <Pressable
                style={({
                  pressed,
                }) => [
                  styles.editButton,

                  pressed &&
                    styles.pressed,
                ]}
                onPress={() =>
                  router.push({
                    pathname:
                      "/events/edit/[id]",

                    params: {
                      id:
                        event._id,
                    },
                  })
                }
              >
                <Ionicons
                  name="create-outline"
                  size={20}
                  color="#7C3AED"
                />

                <Text
                  style={
                    styles.editButtonText
                  }
                >
                  Edit Event
                </Text>
              </Pressable>

              <Pressable
                style={({
                  pressed,
                }) => [
                  styles.deleteButton,

                  pressed &&
                    styles.pressed,
                ]}
                disabled={
                  deleting
                }
                onPress={
                  confirmDelete
                }
              >
                {deleting ? (
                  <ActivityIndicator
                    color="#DC2626"
                  />
                ) : (
                  <>
                    <Ionicons
                      name="trash-outline"
                      size={20}
                      color="#DC2626"
                    />

                    <Text
                      style={
                        styles.deleteButtonText
                      }
                    >
                      Delete
                    </Text>
                  </>
                )}
              </Pressable>
            </View>

            <Text
              style={
                styles.adminHelp
              }
            >
              Users can view and
              book this event, but
              only administrators
              can modify it.
            </Text>
          </View>
        ) : (
          /* USER BOOKING */

          <Pressable
            disabled={soldOut}
            style={({
              pressed,
            }) => [
              styles.bookWrapper,

              pressed &&
                !soldOut &&
                styles.bookPressed,
            ]}
            onPress={() =>
              router.push({
                pathname:
                  "/bookings/create",

                params: {
                  eventId:
                    event._id,
                },
              } as any)
            }
          >
            <LinearGradient
              colors={
                soldOut
                  ? [
                      "#9CA3AF",
                      "#6B7280",
                    ]
                  : [
                      "#7C3AED",
                      "#A855F7",
                      "#EC4899",
                    ]
              }
              start={{
                x: 0,
                y: 0,
              }}
              end={{
                x: 1,
                y: 1,
              }}
              style={
                styles.bookButton
              }
            >
              <View
                style={
                  styles.bookIcon
                }
              >
                <Ionicons
                  name={
                    soldOut
                      ? "close-circle-outline"
                      : "ticket-outline"
                  }
                  size={24}
                  color="#FFFFFF"
                />
              </View>

              <View
                style={
                  styles.bookTextArea
                }
              >
                <Text
                  style={
                    styles.bookTitle
                  }
                >
                  {soldOut
                    ? "Event Sold Out"
                    : "Book This Event"}
                </Text>

                {!soldOut && (
                  <Text
                    style={
                      styles.bookSubtitle
                    }
                  >
                    Choose your
                    seats and
                    confirm booking
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
        )}
      </View>
    </ScrollView>
  );
}

function InfoRow({
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
        styles.infoRow,

        last &&
          styles.infoRowLast,
      ]}
    >
      <LinearGradient
        colors={[
          "#F3E8FF",
          "#FCE7F3",
        ]}
        style={
          styles.infoIcon
        }
      >
        <Ionicons
          name={icon}
          size={20}
          color="#9333EA"
        />
      </LinearGradient>

      <View
        style={
          styles.infoContent
        }
      >
        <Text
          style={
            styles.infoLabel
          }
        >
          {label}
        </Text>

        <Text
          style={
            styles.infoValue
          }
        >
          {value}
        </Text>
      </View>
    </View>
  );
}

function getCategoryIcon(
  category: string
): any {
  switch (category) {
    case "Music":
      return "musical-notes";

    case "Tech":
      return "hardware-chip";

    case "Business":
      return "briefcase";

    case "Sports":
      return "football";

    case "Workshop":
      return "construct";

    default:
      return "people";
  }
}

const styles =
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor:
        "#FAF7FF",
    },

    scrollContent: {
      paddingBottom: 45,
    },

    center: {
      flex: 1,
      justifyContent:
        "center",
      alignItems:
        "center",
      padding: 30,
      backgroundColor:
        "#FAF7FF",
    },

    loadingIcon: {
      width: 70,
      height: 70,
      borderRadius: 23,
      justifyContent:
        "center",
      alignItems:
        "center",
    },

    loadingText: {
      color: "#6B7280",
      marginTop: 12,
      fontWeight: "600",
    },

    errorIcon: {
      width: 80,
      height: 80,
      borderRadius: 27,
      backgroundColor:
        "#FEF2F2",
      justifyContent:
        "center",
      alignItems:
        "center",
    },

    errorTitle: {
      color: "#111827",
      fontSize: 21,
      fontWeight: "900",
      marginTop: 15,
    },

    errorText: {
      color: "#6B7280",
      textAlign: "center",
      lineHeight: 20,
      marginTop: 6,
    },

    retryButton: {
      marginTop: 19,
      paddingHorizontal: 18,
      paddingVertical: 11,
      borderRadius: 13,
      backgroundColor:
        "#9333EA",
      flexDirection:
        "row",
      alignItems:
        "center",
      gap: 7,
    },

    retryText: {
      color: "#FFFFFF",
      fontWeight: "900",
    },

    pressed: {
      opacity: 0.72,
    },

    /* HERO */

    hero: {
      height: 345,
      position: "relative",
      backgroundColor:
        "#7C3AED",
      overflow: "hidden",
    },

    heroImage: {
      width: "100%",
      height: "100%",
      justifyContent:
        "center",
      alignItems:
        "center",
    },

    heroOverlay: {
      ...StyleSheet.absoluteFillObject,
    },

    heroContent: {
      ...StyleSheet.absoluteFillObject,

      paddingHorizontal: 21,
      paddingTop: 26,
      paddingBottom: 28,

      justifyContent:
        "space-between",
    },

    heroTop: {
      flexDirection:
        "row",

      justifyContent:
        "space-between",

      alignItems:
        "center",
    },

    categoryPill: {
      flexDirection:
        "row",

      alignItems:
        "center",

      gap: 6,

      backgroundColor:
        "rgba(124,58,237,0.92)",

      borderRadius: 20,

      paddingHorizontal: 12,
      paddingVertical: 8,
    },

    categoryText: {
      color: "#FFFFFF",
      fontSize: 11,
      fontWeight: "900",
    },

    statusPill: {
      borderRadius: 20,

      paddingHorizontal: 12,
      paddingVertical: 8,
    },

    availablePill: {
      backgroundColor:
        "rgba(22,163,74,0.94)",
    },

    soldOutPill: {
      backgroundColor:
        "rgba(220,38,38,0.94)",
    },

    statusText: {
      color: "#FFFFFF",
      fontSize: 10,
      fontWeight: "900",
      letterSpacing: 0.5,
    },

    title: {
      color: "#FFFFFF",
      fontSize: 31,
      lineHeight: 37,
      fontWeight: "900",

      textShadowColor:
        "rgba(0,0,0,0.35)",

      textShadowRadius: 4,
    },

    heroMetaRow: {
      flexDirection:
        "row",

      alignItems:
        "center",

      gap: 6,

      marginTop: 10,
    },

    heroLocation: {
      color: "#FFFFFF",
      fontWeight: "700",
      flex: 1,
    },

    /* BODY */

    body: {
      padding: 18,
    },

    availabilityCard: {
      backgroundColor:
        "#FFFFFF",

      borderRadius: 22,

      padding: 16,

      flexDirection:
        "row",

      alignItems:
        "center",

      marginBottom: 16,

      shadowColor:
        "#581C87",

      shadowOpacity: 0.06,
      shadowRadius: 13,

      elevation: 3,
    },

    availabilityIcon: {
      width: 54,
      height: 54,
      borderRadius: 17,
      justifyContent:
        "center",
      alignItems:
        "center",
    },

    availabilityInfo: {
      flex: 1,
      marginLeft: 12,
    },

    availabilityLabel: {
      color: "#6B7280",
      fontSize: 12,
      fontWeight: "700",
    },

    availabilityNumber: {
      color: "#111827",
      fontSize: 26,
      fontWeight: "900",
      marginTop: 1,
    },

    capacityBox: {
      paddingHorizontal: 13,
      paddingVertical: 9,

      backgroundColor:
        "#FAF5FF",

      borderRadius: 13,

      alignItems:
        "center",
    },

    capacityLabel: {
      color: "#A855F7",
      fontSize: 8,
      fontWeight: "900",
      letterSpacing: 0.6,
    },

    capacityValue: {
      color: "#7C3AED",
      fontSize: 18,
      fontWeight: "900",
      marginTop: 2,
    },

    infoCard: {
      backgroundColor:
        "#FFFFFF",

      borderRadius: 22,

      paddingHorizontal: 17,

      marginBottom: 16,
    },

    infoRow: {
      flexDirection:
        "row",

      paddingVertical: 16,

      borderBottomWidth: 1,

      borderBottomColor:
        "#F3E8FF",
    },

    infoRowLast: {
      borderBottomWidth: 0,
    },

    infoIcon: {
      width: 43,
      height: 43,
      borderRadius: 14,
      justifyContent:
        "center",
      alignItems:
        "center",
      marginRight: 12,
    },

    infoContent: {
      flex: 1,
      justifyContent:
        "center",
    },

    infoLabel: {
      color: "#9CA3AF",
      fontSize: 9,
      fontWeight: "900",
      letterSpacing: 0.5,
      textTransform:
        "uppercase",
    },

    infoValue: {
      color: "#111827",
      fontWeight: "800",
      marginTop: 3,
      lineHeight: 19,
    },

    /* DESCRIPTION */

    sectionCard: {
      backgroundColor:
        "#FFFFFF",

      borderRadius: 22,

      padding: 18,

      marginBottom: 16,
    },

    sectionHeader: {
      flexDirection:
        "row",

      alignItems:
        "center",

      marginBottom: 14,
    },

    sectionIcon: {
      width: 44,
      height: 44,
      borderRadius: 14,
      justifyContent:
        "center",
      alignItems:
        "center",
      marginRight: 11,
    },

    sectionTitle: {
      color: "#111827",
      fontSize: 17,
      fontWeight: "900",
    },

    sectionSubtitle: {
      color: "#9CA3AF",
      fontSize: 10,
      marginTop: 2,
    },

    description: {
      color: "#4B5563",
      fontSize: 14,
      lineHeight: 23,
    },

    /* ADMIN */

    adminPanel: {
      backgroundColor:
        "#FFFFFF",

      borderRadius: 22,

      padding: 18,

      borderWidth: 1,

      borderColor:
        "#E9D5FF",
    },

    adminHeader: {
      flexDirection:
        "row",

      alignItems:
        "center",
    },

    adminIcon: {
      width: 46,
      height: 46,
      borderRadius: 15,
      justifyContent:
        "center",
      alignItems:
        "center",
      marginRight: 11,
    },

    adminTitle: {
      color: "#111827",
      fontWeight: "900",
      fontSize: 17,
    },

    adminSubtitle: {
      color: "#9CA3AF",
      fontSize: 11,
      marginTop: 2,
    },

    adminBadge: {
      backgroundColor:
        "#F3E8FF",

      borderRadius: 10,

      paddingHorizontal: 8,
      paddingVertical: 5,
    },

    adminBadgeText: {
      color: "#7C3AED",
      fontSize: 9,
      fontWeight: "900",
    },

    adminActions: {
      marginTop: 17,

      flexDirection:
        "row",

      gap: 10,
    },

    editButton: {
      flex: 1,
      minHeight: 50,

      borderRadius: 14,

      backgroundColor:
        "#F3E8FF",

      flexDirection:
        "row",

      justifyContent:
        "center",

      alignItems:
        "center",

      gap: 7,
    },

    editButtonText: {
      color: "#7C3AED",
      fontWeight: "900",
    },

    deleteButton: {
      flex: 1,
      minHeight: 50,

      borderRadius: 14,

      backgroundColor:
        "#FEF2F2",

      flexDirection:
        "row",

      justifyContent:
        "center",

      alignItems:
        "center",

      gap: 7,
    },

    deleteButtonText: {
      color: "#DC2626",
      fontWeight: "900",
    },

    adminHelp: {
      color: "#9CA3AF",
      fontSize: 10,
      lineHeight: 16,
      marginTop: 13,
      textAlign: "center",
    },

    /* BOOK */

    bookWrapper: {
      borderRadius: 20,
      overflow: "hidden",

      shadowColor:
        "#7C3AED",

      shadowOpacity: 0.22,
      shadowRadius: 13,

      shadowOffset: {
        width: 0,
        height: 6,
      },

      elevation: 6,
    },

    bookPressed: {
      opacity: 0.92,

      transform: [
        {
          scale: 0.98,
        },
      ],
    },

    bookButton: {
      minHeight: 73,

      paddingHorizontal: 16,

      flexDirection:
        "row",

      alignItems:
        "center",

      gap: 11,
    },

    bookIcon: {
      width: 45,
      height: 45,
      borderRadius: 15,

      backgroundColor:
        "rgba(255,255,255,0.16)",

      justifyContent:
        "center",

      alignItems:
        "center",
    },

    bookTextArea: {
      flex: 1,
    },

    bookTitle: {
      color: "#FFFFFF",
      fontSize: 16,
      fontWeight: "900",
    },

    bookSubtitle: {
      color: "#FCE7F3",
      fontSize: 11,
      marginTop: 2,
    },
  });