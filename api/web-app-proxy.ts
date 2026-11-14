import { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const targetUrl = (req.query.url as string) || '';
    if (!targetUrl) {
      return res.status(400).json({ error: "URL do Google Sheets ou Web App é obrigatória." });
    }

    const response = await fetch(targetUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
        "Accept": "application/json, text/plain, text/csv, */*"
      }
    });

    if (!response.ok) {
      return res.status(response.status).json({ error: `Serviço respondeu com HTTP ${response.status}` });
    }

    const text = await response.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      data = { isCsv: true, csvText: text };
    }

    res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
    return res.status(200).json(data);
  } catch (err: any) {
    console.error("Erro no proxy:", err);
    return res.status(500).json({ error: err.message || "Falha ao conectar com o serviço." });
  }
}
