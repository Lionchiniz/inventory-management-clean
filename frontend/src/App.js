import { useState } from "react";
import "./App.css";

function App() {
  const [products, setProducts] = useState([]);
  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState("");
  const [price, setPrice] = useState("");
  const [editId, setEditId] = useState(null);
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!name || !quantity || !price) {
      setError("All fields are required!");
      return;
    }

    if (editId) {
      const updatedProducts = products.map((p) =>
        p.id === editId ? { ...p, name, quantity, price } : p
      );
      setProducts(updatedProducts);
      setEditId(null);
    } else {
      const newProduct = {
        id: Date.now(),
        name,
        quantity,
        price,
      };
      setProducts([...products, newProduct]);
    }

    setName("");
    setQuantity("");
    setPrice("");
    setError("");
  };

  const handleDelete = (id) => {
    if (!window.confirm("Delete this product?")) return;
    setProducts(products.filter((p) => p.id !== id));
  };

  const handleEdit = (product) => {
    setName(product.name);
    setQuantity(product.quantity);
    setPrice(product.price);
    setEditId(product.id);
  };

  return (
    <div className="container">
      <h1>Inventory Management</h1>

      <form className="form" onSubmit={handleSubmit}>
        {error && <p className="error">{error}</p>}

        <input
          className="input"
          type="text"
          placeholder="Product Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <input
          className="input"
          type="number"
          placeholder="Quantity"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
        />

        <input
          className="input"
          type="number"
          placeholder="Price"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
        />

        <button className="button" type="submit">
          {editId ? "Update Product" : "Add Product"}
        </button>
      </form>

      <h2>Product List</h2>

      {products.length === 0 ? (
        <p>No products added yet.</p>
      ) : (
        <ul className="list">
          {products.map((product) => (
            <li key={product.id} className="list-item">
              <span>
                <strong>{product.name}</strong> | Qty: {product.quantity} | $
                {product.price}
              </span>

              <div>
                <button
                  className="edit-btn"
                  onClick={() => handleEdit(product)}
                >
                  Edit
                </button>

                <button
                  className="delete-btn"
                  onClick={() => handleDelete(product.id)}
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default App;