const mongoose = require('mongoose');

const tamanhoSchema = new mongoose.Schema({
  nome: {
    type: String,
    required: true,
    unique: true
  },
  ml: {
    type: Number,
    required: true
  },
  multiplicadorPreco: {
    type: Number,
    default: 1
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

module.exports = mongoose.model('Tamanho', tamanhoSchema);
