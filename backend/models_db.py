from sqlalchemy import Column, Integer, String, Date, Boolean, Float, Sequence
from backend.database import Base # Import Base from database.py

class VisitorDataDb(Base):
    __tablename__ = "visitor_data"

    # Define a sequence for the id if not using auto-incrementing type directly supported by DB,
    # or rely on DB's auto-increment if `Integer, primary_key=True` is enough (common for Postgres).
    # For Postgres, SERIAL or BIGSERIAL is often handled by just Integer + primary_key=True.
    # Explicit sequence can be useful for some DBs or specific needs.
    # id_seq = Sequence(f'{__tablename__}_id_seq') # Example if explicit sequence desired

    id = Column(Integer, primary_key=True, index=True, autoincrement=True) # autoincrement=True is default for Integer PK
    date = Column(Date, nullable=False, index=True, unique=True) # Assuming one record per date
    visitor_count = Column(Integer, nullable=False)

    # Derived or external calendar features (can be pre-calculated or joined)
    day_of_week = Column(String(10)) # E.g., "Monday", "Tuesday" or 0-6; String is more readable
    is_holiday = Column(Boolean, default=False)
    is_weekend = Column(Boolean, default=False)
    is_school_break = Column(Boolean, default=False)
    special_event = Column(String(255), nullable=True) # Description of event

    # Observed weather conditions for that historical day
    # These would ideally be populated from a historical weather data source
    # For now, they can be nullable if not always available.
    temp = Column(Float, nullable=True) # Average temperature for the day
    temp_min = Column(Float, nullable=True)
    temp_max = Column(Float, nullable=True)
    feels_like = Column(Float, nullable=True)
    humidity = Column(Float, nullable=True) # Average humidity
    pressure = Column(Float, nullable=True)
    wind_speed = Column(Float, nullable=True)
    pop = Column(Float, nullable=True) # Observed probability of precipitation for the day
    weather_main = Column(String(100), nullable=True) # E.g., "Rain", "Clouds", "Clear"
    weather_description = Column(String(255), nullable=True) # E.g., "light rain", "scattered clouds"
    weather_icon = Column(String(10), nullable=True) # e.g., "01d"
    clouds = Column(Integer, nullable=True) # Cloudiness percentage
    rain_3h = Column(Float, nullable=True) # Rain volume for the last 3 hours, if applicable for daily summary

    def __repr__(self):
        return f"<VisitorDataDb(id={self.id}, date='{self.date}', visitors='{self.visitor_count}')>"

# If you had other models, they would be defined here as well.
# For example, if live visitor counts were stored in a separate table:
# class LiveVisitorCountDb(Base):
#     __tablename__ = "live_visitor_counts"
#     id = Column(Integer, primary_key=True, index=True, autoincrement=True)
#     timestamp = Column(DateTime, default=datetime.utcnow, index=True)
#     visitor_count = Column(Integer, nullable=False)
#
#     def __repr__(self):
#         return f"<LiveVisitorCountDb(id={self.id}, time='{self.timestamp}', count='{self.visitor_count}')>"

# After defining all models that use Base, you might want to ensure they are all imported
# where create_db_and_tables is called in database.py.
# A common practice is to have an __init__.py in the models directory that imports all model files,
# and then database.py imports that __init__.py.
# For this simple case with one model file, database.py can import models_db directly.

# To ensure create_db_and_tables in database.py knows about this model,
# we need to modify database.py to import this module.
# I will do that in a subsequent step if it's not already handled by an __init__.py structure.
# For now, this file defines the model. The plan includes updating database.py.
# Actually, I will update database.py in this step to import this model.
# This is because create_db_and_tables needs to know about all models.

# Let's also create an __init__.py in the models directory (if I create one, currently models_db.py is directly in backend/)
# No, models_db.py is directly in backend/ as per plan.
# So, database.py will need `from backend import models_db`
# and then `models_db.Base.metadata.create_all(bind=engine)`
# Or more simply, if Base is imported here from database, this model class VisitorDataDb
# automatically registers itself with that Base's metadata.
# The current `Base = declarative_base()` in database.py and `from backend.database import Base` here is correct.
# So, when `Base.metadata.create_all(engine)` is called in `database.py`, this table will be included.
# The only thing needed is to ensure `backend.models_db` is imported in `database.py` *before* `create_all` is called.
# I will handle this by modifying `database.py` to import `backend.models_db`.

# Correction: `Base` is defined in `database.py`. Models in `models_db.py` import this `Base`.
# `database.py` needs to import `models_db` module so that the classes deriving from `Base`
# are registered with `Base.metadata` *before* `create_all` is called.
# This is a common pattern.
# So the next action will be to update database.py to add `import backend.models_db`
# before `Base.metadata.create_all(bind=engine)`.

# For now, this file is complete.
