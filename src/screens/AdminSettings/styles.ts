import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  scroll: {
    padding: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: '#6A0DAD', // Roxo forte
    marginBottom: 20,
    top: 20,
    alignSelf: 'center',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#8A52FE',
    marginTop: 24,
    marginBottom: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: '#d3d3d3',
    borderRadius: 10,
    backgroundColor: '#f9f9f9',
    paddingVertical: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    marginBottom: 16,
  },
  addButton: {
    backgroundColor: '#8A52FE',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
    shadowColor: '#8A52FE',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5, // para Android
  },
  addButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  currentSettingsContainer: {
    marginVertical: 20,
    padding: 18,
    backgroundColor: '#f1effd',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e0dcfb',
  },
  currentSettingsText: {
    fontSize: 16,
    color: '#444',
    marginBottom: 6,
  },
  saveButton: {
    backgroundColor: '#8A52FE',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
    shadowColor: '#8A52FE',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
  },
  saveButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
