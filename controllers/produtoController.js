const Produto = require('../models/Produto');

exports.getAll = async (req, res) => {
  try {
    const produtos = await Produto.find({ ativo: true })
      .populate('sabor')
      .populate('tipo')
      .populate('tamanho')
      .populate('categoria');
    res.json(produtos);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar produtos' });
  }
};

exports.getById = async (req, res) => {
  try {
    const produto = await Produto.findById(req.params.id)
      .populate('sabor')
      .populate('tipo')
      .populate('tamanho')
      .populate('categoria');
    if (!produto) {
      return res.status(404).json({ error: 'Produto não encontrado' });
    }
    res.json(produto);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar produto' });
  }
};

exports.create = async (req, res) => {
  try {
    const produto = await Produto.create(req.body);
    res.status(201).json(produto);
  } catch (error) {
    res.status(400).json({ error: 'Erro ao criar produto' });
  }
};

exports.update = async (req, res) => {
  try {
    const produto = await Produto.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!produto) {
      return res.status(404).json({ error: 'Produto não encontrado' });
    }
    res.json(produto);
  } catch (error) {
    res.status(400).json({ error: 'Erro ao atualizar produto' });
  }
};

exports.delete = async (req, res) => {
  try {
    const produto = await Produto.findByIdAndUpdate(req.params.id, { ativo: false }, { new: true });
    if (!produto) {
      return res.status(404).json({ error: 'Produto não encontrado' });
    }
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao deletar produto' });
  }
};
