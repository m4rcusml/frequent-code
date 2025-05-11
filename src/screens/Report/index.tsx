import React from 'react';
import { ScrollView, View, ActivityIndicator, TouchableOpacity, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useEffect, useState, useMemo } from 'react';
import { collection, getDocs, query, where, orderBy, limit, Timestamp } from 'firebase/firestore';
import { db } from '@/services/firebaseConfig';
import { getSettings } from '@/services/database';

import { MyText } from '@/components/MyText';
import { styles } from './styles';
import { PieChart } from 'react-native-gifted-charts';

// Constantes para paginação
const CHECKINS_PER_PAGE = 50;
const INITIAL_MONTHS = 3; // Carrega dados dos últimos 3 meses inicialmente

export function Report() {
  const [checkIns, setCheckIns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [startSchoolYear, setStartSchoolYear] = useState<string | null>(null);
  const [alunos, setAlunos] = useState<any[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'year'>('month');
  const [lastDoc, setLastDoc] = useState<any>(null);
  const [hasMore, setHasMore] = useState(true);

  // Função para buscar check-ins com paginação
  const fetchCheckIns = async (isInitial = false) => {
    try {
      if (!hasMore && !isInitial) return;

      const startDate = new Date();
      switch (selectedPeriod) {
        case 'week':
          startDate.setDate(startDate.getDate() - 7);
          break;
        case 'month':
          startDate.setMonth(startDate.getMonth() - 1);
          break;
        case 'year':
          startDate.setFullYear(startDate.getFullYear() - 1);
          break;
      }

      const checkinsQuery = query(
        collection(db, 'checkins'),
        where('date', '>=', Timestamp.fromDate(startDate)),
        orderBy('date', 'desc'),
        limit(CHECKINS_PER_PAGE),
        ...(lastDoc && !isInitial ? [where('date', '<', lastDoc.date)] : [])
      );

      const snapshot = await getDocs(checkinsQuery);
      const newCheckIns = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        date: doc.data().date?.toDate()
      }));

      setLastDoc(snapshot.docs[snapshot.docs.length - 1]);
      setHasMore(snapshot.docs.length === CHECKINS_PER_PAGE);

      if (isInitial) {
        setCheckIns(newCheckIns);
      } else {
        setCheckIns(prev => [...prev, ...newCheckIns]);
      }
    } catch (error) {
      console.error('Erro ao buscar check-ins:', error);
    }
  };

  // Função para buscar alunos
  const fetchAlunos = async () => {
    try {
      const usersQuery = query(
        collection(db, 'users'),
        where('role', '==', 'student'),
        orderBy('name')
      );
      const usersSnap = await getDocs(usersQuery);
      const alunosList = usersSnap.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setAlunos(alunosList);
    } catch (error) {
      console.error('Erro ao buscar alunos:', error);
    }
  };

  // Carregamento inicial
  useEffect(() => {
    const loadInitialData = async () => {
      setLoading(true);
      try {
        // Buscar configurações do ano letivo
        const settings = await getSettings('checkin');
        setStartSchoolYear(settings?.config?.checkin?.startSchoolYear || null);

        // Buscar dados iniciais
        await Promise.all([
          fetchAlunos(),
          fetchCheckIns(true)
        ]);
      } catch (error) {
        console.error('Erro ao carregar dados iniciais:', error);
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();
  }, []);

  // Resetar paginação quando mudar o período
  useEffect(() => {
    setLastDoc(null);
    setHasMore(true);
    fetchCheckIns(true);
  }, [selectedPeriod]);

  // Cálculos otimizados usando useMemo
  const { tabelaAlunos, kpis } = useMemo(() => {
    if (!checkIns.length || !alunos.length) {
      return { tabelaAlunos: [], kpis: { totalPresencas: 0, totalFaltas: 0, totalAtrasos: 0, totalRegistros: 0 } };
    }

    // Mapeamento otimizado de check-ins
    const checkinMap = checkIns.reduce((acc, c) => {
      if (!acc[c.userId]) acc[c.userId] = {};
      const dateStr = c.date.toISOString().slice(0, 10);
      acc[c.userId][dateStr] = c;
      return acc;
    }, {} as Record<string, Record<string, any>>);

    // Cálculo da tabela de alunos
    const tabela = alunos.map(aluno => {
      const alunoCheckins = checkinMap[aluno.id] || {};
      const presencas = Object.values(alunoCheckins).filter((c: any) => c.status === 'present').length;
      const atrasos = Object.values(alunoCheckins).filter((c: any) => c.status === 'late').length;
      const faltas = Object.values(alunoCheckins).filter((c: any) => c.status === 'absent').length;
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

    // Cálculo dos KPIs
    const kpis = {
      totalPresencas: tabela.reduce((acc, a) => acc + a.presencas, 0),
      totalFaltas: tabela.reduce((acc, a) => acc + a.faltas, 0),
      totalAtrasos: tabela.reduce((acc, a) => acc + a.atrasos, 0),
      totalRegistros: tabela.reduce((acc, a) => acc + a.total, 0),
    };

    return { tabelaAlunos: tabela, kpis };
  }, [checkIns, alunos]);

  // Cálculo das porcentagens
  const { percentPresent, percentAbsent, percentLate } = useMemo(() => {
    const total = kpis.totalRegistros;
    return {
      percentPresent: total ? Math.round((kpis.totalPresencas / total) * 100) : 0,
      percentAbsent: total ? Math.round((kpis.totalFaltas / total) * 100) : 0,
      percentLate: total ? Math.round((kpis.totalAtrasos / total) * 100) : 0,
    };
  }, [kpis]);

  // Ranking de faltas otimizado
  const rankingFaltas = useMemo(() => 
    [...tabelaAlunos]
      .sort((a, b) => b.faltas - a.faltas)
      .slice(0, 5),
    [tabelaAlunos]
  );

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#8A52FE" />
        <MyText variant="body1" style={{ marginTop: 16 }}>Carregando dados...</MyText>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        contentContainerStyle={styles.scroll}
        onEndReached={() => hasMore && fetchCheckIns()}
        onEndReachedThreshold={0.5}
        data={[1]} // Dummy data para renderizar apenas uma vez
        renderItem={() => (
          <>
            <View style={styles.purpleTitleBox}>
              <MyText variant="h1" style={{ color: '#fff', textAlign: 'center' }}>
                Painel de relatórios
              </MyText>
            </View>

            {/* Filtros de período */}
            <View style={{ flexDirection: 'row', gap: 8, marginBottom: 16 }}>
              {(['week', 'month', 'year'] as const).map((period) => (
                <TouchableOpacity
                  key={period}
                  style={[
                    styles.periodButton,
                    selectedPeriod === period ? styles.periodButtonActive : null
                  ]}
                  onPress={() => setSelectedPeriod(period)}
                >
                  <MyText 
                    variant="button" 
                    style={selectedPeriod === period ? styles.periodButtonTextActive : styles.periodButtonText}
                  >
                    {period === 'week' ? 'Semana' : period === 'month' ? 'Mês' : 'Ano'}
                  </MyText>
                </TouchableOpacity>
              ))}
            </View>

            {/* KPIs */}
            <View style={{ flexDirection: 'row', gap: 12, marginBottom: 16, justifyContent: 'center' }}>
              <View style={styles.kpiBox}>
                <MyText variant="h4" style={{ color: '#4CAF50', fontWeight: 'bold' }}>{percentPresent}%</MyText>
                <MyText variant="body2">Presenças</MyText>
              </View>
              <View style={[styles.kpiBox, { backgroundColor: '#ffebee' }]}>
                <MyText variant="h4" style={{ color: '#F44336', fontWeight: 'bold' }}>{percentAbsent}%</MyText>
                <MyText variant="body2">Faltas</MyText>
              </View>
              <View style={[styles.kpiBox, { backgroundColor: '#fff8e1' }]}>
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
                <MyText variant="h6" style={styles.kpiLabel}>
                  Frequência média geral: {percentPresent}%
                </MyText>
                <MyText variant="h6" style={styles.kpiLabel}>
                  Total de registros: {kpis.totalRegistros}
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
              {rankingFaltas.length === 0 ? (
                <MyText variant="body2">Nenhuma falta registrada.</MyText>
              ) : (
                rankingFaltas.map((aluno, idx) => (
                  <View key={aluno.name} style={styles.rankingItem}>
                    <MyText variant="body2" style={styles.rankingPosition}>{idx + 1}.</MyText>
                    <MyText variant="body2" style={styles.rankingName}>{aluno.name}</MyText>
                    <MyText variant="body2" style={styles.rankingFaltas}>{aluno.faltas} faltas</MyText>
                  </View>
                ))
              )}
            </View>

            {/* Tabela detalhada */}
            <View style={styles.purpleTitleBox}>
              <MyText variant="h3" style={{ color: '#fff', textAlign: 'center' }}>
                Tabela detalhada
              </MyText>
            </View>
            <View style={styles.tableContainer}>
              <View style={styles.tableHeader}>
                <MyText variant="body2" style={styles.tableHeaderCell}>Aluno</MyText>
                <MyText variant="body2" style={styles.tableHeaderCell}>Presenças</MyText>
                <MyText variant="body2" style={styles.tableHeaderCell}>Faltas</MyText>
                <MyText variant="body2" style={styles.tableHeaderCell}>% Presença</MyText>
              </View>
              {tabelaAlunos.length === 0 ? (
                <MyText variant="body2">Nenhum aluno registrado.</MyText>
              ) : (
                tabelaAlunos.map((aluno) => (
                  <View key={aluno.name} style={styles.tableRow}>
                    <MyText variant="body2" style={styles.tableCell}>{aluno.name}</MyText>
                    <MyText variant="body2" style={styles.tableCell}>{aluno.presencas}</MyText>
                    <MyText variant="body2" style={styles.tableCell}>{aluno.faltas}</MyText>
                    <MyText variant="body2" style={styles.tableCell}>{aluno.percent}%</MyText>
                  </View>
                ))
              )}
            </View>
          </>
        )}
        ListFooterComponent={() => hasMore && (
          <View style={{ padding: 16, alignItems: 'center' }}>
            <ActivityIndicator size="small" color="#8A52FE" />
            <MyText variant="body2" style={{ marginTop: 8 }}>Carregando mais dados...</MyText>
          </View>
        )}
      />
    </SafeAreaView>
  );
}