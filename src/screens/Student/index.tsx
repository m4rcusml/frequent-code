import React, { useState, useEffect } from 'react';
import { ScrollView, View, Text, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { styles } from './styles';
import { MyText } from '@/components/MyText';
import { addDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db, auth } from '@/services/firebaseConfig'; // Certifique-se de importar o Firestore e Auth configurados

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
  const [selectedDays, setSelectedDays] = useState<number[]>([]); // Armazena os dias com check-ins
  const [month, setMonth] = useState('JANEIRO');
  const [year, setYear] = useState('2025');
  const [checkins, setCheckins] = useState<CheckIn[]>([]);

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
  }, [month, year]); // Atualiza os check-ins ao mudar o mês ou o ano

  const handleCheckIn = async () => {
    if (!auth.currentUser?.email) {
      Alert.alert('Erro', 'Usuário não autenticado.');
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

    const isSelected = selectedDays.includes(day); // Verifica se o dia está na lista de check-ins

    return (
      <View
        style={[
          styles.calendarDay,
          isToday && !isSelected && styles.todayUnselectedCell, // Dia atual antes do check-in
          isSelected && styles.selectedDay, // Dia com check-in
        ]}
        key={day}
      >
        <Text
          style={[
            styles.calendarDayText,
            isToday && !isSelected && styles.todayUnselectedText, // Texto do dia atual antes do check-in
            isSelected && styles.selectedDayText, // Texto do dia com check-in
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