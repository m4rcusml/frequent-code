import React, { useState, useEffect } from 'react';
import { ScrollView, View, TouchableOpacity, Alert, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MapView, { Marker, Circle } from 'react-native-maps';
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
  const [mapRegion, setMapRegion] = useState({
    latitude: -23.550520,
    longitude: -46.633308,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const location = await Location.getCurrentPositionAsync({});
        const newRegion = {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        };
        setMapRegion(newRegion);
        setSelectedLocation({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        });
        updateAddress(location.coords.latitude, location.coords.longitude);
      }
    })();
  }, []);

  const updateAddress = async (latitude: number, longitude: number) => {
    try {
      const [addressResult] = await Location.reverseGeocodeAsync({
        latitude,
        longitude,
      });
      if (addressResult) {
        setAddress(
          `${addressResult.street}, ${addressResult.district}, ${addressResult.city}`
        );
      }
    } catch (error) {
      console.log('Erro ao obter endereço:', error);
    }
  };

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
          phone: null,
          address: null,
        },
      });

      Alert.alert('Sucesso', 'Aluno adicionado com sucesso! A senha padrão é "123456".');
      setTurma('');
      setNome('');
      setEmail('');
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

  const handleMapPress = async (e: any) => {
    const { latitude, longitude } = e.nativeEvent.coordinate;
    setSelectedLocation({ latitude, longitude });
    updateAddress(latitude, longitude);
  };

  const handleUpdateLocation = async () => {
    try {
      const location = await Location.getCurrentPositionAsync({});
      const newRegion = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      };
      setMapRegion(newRegion);
      setSelectedLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });
      updateAddress(location.coords.latitude, location.coords.longitude);
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
            <MyText variant="h5">Localização do Check-in</MyText>
            <View style={styles.mapContainer}>
              <MapView
                style={styles.map}
                region={mapRegion}
                onRegionChangeComplete={setMapRegion}
                onPress={handleMapPress}
              >
                {selectedLocation && (
                  <>
                    <Marker
                      coordinate={selectedLocation}
                      title="Local de Check-in"
                    />
                    <Circle
                      center={selectedLocation}
                      radius={parseInt(radius)}
                      strokeColor="rgba(138, 82, 254, 0.5)"
                      fillColor="rgba(138, 82, 254, 0.2)"
                    />
                  </>
                )}
              </MapView>
            </View>
            {selectedLocation && (
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
            )}
            <TouchableOpacity
              style={styles.button}
              onPress={handleUpdateLocation}
            >
              <MyText variant="button">Usar Minha Localização</MyText>
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