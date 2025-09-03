from fastapi import APIRouter, HTTPException, BackgroundTasks
from fastapi.responses import StreamingResponse
from typing import List
from ..models import Property
from ..services.scraper import PropertyScraper
from ..services.scoring import PropertyScorer
from ..services.data_export import DataExporter
from ..schemas import PropertyFilter
import os
from sqlalchemy.orm import Session
from ..database import get_db

router = APIRouter()

@router.post("/search")
async def search_properties(filters: PropertyFilter, db: Session = get_db()):
    """
    Search for properties based on given filters
    """
    try:
        async with PropertyScraper() as scraper:
            # Scrape properties from all sources
            properties = await scraper.scrape_all_sources(filters.zip_codes)
            
            # Filter properties based on criteria
            if filters.property_type:
                properties = [p for p in properties if p['property_type'] == filters.property_type]
            if filters.min_price:
                properties = [p for p in properties if p['price'] >= filters.min_price]
            if filters.max_price:
                properties = [p for p in properties if p['price'] <= filters.max_price]
            if filters.max_days_on_market:
                properties = [p for p in properties if p['days_on_market'] <= filters.max_days_on_market]
            
            # Score properties
            scorer = PropertyScorer(os.getenv('OPENAI_API_KEY'))
            for property in properties:
                property['motivation_score'] = scorer.calculate_motivation_score(property)
                property['suggested_offer'] = scorer.calculate_suggested_offer(property, [])  # TODO: Add comps
                property['estimated_roi'] = scorer.estimate_roi(property, [])  # TODO: Add comps
            
            # Sort by motivation score
            properties.sort(key=lambda x: x['motivation_score'], reverse=True)
            
            return properties
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/property/{property_id}/outreach")
async def generate_outreach(property_id: str, db: Session = get_db()):
    """
    Generate AI outreach message for a property
    """
    try:
        property = db.query(Property).filter(Property.id == property_id).first()
        if not property:
            raise HTTPException(status_code=404, detail="Property not found")
        
        scorer = PropertyScorer(os.getenv('OPENAI_API_KEY'))
        message = await scorer.generate_outreach_message(property.__dict__)
        
        return {"message": message}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/export")
async def export_results(background_tasks: BackgroundTasks, db: Session = get_db()):
    """
    Export property data to CSV
    """
    try:
        properties = db.query(Property).all()
        properties_data = [p.__dict__ for p in properties]
        
        # Create CSV file
        csv_content = DataExporter.export_to_csv(properties_data)
        
        # Return streaming response
        return StreamingResponse(
            iter([csv_content.getvalue()]),
            media_type="text/csv",
            headers={"Content-Disposition": f"attachment; filename=propai-scout-export.csv"}
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
