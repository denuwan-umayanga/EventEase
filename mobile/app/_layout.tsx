import { Stack } from "expo-router";
import React from "react";

import {
  AuthProvider,
} from "../src/context/AuthContext";

export default function RootLayout() {
  return (
    <AuthProvider>
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor:
              "#FFFFFF",
          },

          headerTintColor:
            "#111827",

          headerTitleStyle: {
            fontWeight:
              "800",
          },

          headerShadowVisible:
            false,

          contentStyle: {
            backgroundColor:
              "#FAF7FF",
          },

          headerBackTitle:
            "Back",
        }}
      >
        {/* AUTH */}

        <Stack.Screen
          name="index"
          options={{
            headerShown:
              false,
          }}
        />

        <Stack.Screen
          name="login"
          options={{
            headerShown:
              false,
          }}
        />

        <Stack.Screen
          name="register"
          options={{
            headerShown:
              false,
          }}
        />

        {/* USER */}

        <Stack.Screen
          name="home"
          options={{
            headerShown:
              false,
          }}
        />

        {/* ADMIN */}

        <Stack.Screen
          name="admin"
          options={{
            headerShown:
              false,
          }}
        />

        {/* EVENTS */}

        <Stack.Screen
          name="events/create"
          options={{
            title:
              "Create Event",

            headerTintColor:
              "#7C3AED",
          }}
        />

        <Stack.Screen
          name="events/[id]"
          options={{
            title:
              "Event Details",

            headerTransparent:
              true,

            headerTitle:
              "",

            headerTintColor:
              "#FFFFFF",
          }}
        />

        <Stack.Screen
          name="events/edit/[id]"
          options={{
            title:
              "Edit Event",

            headerTintColor:
              "#7C3AED",
          }}
        />

        {/* BOOKINGS */}

        <Stack.Screen
          name="bookings/index"
          options={{
            title:
              "My Bookings",

            headerShown:
              false,
          }}
        />

        <Stack.Screen
          name="bookings/create"
          options={{
            title:
              "Book Event",

            headerTransparent:
              true,

            headerTitle:
              "",

            headerTintColor:
              "#FFFFFF",
          }}
        />

        <Stack.Screen
          name="bookings/[id]"
          options={{
            title:
              "Booking Details",

            headerTransparent:
              true,

            headerTitle:
              "",

            headerTintColor:
              "#FFFFFF",
          }}
        />

        <Stack.Screen
          name="bookings/edit/[id]"
          options={{
            title:
              "Change Seats",

            headerTransparent:
              true,

            headerTitle:
              "",

            headerTintColor:
              "#FFFFFF",
          }}
        />
      </Stack>
    </AuthProvider>
  );
}