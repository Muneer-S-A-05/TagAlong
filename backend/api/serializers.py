from rest_framework import serializers
from .models import User, RequestManager, Listing, LocationInsight
from django.core.validators import RegexValidator

class RegisterSerializer(serializers.ModelSerializer):
    # 1. Tell Django to accept 'full_name' from the frontend, but don't look for it in the database
    full_name = serializers.CharField(write_only=True, required=False, allow_blank=True)
    username = serializers.CharField(required=False, allow_blank=True)
    
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'password', 'full_name')
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        email = validated_data.get('email', '')
        username = validated_data.get('username', '')

        # 3. The Magic: If no username was provided, build it from the email!
        if not username and email:
            base_username = email.split('@')[0]
            username = base_username
            
            # Smart check: If 'john' is taken, try 'john1', 'john2', etc.
            counter = 1
            while User.objects.filter(username=username).exists():
                username = f"{base_username}{counter}"
                counter += 1
                
        # 4. Pop the full_name out
        full_name = validated_data.pop('full_name', '')
        
        # 5. Create the user with the auto-generated username
        user = User.objects.create_user(
            username=username,
            email=email,
            password=validated_data.get('password'),
            first_name=full_name 
        )
        return user

    def validate_phone_number(self, value):
        if value and (not value.isdigit() or len(value) != 10):
            raise serializers.ValidationError("Phone number must be exactly 10 digits.")
        return value

from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth import authenticate

from rest_framework import serializers, exceptions

class EmailTokenObtainPairSerializer(TokenObtainPairSerializer):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields['email'] = serializers.EmailField()
        if 'username' in self.fields:
            del self.fields['username']

    def validate(self, attrs):
        email = attrs.get('email')
        password = attrs.get('password')
        
        if email and password:
            user = authenticate(request=self.context.get('request'), username=email, password=password)
            if not user:
                raise exceptions.AuthenticationFailed('No active account found with the given credentials', code='authorization')
        else:
            raise exceptions.AuthenticationFailed('Must include "email" and "password".', code='authorization')
            
        attrs['username'] = email

        data = super().validate(attrs)
        
        return data

class BasicUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'full_name', 'phone_number', 'email')

class RequestManagerSerializer(serializers.ModelSerializer):
    requester_email = serializers.EmailField(source='requester.email', read_only=True)
    requester_phone = serializers.CharField(source='requester.phone_number', read_only=True)
    requester_full_name = serializers.CharField(source='requester.full_name', read_only=True)
    matched_user_email = serializers.EmailField(source='matched_user.email', read_only=True)
    matched_user_phone = serializers.CharField(source='matched_user.phone_number', read_only=True)
    applicants_list = serializers.SerializerMethodField()

    class Meta:
        model = RequestManager
        fields = '__all__'
        read_only_fields = ('requester', 'matched_user')

    def get_applicants_list(self, obj):
        from .models import ApplicantLocation
        applicants = obj.applicants.all()
        result = []
        for user in applicants:
            loc = ApplicantLocation.objects.filter(request=obj, user=user).first()
            result.append({
                'id': user.id,
                'email': user.email,
                'full_name': user.full_name,
                'phone_number': user.phone_number,
                'latitude': loc.latitude if loc else None,
                'longitude': loc.longitude if loc else None,
            })
        return result

class ListingSerializer(serializers.ModelSerializer):
    seller_email = serializers.EmailField(source='seller.email', read_only=True)
    seller_phone = serializers.CharField(source='seller.phone_number', read_only=True)
    
    class Meta:
        model = Listing
        fields = '__all__'
        read_only_fields = ('seller',)

class LocationInsightSerializer(serializers.ModelSerializer):
    class Meta:
        model = LocationInsight
        fields = '__all__'
        read_only_fields = ('author',)

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'full_name', 'phone_number', 'email')
        read_only_fields = ('email',)

class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True)
