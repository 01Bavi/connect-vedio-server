const multer = require('multer');
const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const User = require('../models/UserModel');
const upload = require('../config/cloudinary');

// Create user with image
router.post('/create', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      name,
      email,
      password:hashedPassword,
    });

    await newUser.save();
    res.status(201).json({ message: 'User created successfully', user: newUser });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all users
router.get('/users', async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// login 
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email});

    if (!user) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    res.status(200).json({ message: 'Login successful', user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// upload
router.post('/upload', upload.single('profileImage'), async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    user.profileImage = req.file.path;
    await user.save();

    res.json({ message: 'Profile image uploaded successfully', imageUrl: req.file.path });
  } catch (error) {
    res.status(500).json({ message: 'Image upload failed', error });
  }
});




module.exports = router;
