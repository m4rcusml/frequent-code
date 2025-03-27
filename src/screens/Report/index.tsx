import { ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { MyText } from '@/components/MyText';
import { styles } from './styles';
import { PersonCard } from '@/components/PersonCard';
import { BarChart, PieChart } from 'react-native-gifted-charts';

export function Report() {
  const students = [
    {
      id: '1',
      name: 'Rafael Souza',
      avatar_url: 'https://cdn-icons-png.freepik.com/512/17740/17740782.png?uid=R191684037&ga=GA1.1.184522977.1739570380',
      presencePerCent: 62,
    },
    {
      id: '2',
      name: 'Mariana Oliveira',
      avatar_url: 'https://cdn-icons-png.freepik.com/512/17740/17740782.png?uid=R191684037&ga=GA1.1.184522977.1739570380',
      presencePerCent: 64,
    },
    {
      id: '3',
      name: 'Lucas Fernandes',
      avatar_url: 'https://cdn-icons-png.freepik.com/512/17740/17740782.png?uid=R191684037&ga=GA1.1.184522977.1739570380',
      presencePerCent: 68,
    },
    {
      id: '4',
      name: 'Camila Andrade',
      avatar_url: 'https://cdn-icons-png.freepik.com/512/17740/17740782.png?uid=R191684037&ga=GA1.1.184522977.1739570380',
      presencePerCent: 72,
    },
    {
      id: '5',
      name: 'João Pereira',
      avatar_url: 'https://cdn-icons-png.freepik.com/512/17740/17740782.png?uid=R191684037&ga=GA1.1.184522977.1739570380',
      presencePerCent: 75,
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <MyText variant="h1" style={styles.title}>
          Painel de relatórios
        </MyText>

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
              { value: 18, color: '#FF6666', text: '18%', fontWeight: 'bold', textColor: 'white' },
              { value: 82, color: '#177AD5', text: '82%', fontWeight: 'bold', textColor: 'white' },
            ]}
          />
          <View>
            <MyText variant="h6" color="black">
              Frequencia média geral: 82%
            </MyText>
            <MyText variant="h6" color="black">
              Status: Bom
            </MyText>
          </View>
        </View>

        <MyText variant="h3" style={styles.title}>
          Comparação entre salas
        </MyText>

        <BarChart
          barWidth={22}
          noOfSections={3}
          barBorderRadius={4}
          frontColor="lightgray"
          data={[
            { value: 10, label: '3ºXX' },
            { value: 25, label: '3ºXX' },
            { value: 50, label: '3ºXX' },
            { value: 75, label: '3ºXX', frontColor: '#177AD5' },
            { value: 95, label: '3ºXX', frontColor: '#177AD5' },
            { value: 65, label: '3ºXX' },
            { value: 80, label: '3ºXX', frontColor: '#177AD5' },
          ]}
          yAxisThickness={0}
          xAxisThickness={0}
        />

        <View style={styles.list}>
          <MyText variant="h3" style={styles.title}>
            Alunos com mais falta
          </MyText>

          {students.map((student) => (
            <PersonCard
              key={student.id}
              data={{
                name: student.name,
                avatar_url: student.avatar_url,
                presencePerCent: student.presencePerCent,
                id: student.id,
                status: 1,
              }}
            />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}