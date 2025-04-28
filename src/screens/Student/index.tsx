import React, { useState } from 'react';
import { ScrollView, View, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { styles } from './styles';
import { MyText } from '@/components/MyText';

export function Student() {
  const [turma, setTurma] = useState('3ºAnoXX');
  const [data, setData] = useState('14/02/2025');
  const [selectedDay, setSelectedDay] = useState<number | null>(null); // Estado para o dia selecionado

  const handleCheckIn = () => {
    const today = new Date().getDate(); // Obtém o dia atual
    setSelectedDay(today); // Atualiza o estado com o dia atual
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <MyText variant="h1" style={styles.title}>
          Painel do estudante
        </MyText>

        <View style={styles.infoContainer}>
          <View style={styles.infoBox}>
            <MyText variant="subtitle1">Turma:</MyText>
            <Text style={styles.infoText}>{turma}</Text>
            <Text style={styles.linkText}>adicionar ou criar turma</Text>
          </View>

          <View style={styles.infoBox}>
            <MyText variant="subtitle1">Data:</MyText>
            <Text style={styles.infoText}>{data}</Text>
          </View>
        </View>

        <View style={styles.calendarContainer}>
          <MyText variant="subtitle1">Mês: Fevereiro</MyText>
          <View style={styles.calendar}>
            {Array.from({ length: 28 }, (_, i) => {
              const day = i + 1;
              const isSelected = day === selectedDay; // Verifica se o dia é o selecionado
              return (
                <View
                  key={i}
                  style={[
                    styles.calendarDay,
                    isSelected && styles.selectedDay, // Aplica o estilo se for o dia selecionado
                  ]}
                >
                  <Text
                    style={[
                      styles.calendarText,
                      isSelected && styles.selectedDayText, // Aplica o estilo ao texto do dia selecionado
                    ]}
                  >
                    {String(day).padStart(2, '0')}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>

        <TouchableOpacity style={styles.checkInButton} onPress={handleCheckIn}>
          <Text style={styles.checkInText}>Realizar check-in</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}