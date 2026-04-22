from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .views import (
    RegisterView, HealthCheckView, UploadCSVView,
    DashboardMetricsView, CustomerListView, CustomerDetailView,
    UploadHistoryView, UserProfileView, CompanyView, PasswordResetRequestView,
)

urlpatterns = [
    # Auth
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', TokenObtainPairView.as_view(), name='login'),
    path('login/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('password-reset/', PasswordResetRequestView.as_view(), name='password_reset'),
    path('health/', HealthCheckView.as_view(), name='health'),

    # User
    path('profile/', UserProfileView.as_view(), name='user_profile'),
    path('company/', CompanyView.as_view(), name='company'),

    # Data
    path('upload/', UploadCSVView.as_view(), name='upload'),
    path('dashboard/', DashboardMetricsView.as_view(), name='dashboard_metrics'),
    path('customers/', CustomerListView.as_view(), name='customer_list'),
    path('customers/<int:pk>/', CustomerDetailView.as_view(), name='customer_detail'),
    path('uploads/', UploadHistoryView.as_view(), name='upload_history'),
]
