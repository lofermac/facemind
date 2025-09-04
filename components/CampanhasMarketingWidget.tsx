import React from 'react';
import { MegaphoneIcon } from '@heroicons/react/24/outline';

interface CampanhaMarketing {
  mes: string;
  numeroMes: number;
  titulo: string;
  conceito: string;
  apeloEmocional: string;
  publicoAlvo: string;
  procedimentos: string;
  emoji: string;
}

const campanhas: CampanhaMarketing[] = [
  {
    mes: 'Janeiro',
    numeroMes: 1,
    titulo: 'O Mês do Recomeço',
    conceito: '"Meu Ano, Minha Melhor Versão"',
    apeloEmocional: 'Recomeço, autocuidado, priorizar a si mesma',
    publicoAlvo: 'Mulheres buscando "reset" pós-festas',
    procedimentos: 'Skinboosters, peelings de verão, hidratação labial',
    emoji: '✨'
  },
  {
    mes: 'Fevereiro',
    numeroMes: 2,
    titulo: 'O Brilho do Carnaval',
    conceito: '"Brilhe Mais que o Glitter"',
    apeloEmocional: 'Confiança, sensualidade, deslumbrante',
    publicoAlvo: 'Mulheres que querem "up" imediato',
    procedimentos: 'Preenchimento Labial, Toxina Botulínica, tratamentos "glow"',
    emoji: '🎭'
  },
  {
    mes: 'Março',
    numeroMes: 3,
    titulo: 'Mês da Mulher',
    conceito: '"Celebre a Mulher que Você É"',
    apeloEmocional: 'Empoderamento, amor-próprio, feminilidade',
    publicoAlvo: 'Todas as mulheres - reativar clientes antigas',
    procedimentos: 'Microagulhamento + Hidratação, brindes especiais',
    emoji: '💪'
  },
  {
    mes: 'Abril',
    numeroMes: 4,
    titulo: 'A Renovação do Outono',
    conceito: '"Troque de Pele como a Estação"',
    apeloEmocional: 'Renovação, desapego do que não serve',
    publicoAlvo: 'Mulheres com melasma, acne, textura irregular',
    procedimentos: 'Peelings químicos, Microagulhamento',
    emoji: '🍂'
  },
  {
    mes: 'Maio',
    numeroMes: 5,
    titulo: 'O Amor Incondicional',
    conceito: '"O Cuidado que Ela Merece"',
    apeloEmocional: 'Gratidão, amor, retribuição',
    publicoAlvo: 'Filhas e mães',
    procedimentos: 'Vale-Presente, Bioestimuladores, Fios de PDO',
    emoji: '💝'
  },
  {
    mes: 'Junho',
    numeroMes: 6,
    titulo: 'A Paixão de Inverno',
    conceito: '"Aqueça sua Autoestima"',
    apeloEmocional: 'Autoconfiança, romance, sensualidade',
    publicoAlvo: 'Mulheres de todas as idades',
    procedimentos: 'Preenchimento Labial, definição do contorno facial',
    emoji: '❤️'
  },
  {
    mes: 'Julho',
    numeroMes: 7,
    titulo: 'O Spa de Inverno',
    conceito: '"Projeto Inverno: Sua Transformação"',
    apeloEmocional: 'Introspecção, cuidado profundo',
    publicoAlvo: 'Mulheres com tempo livre nas férias',
    procedimentos: 'Bioestimulador + Microagulhamento, Fios de PDO',
    emoji: '❄️'
  },
  {
    mes: 'Agosto',
    numeroMes: 8,
    titulo: 'O Despertar da Primavera',
    conceito: '"Aquecimento para a Primavera"',
    apeloEmocional: 'Antecipação, preparação para florescer',
    publicoAlvo: 'Pacientes planejadoras',
    procedimentos: 'Bioestimuladores de Colágeno',
    emoji: '🌱'
  },
  {
    mes: 'Setembro',
    numeroMes: 9,
    titulo: 'Projeto Verão',
    conceito: '"Operação Verão: A Contagem Regressiva!"',
    apeloEmocional: 'Preparação para a estação mais esperada',
    publicoAlvo: 'Todas as mulheres da base',
    procedimentos: 'Lipo de Papada, firmeza do pescoço, emagrecimento facial',
    emoji: '☀️'
  },
  {
    mes: 'Outubro',
    numeroMes: 10,
    titulo: 'Outubro Rosa',
    conceito: '"Cuidar de Si é o Primeiro Passo"',
    apeloEmocional: 'Conscientização, saúde, autoestima',
    publicoAlvo: 'Todas - mensagem de carinho e cuidado',
    procedimentos: 'Hidratação facial com propósito social',
    emoji: '🎀'
  },
  {
    mes: 'Novembro',
    numeroMes: 11,
    titulo: 'Black Friday',
    conceito: '"Seu Investimento em Você"',
    apeloEmocional: 'Oportunidade única, inteligência financeira',
    publicoAlvo: 'Todas - clientes novas e recorrentes',
    procedimentos: 'Pacotes anuais, descontos progressivos',
    emoji: '🛍️'
  },
  {
    mes: 'Dezembro',
    numeroMes: 12,
    titulo: 'O Brilho das Festas',
    conceito: '"Pronta para Brilhar"',
    apeloEmocional: 'Celebração, autoconfiança para eventos',
    publicoAlvo: 'Todas - demanda altíssima',
    procedimentos: 'Skinboosters, Preenchimento Labial, Toxina, Vale-Presente',
    emoji: '✨'
  }
];

