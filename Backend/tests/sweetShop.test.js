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


  describe('DELETE /api/sweets/:id', () => {
    it('should delete a sweet by ID', async () => {
      // Create a sweet first
      const sweet = await Sweet.create({
        name: 'Gulab Jamun',
        category: 'Milk-Based',
        price: 10,
        quantity: 50
      });

      // Delete the sweet
      const response = await request(app)
        .delete(`/api/sweets/${sweet._id}`)
        .expect(200);

      expect(response.body.message).toBe('Sweet deleted successfully');
      expect(response.body.sweet._id).toBe(sweet._id.toString());

      // Verify it's deleted from database
      const deletedSweet = await Sweet.findById(sweet._id);
      expect(deletedSweet).toBeNull();
    });

    it('should return 404 when trying to delete non-existent sweet', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      
      const response = await request(app)
        .delete(`/api/sweets/${fakeId}`)
        .expect(404);

      expect(response.body.error).toBe('Sweet not found');
    });

    it('should return 400 for invalid ObjectId', async () => {
      const response = await request(app)
        .delete('/api/sweets/invalid-id')
        .expect(400);

      expect(response.body.error).toBe('Invalid sweet ID');
    });
  });



  describe('GET /api/sweets/search', () => {
    beforeEach(async () => {
      // Add test data
      await Sweet.create([
        { name: 'Kaju Katli', category: 'Nut-Based', price: 50, quantity: 20 },
        { name: 'Gajar Halwa', category: 'Vegetable-Based', price: 30, quantity: 15 },
        { name: 'Gulab Jamun', category: 'Milk-Based', price: 10, quantity: 50 },
        { name: 'Almond Katli', category: 'Nut-Based', price: 60, quantity: 10 }
      ]);
    });

    it('should search sweets by name (case insensitive)', async () => {
      const response = await request(app)
        .get('/api/sweets/search?name=kaju')
        .expect(200);

      expect(response.body.length).toBe(1);
      expect(response.body[0].name).toBe('Kaju Katli');
    });

    it('should search sweets by partial name match', async () => {
      const response = await request(app)
        .get('/api/sweets/search?name=katli')
        .expect(200);

      expect(response.body.length).toBe(2);
      expect(response.body.some(sweet => sweet.name === 'Kaju Katli')).toBe(true);
      expect(response.body.some(sweet => sweet.name === 'Almond Katli')).toBe(true);
    });

    it('should search sweets by category', async () => {
      const response = await request(app)
        .get('/api/sweets/search?category=Nut-Based')
        .expect(200);

      expect(response.body.length).toBe(2);
      expect(response.body.every(sweet => sweet.category === 'Nut-Based')).toBe(true);
    });

    it('should search sweets by price range', async () => {
      const response = await request(app)
        .get('/api/sweets/search?minPrice=20&maxPrice=40')
        .expect(200);

      expect(response.body.length).toBe(1);
      expect(response.body[0].price).toBe(30);
      expect(response.body[0].name).toBe('Gajar Halwa');
    });

    it('should search sweets by minimum price only', async () => {
      const response = await request(app)
        .get('/api/sweets/search?minPrice=50')
        .expect(200);

      expect(response.body.length).toBe(2);
      expect(response.body.every(sweet => sweet.price >= 50)).toBe(true);
    });

    it('should combine multiple search criteria', async () => {
      const response = await request(app)
        .get('/api/sweets/search?category=Nut-Based&maxPrice=55')
        .expect(200);

      expect(response.body.length).toBe(1);
      expect(response.body[0].name).toBe('Kaju Katli');
    });

    it('should return empty array when no matches found', async () => {
      const response = await request(app)
        .get('/api/sweets/search?name=nonexistent')
        .expect(200);

      expect(response.body.length).toBe(0);
    });
  });

  describe('POST /api/sweets/:id/purchase', () => {
    it('should purchase sweet and decrease quantity', async () => {
      // Create a sweet first
      const sweet = await Sweet.create({
        name: 'Kaju Katli',
        category: 'Nut-Based',
        price: 50,
        quantity: 20
      });

      // Purchase 5 units
      const response = await request(app)
        .post(`/api/sweets/${sweet._id}/purchase`)
        .send({ quantity: 5 })
        .expect(200);

      expect(response.body.message).toBe('Purchase successful');
      expect(response.body.sweet.quantity).toBe(15);
      expect(response.body.purchaseDetails).toEqual({
        purchasedQuantity: 5,
        totalCost: 250,
        remainingStock: 15
      });

      // Verify in database
      const updatedSweet = await Sweet.findById(sweet._id);
      expect(updatedSweet.quantity).toBe(15);
    });

    it('should return 400 when not enough stock', async () => {
      const sweet = await Sweet.create({
        name: 'Kaju Katli',
        category: 'Nut-Based',
        price: 50,
        quantity: 5
      });

      const response = await request(app)
        .post(`/api/sweets/${sweet._id}/purchase`)
        .send({ quantity: 10 })
        .expect(400);

      expect(response.body.error).toBe('Not enough stock available. Available: 5, Requested: 10');
    });

    it('should return 400 for invalid quantity', async () => {
      const sweet = await Sweet.create({
        name: 'Test Sweet',
        category: 'Test',
        price: 10,
        quantity: 5
      });

      const response = await request(app)
        .post(`/api/sweets/${sweet._id}/purchase`)
        .send({ quantity: 0 })
        .expect(400);

      expect(response.body.error).toBe('Quantity must be a positive number');
    });

    it('should return 404 for non-existent sweet', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      
      const response = await request(app)
        .post(`/api/sweets/${fakeId}/purchase`)
        .send({ quantity: 1 })
        .expect(404);

      expect(response.body.error).toBe('Sweet not found');
    });
  });


  describe('POST /api/sweets/:id/restock', () => {
    it('should restock sweet and increase quantity', async () => {
      const sweet = await Sweet.create({
        name: 'Kaju Katli',
        category: 'Nut-Based',
        price: 50,
        quantity: 10
      });

      const response = await request(app)
        .post(`/api/sweets/${sweet._id}/restock`)
        .send({ quantity: 15 })
        .expect(200);

      expect(response.body.message).toBe('Restock successful');
      expect(response.body.sweet.quantity).toBe(25);
      expect(response.body.restockDetails).toEqual({
        restockedQuantity: 15,
        previousStock: 10,
        newStock: 25
      });

      // Verify in database
      const updatedSweet = await Sweet.findById(sweet._id);
      expect(updatedSweet.quantity).toBe(25);
    });

    it('should return 404 when sweet not found', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      
      const response = await request(app)
        .post(`/api/sweets/${fakeId}/restock`)
        .send({ quantity: 10 })
        .expect(404);

      expect(response.body.error).toBe('Sweet not found');
    });

    it('should return 400 for invalid quantity', async () => {
      const sweet = await Sweet.create({
        name: 'Test Sweet',
        category: 'Test',
        price: 10,
        quantity: 5
      });

      const response = await request(app)
        .post(`/api/sweets/${sweet._id}/restock`)
        .send({ quantity: -5 })
        .expect(400);

      expect(response.body.error).toBe('Quantity must be a positive number');
    });

    it('should handle large restock quantities', async () => {
      const sweet = await Sweet.create({
        name: 'Test Sweet',
        category: 'Test',
        price: 10,
        quantity: 100
      });

      const response = await request(app)
        .post(`/api/sweets/${sweet._id}/restock`)
        .send({ quantity: 1000 })
        .expect(200);

      expect(response.body.sweet.quantity).toBe(1100);
    });
  });