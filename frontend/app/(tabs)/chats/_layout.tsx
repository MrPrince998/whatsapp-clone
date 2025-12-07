import { useColorScheme } from "@/hooks/use-color-scheme";
import { Stack } from "expo-router";

export default function ChatsLayout() {
  const colorScheme = useColorScheme();
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen
        name="[id]"
        options={{ headerShown: false }}
      />
    </Stack>
  );
}
