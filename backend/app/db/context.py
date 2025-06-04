from contextlib import contextmanager
from app.db.pools import get_connection, pool
import logging

logger = logging.getLogger(__name__)

@contextmanager
def get_db_cursor():
    conn = None
    try:
        conn = get_connection()
        with conn.cursor() as cur:
            yield cur
            conn.commit()
    except Exception as e:
        if conn:
            conn.rollback()
        logger.error(f"Database error: {e}")
        raise
    finally:
        if conn:
            pool.putconn(conn)
