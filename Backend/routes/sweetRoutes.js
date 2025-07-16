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



// Search Sweets (must be before /:id routes)
router.get('/search', async (req, res) => {
  try {
    const { name, category, minPrice, maxPrice } = req.query;
    
    // Build search query
    const searchQuery = {};
    
    if (name) {
      searchQuery.name = { $regex: name, $options: 'i' };
    }
    
    if (category) {
      searchQuery.category = category;
    }
    
    if (minPrice !== undefined || maxPrice !== undefined) {
      searchQuery.price = {};
      if (minPrice !== undefined) {
        searchQuery.price.$gte = parseFloat(minPrice);
      }
      if (maxPrice !== undefined) {
        searchQuery.price.$lte = parseFloat(maxPrice);
      }
    }

    const sweets = await Sweet.find(searchQuery).sort({ createdAt: -1 });
    res.json(sweets);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});


// Purchase Sweet
router.post('/:id/purchase', async (req, res) => {
  try {
    const { id } = req.params;
    const { quantity } = req.body;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid sweet ID' });
    }

    // Validate quantity
    if (!quantity || quantity <= 0 || !Number.isInteger(quantity)) {
      return res.status(400).json({ error: 'Quantity must be a positive number' });
    }

    // Find sweet
    const sweet = await Sweet.findById(id);
    if (!sweet) {
      return res.status(404).json({ error: 'Sweet not found' });
    }

    // Check stock availability
    if (sweet.quantity < quantity) {
      return res.status(400).json({ 
        error: `Not enough stock available. Available: ${sweet.quantity}, Requested: ${quantity}` 
      });
    }

    // Update quantity
    sweet.quantity -= quantity;
    await sweet.save();

    // Calculate purchase details
    const totalCost = sweet.price * quantity;

    res.json({
      message: 'Purchase successful',
      sweet,
      purchaseDetails: {
        purchasedQuantity: quantity,
        totalCost,
        remainingStock: sweet.quantity
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});


// Restock Sweet
router.post('/:id/restock', async (req, res) => {
  try {
    const { id } = req.params;
    const { quantity } = req.body;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid sweet ID' });
    }

    // Validate quantity
    if (!quantity || quantity <= 0 || !Number.isInteger(quantity)) {
      return res.status(400).json({ error: 'Quantity must be a positive number' });
    }

    // Find sweet
    const sweet = await Sweet.findById(id);
    if (!sweet) {
      return res.status(404).json({ error: 'Sweet not found' });
    }

    // Store previous quantity for response
    const previousQuantity = sweet.quantity;

    // Update quantity
    sweet.quantity += quantity;
    await sweet.save();

    res.json({
      message: 'Restock successful',
      sweet,
      restockDetails: {
        restockedQuantity: quantity,
        previousStock: previousQuantity,
        newStock: sweet.quantity
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;