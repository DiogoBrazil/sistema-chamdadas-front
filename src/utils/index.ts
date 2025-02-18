export const formatCPF = (cpf: string): string => {
    const numbers = cpf.replace(/\D/g, '');
    return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  };
  
  export const formatDate = (dateString: string): string => {
    const [year, month, day] = dateString.split('-');
    return `${day}/${month}/${year}`;
  };
  
  export const getProfileLabel = (profile: string): string => {
    const profiles = {
      'DOCTOR': 'Médico',
      'RECEPTIONIST': 'Recepcionista'
    };
    return profiles[profile as keyof typeof profiles] || profile;
  };
  
  export const getStatusLabel = (status: string): string => {
    const statuses = {
      'PENDING': 'Pendente',
      'IN_PROGRESS': 'Em Atendimento',
      'FINISHED': 'Finalizado'
    };
    return statuses[status as keyof typeof statuses] || status;
  };
  
  export const getCurrentUser = () => {
    const userStr = localStorage.getItem('user');
    if (!userStr) return null;
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  };
  
  export const isDoctor = (): boolean => {
    const user = getCurrentUser();
    return user?.profile === 'DOCTOR';
  };
  
  export const validateCPF = (cpf: string): boolean => {
    const numbers = cpf.replace(/\D/g, '');
    if (numbers.length !== 11) return false;
    
    // Implementar validação completa de CPF se necessário
    return true;
  };
