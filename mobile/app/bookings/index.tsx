import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useFocusEffect } from "@react-navigation/native";
import { router } from "expo-router";
import React, {
  useCallback,
  useMemo,
  useState,
} from "react";
import {
  ActivityIndicator,
  Image,
  Pressable,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { API_URL } from "../../src/config/api";
import { useAuth } from "../../src/context/AuthContext";
import { BookingItem } from "../../src/types/Booking";
import { getImageUrl } from "../../src/utils/imageUrl";

export default function MyBookingsScreen() {
  const {
    token,
    user,
  } = useAuth();

  const [
    bookings,
    setBookings,
  ] = useState<BookingItem[]>([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    refreshing,
    setRefreshing,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState("");

  const loadBookings = async (
    showLoader = true
  ) => {
    try {
      if (showLoader) {
        setLoading(true);
      }

      setError("");

      const response =
        await fetch(
          `${API_URL}/api/bookings/my`,
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
            "Unable to load bookings."
        );

        return;
      }

      setBookings(
        data.bookings || []
      );
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
    }, [token])
  );

  const handleRefresh = () => {
    setRefreshing(true);
    loadBookings(false);
  };

  const confirmedCount =
    useMemo(
      () =>
        bookings.filter(
          (booking) =>
            booking.status ===
            "Confirmed"
        ).length,
      [bookings]
    );

  const cancelledCount =
    useMemo(
      () =>
        bookings.filter(
          (booking) =>
            booking.status ===
            "Cancelled"
        ).length,
      [bookings]
    );

  if (loading) {
    return (
      <View style={styles.center}>
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
            size={32}
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
          bookings...
        </Text>
      </View>
    );
  }

  return (
    <SafeAreaView
      style={
        styles.container
      }
    >
      <ScrollView
        showsVerticalScrollIndicator={
          false
        }
        refreshControl={
          <RefreshControl
            refreshing={
              refreshing
            }
            onRefresh={
              handleRefresh
            }
            tintColor="#A855F7"
          />
        }
        contentContainerStyle={
          styles.content
        }
      >
        {/* HEADER */}

        <LinearGradient
          colors={[
            "#6D28D9",
            "#A855F7",
            "#EC4899",
          ]}
          start={{
            x: 0,
            y: 0,
          }}
          end={{
            x: 1,
            y: 1,
          }}
          style={
            styles.hero
          }
        >
          <View
            style={
              styles.heroTop
            }
          >
            <View>
              <Text
                style={
                  styles.heroLabel
                }
              >
                YOUR TICKETS
              </Text>

              <Text
                style={
                  styles.heroTitle
                }
              >
                My Bookings
              </Text>

              <Text
                style={
                  styles.heroSubtitle
                }
              >
                Keep track of your
                upcoming event
                reservations.
              </Text>
            </View>

            <View
              style={
                styles.heroIcon
              }
            >
              <Ionicons
                name="ticket-outline"
                size={28}
                color="#FFFFFF"
              />
            </View>
          </View>

          <Text
            style={
              styles.welcomeText
            }
          >
            {user?.name
              ? `Booked by ${user.name}`
              : "Your EventEase bookings"}
          </Text>

          <View
            style={
              styles.statsRow
            }
          >
            <StatBox
              number={
                bookings.length
              }
              label="Total"
            />

            <StatBox
              number={
                confirmedCount
              }
              label="Confirmed"
            />

            <StatBox
              number={
                cancelledCount
              }
              label="Cancelled"
            />
          </View>
        </LinearGradient>

        {/* ERROR */}

        {error ? (
          <View
            style={
              styles.errorCard
            }
          >
            <View
              style={
                styles.errorIcon
              }
            >
              <Ionicons
                name="cloud-offline-outline"
                size={27}
                color="#DC2626"
              />
            </View>

            <View
              style={
                styles.errorTextArea
              }
            >
              <Text
                style={
                  styles.errorTitle
                }
              >
                Unable to load
                bookings
              </Text>

              <Text
                style={
                  styles.errorMessage
                }
              >
                {error}
              </Text>
            </View>

            <Pressable
              onPress={() =>
                loadBookings()
              }
            >
              <Ionicons
                name="refresh"
                size={23}
                color="#A855F7"
              />
            </Pressable>
          </View>
        ) : null}

        {/* EMPTY */}

        {!error &&
          bookings.length ===
            0 && (
            <View
              style={
                styles.emptyCard
              }
            >
              <LinearGradient
                colors={[
                  "#F3E8FF",
                  "#FCE7F3",
                ]}
                style={
                  styles.emptyIcon
                }
              >
                <Ionicons
                  name="ticket-outline"
                  size={40}
                  color="#9333EA"
                />
              </LinearGradient>

              <Text
                style={
                  styles.emptyTitle
                }
              >
                No bookings yet
              </Text>

              <Text
                style={
                  styles.emptyText
                }
              >
                Discover an event
                and reserve your
                first seat.
              </Text>

              <Pressable
                onPress={() =>
                  router.push(
                    "/home"
                  )
                }
              >
                <LinearGradient
                  colors={[
                    "#7C3AED",
                    "#EC4899",
                  ]}
                  style={
                    styles.exploreButton
                  }
                >
                  <Ionicons
                    name="sparkles-outline"
                    size={18}
                    color="#FFFFFF"
                  />

                  <Text
                    style={
                      styles.exploreText
                    }
                  >
                    Explore Events
                  </Text>
                </LinearGradient>
              </Pressable>
            </View>
          )}

        {/* BOOKING LIST */}

        {!error &&
          bookings.length >
            0 && (
            <>
              <View
                style={
                  styles.sectionHeader
                }
              >
                <View>
                  <Text
                    style={
                      styles.sectionTitle
                    }
                  >
                    Your Reservations
                  </Text>

                  <Text
                    style={
                      styles.sectionSubtitle
                    }
                  >
                    Tap a booking to
                    view or manage it
                  </Text>
                </View>

                <View
                  style={
                    styles.countBadge
                  }
                >
                  <Text
                    style={
                      styles.countText
                    }
                  >
                    {
                      bookings.length
                    }
                  </Text>
                </View>
              </View>

              {bookings.map(
                (booking) => (
                  <BookingCard
                    key={
                      booking._id
                    }
                    booking={
                      booking
                    }
                    onPress={() =>
                      router.push({
                        pathname:
                          "/bookings/[id]",

                        params: {
                          id:
                            booking._id,
                        },
                      })
                    }
                  />
                )
              )}
            </>
          )}

        <View
          style={{
            height: 28,
          }}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

function StatBox({
  number,
  label,
}: {
  number: number;
  label: string;
}) {
  return (
    <View
      style={
        styles.statBox
      }
    >
      <Text
        style={
          styles.statNumber
        }
      >
        {number}
      </Text>

      <Text
        style={
          styles.statLabel
        }
      >
        {label}
      </Text>
    </View>
  );
}

function BookingCard({
  booking,
  onPress,
}: {
  booking: BookingItem;
  onPress: () => void;
}) {
  const event =
    booking.eventId;

  const imageUrl =
    getImageUrl(
      event?.image
    );

  const date =
    event?.eventDate
      ? new Date(
          event.eventDate
        )
      : null;

  const cancelled =
    booking.status ===
    "Cancelled";

  const category =
    event?.category ||
    "Social";

  return (
    <Pressable
      style={({
        pressed,
      }) => [
        styles.bookingCard,

        pressed &&
          styles.bookingCardPressed,
      ]}
      onPress={onPress}
    >
      {/* IMAGE */}

      <View
        style={
          styles.imageArea
        }
      >
        {imageUrl ? (
          <Image
            source={{
              uri: imageUrl,
            }}
            style={
              styles.image
            }
            resizeMode="cover"
          />
        ) : (
          <LinearGradient
            colors={[
              "#7C3AED",
              "#EC4899",
            ]}
            style={
              styles.image
            }
          >
            <Ionicons
              name="calendar"
              size={34}
              color="rgba(255,255,255,0.45)"
            />
          </LinearGradient>
        )}

        {date && (
          <View
            style={
              styles.dateBadge
            }
          >
            <Text
              style={
                styles.dateMonth
              }
            >
              {date
                .toLocaleDateString(
                  "en-US",
                  {
                    month:
                      "short",
                  }
                )
                .toUpperCase()}
            </Text>

            <Text
              style={
                styles.dateDay
              }
            >
              {
                date.getDate()
              }
            </Text>
          </View>
        )}
      </View>

      {/* CONTENT */}

      <View
        style={
          styles.cardContent
        }
      >
        <View
          style={
            styles.cardTopRow
          }
        >
          <Text
            style={
              styles.category
            }
          >
            {category}
          </Text>

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
              size={13}
              color={
                cancelled
                  ? "#DC2626"
                  : "#16A34A"
              }
            />

            <Text
              style={[
                styles.statusText,

                cancelled
                  ? styles.cancelledText
                  : styles.confirmedText,
              ]}
            >
              {
                booking.status
              }
            </Text>
          </View>
        </View>

        <Text
          style={
            styles.eventTitle
          }
          numberOfLines={2}
        >
          {event?.title ||
            "Event unavailable"}
        </Text>

        {event && (
          <>
            <View
              style={
                styles.metaRow
              }
            >
              <Ionicons
                name="location-outline"
                size={15}
                color="#A855F7"
              />

              <Text
                style={
                  styles.metaText
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

            {date && (
              <View
                style={
                  styles.metaRow
                }
              >
                <Ionicons
                  name="time-outline"
                  size={15}
                  color="#EC4899"
                />

                <Text
                  style={
                    styles.metaText
                  }
                >
                  {date.toLocaleTimeString(
                    "en-US",
                    {
                      hour:
                        "2-digit",

                      minute:
                        "2-digit",
                    }
                  )}
                </Text>
              </View>
            )}
          </>
        )}

        <View
          style={
            styles.cardFooter
          }
        >
          <View
            style={
              styles.seatPill
            }
          >
            <Ionicons
              name="people-outline"
              size={15}
              color="#7C3AED"
            />

            <Text
              style={
                styles.seatText
              }
            >
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

          <View
            style={
              styles.arrowButton
            }
          >
            <Ionicons
              name="chevron-forward"
              size={18}
              color="#9333EA"
            />
          </View>
        </View>
      </View>
    </Pressable>
  );
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

    /* HEADER */

    hero: {
      paddingHorizontal: 21,
      paddingTop: 27,
      paddingBottom: 27,

      borderBottomLeftRadius:
        34,

      borderBottomRightRadius:
        34,

      marginBottom: 22,
    },

    heroTop: {
      flexDirection:
        "row",

      justifyContent:
        "space-between",

      alignItems:
        "flex-start",
    },

    heroLabel: {
      color: "#F5D0FE",
      fontSize: 10,
      fontWeight: "900",
      letterSpacing: 1.3,
    },

    heroTitle: {
      color: "#FFFFFF",
      fontSize: 29,
      fontWeight: "900",
      marginTop: 5,
    },

    heroSubtitle: {
      color: "#FCE7F3",
      maxWidth: 270,
      marginTop: 6,
      lineHeight: 20,
    },

    heroIcon: {
      width: 50,
      height: 50,
      borderRadius: 16,
      backgroundColor:
        "rgba(255,255,255,0.16)",
      justifyContent:
        "center",
      alignItems:
        "center",
    },

    welcomeText: {
      color:
        "rgba(255,255,255,0.78)",
      marginTop: 20,
      fontSize: 12,
      fontWeight: "600",
    },

    statsRow: {
      flexDirection:
        "row",
      gap: 9,
      marginTop: 14,
    },

    statBox: {
      flex: 1,

      backgroundColor:
        "rgba(255,255,255,0.15)",

      borderRadius: 16,

      paddingVertical: 13,

      alignItems:
        "center",
    },

    statNumber: {
      color: "#FFFFFF",
      fontSize: 21,
      fontWeight: "900",
    },

    statLabel: {
      color: "#FCE7F3",
      fontSize: 9,
      fontWeight: "700",
      marginTop: 2,
    },

    /* SECTION */

    sectionHeader: {
      paddingHorizontal: 20,
      marginBottom: 14,

      flexDirection:
        "row",

      justifyContent:
        "space-between",

      alignItems:
        "center",
    },

    sectionTitle: {
      color: "#111827",
      fontSize: 21,
      fontWeight: "900",
    },

    sectionSubtitle: {
      color: "#9CA3AF",
      fontSize: 11,
      marginTop: 3,
    },

    countBadge: {
      width: 38,
      height: 38,
      borderRadius: 13,
      backgroundColor:
        "#F3E8FF",
      alignItems:
        "center",
      justifyContent:
        "center",
    },

    countText: {
      color: "#9333EA",
      fontWeight: "900",
    },

    /* BOOKING CARD */

    bookingCard: {
      marginHorizontal: 20,
      marginBottom: 15,

      backgroundColor:
        "#FFFFFF",

      borderRadius: 23,

      overflow: "hidden",

      shadowColor:
        "#581C87",

      shadowOpacity: 0.06,
      shadowRadius: 14,

      shadowOffset: {
        width: 0,
        height: 6,
      },

      elevation: 3,
    },

    bookingCardPressed: {
      opacity: 0.93,

      transform: [
        {
          scale: 0.99,
        },
      ],
    },

    imageArea: {
      height: 165,
      position: "relative",
      backgroundColor:
        "#A855F7",
    },

    image: {
      width: "100%",
      height: "100%",
      justifyContent:
        "center",
      alignItems:
        "center",
    },

    dateBadge: {
      position: "absolute",
      top: 12,
      left: 12,

      width: 46,

      backgroundColor:
        "rgba(255,255,255,0.95)",

      borderRadius: 13,

      paddingVertical: 6,

      alignItems:
        "center",
    },

    dateMonth: {
      color: "#EC4899",
      fontSize: 9,
      fontWeight: "900",
    },

    dateDay: {
      color: "#111827",
      fontSize: 19,
      fontWeight: "900",
      marginTop: 1,
    },

    cardContent: {
      padding: 16,
    },

    cardTopRow: {
      flexDirection:
        "row",

      justifyContent:
        "space-between",

      alignItems:
        "center",

      marginBottom: 7,
    },

    category: {
      color: "#A855F7",
      fontSize: 10,
      fontWeight: "900",
      letterSpacing: 0.7,
      textTransform:
        "uppercase",
    },

    statusBadge: {
      flexDirection:
        "row",

      alignItems:
        "center",

      gap: 4,

      borderRadius: 10,

      paddingHorizontal: 8,
      paddingVertical: 5,
    },

    confirmedBadge: {
      backgroundColor:
        "#DCFCE7",
    },

    cancelledBadge: {
      backgroundColor:
        "#FEE2E2",
    },

    statusText: {
      fontSize: 9,
      fontWeight: "900",
    },

    confirmedText: {
      color: "#166534",
    },

    cancelledText: {
      color: "#B91C1C",
    },

    eventTitle: {
      color: "#111827",
      fontSize: 19,
      lineHeight: 24,
      fontWeight: "900",
      marginBottom: 10,
    },

    metaRow: {
      flexDirection:
        "row",
      alignItems:
        "center",
      gap: 6,
      marginBottom: 6,
    },

    metaText: {
      color: "#6B7280",
      fontSize: 12,
      flexShrink: 1,
    },

    cardFooter: {
      marginTop: 8,

      paddingTop: 13,

      borderTopWidth: 1,

      borderTopColor:
        "#F3E8FF",

      flexDirection:
        "row",

      justifyContent:
        "space-between",

      alignItems:
        "center",
    },

    seatPill: {
      flexDirection:
        "row",

      alignItems:
        "center",

      gap: 5,

      backgroundColor:
        "#F3E8FF",

      borderRadius: 12,

      paddingHorizontal: 9,
      paddingVertical: 7,
    },

    seatText: {
      color: "#7C3AED",
      fontSize: 10,
      fontWeight: "900",
    },

    arrowButton: {
      width: 34,
      height: 34,
      borderRadius: 11,
      backgroundColor:
        "#FAF5FF",
      justifyContent:
        "center",
      alignItems:
        "center",
    },

    /* ERROR */

    errorCard: {
      marginHorizontal: 20,
      marginBottom: 20,

      backgroundColor:
        "#FFFFFF",

      borderRadius: 19,

      padding: 14,

      borderWidth: 1,

      borderColor:
        "#FECACA",

      flexDirection:
        "row",

      alignItems:
        "center",
    },

    errorIcon: {
      width: 45,
      height: 45,
      borderRadius: 14,
      backgroundColor:
        "#FEF2F2",
      justifyContent:
        "center",
      alignItems:
        "center",
    },

    errorTextArea: {
      flex: 1,
      marginLeft: 11,
      marginRight: 8,
    },

    errorTitle: {
      color: "#111827",
      fontWeight: "900",
    },

    errorMessage: {
      color: "#6B7280",
      fontSize: 11,
      marginTop: 2,
    },

    /* EMPTY */

    emptyCard: {
      marginHorizontal: 20,

      backgroundColor:
        "#FFFFFF",

      borderRadius: 25,

      padding: 38,

      alignItems:
        "center",

      shadowColor:
        "#581C87",

      shadowOpacity: 0.05,
      shadowRadius: 13,

      elevation: 2,
    },

    emptyIcon: {
      width: 80,
      height: 80,

      borderRadius: 26,

      justifyContent:
        "center",

      alignItems:
        "center",
    },

    emptyTitle: {
      color: "#111827",
      fontSize: 21,
      fontWeight: "900",
      marginTop: 15,
    },

    emptyText: {
      color: "#6B7280",
      textAlign: "center",
      lineHeight: 20,
      marginTop: 6,
      maxWidth: 220,
    },

    exploreButton: {
      marginTop: 19,

      height: 48,

      paddingHorizontal: 17,

      borderRadius: 15,

      flexDirection:
        "row",

      alignItems:
        "center",

      gap: 7,
    },

    exploreText: {
      color: "#FFFFFF",
      fontWeight: "900",
      fontSize: 13,
    },
  });