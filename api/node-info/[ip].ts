import { PrpcClient } from 'xandeum-prpc';

export default async function handler(req: any, res: any) {
  const { ip } = req.query as { ip?: string };

  if (!ip) {
    res.status(400).json({ error: 'Missing ip parameter' });
    return;
  }

  try {
    const client = new PrpcClient(ip);

    const [stats, podsWithStats] = await Promise.all([
      client.getStats(),
      client.getPodsWithStats().catch(async () => client.getPods()),
    ]);

    res.status(200).json({
      ip,
      stats,
      pods: podsWithStats,
      status: 'online',
    });
  } catch (error: any) {
    res.status(502).json({
      ip,
      error: error?.message ?? 'Unknown error',
    });
  }
}
