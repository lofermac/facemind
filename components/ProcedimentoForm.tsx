// components/ProcedimentoForm.tsx
'use client';

console.log('ProcedimentoForm.tsx carregado - VERSÃO UPLOAD URLS BLINDADO'); 

import React, { useState, useEffect, ChangeEvent, useCallback, DragEvent } from 'react';
import { supabase } from '@/utils/supabaseClient'; 
import { IMaskInput } from 'react-imask';
import { toast } from 'sonner';
import ImageModal from './ImageModal';
import type { Categoria } from '@/app/tabela-valores/page'; 
import type { ProcedimentoValor } from '@/app/tabela-valores/[categoriaId]/page'; 

export interface ProcedimentoRealizadoFormData { 
  paciente_id: string;
  categoria_nome: string; 
  procedimento_nome: string; 
  data_procedimento: string; 
  valor_cobrado: number;
  custo_produto: number;
  custo_insumos: number;
  custo_sala: number;
  observacoes: string | null;
  fotos_antes_urls?: string[] | null;
  fotos_depois_urls?: string[] | null;
  user_id: string;
}

export interface ProcedimentoRealizadoExistente extends ProcedimentoRealizadoFormData {
    id: string;
    created_at: string;
}

interface ProcedimentoFormProps {
  procedimentoInicial?: ProcedimentoRealizadoExistente | null; 
  onSave: (procedimentoId?: string) => void; 
  onCancel: () => void; 
}

const NOME_DO_BUCKET = 'fotos-procedimentos'; 
// Garantindo que são números ou strings puras
const THUMB_W: number = 150;
const THUMB_H: number = 150;
const THUMB_RESIZE: string = 'cover';

