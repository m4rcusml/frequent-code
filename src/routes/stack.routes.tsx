import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { Login } from '@/screens/Login'
import { Register } from '@/screens/Register'
import { ForgotPassword } from '@/screens/ForgotPassword'
import { TabRoutes } from './tab.routes'

export type RootStackParamList = {
  Login: undefined
  Register: undefined
  ForgotPassword: undefined
  tab: undefined
}

const Stack = createNativeStackNavigator<RootStackParamList>()

export function StackRoutes() {
  return (
    <Stack.Navigator screenOptions={{
      headerStyle: {
        backgroundColor: '#8A52FE',
      },
      headerTintColor: '#fff',
    }}>
      <Stack.Screen name="Login" component={Login} options={{ headerShown: false }} />
      <Stack.Screen name="Register" component={Register} options={{ title: 'Voltar' }} />
      <Stack.Screen name="ForgotPassword" component={ForgotPassword} options={{ title: 'Voltar' }} />
      <Stack.Screen name="tab" component={TabRoutes} options={{ headerShown: false }} />
    </Stack.Navigator>
  )
}
