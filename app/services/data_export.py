import pandas as pd
from typing import List, Dict, Any
import csv
from datetime import datetime
import io

class DataExporter:
    @staticmethod
    def export_to_csv(properties: List[Dict[Any, Any]]) -> io.StringIO:
        """
        Export property data to CSV format
        """
        # Convert properties to DataFrame
        df = pd.DataFrame(properties)
        
        # Reorder and rename columns for better readability
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
        df.to_csv(output, index=False, quoting=csv.QUOTE_NONNUMERIC)
        output.seek(0)
        
        return output
