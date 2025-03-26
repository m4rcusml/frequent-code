import { Image, ImageBackground, ScrollView, View } from 'react-native'
import { MyText } from '@/components/MyText'
import { styles } from './styles'

import BgImg from '@/assets/bg.png'
import Logo from '@/assets/logo.png'
import { Field } from '@/components/Field'
import { Envelope, FacebookLogo, GoogleLogo, LinkedinLogo, XLogo } from 'phosphor-react-native'
import { Button } from '@/components/Button'
import { NavigationProp, useNavigation } from '@react-navigation/native'
import { getAuth, signInWithEmailAndPassword, GoogleAuthProvider, FacebookAuthProvider, signInWithPopup } from 'firebase/auth'
import { RootTabParamList } from '@/routes/tab.routes'
import { RootStackParamList } from '@/routes/stack.routes'
// import { useGoogleAuth } from '@/services/auth'

export function Login() {
  const { navigate } = useNavigation<NavigationProp<RootTabParamList & RootStackParamList>>();
  // const { signIn, user } = useGoogleAuth();

  // const auth = getAuth()

  function forgotPassword() {
    navigate('ForgotPassword')
  }

  function register() {
    navigate('Register')
  }

  function login() {
    // signInWithEmailAndPassword(auth, 'email', 'password')
    //   .then(() => {
    navigate('tab')
    // })
    // .catch(() => {
    //   alert('Erro ao logar')
    // })
  }

  function loginWithGoogle() {
    // signIn()
    //   .then(() => {
    navigate('tab')
    // })
    // .catch(() => {
    //   alert('Erro ao logar com Google')
    // })
  }

  function loginWithFacebook() {
    // const provider = new FacebookAuthProvider()
    // signInWithPopup(auth, provider)
    //   .then(() => {
    navigate('tab')
    // })
    // .catch(() => {
    //   alert('Erro ao logar com Facebook')
    // })
  }

  function loginWithX() {
    navigate('tab')
  }

  function loginWithLinkedin() {
    navigate('tab')
  }

  return (
    <View style={styles.container}>
      <Image
        source={Logo}
        style={styles.logo}
      />

      <ScrollView style={styles.form} contentContainerStyle={styles.formContent}>
        <Field
          label='Email'
          placeholder='Digite seu email'
          icon={Envelope}
        />
        <Field
          label='Senha'
          placeholder='Digite sua senha'
          isPassword
        />

        <Button onPress={login}>Entrar</Button>
        
        <MyText style={styles.forgot} onPress={register}>Criar uma conta</MyText>
        <MyText style={styles.forgot} onPress={forgotPassword}>Esqueci minha senha</MyText>
      </ScrollView>
    </View>
  )
}
