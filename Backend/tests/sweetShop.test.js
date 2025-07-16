const request = require('supertest');
const app = require('../server');
const Sweet = require('../models/Sweet');
const mongoose = require('mongoose');

describe('Sweet Shop Management System', () => {
  describe('POST /api/sweets', () => {
    it('should add a new sweet to the shop', async () => {
      const sweetData = {
        name: 'Kaju Katli',
        category: 'Nut-Based',
        price: 50,
        quantity: 20
      };

      const response = await request(app)
        .post('/api/sweets')
        .send(sweetData)
        .expect(201);

      expect(response.body).toHaveProperty('_id');
      expect(response.body.name).toBe('Kaju Katli');
      expect(response.body.category).toBe('Nut-Based');
      expect(response.body.price).toBe(50);
      expect(response.body.quantity).toBe(20);

      // Verify in database
      const sweet = await Sweet.findById(response.body._id);
      expect(sweet).toBeTruthy();
      expect(sweet.name).toBe('Kaju Katli');
    });

    it('should return 400 if required fields are missing', async () => {
      const response = await request(app)
        .post('/api/sweets')
        .send({})
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    it('should return 400 if price is negative', async () => {
      const sweetData = {
        name: 'Test Sweet',
        category: 'Test Category',
        price: -10,
        quantity: 5
      };

      const response = await request(app)
        .post('/api/sweets')
        .send(sweetData)
        .expect(400);

      expect(response.body.error).toContain('price');
    });
  });
});


describe('GET /api/sweets', () => {
    it('should return all sweets in the shop', async () => {
      // Add test data
      await Sweet.create([
        { name: 'Kaju Katli', category: 'Nut-Based', price: 50, quantity: 20 },
        { name: 'Gajar Halwa', category: 'Vegetable-Based', price: 30, quantity: 15 }
      ]);

      const response = await request(app)
        .get('/api/sweets')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(2);
      expect(response.body[0]).toHaveProperty('_id');
      expect(response.body[0]).toHaveProperty('name');
      expect(response.body[0]).toHaveProperty('createdAt');
    });

    it('should return empty array when no sweets exist', async () => {
      const response = await request(app)
        .get('/api/sweets')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(0);
    });

    it('should return sweets sorted by creation date (newest first)', async () => {
      // Add sweets with delay to ensure different timestamps
      await Sweet.create({ name: 'First Sweet', category: 'Test', price: 10, quantity: 5 });
      await new Promise(resolve => setTimeout(resolve, 10));
      await Sweet.create({ name: 'Second Sweet', category: 'Test', price: 20, quantity: 5 });

      const response = await request(app)
        .get('/api/sweets')
        .expect(200);

      expect(response.body[0].name).toBe('Second Sweet');
      expect(response.body[1].name).toBe('First Sweet');
    });
  });