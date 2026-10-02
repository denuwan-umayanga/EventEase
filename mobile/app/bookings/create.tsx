import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import {
  router,
  useLocalSearchParams,
} from "expo-router";
import React, {
  useEffect,
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
import { EventItem } from "../../src/types/Event";
import { getImageUrl } from "../../src/utils/imageUrl";

export default function CreateBookingScreen() {
  const { eventId } =
    useLocalSearchParams<{
      eventId: string;
    }>();

  const {
    token,
    user,
  } = useAuth();

  const [
    event,
    setEvent,
  ] =
    useState<EventItem | null>(
      null
    );

  const [
    seats,
    setSeats,
  ] = useState(1);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    booking,
    setBooking,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState("");

  useEffect(() => {
    loadEvent();
  }, [eventId]);

  const loadEvent =
    async () => {
      try {
        setLoading(true);
        setError("");

        const response =
          await fetch(
            `${API_URL}/api/events/${eventId}`
          );

        const data =
          await response.json();

        if (
          !response.ok
        ) {
          setError(
            data.message ||
              "Unable to load event."
          );

          return;
        }

        setEvent(
          data.event
        );
      } catch (error) {
        setError(
          "Unable to connect to the EventEase server."
        );
      } finally {
        setLoading(false);
      }
    };

  const decreaseSeats =
    () => {
      if (seats > 1) {
        setSeats(
          seats - 1
        );
      }
    };

  const increaseSeats =
    () => {
      if (
        event &&
        seats <
          event.availableSeats
      ) {
        setSeats(
          seats + 1
        );
      }
    };

  const confirmBooking =
    async () => {
      setError("");

      if (
        user?.isAdmin ===
        true
      ) {
        setError(
          "Administrator accounts cannot create bookings."
        );

        return;
      }

      if (!event) {
        setError(
          "Event information is unavailable."
        );

        return;
      }

      if (
        event.availableSeats <=
        0
      ) {
        setError(
          "This event is sold out."
        );

        return;
      }

      if (
        seats < 1 ||
        seats >
          event.availableSeats
      ) {
        setError(
          "Please select a valid number of seats."
        );

        return;
      }

      try {
        setBooking(true);

        const response =
          await fetch(
            `${API_URL}/api/bookings`,
            {
              method:
                "POST",

              headers: {
                "Content-Type":
                  "application/json",

                Authorization:
                  `Bearer ${token}`,
              },

              body:
                JSON.stringify({
                  eventId:
                    event._id,

                  numberOfSeats:
                    seats,
                }),
            }
          );

        const data =
          await response.json();

        if (
          !response.ok
        ) {
          setError(
            data.message ||
              "Unable to create booking."
          );

          return;
        }

        Alert.alert(
          "Booking Confirmed 🎉",
          `Your ${seats} seat${
            seats === 1
              ? ""
              : "s"
          } ${
            seats === 1
              ? "has"
              : "have"
          } been reserved successfully.`,
          [
            {
              text:
                "View Booking",

              onPress:
                () => {
                  router.replace({
                    pathname:
                      "/bookings/[id]",

                    params: {
                      id:
                        data.booking
                          ._id,
                    },
                  });
                },
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
          Preparing your
          booking...
        </Text>
      </View>
    );
  }

  if (
    !event
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
          Event unavailable
        </Text>

        <Text
          style={
            styles.errorText
          }
        >
          {error ||
            "Unable to load this event."}
        </Text>

        <Pressable
          style={
            styles.retryButton
          }
          onPress={
            loadEvent
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

  const imageUrl =
    getImageUrl(
      event.image
    );

  const date =
    new Date(
      event.eventDate
    );

  const category =
    event.category ||
    "Social";

  const soldOut =
    event.availableSeats <=
    0;

  const bookedSeats =
    event.capacity -
    event.availableSeats;

  const occupancyPercentage =
    event.capacity > 0
      ? Math.min(
          100,
          Math.max(
            0,
            (bookedSeats /
              event.capacity) *
              100
          )
        )
      : 0;

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
      {/* EVENT HERO */}

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
              size={74}
              color="rgba(255,255,255,0.30)"
            />
          </LinearGradient>
        )}

        <LinearGradient
          colors={[
            "rgba(17,24,39,0.02)",
            "rgba(17,24,39,0.20)",
            "rgba(17,24,39,0.88)",
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

          <View>
            <Text
              style={
                styles.heroLabel
              }
            >
              YOU'RE BOOKING
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
                styles.heroLocationRow
              }
            >
              <Ionicons
                name="location-outline"
                size={16}
                color="#FFFFFF"
              />

              <Text
                style={
                  styles.heroLocation
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
        {/* EVENT INFO */}

        <View
          style={
            styles.infoCard
          }
        >
          <View
            style={
              styles.infoItem
            }
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
                name="calendar-outline"
                size={21}
                color="#9333EA"
              />
            </LinearGradient>

            <View>
              <Text
                style={
                  styles.infoLabel
                }
              >
                DATE
              </Text>

              <Text
                style={
                  styles.infoValue
                }
              >
                {date.toLocaleDateString(
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
              </Text>
            </View>
          </View>

          <View
            style={
              styles.infoDivider
            }
          />

          <View
            style={
              styles.infoItem
            }
          >
            <LinearGradient
              colors={[
                "#FCE7F3",
                "#F3E8FF",
              ]}
              style={
                styles.infoIcon
              }
            >
              <Ionicons
                name="time-outline"
                size={21}
                color="#EC4899"
              />
            </LinearGradient>

            <View>
              <Text
                style={
                  styles.infoLabel
                }
              >
                TIME
              </Text>

              <Text
                style={
                  styles.infoValue
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
          </View>
        </View>

        {/* AVAILABILITY */}

        <View
          style={
            styles.availabilityCard
          }
        >
          <View
            style={
              styles.availabilityTop
            }
          >
            <View>
              <Text
                style={
                  styles.cardLabel
                }
              >
                AVAILABILITY
              </Text>

              <Text
                style={
                  styles.availabilityTitle
                }
              >
                {soldOut
                  ? "Sold Out"
                  : `${event.availableSeats} seats left`}
              </Text>
            </View>

            <View
              style={[
                styles.seatStatus,

                soldOut
                  ? styles.seatStatusSold
                  : styles.seatStatusAvailable,
              ]}
            >
              <Ionicons
                name={
                  soldOut
                    ? "close-circle"
                    : "checkmark-circle"
                }
                size={16}
                color={
                  soldOut
                    ? "#DC2626"
                    : "#16A34A"
                }
              />

              <Text
                style={[
                  styles.seatStatusText,

                  soldOut
                    ? styles.seatStatusTextSold
                    : styles.seatStatusTextAvailable,
                ]}
              >
                {soldOut
                  ? "Full"
                  : "Open"}
              </Text>
            </View>
          </View>

          <View
            style={
              styles.progressBackground
            }
          >
            <LinearGradient
              colors={[
                "#7C3AED",
                "#EC4899",
              ]}
              style={[
                styles.progressFill,

                {
                  width:
                    `${occupancyPercentage}%`,
                },
              ]}
            />
          </View>

          <View
            style={
              styles.progressLabels
            }
          >
            <Text
              style={
                styles.progressText
              }
            >
              {bookedSeats} booked
            </Text>

            <Text
              style={
                styles.progressText
              }
            >
              {
                event.capacity
              }{" "}
              total
            </Text>
          </View>
        </View>

        {/* SEAT SELECTOR */}

        {!soldOut && (
          <View
            style={
              styles.selectorCard
            }
          >
            <View
              style={
                styles.selectorHeader
              }
            >
              <LinearGradient
                colors={[
                  "#F3E8FF",
                  "#FCE7F3",
                ]}
                style={
                  styles.selectorIcon
                }
              >
                <Ionicons
                  name="people-outline"
                  size={23}
                  color="#9333EA"
                />
              </LinearGradient>

              <View>
                <Text
                  style={
                    styles.selectorTitle
                  }
                >
                  Choose Seats
                </Text>

                <Text
                  style={
                    styles.selectorSubtitle
                  }
                >
                  How many people
                  are attending?
                </Text>
              </View>
            </View>

            <View
              style={
                styles.seatSelector
              }
            >
              <Pressable
                disabled={
                  seats <= 1
                }
                style={[
                  styles.seatButton,

                  seats <= 1 &&
                    styles.seatButtonDisabled,
                ]}
                onPress={
                  decreaseSeats
                }
              >
                <Ionicons
                  name="remove"
                  size={27}
                  color={
                    seats <= 1
                      ? "#C4B5FD"
                      : "#7C3AED"
                  }
                />
              </Pressable>

              <View
                style={
                  styles.seatNumberArea
                }
              >
                <Text
                  style={
                    styles.seatNumber
                  }
                >
                  {seats}
                </Text>

                <Text
                  style={
                    styles.seatNumberLabel
                  }
                >
                  {seats === 1
                    ? "SEAT"
                    : "SEATS"}
                </Text>
              </View>

              <Pressable
                disabled={
                  seats >=
                  event.availableSeats
                }
                style={[
                  styles.seatButton,

                  seats >=
                    event.availableSeats &&
                    styles.seatButtonDisabled,
                ]}
                onPress={
                  increaseSeats
                }
              >
                <Ionicons
                  name="add"
                  size={27}
                  color={
                    seats >=
                    event.availableSeats
                      ? "#C4B5FD"
                      : "#7C3AED"
                  }
                />
              </Pressable>
            </View>

            <Text
              style={
                styles.selectorHelp
              }
            >
              Maximum currently
              available:{" "}
              {
                event.availableSeats
              }{" "}
              seat
              {event.availableSeats ===
              1
                ? ""
                : "s"}
            </Text>
          </View>
        )}

        {/* SUMMARY */}

        {!soldOut && (
          <View
            style={
              styles.summaryCard
            }
          >
            <View
              style={
                styles.summaryHeader
              }
            >
              <Text
                style={
                  styles.summaryTitle
                }
              >
                Booking Summary
              </Text>

              <Ionicons
                name="receipt-outline"
                size={21}
                color="#A855F7"
              />
            </View>

            <SummaryRow
              label="Event"
              value={
                event.title
              }
            />

            <SummaryRow
              label="Category"
              value={
                category
              }
            />

            <SummaryRow
              label="Seats"
              value={
                `${seats}`
              }
            />

            <SummaryRow
              label="Status"
              value="Confirmed"
              last
              highlight
            />
          </View>
        )}

        {/* ERROR */}

        {error ? (
          <View
            style={
              styles.errorBox
            }
          >
            <Ionicons
              name="alert-circle-outline"
              size={20}
              color="#DC2626"
            />

            <Text
              style={
                styles.inlineErrorText
              }
            >
              {error}
            </Text>
          </View>
        ) : null}

        {/* BUTTON */}

        {soldOut ? (
          <View
            style={
              styles.soldOutButton
            }
          >
            <Ionicons
              name="close-circle-outline"
              size={23}
              color="#FFFFFF"
            />

            <Text
              style={
                styles.soldOutButtonText
              }
            >
              Event Sold Out
            </Text>
          </View>
        ) : (
          <Pressable
            disabled={
              booking
            }
            style={({
              pressed,
            }) => [
              styles.confirmWrapper,

              pressed &&
                styles.confirmPressed,
            ]}
            onPress={
              confirmBooking
            }
          >
            <LinearGradient
              colors={[
                "#7C3AED",
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
                styles.confirmButton
              }
            >
              {booking ? (
                <ActivityIndicator
                  color="#FFFFFF"
                />
              ) : (
                <>
                  <View
                    style={
                      styles.confirmIcon
                    }
                  >
                    <Ionicons
                      name="ticket-outline"
                      size={23}
                      color="#FFFFFF"
                    />
                  </View>

                  <View
                    style={
                      styles.confirmTextArea
                    }
                  >
                    <Text
                      style={
                        styles.confirmTitle
                      }
                    >
                      Confirm Booking
                    </Text>

                    <Text
                      style={
                        styles.confirmSubtitle
                      }
                    >
                      Reserve{" "}
                      {seats}{" "}
                      seat
                      {seats ===
                      1
                        ? ""
                        : "s"}
                    </Text>
                  </View>

                  <Ionicons
                    name="arrow-forward"
                    size={22}
                    color="#FFFFFF"
                  />
                </>
              )}
            </LinearGradient>
          </Pressable>
        )}

        <View
          style={{
            height: 18,
          }}
        />
      </View>
    </ScrollView>
  );
}

function SummaryRow({
  label,
  value,
  last = false,
  highlight = false,
}: {
  label: string;
  value: string;
  last?: boolean;
  highlight?: boolean;
}) {
  return (
    <View
      style={[
        styles.summaryRow,

        last &&
          styles.summaryRowLast,
      ]}
    >
      <Text
        style={
          styles.summaryLabel
        }
      >
        {label}
      </Text>

      {highlight ? (
        <View
          style={
            styles.confirmedBadge
          }
        >
          <Ionicons
            name="checkmark-circle"
            size={14}
            color="#16A34A"
          />

          <Text
            style={
              styles.confirmedText
            }
          >
            {value}
          </Text>
        </View>
      ) : (
        <Text
          style={
            styles.summaryValue
          }
          numberOfLines={2}
        >
          {value}
        </Text>
      )}
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
      padding: 30,
      backgroundColor:
        "#FAF7FF",
    },

    loadingIcon: {
      width: 71,
      height: 71,
      borderRadius: 23,
      justifyContent:
        "center",
      alignItems:
        "center",
    },

    loadingText: {
      color: "#6B7280",
      fontWeight: "600",
      marginTop: 13,
    },

    errorIcon: {
      width: 80,
      height: 80,
      borderRadius: 26,
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
      borderRadius: 13,
      paddingVertical: 11,
      paddingHorizontal: 17,
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

    /* HERO */

    hero: {
      height: 310,
      position: "relative",
      backgroundColor:
        "#7C3AED",
    },

    heroImage: {
      width: "100%",
      height: "100%",
      alignItems:
        "center",
      justifyContent:
        "center",
    },

    heroOverlay: {
      ...StyleSheet.absoluteFillObject,
    },

    heroContent: {
      ...StyleSheet.absoluteFillObject,

      paddingHorizontal: 21,
      paddingTop: 24,
      paddingBottom: 25,

      justifyContent:
        "space-between",
    },

    categoryBadge: {
      alignSelf:
        "flex-start",

      flexDirection:
        "row",

      alignItems:
        "center",

      gap: 6,

      backgroundColor:
        "rgba(124,58,237,0.92)",

      paddingHorizontal: 12,
      paddingVertical: 8,

      borderRadius: 20,
    },

    categoryText: {
      color: "#FFFFFF",
      fontWeight: "900",
      fontSize: 11,
    },

    heroLabel: {
      color: "#F5D0FE",
      fontSize: 9,
      fontWeight: "900",
      letterSpacing: 1.3,
    },

    heroTitle: {
      color: "#FFFFFF",
      fontSize: 27,
      lineHeight: 33,
      fontWeight: "900",
      marginTop: 5,
    },

    heroLocationRow: {
      flexDirection:
        "row",
      alignItems:
        "center",
      gap: 5,
      marginTop: 8,
    },

    heroLocation: {
      color: "#FFFFFF",
      fontSize: 13,
      fontWeight: "700",
      flex: 1,
    },

    body: {
      padding: 18,
    },

    /* EVENT INFO */

    infoCard: {
      backgroundColor:
        "#FFFFFF",

      borderRadius: 21,

      padding: 15,

      flexDirection:
        "row",

      alignItems:
        "center",

      marginBottom: 15,
    },

    infoItem: {
      flex: 1,
      flexDirection:
        "row",
      alignItems:
        "center",
      gap: 9,
    },

    infoDivider: {
      width: 1,
      height: 43,
      backgroundColor:
        "#F3E8FF",
      marginHorizontal: 8,
    },

    infoIcon: {
      width: 40,
      height: 40,
      borderRadius: 13,
      alignItems:
        "center",
      justifyContent:
        "center",
    },

    infoLabel: {
      color: "#9CA3AF",
      fontSize: 8,
      fontWeight: "900",
      letterSpacing: 0.5,
    },

    infoValue: {
      color: "#111827",
      fontSize: 12,
      fontWeight: "900",
      marginTop: 2,
    },

    /* AVAILABILITY */

    availabilityCard: {
      backgroundColor:
        "#FFFFFF",

      borderRadius: 21,
      padding: 17,
      marginBottom: 15,
    },

    availabilityTop: {
      flexDirection:
        "row",

      justifyContent:
        "space-between",

      alignItems:
        "center",
    },

    cardLabel: {
      color: "#A855F7",
      fontSize: 9,
      fontWeight: "900",
      letterSpacing: 0.8,
    },

    availabilityTitle: {
      color: "#111827",
      fontSize: 20,
      fontWeight: "900",
      marginTop: 3,
    },

    seatStatus: {
      flexDirection:
        "row",
      alignItems:
        "center",
      gap: 5,
      borderRadius: 12,
      paddingHorizontal: 9,
      paddingVertical: 7,
    },

    seatStatusAvailable: {
      backgroundColor:
        "#DCFCE7",
    },

    seatStatusSold: {
      backgroundColor:
        "#FEE2E2",
    },

    seatStatusText: {
      fontSize: 10,
      fontWeight: "900",
    },

    seatStatusTextAvailable: {
      color: "#166534",
    },

    seatStatusTextSold: {
      color: "#B91C1C",
    },

    progressBackground: {
      height: 8,
      backgroundColor:
        "#F3E8FF",

      borderRadius: 20,

      overflow: "hidden",
      marginTop: 17,
    },

    progressFill: {
      height: "100%",
      borderRadius: 20,
    },

    progressLabels: {
      flexDirection:
        "row",

      justifyContent:
        "space-between",

      marginTop: 8,
    },

    progressText: {
      color: "#9CA3AF",
      fontSize: 10,
      fontWeight: "700",
    },

    /* SELECTOR */

    selectorCard: {
      backgroundColor:
        "#FFFFFF",

      borderRadius: 22,

      padding: 18,

      marginBottom: 15,
    },

    selectorHeader: {
      flexDirection:
        "row",
      alignItems:
        "center",
    },

    selectorIcon: {
      width: 47,
      height: 47,
      borderRadius: 15,
      justifyContent:
        "center",
      alignItems:
        "center",
      marginRight: 11,
    },

    selectorTitle: {
      color: "#111827",
      fontSize: 17,
      fontWeight: "900",
    },

    selectorSubtitle: {
      color: "#9CA3AF",
      fontSize: 11,
      marginTop: 2,
    },

    seatSelector: {
      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "center",

      gap: 27,

      marginTop: 25,
    },

    seatButton: {
      width: 57,
      height: 57,

      borderRadius: 18,

      backgroundColor:
        "#F3E8FF",

      borderWidth: 1,
      borderColor:
        "#E9D5FF",

      justifyContent:
        "center",

      alignItems:
        "center",
    },

    seatButtonDisabled: {
      backgroundColor:
        "#FAF5FF",
      opacity: 0.55,
    },

    seatNumberArea: {
      minWidth: 75,
      alignItems:
        "center",
    },

    seatNumber: {
      color: "#111827",
      fontSize: 39,
      fontWeight: "900",
    },

    seatNumberLabel: {
      color: "#A855F7",
      fontSize: 9,
      fontWeight: "900",
      letterSpacing: 1,
      marginTop: -2,
    },

    selectorHelp: {
      color: "#9CA3AF",
      fontSize: 10,
      textAlign: "center",
      marginTop: 19,
    },

    /* SUMMARY */

    summaryCard: {
      backgroundColor:
        "#FFFFFF",

      borderRadius: 22,

      padding: 18,

      marginBottom: 15,
    },

    summaryHeader: {
      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "space-between",

      paddingBottom: 12,

      borderBottomWidth: 1,

      borderBottomColor:
        "#F3E8FF",
    },

    summaryTitle: {
      color: "#111827",
      fontSize: 16,
      fontWeight: "900",
    },

    summaryRow: {
      minHeight: 46,

      flexDirection:
        "row",

      justifyContent:
        "space-between",

      alignItems:
        "center",

      borderBottomWidth: 1,

      borderBottomColor:
        "#F9F5FF",
    },

    summaryRowLast: {
      borderBottomWidth: 0,
    },

    summaryLabel: {
      color: "#9CA3AF",
      fontSize: 12,
      fontWeight: "700",
    },

    summaryValue: {
      color: "#111827",
      fontSize: 12,
      fontWeight: "900",
      textAlign: "right",
      maxWidth: "65%",
    },

    confirmedBadge: {
      flexDirection:
        "row",

      alignItems:
        "center",

      gap: 4,

      backgroundColor:
        "#DCFCE7",

      paddingHorizontal: 8,
      paddingVertical: 5,

      borderRadius: 9,
    },

    confirmedText: {
      color: "#166534",
      fontSize: 10,
      fontWeight: "900",
    },

    /* ERROR */

    errorBox: {
      flexDirection:
        "row",

      alignItems:
        "center",

      gap: 8,

      backgroundColor:
        "#FEF2F2",

      borderRadius: 14,

      padding: 13,

      marginBottom: 14,
    },

    inlineErrorText: {
      color: "#B91C1C",
      flex: 1,
      fontSize: 12,
      lineHeight: 18,
    },

    /* CONFIRM */

    confirmWrapper: {
      borderRadius: 20,
      overflow: "hidden",

      shadowColor:
        "#7C3AED",

      shadowOpacity: 0.2,
      shadowRadius: 14,

      elevation: 6,
    },

    confirmPressed: {
      opacity: 0.92,

      transform: [
        {
          scale: 0.99,
        },
      ],
    },

    confirmButton: {
      minHeight: 72,

      paddingHorizontal: 16,

      flexDirection:
        "row",

      alignItems:
        "center",

      gap: 11,
    },

    confirmIcon: {
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

    confirmTextArea: {
      flex: 1,
    },

    confirmTitle: {
      color: "#FFFFFF",
      fontSize: 16,
      fontWeight: "900",
    },

    confirmSubtitle: {
      color: "#FCE7F3",
      fontSize: 11,
      marginTop: 2,
    },

    soldOutButton: {
      minHeight: 65,

      borderRadius: 19,

      backgroundColor:
        "#6B7280",

      flexDirection:
        "row",

      justifyContent:
        "center",

      alignItems:
        "center",

      gap: 8,
    },

    soldOutButtonText: {
      color: "#FFFFFF",
      fontWeight: "900",
      fontSize: 16,
    },
  });