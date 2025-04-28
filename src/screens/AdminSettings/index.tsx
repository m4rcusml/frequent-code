import React, { useState, useEffect } from 'react';
import { ScrollView, View, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { MyText } from '@/components/MyText';
import { Field } from '@/components/Field';
import { styles } from './styles';
import { db } from '@/services/firebaseConfig';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/services/firebaseConfig';

export function AdminSettings() {
  const [turma, setTurma] = useState('');
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [currentStartTime, setCurrentStartTime] = useState('');
  const [currentEndTime, setCurrentEndTime] = useState('');

  // Função para buscar os horários atuais de check-in do Firestore
  const fetchCheckInSettings = async () => {
    try {
      const settingsDocRef = doc(db, 'settings', 'checkin');
      const settingsDoc = await getDoc(settingsDocRef);

      if (settingsDoc.exists()) {
        const { startTime, endTime } = settingsDoc.data();
        setCurrentStartTime(startTime);
        setCurrentEndTime(endTime);
      } else {
        console.log('Configurações de horário não encontradas.');
      }
    } catch (error) {
      console.log('Erro ao buscar configurações de horário:', error);
      Alert.alert('Erro', 'Não foi possível carregar as configurações de horário.');
    }
  };

  useEffect(() => {
    fetchCheckInSettings();
  }, []);

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

  const handleSaveCheckInSettings = async () => {
    if (!startTime || !endTime) {
      Alert.alert('Erro', 'Por favor, preencha os horários de início e término.');
      return;
    }

    try {
      // Salva o intervalo de horário permitido no Firestore
      await setDoc(doc(db, 'settings', 'checkin'), {
        startTime,
        endTime,
      });

      Alert.alert('Sucesso', 'Configurações de horário de check-in salvas com sucesso!');
      setStartTime('');
      setEndTime('');

      // Atualiza os horários exibidos
      fetchCheckInSettings();
    } catch (error) {
      console.log('Erro ao salvar configurações de horário:', error);
      Alert.alert('Erro', 'Não foi possível salvar as configurações de horário.');
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

        <MyText variant="h1" style={styles.title}>
          Configurações de Check-in
        </MyText>

        {/* Exibição dos horários atuais */}
        <View style={styles.currentSettingsContainer}>
          <MyText variant="h2" style={styles.currentSettingsText}>
            Horário Atual de Início: {currentStartTime || 'Não definido'}
          </MyText>
          <MyText variant="h2" style={styles.currentSettingsText}>
            Horário Atual de Término: {currentEndTime || 'Não definido'}
          </MyText>
        </View>

        <Field
          label="Horário de Início"
          placeholder="Ex: 07:00"
          value={startTime}
          onChangeText={setStartTime}
        />
        <Field
          label="Horário de Término"
          placeholder="Ex: 11:00"
          value={endTime}
          onChangeText={setEndTime}
        />

        <TouchableOpacity style={styles.addButton} onPress={handleSaveCheckInSettings}>
          <MyText variant="h2" style={styles.addButtonText}>
            Salvar Configurações
          </MyText>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}