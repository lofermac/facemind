// app/pacientes/novo/page.tsx
'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import PacienteForm from '@/components/PacienteForm';

export default function NovoPacientePage() {
  const router = useRouter();

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
              <h1 className="text-3xl font-bold text-slate-900">Cadastrar Novo Paciente</h1>
            </div>
            <div className="flex items-center gap-2 text-slate-500">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              <span className="text-sm font-medium">Novo Cadastro</span>
            </div>
          </div>
        </div>

        {/* Formulário */}
        <div className="bg-white rounded-2xl p-6 shadow-lg">
          <PacienteForm onCancel={() => router.push('/pacientes')} />
        </div>
      </div>
    </div>
  );
}