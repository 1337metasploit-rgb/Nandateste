// Script de diagnóstico completo
require('dotenv').config();
const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/sorveteria';

const Produto = require('./models/Produto');
const Sabor = require('./models/Sabor');
const Tipo = require('./models/Tipo');
const Tamanho = require('./models/Tamanho');
const Categoria = require('./models/Categoria');

async function diagnostico() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Conectado ao MongoDB\n');
    
    // Contar entidades
    const saborCount = await Sabor.countDocuments();
    const tipoCount = await Tipo.countDocuments();
    const tamanhoCount = await Tamanho.countDocuments();
    const categoriaCount = await Categoria.countDocuments();
    const produtoCount = await Produto.countDocuments();
    
    console.log('📊 ENTIDADES NO BANCO:');
    console.log(`   🎨 Sabores: ${saborCount}`);
    console.log(`   ✨ Tipos: ${tipoCount}`);
    console.log(`   📏 Tamanhos: ${tamanhoCount}`);
    console.log(`   🏷️ Categorias: ${categoriaCount}`);
    console.log(`   🍦 Produtos: ${produtoCount}\n`);
    
    if (saborCount === 0 || tipoCount === 0 || tamanhoCount === 0 || categoriaCount === 0) {
      console.log('⚠️ ATENÇÃO: Faltam entidades!');
      console.log('📍 Solução: Rode o servidor primeiro (npm run dev) para criar as entidades\n');
    }
    
    // Verificar produtos sem classificações
    const produtosSemClassificacao = await Produto.find({
      $or: [
        { sabor: null },
        { tipo: null },
        { tamanho: null },
        { categoria: null }
      ]
    });
    
    console.log('🔍 PRODUTOS SEM CLASSIFICAÇÕES:');
    if (produtosSemClassificacao.length === 0) {
      console.log('   ✅ Todos os produtos têm classificações!\n');
    } else {
      console.log(`   ❌ ${produtosSemClassificacao.length} produtos sem classificações:`);
      produtosSemClassificacao.forEach(p => {
        console.log(`      - ${p.nome}`);
        console.log(`        Sabor: ${p.sabor ? '✅' : '❌'}`);
        console.log(`        Tipo: ${p.tipo ? '✅' : '❌'}`);
        console.log(`        Tamanho: ${p.tamanho ? '✅' : '❌'}`);
        console.log(`        Categoria: ${p.categoria ? '✅' : '❌'}\n`);
      });
      console.log('📍 Solução: Rode o script de atualização:');
      console.log('   node atualizar-produtos.js\n');
    }
    
    // Listar produtos com classificações
    const produtosCompletos = await Produto.find()
      .populate('sabor')
      .populate('tipo')
      .populate('tamanho')
      .populate('categoria');
    
    console.log('📋 PRODUTOS COMPLETOS:');
    if (produtosCompletos.length === 0) {
      console.log('   Nenhum produto cadastrado\n');
    } else {
      produtosCompletos.forEach(p => {
        const temTodos = p.sabor && p.tipo && p.tamanho && p.categoria;
        console.log(`\n   ${temTodos ? '✅' : '❌'} ${p.nome}`);
        console.log(`      🍦 Sabor: ${p.sabor?.nome || 'SEM SABOR'}`);
        console.log(`      ✨ Tipo: ${p.tipo?.nome || 'SEM TIPO'}`);
        console.log(`      📏 Tamanho: ${p.tamanho?.nome || 'SEM TAMANHO'}`);
        console.log(`      🏷️ Categoria: ${p.categoria?.nome || 'SEM CATEGORIA'}`);
      });
    }
    
    console.log('\n');
    console.log('🎯 PRÓXIMOS PASSOS:');
    
    if (produtosSemClassificacao.length > 0) {
      console.log('1. ❌ Rode: node atualizar-produtos.js');
      console.log('2. ✅ Rode: npm run dev');
      console.log('3. ✅ Acesse: http://localhost:3000/admincompleto');
    } else {
      console.log('1. ✅ Rode: npm run dev');
      console.log('2. ✅ Acesse: http://localhost:3000/admincompleto');
      console.log('3. ✅ Veja os produtos com badges!');
    }
    
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Erro:', error);
    process.exit(1);
  }
}

diagnostico();
