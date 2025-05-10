import { ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/services/firebaseConfig';

import { MyText } from '@/components/MyText';
import { styles } from './styles';
import { PersonCard } from '@/components/PersonCard';
import { BarChart, PieChart } from 'react-native-gifted-charts';

export function Report() {
  const [checkIns, setCheckIns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCheckIns = async () => {
      setLoading(true);
      const snapshot = await getDocs(collection(db, 'checkins'));
      const data = snapshot.docs.map(doc => {
        const d = doc.data();
        return {
          ...d,
          date: d.date?.toDate ? d.date.toDate() : d.date,
        };
      });
      setCheckIns(data);
      setLoading(false);
    };
    fetchCheckIns();
  }, []);

  // KPIs
  const total = checkIns.length;
  const present = checkIns.filter(c => c.status === 'present').length;
  const absent = checkIns.filter(c => c.status === 'absent').length;
  const late = checkIns.filter(c => c.status === 'late').length;
  const justified = checkIns.filter(c => c.status === 'justified').length;
  const percentPresent = total ? Math.round((present / total) * 100) : 0;
  const percentAbsent = total ? Math.round((absent / total) * 100) : 0;
  const percentLate = total ? Math.round((late / total) * 100) : 0;

  // Ranking de faltas
  const faltasPorAluno: Record<string, number> = {};
  checkIns.forEach(c => {
    if (c.status === 'absent') {
      const name = c.userName || c.userId;
      faltasPorAluno[name] = (faltasPorAluno[name] || 0) + 1;
    }
  });
  const rankingFaltas = Object.entries(faltasPorAluno)
    .map(([name, faltas]) => ({ name, faltas }))
    .sort((a, b) => b.faltas - a.faltas)
    .slice(0, 5);

  // Tabela detalhada por aluno
  const alunos: Record<string, { name: string, presencas: number, faltas: number, atrasos: number, total: number }> = {};
  checkIns.forEach(c => {
    const name = c.userName || c.userId;
    if (!alunos[name]) alunos[name] = { name, presencas: 0, faltas: 0, atrasos: 0, total: 0 };
    if (c.status === 'present') alunos[name].presencas++;
    if (c.status === 'absent') alunos[name].faltas++;
    if (c.status === 'late') alunos[name].atrasos++;
    alunos[name].total++;
  });
  const tabelaAlunos = Object.values(alunos).map(a => ({
    ...a,
    percent: a.total ? Math.round((a.presencas / a.total) * 100) : 0
  })).sort((a, b) => a.name.localeCompare(b.name));

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <MyText variant="h1" style={styles.title}>
          Painel de relatórios
        </MyText>

        {/* KPIs */}
        <View style={{ flexDirection: 'row', gap: 12, marginBottom: 16, justifyContent: 'center' }}>
          <View style={{ backgroundColor: '#e8f5e9', borderRadius: 12, padding: 16, alignItems: 'center', minWidth: 90 }}>
            <MyText variant="h4" style={{ color: '#4CAF50', fontWeight: 'bold' }}>{percentPresent}%</MyText>
            <MyText variant="body2">Presenças</MyText>
          </View>
          <View style={{ backgroundColor: '#ffebee', borderRadius: 12, padding: 16, alignItems: 'center', minWidth: 90 }}>
            <MyText variant="h4" style={{ color: '#F44336', fontWeight: 'bold' }}>{percentAbsent}%</MyText>
            <MyText variant="body2">Faltas</MyText>
          </View>
          <View style={{ backgroundColor: '#fffde7', borderRadius: 12, padding: 16, alignItems: 'center', minWidth: 90 }}>
            <MyText variant="h4" style={{ color: '#FFC107', fontWeight: 'bold' }}>{percentLate}%</MyText>
            <MyText variant="body2">Atrasos</MyText>
          </View>
        </View>

        {/* Gráfico de Pizza */}
        <View style={styles.piechart}>
          <PieChart
            showText
            textColor="black"
            radius={64}
            textSize={20}
            showTextBackground
            textBackgroundRadius={26}
            textBackgroundColor="transparent"
            data={[
              { value: percentPresent, color: '#4CAF50', text: `${percentPresent}%`, fontWeight: 'bold', textColor: 'white' },
              { value: percentAbsent, color: '#F44336', text: `${percentAbsent}%`, fontWeight: 'bold', textColor: 'white' },
              { value: percentLate, color: '#FFC107', text: `${percentLate}%`, fontWeight: 'bold', textColor: 'white' },
            ]}
          />
          <View>
            <MyText variant="h6" color="black">
              Frequência média geral: {percentPresent}%
            </MyText>
            <MyText variant="h6" color="black">
              Total de check-ins: {total}
            </MyText>
          </View>
        </View>

        {/* Ranking de faltas */}
        <MyText variant="h3" style={styles.title}>
          Alunos com mais faltas
        </MyText>
        <View style={{ gap: 6, marginBottom: 16 }}>
          {rankingFaltas.length === 0 && <MyText variant="body2">Nenhuma falta registrada.</MyText>}
          {rankingFaltas.map((aluno, idx) => (
            <View key={aluno.name} style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 6, padding: 8 }}>
              <MyText variant="body2" style={{ width: 24, fontWeight: 'bold', color: '#8A52FE' }}>{idx + 1}.</MyText>
              <MyText variant="body2" style={{ flex: 1 }}>{aluno.name}</MyText>
              <MyText variant="body2" style={{ color: '#F44336', fontWeight: 'bold' }}>{aluno.faltas} faltas</MyText>
            </View>
          ))}
        </View>

        {/* Tabela detalhada */}
        <MyText variant="h3" style={styles.title}>
          Tabela detalhada
        </MyText>
        <View style={{ backgroundColor: '#f6f4fd', borderRadius: 10, padding: 8, marginBottom: 24 }}>
          <View style={{ flexDirection: 'row', borderBottomWidth: 1, borderColor: '#e0dcfb', paddingBottom: 4, marginBottom: 6 }}>
            <MyText variant="body2" style={{ flex: 2, fontWeight: 'bold', color: '#444' }}>Aluno</MyText>
            <MyText variant="body2" style={{ flex: 1, fontWeight: 'bold', color: '#444' }}>Presenças</MyText>
            <MyText variant="body2" style={{ flex: 1, fontWeight: 'bold', color: '#444' }}>Faltas</MyText>
            <MyText variant="body2" style={{ flex: 1, fontWeight: 'bold', color: '#444' }}>Atrasos</MyText>
            <MyText variant="body2" style={{ flex: 1, fontWeight: 'bold', color: '#444' }}>% Presença</MyText>
          </View>
          {tabelaAlunos.length === 0 && <MyText variant="body2">Nenhum aluno registrado.</MyText>}
          {tabelaAlunos.map((aluno) => (
            <View key={aluno.name} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4, backgroundColor: '#fff', borderRadius: 6, paddingVertical: 4, paddingHorizontal: 2 }}>
              <MyText variant="body2" style={{ flex: 2 }}>{aluno.name}</MyText>
              <MyText variant="body2" style={{ flex: 1 }}>{aluno.presencas}</MyText>
              <MyText variant="body2" style={{ flex: 1 }}>{aluno.faltas}</MyText>
              <MyText variant="body2" style={{ flex: 1 }}>{aluno.atrasos}</MyText>
              <MyText variant="body2" style={{ flex: 1 }}>{aluno.percent}%</MyText>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}