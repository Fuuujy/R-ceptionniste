import express from 'express';
import { createServer as createViteServer } from 'vite';
import { Redis } from '@upstash/redis';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());

// Upstash Redis client (lazy initialization)
let redis: Redis | null = null;
function getRedis() {
  if (!redis) {
    if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
      console.warn("Upstash Redis credentials missing. Using in-memory fallback for development.");
      return null;
    }
    redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    });
  }
  return redis;
}

// In-memory fallback if Redis is not configured yet
const fallbackCalls: any[] = [];

// SSE Clients for real-time updates
let clients: any[] = [];

// API Route: Get all calls
app.get('/api/calls', async (req, res) => {
  try {
    const r = getRedis();
    if (r) {
      // Get all calls from a sorted set, newest first
      const calls = await r.zrange('calls', 0, -1, { rev: true });
      // Upstash returns objects if they were stringified, but let's be safe
      res.json(calls);
    } else {
      res.json(fallbackCalls.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    }
  } catch (error) {
    console.error("Error fetching calls:", error);
    res.status(500).json({ error: "Failed to fetch calls" });
  }
});

// API Route: Webhook to receive new calls from AI Provider (Vapi, Retell, etc.)
app.post('/api/webhooks/calls', async (req, res) => {
  try {
    const callData = req.body;
    
    // Format the data to match our frontend Call interface
    // Note: Adapt this mapping based on your specific AI provider's payload
    const newCall = {
      id: callData.chat_id || callData.id || `call_${Date.now()}`,
      callerName: callData.prenom || callData.callerName || 'Inconnu',
      callerNumber: callData.numero || callData.callerNumber || 'Inconnu',
      date: callData.timestamp || callData.date || new Date().toISOString(),
      duration: callData.duration || 0,
      summary: callData.resume || callData.summary || 'Appel terminé.',
      probleme: callData.probleme || '',
      heure_rdv: callData.heure_rdv || null,
      transcript: callData.transcript || [],
    };

    const r = getRedis();
    if (r) {
      // Store in Redis Sorted Set, scored by timestamp
      await r.zadd('calls', { score: Date.now(), member: JSON.stringify(newCall) });
    } else {
      fallbackCalls.unshift(newCall);
    }

    // Notify all connected clients via SSE
    clients.forEach(client => client.res.write(`data: ${JSON.stringify(newCall)}\n\n`));

    res.status(200).json({ success: true, message: "Call received and saved" });
  } catch (error) {
    console.error("Webhook error:", error);
    res.status(500).json({ error: "Webhook processing failed" });
  }
});

// API Route: SSE Endpoint for real-time updates
app.get('/api/events', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  const clientId = Date.now();
  const newClient = { id: clientId, res };
  clients.push(newClient);

  req.on('close', () => {
    clients = clients.filter(client => client.id !== clientId);
  });
});

async function startServer() {
  const PORT = 3000;

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