export default function ProcedimentoForm({ procedimentoInicial, onSave, onCancel }: ProcedimentoFormProps) {
  const [pacientes, setPacientes] = useState<PacienteSelecao[]>([]); 
  const [pacienteIdSelecionado, setPacienteIdSelecionado] = useState<string>('');
  const [listaCategoriasTV, setListaCategoriasTV] = useState<Categoria[]>([]);
  const [categoriaTVSelId, setCategoriaTVSelId] = useState<string>(''); 
  const [categoriaNomeSelecionado, setCategoriaNomeSelecionado] = useState('');
  const [listaProcedimentosTV, setListaProcedimentosTV] = useState<ProcedimentoValor[]>([]);
  const [procedimentoTVSelId, setProcedimentoTVSelId] = useState<string>('');
  const [procedimentoNomeSelecionado, setProcedimentoNomeSelecionado] = useState('');
  const [dataProcedimentoMask, setDataProcedimentoMask] = useState('');
  const [valorCobrado, setValorCobrado] = useState<string>('');
  const [custoProduto, setCustoProduto] = useState<string>('');
  const [custoInsumos, setCustoInsumos] = useState<string>('');
  const [custoSala, setCustoSala] = useState<string>('');
  const [observacoes, setObservacoes] = useState('');
  const [arquivosAntes, setArquivosAntes] = useState<FileList | null>(null);
  const [arquivosDepois, setArquivosDepois] = useState<FileList | null>(null);
  const [urlsFotosAntesExistentes, setUrlsFotosAntesExistentes] = useState<string[]>([]);
  const [urlsFotosDepoisExistentes, setUrlsFotosDepoisExistentes] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEditMode = !!procedimentoInicial;
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [imagemEmVisualizacaoUrl, setImagemEmVisualizacaoUrl] = useState<string | null>(null);
  const [previewAntes, setPreviewAntes] = useState<string[]>([]);
  const [previewDepois, setPreviewDepois] = useState<string[]>([]);

  interface PacienteSelecao { id: string; nome: string; }

  useEffect(() => { /* Busca pacientes */ 
    async function fetchPacientesParaSelect() {
      const { data, error } = await supabase.from('pacientes').select('id, nome').order('nome', { ascending: true });
      if (error) toast.error('Erro ao carregar lista de pacientes.');
      else if (data) setPacientes(data as PacienteSelecao[]);
    }
    fetchPacientesParaSelect();
  }, []);

  useEffect(() => { /* Busca categorias da TV */ 
    async function fetchCategoriasTV() {
      const { data, error } = await supabase.from('categorias_procedimentos').select('id, nome').order('nome', { ascending: true });
      if (error) toast.error('Erro ao carregar categorias.');
      else if (data) setListaCategoriasTV(data as Categoria[]);
    }
    fetchCategoriasTV();
  }, []);

  useEffect(() => { /* Busca procedimentos da TV */
    if (categoriaTVSelId) {
      async function fetchProcedimentosTV() {
        setListaProcedimentosTV([]); setProcedimentoTVSelId(''); 
        setProcedimentoNomeSelecionado(''); 
        setValorCobrado(isEditMode && procedimentoInicial ? (procedimentoInicial.valor_cobrado?.toString() || '') : ''); 
        const { data, error } = await supabase.from('procedimentos_tabela_valores').select('*').eq('categoria_id', categoriaTVSelId).order('nome_procedimento', { ascending: true });
        if (error) toast.error('Erro ao carregar procedimentos da categoria.');
        else if (data) setListaProcedimentosTV(data as ProcedimentoValor[]);
      }
      fetchProcedimentosTV();
    } else {
      setListaProcedimentosTV([]); setProcedimentoTVSelId('');
      setProcedimentoNomeSelecionado('');
      if (!isEditMode || (isEditMode && !procedimentoInicial?.valor_cobrado)) setValorCobrado('');
    }
  }, [categoriaTVSelId, isEditMode, procedimentoInicial]); 
  
  useEffect(() => { /* Preenche o formulário em modo de edição */
    if (isEditMode && procedimentoInicial) {
      setPacienteIdSelecionado(procedimentoInicial.paciente_id || '');
      const catNomeIni = procedimentoInicial.categoria_nome || '';
      const procNomeIni = procedimentoInicial.procedimento_nome || '';
      setCategoriaNomeSelecionado(catNomeIni); 
      setProcedimentoNomeSelecionado(procNomeIni);
      if (catNomeIni && listaCategoriasTV.length > 0) {
        const catMatch = listaCategoriasTV.find(c => c.nome === catNomeIni);
        if (catMatch) setCategoriaTVSelId(catMatch.id); else setCategoriaTVSelId(''); 
      } else if (!catNomeIni) setCategoriaTVSelId(''); 
      const dataDoBanco = procedimentoInicial.data_procedimento;
      if (dataDoBanco && typeof dataDoBanco === 'string') {
        const parts = dataDoBanco.split('-'); 
        if (parts.length === 3 && parts[0].length === 4 && parts[1].length === 2 && parts[2].length === 2) {
          setDataProcedimentoMask(parts[2] + "/" + parts[1] + "/" + parts[0]);
        } else setDataProcedimentoMask(''); 
      } else setDataProcedimentoMask(''); 
      setValorCobrado(procedimentoInicial.valor_cobrado?.toString() || '');
      setCustoProduto(procedimentoInicial.custo_produto?.toString() || '');
      setCustoInsumos(procedimentoInicial.custo_insumos?.toString() || '');
      setCustoSala(procedimentoInicial.custo_sala?.toString() || '');
      setObservacoes(procedimentoInicial.observacoes || '');
      setUrlsFotosAntesExistentes(procedimentoInicial.fotos_antes_urls || []);
      setUrlsFotosDepoisExistentes(procedimentoInicial.fotos_depois_urls || []);
    } else { /* Reset para modo de criação */ 
      setPacienteIdSelecionado(''); setCategoriaTVSelId(''); setProcedimentoTVSelId('');
      setCategoriaNomeSelecionado(''); setProcedimentoNomeSelecionado('');
      setDataProcedimentoMask(''); setValorCobrado(''); setCustoProduto('');
      setCustoInsumos(''); setCustoSala(''); setObservacoes('');
      setArquivosAntes(null); setArquivosDepois(null);
      setUrlsFotosAntesExistentes([]); setUrlsFotosDepoisExistentes([]);
    }
  }, [procedimentoInicial, isEditMode, listaCategoriasTV]);

  useEffect(() => { /* Pré-seleciona procedimento em modo de edição */
    if (isEditMode && procedimentoInicial?.procedimento_nome && categoriaTVSelId && listaProcedimentosTV.length > 0) {
      const procMatch = listaProcedimentosTV.find(p => p.nome_procedimento === procedimentoInicial.procedimento_nome);
      if (procMatch) setProcedimentoTVSelId(procMatch.id); else setProcedimentoTVSelId('');
    }
  }, [isEditMode, procedimentoInicial, categoriaTVSelId, listaProcedimentosTV]);

  useEffect(() => { /* Atualiza o nome do procedimento após seleção */
    if (procedimentoTVSelId) {
      const procSelObj = listaProcedimentosTV.find(p => p.id === procedimentoTVSelId);
      if (procSelObj) {
        setProcedimentoNomeSelecionado(procSelObj.nome_procedimento);
      }
    }
  }, [procedimentoTVSelId, listaProcedimentosTV]);

  // Upload intuitivo: drag and drop + input
  const handleFileChange = (event: ChangeEvent<HTMLInputElement>, tipo: 'antes' | 'depois') => {
    if (event.target.files) {
      const newFiles = Array.from(event.target.files);
      if (tipo === 'antes') {
        const current = arquivosAntes ? Array.from(arquivosAntes) : [];
        const combined = [...current, ...newFiles];
        // Criar um novo FileList
        const dataTransfer = new DataTransfer();
        combined.forEach(f => dataTransfer.items.add(f));
        setArquivosAntes(dataTransfer.files);
      } else if (tipo === 'depois') {
        const current = arquivosDepois ? Array.from(arquivosDepois) : [];
        const combined = [...current, ...newFiles];
        const dataTransfer = new DataTransfer();
        combined.forEach(f => dataTransfer.items.add(f));
        setArquivosDepois(dataTransfer.files);
      }
    }
  };
  const handleDrop = (e: DragEvent<HTMLLabelElement>, tipo: 'antes' | 'depois') => {
    e.preventDefault();
    if (e.dataTransfer.files) {
      if (tipo === 'antes') setArquivosAntes(e.dataTransfer.files);
      else if (tipo === 'depois') setArquivosDepois(e.dataTransfer.files);
    }
  };
  const handleDragOver = (e: DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
  };
  const handleAbrirImagemModal = (url: string) => { /* ... (igual) ... */ 
    setImagemEmVisualizacaoUrl(url);
    setIsImageModalOpen(true);
  };
  
  // ✨ FUNÇÃO UPLOAD ARQUIVOS COM CONSTRUÇÃO DE URL BLINDADA ✨
  const uploadArquivos = async (files: FileList | null, tipo: 'antes' | 'depois'): Promise<string[]> => { 
    if (!files || files.length === 0) return [];
    const urls: string[] = [];
    const timestampValue = Date.now().toString(); 
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      let extensao = file.name.slice(file.name.lastIndexOf('.')).toLowerCase();
      extensao = extensao.replace(/[^a-z0-9.]/g, '');
      let caminhoNoStorage = "public/"; // Garante que não tem lixo aqui
      caminhoNoStorage += timestampValue;
      caminhoNoStorage += "_";
      caminhoNoStorage += i.toString();
      caminhoNoStorage += "_";
      caminhoNoStorage += tipo.toString(); // 'antes' ou 'depois'
      caminhoNoStorage += "_foto"; 
      caminhoNoStorage += extensao;
      
      const { data, error: uploadError } = await supabase.storage
        .from(NOME_DO_BUCKET).upload(caminhoNoStorage, file, { cacheControl: '3600', upsert: false });

      if (uploadError) {
        toast.error(`Falha no upload de ${file.name}: ${uploadError.message}`);
        continue; 
      }
      if (data) {
        const { data: urlData } = supabase.storage.from(NOME_DO_BUCKET).getPublicUrl(data.path); 
        if (urlData && urlData.publicUrl) {
          // CONSTRUÇÃO BLINDADA DA URL DA MINIATURA
          let urlBase = urlData.publicUrl;
          if (urlBase.includes("?")) { // Remove query params existentes, se houver (improvável aqui)
            urlBase = urlBase.substring(0, urlBase.indexOf("?"));
          }
          const params = new URLSearchParams({
            width: THUMB_W.toString(),
            height: THUMB_H.toString(),
            resize: THUMB_RESIZE.toString()
          });
          const urlMiniatura = urlBase + "?" + params.toString();
          urls.push(urlMiniatura);
          console.log("URL Miniatura SALVA:", urlMiniatura); // DEBUG
        } else {
          toast.message(`Upload de ${file.name} OK, mas URL pública não obtida.`);
        }
      }
    }
    return urls;
  };

  const handleSubmit = useCallback(async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      toast.error('Você precisa estar logado para realizar esta ação.');
      setIsSubmitting(false);
      return;
    }

    if (!pacienteIdSelecionado || !categoriaNomeSelecionado || !procedimentoNomeSelecionado || !dataProcedimentoMask) {
      toast.error('Todos os campos obrigatórios devem ser preenchidos.');
      setIsSubmitting(false);
      return;
    }

    // Converter data para o formato YYYY-MM-DD
    const parts = dataProcedimentoMask.split('/');
    const dataFormatadaParaSalvar = `${parts[2]}-${parts[1]}-${parts[0]}`;

    // Upload de arquivos antes e depois
    const urlsAntes = await uploadArquivos(arquivosAntes, 'antes');
    const urlsDepois = await uploadArquivos(arquivosDepois, 'depois');

    // Combinar fotos existentes e novas (modo edição)
    let fotosAntesFinal: string[] | null = null;
    let fotosDepoisFinal: string[] | null = null;
    if (isEditMode) {
      fotosAntesFinal = [
        ...(urlsFotosAntesExistentes || []),
        ...urlsAntes
      ];
      fotosDepoisFinal = [
        ...(urlsFotosDepoisExistentes || []),
        ...urlsDepois
      ];
      if (fotosAntesFinal.length === 0) fotosAntesFinal = null;
      if (fotosDepoisFinal.length === 0) fotosDepoisFinal = null;
    } else {
      fotosAntesFinal = urlsAntes.length > 0 ? urlsAntes : null;
      fotosDepoisFinal = urlsDepois.length > 0 ? urlsDepois : null;
    }

    const dadosParaSalvar: Omit<ProcedimentoRealizadoExistente, 'id' | 'created_at'> = {
      paciente_id: pacienteIdSelecionado,
      categoria_nome: categoriaNomeSelecionado.trim(),
      procedimento_nome: procedimentoNomeSelecionado.trim(),
      data_procedimento: dataFormatadaParaSalvar,
      valor_cobrado: parseFloat(valorCobrado) || 0,
      custo_produto: parseFloat(custoProduto) || 0,
      custo_insumos: parseFloat(custoInsumos) || 0,
      custo_sala: parseFloat(custoSala) || 0,
      observacoes: observacoes.trim() || null,
      fotos_antes_urls: fotosAntesFinal,
      fotos_depois_urls: fotosDepoisFinal,
      user_id: user.id
    };

    let errorObj = null;
    let procedimentoSalvoId: string | undefined = undefined;

    if (isEditMode && procedimentoInicial) {
      const { data, error } = await supabase.from('procedimentos_realizados').update(dadosParaSalvar).eq('id', procedimentoInicial.id).select().single();
      errorObj = error; if(data) procedimentoSalvoId = data.id;
    } else {
      const { data, error } = await supabase.from('procedimentos_realizados').insert([dadosParaSalvar]).select().single();
      errorObj = error; if(data) procedimentoSalvoId = data.id;
    }

    setIsSubmitting(false);

    if (errorObj) {
      toast.error(`Erro ao salvar: ${errorObj.message}`);
    } else {
      toast.success(`Procedimento ${isEditMode ? 'atualizado' : 'cadastrado'} com sucesso!`);
      if (!isEditMode) { /* ... (reset igual) ... */ }
      setArquivosAntes(null); setArquivosDepois(null);
      const inputAntes = document.getElementById('fotos_antes') as HTMLInputElement;
      if (inputAntes) inputAntes.value = '';
      const inputDepois = document.getElementById('fotos_depois') as HTMLInputElement;
      if (inputDepois) inputDepois.value = '';
      onSave(procedimentoSalvoId);
    }
  }, [
      pacienteIdSelecionado, categoriaTVSelId, procedimentoTVSelId,
      categoriaNomeSelecionado, procedimentoNomeSelecionado,
      dataProcedimentoMask, valorCobrado,
      custoProduto, custoInsumos, custoSala, observacoes,
      arquivosAntes, arquivosDepois,
      urlsFotosAntesExistentes, urlsFotosDepoisExistentes,
      isEditMode, procedimentoInicial, onSave
  ]);

  const lucroCalculado = (parseFloat(valorCobrado) || 0) - ((parseFloat(custoProduto) || 0) + (parseFloat(custoInsumos) || 0) + (parseFloat(custoSala) || 0));

  useEffect(() => {
    if (arquivosAntes) {
      const filesArray = Array.from(arquivosAntes);
      Promise.all(filesArray.map(file => {
        return new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = e => resolve(e.target?.result as string);
          reader.readAsDataURL(file);
        });
      })).then(setPreviewAntes);
    } else {
      setPreviewAntes([]);
    }
  }, [arquivosAntes]);

  useEffect(() => {
    if (arquivosDepois) {
      const filesArray = Array.from(arquivosDepois);
      Promise.all(filesArray.map(file => {
        return new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = e => resolve(e.target?.result as string);
          reader.readAsDataURL(file);
        });
      })).then(setPreviewDepois);
    } else {
      setPreviewDepois([]);
    }
  }, [arquivosDepois]);

  // Remover imagem do preview antes do upload
  const handleRemovePreview = (tipo: 'antes' | 'depois', idx: number) => {
    if (tipo === 'antes' && arquivosAntes) {
      const arr = Array.from(arquivosAntes);
      arr.splice(idx, 1);
      const dataTransfer = new DataTransfer();
      arr.forEach(f => dataTransfer.items.add(f));
      setArquivosAntes(dataTransfer.files.length ? dataTransfer.files : null);
    } else if (tipo === 'depois' && arquivosDepois) {
      const arr = Array.from(arquivosDepois);
      arr.splice(idx, 1);
      const dataTransfer = new DataTransfer();
      arr.forEach(f => dataTransfer.items.add(f));
      setArquivosDepois(dataTransfer.files.length ? dataTransfer.files : null);
    }
  };

  // 1. Funções para remover fotos já existentes
  const handleRemoveFotoExistente = (tipo: 'antes' | 'depois', idx: number) => {
    if (tipo === 'antes') {
      setUrlsFotosAntesExistentes(prev => prev.filter((_, i) => i !== idx));
    } else {
      setUrlsFotosDepoisExistentes(prev => prev.filter((_, i) => i !== idx));
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* ... (JSX do formulário: Paciente, Selects de Categoria/Procedimento, Data, Custos, Observações) ... */}
        {/* Cole aqui o JSX do formulário da Instrução 98, pois a estrutura visual dos campos não mudou */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div>
            <label htmlFor="paciente" className="block text-sm font-medium text-gray-700">Paciente <span className="text-red-500">*</span></label>
            <select id="paciente" name="paciente" value={pacienteIdSelecionado} onChange={(e) => setPacienteIdSelecionado(e.target.value)} required
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md">
              <option value="">Selecionar</option>
              {pacientes.map(p => ( <option key={p.id} value={p.id}>{p.nome}</option> ))}
            </select>
          </div>
          <div>
            <label htmlFor="categoria-tv" className="block text-sm font-medium text-gray-700">
              Categoria <span className="text-red-500">*</span>
            </label>
            <select 
              id="categoria-tv" 
              name="categoria-tv" 
              value={categoriaTVSelId} 
              onChange={(e: ChangeEvent<HTMLSelectElement>) => {
                const selectedId = e.target.value;
                const selectedOption = e.target.options[e.target.selectedIndex];
                setCategoriaTVSelId(selectedId);
                setCategoriaNomeSelecionado(selectedId ? selectedOption.text : ''); 
                setProcedimentoTVSelId(''); 
                setProcedimentoNomeSelecionado(''); 
                setValorCobrado(''); 
              }} 
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
            >
              <option value="">Selecionar</option>
              {listaCategoriasTV.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.nome}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="procedimento-tv" className="block text-sm font-medium text-gray-700">
              Procedimento <span className="text-red-500">*</span>
            </label>
            <select 
              id="procedimento-tv" 
              name="procedimento-tv" 
              value={procedimentoTVSelId} 
              onChange={(e: ChangeEvent<HTMLSelectElement>) => { 
                  const selectedProcId = e.target.value;
                  const selectedOption = e.target.options[e.target.selectedIndex];
                  setProcedimentoTVSelId(selectedProcId);
                  if (selectedProcId) {
                    setProcedimentoNomeSelecionado(selectedOption.text); 
                    const procSelObj = listaProcedimentosTV.find(p => p.id === selectedProcId);
                    setValorCobrado(procSelObj?.valor_pix?.toString() || '');
                  } else {
                    setProcedimentoNomeSelecionado('');
                    setValorCobrado('');
                  }
              }} 
              disabled={!categoriaTVSelId || listaCategoriasTV.length === 0}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md disabled:bg-gray-100"
            >
              <option value="">Selecionar</option>
              {listaProcedimentosTV.map(proc => (
                <option key={proc.id} value={proc.id}>{proc.nome_procedimento}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="dataProcedimento" className="block text-sm font-medium text-gray-700">Data do Procedimento <span className="text-red-500">*</span></label>
            <IMaskInput mask="00/00/0000" value={dataProcedimentoMask} onAccept={(value: any) => setDataProcedimentoMask(value)} required
              name="dataProcedimento" id="dataProcedimento"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="dd/mm/aaaa" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div>
            <label htmlFor="valorCobrado" className="block text-sm font-medium text-gray-700">Valor Cobrado <span className="text-red-500">*</span></label>
            <input type="number" name="valorCobrado" id="valorCobrado" value={valorCobrado} onChange={(e) => setValorCobrado(e.target.value)} required  step="0.01"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-base md:text-sm"
              inputMode="decimal" autoComplete="off" min="0" pattern="[0-9]*" style={{ WebkitAppearance: 'none' }}
              placeholder="0.00"/>
          </div>
          <div>
            <label htmlFor="custoProduto" className="block text-sm font-medium text-gray-700">Custo do Produto</label> 
            <input type="number" name="custoProduto" id="custoProduto" value={custoProduto} onChange={(e) => setCustoProduto(e.target.value)} step="0.01"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-base md:text-sm"
              inputMode="decimal" autoComplete="off" min="0" pattern="[0-9]*" style={{ WebkitAppearance: 'none' }}
              placeholder="0.00"/>
          </div>
          <div>
            <label htmlFor="custoInsumos" className="block text-sm font-medium text-gray-700">Custo dos Insumos</label>
            <input type="number" name="custoInsumos" id="custoInsumos" value={custoInsumos} onChange={(e) => setCustoInsumos(e.target.value)} step="0.01"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-base md:text-sm"
              inputMode="decimal" autoComplete="off" min="0" pattern="[0-9]*" style={{ WebkitAppearance: 'none' }}
              placeholder="0.00"/>
          </div>
          <div>
            <label htmlFor="custoSala" className="block text-sm font-medium text-gray-700">Custo da Sala</label>
            <input type="number" name="custoSala" id="custoSala" value={custoSala} onChange={(e) => setCustoSala(e.target.value)} step="0.01"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-base md:text-sm"
              inputMode="decimal" autoComplete="off" min="0" pattern="[0-9]*" style={{ WebkitAppearance: 'none' }}
              placeholder="0.00"/>
          </div>
        </div>
         <div className="pt-2">
          <label className="block text-sm font-medium text-gray-700">Lucro</label>
          <p className="mt-1 text-lg font-semibold text-gray-900">
            R$ {lucroCalculado.toFixed(2).replace('.', ',')}
          </p>
        </div>
        <div>
          <label htmlFor="observacoes" className="block text-sm font-medium text-gray-700">Observações</label>
          <textarea id="observacoes" name="observacoes" rows={4} value={observacoes} onChange={(e) => setObservacoes(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-base md:text-sm resize-y min-h-[56px] md:min-h-[40px]"
            placeholder="Comentários"></textarea>
        </div>

        {/* SEÇÃO DE FOTOS ATUALIZADA PARA EXIBIR MINIATURAS */}
        <div className="pt-4">
            <h3 className="text-md font-medium text-gray-700 mb-2">Fotos do Procedimento</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Upload Antes */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Fotos Antes</label>
                    <label
                      className="flex flex-col items-center justify-center border-2 border-dashed border-blue-300 rounded-xl p-6 cursor-pointer transition hover:border-blue-500 bg-blue-50 hover:bg-blue-100 text-blue-700 text-center min-h-[120px]"
                      onDrop={e => handleDrop(e, 'antes')}
                      onDragOver={handleDragOver}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mb-2 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0l-4 4m4-4l4 4M17 8v8m0 0l4-4m-4 4l-4-4" /></svg>
                      <span className="font-semibold">Arraste ou clique para selecionar</span>
                      <span className="text-xs text-blue-500 mt-1">Adicione várias imagens</span>
                      <input type="file" multiple accept="image/*" onChange={e => handleFileChange(e, 'antes')} className="hidden" />
                      {previewAntes.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-3">
                          {previewAntes.map((src, idx) => (
                            <div key={idx} className="relative group">
                              <img
                                src={src}
                                alt={`Preview Antes ${idx + 1}`}
                                className="w-20 h-20 object-cover rounded-lg border border-blue-200 shadow-sm"
                              />
                              <button
                                type="button"
                                className="absolute top-1 right-1 bg-white bg-opacity-80 rounded-full p-1 text-blue-600 hover:bg-red-100 hover:text-red-600 transition text-xs opacity-0 group-hover:opacity-100"
                                onClick={() => handleRemovePreview('antes', idx)}
                                title="Remover imagem"
                              >
                                ×
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </label>
                    {isEditMode && urlsFotosAntesExistentes.length > 0 && (
                      <div className="mt-2">
                        <p className="text-xs font-medium text-gray-600 mb-1">Fotos Atuais (Antes):</p>
                        <div className="flex flex-wrap gap-2 p-2 border rounded-md">
                          {urlsFotosAntesExistentes.map((url, index) => {
                            const originalUrl = url.split('?')[0];
                            return (
                              <div key={`antes-existente-${index}`} className="relative group">
                                <img
                                  src={url}
                                  onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    if (target.src !== originalUrl) target.src = originalUrl;
                                    else {
                                      target.alt = `Erro: ${originalUrl.substring(originalUrl.lastIndexOf('/') + 1)}`;
                                      target.parentNode?.appendChild(document.createTextNode(target.alt));
                                      target.style.display = 'none';
                                    }
                                  }}
                                  alt={`Foto Antes ${index + 1}`}
                                  className="h-24 w-24 object-cover rounded-md border shadow-sm cursor-pointer hover:opacity-75"
                                  onClick={() => handleAbrirImagemModal(url)}
                                />
                                <button
                                  type="button"
                                  className="absolute top-1 right-1 bg-white bg-opacity-80 rounded-full p-1 text-blue-600 hover:bg-red-100 hover:text-red-600 transition text-xs opacity-0 group-hover:opacity-100"
                                  onClick={() => handleRemoveFotoExistente('antes', index)}
                                  title="Remover imagem"
                                >
                                  ×
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                </div>

                {/* Upload Depois */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Fotos Depois</label>
                    <label
                      className="flex flex-col items-center justify-center border-2 border-dashed border-green-300 rounded-xl p-6 cursor-pointer transition hover:border-green-500 bg-green-50 hover:bg-green-100 text-green-700 text-center min-h-[120px]"
                      onDrop={e => handleDrop(e, 'depois')}
                      onDragOver={handleDragOver}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mb-2 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0l-4 4m4-4l4 4M17 8v8m0 0l4-4m-4 4l-4-4" /></svg>
                      <span className="font-semibold">Arraste ou clique para selecionar</span>
                      <span className="text-xs text-green-500 mt-1">Adicione várias imagens</span>
                      <input type="file" multiple accept="image/*" onChange={e => handleFileChange(e, 'depois')} className="hidden" />
                      {previewDepois.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-3">
                          {previewDepois.map((src, idx) => (
                            <div key={idx} className="relative group">
                              <img
                                src={src}
                                alt={`Preview Depois ${idx + 1}`}
                                className="w-20 h-20 object-cover rounded-lg border border-green-200 shadow-sm"
                              />
                              <button
                                type="button"
                                className="absolute top-1 right-1 bg-white bg-opacity-80 rounded-full p-1 text-green-600 hover:bg-red-100 hover:text-red-600 transition text-xs opacity-0 group-hover:opacity-100"
                                onClick={() => handleRemovePreview('depois', idx)}
                                title="Remover imagem"
                              >
                                ×
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </label>
                    {isEditMode && urlsFotosDepoisExistentes.length > 0 && (
                      <div className="mt-2">
                        <p className="text-xs font-medium text-gray-600 mb-1">Fotos Atuais (Depois):</p>
                        <div className="flex flex-wrap gap-2 p-2 border rounded-md">
                          {urlsFotosDepoisExistentes.map((url, index) => {
                            const originalUrl = url.split('?')[0];
                            return (
                              <div key={`depois-existente-${index}`} className="relative group">
                                <img
                                  src={url}
                                  onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    if (target.src !== originalUrl) target.src = originalUrl;
                                    else {
                                      target.alt = `Erro: ${originalUrl.substring(originalUrl.lastIndexOf('/') + 1)}`;
                                      target.parentNode?.appendChild(document.createTextNode(target.alt));
                                      target.style.display = 'none';
                                    }
                                  }}
                                  alt={`Foto Depois ${index + 1}`}
                                  className="h-24 w-24 object-cover rounded-md border shadow-sm cursor-pointer hover:opacity-75"
                                  onClick={() => handleAbrirImagemModal(url)}
                                />
                                <button
                                  type="button"
                                  className="absolute top-1 right-1 bg-white bg-opacity-80 rounded-full p-1 text-green-600 hover:bg-red-100 hover:text-red-600 transition text-xs opacity-0 group-hover:opacity-100"
                                  onClick={() => handleRemoveFotoExistente('depois', index)}
                                  title="Remover imagem"
                                >
                                  ×
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                </div>
            </div>
        </div>

        {/* Botões */}
        <div className="flex justify-end space-x-3 pt-8">
          <button type="button" onClick={onCancel} disabled={isSubmitting}
            className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
            Cancelar
          </button>
          <button type="submit" disabled={isSubmitting}
            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50">
            {isSubmitting ? "Salvando..." : (isEditMode ? "Salvar Alterações" : "Salvar Procedimento")}
          </button>
        </div>
      </form>

      <ImageModal 
        isOpen={isImageModalOpen}
        onClose={() => setIsImageModalOpen(false)}
        imageUrl={imagemEmVisualizacaoUrl} 
        altText="Visualização da foto do procedimento"
      />
    </>
  );
}