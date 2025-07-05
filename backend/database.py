from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.ext.declarative import declarative_base
from backend.core.config import settings

# Define the SQLAlchemy engine
# Example for PostgreSQL: "postgresql://user:password@host:port/database"
engine = create_engine(settings.DATABASE_URL)

# Create a configured "Session" class
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base class for all ORM models
Base = declarative_base()

def create_db_and_tables():
    """
    Creates all tables in the database defined by ORM models inheriting from Base.
    Should be called once at application startup.
    """
    try:
        print(f"Attempting to create tables for database at: {settings.DATABASE_URL}")
        # Ensure all model definitions are imported so Base is aware of them
        from backend import models_db  # This must exist and use Base
        Base.metadata.create_all(bind=engine)
        print("Tables created successfully (if they didn't exist).")
    except Exception as e:
        print(f"Error creating database tables: {e}")
        raise

# FastAPI dependency: yields a DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

if __name__ == "__main__":
    # For manual testing: don't run in production
    print("Running database.py directly...")
    print(f"Database Engine: {engine}")
    print("SessionLocal and Base are defined.")
    # Uncomment to create tables manually:
    # create_db_and_tables()