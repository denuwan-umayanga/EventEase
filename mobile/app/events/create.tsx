import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { LinearGradient } from "expo-linear-gradient";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import React, { useState } from "react";
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

import RoleGuard from "../../src/components/RoleGuard";
import { API_URL } from "../../src/config/api";
import { useAuth } from "../../src/context/AuthContext";
import { EventCategory } from "../../src/types/Event";

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

export default function CreateEventScreen() {
  return (
    <RoleGuard allow="admin">
      <CreateEventContent />
    </RoleGuard>
  );
}

function CreateEventContent() {
  const { token, user } = useAuth();

  const [title, setTitle] = useState("");

  const [description, setDescription] =
    useState("");

  const [location, setLocation] =
    useState("");

  const [capacity, setCapacity] =
    useState("");

  const [category, setCategory] =
    useState<EventCategory>("Music");

  const [image, setImage] =
    useState<SelectedImage | null>(null);

  const [eventDate, setEventDate] =
    useState(() => {
      const date = new Date();

      date.setDate(
        date.getDate() + 1
      );

      date.setHours(
        18,
        0,
        0,
        0
      );

      return date;
    });

  const [
    showDatePicker,
    setShowDatePicker,
  ] = useState(false);

  const [
    showTimePicker,
    setShowTimePicker,
  ] = useState(false);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const chooseImage = async () => {
    setError("");

    const permission =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert(
        "Permission Required",
        "Please allow EventEase to access your photos."
      );

      return;
    }

    const result =
      await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [16, 9],
        quality: 0.8,
      });

    if (!result.canceled) {
      const asset =
        result.assets[0];

      setImage({
        uri: asset.uri,
        fileName:
          asset.fileName,
        mimeType:
          asset.mimeType,
      });
    }
  };

  const removeImage = () => {
    setImage(null);
  };

  const handleDateChange = (
    _: any,
    selectedDate?: Date
  ) => {
    setShowDatePicker(false);

    if (!selectedDate) {
      return;
    }

    const updatedDate =
      new Date(eventDate);

    updatedDate.setFullYear(
      selectedDate.getFullYear()
    );

    updatedDate.setMonth(
      selectedDate.getMonth()
    );

    updatedDate.setDate(
      selectedDate.getDate()
    );

    setEventDate(updatedDate);
  };

  const handleTimeChange = (
    _: any,
    selectedTime?: Date
  ) => {
    setShowTimePicker(false);

    if (!selectedTime) {
      return;
    }

    const updatedDate =
      new Date(eventDate);

    updatedDate.setHours(
      selectedTime.getHours(),
      selectedTime.getMinutes(),
      0,
      0
    );

    setEventDate(updatedDate);
  };

  const handleCreate =
    async () => {
      setError("");

      if (
        user?.isAdmin !== true
      ) {
        setError(
          "Admin access is required to create events."
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
        !Number.isInteger(
          capacityNumber
        ) ||
        capacityNumber < 1
      ) {
        setError(
          "Capacity must be a whole number greater than zero."
        );

        return;
      }

      if (
        eventDate <= new Date()
      ) {
        setError(
          "Event date and time must be in the future."
        );

        return;
      }

      try {
        setLoading(true);

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
          String(capacityNumber)
        );

        if (image) {
          const extension =
            image.fileName
              ?.split(".")
              .pop() ||
            "jpg";

          const fileName =
            image.fileName ||
            `event-${Date.now()}.${extension}`;

          const mimeType =
            image.mimeType ||
            "image/jpeg";

          formData.append(
            "image",
            {
              uri: image.uri,
              name: fileName,
              type: mimeType,
            } as any
          );
        }

        const response =
          await fetch(
            `${API_URL}/api/events`,
            {
              method: "POST",

              headers: {
                Authorization:
                  `Bearer ${token}`,
              },

              body: formData,
            }
          );

        const data =
          await response.json();

        if (!response.ok) {
          setError(
            data.message ||
              "Unable to create event."
          );

          return;
        }

        Alert.alert(
          "Event Created 🎉",
          "The event has been published successfully.",
          [
            {
              text: "View Event",

              onPress: () =>
                router.replace({
                  pathname:
                    "/events/[id]",

                  params: {
                    id:
                      data.event._id,
                  },
                } as any),
            },
          ]
        );
      } catch (error) {
        setError(
          "Unable to connect to the EventEase server."
        );
      } finally {
        setLoading(false);
      }
    };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={
        Platform.OS === "ios"
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
          style={styles.hero}
        >
          <View
            style={styles.heroIcon}
          >
            <Ionicons
              name="add-circle-outline"
              size={32}
              color="#FFFFFF"
            />
          </View>

          <Text
            style={styles.heroLabel}
          >
            ADMIN
          </Text>

          <Text
            style={styles.heroTitle}
          >
            Create a new event
          </Text>

          <Text
            style={
              styles.heroSubtitle
            }
          >
            Add event details,
            category, date and cover
            image.
          </Text>
        </LinearGradient>

        <View
          style={styles.formCard}
        >
          {/* IMAGE */}

          <SectionTitle
            icon="image-outline"
            title="Event Cover"
            subtitle="Make the event stand out"
          />

          {image ? (
            <View
              style={
                styles.imageContainer
              }
            >
              <Image
                source={{
                  uri: image.uri,
                }}
                style={
                  styles.imagePreview
                }
                resizeMode="cover"
              />

              <LinearGradient
                colors={[
                  "transparent",
                  "rgba(17,24,39,0.72)",
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
                    styles.imageAction
                  }
                  onPress={
                    chooseImage
                  }
                >
                  <Ionicons
                    name="images-outline"
                    size={17}
                    color="#FFFFFF"
                  />

                  <Text
                    style={
                      styles.imageActionText
                    }
                  >
                    Change
                  </Text>
                </Pressable>

                <Pressable
                  style={[
                    styles.imageAction,
                    styles.removeAction,
                  ]}
                  onPress={
                    removeImage
                  }
                >
                  <Ionicons
                    name="trash-outline"
                    size={17}
                    color="#FFFFFF"
                  />

                  <Text
                    style={
                      styles.imageActionText
                    }
                  >
                    Remove
                  </Text>
                </Pressable>
              </View>
            </View>
          ) : (
            <Pressable
              style={styles.uploadBox}
              onPress={chooseImage}
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
                  size={30}
                  color="#9333EA"
                />
              </LinearGradient>

              <Text
                style={
                  styles.uploadTitle
                }
              >
                Add Event Image
              </Text>

              <Text
                style={
                  styles.uploadSubtitle
                }
              >
                Choose a JPG, PNG
                or WEBP image
              </Text>

              <View
                style={
                  styles.choosePhotoButton
                }
              >
                <Ionicons
                  name="images-outline"
                  size={16}
                  color="#7C3AED"
                />

                <Text
                  style={
                    styles.choosePhotoText
                  }
                >
                  Choose Photo
                </Text>
              </View>
            </Pressable>
          )}

          {/* CATEGORY */}

          <SectionTitle
            icon="grid-outline"
            title="Category"
            subtitle="Choose the event type"
          />

          <View
            style={styles.categoryGrid}
          >
            {categories.map(
              (item) => {
                const selected =
                  category ===
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
                          styles.categoryIconSelected
                        }
                      >
                        <Ionicons
                          name={
                            item.icon
                          }
                          size={20}
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
                          name={
                            item.icon
                          }
                          size={20}
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
          </View>

          {/* EVENT DETAILS */}

          <SectionTitle
            icon="create-outline"
            title="Event Details"
            subtitle="Tell users about the event"
          />

          <FieldLabel
            icon="text-outline"
            text="Event Title"
          />

          <View
            style={styles.inputBox}
          >
            <Ionicons
              name="sparkles-outline"
              size={20}
              color="#A855F7"
            />

            <TextInput
              style={styles.input}
              placeholder="e.g. Melbourne Music Night"
              placeholderTextColor="#9CA3AF"
              value={title}
              onChangeText={setTitle}
            />
          </View>

          <FieldLabel
            icon="document-text-outline"
            text="Description"
          />

          <View
            style={[
              styles.inputBox,
              styles.textAreaBox,
            ]}
          >
            <Ionicons
              name="document-text-outline"
              size={20}
              color="#A855F7"
              style={{
                marginTop: 2,
              }}
            />

            <TextInput
              style={[
                styles.input,
                styles.textArea,
              ]}
              placeholder="Describe the event..."
              placeholderTextColor="#9CA3AF"
              multiline
              textAlignVertical="top"
              value={description}
              onChangeText={
                setDescription
              }
            />
          </View>

          <FieldLabel
            icon="location-outline"
            text="Location"
          />

          <View
            style={styles.inputBox}
          >
            <Ionicons
              name="location-outline"
              size={20}
              color="#EC4899"
            />

            <TextInput
              style={styles.input}
              placeholder="e.g. Melbourne Convention Centre"
              placeholderTextColor="#9CA3AF"
              value={location}
              onChangeText={
                setLocation
              }
            />
          </View>

          <FieldLabel
            icon="people-outline"
            text="Capacity"
          />

          <View
            style={styles.inputBox}
          >
            <Ionicons
              name="people-outline"
              size={20}
              color="#A855F7"
            />

            <TextInput
              style={styles.input}
              placeholder="e.g. 100"
              placeholderTextColor="#9CA3AF"
              keyboardType="number-pad"
              value={capacity}
              onChangeText={
                setCapacity
              }
            />
          </View>

          {/* DATE */}

          <SectionTitle
            icon="calendar-outline"
            title="Date & Time"
            subtitle="Schedule the event"
          />

          <View
            style={styles.dateRow}
          >
            <Pressable
              style={styles.dateCard}
              onPress={() =>
                setShowDatePicker(
                  true
                )
              }
            >
              <LinearGradient
                colors={[
                  "#F3E8FF",
                  "#FCE7F3",
                ]}
                style={styles.dateIcon}
              >
                <Ionicons
                  name="calendar-outline"
                  size={21}
                  color="#9333EA"
                />
              </LinearGradient>

              <View style={{ flex: 1 }}>
                <Text
                  style={
                    styles.dateLabel
                  }
                >
                  DATE
                </Text>

                <Text
                  style={
                    styles.dateValue
                  }
                >
                  {eventDate.toLocaleDateString(
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

              <Ionicons
                name="chevron-down"
                size={17}
                color="#A855F7"
              />
            </Pressable>

            <Pressable
              style={styles.dateCard}
              onPress={() =>
                setShowTimePicker(
                  true
                )
              }
            >
              <LinearGradient
                colors={[
                  "#FCE7F3",
                  "#F3E8FF",
                ]}
                style={styles.dateIcon}
              >
                <Ionicons
                  name="time-outline"
                  size={21}
                  color="#EC4899"
                />
              </LinearGradient>

              <View style={{ flex: 1 }}>
                <Text
                  style={
                    styles.dateLabel
                  }
                >
                  TIME
                </Text>

                <Text
                  style={
                    styles.dateValue
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
              </View>

              <Ionicons
                name="chevron-down"
                size={17}
                color="#EC4899"
              />
            </Pressable>
          </View>

          {showDatePicker && (
            <DateTimePicker
              value={eventDate}
              mode="date"
              minimumDate={new Date()}
              onChange={
                handleDateChange
              }
            />
          )}

          {showTimePicker && (
            <DateTimePicker
              value={eventDate}
              mode="time"
              onChange={
                handleTimeChange
              }
            />
          )}

          {/* SUMMARY */}

          <View
            style={styles.summaryCard}
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
                Event Summary
              </Text>

              <Ionicons
                name="checkmark-circle-outline"
                size={21}
                color="#A855F7"
              />
            </View>

            <SummaryRow
              label="Category"
              value={category}
            />

            <SummaryRow
              label="Capacity"
              value={
                capacity.trim()
                  ? `${capacity} people`
                  : "Not set"
              }
            />

            <SummaryRow
              label="Date"
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

            <SummaryRow
              label="Image"
              value={
                image
                  ? "Selected"
                  : "Optional"
              }
              last
            />
          </View>

          {/* ERROR */}

          {error ? (
            <View
              style={styles.errorBox}
            >
              <Ionicons
                name="alert-circle-outline"
                size={20}
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

          {/* CREATE */}

          <Pressable
            disabled={loading}
            onPress={handleCreate}
            style={({ pressed }) => [
              styles.createWrapper,

              pressed &&
                styles.pressed,
            ]}
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
                styles.createButton
              }
            >
              {loading ? (
                <ActivityIndicator
                  color="#FFFFFF"
                />
              ) : (
                <>
                  <View
                    style={
                      styles.createIcon
                    }
                  >
                    <Ionicons
                      name="add"
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
                        styles.createButtonText
                      }
                    >
                      Publish Event
                    </Text>

                    <Text
                      style={
                        styles.createSubtitle
                      }
                    >
                      Make this event
                      available to users
                    </Text>
                  </View>

                  <Ionicons
                    name="arrow-forward"
                    size={21}
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
          name={icon}
          size={21}
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
      style={styles.labelRow}
    >
      <Ionicons
        name={icon}
        size={14}
        color="#A855F7"
      />

      <Text
        style={styles.label}
      >
        {text}
      </Text>
    </View>
  );
}

function SummaryRow({
  label,
  value,
  last = false,
}: {
  label: string;
  value: string;
  last?: boolean;
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
        style={
          styles.summaryValue
        }
      >
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor:
      "#FAF7FF",
  },

  content: {
    paddingBottom: 40,
  },

  pressed: {
    opacity: 0.92,
  },

  /* HERO */

  hero: {
    paddingHorizontal: 23,
    paddingTop: 35,
    paddingBottom: 68,

    borderBottomLeftRadius:
      38,

    borderBottomRightRadius:
      38,
  },

  heroIcon: {
    width: 55,
    height: 55,

    borderRadius: 18,

    backgroundColor:
      "rgba(255,255,255,0.17)",

    alignItems: "center",
    justifyContent:
      "center",

    marginBottom: 17,
  },

  heroLabel: {
    color: "#F5D0FE",
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1.4,
  },

  heroTitle: {
    color: "#FFFFFF",
    fontSize: 29,
    fontWeight: "900",
    marginTop: 5,
  },

  heroSubtitle: {
    color: "#FCE7F3",
    marginTop: 7,
    lineHeight: 20,
    maxWidth: 300,
  },

  /* FORM */

  formCard: {
    marginHorizontal: 18,
    marginTop: -38,

    backgroundColor:
      "#FFFFFF",

    borderRadius: 28,

    padding: 20,

    shadowColor:
      "#581C87",

    shadowOpacity: 0.08,

    shadowRadius: 16,

    shadowOffset: {
      width: 0,
      height: 7,
    },

    elevation: 5,
  },

  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 7,
    marginBottom: 15,
  },

  sectionIcon: {
    width: 43,
    height: 43,

    borderRadius: 14,

    alignItems: "center",
    justifyContent:
      "center",

    marginRight: 10,
  },

  sectionTitle: {
    color: "#111827",
    fontSize: 16,
    fontWeight: "900",
  },

  sectionSubtitle: {
    color: "#9CA3AF",
    fontSize: 10,
    marginTop: 2,
  },

  /* IMAGE */

  uploadBox: {
    minHeight: 190,

    borderWidth: 1,
    borderStyle: "dashed",
    borderColor:
      "#D8B4FE",

    backgroundColor:
      "#FCFAFF",

    borderRadius: 21,

    alignItems: "center",
    justifyContent:
      "center",

    padding: 20,

    marginBottom: 27,
  },

  uploadIcon: {
    width: 61,
    height: 61,

    borderRadius: 20,

    justifyContent:
      "center",

    alignItems: "center",
  },

  uploadTitle: {
    color: "#111827",
    fontWeight: "900",
    fontSize: 15,
    marginTop: 11,
  },

  uploadSubtitle: {
    color: "#9CA3AF",
    fontSize: 10,
    marginTop: 4,
  },

  choosePhotoButton: {
    marginTop: 13,

    backgroundColor:
      "#F3E8FF",

    borderRadius: 12,

    paddingHorizontal: 12,
    paddingVertical: 8,

    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },

  choosePhotoText: {
    color: "#7C3AED",
    fontSize: 10,
    fontWeight: "900",
  },

  imageContainer: {
    height: 200,
    borderRadius: 21,
    overflow: "hidden",
    position: "relative",
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
    position: "absolute",
    left: 12,
    right: 12,
    bottom: 12,

    flexDirection: "row",
    justifyContent:
      "space-between",
  },

  imageAction: {
    backgroundColor:
      "rgba(124,58,237,0.90)",

    borderRadius: 12,

    paddingHorizontal: 11,
    paddingVertical: 8,

    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },

  removeAction: {
    backgroundColor:
      "rgba(220,38,38,0.90)",
  },

  imageActionText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "900",
  },

  /* CATEGORIES */

  categoryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 9,
    marginBottom: 28,
  },

  categoryButton: {
    width: "31%",

    minHeight: 83,

    borderRadius: 16,

    borderWidth: 1,

    borderColor:
      "#F3E8FF",

    backgroundColor:
      "#FCFAFF",

    alignItems: "center",

    justifyContent:
      "center",

    padding: 8,
  },

  categoryButtonSelected: {
    borderColor:
      "#D8B4FE",

    backgroundColor:
      "#FAF5FF",
  },

  categoryIcon: {
    width: 37,
    height: 37,

    borderRadius: 12,

    backgroundColor:
      "#F3E8FF",

    alignItems: "center",

    justifyContent:
      "center",
  },

  categoryIconSelected: {
    width: 37,
    height: 37,

    borderRadius: 12,

    alignItems: "center",

    justifyContent:
      "center",
  },

  categoryText: {
    color: "#6B7280",
    fontSize: 9,
    fontWeight: "800",
    marginTop: 6,
  },

  categoryTextSelected: {
    color: "#7C3AED",
    fontWeight: "900",
  },

  /* INPUT */

  labelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginBottom: 7,
  },

  label: {
    color: "#374151",
    fontSize: 11,
    fontWeight: "800",
  },

  inputBox: {
    minHeight: 54,

    borderWidth: 1,

    borderColor:
      "#E9D5FF",

    backgroundColor:
      "#FCFAFF",

    borderRadius: 15,

    flexDirection: "row",

    alignItems: "center",

    gap: 9,

    paddingHorizontal: 13,

    marginBottom: 16,
  },

  input: {
    flex: 1,
    color: "#111827",
    fontSize: 13,
  },

  textAreaBox: {
    minHeight: 125,
    alignItems: "flex-start",
    paddingTop: 14,
  },

  textArea: {
    minHeight: 95,
    paddingTop: 0,
  },

  /* DATE */

  dateRow: {
    flexDirection: "row",
    gap: 9,
    marginBottom: 25,
  },

  dateCard: {
    flex: 1,

    minHeight: 73,

    borderRadius: 16,

    backgroundColor:
      "#FCFAFF",

    borderWidth: 1,

    borderColor:
      "#E9D5FF",

    padding: 11,

    flexDirection: "row",

    alignItems: "center",

    gap: 8,
  },

  dateIcon: {
    width: 40,
    height: 40,

    borderRadius: 13,

    alignItems: "center",

    justifyContent:
      "center",
  },

  dateLabel: {
    color: "#9CA3AF",
    fontSize: 7,
    fontWeight: "900",
  },

  dateValue: {
    color: "#111827",
    fontSize: 11,
    fontWeight: "900",
    marginTop: 2,
  },

  /* SUMMARY */

  summaryCard: {
    backgroundColor:
      "#FAF7FF",

    borderRadius: 19,

    padding: 15,

    marginBottom: 16,
  },

  summaryHeader: {
    flexDirection: "row",

    alignItems: "center",

    justifyContent:
      "space-between",

    paddingBottom: 10,

    borderBottomWidth: 1,

    borderBottomColor:
      "#E9D5FF",
  },

  summaryTitle: {
    color: "#111827",
    fontWeight: "900",
    fontSize: 14,
  },

  summaryRow: {
    minHeight: 42,

    flexDirection: "row",

    justifyContent:
      "space-between",

    alignItems: "center",

    borderBottomWidth: 1,

    borderBottomColor:
      "#F3E8FF",
  },

  summaryRowLast: {
    borderBottomWidth: 0,
  },

  summaryLabel: {
    color: "#9CA3AF",
    fontSize: 10,
    fontWeight: "700",
  },

  summaryValue: {
    color: "#111827",
    fontSize: 10,
    fontWeight: "900",
    maxWidth: "60%",
    textAlign: "right",
  },

  /* ERROR */

  errorBox: {
    flexDirection: "row",

    alignItems: "center",

    gap: 8,

    backgroundColor:
      "#FEF2F2",

    padding: 12,

    borderRadius: 13,

    marginBottom: 15,
  },

  errorText: {
    flex: 1,
    color: "#B91C1C",
    lineHeight: 18,
    fontSize: 11,
  },

  /* CREATE */

  createWrapper: {
    borderRadius: 19,
    overflow: "hidden",

    shadowColor:
      "#7C3AED",

    shadowOpacity: 0.18,

    shadowRadius: 12,

    elevation: 5,
  },

  createButton: {
    minHeight: 68,

    borderRadius: 18,

    flexDirection: "row",

    alignItems: "center",

    paddingHorizontal: 15,

    gap: 10,
  },

  createIcon: {
    width: 40,
    height: 40,

    borderRadius: 13,

    backgroundColor:
      "rgba(255,255,255,0.16)",

    justifyContent:
      "center",

    alignItems: "center",
  },

  createButtonText: {
    color: "#FFFFFF",
    fontWeight: "900",
    fontSize: 15,
  },

  createSubtitle: {
    color: "#FCE7F3",
    fontSize: 9,
    marginTop: 2,
  },
});