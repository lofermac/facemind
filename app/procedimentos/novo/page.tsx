// app/procedimentos/novo/page.tsx
'use client';

import React, { useEffect } from 'react'; // Adicionado useEffect
import { useRouter } from 'next/navigation';
import ProcedimentoForm from '../../../components/ProcedimentoForm'; // Ajuste o caminho se necessário
import { toast } from 'sonner'; // IMPORTAÇÃO DO TOAST

export default function NovoProcedimentoPage() {
  const router = useRouter();

  const handleSave = (procedimentoId?: string) => {
    router.push('/procedimentos');
  };

  const handleCancel = () => {
    router.back(); 
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="bg-white shadow-lg rounded-lg overflow-hidden">
        <div className="px-6 py-8">
          <h2 className="text-3xl font-extrabold text-gray-900 mb-8">
            Novo Procedimento
          </h2>
          <ProcedimentoForm 
            onSave={handleSave} 
            onCancel={handleCancel} 
          />
        </div>
      </div>
    </div>
  );
}