import { useMemo, useState } from "react";
import "./App.css";

function App() {
  const [products, setProducts] = useState([
    {
      id: 1,
      name: "Laptop",
      quantity: 5,
      price: 1200,
      category: "Electronics",
    },
    {
      id: 2,
      name: "Office Chair",
      quantity: 8,
      price: 250,
      category: "Furniture",
    },
  ]);

  const [form, setForm] = useState({
    name: "",
    quantity: "",
    price: "",
    category: "",
  });

  const [editId, setEditId] = useState(null);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");

  const totalProducts = useMemo(() => products.length, [products]);
  const totalStock = useMemo(
    () => products.reduce((sum, product) => sum + Number(product.quantity), 0),
    [products]
  );

  const totalValue = useMemo(
    () =>
      products.reduce(
        (sum, product) =>
          sum + Number(product.quantity) * Number(product.price),
        0
      ),
    [products]
  );

  const filteredProducts = useMemo(() => {
    return products.filter((product) =>
      `${product.name} ${product.category}`
        .toLowerCase()
        .includes(search.toLowerCase())
    );
  }, [products, search]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const resetForm = () => {
    setForm({
      name: "",
      quantity: "",
      price: "",
      category: "",
    });
    setEditId(null);
    setError("");
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (
      !form.name.trim() ||
      !form.quantity ||
      !form.price ||
      !form.category.trim()
    ) {
      setError("Please fill in all fields.");
      return;
    }

    if (Number(form.quantity) < 0 || Number(form.price) < 0) {
      setError("Quantity and price must be 0 or more.");
      return;
    }

    if (editId) {
      setProducts((prev) =>
        prev.map((product) =>
          product.id === editId
            ? {
                ...product,
                name: form.name.trim(),
                quantity: Number(form.quantity),
                price: Number(form.price),
                category: form.category.trim(),
              }
            : product
        )
      );
    } else {
      const newProduct = {
        id: Date.now(),
        name: form.name.trim(),
        quantity: Number(form.quantity),
        price: Number(form.price),
        category: form.category.trim(),
      };

      setProducts((prev) => [newProduct, ...prev]);
    }

    resetForm();
  };

  const handleEdit = (product) => {
    setForm({
      name: product.name,
      quantity: product.quantity.toString(),
      price: product.price.toString(),
      category: product.category,
    });
    setEditId(product.id);
    setError("");
  };

  const handleDelete = (id) => {
    const confirmed = window.confirm("Are you sure you want to delete this product?");
    if (!confirmed) return;

    setProducts((prev) => prev.filter((product) => product.id !== id));

    if (editId === id) {
      resetForm();
    }
  };

  return (
    <div className="app">
      <header className="hero">
        <div>
          <p className="eyebrow">Sprint 2 Frontend</p>
          <h1>Inventory Management Dashboard</h1>
          <p className="hero-text">
            A React single-page application with professional UI and full CRUD
            functionality.
          </p>
        </div>
      </header>

      <section className="stats-grid">
        <article className="stat-card">
          <span className="stat-label">Total Products</span>
          <h2>{totalProducts}</h2>
        </article>

        <article className="stat-card">
          <span className="stat-label">Total Stock</span>
          <h2>{totalStock}</h2>
        </article>

        <article className="stat-card">
          <span className="stat-label">Inventory Value</span>
          <h2>${totalValue.toLocaleString()}</h2>
        </article>
      </section>

      <section className="content-grid">
        <div className="card">
          <div className="card-header">
            <h3>{editId ? "Edit Product" : "Add New Product"}</h3>
            <p>Enter product details below.</p>
          </div>

          <form className="product-form" onSubmit={handleSubmit}>
            {error && <div className="error-box">{error}</div>}

            <div className="form-group">
              <label>Product Name</label>
              <input
                type="text"
                name="name"
                placeholder="e.g. Wireless Mouse"
                value={form.name}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Category</label>
              <input
                type="text"
                name="category"
                placeholder="e.g. Electronics"
                value={form.category}
                onChange={handleChange}
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Quantity</label>
                <input
                  type="number"
                  name="quantity"
                  placeholder="0"
                  value={form.quantity}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label>Price ($)</label>
                <input
                  type="number"
                  name="price"
                  placeholder="0"
                  value={form.price}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="form-actions">
              <button className="btn btn-primary" type="submit">
                {editId ? "Update Product" : "Add Product"}
              </button>

              <button
                className="btn btn-secondary"
                type="button"
                onClick={resetForm}
              >
                Clear
              </button>
            </div>
          </form>
        </div>

        <div className="card">
          <div className="card-header card-header-row">
            <div>
              <h3>Product Inventory</h3>
              <p>Search, edit, and delete products.</p>
            </div>

            <input
              className="search-input"
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {filteredProducts.length === 0 ? (
            <div className="empty-state">
              <p>No matching products found.</p>
            </div>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Category</th>
                    <th>Qty</th>
                    <th>Price</th>
                    <th>Total</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredProducts.map((product) => (
                    <tr key={product.id}>
                      <td>{product.name}</td>
                      <td>{product.category}</td>
                      <td>{product.quantity}</td>
                      <td>${Number(product.price).toLocaleString()}</td>
                      <td>
                        $
                        {(
                          Number(product.quantity) * Number(product.price)
                        ).toLocaleString()}
                      </td>
                      <td className="action-cell">
                        <button
                          className="btn btn-edit"
                          onClick={() => handleEdit(product)}
                        >
                          Edit
                        </button>
                        <button
                          className="btn btn-delete"
                          onClick={() => handleDelete(product.id)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

export default App;