// app/pacientes/novo/page.tsx
'use client';

import React from 'react';
import PacienteForm from '@/components/PacienteForm'; // Verifique se o caminho está correto
import Link from 'next/link';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

export default function NovoPacientePage() {
  return (
    <div className="container mx-auto p-6 bg-gray-50 min-h-screen">
      <div className="mb-6">
        <Link href="/pacientes" className="inline-flex items-center text-blue-600 hover:text-blue-800 transition-colors duration-150">
          <ArrowLeftIcon className="h-5 w-5 mr-2" />
          Voltar para Lista de Pacientes
        </Link>
      </div>

      <div className="bg-white shadow-md rounded-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-semibold text-gray-800 mb-6 border-b pb-4">
          Cadastrar Novo Paciente
        </h1>
        
        {/* O PacienteForm já lida com o salvamento e redirecionamento.
          Não precisamos passar 'pacienteInicial' pois é um novo paciente.
          As props 'onFormSubmit' e 'onCancel' são opcionais no PacienteForm;
          se não passadas, ele redireciona para '/pacientes' por padrão,
          o que é adequado para esta página de criação.
        */}
        <PacienteForm />
      </div>
    </div>
  );
}