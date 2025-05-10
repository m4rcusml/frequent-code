import React, { useState, useEffect } from 'react';
import { ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { MyText } from '@/components/MyText';
import { styles } from './styles';
import { Field } from '@/components/Field';
import { PersonCard } from '@/components/PersonCard';
import { collection, onSnapshot, query, where, orderBy, limit, getDoc, doc } from 'firebase/firestore';
import { db } from '@/services/firebaseConfig';

// Define a tipagem para os check-ins
interface CheckIn {
  userId: string;
  month: string;
  name: string;
  year: string;
  [key: string]: any; // Para outros campos opcionais
}

// Adicione o tipo para o check-in
interface RecentCheckIn {
  id: string;
  userId: string;
  name: string;
  date: any;
}

export function Home() {
  const [turma, setTurma] = useState('');
  const [data, setData] = useState('');
  const [checkIns, setCheckIns] = useState<CheckIn[]>([]); // Tipagem do estado
  const [recentCheckIns, setRecentCheckIns] = useState<RecentCheckIn[]>([]);
  const [recentCheckInsWithNames, setRecentCheckInsWithNames] = useState<any[]>([]);

  useEffect(() => {
    const q = query(collection(db, 'checkins'), where('month', '==', 'ABRIL'), where('year', '==', '2025'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedCheckIns = snapshot.docs.map((doc) => doc.data() as CheckIn); // Tipagem dos dados
      setCheckIns(fetchedCheckIns);
    });

    // Buscar os 5 check-ins mais recentes
    const qRecent = query(collection(db, 'checkins'), orderBy('date', 'desc'), limit(5));
    const unsubscribeRecent = onSnapshot(qRecent, async (snapshot) => {
      const fetchedRecent = await Promise.all(snapshot.docs.map(async (docSnap) => {
        const data = docSnap.data();
        let name = data.userId;
        try {
          const userDoc = await getDoc(doc(db, 'users', data.userId));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            name = userData.name || data.userId;
          }
        } catch {}
        return {
          id: docSnap.id,
          userId: data.userId,
          name,
          date: data.date?.toDate ? data.date.toDate() : data.date,
        };
      }));
      setRecentCheckInsWithNames(fetchedRecent);
    });

    return () => {
      unsubscribe();
      unsubscribeRecent();
    };
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <MyText variant="h1" style={styles.title}>
          Painel administrativo
        </MyText>

        {/* Log visual dos últimos check-ins */}
        <View style={{ marginBottom: 20, backgroundColor: '#f6f4fd', borderRadius: 10, padding: 12, shadowColor: '#8A52FE', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.10, shadowRadius: 3, elevation: 1 }}>
          <MyText variant="h3" style={{ marginBottom: 8, color: '#8A52FE', fontWeight: 'bold' }}>Últimos check-ins registrados</MyText>
          <View style={{ flexDirection: 'row', borderBottomWidth: 1, borderColor: '#e0dcfb', paddingBottom: 4, marginBottom: 6 }}>
            <MyText variant="body2" style={{ flex: 2, fontWeight: 'bold', color: '#444' }}>Aluno</MyText>
            <MyText variant="body2" style={{ flex: 1, fontWeight: 'bold', color: '#444' }}>Data</MyText>
            <MyText variant="body2" style={{ flex: 1, fontWeight: 'bold', color: '#444' }}>Horário</MyText>
          </View>
          {recentCheckInsWithNames.length === 0 && <MyText variant="body2">Nenhum check-in recente.</MyText>}
          {recentCheckInsWithNames.map((item) => {
            let dataStr = '';
            let horaStr = '';
            if (item.date instanceof Date) {
              dataStr = item.date.toLocaleDateString();
              horaStr = item.date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            } else {
              dataStr = String(item.date);
              horaStr = '';
            }
            return (
              <View key={item.id} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4, backgroundColor: '#fff', borderRadius: 6, paddingVertical: 4, paddingHorizontal: 2 }}>
                <MyText variant="body2" style={{ flex: 2 }}>{item.name}</MyText>
                <MyText variant="body2" style={{ flex: 1 }}>{dataStr}</MyText>
                <MyText variant="body2" style={{ flex: 1 }}>{horaStr}</MyText>
              </View>
            );
          })}
        </View>

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