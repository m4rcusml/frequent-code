import React, { useState, useEffect } from 'react';
import { ScrollView, View, Text, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { styles } from './styles';
import { MyText } from '@/components/MyText';
import { addDoc, collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { db, auth } from '@/services/firebaseConfig';
import * as Location from 'expo-location';
import { getDistance } from 'geolib';

interface CheckIn {
  userId: string;
  date: string;
  month: string;
  year: string;
}

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

        const q = query(
          collection(db, 'checkins'),
          where('userId', '==', auth.currentUser.email),
          where('month', '==', month),
          where('year', '==', year)
        );

        const querySnapshot = await getDocs(q);
        const fetchedCheckins = querySnapshot.docs.map((doc) => doc.data() as CheckIn);

        setCheckins(fetchedCheckins);

        // Atualiza os dias selecionados com base nos check-ins
        const daysWithCheckins = fetchedCheckins.map((checkin) => {
          const checkinDate = new Date(checkin.date);
          return checkinDate.getDate();
        });
        setSelectedDays(daysWithCheckins);
      } catch (error) {
        console.log('Erro ao buscar check-ins:', error);
      }
    };

    fetchCheckins();
  }, [month, year]);

  const getUserLocationAsync = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();

    if (status !== 'granted') {
      Alert.alert('Erro', 'Permissão para acessar a localização negada');
      return;
    }

    const location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
    setUserLocation(location.coords);
  };

  useEffect(() => {
    getUserLocationAsync();
  }, []);

  const isWithinCheckInTime = async (): Promise<boolean> => {
    try {
      const settingsDocRef = doc(db, 'settings', 'checkin');
      const settingsDoc = await getDoc(settingsDocRef);

      if (settingsDoc.exists()) {
        const { startTime, endTime } = settingsDoc.data();

        // Obtém o horário atual do dispositivo
        const now = new Date();
        const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

        console.log(`Horário atual: ${currentTime}, Início: ${startTime}, Fim: ${endTime}`);

        return currentTime >= startTime && currentTime <= endTime;
      } else {
        console.log('Configurações de horário não encontradas.');
        return false;
      }
    } catch (error) {
      console.log('Erro ao verificar horário de check-in:', error);
      return false;
    }
  };

  const handleCheckIn = async () => {
    if (!auth.currentUser?.email) {
      Alert.alert('Erro', 'Usuário não autenticado.');
      return;
    }

    // Verifica se o horário atual está dentro do intervalo permitido
    if (!await isWithinCheckInTime()) {
      Alert.alert('Erro', 'O check-in só pode ser realizado entre os horários permitidos.');
      return;
    }

    if (!userLocation) {
      Alert.alert('Erro', 'Localização não disponível.');
      return;
    }

    const targetLocation = { latitude: -23.572578, longitude: -46.706910 }; // Exemplo: coordenadas de São Paulo

    // Calcular a distância entre a localização do usuário e o local de check-in
    const distance = getDistance(
      { latitude: userLocation.latitude, longitude: userLocation.longitude },
      targetLocation
    );

    if (distance > 100) { // Exemplo: se a distância for maior que 100 metros
        
      Alert.alert('Erro', 'Você precisa estar dentro de 100 metros do local de check-in.');
      return;
    }

    const today = new Date();
    const formattedDate = today.toISOString().split('T')[0]; // Obtém a data no formato "YYYY-MM-DD"

    try {
      // Verifica se já existe um check-in para o dia atual
      const q = query(
        collection(db, 'checkins'),
        where('userId', '==', auth.currentUser.email),
        where('date', '>=', `${formattedDate}T00:00:00.000Z`), // Início do dia
        where('date', '<=', `${formattedDate}T23:59:59.999Z`) // Fim do dia
      );

      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        Alert.alert('Aviso', 'Você já realizou um check-in hoje.');
        return;
      }

      // Realiza o check-in
      await addDoc(collection(db, 'checkins'), {
        userId: auth.currentUser.email, // Usa o e-mail do usuário autenticado
        date: today.toISOString(),
        month,
        year,
      });

      setSelectedDays((prev) => [...prev, today.getDate()]); // Adiciona o dia atual à lista de check-ins
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
          Painel do estudante
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

        <TouchableOpacity style={styles.checkInButton} onPress={handleCheckIn}>
          <Text style={styles.checkInText}>Realizar check-in</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
