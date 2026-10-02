import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
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
  TextInput,
  View,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";

import { API_URL } from "../src/config/api";
import { useAuth } from "../src/context/AuthContext";
import {
  EventCategory,
  EventItem,
} from "../src/types/Event";
import { getImageUrl } from "../src/utils/imageUrl";

type CategoryFilter =
  | "All"
  | EventCategory;

const categories: {
  name: CategoryFilter;
  icon: any;
}[] = [
  {
    name: "All",
    icon: "sparkles-outline",
  },
  {
    name: "Music",
    icon: "musical-notes-outline",
  },
  {
    name: "Tech",
    icon: "hardware-chip-outline",
  },
  {
    name: "Business",
    icon: "briefcase-outline",
  },
  {
    name: "Sports",
    icon: "football-outline",
  },
  {
    name: "Social",
    icon: "people-outline",
  },
  {
    name: "Workshop",
    icon: "construct-outline",
  },
];

export default function HomeScreen() {
  const {
    user,
    signOut,
  } = useAuth();

  const [
    events,
    setEvents,
  ] = useState<EventItem[]>([]);

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

  const [
    search,
    setSearch,
  ] = useState("");

  const [
    selectedCategory,
    setSelectedCategory,
  ] =
    useState<CategoryFilter>(
      "All"
    );

  const loadEvents = async (
    showLoader = true
  ) => {
    try {
      if (showLoader) {
        setLoading(true);
      }

      setError("");

      const response =
        await fetch(
          `${API_URL}/api/events`
        );

      const data =
        await response.json();

      if (!response.ok) {
        setError(
          data.message ||
            "Unable to load events."
        );

        return;
      }

      setEvents(
        data.events || []
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
      loadEvents();
    }, [])
  );

  const handleRefresh = () => {
    setRefreshing(true);
    loadEvents(false);
  };

  const handleLogout =
    async () => {
      await signOut();

      router.replace(
        "/login"
      );
    };

  const normalizedEvents =
    useMemo(() => {
      return events.map(
        (event) => ({
          ...event,

          category:
            event.category ||
            ("Social" as EventCategory),
        })
      );
    }, [events]);

  const filteredEvents =
    useMemo(() => {
      const query =
        search
          .trim()
          .toLowerCase();

      return normalizedEvents.filter(
        (event) => {
          const matchesCategory =
            selectedCategory ===
              "All" ||
            event.category ===
              selectedCategory;

          const matchesSearch =
            !query ||
            event.title
              .toLowerCase()
              .includes(query) ||
            event.location
              .toLowerCase()
              .includes(query) ||
            event.category
              .toLowerCase()
              .includes(query) ||
            event.description
              .toLowerCase()
              .includes(query);

          return (
            matchesCategory &&
            matchesSearch
          );
        }
      );
    }, [
      normalizedEvents,
      search,
      selectedCategory,
    ]);

  const featuredEvent =
    filteredEvents.length > 0
      ? filteredEvents[0]
      : null;

  const upcomingEvents =
    featuredEvent
      ? filteredEvents.slice(1)
      : filteredEvents;

  if (loading) {
    return (
      <SafeAreaView
        style={
          styles.loadingScreen
        }
      >
        <LinearGradient
          colors={[
            "#7C3AED",
            "#A855F7",
            "#EC4899",
          ]}
          style={
            styles.loadingLogo
          }
        >
          <Ionicons
            name="ticket"
            size={34}
            color="#FFFFFF"
          />
        </LinearGradient>

        <ActivityIndicator
          size="large"
          color="#A855F7"
          style={{
            marginTop: 24,
          }}
        />

        <Text
          style={
            styles.loadingText
          }
        >
          Finding amazing
          events...
        </Text>
      </SafeAreaView>
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
          styles.scrollContent
        }
      >
        {/* HERO */}
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
          style={styles.hero}
        >
          <View
            style={
              styles.heroTop
            }
          >
            <View
              style={
                styles.greetingArea
              }
            >
              <Text
                style={
                  styles.welcomeLabel
                }
              >
                WELCOME BACK
              </Text>

              <Text
                style={
                  styles.greeting
                }
              >
                Hello,{" "}
                {user?.name
                  ?.split(" ")[0] ||
                  "there"}{" "}
                👋
              </Text>

              <Text
                style={
                  styles.heroSubtitle
                }
              >
                Discover your
                next unforgettable
                experience.
              </Text>
            </View>

            <Pressable
              style={({
                pressed,
              }) => [
                styles.logoutButton,

                pressed &&
                  styles.pressed,
              ]}
              onPress={
                handleLogout
              }
            >
              <Ionicons
                name="log-out-outline"
                size={22}
                color="#FFFFFF"
              />
            </Pressable>
          </View>

          {/* SEARCH */}
          <View
            style={
              styles.searchBox
            }
          >
            <Ionicons
              name="search-outline"
              size={21}
              color="#7C3AED"
            />

            <TextInput
              style={
                styles.searchInput
              }
              placeholder="Search events..."
              placeholderTextColor="#9CA3AF"
              value={search}
              onChangeText={
                setSearch
              }
            />

            {search.length >
              0 && (
              <Pressable
                onPress={() =>
                  setSearch("")
                }
              >
                <Ionicons
                  name="close-circle"
                  size={20}
                  color="#C4B5FD"
                />
              </Pressable>
            )}
          </View>
        </LinearGradient>

        {/* MY BOOKINGS */}
        <Pressable
          style={({
            pressed,
          }) => [
            styles.bookingShortcut,

            pressed &&
              styles.cardPressed,
          ]}
          onPress={() =>
            router.push(
              "/bookings" as any
            )
          }
        >
          <LinearGradient
            colors={[
              "#F3E8FF",
              "#FCE7F3",
            ]}
            style={
              styles.bookingShortcutIcon
            }
          >
            <Ionicons
              name="ticket-outline"
              size={25}
              color="#9333EA"
            />
          </LinearGradient>

          <View
            style={
              styles.bookingShortcutText
            }
          >
            <Text
              style={
                styles.bookingShortcutTitle
              }
            >
              My Bookings
            </Text>

            <Text
              style={
                styles.bookingShortcutSubtitle
              }
            >
              View and manage
              your reservations
            </Text>
          </View>

          <View
            style={
              styles.arrowCircle
            }
          >
            <Ionicons
              name="chevron-forward"
              size={19}
              color="#9333EA"
            />
          </View>
        </Pressable>

        {/* CATEGORIES */}
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
              Explore
            </Text>

            <Text
              style={
                styles.sectionSubtitle
              }
            >
              Find something
              you'll love
            </Text>
          </View>

          <View
            style={
              styles.eventCountBadge
            }
          >
            <Text
              style={
                styles.eventCountText
              }
            >
              {
                filteredEvents.length
              }
            </Text>
          </View>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={
            false
          }
          contentContainerStyle={
            styles.categoryRow
          }
        >
          {categories.map(
            (category) => {
              const selected =
                selectedCategory ===
                category.name;

              return (
                <Pressable
                  key={
                    category.name
                  }
                  onPress={() =>
                    setSelectedCategory(
                      category.name
                    )
                  }
                >
                  {selected ? (
                    <LinearGradient
                      colors={[
                        "#7C3AED",
                        "#EC4899",
                      ]}
                      style={
                        styles.categorySelected
                      }
                    >
                      <Ionicons
                        name={
                          category.icon
                        }
                        size={17}
                        color="#FFFFFF"
                      />

                      <Text
                        style={
                          styles.categorySelectedText
                        }
                      >
                        {
                          category.name
                        }
                      </Text>
                    </LinearGradient>
                  ) : (
                    <View
                      style={
                        styles.categoryNormal
                      }
                    >
                      <Ionicons
                        name={
                          category.icon
                        }
                        size={17}
                        color="#7C3AED"
                      />

                      <Text
                        style={
                          styles.categoryNormalText
                        }
                      >
                        {
                          category.name
                        }
                      </Text>
                    </View>
                  )}
                </Pressable>
              );
            }
          )}
        </ScrollView>

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
                size={28}
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
                events
              </Text>

              <Text
                style={
                  styles.errorText
                }
              >
                {error}
              </Text>
            </View>

            <Pressable
              onPress={() =>
                loadEvents()
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

        {/* NO SEARCH RESULTS */}
        {!error &&
          filteredEvents
            .length === 0 && (
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
                  name="search-outline"
                  size={37}
                  color="#9333EA"
                />
              </LinearGradient>

              <Text
                style={
                  styles.emptyTitle
                }
              >
                No events found
              </Text>

              <Text
                style={
                  styles.emptyText
                }
              >
                Try another
                category or search
                phrase.
              </Text>

              <Pressable
                style={
                  styles.clearFiltersButton
                }
                onPress={() => {
                  setSearch("");
                  setSelectedCategory(
                    "All"
                  );
                }}
              >
                <Text
                  style={
                    styles.clearFiltersText
                  }
                >
                  Clear Filters
                </Text>
              </Pressable>
            </View>
          )}

        {/* FEATURED EVENT */}
        {!error &&
          featuredEvent && (
            <>
              <View
                style={
                  styles.titleRow
                }
              >
                <Text
                  style={
                    styles.contentHeading
                  }
                >
                  Featured Event
                </Text>

                <Ionicons
                  name="sparkles"
                  size={20}
                  color="#EC4899"
                />
              </View>

              <FeaturedEventCard
                event={
                  featuredEvent
                }
                onPress={() =>
                  router.push({
                    pathname:
                      "/events/[id]",

                    params: {
                      id:
                        featuredEvent._id,
                    },
                  })
                }
              />
            </>
          )}

        {/* UPCOMING */}
        {!error &&
          upcomingEvents.length >
            0 && (
            <>
              <View
                style={[
                  styles.titleRow,
                  {
                    marginTop:
                      29,
                  },
                ]}
              >
                <View>
                  <Text
                    style={
                      styles.contentHeading
                    }
                  >
                    Upcoming Events
                  </Text>

                  <Text
                    style={
                      styles.contentSubheading
                    }
                  >
                    More experiences
                    waiting for you
                  </Text>
                </View>
              </View>

              {upcomingEvents.map(
                (event) => (
                  <CompactEventCard
                    key={
                      event._id
                    }
                    event={
                      event
                    }
                    onPress={() =>
                      router.push({
                        pathname:
                          "/events/[id]",

                        params: {
                          id:
                            event._id,
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
            height: 25,
          }}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

/* ------------------------------------------ */
/* FEATURED CARD                              */
/* ------------------------------------------ */

function FeaturedEventCard({
  event,
  onPress,
}: {
  event: EventItem;
  onPress: () => void;
}) {
  const imageUrl =
    getImageUrl(event.image);

  const date =
    new Date(
      event.eventDate
    );

  const soldOut =
    event.availableSeats <= 0;

  const category =
    event.category ||
    "Social";

  return (
    <Pressable
      style={({
        pressed,
      }) => [
        styles.featuredCard,

        pressed &&
          styles.cardPressed,
      ]}
      onPress={onPress}
    >
      <View
        style={
          styles.featuredImageArea
        }
      >
        {imageUrl ? (
          <Image
            source={{
              uri: imageUrl,
            }}
            style={
              styles.fullImage
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
              styles.fullImage
            }
          />
        )}

        <LinearGradient
          colors={[
            "rgba(17,24,39,0.02)",
            "rgba(17,24,39,0.75)",
          ]}
          style={
            styles.imageOverlay
          }
        />

        <View
          style={
            styles.featuredTop
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
              size={13}
              color="#FFFFFF"
            />

            <Text
              style={
                styles.categoryBadgeText
              }
            >
              {category}
            </Text>
          </View>

          <View
            style={[
              styles.availabilityBadge,

              soldOut &&
                styles.soldOutBadge,
            ]}
          >
            <Text
              style={
                styles.availabilityBadgeText
              }
            >
              {soldOut
                ? "SOLD OUT"
                : `${event.availableSeats} LEFT`}
            </Text>
          </View>
        </View>

        <View
          style={
            styles.featuredBottom
          }
        >
          <Text
            style={
              styles.featuredTitle
            }
            numberOfLines={2}
          >
            {event.title}
          </Text>

          <View
            style={
              styles.featuredMeta
            }
          >
            <Ionicons
              name="calendar-outline"
              size={15}
              color="#FFFFFF"
            />

            <Text
              style={
                styles.featuredMetaText
              }
            >
              {date.toLocaleDateString(
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
              numberOfLines={1}
              style={
                styles.featuredLocation
              }
            >
              {event.location}
            </Text>
          </View>
        </View>
      </View>

      <View
        style={
          styles.featuredFooter
        }
      >
        <View>
          <Text
            style={
              styles.featuredFooterLabel
            }
          >
            Starting
          </Text>

          <Text
            style={
              styles.featuredFooterValue
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

        <LinearGradient
          colors={[
            "#7C3AED",
            "#EC4899",
          ]}
          style={
            styles.exploreButton
          }
        >
          <Text
            style={
              styles.exploreButtonText
            }
          >
            Explore
          </Text>

          <Ionicons
            name="arrow-forward"
            size={16}
            color="#FFFFFF"
          />
        </LinearGradient>
      </View>
    </Pressable>
  );
}

/* ------------------------------------------ */
/* COMPACT EVENT CARD                         */
/* ------------------------------------------ */

function CompactEventCard({
  event,
  onPress,
}: {
  event: EventItem;
  onPress: () => void;
}) {
  const imageUrl =
    getImageUrl(event.image);

  const date =
    new Date(
      event.eventDate
    );

  const category =
    event.category ||
    "Social";

  const soldOut =
    event.availableSeats <= 0;

  return (
    <Pressable
      style={({
        pressed,
      }) => [
        styles.compactCard,

        pressed &&
          styles.cardPressed,
      ]}
      onPress={onPress}
    >
      <View
        style={
          styles.compactImageArea
        }
      >
        {imageUrl ? (
          <Image
            source={{
              uri: imageUrl,
            }}
            style={
              styles.fullImage
            }
            resizeMode="cover"
          />
        ) : (
          <LinearGradient
            colors={[
              "#8B5CF6",
              "#EC4899",
            ]}
            style={
              styles.fullImage
            }
          >
            <Ionicons
              name="calendar"
              size={32}
              color="rgba(255,255,255,0.50)"
            />
          </LinearGradient>
        )}

        <View
          style={
            styles.dateBubble
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
            {date.getDate()}
          </Text>
        </View>
      </View>

      <View
        style={
          styles.compactContent
        }
      >
        <View
          style={
            styles.compactCategoryRow
          }
        >
          <Text
            style={
              styles.compactCategory
            }
          >
            {category}
          </Text>

          <View
            style={[
              styles.smallAvailability,

              soldOut &&
                styles.smallSoldOut,
            ]}
          >
            <Text
              style={
                styles.smallAvailabilityText
              }
            >
              {soldOut
                ? "Sold out"
                : `${event.availableSeats} seats`}
            </Text>
          </View>
        </View>

        <Text
          numberOfLines={2}
          style={
            styles.compactTitle
          }
        >
          {event.title}
        </Text>

        <View
          style={
            styles.compactInfo
          }
        >
          <Ionicons
            name="location-outline"
            size={15}
            color="#A855F7"
          />

          <Text
            numberOfLines={1}
            style={
              styles.compactInfoText
            }
          >
            {event.location}
          </Text>
        </View>

        <View
          style={
            styles.compactInfo
          }
        >
          <Ionicons
            name="time-outline"
            size={15}
            color="#EC4899"
          />

          <Text
            style={
              styles.compactInfoText
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

      <View
        style={
          styles.compactArrow
        }
      >
        <Ionicons
          name="chevron-forward"
          size={19}
          color="#9333EA"
        />
      </View>
    </Pressable>
  );
}

/* ------------------------------------------ */
/* CATEGORY ICON                              */
/* ------------------------------------------ */

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

/* ------------------------------------------ */
/* STYLES                                     */
/* ------------------------------------------ */

const styles =
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor:
        "#FAF7FF",
    },

    scrollContent: {
      paddingBottom: 35,
    },

    loadingScreen: {
      flex: 1,
      backgroundColor:
        "#FAF7FF",
      justifyContent:
        "center",
      alignItems:
        "center",
    },

    loadingLogo: {
      width: 74,
      height: 74,
      borderRadius: 24,
      justifyContent:
        "center",
      alignItems:
        "center",
    },

    loadingText: {
      marginTop: 14,
      color: "#6B7280",
      fontWeight: "600",
    },

    pressed: {
      opacity: 0.75,
    },

    cardPressed: {
      opacity: 0.93,
      transform: [
        {
          scale: 0.99,
        },
      ],
    },

    /* HERO */

    hero: {
      paddingHorizontal: 21,
      paddingTop: 25,
      paddingBottom: 34,

      borderBottomLeftRadius:
        34,

      borderBottomRightRadius:
        34,
    },

    heroTop: {
      flexDirection:
        "row",

      justifyContent:
        "space-between",

      alignItems:
        "flex-start",
    },

    greetingArea: {
      flex: 1,
      paddingRight: 15,
    },

    welcomeLabel: {
      color: "#F5D0FE",
      fontSize: 10,
      fontWeight: "900",
      letterSpacing: 1.3,
    },

    greeting: {
      color: "#FFFFFF",
      fontSize: 28,
      fontWeight: "900",
      marginTop: 5,
    },

    heroSubtitle: {
      color: "#FCE7F3",
      fontSize: 14,
      lineHeight: 21,
      marginTop: 6,
      maxWidth: 280,
    },

    logoutButton: {
      width: 46,
      height: 46,
      borderRadius: 15,

      backgroundColor:
        "rgba(255,255,255,0.17)",

      justifyContent:
        "center",

      alignItems:
        "center",
    },

    /* SEARCH */

    searchBox: {
      marginTop: 25,

      height: 56,

      backgroundColor:
        "#FFFFFF",

      borderRadius: 18,

      flexDirection:
        "row",

      alignItems:
        "center",

      paddingHorizontal:
        15,

      gap: 10,

      shadowColor:
        "#581C87",

      shadowOpacity: 0.09,
      shadowRadius: 12,

      elevation: 3,
    },

    searchInput: {
      flex: 1,
      fontSize: 15,
      color: "#111827",
    },

    /* BOOKING SHORTCUT */

    bookingShortcut: {
      marginHorizontal: 20,
      marginTop: 20,

      backgroundColor:
        "#FFFFFF",

      borderRadius: 22,
      padding: 14,

      flexDirection:
        "row",

      alignItems:
        "center",

      shadowColor:
        "#581C87",

      shadowOpacity: 0.06,
      shadowRadius: 15,

      elevation: 3,
    },

    bookingShortcutIcon: {
      width: 50,
      height: 50,
      borderRadius: 16,

      justifyContent:
        "center",

      alignItems:
        "center",
    },

    bookingShortcutText: {
      flex: 1,
      marginLeft: 12,
    },

    bookingShortcutTitle: {
      fontSize: 16,
      fontWeight: "900",
      color: "#111827",
    },

    bookingShortcutSubtitle: {
      color: "#6B7280",
      fontSize: 12,
      marginTop: 3,
    },

    arrowCircle: {
      width: 35,
      height: 35,
      borderRadius: 12,
      backgroundColor:
        "#F3E8FF",
      justifyContent:
        "center",
      alignItems:
        "center",
    },

    /* SECTION */

    sectionHeader: {
      marginTop: 27,
      paddingHorizontal: 20,

      flexDirection:
        "row",

      justifyContent:
        "space-between",

      alignItems:
        "center",
    },

    sectionTitle: {
      color: "#111827",
      fontSize: 24,
      fontWeight: "900",
    },

    sectionSubtitle: {
      color: "#6B7280",
      fontSize: 12,
      marginTop: 3,
    },

    eventCountBadge: {
      minWidth: 39,
      height: 39,
      borderRadius: 13,

      backgroundColor:
        "#F3E8FF",

      justifyContent:
        "center",

      alignItems:
        "center",
    },

    eventCountText: {
      color: "#9333EA",
      fontWeight: "900",
    },

    /* CATEGORY */

    categoryRow: {
      paddingHorizontal: 20,
      paddingTop: 15,
      paddingBottom: 4,
      gap: 9,
    },

    categorySelected: {
      height: 42,
      paddingHorizontal: 15,

      borderRadius: 21,

      flexDirection:
        "row",

      alignItems:
        "center",

      gap: 6,
    },

    categorySelectedText: {
      color: "#FFFFFF",
      fontWeight: "800",
      fontSize: 13,
    },

    categoryNormal: {
      height: 42,
      paddingHorizontal: 15,

      backgroundColor:
        "#FFFFFF",

      borderRadius: 21,

      flexDirection:
        "row",

      alignItems:
        "center",

      gap: 6,

      borderWidth: 1,
      borderColor:
        "#E9D5FF",
    },

    categoryNormalText: {
      color: "#7C3AED",
      fontWeight: "700",
      fontSize: 13,
    },

    /* TITLES */

    titleRow: {
      marginTop: 27,
      marginBottom: 13,

      paddingHorizontal: 20,

      flexDirection:
        "row",

      alignItems:
        "center",

      gap: 7,
    },

    contentHeading: {
      color: "#111827",
      fontSize: 21,
      fontWeight: "900",
    },

    contentSubheading: {
      color: "#6B7280",
      fontSize: 12,
      marginTop: 3,
    },

    /* FEATURED */

    featuredCard: {
      marginHorizontal: 20,

      backgroundColor:
        "#FFFFFF",

      borderRadius: 25,

      overflow: "hidden",

      shadowColor:
        "#581C87",

      shadowOpacity: 0.09,
      shadowRadius: 18,

      shadowOffset: {
        width: 0,
        height: 8,
      },

      elevation: 4,
    },

    featuredImageArea: {
      height: 245,
      position:
        "relative",
      backgroundColor:
        "#A855F7",
    },

    fullImage: {
      width: "100%",
      height: "100%",
      justifyContent:
        "center",
      alignItems:
        "center",
    },

    imageOverlay: {
      ...StyleSheet.absoluteFillObject,
    },

    featuredTop: {
      position:
        "absolute",

      top: 15,
      left: 15,
      right: 15,

      flexDirection:
        "row",

      justifyContent:
        "space-between",
    },

    categoryBadge: {
      flexDirection:
        "row",

      alignItems:
        "center",

      gap: 5,

      backgroundColor:
        "rgba(124,58,237,0.92)",

      paddingHorizontal: 11,
      paddingVertical: 7,

      borderRadius: 20,
    },

    categoryBadgeText: {
      color: "#FFFFFF",
      fontSize: 11,
      fontWeight: "900",
    },

    availabilityBadge: {
      backgroundColor:
        "rgba(22,163,74,0.94)",

      paddingHorizontal: 11,
      paddingVertical: 7,

      borderRadius: 20,
    },

    soldOutBadge: {
      backgroundColor:
        "rgba(220,38,38,0.94)",
    },

    availabilityBadgeText: {
      color: "#FFFFFF",
      fontSize: 10,
      fontWeight: "900",
    },

    featuredBottom: {
      position:
        "absolute",

      left: 17,
      right: 17,
      bottom: 17,
    },

    featuredTitle: {
      color: "#FFFFFF",
      fontSize: 25,
      lineHeight: 30,
      fontWeight: "900",

      textShadowColor:
        "rgba(0,0,0,0.3)",

      textShadowRadius: 3,
    },

    featuredMeta: {
      flexDirection:
        "row",

      alignItems:
        "center",

      gap: 6,

      marginTop: 9,
    },

    featuredMetaText: {
      color: "#FFFFFF",
      fontWeight: "700",
      fontSize: 12,
    },

    featuredLocation: {
      color: "#FFFFFF",
      fontWeight: "700",
      fontSize: 12,
      flex: 1,
    },

    metaDot: {
      width: 4,
      height: 4,
      borderRadius: 2,
      backgroundColor:
        "rgba(255,255,255,0.65)",
    },

    featuredFooter: {
      padding: 15,

      flexDirection:
        "row",

      justifyContent:
        "space-between",

      alignItems:
        "center",
    },

    featuredFooterLabel: {
      color: "#9CA3AF",
      fontSize: 10,
      fontWeight: "700",
      textTransform:
        "uppercase",
    },

    featuredFooterValue: {
      color: "#111827",
      fontSize: 15,
      fontWeight: "900",
      marginTop: 2,
    },

    exploreButton: {
      height: 40,
      paddingHorizontal: 14,
      borderRadius: 13,

      flexDirection:
        "row",

      alignItems:
        "center",

      gap: 6,
    },

    exploreButtonText: {
      color: "#FFFFFF",
      fontWeight: "900",
      fontSize: 12,
    },

    /* COMPACT */

    compactCard: {
      marginHorizontal: 20,
      marginBottom: 13,

      minHeight: 136,

      backgroundColor:
        "#FFFFFF",

      borderRadius: 21,

      padding: 11,

      flexDirection:
        "row",

      alignItems:
        "center",

      shadowColor:
        "#581C87",

      shadowOpacity: 0.05,
      shadowRadius: 12,

      elevation: 2,
    },

    compactImageArea: {
      width: 115,
      height: 115,

      borderRadius: 17,

      overflow: "hidden",

      position:
        "relative",

      backgroundColor:
        "#A855F7",
    },

    dateBubble: {
      position:
        "absolute",

      top: 7,
      left: 7,

      width: 41,

      backgroundColor:
        "rgba(255,255,255,0.95)",

      borderRadius: 11,

      alignItems:
        "center",

      paddingVertical: 5,
    },

    dateMonth: {
      color: "#EC4899",
      fontSize: 8,
      fontWeight: "900",
    },

    dateDay: {
      color: "#111827",
      fontSize: 17,
      fontWeight: "900",
    },

    compactContent: {
      flex: 1,
      marginLeft: 13,
    },

    compactCategoryRow: {
      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "space-between",

      marginBottom: 6,
    },

    compactCategory: {
      color: "#A855F7",
      fontSize: 11,
      fontWeight: "900",
      textTransform:
        "uppercase",
    },

    smallAvailability: {
      paddingHorizontal: 7,
      paddingVertical: 4,

      borderRadius: 8,

      backgroundColor:
        "#DCFCE7",
    },

    smallSoldOut: {
      backgroundColor:
        "#FEE2E2",
    },

    smallAvailabilityText: {
      color: "#166534",
      fontSize: 8,
      fontWeight: "900",
    },

    compactTitle: {
      color: "#111827",
      fontWeight: "900",
      fontSize: 16,
      lineHeight: 20,
      marginBottom: 8,
    },

    compactInfo: {
      flexDirection:
        "row",

      alignItems:
        "center",

      gap: 5,

      marginTop: 3,
    },

    compactInfoText: {
      color: "#6B7280",
      fontSize: 11,
      flexShrink: 1,
    },

    compactArrow: {
      width: 31,
      height: 31,

      borderRadius: 11,

      backgroundColor:
        "#F3E8FF",

      justifyContent:
        "center",

      alignItems:
        "center",

      marginLeft: 5,
    },

    /* ERROR */

    errorCard: {
      marginHorizontal: 20,
      marginTop: 25,

      padding: 15,

      borderRadius: 19,

      backgroundColor:
        "#FFFFFF",

      flexDirection:
        "row",

      alignItems:
        "center",

      borderWidth: 1,
      borderColor:
        "#FECACA",
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
    },

    errorTitle: {
      color: "#111827",
      fontWeight: "900",
    },

    errorText: {
      color: "#6B7280",
      fontSize: 11,
      marginTop: 2,
    },

    /* EMPTY */

    emptyCard: {
      marginHorizontal: 20,
      marginTop: 30,

      backgroundColor:
        "#FFFFFF",

      borderRadius: 24,

      padding: 35,

      alignItems:
        "center",
    },

    emptyIcon: {
      width: 75,
      height: 75,

      borderRadius: 24,

      justifyContent:
        "center",

      alignItems:
        "center",
    },

    emptyTitle: {
      color: "#111827",
      fontWeight: "900",
      fontSize: 20,
      marginTop: 14,
    },

    emptyText: {
      color: "#6B7280",
      textAlign:
        "center",
      marginTop: 5,
      lineHeight: 19,
    },

    clearFiltersButton: {
      marginTop: 17,

      backgroundColor:
        "#F3E8FF",

      borderRadius: 13,

      paddingHorizontal: 17,
      paddingVertical: 10,
    },

    clearFiltersText: {
      color: "#9333EA",
      fontWeight: "900",
    },
  });