import React, { useMemo, useState } from 'react';
import { NodeData, SortOption } from '../types';
import { FormatBytes, FormatUptime, StatusIndicator } from './Formatters';

interface NodeListProps {
  nodes: NodeData[];
  sortOption: SortOption;
  setSortOption: (opt: SortOption) => void;
}

export const NodeList: React.FC<NodeListProps> = ({ nodes, sortOption, setSortOption }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'online' | 'offline'>('all');

  const filteredNodes = useMemo(() => {
    return nodes.filter((node) => {
      if (statusFilter === 'online' && node.status !== 'online') return false;
      if (statusFilter === 'offline' && node.status === 'online') return false;

      if (!searchTerm.trim()) return true;
      const term = searchTerm.toLowerCase();
      return (
        node.ip.toLowerCase().includes(term) ||
        (node.error && node.error.toLowerCase().includes(term))
      );
    });
  }, [nodes, searchTerm, statusFilter]);

  const sortedNodes = [...filteredNodes].sort((a, b) => {
    if (a.status !== 'online') return 1;
    if (b.status !== 'online') return -1;
    
    switch (sortOption) {
      case SortOption.CPU:
        return (b.stats?.cpu_percent || 0) - (a.stats?.cpu_percent || 0);
      case SortOption.RAM:
        return (b.stats?.ram_used || 0) - (a.stats?.ram_used || 0);
      case SortOption.STORAGE:
        return (b.stats?.file_size || 0) - (a.stats?.file_size || 0);
      case SortOption.UPTIME:
        return (b.stats?.uptime || 0) - (a.stats?.uptime || 0);
      case SortOption.IP:
        return a.ip.localeCompare(b.ip);
      default:
        return 0;
    }
  });

  return (
    <div className="bg-xan-800 rounded-xl border border-xan-700 overflow-hidden shadow-xl">
      <div className="p-4 border-b border-xan-700 bg-xan-900/50 flex justify-between items-center flex-wrap gap-2">
        <h2 className="text-lg font-bold text-white">Active Validators / pNodes</h2>
        <div className="flex gap-2 flex-wrap items-center">
            <input
              type="text"
              placeholder="Search IP or error..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-xan-900 border border-xan-700 text-sm text-gray-300 rounded px-3 py-1 focus:outline-none focus:border-xan-500 placeholder:text-gray-500 min-w-[160px]"
            />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as 'all' | 'online' | 'offline')}
              className="bg-xan-900 border border-xan-700 text-sm text-gray-300 rounded px-3 py-1 focus:outline-none focus:border-xan-500"
            >
              <option value="all">All nodes</option>
              <option value="online">Online only</option>
              <option value="offline">Offline only</option>
            </select>
            <select 
                value={sortOption} 
                onChange={(e) => setSortOption(e.target.value as SortOption)}
                className="bg-xan-900 border border-xan-700 text-sm text-gray-300 rounded px-3 py-1 focus:outline-none focus:border-xan-500"
            >
                <option value={SortOption.UPTIME}>Sort by Uptime</option>
                <option value={SortOption.CPU}>Sort by CPU</option>
                <option value={SortOption.RAM}>Sort by RAM</option>
                <option value={SortOption.STORAGE}>Sort by Storage</option>
                <option value={SortOption.IP}>Sort by IP</option>
            </select>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="text-xs uppercase text-gray-500 border-b border-xan-700 bg-xan-900/30">
              <th className="p-4 font-semibold">Node Status</th>
              <th className="p-4 font-semibold text-right">CPU Load</th>
              <th className="p-4 font-semibold text-right">RAM Usage</th>
              <th className="p-4 font-semibold text-right">Storage</th>
              <th className="p-4 font-semibold text-right">Network</th>
              <th className="p-4 font-semibold text-right">Uptime</th>
              <th className="p-4 font-semibold text-center">Latency</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {sortedNodes.map((node) => (
              <tr key={node.ip} className="border-b border-xan-700/50 hover:bg-xan-700/30 transition-colors">
                <td className="p-4">
                    <div className="flex items-center gap-3">
                        <StatusIndicator status={node.status} />
                        <div>
                            <div className="font-mono text-xan-300 font-medium">{node.ip}</div>
                            {node.error && (
                              <div
                                className="text-red-400 text-xs mt-0.5 max-w-[180px] truncate"
                                title={node.error}
                              >
                                {node.error.includes('Request timed out')
                                  ? 'No public pRPC (timeout)'
                                  : node.error}
                              </div>
                            )}
                            {node.stats && (
                              <div className="text-gray-500 text-xs mt-0.5">
                                Height: {node.stats.current_index.toLocaleString()}
                              </div>
                            )}
                        </div>
                    </div>
                </td>
                <td className="p-4 text-right font-mono">
                    {node.stats ? (
                        <span className={`${node.stats.cpu_percent > 80 ? 'text-red-400' : 'text-gray-200'}`}>
                            {node.stats.cpu_percent.toFixed(1)}%
                        </span>
                    ) : '-'}
                </td>
                <td className="p-4 text-right">
                    {node.stats ? (
                        <div className="flex flex-col items-end">
                            <span className="text-gray-200"><FormatBytes bytes={node.stats.ram_used} /></span>
                            <span className="text-gray-500 text-xs">of <FormatBytes bytes={node.stats.ram_total} /></span>
                        </div>
                    ) : '-'}
                </td>
                <td className="p-4 text-right text-gray-200">
                    {node.stats ? <FormatBytes bytes={node.stats.file_size} /> : '-'}
                </td>
                <td className="p-4 text-right">
                    {node.stats ? (
                        <div className="flex flex-col items-end text-xs text-gray-400">
                            <span>↓ {node.stats.packets_received.toLocaleString()} pkts</span>
                            <span>↑ {node.stats.packets_sent.toLocaleString()} pkts</span>
                        </div>
                    ) : '-'}
                </td>
                <td className="p-4 text-right text-xan-300 font-mono">
                    {node.stats ? <FormatUptime seconds={node.stats.uptime} /> : '-'}
                </td>
                <td className="p-4 text-center">
                    {node.status === 'online' ? (
                        (() => {
                          const latency = node.latency;
                          const latencyClass = latency < 400
                            ? 'bg-emerald-600 text-white'
                            : latency < 1000
                              ? 'bg-amber-500 text-white'
                              : 'bg-rose-600 text-white';

                          return (
                            <span className={`px-2 py-1 rounded text-xs font-mono ${latencyClass}`}>
                              {latency}ms
                            </span>
                          );
                        })()
                    ) : '-'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};