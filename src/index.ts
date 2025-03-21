import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import { withAccelerate } from '@prisma/extension-accelerate';
import { config } from './config/env';
import logger from './utils/logger';
import { errorHandler } from './middleware/errorHandler';
import expressRateLimit from 'express-rate-limit';
import helmet from 'helmet';
import { v4 as uuidv4 } from 'uuid';

// Import routes
// import authRoutes from './routes/authRoutes';
// import adminRoutes from './routes/adminRoutes';

const app = express();

// Middleware
app.use(cors({ origin: config.corsOrigin }));
app.use(express.json());
app.use(helmet());
app.use(expressRateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 30, // Limit each IP to 30 requests per windowMs
}));

// Initialize Prisma client
export const prisma = new PrismaClient().$extends(withAccelerate());

// Mount routes
// app.use('/api/v1/auth', authRoutes);
// app.use('/api/v1/admin', adminRoutes);

// Keep your existing public routes

// ✅ Fetch all events by category
app.get('/api/v1/events', async (req: any, res: any) => {
  const { cid } = req.query;
  if (!cid) return res.status(400).json({ Message: "Category ID (cid) is required!" });
  console.log("Received Category ID:", cid);
  try {
    const events = await prisma.events.findMany({
      where: { cid: parseInt(cid, 10) }
    });
    return res.json(events);
  } catch (err) {
    return res.status(500).json({ Message: "ERROR INSIDE SERVER", Error: err });
  }
});

// ✅ Fetch a single event by ID
app.get('/api/v1/events/:eventId', async (req: any, res: any) => {
  const { eventId } = req.query;

  try {
    const event = await prisma.events.findUnique({
      where: { eid: parseInt(eventId, 10) }
    });
    if (!event) return res.status(404).json({ Message: "Event Not Found" });
    return res.json(event);
  } catch (err) {
    return res.status(500).json({ Message: "Error fetching event details" });
  }
});

// ✅ Fetch all branches
app.get('/api/v1/branches', async (req: any, res: any) => {
  try {
    const branches = await prisma.branch.findMany({
      select: { bid: true, bname: true }
    });
    res.json(branches);
  } catch (err) {
    console.error("Database Error:", err);
    return res.status(500).json({ message: "Error fetching branches" });
  }
});

// ✅ Fetch events by branch ID
app.get('/api/v1/branches/:branchId', async (req: any, res: any) => {
  const { branchId } = req.params;
  try {
    const events = await prisma.events.findMany({
      where: { bid: parseInt(branchId, 10) }
    });
    if (events.length === 0) return res.status(404).json({ message: "No events found for this branch." });
    return res.json(events);
  } catch (err) {
    return res.status(500).json({ message: "Error fetching events" });
  }
});

// ✅ Handle event registration
app.post('/api/v1/register', async (req: any, res: any) => {
  // console.log("Received Data:", req.body);
  const { name, email, phone, eventId } = req.body;

  if (!name || !email || !phone || !eventId) {
    return res.status(400).json({ Message: "All fields are required!" });
  }

  try {
    // ✅ Fetch event details (unique_code, bid, cid)
    const event = await prisma.events.findUnique({
      where: { eid: parseInt(eventId, 10) },
      select: { unique_code: true, bid: true, cid: true, ename: true }
    });

    if (!event) {
      // console.warn(`⚠️ Event with ID ${eventId} not found.`);
      return res.status(404).json({ Message: "Event not found" });
    }

    const eventUniqueCode = event.unique_code;
    const branchId = event.bid || null;
    const eventName = event.ename;
    const categoryId = event.cid;

    function generateUniqueId() {
      return `INS-${eventUniqueCode}-${uuidv4().split('-')[0]}`;
  }

    let registrationCode = generateUniqueId();

    // ✅ Check for duplicate unique ID
    const existing = await prisma.registrations.findUnique({
      where: { unique_id: registrationCode }
    });

    // Generate a new one if duplicate found
    if (existing) {
      // console.warn("⚠️ Duplicate ID found, generating new...");
      registrationCode = generateUniqueId();
    }

    // ✅ Insert Registration (Now includes `category_id`)
    const registrationData: any = {
      name,
      email,
      phone,
      event_id: parseInt(eventId, 10),
      unique_id: registrationCode,
      category_id: categoryId!
    };

    if (branchId) {
      registrationData.branch_id = branchId;
    }

    const registration = await prisma.registrations.create({
      data: registrationData
    });

    console.log("✅ Insert Successful:", registration);
    res.json({ Message: true, regCode: registrationCode, eventName, name, categoryId }); // ✅ Include categoryId in response
  } catch (err) {
    // console.error("❌ Database Error:", err);
    return res.status(500).json({ Message: "Error registering user" });
  }
});

