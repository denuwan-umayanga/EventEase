import { Stack } from "expo-router";
import { AuthProvider } from "../src/context/AuthContext";

export default function RootLayout() {
  return (
    <AuthProvider>
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: "#2563EB",
          },
          headerTintColor: "#FFFFFF",
          headerTitleStyle: {
            fontWeight: "bold",
          },
        }}
      >
        <Stack.Screen
          name="index"
          options={{ headerShown: false }}
        />

        <Stack.Screen
          name="login"
          options={{
            title: "Login",
            headerShown: false,
          }}
        />

        <Stack.Screen
          name="register"
          options={{
            title: "Register",
            headerShown: false,
          }}
        />

        <Stack.Screen
          name="home"
          options={{
            title: "EventEase",
            headerBackVisible: false,
          }}
        />
      </Stack>
    </AuthProvider>
  );
}
