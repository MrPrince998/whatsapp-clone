import { useLocalSearchParams } from "expo-router";
import React from "react";
import { Text, View } from "react-native";

const ChatDetailScreen = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text>This is the chat screen for user {id}</Text>
    </View>
  );
};

export default ChatDetailScreen;
