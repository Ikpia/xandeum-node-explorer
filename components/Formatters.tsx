import React from 'react';

export const FormatBytes: React.FC<{ bytes: number; decimals?: number }> = ({ bytes, decimals = 2 }) => {
  if (bytes === 0) return <span>0 B</span>;
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return <span>{parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} <span className="text-gray-400 text-xs">{sizes[i]}</span></span>;
};

export const FormatUptime: React.FC<{ seconds: number }> = ({ seconds }) => {
  const d = Math.floor(seconds / (3600 * 24));
  const h = Math.floor((seconds % (3600 * 24)) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  
  if (d > 0) return <span>{d}d {h}h</span>;
  if (h > 0) return <span>{h}h {m}m</span>;
  return <span>{m}m {Math.floor(seconds % 60)}s</span>;
};

export const StatusIndicator: React.FC<{ status: 'online' | 'offline' | 'loading' }> = ({ status }) => {
  if (status === 'loading') {
    return <span className="flex h-3 w-3 rounded-full bg-yellow-500 animate-pulse"></span>;
  }
  if (status === 'online') {
    return <span className="flex h-3 w-3 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]"></span>;
  }
  return <span className="flex h-3 w-3 rounded-full bg-red-500"></span>;
};