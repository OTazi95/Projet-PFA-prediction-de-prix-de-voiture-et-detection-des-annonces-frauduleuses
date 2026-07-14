from django.contrib import admin
from .models import User, PredictionHistory

admin.site.register(User)
admin.site.register(PredictionHistory)
