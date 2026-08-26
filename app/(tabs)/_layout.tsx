import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/theme';

type IoniconName = React.ComponentProps<typeof Ionicons>['name'];

function TabIcon({
  focused,
  label,
  icon,
  iconActive,
}: {
  focused: boolean;
  label: string;
  icon: IoniconName;
  iconActive: IoniconName;
}) {
  return (
    <View style={styles.tabItem}>
      <Ionicons
        name={focused ? iconActive : icon}
        size={22}
        color={focused ? Colors.inkBlack : Colors.gray}
      />
      <Text style={[styles.tabLabel, focused && styles.tabLabelActive]} numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarShowLabel: false,
        tabBarActiveTintColor: Colors.inkBlack,
        tabBarInactiveTintColor: Colors.gray,
        tabBarItemStyle: styles.tabBarItem,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon
              focused={focused}
              label="Shop"
              icon="storefront-outline"
              iconActive="storefront"
            />
          ),
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} label="Search" icon="search-outline" iconActive="search" />
          ),
        }}
      />
      <Tabs.Screen
        name="specimens"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} label="Specimens" icon="bug-outline" iconActive="bug" />
          ),
        }}
      />
      <Tabs.Screen
        name="account"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon
              focused={focused}
              label="Account"
              icon="person-circle-outline"
              iconActive="person-circle"
            />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: Colors.paperWhite,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
    height: 80,
    paddingTop: 8,
    paddingBottom: 20,
    paddingHorizontal: 8,
  },
  tabBarItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    minWidth: 60,
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: 'bold',
    color: Colors.gray,
    textAlign: 'center',
  },
  tabLabelActive: {
    color: Colors.inkBlack,
  },
});
