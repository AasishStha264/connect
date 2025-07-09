const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const rateLimit = require('express-rate-limit');

const app = express();

// Configure CORS to allow requests from GitHub Pages
app.use(cors({
    origin: 'https://your-username.github.io' // Replace with your actual GitHub Pages URL
}));

// Apply rate limiting to prevent abuse
app.use(rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // Limit each IP to 100 requests per window
}));

app.use(express.json());

// Serve static files first
app.use(express.static('public'));

// PostgreSQL connection
const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
    ssl: { rejectUnauthorized: false }
});

// Default route
app.get('/', (req, res) => {
    res.send('GeoAnalyzer API is running.<br>Available routes:<br>/api/roads<br>/api/buildings<br>/api/hospitaa<br>/api/local<br>/api/district<br>/api/province<br>/api/test');
});

// Test endpoint for frontend
app.get('/api/test', (req, res) => {
    res.json({ message: 'Test endpoint is working' });
});

// Fetch all roads as GeoJSON
app.get('/api/roads', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT id, ST_AsGeoJSON(geom)::jsonb AS geometry
            FROM public.roads
        `);
        const geojson = {
            type: 'FeatureCollection',
            features: result.rows.map(row => ({
                type: 'Feature',
                geometry: row.geometry,
                properties: { id: row.id }
            }))
        };
        res.json(geojson);
    } catch (err) {
        console.error('Error fetching roads:', err);
        res.status(500).send('Error fetching roads');
    }
});

// Fetch all buildings as GeoJSON
app.get('/api/buildings', async (req, res) => {
    console.log('Accessing /api/buildings endpoint');
    try {
        const result = await pool.query(`
            SELECT id, ST_AsGeoJSON(geom)::jsonb AS geometry
            FROM public.buildings
        `);
        const geojson = {
            type: 'FeatureCollection',
            features: result.rows.map(row => ({
                type: 'Feature',
                geometry: row.geometry,
                properties: { id: row.id }
            }))
        };
        res.json(geojson);
    } catch (err) {
        console.error('Error fetching buildings:', err);
        res.status(500).send('Error fetching buildings');
    }
});

// Fetch all hospitals as GeoJSON
app.get('/api/hospitaa', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT id, ST_AsGeoJSON(geometry)::jsonb AS geometry, name, type
            FROM public.hospitaa
            WHERE geometry IS NOT NULL
            LIMIT 100
        `);
        const geojson = {
            type: 'FeatureCollection',
            features: result.rows.map(row => ({
                type: 'Feature',
                geometry: row.geometry,
                properties: {
                    id: row.id,
                    name: row.name,
                    type: row.type
                }
            }))
        };
        res.json(geojson);
    } catch (err) {
        console.error('Error fetching hospitals:', err.message);
        res.status(500).send('Error fetching hospitals');
    }
});

// Fetch all local units as GeoJSON
app.get('/api/local', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT id, gapa_napa AS name, ST_AsGeoJSON(geom)::jsonb AS geometry
            FROM public.local_unit
            WHERE geom IS NOT NULL
        `);
        const geojson = {
            type: 'FeatureCollection',
            features: result.rows.map(row => ({
                type: 'Feature',
                geometry: row.geometry,
                properties: {
                    id: row.id,
                    name: row.name
                }
            }))
        };
        res.json(geojson);
    } catch (err) {
        console.error('Error fetching local units:', err);
        res.status(500).send('Error fetching local units');
    }
});

// Fetch all districts as GeoJSON
app.get('/api/district', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT id, "DISTRICT" AS name, ST_AsGeoJSON(geom)::jsonb AS geometry
            FROM public."District"
            WHERE geom IS NOT NULL
        `);
        const geojson = {
            type: 'FeatureCollection',
            features: result.rows.map(row => ({
                type: 'Feature',
                geometry: row.geometry,
                properties: {
                    id: row.id,
                    name: row.name
                }
            }))
        };
        res.json(geojson);
    } catch (err) {
        console.error('Error fetching districts:', err);
        res.status(500).send('Error fetching districts');
    }
});

// Fetch all provinces as GeoJSON
app.get('/api/province', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT id, "Province" AS name, ST_AsGeoJSON(geom)::jsonb AS geometry
            FROM public.province
            WHERE geom IS NOT NULL
        `);
        const geojson = {
            type: 'FeatureCollection',
            features: result.rows.map(row => ({
                type: 'Feature',
                geometry: row.geometry,
                properties: {
                    id: row.id,
                    name: row.name
                }
            }))
        };
        res.json(geojson);
    } catch (err) {
        console.error('Error fetching provinces:', err);
        res.status(500).send('Error fetching provinces');
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});