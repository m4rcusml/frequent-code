import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  form: {
    alignSelf: 'center',
    width: '80%',
    maxHeight: '38%',
    paddingVertical: 20,
    minHeight: 500,
    marginTop: '-25%',
  },
  formContent: {
    gap: 15,
  },
  forgot: {
    alignSelf: 'center',
  },
  register: {
    alignSelf: 'center',
  },
  errorText: {
    color: 'red', // Cor vermelha para destacar o erro
    fontSize: 12, // Tamanho pequeno para não ocupar muito espaço
    marginTop: 4, // Espaço acima do texto
    marginBottom: 8, // Espaço abaixo do texto
    alignSelf: 'flex-start', // Alinha o texto ao início do campo
  },
});