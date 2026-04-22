from django.test import TestCase
from rest_framework.test import APIClient

from .models import Company
from .request_context import get_request_user


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
