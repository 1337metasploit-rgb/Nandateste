const mongoose = require('mongoose');

const pedidoSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  userName: {
    type: String,
    required: true
  },
  itens: [{
    id: Number,
    nome: String,
    preco: Number,
    quantidade: Number
  }],
  total: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['pendente', 'preparando', 'entregue', 'cancelado'],
    default: 'pendente'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Pedido', pedidoSchema);
