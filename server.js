// ✅ Load env FIRST
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const db = require("./mysql");

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const app = express();
const SECRET = process.env.JWT_SECRET || "supersecretkey";

// ==============================
// ✅ MIDDLEWARE
// ==============================
app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE"],
}));

app.use(express.json());

// ==============================
// 🔐 TOKEN MIDDLEWARE (FIXED)
// ==============================
const verifyToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];

  if (!authHeader) {
    return res.status(401).json({ error: "Access denied. No token." });
  }

  // ✅ Expect: Bearer TOKEN
  const parts = authHeader.split(" ");

  if (parts.length !== 2 || parts[0] !== "Bearer") {
    return res.status(401).json({ error: "Invalid token format" });
  }

  const token = parts[1];

  try {
    const decoded = jwt.verify(token, SECRET);

    // 🔥 Debug log (helps you + professor)
    console.log("✅ Token verified:", decoded.email);

    req.user = decoded;
    next();
  } catch (err) {
    console.error("❌ TOKEN ERROR:", err.message);
    return res.status(403).json({ error: "Invalid or expired token." });
  }
};

// ==============================
// ✅ TEST ROUTE
// ==============================
app.get("/", (req, res) => {
  res.send("API is running 🚀");
});

// ==============================
// 🔐 AUTH ROUTES
// ==============================

// ✅ REGISTER
app.post("/users", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: "All fields required" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await db.query(
      "INSERT INTO users (name, email, password) VALUES (?, ?, ?)",
      [name, email, hashedPassword]
    );

    res.status(201).json({ message: "User registered ✅" });
  } catch (err) {
    console.error("REGISTER ERROR:", err);
    res.status(500).json({ error: "Registration failed" });
  }
});

// 🔐 LOGIN
app.post("/users/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const [rows] = await db.query(
      "SELECT * FROM users WHERE email = ?",
      [email]
    );

    if (rows.length === 0) {
      return res.status(400).json({ error: "User not found" });
    }

    const user = rows[0];

    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) {
      return res.status(400).json({ error: "Invalid password" });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email },
      SECRET,
      { expiresIn: "1h" }
    );

    res.json({
      message: "Login successful ✅",
      token,
    });

  } catch (err) {
    console.error("LOGIN ERROR:", err);
    res.status(500).json({ error: "Login failed" });
  }
});

// ==============================
// 📦 PRODUCT ROUTES (PROTECTED)
// ==============================

// 🔥 GET PRODUCTS
app.get("/api/products", verifyToken, async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM products");
    res.json(rows);
  } catch (err) {
    console.error("GET ERROR:", err);
    res.status(500).json({ error: "Failed to fetch products" });
  }
});

// 🔥 ADD PRODUCT
app.post("/api/products", verifyToken, async (req, res) => {
  try {
    const { name, category, quantity, price } = req.body;

    if (!name || !category || quantity == null || price == null) {
      return res.status(400).json({ error: "All fields required" });
    }

    const [result] = await db.query(
      "INSERT INTO products (name, category, quantity, price) VALUES (?, ?, ?, ?)",
      [name, category, quantity, price]
    );

    res.status(201).json({
      message: "Product added ✅",
      id: result.insertId,
    });

  } catch (err) {
    console.error("POST ERROR:", err);
    res.status(500).json({ error: "Failed to add product" });
  }
});

// 🔥 UPDATE PRODUCT (FIXED)
app.put("/api/products/:id", verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, category, quantity, price } = req.body;

    if (!name || !category || quantity == null || price == null) {
      return res.status(400).json({ error: "All fields required" });
    }

    const [result] = await db.query(
      "UPDATE products SET name=?, category=?, quantity=?, price=? WHERE id=?",
      [name, category, quantity, price, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Product not found" });
    }

    res.json({ message: "Product updated ✅" });

  } catch (err) {
    console.error("PUT ERROR:", err);
    res.status(500).json({ error: "Failed to update product" });
  }
});

// 🔥 DELETE PRODUCT
app.delete("/api/products/:id", verifyToken, async (req, res) => {
  try {
    const { id } = req.params;

    const [result] = await db.query(
      "DELETE FROM products WHERE id = ?",
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Product not found" });
    }

    res.json({ message: "Product deleted ✅" });

  } catch (err) {
    console.error("DELETE ERROR:", err);
    res.status(500).json({ error: "Failed to delete product" });
  }
});

// ==============================
// 🚀 START SERVER
// ==============================
const PORT = 5000;

app.listen(PORT, async () => {
  console.log(`🚀 Server running on port ${PORT}`);

  try {
    await db.query("SELECT 1");
    console.log("✅ Database connected successfully");
  } catch (err) {
    console.error("❌ Database connection failed:", err.message);
  }
});