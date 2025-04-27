import { useState } from 'react';
import { ScrollView, View, Alert, Text } from 'react-native';
import { styles } from './styles';

import { NavigationProp, useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '@/routes/stack.routes';

import { MyText } from '@/components/MyText';
import { Field } from '@/components/Field';
import { Button } from '@/components/Button';

import { Envelope } from 'phosphor-react-native';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/services/firebaseConfig';

export function Register() {
  const { goBack } = useNavigation<NavigationProp<RootStackParamList>>();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState({ email: '', password: '', confirmPassword: '' });

  function validateFields() {
    let valid = true;
    const newErrors = { email: '', password: '', confirmPassword: '' };

    if (!email) {
      newErrors.email = 'O campo de email é obrigatório.';
      valid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Por favor, insira um email válido.';
      valid = false;
    }

    if (!password) {
      newErrors.password = 'O campo de senha é obrigatório.';
      valid = false;
    } else if (password.length < 6) {
      newErrors.password = 'A senha deve ter pelo menos 6 caracteres.';
      valid = false;
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = 'Por favor, confirme sua senha.';
      valid = false;
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'As senhas não coincidem.';
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  }

  function register() {
    if (!validateFields()) {
      return;
    }

    createUserWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        const user = userCredential.user;
        Alert.alert('Sucesso', 'Usuário cadastrado com sucesso!');
        goBack(); // Retorna à tela anterior
      })
      .catch((error) => {
        console.log(error);
        if (error.code === 'auth/email-already-in-use') {
          Alert.alert('Erro', 'Esse email já está em uso.');
        } else if (error.code === 'auth/invalid-email') {
          Alert.alert('Erro', 'Email inválido.');
        } else if (error.code === 'auth/weak-password') {
          Alert.alert('Erro', 'A senha deve ter pelo menos 6 caracteres.');
        } else {
          Alert.alert('Erro', 'Ocorreu um erro ao cadastrar o usuário.');
        }
      });
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.form} contentContainerStyle={styles.formContent}>
        <MyText variant="h1">Cadastro</MyText>

        <Field
          label="Email"
          placeholder="Digite seu email"
          icon={Envelope}
          value={email}
          onChangeText={(text) => {
            setEmail(text);
            setErrors((prev) => ({ ...prev, email: '' })); // Limpa o erro ao digitar
          }}
        />
        {errors.email ? <Text style={styles.errorText}>{errors.email}</Text> : null}

        <Field
          label="Senha"
          placeholder="Digite sua senha"
          isPassword
          value={password}
          onChangeText={(text) => {
            setPassword(text);
            setErrors((prev) => ({ ...prev, password: '' })); // Limpa o erro ao digitar
          }}
        />
        {errors.password ? <Text style={styles.errorText}>{errors.password}</Text> : null}

        <Field
          label="Confirmar Senha"
          placeholder="Confirme sua senha"
          isPassword
          value={confirmPassword}
          onChangeText={(text) => {
            setConfirmPassword(text);
            setErrors((prev) => ({ ...prev, confirmPassword: '' })); // Limpa o erro ao digitar
          }}
        />
        {errors.confirmPassword ? <Text style={styles.errorText}>{errors.confirmPassword}</Text> : null}

        <Button onPress={register}>Cadastrar</Button>
      </ScrollView>
    </View>
  );
}
