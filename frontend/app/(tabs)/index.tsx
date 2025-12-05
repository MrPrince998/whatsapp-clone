import { UniversalIcon } from '@/components/ui/universal-icon';
import { StyleSheet, Text, View, Pressable, ScrollView, FlatList } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { DropdownMenu } from '@/components/ui/dropdown-menu';
import { SearchInput } from '@/components/ui/search-input';
import { useState } from 'react';
import UserChat from '@/components/chats/userChat';
import Seperator from '@/components/seperator';
import NewList from '@/components/chats/newList';

export default function HomeScreen() {
  const [searchChat, setSearchChat] = useState<string>("");
  const [currentTag, setCurrentTag] = useState<string>("All");
  const [newListModal, setNewListModal] = useState<boolean>(false);
  const tags = [
    {
      id: 1,
      name: "All",
    },
    {
      id: 2,
      name: "unread"
    },
    {
      id: 3,
      name: "Favorites"
    },
    {
      id: 4,
      name: "Groups"
    },
    {
      id: 5,
      icon: "plus",
    }
  ]

  const handleChangeTab = (tag: string) => {
    setCurrentTag(tag);
  }
  return (
    <SafeAreaProvider style={{ backgroundColor: "#f5f5f5" }}>
      {/* top navigation */}
      <SafeAreaView edges={["top"]}>
        <View style={styles.chatTopNavContainer}>
          <DropdownMenu
            trigger={
              <View style={styles.ellipseIconContainer}>
                <UniversalIcon library='feather' name='more-horizontal' size={24} color="#000" />
              </View>
            }
            items={[
              {
                label: "Select chats",
                icon: { library: "ionicons", name: "checkmark-circle-outline" },
                onPress: () => console.log("Select chats"),
              },
              {
                label: "Read all",
                icon: { library: "ionicons", name: "checkmark-done-outline" },
                onPress: () => console.log("Read all"),
              },
            ]}
            align="left"
          />
          <View style={styles.rightNavContainer}>
            <Pressable style={styles.cameraIconContainer}>
              <UniversalIcon library='ionicons' name='camera' size={24} color="#000" />
            </Pressable>
            <Pressable style={styles.plusIconContainer} onPress={() => setNewListModal(true)}>
              <UniversalIcon library='feather' name='plus' size={20} color="#fff" />
            </Pressable>
          </View>
        </View>

        <ScrollView style={{
          height: "100%",
        }}>
          {/* heading */}
          <View style={styles.chatContainer}>
            <Text style={styles.chatHeading}>Chats</Text>

            <SearchInput
              placeholder="Ask Meta AI or Search"
              value={searchChat}
              onChangeText={setSearchChat}
              containerStyle={styles.searchContainer}
            />
          </View>

          <FlatList
            data={tags}
            keyExtractor={(item) => item.id.toString()}
            horizontal
            style={styles.tagList}
            renderItem={({ item, index }) => {
              if (item.icon)
                return (<Pressable onPress={() => ""} style={[styles.tagContainer, index === 0 && styles.tagContainerActive]}>
                  <UniversalIcon library='feather' name='plus' size={20} color="#0b0b0b" />
                </Pressable>)
              return (< Pressable onPress={() => handleChangeTab(item.name as any)} style={[styles.tagContainer, currentTag === item.name && styles.tagContainerActive]}>
                <Text style={[styles.tagText, currentTag === item.name && styles.tagTextActive]}>{item.name}</Text>
              </Pressable>)
            }
            }
          />

          {/* chat list */}
          <View style={styles.chatListContainer}>
            <UserChat />
            <Seperator style={{ marginLeft: 60 }} />
            <UserChat />
          </View>
        </ScrollView>





      </SafeAreaView>
      <NewList isOpen={newListModal} onClose={() => setNewListModal(false)} />
    </SafeAreaProvider >
  );
}

const styles = StyleSheet.create({
  chatTopNavContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  rightNavContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  ellipseIconContainer: {
    width: 30,
    height: 30,
    borderRadius: 20,
    backgroundColor: "#e9e9e9",
    justifyContent: "center",
    alignItems: "center",
  },
  cameraIconContainer: {
    width: 30,
    height: 30,
    borderRadius: 20,
    backgroundColor: "#f9f9f9",
    justifyContent: "center",
    alignItems: "center",
  },
  plusIconContainer: {
    padding: 4,
    borderRadius: 20,
    backgroundColor: "green",
    justifyContent: "center",
    alignItems: "center",
  },
  chatContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  chatHeading: {
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 8,
  },
  searchContainer: {
    borderColor: '#e9e9e9',
    borderWidth: 1,
    borderRadius: 8,
    width: "100%",
    padding: 8,
    backgroundColor: "#e9e9e9",
  },
  tagList: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  tagContainer: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    backgroundColor: "#f9f9f9",
    marginRight: 8,
    borderColor: "#d2d2d2",
    borderWidth: 1,
  },
  tagContainerActive: {
    backgroundColor: "#a5f3b2ff",
    borderColor: "#3dbe52ff",
    borderWidth: 1,
  },
  tagText: {
    fontSize: 16,
    fontWeight: "normal",
    color: "#0b0b0b",
  },
  tagTextActive: {
    color: "#0b0b0b",
  },
  chatListContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    flexDirection: "column",
    gap: 8,
  },
});
