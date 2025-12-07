require('dotenv').config();
const express = require('express');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const path = require('path');
const upload = require('./config/upload');
const fs = require('fs');

const saborRoutes = require('./routes/sabor');
const tipoRoutes = require('./routes/tipo');
const tamanhoRoutes = require('./routes/tamanho');
const categoriaRoutes = require('./routes/categoria');
const produtoRoutes = require('./routes/produto');
const authRoutes = require('./routes/auth');
const pedidoRoutes = require('./routes/pedido');

const app = express();
const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/sorveteria';
const uploadDir = path.join(__dirname, 'public', 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('✅ Conectado ao MongoDB');
    inicializarDados();
  })
  .catch(err => console.error('❌ Erro ao conectar MongoDB:', err));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use('/views', express.static('views'));
app.use(session({
  secret: process.env.SESSION_SECRET || 'sorveteria-secret-key-2024',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({ 
    mongoUrl: MONGODB_URI,
    touchAfter: 24 * 3600
  }),
  cookie: { 
    secure: false,
    maxAge: 1000 * 60 * 60 * 24
  }
}));

app.use('/api/sabores', saborRoutes);
app.use('/api/tipos', tipoRoutes);
app.use('/api/tamanhos', tamanhoRoutes);
app.use('/api/categorias', categoriaRoutes);
app.use('/api/produtos', produtoRoutes);
app.use('/api', authRoutes);
app.use('/api/pedidos', pedidoRoutes);
app.use('/api/admin/pedidos', pedidoRoutes);
app.get('/api/admin/stats', require('./middleware/auth').isAdmin, require('./controllers/pedidoController').getStats);


app.post('/api/upload', require('./middleware/auth').isAdmin, upload.single('imagem'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Nenhuma imagem foi enviada' });
    }
    
    
    const imageUrl = `/uploads/${req.file.filename}`;
    res.json({ 
      success: true,
      url: imageUrl,
      filename: req.file.filename
    });
  } catch (error) {
    console.error('Erro ao fazer upload:', error);
    res.status(500).json({ error: 'Erro ao fazer upload da imagem' });
  }
});

