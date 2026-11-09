export default function handler(req: any, res: any) {
  // Use armazenamento ou sincronização de dados
  if (req.method === 'POST') {
    const { secret, data } = req.body || {};
    if (secret !== 'CHAVE_SEGURA_123') return res.status(401).json({ error: 'Unauthorized' });
    (globalThis as any).frotaData = data || [];
    return res.status(200).json({ status: 'success' });
  }
  return res.status(200).json({ data: (globalThis as any).frotaData || [] });
}
