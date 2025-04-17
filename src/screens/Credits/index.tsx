import { ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { MyText } from '@/components/MyText';
import { styles } from './styles';
import { PersonCard } from '@/components/PersonCard';

export function Credits() {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <MyText variant="h1" style={styles.title}>
          Créditos
        </MyText>

        <View style={styles.list}>
          <PersonCard
            key="1"
            data={{
              name: 'Ana Vitória da Costa Farias',
              avatar_url:
                'https://cdn-icons-png.freepik.com/512/17740/17740782.png?uid=R191684037&ga=GA1.1.184522977.1739570380',
              presencePerCent: 100,
              id: '1',
              status: 1,
            }}
          />
        </View>

        <View style={styles.list}>
          <PersonCard
            key="2"
            data={{
              name: 'Marcos Vinícius de S. Braga',
              avatar_url:
                'https://cdn-icons-png.freepik.com/512/17740/17740782.png?uid=R191684037&ga=GA1.1.184522977.1739570380',
              presencePerCent: 100,
              id: '2',
              status: 1,
            }}
          />
        </View>

        <View style={styles.list}>
          <PersonCard
            key="3"
            data={{
              name: 'Gabriel Oliveira de Araújo',
              avatar_url:
                'https://cdn-icons-png.freepik.com/512/17740/17740782.png?uid=R191684037&ga=GA1.1.184522977.1739570380',
              presencePerCent: 100,
              id: '3',
              status: 1,
            }}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}