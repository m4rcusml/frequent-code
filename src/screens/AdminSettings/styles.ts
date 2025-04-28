import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scroll: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 64,
    gap: 20,
  },
  title: {
    backgroundColor: '#D9D9D9',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 8,
    textAlign: 'center',
  },
  addButton: {
    backgroundColor: '#8A52FE',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 16,
  },
  addButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
});