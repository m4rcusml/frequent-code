import { useState, useRef } from 'react'
import { ImageBackground, ScrollView, View, Image, TextInput } from 'react-native'
import { styles } from './styles'

import { NavigationProp, useNavigation } from '@react-navigation/native'
import { RootStackParamList } from '@/routes/stack.routes'

import { MyText } from '@/components/MyText'
import { Field } from '@/components/Field'
import { Button } from '@/components/Button'

import { Envelope } from 'phosphor-react-native'

import BgImg from '@/assets/bg.png'
import Checked from '@/assets/checked.png'
import Locker from '@/assets/locker.png'

export function ForgotPassword() {
  const { goBack } = useNavigation<NavigationProp<RootStackParamList>>();

  function sendCode() {
    goBack()
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.form} contentContainerStyle={styles.formContent}>
        <MyText variant='h1'>Redefinir senha</MyText>
        <MyText variant='subtitle1'>Informe seu email para redefinir sua senha</MyText>
        <Field
          label='Email'
          placeholder='Digite seu email'
          icon={Envelope}
        />

        <Button onPress={sendCode}>Enviar código</Button>
      </ScrollView>
    </View>
  )
}
