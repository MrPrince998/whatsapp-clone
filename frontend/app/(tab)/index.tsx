import SearchBar from '@/components/SearchBar'
import SingleChat from '@/components/singleChat'
import UniversalIcon from '@/components/UniversalIcon'
import React, { useState } from 'react'
import { FlatList, Pressable, ScrollView, Text, TouchableOpacity, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

const Chats = () => {
  const [activeTag, setActiveTag] = useState<number>(1)
  const quickTags = [
    {
      id: 1,
      name: 'All'
    },
    {
      id: 2,
      name: 'Unread',
    },
    {
      id: 3,
      name: 'Favorites'
    },
    {
      id: 4,
      name: "Groups"
    },
    {
      id: 5,
      name: "Add"
    }
  ]
  return (
    <SafeAreaView className='flex-1 bg-white' edges={['top']}>
      {/* chat page header */}
      <View className='justify-between items-center flex-row px-4 py-3'>
        <TouchableOpacity
          className='bg-gray-100 rounded-full p-2'
          activeOpacity={0.7}
        >
          <UniversalIcon
            family='Entypo'
            name='dots-three-horizontal'
            size={20}
            color='#000'
          />
        </TouchableOpacity>
        <Text className='text-lg font-semibold text-center flex-1'>Chats</Text>
        <View className='flex-row gap-3'>
          <TouchableOpacity
            className='bg-gray-100 rounded-full p-2'
            activeOpacity={0.7}
          >
            <UniversalIcon
              family='Entypo'
              name='camera'
              size={20}
              color='#000'
            />
          </TouchableOpacity>
          <TouchableOpacity
            className='bg-green-700 rounded-full p-2'
            activeOpacity={0.7}
          >
            <UniversalIcon
              family='Entypo'
              name='plus'
              size={20}
              color='#fff'
            />
          </TouchableOpacity>
        </View>
      </View>
      {/* chat list */}
      <ScrollView className='px-4 py-2 flex-1'>
        <View className='mb-4'>
          <Text className='text-3xl font-bold mb-2'>Chats</Text>
          <SearchBar
            placeholder="Search..."
            leftIcon={{ family: 'Ionicons', name: 'search' }}
            containerClassName='rounded-lg py-0'
          />
        </View>
        <FlatList
          data={quickTags}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item, index }) => {
            if (item.name == "Add") {
              return (
                <Pressable>
                  {({ pressed }) => (<View
                    className={`p-2 border rounded-full border-gray-300 ${pressed ? 'bg-gray-400' : ''}`}>
                    <UniversalIcon name='plus' family='Entypo' size={20} color='#000' />
                  </View>)
                  }
                </Pressable>
              )
            }
            return (
              <Pressable onPress={() => setActiveTag(item.id)}>
                {({ pressed }) => (
                  <View
                    className={`rounded-full px-4 py-2 border ${activeTag === item.id ? 'border-green-500 bg-green-200' : 'border-gray-400'}
                      ${pressed ? activeTag === item.id ? 'bg-green-700' : 'bg-gray-400' : ''}
                    `}
                  >
                    <Text
                      className={`text-sm font-semibold ${activeTag === item.id ? 'text-green-900' : 'text-gray-700'}`}
                    >
                      {item.name}
                    </Text>
                  </View>
                )}
              </Pressable>
            )
          }}
          horizontal
          showsHorizontalScrollIndicator={false}
          ItemSeparatorComponent={() => <View className='w-2' />}
        />

        <SingleChat />
      </ScrollView>

    </SafeAreaView >
  )
}

export default Chats