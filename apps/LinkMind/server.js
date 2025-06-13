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

// Middleware para injetar configurações Firebase no cliente
app.use((req, res, next) => {
  res.locals.firebaseConfig = {
    apiKey: process.env.FIREBASE_API_KEY,
    authDomain: process.env.FIREBASE_AUTH_DOMAIN,
    projectId: process.env.FIREBASE_PROJECT_ID,
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.FIREBASE_APP_ID,
    measurementId: process.env.FIREBASE_MEASUREMENT_ID
  };
  next();
});

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

app.get('/settings', authenticateUser, (req, res) => {
  res.sendFile(path.join(__dirname, 'views/settings.html'));
});

// API Routes
// Registro de usuário
app.post('/api/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;    
    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Todos os campos são obrigatórios' });
    }

    // Validações
    if (name.trim().length < 2) {
      return res.status(400).json({ error: 'Nome deve ter pelo menos 2 caracteres' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Senha deve ter pelo menos 6 caracteres' });
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Email inválido' });
    }

    // Verificar se usuário já existe
    const userSnapshot = await db.collection('users').where('email', '==', email.toLowerCase()).get();
    if (!userSnapshot.empty) {
      return res.status(400).json({ error: 'Este email já está sendo usado' });
    }

    // Hash da senha
    const hashedPassword = await bcrypt.hash(password, 10);    // Criar usuário no Firestore
    const userRef = await db.collection('users').add({
      name: name.trim(),
      email: email.toLowerCase(),
      password: hashedPassword,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
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

// APIs de configurações do usuário
// Obter perfil do usuário
app.get('/api/user/profile', authenticateUser, async (req, res) => {
  try {
    const userDoc = await db.collection('users').doc(req.session.userId).get();
    
    if (!userDoc.exists) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    const userData = userDoc.data();
    res.json({
      name: userData.name,
      email: userData.email,
      createdAt: userData.createdAt
    });
  } catch (error) {
    console.error('Erro ao obter perfil:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Atualizar perfil do usuário
app.put('/api/user/profile', authenticateUser, async (req, res) => {
  try {
    const { name } = req.body;
    
    if (!name || name.trim().length < 2) {
      return res.status(400).json({ error: 'Nome deve ter pelo menos 2 caracteres' });
    }

    await db.collection('users').doc(req.session.userId).update({
      name: name.trim(),
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    });

    // Atualizar sessão
    req.session.userName = name.trim();

    res.json({ success: true, message: 'Perfil atualizado com sucesso' });
  } catch (error) {
    console.error('Erro ao atualizar perfil:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Alterar senha
app.put('/api/user/change-password', authenticateUser, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Senha atual e nova senha são obrigatórias' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'Nova senha deve ter pelo menos 6 caracteres' });
    }

    // Buscar usuário
    const userDoc = await db.collection('users').doc(req.session.userId).get();
    const userData = userDoc.data();

    // Verificar senha atual
    const isValidPassword = await bcrypt.compare(currentPassword, userData.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Senha atual incorreta' });
    }

    // Hash da nova senha
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    // Atualizar senha
    await db.collection('users').doc(req.session.userId).update({
      password: hashedNewPassword,
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    });

    res.json({ success: true, message: 'Senha alterada com sucesso' });
  } catch (error) {
    console.error('Erro ao alterar senha:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Obter estatísticas do usuário
app.get('/api/user/stats', authenticateUser, async (req, res) => {
  try {
    // Contar ideias
    const ideasSnapshot = await db.collection('ideas')
      .where('userId', '==', req.session.userId)
      .get();
    
    // Obter dados do usuário
    const userDoc = await db.collection('users').doc(req.session.userId).get();
    const userData = userDoc.data();
    
    // Calcular idade da conta
    let accountAge = '-';
    if (userData.createdAt) {
      const createdDate = userData.createdAt.toDate();
      const diffTime = Math.abs(new Date() - createdDate);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      accountAge = diffDays === 1 ? '1 dia' : `${diffDays} dias`;
    }

    // Último login (pode ser agora)
    const lastLogin = 'Agora';

    res.json({
      totalIdeas: ideasSnapshot.size,
      accountAge,
      lastLogin
    });
  } catch (error) {
    console.error('Erro ao obter estatísticas:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Excluir todas as ideias
app.delete('/api/user/delete-all-ideas', authenticateUser, async (req, res) => {
  try {
    const ideasSnapshot = await db.collection('ideas')
      .where('userId', '==', req.session.userId)
      .get();
    
    // Excluir em lote
    const batch = db.batch();
    ideasSnapshot.docs.forEach(doc => {
      batch.delete(doc.ref);
    });
    
    await batch.commit();

    res.json({ 
      success: true, 
      message: `${ideasSnapshot.size} ideias foram excluídas com sucesso` 
    });
  } catch (error) {
    console.error('Erro ao excluir ideias:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Excluir conta permanentemente
app.delete('/api/user/delete-account', authenticateUser, async (req, res) => {
  try {
    const userId = req.session.userId;
    
    // Excluir todas as ideias do usuário
    const ideasSnapshot = await db.collection('ideas')
      .where('userId', '==', userId)
      .get();
    
    const batch = db.batch();
    
    // Adicionar exclusão das ideias ao batch
    ideasSnapshot.docs.forEach(doc => {
      batch.delete(doc.ref);
    });
    
    // Adicionar exclusão do usuário ao batch
    batch.delete(db.collection('users').doc(userId));
    
    // Executar todas as exclusões
    await batch.commit();
    
    // Destruir sessão
    req.session.destroy((err) => {
      if (err) {
        console.error('Erro ao destruir sessão:', err);
      }
    });

    res.json({ 
      success: true, 
      message: 'Conta excluída com sucesso' 
    });
  } catch (error) {
    console.error('Erro ao excluir conta:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// API endpoint para configurações Firebase (para uso no frontend)
app.get('/api/firebase-config', (req, res) => {
  res.json({
    apiKey: process.env.FIREBASE_API_KEY,
    authDomain: process.env.FIREBASE_AUTH_DOMAIN,
    projectId: process.env.FIREBASE_PROJECT_ID,
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.FIREBASE_APP_ID,
    measurementId: process.env.FIREBASE_MEASUREMENT_ID
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`LinkMind rodando na porta ${PORT}!`);
  console.log(`Acesse: http://localhost:${PORT}`);
});
