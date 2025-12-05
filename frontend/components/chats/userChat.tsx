import { View, Text, StyleSheet } from 'react-native'
import React from 'react'
import { Image } from 'expo-image'

const UserChat = () => {
  return (
    <View style={styles.container}>
      <View style={styles.userImageContainer}>
        <Image
          source={{ uri: "https://github.com/shadcn.png" }}
          style={styles.userImage}
        />
      </View>
      <View style={styles.userChatContainer}>
        <View style={styles.userChatTextContainer}>
          <Text style={styles.userName}>UserChat</Text>
          <Text style={styles.userMessage}>6:30 PM</Text>
        </View>
        <Text style={styles.userMessage} numberOfLines={2} ellipsizeMode='tail'>If you want, I can help you design a perfect WhatsApp chat list item with avatar + last message + time + unread count.</Text>
      </View>
    </View>
  )
}

export default UserChat

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  userImageContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    overflow: 'hidden',
    alignItems: "flex-start",
    justifyContent: "flex-start",
  },
  userImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  userChatContainer: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: "space-between",
    // gap: 8,
  },
  userChatTextContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: "space-between",
    gap: 8,
  },
  userNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0b0b0b',
  },
  userMessage: {
    fontSize: 16,
    fontWeight: 'normal',
    color: '#797979',
  },
})
