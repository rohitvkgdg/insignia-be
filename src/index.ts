import express from "express";
import cors from 'cors';
import redis from 'redis';
import { v4 as uuidv4 } from 'uuid';
import dotenv from 'dotenv';

const app = express();
dotenv.config();

// Middleware
// app.use(cors({ origin: 'http://sdmcetinsignia.com' }));
app.use(express.json());

// Add this middleware before your routes

// Basic Admin Auth Middleware
const adminAuth = (req: any, res: any, next: any) => {
  // Get auth header
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Basic ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  // Decode credentials
  const base64Credentials = authHeader.split(' ')[1];
  const credentials = Buffer.from(base64Credentials, 'base64').toString('utf-8');
  const [username, password] = credentials.split(':');
  
  // Check against environment variables or hardcoded admin credentials (for demo only)
  // In production, use environment variables
  const adminUsername = process.env.ADMIN_USERNAME || 'admin';
  const adminPassword = process.env.ADMIN_PASSWORD || 'adminPassword123';
  
  if (username === adminUsername && password === adminPassword) {
    next();
  } else {
    res.status(401).json({ error: 'Invalid credentials' });
  }
};

// Redis Client
const redisClient = redis.createClient({
  socket: {
    host: 'localhost',
    port: 6379,
    reconnectStrategy: (retries: number) => {
      console.log('Redis retry attempt:', retries);
      return Math.min(retries * 100, 3000);
    }
  },
  password: process.env.REDIS_PASSWORD
});

redisClient.on('error', (err) => {
  console.error('Redis error:', err);
});

redisClient.on('connect', () => {
  console.log('Redis connecting...');
});

redisClient.on('ready', () => {
  console.log('Redis connection established and ready');
});

redisClient.on('end', () => {
  console.log('Redis connection ended');
});

// Registration Endpoint
app.post('/api/register', async (req: any, res: any) => {
  const { college, usn, name, email, event, eventType } = req.body;
  
  // Validation
  if (!college || !usn || !name || !email || !event || !eventType) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  // Generate unique ID
  const userId = uuidv4();

  try {
    // Store in Redis Hash
    await redisClient.hSet(`user:${userId}`, {
      college,
      usn,
      name,
      email,
      event,
      eventType,
      id: userId,
      timestamp: new Date().toISOString()
    });

    res.status(201).json({ 
      message: 'Registration successful', 
      userId 
    });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ error: 'Database error' });
  }
});

// Add these new endpoints after your registration endpoint

// Get all registrations (admin endpoint)
app.get('/api/registrations', adminAuth , async (req: any, res: any) => {
  try {
    // Get all keys matching the pattern user:*
    const userKeys = await redisClient.keys('user:*');
    
    // If no users found
    if (!userKeys || userKeys.length === 0) {
      return res.status(200).json({ registrations: [] });
    }
    
    // Fetch all user data
    const registrations = [];
    for (const key of userKeys) {
      const userData = await redisClient.hGetAll(key);
      if (userData) {
        registrations.push(userData);
      }
    }
    
    res.status(200).json({ registrations });
  } catch (err) {
    console.error('Error fetching registrations:', err);
    res.status(500).json({ error: 'Database error' });
  }
});

// Start Server and connect to Redis
async function startServer() {
  try {
    // Connect to Redis before starting server
    console.log('Attempting to connect to Redis...');
    await redisClient.connect();
    
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  } catch (err) {
    console.error('Failed to start server:', err);
    
    // Try to reconnect without password if the error is an authentication issue
    if (String(err).includes('unauthenticated')) {
      console.log('Authentication failed, trying without password...');
      
      // Create a new client without password
      const newClient = redis.createClient({
        socket: {
          host: 'insignia-redis',
          port: 6379,
          reconnectStrategy: (retries: number) => Math.min(retries * 100, 3000)
        }
      });
      
      // Use this client instead
      Object.assign(redisClient, newClient);
      await redisClient.connect();
      
      const PORT = process.env.PORT || 3000;
      app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
      return;
    }
    
    process.exit(1);
  }
}

startServer();