import "../global.css";
import { Stack } from "expo-router";
import { CapProvider } from "./capContext";

export default function Layout() {
  return (
    // On met l'ensemble de l'appli dans le CapProvider pour pouvoir y avoir accès partout
    <CapProvider>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
    </CapProvider>
  );
}