// Add events as admin
app.post('/api/v1/events/add', adminAuth, async (req: any, res: any) => {
  const { ename, cid, bid, unique_code, description, venue, timing, date, event_type } = req.body;

  if (!ename || !cid || !bid || !unique_code || !description || !venue || !timing || !date || !event_type) {
    return res.status(400).json({ Message: "All fields are required!" });
  }

  try {
    const event = await prisma.events.create({
      data: {
        ename,
        cid,
        bid,
        unique_code,
        description,
        venue,
        timing: new Date(timing),
        date: new Date(date),
        event_type
      }
    });

    res.json({ Message: true, event });
  } catch (err) {
    console.error("❌ Database Error:", err);
    return res.status(500).json({ Message: "Error adding event" });
  }
});

// ✅ Fetch all registrations
app.get('/api/v1/registrations', adminAuth, async (req: any, res: any) => {
  try {
    const registrations = await prisma.registrations.findMany({
      include: {
        event: {
          select: { ename: true }
        }
      }
    });
    res.json(registrations);
  } catch (err) {
    console.error("❌ Database Error:", err);
    return res.status(500).json({ Message: "Error fetching registrations" });
  }
});
// ✅ Fetch registrations by event ID
app.get('/api/v1/registrations/:eventId', adminAuth, async (req: any, res: any) => {
  const { eventId } = req.params;
  if (!eventId) return res.status(400).json({ Message: "Event ID is required!" });
  try {
    const registrations = await prisma.registrations.findMany({
      where: { event_id: parseInt(eventId, 10) },
      include: {
        event: {
          select: { ename: true }
        }
      }
    });
    if (registrations.length === 0) return res.status(404).json({ Message: "No registrations found for this event." });
    res.json(registrations);
  } catch (err) {
    console.error("❌ Database Error:", err);
    return res.status(500).json({ Message: "Error fetching registrations" });
  }
});

async function adminAuth(req: any, res: any, next: any) {
  const { username, password } = req.body;
  const adminUsername = config.adminUsername;
  const adminPassword = config.adminPassword;
  if (!username || !password) {
    return res.status(400).json({ Message: "Username and password are required!" });
  }
  if (username !== adminUsername || password !== adminPassword) {
    console.warn("⚠️ Unauthorized access attempt.");
    // Log the unauthorized access attempt
    logger.warn(`Unauthorized access attempt with username: ${username}`);
    // Optionally, you can also log the IP address
    return res.status(403).json({ Message: "Forbidden" });
  }
  next();
}

// Error handling middleware (should be last)
app.use(errorHandler);

// Start Server
async function startServer() {
  try {
    // Connect to Prisma before starting server
    await prisma.$connect();
    logger.info('Connected to database');
    
    app.listen(config.port, () => {
      logger.info(`Server running on port ${config.port} in ${config.nodeEnv} mode`);
    });
  } catch (err) {
    logger.error(`Failed to start server: ${err}`);
    process.exit(1);
  }
}

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  logger.error('UNCAUGHT EXCEPTION! 💥 Shutting down...');
  logger.error(err.name, err.message);
  process.exit(1);
});

startServer();