const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

require('dotenv').config();

const authenticateToken = require('../middlewares/authMiddleware');

const usersFile = path.join(__dirname, '..', 'users.json');
const secretKey = process.env.SECRET_JWT_KEY;

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User management endpoints
 */

/**
 * @swagger
 * /users:
 *   get:
 *     summary: Get all users.
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: Success.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *       500:
 *         description: Internal server error.
 */
router.get('/', (req, res) => {
  try {
    let users = [];
    try {
      users = JSON.parse(fs.readFileSync(usersFile));
    } catch (error) {
      console.error(error);
    }
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error.' });
  }
});

/**
 * @swagger
 * /users:
 *   post:
 *     summary: Create a new user.
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *             required:
 *               - username
 *               - email
 *               - password
 *     responses:
 *       201:
 *         description: User created successfully.
 *       500:
 *         description: Internal server error.
 */

router.post('/', async (req, res) => {
  const { username, email, password } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = { id: uuidv4(), username, email, password: hashedPassword };
    let users = [];
    try {
      users = JSON.parse(fs.readFileSync(usersFile));
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal server error.' });
    }
    users.push(newUser);
    fs.writeFileSync(usersFile, JSON.stringify(users, null, 2));
    res.status(201).json({ message: 'User created successfully.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error.' });
  }
});

/**
 * @swagger
 * /users/login:
 *   post:
 *     tags:
 *       - Users
 *     summary: Returns Authorization Token
 *     description: Authorizes default users with username and password set as root to use the endpoints
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *             example:
 *               email: "user@root.com"
 *               password: "root"
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: Authorization token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *             example:
 *               data: "token"
 */

router.post('/login', (req, res) => {
  const { email, password } = req.body;
  try {
    const users = JSON.parse(fs.readFileSync(usersFile));
    const user = users.find((user) => user.email === email);

    if (user && bcrypt.compareSync(password, user.password)) {
      const tokenPayload = {
        id: user.id,
        username: user.username,
        email: user.email,
        // Add any other user details you want to include
      };
      const token = jwt.sign(tokenPayload, secretKey, { expiresIn: '1h' });
      res.status(200).json({ message: `Welcome ${user.username}!`, token });
      return;
    } else {
      res.status(401).json({ message: 'Invalid credentials.' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error.' });
  }
});

/**
 * @swagger
 * /users/{id}:
 *   delete:
 *     summary: Delete user by ID.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     consumes:
 *       - application/json
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID.
 *     responses:
 *       200:
 *         description: User deleted successfully.
 *       404:
 *         description: User not found.
 *       500:
 *         description: Internal server error.
 */

router.delete('/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  try {
    let users = JSON.parse(fs.readFileSync(usersFile));
    const user = users.find((user) => user.id === id);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }
    users = users.filter((user) => user.id !== id);
    fs.writeFileSync(usersFile, JSON.stringify(users, null, 2));
    res.status(200).json({ message: 'User deleted successfully.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error.' });
  }
});

/**
 * @swagger
 * /users/profile:
 *   get:
 *     summary: Get user profile.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     consumes:
 *       - application/json
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: User profile retrieved successfully.
 *       401:
 *         description: Unauthorized - JWT token is missing or invalid.
 *       500:
 *         description: Internal server error.
 */
router.get('/profile', authenticateToken, (req, res) => {
  // The user's details can be accessed from req.user
  const userDetails = req.user;

  res.json(userDetails);
});

/**
 * @swagger
 * /users/profile:
 *   patch:
 *     summary: Update user profile after login.
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *             required:
 *               - username
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User updated successfully.
 *       404:
 *         description: User not found.
 *       500:
 *         description: Internal server error.
 */
router.patch('/profile', authenticateToken, (req, res) => {
  const { id } = req.user;
  const { username } = req.body;
  try {
    let users = JSON.parse(fs.readFileSync(usersFile));

    const user = users.find((user) => user.id === id);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    if (username) {
      user.username = username;
      fs.writeFileSync(usersFile, JSON.stringify(users, null, 2));
      res.status(200).json({ message: 'User updated successfully.' });
    } else {
      res.status(400).json({ message: 'Invalid request body.' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error.' });
  }
});

/**
 * @swagger
 * /users/{id}:
 *   patch:
 *     summary: Update user by ID.
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: User ID.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *             required:
 *               - username
 *     responses:
 *       200:
 *         description: User updated successfully.
 *       404:
 *         description: User not found.
 *       500:
 *         description: Internal server error.
 */

router.patch('/:id', (req, res) => {
  const { id } = req.params;
  const { username, email } = req.body;
  const users = JSON.parse(fs.readFileSync(usersFile));
  const user = users.find((user) => user.id === id);
  try {
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }
    user.username = username;
    user.email = email;
    fs.writeFileSync(usersFile, JSON.stringify(users, null, 2));
    res.status(200).json({ message: 'User updated successfully.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error.' });
  }
});

/**
 * @swagger
 * /users/{id}:
 *   get:
 *     summary: Get user by ID.
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID.
 *     responses:
 *       200:
 *         description: Success
 *         content:
 *           application/json:
 *             schema:
 *       404:
 *         description: User not found.
 *       500:
 *         description: Internal server error.
 *     components:
 *       schemas:
 *         User:
 *           type: object
 *           properties:
 *             id:
 *               type: string
 *             username:
 *               type: string
 *             email:
 *               type: string
 *           required:
 *             - id
 *             - username
 *             - email
 */

router.get('/:id', (req, res) => {
  const { id } = req.params;
  const users = JSON.parse(fs.readFileSync(usersFile));
  const user = users.find((user) => user.id === id);
  if (user) {
    res.json(user);
  } else {
    res.status(404).json({ message: 'User not found.' });
  }
  try {
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error.' });
  }
});

module.exports = router;
