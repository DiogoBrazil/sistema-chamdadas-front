export const formatCPF = (cpf: string): string => {
    const numbers = cpf.replace(/\D/g, '');
    return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  };

export const replaceCPF = (cpf: string): string =>{
  const cpfFormat = cpf.replace(/\D/g, '')
  return cpfFormat
}
  
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

  export const isAdmin = (): boolean => {
    const user = getCurrentUser();
    return user?.profile === 'ADMINISTRATOR';
  };
  
  export const validateCPF = (cpf: string): string | undefined => {
    // Remove caracteres não numéricos
    const numbers = cpf.replace(/\D/g, '');
  
    // Verifica se tem 11 dígitos
    if (numbers.length !== 11) {
      return 'CPF deve ter 11 dígitos';
    }
  
    // Verifica se todos os dígitos são iguais
    if (/^(\d)\1+$/.test(numbers)) {
      return 'CPF inválido';
    }
  
    // Converte string em array de números
    const digits = numbers.split('').map(Number);
  
    // Calcula primeiro dígito verificador
    let sum = 0;
    for (let i = 0; i < 9; i++) {
      sum += digits[i] * (10 - i);
    }
    let firstDigit = 11 - (sum % 11);
    if (firstDigit > 9) firstDigit = 0;
  
    // Verifica primeiro dígito
    if (firstDigit !== digits[9]) {
      return 'CPF inválido';
    }
  
    // Calcula segundo dígito verificador
    sum = 0;
    for (let i = 0; i < 10; i++) {
      sum += digits[i] * (11 - i);
    }
    let secondDigit = 11 - (sum % 11);
    if (secondDigit > 9) secondDigit = 0;
  
    // Verifica segundo dígito
    if (secondDigit !== digits[10]) {
      return 'CPF inválido';
    }
  
    return undefined;
  };

  export const validateBirthDate = (value: string): string | undefined => {
    const date = new Date(value);
    const today = new Date();
    
    if (date > today) {
      return 'Data não pode ser futura';
    }
    
    const minDate = new Date();
    minDate.setFullYear(minDate.getFullYear() - 130);
    if (date < minDate) {
      return 'Data muito antiga';
    }
    
    return undefined;
  };