import React, { useState, useEffect } from 'react';
import { formatCPF, getProfileLabel, replaceCPF, validateCPF  } from '../../utils';
import { fetchProfessinalsByPage, updateProfessional, deleteProfessional, searchProfessinalsByCpf, searchProfessinalsByName, addProfessional } from '../../services/professionalService';
import { EditModal } from '../../components/EditModal';
import { ConfirmModal } from '../../components/EditModal/ConfirmModal';
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
  const [showNewProfessionalsModal, setShowNewProfessionalsModal] = useState(false);  

  // Estados para busca e paginação
  const [searchName, setSearchName] = useState<string>('');
  const [searchCpf, setSearchCpf] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    fetchProfessionals(1);
  }, []);

  const fetchProfessionals = async (page: number) => {
    setLoading(true);
    setError('');
    setIsSearching(false);

    const token = localStorage.getItem('token');
    if(!token){
      setError('Usuário não autenticado.');
      setLoading(false);
      return;
    }

    try {
      const response = await fetchProfessinalsByPage(token, page);
      setProfessionals(response.data);
      if (response.pagination) {
        setCurrentPage(response.pagination.currentPage);
        setTotalPages(response.pagination.totalPages);
      } else {
        setCurrentPage(1);
        setTotalPages(1);
      }
    } catch (err) {
      setError('Erro ao buscar profissionais.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
      if (!searchName && !searchCpf) {
        return fetchProfessionals(1);
      }
    
      setLoading(true);
      setIsSearching(true);
      
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Usuário não autenticado');
        setLoading(false);
        return;
      }
    
      try {
        if (searchCpf) {
          const response = await searchProfessinalsByCpf(token, replaceCPF(searchCpf));          
          setProfessionals(Array.isArray(response.data) ? response.data : (response.data ? [response.data] : []));
        } else if (searchName) {
          const response = await searchProfessinalsByName(token, searchName);
          setProfessionals(response.data);
        }
      } catch (err) {
        setProfessionals([]);
      } finally {
        setLoading(false);
      }
    };
  
    const handleCreateProfessional = async (formData: any) => {      

      const token = localStorage.getItem('token');
      if (!token) {
        setError('Usuário não autenticado');
        return;
      }      

      const { confirmPassword, ...submitData } = formData;      
  
      try {
        await addProfessional(token, {
          ...submitData,
          cpf: replaceCPF(submitData.cpf)
        });
        toast.success('Profissional cadastrado com sucesso!', {
          position: 'bottom-right',
          style: { background: 'green', color: 'white' },
        });
        if (isSearching) {
          handleSearch();
        } else {
          fetchProfessionals(currentPage);
        }
        setShowNewProfessionalsModal(false);
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
      fetchProfessionals(1);
    };

  const handleEdit = (professional: Professional) => {
    setEditingProfessional(professional);
    setShowEditModal(true);
  };

  const handleUpdate = async (formData:any) => {
    if (!editingProfessional) return;       

    const token = localStorage.getItem('token');
    if (!token) {
      setError('Usuário não autenticado');
      return;
    }

    try {
      await updateProfessional(editingProfessional.id, token, {
        ...formData,
        cpf: replaceCPF(formData.cpf)
      });
      toast.success('Profissional atualizado com sucesso!', {
        position: 'bottom-right',
        style: { background: 'green', color: 'white' },
      });

      if(isSearching){
        handleSearch();
      } else{
        fetchProfessionals(currentPage);
      } 

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
      if(isSearching){
        handleSearch();
      } else{
        fetchProfessionals(currentPage);
      }       
    } catch (err) {
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
        <div className="text-gray-500">Carregando profissionais...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="text-red-500">{error}</div>
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
          onClick={() => setShowNewProfessionalsModal(true)}
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
              onClick={() => fetchProfessionals(page)}
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

      {showNewProfessionalsModal && (
        <EditModal
          isOpen={showNewProfessionalsModal}
          onClose={() => setShowNewProfessionalsModal(false)}
          onConfirm={handleCreateProfessional}
          title="Cadastrar Novo Profissional"
          fields={[
            {
              name: 'fullName',
              label: 'Nome Completo',
              type: 'text',
              value: '',
              required: true,
              placeholder: 'Digite o nome completo'
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
              name: 'profile',
              label: 'Perfil',
              type: 'select',
              value: 'RECEPTIONIST',
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
              validator: (value) => value.length < 6 ? 'A senha deve ter no mínimo 6 caracteres' : undefined,
              placeholder: 'Digite sua senha'
            },
            {
              name: 'confirmPassword',
              label: 'Confirmar Senha',
              type: 'password',
              value: '',
              required: true,
              validator:(value) => {
                const form = document.forms[0];
                const password = form ? form.elements.namedItem('field-password') as HTMLInputElement : null;
                return password && value !== password.value ? 'As senhas não conferem' : undefined;
              },              
              placeholder: 'Confirme sua senha'
            }
          ]}
          data={{
            fullName: '',
            cpf: '',
            profile: 'RECEPTIONIST',
            password: '',
            confirmPassword: ''
          }}
        />
      )}

      {editingProfessional && (
        <EditModal
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
              validator: validateCPF,
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
            }
          ]}
          data={editingProfessional}
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
    </div>
  );
};