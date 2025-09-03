from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List
import os
from dotenv import load_dotenv

from .database import get_db, init_db
from .models import Property
from .schemas import PropertyFilter, PropertyResponse
from .services.property_service import PropertyService
from .services.scraper_service import ScraperService
from .services.scoring_service import ScoringService

# Load environment variables
load_dotenv()

# Initialize FastAPI app
app = FastAPI(
    title="PropAI Scout API",
    description="Real Estate Lead Generation and Scoring API",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "https://propaiscout.vercel.app"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize services
property_service = PropertyService()
scraper_service = ScraperService()
scoring_service = ScoringService()

@app.on_event("startup")
async def startup_event():
    init_db()

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

@app.post("/api/search", response_model=List[PropertyResponse])
async def search_properties(
    filters: PropertyFilter,
    db: Session = Depends(get_db)
):
    try:
        # Step 1: Scrape fresh property data
        properties = await scraper_service.scrape_properties(filters.zip_codes)
        
        # Step 2: Save to database
        saved_properties = property_service.save_properties(db, properties)
        
        # Step 3: Apply filters
        filtered_properties = property_service.apply_filters(db, saved_properties, filters)
        
        # Step 4: Calculate motivation scores and suggestions
        scored_properties = []
        for prop in filtered_properties:
            # Get comparable properties
            comps = property_service.get_comps(db, prop)
            
            # Calculate motivation score
            motivation_score = scoring_service.calculate_motivation_score(prop)
            
            # Calculate suggested offer
            suggested_offer = scoring_service.calculate_suggested_offer(prop, comps)
            
            # Calculate ROI
            estimated_roi = scoring_service.estimate_roi(prop, suggested_offer, comps)
            
            # Update property with calculations
            prop_dict = prop.__dict__
            prop_dict.update({
                "motivation_score": motivation_score,
                "suggested_offer": suggested_offer,
                "estimated_roi": estimated_roi
            })
            scored_properties.append(prop_dict)
        
        # Sort by motivation score
        scored_properties.sort(key=lambda x: x["motivation_score"], reverse=True)
        
        return scored_properties
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/property/{property_id}/outreach")
async def generate_outreach(
    property_id: int,
    db: Session = Depends(get_db)
):
    try:
        property = property_service.get_property_by_id(db, property_id)
        if not property:
            raise HTTPException(status_code=404, detail="Property not found")
        
        message = await scoring_service.generate_outreach_message(property)
        return {"message": message}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/export")
async def export_properties(
    property_ids: List[int],
    db: Session = Depends(get_db)
):
    try:
        properties = property_service.get_properties_by_ids(db, property_ids)
        csv_data = property_service.generate_csv(properties)
        return csv_data
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
