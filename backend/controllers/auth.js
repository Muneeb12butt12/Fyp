import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import User from '../models/user.js';
import dotenv from 'dotenv';
dotenv.config();

export const signup = async (req, res, next) => {
  try {
    const { firstName, lastName, email, phone, password } = req.body;

    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already in use' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      firstName,
      lastName,
      email,
      phone,
      password: hashedPassword
    });

    await newUser.save();

  
    const token = jwt.sign({ id: newUser._id, email }, process.env.secret, { expiresIn: '1h' });

    res.status(200).json({ message: 'Signup success', token });
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email & password required' });
    }

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User does not exist' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: 'Incorrect email or password' });

    const token = jwt.sign({ id: user._id, email }, process.env.secret, { expiresIn: '1h' });

    res.status(200).json({ message: 'Login success', token });
  } catch (error) {
    next(error);
  }
};

