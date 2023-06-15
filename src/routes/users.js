var express = require('express');
var router = express.Router();
var bcrypt = require('bcrypt');
var path = require('path');
var fs = require('fs');
const { v4: uuidv4 } = require('uuid');
var usersFile = path.join(__dirname, '..', 'users.json');

/* GET users listing. */
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

router.post('/', async (req, res) => {
  const { username, email, password } = req.body;
  console.log(req.body);
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

module.exports = router;
