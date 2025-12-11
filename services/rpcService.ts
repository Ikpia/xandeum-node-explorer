import { NodeStats, PodsResult, NodeData } from '../types';

export const fetchNodeInfo = async (ip: string): Promise<NodeData> => {
  const start = performance.now();
  
  try {
    const response = await fetch(`/api/node-info/${encodeURIComponent(ip)}`);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json() as { stats: NodeStats; pods: PodsResult };

    const { stats, pods } = data;

    const end = performance.now();
    
    return {
      ip,
      stats,
      pods,
      status: 'online',
      latency: Math.round(end - start)
    };

  } catch (error) {
    return {
      ip,
      stats: null,
      pods: null,
      status: 'offline',
      latency: 0,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};

// Discover pods (pNodes) from a seed pRPC node using the get-pods method.
// This is the closest currently-available approximation to a gossip view.
export const fetchPodsFromSeed = async (seedIp: string): Promise<PodsResult | null> => {
  try {
    const response = await fetch(`/api/pods-from-seed/${encodeURIComponent(seedIp)}`);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const podsResult = await response.json() as PodsResult;

    return podsResult;
  } catch {
    return null;
  }
};