from django.db import models
from django.contrib.auth.models import AbstractUser

class User(AbstractUser):
    ROLE_CHOICES = (
        ('vendeur', 'Vendeur'),
        ('acheteur', 'Acheteur'),
    )
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='acheteur')

    def __str__(self):
        return f"{self.username} ({self.role})"

class PredictionHistory(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='predictions')
    marque = models.CharField(max_length=100)
    modele = models.CharField(max_length=100)
    annee = models.IntegerField()
    kilometrage = models.IntegerField()
    prix_estime = models.IntegerField()
    prix_annonce = models.IntegerField(null=True, blank=True)
    status = models.CharField(max_length=50, null=True, blank=True) # 'scam', 'overpriced', 'ok'
    type_estimation = models.CharField(max_length=50, default='standard') # 'standard' or 'scam_detect'
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} - {self.marque} {self.modele} ({self.created_at.strftime('%Y-%m-%d %H:%M')})"
