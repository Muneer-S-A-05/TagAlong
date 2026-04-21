import math
import os
from rest_framework import generics, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.permissions import AllowAny, IsAuthenticated
from .models import User, RequestManager, Listing, LocationInsight, ApplicantLocation
from .serializers import (
    RegisterSerializer, RequestManagerSerializer, 
    ListingSerializer, LocationInsightSerializer,
    UserSerializer, ChangePasswordSerializer
)
from rest_framework import viewsets
from rest_framework.decorators import action

def haversine(lat1, lon1, lat2, lon2):
    R = 6371  # radius of Earth in kilometers
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = math.sin(dlat/2) * math.sin(dlat/2) + math.cos(math.radians(lat1)) \
        * math.cos(math.radians(lat2)) * math.sin(dlon/2) * math.sin(dlon/2)
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1-a))
    return R * c

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = (AllowAny,)
    serializer_class = RegisterSerializer

    def post(self, request, *args, **kwargs):
        print(f"DEBUG: Received Data: {request.data}")
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            try:
                self.perform_create(serializer)
                return Response(serializer.data, status=201)
            except Exception as e:
                print(f"DATABASE ERROR: {str(e)}")
                return Response({"error": str(e)}, status=400)
        else:
            print(f"SERIALIZER ERRORS: {serializer.errors}")
            return Response(serializer.errors, status=400)

class RequestManagerListCreateView(generics.ListCreateAPIView):
    serializer_class = RequestManagerSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # Only show open requests
        queryset = RequestManager.objects.filter(status='Pending').exclude(requester=self.request.user)
        lat = self.request.query_params.get('lat')
        lng = self.request.query_params.get('lng')
        radius = float(self.request.query_params.get('radius', 5.0)) # default 5km
        
        if lat and lng:
            try:
                lat = float(lat)
                lng = float(lng)
                matched_ids = []
                for req in queryset:
                    distance = haversine(lat, lng, float(req.latitude), float(req.longitude))
                    if distance <= radius:
                        matched_ids.append(req.id)
                return queryset.filter(id__in=matched_ids).order_by('time')
            except ValueError:
                pass
        return queryset.order_by('time')

    def perform_create(self, serializer):
        serializer.save(requester=self.request.user)


class ListingListCreateView(generics.ListCreateAPIView):
    serializer_class = ListingSerializer
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = (MultiPartParser, FormParser)

    def get_queryset(self):
        return Listing.objects.exclude(seller=self.request.user).order_by('-created_at')

    def perform_create(self, serializer):
        serializer.save(seller=self.request.user)

class ListingDeleteView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def delete(self, request, pk):
        try:
            listing = Listing.objects.get(pk=pk)
            if listing.seller != request.user:
                return Response({'error': 'You can only delete your own listings'}, status=403)
            if listing.image:
                if os.path.exists(listing.image.path):
                    try:
                        os.remove(listing.image.path)
                    except:
                        pass
            listing.delete()
            return Response({'message': 'Listing removed successfully'})
        except Listing.DoesNotExist:
            return Response({'error': 'Listing not found'}, status=404)

class ListingUpdateView(generics.UpdateAPIView):
    queryset = Listing.objects.all()
    serializer_class = ListingSerializer
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = (MultiPartParser, FormParser)

    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        if instance.seller != request.user:
            return Response({'error': 'You can only edit your own listings'}, status=403)
            
        if 'image' in request.FILES and instance.image:
            if os.path.exists(instance.image.path):
                try:
                    os.remove(instance.image.path)
                except:
                    pass

        return super().update(request, *args, **kwargs)


class LocationInsightListCreateView(generics.ListCreateAPIView):
    queryset = LocationInsight.objects.all().order_by('-timestamp')
    serializer_class = LocationInsightSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(author=self.request.user)

from rest_framework_simplejwt.views import TokenObtainPairView
from .serializers import EmailTokenObtainPairSerializer

class EmailTokenObtainPairView(TokenObtainPairView):
    serializer_class = EmailTokenObtainPairSerializer

from rest_framework.views import APIView
from rest_framework.response import Response
from django.db.models import Q

class RequestManagerAcceptView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        try:
            req = RequestManager.objects.get(pk=pk, status='Pending')
            if req.requester == request.user:
                return Response({'error': 'Cannot accept your own request'}, status=400)
            
            req.applicants.add(request.user)
            req.save()

            # Optional GPS Coordinates integration explicitly attaching Location states 
            lat = request.data.get('latitude')
            lng = request.data.get('longitude')
            if lat and lng:
                ApplicantLocation.objects.update_or_create(
                    request=req, user=request.user,
                    defaults={'latitude': lat, 'longitude': lng}
                )

            return Response(RequestManagerSerializer(req).data)
        except RequestManager.DoesNotExist:
            return Response({'error': 'Request not found or already matched'}, status=404)

