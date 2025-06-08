from rest_framework.authentication import BaseAuthentication
from django.conf import settings
from jose import jwt
import requests

class Auth0User:
    def __init__(self, payload):
        self.payload = payload
        self.is_authenticated = True

    def get(self, key, default=None):
        return self.payload.get(key, default)

    def __getitem__(self, key):
        return self.payload[key]

class Auth0JWTAuthentication(BaseAuthentication):
    """
    Custom authentication for validating Auth0 JWT tokens
    """
    def authenticate(self, request):
        auth = request.headers.get("Authorization", None)
        if not auth:
            return None
            
        parts = auth.split()
        if parts[0].lower() != "bearer":
            return None
            
        token = parts[1]
        try:
            

            jwks = requests.get(f"https://{settings.AUTH0_DOMAIN}/.well-known/jwks.json").json()
            unverified_header = jwt.get_unverified_header(token)
            rsa_key = {}
            
            for key in jwks["keys"]:
                if key["kid"] == unverified_header["kid"]:
                    rsa_key = {
                        "kty": key["kty"],
                        "kid": key["kid"],
                        "use": key["use"],
                        "n": key["n"],
                        "e": key["e"]
                    }
                    
            if rsa_key:
                payload = jwt.decode(
                    token,
                    rsa_key,
                    algorithms=["RS256"],
                    audience=settings.AUTH0_CLIENT_ID,
                    issuer=f"https://{settings.AUTH0_DOMAIN}/"
                )
                print("[Auth0JWTAuthentication] Decoded JWT payload:", payload)
                return (Auth0User(payload), token)
        except Exception as e:
            print(f"JWT validation error: {str(e)}")
            return None
            
        return None