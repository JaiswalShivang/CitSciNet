import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import { v2 as cloudinary } from 'cloudinary';
import multer from 'multer';

dotenv.config();

// Cloudinary config
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'demo',
    api_key: process.env.CLOUDINARY_API_KEY || '',
    api_secret: process.env.CLOUDINARY_API_SECRET || '',
});

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

const app = express();
const httpServer = createServer(app);
const prisma = new PrismaClient();

const io = new Server(httpServer, {
    cors: {
        origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
        methods: ['GET', 'POST'],
        credentials: true
    }
});

app.use(cors({
    origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
    credentials: true
}));
app.use(helmet({ contentSecurityPolicy: false }));
app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));

let connectedClients = 0;

io.on('connection', (socket) => {
    connectedClients++;
    console.log(`Client connected (${connectedClients} total)`);
    io.emit('client-count', connectedClients);

    socket.on('disconnect', () => {
        connectedClients--;
        console.log(`Client disconnected (${connectedClients} total)`);
        io.emit('client-count', connectedClients);
    });
});

app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        uptime: process.uptime(),
        connectedClients,
        timestamp: new Date().toISOString()
    });
});

app.get('/api/observations', async (req, res) => {
    try {
        const observations = await prisma.observation.findMany({
            orderBy: { createdAt: 'desc' },
            take: 200
        });
        res.json(observations);
    } catch (err) {
        console.error('Failed to fetch observations:', err);
        res.status(500).json({ error: 'Failed to fetch observations' });
    }
});

app.post('/api/observations', async (req, res) => {
    try {
        const {
            latitude,
            longitude,
            imageUrl,
            category,
            aiLabel,
            confidenceScore,
            userName,
            notes
        } = req.body;

        if (!latitude || !longitude || !category) {
            return res.status(400).json({ error: 'latitude, longitude, and category are required' });
        }

        const observation = await prisma.observation.create({
            data: {
                latitude: parseFloat(latitude),
                longitude: parseFloat(longitude),
                imageUrl: imageUrl || null,
                category,
                aiLabel: aiLabel || null,
                confidenceScore: confidenceScore ? parseFloat(confidenceScore) : null,
                userName: userName || 'Anonymous',
                notes: notes || null
            }
        });

        io.emit('new-observation', observation);

        res.status(201).json(observation);
    } catch (err) {
        console.error('Failed to create observation:', err);
        res.status(500).json({ error: 'Failed to create observation' });
    }
});

// ==================== UPLOAD ENDPOINT ====================

app.post('/api/upload', upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No image file provided' });
        }

        const b64 = Buffer.from(req.file.buffer).toString('base64');
        const dataURI = `data:${req.file.mimetype};base64,${b64}`;

        const result = await cloudinary.uploader.upload(dataURI, {
            folder: 'citsci-observations',
            resource_type: 'image',
            transformation: [
                { quality: 'auto', fetch_format: 'auto' },
                { width: 800, height: 600, crop: 'limit' },
            ],
        });

        res.json({
            url: result.secure_url,
            publicId: result.public_id,
            width: result.width,
            height: result.height,
        });
    } catch (err) {
        console.error('Upload failed:', err);
        // Fallback: if Cloudinary is not configured, accept base64
        if (req.body?.base64) {
            return res.json({ url: req.body.base64 });
        }
        res.status(500).json({ error: 'Upload failed' });
    }
});

// Base64 upload fallback (no Cloudinary needed)
app.post('/api/upload-base64', async (req, res) => {
    try {
        const { base64 } = req.body;
        if (!base64) return res.status(400).json({ error: 'No image data' });

        // Try Cloudinary first
        try {
            const result = await cloudinary.uploader.upload(base64, {
                folder: 'citsci-observations',
                resource_type: 'image',
                transformation: [
                    { quality: 'auto', fetch_format: 'auto' },
                    { width: 800, height: 600, crop: 'limit' },
                ],
            });
            return res.json({ url: result.secure_url });
        } catch {
            // Cloudinary not configured — just return the base64
            return res.json({ url: base64 });
        }
    } catch (err) {
        console.error('Base64 upload failed:', err);
        res.status(500).json({ error: 'Upload failed' });
    }
});

