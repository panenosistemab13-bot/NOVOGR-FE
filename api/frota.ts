export default function handler(req: any, res: any) {
  (globalThis as any).frotaData = (globalThis as any).frotaData || [];
  (globalThis as any).pendingUpdates = (globalThis as any).pendingUpdates || [];

  if (req.method === 'GET') {
    const isPending = req.query?.pending === 'true' || (req.url && req.url.includes('pending=true'));
    const secretHeader = req.headers['x-secret'] || req.headers['X-Secret'];

    if (isPending && secretHeader === 'CHAVE_SEGURA_123') {
      const updates = [...(globalThis as any).pendingUpdates];
      (globalThis as any).pendingUpdates = [];
      return res.status(200).json({ updates });
    }

    return res.status(200).json({ data: (globalThis as any).frotaData || [] });
  }

  if (req.method === 'POST') {
    const { secret, action, data, vehicle } = req.body || {};
    if (secret !== 'CHAVE_SEGURA_123') {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (action === 'sync_from_sheets') {
      (globalThis as any).frotaData = data || [];
      return res.status(200).json({ status: 'success' });
    }

    if (action === 'app_update') {
      if (vehicle) {
        (globalThis as any).pendingUpdates.push(vehicle);
        const idx = (globalThis as any).frotaData.findIndex((v: any) => v.id === vehicle.id || v.cavalo === vehicle.cavalo);
        if (idx !== -1) {
          (globalThis as any).frotaData[idx] = vehicle;
        } else {
          (globalThis as any).frotaData.push(vehicle);
        }
      }
      return res.status(200).json({ status: 'queued' });
    }

    return res.status(400).json({ error: 'Invalid action' });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
