const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

const secretKey = process.env.SECRET_JWT_KEY;
// User signup
const signup = async (req, res) => {
  const {
    username, email, password, role,
  } = req.body;

  try {
    // Check if the user already exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Create a new user
    user = new User({
      username,
      email,
      password,
      role,
    });

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    // Save the user to the database
    await user.save();

    // Create and sign a JWT token
    const payload = {
      user: {
        id: user.id,
        role: user.role,
      },
    };

    jwt.sign(payload, secretKey, { expiresIn: '1h' }, (err, token) => {
      if (err) throw err;
      res.status(201).json({ message: 'User created successfully', token });
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error' });
  }
};

// User login
const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Check if the user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Compare the provided password with the stored password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Create and sign a JWT token
    const payload = {
      user: {
        id: user.id,
        role: user.role,
        username: user.username,
        email: user.email,
      },
    };
    const { _id, username, role } = user;
    jwt.sign(payload, secretKey, { expiresIn: '1h' }, (err, token) => {
      if (err) throw err;
      res.json({
        _id, username, email, role, token,
      });
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = {
  signup,
  login,
};
