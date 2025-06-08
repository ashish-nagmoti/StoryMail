from django.shortcuts import render, redirect
import json
from authlib.integrations.django_client import OAuth
from django.conf import settings
from urllib.parse import quote_plus, urlencode
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework import status
import requests
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
import logging
from django.http import HttpResponse
from mainlogic.views import DashboardRedirectView
# Import the Auth0JWTAuthentication class from the authentication module
from custom_auth.authentication import Auth0JWTAuthentication
from mainlogic.models import StoryMailUser
# Set up logger
logger = logging.getLogger(__name__)

oauth = OAuth()

oauth.register(
    "auth0",
    client_id=settings.AUTH0_CLIENT_ID,
    client_secret=settings.AUTH0_CLIENT_SECRET,
    client_kwargs={
        "scope": "openid profile email",
        "audience": settings.AUTH0_AUDIENCE,
    },
    server_metadata_url=f"https://{settings.AUTH0_DOMAIN}/.well-known/openid-configuration",
)

# API endpoint for user information
class UserInfoView(APIView):
    authentication_classes = [Auth0JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        """
        Return the user information from the Auth0 token
        """
        user_data = request.user
        user, _ = StoryMailUser.objects.update_or_create(
        auth0_id=user_data.get("sub"),
        defaults={
            "name": user_data.get("name"),
            "email": user_data.get("email"),
            "picture": user_data.get("picture"),
            }
        )
        return Response({
            "id": user_data.get("sub"),
            "email": user_data.get("email"),
            "name": user_data.get("name"),
            "picture": user_data.get("picture")
        })

# API login endpoint that returns Auth0 authorization URL
@method_decorator(csrf_exempt, name='dispatch')
class LoginView(APIView):
    permission_classes = [AllowAny]  # Make sure this view is accessible without authentication
    authentication_classes = []      # Explicitly empty authentication classes

    def get(self, request):
        """
        Return the Auth0 authorization URL
        """
        try:
            logger.info("LoginView get request received")
            
            # Get frontend_redirect (where to send the user after successful auth)
            frontend_redirect = request.query_params.get('redirect_uri')
            logger.info(f"Frontend redirect: {frontend_redirect}")
            
            # Store frontend redirect in session or use state parameter
            state = {"redirect": frontend_redirect} if frontend_redirect else {}
            state_param = urlencode(state) if state else ""
            
            # Use backend URL as the callback URL for Auth0
            redirect_uri = f"{request.scheme}://{request.get_host()}/api/auth/callback/"
            logger.info(f"Auth0 Callback URI: {redirect_uri}")
            
            auth_url = f"https://{settings.AUTH0_DOMAIN}/authorize?" + urlencode({
                "client_id": settings.AUTH0_CLIENT_ID,
                "redirect_uri": redirect_uri,
                "response_type": "code",
                "scope": "openid profile email",
                "audience": settings.AUTH0_AUDIENCE,
                "state": state_param
            }, quote_via=quote_plus)
            
            logger.info(f"Generated Auth0 URL: {auth_url}")
            return Response({"auth_url": auth_url})
        except Exception as e:
            logger.error(f"Error in LoginView: {str(e)}")
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# API callback endpoint that exchanges code for tokens
@method_decorator(csrf_exempt, name='dispatch')
class CallbackView(APIView):
    permission_classes = [AllowAny]
    authentication_classes = []      # Explicitly empty authentication classes

    def get(self, request):
        """
        Handle callback from Auth0 (when user is redirected back from Auth0)
        """
        try:
            code = request.query_params.get('code')
            error = request.query_params.get('error')
            error_description = request.query_params.get('error_description')
            state = request.query_params.get('state', '')
            
            logger.info(f"Callback received: code={code}, error={error}, state={state}")
            
            # Parse state parameter if it exists
            frontend_redirect = None
            try:
                if state:
                    state_dict = {k: v for k, v in [p.split('=') for p in state.split('&')]}
                    frontend_redirect = state_dict.get('redirect')
            except Exception as e:
                logger.error(f"Error parsing state parameter: {str(e)}")
            
            # Always redirect to Django's /dashboard/ endpoint
            frontend_url = settings.FRONTEND_URL + "/dashboard"
            
            if error:
                logger.error(f"Auth0 error: {error} - {error_description}")
                return redirect(f"{frontend_url}?error={error}&error_description={quote_plus(error_description)}")
            
            if not code:
                logger.error("No code received in callback")
                return redirect(f"{frontend_url}?error=no_code&error_description=No+authorization+code+received")
            
            # Exchange code for tokens
            redirect_uri = f"{request.scheme}://{request.get_host()}/api/auth/callback/"
            token_url = f"https://{settings.AUTH0_DOMAIN}/oauth/token"
            payload = {
                "grant_type": "authorization_code",
                "client_id": settings.AUTH0_CLIENT_ID,
                "client_secret": settings.AUTH0_CLIENT_SECRET,
                "code": code,
                "redirect_uri": redirect_uri
            }
            
            logger.info(f"Exchanging code for token with payload: {payload}")
            response = requests.post(token_url, json=payload)
            
            if response.status_code == 200:
                token_data = response.json()
                logger.info("Successfully exchanged code for token")
                id_token = token_data.get("id_token")
                if id_token:
                    from jose import jwt
                    try:
                        payload = jwt.get_unverified_claims(id_token)
                        print("[CallbackView] Decoded ID token payload:", payload)
                    except Exception as e:
                        print("[CallbackView] Failed to decode ID token:", e)
                
                # Redirect to /dashboard/ with tokens as URL fragments
                tokens_fragment = urlencode({
                    "access_token": token_data.get("access_token", ""),
                    "id_token": token_data.get("id_token", ""),
                    "refresh_token": token_data.get("refresh_token", ""),
                    "expires_in": str(token_data.get("expires_in", ""))
                })
                
                return redirect(f"{frontend_url}#auth_result={tokens_fragment}")
            else:
                logger.error(f"Failed to exchange code: {response.status_code}, {response.text}")
                return redirect(f"{frontend_url}?error=token_exchange_failed&error_description=Failed+to+exchange+code+for+tokens")
                
        except Exception as e:
            logger.error(f"Error in CallbackView.get: {str(e)}")
            return redirect(settings.FRONTEND_URL + "/login?error=server_error&error_description=Internal+server+error")

    def post(self, request):
        """
        Exchange authorization code for tokens (API method)
        """
        try:
            code = request.data.get('code')
            redirect_uri = request.data.get('redirect_uri')
            
            if not code or not redirect_uri:
                logger.error("Missing code or redirect_uri")
                return Response({"error": "Missing code or redirect_uri"}, status=status.HTTP_400_BAD_REQUEST)
                
            token_url = f"https://{settings.AUTH0_DOMAIN}/oauth/token"
            payload = {
                "grant_type": "authorization_code",
                "client_id": settings.AUTH0_CLIENT_ID,
                "client_secret": settings.AUTH0_CLIENT_SECRET,
                "code": code,
                "redirect_uri": redirect_uri
            }
            
            logger.info(f"Exchanging code for token with payload: {payload}")
            response = requests.post(token_url, json=payload)
            
            if response.status_code == 200:
                logger.info("Successfully exchanged code for token")
                return Response(response.json())
            else:
                logger.error(f"Failed to exchange code: {response.status_code}, {response.text}")
                return Response(response.json(), status=response.status_code)
        except Exception as e:
            logger.error(f"Error in CallbackView.post: {str(e)}")
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# API logout endpoint
@method_decorator(csrf_exempt, name='dispatch')
class LogoutView(APIView):
    permission_classes = [AllowAny]
    authentication_classes = []      # Explicitly empty authentication classes

    def post(self, request):
        """
        Return the Auth0 logout URL
        """
        try:
            return_to = request.data.get('returnTo')
            if not return_to:
                return Response({"error": "Missing returnTo parameter"}, status=status.HTTP_400_BAD_REQUEST)
                
            logout_url = f"https://{settings.AUTH0_DOMAIN}/v2/logout?" + urlencode({
                "client_id": settings.AUTH0_CLIENT_ID,
                "returnTo": return_to
            }, quote_via=quote_plus)
            
            return Response({"logout_url": logout_url})
        except Exception as e:
            logger.error(f"Error in LogoutView: {str(e)}")
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