export default function CampanhasMarketingWidget() {
  const mesAtual = new Date().getMonth() + 1; // 1-12
  const campanhaAtual = campanhas.find(c => c.numeroMes === mesAtual) || campanhas[0];

  return (
    <div className="bg-white/60 backdrop-blur-xl shadow-lg rounded-2xl p-6 h-full min-h-[420px] group hover:shadow-2xl transition-all duration-200 ease-in-out border border-white/30">
      <div className="mb-4">
        <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
          <MegaphoneIcon className="w-6 h-6 text-purple-500" />
          Campanhas de Marketing
        </h3>
      </div>

      <div className="text-center mb-6">
        <div className="relative bg-gradient-to-r from-purple-100 to-pink-100 rounded-2xl p-4 mb-4">
          <div className="flex items-center justify-center gap-3 mb-3">
            <div className="bg-white/90 backdrop-blur-sm rounded-full p-2 shadow-lg">
              <span className="text-3xl">{campanhaAtual.emoji}</span>
            </div>
            <h4 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 text-transparent bg-clip-text">
              {campanhaAtual.mes}
            </h4>
          </div>
          <div className="bg-white/50 backdrop-blur-sm rounded-xl p-3 border border-white/60">
            <p className="text-sm text-slate-700 font-medium mb-2">{campanhaAtual.titulo}</p>
            <p className="text-base font-bold text-purple-700">{campanhaAtual.conceito}</p>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl p-4 border-l-4 border-blue-400 hover:shadow-md transition-all duration-200">
          <h5 className="text-sm font-bold text-blue-800 mb-2 flex items-center gap-2">
            🎯 Público-Alvo
          </h5>
          <p className="text-sm text-slate-700 leading-relaxed">{campanhaAtual.publicoAlvo}</p>
        </div>

        <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-4 border-l-4 border-amber-400 hover:shadow-md transition-all duration-200">
          <h5 className="text-sm font-bold text-amber-800 mb-2 flex items-center gap-2">
            💡 Apelo Emocional
          </h5>
          <p className="text-sm text-slate-700 leading-relaxed">{campanhaAtual.apeloEmocional}</p>
        </div>

        <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl p-4 border-l-4 border-emerald-400 hover:shadow-md transition-all duration-200">
          <h5 className="text-sm font-bold text-emerald-800 mb-2 flex items-center gap-2">
            💉 Procedimentos Sugeridos
          </h5>
          <p className="text-sm text-slate-700 leading-relaxed">{campanhaAtual.procedimentos}</p>
        </div>
      </div>
    </div>
  );
}
