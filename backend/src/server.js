// ...existing code...
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../../.env') });
console.log('DATABASE_URL:', process.env.DATABASE_URL);
console.log('JWT_SECRET loaded:', process.env.JWT_SECRET ? 'Yes' : 'No');

import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import pkg from 'pg';
const { Pool } = pkg;
import fs from 'fs/promises';
import fsSync from 'fs';
import { parse as csvParse } from 'csv-parse';
import cors from 'cors';

const app = express();

// Enable CORS for all routes
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175', 'http://localhost:5176'], // Frontend URLs
  credentials: true
}));

app.use(express.json());

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

// Test database connection on startup
async function testDatabaseConnection() {
    try {
        const client = await pool.connect();
        console.log('✅ Database connected successfully');
        client.release();
        return true;
    } catch (error) {
        console.error('❌ Database connection failed:', error.message);
        console.log('📝 Please check your DATABASE_URL in .env file');
        console.log('📖 See DATABASE_SETUP.md for setup instructions');
        return false;
    }
}

const isDatabaseConnected = await testDatabaseConnection();

// Apply SQL schema files on startup so schema is created automatically
async function applySchemas() {
    if (!isDatabaseConnected) {
        console.log('⚠️ Skipping schema application - database not connected');
        return;
    }
    
    try {
        const base = path.resolve('./'); // current backend directory
        const files = ['schema.sql', 'bookmarks.sql'];
        for (const file of files) {
            const filePath = path.join(base, file);
            try {
                console.log('Applying schema file:', filePath);
                const sql = await fs.readFile(filePath, 'utf8');
                if (!sql.trim()) {
                    console.warn(`Schema file ${file} is empty, skipping.`);
                    continue;
                }
                // Execute the whole SQL file as a single query (pg supports multiple statements)
                await pool.query(sql);
                console.log(`Applied schema: ${file}`);
            } catch (err) {
                // If file not found, skip with a warning; otherwise show error
                if (err.code === 'ENOENT') {
                    console.warn(`Schema file not found: ${filePath}`);
                } else {
                    console.error(`Error applying schema ${file}:`, err);
                }
            }
        }
    } catch (err) {
        console.error('applySchemas error:', err);
    }
}

// Run schema application before accepting requests
await applySchemas();

// JWT authentication middleware
function authenticateToken(req, res, next) {
    console.log('🔍 Auth middleware - Headers:', req.headers.authorization);
    
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    console.log('🔍 Auth middleware - Token extracted:', token ? 'Yes' : 'No');
    console.log('🔍 Auth middleware - Token length:', token ? token.length : 'N/A');
    console.log('🔍 Auth middleware - JWT_SECRET exists:', process.env.JWT_SECRET ? 'Yes' : 'No');
    
    if (!token) return res.status(401).json({ error: 'No token provided' });
    
    // First try to verify with our JWT_SECRET (custom tokens)
    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (!err) {
            console.log('✅ JWT verification successful with custom secret, user:', user);
            req.user = user;
            return next();
        }
        
        console.log('⚠️ Custom JWT verification failed, trying Supabase token validation...');
        
        // If custom JWT fails, check if it's a Supabase token
        try {
            // Decode without verification to check if it's a Supabase token
            const decoded = jwt.decode(token, { complete: true });
            console.log('🔍 Decoded token issuer:', decoded?.payload?.iss);
            
            if (decoded?.payload?.iss?.includes('supabase.co')) {
                console.log('✅ Detected Supabase token, extracting user info...');
                
                // Extract user info from Supabase token
                const user = {
                    id: decoded.payload.sub,
                    email: decoded.payload.email,
                    supabase: true
                };
                
                console.log('✅ Supabase user extracted:', user);
                req.user = user;
                return next();
            }
        } catch (decodeError) {
            console.error('❌ Token decode error:', decodeError.message);
        }
        
        console.error('❌ All JWT verification methods failed');
        return res.status(403).json({ error: 'Invalid token' });
    });
}

