import React, { useState, useEffect } from 'react';
import { ScrollView, View, Text, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { styles } from './styles';
import { MyText } from '@/components/MyText';
import { db, auth } from '@/services/firebaseConfig';
import * as Location from 'expo-location';
import { getDistance } from 'geolib';
import { CheckIn } from '@/types/database';
import { createCheckIn, getCheckInsByUser } from '@/services/database';

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

      // TODO: Obter o classId do usuário atual
      const classId = 'default-class-id'; // Substituir pela lógica real

      // Realiza o check-in
      await createCheckIn(
        auth.currentUser.email,
        classId,
        {
          latitude: userLocation.latitude,
          longitude: userLocation.longitude,
          accuracy: 0, // TODO: Implementar precisão real
        }
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
        <MyText variant="h1" style={styles.title}>
          Check-in
        </MyText>

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
          style={styles.checkInButton}
          onPress={handleCheckIn}
        >
          <MyText variant="button">Realizar Check-in</MyText>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
