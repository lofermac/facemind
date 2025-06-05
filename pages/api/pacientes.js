import { supabaseServer as supabase } from '@/utils/supabaseServerClient';

export default async function handler(req, res) {
  const { method } = req;

  switch (method) {
    case 'GET':
      // Lógica para buscar pacientes
      const { data, error } = await supabase.from('pacientes').select('*');
      if (error) return res.status(500).json({ error: error.message });
      return res.status(200).json(data);
    case 'POST':
      // Lógica para criar um novo paciente
      const { nome, cpf, whatsapp, data_nascimento, email, status } = req.body;
      const { data: insertData, error: insertError } = await supabase.from('pacientes').insert([{ nome, cpf, whatsapp, data_nascimento, email, status }]);
      if (insertError) return res.status(500).json({ error: insertError.message });
      return res.status(201).json(insertData);
    default:
      res.setHeader('Allow', ['GET', 'POST']);
      return res.status(405).end(`Method ${method} Not Allowed`);
  }
} 