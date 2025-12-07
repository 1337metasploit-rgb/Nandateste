const Sabor = require('../models/Sabor');

exports.getAll = async (req, res) => {
  try {
    const sabores = await Sabor.find({ ativo: true });
    res.json(sabores);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar sabores' });
  }
};

exports.getById = async (req, res) => {
  try {
    const sabor = await Sabor.findById(req.params.id);
    if (!sabor) {
      return res.status(404).json({ error: 'Sabor não encontrado' });
    }
    res.json(sabor);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar sabor' });
  }
};

exports.create = async (req, res) => {
  try {
    const sabor = await Sabor.create(req.body);
    res.status(201).json(sabor);
  } catch (error) {
    res.status(400).json({ error: 'Erro ao criar sabor' });
  }
};

exports.update = async (req, res) => {
  try {
    const sabor = await Sabor.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!sabor) {
      return res.status(404).json({ error: 'Sabor não encontrado' });
    }
    res.json(sabor);
  } catch (error) {
    res.status(400).json({ error: 'Erro ao atualizar sabor' });
  }
};

exports.delete = async (req, res) => {
  try {
    const sabor = await Sabor.findByIdAndUpdate(req.params.id, { ativo: false }, { new: true });
    if (!sabor) {
      return res.status(404).json({ error: 'Sabor não encontrado' });
    }
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao deletar sabor' });
  }
};
