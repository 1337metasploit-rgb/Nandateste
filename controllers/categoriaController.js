const Categoria = require('../models/Categoria');

exports.getAll = async (req, res) => {
  try {
    const categorias = await Categoria.find({ ativo: true });
    res.json(categorias);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar categorias' });
  }
};

exports.getById = async (req, res) => {
  try {
    const categoria = await Categoria.findById(req.params.id);
    if (!categoria) {
      return res.status(404).json({ error: 'Categoria não encontrada' });
    }
    res.json(categoria);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar categoria' });
  }
};

exports.create = async (req, res) => {
  try {
    const categoria = await Categoria.create(req.body);
    res.status(201).json(categoria);
  } catch (error) {
    res.status(400).json({ error: 'Erro ao criar categoria' });
  }
};

exports.update = async (req, res) => {
  try {
    const categoria = await Categoria.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!categoria) {
      return res.status(404).json({ error: 'Categoria não encontrada' });
    }
    res.json(categoria);
  } catch (error) {
    res.status(400).json({ error: 'Erro ao atualizar categoria' });
  }
};

exports.delete = async (req, res) => {
  try {
    const categoria = await Categoria.findByIdAndUpdate(req.params.id, { ativo: false }, { new: true });
    if (!categoria) {
      return res.status(404).json({ error: 'Categoria não encontrada' });
    }
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao deletar categoria' });
  }
};
