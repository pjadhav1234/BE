import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import generateToken from '../utils/generateTokens.js';

export const register = async (req, res) => {
  const { name, role, contact, age, email, password, location } = req.body;

  try {
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ message: 'User already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);
    user = await User.create({ name, role, contact, age, email, password: hashedPassword, location });

    const token = generateToken(user._id);
    res.status(201).json({ token, user: { id: user._id, name, email, role } });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    const token = generateToken(user._id);
    res.status(200).json({
  token,
  user: {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role, // <-- ✅ This is key!
  },
});
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
};
