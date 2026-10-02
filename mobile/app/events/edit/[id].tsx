import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { LinearGradient } from "expo-linear-gradient";
import * as ImagePicker from "expo-image-picker";
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
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";

import { API_URL } from "../../../src/config/api";
import { useAuth } from "../../../src/context/AuthContext";
import {
  EventCategory,
  EventItem,
} from "../../../src/types/Event";
import { getImageUrl } from "../../../src/utils/imageUrl";

type SelectedImage = {
  uri: string;
  fileName?: string | null;
  mimeType?: string | null;
};

const categories: {
  name: EventCategory;
  icon: any;
}[] = [
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

export default function EditEventScreen() {
  const { id } = useLocalSearchParams<{
    id: string;
  }>();

  const {
    token,
    user,
  } = useAuth();

  const [event, setEvent] =
    useState<EventItem | null>(null);

  const [title, setTitle] =
    useState("");

  const [
    description,
    setDescription,
  ] = useState("");

  const [
    location,
    setLocation,
  ] = useState("");

  const [
    capacity,
    setCapacity,
  ] = useState("");

  const [
    category,
    setCategory,
  ] =
    useState<EventCategory>(
      "Social"
    );

  const [
    eventDate,
    setEventDate,
  ] = useState(new Date());

  const [
    newImage,
    setNewImage,
  ] =
    useState<SelectedImage | null>(
      null
    );

  const [
    currentImage,
    setCurrentImage,
  ] =
    useState<string | null>(
      null
    );

  const [
    showDatePicker,
    setShowDatePicker,
  ] = useState(false);

  const [
    showTimePicker,
    setShowTimePicker,
  ] = useState(false);

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

  const loadEvent = async () => {
    try {
      setLoading(true);
      setError("");

      const response =
        await fetch(
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

      const loadedEvent:
        EventItem =
        data.event;

      setEvent(
        loadedEvent
      );

      setTitle(
        loadedEvent.title
      );

      setDescription(
        loadedEvent.description
      );

      setLocation(
        loadedEvent.location
      );

      setCapacity(
        String(
          loadedEvent.capacity
        )
      );

      setCategory(
        loadedEvent.category ||
          "Social"
      );

      setEventDate(
        new Date(
          loadedEvent.eventDate
        )
      );

      setCurrentImage(
        getImageUrl(
          loadedEvent.image
        )
      );

      setNewImage(null);
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

  const chooseImage =
    async () => {
      setError("");

      const permission =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (
        !permission.granted
      ) {
        Alert.alert(
          "Permission Required",
          "Please allow EventEase to access your photos."
        );

        return;
      }

      const result =
        await ImagePicker.launchImageLibraryAsync({
          mediaTypes: [
            "images",
          ],
          allowsEditing: true,
          aspect: [16, 9],
          quality: 0.8,
        });

      if (
        !result.canceled
      ) {
        const asset =
          result.assets[0];

        setNewImage({
          uri: asset.uri,
          fileName:
            asset.fileName,
          mimeType:
            asset.mimeType,
        });
      }
    };

  const removeNewImage =
    () => {
      setNewImage(null);
    };

  const handleDateChange = (
    _: any,
    selectedDate?: Date
  ) => {
    setShowDatePicker(
      false
    );

    if (
      !selectedDate
    ) {
      return;
    }

    const updatedDate =
      new Date(
        eventDate
      );

    updatedDate.setFullYear(
      selectedDate.getFullYear()
    );

    updatedDate.setMonth(
      selectedDate.getMonth()
    );

    updatedDate.setDate(
      selectedDate.getDate()
    );

    setEventDate(
      updatedDate
    );
  };

  const handleTimeChange = (
    _: any,
    selectedTime?: Date
  ) => {
    setShowTimePicker(
      false
    );

    if (
      !selectedTime
    ) {
      return;
    }

    const updatedDate =
      new Date(
        eventDate
      );

    updatedDate.setHours(
      selectedTime.getHours(),
      selectedTime.getMinutes(),
      0,
      0
    );

    setEventDate(
      updatedDate
    );
  };

  const handleSave =
    async () => {
      setError("");

      if (
        user?.isAdmin !==
        true
      ) {
        setError(
          "Admin access is required to update events."
        );

        return;
      }

      if (
        !title.trim() ||
        !description.trim() ||
        !location.trim() ||
        !capacity.trim()
      ) {
        setError(
          "Please complete all event details."
        );

        return;
      }

      const capacityNumber =
        Number(capacity);

      if (
        Number.isNaN(
          capacityNumber
        ) ||
        capacityNumber < 1
      ) {
        setError(
          "Capacity must be greater than zero."
        );

        return;
      }

      if (
        eventDate <=
        new Date()
      ) {
        setError(
          "Event date and time must be in the future."
        );

        return;
      }

      try {
        setSaving(true);

        const formData =
          new FormData();

        formData.append(
          "title",
          title.trim()
        );

        formData.append(
          "description",
          description.trim()
        );

        formData.append(
          "category",
          category
        );

        formData.append(
          "location",
          location.trim()
        );

        formData.append(
          "eventDate",
          eventDate.toISOString()
        );

        formData.append(
          "capacity",
          String(
            capacityNumber
          )
        );

        if (newImage) {
          const extension =
            newImage.fileName
              ?.split(".")
              .pop() ||
            "jpg";

          const fileName =
            newImage.fileName ||
            `event-${Date.now()}.${extension}`;

          const mimeType =
            newImage.mimeType ||
            "image/jpeg";

          formData.append(
            "image",
            {
              uri:
                newImage.uri,
              name:
                fileName,
              type:
                mimeType,
            } as any
          );
        }

        const response =
          await fetch(
            `${API_URL}/api/events/${id}`,
            {
              method: "PUT",

              headers: {
                Authorization:
                  `Bearer ${token}`,
              },

              body:
                formData,
            }
          );

        const data =
          await response.json();

        if (
          !response.ok
        ) {
          setError(
            data.message ||
              "Unable to update event."
          );

          return;
        }

        Alert.alert(
          "Event Updated",
          "Your event changes have been saved successfully.",
          [
            {
              text:
                "View Event",

              onPress: () =>
                router.replace({
                  pathname:
                    "/events/[id]",

                  params: {
                    id:
                      data.event._id,
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
        <ActivityIndicator
          size="large"
          color="#A855F7"
        />

        <Text
          style={
            styles.loadingText
          }
        >
          Loading event...
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
        <Ionicons
          name="alert-circle-outline"
          size={46}
          color="#DC2626"
        />

        <Text
          style={
            styles.errorScreenTitle
          }
        >
          Event unavailable
        </Text>

        <Text
          style={
            styles.errorScreenText
          }
        >
          {error ||
            "Unable to load the event."}
        </Text>
      </View>
    );
  }

  const imageToShow =
    newImage?.uri ||
    currentImage;

  return (
    <KeyboardAvoidingView
      style={
        styles.container
      }
      behavior={
        Platform.OS ===
        "ios"
          ? "padding"
          : undefined
      }
    >
      <ScrollView
        contentContainerStyle={
          styles.content
        }
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={
          false
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
          style={
            styles.hero
          }
        >
          <View
            style={
              styles.heroIcon
            }
          >
            <Ionicons
              name="create-outline"
              size={31}
              color="#FFFFFF"
            />
          </View>

          <Text
            style={
              styles.heroLabel
            }
          >
            ADMIN
          </Text>

          <Text
            style={
              styles.heroTitle
            }
          >
            Edit event
          </Text>

          <Text
            style={
              styles.heroSubtitle
            }
          >
            Update event
            information,
            schedule or cover.
          </Text>
        </LinearGradient>

        <View
          style={
            styles.formCard
          }
        >
          {/* IMAGE */}

          <SectionTitle
            icon="image-outline"
            title="Event Cover"
            subtitle={
              newImage
                ? "New image selected"
                : "Current event cover"
            }
          />

          {imageToShow ? (
            <View
              style={
                styles.imageContainer
              }
            >
              <Image
                source={{
                  uri:
                    imageToShow,
                }}
                style={
                  styles.imagePreview
                }
                resizeMode="cover"
              />

              <LinearGradient
                colors={[
                  "transparent",
                  "rgba(17,24,39,0.70)",
                ]}
                style={
                  styles.imageOverlay
                }
              />

              <View
                style={
                  styles.imageActions
                }
              >
                <Pressable
                  style={
                    styles.imageActionButton
                  }
                  onPress={
                    chooseImage
                  }
                >
                  <Ionicons
                    name="images-outline"
                    size={18}
                    color="#FFFFFF"
                  />

                  <Text
                    style={
                      styles.imageActionText
                    }
                  >
                    Replace
                  </Text>
                </Pressable>

                {newImage && (
                  <Pressable
                    style={[
                      styles.imageActionButton,
                      styles.removeButton,
                    ]}
                    onPress={
                      removeNewImage
                    }
                  >
                    <Ionicons
                      name="refresh-outline"
                      size={18}
                      color="#FFFFFF"
                    />

                    <Text
                      style={
                        styles.imageActionText
                      }
                    >
                      Undo
                    </Text>
                  </Pressable>
                )}
              </View>
            </View>
          ) : (
            <Pressable
              style={
                styles.uploadBox
              }
              onPress={
                chooseImage
              }
            >
              <LinearGradient
                colors={[
                  "#F3E8FF",
                  "#FCE7F3",
                ]}
                style={
                  styles.uploadIcon
                }
              >
                <Ionicons
                  name="cloud-upload-outline"
                  size={31}
                  color="#9333EA"
                />
              </LinearGradient>

              <Text
                style={
                  styles.uploadTitle
                }
              >
                Add cover image
              </Text>

              <Text
                style={
                  styles.uploadSubtitle
                }
              >
                JPG, PNG or
                WEBP
              </Text>
            </Pressable>
          )}

          {/* DETAILS */}

          <SectionTitle
            icon="information-circle-outline"
            title="Event Details"
            subtitle="Update the event information"
          />

          <FieldLabel
            icon="text-outline"
            text="Event Title"
          />

          <TextInput
            style={
              styles.input
            }
            placeholder="Event title"
            placeholderTextColor="#9CA3AF"
            value={title}
            onChangeText={
              setTitle
            }
          />

          <FieldLabel
            icon="document-text-outline"
            text="Description"
          />

          <TextInput
            style={[
              styles.input,
              styles.descriptionInput,
            ]}
            placeholder="Event description"
            placeholderTextColor="#9CA3AF"
            multiline
            textAlignVertical="top"
            value={
              description
            }
            onChangeText={
              setDescription
            }
          />

          {/* CATEGORY */}

          <FieldLabel
            icon="grid-outline"
            text="Category"
          />

          <View
            style={
              styles.categoryGrid
            }
          >
            {categories.map(
              (item) => {
                const selected =
                  category ===
                  item.name;

                return (
                  <Pressable
                    key={
                      item.name
                    }
                    style={
                      styles.categoryWrapper
                    }
                    onPress={() =>
                      setCategory(
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
                          styles.categorySelected
                        }
                      >
                        <Ionicons
                          name={
                            item.icon
                          }
                          size={20}
                          color="#FFFFFF"
                        />

                        <Text
                          style={
                            styles.categorySelectedText
                          }
                        >
                          {
                            item.name
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
                            item.icon
                          }
                          size={20}
                          color="#9333EA"
                        />

                        <Text
                          style={
                            styles.categoryNormalText
                          }
                        >
                          {
                            item.name
                          }
                        </Text>
                      </View>
                    )}
                  </Pressable>
                );
              }
            )}
          </View>

          {/* LOCATION */}

          <FieldLabel
            icon="location-outline"
            text="Location"
          />

          <TextInput
            style={
              styles.input
            }
            placeholder="Event location"
            placeholderTextColor="#9CA3AF"
            value={
              location
            }
            onChangeText={
              setLocation
            }
          />

          {/* SCHEDULE */}

          <SectionTitle
            icon="calendar-outline"
            title="Schedule"
            subtitle="Change date or time"
          />

          <View
            style={
              styles.twoColumns
            }
          >
            <View
              style={
                styles.flexField
              }
            >
              <FieldLabel
                icon="calendar-outline"
                text="Date"
              />

              <Pressable
                style={
                  styles.pickerButton
                }
                onPress={() =>
                  setShowDatePicker(
                    true
                  )
                }
              >
                <Text
                  style={
                    styles.pickerText
                  }
                >
                  {eventDate.toLocaleDateString(
                    "en-GB",
                    {
                      day:
                        "2-digit",

                      month:
                        "short",

                      year:
                        "numeric",
                    }
                  )}
                </Text>

                <Ionicons
                  name="chevron-down"
                  size={17}
                  color="#A855F7"
                />
              </Pressable>
            </View>

            <View
              style={
                styles.flexField
              }
            >
              <FieldLabel
                icon="time-outline"
                text="Time"
              />

              <Pressable
                style={
                  styles.pickerButton
                }
                onPress={() =>
                  setShowTimePicker(
                    true
                  )
                }
              >
                <Text
                  style={
                    styles.pickerText
                  }
                >
                  {eventDate.toLocaleTimeString(
                    "en-US",
                    {
                      hour:
                        "2-digit",

                      minute:
                        "2-digit",
                    }
                  )}
                </Text>

                <Ionicons
                  name="chevron-down"
                  size={17}
                  color="#A855F7"
                />
              </Pressable>
            </View>
          </View>

          {showDatePicker && (
            <DateTimePicker
              value={
                eventDate
              }
              mode="date"
              minimumDate={
                new Date()
              }
              onChange={
                handleDateChange
              }
            />
          )}

          {showTimePicker && (
            <DateTimePicker
              value={
                eventDate
              }
              mode="time"
              onChange={
                handleTimeChange
              }
            />
          )}

          {/* CAPACITY */}

          <FieldLabel
            icon="people-outline"
            text="Capacity"
          />

          <TextInput
            style={
              styles.input
            }
            placeholder="Maximum attendees"
            placeholderTextColor="#9CA3AF"
            keyboardType="number-pad"
            value={
              capacity
            }
            onChangeText={
              setCapacity
            }
          />

          {event && (
            <View
              style={
                styles.capacityInfo
              }
            >
              <Ionicons
                name="information-circle-outline"
                size={18}
                color="#7C3AED"
              />

              <Text
                style={
                  styles.capacityInfoText
                }
              >
                Currently{" "}
                {
                  event.capacity -
                  event.availableSeats
                }{" "}
                seat
                {event.capacity -
                  event.availableSeats ===
                1
                  ? ""
                  : "s"}{" "}
                booked.
              </Text>
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
                size={19}
                color="#DC2626"
              />

              <Text
                style={
                  styles.errorText
                }
              >
                {error}
              </Text>
            </View>
          ) : null}

          {/* SAVE */}

          <Pressable
            disabled={
              saving
            }
            onPress={
              handleSave
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
                      size={20}
                      color="#FFFFFF"
                    />
                  </View>

                  <Text
                    style={
                      styles.saveButtonText
                    }
                  >
                    Save Changes
                  </Text>

                  <Ionicons
                    name="arrow-forward"
                    size={20}
                    color="#FFFFFF"
                  />
                </>
              )}
            </LinearGradient>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function SectionTitle({
  icon,
  title,
  subtitle,
}: {
  icon: any;
  title: string;
  subtitle: string;
}) {
  return (
    <View
      style={
        styles.sectionTitleRow
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
          name={icon}
          size={20}
          color="#9333EA"
        />
      </LinearGradient>

      <View>
        <Text
          style={
            styles.sectionTitle
          }
        >
          {title}
        </Text>

        <Text
          style={
            styles.sectionSubtitle
          }
        >
          {subtitle}
        </Text>
      </View>
    </View>
  );
}

function FieldLabel({
  icon,
  text,
}: {
  icon: any;
  text: string;
}) {
  return (
    <View
      style={
        styles.labelRow
      }
    >
      <Ionicons
        name={icon}
        size={16}
        color="#A855F7"
      />

      <Text
        style={
          styles.label
        }
      >
        {text}
      </Text>
    </View>
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

    loadingText: {
      color: "#6B7280",
      marginTop: 13,
      fontWeight: "600",
    },

    errorScreenTitle: {
      color: "#111827",
      fontSize: 20,
      fontWeight: "900",
      marginTop: 14,
    },

    errorScreenText: {
      color: "#6B7280",
      textAlign: "center",
      marginTop: 6,
    },

    hero: {
      paddingHorizontal: 22,
      paddingTop: 32,
      paddingBottom: 46,

      borderBottomLeftRadius:
        34,

      borderBottomRightRadius:
        34,
    },

    heroIcon: {
      width: 54,
      height: 54,
      borderRadius: 18,
      backgroundColor:
        "rgba(255,255,255,0.17)",
      justifyContent:
        "center",
      alignItems:
        "center",
    },

    heroLabel: {
      color: "#F5D0FE",
      fontSize: 10,
      fontWeight: "900",
      letterSpacing: 1.3,
      marginTop: 16,
    },

    heroTitle: {
      color: "#FFFFFF",
      fontSize: 29,
      fontWeight: "900",
      marginTop: 5,
    },

    heroSubtitle: {
      color: "#FCE7F3",
      marginTop: 6,
      lineHeight: 20,
    },

    formCard: {
      marginHorizontal: 18,
      marginTop: -23,

      backgroundColor:
        "#FFFFFF",

      borderRadius: 27,
      padding: 20,

      shadowColor:
        "#581C87",

      shadowOpacity: 0.08,
      shadowRadius: 18,

      shadowOffset: {
        width: 0,
        height: 7,
      },

      elevation: 4,
    },

    sectionTitleRow: {
      flexDirection:
        "row",

      alignItems:
        "center",

      marginBottom: 15,
      marginTop: 5,
    },

    sectionIcon: {
      width: 43,
      height: 43,

      borderRadius: 14,

      justifyContent:
        "center",

      alignItems:
        "center",

      marginRight: 10,
    },

    sectionTitle: {
      color: "#111827",
      fontSize: 17,
      fontWeight: "900",
    },

    sectionSubtitle: {
      color: "#9CA3AF",
      fontSize: 11,
      marginTop: 2,
    },

    imageContainer: {
      height: 210,

      borderRadius: 20,

      overflow: "hidden",

      position:
        "relative",

      marginBottom: 27,
    },

    imagePreview: {
      width: "100%",
      height: "100%",
    },

    imageOverlay: {
      ...StyleSheet.absoluteFillObject,
    },

    imageActions: {
      position:
        "absolute",

      right: 10,
      bottom: 10,

      flexDirection:
        "row",

      gap: 8,
    },

    imageActionButton: {
      flexDirection:
        "row",

      alignItems:
        "center",

      gap: 6,

      paddingHorizontal: 12,
      paddingVertical: 9,

      borderRadius: 12,

      backgroundColor:
        "rgba(88,28,135,0.9)",
    },

    removeButton: {
      backgroundColor:
        "rgba(55,65,81,0.90)",
    },

    imageActionText: {
      color: "#FFFFFF",
      fontSize: 12,
      fontWeight: "900",
    },

    uploadBox: {
      minHeight: 180,

      borderWidth: 1.5,
      borderStyle:
        "dashed",

      borderColor:
        "#D8B4FE",

      backgroundColor:
        "#FCFAFF",

      borderRadius: 20,

      alignItems:
        "center",

      justifyContent:
        "center",

      marginBottom: 27,
    },

    uploadIcon: {
      width: 61,
      height: 61,

      borderRadius: 20,

      justifyContent:
        "center",

      alignItems:
        "center",
    },

    uploadTitle: {
      color: "#111827",
      fontSize: 16,
      fontWeight: "900",
      marginTop: 12,
    },

    uploadSubtitle: {
      color: "#9CA3AF",
      fontSize: 11,
      marginTop: 4,
    },

    labelRow: {
      flexDirection:
        "row",

      alignItems:
        "center",

      gap: 6,

      marginBottom: 8,
    },

    label: {
      color: "#374151",
      fontSize: 13,
      fontWeight: "800",
    },

    input: {
      borderWidth: 1,
      borderColor:
        "#E9D5FF",

      backgroundColor:
        "#FCFAFF",

      borderRadius: 15,

      paddingHorizontal: 14,
      paddingVertical: 13,

      color: "#111827",
      fontSize: 14,

      marginBottom: 18,
    },

    descriptionInput: {
      minHeight: 105,
    },

    categoryGrid: {
      flexDirection:
        "row",

      flexWrap: "wrap",

      gap: 9,

      marginBottom: 22,
    },

    categoryWrapper: {
      width: "31%",
    },

    categorySelected: {
      height: 76,

      borderRadius: 17,

      justifyContent:
        "center",

      alignItems:
        "center",

      gap: 6,
    },

    categorySelectedText: {
      color: "#FFFFFF",
      fontSize: 11,
      fontWeight: "900",
    },

    categoryNormal: {
      height: 76,

      borderWidth: 1,
      borderColor:
        "#E9D5FF",

      backgroundColor:
        "#FCFAFF",

      borderRadius: 17,

      justifyContent:
        "center",

      alignItems:
        "center",

      gap: 6,
    },

    categoryNormalText: {
      color: "#7C3AED",
      fontSize: 11,
      fontWeight: "800",
    },

    twoColumns: {
      flexDirection:
        "row",

      gap: 10,

      marginBottom: 18,
    },

    flexField: {
      flex: 1,
    },

    pickerButton: {
      minHeight: 51,

      borderWidth: 1,
      borderColor:
        "#E9D5FF",

      backgroundColor:
        "#FCFAFF",

      borderRadius: 15,

      paddingHorizontal: 12,

      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "space-between",
    },

    pickerText: {
      color: "#111827",
      fontWeight: "700",
      fontSize: 13,
    },

    capacityInfo: {
      flexDirection:
        "row",

      alignItems:
        "center",

      gap: 7,

      padding: 11,

      borderRadius: 13,

      backgroundColor:
        "#F5F3FF",

      marginTop: -7,
      marginBottom: 18,
    },

    capacityInfoText: {
      color: "#6D28D9",
      fontSize: 12,
      fontWeight: "600",
      flex: 1,
    },

    errorBox: {
      flexDirection:
        "row",

      alignItems:
        "center",

      gap: 8,

      backgroundColor:
        "#FEF2F2",

      padding: 12,

      borderRadius: 13,

      marginBottom: 15,
    },

    errorText: {
      color: "#B91C1C",
      flex: 1,
      lineHeight: 18,
    },

    saveButton: {
      minHeight: 59,

      borderRadius: 18,

      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "center",

      gap: 9,

      marginTop: 4,
    },

    saveIcon: {
      width: 31,
      height: 31,

      borderRadius: 10,

      backgroundColor:
        "rgba(255,255,255,0.16)",

      justifyContent:
        "center",

      alignItems:
        "center",
    },

    saveButtonText: {
      color: "#FFFFFF",
      fontWeight: "900",
      fontSize: 16,
    },
  });