from sqlalchemy import Column, Integer, String, Float, DateTime, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from .database import Base

class Property(Base):
    __tablename__ = "properties"

    id = Column(Integer, primary_key=True, index=True)
    address = Column(String, index=True)
    zip_code = Column(String, index=True)
    property_type = Column(String)
    price = Column(Float)
    square_feet = Column(Float)
    days_on_market = Column(Integer)
    price_drops = Column(Integer)
    owner_status = Column(String)  # owner-occupied, absentee
    tax_assessed_value = Column(Float)
    listing_agent = Column(String)
    pre_foreclosure = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    price_history = relationship("PriceHistory", back_populates="property")

class PriceHistory(Base):
    __tablename__ = "price_history"

    id = Column(Integer, primary_key=True, index=True)
    property_id = Column(Integer, ForeignKey("properties.id"))
    price = Column(Float)
    date = Column(DateTime(timezone=True))
    
    property = relationship("Property", back_populates="price_history")