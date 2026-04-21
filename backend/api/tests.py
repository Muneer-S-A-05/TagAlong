from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from django.contrib.auth import get_user_model

User = get_user_model()

class AuthenticationTests(APITestCase):
    def setUp(self):
        self.email = 'testuser@cet.ac.in'
        self.password = 'securepassword123'
        self.user = User.objects.create_user(
            username=self.email,
            email=self.email,
            password=self.password
        )

    def test_login_with_email(self):
        url = reverse('token_obtain_pair')
        data = {
            'email': self.email,
            'password': self.password
        }
        response = self.client.post(url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)
        self.assertIn('refresh', response.data)
        
    def test_login_with_invalid_credentials(self):
        url = reverse('token_obtain_pair')
        data = {
            'email': self.email,
            'password': 'wrongpassword'
        }
        response = self.client.post(url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
