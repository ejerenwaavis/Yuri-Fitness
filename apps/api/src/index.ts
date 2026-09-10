import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import apiRoutes from './routes/api';
import stripeRoutes from './routes/stripe';
import authRoutes from './routes/auth';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Connect to MongoDB
const connectDB = async () => {
  try {
    const uri = process.env.MONGODB_URI;
    if (!uri) throw new Error('MONGODB_URI is undefined');
    
    await mongoose.connect(uri);
    console.log('[API] Successfully connected to MongoDB');
  } catch (error) {
    console.error('[API] Error connecting to MongoDB:', error);
    process.exit(1);
  }
};

// Use CORS for our frontend requests
app.use(cors({ origin: ['http://localhost:5173', 'https://yurifitness.aceddivision.com'] }));

// Stripe webhook needs raw body, not JSON
app.use('/stripe/webhook', express.raw({ type: 'application/json' }));

app.use(express.json());

// Routes
app.use('/auth', authRoutes);
app.use('/api', apiRoutes);
app.use('/stripe', stripeRoutes);

// Add simple health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Start Server
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`[API] Server is running on port ${PORT}`);
  });
});
