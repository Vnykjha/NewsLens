import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  useFonts,
} from "@expo-google-fonts/inter";
import {
  PlayfairDisplay_400Regular,
  PlayfairDisplay_700Bold,
} from "@expo-google-fonts/playfair-display";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { ErrorBoundary } from "@/components/ErrorBoundary";
import { AppProvider } from "@/context/AppContext";
import { setBaseUrl } from "@workspace/api-client-react";
import Constants from "expo-constants";
import { Platform } from "react-native";

// Get the Metro packager host IP address so it works on physical devices as well as emulators
const getBaseUrl = () => {
  if (Platform.OS === "web") {
    console.log("getBaseUrl: Running on Web, returning localhost");
    return "http://localhost:5000";
  }
  const debuggerHost = Constants.expoConfig?.hostUri;
  console.log("getBaseUrl: Constants.expoConfig?.hostUri =", debuggerHost);
  const localhost = debuggerHost?.split(":")[0];
  if (localhost) {
    const url = `http://${localhost}:5000`;
    console.log("getBaseUrl: Resolved dynamic host URL =", url);
    return url;
  }
  console.log("getBaseUrl: Fallback to localhost");
  return "http://localhost:5000";
};

const resolvedUrl = getBaseUrl();
console.log("Resolved API Base URL set to:", resolvedUrl);
setBaseUrl(resolvedUrl);

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function RootLayoutNav() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen
        name="analysis/[id]"
        options={{
          headerShown: false,
          presentation: "card",
          animation: "slide_from_right",
        }}
      />
    </Stack>
  );
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    PlayfairDisplay_400Regular,
    PlayfairDisplay_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) return null;

  return (
    <SafeAreaProvider>
      <ErrorBoundary>
        <QueryClientProvider client={queryClient}>
          <AppProvider>
            <GestureHandlerRootView>
              <KeyboardProvider>
                <RootLayoutNav />
              </KeyboardProvider>
            </GestureHandlerRootView>
          </AppProvider>
        </QueryClientProvider>
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}
