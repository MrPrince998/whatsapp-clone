import { useRouter } from 'expo-router'
import React from 'react'
import { Image, Pressable, Text, View } from 'react-native'

interface SingleChatProps {
  avatarUrl?: string
  username?: string
  lastMessage?: string
  time?: string
  unreadCount?: number
  chatId?: string
}

const SingleChat = ({
  avatarUrl = "https://github.com/shadcn.png",
  username = "Username",
  lastMessage = "Messages",
  time = "12:40 PM",
  unreadCount = 100,
  chatId = "1"
}: SingleChatProps) => {
  const router = useRouter()
  return (
    <Pressable
      onPress={() => router.push("/screens/chatList")}
      style={({ pressed }) => ({
        backgroundColor: pressed ? "red" : "yellow",
        width: "100%",
        padding: 12
      })}
    >
      <View className='flex-row items-center gap-3 py-3 px-4'>
        {/* Avatar */}
        <View
          className='bg-gray-200 justify-center items-center'
          style={{ width: 48, height: 48, borderRadius: 24, overflow: 'hidden' }}
        >
          <Image
            source={{ uri: avatarUrl }}
            style={{ width: 48, height: 48 }}
            resizeMode="cover"
          />
        </View>

        {/* Chat Info */}
        <View className='flex-1 flex-col'>
          {/* Username and Time Row */}
          <View className='flex-row items-center justify-between'>
            <Text
              className='font-semibold text-base text-gray-900'
              numberOfLines={1}
            >
              {username}
            </Text>
            <Text className='text-xs text-gray-500 ml-2'>{time}</Text>
          </View>

          {/* Last Message and Unread Badge Row */}
          <View className='flex-row items-center justify-between'>
            <Text
              className='text-sm text-gray-600 flex-1'
              numberOfLines={1}
            >
              {lastMessage}
            </Text>
            {unreadCount > 0 && (
              <View className='bg-green-500 rounded-full h-5 min-w-5 items-center justify-center px-1.5 ml-2'>
                <Text className='text-white text-xs font-bold'>
                  {unreadCount > 99 ? '99+' : unreadCount}
                </Text>
              </View>
            )}
          </View>
        </View>
      </View>
    </Pressable>
  )
}

export default SingleChat