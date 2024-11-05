const User = require('../models/user');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.register = async (req, res) => {
  const { name, birthDate, email, username, password, confirmPassword } = req.body;

  // Verificação de senha
  if (password !== confirmPassword) {
    return res.status(400).json({ error: 'Senhas não correspondem.' });
  }

  try {
    // Verifica se o email ou username já existe
    const emailExists = await User.findOne({ email });
    if (emailExists) return res.status(400).json({ error: 'Email já registrado.' });

    const usernameExists = await User.findOne({ username });
    if (usernameExists) return res.status(400).json({ error: 'Username já registrado.' });

    // Cria o novo usuário
    const user = new User({ name, birthDate, email, username, password });
    await user.save();
    res.status(201).json({ message: 'Usuário registrado com sucesso' });
  } catch (err) {
    res.status(400).json({ error: 'Erro ao registrar usuário.' });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: 'Email não encontrado.' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error: 'Senha incorreta.' });

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ token });
  } catch (err) {
    res.status(400).json({ error: 'Erro ao fazer login.' });
  }
};
