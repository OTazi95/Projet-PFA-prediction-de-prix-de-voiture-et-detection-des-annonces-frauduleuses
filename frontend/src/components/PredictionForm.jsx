import React, { useState } from 'react';
import axios from 'axios';
import { Car, DollarSign, AlertCircle, CheckCircle } from 'lucide-react';
import { carData } from '../data/carData';

const marquesList = Object.keys(carData).sort();

const yearsList = [];
for (let y = 2026; y >= 1990; y--) {
  yearsList.push(y);
}

const PredictionForm = ({ isAcheteur = false }) => {
  const [formData, setFormData] = useState({
    marque: marquesList[0],
    modele: carData[marquesList[0]][0],
    annee: new Date().getFullYear(),
    kilometrage: '',
    boite: 'Manuelle',
    carburant: 'Diesel',
    nombre_portes: 5,
    puissance_fiscale: 6,
    premiere_main: 'Non',
    etat: 'Bon',
    prix_annonce: '' // Only used for Acheteur scam detect
  });

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'marque') {
      // When marque changes, automatically set modele to the first model of the new marque
      setFormData({ 
        ...formData, 
        marque: value, 
        modele: carData[value][0] 
      });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    const token = localStorage.getItem('token');
    
    try {
      if (isAcheteur && formData.prix_annonce) {
        // SCAM DETECT MODE
        const response = await axios.post(
          'http://127.0.0.1:8000/api/scam-detect/',
          formData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setResult(response.data);
      } else {
        // STANDARD PREDICT MODE
        const response = await axios.post(
          'http://127.0.0.1:8000/api/predict/',
          formData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setResult(response.data);
      }
    } catch (err) {
      console.error(err);
      const backendError = err.response?.data?.error;
      setError(backendError || 'Erreur lors de la prédiction. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="prediction-form-container">
      <form onSubmit={handleSubmit} className="prediction-form">
        <div className="form-grid">
          <div className="form-group">
            <label className="form-label">Marque</label>
            <select name="marque" className="form-select" value={formData.marque} onChange={handleChange} required>
              {marquesList.map(marque => (
                <option key={marque} value={marque}>{marque}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Modèle</label>
            <select name="modele" className="form-select" value={formData.modele} onChange={handleChange} required>
              {carData[formData.marque]?.map(modele => (
                <option key={modele} value={modele}>{modele}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Année</label>
            <select name="annee" className="form-select" value={formData.annee} onChange={handleChange} required>
              {yearsList.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Kilométrage</label>
            <input type="number" name="kilometrage" className="form-input" min="0" step="1000" placeholder="ex: 85000" value={formData.kilometrage} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label className="form-label">Boîte de vitesse</label>
            <select name="boite" className="form-select" value={formData.boite} onChange={handleChange}>
              <option value="Manuelle">Manuelle</option>
              <option value="Automatique">Automatique</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Carburant</label>
            <select name="carburant" className="form-select" value={formData.carburant} onChange={handleChange}>
              <option value="Diesel">Diesel</option>
              <option value="Essence">Essence</option>
              <option value="Hybride">Hybride</option>
              <option value="Electrique">Electrique</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Puissance Fiscale (CV)</label>
            <select name="puissance_fiscale" className="form-select" value={formData.puissance_fiscale} onChange={handleChange} required>
              <option value="6">6</option>
              <option value="7">7</option>
              <option value="8">8</option>
              <option value="9">9</option>
              <option value="10">10</option>
              <option value="11">11</option>
              <option value="13">13</option>
              <option value="14">14</option>
              <option value="15">sup a 14</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">État</label>
            <select name="etat" className="form-select" value={formData.etat} onChange={handleChange}>
              <option value="Excellent">Excellent</option>
              <option value="Tres bon">Très bon</option>
              <option value="Bon">Bon</option>
              <option value="Correct">Correct</option>
              <option value="Endommage">Endommagé</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Première main ?</label>
            <select name="premiere_main" className="form-select" value={formData.premiere_main} onChange={handleChange}>
              <option value="Oui">Oui</option>
              <option value="Non">Non</option>
            </select>
          </div>
          
          {isAcheteur && (
            <div className="form-group">
              <label className="form-label" style={{ color: 'var(--danger)' }}>Prix demandé (Optionnel)</label>
              <input type="number" name="prix_annonce" className="form-input" placeholder="Pour détecter les arnaques" value={formData.prix_annonce} onChange={handleChange} />
            </div>
          )}
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '1rem' }}>
          <button 
            type="submit" 
            className="btn btn-primary" 
            disabled={loading}
            style={{ width: 'fit-content', padding: '0.75rem 3rem' }}
          >
            {loading ? 'Analyse par IA en cours...' : (isAcheteur ? 'Lancer l\'analyse' : 'Estimer le prix optimal')}
          </button>
        </div>
      </form>

      {error && (
        <div className="alert alert-danger" style={{ marginTop: '1.5rem', padding: '1rem', background: '#fee2e2', color: '#b91c1c', borderRadius: '0.5rem' }}>
          {error}
        </div>
      )}

      {result && (
        <div className="prediction-result" style={{ marginTop: '2rem', padding: '1.5rem', background: 'var(--surface)', borderRadius: '1rem', border: '1px solid var(--border)', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
          {result.status ? (
            // SCAM DETECT RESULT
            <div style={{ textAlign: 'center' }}>
              {result.status === 'scam' ? <AlertCircle size={48} color="var(--danger)" style={{ margin: '0 auto' }} /> : 
               result.status === 'overpriced' ? <AlertCircle size={48} color="#eab308" style={{ margin: '0 auto' }} /> :
               <CheckCircle size={48} color="var(--success)" style={{ margin: '0 auto' }} />}
               
              <h3 style={{ fontSize: '1.5rem', margin: '1rem 0' }}>
                {result.status === 'scam' ? 'Alerte Arnaque !' : 
                 result.status === 'overpriced' ? 'Véhicule Surévalué' : 'Prix Correct'}
              </h3>
              <p style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>{result.message}</p>
              
              <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', marginTop: '1.5rem' }}>
                <div>
                  <p className="text-muted">Prix Estimé (IA)</p>
                  <p style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>{Math.abs(result.predicted_price).toLocaleString()} DHS</p>
                </div>
                <div>
                  <p className="text-muted">Prix Demandé</p>
                  <p style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>{Math.abs(result.prix_annonce).toLocaleString()} DHS</p>
                </div>
              </div>
            </div>
          ) : (
            // STANDARD PREDICT RESULT
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '3rem', fontWeight: 'bold', color: 'var(--success)', margin: '0 auto', lineHeight: '1' }}>DH</div>
              <h3 style={{ fontSize: '1.5rem', margin: '1rem 0', color: 'var(--text)' }}>Estimation IA Terminée</h3>
              <p className="text-muted" style={{ marginBottom: '1rem' }}>Basé sur l'analyse du marché de l'occasion actuel.</p>
              
              <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '1.5rem', borderRadius: '0.75rem', display: 'inline-block' }}>
                <p style={{ fontSize: '1rem', color: '#166534', marginBottom: '0.5rem' }}>Fourchette de Prix Recommandée</p>
                <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#15803d' }}>
                  {Math.abs(result.min_price).toLocaleString()} - {Math.abs(result.max_price).toLocaleString()} DHS
                </p>
                <p style={{ fontSize: '0.875rem', color: '#166534', marginTop: '0.5rem' }}>
                  Valeur centrale: {Math.abs(result.predicted_price).toLocaleString()} DHS
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PredictionForm;
