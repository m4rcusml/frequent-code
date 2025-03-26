import { useState } from 'react'
import { Image, ImageBackground, ScrollView, View } from 'react-native'
import { styles } from './styles'

import { NavigationProp, useNavigation } from '@react-navigation/native'
import { RootStackParamList } from '@/routes/stack.routes'

import { MyText } from '@/components/MyText'
import { Field } from '@/components/Field'
import { Button } from '@/components/Button'

import { CalendarBlank, Envelope, User } from 'phosphor-react-native'

import BgImg from '@/assets/bg.png'
import Checked from '@/assets/checked.png'

export function Register() {
  const { navigate, goBack } = useNavigation<NavigationProp<RootStackParamList>>();
  const [isRegistered, setIsRegistered] = useState(false);

  function register() {
    setIsRegistered(true)
    goBack()
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.form} contentContainerStyle={styles.formContent}>
        <MyText variant='h1'>Cadastro</MyText>
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
        <Field
          label='Confirmar Senha'
          placeholder='Confirme sua senha'
          isPassword
        />

        <Button onPress={register}>Cadastrar</Button>
      </ScrollView>
    </View>
  )
}
