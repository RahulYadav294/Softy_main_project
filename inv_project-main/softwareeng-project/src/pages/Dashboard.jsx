import React, { useState, useEffect } from 'react';
import { Package, TrendingUp, AlertTriangle, Users } from 'lucide-react';
import api from '../api';
import './Dashboard.css';

const Dashboard = () => {
  const [data, setData] = useState({
    total_products: 0,
    low_stock: 0,
    total_sales: 0,
    total_suppliers: 0,
    recent_sales: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const res = await api.get('/dashboard');
      setData(res.data);
    } catch (error) {
      console.error("Dashboard fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    { title: 'Total Products', value: data.total_products, icon: Package, color: 'blue' },
    { title: 'Low Stock Alerts', value: data.low_stock, icon: AlertTriangle, color: 'red' },
    { title: 'Total Sales', value: data.total_sales, icon: TrendingUp, color: 'green' },
    { title: 'Total Suppliers', value: data.total_suppliers, icon: Users, color: 'purple' },
  ];

  if (loading) return <div className="page-container"><p>Loading dashboard...</p></div>;

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1>Dashboard Overview</h1>
          <p>Welcome to the Inventory Management System</p>
        </div>
      </div>

      <div className="stats-grid">
        {statCards.map((stat, index) => (
          <div key={index} className="stat-card glass-panel">
            <div className={`stat-icon-wrapper ${stat.color}`}>
              <stat.icon size={24} />
            </div>
            <div className="stat-details">
              <h3>{stat.title}</h3>
              <p className="stat-value">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="dashboard-content">
        <div className="recent-sales-card glass-panel">
          <h2>Recent Sales</h2>
          <div className="table-container mt-4">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Product</th>
                  <th>Quantity</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {data.recent_sales.map(sale => (
                  <tr key={sale.sales_id}>
                    <td>#{sale.sales_id}</td>
                    <td>{sale.product_name}</td>
                    <td>{sale.quantity}</td>
                    <td>{new Date(sale.date).toLocaleDateString()}</td>
                  </tr>
                ))}
                {data.recent_sales.length === 0 && (
                  <tr><td colSpan="4" className="text-center">No recent sales found</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
