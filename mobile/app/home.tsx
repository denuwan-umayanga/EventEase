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
  TextInput,
  View,
} from "react-native";

import RoleGuard from "../src/components/RoleGuard";
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
  return (
    <RoleGuard allow="user">
      <HomeContent />
    </RoleGuard>
  );
}

function HomeContent() {
  const { user, signOut } = useAuth();

  const [events, setEvents] =
    useState<EventItem[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [error, setError] =
    useState("");

  const [search, setSearch] =
    useState("");

  const [
    selectedCategory,
    setSelectedCategory,
  ] =
    useState<CategoryFilter>("All");

  const loadEvents = async (
    showLoader = true
  ) => {
    try {
      if (showLoader) {
        setLoading(true);
      }

      setError("");

      const response = await fetch(
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

  const handleLogout = async () => {
    await signOut();

    router.replace("/login");
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
        style={styles.loadingScreen}
      >
        <LinearGradient
          colors={[
            "#7C3AED",
            "#A855F7",
            "#EC4899",
          ]}
          style={styles.loadingLogo}
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
          style={styles.loadingText}
        >
          Finding amazing events...
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={styles.container}
    >
      <ScrollView
        showsVerticalScrollIndicator={
          false
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
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
            style={styles.heroTop}
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
                Discover your next
                unforgettable
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
            style={styles.searchBox}
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
              onChangeText={setSearch}
            />

            {search.length > 0 && (
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
          style={({ pressed }) => [
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
              View and manage your
              reservations
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

        {/* CATEGORY HEADER */}

        <View
          style={styles.sectionHeader}
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
              {filteredEvents.length}
            </Text>
          </View>
        </View>

        {/* CATEGORIES */}

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={
            false
          }
          contentContainerStyle={
            styles.categories
          }
        >
          {categories.map(
            (item) => {
              const selected =
                selectedCategory ===
                item.name;

              return (
                <Pressable
                  key={item.name}
                  style={[
                    styles.categoryButton,

                    selected &&
                      styles.categoryButtonSelected,
                  ]}
                  onPress={() =>
                    setSelectedCategory(
                      item.name
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
                        styles.categoryIconSelected
                      }
                    >
                      <Ionicons
                        name={item.icon}
                        size={17}
                        color="#FFFFFF"
                      />
                    </LinearGradient>
                  ) : (
                    <View
                      style={
                        styles.categoryIcon
                      }
                    >
                      <Ionicons
                        name={item.icon}
                        size={17}
                        color="#9333EA"
                      />
                    </View>
                  )}

                  <Text
                    style={[
                      styles.categoryText,

                      selected &&
                        styles.categoryTextSelected,
                    ]}
                  >
                    {item.name}
                  </Text>
                </Pressable>
              );
            }
          )}
        </ScrollView>

        {/* ERROR */}

        {error ? (
          <View
            style={styles.errorCard}
          >
            <Ionicons
              name="cloud-offline-outline"
              size={26}
              color="#DC2626"
            />

            <View
              style={{
                flex: 1,
              }}
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
                size={22}
                color="#9333EA"
              />
            </Pressable>
          </View>
        ) : null}

        {/* EMPTY */}

        {!error &&
          filteredEvents.length ===
            0 && (
            <View
              style={styles.emptyCard}
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
                  size={34}
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
                Try another search
                or category.
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

        {/* FEATURED */}

        {!error &&
          featuredEvent && (
            <>
              <View
                style={
                  styles.titleRow
                }
              >
                <View>
                  <Text
                    style={
                      styles.sectionTitle
                    }
                  >
                    Featured
                  </Text>

                  <Text
                    style={
                      styles.sectionSubtitle
                    }
                  >
                    EventEase pick
                    for you
                  </Text>
                </View>

                <Ionicons
                  name="sparkles"
                  size={21}
                  color="#EC4899"
                />
              </View>

              <FeaturedEventCard
                event={
                  featuredEvent
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
                style={
                  styles.titleRow
                }
              >
                <View>
                  <Text
                    style={
                      styles.sectionTitle
                    }
                  >
                    Upcoming Events
                  </Text>

                  <Text
                    style={
                      styles.sectionSubtitle
                    }
                  >
                    More events to
                    explore
                  </Text>
                </View>

                <View
                  style={
                    styles.smallCount
                  }
                >
                  <Text
                    style={
                      styles.smallCountText
                    }
                  >
                    {
                      upcomingEvents.length
                    }
                  </Text>
                </View>
              </View>

              {upcomingEvents.map(
                (event) => (
                  <UpcomingEventCard
                    key={event._id}
                    event={event}
                  />
                )
              )}
            </>
          )}

        <View
          style={{
            height: 30,
          }}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

function FeaturedEventCard({
  event,
}: {
  event: EventItem;
}) {
  const imageUrl =
    getImageUrl(event.image);

  const date =
    new Date(event.eventDate);

  const soldOut =
    event.availableSeats <= 0;

  return (
    <Pressable
      style={({ pressed }) => [
        styles.featuredCard,

        pressed &&
          styles.cardPressed,
      ]}
      onPress={() =>
        router.push({
          pathname:
            "/events/[id]",

          params: {
            id: event._id,
          },
        })
      }
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
              styles.featuredImage
            }
            resizeMode="cover"
          />
        ) : (
          <LinearGradient
            colors={[
              "#7C3AED",
              "#A855F7",
              "#EC4899",
            ]}
            style={
              styles.featuredImage
            }
          >
            <Ionicons
              name="calendar"
              size={60}
              color="rgba(255,255,255,0.35)"
            />
          </LinearGradient>
        )}

        <LinearGradient
          colors={[
            "transparent",
            "rgba(17,24,39,0.82)",
          ]}
          style={
            styles.featuredOverlay
          }
        />

        <View
          style={
            styles.featuredTop
          }
        >
          <View
            style={
              styles.featuredCategory
            }
          >
            <Text
              style={
                styles.featuredCategoryText
              }
            >
              {event.category}
            </Text>
          </View>

          <View
            style={[
              styles.availabilityBadge,

              soldOut
                ? styles.soldOutBadge
                : styles.openBadge,
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
                  month: "short",
                  day: "numeric",
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
                styles.featuredLocation
              }
              numberOfLines={1}
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
            EVENT DATE
          </Text>

          <Text
            style={
              styles.featuredFooterValue
            }
          >
            {date.toLocaleDateString(
              "en-US",
              {
                weekday:
                  "short",
                month: "short",
                day: "numeric",
              }
            )}
          </Text>
        </View>

        <View
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
            size={17}
            color="#FFFFFF"
          />
        </View>
      </View>
    </Pressable>
  );
}

function UpcomingEventCard({
  event,
}: {
  event: EventItem;
}) {
  const imageUrl =
    getImageUrl(event.image);

  const date =
    new Date(event.eventDate);

  return (
    <Pressable
      style={({ pressed }) => [
        styles.upcomingCard,

        pressed &&
          styles.cardPressed,
      ]}
      onPress={() =>
        router.push({
          pathname:
            "/events/[id]",

          params: {
            id: event._id,
          },
        })
      }
    >
      <View
        style={
          styles.upcomingImageArea
        }
      >
        {imageUrl ? (
          <Image
            source={{
              uri: imageUrl,
            }}
            style={
              styles.upcomingImage
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
              styles.upcomingImage
            }
          >
            <Ionicons
              name="calendar-outline"
              size={30}
              color="#FFFFFF"
            />
          </LinearGradient>
        )}

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
            {date.getDate()}
          </Text>
        </View>
      </View>

      <View
        style={
          styles.upcomingContent
        }
      >
        <Text
          style={
            styles.upcomingCategory
          }
        >
          {event.category}
        </Text>

        <Text
          style={
            styles.upcomingTitle
          }
          numberOfLines={2}
        >
          {event.title}
        </Text>

        <View
          style={
            styles.upcomingMeta
          }
        >
          <Ionicons
            name="location-outline"
            size={14}
            color="#A855F7"
          />

          <Text
            style={
              styles.upcomingMetaText
            }
            numberOfLines={1}
          >
            {event.location}
          </Text>
        </View>

        <View
          style={
            styles.upcomingMeta
          }
        >
          <Ionicons
            name="time-outline"
            size={14}
            color="#EC4899"
          />

          <Text
            style={
              styles.upcomingMetaText
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

        <View
          style={
            styles.upcomingFooter
          }
        >
          <View
            style={
              styles.seatsBadge
            }
          >
            <Ionicons
              name="people-outline"
              size={13}
              color="#7C3AED"
            />

            <Text
              style={
                styles.seatsText
              }
            >
              {event.availableSeats}{" "}
              seats
            </Text>
          </View>

          <Ionicons
            name="chevron-forward"
            size={19}
            color="#9333EA"
          />
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

    scrollContent: {
      paddingBottom: 20,
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
      width: 76,
      height: 76,
      borderRadius: 25,
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

    pressed: {
      opacity: 0.75,
    },

    cardPressed: {
      opacity: 0.92,
      transform: [
        {
          scale: 0.99,
        },
      ],
    },

    /* HERO */

    hero: {
      paddingHorizontal: 21,
      paddingTop: 26,
      paddingBottom: 31,
      borderBottomLeftRadius:
        34,
      borderBottomRightRadius:
        34,
      marginBottom: 18,
    },

    heroTop: {
      flexDirection: "row",
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
      letterSpacing: 1.2,
    },

    greeting: {
      color: "#FFFFFF",
      fontSize: 28,
      fontWeight: "900",
      marginTop: 5,
    },

    heroSubtitle: {
      color: "#FCE7F3",
      lineHeight: 20,
      marginTop: 5,
      maxWidth: 280,
    },

    logoutButton: {
      width: 47,
      height: 47,
      borderRadius: 15,
      backgroundColor:
        "rgba(255,255,255,0.16)",
      justifyContent:
        "center",
      alignItems:
        "center",
    },

    searchBox: {
      minHeight: 56,
      backgroundColor:
        "#FFFFFF",
      borderRadius: 18,
      marginTop: 24,
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 15,
      gap: 9,
    },

    searchInput: {
      flex: 1,
      color: "#111827",
      fontSize: 14,
    },

    /* BOOKING SHORTCUT */

    bookingShortcut: {
      marginHorizontal: 20,
      backgroundColor:
        "#FFFFFF",
      borderRadius: 20,
      padding: 14,
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 25,
      shadowColor:
        "#581C87",
      shadowOpacity: 0.06,
      shadowRadius: 12,
      elevation: 2,
    },

    bookingShortcutIcon: {
      width: 49,
      height: 49,
      borderRadius: 16,
      justifyContent:
        "center",
      alignItems:
        "center",
    },

    bookingShortcutText: {
      flex: 1,
      marginLeft: 11,
    },

    bookingShortcutTitle: {
      color: "#111827",
      fontWeight: "900",
      fontSize: 15,
    },

    bookingShortcutSubtitle: {
      color: "#9CA3AF",
      fontSize: 10,
      marginTop: 2,
    },

    arrowCircle: {
      width: 36,
      height: 36,
      borderRadius: 12,
      backgroundColor:
        "#FAF5FF",
      justifyContent:
        "center",
      alignItems:
        "center",
    },

    /* SECTIONS */

    sectionHeader: {
      paddingHorizontal: 20,
      flexDirection: "row",
      justifyContent:
        "space-between",
      alignItems: "center",
      marginBottom: 13,
    },

    titleRow: {
      paddingHorizontal: 20,
      flexDirection: "row",
      justifyContent:
        "space-between",
      alignItems: "center",
      marginTop: 25,
      marginBottom: 13,
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

    eventCountBadge: {
      width: 38,
      height: 38,
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

    smallCount: {
      minWidth: 32,
      height: 32,
      paddingHorizontal: 8,
      borderRadius: 10,
      backgroundColor:
        "#F3E8FF",
      justifyContent:
        "center",
      alignItems:
        "center",
    },

    smallCountText: {
      color: "#9333EA",
      fontWeight: "900",
      fontSize: 11,
    },

    /* CATEGORIES */

    categories: {
      paddingHorizontal: 20,
      paddingBottom: 3,
      gap: 9,
    },

    categoryButton: {
      minHeight: 44,
      paddingHorizontal: 11,
      borderRadius: 14,
      flexDirection: "row",
      alignItems: "center",
      backgroundColor:
        "#FFFFFF",
      borderWidth: 1,
      borderColor:
        "#F3E8FF",
      gap: 7,
    },

    categoryButtonSelected: {
      borderColor:
        "#D8B4FE",
      backgroundColor:
        "#FAF5FF",
    },

    categoryIcon: {
      width: 29,
      height: 29,
      borderRadius: 9,
      backgroundColor:
        "#F3E8FF",
      justifyContent:
        "center",
      alignItems:
        "center",
    },

    categoryIconSelected: {
      width: 29,
      height: 29,
      borderRadius: 9,
      justifyContent:
        "center",
      alignItems:
        "center",
    },

    categoryText: {
      color: "#6B7280",
      fontWeight: "800",
      fontSize: 11,
    },

    categoryTextSelected: {
      color: "#7C3AED",
    },

    /* ERROR */

    errorCard: {
      marginHorizontal: 20,
      marginTop: 20,
      borderRadius: 18,
      padding: 15,
      backgroundColor:
        "#FEF2F2",
      borderWidth: 1,
      borderColor:
        "#FECACA",
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
    },

    errorTitle: {
      color: "#991B1B",
      fontWeight: "900",
    },

    errorText: {
      color: "#B91C1C",
      fontSize: 10,
      marginTop: 2,
    },

    /* FEATURED */

    featuredCard: {
      marginHorizontal: 20,
      borderRadius: 24,
      backgroundColor:
        "#FFFFFF",
      overflow: "hidden",
      shadowColor:
        "#581C87",
      shadowOpacity: 0.08,
      shadowRadius: 15,
      elevation: 4,
    },

    featuredImageArea: {
      height: 245,
      position: "relative",
      backgroundColor:
        "#7C3AED",
    },

    featuredImage: {
      width: "100%",
      height: "100%",
      alignItems: "center",
      justifyContent:
        "center",
    },

    featuredOverlay: {
      ...StyleSheet.absoluteFillObject,
    },

    featuredTop: {
      position: "absolute",
      top: 13,
      left: 13,
      right: 13,
      flexDirection: "row",
      justifyContent:
        "space-between",
      alignItems: "center",
    },

    featuredCategory: {
      backgroundColor:
        "rgba(124,58,237,0.92)",
      paddingHorizontal: 11,
      paddingVertical: 7,
      borderRadius: 15,
    },

    featuredCategoryText: {
      color: "#FFFFFF",
      fontWeight: "900",
      fontSize: 10,
    },

    availabilityBadge: {
      paddingHorizontal: 10,
      paddingVertical: 7,
      borderRadius: 15,
    },

    openBadge: {
      backgroundColor:
        "rgba(22,163,74,0.94)",
    },

    soldOutBadge: {
      backgroundColor:
        "rgba(220,38,38,0.94)",
    },

    availabilityBadgeText: {
      color: "#FFFFFF",
      fontWeight: "900",
      fontSize: 9,
    },

    featuredBottom: {
      position: "absolute",
      left: 16,
      right: 16,
      bottom: 17,
    },

    featuredTitle: {
      color: "#FFFFFF",
      fontSize: 24,
      lineHeight: 29,
      fontWeight: "900",
    },

    featuredMeta: {
      flexDirection: "row",
      alignItems: "center",
      gap: 5,
      marginTop: 8,
    },

    featuredMetaText: {
      color: "#FFFFFF",
      fontSize: 11,
      fontWeight: "700",
    },

    featuredLocation: {
      color: "#FFFFFF",
      flex: 1,
      fontSize: 11,
      fontWeight: "700",
    },

    metaDot: {
      width: 4,
      height: 4,
      borderRadius: 2,
      marginHorizontal: 3,
      backgroundColor:
        "rgba(255,255,255,0.65)",
    },

    featuredFooter: {
      padding: 15,
      flexDirection: "row",
      alignItems: "center",
      justifyContent:
        "space-between",
    },

    featuredFooterLabel: {
      color: "#9CA3AF",
      fontSize: 8,
      fontWeight: "900",
      letterSpacing: 0.6,
    },

    featuredFooterValue: {
      color: "#111827",
      fontSize: 12,
      fontWeight: "900",
      marginTop: 3,
    },

    exploreButton: {
      backgroundColor:
        "#9333EA",
      borderRadius: 13,
      paddingHorizontal: 13,
      paddingVertical: 9,
      flexDirection: "row",
      alignItems: "center",
      gap: 5,
    },

    exploreButtonText: {
      color: "#FFFFFF",
      fontWeight: "900",
      fontSize: 11,
    },

    /* UPCOMING */

    upcomingCard: {
      marginHorizontal: 20,
      marginBottom: 13,
      minHeight: 150,
      backgroundColor:
        "#FFFFFF",
      borderRadius: 21,
      flexDirection: "row",
      overflow: "hidden",
      shadowColor:
        "#581C87",
      shadowOpacity: 0.05,
      shadowRadius: 10,
      elevation: 2,
    },

    upcomingImageArea: {
      width: 125,
      position: "relative",
      backgroundColor:
        "#7C3AED",
    },

    upcomingImage: {
      width: "100%",
      height: "100%",
      justifyContent:
        "center",
      alignItems:
        "center",
    },

    dateBadge: {
      position: "absolute",
      top: 10,
      left: 10,
      width: 41,
      backgroundColor:
        "rgba(255,255,255,0.95)",
      borderRadius: 11,
      paddingVertical: 5,
      alignItems: "center",
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

    upcomingContent: {
      flex: 1,
      padding: 13,
    },

    upcomingCategory: {
      color: "#A855F7",
      fontSize: 9,
      fontWeight: "900",
      textTransform:
        "uppercase",
      letterSpacing: 0.5,
    },

    upcomingTitle: {
      color: "#111827",
      fontWeight: "900",
      fontSize: 15,
      lineHeight: 19,
      marginTop: 3,
      marginBottom: 8,
    },

    upcomingMeta: {
      flexDirection: "row",
      alignItems: "center",
      gap: 5,
      marginBottom: 5,
    },

    upcomingMetaText: {
      color: "#6B7280",
      fontSize: 10,
      flexShrink: 1,
    },

    upcomingFooter: {
      marginTop: "auto",
      paddingTop: 8,
      borderTopWidth: 1,
      borderTopColor:
        "#F3E8FF",
      flexDirection: "row",
      justifyContent:
        "space-between",
      alignItems: "center",
    },

    seatsBadge: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
      paddingHorizontal: 7,
      paddingVertical: 5,
      borderRadius: 9,
      backgroundColor:
        "#F3E8FF",
    },

    seatsText: {
      color: "#7C3AED",
      fontSize: 9,
      fontWeight: "900",
    },

    /* EMPTY */

    emptyCard: {
      marginHorizontal: 20,
      marginTop: 25,
      backgroundColor:
        "#FFFFFF",
      borderRadius: 24,
      padding: 35,
      alignItems: "center",
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
      textAlign: "center",
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