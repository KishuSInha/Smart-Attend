import { API_CONFIG } from './mockData';
import { Student } from '../types/student';

// API service for connecting to the backend
const apiService = {
  // Face recognition
  recognizeFace: async (base64Image: string) => {
    const response = await fetch(`${API_CONFIG.BASE_URL}/recognize`, {
      method: 'POST',
      headers: API_CONFIG.headers,
      body: JSON.stringify({ image: base64Image }),
      credentials: 'include'
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to communicate with the recognition service');
    }

    return await response.json();
  },

  // Student operations
  getStudents: async (classFilter?: string, sectionFilter?: string) => {
    const queryParams = new URLSearchParams();
    if (classFilter) queryParams.append('class', classFilter);
    if (sectionFilter) queryParams.append('section', sectionFilter);
    
    const response = await fetch(`${API_CONFIG.BASE_URL}/students?${queryParams.toString()}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch students');
    }
    
    return await response.json();
  },

  searchStudents: async (query: string) => {
    const response = await fetch(`${API_CONFIG.BASE_URL}/students/search?q=${encodeURIComponent(query)}`);
    
    if (!response.ok) {
      throw new Error('Failed to search students');
    }
    
    return await response.json();
  },

  markAttendance: async (studentIds: string[], period: string, date: string) => {
    const response = await fetch(`${API_CONFIG.BASE_URL}/attendance`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ studentIds, period, date }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to mark attendance');
    }
    
    return await response.json();
  },

  // Get attendance records
  getAttendance: async (date?: string, classFilter?: string, sectionFilter?: string) => {
    const queryParams = new URLSearchParams();
    if (date) queryParams.append('date', date);
    if (classFilter) queryParams.append('class', classFilter);
    if (sectionFilter) queryParams.append('section', sectionFilter);
    
    const response = await fetch(`${API_CONFIG.BASE_URL}/attendance?${queryParams.toString()}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch attendance records');
    }
    
    return await response.json();
  },
};

export default apiService;