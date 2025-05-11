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
  },
  periodButton: {
    flex: 1,
    backgroundColor: '#f6f4fd',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  periodButtonActive: {
    backgroundColor: '#8A52FE',
  },
  periodButtonText: {
    color: '#444',
    fontWeight: '500',
  },
  periodButtonTextActive: {
    color: '#fff',
    fontWeight: 'bold',
  },
  kpiBox: {
    backgroundColor: '#e8f5e9',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    minWidth: 90,
  },
  rankingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 6,
    padding: 8,
  },
  rankingPosition: {
    width: 24,
    fontWeight: 'bold',
    color: '#8A52FE',
  },
  rankingName: {
    flex: 1,
  },
  rankingFaltas: {
    color: '#F44336',
    fontWeight: 'bold',
  },
  tableContainer: {
    backgroundColor: '#f6f4fd',
    borderRadius: 10,
    padding: 8,
    marginBottom: 24,
  },
  tableHeader: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderColor: '#e0dcfb',
    paddingBottom: 4,
    marginBottom: 6,
  },
  tableHeaderCell: {
    flex: 1,
    fontWeight: 'bold',
    color: '#444',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  tableHeaderText: {
    flex: 1,
    textAlign: 'center',
  },
  sortIcon: {
    marginLeft: 4,
    fontSize: 12,
  },
  tableHeaderCellActive: {
    backgroundColor: '#e0dcfb',
    borderRadius: 6,
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    backgroundColor: '#fff',
    borderRadius: 6,
    paddingVertical: 4,
    paddingHorizontal: 2,
  },
  tableCell: {
    flex: 1,
    textAlign: 'center',
  },
  tableCellName: {
    flex: 1,
    textAlign: 'left',
    paddingLeft: 8,
  },
})