const express = require("express");
const cors = require("cors");
const db = require("./mysql");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("API is running");
});

app.get("/api/products", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM products");
    res.json(rows);
  } catch (err) {
    console.error("GET /api/products error:", err);
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/products", async (req, res) => {
  try {
    const { name, quantity, price } = req.body;
    const [result] = await db.query(
      "INSERT INTO products (name, quantity, price) VALUES (?, ?, ?)",
      [name, quantity, price]
    );
    res.status(201).json({ id: result.insertId });
  } catch (err) {
    console.error("POST /api/products error:", err);
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});