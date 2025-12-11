import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell, PieChart, Pie } from 'recharts';
import { NodeData } from '../types';

interface NetworkChartsProps {
  nodes: NodeData[];
}

export const NetworkCharts: React.FC<NetworkChartsProps> = ({ nodes }) => {
  const onlineNodes = nodes.filter(n => n.status === 'online' && n.stats);
  
  // Data for CPU Load Distribution
  const cpuData = onlineNodes.map(node => ({
    name: node.ip.split('.').slice(-1)[0], // Just last octet for brevity
    load: node.stats?.cpu_percent || 0,
    fullIp: node.ip
  })).sort((a, b) => b.load - a.load);

  // Data for Storage Distribution
  const storageData = onlineNodes.map(node => ({
    name: node.ip,
    value: (node.stats?.file_size || 0) / (1024 * 1024 * 1024), // GB
  }));

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-xan-900 border border-xan-700 p-2 rounded shadow-xl text-xs">
          <p className="text-xan-300 font-mono mb-1">{label || payload[0].payload.fullIp}</p>
          <p className="text-white">
            {payload[0].value.toFixed(2)} 
            {payload[0].name === 'load' ? '%' : ' GB'}
          </p>
        </div>
      );
    }
    return null;
  };

  if (onlineNodes.length === 0) return null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
      <div className="bg-xan-800 border border-xan-700 rounded-lg p-4 shadow-lg">
        <h3 className="text-gray-300 text-sm font-semibold mb-4 uppercase">CPU Load (%) per Node</h3>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={cpuData} margin={{ top: 5, right: 5, bottom: 5, left: -20 }}>
              <XAxis dataKey="name" tick={{fill: '#64748b', fontSize: 10}} interval={0} />
              <YAxis tick={{fill: '#64748b', fontSize: 10}} />
              <Tooltip content={<CustomTooltip />} cursor={{fill: '#334155', opacity: 0.4}} />
              <Bar dataKey="load" radius={[4, 4, 0, 0]}>
                {cpuData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.load > 80 ? '#ef4444' : '#06b6d4'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-xan-800 border border-xan-700 rounded-lg p-4 shadow-lg">
        <h3 className="text-gray-300 text-sm font-semibold mb-4 uppercase">Network Storage Share</h3>
        <div className="h-64 w-full flex items-center justify-center">
             <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                        data={storageData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        fill="#8884d8"
                        paddingAngle={5}
                        dataKey="value"
                    >
                        {storageData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={`hsl(${180 + (index * 20)}, 70%, 50%)`} stroke="transparent" />
                        ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                </PieChart>
             </ResponsiveContainer>
        </div>
        <div className="text-center text-xs text-gray-500 mt-2">Distribution of stored data across pNodes</div>
      </div>
    </div>
  );
};