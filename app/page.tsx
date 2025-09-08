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
        "Integração com WhatsApp para contato direto"
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
      <header className="fixed top-0 left-0 w-full z-50 bg-gray-950/90 backdrop-blur-xl border-b border-gray-800/50">
        <div className="max-w-7xl mx-auto px-8 py-6 flex items-center justify-between">
          <div className="flex items-center">
            <Image src="/logo.png" alt="FaceMind" width={120} height={32} priority className="h-8 w-auto" />
      </div>
          
          <nav className="hidden md:flex items-center gap-12">
            <a href="#recursos" className="text-gray-400 hover:text-white text-sm font-medium transition-colors duration-200">Recursos</a>
            <a href="#precos" className="text-gray-400 hover:text-white text-sm font-medium transition-colors duration-200">Preços</a>
        </nav>
          
          <div className="flex items-center gap-6">
            <button 
              onClick={handleMenuToggle} 
              className="md:hidden text-gray-400 hover:text-white transition-colors"
            >
              {menuOpen ? <XMarkIcon className="h-6 w-6" /> : <Bars3Icon className="h-6 w-6" />}
          </button>
            <a 
              href="/profissionais/login" 
              className="hidden sm:block text-gray-400 hover:text-white text-sm font-medium transition-colors duration-200"
            >
              Entrar
            </a>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="fixed top-20 left-0 w-full bg-gray-950/95 backdrop-blur-xl border-b border-gray-800/50 z-40 md:hidden">
          <div className="px-8 py-8 space-y-6">
            <a href="#recursos" className="block text-gray-400 hover:text-white text-sm font-medium transition-colors">Recursos</a>
            <a href="#precos" className="block text-gray-400 hover:text-white text-sm font-medium transition-colors">Preços</a>
            <a href="/profissionais/login" className="block text-gray-400 hover:text-white text-sm font-medium transition-colors">Entrar</a>
          </div>
        </div>
      )}

      {/* HERO SECTION - Apple Style */}
      <section className="relative z-10 pt-40 pb-32 px-8">
        <div className="max-w-4xl mx-auto text-center">
          
          <h1 className="text-6xl md:text-8xl font-bold text-white mb-8 tracking-tight leading-none">
            A gestão da sua clínica,{" "}
            <span className="text-blue-500">elevada à perfeição</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-300 mb-16 max-w-3xl mx-auto leading-relaxed font-light">
            FaceMind é a plataforma tudo-em-um que organiza sua rotina, impressiona seus pacientes e multiplica seu faturamento. Foco no que importa: resultados.
          </p>
          
          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-6 justify-center">
            <button className="group bg-blue-500 hover:bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-medium transition-all duration-200 min-w-[200px] hover:scale-105 hover:shadow-xl hover:shadow-blue-500/25 relative overflow-hidden">
              <span className="relative z-10">Testar Gratuitamente</span>
              <div className="absolute inset-0 bg-white/10 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 skew-x-12"></div>
            </button>
            <button className="group flex items-center gap-3 text-blue-500 hover:text-blue-400 px-8 py-4 rounded-lg border border-blue-500 hover:border-blue-400 transition-all duration-200 min-w-[200px] justify-center hover:scale-105 hover:shadow-lg">
              <PlayCircleIcon className="h-5 w-5 group-hover:scale-110 transition-transform duration-200" />
              Ver em ação
            </button>
          </div>
        </div>
      </section>

      {/* SEÇÃO 1: INTELIGÊNCIA DE NEGÓCIO */}
      <section className="relative z-10 py-32 px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-start">
            
            {/* Left Column - Sticky Content */}
            <div className="lg:sticky lg:top-32 space-y-12">
              <div>
                <h2 className="text-5xl md:text-6xl font-bold text-white mb-8 leading-tight">
                  Seus números, finalmente{" "}
                  <span className="text-blue-500">sob controle</span>
                </h2>
                <p className="text-xl text-gray-300 leading-relaxed font-light">
                  Visualize o crescimento da sua clínica com dashboards que transformam dados em decisões estratégicas. Saiba exatamente onde investir e como crescer.
                </p>
              </div>
              
              <div className="space-y-8">
                <div className="flex items-start gap-4">
                  <div className="bg-gray-900 p-3 rounded-lg mt-1">
                    <ChartBarIcon className="h-6 w-6 text-blue-500" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-2">Dashboard Financeiro Completo</h3>
                    <p className="text-gray-400 leading-relaxed">Faturamento, custos, lucro e margem em tempo real.</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="bg-gray-900 p-3 rounded-lg mt-1">
                    <ChartBarIcon className="h-6 w-6 text-blue-500" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-2">Análise de Crescimento</h3>
                    <p className="text-gray-400 leading-relaxed">Comparativos ano a ano com insights automáticos.</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="bg-gray-900 p-3 rounded-lg mt-1">
                    <ChartBarIcon className="h-6 w-6 text-blue-500" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-2">Performance Mensal Detalhada</h3>
                    <p className="text-gray-400 leading-relaxed">Identifique tendências e otimize resultados.</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="bg-gray-900 p-3 rounded-lg mt-1">
                    <ChartBarIcon className="h-6 w-6 text-blue-500" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-2">Rentabilidade por Procedimento</h3>
                    <p className="text-gray-400 leading-relaxed">Lucro real incluindo custos operacionais.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Dashboard Mockup */}
            <div className="relative">
              <div className="bg-gray-900 rounded-2xl p-8 border border-gray-800">
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xl font-semibold text-white">Dashboard Financeiro</h4>
                    <span className="text-sm text-gray-400">Novembro 2024</span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-6">
                    <div className="bg-gray-800 p-6 rounded-xl">
                      <div className="text-3xl font-bold text-white mb-1">R$ 47.2K</div>
                      <div className="text-sm text-gray-400">Faturamento</div>
                      <div className="text-green-400 text-sm mt-2">+18% vs mês anterior</div>
                    </div>
                    <div className="bg-gray-800 p-6 rounded-xl">
                      <div className="text-3xl font-bold text-white mb-1">72%</div>
                      <div className="text-sm text-gray-400">Margem de Lucro</div>
                      <div className="text-blue-400 text-sm mt-2">Acima da meta</div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h5 className="text-white font-medium">Procedimentos Mais Lucrativos</h5>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-300">Harmonização Facial</span>
                        <span className="text-white font-medium">R$ 12.8K</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-300">Preenchimento Labial</span>
                        <span className="text-white font-medium">R$ 8.4K</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-300">Toxina Botulínica</span>
                        <span className="text-white font-medium">R$ 6.2K</span>
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
      <section className="relative z-10 py-32 px-8 bg-gray-900/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-5xl md:text-6xl font-bold text-white mb-8 leading-tight">
              CRM que{" "}
              <span className="text-blue-500">trabalha por você</span>
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed font-light">
              Nunca mais deixe um paciente escapar. Nosso sistema inteligente cuida dos relacionamentos enquanto você foca nos procedimentos.
            </p>
          </div>

          {/* Tab Navigation */}
          <div className="flex justify-center mb-16">
            <div className="bg-gray-900 rounded-lg p-2 border border-gray-800">
              {Object.entries(TABS_DATA).map(([key, tab]) => (
                <button
                  key={key}
                  onClick={() => handleTabChange(key as 'alertas' | 'fidelidade' | 'galeria')}
                  className={`px-6 py-3 rounded-md text-sm font-medium transition-all duration-200 ${
                    activeTab === key 
                      ? 'bg-blue-500 text-white' 
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  {tab.title}
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <div className="space-y-8">
              <h3 className="text-3xl font-bold text-white">
                {TABS_DATA[activeTab].title}
              </h3>
              <p className="text-lg text-gray-300 leading-relaxed">
                {TABS_DATA[activeTab].description}
              </p>
              <ul className="space-y-4">
                {TABS_DATA[activeTab].features.map((feature, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                    <span className="text-gray-300">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Dynamic Mockup */}
            <div className="relative">
              <div className="bg-gray-900 rounded-2xl p-8 border border-gray-800">
                {activeTab === 'alertas' && (
                  <div className="space-y-6">
                    <div className="flex items-center gap-3 mb-6">
                      <BellIcon className="h-6 w-6 text-blue-500" />
                      <h4 className="text-xl font-semibold text-white">Alertas de Renovação</h4>
                    </div>
                    <div className="space-y-4">
                      <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center">
                            <span className="text-red-400 text-sm">!</span>
                          </div>
                          <div>
                            <div className="text-white font-medium">Maria Silva</div>
                            <div className="text-red-400 text-sm">Harmonização vence em 3 dias</div>
                          </div>
                        </div>
                      </div>
                      <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-8 h-8 rounded-full bg-yellow-500/20 flex items-center justify-center">
                            <span className="text-yellow-400 text-sm">⚠</span>
                          </div>
                          <div>
                            <div className="text-white font-medium">João Santos</div>
                            <div className="text-yellow-400 text-sm">Retorno previsto para próxima semana</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'fidelidade' && (
                  <div className="space-y-6">
                    <div className="flex items-center gap-3 mb-6">
                      <HeartIcon className="h-6 w-6 text-blue-500" />
                      <h4 className="text-xl font-semibold text-white">Índice de Fidelidade</h4>
                    </div>
                    <div className="space-y-4">
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-300">Ana Costa</span>
                          <span className="text-green-400 font-medium">96%</span>
                        </div>
                        <div className="w-full bg-gray-800 rounded-full h-2">
                          <div className="bg-green-400 h-2 rounded-full" style={{width: '96%'}}></div>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-300">Carlos Lima</span>
                          <span className="text-blue-400 font-medium">84%</span>
                        </div>
                        <div className="w-full bg-gray-800 rounded-full h-2">
                          <div className="bg-blue-400 h-2 rounded-full" style={{width: '84%'}}></div>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-300">Marina Silva</span>
                          <span className="text-yellow-400 font-medium">67%</span>
                        </div>
                        <div className="w-full bg-gray-800 rounded-full h-2">
                          <div className="bg-yellow-400 h-2 rounded-full" style={{width: '67%'}}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'galeria' && (
                  <div className="space-y-6">
                    <div className="flex items-center gap-3 mb-6">
                      <CameraIcon className="h-6 w-6 text-blue-500" />
                      <h4 className="text-xl font-semibold text-white">Galeria Visual</h4>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <div className="bg-gray-800 rounded-lg h-24 flex items-center justify-center">
                          <span className="text-gray-400 text-sm">Antes</span>
                        </div>
                        <div className="text-center text-xs text-gray-400">15/11/2024</div>
                      </div>
                      <div className="space-y-2">
                        <div className="bg-blue-500/20 rounded-lg h-24 flex items-center justify-center border border-blue-500/30">
                          <span className="text-blue-400 text-sm">Depois</span>
                        </div>
                        <div className="text-center text-xs text-gray-400">22/11/2024</div>
                      </div>
                    </div>
                    <div className="bg-gray-800 rounded-lg p-3 text-center">
                      <span className="text-gray-300 text-sm">Harmonização Facial - Ana Costa</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SEÇÃO 3: PRODUTIVIDADE */}
      <section className="relative z-10 py-32 px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-5xl md:text-6xl font-bold text-white mb-8 leading-tight">
              Produtividade que{" "}
              <span className="text-blue-500">devolve seu tempo</span>
        </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed font-light">
              Recupere horas, não minutos. Automatize tarefas repetitivas e organize seu dia para focar no que realmente importa.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="group bg-gray-900 rounded-2xl p-8 border border-gray-800 hover:border-gray-700 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-gray-900/50">
              <div className="bg-gray-800 p-4 rounded-lg w-fit mb-6 group-hover:bg-blue-900/50 transition-colors duration-300">
                <CalendarDaysIcon className="h-8 w-8 text-blue-500 group-hover:scale-110 transition-transform duration-300" />
              </div>
              <h3 className="text-xl font-bold text-white mb-4 group-hover:text-blue-200 transition-colors duration-300">Agenda Inteligente</h3>
              <p className="text-gray-400 leading-relaxed group-hover:text-gray-300 transition-colors duration-300">
                Organize horários com categorias visuais: Procedimentos, Retornos e Compromissos Pessoais.
              </p>
            </div>

            <div className="group bg-gray-900 rounded-2xl p-8 border border-gray-800 hover:border-gray-700 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-gray-900/50">
              <div className="bg-gray-800 p-4 rounded-lg w-fit mb-6 group-hover:bg-green-900/50 transition-colors duration-300">
                <CurrencyDollarIcon className="h-8 w-8 text-blue-500 group-hover:scale-110 transition-transform duration-300" />
              </div>
              <h3 className="text-xl font-bold text-white mb-4 group-hover:text-green-200 transition-colors duration-300">Tabela de Valores</h3>
              <p className="text-gray-400 leading-relaxed group-hover:text-gray-300 transition-colors duration-300">
                Centralize preços com opções de pagamento personalizadas: PIX, cartão e parcelamentos.
              </p>
            </div>

            <div className="group bg-gray-900 rounded-2xl p-8 border border-gray-800 hover:border-gray-700 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-gray-900/50">
              <div className="bg-gray-800 p-4 rounded-lg w-fit mb-6 group-hover:bg-purple-900/50 transition-colors duration-300">
                <FolderIcon className="h-8 w-8 text-blue-500 group-hover:scale-110 transition-transform duration-300" />
              </div>
              <h3 className="text-xl font-bold text-white mb-4 group-hover:text-purple-200 transition-colors duration-300">Biblioteca de Documentos</h3>
              <p className="text-gray-400 leading-relaxed group-hover:text-gray-300 transition-colors duration-300">
                Templates de formulários, termos de consentimento e orientações organizados e acessíveis.
              </p>
            </div>

            <div className="group bg-gray-900 rounded-2xl p-8 border border-gray-800 hover:border-gray-700 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-gray-900/50">
              <div className="bg-gray-800 p-4 rounded-lg w-fit mb-6 group-hover:bg-orange-900/50 transition-colors duration-300">
                <ClipboardDocumentListIcon className="h-8 w-8 text-blue-500 group-hover:scale-110 transition-transform duration-300" />
              </div>
              <h3 className="text-xl font-bold text-white mb-4 group-hover:text-orange-200 transition-colors duration-300">Gestão de Tarefas</h3>
              <p className="text-gray-400 leading-relaxed group-hover:text-gray-300 transition-colors duration-300">
                To-do list integrado para não esquecer pendências e manter sua rotina sempre organizada.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* PREÇOS MINIMALISTAS */}
      <section id="precos" className="relative z-10 py-32 px-8 bg-gray-900/30">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-5xl md:text-6xl font-bold text-white mb-8 leading-tight">
              Preços{" "}
              <span className="text-blue-500">transparentes</span>
        </h2>
            <p className="text-xl text-gray-300 leading-relaxed font-light">
              Comece grátis. Escale conforme cresce.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Plano Essencial */}
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8">
              <div className="mb-8">
                <h3 className="text-2xl font-bold text-white mb-4">Essencial</h3>
                <div className="flex items-baseline gap-2 mb-6">
                  <span className="text-5xl font-bold text-white">R$ 79</span>
                  <span className="text-gray-400 font-light">/mês</span>
                </div>
                <p className="text-gray-400 leading-relaxed">Ideal para começar sua transformação digital</p>
              </div>
              
              <ul className="space-y-4 mb-8">
                {[
                  'Até 50 pacientes',
                  'Dashboard financeiro básico', 
                  'Galeria de fotos organizada',
                  'Agenda inteligente',
                  'Suporte por email'
          ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                    <span className="text-gray-300">{item}</span>
                  </li>
                ))}
              </ul>
              
              <button className="w-full bg-gray-800 hover:bg-gray-700 text-white py-4 rounded-lg font-medium transition-all duration-200">
                Começar Grátis
              </button>
            </div>
            
            {/* Plano Profissional */}
            <div className="bg-blue-500 rounded-2xl p-8 relative text-white">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <span className="bg-white text-blue-500 px-4 py-2 rounded-full text-sm font-medium">
                  Recomendado
                </span>
              </div>
              
              <div className="mb-8">
                <h3 className="text-2xl font-bold mb-4">Profissional</h3>
                <div className="flex items-baseline gap-2 mb-6">
                  <span className="text-5xl font-bold">R$ 149</span>
                  <span className="text-blue-100 font-light">/mês</span>
                </div>
                <p className="text-blue-100 leading-relaxed">Para clínicas que querem crescer</p>
              </div>
              
              <ul className="space-y-4 mb-8">
                {[
                  'Pacientes ilimitados',
                  'Todos os dashboards avançados',
                  'Alertas proativos automáticos',
                  'Índice de fidelidade exclusivo',
                  'Suporte prioritário via WhatsApp',
                  'Biblioteca completa de documentos'
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-white"></div>
                    <span className="text-blue-50">{item}</span>
                  </li>
                ))}
              </ul>
              
              <button className="w-full bg-white text-blue-500 hover:bg-gray-50 py-4 rounded-lg font-medium transition-all duration-200">
                Começar Agora
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* CTA FINAL MINIMALISTA */}
      <section className="relative z-10 py-32 px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-5xl md:text-6xl font-bold text-white mb-8 leading-tight">
            Pronto para{" "}
            <span className="text-blue-500">transformar sua clínica?</span>
        </h2>
          <p className="text-xl text-gray-300 mb-16 leading-relaxed font-light">
            Teste gratuitamente por 14 dias. Sem cartão de crédito.
          </p>
          
          <button className="bg-blue-500 hover:bg-blue-600 text-white px-12 py-6 rounded-lg text-xl font-medium transition-all duration-200 hover:scale-105">
            Começar Teste Gratuito
          </button>
        </div>
      </section>

      {/* FOOTER ULTRA MINIMAL */}
      <footer className="relative z-10 border-t border-gray-800 py-16 px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center gap-4 mb-8 md:mb-0">
              <Image src="/logo.png" alt="FaceMind" width={100} height={26} className="h-6 w-auto" />
              <span className="text-gray-500 text-sm">© 2024 FaceMind</span>
            </div>
            
            <div className="flex items-center gap-8 text-sm text-gray-500">
              <a href="#" className="hover:text-white transition-colors duration-200">Privacidade</a>
              <a href="#" className="hover:text-white transition-colors duration-200">Termos</a>
              <a href="#" className="hover:text-white transition-colors duration-200">Suporte</a>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
});

export default LandingPage;