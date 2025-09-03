from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime

class PropertyFilter(BaseModel):
    zip_codes: List[str]
    property_type: Optional[str] = None
    min_price: Optional[float] = None
    max_price: Optional[float] = None
    max_days_on_market: Optional[int] = None

class PropertyBase(BaseModel):
    address: str
    zip_code: str
    property_type: str
    price: float
    square_feet: float
    days_on_market: int
    price_drops: int
    owner_status: str
    tax_assessed_value: float
    listing_agent: Optional[str] = None

class PropertyCreate(PropertyBase):
    pass

class Property(PropertyBase):
    id: int
    motivation_score: float
    suggested_offer: float
    estimated_roi: float
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True

class PriceHistoryBase(BaseModel):
    price: float
    date: datetime

class PriceHistoryCreate(PriceHistoryBase):
    property_id: int

class PriceHistory(PriceHistoryBase):
    id: int
    property_id: int

    class Config:
        orm_mode = True
