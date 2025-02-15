import apiClient from "./apiClient";

export const login = async (cpf: string, password: string): Promise<LoginResponse>  => {
  try{
    const response = await apiClient.post('/api/auth/login', {cpf, password});
    console.log("Resposta Login", response)
    return response.data;
  }catch(error: any){
    console.error("Erro no login", error.response?.data || error.message);
    throw new Error(error.response?.data?.message || "Credenciais inválidas")
  }
};

export const setOffice = async (professionalId: number, office: number) => {
  const token = localStorage.getItem('token');
  if(!token){
    throw new Error("Usuário não autenticado");
  }
  try{
    await apiClient.post('/api/auth/set-office', {professionalId, office},{
      headers: {Authorization: `Bearer ${token}`}
    });
  }catch(error:any){
    console.error("Erro ao definir consultório", error.response?.data || error.message);
    throw new Error(error.response?.data?.message || "Erro ao definir consultório")
  }
}   
