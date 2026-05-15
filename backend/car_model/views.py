from rest_framework import generics, permissions
from .serializers import RegisterSerializer, UserSerializer, PredictionHistorySerializer
from .models import PredictionHistory
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework.views import APIView
from rest_framework.response import Response
import os
import joblib
import pandas as pd

# Load pipeline safely at startup
MODEL_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'ml_model')
model_load_error = None
try:
    best_pipeline = joblib.load(os.path.join(MODEL_DIR, 'best_pipeline.pkl'))
    model_features = joblib.load(os.path.join(MODEL_DIR, 'model_features.pkl'))
except Exception as e:
    print("Warning: Could not load ML pipeline.", e)
    model_load_error = str(e)
    best_pipeline, model_features = None, None


User = get_user_model()

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        # Add custom claims
        token['role'] = user.role
        token['username'] = user.username
        token['first_name'] = user.first_name
        token['last_name'] = user.last_name
        return token

class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = (permissions.AllowAny,)
    serializer_class = RegisterSerializer

class UserDetailView(generics.RetrieveAPIView):
    queryset = User.objects.all()
    permission_classes = (permissions.IsAuthenticated,)
    serializer_class = UserSerializer

    def get_object(self):
        return self.request.user

class PredictView(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def post(self, request):
        if not best_pipeline:
            return Response({'error': f'Model not loaded: {model_load_error}'}, status=500)
        
        try:
            data = request.data
            
            # Prepare input data in the exact order as a dictionary for DataFrame
            input_dict = {feature: [data.get(feature)] for feature in model_features}
            input_df = pd.DataFrame(input_dict)

            predicted_price = best_pipeline.predict(input_df)[0]

            # Return a range (+/- 5% as requested by user)
            min_price = int(predicted_price * 0.95)
            max_price = int(predicted_price * 1.05)
            
            # Save history
            PredictionHistory.objects.create(
                user=request.user,
                marque=data.get('marque', ''),
                modele=data.get('modele', ''),
                annee=int(data.get('annee', 2000)),
                kilometrage=int(data.get('kilometrage', 0)),
                prix_estime=int(predicted_price),
                type_estimation='standard'
            )
            
            return Response({
                'predicted_price': int(predicted_price),
                'min_price': min_price,
                'max_price': max_price
            })
            
        except Exception as e:
            return Response({'error': str(e)}, status=400)

class ScamDetectView(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def post(self, request):
        # Only Acheteur can use this
        if request.user.role != 'acheteur':
            return Response({'error': 'Unauthorized'}, status=403)
            
        if not best_pipeline:
            return Response({'error': 'Model not loaded'}, status=500)
            
        try:
            data = request.data
            prix_annonce = float(data.get('prix_annonce', 0))
            
            input_dict = {feature: [data.get(feature)] for feature in model_features}
            input_df = pd.DataFrame(input_dict)

            predicted_price = best_pipeline.predict(input_df)[0]
            
            # Scam logic: 
            # If asking price is < 70% of predicted -> Highly suspicious (too good to be true)
            # If asking price is > 130% of predicted -> Overpriced
            # Else -> Fair price
            
            ratio = prix_annonce / predicted_price
            
            status = 'fair'
            message = 'Le prix semble correct et correspond au marché.'
            confidence = 85
            
            if ratio < 0.7:
                status = 'scam'
                message = 'Attention ! Le prix est anormalement bas. Risque élevé d\'arnaque.'
                confidence = 95
            elif ratio > 1.3:
                status = 'overpriced'
                message = 'Véhicule probablement surestimé par le vendeur.'
                confidence = 90
                
            # Save history
            PredictionHistory.objects.create(
                user=request.user,
                marque=data.get('marque', ''),
                modele=data.get('modele', ''),
                annee=int(data.get('annee', 2000)),
                kilometrage=int(data.get('kilometrage', 0)),
                prix_estime=int(predicted_price),
                prix_annonce=int(prix_annonce),
                status=status,
                type_estimation='scam_detect'
            )
                
            return Response({
                'predicted_price': int(predicted_price),
                'prix_annonce': int(prix_annonce),
                'status': status,
                'message': message,
                'ratio': round(ratio, 2)
            })
            
        except Exception as e:
            return Response({'error': str(e)}, status=400)

class HistoryListView(generics.ListAPIView):
    serializer_class = PredictionHistorySerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get_queryset(self):
        return PredictionHistory.objects.filter(user=self.request.user).order_by('-created_at')
