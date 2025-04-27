import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    top: '5%',
    height: '30%',
    width: '70%',
    resizeMode: 'contain',
    alignSelf: 'center',
  },
  form: {
    marginTop: '5%',
    alignSelf: 'center',
    width: '80%',
    paddingVertical: 20,
    minHeight: 320,
    maxHeight: '50%',
  },
  formContent: {
    gap: 15,
  },
  forgot: {
    alignSelf: 'center',
    marginTop: 5,
    color: '#8A52FE',
    fontSize: 14, 
    fontWeight: '500',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  errorText: {
    color: '#FF6B6B',
    fontSize: 12,
    marginLeft: 4,
    fontWeight: '500',
  },
  field: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 8,
  },
});