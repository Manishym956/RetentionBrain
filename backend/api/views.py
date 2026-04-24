import json
from urllib.error import URLError
from urllib.parse import urlencode
from urllib.request import Request, urlopen

from django.conf import settings
from django.contrib.auth.tokens import default_token_generator
from django.contrib.auth.models import User
from django.core.files.base import ContentFile
from django.core.mail import send_mail
from django.core.signing import BadSignature, TimestampSigner
from django.db.models import Avg, Sum
from django.http import HttpResponseRedirect
from django.shortcuts import redirect
from django.utils.encoding import force_bytes, force_str
from django.utils.http import urlsafe_base64_decode, urlsafe_base64_encode
from rest_framework import generics, status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework.views import APIView

from .serializers import (
    UserSerializer, CustomerSerializer, CustomerDetailSerializer,
    CSVUploadSerializer, DashboardMetricsSerializer,
    UserProfileSerializer, CompanySerializer,
    EmailOrUsernameTokenObtainPairSerializer,
    PasswordResetRequestSerializer, PasswordResetConfirmSerializer,
)
from .models import Customer, CSVUpload, UserProfile, Company
from .ml_service import parse_csv, compute_rfm_features, predict
from .request_context import get_request_user


OPEN_ACCESS_PERMISSIONS = [AllowAny] if settings.OPEN_ACCESS_MODE else [IsAuthenticated]


def build_frontend_url(path, **query_params):
    base = settings.FRONTEND_URL.rstrip("/")
    path = path if path.startswith("/") else f"/{path}"
    query = urlencode({k: v for k, v in query_params.items() if v is not None})
    return f"{base}{path}" + (f"?{query}" if query else "")


class EmailOrUsernameTokenObtainPairView(TokenObtainPairView):
    serializer_class = EmailOrUsernameTokenObtainPairSerializer


class RegisterView(generics.CreateAPIView):
    serializer_class = UserSerializer
    permission_classes = [AllowAny]


class UserProfileView(APIView):
    permission_classes = OPEN_ACCESS_PERMISSIONS

    def get(self, request):
        profile, _ = UserProfile.objects.get_or_create(user=get_request_user(request))
        serializer = UserProfileSerializer(profile)
        return Response(serializer.data)

    def put(self, request):
        profile, _ = UserProfile.objects.get_or_create(user=get_request_user(request))
        serializer = UserProfileSerializer(profile, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)


class CompanyView(APIView):
    permission_classes = OPEN_ACCESS_PERMISSIONS

    def get(self, request):
        actor = get_request_user(request)
        try:
            company = Company.objects.get(user=actor)
            serializer = CompanySerializer(company)
            return Response(serializer.data)
        except Company.DoesNotExist:
            return Response({"detail": "No company found"}, status=status.HTTP_404_NOT_FOUND)

    def post(self, request):
        actor = get_request_user(request)
        company = Company.objects.filter(user=actor).first()
        if company:
            serializer = CompanySerializer(company, data=request.data, partial=True)
        else:
            serializer = CompanySerializer(data=request.data)
            
        serializer.is_valid(raise_exception=True)
        serializer.save(user=actor)
        return Response(serializer.data, status=status.HTTP_200_OK if company else status.HTTP_201_CREATED)

    def put(self, request):
        actor = get_request_user(request)
        try:
            company = Company.objects.get(user=actor)
        except Company.DoesNotExist:
            return Response({"detail": "No company found"}, status=status.HTTP_404_NOT_FOUND)
        serializer = CompanySerializer(company, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)


class PasswordResetRequestView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = PasswordResetRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        email = serializer.validated_data["email"]
        user = User.objects.filter(email__iexact=email).first()

        if user:
            uid = urlsafe_base64_encode(force_bytes(user.pk))
            token = default_token_generator.make_token(user)
            reset_url = build_frontend_url(
                settings.PASSWORD_RESET_FRONTEND_PATH,
                uid=uid,
                token=token,
            )

            send_mail(
                subject="Reset your RetentionBrain password",
                message=(
                    "We received a request to reset your RetentionBrain password.\n\n"
                    f"Open this link to continue:\n{reset_url}\n\n"
                    "If you did not request this, you can ignore this email."
                ),
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[email],
            )

        return Response({"message": "If an account with that email exists, a reset link has been sent."})


