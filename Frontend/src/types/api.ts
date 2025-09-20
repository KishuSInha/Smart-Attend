// API response types

// Face recognition response
export interface RecognizeResponse {
  success: boolean;
  message?: string;
  detectedFaces: DetectedFace[];
}

export interface DetectedFace {
  name: string;
  rollNumber: string;
  spoofed: boolean;
  emotion: string;
}

// Student response
export interface StudentResponse {
  id: string;
  name: string;
  rollNumber: string;
  class?: string;
  section?: string;
  photoPath?: string;
}

// Attendance response
export interface AttendanceResponse {
  success: boolean;
  message?: string;
  data?: AttendanceRecord[];
}

export interface AttendanceRecord {
  studentId: string;
  date: string;
  time: string;
  status: 'Present' | 'Absent';
}