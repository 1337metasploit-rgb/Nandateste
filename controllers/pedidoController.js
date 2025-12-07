const Pedido = require('../models/Pedido');

exports.getAll = async (req, res) => {
  try {
    let pedidos;
    if (req.session.user.role === 'admin') {
      pedidos = await Pedido.find().sort({ createdAt: -1 });
    } else {
      pedidos = await Pedido.find({ userId: req.session.user.id }).sort({ createdAt: -1 });
    }
    res.json(pedidos);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar pedidos' });
  }
};

exports.create = async (req, res) => {
  try {
    const { itens, total } = req.body;
    const novoPedido = await Pedido.create({
      userId: req.session.user.id,
      userName: req.session.user.nome,
      itens,
      total,
      status: 'pendente'
    });
    res.json({ success: true, pedido: novoPedido });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao criar pedido' });
  }
};

exports.update = async (req, res) => {
  try {
    const pedido = await Pedido.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true }
    );
    if (pedido) {
      res.json({ success: true, pedido });
    } else {
      res.status(404).json({ error: 'Pedido não encontrado' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Erro ao atualizar pedido' });
  }
};

exports.getStats = async (req, res) => {
  try {
    const totalPedidos = await Pedido.countDocuments();
    const pedidosPendentes = await Pedido.countDocuments({ status: 'pendente' });
    const totalUsuarios = await require('../models/User').countDocuments();
    const pedidos = await Pedido.find();
    const totalVendas = pedidos.reduce((sum, p) => sum + p.total, 0);
    res.json({
      totalPedidos,
      totalVendas,
      pedidosPendentes,
      totalUsuarios
    });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar estatísticas' });
  }
};
