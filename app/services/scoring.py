from typing import Dict, Any
import openai
from datetime import datetime

class PropertyScorer:
    def __init__(self, openai_api_key: str):
        self.openai_api_key = openai_api_key
        openai.api_key = openai_api_key

    def calculate_motivation_score(self, property_data: Dict[Any, Any]) -> float:
        """
        Calculate motivation score based on property attributes
        """
        score = 0.0
        
        # Days on market scoring
        if property_data.get('days_on_market', 0) > 90:
            score += 20.0
            
        # Price drops scoring
        if property_data.get('price_drops', 0) > 0:
            score += min(20.0, property_data['price_drops'] * 10.0)
            
        # Below assessed value scoring
        if property_data.get('price', 0) < property_data.get('tax_assessed_value', 0):
            score += 15.0
            
        # Absentee owner scoring
        if property_data.get('owner_status', '').lower() == 'absentee':
            score += 25.0
            
        # Pre-foreclosure scoring
        if property_data.get('pre_foreclosure', False):
            score += 30.0
            
        return min(100.0, score)

    def calculate_suggested_offer(self, property_data: Dict[Any, Any], comps: list) -> float:
        """
        Calculate suggested offer based on comps
        """
        if not comps:
            return property_data.get('price', 0) * 0.85  # Default to 85% of listing price
            
        # Calculate average price per sqft from comps
        total_price_per_sqft = 0
        for comp in comps:
            if comp.get('square_feet', 0) > 0:
                price_per_sqft = comp.get('price', 0) / comp.get('square_feet', 1)
                total_price_per_sqft += price_per_sqft
                
        avg_price_per_sqft = total_price_per_sqft / len(comps)
        
        # Apply 15% discount
        discounted_price_per_sqft = avg_price_per_sqft * 0.85
        
        return discounted_price_per_sqft * property_data.get('square_feet', 0)

    def estimate_roi(self, property_data: Dict[Any, Any], comps: list) -> float:
        """
        Calculate estimated ROI for the property
        """
        offer_price = self.calculate_suggested_offer(property_data, comps)
        
        # Estimate repair costs (simplified version)
        estimated_repairs = property_data.get('square_feet', 0) * 20  # $20 per sqft
        
        # Estimate resale price (average of comps)
        if comps:
            resale_price = sum(comp.get('price', 0) for comp in comps) / len(comps)
        else:
            resale_price = property_data.get('price', 0) * 1.3  # 30% markup
            
        # Calculate ROI
        total_investment = offer_price + estimated_repairs
        roi = (resale_price - total_investment) / total_investment * 100
        
        return roi

    async def generate_outreach_message(self, property_data: Dict[Any, Any]) -> str:
        """
        Generate AI-powered outreach message for the property
        """
        prompt = f"""
        Generate a professional and empathetic outreach message for a property owner.
        
        Property Details:
        - Address: {property_data.get('address')}
        - Days on Market: {property_data.get('days_on_market')}
        - Current Price: ${property_data.get('price'):,.2f}
        - Price Drops: {property_data.get('price_drops')}
        
        The message should be friendly, professional, and highlight our ability to provide a quick, cash transaction.
        """
        
        response = await openai.ChatCompletion.create(
            model="gpt-4",
            messages=[
                {"role": "system", "content": "You are a professional real estate investor crafting an outreach message."},
                {"role": "user", "content": prompt}
            ]
        )
        
        return response.choices[0].message.content