class PasswordResetConfirmView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = PasswordResetConfirmSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        uid = serializer.validated_data["uid"]
        token = serializer.validated_data["token"]

        try:
            user = User.objects.get(pk=force_str(urlsafe_base64_decode(uid)))
        except (User.DoesNotExist, ValueError, TypeError, OverflowError):
            return Response({"error": "Invalid reset link."}, status=status.HTTP_400_BAD_REQUEST)

        if not default_token_generator.check_token(user, token):
            return Response({"error": "Reset link is invalid or expired."}, status=status.HTTP_400_BAD_REQUEST)

        user.set_password(serializer.validated_data["password"])
        user.save(update_fields=["password"])
        return Response({"message": "Password updated successfully."}, status=status.HTTP_200_OK)


class GoogleOAuthStartView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        if not settings.GOOGLE_OAUTH_ENABLED:
            return Response({"error": "Google OAuth is not configured."}, status=status.HTTP_503_SERVICE_UNAVAILABLE)

        next_path = request.query_params.get("next", "/dashboard")
        state = TimestampSigner().sign(next_path)
        query = urlencode(
            {
                "client_id": settings.GOOGLE_OAUTH_CLIENT_ID,
                "redirect_uri": settings.GOOGLE_OAUTH_REDIRECT_URI,
                "response_type": "code",
                "scope": " ".join(settings.GOOGLE_OAUTH_SCOPES),
                "access_type": "offline",
                "include_granted_scopes": "true",
                "prompt": "consent",
                "state": state,
            }
        )
        return redirect(f"{settings.GOOGLE_OAUTH_AUTHORIZE_URL}?{query}")


class GoogleOAuthCallbackView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        callback_path = "/auth/callback"
        error = request.query_params.get("error")
        if error:
            return HttpResponseRedirect(build_frontend_url(callback_path, error=error))

        code = request.query_params.get("code")
        state = request.query_params.get("state", "")
        if not code:
            return HttpResponseRedirect(build_frontend_url(callback_path, error="missing_code"))

        try:
            next_path = TimestampSigner().unsign(state, max_age=600)
        except BadSignature:
            next_path = "/dashboard"

        token_payload = urlencode(
            {
                "code": code,
                "client_id": settings.GOOGLE_OAUTH_CLIENT_ID,
                "client_secret": settings.GOOGLE_OAUTH_CLIENT_SECRET,
                "redirect_uri": settings.GOOGLE_OAUTH_REDIRECT_URI,
                "grant_type": "authorization_code",
            }
        ).encode("utf-8")
        token_request = Request(
            settings.GOOGLE_OAUTH_TOKEN_URL,
            data=token_payload,
            headers={"Content-Type": "application/x-www-form-urlencoded"},
            method="POST",
        )
        try:
            with urlopen(token_request, timeout=20) as token_response:
                token_data = json.loads(token_response.read().decode("utf-8"))
        except URLError:
            return HttpResponseRedirect(build_frontend_url(callback_path, error="token_exchange_failed"))

        access_token = token_data.get("access_token")
        if not access_token:
            return HttpResponseRedirect(build_frontend_url(callback_path, error="missing_access_token"))

        try:
            userinfo_request = Request(
                settings.GOOGLE_OAUTH_USERINFO_URL,
                headers={"Authorization": f"Bearer {access_token}"},
                method="GET",
            )
            with urlopen(userinfo_request, timeout=20) as userinfo_response:
                userinfo = json.loads(userinfo_response.read().decode("utf-8"))
        except URLError:
            return HttpResponseRedirect(build_frontend_url(callback_path, error="userinfo_failed"))
        email = userinfo.get("email")
        if not email:
            return HttpResponseRedirect(build_frontend_url(callback_path, error="missing_email"))

        user = User.objects.filter(email__iexact=email).first()
        if user is None:
            base_username = (email.split("@", 1)[0] or "googleuser").replace(" ", "").lower()
            username = base_username
            suffix = 1
            while User.objects.filter(username=username).exists():
                username = f"{base_username}{suffix}"
                suffix += 1
            user = User.objects.create_user(
                username=username,
                email=email,
                first_name=userinfo.get("given_name", ""),
                last_name=userinfo.get("family_name", ""),
            )
            user.set_unusable_password()
            user.save(update_fields=["password"])

        profile, _ = UserProfile.objects.get_or_create(user=user)
        profile.full_name = userinfo.get("name") or profile.full_name
        profile.avatar_url = userinfo.get("picture") or profile.avatar_url
        profile.save()

        refresh = RefreshToken.for_user(user)
        return HttpResponseRedirect(
            build_frontend_url(
                callback_path,
                access=str(refresh.access_token),
                refresh=str(refresh),
                next=next_path,
            )
        )


