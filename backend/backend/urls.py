"""
URL configuration for backend project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path
from custom_auth.views import (
    LoginView, CallbackView, LogoutView, UserInfoView
)
from mainlogic.views import (
    DashboardRedirectView, PostmarkInboundView, UserInfoView,
    CategoryStatsView, EmailListView, EmailDetailView, ChatAPIView,
    DigestAPIView, DashboardStatsView
)

urlpatterns = [
    path('admin/', admin.site.urls),
    
    path('api/auth/login/', LoginView.as_view(), name='auth_login'),
    path('api/auth/callback/', CallbackView.as_view(), name='auth_callback'),
    path('api/auth/logout/', LogoutView.as_view(), name='auth_logout'),
    path('api/auth/user/', UserInfoView.as_view(), name='auth_user'),
    path('dashboard/', DashboardRedirectView.as_view(),name='dashboard_redirect'),
    path('api/postmark/inbound/', PostmarkInboundView.as_view(), name='postmark_inbound'),
    path('api/categories/stats/', CategoryStatsView.as_view(), name='category_stats'),
    path('api/emails/', EmailListView.as_view(), name='email_list'),
    path('api/emails/<int:email_id>/', EmailDetailView.as_view(), name='email_detail'),
    path('api/chat/', ChatAPIView.as_view(), name='chat_api'),
    path('api/digest/', DigestAPIView.as_view(), name='digest_api'),
    path('api/dashboard/stats/', DashboardStatsView.as_view(), name='dashboard_stats'),
]
