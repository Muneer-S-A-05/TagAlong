from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    # Upgrading standard user to hold the fields your app needs
    full_name = models.CharField(max_length=255, blank=True)
    phone_number = models.CharField(max_length=15, blank=True)

class RequestManager(models.Model):
    title = models.CharField(max_length=255)
    description = models.TextField()
    
    latitude = models.FloatField(null=True, blank=True)
    longitude = models.FloatField(null=True, blank=True)
    
    creator = models.ForeignKey(User, on_delete=models.CASCADE, related_name='managed_requests')
    created_at = models.DateTimeField(auto_now_add=True)

    status = models.CharField(max_length=20, default='Pending')
    matched_user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='matched_requests')
    applicants = models.ManyToManyField(User, related_name='applied_requests', blank=True)

    def __str__(self):
        return self.title

class Listing(models.Model):
    title = models.CharField(max_length=255)
    price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    
    latitude = models.FloatField(null=True, blank=True)
    longitude = models.FloatField(null=True, blank=True)
    
    # Added the missing image field so your views stop crashing
    image = models.ImageField(upload_to='listings/', null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    seller = models.ForeignKey(User, on_delete=models.CASCADE)

class LocationInsight(models.Model):
    # Added the missing author field
    author = models.ForeignKey(User, on_delete=models.CASCADE, null=True)
    latitude = models.FloatField()
    longitude = models.FloatField()
    timestamp = models.DateTimeField(auto_now_add=True)

class ApplicantLocation(models.Model):
    # Fixed the missing relationships
    request = models.ForeignKey(RequestManager, on_delete=models.CASCADE, related_name='applicant_locations', null=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE, null=True)
    
    latitude = models.FloatField()
    longitude = models.FloatField()
    updated_at = models.DateTimeField(auto_now=True)