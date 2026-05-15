import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, CarFront, History, ShieldAlert } from 'lucide-react';
import { jwtDecode } from 'jwt-decode';
import PredictionForm from '../components/PredictionForm';
import HistoryView from '../components/HistoryView';

const AcheteurDashboard = () => {
  const navigate = useNavigate();
  const [userName, setUserName] = useState('');
  const [showForm, setShowForm] = useState(null); // null, 'predict', 'scam', 'history'

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    
    try {
      const decoded = jwtDecode(token);
      if (decoded.role !== 'acheteur') {
        navigate('/vendeur'); // wrong role redirection
      }
      setUserName(decoded.first_name || 'Acheteur');
    } catch (err) {
      navigate('/login');
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <div className="app-container dashboard-bg">
      <nav className="navbar">
        <div className="navbar-brand" style={{ flex: 1 }}>
          <CarFront color="white" />
          AutoHemza
        </div>
        
        <div className="navbar-links" style={{ flex: 2, display: 'flex', justifyContent: 'center', gap: '2.5rem', alignItems: 'center' }}>
          <span className={`navbar-link ${showForm === null ? 'active' : ''}`} style={{ cursor: 'pointer' }} onClick={() => setShowForm(null)}>Accueil</span>
          <span className={`navbar-link ${showForm === 'predict' ? 'active' : ''}`} style={{ cursor: 'pointer' }} onClick={() => setShowForm('predict')}>Prédire le prix</span>
          <span className={`navbar-link ${showForm === 'scam' ? 'active' : ''}`} style={{ cursor: 'pointer' }} onClick={() => setShowForm('scam')}>Détection d'arnaque</span>
          <span className={`navbar-link ${showForm === 'history' ? 'active' : ''}`} style={{ cursor: 'pointer' }} onClick={() => setShowForm('history')}>Historique</span>
        </div>

        <div className="navbar-actions" style={{ flex: 1, display: 'flex', justifyContent: 'flex-end' }}>
          <button onClick={handleLogout} className="btn" style={{ width: 'fit-content', padding: '0.5rem 1.5rem', backgroundColor: 'transparent', border: '1px solid white', color: 'white', transition: 'background 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
            <LogOut size={18} /> Déconnexion
          </button>
        </div>
      </nav>

      <main className="main-content">
        <h1 style={{ fontSize: '3rem', marginBottom: '1rem', fontWeight: '800', letterSpacing: '-0.02em' }}>
          <span style={{ color: 'var(--text)' }}>Achetez votre voiture </span>
          <span style={{ color: 'var(--primary)' }}>au juste prix.</span>
        </h1>
        <p className="text-muted" style={{ marginBottom: '3rem', fontSize: '1.2rem', maxWidth: '600px' }}>
          Découvrez nos outils IA pour acheter votre future voiture au juste prix et en toute sécurité.
        </p>

        {showForm ? (
          <div className="card" style={{ marginBottom: '2rem' }}>
            <div style={{ marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '1rem', textAlign: 'center' }}>
              <h2 className="card-title" style={{ margin: 0 }}>
                {showForm === 'predict' ? 'Prédire le prix' : showForm === 'scam' ? 'Détection d\'arnaque' : 'Historique des prédictions'}
              </h2>
            </div>
            {showForm === 'history' ? (
              <HistoryView />
            ) : (
              <PredictionForm isAcheteur={showForm === 'scam'} />
            )}
          </div>
        ) : (
          <>
            <div className="dashboard-grid">
            <div className="card">
              <div className="card-icon">
                <CarFront size={24} />
              </div>
              <h2 className="card-title">Prédire le prix</h2>
              <p className="card-text">
                Estimez le prix d'un véhicule basé sur son modèle, son année et son kilométrage en utilisant notre IA.
              </p>
              <button className="btn btn-primary" onClick={() => setShowForm('predict')}>Lancer l'estimation</button>
            </div>

            <div className="card">
              <div className="card-icon" style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)' }}>
                <ShieldAlert size={24} />
              </div>
              <h2 className="card-title">Détection d'arnaque</h2>
              <p className="card-text">
                Analysez l'annonce du vendeur pour détecter des comportements frauduleux ou des incohérences de prix.
              </p>
              <button className="btn btn-primary" onClick={() => setShowForm('scam')}>Scanner une annonce</button>
            </div>

            <div className="card">
              <div className="card-icon" style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)' }}>
                <History size={24} />
              </div>
              <h2 className="card-title">Historique des prédictions</h2>
              <p className="card-text">
                Retrouvez toutes vos anciennes estimations pour comparer les véhicules que vous envisagez d'acheter.
              </p>
              <button className="btn btn-primary" onClick={() => setShowForm('history')}>Voir l'historique</button>
            </div>
          </div>
        </>
        )}
      </main>
    </div>
  );
};

export default AcheteurDashboard;
