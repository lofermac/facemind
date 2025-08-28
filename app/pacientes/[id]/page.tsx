'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/utils/supabaseClient';
import { useParams } from 'next/navigation';
import ProfileHeader from '@/components/ProfileHeader';
import ProfileTabs from '@/components/ProfileTabs';
import AppleLikeLoader from '@/components/AppleLikeLoader';
import ErrorBoundary from '@/components/ErrorBoundary';

interface ProcedimentoRealizado {
  id: string;
  data_procedimento: string | null;
  valor_cobrado: number | null;
  procedimento_tabela_valores_id?: {
    nome_procedimento: string | null;
  } | null;
}

interface Agendamento {
  id: string;
  data: string | null;
  hora: string | null;
  rotulo: string | null;
}

interface Paciente {
  id: string;
  nome: string;
  cpf: string | null;
  whatsapp: string | null;
  email: string | null;
  data_nascimento: string | null;
  status: string | null;
  procedimentos_realizados: ProcedimentoRealizado[];
  agendamentos: Agendamento[];
}

const PatientProfilePage = () => {
  const params = useParams();
  const id = params?.id as string;
  const [paciente, setPaciente] = useState<Paciente | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPaciente() {
      if (!id) return;
      
      setLoading(true);
      const { data, error: fetchError } = await supabase
        .from('pacientes')
        .select(`
          *,
          procedimentos_realizados (
            id,
            data_procedimento,
            valor_cobrado,
            custo_produto,
            custo_insumos,
            custo_sala,
            procedimento_tabela_valores_id (
              nome_procedimento,
              duracao_efeito_meses
            )
          ),
          agendamentos (
            id,
            data,
            hora,
            rotulo
          )
        `)
        .eq('id', id)
        .single();

      if (fetchError || !data) {
        setError('Paciente não encontrado');
      } else {
        setPaciente(data);
      }
      setLoading(false);
    }

    fetchPaciente();
  }, [id]);

  if (loading) {
    return (
      <div className="p-8 flex justify-center items-center min-h-[40vh]">
        <AppleLikeLoader />
      </div>
    );
  }

  if (error || !paciente) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold text-red-600">Erro</h1>
        <p className="mt-4">{error || 'Paciente não encontrado'}</p>
      </div>
    );
  }

  return (
    <div className="py-6 px-3 sm:px-6 lg:px-8 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-6">
        <ErrorBoundary name="Header do Paciente">
          <ProfileHeader paciente={paciente} />
        </ErrorBoundary>
        <ErrorBoundary name="Abas do Paciente">
          <ProfileTabs paciente={paciente} />
        </ErrorBoundary>
      </div>
    </div>
  );
};

export default PatientProfilePage;
