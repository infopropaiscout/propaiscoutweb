from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from datetime import datetime

Base = declarative_base()

class Property(Base):
    __tablename__ = "properties"

    id = Column(Integer, primary_key=True, index=True)
    address = Column(String, unique=True, index=True)
    zip_code = Column(String, index=True)
    property_type = Column(String)
    price = Column(Float)
    square_feet = Column(Float)
    days_on_market = Column(Integer)
    price_drops = Column(Integer)
    owner_status = Column(String)  # owner-occupied or absentee
    tax_assessed_value = Column(Float)
    listing_agent = Column(String)
    motivation_score = Column(Float)
    suggested_offer = Column(Float)
    estimated_roi = Column(Float)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class PriceHistory(Base):
    __tablename__ = "price_history"

    id = Column(Integer, primary_key=True, index=True)
    property_id = Column(Integer, ForeignKey("properties.id"))
    price = Column(Float)
    date = Column(DateTime)
    
    property = relationship("Property", back_populates="price_history")

Property.price_history = relationship("PriceHistory", back_populates="property")

# Database URL will be loaded from environment variables
SQLALCHEMY_DATABASE_URL = "sqlite:///./propai_scout.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL)

# Create all tables
Base.metadata.create_all(bind=engine)
