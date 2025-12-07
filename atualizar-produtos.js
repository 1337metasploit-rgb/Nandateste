// Script para atualizar produtos existentes com classificações
require('dotenv').config();
const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/sorveteria';

const Produto = require('./models/Produto');
const Sabor = require('./models/Sabor');
const Tipo = require('./models/Tipo');
const Tamanho = require('./models/Tamanho');
const Categoria = require('./models/Categoria');

async function atualizarProdutos() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Conectado ao MongoDB');
    
    // Buscar produtos sem classificações
    const produtos = await Produto.find({
      $or: [
        { sabor: { $exists: false } },
        { tipo: { $exists: false } },
        { tamanho: { $exists: false } },
        { categoria: { $exists: false } }
      ]
    });
    
    console.log(`📦 Encontrados ${produtos.length} produtos sem classificações`);
    
    if (produtos.length === 0) {
      console.log('✅ Todos os produtos já têm classificações!');
      process.exit(0);
    }
    
    // Buscar entidades
    const sabores = await Sabor.find();
    const tipos = await Tipo.find();
    const tamanhos = await Tamanho.find();
    const categorias = await Categoria.find();
    
    if (sabores.length === 0 || tipos.length === 0 || tamanhos.length === 0 || categorias.length === 0) {
      console.log('⚠️ ATENÇÃO: Algumas entidades não foram criadas ainda!');
      console.log(`Sabores: ${sabores.length}, Tipos: ${tipos.length}, Tamanhos: ${tamanhos.length}, Categorias: ${categorias.length}`);
      console.log('\n❌ Execute o servidor primeiro (npm run dev) para criar as entidades!');
      process.exit(1);
    }
    
    // Atualizar cada produto
    let atualizados = 0;
    for (const produto of produtos) {
      // Atribuir classificações baseado no nome
      const nomeLower = produto.nome.toLowerCase();
      
      // Detectar sabor pelo nome
      let sabor = sabores[0]; // padrão
      if (nomeLower.includes('morango')) sabor = sabores.find(s => s.nome.toLowerCase().includes('morango')) || sabores[0];
      else if (nomeLower.includes('chocolate')) sabor = sabores.find(s => s.nome.toLowerCase().includes('chocolate')) || sabores[0];
      else if (nomeLower.includes('baunilha')) sabor = sabores.find(s => s.nome.toLowerCase().includes('baunilha')) || sabores[0];
      else if (nomeLower.includes('limão')) sabor = sabores.find(s => s.nome.toLowerCase().includes('limão')) || sabores[0];
      else if (nomeLower.includes('coco')) sabor = sabores.find(s => s.nome.toLowerCase().includes('coco')) || sabores[0];
      else if (nomeLower.includes('manga')) sabor = sabores.find(s => s.nome.toLowerCase().includes('manga')) || sabores[0];
      
      // Detectar tipo pelo nome
      let tipo = tipos[0]; // padrão
      if (nomeLower.includes('artesanal')) tipo = tipos.find(t => t.nome.toLowerCase().includes('artesanal')) || tipos[0];
      else if (nomeLower.includes('cremoso')) tipo = tipos.find(t => t.nome.toLowerCase().includes('cremoso')) || tipos[0];
      else if (nomeLower.includes('light')) tipo = tipos.find(t => t.nome.toLowerCase().includes('light')) || tipos[0];
      else if (nomeLower.includes('gourmet')) tipo = tipos.find(t => t.nome.toLowerCase().includes('gourmet')) || tipos[0];
      else tipo = tipos.find(t => t.nome.toLowerCase().includes('cremoso')) || tipos[0]; // padrão cremoso
      
      // Atribuir tamanho médio por padrão
      let tamanho = tamanhos.find(t => t.nome.toLowerCase().includes('médio')) || tamanhos[1] || tamanhos[0];
      
      // Atribuir categoria
      let categoria = categorias[0]; // padrão
      if (nomeLower.includes('premium') || nomeLower.includes('belga') || nomeLower.includes('gourmet')) {
        categoria = categorias.find(c => c.nome.toLowerCase().includes('premium')) || categorias[0];
      } else if (nomeLower.includes('light') || nomeLower.includes('diet')) {
        categoria = categorias.find(c => c.nome.toLowerCase().includes('diet')) || categorias[0];
      } else if (nomeLower.includes('especial')) {
        categoria = categorias.find(c => c.nome.toLowerCase().includes('especiais')) || categorias[0];
      } else {
        categoria = categorias.find(c => c.nome.toLowerCase().includes('clássico')) || categorias[0];
      }
      
      // Atualizar produto
      produto.sabor = sabor._id;
      produto.tipo = tipo._id;
      produto.tamanho = tamanho._id;
      produto.categoria = categoria._id;
      
      await produto.save();
      atualizados++;
      
      console.log(`✅ ${produto.nome}:`);
      console.log(`   🍦 ${sabor.nome} | ✨ ${tipo.nome} | 📏 ${tamanho.nome} | 🏷️ ${categoria.nome}`);
    }
    
    console.log(`\n🎉 ${atualizados} produtos atualizados com sucesso!`);
    console.log('\n📍 Próximos passos:');
    console.log('1. Acesse: http://localhost:3000/admincompleto');
    console.log('2. Login: admin / admin123');
    console.log('3. Veja os produtos com badges!');
    console.log('4. Acesse: http://localhost:3000');
    console.log('5. Veja os produtos no site com as 4 badges coloridas!');
    
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Erro:', error);
    process.exit(1);
  }
}

atualizarProdutos();
