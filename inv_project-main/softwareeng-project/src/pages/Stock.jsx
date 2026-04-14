import React, { useState, useEffect } from 'react';
import { Archive } from 'lucide-react';
import api from '../api';

const Stock = () => {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    fetchStock();
  }, []);

  const fetchStock = async () => {
    try {
      const res = await api.get('/products');
      setProducts(res.data);
    } catch (e) {}
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1>Stock Levels</h1>
          <p>Current inventory status and minimum stock thresholds</p>
        </div>
      </div>

      <div className="glass-panel" style={{ padding: '2rem' }}>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Product</th>
                <th>Current Stock</th>
                <th>Minimum Required</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {products.map(p => (
                <tr key={p.product_id}>
                  <td style={{ fontWeight: 500, display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ background: '#F3F4F6', color: 'var(--text-secondary)', padding: '0.5rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                      <Archive size={16} />
                    </div>
                    {p.name}
                  </td>
                  <td style={{ fontSize: '1.1rem', fontWeight: 600 }}>{p.quantity}</td>
                  <td style={{ color: 'var(--text-secondary)' }}>{p.min_stock}</td>
                  <td>
                    {p.quantity < p.min_stock ? 
                      <span className="badge danger">Low Stock</span> : 
                      <span className="badge success">Healthy</span>
                    }
                  </td>
                </tr>
              ))}
               {products.length === 0 && (
                  <tr><td colSpan="4" className="text-center">No inventory found.</td></tr>
                )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Stock;
