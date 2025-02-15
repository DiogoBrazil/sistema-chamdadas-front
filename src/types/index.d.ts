declare global {
  interface User {
    id: number;
    fullName: string;
    cpf: string;
    profile: 'DOCTOR' | 'RECEPTIONIST' | 'ADMINISTRATOR';
    currentOffice?: number;
  }
  
  interface Patient {
    id: number;
    fullName: string;
    cpf: string;
    birthDate: string;
  }

  interface PatientResponse{
    message: string;
    data: Patient[];
    status_code: number;
  }
  
  interface Professional {
    id: number;
    fullName: string;
    cpf: string;
    profile: 'DOCTOR' | 'RECEPTIONIST' | 'ADMINISTRATOR';
    currentOffice?: number;
  }
  
  interface Attendance {
    id: number;
    patient: Patient;
    status: 'PENDING' | 'IN_PROGRESS' | 'FINISHED';
    createdAt: string;
    finishedAt?: string;
    professionalId?: number;
    officeNumber?: number;
  }
  
  interface LoginResponse {   
    message: string;
    status_code: number;
    data:{
      token: string;
      user: User;
    }
  }
  
  interface ApiError {
    message: string;
  }
}

export default global;