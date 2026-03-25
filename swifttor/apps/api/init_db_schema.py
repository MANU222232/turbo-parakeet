from db.session import engine
from models.database import Base
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def init_db():
    logger.info("Initializing database schema...")
    try:
        # This will create all tables defined in models.database that don't already exist
        Base.metadata.create_all(bind=engine)
        logger.info("Database schema initialized successfully (all missing tables created).")
    except Exception as e:
        logger.error(f"Error initializing database schema: {e}")
        raise e

if __name__ == "__main__":
    init_db()
