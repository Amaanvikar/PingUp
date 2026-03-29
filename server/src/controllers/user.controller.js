import bcrypt from 'bcryptjs';
import userModel from '../models/user.models.js';

export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const existing = await userModel.findOne({ email });
    if (existing) {
      return res.status(409).json({ message: 'Email already registered' });
    }

    const hashed = await bcrypt.hash(password, 10);
    const user = await userModel.create({ name, email, password: hashed });

    return res.status(201).json({ id: user._id, name: user.name, email: user.email });
  } catch (error) {
    console.error('register error', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password required' });
    }

    const user = await userModel.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // no session store here for simplicity
    return res.json({ message: 'Login successful', user: { id: user._id, name: user.name, email: user.email } });
  } catch (error) {
    console.error('login error', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

export const logout = async (req, res) => {
  // stateless placeholder: in real apps, destroy session/token
  return res.json({ message: 'Logout successful' });
};

export const getAllUsers = async (req, res) => {
  try {
    const users = await userModel.find({}, '-password');
    return res.json(users);
  } catch (error) {
    console.error('getAllUsers error', error);
    return res.status(500).json({ message: 'Server error' });
  }
};
