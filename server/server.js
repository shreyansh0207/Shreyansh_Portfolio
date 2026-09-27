const express = require('express');
const path = require('path');
const { MongoClient } = require('mongodb');

const PORT = process.env.PORT || 8123;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/';
const DB_NAME = 'portfolio';

const app = express();
app.use(express.json());

let messages;

async function connectDB() {
  const client = new MongoClient(MONGO_URI);
  await client.connect();
  messages = client.db(DB_NAME).collection('messages');
  await messages.createIndex({ createdAt: -1 });
  console.log('Connected to MongoDB -> db: portfolio, collection: messages');
}

app.post('/api/messages', async (req, res) => {
  const { name, email, message } = req.body || {};
  if (!name || !email || !message) {
    return res.status(400).json({ ok: false, error: 'name, email and message are required' });
  }
  if (String(name).length > 120 || String(email).length > 200 || String(message).length > 5000) {
    return res.status(400).json({ ok: false, error: 'input too long' });
  }
  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email));
  if (!emailOk) return res.status(400).json({ ok: false, error: 'invalid email' });

  const doc = {
    name: String(name).trim(),
    email: String(email).trim(),
    message: String(message).trim(),
    createdAt: new Date()
  };
  const result = await messages.insertOne(doc);
  res.status(201).json({ ok: true, id: result.insertedId });
});

app.get('/api/messages', async (req, res) => {
  const list = await messages.find({}).sort({ createdAt: -1 }).toArray();
  res.json({ ok: true, count: list.length, messages: list });
});

app.use(express.static(path.join(__dirname, '..')));
app.get('*', (req, res) => res.sendFile(path.join(__dirname, '..', 'index.html')));

connectDB()
  .then(() => app.listen(PORT, () => console.log(`Portfolio server running at http://localhost:${PORT}`)))
  .catch((err) => { console.error('Failed to start:', err.message); process.exit(1); });
