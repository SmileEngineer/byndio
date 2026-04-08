import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.routes.js';
import catalogRoutes from './routes/catalog.routes.js';
import rewardsRoutes from './routes/rewards.routes.js';
import sellerRoutes from './routes/seller.routes.js';
import ordersRoutes from './routes/orders.routes.js';
import locationRoutes from './routes/location.routes.js';
import verificationRoutes from './routes/verification.routes.js';
import paymentsRoutes from './routes/payments.routes.js';
import trainingRoutes from './routes/training.routes.js';
import supportRoutes from './routes/support.routes.js';
import returnsRoutes from './routes/returns.routes.js';
import adminRoutes from './routes/admin.routes.js';
import { runBootstrap } from './bootstrap.js';

const app = express();
const PORT = Number(process.env.API_PORT || 4000);

app.use(
  cors({
    origin: true,
    credentials: true,
  }),
);
app.use(express.json({ limit: '2mb' }));

app.get('/api/health', (_req, res) => {
  res.json({
    ok: true,
    service: 'byndio-api',
    timestamp: new Date().toISOString(),
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/catalog', catalogRoutes);
app.use('/api/rewards', rewardsRoutes);
app.use('/api/seller', sellerRoutes);
app.use('/api/orders', ordersRoutes);
app.use('/api/location', locationRoutes);
app.use('/api/verification', verificationRoutes);
app.use('/api/payments', paymentsRoutes);
app.use('/api/training', trainingRoutes);
app.use('/api/support', supportRoutes);
app.use('/api/returns', returnsRoutes);
app.use('/api/admin', adminRoutes);

app.use((error, _req, res, _next) => {
  const status = error.statusCode || 500;
  res.status(status).json({
    error: error.message || 'Unexpected server error.',
    details: error.details || undefined,
  });
});

async function start() {
  await runBootstrap();
  app.listen(PORT, () => {
    // eslint-disable-next-line no-console
    console.log(`BYNDIO API listening on http://localhost:${PORT}`);
  });
}

start().catch((error) => {
  // eslint-disable-next-line no-console
  console.error('Failed to start API:', error);
  process.exit(1);
});
