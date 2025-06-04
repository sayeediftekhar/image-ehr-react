import psycopg2
from psycopg2.pool import SimpleConnectionPool
from app.core.config import get_settings
import logging

logger = logging.getLogger(__name__)


def create_pool():
    try:
        settings = get_settings()

        # Use your actual Neon database URL
        database_url = "postgresql://neondb_owner:npg_Odu71XQLEtJr@ep-wild-feather-a1h8usnt-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require"

        logger.info("Creating database connection pool...")
        return SimpleConnectionPool(minconn=1, maxconn=10, dsn=database_url)
    except Exception as e:
        logger.error(f"Failed to create connection pool: {e}")
        # Return None instead of raising to allow app to start
        return None


# Initialize the pool
pool = create_pool()


def get_connection():
    """Get a connection from the pool with retry logic"""
    global pool

    if pool is None:
        logger.warning("Database pool not available - attempting to recreate")
        pool = create_pool()
        if pool is None:
            logger.error("Could not create database pool")
            return None

    max_retries = 3
    for attempt in range(max_retries):
        try:
            conn = pool.getconn()
            # Test the connection
            with conn.cursor() as cur:
                cur.execute("SELECT 1")
            logger.debug(f"Database connection successful on attempt {attempt + 1}")
            return conn
        except (psycopg2.OperationalError, psycopg2.InterfaceError) as e:
            logger.warning(f"Connection attempt {attempt + 1} failed: {e}")
            if attempt < max_retries - 1:
                # Recreate the pool
                logger.info("Recreating connection pool...")
                try:
                    pool = create_pool()
                except Exception as pool_error:
                    logger.error(f"Failed to recreate pool: {pool_error}")
                    pool = None
            else:
                logger.error("All connection attempts failed")
                raise
    return None


def return_connection(conn):
    """Return a connection to the pool"""
    if pool and conn:
        try:
            pool.putconn(conn)
        except Exception as e:
            logger.error(f"Error returning connection to pool: {e}")


def close_pool():
    """Close all connections in the pool"""
    global pool
    if pool:
        try:
            pool.closeall()
            logger.info("Database connection pool closed")
        except Exception as e:
            logger.error(f"Error closing connection pool: {e}")
        finally:
            pool = None
