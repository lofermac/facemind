"use client";
import dynamic from "next/dynamic";
import { useState, Suspense, lazy } from "react";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/solid";
import Image from "next/image";
const Particles = dynamic(() => import("@tsparticles/react").then(mod => mod.Particles), { ssr: false });
const DepoimentosCarousel = lazy(() => import("../components/DepoimentosCarousel"));

export default function LandingPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-[#1a1440] via-[#2a1a5e] to-[#3a206e] relative overflow-x-hidden">
      {/* Partículas animadas no fundo (desligadas em telas < sm) */}
      <div className="hidden sm:block">
        <Particles
          id="tsparticles-landing"
          options={{
            background: { color: "transparent" },
            fpsLimit: 60,
            particles: {
              color: { value: ["#a78bfa", "#f472b6", "#fff"] },
              links: { enable: true, color: "#fff", opacity: 0.06 },
              move: { enable: true, speed: 0.4 },
              number: { value: 24 },
              opacity: { value: 0.10 },
              shape: { type: "circle" },
              size: { value: { min: 1, max: 3 } },
            },
            detectRetina: true,
          }}
          className="absolute inset-0 z-0 pointer-events-none"
        />
      </div>
      {/* HEADER PREMIUM FIXO */}
      <header className="fixed top-0 left-0 w-full z-30 flex items-center justify-between px-6 sm:px-8 py-4 bg-gradient-to-r from-[#1a1440]/80 via-[#2a1a5e]/80 to-[#3a206e]/80 backdrop-blur-2xl border-b border-white/10 shadow-lg animate-fade-in-header h-20">
        <div className="flex items-center gap-3 h-full">
          <Image src="/logo.png" alt="Logo FaceMind" width={120} height={40} priority className="h-10 w-auto drop-shadow-xl" />
        </div>
        {/* Links Desktop */}
        <nav className="hidden md:flex flex-1 items-center justify-center gap-8 h-full">
          <a href="#recursos" className="text-white/80 hover:text-white font-medium text-lg transition-colors duration-200 flex items-center h-full">Recursos</a>
          <a href="#planos" className="text-white/80 hover:text-white font-medium text-lg transition-colors duration-200 flex items-center h-full">Planos</a>
          <a href="#depoimentos" className="text-white/80 hover:text-white font-medium text-lg transition-colors duration-200 flex items-center h-full">Depoimentos</a>
          <a href="#contato" className="text-white/80 hover:text-white font-medium text-lg transition-colors duration-200 flex items-center h-full">Contato</a>
        </nav>
        {/* Botões */}
        <div className="flex items-center gap-4">
          {/* Hamburger Mobile */}
          <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden text-white/90 focus:outline-none">
            {menuOpen ? <XMarkIcon className="h-8 w-8" /> : <Bars3Icon className="h-8 w-8" />}
          </button>
          <a href="/profissionais/login" className="hidden sm:inline-flex px-5 py-2 rounded-lg bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600 text-white font-semibold shadow-xl hover:from-blue-500 hover:to-blue-700 hover:scale-[1.07] active:scale-95 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-300 border border-blue-300/40 relative overflow-hidden group">
            <span className="relative z-10">Login</span>
            <span className="absolute left-0 top-0 w-full h-full bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl" />
          </a>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {menuOpen && (
        <div className="fixed top-20 left-0 w-full bg-gradient-to-b from-[#1a1440]/90 via-[#2a1a5e]/90 to-[#3a206e]/90 backdrop-blur-xl border-b border-white/10 z-30 md:hidden animate-fade-in">
          <div className="flex flex-col items-center py-6 space-y-6">
            <a onClick={() => setMenuOpen(false)} href="#recursos" className="text-white text-lg font-medium">Recursos</a>
            <a onClick={() => setMenuOpen(false)} href="#planos" className="text-white text-lg font-medium">Planos</a>
            <a onClick={() => setMenuOpen(false)} href="#depoimentos" className="text-white text-lg font-medium">Depoimentos</a>
            <a onClick={() => setMenuOpen(false)} href="#contato" className="text-white text-lg font-medium">Contato</a>
            <a onClick={() => setMenuOpen(false)} href="/profissionais/login" className="mt-4 px-6 py-3 rounded-xl bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600 text-white font-semibold shadow-lg">Login</a>
          </div>
        </div>
      )}

      {/* HERO SECTION */}
      <section className="relative z-10 flex flex-col items-center justify-center pt-32 pb-20 px-4 animate-fade-in">
        {/* Badge de novidade */}
        <span className="mb-10 px-6 py-2 rounded-full bg-gradient-to-r from-indigo-500 to-fuchsia-500 text-white font-semibold text-base shadow-lg animate-bounce-in">✨ Novidade: IA Generativa GPT-4 Integrada</span>
        <div className="relative group">
          <Image src="/logo.png" alt="Logo FaceMind" width={180} height={60} priority className="h-20 w-auto mb-4 drop-shadow-2xl" />
        </div>
        <h1 className="text-5xl md:text-6xl font-extrabold text-white text-center mb-2 tracking-tight animate-slide-up leading-tight" style={{ fontFamily: 'Poppins, Inter, -apple-system, BlinkMacSystemFont, sans-serif' }}>
          O Futuro da <br />
          <span className="bg-gradient-to-r from-indigo-400 via-fuchsia-400 to-pink-400 bg-clip-text text-transparent">Estética Digital</span>
        </h1>
        <p className="text-xl md:text-2xl text-slate-200 text-center max-w-2xl mb-8 animate-fade-in">
          Revolucione sua clínica com inteligência artificial de última geração. <span className="text-sky-300 font-semibold">Análises precisas</span>, gestão inteligente e <span className="text-pink-300 font-semibold">resultados extraordinários</span>.
        </p>
        <div className="flex flex-col sm:flex-row items-center gap-4 mb-4 animate-fade-in">
          <a href="#planos" className="px-8 py-4 rounded-2xl bg-gradient-to-r from-indigo-500 via-fuchsia-500 to-pink-500 text-white font-bold text-lg shadow-xl hover:from-indigo-600 hover:to-pink-600 hover:scale-[1.08] active:scale-95 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-fuchsia-400 flex items-center gap-2">
            Solicitar Demonstração <span className="text-2xl">→</span>
          </a>
        </div>
      </section>

      {/* MÉTRICAS DE CONFIANÇA */}
      <section className="relative z-10 max-w-6xl mx-auto px-4 py-10 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
        {[
          { icon: '🎯', value: '10K+', label: 'Procedimentos Realizados' },
          { icon: '🏅', value: '98%', label: 'Satisfação dos Clientes' },
          { icon: '📈', value: '500+', label: 'Clínicas Parceiras' },
          { icon: '⏰', value: '24/7', label: 'Suporte Disponível' },
        ].map((item, i) => (
          <div key={i} className="flex flex-col items-center justify-center bg-white/10 backdrop-blur-xl rounded-2xl p-6 shadow-lg border border-white/10 animate-fade-in hover:scale-105 hover:bg-white/20 transition-all duration-300 cursor-pointer" style={{ animationDelay: `${0.1 + i * 0.1}s` }}>
            <span className="text-4xl md:text-5xl mb-2">{item.icon}</span>
            <span className="text-2xl font-bold text-white mb-1">{item.value}</span>
            <span className="text-white/80 text-base">{item.label}</span>
          </div>
        ))}
      </section>

      {/* RECURSOS INOVADORES */}
      <section id="recursos" className="relative z-10 max-w-6xl mx-auto px-4 py-20">
        <h2 className="text-4xl md:text-5xl font-extrabold text-white text-center mb-6 tracking-tight animate-fade-in">
          Recursos <span className="bg-gradient-to-r from-indigo-400 via-fuchsia-400 to-pink-400 bg-clip-text text-transparent">Inovadores</span>
        </h2>
        <p className="text-lg md:text-xl text-slate-200 text-center max-w-3xl mx-auto mb-14 animate-fade-in">
          Tecnologia de ponta para transformar sua clínica em uma referência mundial no mercado
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {[
            {
              icon: '🧠',
              title: 'IA Generativa Avançada',
              desc: 'Análise facial em tempo real com recomendações personalizadas baseadas em machine learning',
            },
            {
              icon: '📅',
              title: 'Agendamento Inteligente',
              desc: 'Sistema automatizado com IA para otimização de horários e lembretes inteligentes',
            },
            {
              icon: '👥',
              title: 'Gestão Completa',
              desc: 'Controle total do histórico, evolução e preferências de cada paciente',
            },
            {
              icon: '🔒',
              title: 'Segurança Avançada',
              desc: 'Proteção de dados com criptografia de ponta e autenticação multifator',
            },
            {
              icon: '📊',
              title: 'Relatórios Inteligentes',
              desc: 'Dashboards e insights automáticos para decisões estratégicas',
            },
            {
              icon: '🤖',
              title: 'Automação de Processos',
              desc: 'Fluxos automáticos para reduzir tarefas manuais e aumentar a produtividade',
            },
          ].map((item, i) => (
            <div key={i} className="flex flex-col items-center text-center bg-white/10 backdrop-blur-2xl rounded-3xl p-10 shadow-2xl border border-white/10 animate-fade-in hover:scale-105 hover:bg-white/20 transition-all duration-300 group cursor-pointer" style={{ animationDelay: `${0.1 + i * 0.1}s` }}>
              <span className="text-4xl mb-4">{item.icon}</span>
              <h3 className="text-2xl font-semibold text-white mb-2 group-hover:text-fuchsia-200 transition-colors duration-200">{item.title}</h3>
              <p className="text-slate-200 text-lg group-hover:text-white transition-colors duration-200">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* PLANOS */}
      <section id="planos" className="relative z-10 max-w-6xl mx-auto px-4 py-20">
        <h2 className="text-4xl md:text-5xl font-extrabold text-white text-center mb-6 tracking-tight animate-fade-in">
          Planos que <span className="bg-gradient-to-r from-indigo-400 via-fuchsia-400 to-pink-400 bg-clip-text text-transparent">Crescem</span> com Você
        </h2>
        <p className="text-lg md:text-xl text-slate-200 text-center max-w-3xl mx-auto mb-14 animate-fade-in">
          Escolha o plano ideal e comece a transformar seus resultados hoje mesmo
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {[
            {
              name: 'Starter',
              price: 'R$ 97',
              desc: 'Perfeito para começar sua jornada digital',
              features: ['Até 50 pacientes', 'IA básica para análise', 'Agendamento inteligente', 'Relatórios essenciais', 'Suporte por email', '1 usuário'],
              cta: 'Escolher Plano',
              highlight: false,
            },
            {
              name: 'Profissional',
              price: 'R$ 197',
              desc: 'A escolha dos profissionais de sucesso',
              features: ['Até 500 pacientes', 'IA completa + análises faciais', 'Automação de processos', 'Relatórios avançados', 'Suporte prioritário 24/7', 'Até 3 usuários', 'Integração WhatsApp', 'Backup automático', 'API personalizada'],
              cta: 'Começar Agora',
              highlight: true,
            },
            {
              name: 'Enterprise',
              price: 'R$ 397',
              desc: 'Para clínicas que pensam grande',
              features: ['Pacientes ilimitados', 'IA generativa completa', 'Dashboard executivo', 'Consultoria estratégica', 'Usuários ilimitados', 'White label completo', 'Integração ERP/CRM', 'Suporte dedicado', 'Treinamento personalizado'],
              cta: 'Escolher Plano',
              highlight: false,
            },
          ].map((item, i) => (
            <div key={i} className={`relative flex flex-col items-center bg-white/10 backdrop-blur-2xl rounded-3xl p-10 shadow-2xl border border-white/10 animate-fade-in ${item.highlight ? 'scale-105 border-2 border-fuchsia-400 shadow-2xl bg-gradient-to-br from-white/30 via-fuchsia-200/10 to-white/10' : ''} hover:scale-105 hover:bg-white/20 transition-all duration-300 cursor-pointer`} style={{ animationDelay: `${0.1 + i * 0.1}s` }}>
              {item.highlight && (
                <span className="absolute -top-6 left-1/2 -translate-x-1/2 px-5 py-2 rounded-full bg-gradient-to-r from-fuchsia-500 to-pink-500 text-white font-bold text-sm shadow-lg border-2 border-white/40 z-10">Mais Vendido</span>
              )}
              <h3 className="text-2xl font-bold text-white mb-2">{item.name}</h3>
              <span className="text-3xl font-extrabold text-white mb-2">{item.price}<span className="text-lg font-medium">/mês</span></span>
              <p className="text-slate-200 text-lg mb-4 text-center">{item.desc}</p>
              <ul className="mb-6 space-y-2 text-white/90 text-base text-left">
                {item.features.map((f, idx) => (
                  <li key={idx} className="flex items-center gap-2"><span className="text-green-400">✔</span> {f}</li>
                ))}
              </ul>
              <a href="#" className={`w-full py-3 rounded-xl text-center font-bold text-lg shadow-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-fuchsia-400 ${item.highlight ? 'bg-gradient-to-r from-indigo-500 via-fuchsia-500 to-pink-500 text-white hover:from-indigo-600 hover:to-pink-600' : 'bg-white/20 text-white hover:bg-white/30'}`}>{item.cta}</a>
            </div>
          ))}
        </div>
      </section>

      {/* DEPOIMENTOS - Carrossel simples com microinteração */}
      <section id="depoimentos" className="relative z-10 max-w-6xl mx-auto px-4 py-20">
        <h2 className="text-3xl md:text-4xl font-extrabold text-white text-center mb-12 tracking-tight animate-fade-in">
          O que dizem nossos clientes
        </h2>
        <Suspense fallback={<div className="text-center text-white/80 py-12">Carregando depoimentos...</div>}>
          <DepoimentosCarousel />
        </Suspense>
      </section>

      {/* CTA FINAL */}
      <section id="contato" className="relative z-10 flex flex-col items-center justify-center py-24 px-4 mt-12">
        <h2 className="text-3xl md:text-4xl font-extrabold text-white text-center mb-8 tracking-tight animate-fade-in">
          Pronto para <span className="bg-gradient-to-r from-indigo-400 via-fuchsia-400 to-pink-400 bg-clip-text text-transparent">Revolucionar</span> sua Clínica?
        </h2>
        <p className="text-lg md:text-xl text-slate-200 text-center max-w-2xl mb-8 animate-fade-in">
          Junte-se a mais de <span className="text-fuchsia-300 font-bold">1.000 profissionais</span> que já transformaram seus negócios
        </p>
        <div className="flex flex-col items-center gap-4 mb-6 animate-fade-in">
          <a href="#planos" className="px-8 py-4 rounded-2xl bg-gradient-to-r from-indigo-500 via-fuchsia-500 to-pink-500 text-white font-bold text-lg shadow-xl hover:from-indigo-600 hover:to-pink-600 hover:scale-[1.08] active:scale-95 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-fuchsia-400 flex items-center gap-2">
            Solicitar Demonstração <span className="text-2xl">→</span>
          </a>
        </div>
      </section>

      {/* RODAPÉ */}
      <footer className="relative z-10 w-full py-10 flex flex-col items-center justify-center text-slate-400 text-base opacity-80">
        <span>© {new Date().getFullYear()} FaceMind. Todos os direitos reservados.</span>
      </footer>

      <style jsx>{`
        .bg-gradient-radial {
          background: radial-gradient(circle, var(--tw-gradient-stops));
        }
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: none; }
        }
        .animate-fade-in {
          animation: fade-in 0.7s cubic-bezier(.4,0,.2,1);
        }
        @keyframes fade-in-header {
          from { opacity: 0; transform: translateY(-24px); }
          to { opacity: 1; transform: none; }
        }
        .animate-fade-in-header {
          animation: fade-in-header 0.8s cubic-bezier(.4,0,.2,1);
        }
        @keyframes bounce-in {
          0% { transform: scale(0.8); opacity: 0; }
          60% { transform: scale(1.1); opacity: 1; }
          100% { transform: scale(1); opacity: 1; }
        }
        .animate-bounce-in {
          animation: bounce-in 1s cubic-bezier(.4,0,.2,1);
        }
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(40px); }
          to { opacity: 1; transform: none; }
        }
        .animate-slide-up {
          animation: slide-up 1s cubic-bezier(.4,0,.2,1);
        }
        @keyframes spotlight {
          0%, 100% { filter: blur(60px) brightness(1); }
          50% { filter: blur(80px) brightness(1.2); }
        }
        .animate-spotlight {
          animation: spotlight 8s ease-in-out infinite;
        }
        @keyframes spotlight2 {
          0%, 100% { filter: blur(32px) brightness(1); }
          50% { filter: blur(48px) brightness(1.2); }
        }
        .animate-spotlight2 {
          animation: spotlight2 10s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}