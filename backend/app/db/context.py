from contextlib import contextmanager
from app.db.pools import get_connection, return_connection
import logging

logger = logging.getLogger(__name__)


@contextmanager
def get_db_cursor():
    """Get database cursor with automatic connection management"""
    conn = None
    cursor = None
    try:
        conn = get_connection()
        if conn is None:
            logger.error("No database connection available")
            raise Exception("Database connection not available")

        cursor = conn.cursor()
        yield cursor
        conn.commit()
        logger.debug("Database transaction committed successfully")

    except Exception as e:
        if conn:
            try:
                conn.rollback()
                logger.debug("Database transaction rolled back")
            except Exception as rollback_error:
                logger.error(f"Error during rollback: {rollback_error}")

        logger.error(f"Database error: {e}")
        raise
    finally:
        if cursor:
            try:
                cursor.close()
            except Exception as cursor_error:
                logger.error(f"Error closing cursor: {cursor_error}")

        if conn:
            return_connection(conn)


@contextmanager
def get_db_connection():
    """Get database connection with automatic management (for transactions)"""
    conn = None
    try:
        conn = get_connection()
        if conn is None:
            logger.error("No database connection available")
            raise Exception("Database connection not available")

        yield conn
        conn.commit()
        logger.debug("Database transaction committed successfully")

    except Exception as e:
        if conn:
            try:
                conn.rollback()
                logger.debug("Database transaction rolled back")
            except Exception as rollback_error:
                logger.error(f"Error during rollback: {rollback_error}")

        logger.error(f"Database error: {e}")
        raise
    finally:
        if conn:
            return_connection(conn)


# Utility function for testing database connectivity
def test_db_connection():
    """Test database connection"""
    try:
        with get_db_cursor() as cur:
            cur.execute("SELECT 1 as test")
            result = cur.fetchone()
            logger.info(f"Database connection test successful: {result}")
            return True
    except Exception as e:
        logger.error(f"Database connection test failed: {e}")
        return False