class HealthCheckView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        return Response(
            {
                "status": "API running",
                "open_access_mode": settings.OPEN_ACCESS_MODE,
                "google_oauth_enabled": settings.GOOGLE_OAUTH_ENABLED,
                "gcs_storage_enabled": settings.USE_GCP_STORAGE,
                "smtp_configured": bool(settings.EMAIL_HOST_USER),
                "model_version": settings.MODEL_VERSION,
            },
            status=status.HTTP_200_OK,
        )


class UploadCSVView(APIView):
    permission_classes = OPEN_ACCESS_PERMISSIONS
    throttle_scope = "upload"

    def post(self, request):
        file = request.FILES.get('file')
        if not file:
            return Response({"error": "No file provided"}, status=status.HTTP_400_BAD_REQUEST)

        if not file.name.endswith('.csv'):
            return Response({"error": "File must be a CSV"}, status=status.HTTP_400_BAD_REQUEST)

        actor = get_request_user(request)
        file_bytes = file.read()

        upload = CSVUpload.objects.create(
            user=actor,
            file_name=file.name,
        )

        try:
            df = parse_csv(file_bytes)
            
            # Generate EDA before modifying the dataframe structure for ML
            from .ml_service import generate_eda
            eda_json = generate_eda(df)
            
            rfm = compute_rfm_features(df)
            results = predict(rfm)

            customers = []
            for _, row in results.iterrows():
                customers.append(Customer(
                    upload=upload,
                    user=actor,
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
                    confidence=row.get('confidence', 'high'),
                    missing_features=row.get('missing_features', []),
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
                "eda": eda_json,
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
    permission_classes = OPEN_ACCESS_PERMISSIONS

    def get(self, request):
        actor = get_request_user(request)
        customers = Customer.objects.filter(user=actor)

        total = customers.count()
        if total == 0:
            return Response({
                "total_customers": 0,
                "avg_churn_risk": 0,
                "high_risk_count": 0,
                "revenue_at_risk": 0,
                "total_uploads": CSVUpload.objects.filter(user=actor).count(),
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
            "total_uploads": CSVUpload.objects.filter(user=actor).count(),
            "risk_distribution": risk_dist,
        })


class CustomerListView(APIView):
    permission_classes = OPEN_ACCESS_PERMISSIONS

    def get(self, request):
        actor = get_request_user(request)
        customers = Customer.objects.filter(user=actor)

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
    permission_classes = OPEN_ACCESS_PERMISSIONS

    def get(self, request, pk):
        actor = get_request_user(request)
        try:
            customer = Customer.objects.get(pk=pk, user=actor)
        except Customer.DoesNotExist:
            return Response({"error": "Customer not found"}, status=status.HTTP_404_NOT_FOUND)

        serializer = CustomerDetailSerializer(customer)
        return Response(serializer.data)


class UploadHistoryView(APIView):
    permission_classes = OPEN_ACCESS_PERMISSIONS

    def get(self, request):
        uploads = CSVUpload.objects.filter(user=get_request_user(request))
        serializer = CSVUploadSerializer(uploads, many=True)
        return Response(serializer.data)
