from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from django.db.models import Avg, Count, Sum, Q

from .serializers import (
    UserSerializer, CustomerSerializer, CustomerDetailSerializer,
    CSVUploadSerializer, DashboardMetricsSerializer,
)
from .models import Customer, CSVUpload
from .ml_service import parse_csv, compute_rfm_features, predict


class RegisterView(generics.CreateAPIView):
    serializer_class = UserSerializer
    permission_classes = [AllowAny]


class HealthCheckView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        return Response({"status": "API running"}, status=status.HTTP_200_OK)


class UploadCSVView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        file = request.FILES.get('file')
        if not file:
            return Response({"error": "No file provided"}, status=status.HTTP_400_BAD_REQUEST)

        if not file.name.endswith('.csv'):
            return Response({"error": "File must be a CSV"}, status=status.HTTP_400_BAD_REQUEST)

        upload = CSVUpload.objects.create(
            user=request.user,
            file_name=file.name,
        )

        try:
            df = parse_csv(file)
            rfm = compute_rfm_features(df)
            results = predict(rfm)

            customers = []
            for _, row in results.iterrows():
                customers.append(Customer(
                    upload=upload,
                    user=request.user,
                    customer_id=str(row.get('customer_id', '')),
                    recency=float(row.get('Recency', 0)),
                    frequency=float(row.get('Frequency', 0)),
                    monetary=float(row.get('Monetary', 0)),
                    avg_order_value=float(row.get('AvgOrderValue', 0)),
                    total_returns=float(row.get('TotalReturns', 0)),
                    return_ratio=float(row.get('ReturnRatio', 0)),
                    customer_lifetime=float(row.get('CustomerLifetime', 0)),
                    churn_probability=float(row.get('churn_probability', 0)),
                    is_churned=bool(row.get('is_churned', False)),
                    risk_level=row.get('risk_level', 'low'),
                    top_features=row.get('top_features', []),
                ))

            Customer.objects.bulk_create(customers)

            upload.row_count = len(customers)
            upload.status = 'completed'
            upload.save()

            high_risk = sum(1 for c in customers if c.risk_level == 'high')
            avg_churn = sum(c.churn_probability for c in customers) / len(customers) if customers else 0

            return Response({
                "message": "File uploaded and processed successfully",
                "upload_id": upload.id,
                "customers_processed": len(customers),
                "high_risk_count": high_risk,
                "avg_churn_probability": round(avg_churn, 4),
            }, status=status.HTTP_200_OK)

        except ValueError as e:
            upload.status = 'failed'
            upload.error_message = str(e)
            upload.save()
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            upload.status = 'failed'
            upload.error_message = str(e)
            upload.save()
            return Response(
                {"error": f"Processing failed: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


class DashboardMetricsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        customers = Customer.objects.filter(user=request.user)

        total = customers.count()
        if total == 0:
            return Response({
                "total_customers": 0,
                "avg_churn_risk": 0,
                "high_risk_count": 0,
                "revenue_at_risk": 0,
                "total_uploads": CSVUpload.objects.filter(user=request.user).count(),
                "risk_distribution": {"low": 0, "medium": 0, "high": 0},
            })

        avg_churn = customers.aggregate(avg=Avg('churn_probability'))['avg'] or 0
        high_risk = customers.filter(risk_level='high').count()

        high_risk_revenue = customers.filter(risk_level='high').aggregate(
            total=Sum('monetary')
        )['total'] or 0

        risk_dist = {
            'low': customers.filter(risk_level='low').count(),
            'medium': customers.filter(risk_level='medium').count(),
            'high': high_risk,
        }

        return Response({
            "total_customers": total,
            "avg_churn_risk": round(avg_churn * 100, 1),
            "high_risk_count": high_risk,
            "revenue_at_risk": round(high_risk_revenue, 2),
            "total_uploads": CSVUpload.objects.filter(user=request.user).count(),
            "risk_distribution": risk_dist,
        })


class CustomerListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        customers = Customer.objects.filter(user=request.user)

        risk = request.query_params.get('risk')
        if risk in ('low', 'medium', 'high'):
            customers = customers.filter(risk_level=risk)

        search = request.query_params.get('search')
        if search:
            customers = customers.filter(customer_id__icontains=search)

        sort = request.query_params.get('sort', '-churn_probability')
        allowed_sorts = [
            'churn_probability', '-churn_probability',
            'monetary', '-monetary',
            'recency', '-recency',
            'frequency', '-frequency',
        ]
        if sort in allowed_sorts:
            customers = customers.order_by(sort)

        page_size = min(int(request.query_params.get('page_size', 50)), 200)
        page = int(request.query_params.get('page', 1))
        offset = (page - 1) * page_size
        total = customers.count()

        page_customers = customers[offset:offset + page_size]
        serializer = CustomerSerializer(page_customers, many=True)

        return Response({
            "results": serializer.data,
            "total": total,
            "page": page,
            "page_size": page_size,
        })


class CustomerDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        try:
            customer = Customer.objects.get(pk=pk, user=request.user)
        except Customer.DoesNotExist:
            return Response({"error": "Customer not found"}, status=status.HTTP_404_NOT_FOUND)

        serializer = CustomerDetailSerializer(customer)
        return Response(serializer.data)


class UploadHistoryView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        uploads = CSVUpload.objects.filter(user=request.user)
        serializer = CSVUploadSerializer(uploads, many=True)
        return Response(serializer.data)
