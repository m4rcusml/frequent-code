import React, { useState, useEffect } from 'react';
import { ScrollView, View, TouchableOpacity, Alert, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Location from 'expo-location';

import { MyText } from '@/components/MyText';
import { Field } from '@/components/Field';
import { styles } from './styles';
import { createUser, updateSettings } from '@/services/database';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/services/firebaseConfig';

const { width, height } = Dimensions.get('window');

export function AdminSettings() {
  const [turma, setTurma] = useState('');
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [selectedLocation, setSelectedLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [radius, setRadius] = useState('100'); // Raio em metros
  const [address, setAddress] = useState<string>('');
  const [phone, setPhone] = useState('');
  const [addressField, setAddressField] = useState('');

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const location = await Location.getCurrentPositionAsync({});
        setSelectedLocation({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        });
        // Obter endereço
        const [addressResult] = await Location.reverseGeocodeAsync({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        });
        if (addressResult) {
          setAddress(
            `${addressResult.street}, ${addressResult.district}, ${addressResult.city}`
          );
        }
      }
    })();
  }, []);

  const handleAddStudent = async () => {
    if (!turma || !nome || !email) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos.');
      return;
    }

    try {
      const password = '123456';
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);

      await createUser({
        id: userCredential.user.uid,
        email,
        name: nome,
        role: 'student',
        status: 'active',
        profile: {
          avatar: null,
          phone: phone || null,
          address: addressField || null,
          classId: turma,
        },
      });

      Alert.alert('Sucesso', 'Aluno adicionado com sucesso! A senha padrão é "123456".');
      setTurma('');
      setNome('');
      setEmail('');
      setPhone('');
      setAddressField('');
    } catch (error: any) {
      console.log('Erro ao adicionar aluno:', error);
      if (error.code === 'auth/email-already-in-use') {
        Alert.alert('Erro', 'Este e-mail já está em uso.');
      } else {
        Alert.alert('Erro', 'Não foi possível adicionar o aluno.');
      }
    }
  };

  const handleSaveCheckInSettings = async () => {
    if (!startTime || !endTime || !selectedLocation) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos e selecione um local.');
      return;
    }

    try {
      await updateSettings('checkin', {
        checkin: {
          allowedTimeWindow: {
            start: startTime,
            end: endTime,
          },
          maxDistance: parseInt(radius),
          requireLocation: true,
          requirePhoto: false,
          allowedLocation: {
            latitude: selectedLocation.latitude,
            longitude: selectedLocation.longitude,
            radius: parseInt(radius),
          },
        },
        notification: {
          enabled: true,
          channels: ['email'],
          schedule: {
            time: '08:00',
            days: [1, 2, 3, 4, 5],
          },
        },
      }, auth.currentUser?.email || 'system');

      Alert.alert('Sucesso', 'Configurações de check-in salvas com sucesso!');
      setStartTime('');
      setEndTime('');
    } catch (error) {
      console.log('Erro ao salvar configurações:', error);
      Alert.alert('Erro', 'Não foi possível salvar as configurações.');
    }
  };

  const handleUpdateLocation = async () => {
    try {
      const location = await Location.getCurrentPositionAsync({});
      setSelectedLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });
      
      // Obter endereço
      const [addressResult] = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });
      if (addressResult) {
        setAddress(
          `${addressResult.street}, ${addressResult.district}, ${addressResult.city}`
        );
      }
      
      Alert.alert('Sucesso', 'Localização atualizada com sucesso!');
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível obter a localização atual.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <MyText variant="h1" style={styles.title}>
          Configurações
        </MyText>

        <View style={styles.section}>
          <MyText variant="h2">Adicionar Aluno</MyText>
          <Field
            label="Turma"
            placeholder="3ano-xx"
            value={turma}
            onChangeText={setTurma}
          />
          <Field
            label="Nome"
            placeholder="Nome do aluno"
            value={nome}
            onChangeText={setNome}
          />
          <Field
            label="Email"
            placeholder="email@exemplo.com"
            value={email}
            onChangeText={setEmail}
          />
          <Field
            label="Telefone (opcional)"
            placeholder="(92) 99999-9999"
            value={phone}
            onChangeText={setPhone}
          />
          <Field
            label="Endereço (opcional)"
            placeholder="Rua, número, bairro"
            value={addressField}
            onChangeText={setAddressField}
          />
          <TouchableOpacity
            style={styles.button}
            onPress={handleAddStudent}
          >
            <MyText variant="button">Adicionar Aluno</MyText>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <MyText variant="h2">Configurações de Check-in</MyText>
          <Field
            label="Horário de Início"
            placeholder="08:00"
            value={startTime}
            onChangeText={setStartTime}
          />
          <Field
            label="Horário de Término"
            placeholder="18:00"
            value={endTime}
            onChangeText={setEndTime}
          />
          <Field
            label="Raio Permitido (metros)"
            placeholder="100"
            value={radius}
            onChangeText={setRadius}
            keyboardType="numeric"
          />
          
          <View style={styles.locationContainer}>
            <MyText variant="h5">Localização Atual</MyText>
            {selectedLocation ? (
              <>
                <MyText variant="body1">
                  Endereço: {address || 'Carregando...'}
                </MyText>
                <MyText variant="body1">
                  Latitude: {selectedLocation.latitude.toFixed(6)}
                </MyText>
                <MyText variant="body1">
                  Longitude: {selectedLocation.longitude.toFixed(6)}
                </MyText>
              </>
            ) : (
              <MyText variant="body1">Nenhuma localização selecionada</MyText>
            )}
            <TouchableOpacity
              style={styles.button}
              onPress={handleUpdateLocation}
            >
              <MyText variant="button">Atualizar Localização</MyText>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.button}
            onPress={handleSaveCheckInSettings}
          >
            <MyText variant="button">Salvar Configurações</MyText>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}