const Tamanho = require('../models/Tamanho');

exports.getAll = async (req, res) => {
  try {
    const tamanhos = await Tamanho.find({ ativo: true });
    res.json(tamanhos);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar tamanhos' });
  }
};

exports.getById = async (req, res) => {
  try {
    const tamanho = await Tamanho.findById(req.params.id);
    if (!tamanho) {
      return res.status(404).json({ error: 'Tamanho não encontrado' });
    }
    res.json(tamanho);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar tamanho' });
  }
};

exports.create = async (req, res) => {
  try {
    const tamanho = await Tamanho.create(req.body);
    res.status(201).json(tamanho);
  } catch (error) {
    res.status(400).json({ error: 'Erro ao criar tamanho' });
  }
};

exports.update = async (req, res) => {
  try {
    const tamanho = await Tamanho.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!tamanho) {
      return res.status(404).json({ error: 'Tamanho não encontrado' });
    }
    res.json(tamanho);
  } catch (error) {
    res.status(400).json({ error: 'Erro ao atualizar tamanho' });
  }
};

exports.delete = async (req, res) => {
  try {
    const tamanho = await Tamanho.findByIdAndUpdate(req.params.id, { ativo: false }, { new: true });
    if (!tamanho) {
      return res.status(404).json({ error: 'Tamanho não encontrado' });
    }
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao deletar tamanho' });
  }
};
