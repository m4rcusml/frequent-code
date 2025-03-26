import { ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { MyText } from '@/components/MyText';
import { styles } from './styles';
import { Field } from '@/components/Field';
import { PersonCard } from '@/components/PersonCard';

export function Credits() {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <MyText variant='h1' style={styles.title}>
          Créditos
        </MyText>

        <View style={styles.list}>
          {[1, 2].map((index) => (
            <PersonCard
              key={index}
              data={{
                name: `Exemplo ${index}`,
                avatar_url: 'https://github.com/m4rcusml.png',
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