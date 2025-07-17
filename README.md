# Sweet Shop Management System with MongoDB Atlas 🍬

This is a full-featured RESTful backend built using *Express.js, **MongoDB (Atlas), and **Jest. It follows **Test-Driven Development (TDD)* and includes robust test coverage.

---

## 🚀 Features

- ✅ Add New Sweets (name, category, price, quantity)
- 🗑 Delete Sweets
- 🔍 View All Sweets (sorted by createdAt)
- 🔎 Search sweets by:
  - Name (partial or full, case-insensitive)
  - Category
  - Price Range
- 🛒 Purchase Sweets (with stock validation)
- 🔁 Restock Sweets
- 🧪 TDD using Jest and mongodb-memory-server

---

## 🛠 Tech Stack

- *Node.js + Express*
- *MongoDB Atlas* (for main DB)
- *Jest + Supertest* (for tests)
- *mongodb-memory-server* (for isolated in-memory testing)
- *Mongoose* (ODM)

---

# 1. Install dependencies
npm install

# 2. Run in dev mode
npm run dev


# 🧪 Running Tests

```bash
npm test
