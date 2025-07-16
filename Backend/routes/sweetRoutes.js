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


// View All Sweets
router.get('/', async (req, res) => {
  try {
    const sweets = await Sweet.find().sort({ createdAt: -1 });
    res.json(sweets);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});


// Delete Sweet
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid sweet ID' });
    }

    const sweet = await Sweet.findByIdAndDelete(id);
    
    if (!sweet) {
      return res.status(404).json({ error: 'Sweet not found' });
    }

    res.json({ message: 'Sweet deleted successfully', sweet });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;