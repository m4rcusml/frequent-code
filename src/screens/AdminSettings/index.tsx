import React, { useState } from 'react';
import { ScrollView, View, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { MyText } from '@/components/MyText';
import { Field } from '@/components/Field';
import { styles } from './styles';
import { db } from '@/services/firebaseConfig';
import { doc, setDoc } from 'firebase/firestore';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/services/firebaseConfig';

export function AdminSettings() {
  const [turma, setTurma] = useState('');
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');

  const handleAddStudent = async () => {
    if (!turma || !nome || !email) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos.');
      return;
    }

    try {
      // Cria a conta no Firebase Authentication com uma senha padrão
      const password = '123456'; // Senha padrão
      await createUserWithEmailAndPassword(auth, email, password);

      // Salva os dados do aluno no Firestore com o e-mail como ID do documento
      await setDoc(doc(db, 'students', email), {
        turma,
        nome,
        email,
        role: 'student', // Adiciona o campo "role" para diferenciar alunos
      });

      Alert.alert('Sucesso', 'Aluno adicionado com sucesso! A senha padrão é "123456".');
      setTurma('');
      setNome('');
      setEmail('');
    } catch (error) {
      console.log('Erro ao adicionar aluno:', error);
      Alert.alert('Erro', 'Não foi possível adicionar o aluno.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <MyText variant="h1" style={styles.title}>
          Configurações Administrativas
        </MyText>

        <Field
          label="Turma"
          placeholder="Ex: 3ano-xx"
          value={turma}
          onChangeText={setTurma}
        />
        <Field
          label="Nome do Aluno"
          placeholder="Ex: João Silva"
          value={nome}
          onChangeText={setNome}
        />
        <Field
          label="E-mail do Aluno"
          placeholder="Ex: aluno@email.com"
          value={email}
          onChangeText={setEmail}
        />

        <TouchableOpacity style={styles.addButton} onPress={handleAddStudent}>
          <MyText variant="h2" style={styles.addButtonText}>
            Adicionar Aluno
          </MyText>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}