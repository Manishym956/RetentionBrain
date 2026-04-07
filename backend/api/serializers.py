from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Customer, CSVUpload


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'password')
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data.get('email', ''),
            password=validated_data['password']
        )
        return user


class CustomerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Customer
        fields = [
            'id', 'customer_id', 'recency', 'frequency', 'monetary',
            'avg_order_value', 'total_returns', 'return_ratio',
            'customer_lifetime', 'churn_probability',
            'is_churned', 'risk_level', 'top_features', 'created_at',
        ]


class CustomerDetailSerializer(serializers.ModelSerializer):
    upload_name = serializers.CharField(source='upload.file_name', read_only=True)

    class Meta:
        model = Customer
        fields = [
            'id', 'customer_id', 'recency', 'frequency', 'monetary',
            'avg_order_value', 'total_returns', 'return_ratio',
            'customer_lifetime', 'churn_probability',
            'is_churned', 'risk_level', 'top_features', 'created_at',
            'upload_name',
        ]


class CSVUploadSerializer(serializers.ModelSerializer):
    class Meta:
        model = CSVUpload
        fields = ['id', 'file_name', 'uploaded_at', 'row_count', 'status', 'error_message']


class DashboardMetricsSerializer(serializers.Serializer):
    total_customers = serializers.IntegerField()
    avg_churn_risk = serializers.FloatField()
    high_risk_count = serializers.IntegerField()
    revenue_at_risk = serializers.FloatField()
    total_uploads = serializers.IntegerField()
    risk_distribution = serializers.DictField()
