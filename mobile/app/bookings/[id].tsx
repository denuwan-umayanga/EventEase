import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useFocusEffect } from "@react-navigation/native";
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

import { API_URL } from "../../src/config/api";
import { useAuth } from "../../src/context/AuthContext";
import { BookingItem } from "../../src/types/Booking";
import { getImageUrl } from "../../src/utils/imageUrl";

export default function BookingDetailsScreen() {
  const { id } =
    useLocalSearchParams<{
      id: string;
    }>();

  const {
    token,
    user,
  } = useAuth();

  const [
    booking,
    setBooking,
  ] =
    useState<BookingItem | null>(
      null
    );

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    cancelling,
    setCancelling,
  ] = useState(false);

  const [
    deleting,
    setDeleting,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState("");

  const loadBooking =
    async () => {
      try {
        setLoading(true);
        setError("");

        const response =
          await fetch(
            `${API_URL}/api/bookings/${id}`,
            {
              headers: {
                Authorization:
                  `Bearer ${token}`,
              },
            }
          );

        const data =
          await response.json();

        if (!response.ok) {
          setError(
            data.message ||
              "Unable to load booking."
          );

          return;
        }

        setBooking(
          data.booking
        );
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
      loadBooking();
    }, [id, token])
  );

  const cancelBooking =
    async () => {
      try {
        setCancelling(true);

        const response =
          await fetch(
            `${API_URL}/api/bookings/${id}/cancel`,
            {
              method: "PUT",

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
            "Cancel Failed",
            data.message ||
              "Unable to cancel booking."
          );

          return;
        }

        Alert.alert(
          "Booking Cancelled",
          "Your seats have been released successfully."
        );

        await loadBooking();
      } catch (error) {
        Alert.alert(
          "Connection Error",
          "Unable to connect to the EventEase server."
        );
      } finally {
        setCancelling(false);
      }
    };

  const confirmCancel =
    () => {
      Alert.alert(
        "Cancel Booking?",
        "Your reserved seats will be released back to the event.",
        [
          {
            text:
              "Keep Booking",
            style: "cancel",
          },
          {
            text:
              "Cancel Booking",
            style:
              "destructive",
            onPress:
              cancelBooking,
          },
        ]
      );
    };

  const deleteBooking =
    async () => {
      try {
        setDeleting(true);

        const response =
          await fetch(
            `${API_URL}/api/bookings/${id}`,
            {
              method:
                "DELETE",

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
              "Unable to delete booking."
          );

          return;
        }

        Alert.alert(
          "Booking Deleted",
          "The booking has been permanently removed.",
          [
            {
              text: "OK",

              onPress: () =>
                router.replace(
                  "/bookings" as any
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

  const confirmDelete =
    () => {
      Alert.alert(
        "Delete Booking?",
        booking?.status ===
          "Confirmed"
          ? "Deleting this confirmed booking will also release its reserved seats."
          : "This booking will be permanently removed from your history.",
        [
          {
            text:
              "Keep Booking",
            style: "cancel",
          },
          {
            text:
              "Delete",
            style:
              "destructive",
            onPress:
              deleteBooking,
          },
        ]
      );
    };

  if (loading) {
    return (
      <View
        style={
          styles.center
        }
      >
        <LinearGradient
          colors={[
            "#7C3AED",
            "#EC4899",
          ]}
          style={
            styles.loadingIcon
          }
        >
          <Ionicons
            name="ticket"
            size={33}
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

        <Text
          style={
            styles.loadingText
          }
        >
          Loading your
          ticket...
        </Text>
      </View>
    );
  }

  if (
    !booking ||
    error
  ) {
    return (
      <View
        style={
          styles.center
        }
      >
        <View
          style={
            styles.errorIcon
          }
        >
          <Ionicons
            name="alert-circle-outline"
            size={45}
            color="#DC2626"
          />
        </View>

        <Text
          style={
            styles.errorTitle
          }
        >
          Booking unavailable
        </Text>

        <Text
          style={
            styles.errorText
          }
        >
          {error ||
            "Unable to find this booking."}
        </Text>

        <Pressable
          style={
            styles.retryButton
          }
          onPress={
            loadBooking
          }
        >
          <Ionicons
            name="refresh"
            size={18}
            color="#FFFFFF"
          />

          <Text
            style={
              styles.retryText
            }
          >
            Try Again
          </Text>
        </Pressable>
      </View>
    );
  }

  const event =
    booking.eventId;

  const eventDate =
    new Date(
      event.eventDate
    );

  const imageUrl =
    getImageUrl(
      event.image
    );

  const cancelled =
    booking.status ===
    "Cancelled";

  const category =
    event.category ||
    "Social";

  const reference =
    booking._id
      .slice(-8)
      .toUpperCase();

  const bookingDate =
    booking.createdAt
      ? new Date(
          booking.createdAt
        )
      : null;

  return (
    <ScrollView
      style={
        styles.container
      }
      showsVerticalScrollIndicator={
        false
      }
      contentContainerStyle={
        styles.content
      }
    >
      {/* HERO */}

      <View
        style={
          styles.hero
        }
      >
        {imageUrl ? (
          <Image
            source={{
              uri: imageUrl,
            }}
            style={
              styles.heroImage
            }
            resizeMode="cover"
          />
        ) : (
          <LinearGradient
            colors={[
              "#6D28D9",
              "#A855F7",
              "#EC4899",
            ]}
            style={
              styles.heroImage
            }
          >
            <Ionicons
              name="calendar"
              size={75}
              color="rgba(255,255,255,0.30)"
            />
          </LinearGradient>
        )}

        <LinearGradient
          colors={[
            "rgba(17,24,39,0.02)",
            "rgba(17,24,39,0.25)",
            "rgba(17,24,39,0.90)",
          ]}
          style={
            styles.heroOverlay
          }
        />

        <View
          style={
            styles.heroContent
          }
        >
          <View
            style={
              styles.heroTop
            }
          >
            <View
              style={
                styles.categoryBadge
              }
            >
              <Ionicons
                name={
                  getCategoryIcon(
                    category
                  )
                }
                size={14}
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
                styles.statusBadge,

                cancelled
                  ? styles.cancelledBadge
                  : styles.confirmedBadge,
              ]}
            >
              <Ionicons
                name={
                  cancelled
                    ? "close-circle"
                    : "checkmark-circle"
                }
                size={15}
                color="#FFFFFF"
              />

              <Text
                style={
                  styles.statusText
                }
              >
                {
                  booking.status
                }
              </Text>
            </View>
          </View>

          <View>
            <Text
              style={
                styles.heroLabel
              }
            >
              EVENTEASE TICKET
            </Text>

            <Text
              style={
                styles.heroTitle
              }
              numberOfLines={2}
            >
              {event.title}
            </Text>

            <View
              style={
                styles.heroLocation
              }
            >
              <Ionicons
                name="location-outline"
                size={16}
                color="#FFFFFF"
              />

              <Text
                style={
                  styles.heroLocationText
                }
                numberOfLines={
                  1
                }
              >
                {
                  event.location
                }
              </Text>
            </View>
          </View>
        </View>
      </View>

      <View
        style={
          styles.body
        }
      >
        {/* TICKET */}

        <View
          style={
            styles.ticketCard
          }
        >
          <View
            style={
              styles.ticketHeader
            }
          >
            <View>
              <Text
                style={
                  styles.ticketLabel
                }
              >
                BOOKING
                REFERENCE
              </Text>

              <Text
                style={
                  styles.ticketReference
                }
              >
                #{reference}
              </Text>
            </View>

            <LinearGradient
              colors={[
                "#F3E8FF",
                "#FCE7F3",
              ]}
              style={
                styles.ticketIcon
              }
            >
              <Ionicons
                name="ticket-outline"
                size={26}
                color="#9333EA"
              />
            </LinearGradient>
          </View>

          <View
            style={
              styles.ticketDivider
            }
          >
            <View
              style={[
                styles.ticketCutout,
                styles.leftCutout,
              ]}
            />

            <View
              style={
                styles.dashedLine
              }
            />

            <View
              style={[
                styles.ticketCutout,
                styles.rightCutout,
              ]}
            />
          </View>

          <View
            style={
              styles.ticketGrid
            }
          >
            <TicketInfo
              label="DATE"
              value={eventDate.toLocaleDateString(
                "en-US",
                {
                  month:
                    "short",

                  day:
                    "numeric",

                  year:
                    "numeric",
                }
              )}
            />

            <TicketInfo
              label="TIME"
              value={eventDate.toLocaleTimeString(
                "en-US",
                {
                  hour:
                    "2-digit",

                  minute:
                    "2-digit",
                }
              )}
            />

            <TicketInfo
              label="SEATS"
              value={`${booking.numberOfSeats}`}
            />

            <TicketInfo
              label="STATUS"
              value={
                booking.status
              }
              success={
                !cancelled
              }
            />
          </View>

          <View
            style={
              styles.ticketUser
            }
          >
            <Ionicons
              name="person-circle-outline"
              size={22}
              color="#A855F7"
            />

            <View>
              <Text
                style={
                  styles.ticketUserLabel
                }
              >
                BOOKED FOR
              </Text>

              <Text
                style={
                  styles.ticketUserName
                }
              >
                {user?.name ||
                  "EventEase User"}
              </Text>
            </View>
          </View>
        </View>

        {/* EVENT INFORMATION */}

        <View
          style={
            styles.infoCard
          }
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
                name="calendar-outline"
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
                Event Details
              </Text>

              <Text
                style={
                  styles.sectionSubtitle
                }
              >
                Reservation
                information
              </Text>
            </View>
          </View>

          <DetailRow
            icon="location-outline"
            label="Location"
            value={
              event.location
            }
          />

          <DetailRow
            icon="people-outline"
            label="Reserved Seats"
            value={`${booking.numberOfSeats}`}
          />

          <DetailRow
            icon="grid-outline"
            label="Category"
            value={
              category
            }
          />

          {bookingDate && (
            <DetailRow
              icon="receipt-outline"
              label="Booked On"
              value={bookingDate.toLocaleDateString(
                "en-US",
                {
                  month:
                    "long",

                  day:
                    "numeric",

                  year:
                    "numeric",
                }
              )}
              last
            />
          )}
        </View>

        {/* CANCELLED MESSAGE */}

        {cancelled && (
          <View
            style={
              styles.cancelledNotice
            }
          >
            <View
              style={
                styles.cancelledNoticeIcon
              }
            >
              <Ionicons
                name="close-circle-outline"
                size={23}
                color="#DC2626"
              />
            </View>

            <View
              style={{ flex: 1 }}
            >
              <Text
                style={
                  styles.cancelledNoticeTitle
                }
              >
                Booking Cancelled
              </Text>

              <Text
                style={
                  styles.cancelledNoticeText
                }
              >
                These seats have
                been returned to
                the event's
                availability.
              </Text>
            </View>
          </View>
        )}

        {/* ACTIVE ACTIONS */}

        {!cancelled && (
          <View
            style={
              styles.actionsCard
            }
          >
            <Text
              style={
                styles.actionsTitle
              }
            >
              Manage Booking
            </Text>

            <Text
              style={
                styles.actionsSubtitle
              }
            >
              Change your seat
              count or cancel the
              reservation.
            </Text>

            <Pressable
              style={({
                pressed,
              }) => [
                styles.changeButton,

                pressed &&
                  styles.pressed,
              ]}
              onPress={() =>
                router.push({
                  pathname:
                    "/bookings/edit/[id]",

                  params: {
                    id:
                      booking._id,
                  },
                })
              }
            >
              <LinearGradient
                colors={[
                  "#F3E8FF",
                  "#FCE7F3",
                ]}
                style={
                  styles.changeButtonIcon
                }
              >
                <Ionicons
                  name="people-outline"
                  size={21}
                  color="#9333EA"
                />
              </LinearGradient>

              <View
                style={{
                  flex: 1,
                }}
              >
                <Text
                  style={
                    styles.changeTitle
                  }
                >
                  Change Seats
                </Text>

                <Text
                  style={
                    styles.changeSubtitle
                  }
                >
                  Currently{" "}
                  {
                    booking.numberOfSeats
                  }{" "}
                  seat
                  {booking.numberOfSeats ===
                  1
                    ? ""
                    : "s"}
                </Text>
              </View>

              <Ionicons
                name="chevron-forward"
                size={20}
                color="#9333EA"
              />
            </Pressable>

            <Pressable
              disabled={
                cancelling
              }
              style={({
                pressed,
              }) => [
                styles.cancelButton,

                pressed &&
                  styles.pressed,
              ]}
              onPress={
                confirmCancel
              }
            >
              {cancelling ? (
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

                  <Text
                    style={
                      styles.cancelButtonText
                    }
                  >
                    Cancel Booking
                  </Text>
                </>
              )}
            </Pressable>
          </View>
        )}

        {/* DELETE */}

        <View
          style={
            styles.deleteSection
          }
        >
          <View
            style={{ flex: 1 }}
          >
            <Text
              style={
                styles.deleteTitle
              }
            >
              Delete booking
              record
            </Text>

            <Text
              style={
                styles.deleteSubtitle
              }
            >
              Permanently remove
              this booking from
              your history.
            </Text>
          </View>

          <Pressable
            disabled={
              deleting
            }
            style={({
              pressed,
            }) => [
              styles.deleteButton,

              pressed &&
                styles.pressed,
            ]}
            onPress={
              confirmDelete
            }
          >
            {deleting ? (
              <ActivityIndicator
                color="#DC2626"
              />
            ) : (
              <Ionicons
                name="trash-outline"
                size={21}
                color="#DC2626"
              />
            )}
          </Pressable>
        </View>

        <View
          style={{
            height: 20,
          }}
        />
      </View>
    </ScrollView>
  );
}

function TicketInfo({
  label,
  value,
  success = false,
}: {
  label: string;
  value: string;
  success?: boolean;
}) {
  return (
    <View
      style={
        styles.ticketInfo
      }
    >
      <Text
        style={
          styles.ticketInfoLabel
        }
      >
        {label}
      </Text>

      <Text
        style={[
          styles.ticketInfoValue,

          success &&
            styles.successValue,
        ]}
      >
        {value}
      </Text>
    </View>
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

        last &&
          styles.detailRowLast,
      ]}
    >
      <View
        style={
          styles.detailIcon
        }
      >
        <Ionicons
          name={icon}
          size={18}
          color="#A855F7"
        />
      </View>

      <View
        style={{ flex: 1 }}
      >
        <Text
          style={
            styles.detailLabel
          }
        >
          {label}
        </Text>

        <Text
          style={
            styles.detailValue
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

    content: {
      paddingBottom: 30,
    },

    center: {
      flex: 1,
      justifyContent:
        "center",
      alignItems:
        "center",
      backgroundColor:
        "#FAF7FF",
      padding: 30,
    },

    loadingIcon: {
      width: 72,
      height: 72,
      borderRadius: 24,
      justifyContent:
        "center",
      alignItems:
        "center",
    },

    loadingText: {
      marginTop: 13,
      color: "#6B7280",
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
      marginTop: 18,
      backgroundColor:
        "#9333EA",
      paddingHorizontal: 17,
      paddingVertical: 11,
      borderRadius: 13,
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
      height: 315,
      position: "relative",
      backgroundColor:
        "#7C3AED",
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

      paddingHorizontal: 20,
      paddingTop: 24,
      paddingBottom: 25,

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

    categoryBadge: {
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

    statusBadge: {
      flexDirection:
        "row",

      alignItems:
        "center",

      gap: 5,

      borderRadius: 20,

      paddingHorizontal: 11,
      paddingVertical: 8,
    },

    confirmedBadge: {
      backgroundColor:
        "rgba(22,163,74,0.94)",
    },

    cancelledBadge: {
      backgroundColor:
        "rgba(220,38,38,0.94)",
    },

    statusText: {
      color: "#FFFFFF",
      fontWeight: "900",
      fontSize: 10,
    },

    heroLabel: {
      color: "#F5D0FE",
      fontWeight: "900",
      fontSize: 9,
      letterSpacing: 1.3,
    },

    heroTitle: {
      color: "#FFFFFF",
      fontSize: 28,
      lineHeight: 34,
      fontWeight: "900",
      marginTop: 5,
    },

    heroLocation: {
      flexDirection:
        "row",
      alignItems:
        "center",
      gap: 5,
      marginTop: 8,
    },

    heroLocationText: {
      color: "#FFFFFF",
      fontWeight: "700",
      fontSize: 13,
      flex: 1,
    },

    body: {
      padding: 18,
    },

    /* TICKET */

    ticketCard: {
      backgroundColor:
        "#FFFFFF",

      borderRadius: 24,

      paddingTop: 18,
      paddingBottom: 17,

      marginBottom: 16,

      shadowColor:
        "#581C87",

      shadowOpacity: 0.07,
      shadowRadius: 15,

      elevation: 3,

      overflow: "hidden",
    },

    ticketHeader: {
      paddingHorizontal: 18,

      flexDirection:
        "row",

      justifyContent:
        "space-between",

      alignItems:
        "center",
    },

    ticketLabel: {
      color: "#A855F7",
      fontSize: 9,
      fontWeight: "900",
      letterSpacing: 0.9,
    },

    ticketReference: {
      color: "#111827",
      fontSize: 23,
      fontWeight: "900",
      marginTop: 3,
      letterSpacing: 1,
    },

    ticketIcon: {
      width: 50,
      height: 50,
      borderRadius: 16,
      justifyContent:
        "center",
      alignItems:
        "center",
    },

    ticketDivider: {
      position: "relative",
      height: 34,
      justifyContent:
        "center",
      marginVertical: 7,
    },

    dashedLine: {
      borderTopWidth: 1,
      borderStyle:
        "dashed",
      borderColor:
        "#E9D5FF",
      marginHorizontal: 18,
    },

    ticketCutout: {
      position:
        "absolute",

      width: 24,
      height: 24,

      borderRadius: 12,

      backgroundColor:
        "#FAF7FF",

      zIndex: 2,
    },

    leftCutout: {
      left: -12,
    },

    rightCutout: {
      right: -12,
    },

    ticketGrid: {
      paddingHorizontal: 18,

      flexDirection:
        "row",

      flexWrap: "wrap",
    },

    ticketInfo: {
      width: "50%",
      marginBottom: 17,
    },

    ticketInfoLabel: {
      color: "#9CA3AF",
      fontSize: 8,
      fontWeight: "900",
      letterSpacing: 0.6,
    },

    ticketInfoValue: {
      color: "#111827",
      fontSize: 14,
      fontWeight: "900",
      marginTop: 3,
    },

    successValue: {
      color: "#16A34A",
    },

    ticketUser: {
      marginHorizontal: 18,

      borderTopWidth: 1,

      borderTopColor:
        "#F3E8FF",

      paddingTop: 14,

      flexDirection:
        "row",

      alignItems:
        "center",

      gap: 9,
    },

    ticketUserLabel: {
      color: "#9CA3AF",
      fontSize: 8,
      fontWeight: "900",
    },

    ticketUserName: {
      color: "#111827",
      fontWeight: "900",
      marginTop: 2,
    },

    /* INFO */

    infoCard: {
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
      marginBottom: 13,
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

    detailRow: {
      minHeight: 58,

      flexDirection:
        "row",

      alignItems:
        "center",

      borderBottomWidth: 1,

      borderBottomColor:
        "#F9F5FF",
    },

    detailRowLast: {
      borderBottomWidth: 0,
    },

    detailIcon: {
      width: 36,
      height: 36,
      borderRadius: 12,
      backgroundColor:
        "#FAF5FF",
      justifyContent:
        "center",
      alignItems:
        "center",
      marginRight: 10,
    },

    detailLabel: {
      color: "#9CA3AF",
      fontSize: 9,
      fontWeight: "800",
      textTransform:
        "uppercase",
    },

    detailValue: {
      color: "#111827",
      fontSize: 13,
      fontWeight: "800",
      marginTop: 2,
    },

    /* CANCELLED NOTICE */

    cancelledNotice: {
      backgroundColor:
        "#FEF2F2",

      borderRadius: 20,

      borderWidth: 1,
      borderColor:
        "#FECACA",

      padding: 15,

      marginBottom: 16,

      flexDirection:
        "row",

      alignItems:
        "center",

      gap: 11,
    },

    cancelledNoticeIcon: {
      width: 44,
      height: 44,
      borderRadius: 14,
      backgroundColor:
        "#FEE2E2",
      justifyContent:
        "center",
      alignItems:
        "center",
    },

    cancelledNoticeTitle: {
      color: "#991B1B",
      fontWeight: "900",
    },

    cancelledNoticeText: {
      color: "#B91C1C",
      fontSize: 11,
      lineHeight: 17,
      marginTop: 2,
    },

    /* ACTIONS */

    actionsCard: {
      backgroundColor:
        "#FFFFFF",

      borderRadius: 22,

      padding: 18,

      marginBottom: 16,
    },

    actionsTitle: {
      color: "#111827",
      fontSize: 18,
      fontWeight: "900",
    },

    actionsSubtitle: {
      color: "#9CA3AF",
      fontSize: 11,
      lineHeight: 17,
      marginTop: 3,
      marginBottom: 16,
    },

    changeButton: {
      borderWidth: 1,
      borderColor:
        "#E9D5FF",

      backgroundColor:
        "#FCFAFF",

      borderRadius: 17,

      padding: 12,

      flexDirection:
        "row",

      alignItems:
        "center",

      marginBottom: 10,
    },

    changeButtonIcon: {
      width: 43,
      height: 43,
      borderRadius: 14,
      justifyContent:
        "center",
      alignItems:
        "center",
      marginRight: 10,
    },

    changeTitle: {
      color: "#111827",
      fontWeight: "900",
      fontSize: 14,
    },

    changeSubtitle: {
      color: "#9CA3AF",
      fontSize: 10,
      marginTop: 2,
    },

    cancelButton: {
      minHeight: 51,

      borderRadius: 15,

      backgroundColor:
        "#FEF2F2",

      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "center",

      gap: 7,
    },

    cancelButtonText: {
      color: "#DC2626",
      fontWeight: "900",
    },

    /* DELETE */

    deleteSection: {
      backgroundColor:
        "#FFFFFF",

      borderRadius: 20,

      padding: 16,

      flexDirection:
        "row",

      alignItems:
        "center",

      borderWidth: 1,

      borderColor:
        "#FEE2E2",
    },

    deleteTitle: {
      color: "#111827",
      fontWeight: "900",
      fontSize: 13,
    },

    deleteSubtitle: {
      color: "#9CA3AF",
      fontSize: 10,
      lineHeight: 15,
      marginTop: 3,
      maxWidth: 230,
    },

    deleteButton: {
      width: 46,
      height: 46,

      borderRadius: 14,

      backgroundColor:
        "#FEF2F2",

      justifyContent:
        "center",

      alignItems:
        "center",

      marginLeft: 10,
    },
  });