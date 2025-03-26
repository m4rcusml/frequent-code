import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    height: '30%',
    width: '70%',
    objectFit: 'contain',
    alignSelf: 'center'
  },
  form: {
    alignSelf: 'center',
    width: '80%',
    maxHeight: '38%',
    paddingVertical: 20,
    minHeight: 320,
  },
  formContent: {
    gap: 15,
  },
  forgot: {
    alignSelf: 'center'
  },
  register: {
    alignSelf: 'center'
  }
});