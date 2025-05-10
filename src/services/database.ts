import 'react-native-get-random-values';
import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  Timestamp,
  addDoc,
  updateDoc,
  deleteDoc,
  orderBy,
  limit
} from 'firebase/firestore';
import { db } from './firebaseConfig';
import { v4 as uuidv4 } from 'uuid';
import { User, Class, CheckIn, Settings, AttendanceReport } from '@/types/database';
import * as Application from 'expo-application';
import * as Device from 'expo-device';

// Funções auxiliares
const convertTimestampToDate = (timestamp: Timestamp): Date => {
  return timestamp.toDate();
};

const convertDateToTimestamp = (date: Date): Timestamp => {
  return Timestamp.fromDate(date);
};

// Funções de Usuário
export const createUser = async (userData: Omit<User, 'createdAt' | 'updatedAt' | 'lastLogin'>): Promise<User> => {
  const now = new Date();
  
  const user: User = {
    ...userData,
    createdAt: now,
    updatedAt: now,
    lastLogin: now,
  };

  await setDoc(doc(db, 'users', userData.id), user);
  return user;
};

export const getUser = async (id: string): Promise<User | null> => {
  const docRef = doc(db, 'users', id);
  const docSnap = await getDoc(docRef);
  
  if (!docSnap.exists()) return null;
  
  const data = docSnap.data() as User;
  return {
    ...data,
    createdAt: convertTimestampToDate(data.createdAt as unknown as Timestamp),
    updatedAt: convertTimestampToDate(data.updatedAt as unknown as Timestamp),
    lastLogin: convertTimestampToDate(data.lastLogin as unknown as Timestamp),
  };
};

// Funções de Check-in
export const createCheckIn = async (
  userId: string,
  classId: string,
  location: { latitude: number; longitude: number; accuracy: number },
  userName?: string
): Promise<CheckIn & { userName?: string }> => {
  const id = uuidv4();
  const now = new Date();
  
  const deviceInfo = {
    platform: Device.osName || 'unknown',
    version: Application.nativeApplicationVersion || 'unknown',
    deviceId: Application.applicationId || 'unknown',
  };

  const checkIn: any = {
    id,
    userId,
    classId,
    date: now,
    status: 'present',
    location,
    deviceInfo,
    createdAt: now,
    updatedAt: now,
    metadata: {
      justification: null,
      notes: null,
    },
  };
  if (userName) checkIn.userName = userName;

  await setDoc(doc(db, 'checkins', id), checkIn);
  return checkIn;
};

export const getCheckInsByUser = async (
  userId: string,
  startDate: Date,
  endDate: Date
): Promise<CheckIn[]> => {
  const q = query(
    collection(db, 'checkins'),
    where('userId', '==', userId),
    where('date', '>=', convertDateToTimestamp(startDate)),
    where('date', '<=', convertDateToTimestamp(endDate)),
    orderBy('date', 'desc')
  );

  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => {
    const data = doc.data() as CheckIn;
    return {
      ...data,
      date: convertTimestampToDate(data.date as unknown as Timestamp),
      createdAt: convertTimestampToDate(data.createdAt as unknown as Timestamp),
      updatedAt: convertTimestampToDate(data.updatedAt as unknown as Timestamp),
    };
  });
};

// Funções de Configurações
export const getSettings = async (type: 'checkin' | 'system' | 'notification'): Promise<Settings | null> => {
  const q = query(
    collection(db, 'settings'),
    where('type', '==', type),
    limit(1)
  );

  const querySnapshot = await getDocs(q);
  if (querySnapshot.empty) return null;

  const data = querySnapshot.docs[0].data() as Settings;
  return {
    ...data,
    updatedAt: convertTimestampToDate(data.updatedAt as unknown as Timestamp),
  };
};

export const updateSettings = async (
  type: 'checkin' | 'system' | 'notification',
  config: Settings['config'],
  updatedBy: string
): Promise<void> => {
  const settings = await getSettings(type);
  const now = new Date();

  if (settings) {
    await updateDoc(doc(db, 'settings', settings.id), {
      config,
      updatedBy,
      updatedAt: convertDateToTimestamp(now),
    });
  } else {
    const newSettings: Settings = {
      id: uuidv4(),
      type,
      config,
      updatedBy,
      updatedAt: now,
    };
    await setDoc(doc(db, 'settings', newSettings.id), newSettings);
  }
};

// Funções de Relatórios
export const generateAttendanceReport = async (
  classId: string,
  startDate: Date,
  endDate: Date,
  generatedBy: string
): Promise<AttendanceReport> => {
  const id = uuidv4();
  const now = new Date();

  // Buscar todos os check-ins do período
  const q = query(
    collection(db, 'checkins'),
    where('classId', '==', classId),
    where('date', '>=', convertDateToTimestamp(startDate)),
    where('date', '<=', convertDateToTimestamp(endDate))
  );

  const querySnapshot = await getDocs(q);
  const checkIns = querySnapshot.docs.map(doc => doc.data() as CheckIn);

  // Calcular estatísticas
  const stats = {
    totalStudents: checkIns.length,
    present: checkIns.filter(c => c.status === 'present').length,
    absent: checkIns.filter(c => c.status === 'absent').length,
    late: checkIns.filter(c => c.status === 'late').length,
    justified: checkIns.filter(c => c.status === 'justified').length,
  };

  const report: AttendanceReport = {
    id,
    classId,
    period: {
      start: startDate,
      end: endDate,
    },
    stats,
    generatedAt: now,
    generatedBy,
    status: 'draft',
  };

  await setDoc(doc(db, 'attendance_reports', id), report);
  return report;
};

export const getClass = async (id: string): Promise<Class | null> => {
  const docRef = doc(db, 'classes', id);
  const docSnap = await getDoc(docRef);
  if (!docSnap.exists()) return null;
  const data = docSnap.data() as Class;
  return {
    ...data,
    createdAt: (data.createdAt as any)?.toDate ? (data.createdAt as any).toDate() : data.createdAt,
    updatedAt: (data.updatedAt as any)?.toDate ? (data.updatedAt as any).toDate() : data.updatedAt,
  };
}; 