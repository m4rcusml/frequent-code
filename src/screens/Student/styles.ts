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
  calendarContainer: {
    marginBottom: 16,
  },
  monthSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  monthYearText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#8A52FE',
  },
  weekDaysRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  weekDayCell: {
    flex: 1,
    alignItems: 'center',
  },
  weekDayText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#333',
  },
  calendarRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  calendarDay: {
    flex: 1,
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 2,
    backgroundColor: '#EDEDED',
    borderRadius: 4,
  },
  calendarDayText: {
    fontSize: 14,
    color: '#333',
  },
  todayUnselectedCell: {
    backgroundColor: '#D3D3D3', // Cinza mais escuro para o dia atual antes do check-in
  },
  todayUnselectedText: {
    color: '#000', // Texto preto para o dia atual antes do check-in
  },
  selectedDay: {
    backgroundColor: '#8A52FE', // Roxo para o dia selecionado após o check-in
  },
  selectedDayText: {
    color: '#FFF', // Texto branco para o dia selecionado após o check-in
  },
  checkInButton: {
    width: '50%',
    alignSelf: 'center',
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
  button: {
    backgroundColor: '#8A52FE',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 16,
  },
  buttonText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 16,
    marginBottom: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  historyCard: {
    backgroundColor: '#f6f4fd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    shadowColor: '#8A52FE',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.10,
    shadowRadius: 3,
    elevation: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  historyStatus: {
    fontWeight: 'bold',
    marginLeft: 8,
  },
  historyStatus_present: {
    color: '#4CAF50',
  },
  historyStatus_late: {
    color: '#FFC107',
  },
  historyStatus_absent: {
    color: '#F44336',
  },
  historyStatus_justified: {
    color: '#2196F3',
  },
  calendarDayPresent: {
    backgroundColor: '#8A52FE', // Roxo
  },
  calendarDayLate: {
    backgroundColor: '#FFC107', // Amarelo
  },
  calendarDayAbsent: {
    backgroundColor: '#F44336', // Vermelho
  },
  calendarDayTextWhite: {
    color: '#FFF',
  },
});