from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.ext.declarative import declarative_base
from backend.core.config import settings

# Define the SQLAlchemy engine
engine = create_engine(settings.DATABASE_URL)

# Create a configured "Session" class
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Create a Base for declarative class definitions
Base = declarative_base()

def create_db_and_tables():
    """
    Creates all tables in the database that are defined by classes inheriting from Base.
    This function should be called once at application startup.
    """
    try:
        print(f"Attempting to create tables for database at: {settings.DATABASE_URL}")
        # Import all modules here that define models so that
        # they are registered with SQLAlchemy Base before create_all is called.
        from backend import models_db  # Ensures VisitorDataDb model is registered with Base
        Base.metadata.create_all(bind=engine)
        print("Tables created successfully (if they didn't exist).")
    except Exception as e:
        print(f"Error creating database tables: {e}")
        # Depending on the application's needs, you might want to raise the exception
        # or handle it more gracefully. For now, just printing.
        raise

# Dependency for FastAPI to get a DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

if __name__ == "__main__":
    # This is for demonstration or direct testing of table creation.
    # In a real app, create_db_and_tables() would be called from main.py during startup.
    print("Running database.py directly...")
    print("This script is intended to define DB components and provide a create_db_and_tables function.")
    print("To actually create tables, you'd typically call create_db_and_tables() from your main app or a setup script.")
    # Example: (This will only work if models are defined and imported above)
    # print("Attempting to create tables (ensure models are imported in create_db_and_tables)...")
    # from backend import models_db # Make sure models_db.py exists and Base is used there
    # Base.metadata.create_all(bind=engine)
    # print("Tables should be created if models were registered.")
    print(f"Database Engine: {engine}")
    print("SessionLocal and Base are defined.")
