from app.services.auth import authenticate_user
import logging

# Enable logging to see what's happening
logging.basicConfig(level=logging.DEBUG)

try:
    result = authenticate_user('admin', 'admin123')
    print(f'Authentication result: {result}')
except Exception as e:
    print(f'Error during authentication: {e}')
    import traceback
    traceback.print_exc()
