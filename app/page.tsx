import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-4 sm:p-8 bg-gradient-to-br from-slate-900 to-slate-700 text-white">
      <div className="text-center max-w-4xl mx-auto">
        {/* Você pode adicionar seu logo aqui depois */}
        {/* <img src="/logo-facemind.png" alt="FaceMind Logo" className="w-48 h-auto mx-auto mb-8" /> */}
        
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6 tracking-tight">
          Bem-vindo ao <span className="text-sky-400">FaceMind</span>!
        </h1>
        <p className="text-lg sm:text-xl text-slate-300 mb-10 sm:mb-12">
          Seu sistema inteligente para gerenciamento clínico.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <Link 
            href="/pacientes" 
            className="bg-sky-500 hover:bg-sky-600 text-white font-semibold py-4 px-6 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out transform hover:-translate-y-1 flex flex-col items-center justify-center text-center h-40 sm:h-48"
          >
            <h2 className="text-xl sm:text-2xl mb-2">Gerenciar Pacientes</h2>
            <p className="text-sm sm:text-base text-sky-100">Cadastre, consulte e edite seus pacientes.</p>
          </Link>
          <Link 
            href="/procedimentos/novo" //  Ou para uma lista de procedimentos, se existir
            className="bg-teal-500 hover:bg-teal-600 text-white font-semibold py-4 px-6 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out transform hover:-translate-y-1 flex flex-col items-center justify-center text-center h-40 sm:h-48"
          >
            <h2 className="text-xl sm:text-2xl mb-2">Registrar Procedimento</h2>
            <p className="text-sm sm:text-base text-teal-100">Adicione novos procedimentos realizados.</p>
          </Link>
          <Link 
            href="/tabela-valores" 
            className="bg-indigo-500 hover:bg-indigo-600 text-white font-semibold py-4 px-6 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out transform hover:-translate-y-1 flex flex-col items-center justify-center text-center h-40 sm:h-48"
          >
            <h2 className="text-xl sm:text-2xl mb-2">Tabela de Valores</h2>
            <p className="text-sm sm:text-base text-indigo-100">Gerencie tipos e custos de procedimentos.</p>
          </Link>
        </div>
        <p className="mt-12 text-sm text-slate-400">
          {new Date().getFullYear()} &copy; FaceMind. Todos os direitos reservados.
        </p>
      </div>
    </main>
  );
}