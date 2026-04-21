from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .views import (
    RegisterView, RequestManagerListCreateView, 
    ListingListCreateView, LocationInsightListCreateView,
    EmailTokenObtainPairView, UserProfileView, RequestManagerAcceptView,
    RequestManagerSelectHelperView, RequestManagerCloseView, ListingDeleteView, ListingUpdateView,
    RequestManagerUpdateView, RequestManagerCancelAcceptView,
    AdminRequestListView, AdminRequestDeleteView
)

urlpatterns = [
    path('register/', RegisterView.as_view(), name='auth_register'),
    path('login/', EmailTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('login/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('requests/', RequestManagerListCreateView.as_view(), name='requests'),
    path('requests/<int:pk>/accept/', RequestManagerAcceptView.as_view(), name='accept_request'),
    path('requests/<int:pk>/select_helper/', RequestManagerSelectHelperView.as_view(), name='select_helper'),
    path('requests/<int:pk>/close/', RequestManagerCloseView.as_view(), name='close_request'),
    path('requests/<int:pk>/update/', RequestManagerUpdateView.as_view(), name='update_request'),
    path('requests/<int:pk>/cancel_accept/', RequestManagerCancelAcceptView.as_view(), name='cancel_accept'),
    path('marketplace/', ListingListCreateView.as_view(), name='marketplace'),
    path('marketplace/<int:pk>/close/', ListingDeleteView.as_view(), name='close_listing'),
    path('marketplace/<int:pk>/update/', ListingUpdateView.as_view(), name='update_listing'),
    path('insights/', LocationInsightListCreateView.as_view(), name='insights'),
    path('profile/', UserProfileView.as_view(), name='profile'),
    path('admin/requests/', AdminRequestListView.as_view(), name='admin_requests'),
    path('admin/requests/<int:pk>/delete/', AdminRequestDeleteView.as_view(), name='admin_delete_request'),
]

from rest_framework.routers import DefaultRouter
from .views import UserViewSet

router = DefaultRouter()
router.register(r'users', UserViewSet, basename='user')

urlpatterns += router.urls
