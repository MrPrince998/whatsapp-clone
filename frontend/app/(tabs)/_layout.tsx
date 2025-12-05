import { Tabs } from "expo-router";
import React from "react";

import { HapticTab } from "@/components/haptic-tab";
import { UniversalIcon } from "@/components/ui/universal-icon";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? "light"].tint,
        headerShown: false,
        tabBarButton: HapticTab,
      }}
    >
      <Tabs.Screen
        name="update"
        options={{
          title: "Updates",
          tabBarIcon: ({ color, focused }) => (
            <UniversalIcon
              library="ionicons"
              name={focused ? "notifications" : "notifications-outline"}
              size={28}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="phone"
        options={{
          title: "Calls",
          tabBarIcon: ({ color, focused }) => (
            <Icon
              name={focused ? "phone" : "phone-outline"}
              size={28}
              color={color}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="explore"
        options={{
          title: "Explore",
          tabBarIcon: ({ color, focused }) => (
            <Icon
              name={focused ? "account-group" : "account-group-outline"}
              size={30}
              color={color}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="index"
        options={{
          title: "Chats",
          tabBarIcon: ({ color, focused }) => (
            <UniversalIcon
              library="ionicons"
              name={focused ? "chatbubbles" : "chatbubbles-outline"}
              size={28}
              color={color}
              style={{ transform: [{ scaleX: -1 }] }}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="setting"
        options={{
          title: "Settings",
          tabBarIcon: ({ color, focused }) => (
            <UniversalIcon
              library="ionicons"
              name={focused ? "cog" : "cog-outline"}
              size={28}
              color={color}
            />
          ),
        }}
      />
    </Tabs>
  );
}
