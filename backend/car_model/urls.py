from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import RegisterView, CustomTokenObtainPairView, UserDetailView, PredictView, ScamDetectView, HistoryListView

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', CustomTokenObtainPairView.as_view(), name='login'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('me/', UserDetailView.as_view(), name='me'),
    path('predict/', PredictView.as_view(), name='predict'),
    path('scam-detect/', ScamDetectView.as_view(), name='scam_detect'),
    path('history/', HistoryListView.as_view(), name='history'),
]
