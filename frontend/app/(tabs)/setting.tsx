import { View, Text, StyleSheet, ScrollView, Pressable } from "react-native";
import React, { use, useState } from "react";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { UniversalIcon } from "@/components/ui/universal-icon";
import { useRouter } from "expo-router";
import { Image } from "expo-image";
import { SearchInput } from "@/components/ui/search-input";

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

const Setting = () => {
  const [searchSetting, setSearchSetting] = useState<string>("");
  const [searchFocus, setSearchFocus] = useState<boolean>(false);
  const subSettingData = {
    contextMenu: [
      {
        library: "ionicons" as const,
        icon: "list-outline" as const,
        text: "Lists",
        to: "/lists"
      },
      {
        library: "fontawesome" as const,
        icon: "bullhorn" as const,
        text: "Broadcast messages",
        to: "/broadcast-messages",
      },
      {
        library: "ionicons" as const,
        icon: "star-outline" as const,
        text: "Starred",
        to: "/starred",
      },
      {
        library: "ionicons" as const,
        icon: "laptop-outline" as const,
        text: "Linked Devices",
        to: "/linked-devices",
      },
    ],
    accounts: [
      {
        library: "ionicons" as const,
        icon: "key-outline" as const,
        text: "Privacy",
        to: "/privacy",
      },
      {
        library: "ionicons" as const,
        icon: "lock-closed-outline" as const,
        text: "Security",
        to: "/security",
      },
      {
        library: "ionicons" as const,
        icon: "chatbubble-outline" as const,
        text: "Chats",
        to: "/chats",
      },
      {
        library: "ionicons" as const,
        icon: "notifications-outline" as const,
        text: "Notifications",
        to: "/notifications",
      },
      {
        library: "lucide" as const,
        icon: "ArrowDownUp" as const,
        text: "Storage and Data",
        to: "/storage-and-data",
      },
    ],
    support: [
      {
        library: "ionicons" as const,
        icon: "help-circle-outline" as const,
        text: "Help and feedback",
        to: "/help-and-feedback",
      },
      {
        library: "ionicons" as const,
        icon: "people-outline" as const,
        text: "Invite a friend",
        to: "/invite-a-friend",
      },
    ],
  };

  const router = useRouter();

  const handleNavigation = (to: string) => {
    router.push(to as any);
  };
  return (
    <SafeAreaProvider style={{ backgroundColor: "#f5f5f5" }}>
      <SafeAreaView edges={["top"]}>
        <ScrollView>
          <View style={{
            paddingHorizontal: 16,
          }}>
            {!searchFocus && <Text style={styles.settingHeading}>Settings</Text>}
            <SearchInput
              placeholder="Search"
              value={searchSetting}
              onChangeText={setSearchSetting}
              containerStyle={styles.searchContainer}
              onFocus={() => setSearchFocus(true)}
              onBlur={() => setSearchFocus(false)}
            />
          </View>

          <View style={styles.settingContainer}>
            <View style={{
              borderRadius: 8,
              backgroundColor: "#fff",
            }}>
              <View style={styles.userInfoContainer}>
                <View style={styles.userImageContainer}>
                  <Image
                    source={{ uri: "https://github.com/shadcn.png" }}
                    style={{ width: 50, height: 50, borderRadius: 25 }}
                  />
                </View>
                <View style={styles.userDetailsContainer}>
                  <View>
                    <Text style={styles.userName}>User</Text>
                    <Text style={styles.userBio}>User bio</Text>
                  </View>
                  <View style={{
                    backgroundColor: "#f5f5f5",
                    height: 40,
                    width: 40,
                    borderRadius: "50%",
                    justifyContent: "center",
                    alignItems: "center",
                  }}>
                    <UniversalIcon
                      library="fontawesome"
                      name="qrcode"
                      size={24}
                      color="#000"
                    />
                  </View>
                </View>
              </View>
              <View
                style={{
                  height: 1,
                  backgroundColor: "#E0E0E0",
                  marginHorizontal: 16,
                }}
              />
              <Pressable onPress={() => handleNavigation("/profile")}
                style={({ pressed }) => [
                  styles.subSettingItemContainer,
                  pressed && styles.pressedSubSettingItemContainer, styles.lastItem
                ]}>
                <View style={styles.subSettingIconContainer}>
                  <UniversalIcon
                    library="ionicons"
                    name="person-circle-outline"
                    size={24}
                    color="#000"
                  />
                </View>
                <View style={styles.subSettingTextContainer}>
                  <Text style={styles.subSettingItemText}>Avatar</Text>
                  <UniversalIcon
                    library="ionicons"
                    name="chevron-forward"
                    size={24}
                    color="#666"
                  />
                </View>
              </Pressable>
            </View>

            {/* Context Menu Section */}
            <View style={styles.subSettingContainer}>
              {subSettingData.contextMenu.map((item, idx) => (
                <View key={idx}>
                  <Pressable onPress={() => handleNavigation(item.to)}
                    style={({ pressed }) => [
                      styles.subSettingItemContainer,
                      pressed && styles.pressedSubSettingItemContainer,
                      idx === 0 && styles.firstItem,
                      idx === subSettingData.contextMenu.length - 1 && styles.lastItem
                    ]}>
                    <View style={styles.subSettingIconContainer}>
                      <UniversalIcon
                        library={item.library}
                        name={item.icon}
                        size={24}
                        color="#000"
                      />
                    </View>
                    <View style={styles.subSettingTextContainer}>
                      <Text style={styles.subSettingItemText}>{item.text}</Text>
                      <UniversalIcon
                        library="ionicons"
                        name="chevron-forward"
                        size={24}
                        color="#666"
                      />
                    </View>
                  </Pressable>
                  {
                    idx < subSettingData.contextMenu.length - 1 && (
                      <View
                        style={styles.subSettingItemSeparator}
                      />
                    )
                  }
                </View>
              ))}
            </View>

            {/* Accounts Section */}
            <View style={styles.subSettingContainer}>
              {subSettingData.accounts.map((item, idx) => (
                <View key={idx}>
                  <Pressable onPress={() => handleNavigation(item.to)}
                    style={({ pressed }) => [
                      styles.subSettingItemContainer,
                      pressed && styles.pressedSubSettingItemContainer,
                      idx === 0 && styles.firstItem,
                      idx === subSettingData.accounts.length - 1 && styles.lastItem
                    ]}>
                    <View style={styles.subSettingIconContainer}>
                      <UniversalIcon
                        library={item.library}
                        name={item.icon}
                        size={24}
                        color="#000"
                      />
                    </View>
                    <View style={styles.subSettingTextContainer}>
                      <Text style={styles.subSettingItemText}>{item.text}</Text>
                      <UniversalIcon
                        library="ionicons"
                        name="chevron-forward"
                        size={24}
                        color="#666"
                      />
                    </View>
                  </Pressable>
                  {idx < subSettingData.accounts.length - 1 && (
                    <View
                      style={styles.subSettingItemSeparator}
                    />
                  )}
                </View>
              ))}
            </View>

            {/* Support Section */}
            <View style={styles.subSettingContainer}>
              {subSettingData.support.map((item, idx) => (
                <View key={idx}>
                  <Pressable onPress={() => handleNavigation(item.to)}
                    style={({ pressed }) => [
                      styles.subSettingItemContainer,
                      pressed && styles.pressedSubSettingItemContainer,
                      idx === 0 && styles.firstItem,
                      idx === subSettingData.support.length - 1 && styles.lastItem
                    ]}>
                    <View style={styles.subSettingIconContainer}>
                      <UniversalIcon
                        library={item.library}
                        name={item.icon}
                        size={24}
                        color="#000"
                      />
                    </View>
                    <View style={styles.subSettingTextContainer}>
                      <Text style={styles.subSettingItemText}>{item.text}</Text>
                      <UniversalIcon
                        library="ionicons"
                        name="chevron-forward"
                        size={24}
                        color="#666"
                      />
                    </View>
                  </Pressable>
                  {idx < subSettingData.support.length - 1 && (
                    <View
                      style={styles.subSettingItemSeparator}
                    />
                  )}
                </View>
              ))}
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </SafeAreaProvider >
  );
};

