import express from 'express';
import { PrpcClient } from 'xandeum-prpc';

const app = express();
const PORT = process.env.PRPC_PROXY_PORT || 4000;

app.use(express.json());

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

// Fetch combined node info (stats + pods) for a single pNode IP
app.get('/api/node-info/:ip', async (req, res) => {
  const ip = req.params.ip;

  try {
    const client = new PrpcClient(ip);

    const [stats, podsWithStats] = await Promise.all([
      client.getStats(),
      client.getPodsWithStats().catch(async () => client.getPods()),
    ]);

    res.json({
      ip,
      stats,
      pods: podsWithStats,
      status: 'online',
    });
  } catch (error) {
    res.status(502).json({
      ip,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Discover pods (gossip view) from a seed node IP
app.get('/api/pods-from-seed/:ip', async (req, res) => {
  const ip = req.params.ip;

  try {
    const client = new PrpcClient(ip);
    const pods = await client.getPodsWithStats().catch(() => client.getPods());
    res.json(pods);
  } catch (error) {
    res.status(502).json({
      ip,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

app.listen(PORT, () => {
  console.log(`pRPC proxy server listening on http://localhost:${PORT}`);
});
