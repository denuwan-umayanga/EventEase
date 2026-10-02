import { Stack } from "expo-router";

import { AuthProvider } from "../src/context/AuthContext";

export default function RootLayout() {
  return (
    <AuthProvider>
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: "#FFFFFF",
          },

          headerTintColor: "#0F172A",

          headerTitleStyle: {
            fontWeight: "800",
          },

          headerShadowVisible: false,

          contentStyle: {
            backgroundColor: "#F8FAFC",
          },
        }}
      >
        {/* Authentication */}
        <Stack.Screen
          name="index"
          options={{
            headerShown: false,
          }}
        />

        <Stack.Screen
          name="login"
          options={{
            headerShown: false,
          }}
        />

        <Stack.Screen
          name="register"
          options={{
            headerShown: false,
          }}
        />

        {/* Main Home */}
        <Stack.Screen
          name="home"
          options={{
            headerShown: false,
          }}
        />

        {/* Events */}
        <Stack.Screen
          name="events/create"
          options={{
            title: "Create Event",
            presentation: "card",
          }}
        />

        <Stack.Screen
          name="events/[id]"
          options={{
            title: "Event Details",
          }}
        />

        <Stack.Screen
          name="events/edit/[id]"
          options={{
            title: "Edit Event",
          }}
        />

        {/* Bookings */}
        <Stack.Screen
          name="bookings/index"
          options={{
            title: "My Bookings",
          }}
        />

        <Stack.Screen
          name="bookings/create"
          options={{
            title: "Book Event",
            presentation: "card",
          }}
        />

        <Stack.Screen
          name="bookings/[id]"
          options={{
            title: "Booking Details",
          }}
        />

        <Stack.Screen
          name="bookings/edit/[id]"
          options={{
            title: "Change Seats",
          }}
        />
      </Stack>
    </AuthProvider>
  );
}