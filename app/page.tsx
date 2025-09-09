"use client";
import { useState, useCallback, memo } from "react";
import { 
  Bars3Icon, 
  XMarkIcon,
  PlayCircleIcon,
  ChartBarIcon,
  UserGroupIcon,
  CalendarDaysIcon,
  DocumentTextIcon,
  BellIcon,
  HeartIcon,
  CameraIcon,
  CurrencyDollarIcon,
  FolderIcon,
  ClipboardDocumentListIcon
} from "@heroicons/react/24/outline";
import Image from "next/image";
import Link from "next/link";

// Mover tabs para fora do componente para evitar recriação
const TABS_DATA: Record<'alertas' | 'fidelidade' | 'galeria', {
  title: string;
  description: string;
  features: string[];
}> = {
    alertas: {
      title: "Alertas Proativos",
      description: "O sistema monitora automaticamente a duração de cada procedimento e te avisa quando é hora de entrar em contato com o paciente para renovação. Transforme seu arquivo passivo em uma fonte ativa de receita.",
      features: [
        "Notificações automáticas por procedimento",
        "Timeline personalizada por tipo de tratamento", 
        "Inicie conversas no WhatsApp sem sair da plataforma"
      ]
    },
    fidelidade: {
      title: "Índice de Fidelidade",
      description: "Uma métrica exclusiva que analisa 4 critérios únicos: pontualidade, frequência de retorno, variedade de procedimentos e valor investido. Identifique seus melhores pacientes e potencialize relacionamentos.",
      features: [
        "Score personalizado de 0 a 100%",
        "Análise comportamental detalhada",
        "Sugestões de ações para cada perfil"
      ]
    },
    galeria: {
      title: "Galeria Visual",
      description: "Organize automaticamente todas as fotos de antes e depois por paciente e procedimento. Crie apresentações profissionais que impressionam e convencem durante a consulta.",
      features: [
        "Organização automática por data e procedimento",
        "Comparativos lado a lado em alta resolução",
        "Exportação profissional para apresentações"
      ]
    }
};

