// app/pacientes/editar/[id]/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import PacienteForm, { PacienteExistente } from '@/components/PacienteForm';
import { supabase } from '@/utils/supabaseClient';
import { toast } from 'sonner';
import Link from 'next/link';
import AppleLikeLoader from '@/components/AppleLikeLoader';

export default function EditarPacientePage() {
  const router = useRouter();
  const params = useParams();
  const pacienteId = params.id as string;

  const [pacienteParaEditar, setPacienteParaEditar] = useState<PacienteExistente | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (pacienteId) {
      const fetchPaciente = async () => {
        setLoading(true);
        setError(null);
        try {
          const { data, error: supabaseError } = await supabase
            .from('pacientes')
            .select('id, nome, cpf, whatsapp, data_nascimento, email, status, created_at')
            .eq('id', pacienteId)
            .single();

          if (supabaseError) throw supabaseError;
          if (data) setPacienteParaEditar(data as PacienteExistente);
          else {
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
        <AppleLikeLoader />
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
    <div className="min-h-screen bg-slate-50 py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl p-6 shadow-lg mb-6">
          <div className="flex items-center justify-between">
            <button
              onClick={() => router.push('/pacientes')}
              className="flex items-center gap-2 text-slate-600 hover:text-slate-800 transition-colors font-bold"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Voltar
            </button>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Editar Paciente</h1>
            </div>
            <div className="flex items-center gap-2 text-slate-500">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-sm font-medium">Modo Edição</span>
            </div>
          </div>
        </div>

        {/* Formulário */}
        <div className="bg-white rounded-2xl p-6 shadow-lg">
          <PacienteForm 
            pacienteInicial={pacienteParaEditar} 
            onCancel={() => router.push('/pacientes')} 
          />
        </div>
      </div>
    </div>
  );
}