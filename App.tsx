import React, { useEffect, useState, useCallback } from 'react';
import { NODE_IPS, REFRESH_INTERVAL_MS } from './constants';
import { fetchNodeInfo, fetchPodsFromSeed } from './services/rpcService';
import { NodeData, SortOption } from './types';
import { StatCard } from './components/StatCard';
import { NodeList } from './components/NodeList';
import { NetworkCharts } from './components/NetworkCharts';
import { FormatBytes } from './components/Formatters';

const App: React.FC = () => {
  const [nodes, setNodes] = useState<NodeData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null);
  const [sortOption, setSortOption] = useState<SortOption>(SortOption.UPTIME);
  const [totalNodes, setTotalNodes] = useState<number | null>(null);
  const [now, setNow] = useState<number>(Date.now());
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    if (typeof window === 'undefined') return 'dark';
    const stored = window.localStorage.getItem('xan-theme');
    return stored === 'light' || stored === 'dark' ? stored : 'dark';
  });

  const fetchAllNodes = useCallback(async () => {
    // 1. Attempt discovery via get-pods on a seed pRPC node
    const seedIp = NODE_IPS[0];
    const podsResult = await fetchPodsFromSeed(seedIp);

    if (podsResult) {
      setTotalNodes(podsResult.total_count);
    }

    const discoveredIps = podsResult
      ? podsResult.pods.map(p => p.address.split(':')[0])
      : [];

    // 2. Merge discovered IPs with the known open pRPC IP list
    const uniqueIps = Array.from(new Set([...NODE_IPS, ...discoveredIps]));

    // 3. Fetch detailed stats for each node
    const promises = uniqueIps.map(ip => fetchNodeInfo(ip));
    const results = await Promise.all(promises);
    setNodes(results);
    setLastRefreshed(new Date());
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchAllNodes();
    const interval = setInterval(fetchAllNodes, REFRESH_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [fetchAllNodes]);

  // Apply theme to body element
  useEffect(() => {
    if (typeof document === 'undefined') return;
    document.body.classList.remove('theme-dark', 'theme-light');
    document.body.classList.add(theme === 'dark' ? 'theme-dark' : 'theme-light');
    window.localStorage.setItem('xan-theme', theme);
  }, [theme]);

  // Lightweight timer to show countdown to next refresh
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  // Aggregate Stats
  const onlineNodes = nodes.filter(n => n.status === 'online');
  const totalStorage = onlineNodes.reduce((acc, curr) => acc + (curr.stats?.file_size || 0), 0);
  const avgCpu = onlineNodes.length > 0 
    ? onlineNodes.reduce((acc, curr) => acc + (curr.stats?.cpu_percent || 0), 0) / onlineNodes.length 
    : 0;
  const totalActiveStreams = onlineNodes.reduce((acc, curr) => acc + (curr.stats?.active_streams || 0), 0);

  const activeNodesSubtext = totalNodes !== null
    ? `Responding via JSON-RPC • Gossip total: ${totalNodes}`
    : 'Responding via JSON-RPC';

  const secondsUntilRefresh = lastRefreshed
    ? Math.max(
        0,
        Math.floor(REFRESH_INTERVAL_MS / 1000 - (now - lastRefreshed.getTime()) / 1000)
      )
    : null;

  return (
    <div className="min-h-screen bg-xan-900 text-gray-200 font-sans pb-20">
      {/* Header */}
      <header className="bg-xan-900 border-b border-xan-800 sticky top-0 z-50 backdrop-blur-md bg-opacity-80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="h-8 w-8 bg-gradient-to-br from-xan-400 to-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-cyan-500/20">
              <span className="font-bold text-white text-lg">X</span>
            </div>
            <h1 className="text-xl font-bold tracking-tight text-white">
              Xandeum <span className="text-xan-400 font-normal">Analytics</span>
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="relative inline-flex h-7 w-12 items-center rounded-full bg-xan-700/60 border border-xan-700 hover:border-xan-500 transition-colors duration-300"
            >
              <span
                className={`inline-flex h-5 w-5 transform rounded-full bg-white shadow-md transition-transform duration-300 ease-out ${
                  theme === 'dark' ? 'translate-x-1' : 'translate-x-6'
                }`}
              />
              <span className="absolute left-1.5 text-[10px] font-mono text-gray-500 select-none">
                ☾
              </span>
              <span className="absolute right-1.5 text-[10px] font-mono text-gray-500 select-none">
                ☀
              </span>
            </button>
            <div className="text-right">
             <div className="text-xs text-gray-500 uppercase font-semibold">Network Status</div>
             <div className="flex items-center justify-end gap-2">
                <span className={`inline-block w-2 h-2 rounded-full ${loading ? 'bg-yellow-500 animate-pulse' : 'bg-green-500'}`}></span>
                <span className="text-sm font-mono text-gray-300">
                    {loading ? 'SYNCING...' : 'LIVE'}
                </span>
                {secondsUntilRefresh !== null && !loading && (
                  <span className="text-[10px] font-mono text-gray-500">
                    next refresh in {secondsUntilRefresh}s
                  </span>
                )}
             </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 transition-colors duration-500">
        {/* Global Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard 
            title="Active Nodes" 
            value={<span>{onlineNodes.length} <span className="text-lg text-gray-500">/ {NODE_IPS.length}</span></span>} 
            icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>}
            subtext={activeNodesSubtext}
          />
          <StatCard 
            title="Network Storage" 
            value={<FormatBytes bytes={totalStorage} />} 
            icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" /></svg>}
            subtext="Total capacity across active nodes"
          />
           <StatCard 
            title="Avg CPU Load" 
            value={<span>{avgCpu.toFixed(2)}%</span>} 
            icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" /></svg>}
            subtext="Average processing utilization"
          />
          <StatCard 
            title="Active Streams" 
            value={totalActiveStreams} 
            icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>}
            subtext="Current data transmission count"
          />
        </div>

        {/* Charts Section */}
        <NetworkCharts nodes={nodes} />

        {/* Main Node List */}
        <NodeList nodes={nodes} sortOption={sortOption} setSortOption={setSortOption} />

        {/* Footer info */}
        <div className="mt-8 text-center text-xs text-gray-600">
            <p>Data refreshing every {REFRESH_INTERVAL_MS/1000} seconds.</p>
            {lastRefreshed && <p>Last updated: {lastRefreshed.toLocaleTimeString()}</p>}
            <p className="mt-2 text-yellow-700/50">Note: Ensure your browser allows mixed content if connecting to HTTP nodes from an HTTPS host.</p>
        </div>
      </main>
    </div>
  );
};

export default App;