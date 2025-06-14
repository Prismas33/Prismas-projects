const express = require('express');
const serverless = require('serverless-http');
const firebaseAdmin = require('firebase-admin');
const bcrypt = require('bcryptjs');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);

if (!firebaseAdmin.apps.length) {
  firebaseAdmin.initializeApp({
    credential: firebaseAdmin.credential.cert(serviceAccount),
    databaseURL: process.env.FIREBASE_DATABASE_URL,
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET
  });
}

const db = firebaseAdmin.firestore();
const auth = firebaseAdmin.auth();
const app = express();

app.use(cors());
app.use(bodyParser.json());

// Rotas de autenticação
app.post('/api/signup', async (req, res) => {
  const { email, password, displayName } = req.body;
  try {
    const hash = await bcrypt.hash(password, 10);
    const userRecord = await auth.createUser({ email, password: hash, displayName });
    await db.collection('users').doc(userRecord.uid).set({ email, displayName });
    res.status(201).json({ message: 'Usuário criado com sucesso!' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const userSnap = await db.collection('users').where('email', '==', email).get();
    if (userSnap.empty) return res.status(400).json({ error: 'Usuário não encontrado.' });
    const userData = userSnap.docs[0].data();
    const userId = userSnap.docs[0].id;
    res.status(200).json({ message: 'Login simulado', uid: userId });
  } catch (err) {
    res.status(400).json({ error: 'Usuário ou senha inválidos.' });
  }
});

app.get('/api/user/:uid', async (req, res) => {
  try {
    const userDoc = await db.collection('users').doc(req.params.uid).get();
    if (!userDoc.exists) return res.status(404).json({ error: 'Usuário não encontrado' });
    res.json(userDoc.data());
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.post('/api/ideas', async (req, res) => {
  const { quem, dataInicio, dataFim, descricao, uid } = req.body;
  try {
    await db.collection('ideas').add({ quem, dataInicio, dataFim, descricao, uid, createdAt: new Date() });
    res.status(201).json({ message: 'Ideia adicionada!' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.get('/api/ideas', async (req, res) => {
  const { busca = '', filtro = '' } = req.query;
  try {
    let ideasRef = db.collection('ideas');
    if (busca) {
      if (filtro === 'quem') ideasRef = ideasRef.where('quem', '>=', busca).where('quem', '<=', busca + '\uf8ff');
      else if (filtro === 'descricao') ideasRef = ideasRef.where('descricao', '>=', busca).where('descricao', '<=', busca + '\uf8ff');
    }
    const snap = await ideasRef.orderBy('createdAt', 'desc').limit(20).get();
    const ideas = snap.docs.map(doc => doc.data());
    res.json({ ideas });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.get('/api/autocomplete', async (req, res) => {
  const { query = '' } = req.query;
  try {
    const snap = await db.collection('ideas').where('quem', '>=', query).where('quem', '<=', query + '\uf8ff').limit(5).get();
    const sugestoes = [...new Set(snap.docs.map(doc => doc.data().quem))];
    res.json({ sugestoes });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = app;
module.exports.handler = serverless(app);
