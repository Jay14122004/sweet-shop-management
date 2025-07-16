const express = require('express');
const mongoose = require('mongoose');
const Sweet = require('../models/Sweet');

const router = express.Router();

// Add Sweet
router.post('/', async (req, res) => {
  try {
    const sweet = new Sweet(req.body);
    await sweet.save();
    res.status(201).json(sweet);
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;