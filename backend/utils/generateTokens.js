// utils/generateToken.js
import jwt from 'jsonwebtoken';

const generateToken = (user) => {
  // user: object { id, name, role } or user id string
  const payload = typeof user === 'string' ? { id: user } : { id: user.id || user._id, role: user.role, name: user.name };
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });
};

export default generateToken;
