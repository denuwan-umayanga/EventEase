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

import { API_URL } from "../../src/config/api";
import { useAuth } from "../../src/context/AuthContext";

type SelectedImage = {
  uri: string;
  fileName?: string | null;
  mimeType?: string | null;
};

export default function CreateEventScreen() {
  const { token } = useAuth();

  const [title, setTitle] = useState("");
  const [description, setDescription] =
    useState("");
  const [location, setLocation] = useState("");
  const [capacity, setCapacity] = useState("");

  const [image, setImage] =
    useState<SelectedImage | null>(null);

  const [eventDate, setEventDate] = useState(
    () => {
      const date = new Date();
      date.setDate(date.getDate() + 1);
      date.setHours(18, 0, 0, 0);
      return date;
    }
  );

  const [showDatePicker, setShowDatePicker] =
    useState(false);

  const [showTimePicker, setShowTimePicker] =
    useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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
      const asset = result.assets[0];

      setImage({
        uri: asset.uri,
        fileName: asset.fileName,
        mimeType: asset.mimeType,
      });
    }
  };

  const removeImage = () => {
    setImage(null);
  };

  const handleCreate = async () => {
    setError("");

    if (
      !title.trim() ||
      !description.trim() ||
      !location.trim() ||
      !capacity.trim()
    ) {
      setError("Please complete all fields.");
      return;
    }

    const capacityNumber = Number(capacity);

    if (
      Number.isNaN(capacityNumber) ||
      capacityNumber < 1
    ) {
      setError(
        "Capacity must be greater than zero."
      );
      return;
    }

    if (eventDate <= new Date()) {
      setError(
        "Event date and time must be in the future."
      );
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();

      formData.append("title", title.trim());
      formData.append(
        "description",
        description.trim()
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
          image.fileName?.split(".").pop() ||
          "jpg";

        const fileName =
          image.fileName ||
          `event-${Date.now()}.${extension}`;

        const mimeType =
          image.mimeType || "image/jpeg";

        formData.append(
          "image",
          {
            uri: image.uri,
            name: fileName,
            type: mimeType,
          } as any
        );
      }

      const response = await fetch(
        `${API_URL}/api/events`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(
          data.message ||
            "Unable to create event."
        );
        return;
      }

      Alert.alert(
        "Event Created",
        "Your event has been created successfully.",
        [
          {
            text: "View Event",
            onPress: () =>
              router.replace({
                pathname: "/events/[id]",
                params: {
                  id: data.event._id,
                },
              }),
          },
        ]
      );
    } catch (err) {
      console.log(
        "Create event error:",
        err
      );

      setError(
        "Unable to connect to the EventEase server."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDateChange = (
    _: any,
    selectedDate?: Date
  ) => {
    setShowDatePicker(false);

    if (!selectedDate) return;

    const updatedDate = new Date(eventDate);

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

    if (!selectedTime) return;

    const updatedDate = new Date(eventDate);

    updatedDate.setHours(
      selectedTime.getHours(),
      selectedTime.getMinutes(),
      0,
      0
    );

    setEventDate(updatedDate);
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
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <LinearGradient
          colors={["#2563EB", "#4F46E5"]}
          style={styles.headerCard}
        >
          <View style={styles.headerIcon}>
            <Ionicons
              name="calendar"
              size={27}
              color="#FFFFFF"
            />
          </View>

          <Text style={styles.headerTitle}>
            Create New Event
          </Text>

          <Text style={styles.headerSubtitle}>
            Add event details and a cover image.
          </Text>
        </LinearGradient>

        <View style={styles.formCard}>
          <Text style={styles.sectionLabel}>
            Event Cover
          </Text>

          {image ? (
            <View style={styles.imageContainer}>
              <Image
                source={{ uri: image.uri }}
                style={styles.imagePreview}
              />

              <View
                style={styles.imageOverlayActions}
              >
                <Pressable
                  style={styles.imageActionButton}
                  onPress={chooseImage}
                >
                  <Ionicons
                    name="images-outline"
                    size={18}
                    color="#FFFFFF"
                  />

                  <Text
                    style={styles.imageActionText}
                  >
                    Change
                  </Text>
                </Pressable>

                <Pressable
                  style={[
                    styles.imageActionButton,
                    styles.removeButton,
                  ]}
                  onPress={removeImage}
                >
                  <Ionicons
                    name="trash-outline"
                    size={18}
                    color="#FFFFFF"
                  />

                  <Text
                    style={styles.imageActionText}
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
              <View style={styles.uploadIcon}>
                <Ionicons
                  name="cloud-upload-outline"
                  size={31}
                  color="#2563EB"
                />
              </View>

              <Text style={styles.uploadTitle}>
                Add Event Cover
              </Text>

              <Text style={styles.uploadSubtitle}>
                Choose a JPG, PNG or WEBP image
              </Text>

              <View style={styles.uploadButton}>
                <Ionicons
                  name="images-outline"
                  size={17}
                  color="#2563EB"
                />

                <Text
                  style={styles.uploadButtonText}
                >
                  Choose Image
                </Text>
              </View>
            </Pressable>
          )}

          <FieldLabel
            icon="text-outline"
            text="Event Title"
          />

          <TextInput
            style={styles.input}
            placeholder="e.g. SLIIT Tech Conference"
            value={title}
            onChangeText={setTitle}
          />

          <FieldLabel
            icon="document-text-outline"
            text="Description"
          />

          <TextInput
            style={[
              styles.input,
              styles.multilineInput,
            ]}
            placeholder="Tell people about the event..."
            multiline
            textAlignVertical="top"
            value={description}
            onChangeText={setDescription}
          />

          <FieldLabel
            icon="location-outline"
            text="Location"
          />

          <TextInput
            style={styles.input}
            placeholder="Event location"
            value={location}
            onChangeText={setLocation}
          />

          <Text style={styles.sectionLabel}>
            Schedule
          </Text>

          <View style={styles.twoColumns}>
            <View style={styles.flexField}>
              <FieldLabel
                icon="calendar-outline"
                text="Date"
              />

              <Pressable
                style={styles.pickerButton}
                onPress={() =>
                  setShowDatePicker(true)
                }
              >
                <Text style={styles.pickerText}>
                  {eventDate.toLocaleDateString(
                    "en-GB",
                    {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    }
                  )}
                </Text>

                <Ionicons
                  name="chevron-down"
                  size={17}
                  color="#64748B"
                />
              </Pressable>
            </View>

            <View style={styles.flexField}>
              <FieldLabel
                icon="time-outline"
                text="Time"
              />

              <Pressable
                style={styles.pickerButton}
                onPress={() =>
                  setShowTimePicker(true)
                }
              >
                <Text style={styles.pickerText}>
                  {eventDate.toLocaleTimeString(
                    "en-US",
                    {
                      hour: "2-digit",
                      minute: "2-digit",
                    }
                  )}
                </Text>

                <Ionicons
                  name="chevron-down"
                  size={17}
                  color="#64748B"
                />
              </Pressable>
            </View>
          </View>

          {showDatePicker && (
            <DateTimePicker
              value={eventDate}
              mode="date"
              minimumDate={new Date()}
              onChange={handleDateChange}
            />
          )}

          {showTimePicker && (
            <DateTimePicker
              value={eventDate}
              mode="time"
              onChange={handleTimeChange}
            />
          )}

          <FieldLabel
            icon="people-outline"
            text="Capacity"
          />

          <TextInput
            style={styles.input}
            placeholder="Maximum attendees"
            keyboardType="number-pad"
            value={capacity}
            onChangeText={setCapacity}
          />

          {error ? (
            <View style={styles.errorBox}>
              <Ionicons
                name="alert-circle-outline"
                size={19}
                color="#DC2626"
              />

              <Text style={styles.errorText}>
                {error}
              </Text>
            </View>
          ) : null}

          <Pressable
            onPress={handleCreate}
            disabled={loading}
          >
            <LinearGradient
              colors={["#2563EB", "#4F46E5"]}
              style={styles.createButton}
            >
              {loading ? (
                <ActivityIndicator
                  color="#FFFFFF"
                />
              ) : (
                <>
                  <Ionicons
                    name="add-circle-outline"
                    size={22}
                    color="#FFFFFF"
                  />

                  <Text
                    style={
                      styles.createButtonText
                    }
                  >
                    Create Event
                  </Text>
                </>
              )}
            </LinearGradient>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
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
    <View style={styles.labelRow}>
      <Ionicons
        name={icon}
        size={17}
        color="#2563EB"
      />

      <Text style={styles.label}>
        {text}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },

  content: {
    padding: 18,
    paddingBottom: 40,
  },

  headerCard: {
    borderRadius: 24,
    padding: 22,
    marginBottom: 18,
  },

  headerIcon: {
    width: 50,
    height: 50,
    borderRadius: 16,
    backgroundColor:
      "rgba(255,255,255,0.18)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 18,
  },

  headerTitle: {
    color: "#FFFFFF",
    fontSize: 26,
    fontWeight: "900",
  },

  headerSubtitle: {
    color: "#DBEAFE",
    marginTop: 6,
    lineHeight: 20,
  },

  formCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 20,
    elevation: 2,
  },

  sectionLabel: {
    color: "#0F172A",
    fontSize: 17,
    fontWeight: "900",
    marginBottom: 13,
  },

  uploadBox: {
    borderWidth: 1.5,
    borderStyle: "dashed",
    borderColor: "#BFDBFE",
    backgroundColor: "#F8FAFF",
    borderRadius: 18,
    minHeight: 190,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    marginBottom: 24,
  },

  uploadIcon: {
    width: 58,
    height: 58,
    borderRadius: 18,
    backgroundColor: "#EFF6FF",
    justifyContent: "center",
    alignItems: "center",
  },

  uploadTitle: {
    fontSize: 17,
    fontWeight: "900",
    color: "#0F172A",
    marginTop: 13,
  },

  uploadSubtitle: {
    color: "#64748B",
    marginTop: 5,
    fontSize: 12,
  },

  uploadButton: {
    marginTop: 15,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#EFF6FF",
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 12,
  },

  uploadButtonText: {
    color: "#2563EB",
    fontWeight: "800",
  },

  imageContainer: {
    borderRadius: 18,
    overflow: "hidden",
    marginBottom: 24,
  },

  imagePreview: {
    width: "100%",
    height: 190,
    backgroundColor: "#E2E8F0",
  },

  imageOverlayActions: {
    position: "absolute",
    right: 10,
    bottom: 10,
    flexDirection: "row",
    gap: 8,
  },

  imageActionButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor:
      "rgba(15,23,42,0.78)",
    paddingHorizontal: 11,
    paddingVertical: 8,
    borderRadius: 11,
  },

  removeButton: {
    backgroundColor:
      "rgba(185,28,28,0.88)",
  },

  imageActionText: {
    color: "#FFFFFF",
    fontWeight: "800",
    fontSize: 12,
  },

  labelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    marginBottom: 8,
  },

  label: {
    fontSize: 14,
    fontWeight: "700",
    color: "#334155",
  },

  input: {
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 14,
    backgroundColor: "#F8FAFC",
    paddingHorizontal: 14,
    paddingVertical: 13,
    fontSize: 15,
    color: "#0F172A",
    marginBottom: 18,
  },

  multilineInput: {
    minHeight: 110,
  },

  twoColumns: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 18,
  },

  flexField: {
    flex: 1,
  },

  pickerButton: {
    borderWidth: 1,
    borderColor: "#E2E8F0",
    backgroundColor: "#F8FAFC",
    borderRadius: 14,
    paddingHorizontal: 13,
    minHeight: 50,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  pickerText: {
    color: "#0F172A",
    fontWeight: "600",
    fontSize: 14,
  },

  errorBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 12,
    backgroundColor: "#FEF2F2",
    borderRadius: 12,
    marginBottom: 16,
  },

  errorText: {
    color: "#B91C1C",
    flex: 1,
    lineHeight: 19,
  },

  createButton: {
    minHeight: 55,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    gap: 8,
  },

  createButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "900",
  },
});