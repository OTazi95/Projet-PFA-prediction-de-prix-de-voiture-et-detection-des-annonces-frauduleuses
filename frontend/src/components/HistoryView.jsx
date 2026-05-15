import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Clock, Car, Tag, ShieldAlert, CheckCircle, AlertTriangle } from 'lucide-react';

const HistoryView = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://127.0.0.1:8000/api/history/', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setHistory(response.data);
      } catch (err) {
        console.error(err);
        setError('Impossible de charger l\'historique.');
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '2rem' }}>Chargement de l'historique...</div>;
  }

  if (error) {
    return <div className="alert alert-danger">{error}</div>;
  }

  if (history.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem', background: 'var(--surface)', borderRadius: '1rem', border: '1px dashed var(--border)' }}>
        <Clock size={48} color="var(--text-muted)" style={{ margin: '0 auto 1rem' }} />
        <h3 style={{ color: 'var(--text)' }}>Aucun historique</h3>
        <p className="text-muted">Vous n'avez pas encore fait d'estimation. Lancez votre première analyse !</p>
      </div>
    );
  }

  return (
    <div className="history-list" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {history.map((item) => (
        <div key={item.id} className="history-card" style={{ 
          background: 'var(--surface)', 
          border: '1px solid var(--border)', 
          borderRadius: '0.75rem', 
          padding: '1.5rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem'
        }}>
          {/* Véhicule Info */}
          <div style={{ flex: '1 1 250px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <Car size={20} color="var(--primary)" />
              <h3 style={{ margin: 0, fontSize: '1.25rem' }}>{item.marque} {item.modele}</h3>
            </div>
            <p className="text-muted" style={{ margin: 0, fontSize: '0.9rem' }}>
              Année: {item.annee} • {item.kilometrage.toLocaleString()} km
            </p>
            <p className="text-muted" style={{ margin: '0.25rem 0 0 0', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <Clock size={12} /> {formatDate(item.created_at)}
            </p>
          </div>

          {/* Prix Info */}
          <div style={{ textAlign: 'right', flex: '1 1 200px' }}>
            <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-muted)' }}>Prix Estimé IA</p>
            <p style={{ margin: 0, fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--primary)' }}>
              {item.prix_estime.toLocaleString()} DHS
            </p>
            
            {item.type_estimation === 'scam_detect' && item.prix_annonce && (
              <div style={{ marginTop: '0.5rem', fontSize: '0.9rem' }}>
                <p style={{ margin: 0, color: 'var(--text-muted)' }}>Prix Demandé: {item.prix_annonce.toLocaleString()} DHS</p>
                {item.status === 'scam' && <span style={{ color: 'var(--danger)', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.25rem' }}><ShieldAlert size={14} /> Alerte Arnaque</span>}
                {item.status === 'overpriced' && <span style={{ color: '#eab308', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.25rem' }}><AlertTriangle size={14} /> Surévalué</span>}
                {item.status === 'fair' && <span style={{ color: 'var(--success)', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.25rem' }}><CheckCircle size={14} /> Prix Correct</span>}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default HistoryView;
