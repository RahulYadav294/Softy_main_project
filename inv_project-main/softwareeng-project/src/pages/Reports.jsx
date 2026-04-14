import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import api from '../api';

const Reports = () => {
  const [report, setReport] = useState(null);

  useEffect(() => {
    fetchReport();
  }, []);

  const fetchReport = async () => {
    try {
      const res = await api.get('/reports');
      setReport(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  if (!report) return <div className="page-container"><p style={{color: 'var(--text-secondary)'}}>Loading reports...</p></div>;

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1>Analytics & Reports</h1>
          <p>Sales trends and product performance visualization</p>
        </div>
      </div>

      <div style={{ display: 'grid', gap: '2.5rem' }}>
        
        <div className="glass-panel" style={{ padding: '2.5rem' }}>
          <h2 style={{ marginBottom: '2rem', fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-primary)' }}>Sales Trend</h2>
          <div style={{ width: '100%', height: 350 }}>
            <ResponsiveContainer>
              <LineChart data={report.sales_trend} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
                <XAxis dataKey="date" stroke="#9CA3AF" tick={{fill: '#6B7280', fontSize: 12}} tickLine={false} axisLine={false} dy={10} />
                <YAxis stroke="#9CA3AF" tick={{fill: '#6B7280', fontSize: 12}} tickLine={false} axisLine={false} dx={-10} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} 
                  itemStyle={{ color: '#111827' }}
                />
                <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
                <Line type="monotone" dataKey="total" name="Total Sold" stroke="#111827" strokeWidth={3} dot={{ r: 4, fill: '#111827', strokeWidth: 0 }} activeDot={{ r: 6, strokeWidth: 0 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '2.5rem' }}>
          <h2 style={{ marginBottom: '2rem', fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-primary)' }}>Top Products by Sales Volume</h2>
          <div style={{ width: '100%', height: 400 }}>
            <ResponsiveContainer>
              <BarChart data={report.product_sales} margin={{ top: 5, right: 30, left: 20, bottom: 5 }} barSize={32}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
                <XAxis dataKey="name" stroke="#9CA3AF" tick={{fill: '#6B7280', fontSize: 12}} tickLine={false} axisLine={false} dy={10} />
                <YAxis stroke="#9CA3AF" tick={{fill: '#6B7280', fontSize: 12}} tickLine={false} axisLine={false} dx={-10} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                  cursor={{fill: '#F3F4F6'}} 
                />
                <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
                <Bar dataKey="total_sold" name="Total Units Sold" fill="#111827" radius={[4, 4, 0, 0]} />
                <Bar dataKey="num_transactions" name="Transactions" fill="#9CA3AF" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Reports;
