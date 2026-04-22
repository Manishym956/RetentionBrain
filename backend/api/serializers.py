from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Customer, CSVUpload, UserProfile, Company


class UserSerializer(serializers.ModelSerializer):
    full_name = serializers.CharField(write_only=True, required=False, default='')
    confirm_password = serializers.CharField(write_only=True, required=False)

    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'password', 'full_name', 'confirm_password')
        extra_kwargs = {'password': {'write_only': True}}

    def validate(self, attrs):
        confirm = attrs.pop('confirm_password', None)
        if confirm and attrs.get('password') != confirm:
            raise serializers.ValidationError({"password": "Passwords do not match."})
        return attrs

    def create(self, validated_data):
        full_name = validated_data.pop('full_name', '')
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data.get('email', ''),
            password=validated_data['password']
        )
        if full_name:
            parts = full_name.split(' ', 1)
            user.first_name = parts[0]
            user.last_name = parts[1] if len(parts) > 1 else ''
            user.save()
        UserProfile.objects.create(user=user, full_name=full_name)
        return user


class UserProfileSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(source='user.email', read_only=True)
    username = serializers.CharField(source='user.username', read_only=True)
    full_name = serializers.CharField(required=False)
    date_joined = serializers.DateTimeField(source='user.date_joined', read_only=True)
    last_login = serializers.DateTimeField(source='user.last_login', read_only=True)
    datasets_uploaded = serializers.SerializerMethodField()
    total_predictions = serializers.SerializerMethodField()

    class Meta:
        model = UserProfile
        fields = [
            'id', 'username', 'email', 'full_name', 'avatar_url',
            'email_notifications', 'system_alerts', 'theme',
            'date_joined', 'last_login', 'datasets_uploaded', 'total_predictions',
        ]

    def get_datasets_uploaded(self, obj):
        return CSVUpload.objects.filter(user=obj.user).count()

    def get_total_predictions(self, obj):
        return Customer.objects.filter(user=obj.user).count()


class CompanySerializer(serializers.ModelSerializer):
    class Meta:
        model = Company
        fields = ['id', 'name', 'industry', 'size', 'website', 'created_at']


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
    source_file_url = serializers.SerializerMethodField()

    class Meta:
        model = CSVUpload
        fields = ['id', 'file_name', 'source_file_url', 'uploaded_at', 'row_count', 'status', 'error_message']

    def get_source_file_url(self, obj):
        if obj.source_file:
            return obj.source_file.url
        return None


class DashboardMetricsSerializer(serializers.Serializer):
    total_customers = serializers.IntegerField()
    avg_churn_risk = serializers.FloatField()
    high_risk_count = serializers.IntegerField()
    revenue_at_risk = serializers.FloatField()
    total_uploads = serializers.IntegerField()
    risk_distribution = serializers.DictField()
