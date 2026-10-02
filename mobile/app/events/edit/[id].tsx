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
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { API_URL } from "../../../src/config/api";
import { useAuth } from "../../../src/context/AuthContext";

export default function EditEventScreen() {
  const { id } = useLocalSearchParams<{
    id: string;
  }>();

  const { token } = useAuth();

  const [title, setTitle] = useState("");
  const [description, setDescription] =
    useState("");
  const [location, setLocation] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [capacity, setCapacity] = useState("");

  const [initialLoading, setInitialLoading] =
    useState(true);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    loadEvent();
  }, [id]);

  const loadEvent = async () => {
    try {
      const response = await fetch(
        `${API_URL}/api/events/${id}`
      );

      const data = await response.json();

      if (!response.ok) {
        setError(
          data.message || "Unable to load event."
        );
        return;
      }

      const event = data.event;
      const eventDate = new Date(
        event.eventDate
      );

      setTitle(event.title);
      setDescription(event.description);
      setLocation(event.location);

      setDate(
        eventDate.toISOString().split("T")[0]
      );

      setTime(
        `${String(
          eventDate.getHours()
        ).padStart(2, "0")}:${String(
          eventDate.getMinutes()
        ).padStart(2, "0")}`
      );

      setCapacity(String(event.capacity));
    } catch (err) {
      setError(
        "Unable to connect to the EventEase server."
      );
    } finally {
      setInitialLoading(false);
    }
  };

  const handleUpdate = async () => {
    setError("");

    if (
      !title.trim() ||
      !description.trim() ||
      !location.trim() ||
      !date.trim() ||
      !time.trim() ||
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

    const eventDate = new Date(
      `${date}T${time}:00`
    );

    if (Number.isNaN(eventDate.getTime())) {
      setError("Invalid event date or time.");
      return;
    }

    try {
      setSaving(true);

      const response = await fetch(
        `${API_URL}/api/events/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            title: title.trim(),
            description: description.trim(),
            location: location.trim(),
            eventDate: eventDate.toISOString(),
            capacity: capacityNumber,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(
          data.message || "Unable to update event."
        );
        return;
      }

      Alert.alert(
        "Event Updated",
        "Your changes were saved successfully.",
        [
          {
            text: "OK",
            onPress: () => router.back(),
          },
        ]
      );
    } catch (err) {
      setError(
        "Unable to connect to the EventEase server."
      );
    } finally {
      setSaving(false);
    }
  };

  if (initialLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator
          size="large"
          color="#2563EB"
        />
      </View>
    );
  }

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
        <View style={styles.titleRow}>
          <View style={styles.titleIcon}>
            <Ionicons
              name="create-outline"
              size={25}
              color="#2563EB"
            />
          </View>

          <View>
            <Text style={styles.pageTitle}>
              Edit Event
            </Text>

            <Text style={styles.pageSubtitle}>
              Update event information
            </Text>
          </View>
        </View>

        <View style={styles.card}>
          <Field
            label="Event Title"
            value={title}
            onChangeText={setTitle}
          />

          <Field
            label="Description"
            value={description}
            onChangeText={setDescription}
            multiline
          />

          <Field
            label="Location"
            value={location}
            onChangeText={setLocation}
          />

          <View style={styles.row}>
            <View style={styles.half}>
              <Field
                label="Date"
                value={date}
                onChangeText={setDate}
                placeholder="YYYY-MM-DD"
              />
            </View>

            <View style={styles.half}>
              <Field
                label="Time"
                value={time}
                onChangeText={setTime}
                placeholder="HH:MM"
              />
            </View>
          </View>

          <Field
            label="Capacity"
            value={capacity}
            onChangeText={setCapacity}
            keyboardType="number-pad"
          />

          {error ? (
            <View style={styles.errorBox}>
              <Ionicons
                name="alert-circle-outline"
                size={18}
                color="#DC2626"
              />

              <Text style={styles.errorText}>
                {error}
              </Text>
            </View>
          ) : null}

          <Pressable
            onPress={handleUpdate}
            disabled={saving}
          >
            <LinearGradient
              colors={["#2563EB", "#4F46E5"]}
              style={styles.saveButton}
            >
              {saving ? (
                <ActivityIndicator
                  color="#FFFFFF"
                />
              ) : (
                <>
                  <Ionicons
                    name="checkmark-circle-outline"
                    size={21}
                    color="#FFFFFF"
                  />

                  <Text style={styles.saveText}>
                    Save Changes
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

function Field({
  label,
  value,
  onChangeText,
  placeholder,
  multiline = false,
  keyboardType,
}: any) {
  return (
    <View>
      <Text style={styles.label}>{label}</Text>

      <TextInput
        style={[
          styles.input,
          multiline && styles.multiline,
        ]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        multiline={multiline}
        textAlignVertical={
          multiline ? "top" : "center"
        }
        keyboardType={keyboardType}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },

  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F8FAFC",
  },

  content: {
    padding: 18,
    paddingBottom: 40,
  },

  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },

  titleIcon: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: "#EFF6FF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 13,
  },

  pageTitle: {
    fontSize: 25,
    fontWeight: "900",
    color: "#0F172A",
  },

  pageSubtitle: {
    color: "#64748B",
    marginTop: 2,
  },

  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    padding: 20,
  },

  label: {
    color: "#334155",
    fontWeight: "700",
    marginBottom: 7,
  },

  input: {
    borderWidth: 1,
    borderColor: "#E2E8F0",
    backgroundColor: "#F8FAFC",
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 13,
    marginBottom: 18,
    fontSize: 15,
    color: "#0F172A",
  },

  multiline: {
    minHeight: 105,
  },

  row: {
    flexDirection: "row",
    gap: 12,
  },

  half: {
    flex: 1,
  },

  errorBox: {
    flexDirection: "row",
    backgroundColor: "#FEF2F2",
    padding: 12,
    borderRadius: 12,
    alignItems: "center",
    gap: 7,
    marginBottom: 15,
  },

  errorText: {
    color: "#B91C1C",
    flex: 1,
  },

  saveButton: {
    height: 55,
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },

  saveText: {
    color: "#FFFFFF",
    fontWeight: "800",
    fontSize: 16,
  },
});
