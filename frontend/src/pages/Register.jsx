import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { UserPlus } from 'lucide-react';

const Register = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    role: 'acheteur'
  });
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://127.0.0.1:8000/api/register/', {
        username: formData.email, // using email as username
        first_name: formData.firstName,
        last_name: formData.lastName,
        email: formData.email,
        password: formData.password,
        role: formData.role
      });
      navigate('/login');
    } catch (error) {
      console.error('Registration failed', error);
      alert('Erreur lors de l\'inscription');
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <UserPlus size={48} color="var(--primary)" style={{ margin: '0 auto 1rem' }} />
          <h1>Créer un compte</h1>
          <p className="text-muted">Rejoignez notre plateforme de prédiction</p>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="form-grid" style={{ marginBottom: '1.5rem' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Prénom</label>
              <input 
                type="text" 
                name="firstName" 
                className="form-input" 
                placeholder="Votre prénom"
                onChange={handleChange}
                required 
              />
            </div>
            
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Nom</label>
              <input 
                type="text" 
                name="lastName" 
                className="form-input" 
                placeholder="Votre nom"
                onChange={handleChange}
                required 
              />
            </div>
          </div>

          <div className="form-grid" style={{ marginBottom: '1.5rem' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
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

            <div className="form-group" style={{ marginBottom: 0 }}>
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
          </div>

          <div className="form-group" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', marginTop: '2rem' }}>
            <label className="form-label">Je suis un...</label>
            <select name="role" className="form-select" style={{ width: 'fit-content', minWidth: '200px' }} onChange={handleChange} value={formData.role}>
              <option value="acheteur">Acheteur</option>
              <option value="vendeur">Vendeur</option>
            </select>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <button type="submit" className="btn btn-primary" style={{ marginTop: '0.5rem', width: 'fit-content', padding: '0.75rem 3rem' }}>S'inscrire</button>
          </div>
        </form>

        <div className="auth-footer">
          Vous avez déjà un compte ? <Link to="/login">Connectez-vous</Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
