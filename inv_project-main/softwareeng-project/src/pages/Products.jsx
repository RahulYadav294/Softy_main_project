import React, { useState, useEffect } from 'react';
import { PackagePlus, Trash2 } from 'lucide-react';
import { toast } from 'react-toastify';
import api from '../api';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [quantity, setQuantity] = useState('');
  const [minStock, setMinStock] = useState('');

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await api.get('/products');
      setProducts(res.data);
    } catch (e) {
      toast.error('Failed to load products');
    }
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    try {
      await api.post('/products', {
        name,
        price,
        quantity,
        min_stock: minStock
      });
      toast.success('Product added successfully!');
      setName(''); setPrice(''); setQuantity(''); setMinStock('');
      fetchProducts();
    } catch (e) {
      toast.error('Failed to add product');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    try {
      await api.delete(`/products/${id}`);
      toast.success('Product deleted');
      fetchProducts();
    } catch (e) {
      toast.error('Failed to delete product');
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1>Products Management</h1>
          <p>Add new products and manage catalog</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2rem' }}>
        
        {/* On ultra-wide screens this could be side by side, but for a true clean layout, let's keep them stacked or split carefully */}
        
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1fr) 2.5fr', gap: '2rem' }}>
          <div className="glass-panel" style={{ padding: '2rem', alignSelf: 'start' }}>
            <h2 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '1.15rem' }}>
              <div style={{ padding: '0.5rem', background: '#F3F4F6', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                 <PackagePlus size={18} color="var(--text-primary)" />
              </div>
              Add New Product
            </h2>
            <form onSubmit={handleAddProduct} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-secondary)' }}>Product Name</label>
                <input type="text" value={name} onChange={e => setName(e.target.value)} required placeholder="e.g. Premium Widget" />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-secondary)' }}>Price (₹)</label>
                <input type="number" step="0.01" value={price} onChange={e => setPrice(e.target.value)} required placeholder="0.00" />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-secondary)' }}>Quantity</label>
                  <input type="number" value={quantity} onChange={e => setQuantity(e.target.value)} required placeholder="0" />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-secondary)' }}>Min Stock</label>
                  <input type="number" value={minStock} onChange={e => setMinStock(e.target.value)} required placeholder="5" />
                </div>
              </div>
              <button type="submit" className="primary" style={{ marginTop: '1rem' }}>Add Product</button>
            </form>
          </div>

          <div className="glass-panel" style={{ padding: '2rem' }}>
            <h2 style={{ marginBottom: '1.5rem', fontSize: '1.15rem' }}>Product Catalog</h2>
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Price</th>
                    <th>Quantity</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map(p => (
                    <tr key={p.product_id}>
                      <td style={{ color: 'var(--text-secondary)' }}>#{p.product_id}</td>
                      <td style={{ fontWeight: 500 }}>{p.name}</td>
                      <td>₹{Number(p.price).toFixed(2)}</td>
                      <td>
                        <span className={`badge ${p.quantity < p.min_stock ? 'danger' : 'success'}`}>
                          {p.quantity} in stock
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <button className="icon-btn" onClick={() => handleDelete(p.product_id)} title="Delete">
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {products.length === 0 && (
                    <tr><td colSpan="5" className="text-center" style={{ padding: '3rem 0' }}>No products found in the catalog.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Products;
