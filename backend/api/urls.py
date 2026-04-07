from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .views import (
    RegisterView, HealthCheckView, UploadCSVView,
    DashboardMetricsView, CustomerListView, CustomerDetailView,
    UploadHistoryView,
)

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', TokenObtainPairView.as_view(), name='login'),
    path('login/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('health/', HealthCheckView.as_view(), name='health'),
    path('upload/', UploadCSVView.as_view(), name='upload'),
    path('dashboard/', DashboardMetricsView.as_view(), name='dashboard_metrics'),
    path('customers/', CustomerListView.as_view(), name='customer_list'),
    path('customers/<int:pk>/', CustomerDetailView.as_view(), name='customer_detail'),
    path('uploads/', UploadHistoryView.as_view(), name='upload_history'),
]
