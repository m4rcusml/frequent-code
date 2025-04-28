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
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/services/firebaseConfig';
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
    console.log('Iniciando login...');

    signInWithEmailAndPassword(auth, email, password)
      .then(async (userCredential) => {
        console.log('Usuário autenticado com sucesso:', userCredential);

        const user = userCredential.user;

        // Verifica se o e-mail do usuário está disponível
        if (!user.email) {
          Alert.alert('Erro', 'O e-mail do usuário não está disponível.');
          console.log('E-mail do usuário não está disponível.');
          return;
        }

        console.log('E-mail do usuário:', user.email);

        try {
          // Verifica se o usuário é um administrador
          const adminDocRef = doc(db, 'admins', user.email); // Busca na coleção 'admins'
          const adminDoc = await getDoc(adminDocRef);

          if (adminDoc.exists()) {
            const adminData = adminDoc.data();
            console.log('Dados do administrador:', adminData);

            if (adminData?.role === 'admin') {
              Alert.alert('Bem-vindo', `Você está logado como administrador.`);
              navigate('tab'); // Navega para a tela de configurações administrativas
              return;
            }
          }

          // Se não for administrador, verifica se é um aluno
          const studentDocRef = doc(db, 'students', user.email); // Busca na coleção 'students'
          const studentDoc = await getDoc(studentDocRef);

          if (studentDoc.exists()) {
            const studentData = studentDoc.data();
            console.log('Dados do aluno:', studentData);

            // Verifica se o aluno pertence a uma turma
            if (studentData?.turma) {
              Alert.alert('Bem-vindo', `Você está logado como aluno da turma ${studentData.turma}.`);
              navigate('Student'); // Navega para a tela principal do aluno
            } else {
              Alert.alert('Erro', 'Aluno não está associado a nenhuma turma.');
              console.log('Aluno não associado a nenhuma turma.');
            }
          } else {
            Alert.alert('Erro', 'Usuário não encontrado no banco de dados.');
            console.log('Usuário não encontrado no Firestore.');
          }
        } catch (firestoreError) {
          console.log('Erro ao acessar o Firestore:', firestoreError);
          Alert.alert('Erro', 'Erro ao acessar o banco de dados. Tente novamente mais tarde.');
        }
      })
      .catch((error) => {
        console.log('Erro ao fazer login:', error);

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

        <MyText style={styles.forgot} onPress={forgotPassword}>
          Esqueci minha senha
        </MyText>
      </ScrollView>
    </View>
  );
}
