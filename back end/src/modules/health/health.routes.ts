import { Router } from 'express';
import net from 'node:net';

const router = Router();

function testSocket(host: string, port: number, timeoutMs = 7000): Promise<{ host: string; port: number; reachable: boolean }> {
  return new Promise((resolve) => {
    const socket = net.connect({ host, port, family: 4 });
    const timer = setTimeout(() => {
      socket.destroy();
      resolve({ host, port, reachable: false });
    }, timeoutMs);
    socket.on('connect', () => {
      clearTimeout(timer);
      socket.destroy();
      resolve({ host, port, reachable: true });
    });
    socket.on('error', () => {
      clearTimeout(timer);
      resolve({ host, port, reachable: false });
    });
  });
}

router.get('/egress', async (_req, res) => {
  const targets = [
    { host: 'smtp.gmail.com', port: 465 },
    { host: 'smtp.gmail.com', port: 587 },
    { host: 'smtp.gmail.com', port: 25 },
    { host: 'smtp-relay.google.com', port: 587 },
    { host: 'smtp.sendgrid.net', port: 587 },
    { host: 'smtp.mailgun.org', port: 587 },
    { host: 'api.resend.com', port: 443 },
    { host: 'aws-0-us-west-2.pooler.supabase.com', port: 5432 },
  ];
  const results = await Promise.all(targets.map((t) => testSocket(t.host, t.port)));
  res.json({ ts: new Date().toISOString(), results });
});

export default router;