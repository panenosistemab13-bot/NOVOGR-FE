import { createClient } from 'redis';

let redisClient: any = null;

async function getRedisClient() {
  if (!redisClient) {
    redisClient = createClient({
      url: process.env.REDIS_URL || 'redis://localhost:6379'
    });
    redisClient.on('error', (err: any) => console.error('Redis Client Error', err));
    await redisClient.connect();
  }
  if (!redisClient.isOpen) {
    await redisClient.connect();
  }
  return redisClient;
}

const PESSOAL_WEB_APP_URL = "https://script.google.com/macros/s/AKfycbwTZlpQzmEQ-rzHOOPd8idmgpoc_QgVLGpcobN4lXCcmTnoCGUtxdbRjjRGX8hiIVYRKA/exec";

export default async function handler(req: any, res: any) {
  try {
    const redis = await getRedisClient();

    if (req.method === 'GET') {
      const isPending = req.query?.pendencias === 'true' || (req.url && req.url.includes('pendencias=true'));

      if (isPending) {
        const rawItems = await redis.lRange('pending_updates', 0, -1);
        await redis.del('pending_updates');
        const updates = rawItems.map((item: string) => JSON.parse(item));
        return res.status(200).json({ updates: updates || [] });
      }

      const rawData = await redis.get('frota_data');
      return res.status(200).json({ data: rawData ? JSON.parse(rawData) : [] });
    }

    if (req.method === 'POST') {
      const { action, data, vehicle } = req.body || {};

      if (action === 'sync_from_sheets') {
        const payloadData = data || [];
        await redis.set('frota_data', JSON.stringify(payloadData));
        try {
          await fetch(PESSOAL_WEB_APP_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'sync_from_corp', rows: payloadData })
          });
        } catch (err) {
          console.error("Erro ao encaminhar para PESSOAL_WEB_APP_URL:", err);
        }
        return res.status(200).json({ status: 'success' });
      }

      if (action === 'app_update') {
        if (vehicle) {
          await redis.rPush('pending_updates', JSON.stringify(vehicle));
          
          const rawData = await redis.get('frota_data');
          let frota = rawData ? JSON.parse(rawData) : [];
          const idx = frota.findIndex((v: any) => v.id === vehicle.id || v.cavalo === vehicle.cavalo);
          if (idx !== -1) {
            frota[idx] = vehicle;
          } else {
            frota.push(vehicle);
          }
          await redis.set('frota_data', JSON.stringify(frota));
        }
        return res.status(200).json({ status: 'queued' });
      }

      return res.status(400).json({ error: 'Invalid action' });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err: any) {
    console.error("Erro em /api/frota com Redis (fallback em memória):", err);
    (globalThis as any).frotaData = (globalThis as any).frotaData || [];
    (globalThis as any).pendingUpdates = (globalThis as any).pendingUpdates || [];

    if (req.method === 'GET') {
      const isPending = req.query?.pendencias === 'true' || (req.url && req.url.includes('pendencias=true'));
      if (isPending) {
        const updates = [...(globalThis as any).pendingUpdates];
        (globalThis as any).pendingUpdates = [];
        return res.status(200).json({ updates });
      }
      return res.status(200).json({ data: (globalThis as any).frotaData });
    }

    if (req.method === 'POST') {
      const { action, data, vehicle } = req.body || {};
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
    }

    return res.status(500).json({ error: err.message });
  }
}
