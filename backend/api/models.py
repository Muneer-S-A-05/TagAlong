from django.db import models
from django.contrib.auth.models import AbstractUser

class User(AbstractUser):
    mobile_number = models.CharField(max_length=20, default='+91 98765 43210')
    full_name = models.CharField(max_length=255, default='Student', blank=True)
    phone_number = models.CharField(max_length=15, default='0000000000', blank=True)
    # Email validation will be handled at the serializer/form level.
    # AbstractUser already gives us username, email, password, etc.

class RequestManager(models.Model):
    STATUS_CHOICES = (
        ('Pending', 'Pending'),
        ('Matched', 'Matched'),
    )
    requester = models.ForeignKey(User, on_delete=models.CASCADE, related_name='requests')
    matched_user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='accepted_requests')
    applicants = models.ManyToManyField(User, related_name='applied_requests', blank=True)
    destination = models.CharField(max_length=255)
    item_or_service = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    latitude = models.DecimalField(max_digits=9, decimal_places=6)
    longitude = models.DecimalField(max_digits=9, decimal_places=6)
    time = models.DateTimeField()
    deadline = models.DateTimeField(null=True, blank=True)
    status = models.CharField(max_length=50, choices=STATUS_CHOICES, default='Pending')
    
    def __str__(self):
        return f"{self.item_or_service} to {self.destination} by {self.requester.username}"

class Listing(models.Model):
    seller = models.ForeignKey(User, on_delete=models.CASCADE, related_name='listings')
    item_name = models.CharField(max_length=255)
    asking_price = models.DecimalField(max_digits=10, decimal_places=2)
    description = models.TextField()
    image = models.ImageField(upload_to='marketplace_images/', null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return self.item_name

class LocationInsight(models.Model):
    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name='insights')
    location_name = models.CharField(max_length=255)
    crowd_status = models.CharField(max_length=100)
    food_status = models.CharField(max_length=100)
    timestamp = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.location_name} - {self.crowd_status}"

class ApplicantLocation(models.Model):
    request = models.ForeignKey(RequestManager, on_delete=models.CASCADE, related_name='applicant_locations')
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    latitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    longitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)

    class Meta:
        unique_together = ('request', 'user')
