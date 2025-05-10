import { ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/services/firebaseConfig';
import { getSettings } from '@/services/database';

import { MyText } from '@/components/MyText';
import { styles } from './styles';
import { PersonCard } from '@/components/PersonCard';
import { BarChart, PieChart } from 'react-native-gifted-charts';

export function Report() {
  const [checkIns, setCheckIns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [startSchoolYear, setStartSchoolYear] = useState<string | null>(null);
  const [alunos, setAlunos] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      // Buscar data de início do ano letivo
      let schoolYearDate: Date | null = null;
      try {
        const settings = await getSettings('checkin');
        const startSchoolYearStr = settings?.config?.checkin?.startSchoolYear;
        setStartSchoolYear(startSchoolYearStr || null);
        if (startSchoolYearStr && startSchoolYearStr.length === 10) {
          const [day, month, year] = startSchoolYearStr.split('/');
          schoolYearDate = new Date(Number(year), Number(month) - 1, Number(day));
        }
      } catch {}
      // Buscar todos os alunos
      const usersSnap = await getDocs(collection(db, 'users'));
      const alunosList = usersSnap.docs.map(doc => {
        const d = doc.data();
        return {
          id: doc.id,
          name: d.name,
          role: d.role,
        };
      });
      setAlunos(alunosList.filter(a => a.role === 'student'));
      // Buscar todos os check-ins
      const snapshot = await getDocs(collection(db, 'checkins'));
      const data = snapshot.docs.map(doc => {
        const d = doc.data();
        return {
          ...d,
          date: d.date?.toDate ? d.date.toDate() : d.date,
        };
      });
      // Filtrar check-ins a partir do início do ano letivo, se definido
      const filtered = schoolYearDate
        ? data.filter(c => c.date instanceof Date && c.date >= schoolYearDate)
        : data;
      setCheckIns(filtered);
      setLoading(false);
    };
    fetchData();
  }, []);

  // Gerar lista de dias letivos (segunda a sexta)
  function getDiasLetivos(start: Date, end: Date) {
    const days = [];
    let d = new Date(start);
    while (d <= end) {
      if (d.getDay() !== 0 && d.getDay() !== 6) {
        days.push(new Date(d));
      }
      d.setDate(d.getDate() + 1);
    }
    return days;
  }

  // Cálculo de presenças, faltas e atrasos reais
  const hoje = new Date();
  let diasLetivos: Date[] = [];
  if (startSchoolYear) {
    const [day, month, year] = startSchoolYear.split('/');
    const start = new Date(Number(year), Number(month) - 1, Number(day));
    diasLetivos = getDiasLetivos(start, hoje);
  }

  // Mapeamento aluno x data
  const checkinMap: Record<string, Record<string, any>> = {};
  checkIns.forEach(c => {
    if (!checkinMap[c.userId]) checkinMap[c.userId] = {};
    const dateStr = c.date instanceof Date ? c.date.toISOString().slice(0, 10) : String(c.date);
    checkinMap[c.userId][dateStr] = c;
  });

  // Tabela detalhada por aluno considerando faltas reais
  const tabelaAlunos = alunos.map(aluno => {
    let presencas = 0;
    let atrasos = 0;
    let faltas = 0;
    diasLetivos.forEach(dia => {
      const dateStr = dia.toISOString().slice(0, 10);
      const checkin = checkinMap[aluno.id]?.[dateStr];
      if (checkin) {
        if (checkin.status === 'present') presencas++;
        else if (checkin.status === 'late') atrasos++;
        else faltas++;
      } else {
        faltas++;
      }
    });
    const total = presencas + atrasos + faltas;
    return {
      name: aluno.name,
      presencas,
      atrasos,
      faltas,
      total,
      percent: total ? Math.round((presencas / total) * 100) : 0,
    };
  });

  // KPIs reais
  const totalFaltas = tabelaAlunos.reduce((acc, a) => acc + a.faltas, 0);
  const totalPresencas = tabelaAlunos.reduce((acc, a) => acc + a.presencas, 0);
  const totalAtrasos = tabelaAlunos.reduce((acc, a) => acc + a.atrasos, 0);
  const totalRegistros = tabelaAlunos.reduce((acc, a) => acc + a.total, 0);
  const percentPresent = totalRegistros ? Math.round((totalPresencas / totalRegistros) * 100) : 0;
  const percentAbsent = totalRegistros ? Math.round((totalFaltas / totalRegistros) * 100) : 0;
  const percentLate = totalRegistros ? Math.round((totalAtrasos / totalRegistros) * 100) : 0;

  // Ranking de faltas reais
  const rankingFaltas = [...tabelaAlunos]
    .sort((a, b) => b.faltas - a.faltas)
    .slice(0, 5);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.purpleTitleBox}>
          <MyText variant="h1" style={{ color: '#fff', textAlign: 'center' }}>
            Painel de relatórios
          </MyText>
        </View>

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
            <MyText variant="h6" style={styles.kpiLabel}>
              Frequência média geral: {percentPresent}%
            </MyText>
            <MyText variant="h6" style={styles.kpiLabel}>
              Total de check-ins: {totalRegistros}
            </MyText>
          </View>
        </View>

        {/* Ranking de faltas */}
        <View style={styles.purpleTitleBox}>
          <MyText variant="h3" style={{ color: '#fff', textAlign: 'center' }}>
            Alunos com mais faltas
          </MyText>
        </View>
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
        <View style={styles.purpleTitleBox}>
          <MyText variant="h3" style={{ color: '#fff', textAlign: 'center' }}>
            Tabela detalhada
          </MyText>
        </View>
        <View style={{ backgroundColor: '#f6f4fd', borderRadius: 10, padding: 8, marginBottom: 24 }}>
          <View style={{ flexDirection: 'row', borderBottomWidth: 1, borderColor: '#e0dcfb', paddingBottom: 4, marginBottom: 6 }}>
            <MyText variant="body2" style={{ flex: 2, fontWeight: 'bold', color: '#444' }}>Aluno</MyText>
            <MyText variant="body2" style={{ flex: 1, fontWeight: 'bold', color: '#444' }}>Presenças</MyText>
            <MyText variant="body2" style={{ flex: 1, fontWeight: 'bold', color: '#444' }}>Faltas</MyText>
            <MyText variant="body2" style={{ flex: 1, fontWeight: 'bold', color: '#444' }}>% Presença</MyText>
          </View>
          {tabelaAlunos.length === 0 && <MyText variant="body2">Nenhum aluno registrado.</MyText>}
          {tabelaAlunos.map((aluno) => (
            <View key={aluno.name} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4, backgroundColor: '#fff', borderRadius: 6, paddingVertical: 4, paddingHorizontal: 2 }}>
              <MyText variant="body2" style={{ flex: 2 }}>{aluno.name}</MyText>
              <MyText variant="body2" style={{ flex: 1 }}>{aluno.presencas}</MyText>
              <MyText variant="body2" style={{ flex: 1 }}>{aluno.faltas}</MyText>
              <MyText variant="body2" style={{ flex: 1 }}>{aluno.percent}%</MyText>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}