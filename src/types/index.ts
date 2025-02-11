export interface User {
    id: number;
    fullName: string;
    cpf: string;
    profile: 'DOCTOR' | 'RECEPTIONIST';
    currentOffice?: number;
  }
  
  export interface Patient {
    id: number;
    fullName: string;
    cpf: string;
    birthDate: string;
  }
  
  export interface Professional {
    id: number;
    fullName: string;
    cpf: string;
    profile: 'DOCTOR' | 'RECEPTIONIST';
    currentOffice?: number;
  }
  
  export interface Attendance {
    id: number;
    patient: Patient;
    status: 'PENDING' | 'IN_PROGRESS' | 'FINISHED';
    createdAt: string;
    finishedAt?: string;
    professionalId?: number;
    officeNumber?: number;
  }
  
  export interface LoginResponse {
    token: string;
    message: string;
    user: User;
  }
  
  export interface ApiError {
    message: string;
  }