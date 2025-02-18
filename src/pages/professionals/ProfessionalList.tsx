import React, { useState, useEffect } from 'react';
import { formatCPF, getProfileLabel } from '../../utils';
import { fetchProfessinals, updateProfessional, deleteProfessional } from '../../services/professionalService';
import { handleApiError } from '../../config/api';
import { EditModal } from '../../components/EditModal';
import toast from 'react-hot-toast';

interface ProfessionalListProps {
  onBack: () => void;
}

export const ProfessionalList: React.FC<ProfessionalListProps> = ({ onBack }) => {
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [editingProfessional, setEditingProfessional] = useState<Professional | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);

  useEffect(() => {
    fetchProfessionals();
  }, []);

  const fetchProfessionals = async () => {
    const token = localStorage.getItem('token');
    if(!token){
      throw new Error('Usuario não autenticado')
    }
    try {
      setLoading(true);
      const response = await fetchProfessinals(token);

      if (response.status_code !== 200) {
        throw new Error('Erro ao buscar profissionais');
      }

      setProfessionals(response.data);
    } catch (err) {
      setError(handleApiError(err));
    } finally {
      setLoading(false);
    }
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
      await updateProfessional(editingProfessional.id, token, formData);
      toast.success('Profissional atualizado com sucesso!', {
        position: 'bottom-right',
        style: { background: 'green', color: 'white' },
      });
      fetchProfessionals();
    } catch (err) {
      toast.error('Erro ao atualizar profissional', {
        position: 'bottom-right',
        style: { background: 'red', color: 'white' },
      });
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Tem certeza que deseja excluir este profissional?')) return;

    const token = localStorage.getItem('token');
    if (!token) {
      setError('Usuário não autenticado');
      return;
    }

    try {
      await deleteProfessional(id, token);
      toast.success('Profissional excluído com sucesso!', {
        position: 'bottom-right',
        style: { background: 'green', color: 'white' },
      });
      fetchProfessionals();
    } catch (err) {
      toast.error('Erro ao excluir profissional', {
        position: 'bottom-right',
        style: { background: 'red', color: 'white' },
      });
    }
  };

  const filteredProfessionals = professionals.filter(professional =>
    professional.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    professional.cpf.includes(searchTerm.replace(/\D/g, ''))
  );

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
      <div className="flex items-center mb-6">
        <button
          onClick={onBack}
          className="mr-4 text-blue-600 hover:text-blue-800"
        >
          ← Voltar
        </button>
        <h2 className="text-2xl font-bold text-gray-900">Lista de Profissionais</h2>
      </div>

      <div className="mb-6">
        <input
          type="text"
          placeholder="Buscar por nome ou CPF..."
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="space-y-4">
        {filteredProfessionals.map(professional => (
          <div
            key={professional.id}
            className="flex justify-between items-center p-4 border rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div>
              <h3 className="font-medium text-gray-900">{professional.fullName}</h3>
              <p className="text-sm text-gray-500">
                CPF: {formatCPF(professional.cpf)}
              </p>
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
                onClick={() => handleDelete(professional.id)}
                className="p-2 text-red-600 hover:text-red-800 hover:bg-red-100 rounded-full transition-colors"
                title="Excluir"
              >
                🗑️
              </button>
            </div>
          </div>
        ))}

        {filteredProfessionals.length === 0 && (
          <p className="text-center text-gray-500">
            Nenhum profissional encontrado
          </p>
        )}
      </div>

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
              value: editingProfessional.fullName
            },
            {
              name: 'cpf',
              label: 'CPF',
              type: 'text',
              value: editingProfessional.cpf,
              formatter: formatCPF
            },
            {
              name: 'profile',
              label: 'Perfil',
              type: 'select',
              value: editingProfessional.profile,
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
    </div>
  );
};