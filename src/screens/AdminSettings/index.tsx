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

  const [phone, setPhone] = useState('');
  const [addressField, setAddressField] = useState('');

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
          phone: phone || null,
          address: addressField || null,
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

  const handleSaveTimeSettings = async () => {
    if (!startTime || !endTime) {
      Alert.alert('Erro', 'Por favor, preencha os horários de início e fim.');
      return;
    }

    try {
      await updateSettings('checkin', {
        checkin: {
          allowedTimeWindow: {
            start: startTime,
            end: endTime,
          },
        },
      }, auth.currentUser?.email || 'system');

      Alert.alert('Sucesso', 'Configurações de horário salvas com sucesso!');
      setStartTime('');
      setEndTime('');
    } catch (error) {
      console.log('Erro ao salvar configurações:', error);
      Alert.alert('Erro', 'Não foi possível salvar as configurações.');
    }
  };

  const handleSaveLocationSettings = async () => {
    if (!selectedLocation) {
      Alert.alert('Erro', 'Por favor, selecione um local no mapa.');
      return;
    }

    const radiusValue = parseInt(radius);
    if (isNaN(radiusValue) || radiusValue <= 0) {
      Alert.alert('Erro', 'O raio deve ser um número maior que zero.');
      return;
    }

    try {
      await updateSettings('checkin', {
        checkin: {
          maxDistance: radiusValue,
          requireLocation: true,
          allowedLocation: {
            latitude: selectedLocation.latitude,
            longitude: selectedLocation.longitude,
            radius: radiusValue,
          },
        },
      }, auth.currentUser?.email || 'system');

      Alert.alert('Sucesso', 'Configurações de localização salvas com sucesso!');
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

  const handleRadiusChange = (text: string) => {
    // Remove caracteres não numéricos
    const numericValue = text.replace(/[^0-9]/g, '');
    
    // Se o valor for vazio ou zero, mantém como '1'
    if (!numericValue || parseInt(numericValue) === 0) {
      setRadius('1');
    } else {
      setRadius(numericValue);
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
            <MyText variant="button" style={styles.buttonText}>Adicionar Aluno</MyText>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <MyText variant="h2">Horário de Check-in</MyText>
          <MyText variant="body2" style={styles.instruction}>
            Defina o período em que os alunos podem realizar check-in
          </MyText>
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
          <TouchableOpacity
            style={styles.button}
            onPress={handleSaveTimeSettings}
          >
            <MyText variant="button" style={styles.buttonText}>Salvar Horários</MyText>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <MyText variant="h2">Localização de Check-in</MyText>
          <MyText variant="body2" style={styles.instruction}>
            Defina a área onde os alunos podem realizar check-in
          </MyText>
          <Field
            label="Raio Permitido (metros)"
            placeholder="100"
            value={radius}
            onChangeText={handleRadiusChange}
            keyboardType="numeric"
          />
          
          <View style={styles.locationContainer}>
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
                      description="Clique no mapa para mover este ponto"
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
              <MyText variant="button" style={styles.buttonText}>Usar Minha Localização</MyText>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.button}
              onPress={handleSaveLocationSettings}
            >
              <MyText variant="button" style={styles.buttonText}>Salvar Localização</MyText>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}