class RequestManagerSelectHelperView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        try:
            req = RequestManager.objects.get(pk=pk, status='Pending', requester=request.user)
            helper_id = request.data.get('helper_id')
            if not helper_id:
                return Response({'error': 'No helper selected'}, status=400)
            
            helper_user = User.objects.get(pk=helper_id)
            if not req.applicants.filter(pk=helper_id).exists():
                return Response({'error': 'User did not apply for this request'}, status=400)

            req.status = 'Matched'
            req.matched_user = helper_user
            req.applicants.clear()  # Mass-delete strictly unselected array mapping
            req.save()
            return Response(RequestManagerSerializer(req).data)
        except RequestManager.DoesNotExist:
            return Response({'error': 'Request not found or unauthorized'}, status=404)
        except User.DoesNotExist:
            return Response({'error': 'Helper user not found'}, status=404)

class RequestManagerCloseView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, pk):
        try:
            req = RequestManager.objects.get(pk=pk, requester=request.user)
            req.delete()
            return Response({'success': 'Request closed successfully'})
        except RequestManager.DoesNotExist:
            return Response({'error': 'Request not found or unauthorized'}, status=404)

class RequestManagerUpdateView(generics.UpdateAPIView):
    queryset = RequestManager.objects.all()
    serializer_class = RequestManagerSerializer
    permission_classes = [IsAuthenticated]

    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        if instance.requester != request.user:
            return Response({'error': 'You can only edit your own requests'}, status=403)
        return super().update(request, *args, **kwargs)

class RequestManagerCancelAcceptView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        try:
            req = RequestManager.objects.get(pk=pk, status='Pending')
            if request.user not in req.applicants.all():
                return Response({'error': 'You have not applied for this request'}, status=400)
            
            req.applicants.remove(request.user)
            # Also remove distance insight if exists
            ApplicantLocation.objects.filter(request=req, user=request.user).delete()
            req.save()
            return Response(RequestManagerSerializer(req, context={'request': request}).data)
        except RequestManager.DoesNotExist:
            return Response({'error': 'Request not found or already matched'}, status=404)

class AdminRequestListView(generics.ListAPIView):
    serializer_class = RequestManagerSerializer
    permission_classes = [permissions.IsAdminUser]

    def get_queryset(self):
        # Returns ALL Active and Matched requests across the entire campus
        return RequestManager.objects.filter(status__in=['Pending', 'Matched']).order_by('-time')

class AdminRequestDeleteView(APIView):
    permission_classes = [permissions.IsAdminUser]

    def delete(self, request, pk):
        try:
            req = RequestManager.objects.get(pk=pk)
            req.delete()
            return Response({'success': 'Request permanently removed as fake/spam'})
        except RequestManager.DoesNotExist:
            return Response({'error': 'Request not found'}, status=404)

class UserProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        # Get active requests mapped to this user
        requests = RequestManager.objects.filter(requester=user, status='Pending').order_by('-time')
        # Get completed matching paths exclusively mapped onto the Creator independently
        matched_requests = RequestManager.objects.filter(requester=user, status='Matched').order_by('-time')

        # Get all marketplace listings mapped to this user
        listings = Listing.objects.filter(seller=user).order_by('-id')

        # Get accepted requests dynamically combining confirmed mappings alongside applicant queries
        accepted_requests = RequestManager.objects.filter(
            Q(matched_user=user, status='Matched') | 
            Q(applicants=user, status='Pending')
        ).distinct().order_by('-time')

        # Returning custom aggregated response without strictly defining a new Serializer class
        return Response({
            'user': {
                'id': user.id,
                'email': user.email,
                'full_name': user.full_name,
                'phone_number': user.phone_number,
                'is_staff': user.is_staff
            },
            'requests': RequestManagerSerializer(requests, many=True, context={'request': request}).data,
            'matched_requests': RequestManagerSerializer(matched_requests, many=True, context={'request': request}).data,
            'listings': ListingSerializer(listings, many=True, context={'request': request}).data,
            'accepted_requests': RequestManagerSerializer(accepted_requests, many=True, context={'request': request}).data,
        })

class UserViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = UserSerializer

    def get_queryset(self):
        return User.objects.filter(id=self.request.user.id)

    @action(detail=True, methods=['post'])
    def change_password(self, request, pk=None):
        user = self.get_object()
        if user != request.user:
            return Response({'error': 'Unauthorized'}, status=403)
        
        serializer = ChangePasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        if not user.check_password(serializer.validated_data['old_password']):
            return Response({'error': 'Current password incorrect.'}, status=400)
        
        user.set_password(serializer.validated_data['new_password'])
        user.save()
        return Response({'success': 'Password updated successfully'})