async function inicializarDados() {
  try {
    const User = require('./models/User');
    const Sabor = require('./models/Sabor');
    const Tipo = require('./models/Tipo');
    const Tamanho = require('./models/Tamanho');
    const Categoria = require('./models/Categoria');
    const Produto = require('./models/Produto');

    const userCount = await User.countDocuments();
    if (userCount === 0) {
      await User.create([
        { username: 'admin', password: 'admin123', role: 'admin', nome: 'Administrador' },
        { username: 'usuario', password: 'user123', role: 'user', nome: 'Usuário Teste' }
      ]);
      console.log('✅ Usuários criados');
    }

    const saborCount = await Sabor.countDocuments();
    if (saborCount === 0) {
      await Sabor.create([
        { nome: 'Chocolate', descricao: 'Chocolate belga premium' },
        { nome: 'Morango', descricao: 'Morangos frescos' },
        { nome: 'Baunilha', descricao: 'Baunilha de Madagascar' },
        { nome: 'Pistache', descricao: 'Pistache siciliano' },
        { nome: 'Menta', descricao: 'Menta natural' },
        { nome: 'Coco', descricao: 'Coco ralado fresco' },
        { nome: 'Limão', descricao: 'Limão siciliano' },
        { nome: 'Maracujá', descricao: 'Maracujá do cerrado' },
        { nome: 'Açaí', descricao: 'Açaí puro da Amazônia' },
        { nome: 'Doce de Leite', descricao: 'Doce de leite argentino' },
        { nome: 'Cookies', descricao: 'Com pedaços de cookies' },
        { nome: 'Flocos', descricao: 'Com flocos crocantes' }
      ]);
      console.log('✅ Sabores criados');
    }

    const tipoCount = await Tipo.countDocuments();
    if (tipoCount === 0) {
      await Tipo.create([
        { nome: 'Cremoso', descricao: 'Textura cremosa e suave' },
        { nome: 'Vegano', descricao: 'Sem ingredientes de origem animal' },
        { nome: 'Zero Açúcar', descricao: 'Adoçado naturalmente' },
        { nome: 'Premium', descricao: 'Ingredientes importados' }
      ]);
      console.log('✅ Tipos criados');
    }

    const tamanhoCount = await Tamanho.countDocuments();
    if (tamanhoCount === 0) {
      await Tamanho.create([
        { nome: 'Pequeno', ml: 200, multiplicadorPreco: 0.8 },
        { nome: 'Médio', ml: 400, multiplicadorPreco: 1.0 },
        { nome: 'Grande', ml: 600, multiplicadorPreco: 1.5 }
      ]);
      console.log('✅ Tamanhos criados');
    }

    const categoriaCount = await Categoria.countDocuments();
    if (categoriaCount === 0) {
      await Categoria.create([
        { nome: 'Clássico', descricao: 'Sabores tradicionais', cor: '#ff6b9d' },
        { nome: 'Premium', descricao: 'Linha especial', cor: '#c44569' },
        { nome: 'Tropical', descricao: 'Frutas tropicais', cor: '#feca57' },
        { nome: 'Especial', descricao: 'Edição limitada', cor: '#48dbfb' }
      ]);
      console.log('✅ Categorias criadas');
    }

    const produtoCount = await Produto.countDocuments();
    if (produtoCount === 0) {
      const sabores = await Sabor.find();
      const tipos = await Tipo.find();
      const tamanhos = await Tamanho.find();
      const categorias = await Categoria.find();

      // Função auxiliar para encontrar
      const get = (arr, nome) => arr.find(x => x.nome === nome);

      await Produto.create([
        // ===== CATEGORIA: CLÁSSICO =====
        {
          nome: 'Sorvete de Chocolate Clássico',
          preco: 12.90,
          sabor: get(sabores, 'Chocolate')._id,
          tipo: get(tipos, 'Cremoso')._id,
          tamanho: get(tamanhos, 'Médio')._id,
          categoria: get(categorias, 'Clássico')._id,
          imagem: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=400'
        },
        {
          nome: 'Sorvete de Morango Natural',
          preco: 11.90,
          sabor: get(sabores, 'Morango')._id,
          tipo: get(tipos, 'Cremoso')._id,
          tamanho: get(tamanhos, 'Médio')._id,
          categoria: get(categorias, 'Clássico')._id,
          imagem: 'https://images.unsplash.com/photo-1501443762994-82bd5dace89a?w=400'
        },
        {
          nome: 'Sorvete de Baunilha Tradicional',
          preco: 10.90,
          sabor: get(sabores, 'Baunilha')._id,
          tipo: get(tipos, 'Cremoso')._id,
          tamanho: get(tamanhos, 'Pequeno')._id,
          categoria: get(categorias, 'Clássico')._id,
          imagem: 'https://images.unsplash.com/photo-1497034825429-c343d7c6a68f?w=400'
        },
        {
          nome: 'Sorvete de Flocos Familiar',
          preco: 18.90,
          sabor: get(sabores, 'Flocos')._id,
          tipo: get(tipos, 'Cremoso')._id,
          tamanho: get(tamanhos, 'Grande')._id,
          categoria: get(categorias, 'Clássico')._id,
          imagem: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400'
        },

        // ===== CATEGORIA: PREMIUM =====
        {
          nome: 'Sorvete de Pistache Premium',
          preco: 19.90,
          sabor: get(sabores, 'Pistache')._id,
          tipo: get(tipos, 'Premium')._id,
          tamanho: get(tamanhos, 'Médio')._id,
          categoria: get(categorias, 'Premium')._id,
          imagem: 'https://images.unsplash.com/photo-1582143975109-0b8c1c8e5b1a?w=400'
        },
        {
          nome: 'Sorvete de Doce de Leite Especial',
          preco: 17.90,
          sabor: get(sabores, 'Doce de Leite')._id,
          tipo: get(tipos, 'Premium')._id,
          tamanho: get(tamanhos, 'Médio')._id,
          categoria: get(categorias, 'Premium')._id,
          imagem: 'https://images.unsplash.com/photo-1560008581-09826d1de69e?w=400'
        },
        {
          nome: 'Sorvete de Cookies Premium Grande',
          preco: 24.90,
          sabor: get(sabores, 'Cookies')._id,
          tipo: get(tipos, 'Premium')._id,
          tamanho: get(tamanhos, 'Grande')._id,
          categoria: get(categorias, 'Premium')._id,
          imagem: 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=400'
        },
        {
          nome: 'Sorvete de Chocolate Premium Pequeno',
          preco: 13.90,
          sabor: get(sabores, 'Chocolate')._id,
          tipo: get(tipos, 'Premium')._id,
          tamanho: get(tamanhos, 'Pequeno')._id,
          categoria: get(categorias, 'Premium')._id,
          imagem: 'https://images.unsplash.com/photo-1515037893149-de7f840978e2?w=400'
        },

        // ===== CATEGORIA: TROPICAL =====
        {
          nome: 'Sorvete de Coco Tropical',
          preco: 14.90,
          sabor: get(sabores, 'Coco')._id,
          tipo: get(tipos, 'Vegano')._id,
          tamanho: get(tamanhos, 'Médio')._id,
          categoria: get(categorias, 'Tropical')._id,
          imagem: 'https://images.unsplash.com/photo-1570197788417-0e82375c9371?w=400'
        },
        {
          nome: 'Sorvete de Maracujá Refrescante',
          preco: 13.90,
          sabor: get(sabores, 'Maracujá')._id,
          tipo: get(tipos, 'Zero Açúcar')._id,
          tamanho: get(tamanhos, 'Médio')._id,
          categoria: get(categorias, 'Tropical')._id,
          imagem: 'https://images.unsplash.com/photo-1561369645-7a87be8eae56?w=400'
        },
        {
          nome: 'Sorvete de Açaí Energia',
          preco: 16.90,
          sabor: get(sabores, 'Açaí')._id,
          tipo: get(tipos, 'Vegano')._id,
          tamanho: get(tamanhos, 'Grande')._id,
          categoria: get(categorias, 'Tropical')._id,
          imagem: 'https://images.unsplash.com/photo-1590301157890-4810ed352733?w=400'
        },
        {
          nome: 'Sorvete de Limão Light',
          preco: 11.90,
          sabor: get(sabores, 'Limão')._id,
          tipo: get(tipos, 'Zero Açúcar')._id,
          tamanho: get(tamanhos, 'Pequeno')._id,
          categoria: get(categorias, 'Tropical')._id,
          imagem: 'https://images.unsplash.com/photo-1557142046-c704a3adf364?w=400'
        },

        // ===== CATEGORIA: ESPECIAL =====
        {
          nome: 'Sorvete de Menta Especial',
          preco: 13.90,
          sabor: get(sabores, 'Menta')._id,
          tipo: get(tipos, 'Cremoso')._id,
          tamanho: get(tamanhos, 'Médio')._id,
          categoria: get(categorias, 'Especial')._id,
          imagem: 'https://images.unsplash.com/photo-1567206563064-6f60f40a2b57?w=400'
        },
        {
          nome: 'Sorvete de Baunilha Zero Açúcar',
          preco: 14.90,
          sabor: get(sabores, 'Baunilha')._id,
          tipo: get(tipos, 'Zero Açúcar')._id,
          tamanho: get(tamanhos, 'Médio')._id,
          categoria: get(categorias, 'Especial')._id,
          imagem: 'https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?w=400'
        },
        {
          nome: 'Sorvete de Morango Vegano',
          preco: 15.90,
          sabor: get(sabores, 'Morango')._id,
          tipo: get(tipos, 'Vegano')._id,
          tamanho: get(tamanhos, 'Grande')._id,
          categoria: get(categorias, 'Especial')._id,
          imagem: 'https://images.unsplash.com/photo-1560008511-1285f97600cd?w=400'
        },
        {
          nome: 'Sorvete de Pistache Zero',
          preco: 18.90,
          sabor: get(sabores, 'Pistache')._id,
          tipo: get(tipos, 'Zero Açúcar')._id,
          tamanho: get(tamanhos, 'Pequeno')._id,
          categoria: get(categorias, 'Especial')._id,
          imagem: 'https://images.unsplash.com/photo-1576506295286-5cda18df43e7?w=400'
        }
      ]);
      console.log('✅ Produtos criados (16 produtos variados)');
    }
  } catch (error) {
    console.error('❌ Erro ao inicializar:', error);
  }
}

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

app.get('/admincompleto', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admincompleto.html'));
});

if (process.env.VERCEL !== '1') {
  app.listen(PORT, () => {
    console.log(`🍦 Servidor rodando em http://localhost:${PORT}`);
    console.log('👤 Admin: admin / admin123');
    console.log('👤 Usuário: usuario / user123');
  });
}

module.exports = app;
