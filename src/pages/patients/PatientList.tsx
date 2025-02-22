import React, { useState, useEffect } from 'react';
import { formatCPF, formatDate, validateBirthDate, validateCPF } from '../../utils';
import { 
  fetchPatientsByPage, 
  createAttendance, 
  updatePatient, 
  deletePatient,
  searchPatientByCpf,
  searchPatientsByName,
  addPatient 
} from '../../services/patientService';
import toast from 'react-hot-toast';
import { EditModal } from '../../components/EditModal';
import { ConfirmModal } from '../../components/EditModal/ConfirmModal';

interface PatientListProps {
  onBack: () => void;
}

export const PatientList: React.FC<PatientListProps> = ({ onBack }) => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [loadingAttendance, setLoadingAttendance] = useState<number | null>(null);
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [deletingPatientId, setDeletingPatientId] = useState<number | null>(null);
  const [attendancePatientId, setAttendancePatientId] = useState<number | null>(null);
  const [showNewPatientModal, setShowNewPatientModal] = useState(false);
  
  // Estados para busca e paginação
  const [searchName, setSearchName] = useState<string>('');
  const [searchCpf, setSearchCpf] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isSearching, setIsSearching] = useState(false);
  
  // Novos estados para o polling
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Inicial fetch
  useEffect(() => {
    fetchPatientList(1);
  }, []);
  
  // Polling effect
  useEffect(() => {
    // Não fazer polling quando estiver em modo de busca
    if (isSearching) return;
    
    const intervalId = setInterval(() => {
      // Recarregar os dados da página atual, mas não mostrar o loading
      refreshPatientList(currentPage);
    }, 10000); // 10 segundos
    
    return () => clearInterval(intervalId);
  }, [currentPage, isSearching]);

  // Função normal de fetch com loading
  const fetchPatientList = async (page: number) => {
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
      const response = await fetchPatientsByPage(token, page);
      setPatients(response.data);
      setCurrentPage(response.pagination.currentPage);
      setTotalPages(response.pagination.totalPages);
      setLastUpdated(new Date());
    } catch (err) {
      setError('Erro ao buscar pacientes.');
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };
  
  // Função para refresh silencioso (sem loading geral)
  const refreshPatientList = async (page: number) => {
    if (isRefreshing) return; // Evita múltiplas atualizações
    
    setIsRefreshing(true);
    const token = localStorage.getItem('token');
    if (!token) {
      setIsRefreshing(false);
      return;
    }

    try {
      const response = await fetchPatientsByPage(token, page);
      setPatients(response.data);
      setCurrentPage(response.pagination.currentPage);
      setTotalPages(response.pagination.totalPages);
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Erro ao atualizar pacientes:', err);
      // Não mostra erro para o usuário em atualizações silenciosas
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleSearch = async () => {
    if (!searchName && !searchCpf) {
      return fetchPatientList(1);
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
        const response = await searchPatientByCpf(token, searchCpf);
        // Se encontrou o paciente, coloca em um array se necessário, senão array vazio
        setPatients(Array.isArray(response.data) ? response.data : (response.data ? [response.data] : []));
      } else if (searchName) {
        const response = await searchPatientsByName(token, searchName);
        setPatients(response.data);
      }
      setLastUpdated(new Date());
    } catch (err) {
      setPatients([]);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleCreatePatient = async (formData: any) => {
    const token = localStorage.getItem('token');
    if (!token) {
      setError('Usuário não autenticado');
      return;
    }

    try {
      await addPatient(token, formData);
      toast.success('Paciente cadastrado com sucesso!', {
        position: 'bottom-right',
        style: { background: 'green', color: 'white' },
      });
      if (isSearching) {
        handleSearch();
      } else {
        fetchPatientList(currentPage);
      }
      setShowNewPatientModal(false);
    } catch (err) {
      toast.error('Erro ao cadastrar paciente', {
        position: 'bottom-right',
        style: { background: 'red', color: 'white' },
      });
    }
  };

  const handleClear = () => {
    setSearchName('');
    setSearchCpf('');
    fetchPatientList(1);
  };

  const handleAttendanceClick = (id: number) => {
    setAttendancePatientId(id);
  };

  const handleConfirmAttendance = async () => {
    if (!attendancePatientId) return;
    if (loadingAttendance !== null) return;

    setLoadingAttendance(attendancePatientId);
    const token = localStorage.getItem('token');
    if (!token) {      
      setLoadingAttendance(null);
      setAttendancePatientId(null);
      return;
    }

    try {
      await createAttendance(attendancePatientId, token);
      toast.success('Atendimento gerado com sucesso!', {
        duration: 4000,
        position: 'bottom-right',
        style: {
          background: 'green',
          color: 'white'
        }
      });
    } catch (err: any) {
      // Verifica se o erro é devido a paciente não encontrado (já foi excluído)
      if (err.response && err.response.status === 404) {
        toast.error('Este paciente não foi encontrado. A lista será atualizada.', {
          position: 'bottom-right',
          style: { background: 'red', color: 'white' },
        });
        // Atualiza a lista automaticamente
        if (isSearching) {
          handleSearch();
        } else {
          fetchPatientList(currentPage);
        }
      } else {
        toast.error('Erro ao gerar atendimento.', {
          duration: 4000,
          position: 'bottom-right',
          style: {
            background: 'red',
            color: 'white'
          }
        });
      }
    } finally {
      setLoadingAttendance(null);
      setAttendancePatientId(null);
    }
  };

  const handleEdit = (patient: Patient) => {
    setEditingPatient(patient);
    setShowEditModal(true);
  };

  const handleUpdate = async (formData: any) => {
    if (!editingPatient) return;

    const token = localStorage.getItem('token');
    if (!token) {
      setError('Usuário não autenticado');
      return;
    }

    try {
      await updatePatient(editingPatient.id, token, formData);
      toast.success('Paciente atualizado com sucesso!', {
        position: 'bottom-right',
        style: { background: 'green', color: 'white' },
      });
      if (isSearching) {
        handleSearch();
      } else {
        fetchPatientList(currentPage);
      }
      setShowEditModal(false);
      setEditingPatient(null);
    } catch (err: any) {
      // Verifica se o erro é devido a paciente não encontrado (já foi excluído)
      if (err.response && err.response.status === 404) {
        toast.error('Este paciente não foi encontrado. A lista será atualizada.', {
          position: 'bottom-right',
          style: { background: 'red', color: 'white' },
        });
        // Atualiza a lista automaticamente
        if (isSearching) {
          handleSearch();
        } else {
          fetchPatientList(currentPage);
        }
      } else {
        toast.error('Erro ao atualizar paciente', {
          position: 'bottom-right',
          style: { background: 'red', color: 'white' },
        });
      }
      setShowEditModal(false);
      setEditingPatient(null);
    }
  };

  const handleDeleteClick = (id: number) => {    
    setDeletingPatientId(id);
  };

  const handleConfirmDelete = async () => {    
    if (!deletingPatientId) return;

    const token = localStorage.getItem('token');
    if (!token) {
      setError('Usuário não autenticado');
      return;
    }

    try {      
      await deletePatient(deletingPatientId, token);      
      toast.success('Paciente excluído com sucesso!', {
        position: 'bottom-right',
        style: { background: 'green', color: 'white' },
      });
      if (isSearching) {
        handleSearch();
      } else {
        fetchPatientList(currentPage);
      }
    } catch (err: any) {
      console.error('Erro ao deletar:', err);
      
      // Se o erro for 404 (Não encontrado) ou outro erro de conflito
      if (err.response && (err.response.status === 404 || err.response.status === 409)) {
        toast.error('Este paciente já foi excluído ou modificado por outro usuário. A lista será atualizada.', {
          position: 'bottom-right',
          style: { background: 'red', color: 'white' },
        });
        
        // Atualiza a lista automaticamente quando detectar conflito
        if (isSearching) {
          handleSearch();
        } else {
          fetchPatientList(currentPage);
        }
      } else {
        toast.error('Paciente não pode ser excluído, pois possui histórico de atendimento', {
          position: 'bottom-right',
          style: { background: 'red', color: 'white' },
        });
      }
    } finally {
      setDeletingPatientId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <span className="text-gray-500">Carregando pacientes...</span>
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
          <h2 className="text-2xl font-bold text-gray-900">Lista de Pacientes</h2>
        </div>
        <button
          onClick={() => setShowNewPatientModal(true)}
          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
        >
          + Novo Paciente
        </button>
      </div>

      <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Buscar por Nome
          </label>
          <input
            type="text"
            placeholder="Digite o nome do paciente..."
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
          onClick={() => isSearching ? handleSearch() : fetchPatientList(currentPage)}
          className="flex items-center px-3 py-1 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
          disabled={isRefreshing}
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
        {patients.length > 0 ? (
          patients.map(patient => (
            <div
              key={patient.id}
              className="flex justify-between items-center p-4 border rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div>
                <h3 className="font-medium text-gray-900">{patient.fullName}</h3>
                <p className="text-sm text-gray-500">CPF: {formatCPF(patient.cpf)}</p>
                <p className="text-sm text-gray-500">Data de Nascimento: {formatDate(patient.birthDate)}</p>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleEdit(patient)}
                  className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded-full transition-colors"
                  title="Editar"
                >
                  ✏️
                </button>
                <button
                  onClick={() => handleDeleteClick(patient.id)}
                  className="p-2 text-red-600 hover:text-red-800 hover:bg-red-100 rounded-full transition-colors"
                  title="Excluir"
                >
                  🗑️
                </button>
                <button
                  onClick={() => handleAttendanceClick(patient.id)}
                  className={`p-2 rounded-full transition-colors ${
                    loadingAttendance === patient.id ? 'text-gray-500' : 'text-blue-600 hover:text-blue-800 hover:bg-blue-100'
                  }`}
                  title="Gerar Atendimento"
                  disabled={loadingAttendance === patient.id}
                >
                  {loadingAttendance === patient.id ? '⏳' : '📋'}
                </button>
              </div>
            </div>
          ))
        ) : (
          <p className="text-center text-gray-500">Nenhum paciente encontrado</p>
        )}
      </div>

      {!isSearching && totalPages > 1 && (
        <div className="mt-6 flex justify-center space-x-2">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => fetchPatientList(page)}
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

      {showNewPatientModal && (
        <EditModal
          isOpen={showNewPatientModal}
          onClose={() => setShowNewPatientModal(false)}
          onConfirm={handleCreatePatient}
          title="Cadastrar Novo Paciente"
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
              validator: validateCPF,
              placeholder: '000.000.000-00'
            },
            {
              name: 'birthDate',
              label: 'Data de Nascimento',
              type: 'date',
              value: '',
              required: true,
              validator: validateBirthDate
            }
          ]}
          data={{
            fullName: '',
            cpf: '',
            birthDate: ''
          }}
        />
      )}

      {editingPatient && (
        <EditModal
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            setEditingPatient(null);
          }}
          onConfirm={handleUpdate}
          title="Editar Paciente"
          fields={[
            {
              name: 'fullName',
              label: 'Nome Completo',
              type: 'text',
              value: editingPatient.fullName,
              required: true,
            },
            {
              name: 'cpf',
              label: 'CPF',
              type: 'text',
              value: editingPatient.cpf,
              required: true,
              formatter: formatCPF,
              validator: validateCPF,
              placeholder: '000.000.000-00'
            },
            {
              name: 'birthDate',
              label: 'Data de Nascimento',
              type: 'date',
              value: editingPatient.birthDate,
              required: true,
              validator: validateBirthDate
            }
          ]}
          data={editingPatient}
        />
      )}

      <ConfirmModal
        isOpen={deletingPatientId !== null}
        onClose={() => setDeletingPatientId(null)}
        onConfirm={handleConfirmDelete}
        title="Excluir Paciente"
        message="Tem certeza que deseja excluir este paciente? Esta ação não pode ser desfeita."
        confirmLabel="Excluir"
        cancelLabel="Cancelar"
      />

      <ConfirmModal
        isOpen={attendancePatientId !== null}
        onClose={() => setAttendancePatientId(null)}
        onConfirm={handleConfirmAttendance}
        title="Gerar Atendimento"
        message="Deseja gerar um novo atendimento para este paciente?"
        confirmLabel="Gerar"
        cancelLabel="Cancelar"
      />
    </div>
  );
};