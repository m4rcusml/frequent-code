import { ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { MyText } from '@/components/MyText';
import { styles } from './styles';
import { Field } from '@/components/Field';
import { PersonCard } from '@/components/PersonCard';
import { BarChart, PieChart } from 'react-native-gifted-charts';

export function Report() {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <MyText variant='h1' style={styles.title}>
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
            textBackgroundColor='transparent'
            data={[
              { value: 18, color: '#FF6666', text: '18%', fontWeight: 'bold', textColor: 'white' },
              { value: 82, color: '#177AD5', text: '82%', fontWeight: 'bold', textColor: 'white' },
            ]}
          />
          <View>
            <MyText variant='h6' color='black'>
              Frequencia média geral: 82%
            </MyText>
            <MyText variant='h6' color='black'>
              Status: Bom
            </MyText>
          </View>
        </View>

        <MyText variant='h3' style={styles.title}>
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
          <MyText variant='h3' style={styles.title}>
            Alunos com mais falta
          </MyText>

          {[1, 2, 3, 4, 5].map((index) => (
            <PersonCard
              key={index}
              data={{
                name: `Exemplo ${index}`,
                avatar_url: 'https://github.com/jlimaz.png',
                presencePerCent: 100,
                id: String(index),
                status: 1,
              }}
            />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}