import UniversalIcon from '@/components/UniversalIcon'
import { Tabs } from 'expo-router'
import React from 'react'

const TabLayout = () => {
  return (
    <Tabs
      initialRouteName='index'
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#000',
        tabBarInactiveTintColor: '#6B7280',
      }}
    >
      <Tabs.Screen name="update" options={{
        title: 'Update',
        tabBarIcon: ({ focused }) => (
          <UniversalIcon
            family='MaterialCommunityIcons'
            name={focused ? 'update' : 'update'}
            size={28}
            color='#000'
          />
        )
      }} />
      <Tabs.Screen name="calls" options={{
        title: 'Calls',
        tabBarIcon: ({ focused }) => (
          <UniversalIcon
            family='Ionicons'
            name={focused ? 'call' : 'call-outline'}
            size={28}
            color='#000'
          />
        )
      }} />
      <Tabs.Screen name="communities" options={{
        title: 'Communities',
        tabBarIcon: ({ focused }) => (
          <UniversalIcon
            family='Ionicons'
            name={focused ? 'people' : 'people-outline'}
            size={28}
            color='#000'
          />
        )
      }} />
      <Tabs.Screen name="index" options={{
        // title: 'Chats',
        tabBarIcon: ({ focused }) => (
          <UniversalIcon
            family='Ionicons'
            name={focused ? 'chatbubbles' : 'chatbubbles-outline'}
            size={28}
            color='#000'
          />
        ),
      }} />
      <Tabs.Screen name="setting" options={{
        title: 'Settings',
        tabBarIcon: ({ focused }) => (
          <UniversalIcon
            family='Ionicons'
            name={focused ? 'cog' : 'cog-outline'}
            size={28}
            color='#000'
          />
        )
      }} />
    </Tabs>
  )
}

export default TabLayout