import psycopg2
from psycopg2.pool import SimpleConnectionPool
from app.core.config import get_settings
import logging

logger = logging.getLogger(__name__)
settings = get_settings()

def create_pool():
    try:
        return SimpleConnectionPool(
            minconn=1,
            maxconn=10,
            dsn=str(settings.POSTGRES_DSN)
        )
    except Exception as e:
        logger.error(f"Failed to create connection pool: {e}")
        raise

# Initialize the pool
pool = create_pool()

def get_connection():
    """Get a connection from the pool with retry logic"""
    global pool
    max_retries = 3
    for attempt in range(max_retries):
        try:
            conn = pool.getconn()
            # Test the connection
            with conn.cursor() as cur:
                cur.execute("SELECT 1")
            return conn
        except (psycopg2.OperationalError, psycopg2.InterfaceError) as e:
            logger.warning(f"Connection attempt {attempt + 1} failed: {e}")
            if attempt < max_retries - 1:
                # Recreate the pool
                pool = create_pool()
            else:
                raise
    return None
