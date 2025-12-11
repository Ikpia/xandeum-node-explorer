import { PrpcClient } from 'xandeum-prpc';

export default async function handler(req: any, res: any) {
  const { ip } = req.query as { ip?: string };

  if (!ip) {
    res.status(400).json({ error: 'Missing ip parameter' });
    return;
  }

  try {
    const client = new PrpcClient(ip);
    const pods = await client.getPodsWithStats().catch(() => client.getPods());
    res.status(200).json(pods);
  } catch (error: any) {
    res.status(502).json({
      ip,
      error: error?.message ?? 'Unknown error',
    });
  }
}
