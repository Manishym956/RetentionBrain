from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .views import RegisterView, HealthCheckView, UploadCSVView

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', TokenObtainPairView.as_view(), name='login'),
    path('login/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('health/', HealthCheckView.as_view(), name='health'),
    path('upload/', UploadCSVView.as_view(), name='upload'),
]
