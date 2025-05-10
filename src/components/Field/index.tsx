import { useState } from 'react';
import { TextInput, View, TouchableOpacity, KeyboardTypeOptions } from 'react-native';
import { IconProps, Eye, EyeSlash } from 'phosphor-react-native';
import { MyText } from '../MyText';
import { styles } from './styles';

type Props = {
  label: string;
  placeholder?: string;
  isPassword?: boolean;
  value: string;
  onChangeText: (text: string) => void;
  icon?(props: IconProps): React.ReactElement;
  keyboardType?: KeyboardTypeOptions;
};

export function Field({ label, isPassword, placeholder, value, onChangeText, icon, keyboardType }: Props) {
  const [secureTextEntry, setSecureTextEntry] = useState(isPassword);

  const toggleSecureTextEntry = () => {
    setSecureTextEntry((prev) => !prev);
  };

  return (
    <View style={styles.container}>
      <MyText variant="h5">{label}</MyText>
      <View style={styles.input}>
        <TextInput
          style={styles.inputText}
          placeholder={placeholder}
          secureTextEntry={secureTextEntry}
          placeholderTextColor={'#9e9e9e'}
          value={value}
          onChangeText={onChangeText}
          keyboardType={keyboardType}
        />
        {icon && icon({ size: 22, color: '#8A52FE', style: styles.icon })}
        {isPassword && (
          <TouchableOpacity onPress={toggleSecureTextEntry}>
            {secureTextEntry ? (
              <EyeSlash size={22} color="#8A52FE" style={styles.icon} />
            ) : (
              <Eye size={22} color="#8A52FE" style={styles.icon} />
            )}
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}
