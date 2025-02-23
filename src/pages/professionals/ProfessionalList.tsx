// sistema-chamadas-react/src/pages/professionals/ProfessionalList.tsx

import React, { useState, useEffect } from 'react';
import { formatCPF, replaceCPF, getProfileLabel } from '../../utils';
import { 
  fetchProfessionalsByPage, 
  updateProfessional, 
  deleteProfessional,
  searchProfessionalByCpf,
  searchProfessionalsByName,
  addProfessional 
} from '../../services/professionalService';
import { EditModal } from '../../components/EditModal';
import { ConfirmModal } from '../../components/EditModal/ConfirmModal';
import { ReportModal } from '../../components/ui/ReportModal';
import toast from 'react-hot-toast';

interface ProfessionalListProps {
  onBack: () => void;
}

export const ProfessionalList: React.FC<ProfessionalListProps> = ({ onBack }) => {
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [editingProfessional, setEditingProfessional] = useState<Professional | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [deletingProfessionalId, setDeletingProfessionalId] = useState<number | null>(null);
  const [showNewProfessionalModal, setShowNewProfessionalModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [selectedProfessionalForReport, setSelectedProfessionalForReport] = useState<Professional | null>(null);
  
  // Estados para busca e paginação
  const [searchName, setSearchName] = useState<string>('');
  const [searchCpf, setSearchCpf] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isSearching, setIsSearching] = useState(false);

  // Estados para o polling
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Função para verificar se algum modal está aberto
  const isAnyModalOpen = () => {
    return showNewProfessionalModal || 
           showEditModal || 
           deletingProfessionalId !== null ||
           showReportModal;
  };

  useEffect(() => {
    fetchProfessionalList(1);
  }, []);

  // Polling effect
  useEffect(() => {
    // Não fazer polling quando estiver em modo de busca ou qualquer modal estiver aberto
    if (isSearching || isAnyModalOpen()) return;
    
    const intervalId = setInterval(() => {
      refreshProfessionalList(currentPage);
    }, 10000); // 10 segundos
    
    return () => clearInterval(intervalId);
  }, [
    currentPage, 
    isSearching, 
    showNewProfessionalModal, 
    showEditModal, 
    deletingProfessionalId,
    showReportModal
  ]);

  const fetchProfessionalList = async (page: number) => {
    if (isAnyModalOpen()) return;

    setLoading(true);
    setError('');
    setIsSearching(false);
    setIsRefreshing(true);
    
    const token = localStorage.getItem('token');
    if (!token) {
      setError('Usuário não autenticado.');
      setLoading(false);
      setIsRefreshing(false);
      return;
    }

    try {
      const response = await fetchProfessionalsByPage(token, page);
      setProfessionals(response.data);
      if (response.pagination) {
        setCurrentPage(response.pagination.currentPage);
        setTotalPages(response.pagination.totalPages);
      }
      setLastUpdated(new Date());
    } catch (err) {
      setError('Erro ao buscar profissionais.');
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  // Função para refresh silencioso
  const refreshProfessionalList = async (page: number) => {
    if (isRefreshing || isAnyModalOpen()) return;
    
    setIsRefreshing(true);
    const token = localStorage.getItem('token');
    if (!token) {
      setIsRefreshing(false);
      return;
    }

    try {
      const response = await fetchProfessionalsByPage(token, page);
      setProfessionals(response.data);
      if (response.pagination) {
        setCurrentPage(response.pagination.currentPage);
        setTotalPages(response.pagination.totalPages);
      }
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Erro ao atualizar profissionais:', err);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleSearch = async () => {
    if (!searchName && !searchCpf) {
      return fetchProfessionalList(1);
    }
  
    setLoading(true);
    setIsSearching(true);
    setIsRefreshing(true);
    
    const token = localStorage.getItem('token');
    if (!token) {
      setError('Usuário não autenticado');
      setLoading(false);
      setIsRefreshing(false);
      return;
    }
  
    try {
      if (searchCpf) {
        // Remove formatação do CPF antes de enviar para a API
        const cleanCpf = replaceCPF(searchCpf);
        const response = await searchProfessionalByCpf(token, cleanCpf);
        // Se encontrou o profissional, coloca em um array se necessário, senão array vazio
        setProfessionals(Array.isArray(response.data) ? response.data : (response.data ? [response.data] : []));
      } else if (searchName) {
        const response = await searchProfessionalsByName(token, searchName);
        setProfessionals(response.data);
      }
      setLastUpdated(new Date());
    } catch (err) {
      setProfessionals([]);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleCreateProfessional = async (formData: any) => {
    const token = localStorage.getItem('token');
    if (!token) {
      setError('Usuário não autenticado');
      return;
    }
  
    try {
      const { confirmPassword, ...rest } = formData;
      const dataToSubmit = {
        ...rest,
        cpf: replaceCPF(formData.cpf)
      };
      
      const response = await addProfessional(token, dataToSubmit);
      toast.success('Profissional cadastrado com sucesso!', {
        position: 'bottom-right',
        style: { background: 'green', color: 'white' },
      });
  
      // Atualiza o estado local imediatamente
      setProfessionals(prev => [...prev, response.data]);
      
      setShowNewProfessionalModal(false);
    } catch (err) {
      toast.error('Erro ao cadastrar profissional', {
        position: 'bottom-right',
        style: { background: 'red', color: 'white' },
      });
    }
  };

  const handleClear = () => {
    setSearchName('');
    setSearchCpf('');
    fetchProfessionalList(1);
  };

  const handleEdit = (professional: Professional) => {
    setEditingProfessional(professional);
    setShowEditModal(true);
  };

  const handleUpdate = async (formData: any) => {
    if (!editingProfessional) return;
  
    const token = localStorage.getItem('token');
    if (!token) {
      setError('Usuário não autenticado');
      return;
    }
  
    try {
      const { confirmPassword, ...restData } = formData;
      let dataToSubmit: any = {
        ...restData,
        cpf: replaceCPF(formData.cpf)
      };
      
      if (!dataToSubmit.password) {
        delete dataToSubmit.password;
      }
      
      const response = await updateProfessional(editingProfessional.id, token, dataToSubmit);
      toast.success('Profissional atualizado com sucesso!', {
        position: 'bottom-right',
        style: { background: 'green', color: 'white' },
      });
  
      // Atualiza o estado local imediatamente
      setProfessionals(prev => 
        prev.map(prof => 
          prof.id === editingProfessional.id ? response.data : prof
        )
      );
      
      setShowEditModal(false);
      setEditingProfessional(null);
    } catch (err) {
      toast.error('Erro ao atualizar profissional', {
        position: 'bottom-right',
        style: { background: 'red', color: 'white' },
      });
    }
  };

  const handleDeleteClick = (id: number) => {    
    setDeletingProfessionalId(id);
  };

  const handleShowReport = (professional: Professional) => {
    setSelectedProfessionalForReport(professional);
    setShowReportModal(true);
  };

  const handleConfirmDelete = async () => {    
    if (!deletingProfessionalId) return;
  
    const token = localStorage.getItem('token');
    if (!token) {
      setError('Usuário não autenticado');
      return;
    }
  
    try {      
      await deleteProfessional(deletingProfessionalId, token);      
      toast.success('Profissional excluído com sucesso!', {
        position: 'bottom-right',
        style: { background: 'green', color: 'white' },
      });
      
      // Atualiza o estado local imediatamente
      setProfessionals(prev => prev.filter(prof => prof.id !== deletingProfessionalId));
      
    } catch (err) {
      console.error('Erro ao deletar:', err);
      toast.error('Erro ao excluir profissional', {
        position: 'bottom-right',
        style: { background: 'red', color: 'white' },
      });
    } finally {
      setDeletingProfessionalId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <span className="text-gray-500">Carregando profissionais...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <span className="text-red-500">{error}</span>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <button
            onClick={onBack}
            className="mr-4 text-blue-600 hover:text-blue-800"
            aria-label="Voltar"
          >
            ← Voltar
          </button>
          <h2 className="text-2xl font-bold text-gray-900">Lista de Profissionais</h2>
        </div>
        <button
          onClick={() => setShowNewProfessionalModal(true)}
          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
        >
          + Novo Profissional
        </button>
      </div>

      <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Buscar por Nome
          </label>
          <input
            type="text"
            placeholder="Digite o nome do profissional..."
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchName}
            onChange={(e) => setSearchName(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Buscar por CPF
          </label>
          <input
            type="text"
            placeholder="Digite o CPF..."
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchCpf}
            onChange={(e) => setSearchCpf(formatCPF(e.target.value))}
            maxLength={14}
          />
        </div>
      </div>

      <div className="flex justify-end space-x-2 mb-6">
        <button
          onClick={handleClear}
          className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
        >
          Limpar
        </button>
        <button
          onClick={handleSearch}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Buscar
        </button>
      </div>

      {/* Indicador de Atualização */}
      <div className="flex justify-between items-center mb-4 text-sm text-gray-500">
        <span>
          Última atualização: {lastUpdated.toLocaleTimeString()}
        </span>
        <button
          onClick={() => isSearching ? handleSearch() : refreshProfessionalList(currentPage)}
          className="flex items-center px-3 py-1 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
          disabled={isRefreshing || isAnyModalOpen()}
        >
          {isRefreshing ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Atualizando...
            </>
          ) : (
            <>
              <svg className="mr-1 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
              </svg>
              Atualizar
            </>
          )}
        </button>
      </div>

      <div className="space-y-4">
        {professionals.length > 0 ? (
          professionals.map(professional => (
            <div
              key={professional.id}
              className="flex justify-between items-center p-4 border rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div>
                <h3 className="font-medium text-gray-900">{professional.fullName}</h3>
                <p className="text-sm text-gray-500">CPF: {formatCPF(professional.cpf)}</p>
                <p className="text-sm text-gray-500">
                  Perfil: {getProfileLabel(professional.profile)}
                  {professional.currentOffice && ` - Consultório ${professional.currentOffice}`}
                </p>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleEdit(professional)}
                  className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded-full transition-colors"
                  title="Editar"
                >
                  ✏️
                </button>
                <button
                  onClick={() => handleDeleteClick(professional.id)}
                  className="p-2 text-red-600 hover:text-red-800 hover:bg-red-100 rounded-full transition-colors"
                  title="Excluir"
                >
                  🗑️
                </button>
                {professional.profile === 'DOCTOR' && (
                  <button
                    onClick={() => handleShowReport(professional)}
                    className="p-2 text-green-600 hover:text-green-800 hover:bg-green-100 rounded-full transition-colors"
                    title="Ver Produtividade"
                  >
                    📊
                  </button>
                )}
              </div>
            </div>
          ))
        ) : (
          <p className="text-center text-gray-500">Nenhum profissional encontrado</p>
        )}
      </div>

      {!isSearching && totalPages > 1 && (
        <div className="mt-6 flex justify-center space-x-2">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => fetchProfessionalList(page)}
              className={`px-4 py-2 rounded-md ${
                currentPage === page
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {page}
            </button>
          ))}
        </div>
      )}

      {showNewProfessionalModal && (
        <EditModal<{
          fullName: string;
          cpf: string;
          profile: string;
          password: string;
          confirmPassword: string;
        }>
          isOpen={showNewProfessionalModal}
          onClose={() => setShowNewProfessionalModal(false)}
          onConfirm={handleCreateProfessional}
          title="Cadastrar Novo Profissional"
          fields={[
            {
              name: 'fullName',
              label: 'Nome Completo',
              type: 'text',
              value: '',
              required: true,
            },
            {
              name: 'cpf',
              label: 'CPF',
              type: 'text',
              value: '',
              required: true,
              formatter: formatCPF,
              placeholder: '000.000.000-00'
            },
            {
              name: 'profile',
              label: 'Perfil',
              type: 'select',
              value: 'DOCTOR',
              required: true,
              options: [
                { value: 'ADMINISTRATOR', label: 'Administrador' },
                { value: 'DOCTOR', label: 'Médico' },
                { value: 'RECEPTIONIST', label: 'Recepcionista' }
              ]
            },
            {
              name: 'password',
              label: 'Senha',
              type: 'password',
              value: '',
              required: true,
              validator: (value) => value.length < 6 ? 'A senha deve ter no mínimo 6 caracteres' : undefined
            },
            {
              name: 'confirmPassword',
              label: 'Confirmar Senha',
              type: 'password',
              value: '',
              required: true,
              validator: (value) => {
                const form = document.forms[0];
                const password = form ? form.elements.namedItem('field-password') as HTMLInputElement : null;
                return password && value !== password.value ? 'As senhas não conferem' : undefined;
              }
            }
          ]}
          data={{
            fullName: '',
            cpf: '',
            profile: 'DOCTOR',
            password: '',
            confirmPassword: ''
          }}
        />
      )}

      {editingProfessional && (
        <EditModal<Professional & {
          password?: string;
          confirmPassword?: string;
        }>
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            setEditingProfessional(null);
          }}
          onConfirm={handleUpdate}
          title="Editar Profissional"
          fields={[
            {
              name: 'fullName',
              label: 'Nome Completo',
              type: 'text',
              value: editingProfessional.fullName,
              required: true,
            },
            {
              name: 'cpf',
              label: 'CPF',
              type: 'text',
              value: editingProfessional.cpf,
              required: true,
              formatter: formatCPF,
              placeholder: '000.000.000-00'
            },
            {
              name: 'profile',
              label: 'Perfil',
              type: 'select',
              value: editingProfessional.profile,
              required: true,
              options: [
                { value: 'ADMINISTRATOR', label: 'Administrador' },
                { value: 'DOCTOR', label: 'Médico' },
                { value: 'RECEPTIONIST', label: 'Recepcionista' }
              ]
            },
            {
              name: 'password',
              label: 'Nova Senha (deixe em branco para manter a atual)',
              type: 'password',
              value: '',
              required: false,
              validator: (value) => value && value.length < 6 ? 'A senha deve ter no mínimo 6 caracteres' : undefined
            },
            {
              name: 'confirmPassword',
              label: 'Confirmar Nova Senha',
              type: 'password',
              value: '',
              required: false,
              validator: (value) => {
                const form = document.forms[0];
                const password = form ? form.elements.namedItem('field-password') as HTMLInputElement : null;
                if (!password || !password.value) return undefined; // Se não estiver alterando a senha, não valida
                return password && value !== password.value ? 'As senhas não conferem' : undefined;
              }
            }
          ]}
          data={{
            ...editingProfessional,
            password: '',
            confirmPassword: ''
          }}
        />
      )}

      <ConfirmModal
        isOpen={deletingProfessionalId !== null}
        onClose={() => setDeletingProfessionalId(null)}
        onConfirm={handleConfirmDelete}
        title="Excluir Profissional"
        message="Tem certeza que deseja excluir este profissional? Esta ação não pode ser desfeita."
        confirmLabel="Excluir"
        cancelLabel="Cancelar"
      />

      {selectedProfessionalForReport && (
        <ReportModal
          isOpen={showReportModal}
          onClose={() => {
            setShowReportModal(false);
            setSelectedProfessionalForReport(null);
          }}
          professionalId={selectedProfessionalForReport.id}
          professionalName={selectedProfessionalForReport.fullName}
        />
      )}
    </div>
  );
};