const LandingPage = memo(function LandingPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'alertas' | 'fidelidade' | 'galeria'>('alertas');

  const handleMenuToggle = useCallback(() => {
    setMenuOpen(prev => !prev);
  }, []);

  const handleTabChange = useCallback((tab: 'alertas' | 'fidelidade' | 'galeria') => {
    setActiveTab(tab);
  }, []);

  return (
    <div className="min-h-screen w-full bg-gray-950 text-white font-system">
      
      {/* HEADER ULTRA MINIMAL */}
      <header className="fixed top-0 left-0 w-full z-50 bg-gray-950/95 backdrop-blur-xl border-b border-gray-800/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4 flex items-center justify-between">
          <div className="flex-1 flex justify-start">
            {/* Espaço reservado para manter o equilíbrio, pode ser um botão de menu ou nada */}
          </div>
          
          <div className="flex-1 flex justify-center">
            <Image src="/logo.png" alt="FaceMind" width={100} height={26} priority className="h-6 sm:h-7 w-auto" />
          </div>
          
          <div className="flex-1 flex items-center justify-end gap-3 sm:gap-4">
            <button 
              onClick={handleMenuToggle} 
              className="md:hidden p-2 text-gray-400 hover:text-white hover:bg-gray-800/50 rounded-lg transition-all duration-200 active:scale-95"
              aria-label={menuOpen ? "Fechar menu" : "Abrir menu"}
            >
              {menuOpen ? <XMarkIcon className="h-5 w-5" /> : <Bars3Icon className="h-5 w-5" />}
            </button>
            <a 
              href="/profissionais/login" 
              className="hidden sm:inline-flex items-center justify-center bg-gray-800/60 hover:bg-gray-700/80 text-white text-sm font-medium px-4 py-2 rounded-lg transition-all duration-200 hover:scale-105"
            >
              Entrar
            </a>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="fixed top-14 left-0 w-full bg-gray-950/98 backdrop-blur-xl border-b border-gray-800/30 z-40 md:hidden shadow-2xl">
          <div className="px-4 py-4">
            <a 
              href="/profissionais/login" 
              className="block bg-gray-800/80 hover:bg-gray-700 text-center text-white py-3 rounded-xl font-medium transition-all duration-200 hover:scale-105 active:scale-95"
              onClick={() => setMenuOpen(false)}
            >
              Entrar na Plataforma
            </a>
          </div>
        </div>
      )}

      {/* HERO SECTION - Apple Style */}
      <section className="relative z-10 min-h-screen flex items-center justify-center pt-24 pb-20 px-4 sm:px-6 lg:px-8 text-center overflow-hidden">
        {/* Animated Aurora Background */}
        <div className="absolute top-0 left-1/2 -z-10 h-[350px] w-[350px] sm:h-[500px] sm:w-[500px] -translate-x-1/2 rounded-full bg-gradient-to-br from-blue-900/60 to-purple-900/40 opacity-30 blur-3xl animate-aurora" />
        
        <div className="max-w-4xl mx-auto">
          
          <h1 className="text-[2.5rem] leading-[1.1] sm:text-5xl md:text-7xl font-bold text-white mb-8 tracking-tight animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            A gestão da sua clínica,{" "}
            <span className="bg-gradient-to-r from-blue-400 via-blue-500 to-cyan-400 text-transparent bg-clip-text">
              elevada à perfeição
            </span>
          </h1>
          
          <p className="text-base leading-relaxed sm:text-xl md:text-2xl text-gray-300 mb-10 max-w-2xl mx-auto font-light animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
            Cansado de planilhas e da papelada que rouba seu tempo? FaceMind é a única plataforma criada para profissionais que querem mais lucro, menos retrabalho e total controle sobre o seu crescimento.
          </p>
          
          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 justify-center animate-fade-in-up max-w-md sm:max-w-none mx-auto" style={{ animationDelay: '0.6s' }}>
            <Link href="/cadastro" className="w-full sm:w-auto">
              <button className="w-full sm:w-auto group bg-blue-600 hover:bg-blue-500 text-white px-8 py-4 rounded-xl text-lg font-semibold transition-all duration-300 min-w-[240px] hover:scale-105 hover:shadow-[0_0_40px_rgba(59,130,246,0.4)] relative overflow-hidden active:scale-95">
                <span className="relative z-10">Testar Gratuitamente</span>
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-blue-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </button>
            </Link>
            <button className="w-full sm:w-auto group flex items-center gap-3 text-gray-300 hover:text-white bg-white/5 hover:bg-white/10 px-8 py-4 rounded-xl transition-all duration-300 min-w-[240px] justify-center hover:scale-105 border border-gray-800/50 hover:border-gray-700 active:scale-95">
              <PlayCircleIcon className="h-5 w-5 text-gray-400 group-hover:text-white transition-colors duration-300" />
              <span className="font-medium">Ver em ação</span>
            </button>
          </div>
        </div>
      </section>

      {/* SEÇÃO 1: INTELIGÊNCIA DE NEGÓCIO */}
      <section className="relative z-10 py-16 sm:py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-20 items-start">
            
            {/* Left Column - Sticky Content */}
            <div className="lg:sticky lg:top-32 space-y-8 sm:space-y-10">
              <div className="space-y-6">
                <h2 className="text-3xl leading-tight sm:text-4xl lg:text-5xl font-bold text-white tracking-tight">
                  Seus números, finalmente{" "}
                  <span className="bg-gradient-to-r from-blue-400 to-blue-500 text-transparent bg-clip-text">sob controle</span>
                </h2>
                <p className="text-base leading-relaxed sm:text-lg lg:text-xl text-gray-300 font-light max-w-2xl">
                  Visualize o crescimento da sua clínica com dashboards que transformam dados em decisões estratégicas. Saiba exatamente onde investir e como crescer.
                </p>
              </div>
              
              <div className="space-y-5">
                <div className="flex items-start gap-4 p-4 rounded-xl bg-gray-900/30 hover:bg-gray-900/50 transition-colors duration-200">
                  <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-2.5 rounded-lg flex-shrink-0 shadow-lg">
                    <ChartBarIcon className="h-5 w-5 text-white" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-base sm:text-lg font-semibold text-white">Dashboard Financeiro Completo</h3>
                    <p className="text-sm sm:text-base text-gray-400 leading-relaxed">Faturamento, custos, lucro e margem em tempo real.</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 rounded-xl bg-gray-900/30 hover:bg-gray-900/50 transition-colors duration-200">
                  <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-2.5 rounded-lg flex-shrink-0 shadow-lg">
                    <ChartBarIcon className="h-5 w-5 text-white" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-base sm:text-lg font-semibold text-white">Análise de Crescimento</h3>
                    <p className="text-sm sm:text-base text-gray-400 leading-relaxed">Comparativos ano a ano com insights automáticos.</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 rounded-xl bg-gray-900/30 hover:bg-gray-900/50 transition-colors duration-200">
                  <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-2.5 rounded-lg flex-shrink-0 shadow-lg">
                    <ChartBarIcon className="h-5 w-5 text-white" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-base sm:text-lg font-semibold text-white">Performance Mensal Detalhada</h3>
                    <p className="text-sm sm:text-base text-gray-400 leading-relaxed">Identifique tendências e otimize resultados.</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 rounded-xl bg-gray-900/30 hover:bg-gray-900/50 transition-colors duration-200">
                  <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-2.5 rounded-lg flex-shrink-0 shadow-lg">
                    <ChartBarIcon className="h-5 w-5 text-white" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-base sm:text-lg font-semibold text-white">Rentabilidade por Procedimento</h3>
                    <p className="text-sm sm:text-base text-gray-400 leading-relaxed">Lucro real incluindo custos operacionais.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Dashboard Mockup - Apple Style */}
            <div className="relative order-last lg:order-last">
              {/* Floating elements for depth */}
              <div className="absolute -top-4 -right-4 w-32 h-32 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full blur-2xl"></div>
              <div className="absolute -bottom-4 -left-4 w-24 h-24 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-full blur-xl"></div>
              
              <div className="relative bg-gradient-to-br from-gray-900/95 via-gray-900/90 to-gray-800/95 rounded-3xl p-6 sm:p-8 border border-gray-700/30 shadow-[0_32px_64px_rgba(0,0,0,0.4)] backdrop-blur-xl">
                {/* Premium glass effect overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/[0.08] via-transparent to-transparent rounded-3xl"></div>
                
                <div className="relative space-y-8">
                  {/* Header with premium styling */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div className="space-y-1">
                      <h4 className="text-xl sm:text-2xl font-bold text-white tracking-tight">Dashboard Financeiro</h4>
                      <p className="text-xs text-gray-400 font-medium">Insights em tempo real</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                      <span className="text-xs sm:text-sm text-gray-300 bg-gray-800/60 px-4 py-2 rounded-full font-medium border border-gray-700/50">Novembro 2024</span>
                    </div>
                  </div>
                  
                  {/* Premium metric cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="group relative bg-gradient-to-br from-gray-800/80 via-gray-800/60 to-gray-700/80 p-6 rounded-2xl border border-gray-600/30 hover:border-gray-500/50 transition-all duration-300 hover:scale-105 hover:shadow-[0_20px_40px_rgba(0,0,0,0.3)]">
                      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      <div className="relative">
                        <div className="flex items-center justify-between mb-3">
                          <div className="w-3 h-3 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full"></div>
                          <div className="text-xs text-gray-400 bg-green-500/10 px-2 py-1 rounded-md">↗ +18%</div>
                        </div>
                        <div className="text-2xl sm:text-3xl font-bold text-white mb-1 tracking-tight">R$ 47.2K</div>
                        <div className="text-xs sm:text-sm text-gray-400 font-medium">Faturamento</div>
                        <div className="text-green-400 text-xs sm:text-sm mt-2 font-semibold flex items-center gap-1">
                          <span className="w-1 h-1 bg-green-400 rounded-full"></span>
                          vs mês anterior
                        </div>
                      </div>
                    </div>
                    
                    <div className="group relative bg-gradient-to-br from-gray-800/80 via-gray-800/60 to-gray-700/80 p-6 rounded-2xl border border-gray-600/30 hover:border-gray-500/50 transition-all duration-300 hover:scale-105 hover:shadow-[0_20px_40px_rgba(0,0,0,0.3)]">
                      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      <div className="relative">
                        <div className="flex items-center justify-between mb-3">
                          <div className="w-3 h-3 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full"></div>
                          <div className="text-xs text-gray-400 bg-blue-500/10 px-2 py-1 rounded-md">✓ Meta</div>
                        </div>
                        <div className="text-2xl sm:text-3xl font-bold text-white mb-1 tracking-tight">72%</div>
                        <div className="text-xs sm:text-sm text-gray-400 font-medium">Margem de Lucro</div>
                        <div className="text-blue-400 text-xs sm:text-sm mt-2 font-semibold flex items-center gap-1">
                          <span className="w-1 h-1 bg-blue-400 rounded-full"></span>
                          Acima da meta
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Premium procedures list */}
                  <div className="space-y-5">
                    <div className="flex items-center justify-between">
                      <h5 className="text-lg sm:text-xl text-white font-bold tracking-tight">Procedimentos Mais Lucrativos</h5>
                      <div className="text-xs text-gray-400 bg-gray-800/40 px-3 py-1.5 rounded-full">Top 3</div>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="group flex justify-between items-center p-4 bg-gradient-to-r from-gray-800/40 via-gray-800/30 to-gray-800/40 rounded-xl hover:from-gray-700/50 hover:via-gray-700/40 hover:to-gray-700/50 transition-all duration-300 border border-gray-700/20 hover:border-gray-600/30">
                        <div className="flex items-center gap-3">
                          <div className="w-2 h-8 bg-gradient-to-b from-yellow-400 to-orange-400 rounded-full"></div>
                          <span className="text-gray-200 text-sm sm:text-base font-medium group-hover:text-white transition-colors">Harmonização Facial</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-white font-bold text-sm sm:text-base">R$ 12.8K</span>
                          <div className="w-1.5 h-1.5 bg-green-400 rounded-full"></div>
                        </div>
                      </div>
                      
                      <div className="group flex justify-between items-center p-4 bg-gradient-to-r from-gray-800/40 via-gray-800/30 to-gray-800/40 rounded-xl hover:from-gray-700/50 hover:via-gray-700/40 hover:to-gray-700/50 transition-all duration-300 border border-gray-700/20 hover:border-gray-600/30">
                        <div className="flex items-center gap-3">
                          <div className="w-2 h-6 bg-gradient-to-b from-blue-400 to-cyan-400 rounded-full"></div>
                          <span className="text-gray-200 text-sm sm:text-base font-medium group-hover:text-white transition-colors">Preenchimento Labial</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-white font-bold text-sm sm:text-base">R$ 8.4K</span>
                          <div className="w-1.5 h-1.5 bg-blue-400 rounded-full"></div>
                        </div>
                      </div>
                      
                      <div className="group flex justify-between items-center p-4 bg-gradient-to-r from-gray-800/40 via-gray-800/30 to-gray-800/40 rounded-xl hover:from-gray-700/50 hover:via-gray-700/40 hover:to-gray-700/50 transition-all duration-300 border border-gray-700/20 hover:border-gray-600/30">
                        <div className="flex items-center gap-3">
                          <div className="w-2 h-4 bg-gradient-to-b from-purple-400 to-pink-400 rounded-full"></div>
                          <span className="text-gray-200 text-sm sm:text-base font-medium group-hover:text-white transition-colors">Toxina Botulínica</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-white font-bold text-sm sm:text-base">R$ 6.2K</span>
                          <div className="w-1.5 h-1.5 bg-purple-400 rounded-full"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SEÇÃO 2: CRM INTERATIVO */}
      <section className="relative z-10 py-16 sm:py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-gray-900/20 to-gray-900/40">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl leading-tight sm:text-4xl lg:text-5xl font-bold text-white mb-6 tracking-tight">
              CRM que{" "}
              <span className="bg-gradient-to-r from-blue-400 to-blue-500 text-transparent bg-clip-text">trabalha por você</span>
            </h2>
            <p className="text-base leading-relaxed sm:text-lg lg:text-xl text-gray-300 max-w-2xl mx-auto font-light">
              Nunca mais deixe um paciente escapar. Nosso sistema inteligente cuida dos relacionamentos enquanto você foca nos procedimentos.
            </p>
          </div>

          {/* Premium Tab Navigation - Apple Style */}
          <div className="flex justify-center mb-10 sm:mb-12">
            <div className="relative bg-gray-900/80 backdrop-blur-xl rounded-2xl p-2 border border-gray-700/30 shadow-[0_8px_32px_rgba(0,0,0,0.3)]">
              {/* Glowing background for active tab */}
              <div 
                className={`absolute top-2 bottom-2 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl transition-all duration-500 ease-out shadow-lg shadow-blue-500/30`}
                style={{
                  left: activeTab === 'alertas' ? '8px' : activeTab === 'fidelidade' ? '33.33%' : '66.66%',
                  width: '30%',
                  transform: 'translateX(0)'
                }}
              />
              
              {/* Premium glass overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/[0.08] via-transparent to-transparent rounded-2xl pointer-events-none"></div>
              
              <div className="relative flex">
              {Object.entries(TABS_DATA).map(([key, tab]) => (
                <button
                  key={key}
                  onClick={() => handleTabChange(key as 'alertas' | 'fidelidade' | 'galeria')}
                    className={`relative px-4 sm:px-6 py-3 sm:py-3.5 rounded-xl text-xs sm:text-sm font-bold transition-all duration-300 flex-1 text-center min-w-[100px] ${
                    activeTab === key 
                        ? 'text-white z-10 scale-105' 
                        : 'text-gray-400 hover:text-gray-200 hover:scale-102'
                  }`}
                >
                    <span className="relative z-10">{tab.title}</span>
                    {activeTab === key && (
                      <div className="absolute inset-0 bg-white/10 rounded-xl"></div>
                    )}
                </button>
              ))}
              </div>
            </div>
          </div>

          {/* Tab Content */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-20 items-center">
            <div className="space-y-6 order-last lg:order-first">
              <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white tracking-tight">
                {TABS_DATA[activeTab].title}
              </h3>
              <p className="text-base sm:text-lg text-gray-300 leading-relaxed font-light max-w-xl">
                {TABS_DATA[activeTab].description}
              </p>
              <ul className="space-y-4">
                {TABS_DATA[activeTab].features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-900/30 transition-colors duration-200">
                    <div className="w-2 h-2 rounded-full bg-gradient-to-r from-blue-400 to-blue-500 flex-shrink-0 mt-2"></div>
                    <span className="text-sm sm:text-base text-gray-300 leading-relaxed font-medium">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Premium Dynamic Mockup - Apple Style */}
            <div className="relative">
              {/* Floating ambient light */}
              <div className="absolute -top-8 -right-8 w-40 h-40 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-full blur-3xl"></div>
              
              <div className="relative bg-gradient-to-br from-gray-900/95 via-gray-900/90 to-gray-800/95 rounded-3xl p-6 sm:p-8 border border-gray-700/30 shadow-[0_32px_64px_rgba(0,0,0,0.4)] backdrop-blur-xl min-h-[400px]">
                {/* Premium glass overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/[0.08] via-transparent to-transparent rounded-3xl"></div>
                
                {activeTab === 'alertas' && (
                  <div className="relative space-y-6">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="relative">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/25">
                          <BellIcon className="h-6 w-6 text-white" />
                        </div>
                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs font-bold">2</span>
                        </div>
                      </div>
                      <div>
                        <h4 className="text-xl sm:text-2xl font-bold text-white tracking-tight">Alertas de Renovação</h4>
                        <p className="text-sm text-gray-400">Próximos vencimentos</p>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="group relative bg-gradient-to-r from-red-500/10 via-red-500/5 to-transparent border border-red-500/20 rounded-2xl p-5 hover:border-red-500/30 transition-all duration-300 hover:scale-102">
                        <div className="absolute inset-0 bg-gradient-to-r from-red-500/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        <div className="relative flex items-center gap-4">
                          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-red-500/20 to-red-600/20 flex items-center justify-center border border-red-500/30">
                            <span className="text-red-400 text-lg font-bold">!</span>
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-white font-bold text-base">Maria Silva</span>
                              <div className="text-xs bg-red-500/20 text-red-300 px-3 py-1 rounded-full">Urgente</div>
                            </div>
                            <div className="text-red-400 text-sm font-medium">Harmonização vence em 3 dias</div>
                            <div className="text-gray-400 text-xs mt-1">Procedimento realizado em 15/08/2024</div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="group relative bg-gradient-to-r from-yellow-500/10 via-yellow-500/5 to-transparent border border-yellow-500/20 rounded-2xl p-5 hover:border-yellow-500/30 transition-all duration-300 hover:scale-102">
                        <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        <div className="relative flex items-center gap-4">
                          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-yellow-500/20 to-yellow-600/20 flex items-center justify-center border border-yellow-500/30">
                            <span className="text-yellow-400 text-lg">⚠</span>
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-white font-bold text-base">João Santos</span>
                              <div className="text-xs bg-yellow-500/20 text-yellow-300 px-3 py-1 rounded-full">Atenção</div>
                            </div>
                            <div className="text-yellow-400 text-sm font-medium">Retorno previsto para próxima semana</div>
                            <div className="text-gray-400 text-xs mt-1">Última consulta: 22/10/2024</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'fidelidade' && (
                  <div className="relative space-y-6">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-red-500 rounded-2xl flex items-center justify-center shadow-lg shadow-pink-500/25">
                        <HeartIcon className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h4 className="text-xl sm:text-2xl font-bold text-white tracking-tight">Índice de Fidelidade</h4>
                        <p className="text-sm text-gray-400">Score comportamental exclusivo</p>
                      </div>
                    </div>
                    
                    <div className="space-y-5">
                      <div className="group relative bg-gradient-to-r from-green-500/10 via-green-500/5 to-transparent border border-green-500/20 rounded-2xl p-5 hover:border-green-500/30 transition-all duration-300">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center text-white font-bold text-sm">AC</div>
                            <div>
                              <span className="text-white font-bold text-base">Ana Costa</span>
                              <div className="text-xs text-gray-400">Cliente Premium</div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-green-400 font-bold text-xl">96%</div>
                            <div className="text-xs bg-green-500/20 text-green-300 px-2 py-1 rounded-full">Excelente</div>
                          </div>
                        </div>
                        <div className="relative w-full bg-gray-800/50 rounded-full h-3 overflow-hidden">
                          <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-emerald-400 rounded-full transition-all duration-1000" style={{width: '96%'}}></div>
                        </div>
                      </div>
                      
                      <div className="group relative bg-gradient-to-r from-blue-500/10 via-blue-500/5 to-transparent border border-blue-500/20 rounded-2xl p-5 hover:border-blue-500/30 transition-all duration-300">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center text-white font-bold text-sm">CL</div>
                            <div>
                              <span className="text-white font-bold text-base">Carlos Lima</span>
                              <div className="text-xs text-gray-400">Cliente Fiel</div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-blue-400 font-bold text-xl">84%</div>
                            <div className="text-xs bg-blue-500/20 text-blue-300 px-2 py-1 rounded-full">Muito Bom</div>
                          </div>
                        </div>
                        <div className="relative w-full bg-gray-800/50 rounded-full h-3 overflow-hidden">
                          <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full transition-all duration-1000" style={{width: '84%'}}></div>
                        </div>
                      </div>
                      
                      <div className="group relative bg-gradient-to-r from-yellow-500/10 via-yellow-500/5 to-transparent border border-yellow-500/20 rounded-2xl p-5 hover:border-yellow-500/30 transition-all duration-300">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center text-white font-bold text-sm">MS</div>
                            <div>
                              <span className="text-white font-bold text-base">Marina Silva</span>
                              <div className="text-xs text-gray-400">Potencial de Crescimento</div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-yellow-400 font-bold text-xl">67%</div>
                            <div className="text-xs bg-yellow-500/20 text-yellow-300 px-2 py-1 rounded-full">Regular</div>
                          </div>
                        </div>
                        <div className="relative w-full bg-gray-800/50 rounded-full h-3 overflow-hidden">
                          <div className="absolute inset-0 bg-gradient-to-r from-yellow-500 to-orange-400 rounded-full transition-all duration-1000" style={{width: '67%'}}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'galeria' && (
                  <div className="relative space-y-6">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/25">
                        <CameraIcon className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h4 className="text-xl sm:text-2xl font-bold text-white tracking-tight">Galeria Visual</h4>
                        <p className="text-sm text-gray-400">Comparativos antes & depois</p>
                      </div>
                    </div>
                    
                    <div className="space-y-6">
                      {/* Comparativo principal */}
                      <div className="relative bg-gradient-to-r from-gray-800/40 via-gray-800/20 to-gray-800/40 rounded-2xl p-5 border border-gray-700/30">
                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div className="group relative">
                            <div className="absolute top-2 left-2 z-10">
                              <span className="bg-gray-900/80 text-white text-xs font-bold px-2 py-1 rounded-full">ANTES</span>
                            </div>
                            <div className="relative bg-gradient-to-br from-gray-700 to-gray-800 rounded-xl h-28 sm:h-32 overflow-hidden border border-gray-600/30 group-hover:scale-105 transition-transform duration-300">
                              <div className="absolute inset-0 bg-gradient-to-br from-gray-600/20 to-gray-700/40 flex items-center justify-center">
                                <div className="text-center">
                                  <div className="w-8 h-8 bg-gray-500/50 rounded-full flex items-center justify-center mx-auto mb-2">
                                    <CameraIcon className="h-4 w-4 text-gray-300" />
                                  </div>
                                  <span className="text-gray-300 text-xs font-medium">Foto Original</span>
                                </div>
                              </div>
                            </div>
                            <div className="text-center text-xs text-gray-400 mt-2 font-medium">15/11/2024</div>
                          </div>
                          
                          <div className="group relative">
                            <div className="absolute top-2 left-2 z-10">
                              <span className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white text-xs font-bold px-2 py-1 rounded-full">DEPOIS</span>
                            </div>
                            <div className="relative bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-xl h-28 sm:h-32 overflow-hidden border border-blue-500/30 group-hover:scale-105 transition-transform duration-300 shadow-lg shadow-blue-500/10">
                              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-cyan-500/20 flex items-center justify-center">
                                <div className="text-center">
                                  <div className="w-8 h-8 bg-blue-500/50 rounded-full flex items-center justify-center mx-auto mb-2">
                                    <span className="text-blue-200 text-xs">✨</span>
                                  </div>
                                  <span className="text-blue-200 text-xs font-medium">Resultado</span>
                                </div>
                              </div>
                            </div>
                            <div className="text-center text-xs text-gray-400 mt-2 font-medium">22/11/2024</div>
                          </div>
                        </div>
                        
                        {/* Info do procedimento */}
                        <div className="bg-gradient-to-r from-gray-800/60 to-gray-800/40 rounded-xl p-4 border border-gray-700/20">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center text-white font-bold text-xs">AC</div>
                              <div>
                                <span className="text-white font-bold text-sm">Ana Costa</span>
                                <div className="text-xs text-gray-400">Harmonização Facial</div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-xs bg-green-500/20 text-green-300 px-2 py-1 rounded-full">Concluído</div>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Galeria em miniatura */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-white font-medium text-sm">Últimos Procedimentos</span>
                          <span className="text-xs text-gray-400 bg-gray-800/40 px-2 py-1 rounded-full">Ver todos</span>
                        </div>
                        <div className="grid grid-cols-4 gap-2">
                          {[1,2,3,4].map((i) => (
                            <div key={i} className="relative bg-gray-800/60 rounded-lg h-12 sm:h-14 border border-gray-700/30 hover:border-gray-600/50 transition-all duration-200 hover:scale-105">
                              <div className="absolute inset-0 bg-gradient-to-br from-gray-600/20 to-gray-700/40 rounded-lg flex items-center justify-center">
                                <CameraIcon className="h-3 w-3 text-gray-400" />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SEÇÃO 3: PRODUTIVIDADE */}
      <section className="relative z-10 py-16 sm:py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl leading-tight sm:text-4xl lg:text-5xl font-bold text-white mb-6 tracking-tight">
              Produtividade que{" "}
              <span className="bg-gradient-to-r from-blue-400 to-blue-500 text-transparent bg-clip-text">devolve seu tempo</span>
        </h2>
            <p className="text-base leading-relaxed sm:text-lg lg:text-xl text-gray-300 max-w-2xl mx-auto font-light">
              Recupere horas, não minutos. Automatize tarefas repetitivas e organize seu dia para focar no que realmente importa.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 max-w-5xl mx-auto">
            <div className="group bg-gradient-to-br from-gray-900 to-gray-900/80 rounded-2xl p-5 sm:p-6 border border-gray-800/50 hover:border-gray-700/70 transition-all duration-300 hover:scale-102 hover:shadow-2xl hover:shadow-gray-900/50 active:scale-95">
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-3 rounded-xl w-fit mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <CalendarDaysIcon className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-white mb-3 group-hover:text-blue-200 transition-colors duration-300">Agenda Inteligente</h3>
              <p className="text-sm sm:text-base text-gray-400 leading-relaxed group-hover:text-gray-300 transition-colors duration-300">
                Organize horários com categorias visuais: Procedimentos, Retornos e Compromissos Pessoais.
              </p>
            </div>

            <div className="group bg-gradient-to-br from-gray-900 to-gray-900/80 rounded-2xl p-5 sm:p-6 border border-gray-800/50 hover:border-gray-700/70 transition-all duration-300 hover:scale-102 hover:shadow-2xl hover:shadow-gray-900/50 active:scale-95">
              <div className="bg-gradient-to-r from-green-500 to-green-600 p-3 rounded-xl w-fit mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <CurrencyDollarIcon className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-white mb-3 group-hover:text-green-200 transition-colors duration-300">Tabela de Valores</h3>
              <p className="text-sm sm:text-base text-gray-400 leading-relaxed group-hover:text-gray-300 transition-colors duration-300">
                Centralize preços com opções de pagamento personalizadas: PIX, cartão e parcelamentos.
              </p>
            </div>

            <div className="group bg-gradient-to-br from-gray-900 to-gray-900/80 rounded-2xl p-5 sm:p-6 border border-gray-800/50 hover:border-gray-700/70 transition-all duration-300 hover:scale-102 hover:shadow-2xl hover:shadow-gray-900/50 active:scale-95">
              <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-3 rounded-xl w-fit mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <FolderIcon className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-white mb-3 group-hover:text-purple-200 transition-colors duration-300">Biblioteca de Documentos</h3>
              <p className="text-sm sm:text-base text-gray-400 leading-relaxed group-hover:text-gray-300 transition-colors duration-300">
                Templates de formulários, termos de consentimento e orientações organizados e acessíveis.
              </p>
            </div>

            <div className="group bg-gradient-to-br from-gray-900 to-gray-900/80 rounded-2xl p-5 sm:p-6 border border-gray-800/50 hover:border-gray-700/70 transition-all duration-300 hover:scale-102 hover:shadow-2xl hover:shadow-gray-900/50 active:scale-95">
              <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-3 rounded-xl w-fit mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <ClipboardDocumentListIcon className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-white mb-3 group-hover:text-orange-200 transition-colors duration-300">Gestão de Tarefas</h3>
              <p className="text-sm sm:text-base text-gray-400 leading-relaxed group-hover:text-gray-300 transition-colors duration-300">
                To-do list integrado para não esquecer pendências e manter sua rotina sempre organizada.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* PREÇOS MINIMALISTAS */}
      <section id="precos" className="relative z-10 py-16 sm:py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-gray-900/30 to-gray-900/50">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl leading-tight sm:text-4xl lg:text-5xl font-bold text-white mb-6 tracking-tight">
              <span className="bg-gradient-to-r from-blue-400 to-blue-500 text-transparent bg-clip-text">Planos</span>
            </h2>
            <p className="text-base sm:text-lg lg:text-xl text-gray-300 leading-relaxed font-light">
              Comece grátis. Escale conforme cresce.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
            {/* Plano Essencial */}
            <div className="bg-gradient-to-br from-gray-900 to-gray-900/80 border border-gray-800/50 rounded-2xl p-5 sm:p-6 backdrop-blur-sm hover:scale-102 transition-transform duration-300 active:scale-95">
              <div className="mb-6">
                <h3 className="text-xl sm:text-2xl font-bold text-white mb-4">Essencial</h3>
                <div className="flex items-baseline gap-2 mb-4">
                  <span className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white">R$ 79</span>
                  <span className="text-sm sm:text-base text-gray-400 font-light">/mês</span>
                </div>
                <p className="text-sm sm:text-base text-gray-400 leading-relaxed">Ideal para começar sua transformação digital</p>
              </div>
              
              <ul className="space-y-3 mb-6 text-sm sm:text-base">
                {[
                  'Até 50 Pacientes',
                  'Prontuários Digitais Completos',
                  'Galeria de Fotos Organizada',
                  'Agenda Inteligente',
                  'Biblioteca de Documentos',
                  'Suporte por Email'
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-800/30 transition-colors duration-200">
                    <div className="w-2 h-2 rounded-full bg-gradient-to-r from-blue-400 to-blue-500 flex-shrink-0"></div>
                    <span className="text-gray-300 font-medium">{item}</span>
                  </li>
                ))}
              </ul>
              
              <Link href="/cadastro">
                <button className="w-full bg-gray-800/80 hover:bg-gray-700 text-white py-4 rounded-xl font-semibold transition-all duration-200 hover:scale-105 active:scale-95 border border-gray-700/50">
                  Começar Grátis
                </button>
              </Link>
            </div>
            
            {/* Plano Profissional */}
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-5 sm:p-6 relative text-white shadow-2xl shadow-blue-500/25 hover:scale-102 transition-transform duration-300 active:scale-95">
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <span className="bg-white text-blue-600 px-4 py-2 rounded-full text-xs sm:text-sm font-bold shadow-lg">
                  ⭐ Recomendado
                </span>
              </div>
              
              <div className="mb-6 pt-2">
                <h3 className="text-xl sm:text-2xl font-bold mb-4">Profissional</h3>
                <div className="flex items-baseline gap-2 mb-4">
                  <span className="text-3xl sm:text-4xl lg:text-5xl font-bold">R$ 149</span>
                  <span className="text-sm sm:text-base text-blue-100 font-light">/mês</span>
                </div>
                <p className="text-sm sm:text-base text-blue-100 leading-relaxed">Para clínicas que querem crescer</p>
              </div>
              
              <ul className="space-y-3 mb-6 text-sm sm:text-base">
                {[
                  'Pacientes Ilimitados',
                  'Todos os Dashboards Avançados',
                  'Alertas Proativos Automáticos',
                  'Índice de Fidelidade Exclusivo',
                  'Análise de Lucratividade por Procedimento',
                  'Suporte Prioritário via WhatsApp'
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/10 transition-colors duration-200">
                    <div className="w-2 h-2 rounded-full bg-white flex-shrink-0"></div>
                    <span className="text-blue-50 font-medium">{item}</span>
                  </li>
                ))}
              </ul>
              
              <Link href="/cadastro">
                <button className="w-full bg-white text-blue-600 hover:bg-gray-50 py-4 rounded-xl font-bold transition-all duration-200 hover:scale-105 active:scale-95 shadow-lg">
                  Começar Agora
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA FINAL MINIMALISTA */}
      <section className="relative z-10 py-16 sm:py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl leading-tight sm:text-4xl lg:text-5xl font-bold text-white mb-6 tracking-tight">
            Pronto para{" "}
            <span className="bg-gradient-to-r from-blue-400 to-blue-500 text-transparent bg-clip-text">transformar sua clínica?</span>
        </h2>
          <p className="text-base leading-relaxed sm:text-lg lg:text-xl text-gray-300 mb-10 sm:mb-12 max-w-2xl mx-auto font-light">
            Teste gratuitamente por 14 dias. Sem cartão de crédito.
          </p>
          
          <Link href="/cadastro">
            <button className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-10 py-4 sm:py-5 rounded-xl text-lg sm:text-xl font-bold transition-all duration-300 hover:scale-105 active:scale-95 shadow-xl shadow-blue-500/25 hover:shadow-2xl hover:shadow-blue-500/40">
              ✨ Começar Teste Gratuito
            </button>
          </Link>
        </div>
      </section>

      {/* FOOTER ULTRA MINIMAL */}
      <footer className="relative z-10 border-t border-gray-800/50 py-8 sm:py-12 px-4 sm:px-6 lg:px-8 bg-gray-950/50">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3 sm:gap-4">
              <Image src="/logo.png" alt="FaceMind" width={100} height={26} className="h-5 sm:h-6 w-auto" />
              <span className="text-gray-500 text-xs sm:text-sm font-medium">© 2025 FaceMind</span>
            </div>
            
            <div className="flex items-center gap-4 sm:gap-6 text-xs sm:text-sm text-gray-500">
              <a href="#" className="hover:text-white transition-colors duration-200 p-2 rounded-lg hover:bg-gray-900/50">Privacidade</a>
              <a href="#" className="hover:text-white transition-colors duration-200 p-2 rounded-lg hover:bg-gray-900/50">Termos</a>
              <a href="#" className="hover:text-white transition-colors duration-200 p-2 rounded-lg hover:bg-gray-900/50">Suporte</a>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
});

export default LandingPage;