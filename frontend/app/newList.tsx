import { SearchInput } from "@/components/ui/search-input";
import { UniversalIcon } from "@/components/ui/universal-icon";
import { router } from "expo-router";
import React from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

type SettingItem = {
  library:
    | "ionicons"
    | "fontawesome"
    | "material"
    | "antdesign"
    | "feather"
    | "lucide";
  icon: string;
  text: string;
};

export default function NewListScreen() {
  const newChatBtnData = [
    {
      id: 1,
      name: "New Group",
      icon: "users" as const,
      library: "feather" as const,
    },
    {
      id: 2,
      name: "New Contact",
      icon: "user-plus" as const,
      library: "feather" as const,
    },
    {
      id: 3,
      name: "New Community",
      icon: "users" as const,
      library: "feather" as const,
    },
    {
      id: 4,
      name: "New broadcast",
      library: "fontawesome" as const,
      icon: "bullhorn" as const,
    },
  ];
  return (
    <View style={styles.container}>
      <View style={styles.newChatContainer}>
        <View style={styles.headerContainer}>
          <Pressable onPress={() => router.back()}>
            <Text style={styles.headerText}>Cancel</Text>
          </Pressable>
          <Text
            style={{
              fontSize: 20,
              fontWeight: "600",
              color: "#0b0b0b",
            }}
          >
            New List
          </Text>
          <Pressable onPress={() => router.back()}>
            <Text style={styles.headerText}>Message</Text>
          </Pressable>
        </View>

        <View style={styles.searchContainer}>
          <SearchInput
            placeholder="Search name or number"
            containerStyle={styles.searchBar}
            TextIcon={"To:"}
            isIcon={false}
          />
        </View>

        <ScrollView>
          <View>
            {newChatBtnData.map((item) => (
              <Pressable
                key={item.id}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  padding: 16,
                }}
              >
                <UniversalIcon
                  library={item.library}
                  name={item.icon}
                  color="#000"
                  size={24}
                />
                <Text
                  style={{
                    fontSize: 16,
                    color: "#0b0b0b",
                    marginLeft: 10,
                  }}
                >
                  {item.name}
                </Text>
              </Pressable>
            ))}
          </View>
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  newChatContainer: {
    width: "100%",
    backgroundColor: "#e9e9e9",
    padding: 16,
  },
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    marginBottom: 10,
  },
  headerText: {
    fontSize: 16,
    fontWeight: "normal",
    color: "#0b0b0b",
  },
  searchContainer: {
    width: "100%",
    backgroundColor: "#fff",
    marginBottom: 20,
    borderRadius: 10,
  },
  searchBar: {
    borderRadius: 10,
  },
});
