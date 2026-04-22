from django.test import TestCase
from django.core import mail
from django.test import override_settings
from rest_framework.test import APIClient

from .models import Company
from .request_context import get_request_user

@override_settings(SECURE_SSL_REDIRECT=False)
class OpenAccessApiTests(TestCase):
    def setUp(self):
        self.client = APIClient()

    def test_anonymous_client_id_maps_to_stable_user(self):
        request = self.client.get(
            "/api/health/",
            HTTP_X_RETENTIONBRAIN_CLIENT_ID="browser-123",
        ).wsgi_request

        first_user = get_request_user(request)
        second_user = get_request_user(request)

        self.assertEqual(first_user.id, second_user.id)
        self.assertTrue(first_user.username.startswith("guest_"))

    def test_company_endpoint_is_isolated_per_client_id(self):
        response = self.client.post(
            "/api/company/",
            {
                "name": "Acme Retail",
                "industry": "Retail",
                "size": "11-50",
                "website": "https://acme.example",
            },
            format="json",
            HTTP_X_RETENTIONBRAIN_CLIENT_ID="client-a",
        )
        self.assertEqual(response.status_code, 201)
        self.assertEqual(Company.objects.count(), 1)

        same_client = self.client.get(
            "/api/company/",
            HTTP_X_RETENTIONBRAIN_CLIENT_ID="client-a",
        )
        self.assertEqual(same_client.status_code, 200)
        self.assertEqual(same_client.data["name"], "Acme Retail")

        other_client = self.client.get(
            "/api/company/",
            HTTP_X_RETENTIONBRAIN_CLIENT_ID="client-b",
        )
        self.assertEqual(other_client.status_code, 404)

    @override_settings(
        EMAIL_BACKEND="django.core.mail.backends.locmem.EmailBackend",
        FRONTEND_URL="https://retention-brain.vercel.app",
        PASSWORD_RESET_FRONTEND_PATH="/auth/reset-password",
    )
    def test_password_reset_sends_email_with_frontend_link(self):
        user = get_request_user(
            self.client.get(
                "/api/health/",
                HTTP_X_RETENTIONBRAIN_CLIENT_ID="reset-client",
            ).wsgi_request
        )
        user.email = "reset@example.com"
        user.save(update_fields=["email"])

        response = self.client.post(
            "/api/password-reset/",
            {"email": "reset@example.com"},
            format="json",
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(mail.outbox), 1)
        self.assertIn("https://retention-brain.vercel.app/auth/reset-password", mail.outbox[0].body)

    def test_login_accepts_email_identifier(self):
        self.client.post(
            "/api/register/",
            {
                "username": "emailuser",
                "email": "emailuser@example.com",
                "password": "Password123",
                "confirm_password": "Password123",
            },
            format="json",
        )

        response = self.client.post(
            "/api/login/",
            {"username": "emailuser@example.com", "password": "Password123"},
            format="json",
        )

        self.assertEqual(response.status_code, 200)
        self.assertIn("access", response.data)
