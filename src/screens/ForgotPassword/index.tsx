import { useState } from 'react';
import { Alert, ScrollView, View } from 'react-native';
import { styles } from './styles';

import { NavigationProp, useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '@/routes/stack.routes';

import { MyText } from '@/components/MyText';
import { Field } from '@/components/Field';
import { Button } from '@/components/Button';

import { Envelope } from 'phosphor-react-native';

export function ForgotPassword() {
  const { goBack } = useNavigation<NavigationProp<RootStackParamList>>();
  const [email, setEmail] = useState(''); // Adicionado estado para o email

  function sendCode() {
    if (!email) {
      Alert.alert('Erro', 'Por favor, preencha o campo de email.');
      return;
    }

    Alert.alert('Código enviado', 'Um código foi enviado para o seu email.');
    // goBack();
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
          value={email} // Passa o valor do estado
          onChangeText={setEmail} // Atualiza o estado ao digitar
        />
        <Button onPress={sendCode}>Enviar código</Button>
      </ScrollView>
    </View>
  );
}