export default Setting;

const styles = StyleSheet.create({
  settingHeading: {
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 4
  },
  searchContainer: {
    borderColor: '#e9e9e9',
    borderWidth: 1,
    borderRadius: 8,
    width: "100%",
    padding: 8,
    backgroundColor: "#e9e9e9",
  },
  settingContainer: {
    flexDirection: "column",
    gap: 24,
    marginTop: 20,
    marginHorizontal: 16,
    marginBottom: 32,
  },
  userInfoContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    padding: 16,
    backgroundColor: "#ffffff",
  },
  userImageContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
    // backgroundColor: "#C4C4C4",
    // marginRight: 12,
  },
  userDetailsContainer: {
    flex: 1,
    justifyContent: "space-between",
    flexDirection: "row",
    alignItems: "center",
  },
  userName: {
    fontSize: 18,
    fontWeight: "500",
  },
  userBio: {
    fontSize: 14,
    color: "#666",
  },

  subSettingContainer: {
    flexDirection: "column",
    // gap: 8,
    backgroundColor: "#ffffff",
    // paddingHorizontal: 16,
    // paddingVertical: 8,
    borderRadius: 8,
  },
  subSettingItemContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  pressedSubSettingItemContainer: {
    backgroundColor: "#E0E0E0",
  },
  subSettingIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  subSettingTextContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    flex: 1,
    gap: 4,
  },
  subSettingItemText: {
    fontSize: 16,
  },
  subSettingItemSeparator: {
    height: 1,
    backgroundColor: "#E0E0E0",
    // marginVertical: 8,
    marginLeft: 52,
  },
  firstItem: {
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  lastItem: {
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
  },
});
