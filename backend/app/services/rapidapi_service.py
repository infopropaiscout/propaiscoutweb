import aiohttp
import asyncio
from typing import Dict, List, Any, Optional
import logging
from .api_config import APIS
import json

logger = logging.getLogger(__name__)

class RapidAPIService:
    def __init__(self):
        self.session = None
        self.apis = APIS

    async def __aenter__(self):
        self.session = aiohttp.ClientSession()
        return self

    async def __aexit__(self, exc_type, exc_val, exc_tb):
        if self.session:
            await self.session.close()

    async def fetch_properties(self, zip_code: str) -> List[Dict[Any, Any]]:
        """
        Fetch properties from multiple RapidAPI sources
        """
        tasks = [
            self._fetch_realtor_properties(zip_code),
            self._fetch_zillow_properties(zip_code),
            self._fetch_realty_properties(zip_code),
            self._fetch_foreclosures(zip_code)
        ]
        
        results = await asyncio.gather(*tasks, return_exceptions=True)
        
        properties = []
        for result in results:
            if isinstance(result, list):
                properties.extend(result)
            elif isinstance(result, Exception):
                logger.error(f"API Error: {str(result)}")
        
        return properties

    async def _fetch_realtor_properties(self, zip_code: str) -> List[Dict[Any, Any]]:
        """
        Fetch properties from Realtor.com API
        """
        try:
            url = f"{self.apis['realtor']['base_url']}{self.apis['realtor']['endpoints']['properties']}"
            params = {
                "postal_code": zip_code,
                "offset": "0",
                "limit": "100",
                "sort": "relevance",
                "prop_type": "single_family,multi_family,condo"
            }
            
            async with self.session.get(
                url,
                headers=self.apis['realtor']['headers'],
                params=params
            ) as response:
                if response.status == 200:
                    data = await response.json()
                    return self._parse_realtor_data(data)
                else:
                    logger.error(f"Realtor API error: {response.status}")
                    return []
                    
        except Exception as e:
            logger.error(f"Error fetching from Realtor API: {str(e)}")
            return []

    async def _fetch_zillow_properties(self, zip_code: str) -> List[Dict[Any, Any]]:
        """
        Fetch properties from Zillow API
        """
        try:
            url = f"{self.apis['zillow']['base_url']}{self.apis['zillow']['endpoints']['property_search']}"
            params = {
                "location": zip_code,
                "status_type": "ForSale",
                "home_type": "Houses",
                "page": "1"
            }
            
            async with self.session.get(
                url,
                headers=self.apis['zillow']['headers'],
                params=params
            ) as response:
                if response.status == 200:
                    data = await response.json()
                    return self._parse_zillow_data(data)
                else:
                    logger.error(f"Zillow API error: {response.status}")
                    return []
                    
        except Exception as e:
            logger.error(f"Error fetching from Zillow API: {str(e)}")
            return []

    async def _fetch_realty_properties(self, zip_code: str) -> List[Dict[Any, Any]]:
        """
        Fetch properties from Realty in US API
        """
        try:
            url = f"{self.apis['realty_in_us']['base_url']}{self.apis['realty_in_us']['endpoints']['properties']}"
            params = {
                "postal_code": zip_code,
                "offset": "0",
                "limit": "100",
                "sort": "relevant"
            }
            
            async with self.session.get(
                url,
                headers=self.apis['realty_in_us']['headers'],
                params=params
            ) as response:
                if response.status == 200:
                    data = await response.json()
                    return self._parse_realty_data(data)
                else:
                    logger.error(f"Realty API error: {response.status}")
                    return []
                    
        except Exception as e:
            logger.error(f"Error fetching from Realty API: {str(e)}")
            return []

    async def _fetch_foreclosures(self, zip_code: str) -> List[Dict[Any, Any]]:
        """
        Fetch foreclosure properties
        """
        try:
            url = f"{self.apis['foreclosure']['base_url']}{self.apis['foreclosure']['endpoints']['search']}"
            params = {
                "zipcode": zip_code,
                "page": "1",
                "pagesize": "100"
            }
            
            async with self.session.get(
                url,
                headers=self.apis['foreclosure']['headers'],
                params=params
            ) as response:
                if response.status == 200:
                    data = await response.json()
                    return self._parse_foreclosure_data(data)
                else:
                    logger.error(f"Foreclosure API error: {response.status}")
                    return []
                    
        except Exception as e:
            logger.error(f"Error fetching from Foreclosure API: {str(e)}")
            return []

    async def get_property_details(self, property_id: str, source: str) -> Optional[Dict[Any, Any]]:
        """
        Get detailed property information from specified source
        """
        try:
            if source == "realtor":
                url = f"{self.apis['realtor']['base_url']}{self.apis['realtor']['endpoints']['property_detail']}"
                params = {"property_id": property_id}
                headers = self.apis['realtor']['headers']
            elif source == "zillow":
                url = f"{self.apis['zillow']['base_url']}{self.apis['zillow']['endpoints']['property_detail']}"
                params = {"zpid": property_id}
                headers = self.apis['zillow']['headers']
            else:
                return None

            async with self.session.get(url, headers=headers, params=params) as response:
                if response.status == 200:
                    return await response.json()
                else:
                    logger.error(f"Property detail API error: {response.status}")
                    return None

        except Exception as e:
            logger.error(f"Error fetching property details: {str(e)}")
            return None

    def _parse_realtor_data(self, data: Dict) -> List[Dict[Any, Any]]:
        """
        Parse Realtor.com API response
        """
        properties = []
        for listing in data.get("properties", []):
            try:
                property_data = {
                    "source": "realtor",
                    "source_id": listing.get("property_id"),
                    "address": f"{listing.get('address', {}).get('line', '')} {listing.get('address', {}).get('city', '')}",
                    "zip_code": listing.get('address', {}).get('postal_code', ''),
                    "price": float(listing.get('price', 0)),
                    "square_feet": float(listing.get('building_size', {}).get('size', 0)),
                    "days_on_market": listing.get('days_on_market', 0),
                    "price_drops": len(listing.get('price_history', [])) - 1,
                    "property_type": listing.get('property_type', '').lower(),
                    "listing_agent": listing.get('agent', {}).get('name', ''),
                    "tax_assessed_value": float(listing.get('tax_assessment', 0)),
                    "owner_status": "unknown",
                    "pre_foreclosure": listing.get('is_foreclosure', False),
                    "raw_data": json.dumps(listing)
                }
                properties.append(property_data)
            except Exception as e:
                logger.error(f"Error parsing Realtor.com property: {str(e)}")
                continue

        return properties

    def _parse_zillow_data(self, data: Dict) -> List[Dict[Any, Any]]:
        """
        Parse Zillow API response
        """
        properties = []
        for listing in data.get("props", []):
            try:
                property_data = {
                    "source": "zillow",
                    "source_id": listing.get("zpid"),
                    "address": listing.get('address', ''),
                    "zip_code": listing.get('zipcode', ''),
                    "price": float(listing.get('price', 0)),
                    "square_feet": float(listing.get('livingArea', 0)),
                    "days_on_market": listing.get('daysOnZillow', 0),
                    "price_drops": len(listing.get('priceHistory', [])) - 1,
                    "property_type": listing.get('homeType', '').lower(),
                    "listing_agent": listing.get('listingAgent', {}).get('name', ''),
                    "tax_assessed_value": float(listing.get('taxAssessedValue', 0)),
                    "owner_status": "absentee" if listing.get('isNonOwnerOccupied') else "owner-occupied",
                    "pre_foreclosure": listing.get('isPreforeclosureAuction', False),
                    "raw_data": json.dumps(listing)
                }
                properties.append(property_data)
            except Exception as e:
                logger.error(f"Error parsing Zillow property: {str(e)}")
                continue

        return properties

    def _parse_realty_data(self, data: Dict) -> List[Dict[Any, Any]]:
        """
        Parse Realty in US API response
        """
        properties = []
        for listing in data.get("listings", []):
            try:
                property_data = {
                    "source": "realty",
                    "source_id": listing.get("listing_id"),
                    "address": f"{listing.get('address', {}).get('line', '')} {listing.get('address', {}).get('city', '')}",
                    "zip_code": listing.get('address', {}).get('postal_code', ''),
                    "price": float(listing.get('list_price', 0)),
                    "square_feet": float(listing.get('description', {}).get('sqft', 0)),
                    "days_on_market": listing.get('list_date_days', 0),
                    "price_drops": len(listing.get('price_history', [])) - 1,
                    "property_type": listing.get('property_type', '').lower(),
                    "listing_agent": listing.get('agent', {}).get('name', ''),
                    "tax_assessed_value": float(listing.get('tax_history', [{}])[0].get('assessment', {}).get('total', 0)),
                    "owner_status": "unknown",
                    "pre_foreclosure": False,
                    "raw_data": json.dumps(listing)
                }
                properties.append(property_data)
            except Exception as e:
                logger.error(f"Error parsing Realty property: {str(e)}")
                continue

        return properties

    def _parse_foreclosure_data(self, data: Dict) -> List[Dict[Any, Any]]:
        """
        Parse Foreclosure API response
        """
        properties = []
        for listing in data.get("properties", []):
            try:
                property_data = {
                    "source": "foreclosure",
                    "source_id": listing.get("id"),
                    "address": listing.get('address', ''),
                    "zip_code": listing.get('zipCode', ''),
                    "price": float(listing.get('estimatedValue', 0)),
                    "square_feet": float(listing.get('squareFootage', 0)),
                    "days_on_market": 0,  # Not typically available for foreclosures
                    "price_drops": 0,
                    "property_type": listing.get('propertyType', '').lower(),
                    "listing_agent": "",
                    "tax_assessed_value": float(listing.get('assessedValue', 0)),
                    "owner_status": "distressed",
                    "pre_foreclosure": True,
                    "raw_data": json.dumps(listing)
                }
                properties.append(property_data)
            except Exception as e:
                logger.error(f"Error parsing Foreclosure property: {str(e)}")
                continue

        return properties
