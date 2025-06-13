const express = require('express');
const firebase = require('firebase-admin');
const bcrypt = require('bcryptjs');
const session = require('express-session');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

// Inicialização do Firebase Admin SDK
let db;
let firebaseInitialized = false;

try {
  const serviceAccount = require('./serviceAccountKey.json');
  firebase.initializeApp({
    credential: firebase.credential.cert(serviceAccount),
    databaseURL: process.env.FIREBASE_DATABASE_URL
  });
  db = firebase.firestore();
  firebaseInitialized = true;
  console.log('✅ Firebase inicializado com sucesso');
} catch (error) {
  console.log('⚠️  Firebase não configurado:', error.message);
  console.log('💡 A aplicação rodará em modo demonstração');
  console.log('📋 Siga as instruções em FIREBASE_SETUP.md para configurar o Firebase');
  
  // Mock do Firestore para demonstração
  db = {
    collection: () => ({
      add: () => Promise.resolve({ id: 'demo-id-' + Date.now() }),
      where: () => ({
        get: () => Promise.resolve({ empty: true, docs: [] })
      }),
      get: () => Promise.resolve({ docs: [] }),
      orderBy: () => ({
        get: () => Promise.resolve({ docs: [] })
      })
    })
  };
}

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use(session({
  secret: process.env.SESSION_SECRET || 'linkmind-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false, maxAge: 24 * 60 * 60 * 1000 } // 24 horas
}));

// Middleware de autenticação
const authenticateUser = (req, res, next) => {
  if (req.session.userId) {
    next();
  } else {
    res.status(401).json({ error: 'Usuário não autenticado' });
  }
};

// Rotas das páginas
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'views/login.html'));
});

app.get('/dashboard', authenticateUser, (req, res) => {
  res.sendFile(path.join(__dirname, 'views/dashboard.html'));
});

app.get('/upload-mind', authenticateUser, (req, res) => {
  res.sendFile(path.join(__dirname, 'views/upload-mind.html'));
});

app.get('/download-mind', authenticateUser, (req, res) => {
  res.sendFile(path.join(__dirname, 'views/download-mind.html'));
});

// API Routes
// Registro de usuário
app.post('/api/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;
    
    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Todos os campos são obrigatórios' });
    }

    // Verificar se usuário já existe
    const userSnapshot = await db.collection('users').where('email', '==', email).get();
    if (!userSnapshot.empty) {
      return res.status(400).json({ error: 'Usuário já existe' });
    }

    // Hash da senha
    const hashedPassword = await bcrypt.hash(password, 10);

    // Criar usuário no Firestore
    const userRef = await db.collection('users').add({
      name,
      email,
      password: hashedPassword,
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });

    req.session.userId = userRef.id;
    req.session.userEmail = email;
    req.session.userName = name;

    res.json({ success: true, message: 'Usuário criado com sucesso' });
  } catch (error) {
    console.error('Erro no registro:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Login de usuário
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email e senha são obrigatórios' });
    }

    // Buscar usuário no Firestore
    const userSnapshot = await db.collection('users').where('email', '==', email).get();
    
    if (userSnapshot.empty) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    const userData = userSnapshot.docs[0].data();
    const userId = userSnapshot.docs[0].id;

    // Verificar senha
    const isValidPassword = await bcrypt.compare(password, userData.password);
    
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    req.session.userId = userId;
    req.session.userEmail = userData.email;
    req.session.userName = userData.name;

    res.json({ success: true, message: 'Login realizado com sucesso' });
  } catch (error) {
    console.error('Erro no login:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Logout
app.post('/api/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ error: 'Erro ao fazer logout' });
    }
    res.json({ success: true, message: 'Logout realizado com sucesso' });
  });
});

// Criar ideia
app.post('/api/ideas', authenticateUser, async (req, res) => {
  try {
    const { title, description, startDate, endDate } = req.body;

    if (!title || !description) {
      return res.status(400).json({ error: 'Título e descrição são obrigatórios' });
    }

    const ideaRef = await db.collection('ideas').add({
      title,
      description,
      startDate: startDate || null,
      endDate: endDate || null,
      userId: req.session.userId,
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });

    res.json({ success: true, id: ideaRef.id, message: 'Ideia criada com sucesso' });
  } catch (error) {
    console.error('Erro ao criar ideia:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Buscar ideias
app.get('/api/ideas', authenticateUser, async (req, res) => {
  try {
    const { search } = req.query;
    let query = db.collection('ideas').where('userId', '==', req.session.userId);

    if (search) {
      // Busca simples por título (Firestore tem limitações na busca full-text)
      query = query.where('title', '>=', search).where('title', '<=', search + '\uf8ff');
    }

    const snapshot = await query.orderBy('createdAt', 'desc').get();
    const ideas = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate()
    }));

    res.json({ ideas });
  } catch (error) {
    console.error('Erro ao buscar ideias:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Buscar sugestões para autocomplete
app.get('/api/suggestions', authenticateUser, async (req, res) => {
  try {
    const snapshot = await db.collection('ideas')
      .where('userId', '==', req.session.userId)
      .get();

    const titles = snapshot.docs.map(doc => doc.data().title);
    const uniqueTitles = [...new Set(titles)];

    res.json({ suggestions: uniqueTitles });
  } catch (error) {
    console.error('Erro ao buscar sugestões:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Obter dados do usuário
app.get('/api/user', authenticateUser, (req, res) => {
  res.json({
    name: req.session.userName,
    email: req.session.userEmail
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`LinkMind rodando na porta ${PORT}!`);
  console.log(`Acesse: http://localhost:${PORT}`);
});
