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

import { API_URL } from "../../../src/config/api";
import { useAuth } from "../../../src/context/AuthContext";
import { BookingItem } from "../../../src/types/Booking";
import { getImageUrl } from "../../../src/utils/imageUrl";

export default function EditBookingScreen() {
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
    seats,
    setSeats,
  ] = useState(1);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    saving,
    setSaving,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState("");

  useEffect(() => {
    loadBooking();
  }, [id]);

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

        setSeats(
          data.booking
            .numberOfSeats
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
      if (!booking) {
        return;
      }

      const maxSeats =
        booking.eventId
          .availableSeats +
        booking.numberOfSeats;

      if (
        seats <
        maxSeats
      ) {
        setSeats(
          seats + 1
        );
      }
    };

  const updateBooking =
    async () => {
      setError("");

      if (
        user?.isAdmin ===
        true
      ) {
        setError(
          "Administrator accounts cannot manage user bookings."
        );

        return;
      }

      if (!booking) {
        return;
      }

      if (
        booking.status !==
        "Confirmed"
      ) {
        setError(
          "Only confirmed bookings can be updated."
        );

        return;
      }

      const maxSeats =
        booking.eventId
          .availableSeats +
        booking.numberOfSeats;

      if (
        seats < 1 ||
        seats >
          maxSeats
      ) {
        setError(
          "Please select a valid number of seats."
        );

        return;
      }

      if (
        seats ===
        booking.numberOfSeats
      ) {
        Alert.alert(
          "No Changes",
          "The number of seats has not changed."
        );

        return;
      }

      try {
        setSaving(true);

        const response =
          await fetch(
            `${API_URL}/api/bookings/${booking._id}`,
            {
              method: "PUT",

              headers: {
                "Content-Type":
                  "application/json",

                Authorization:
                  `Bearer ${token}`,
              },

              body:
                JSON.stringify({
                  numberOfSeats:
                    seats,
                }),
            }
          );

        const data =
          await response.json();

        if (!response.ok) {
          setError(
            data.message ||
              "Unable to update booking."
          );

          return;
        }

        Alert.alert(
          "Booking Updated",
          `Your reservation is now for ${seats} seat${
            seats === 1
              ? ""
              : "s"
          }.`,
          [
            {
              text:
                "View Booking",

              onPress: () =>
                router.replace({
                  pathname:
                    "/bookings/[id]",

                  params: {
                    id:
                      booking._id,
                  },
                }),
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
            name="people"
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
          Loading booking...
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
            "Unable to load this booking."}
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

  const imageUrl =
    getImageUrl(
      event.image
    );

  const eventDate =
    new Date(
      event.eventDate
    );

  const category =
    event.category ||
    "Social";

  const currentSeats =
    booking.numberOfSeats;

  const maxSeats =
    event.availableSeats +
    currentSeats;

  const seatDifference =
    seats -
    currentSeats;

  return (
    <ScrollView
      style={
        styles.container
      }
      contentContainerStyle={
        styles.content
      }
      showsVerticalScrollIndicator={
        false
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
              CHANGE BOOKING
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
                styles.heroMeta
              }
            >
              <Ionicons
                name="calendar-outline"
                size={15}
                color="#FFFFFF"
              />

              <Text
                style={
                  styles.heroMetaText
                }
              >
                {eventDate.toLocaleDateString(
                  "en-US",
                  {
                    month:
                      "short",

                    day:
                      "numeric",
                  }
                )}
              </Text>

              <View
                style={
                  styles.metaDot
                }
              />

              <Ionicons
                name="location-outline"
                size={15}
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
        {/* CURRENT BOOKING */}

        <View
          style={
            styles.currentCard
          }
        >
          <LinearGradient
            colors={[
              "#F3E8FF",
              "#FCE7F3",
            ]}
            style={
              styles.currentIcon
            }
          >
            <Ionicons
              name="ticket-outline"
              size={25}
              color="#9333EA"
            />
          </LinearGradient>

          <View
            style={{ flex: 1 }}
          >
            <Text
              style={
                styles.currentLabel
              }
            >
              CURRENT BOOKING
            </Text>

            <Text
              style={
                styles.currentValue
              }
            >
              {currentSeats}{" "}
              seat
              {currentSeats ===
              1
                ? ""
                : "s"}
            </Text>
          </View>

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
              Confirmed
            </Text>
          </View>
        </View>

        {/* AVAILABILITY */}

        <View
          style={
            styles.availabilityCard
          }
        >
          <Text
            style={
              styles.cardLabel
            }
          >
            EVENT CAPACITY
          </Text>

          <View
            style={
              styles.availabilityRow
            }
          >
            <View>
              <Text
                style={
                  styles.availabilityNumber
                }
              >
                {
                  event.availableSeats
                }
              </Text>

              <Text
                style={
                  styles.availabilityText
                }
              >
                additional seats
                currently available
              </Text>
            </View>

            <View
              style={
                styles.maximumBox
              }
            >
              <Text
                style={
                  styles.maximumLabel
                }
              >
                YOUR MAX
              </Text>

              <Text
                style={
                  styles.maximumValue
                }
              >
                {maxSeats}
              </Text>
            </View>
          </View>

          <View
            style={
              styles.infoNotice
            }
          >
            <Ionicons
              name="information-circle-outline"
              size={18}
              color="#7C3AED"
            />

            <Text
              style={
                styles.infoNoticeText
              }
            >
              Your current{" "}
              {currentSeats}{" "}
              reserved seat
              {currentSeats ===
              1
                ? ""
                : "s"}{" "}
              are included when
              calculating the
              maximum you can
              select.
            </Text>
          </View>
        </View>

        {/* SELECTOR */}

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
                size={24}
                color="#9333EA"
              />
            </LinearGradient>

            <View>
              <Text
                style={
                  styles.selectorTitle
                }
              >
                New Seat Count
              </Text>

              <Text
                style={
                  styles.selectorSubtitle
                }
              >
                Adjust your
                reservation
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
                size={28}
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
                maxSeats
              }
              style={[
                styles.seatButton,

                seats >=
                  maxSeats &&
                  styles.seatButtonDisabled,
              ]}
              onPress={
                increaseSeats
              }
            >
              <Ionicons
                name="add"
                size={28}
                color={
                  seats >=
                  maxSeats
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
            You can reserve
            between 1 and{" "}
            {maxSeats} seats.
          </Text>
        </View>

        {/* CHANGE SUMMARY */}

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
              Change Summary
            </Text>

            <Ionicons
              name="swap-horizontal-outline"
              size={23}
              color="#A855F7"
            />
          </View>

          <SummaryRow
            label="Current Seats"
            value={`${currentSeats}`}
          />

          <SummaryRow
            label="New Seats"
            value={`${seats}`}
          />

          <SummaryRow
            label="Difference"
            value={
              seatDifference ===
              0
                ? "No change"
                : seatDifference >
                    0
                ? `+${seatDifference}`
                : `${seatDifference}`
            }
            highlight={
              seatDifference !==
              0
            }
          />

          <SummaryRow
            label="Booking Status"
            value="Confirmed"
            last
            success
          />
        </View>

        {/* EFFECT MESSAGE */}

        {seatDifference !==
          0 && (
          <View
            style={
              seatDifference >
              0
                ? styles.increaseNotice
                : styles.decreaseNotice
            }
          >
            <Ionicons
              name={
                seatDifference >
                0
                  ? "add-circle-outline"
                  : "remove-circle-outline"
              }
              size={21}
              color={
                seatDifference >
                0
                  ? "#7C3AED"
                  : "#EC4899"
              }
            />

            <Text
              style={
                styles.changeNoticeText
              }
            >
              {seatDifference >
              0
                ? `${seatDifference} additional seat${
                    seatDifference ===
                    1
                      ? ""
                      : "s"
                  } will be reserved.`
                : `${Math.abs(
                    seatDifference
                  )} seat${
                    Math.abs(
                      seatDifference
                    ) === 1
                      ? ""
                      : "s"
                  } will be released back to the event.`}
            </Text>
          </View>
        )}

        {/* ERROR */}

        {error ? (
          <View
            style={
              styles.inlineError
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

        {/* UPDATE BUTTON */}

        <Pressable
          disabled={
            saving ||
            seats ===
              currentSeats
          }
          style={({
            pressed,
          }) => [
            styles.saveWrapper,

            pressed &&
              seats !==
                currentSeats &&
              styles.savePressed,

            seats ===
              currentSeats &&
              styles.disabledWrapper,
          ]}
          onPress={
            updateBooking
          }
        >
          <LinearGradient
            colors={
              seats ===
              currentSeats
                ? [
                    "#C4B5FD",
                    "#D8B4FE",
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
              styles.saveButton
            }
          >
            {saving ? (
              <ActivityIndicator
                color="#FFFFFF"
              />
            ) : (
              <>
                <View
                  style={
                    styles.saveIcon
                  }
                >
                  <Ionicons
                    name="checkmark"
                    size={21}
                    color="#FFFFFF"
                  />
                </View>

                <View
                  style={{
                    flex: 1,
                  }}
                >
                  <Text
                    style={
                      styles.saveTitle
                    }
                  >
                    {seats ===
                    currentSeats
                      ? "No Changes"
                      : "Update Booking"}
                  </Text>

                  <Text
                    style={
                      styles.saveSubtitle
                    }
                  >
                    {seats ===
                    currentSeats
                      ? "Adjust the seat count first"
                      : `Save reservation for ${seats} seat${
                          seats ===
                          1
                            ? ""
                            : "s"
                        }`}
                  </Text>
                </View>

                {seats !==
                  currentSeats && (
                  <Ionicons
                    name="arrow-forward"
                    size={22}
                    color="#FFFFFF"
                  />
                )}
              </>
            )}
          </LinearGradient>
        </Pressable>

        <View
          style={{
            height: 20,
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
  success = false,
}: {
  label: string;
  value: string;
  last?: boolean;
  highlight?: boolean;
  success?: boolean;
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

      <Text
        style={[
          styles.summaryValue,

          highlight &&
            styles.summaryHighlight,

          success &&
            styles.summarySuccess,
        ]}
      >
        {value}
      </Text>
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
      width: 72,
      height: 72,
      borderRadius: 24,
      justifyContent:
        "center",
      alignItems:
        "center",
    },

    loadingText: {
      color: "#6B7280",
      marginTop: 13,
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
      borderRadius: 13,
      paddingHorizontal: 17,
      paddingVertical: 11,
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
      height: 305,
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

      borderRadius: 20,

      paddingHorizontal: 12,
      paddingVertical: 8,
    },

    categoryText: {
      color: "#FFFFFF",
      fontSize: 11,
      fontWeight: "900",
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

    heroMeta: {
      flexDirection:
        "row",
      alignItems:
        "center",
      gap: 6,
      marginTop: 8,
    },

    heroMetaText: {
      color: "#FFFFFF",
      fontSize: 12,
      fontWeight: "700",
    },

    heroLocation: {
      color: "#FFFFFF",
      fontSize: 12,
      fontWeight: "700",
      flex: 1,
    },

    metaDot: {
      width: 4,
      height: 4,
      borderRadius: 2,
      backgroundColor:
        "rgba(255,255,255,0.65)",
    },

    body: {
      padding: 18,
    },

    /* CURRENT BOOKING */

    currentCard: {
      backgroundColor:
        "#FFFFFF",

      borderRadius: 22,

      padding: 16,

      flexDirection:
        "row",

      alignItems:
        "center",

      marginBottom: 15,
    },

    currentIcon: {
      width: 52,
      height: 52,
      borderRadius: 17,
      justifyContent:
        "center",
      alignItems:
        "center",
      marginRight: 11,
    },

    currentLabel: {
      color: "#9CA3AF",
      fontSize: 9,
      fontWeight: "900",
      letterSpacing: 0.6,
    },

    currentValue: {
      color: "#111827",
      fontSize: 18,
      fontWeight: "900",
      marginTop: 3,
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
      paddingVertical: 6,
      borderRadius: 10,
    },

    confirmedText: {
      color: "#166534",
      fontWeight: "900",
      fontSize: 9,
    },

    /* AVAILABILITY */

    availabilityCard: {
      backgroundColor:
        "#FFFFFF",

      borderRadius: 22,
      padding: 18,
      marginBottom: 15,
    },

    cardLabel: {
      color: "#A855F7",
      fontSize: 9,
      fontWeight: "900",
      letterSpacing: 0.8,
    },

    availabilityRow: {
      marginTop: 7,

      flexDirection:
        "row",

      justifyContent:
        "space-between",

      alignItems:
        "center",
    },

    availabilityNumber: {
      color: "#111827",
      fontSize: 31,
      fontWeight: "900",
    },

    availabilityText: {
      color: "#6B7280",
      fontSize: 11,
      maxWidth: 200,
      lineHeight: 17,
      marginTop: 1,
    },

    maximumBox: {
      minWidth: 77,
      borderRadius: 15,
      backgroundColor:
        "#F3E8FF",
      padding: 11,
      alignItems:
        "center",
    },

    maximumLabel: {
      color: "#A855F7",
      fontSize: 8,
      fontWeight: "900",
    },

    maximumValue: {
      color: "#7C3AED",
      fontSize: 23,
      fontWeight: "900",
      marginTop: 2,
    },

    infoNotice: {
      marginTop: 16,

      flexDirection:
        "row",

      gap: 7,

      backgroundColor:
        "#F5F3FF",

      borderRadius: 13,

      padding: 11,
    },

    infoNoticeText: {
      color: "#6D28D9",
      fontSize: 10,
      lineHeight: 16,
      flex: 1,
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

      gap: 28,

      marginTop: 26,
    },

    seatButton: {
      width: 58,
      height: 58,

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
      opacity: 0.5,
      backgroundColor:
        "#FAF5FF",
    },

    seatNumberArea: {
      minWidth: 80,
      alignItems:
        "center",
    },

    seatNumber: {
      color: "#111827",
      fontSize: 40,
      fontWeight: "900",
    },

    seatNumberLabel: {
      color: "#A855F7",
      fontSize: 9,
      fontWeight: "900",
      letterSpacing: 1,
    },

    selectorHelp: {
      color: "#9CA3AF",
      fontSize: 10,
      textAlign: "center",
      marginTop: 18,
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
      justifyContent:
        "space-between",
      alignItems:
        "center",
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
      minHeight: 47,

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
    },

    summaryHighlight: {
      color: "#A855F7",
      fontSize: 14,
    },

    summarySuccess: {
      color: "#16A34A",
    },

    /* CHANGE NOTICE */

    increaseNotice: {
      flexDirection:
        "row",
      gap: 8,
      alignItems:
        "center",
      backgroundColor:
        "#F5F3FF",
      borderRadius: 14,
      padding: 12,
      marginBottom: 14,
    },

    decreaseNotice: {
      flexDirection:
        "row",
      gap: 8,
      alignItems:
        "center",
      backgroundColor:
        "#FDF2F8",
      borderRadius: 14,
      padding: 12,
      marginBottom: 14,
    },

    changeNoticeText: {
      color: "#6B7280",
      fontSize: 11,
      lineHeight: 17,
      flex: 1,
      fontWeight: "600",
    },

    /* ERROR */

    inlineError: {
      backgroundColor:
        "#FEF2F2",

      borderRadius: 14,

      padding: 13,

      flexDirection:
        "row",

      alignItems:
        "center",

      gap: 8,

      marginBottom: 14,
    },

    inlineErrorText: {
      color: "#B91C1C",
      flex: 1,
      fontSize: 12,
      lineHeight: 18,
    },

    /* SAVE */

    saveWrapper: {
      borderRadius: 20,
      overflow: "hidden",

      shadowColor:
        "#7C3AED",

      shadowOpacity: 0.2,
      shadowRadius: 14,

      elevation: 6,
    },

    disabledWrapper: {
      shadowOpacity: 0,
      elevation: 0,
    },

    savePressed: {
      opacity: 0.92,

      transform: [
        {
          scale: 0.99,
        },
      ],
    },

    saveButton: {
      minHeight: 72,

      paddingHorizontal: 16,

      flexDirection:
        "row",

      alignItems:
        "center",

      gap: 11,
    },

    saveIcon: {
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

    saveTitle: {
      color: "#FFFFFF",
      fontSize: 16,
      fontWeight: "900",
    },

    saveSubtitle: {
      color:
        "rgba(255,255,255,0.80)",
      fontSize: 10,
      marginTop: 2,
    },
  });