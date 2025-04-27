import { useState } from 'react';
import { Image, ScrollView, View, Alert } from 'react-native';
import { MyText } from '@/components/MyText';
import { styles } from './styles';

import Logo from '@/assets/logo.png';
import { Field } from '@/components/Field';
import { Envelope, WarningCircle } from 'phosphor-react-native';
import { Button } from '@/components/Button';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { RootTabParamList } from '@/routes/tab.routes';
import { RootStackParamList } from '@/routes/stack.routes';

export function Login() {
  const { navigate } = useNavigation<NavigationProp<RootTabParamList & RootStackParamList>>();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({ email: '', password: '' });

  function validateFields() {
    let valid = true;
    const newErrors = { email: '', password: '' };

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
    }

    setErrors(newErrors);
    return valid;
  }

  function login() {
    if (!validateFields()) {
      return;
    }

    const auth = getAuth();
    signInWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        const user = userCredential.user;
        navigate('tab'); // Navega para a tela principal
      })
      .catch((error) => {
        console.log(error)
        if (error.code === 'auth/invalid-credential') {
          Alert.alert('Erro', 'Email ou senha incorretos');
        } else if (error.code === 'auth/invalid-email') {
          Alert.alert('Erro', 'Email inválido');
        } else if (error.code === 'auth/user-disabled') {
          Alert.alert('Erro', 'Usuário desabilitado');
        } else {
          Alert.alert('Erro', 'Erro ao fazer login. Tente novamente mais tarde.');
        }
        
      });
  }

  function forgotPassword() {
    navigate('ForgotPassword');
  }

  function register() {
    navigate('Register');
  }

  return (
    <View style={styles.container}>
      <Image source={Logo} style={styles.logo} />

      <ScrollView style={styles.form} contentContainerStyle={styles.formContent}>
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
        {errors.email ? (
          <View style={styles.errorContainer}>
            <WarningCircle size={16} color="red" />
            <MyText style={styles.errorText}>{errors.email}</MyText>
          </View>
        ) : null}

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
        {errors.password ? (
          <View style={styles.errorContainer}>
            <WarningCircle size={16} color="red" />
            <MyText style={styles.errorText}>{errors.password}</MyText>
          </View>
        ) : null}

        <Button onPress={login}>Entrar</Button>

        <MyText style={styles.forgot} onPress={register}>
          Criar uma conta
        </MyText>
        <MyText style={styles.forgot} onPress={forgotPassword}>
          Esqueci minha senha
        </MyText>
      </ScrollView>
    </View>
  );
}
