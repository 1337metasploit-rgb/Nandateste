const mongoose = require('mongoose');

const produtoSchema = new mongoose.Schema({
  nome: {
    type: String,
    required: true
  },
  preco: {
    type: Number,
    required: true
  },
  sabor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Sabor',
    required: true
  },
  tipo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tipo',
    required: true
  },
  tamanho: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tamanho',
    required: true
  },
  categoria: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Categoria',
    required: true
  },
  imagem: {
    type: String,
    required: true
  },
  ativo: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Produto', produtoSchema);
