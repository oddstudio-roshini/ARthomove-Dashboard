export interface Doctor {
  id: number;
  arthomoveId: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  mobile: string;
  birthYear: number;
  clinicalId: string;
  doctorId: string;
  specialization: string;
  clinic: string;
  status: "ACTIVE" | "INACTIVE";
  mustChangePassword: boolean;
  notes: string;
  createdAt: string;
  updatedAt: string;
  lastLogin: string | null;
  lastDevice: string | null;
  temporaryPassword?: string;
}

export interface DoctorLog {
  id: number;
  doctorId: number;
  action: "LOGIN" | "LOGOUT";
  timestamp: string;
  device: string;
  ipAddress: string;
}

export interface DoctorStats {
  totalDoctors: number;
  activeDoctors: number;
  inactiveDoctors: number;
}

export interface LoginResponse {
  token: string;
  userType: string;
  email: string;
  name: string;
  mustChangePassword: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}
