export type UserRole = 'admin' | 'student' | 'teacher';
export type UserStatus = 'active' | 'inactive' | 'suspended';
export type CheckInStatus = 'present' | 'late' | 'absent' | 'justified';
export type ReportStatus = 'draft' | 'published' | 'archived';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
  status: UserStatus;
  lastLogin: Date;
  profile: {
    avatar: string | null;
    phone: string | null;
    address: string | null;
  };
}

export interface Class {
  id: string;
  name: string;
  code: string;
  year: number;
  semester: number;
  teacherId: string;
  students: string[];
  schedule: {
    startTime: string;
    endTime: string;
    daysOfWeek: number[];
  };
  createdAt: Date;
  updatedAt: Date;
  status: 'active' | 'inactive';
}

export interface CheckIn {
  id: string;
  userId: string;
  classId: string;
  date: Date;
  status: CheckInStatus;
  location: {
    latitude: number;
    longitude: number;
    accuracy: number;
  };
  deviceInfo: {
    platform: string;
    version: string;
    deviceId: string;
  };
  createdAt: Date;
  updatedAt: Date;
  metadata: {
    justification: string | null;
    notes: string | null;
  };
}

export interface Settings {
  id: string;
  type: 'checkin' | 'system' | 'notification';
  config: {
    checkin: {
      allowedTimeWindow: {
        start: string;
        end: string;
      };
      maxDistance: number;
      requireLocation: boolean;
      requirePhoto: boolean;
      allowedLocation?: {
        latitude: number;
        longitude: number;
        radius: number;
      };
    };
    notification: {
      enabled: boolean;
      channels: string[];
      schedule: {
        time: string;
        days: number[];
      };
    };
  };
  updatedBy: string;
  updatedAt: Date;
}

export interface AttendanceReport {
  id: string;
  classId: string;
  period: {
    start: Date;
    end: Date;
  };
  stats: {
    totalStudents: number;
    present: number;
    absent: number;
    late: number;
    justified: number;
  };
  generatedAt: Date;
  generatedBy: string;
  status: ReportStatus;
} 