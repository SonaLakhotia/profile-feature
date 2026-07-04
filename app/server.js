const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { MongoClient } = require('mongodb'); 

const app = express();
const PORT = 3000;

const mongoUrl = 'mongodb://admin:password@mongo:27017';
const client = new MongoClient(mongoUrl); 

// Notice we adjust 'public' using path.join so it doesn't break if you move folders!
app.use(express.static(path.join(__dirname, 'public')));

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, path.join(__dirname, 'public/uploads')),
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

const uploadDir = path.join(__dirname, 'public/uploads');
if (!fs.existsSync(uploadDir)){
    fs.mkdirSync(uploadDir, { recursive: true });
}

// GET: Fetch profile
app.get('/api/profile', async (req, res) => {
    try {
        const db = client.db('user-account');
        const query = { userid: 1 };
        const result = await db.collection('users').findOne(query);
        res.send(result || { username: "", hobbies: "", imageUrl: null });
    } catch (err) {
        console.error("Database read error:", err);
        res.status(500).send({ error: "Failed to fetch profile" });
    }
});

// POST: Save/Update profile
app.post('/api/profile', upload.single('profilePic'), async (req, res) => {
    try {
        var userObj = {
            username: req.body.username || "",
            hobbies: req.body.hobbies || ""
        };

        if (req.file) {
            userObj.imageUrl = `/uploads/${req.file.filename}`;
        }

        const db = client.db('user-account');
        userObj['userid'] = 1;
        const query = { userid: 1 };
        const newValues = { $set: userObj };

        await db.collection('users').updateOne(query, newValues, { upsert: true });
        res.send(userObj);
    } catch (err) {
        console.error("Database write error:", err);
        res.status(500).send({ error: "Failed to update profile" });
    }
});

// NEW & CRITICAL: Connect to Mongo FIRST, then keep the server open 
async function startServer() {
    try {
        console.log('Connecting to MongoDB container...');
        await client.connect();
        console.log('Successfully connected to MongoDB!');
        
        // Only start listening once the DB connection keeps the event loop alive
        app.listen(PORT, () => {
            console.log(`Server running smoothly on http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error('CRITICAL ERROR: Could not connect to MongoDB container!', error);
        process.exit(1); // Explicitly exit if the DB is missing so you know why it failed
    }
}

startServer();