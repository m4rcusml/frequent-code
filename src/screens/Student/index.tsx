import React, { useState, useEffect } from 'react';
import { ScrollView, View, Text, TouchableOpacity, Alert, TextStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { styles } from './styles';
import { MyText } from '@/components/MyText';
import { db, auth } from '@/services/firebaseConfig';
import * as Location from 'expo-location';
import { getDistance } from 'geolib';
import { CheckIn } from '@/types/database';
import { createCheckIn, getCheckInsByUser, getUser, getSettings, getClass } from '@/services/database';

const weekDays = ['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB'];
const months = [
  'JANEIRO', 'FEVEREIRO', 'MARÇO', 'ABRIL', 'MAIO', 'JUNHO',
  'JULHO', 'AGOSTO', 'SETEMBRO', 'OUTUBRO', 'NOVEMBRO', 'DEZEMBRO',
];

export function Student() {
  const [selectedDays, setSelectedDays] = useState<number[]>([]);
  const [month, setMonth] = useState('JANEIRO');
  const [year, setYear] = useState('2025');
  const [checkins, setCheckins] = useState<CheckIn[]>([]);
  const [userLocation, setUserLocation] = useState<{ latitude: number, longitude: number } | null>(null);
  const [userName, setUserName] = useState('');
  const [userClass, setUserClass] = useState('');
  const [checkinWindow, setCheckinWindow] = useState<{start: string, end: string} | null>(null);
  const [history, setHistory] = useState<CheckIn[]>([]);

  useEffect(() => {
    const currentDate = new Date();
    setMonth(months[currentDate.getMonth()]);
    setYear(currentDate.getFullYear().toString());
  }, []);

  useEffect(() => {
    const fetchCheckins = async () => {
      try {
        if (!auth.currentUser?.email) {
          console.log('Usuário não autenticado.');
          return;
        }

        const startDate = new Date(parseInt(year), months.indexOf(month), 1);
        const endDate = new Date(parseInt(year), months.indexOf(month) + 1, 0);

        const fetchedCheckins = await getCheckInsByUser(
          auth.currentUser.email,
          startDate,
          endDate
        );

        setCheckins(fetchedCheckins);

        // Atualiza os dias selecionados com base nos check-ins
        const daysWithCheckins = fetchedCheckins.map((checkin) => {
          return checkin.date.getDate();
        });
        setSelectedDays(daysWithCheckins);
      } catch (error) {
        console.log('Erro ao buscar check-ins:', error);
      }
    };

    fetchCheckins();
  }, [month, year]);

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permissão negada', 'Precisamos da sua localização para realizar o check-in.');
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      setUserLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });
    })();
  }, []);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!auth.currentUser?.uid) return;
      try {
        const userData = await getUser(auth.currentUser.uid);
        if (userData) {
          setUserName(userData.name);
          setUserClass(userData.profile && userData.profile.classId ? userData.profile.classId : '');
        }
      } catch (error) {
        console.log('Erro ao buscar dados do aluno:', error);
      }
    };
    fetchUserData();
  }, []);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const settings = await getSettings('checkin');
        if (settings && settings.config?.checkin?.allowedTimeWindow) {
          setCheckinWindow({
            start: settings.config.checkin.allowedTimeWindow.start,
            end: settings.config.checkin.allowedTimeWindow.end,
          });
        }
      } catch (error) {
        console.log('Erro ao buscar configurações:', error);
      }
    };
    fetchSettings();
  }, []);

  useEffect(() => {
    const fetchRecentHistory = async () => {
      if (!auth.currentUser?.email) return;
      try {
        // Busca os check-ins do mês atual e pega os 5 mais recentes
        const now = new Date();
        const startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        const allCheckins = await getCheckInsByUser(auth.currentUser.email, startDate, endDate);
        const recentCheckins = allCheckins
          .sort((a, b) => b.date.getTime() - a.date.getTime())
          .slice(0, 5);
        setHistory(recentCheckins);
      } catch (error) {
        console.log('Erro ao buscar histórico recente:', error);
      }
    };
    fetchRecentHistory();
  }, []);

  const handleCheckIn = async () => {
    if (!auth.currentUser?.email) {
      Alert.alert('Erro', 'Usuário não autenticado.');
      return;
    }

    if (!userLocation) {
      Alert.alert('Erro', 'Não foi possível obter sua localização.');
      return;
    }

    try {
      const today = new Date();
      const formattedDate = today.toISOString().split('T')[0];

      // Verifica se já existe um check-in para o dia atual
      const existingCheckins = await getCheckInsByUser(
        auth.currentUser.email,
        new Date(today.setHours(0, 0, 0, 0)),
        new Date(today.setHours(23, 59, 59, 999))
      );

      if (existingCheckins.length > 0) {
        Alert.alert('Aviso', 'Você já realizou um check-in hoje.');
        return;
      }

      // Validação de localização e raio permitido
      const settings = await getSettings('checkin');
      const allowedLocation = settings?.config?.checkin?.allowedLocation;
      const maxDistance = settings?.config?.checkin?.maxDistance || 100;
      if (allowedLocation) {
        const distance = getDistance(
          { latitude: userLocation.latitude, longitude: userLocation.longitude },
          { latitude: allowedLocation.latitude, longitude: allowedLocation.longitude }
        );
        if (distance > maxDistance) {
          Alert.alert('Fora da área permitida', `Você está a ${distance} metros do local permitido para check-in.`);
          return;
        }
      }

      // TODO: Obter o classId do usuário atual
      const classId = 'default-class-id'; // Substituir pela lógica real

      // Realiza o check-in
      await createCheckIn(
        auth.currentUser.uid,
        classId,
        {
          latitude: userLocation.latitude,
          longitude: userLocation.longitude,
          accuracy: 0, // TODO: Implementar precisão real
        },
        userName
      );

      setSelectedDays((prev) => [...prev, today.getDate()]);
      Alert.alert('Sucesso', 'Check-in realizado com sucesso!');
    } catch (error) {
      console.log('Erro ao salvar check-in:', error);
      Alert.alert('Erro', 'Não foi possível salvar o check-in.');
    }
  };

  const renderCalendarDay = (day: number) => {
    const today = new Date();
    const isToday =
      day === today.getDate() &&
      months[today.getMonth()] === month &&
      today.getFullYear().toString() === year;

    const isSelected = selectedDays.includes(day);

    return (
      <View
        style={[
          styles.calendarDay,
          isToday && !isSelected && styles.todayUnselectedCell,
          isSelected && styles.selectedDay,
        ]}
        key={day}
      >
        <Text
          style={[
            styles.calendarDayText,
            isToday && !isSelected && styles.todayUnselectedText,
            isSelected && styles.selectedDayText,
          ]}
        >
          {day}
        </Text>
      </View>
    );
  };

  const renderCalendarGrid = () => {
    const cells = [];

    // Week days header
    cells.push(
      <View key="header" style={styles.weekDaysRow}>
        {weekDays.map((day, index) => (
          <View key={index} style={styles.weekDayCell}>
            <Text style={styles.weekDayText}>{day}</Text>
          </View>
        ))}
      </View>
    );

    // Get number of days in the selected month
    const monthIndex = months.indexOf(month);
    const daysInMonth = new Date(parseInt(year), monthIndex + 1, 0).getDate();

    // Get first day of the month
    const firstDay = new Date(parseInt(year), monthIndex, 1).getDay();

    // Calendar days - rows of 7 days
    let row = [];

    // Add empty cells for days before the first day of month
    for (let i = 0; i < firstDay; i++) {
      row.push(<View key={`empty-${i}`} style={styles.calendarDay} />);
    }

    // Add the actual days
    for (let i = 1; i <= daysInMonth; i++) {
      row.push(renderCalendarDay(i));

      if (row.length === 7) {
        cells.push(
          <View key={`row-${Math.ceil(i / 7)}`} style={styles.calendarRow}>
            {row}
          </View>
        );
        row = [];
      }
    }

    // Add remaining empty cells if needed
    if (row.length > 0) {
      while (row.length < 7) {
        row.push(<View key={`empty-end-${row.length}`} style={styles.calendarDay} />);
      }
      cells.push(
        <View key="last-row" style={styles.calendarRow}>
          {row}
        </View>
      );
    }

    return cells;
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Topo: Nome e Turma */}
        <View style={styles.section}>
          <MyText variant="h2">Olá, {userName}</MyText>
          <MyText variant="body1">Turma: {userClass}</MyText>
        </View>
        {/* Horário permitido */}
        {checkinWindow && (
          <View style={styles.section}>
            <MyText variant="body2">Horário permitido para check-in:</MyText>
            <MyText variant="body1">{checkinWindow.start} - {checkinWindow.end}</MyText>
          </View>
        )}
        {/* Calendário */}
        <View style={styles.section}>
          <MyText variant="h1" style={styles.title}>Check-in</MyText>
          <View style={styles.calendarContainer}>
            <View style={styles.monthSelector}>
              <TouchableOpacity
                onPress={() => {
                  const currentIndex = months.indexOf(month);
                  if (currentIndex > 0) {
                    setMonth(months[currentIndex - 1]);
                  } else {
                    setMonth(months[11]);
                    setYear((parseInt(year) - 1).toString());
                  }
                }}
              >
                <Text style={styles.monthYearText}>◀</Text>
              </TouchableOpacity>
              <Text style={styles.monthYearText}>
                {month} / {year}
              </Text>
              <TouchableOpacity
                onPress={() => {
                  const currentIndex = months.indexOf(month);
                  if (currentIndex < 11) {
                    setMonth(months[currentIndex + 1]);
                  } else {
                    setMonth(months[0]);
                    setYear((parseInt(year) + 1).toString());
                  }
                }}
              >
                <Text style={styles.monthYearText}>▶</Text>
              </TouchableOpacity>
            </View>
            {renderCalendarGrid()}
          </View>
          <TouchableOpacity
            style={styles.button}
            onPress={handleCheckIn}
          >
            <MyText variant="button" style={styles.buttonText}>Fazer Check-in</MyText>
          </TouchableOpacity>
        </View>
        {/* Histórico de check-ins */}
        <View style={styles.section}>
          <MyText variant="h3" style={{marginBottom: 8}}>Histórico recente</MyText>
          {history.length === 0 && <MyText variant="body2">Nenhum check-in recente.</MyText>}
          {history.map((item, idx) => {
            const isPresent = item.status === 'present';
            const statusStyle = {
              ...styles.historyStatus,
              ...(isPresent ? styles.historyStatus_present : styles.historyStatus_absent),
            };
            return (
              <View key={item.id || idx} style={styles.historyCard}>
                <MyText variant="body2">
                  {item.date.toLocaleDateString()}
                </MyText>
                <MyText
                  variant="body2"
                  style={statusStyle}
                >
                  {isPresent ? 'Presente' : 'Falta'}
                </MyText>
              </View>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
