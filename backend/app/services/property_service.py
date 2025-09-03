from sqlalchemy.orm import Session
from typing import List, Dict, Any
from ..models import Property
from ..schemas import PropertyFilter
import pandas as pd
import io

class PropertyService:
    def save_properties(self, db: Session, properties: List[Dict[Any, Any]]) -> List[Property]:
        """
        Save properties to database
        """
        saved_properties = []
        for prop_data in properties:
            # Check if property already exists
            existing_property = db.query(Property).filter(
                Property.address == prop_data['address']
            ).first()
            
            if existing_property:
                # Update existing property
                for key, value in prop_data.items():
                    setattr(existing_property, key, value)
                saved_properties.append(existing_property)
            else:
                # Create new property
                new_property = Property(**prop_data)
                db.add(new_property)
                saved_properties.append(new_property)
        
        db.commit()
        return saved_properties

    def apply_filters(self, db: Session, properties: List[Property], filters: PropertyFilter) -> List[Property]:
        """
        Apply filters to properties
        """
        filtered = properties.copy()
        
        if filters.property_type:
            filtered = [p for p in filtered if p.property_type == filters.property_type]
            
        if filters.min_price:
            filtered = [p for p in filtered if p.price >= filters.min_price]
            
        if filters.max_price:
            filtered = [p for p in filtered if p.price <= filters.max_price]
            
        if filters.max_days_on_market:
            filtered = [p for p in filtered if p.days_on_market <= filters.max_days_on_market]
            
        return filtered

    def get_property_by_id(self, db: Session, property_id: int) -> Property:
        """
        Get property by ID
        """
        return db.query(Property).filter(Property.id == property_id).first()

    def get_properties_by_ids(self, db: Session, property_ids: List[int]) -> List[Property]:
        """
        Get properties by IDs
        """
        return db.query(Property).filter(Property.id.in_(property_ids)).all()

    def get_comps(self, db: Session, property: Property, max_comps: int = 5) -> List[Property]:
        """
        Get comparable properties
        """
        comps = db.query(Property).filter(
            Property.zip_code == property.zip_code,
            Property.property_type == property.property_type,
            Property.id != property.id
        ).limit(max_comps).all()
        
        return comps

    def generate_csv(self, properties: List[Property]) -> io.StringIO:
        """
        Generate CSV file from properties
        """
        # Convert properties to DataFrame
        df = pd.DataFrame([p.__dict__ for p in properties])
        
        # Reorder and rename columns
        columns = {
            'address': 'Address',
            'zip_code': 'ZIP Code',
            'price': 'List Price',
            'suggested_offer': 'Suggested Offer',
            'motivation_score': 'Motivation Score',
            'estimated_roi': 'Estimated ROI %',
            'days_on_market': 'Days on Market',
            'price_drops': 'Price Drops',
            'owner_status': 'Owner Status',
            'tax_assessed_value': 'Tax Assessed Value',
            'square_feet': 'Square Feet',
            'property_type': 'Property Type',
            'listing_agent': 'Listing Agent'
        }
        
        # Select and rename columns
        df = df[[col for col in columns.keys() if col in df.columns]]
        df = df.rename(columns=columns)
        
        # Format numeric columns
        if 'List Price' in df.columns:
            df['List Price'] = df['List Price'].apply(lambda x: f"${x:,.2f}")
        if 'Suggested Offer' in df.columns:
            df['Suggested Offer'] = df['Suggested Offer'].apply(lambda x: f"${x:,.2f}")
        if 'Estimated ROI %' in df.columns:
            df['Estimated ROI %'] = df['Estimated ROI %'].apply(lambda x: f"{x:.1f}%")
        if 'Tax Assessed Value' in df.columns:
            df['Tax Assessed Value'] = df['Tax Assessed Value'].apply(lambda x: f"${x:,.2f}")
        if 'Motivation Score' in df.columns:
            df['Motivation Score'] = df['Motivation Score'].apply(lambda x: f"{x:.1f}")
        
        # Create string buffer
        output = io.StringIO()
        df.to_csv(output, index=False)
        output.seek(0)
        
        return output
