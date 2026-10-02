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

        <Stack.Screen
          name="home"
          options={{
            headerShown: false,
          }}
        />

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
      </Stack>
    </AuthProvider>
  );
}
