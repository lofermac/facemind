import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get('file') as File;

  if (!file) {
    return NextResponse.json({ error: 'Arquivo não enviado.' }, { status: 400 });
  }

  // Credenciais do Bunny.net
  const storageZone = 'facemind-files';
  const accessKey = '4f9fc053-8157-4422-836548b36fc5-8173-4b42';
  const fileName = `uploads/${file.name}`;

  // Converta o arquivo para ArrayBuffer
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  // Upload para o Bunny.net
  const response = await fetch(
    `https://br.storage.bunnycdn.com/${storageZone}/${fileName}`,
    {
      method: 'PUT',
      headers: {
        AccessKey: accessKey,
        'Content-Type': 'application/octet-stream',
      },
      body: buffer,
    }
  );

  if (response.ok) {
    const cdnHost = 'facemind.b-cdn.net'; // nome da Pull Zone
    const baseUrl = `https://${cdnHost}/${fileName}`;
    // Gerar miniatura (mesma técnica usada antes no Supabase)
    const params = new URLSearchParams({ width: '150', height: '150', resize: 'cover' });
    const thumbUrl = `${baseUrl}?${params.toString()}`;
    console.log('Upload OK:', { baseUrl, thumbUrl });
    return NextResponse.json({ url: baseUrl, thumbUrl });
  } else {
    console.error('Erro upload Bunny:', response.status);
    const error = await response.text();
    return NextResponse.json({ error }, { status: 500 });
  }
} 