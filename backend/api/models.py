from django.contrib.auth.models import User
from django.db import models

class RequestManager(models.Model):
    title = models.CharField(max_length=255)
    description = models.TextField()
    
    # Location coordinates strictly
    latitude = models.FloatField(null=True, blank=True)
    longitude = models.FloatField(null=True, blank=True)
    
    creator = models.ForeignKey(User, on_delete=models.CASCADE, related_name='managed_requests')
    created_at = models.DateTimeField(auto_now_add=True)

    status = models.CharField(max_length=20, default='Pending')

    def __str__(self):
        return self.title

class Listing(models.Model):
    title = models.CharField(max_length=255)
    price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    
    # Location coordinates strictly
    latitude = models.FloatField(null=True, blank=True)
    longitude = models.FloatField(null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)

    seller = models.ForeignKey(User, on_delete=models.CASCADE)

class LocationInsight(models.Model):
    # Location coordinates strictly
    latitude = models.FloatField()
    longitude = models.FloatField()
    timestamp = models.DateTimeField(auto_now_add=True)

class ApplicantLocation(models.Model):
    applicant = models.ForeignKey(User, on_delete=models.CASCADE)
    
    # Location coordinates strictly
    latitude = models.FloatField()
    longitude = models.FloatField()
    updated_at = models.DateTimeField(auto_now=True)