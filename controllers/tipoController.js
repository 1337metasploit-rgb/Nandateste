const Tipo = require('../models/Tipo');

exports.getAll = async (req, res) => {
  try {
    const tipos = await Tipo.find({ ativo: true });
    res.json(tipos);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar tipos' });
  }
};

exports.getById = async (req, res) => {
  try {
    const tipo = await Tipo.findById(req.params.id);
    if (!tipo) {
      return res.status(404).json({ error: 'Tipo não encontrado' });
    }
    res.json(tipo);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar tipo' });
  }
};

exports.create = async (req, res) => {
  try {
    const tipo = await Tipo.create(req.body);
    res.status(201).json(tipo);
  } catch (error) {
    res.status(400).json({ error: 'Erro ao criar tipo' });
  }
};

exports.update = async (req, res) => {
  try {
    const tipo = await Tipo.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!tipo) {
      return res.status(404).json({ error: 'Tipo não encontrado' });
    }
    res.json(tipo);
  } catch (error) {
    res.status(400).json({ error: 'Erro ao atualizar tipo' });
  }
};

exports.delete = async (req, res) => {
  try {
    const tipo = await Tipo.findByIdAndUpdate(req.params.id, { ativo: false }, { new: true });
    if (!tipo) {
      return res.status(404).json({ error: 'Tipo não encontrado' });
    }
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao deletar tipo' });
  }
};