// Get user profile (protected)
app.get('/api/profile', authenticateToken, async (req, res) => {
    try {
        if (req.user.supabase) {
            // Handle Supabase users - get from supabase_user_profiles table
            console.log('🔍 Fetching Supabase user profile...');
            
            const result = await pool.query(
                'SELECT id, email, name, phone, city, profession, company, created_at FROM supabase_user_profiles WHERE id = $1', 
                [req.user.id]
            );
            
            if (result.rows.length === 0) {
                // If no profile exists yet, return basic user info
                console.log('ℹ️ No profile found for Supabase user, returning basic info');
                return res.json({ 
                    user: {
                        id: req.user.id,
                        email: req.user.email,
                        name: '',
                        phone: '',
                        city: '',
                        profession: '',
                        company: ''
                    }
                });
            }
            
            console.log('✅ Supabase user profile retrieved:', result.rows[0]);
            res.json({ user: result.rows[0] });
        } else {
            // Handle regular users
            const result = await pool.query(
                'SELECT id, name, email, phone, city, profession, company, created_at FROM users WHERE id = $1', 
                [req.user.id]
            );
            if (result.rows.length === 0) return res.status(404).json({ error: 'User not found' });
            res.json({ user: result.rows[0] });
        }
    } catch (err) {
        console.error('Profile error:', err);
        res.status(500).json({ error: 'Failed to fetch profile' });
    }
});

// Get all bookmarks for the authenticated user
app.get('/api/bookmarks', authenticateToken, async (req, res) => {
    console.log('GET /api/bookmarks headers:', req.headers);
    try {
        const result = await pool.query(
            'SELECT id, service_id, created_at FROM bookmarks WHERE user_id = $1',
            [req.user.id]
        );
        res.json({ bookmarks: result.rows });
    } catch (err) {
        console.error('Get bookmarks error:', err);
        res.status(500).json({ error: 'Failed to fetch bookmarks' });
    }
});

// Add a bookmark
app.post('/api/bookmarks', authenticateToken, async (req, res) => {
    console.log('POST /api/bookmarks headers:', req.headers);
    console.log('POST /api/bookmarks body:', req.body);
    const { service_id } = req.body;
    if (!service_id) return res.status(400).json({ error: 'service_id is required' });
    try {
        const result = await pool.query(
            'INSERT INTO bookmarks (user_id, service_id) VALUES ($1, $2) RETURNING id, service_id, created_at',
            [req.user.id, service_id]
        );
        console.log('Inserted bookmark:', result.rows[0]);
        res.status(201).json({ bookmark: result.rows[0] });
    } catch (err) {
        console.error('Add bookmark error:', err);
        res.status(500).json({ error: 'Failed to add bookmark' });
    }
});

// Remove a bookmark
app.delete('/api/bookmarks/:id', authenticateToken, async (req, res) => {
    console.log('DELETE /api/bookmarks headers:', req.headers);
    console.log('DELETE /api/bookmarks params:', req.params);
    const { id } = req.params;
    try {
        const del = await pool.query('DELETE FROM bookmarks WHERE id = $1 AND user_id = $2 RETURNING id', [id, req.user.id]);
        console.log('Delete result:', del.rows);
        res.json({ success: true });
    } catch (err) {
        console.error('Delete bookmark error:', err);
        res.status(500).json({ error: 'Failed to delete bookmark' });
    }
});

// Service search route (public, stub)
app.get('/api/services', async (req, res) => {
    // TODO: Implement service search from DB
    res.json({ services: [] });
});

