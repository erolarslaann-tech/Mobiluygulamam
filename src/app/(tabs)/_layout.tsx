import { Redirect, Tabs } from 'expo-router';
import { Text } from 'react-native';

import { Colors } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';

function TabIcon({ emoji, focused }: { emoji: string; focused: boolean }) {
  return <Text style={{ fontSize: 20, opacity: focused ? 1 : 0.5 }}>{emoji}</Text>;
}

export default function TabsLayout() {
  const { user, loading } = useAuth();

  if (loading) return null;
  if (!user) return <Redirect href="/login" />;

  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: Colors.primary },
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: '700' },
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textMuted,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Duyurular',
          tabBarIcon: ({ focused }) => <TabIcon emoji="📢" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="etkinlikler"
        options={{
          title: 'Etkinlikler',
          tabBarIcon: ({ focused }) => <TabIcon emoji="🎉" focused={focused} />,
        }}
      />
      {user.role === 'admin' ? (
        <Tabs.Screen
          name="yonetim"
          options={{
            title: 'Yönetim',
            tabBarIcon: ({ focused }) => <TabIcon emoji="🛠️" focused={focused} />,
          }}
        />
      ) : null}
      <Tabs.Screen
        name="profil"
        options={{
          title: 'Profil',
          tabBarIcon: ({ focused }) => <TabIcon emoji="👤" focused={focused} />,
        }}
      />
    </Tabs>
  );
}
