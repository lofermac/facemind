// app/pacientes/editar/[id]/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import PacienteForm, { PacienteExistente } from '@/components/PacienteForm'; // Verifique se o caminho está correto
import { supabase } from '@/utils/supabaseClient';
import { toast } from 'sonner';
import Link from 'next/link';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

export default function EditarPacientePage() {
  const router = useRouter();
  const params = useParams();
  const pacienteId = params.id as string;

  const [pacienteParaEditar, setPacienteParaEditar] = useState<PacienteExistente | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showEditarPacienteModal, setShowEditarPacienteModal] = useState(true);

  useEffect(() => {
    if (pacienteId) {
      const fetchPaciente = async () => {
        setLoading(true);
        setError(null);
        try {
          const { data, error: supabaseError } = await supabase
            .from('pacientes')
            // Selecionando colunas explicitamente, incluindo 'whatsapp' e excluindo 'endereco' (conforme última correção)
            .select('id, nome, cpf, whatsapp, data_nascimento, email, status, created_at')
            .eq('id', pacienteId)
            .single();

          if (supabaseError) {
            throw supabaseError;
          }

          if (data) {
            setPacienteParaEditar(data as PacienteExistente);
          } else {
            setError('Paciente não encontrado.');
            toast.error('Paciente não encontrado.');
          }
        } catch (e: any) {
          console.error('Erro ao buscar dados do paciente para edição:', e);
          setError('Falha ao carregar dados do paciente.');
          toast.error('Falha ao carregar dados do paciente: ' + e.message);
        } finally {
          setLoading(false);
        }
      };
      fetchPaciente();
    }
  }, [pacienteId]);

  if (loading) {
    return (
      <div className="container mx-auto p-6 flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6 text-center">
        <p className="text-red-500 text-xl mb-4">{error}</p>
        <Link href="/pacientes" className="text-blue-600 hover:text-blue-800">
          Voltar para Lista de Pacientes
        </Link>
      </div>
    );
  }

  if (!pacienteParaEditar) {
    return (
        <div className="container mx-auto p-6 text-center">
            <p className="text-gray-500 text-xl mb-4">Paciente não disponível para edição.</p>
            <Link href="/pacientes" className="text-blue-600 hover:text-blue-800">
            Voltar para Lista de Pacientes
            </Link>
        </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white bg-opacity-70">
      <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full mx-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Editar Paciente
        </h1>
        <h2 className="text-xl text-gray-700 mb-8 border-b pb-4">
          {pacienteParaEditar.nome}
        </h2>
        <PacienteForm 
          pacienteInicial={pacienteParaEditar} 
          onCancel={() => router.push('/pacientes')} 
        />
      </div>
    </div>
  );
}