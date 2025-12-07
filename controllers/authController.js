const User = require('../models/User');

exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({ error: 'Usuário ou senha inválidos' });
    }
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Usuário ou senha inválidos' });
    }
    req.session.user = {
      id: user._id,
      username: user.username,
      role: user.role,
      nome: user.nome
    };
    res.json({ success: true, user: req.session.user });
  } catch (error) {
    res.status(500).json({ error: 'Erro no servidor' });
  }
};

exports.register = async (req, res) => {
  try {
    const { username, password, nome } = req.body;
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ error: 'Usuário já existe' });
    }
    const newUser = await User.create({ username, password, nome, role: 'user' });
    req.session.user = {
      id: newUser._id,
      username: newUser.username,
      role: newUser.role,
      nome: newUser.nome
    };
    res.json({ success: true, user: req.session.user });
  } catch (error) {
    res.status(500).json({ error: 'Erro no servidor' });
  }
};

exports.logout = (req, res) => {
  req.session.destroy();
  res.json({ success: true });
};

exports.getSession = (req, res) => {
  if (req.session.user) {
    res.json({ user: req.session.user });
  } else {
    res.json({ user: null });
  }
};
