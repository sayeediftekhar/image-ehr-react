from fastapi import APIRouter, HTTPException, Form, Request
from fastapi.responses import JSONResponse
import logging
import requests

from app.services.auth import authenticate_user, log_login_attempt, update_user_last_login

router = APIRouter()
logger = logging.getLogger(__name__)

def get_location_from_ip(ip):
    try:
        url = f"http://ip-api.com/json/{ip}"
        response = requests.get(url, timeout=5)
        response.raise_for_status()
        data = response.json()
        if data.get("status") == "success":
            return {
                "country": data.get("country"),
                "region": data.get("regionName"),
                "city": data.get("city"),
                "lat": data.get("lat"),
                "lon": data.get("lon"),
                "isp": data.get("isp"),
            }
        else:
            logger.warning(f"GeoIP API error: {data.get('message')}")
            return None
    except Exception as e:
        logger.error(f"GeoIP API request failed: {e}")
        return None

@router.post("/login")
async def login(request: Request, username: str = Form(...), password: str = Form(...)):
    client_ip = request.client.host
    logger.info(f"🚀 LOGIN ATTEMPT: username='{username}' from IP={client_ip}")
    
    if not username or not password:
        return JSONResponse(
            status_code=400,
            content={"success": False, "message": "Username and password are required"}
        )

    user = authenticate_user(username, password)

    if user:
        logger.info(f"✅ Login successful for {username}")
        
        # Get location data
        location_data = get_location_from_ip(client_ip)
        
        # Log the attempt
        log_login_attempt(username, client_ip, location_data, True)
        
        # Update last login
        update_user_last_login(username, client_ip, location_data)
        
        return JSONResponse(
            content={"success": True, "user": user, "message": "Login successful"}
        )
    else:
        logger.warning(f"❌ Login failed for {username}")
        
        # Log failed attempt
        location_data = get_location_from_ip(client_ip)
        log_login_attempt(username, client_ip, location_data, False)
        
        return JSONResponse(
            status_code=401,
            content={"success": False, "message": "Invalid username or password"}
        )

@router.post("/logout")
def logout():
    return JSONResponse(content={"success": True, "message": "Logged out successfully"})
