import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import TargetEncoder, StandardScaler
from sklearn.metrics import r2_score
import xgboost as xgb
import joblib
import os

# Configuration des chemins
MODEL_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_PATH = os.path.join(MODEL_DIR, "avito_cars_clean.csv")

print("Chargement des données...")
df = pd.read_csv(DATA_PATH)

features = ['annee', 'boite', 'carburant', 'kilometrage', 'marque', 'modele',
            'nombre_portes', 'premiere_main', 'puissance_fiscale', 'etat']
target = 'prix'

df = df.dropna(subset=features + [target])

# Nettoyage des valeurs extrêmes pour un meilleur apprentissage
df = df[(df['prix'] >= 10000) & (df['prix'] <= 1000000)]
df = df[(df['kilometrage'] >= 0) & (df['kilometrage'] <= 600000)]

X = df[features].copy()
y = df[target]

# Conversion explicite en string pour les catégories
categorical_cols = ['marque', 'modele', 'carburant', 'boite', 'premiere_main', 'etat']
for col in categorical_cols:
    X[col] = X[col].astype(str)

numeric_cols = ['annee', 'kilometrage', 'nombre_portes', 'puissance_fiscale']

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Création du préprocesseur robuste (TargetEncoder est très performant et gère les catégories inconnues)
preprocessor = ColumnTransformer(
    transformers=[
        ('num', StandardScaler(), numeric_cols),
        ('cat', TargetEncoder(target_type='continuous'), categorical_cols)
    ])

print("Entraînement de la Pipeline XGBoost Professionnelle...")
pipeline = Pipeline(steps=[
    ('preprocessor', preprocessor),
    ('regressor', xgb.XGBRegressor(n_estimators=150, learning_rate=0.1, max_depth=7, random_state=42, n_jobs=-1))
])

pipeline.fit(X_train, y_train)

y_pred = pipeline.predict(X_test)
r2 = r2_score(y_test, y_pred)
print(f"Modèle XGBoost Pipeline R2: {r2:.4f}")

# Sauvegarde
joblib.dump(pipeline, os.path.join(MODEL_DIR, 'best_pipeline.pkl'))
joblib.dump(features, os.path.join(MODEL_DIR, 'model_features.pkl'))

print("Modèle robuste sauvegardé avec succès dans le dossier ml_model !")
