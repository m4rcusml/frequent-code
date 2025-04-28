import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Login } from '@/screens/Login';
import { Register } from '@/screens/Register';
import { ForgotPassword } from '@/screens/ForgotPassword';
import { TabRoutes } from './tab.routes';
import { Student } from '@/screens/Student'; // Importação da tela do aluno
import { AdminSettings } from '@/screens/AdminSettings'; // Importação da tela de configurações administrativas

export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
  tab: undefined;
  Student: undefined; // Rota para a tela do aluno
  AdminSettings: undefined; // Rota para a tela de configurações administrativas
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export function StackRoutes() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: '#8A52FE',
        },
        headerTintColor: '#fff',
      }}
    >
      <Stack.Screen name="Login" component={Login} options={{ headerShown: false }} />
      <Stack.Screen name="Register" component={Register} options={{ title: 'Voltar' }} />
      <Stack.Screen name="ForgotPassword" component={ForgotPassword} options={{ title: 'Voltar' }} />
      <Stack.Screen name="tab" component={TabRoutes} options={{ headerShown: false }} />
      <Stack.Screen name="Student" component={Student} options={{ title: 'Aluno' }} />
      <Stack.Screen name="AdminSettings" component={AdminSettings} options={{ title: 'Configurações' }} />
    </Stack.Navigator>
  );
}
