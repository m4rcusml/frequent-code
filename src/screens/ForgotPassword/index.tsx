import { useState } from 'react';
import { Alert, ScrollView, View } from 'react-native';
import { styles } from './styles';

import { NavigationProp, useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '@/routes/stack.routes';

import { MyText } from '@/components/MyText';
import { Field } from '@/components/Field';
import { Button } from '@/components/Button';

import { Envelope } from 'phosphor-react-native';
import { getAuth, sendPasswordResetEmail } from 'firebase/auth';

export function ForgotPassword() {
  const { goBack } = useNavigation<NavigationProp<RootStackParamList>>();
  const [email, setEmail] = useState('');

  async function sendCode() {
    if (!email) {
      Alert.alert('Erro', 'Por favor, preencha o campo de email.');
      return;
    }

    const auth = getAuth();
    try {
      await sendPasswordResetEmail(auth, email);
      Alert.alert('Sucesso', 'Um e-mail de redefinição de senha foi enviado para o seu endereço.');
      goBack(); // Retorna à tela anterior
    } catch (error: any) {
      console.log(error);
      if (error.code === 'auth/invalid-email') {
        Alert.alert('Erro', 'Email inválido');
      } else if (error.code === 'auth/user-not-found') {
        Alert.alert('Erro', 'Usuário não encontrado');
      } else {
        Alert.alert(
          'Erro',
          'Ocorreu um erro ao enviar o e-mail de redefinição de senha. Tente novamente mais tarde.'
        );
      }
    }
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.form} contentContainerStyle={styles.formContent}>
        <MyText variant="h1">Redefinir senha</MyText>
        <MyText variant="subtitle1">Informe seu email para redefinir sua senha</MyText>
        <Field
          label="Email"
          placeholder="Digite seu email"
          icon={Envelope}
          value={email}
          onChangeText={setEmail}
        />
        <Button onPress={sendCode}>Enviar código</Button>
      </ScrollView>
    </View>
  );
}
