import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Archive, Lock, User } from 'lucide-react';
import api from '../api';
import './Login.css';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/login', { username, password });
      if (res.data.success) {
        localStorage.setItem('user', JSON.stringify(res.data.user));
        toast.success(res.data.message);
        navigate('/dashboard');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-box glass-panel">
        <div className="login-header">
          <div className="login-logo">
            <Archive size={40} color="var(--accent-primary)" />
          </div>
          <h1>Welcome Back</h1>
          <p>Sign in to InvSystem</p>
        </div>

        <form onSubmit={handleLogin} className="login-form">
          <div className="input-group">
            <User size={20} className="input-icon" />
            <input 
              type="text" 
              placeholder="Username" 
              value={username} 
              onChange={(e) => setUsername(e.target.value)}
              required 
            />
          </div>
          <div className="input-group">
            <Lock size={20} className="input-icon" />
            <input 
              type="password" 
              placeholder="Password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)}
              required 
            />
          </div>
          <button type="submit" className="primary btn-block" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