// Serve tiffin_rental CSV as JSON
app.get('/api/tiffin-rental', async (req, res) => {
    try {
        // Prefer public copy so frontend can fetch directly during dev
        const candidates = [
            path.join(path.resolve('../'), 'public', 'data', 'Food', 'tifin_rental.csv'),
            path.join(path.resolve('../'), 'public', 'data', 'Food', 'tiffin_rental.csv'),
            path.join(path.resolve('../'), 'dist', 'data', 'Food', 'tifin_rental.csv'),
            path.join(path.resolve('../'), 'dist', 'data', 'Food', 'tiffin_rental.csv'),
            path.join(path.resolve('../'), 'dist', 'food', 'tifin_rental.csv'),
            path.join(path.resolve('../'), 'dist', 'food', 'tiffin_rental.csv'),
        ];

        let csvPath = null;
        for (const p of candidates) {
            if (fsSync.existsSync(p)) {
                csvPath = p;
                break;
            }
        }

        if (!csvPath) {
            console.warn('tiffin_rental.csv not found in candidate locations');
            return res.status(404).json({ error: 'tiffin_rental.csv not found' });
        }

        const raw = await fs.readFile(csvPath, 'utf8');
        csvParse(raw, { columns: true, skip_empty_lines: true }, (err, records) => {
            if (err) {
                console.error('CSV parse error:', err);
                return res.status(500).json({ error: 'Failed to parse CSV' });
            }
            res.json(records);
        });
    } catch (err) {
        console.error('Tiffin rental endpoint error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Registration endpoint
app.post('/api/register', async (req, res) => {
    if (!isDatabaseConnected) {
        return res.status(503).json({ error: 'Database not available. Please check server configuration.' });
    }
    
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
        return res.status(400).json({ error: 'All fields are required.' });
    }
    try {
        const userExists = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
        if (userExists.rows.length > 0) {
            return res.status(409).json({ error: 'Email already registered.' });
        }
        const password_hash = await bcrypt.hash(password, 12);
        const result = await pool.query(
            'INSERT INTO users (name, email, password_hash) VALUES ($1, $2, $3) RETURNING id, name, email, phone, city, profession, company, created_at',
            [name, email, password_hash]
        );
        const user = result.rows[0];
        const token = jwt.sign(
            { id: user.id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );
        res.status(201).json({ 
            token, 
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                city: user.city,
                profession: user.profession,
                company: user.company
            }
        });
    } catch (err) {
        console.error('Registration error:', err);
        res.status(500).json({ error: 'Registration failed.' });
    }
});

// Sign-in endpoint
app.post('/api/login', async (req, res) => {
    if (!isDatabaseConnected) {
        return res.status(503).json({ error: 'Database not available. Please check server configuration.' });
    }
    
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required.' });
    }
    try {
        const user = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        if (user.rows.length === 0) {
            return res.status(401).json({ error: 'Invalid credentials.' });
        }
        const valid = await bcrypt.compare(password, user.rows[0].password_hash);
        if (!valid) {
            return res.status(401).json({ error: 'Invalid credentials.' });
        }
        
        console.log('🔍 Login - JWT_SECRET for token generation:', process.env.JWT_SECRET ? 'Exists' : 'Missing');
        const tokenPayload = { id: user.rows[0].id, email: user.rows[0].email };
        console.log('🔍 Login - Token payload:', tokenPayload);
        
        const token = jwt.sign(
            tokenPayload,
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );
        
        console.log('🔍 Login - Generated token length:', token.length);
        console.log('🔍 Login - Generated token (first 50 chars):', token.substring(0, 50));
        
        res.json({ 
            token, 
            user: { 
                id: user.rows[0].id, 
                name: user.rows[0].name, 
                email: user.rows[0].email,
                phone: user.rows[0].phone,
                city: user.rows[0].city,
                profession: user.rows[0].profession,
                company: user.rows[0].company
            } 
        });
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ error: 'Login failed.' });
    }
});

// Update user profile endpoint
app.put('/api/profile', authenticateToken, async (req, res) => {
    if (!isDatabaseConnected) {
        return res.status(503).json({ error: 'Database not available. Please check server configuration.' });
    }
    
    const { name, phone, city, profession, company } = req.body;
    const userId = req.user.id;
    
    console.log('🔍 Profile update - User ID:', userId);
    console.log('🔍 Profile update - Is Supabase user:', req.user.supabase ? 'Yes' : 'No');
    console.log('🔍 Profile update - Data:', { name, phone, city, profession, company });
    
    try {
        if (req.user.supabase) {
            // Handle Supabase users - store in supabase_user_profiles table
            console.log('🔍 Handling Supabase user profile update...');
            
            // Use UPSERT (INSERT ... ON CONFLICT) to either create or update the profile
            const result = await pool.query(`
                INSERT INTO supabase_user_profiles (id, email, name, phone, city, profession, company, updated_at)
                VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_TIMESTAMP)
                ON CONFLICT (id) 
                DO UPDATE SET 
                    name = EXCLUDED.name,
                    phone = EXCLUDED.phone,
                    city = EXCLUDED.city,
                    profession = EXCLUDED.profession,
                    company = EXCLUDED.company,
                    updated_at = CURRENT_TIMESTAMP
                RETURNING id, email, name, phone, city, profession, company
            `, [userId, req.user.email, name, phone, city, profession, company]);
            
            console.log('✅ Supabase user profile stored in database');
            
            res.json({ 
                message: 'Profile updated successfully',
                user: result.rows[0]
            });
        } else {
            // Handle regular users
            const result = await pool.query(
                'UPDATE users SET name = $1, phone = $2, city = $3, profession = $4, company = $5, updated_at = CURRENT_TIMESTAMP WHERE id = $6 RETURNING id, name, email, phone, city, profession, company',
                [name, phone, city, profession, company, userId]
            );
            
            if (result.rows.length === 0) {
                return res.status(404).json({ error: 'User not found.' });
            }
            
            res.json({ 
                message: 'Profile updated successfully',
                user: result.rows[0]
            });
        }
    } catch (err) {
        console.error('Profile update error:', err);
        res.status(500).json({ error: 'Failed to update profile.' });
    }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    console.log(`Backend running on port ${PORT}`);
});
