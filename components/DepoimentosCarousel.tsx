import React from "react";

const depoimentos = [
  {
    name: 'Dra. Camila Souza',
    text: 'O FaceMind revolucionou a gestão da minha clínica. Interface linda, fácil de usar e suporte incrível!',
  },
  {
    name: 'Clínica Estética Viva',
    text: 'A automação de agendamentos e o controle financeiro são diferenciais que nunca vi em outro sistema.',
  },
  {
    name: 'Dr. Rafael Lima',
    text: 'Simplesmente o melhor sistema para clínicas. Moderno, rápido e seguro!',
  },
];

export default function DepoimentosCarousel() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      {depoimentos.map((item, i) => (
        <div key={i} className="bg-white/10 backdrop-blur-2xl rounded-3xl p-8 shadow-2xl border border-white/10 animate-fade-in min-w-0" style={{ animationDelay: `${0.3 + i * 0.1}s` }}>
          <p className="text-slate-100 text-lg mb-4">“{item.text}”</p>
          <span className="block text-fuchsia-200 font-semibold">{item.name}</span>
        </div>
      ))}
    </div>
  );
} 