import { StyleSheet } from 'react-native'

export const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scroll: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 64,
    gap: 20
  },
  title: {
    backgroundColor: '#D9D9D9',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 8,
    textAlign: 'center'
  },
  purpleTitleBox: {
    backgroundColor: '#8A52FE',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginBottom: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  kpiLabel: {
    color: '#444',
    fontWeight: 'normal',
    fontSize: 13,
    marginTop: 6,
  },
  list: {
    gap: 10
  },
  piechart: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 20,  
  }
})