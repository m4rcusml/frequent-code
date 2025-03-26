import { ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { MyText } from '@/components/MyText';
import { styles } from './styles';
import { Field } from '@/components/Field';
import { PersonCard } from '@/components/PersonCard';

export function Home() {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <MyText variant='h1' style={styles.title}>
          Painel administrativo
        </MyText>

        <Field label='Turma' placeholder='3ano-xx' />
        <Field label='Data' placeholder='dd/mm/aaaa' />

        <View style={styles.list}>
          {[1, 2, 3, 4, 5].map((index) => (
            <PersonCard
              key={index}
              data={{
                name: `Exemplo ${index}`,
                avatar_url: 'https://github.com/diego3g.png',
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