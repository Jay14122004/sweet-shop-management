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