import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { LogIn } from 'lucide-react';
import { jwtDecode } from 'jwt-decode';

const Login = () => {
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://127.0.0.1:8000/api/login/', {
        username: credentials.email, // using email as username
        password: credentials.password
      });
      
      const token = response.data.access;
      localStorage.setItem('token', token);
      
      // Decode token to get the user's role
      const decoded = jwtDecode(token);
      
      if (decoded.role === 'vendeur') {
        navigate('/vendeur');
      } else {
        navigate('/acheteur');
      }
      
    } catch (err) {
      console.error('Login error', err);
      setError('Email ou mot de passe incorrect.');
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <LogIn size={48} color="var(--primary)" style={{ margin: '0 auto 1rem' }} />
          <h1>Connexion</h1>
          <p className="text-muted">Accédez à votre espace personnel</p>
        </div>
        
        {error && <div style={{ color: 'var(--danger)', marginBottom: '1rem', textAlign: 'center' }}>{error}</div>}

        <form onSubmit={handleSubmit} >
          <div className="form-group">
            <label className="form-label">Email</label>
            <input 
              type="email" 
              name="email" 
              className="form-input" 
              placeholder="vous@exemple.com"
              onChange={handleChange}
              required 
            />
          </div>

          <div className="form-group">
            <label className="form-label">Mot de passe</label>
            <input 
              type="password" 
              name="password" 
              className="form-input" 
              placeholder="••••••••"
              onChange={handleChange}
              required 
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', marginTop: '1.5rem' }}>
            <button type="submit" className="btn btn-primary" style={{ width: 'fit-content', padding: '0.75rem 3rem' }}>Se connecter</button>
          </div>
        </form>

        <div className="auth-footer">
          Pas encore de compte ? <Link to="/register">Inscrivez-vous</Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
