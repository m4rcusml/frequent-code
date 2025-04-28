import { Image } from 'react-native'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'

import { Home } from '@/screens/Home'
import { Report } from '@/screens/Report'
import { AdminSettings } from '@/screens/AdminSettings'

import { ChartBar, UsersThree } from 'phosphor-react-native'

export type RootTabParamList = {
  Home: undefined
  Report: undefined
  AdminSettings: undefined
}

const Stack = createBottomTabNavigator<RootTabParamList>()

export function TabRoutes() {
  return (
    <Stack.Navigator screenOptions={{
      headerShown: false,
      tabBarShowLabel: false,
      tabBarActiveTintColor: '#8A52FE',
      tabBarInactiveTintColor: '#9e9e9e',
      tabBarStyle: { height: 60 },
      tabBarIconStyle: { height: 48 },
      tabBarHideOnKeyboard: true
    }}>
      <Stack.Screen name="Home" component={Home} options={{
        tabBarIcon: ({ color, size }) => <UsersThree size={38} color={color} />
      }} />
      <Stack.Screen name="Report" component={Report} options={{
        tabBarIcon: ({ color, size }) => <ChartBar size={38} color={color} />
      }} />
      <Stack.Screen name="AdminSettings" component={AdminSettings} options={{
        tabBarIcon: ({ size }) => <Image source={require('@/assets/logo_no-title.png')} style={{ height: 44, objectFit: 'contain' }} />
      }} />
    </Stack.Navigator>
  )
}
