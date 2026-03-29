// ✅ Load env FIRST
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const db = require("./mysql"); // your mysql.js file

const app = express();

// ✅ Middleware
app.use(cors());
app.use(express.json());

// ✅ Test route
app.get("/", (req, res) => {
  res.send("API is running 🚀");
});


// ==============================
// 🔥 GET ALL PRODUCTS
// ==============================
app.get("/api/products", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM products");
    res.json(rows);
  } catch (err) {
    console.error("GET ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});


// ==============================
// 🔥 ADD PRODUCT
// ==============================
app.post("/api/products", async (req, res) => {
  try {
    const { name, quantity, price } = req.body;

    if (!name || quantity == null || price == null) {
      return res.status(400).json({ error: "All fields required" });
    }

    const [result] = await db.query(
      "INSERT INTO products (name, quantity, price) VALUES (?, ?, ?)",
      [name, quantity, price]
    );

    res.json({
      message: "Product added ✅",
      id: result.insertId,
    });
  } catch (err) {
    console.error("POST ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});


// ==============================
// 🔥 UPDATE PRODUCT
// ==============================
app.put("/api/products/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { name, quantity, price } = req.body;

    const [result] = await db.query(
      "UPDATE products SET name=?, quantity=?, price=? WHERE id=?",
      [name, quantity, price, id]
    );

    res.json({ message: "Product updated ✅" });
  } catch (err) {
    console.error("PUT ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});


// ==============================
// 🔥 DELETE PRODUCT
// ==============================
app.delete("/api/products/:id", async (req, res) => {
  try {
    const { id } = req.params;

    await db.query("DELETE FROM products WHERE id = ?", [id]);

    res.json({ message: "Product deleted ✅" });
  } catch (err) {
    console.error("DELETE ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});


// ==============================
// 🚀 START SERVER
// ==============================
const PORT = 5000;

app.listen(PORT, async () => {
  console.log(`🚀 Server running on port ${PORT}`);

  // 🔥 TEST DB CONNECTION ON START
  try {
    await db.query("SELECT 1");
    console.log("✅ Database connected successfully");
  } catch (err) {
    console.error("❌ Database connection failed:", err.message);
  }
});