// ==================== OBSERVATION STATUS ENDPOINTS ====================

app.patch('/api/observations/:id/verify', async (req, res) => {
    try {
        const { id } = req.params;
        const { verified } = req.body;
        const observation = await prisma.observation.update({
            where: { id },
            data: { verified: verified !== undefined ? verified : true },
        });
        io.emit('observation-updated', observation);
        res.json(observation);
    } catch (err) {
        console.error('Failed to update observation:', err);
        res.status(500).json({ error: 'Failed to update observation' });
    }
});

app.delete('/api/observations/:id', async (req, res) => {
    try {
        await prisma.observation.delete({ where: { id: req.params.id } });
        io.emit('delete-observation', req.params.id);
        res.json({ success: true });
    } catch (err) {
        console.error('Failed to delete observation:', err);
        res.status(500).json({ error: 'Failed to delete observation' });
    }
});

// ==================== MISSION ENDPOINTS ====================

app.get('/api/missions', async (req, res) => {
    try {
        const missions = await prisma.mission.findMany({
            where: { active: true },
            orderBy: { createdAt: 'desc' },
            include: {
                userMissions: {
                    select: { userName: true, status: true }
                }
            }
        });
        res.json(missions);
    } catch (err) {
        console.error('Failed to fetch missions:', err);
        res.status(500).json({ error: 'Failed to fetch missions' });
    }
});

app.post('/api/missions', async (req, res) => {
    try {
        const { title, description, bountyPoints, geometry, createdBy } = req.body;

        if (!title || !geometry) {
            return res.status(400).json({ error: 'title and geometry are required' });
        }

        const mission = await prisma.mission.create({
            data: {
                title,
                description: description || null,
                bountyPoints: bountyPoints || 10,
                geometry,
                createdBy: createdBy || 'Researcher'
            }
        });

        io.emit('new-mission', mission);
        res.status(201).json(mission);
    } catch (err) {
        console.error('Failed to create mission:', err);
        res.status(500).json({ error: 'Failed to create mission' });
    }
});

app.post('/api/missions/:id/accept', async (req, res) => {
    try {
        const { userName } = req.body;
        const { id } = req.params;

        if (!userName) {
            return res.status(400).json({ error: 'userName is required' });
        }

        const userMission = await prisma.userMission.create({
            data: {
                missionId: id,
                userName,
                status: 'accepted'
            }
        });

        res.status(201).json(userMission);
    } catch (err) {
        if (err.code === 'P2002') {
            return res.status(400).json({ error: 'Mission already accepted by this user' });
        }
        console.error('Failed to accept mission:', err);
        res.status(500).json({ error: 'Failed to accept mission' });
    }
});

app.post('/api/missions/:id/complete', async (req, res) => {
    try {
        const { userName } = req.body;
        const { id } = req.params;

        if (!userName) {
            return res.status(400).json({ error: 'userName is required' });
        }

        const userMission = await prisma.userMission.updateMany({
            where: {
                missionId: id,
                userName,
                status: 'accepted'
            },
            data: {
                status: 'completed',
                completedAt: new Date()
            }
        });

        if (userMission.count === 0) {
            return res.status(404).json({ error: 'No accepted mission found for this user' });
        }

        io.emit('mission-completed', { missionId: id, userName });
        res.json({ success: true, message: 'Mission completed!' });
    } catch (err) {
        console.error('Failed to complete mission:', err);
        res.status(500).json({ error: 'Failed to complete mission' });
    }
});


const PORT = process.env.PORT || 4000;

httpServer.listen(PORT, () => {
    console.log(`CitSciNet server running on http://localhost:${PORT}`);
    console.log(`Socket.io ready for connections`);
});

process.on('SIGTERM', async () => {
    await prisma.$disconnect();
    process.exit(0);
});
