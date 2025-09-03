from typing import Dict, Any, List
from ..models import Property
import openai
import os

class ScoringService:
    def __init__(self):
        self.openai_api_key = os.getenv("OPENAI_API_KEY")
        if self.openai_api_key:
            openai.api_key = self.openai_api_key

    def calculate_motivation_score(self, property: Property) -> float:
        """
        Calculate motivation score based on property attributes
        """
        score = 0.0
        
        # Days on market scoring (max 20 points)
        if property.days_on_market > 90:
            score += 20.0
        elif property.days_on_market > 60:
            score += 15.0
        elif property.days_on_market > 30:
            score += 10.0
            
        # Price drops scoring (max 20 points)
        if property.price_drops > 0:
            score += min(20.0, property.price_drops * 10.0)
            
        # Below assessed value scoring (max 15 points)
        if property.price < property.tax_assessed_value:
            discount_percentage = (property.tax_assessed_value - property.price) / property.tax_assessed_value * 100
            score += min(15.0, discount_percentage)
            
        # Absentee owner scoring (25 points)
        if property.owner_status == 'absentee':
            score += 25.0
            
        # Pre-foreclosure scoring (30 points)
        if property.pre_foreclosure:
            score += 30.0
            
        return min(100.0, score)

    def calculate_suggested_offer(self, property: Property, comps: List[Property]) -> float:
        """
        Calculate suggested offer based on comps
        """
        if not comps:
            return property.price * 0.85  # Default to 85% of listing price
            
        # Calculate average price per sqft from comps
        total_price_per_sqft = 0
        valid_comps = 0
        
        for comp in comps:
            if comp.square_feet > 0:
                price_per_sqft = comp.price / comp.square_feet
                total_price_per_sqft += price_per_sqft
                valid_comps += 1
                
        if valid_comps > 0:
            avg_price_per_sqft = total_price_per_sqft / valid_comps
            
            # Apply 15% discount
            discounted_price_per_sqft = avg_price_per_sqft * 0.85
            
            return discounted_price_per_sqft * property.square_feet
        else:
            return property.price * 0.85

    def estimate_roi(self, property: Property, offer_price: float, comps: List[Property]) -> float:
        """
        Calculate estimated ROI
        """
        # Estimate repair costs (simplified version)
        estimated_repairs = property.square_feet * 20  # $20 per sqft
        
        # Estimate resale price (average of comps)
        if comps:
            resale_price = sum(comp.price for comp in comps) / len(comps)
        else:
            resale_price = property.price * 1.3  # 30% markup
            
        # Calculate ROI
        total_investment = offer_price + estimated_repairs
        roi = (resale_price - total_investment) / total_investment * 100
        
        return roi

    async def generate_outreach_message(self, property: Property) -> str:
        """
        Generate AI-powered outreach message
        """
        if not self.openai_api_key:
            return self._generate_default_message(property)
            
        try:
            prompt = f"""
            Generate a professional and empathetic outreach message for a property owner.
            
            Property Details:
            - Address: {property.address}
            - Days on Market: {property.days_on_market}
            - Current Price: ${property.price:,.2f}
            - Price Drops: {property.price_drops}
            
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
            
        except Exception as e:
            print(f"Error generating AI message: {str(e)}")
            return self._generate_default_message(property)

    def _generate_default_message(self, property: Property) -> str:
        """
        Generate default outreach message
        """
        return f"""Hi there,

I noticed your property at {property.address} has been on the market for {property.days_on_market} days. I'm a local real estate investor specializing in providing quick, hassle-free cash offers for properties in your area.

Would you be interested in discussing a potential offer? I can close quickly and handle all the paperwork.

Looking forward to your response.

Best regards,
PropAI Scout"""
