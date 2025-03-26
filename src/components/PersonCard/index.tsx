import { Image, TouchableOpacity, View } from 'react-native'
import { styles } from './styles'
import { MyText } from '../MyText';

type Props = {
  data: {
    name: string;
    avatar_url: string;
    presencePerCent: number;
    id: string;
    status: number;
  }
}

export function PersonCard({ data }: Props) {
  return (
    <TouchableOpacity style={styles.container}>
      <Image source={{ uri: data.avatar_url }} style={styles.image} />
      <View style={styles.other}>
        <MyText variant='h5' color='black'>{data.name}</MyText>
        <MyText variant='subtitle2' color='black'>
          Status: {data.status ? 'Presente' : 'Ausente'}
        </MyText>
        <MyText variant='subtitle2' color='black'>
          Presença: {data.presencePerCent}%
        </MyText>
      </View>
    </TouchableOpacity>
  )
}