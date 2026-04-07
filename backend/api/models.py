from django.db import models
from django.contrib.auth.models import User


class CSVUpload(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='uploads')
    file_name = models.CharField(max_length=255)
    uploaded_at = models.DateTimeField(auto_now_add=True)
    row_count = models.IntegerField(default=0)
    status = models.CharField(max_length=20, choices=[
        ('processing', 'Processing'),
        ('completed', 'Completed'),
        ('failed', 'Failed'),
    ], default='processing')
    error_message = models.TextField(blank=True, default='')

    class Meta:
        ordering = ['-uploaded_at']

    def __str__(self):
        return f"{self.file_name} by {self.user.username}"


class Customer(models.Model):
    upload = models.ForeignKey(CSVUpload, on_delete=models.CASCADE, related_name='customers')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='customers')
    customer_id = models.CharField(max_length=100)
    recency = models.FloatField(default=0)
    frequency = models.FloatField(default=0)
    monetary = models.FloatField(default=0)
    avg_order_value = models.FloatField(default=0)
    total_returns = models.FloatField(default=0)
    return_ratio = models.FloatField(default=0)
    customer_lifetime = models.FloatField(default=0)
    churn_probability = models.FloatField(null=True, blank=True)
    is_churned = models.BooleanField(null=True, blank=True)
    risk_level = models.CharField(max_length=10, choices=[
        ('low', 'Low'),
        ('medium', 'Medium'),
        ('high', 'High'),
    ], default='low')
    top_features = models.JSONField(default=list, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-churn_probability']
        unique_together = ['upload', 'customer_id']

    def __str__(self):
        return f"Customer {self.customer_id} - {self.risk_level} risk"
