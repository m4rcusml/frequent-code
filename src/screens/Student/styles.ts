import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  scroll: {
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#8A52FE',
    textAlign: 'center',
    marginBottom: 16,
  },
  infoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  infoBox: {
    flex: 1,
    marginHorizontal: 8,
  },
  infoText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 4,
  },
  linkText: {
    fontSize: 12,
    color: '#8A52FE',
    marginTop: 4,
    textDecorationLine: 'underline',
  },
  calendarContainer: {
    marginBottom: 16,
  },
  calendar: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  calendarDay: {
    width: '12.5%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    backgroundColor: '#EDEDED',
    borderRadius: 4,
  },
  calendarText: {
    fontSize: 14,
    color: '#333',
  },
  selectedDay: {
    backgroundColor: '#8A52FE', // Cor de fundo para o dia selecionado
  },
  selectedDayText: {
    color: '#FFF', // Cor do texto para o dia selecionado
  },
  checkInButton: {
    backgroundColor: '#8A52FE',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  checkInText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFF',
  },
});