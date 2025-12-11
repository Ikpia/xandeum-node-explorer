# Xandeum pNode Analytics Dashboard

A web-based analytics platform for **Xandeum pNodes**, inspired by Solana validator dashboards like stakewiz.com or validators.app.

It connects to public pNodes over **pRPC** and visualizes key metrics such as CPU, RAM, storage usage, uptime, network packets, and latency. It also uses gossip via `get-pods` / `get-pods-with-stats` to discover additional pNodes and estimate total network size.

---

## What this dashboard does

- Discovers pNodes from gossip using pRPC calls to public pNodes.
- Fetches detailed stats for each reachable node via `get-stats` (and `get-pods-with-stats` where supported).
- Presents a clear, auto-refreshing view of network health with:
	- Per-node CPU, RAM, storage, packets, uptime, and latency.
	- Aggregated stats (active nodes, total storage, average CPU, active streams).
	- Visual charts for CPU load and storage distribution.
- Provides a polished **light/dark theme toggle**, subtle animations, and search/filter tools for better UX.


---

## pRPC methods used

The app interacts with pNodes exclusively through documented pRPC methods:

- `get-pods` – base gossip discovery of pNodes.
- `get-pods-with-stats` – richer gossip view (when available on v0.7.0+ nodes).
- `get-stats` – detailed metrics for a single pNode.


---

## How node discovery works

The node list is built in two steps:

1. **Static seed pNodes** – A set of known public pRPC IPs is defined in `constants.ts` (`NODE_IPS`). These are provided by the Xandeum team.
2. **Gossip discovery via pRPC** – At runtime, the app:
	 - Calls `get-pods-with-stats` (or `get-pods`) on a seed pNode.
	 - Extracts `ip:port` addresses for all pods.
	 - Merges the discovered IPs with `NODE_IPS` and removes duplicates.

The resulting IP list is then used to fetch per-node stats with `get-stats`. A gossip `total_count` is also surfaced in the UI as “Gossip total: N”.

---

## Local development

**Prerequisites**

- Node.js (LTS recommended)

Clone the repo and install dependencies:

```bash
npm install
```

### Option 1 – Dev with local proxy (recommended)

This uses the Express proxy in `server.mjs` plus Vite’s dev server.

In **terminal 1**, start the pRPC proxy:

```powershell
cd C:\Users\USER1\Downloads\Ubuntu\xandeum-node-explorer
npm run server
```

In **terminal 2**, start Vite dev:

```powershell
cd C:\Users\USER1\Downloads\Ubuntu\xandeum-node-explorer
npm run dev
```

Then open the URL printed by Vite (typically `http://localhost:3000`).

The frontend will call `/api/node-info/:ip` and `/api/pods-from-seed/:ip`, which Vite proxies to `http://localhost:4000` where the Express proxy talks to pNodes via `xandeum-prpc`.

### Option 2 – Vercel-style API routes only

For Vercel deployment, equivalent handlers are provided under:

- `api/node-info/[ip].ts`
- `api/pods-from-seed/[ip].ts`

On Vercel, these become serverless endpoints at `/api/node-info/:ip` and `/api/pods-from-seed/:ip` with no need for the standalone Express server.

---

## Production build

Create an optimized production bundle:

```bash
npm run build
```

The static assets are emitted to `dist/`. You can preview the production build locally with:

```bash
npm run preview
```

---

## Deployed to Vercel

You can view the explorer via the deployed link `https://xandeum-node-explorer.vercel.app` and wait for 5 seconds for everything to completely load

---

## Configuration

- **`constants.ts`**
	- `NODE_IPS`: seed public pRPC IPs.
	- `RPC_PORT`: expected pRPC port (currently `6000`).
	- `REFRESH_INTERVAL_MS`: auto-refresh interval (default: 10 seconds).

- **`services/rpcService.ts`**
	- `fetchNodeInfo(ip)`: calls `/api/node-info/:ip` and converts results into `NodeData` used by the UI.
	- `fetchPodsFromSeed(ip)`: calls `/api/pods-from-seed/:ip` for gossip discovery.

To point the dashboard at different networks or seed nodes, adjust `NODE_IPS` and (if necessary) `RPC_PORT`.

---

## UX and visualization details

- **Global stat cards** for Active Nodes, Network Storage, Avg CPU Load, and Active Streams.
- **Node table** with:
	- Status indicator (online/offline/private-timeout).
	- CPU%, RAM used/total, storage, packets, uptime.
	- Latency badge colored by severity.
	- Search by IP / error and filters for All / Online / Offline.
- **Charts** (Recharts) for CPU load per node and storage share across pNodes.
- **Live feel**:
	- Auto-refresh with a countdown timer to next refresh.
	- Light/dark theme toggle with smooth transitions.
	- Subtle hover animations on cards and table rows.
