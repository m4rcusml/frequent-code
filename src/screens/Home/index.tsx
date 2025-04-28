import React, { useState, useEffect } from 'react';
import { ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { MyText } from '@/components/MyText';
import { styles } from './styles';
import { Field } from '@/components/Field';
import { PersonCard } from '@/components/PersonCard';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { db } from '@/services/firebaseConfig';

// Define a tipagem para os check-ins
interface CheckIn {
  userId: string;
  month: string;
  name: string;
  year: string;
  [key: string]: any; // Para outros campos opcionais
}

export function Home() {
  const [turma, setTurma] = useState('');
  const [data, setData] = useState('');
  const [checkIns, setCheckIns] = useState<CheckIn[]>([]); // Tipagem do estado

  useEffect(() => {
    const q = query(collection(db, 'checkins'), where('month', '==', 'ABRIL'), where('year', '==', '2025'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedCheckIns = snapshot.docs.map((doc) => doc.data() as CheckIn); // Tipagem dos dados
      setCheckIns(fetchedCheckIns);
    });

    return () => unsubscribe();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <MyText variant="h1" style={styles.title}>
          Painel administrativo
        </MyText>

        <Field
          label="Turma"
          placeholder="3ano-xx"
          value={turma}
          onChangeText={setTurma}
        />
        <Field
          label="Data"
          placeholder="dd/mm/aaaa"
          value={data}
          onChangeText={setData}
        />

        <View style={styles.list}>
          {checkIns.map((checkIn, index) => (
            <PersonCard
              key={index}
              data={{
                name: checkIn.userId || 'Usuário desconhecido', // Valor padrão
                avatar_url: `https://robohash.org/${Math.random()}`, // Imagem aleatória
                presencePerCent: 100,
                id: String(index),
                status: 1,
              }}
            />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}